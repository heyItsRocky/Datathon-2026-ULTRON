import { apiGet } from '@/shared/api/client';
import dashboardMock from '@/mocks/dashboard-stats.json';

export interface DashboardKpi { title: string; value: number; trend: number; icon: string }
export interface DashboardTrend { labels: string[]; crime: number[]; cyber: number[] }
export interface Ranking { name: string; score: number; trend: number }
export interface Anomaly { id: string; district: string; type: string; description: string; severity: 'high' | 'medium' | 'low' | 'extreme' }
export interface QuickAction { label: string; route: string; icon: string }

export interface DashboardStats {
  kpis: DashboardKpi[];
  trend: DashboardTrend;
  alerts: Array<{ id: string; message: string; severity: string; time: string }>;
  districtRankings: Ranking[];
  anomalies: Anomaly[];
  quickActions: QuickAction[];
}

interface BackendDashboard {
  crime?: {
    total_cases?: number;
    violent_crimes?: number;
    non_violent_crimes?: number;
    clearance_rate?: number;
    hotspots?: Array<{ count?: number; district?: string }>;
  };
  cyber?: { total_threats?: number; active_threats?: number };
  people?: { total_criminals?: number };
}

function adaptDashboard(raw: unknown): DashboardStats {
  const r = raw as BackendDashboard | null;
  // Frontend mock already matches DashboardStats
  if (r && 'kpis' in r) return r as unknown as DashboardStats;

  if (!r || !r.crime) {
    // Fall back to mock if backend shape missing
    return dashboardMock as DashboardStats;
  }

  const total = r.crime.total_cases ?? 0;
  const openish = r.crime.non_violent_crimes ?? 0;
  const cyber = r.cyber?.total_threats ?? 0;
  const activeCyber = r.cyber?.active_threats ?? 0;
  const clear = r.crime.clearance_rate ?? 0;

  return {
    kpis: [
      { title: 'Total Crimes', value: total, trend: 8, icon: 'fingerprint' },
      { title: 'Active Cases', value: Math.round(openish * 0.15) || openish, trend: -3, icon: 'briefcase' },
      { title: 'Alerts Today', value: activeCyber, trend: 12, icon: 'bell' },
      { title: 'Cyber Incidents', value: cyber, trend: 5, icon: 'shield' },
    ],
    trend: {
      labels: ['Jun 1', 'Jun 5', 'Jun 10', 'Jun 15', 'Jun 20', 'Jun 25', 'Jun 30'],
      crime: [Math.round(total * 0.03), Math.round(total * 0.025), Math.round(total * 0.035), Math.round(total * 0.03), Math.round(total * 0.038), Math.round(total * 0.03), Math.round(total * 0.033)],
      cyber: [Math.max(1, Math.round(cyber * 0.1)), Math.max(1, Math.round(cyber * 0.12)), Math.max(1, Math.round(cyber * 0.11)), Math.max(1, Math.round(cyber * 0.14)), Math.max(1, Math.round(cyber * 0.13)), Math.max(1, Math.round(cyber * 0.16)), Math.max(1, Math.round(cyber * 0.15))],
    },
    alerts: (dashboardMock as DashboardStats).alerts,
    districtRankings: (dashboardMock as DashboardStats).districtRankings,
    anomalies: (dashboardMock as DashboardStats).anomalies.map((a) => ({
      ...a,
      description: clear > 0 ? `${clear}% clearance rate` : a.description,
    })),
    quickActions: (dashboardMock as DashboardStats).quickActions,
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const raw = await apiGet<unknown>('/dashboard/stats');
    return adaptDashboard(raw);
  } catch {
    // API down → keep demo usable with mock
    return dashboardMock as DashboardStats;
  }
}
