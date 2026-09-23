import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { pageEnterProps } from '@/hooks/useAnimeTransition';
import { fetchDashboardStats, type DashboardStats } from '@/features/dashboard/api/dashboardApi';
import { EmergencyFooter, ErrorState, KSPHeader, LoadingSkeleton, RadialNav } from '@/shared/components';
import { useAuthStore } from '@/stores/authStore';

type LoadState = 'loading' | 'loaded' | 'error';

const routeMap: Record<string, string> = {
  dashboard: '/dashboard',
  maps: '/maps',
  network: '/network',
  intel: '/intel',
};

function CountUpValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const steps = 24;
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setDisplay(Math.round((value / steps) * current));
      if (current >= steps) window.clearInterval(timer);
    }, 22);

    return () => window.clearInterval(timer);
  }, [value]);

  return <span className="text-3xl font-black text-[var(--color-gold)]">{display.toLocaleString()}</span>;
}

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [status, setStatus] = useState<LoadState>('loading');
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await fetchDashboardStats();
      setDashboard(data);
      setStatus(data.kpis.length >= 4 ? 'loaded' : 'error');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = () => {
    void load();
  };

  const handleSegmentClick = (segment: string) => {
    const target = routeMap[segment];
    if (!target || !isAuthenticated) {
      return;
    }

    window.setTimeout(() => navigate(target), 180);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 text-[var(--color-text-primary)] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
          <LoadingSkeleton className="h-24 rounded-[var(--radius-2xl)]" variant="card" />
          <div className="grid flex-1 place-items-center">
            <div className="relative flex h-[360px] w-[360px] items-center justify-center rounded-full border border-white/10 bg-white/5">
              <div className="absolute inset-10 rounded-full border border-white/10" />
              <div className="absolute inset-20 rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-28" variant="card" />)}
          </div>
          <LoadingSkeleton className="h-20" variant="card" />
        </div>
      </div>
    );
  }

  if (status === 'error' || !dashboard) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-background)] px-4 py-6 text-[var(--color-text-primary)]">
        <div className="w-full max-w-xl">
          <ErrorState message="ULTRON could not load command center telemetry. Retry to reconnect to the live API." onRetry={retry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 text-[var(--color-text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <motion.div {...pageEnterProps(0)}>
          <KSPHeader />
        </motion.div>

        <motion.section {...pageEnterProps(1)} className="glass-card flex flex-1 flex-col items-center justify-center rounded-[var(--radius-2xl)] px-4 py-8 sm:px-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-gold)]">Command Center</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">KSP operational workspace</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {isAuthenticated ? 'Enter any mission domain from the radial ring below.' : 'Login is required to enter the ULTRON workspace.'}
            </p>
          </div>
          <RadialNav onSegmentClick={handleSegmentClick} />
        </motion.section>

        <motion.section {...pageEnterProps(2)} className="grid gap-3 md:grid-cols-4">
          {dashboard.kpis.map((kpi) => (
            <div key={kpi.title} className="glass-card rounded-[var(--radius-xl)] border border-white/6 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">{kpi.title}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <CountUpValue value={kpi.value} />
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${kpi.trend >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                  {kpi.trend >= 0 ? '+' : ''}
                  {kpi.trend}%
                </span>
              </div>
            </div>
          ))}
        </motion.section>

        <motion.div {...pageEnterProps(3)}>
          <EmergencyFooter />
        </motion.div>
      </div>
    </div>
  );
}
