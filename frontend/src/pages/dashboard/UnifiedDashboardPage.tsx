import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bell,
  BriefcaseBusiness,
  Fingerprint,
  Globe,
  Plus,
  Search,
  Shield,
  Upload,
} from 'lucide-react';
import { motion } from 'motion/react';
import dashboard from '@/mocks/dashboard-stats.json';
import { usePageEnter } from '@/hooks/useAnimeTransition';
import { AlertFeed, EmptyState, ErrorState, KpiCard, LoadingSkeleton, type AlertItemData } from '@/shared/components';
import { Badge, Button, Select } from '@/shared/ui-kit';
import { useFilterStore } from '@/stores/filterStore';

type LoadState = 'loading' | 'ready' | 'error';
type TrendPoint = { name: string; crime: number; cyber: number };
type DashboardKpi = { title: string; value: number; trend: number; icon: string };
type DashboardTrend = { labels: string[]; crime: number[]; cyber: number[] };
type Ranking = { name: string; score: number; trend: number };
type Anomaly = { id: string; district: string; type: string; description: string; severity: 'high' | 'medium' | 'low' | 'extreme' };
type QuickAction = { label: string; route: string; icon: string };

const kpiIcons = [Fingerprint, BriefcaseBusiness, Bell, Shield];
const actionIcons = {
  plus: Plus,
  search: Search,
  upload: Upload,
  globe: Globe,
} as const;

const districtOptions = [
  { label: 'All Karnataka', value: 'All Karnataka' },
  { label: 'Bengaluru Urban', value: 'Bengaluru Urban' },
  { label: 'Mysuru', value: 'Mysuru' },
  { label: 'Belagavi', value: 'Belagavi' },
  { label: 'Hubballi', value: 'Hubballi' },
  { label: 'Kalaburagi', value: 'Kalaburagi' },
  { label: 'Shivamogga', value: 'Shivamogga' },
];

function normalizeDistrict(district: string) {
  return district === 'Bengaluru City' ? 'Bengaluru Urban' : district;
}

function buildAnomalyAlerts(anomalies: Anomaly[]): AlertItemData[] {
  return anomalies.map((item) => ({
    id: item.id,
    title: `${item.district} · ${item.type}`,
    description: item.description,
    severity: item.severity,
    time: 'Live anomaly scan',
  }));
}

function buildTrendData(trend: DashboardTrend): TrendPoint[] {
  return trend.labels.map((label, index) => ({
    name: label,
    crime: trend.crime[index] ?? 0,
    cyber: trend.cyber[index] ?? 0,
  }));
}

export default function UnifiedDashboardPage() {
  const navigate = useNavigate();
  const district = useFilterStore((state) => state.globalDistrict);
  const setDistrict = useFilterStore((state) => state.setGlobalDistrict);
  const dateRange = useFilterStore((state) => state.globalDateRange);
  const setDateRange = useFilterStore((state) => state.setGlobalDateRange);
  const [status, setStatus] = useState<LoadState>('loading');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus(Array.isArray(dashboard.kpis) && dashboard.kpis.length === 4 ? 'ready' : 'error');
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const selectedDistrict = normalizeDistrict(district);
  const rankings = dashboard.districtRankings as Ranking[];
  const anomalies = dashboard.anomalies as Anomaly[];
  const trendData = buildTrendData(dashboard.trend as DashboardTrend);
  const kpis = dashboard.kpis as DashboardKpi[];
  const quickActions = dashboard.quickActions as QuickAction[];

  const filteredRankings = useMemo(() => {
    if (selectedDistrict === 'All Karnataka') {
      return rankings;
    }

    return rankings.filter((item) => item.name === selectedDistrict);
  }, [rankings, selectedDistrict]);

  const filteredAnomalies = useMemo(() => {
    if (selectedDistrict === 'All Karnataka') {
      return anomalies;
    }

    return anomalies.filter((item) => item.district === selectedDistrict);
  }, [anomalies, selectedDistrict]);

  const isEmpty = status === 'ready' && filteredRankings.length === 0 && filteredAnomalies.length === 0;

  const retry = () => {
    setStatus('loading');
    window.setTimeout(() => {
      setStatus(Array.isArray(dashboard.kpis) && dashboard.kpis.length === 4 ? 'ready' : 'error');
    }, 500);
  };

  if (status === 'loading') {
    return (
      <div className="grid gap-6">
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-5">
          <LoadingSkeleton className="h-6 w-64" variant="text" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-10 w-32" variant="card" />
            <LoadingSkeleton className="h-10 w-32" variant="card" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} variant="card" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <LoadingSkeleton className="h-[360px]" variant="chart" />
          <LoadingSkeleton className="h-[360px]" variant="chart" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <LoadingSkeleton className="h-[280px]" variant="chart" />
          <LoadingSkeleton className="h-[280px]" variant="chart" />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorState message="Unified dashboard mock telemetry failed to load. Verify the Phase 1 payload and retry." onRetry={retry} />;
  }

  if (isEmpty) {
    return (
      <div className="grid gap-6">
        <motion.div {...usePageEnter(0)} className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">Unified Dashboard</p>
            <h1 className="mt-2 text-2xl font-black">Filtered workspace</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">No records match the current district filter.</p>
          </div>
          <Select onValueChange={setDistrict} options={districtOptions} value={district} />
        </motion.div>
        <motion.div {...usePageEnter(1)}>
          <EmptyState
            actionLabel="Reset to All Karnataka"
            description="Welcome to ULTRON. Upload data or trigger a scrape to begin. No anomalies or district scores are available for the selected view yet."
            onAction={() => setDistrict('All Karnataka')}
            title="Welcome to ULTRON"
          />
        </motion.div>
        <motion.div {...usePageEnter(2)} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = actionIcons[action.icon as keyof typeof actionIcons] ?? Globe;

            return (
              <button
                key={action.label}
                className="glass-card flex items-center gap-3 rounded-[var(--radius-xl)] p-4 text-left transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
                onClick={() => navigate(action.route)}
                type="button"
              >
                <div className="rounded-[var(--radius-md)] bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Open workflow</p>
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <motion.section {...usePageEnter(0)} className="glass-card flex flex-col gap-4 rounded-[var(--radius-2xl)] p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">Unified Dashboard</p>
          <h1 className="mt-2 text-2xl font-black">Karnataka operational risk picture</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Breadcrumbs, district selection, and date controls remain synced with the shell workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold">District: {selectedDistrict}</Badge>
          <Badge variant="cyan">Range: {dateRange.from} to {dateRange.to}</Badge>
          <Select onValueChange={setDistrict} options={districtOptions} value={district} />
          <Button onClick={() => setDateRange({ from: '2026-06-01', to: '2026-06-24' })} size="sm" variant="secondary">30D</Button>
          <Button onClick={() => setDateRange({ from: '2026-01-01', to: '2026-06-24' })} size="sm" variant="secondary">YTD</Button>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpiIcons[index];

          return (
            <motion.div key={kpi.title} {...usePageEnter(index + 1)}>
              <KpiCard icon={Icon} title={kpi.title} trend={kpi.trend} value={kpi.value} />
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.div {...usePageEnter(5)} className="glass-card rounded-[var(--radius-2xl)] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">Combined Trend Chart</p>
              <h2 className="mt-1 text-xl font-bold">Crime and cyber signal convergence</h2>
            </div>
            <Badge variant="muted">Filtered by {selectedDistrict}</Badge>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="crimeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#f0b000" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f0b000" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cyberFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cyber-cyan)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-cyber-cyan)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis axisLine={false} dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
                <YAxis axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.94)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                  }}
                />
                <Area dataKey="crime" fill="url(#crimeFill)" stroke="#f0b000" strokeWidth={3} type="monotone" />
                <Area dataKey="cyber" fill="url(#cyberFill)" stroke="var(--color-cyber-cyan)" strokeWidth={3} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.aside {...usePageEnter(6)} className="glass-card rounded-[var(--radius-2xl)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">District Risk Ranking</p>
          <h2 className="mt-1 text-xl font-bold">Highest-priority districts</h2>
          <div className="mt-5 space-y-4">
            {filteredRankings.map((item, index) => (
              <div key={item.name} className="rounded-[var(--radius-xl)] border border-white/6 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gold)]/10 text-sm font-black text-[var(--color-gold)]">{index + 1}</span>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Risk score {item.score}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${item.trend >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {item.trend >= 0 ? '+' : ''}
                    {item.trend}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/8">
                  <div className="h-2 rounded-full bg-[var(--color-gold)]" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.div {...usePageEnter(7)} className="space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">Anomaly Feed</p>
            <h2 className="mt-1 text-xl font-bold">Escalated district anomalies</h2>
          </div>
          <AlertFeed alerts={buildAnomalyAlerts(filteredAnomalies)} />
        </motion.div>

        <motion.aside {...usePageEnter(8)} className="glass-card rounded-[var(--radius-2xl)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">Quick Actions</p>
          <h2 className="mt-1 text-xl font-bold">Immediate workflows</h2>
          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => {
              const Icon = actionIcons[action.icon as keyof typeof actionIcons] ?? Globe;

              return (
                <button
                  key={action.label}
                  className="glass-card flex items-center gap-3 rounded-[var(--radius-xl)] border border-white/6 p-4 text-left transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
                  onClick={() => navigate(action.route)}
                  type="button"
                >
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]"><Icon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">Open workflow</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.aside>
      </section>
    </div>
  );
}
