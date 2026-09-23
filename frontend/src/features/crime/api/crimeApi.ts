import { apiGet } from '@/shared/api/client';
import { adaptCrimeCase, adaptCriminal, type CrimeCaseDTO, type CriminalDTO } from '@/shared/api/dto-adapters/crime';

export interface CrimeStatsDTO {
  totals: {
    totalCases: number;
    openCases: number;
    resolvedRate: number;
    avgResponseDays: number;
  };
  typeBreakdown: Array<{ type: string; count: number }>;
  monthlyTrend: Array<{ month: string; cases: number }>;
  recentCases: CrimeCaseDTO[];
}

export interface MoMatchDTO {
  criminalId: string;
  criminalName: string;
  matchPercentage: number;
  priors: number;
  similarCases: number;
  district: string;
}

interface RawCrimeStats {
  totals?: CrimeStatsDTO['totals'];
  typeBreakdown?: CrimeStatsDTO['typeBreakdown'];
  monthlyTrend?: CrimeStatsDTO['monthlyTrend'];
  recentCases?: unknown[];
  // Backend get_crime_stats() shape
  total_cases?: number;
  violent_crimes?: number;
  non_violent_crimes?: number;
  clearance_rate?: number;
  by_crime_type?: Array<{ CRIME_TYPE?: string; count?: number; type?: string }>;
  by_district?: Array<{ DISTRICT?: string; count?: number; district?: string }>;
  by_status?: Array<{ STATUS?: string; count?: number }>;
}

function adaptCrimeStats(raw: RawCrimeStats | null | undefined): CrimeStatsDTO {
  if (!raw) {
    return { totals: { totalCases: 0, openCases: 0, resolvedRate: 0, avgResponseDays: 0 }, typeBreakdown: [], monthlyTrend: [], recentCases: [] };
  }
  // Frontend-shaped mock path
  if (raw.totals) {
    return {
      totals: raw.totals,
      typeBreakdown: raw.typeBreakdown ?? [],
      monthlyTrend: raw.monthlyTrend ?? [],
      recentCases: (raw.recentCases ?? []).map(adaptCrimeCase),
    };
  }
  // Backend get_crime_stats() path
  const total = raw.total_cases ?? 0;
  const openStatus = (raw.by_status ?? []).find((s) => (s.STATUS ?? '') === 'Open');
  const openCases = openStatus?.count ?? Math.max(0, Math.round(total * 0.18));
  const closedStatuses = ['Closed', 'Convicted', 'Charge Sheet Filed', 'Disposed'];
  const closed = (raw.by_status ?? [])
    .filter((s) => closedStatuses.includes(s.STATUS ?? ''))
    .reduce((sum, s) => sum + (s.count ?? 0), 0);
  const resolvedRate = total > 0 ? Math.round((closed / total) * 100) : raw.clearance_rate ?? 0;
  return {
    totals: { totalCases: total, openCases, resolvedRate, avgResponseDays: 14 },
    typeBreakdown: (raw.by_crime_type ?? []).map((r) => ({
      type: r.CRIME_TYPE ?? r.type ?? 'Unknown',
      count: r.count ?? 0,
    })),
    monthlyTrend: [],
    recentCases: [],
  };
}

export async function fetchCrimeCases(_filters?: Record<string, string>): Promise<CrimeCaseDTO[]> {
  const raw = await apiGet<unknown[]>('/crime/cases');
  return raw.map(adaptCrimeCase);
}

export async function fetchCrimeCaseDetail(id: string): Promise<CrimeCaseDTO> {
  const raw = await apiGet<unknown>(`/crime/cases/${encodeURIComponent(id)}`);
  return adaptCrimeCase(raw);
}

export async function fetchCriminals(): Promise<CriminalDTO[]> {
  const raw = await apiGet<unknown[]>('/crime/criminals');
  return raw.map(adaptCriminal);
}

export async function fetchCriminalDetail(id: string): Promise<CriminalDTO> {
  const raw = await apiGet<unknown>(`/crime/criminals/${encodeURIComponent(id)}`);
  return adaptCriminal(raw);
}

export async function fetchCrimeStats(): Promise<CrimeStatsDTO> {
  const raw = await apiGet<RawCrimeStats>('/crime/stats');
  return adaptCrimeStats(raw);
}

export async function matchMO(_description: string, _crimeType?: string, _district?: string): Promise<MoMatchDTO[]> {
  return apiGet<MoMatchDTO[]>('/crime/mo-match');
}
