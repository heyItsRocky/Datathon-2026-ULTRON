import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Briefcase, CheckCircle, Clock, Fingerprint } from 'lucide-react';
import { fetchCrimeStats } from '@/features/crime/api/crimeApi';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';

const chartColors = ['var(--color-gold)', 'var(--color-crime-red)', 'var(--color-crime-amber)', 'var(--color-cyber-cyan)', 'var(--color-network-purple)', 'var(--color-intel-violet)', 'var(--severity-low)', 'var(--color-network-magenta)'];

export default function CrimeOverviewPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['crime-stats'], queryFn: fetchCrimeStats });

  if (isLoading) {
    return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} variant="card" />)}</div><div className="grid gap-6 xl:grid-cols-[2fr_1fr]"><LoadingSkeleton className="h-80" variant="chart" /><LoadingSkeleton className="h-80" variant="chart" /></div><LoadingSkeleton className="h-72" variant="chart" /></div>;
  }

  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  if (!data || data.totals.totalCases === 0) return <EmptyState description="No crime data available yet. Upload FIR data or trigger ingestion to populate this dashboard." title="No crime data available yet" />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Crime Intelligence Dashboard" subtitle="Operational overview of crime cases, type distributions, recent FIRs, and monthly trend signals." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Fingerprint} title="Total Cases" value={data.totals.totalCases} trend={8} />
        <KpiCard icon={Briefcase} title="Open Cases" value={data.totals.openCases} trend={-3} />
        <KpiCard icon={CheckCircle} title="Resolved Rate" value={data.totals.resolvedRate} trend={4} />
        <KpiCard icon={Clock} title="Avg Response Time" value={Math.round(data.totals.avgResponseDays)} trend={-9} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="glass-card rounded-[var(--radius-2xl)] p-5">
          <h2 className="text-xl font-bold">Crime Type Breakdown</h2>
          <div className="mt-5 h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.typeBreakdown}><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{data.typeBreakdown.map((item, index) => <Cell key={item.type} fill={chartColors[index % chartColors.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
        </div>
        <aside className="glass-card rounded-[var(--radius-2xl)] p-5">
          <h2 className="text-xl font-bold">Recent Cases</h2>
          <div className="mt-4 grid gap-3">{data.recentCases.map((crimeCase) => <div key={crimeCase.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 p-3"><div className="flex items-center justify-between gap-3"><p className="font-mono text-xs text-[var(--color-gold)]">{crimeCase.id}</p><Badge variant={crimeCase.status === 'Resolved' ? 'green' : crimeCase.status === 'Open' ? 'red' : 'amber'}>{crimeCase.status}</Badge></div><p className="mt-2 font-semibold">{crimeCase.type}</p><p className="text-sm text-[var(--color-text-secondary)]">{crimeCase.district} · {crimeCase.date}</p></div>)}</div>
        </aside>
      </section>
      <section className="glass-card rounded-[var(--radius-2xl)] p-5">
        <h2 className="text-xl font-bold">Monthly Trend</h2>
        <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.monthlyTrend}><defs><linearGradient id="crimeMonthly" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.45} /><stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} /><Area dataKey="cases" fill="url(#crimeMonthly)" stroke="var(--color-gold)" strokeWidth={3} type="monotone" /></AreaChart></ResponsiveContainer></div>
      </section>
    </div>
  );
}
