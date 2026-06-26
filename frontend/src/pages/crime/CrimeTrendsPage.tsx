import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowDown, ArrowUp, CalendarRange, Fingerprint, TrendingUp } from 'lucide-react';
import { fetchCrimeCases, fetchCrimeStats } from '@/features/crime/api/crimeApi';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Input, Select } from '@/shared/ui-kit';

type Preset = '7d' | '30d' | '90d' | 'YTD';

interface TrendRow { district: string; count: number; change: number; direction: 'up' | 'down' | 'stable'; }

const presetOptions = ['7d', '30d', '90d', 'YTD'].map((value) => ({ label: value, value }));
const chartColors = ['var(--color-crime-red)', 'var(--color-crime-amber)', 'var(--color-gold)', 'var(--color-cyber-cyan)', 'var(--color-network-purple)', 'var(--color-intel-violet)'];

function monthLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleString('en-IN', { month: 'short' });
}

function cutoffFor(preset: Preset, dates: string[]) {
  const latest = dates.length > 0 ? new Date(`${dates.sort().at(-1) ?? ''}T00:00:00`) : new Date();
  if (preset === 'YTD') return new Date(latest.getFullYear(), 0, 1);
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

function changePercent(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function CrimeTrendsPage() {
  const [preset, setPreset] = useState<Preset>('YTD');
  const [district, setDistrict] = useState('All Districts');
  const [type, setType] = useState('All Types');
  const [sortKey, setSortKey] = useState<'count' | 'change'>('count');
  const statsQuery = useQuery({ queryKey: ['crime-stats'], queryFn: fetchCrimeStats });
  const casesQuery = useQuery({ queryKey: ['crime-cases'], queryFn: () => fetchCrimeCases() });

  const cases = casesQuery.data ?? [];
  const districtOptions = useMemo(() => ['All Districts', ...Array.from(new Set(cases.map((item) => item.district))).sort()].map((value) => ({ label: value, value })), [cases]);
  const typeOptions = useMemo(() => ['All Types', ...Array.from(new Set(cases.map((item) => item.type))).sort()].map((value) => ({ label: value, value })), [cases]);

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(preset, cases.map((item) => item.date));
    return cases.filter((item) => new Date(`${item.date}T00:00:00`) >= cutoff && (district === 'All Districts' || item.district === district) && (type === 'All Types' || item.type === type));
  }, [cases, district, preset, type]);

  const monthlyTrend = useMemo(() => Object.values(filtered.reduce<Record<string, { month: string; cases: number }>>((acc, item) => {
    const key = item.date.slice(0, 7);
    acc[key] = { month: monthLabel(item.date), cases: (acc[key]?.cases ?? 0) + 1 };
    return acc;
  }, {})), [filtered]);

  const typeBreakdown = useMemo(() => Object.values(filtered.reduce<Record<string, { type: string; count: number }>>((acc, item) => {
    acc[item.type] = { type: item.type, count: (acc[item.type]?.count ?? 0) + 1 };
    return acc;
  }, {})).sort((a, b) => b.count - a.count), [filtered]);

  const districtRows = useMemo<TrendRow[]>(() => {
    const latestMonth = cases.map((item) => item.date.slice(0, 7)).sort().at(-1) ?? '';
    const previousMonth = cases.map((item) => item.date.slice(0, 7)).filter((month) => month < latestMonth).sort().at(-1) ?? '';
    const districts = Array.from(new Set(filtered.map((item) => item.district)));
    return districts.map((name) => {
      const current = filtered.filter((item) => item.district === name && item.date.startsWith(latestMonth)).length;
      const previous = filtered.filter((item) => item.district === name && item.date.startsWith(previousMonth)).length;
      const change = changePercent(current, previous);
      const direction: TrendRow['direction'] = change > 3 ? 'up' : change < -3 ? 'down' : 'stable';
      return { district: name, count: filtered.filter((item) => item.district === name).length, change, direction };
    }).sort((a, b) => sortKey === 'count' ? b.count - a.count : b.change - a.change);
  }, [cases, filtered, sortKey]);

  const totalCases = filtered.length;
  const monthlyAvg = monthlyTrend.length > 0 ? Math.round(totalCases / monthlyTrend.length) : 0;
  const percentChange = statsQuery.data?.monthlyTrend ? changePercent(statsQuery.data.monthlyTrend.at(-1)?.cases ?? 0, statsQuery.data.monthlyTrend.at(-2)?.cases ?? 0) : 0;
  const risingType = typeBreakdown[0]?.type ?? 'None';
  const isLoading = statsQuery.isLoading || casesQuery.isLoading;
  const isError = statsQuery.isError || casesQuery.isError;
  const error = statsQuery.error ?? casesQuery.error;

  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} variant="card" />)}</div><div className="grid gap-6 xl:grid-cols-2"><LoadingSkeleton className="h-80" variant="chart" /><LoadingSkeleton className="h-80" variant="chart" /></div><LoadingSkeleton className="h-72" variant="chart" /></div>;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : 'Unable to load crime trends'} onRetry={() => { void statsQuery.refetch(); void casesQuery.refetch(); }} />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Crime Trends" subtitle={`Trend window: ${preset} · ${district} · ${type}`} />
      <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[180px_1fr_1fr_150px]"><Select onValueChange={(value) => setPreset(value as Preset)} options={presetOptions} value={preset} /><Select onValueChange={setDistrict} options={districtOptions} value={district} /><Select onValueChange={setType} options={typeOptions} value={type} /><Input aria-label="Trend range" readOnly value="2026 Crime Data" /></section>
      {filtered.length === 0 ? <EmptyState description="No crime trend records match the selected filters." title="No trend data found" /> : <>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Fingerprint} title="Total Cases" value={totalCases} trend={percentChange} /><KpiCard icon={CalendarRange} title="Monthly Avg" value={monthlyAvg} trend={percentChange} /><KpiCard icon={TrendingUp} title="% Change" value={Math.abs(percentChange)} trend={percentChange} /><div className="glass-card rounded-[var(--radius-xl)] border-t-2 border-t-[var(--color-gold)] p-5"><div className="mb-5 flex items-center justify-between text-[var(--color-text-secondary)]"><span className="text-sm font-semibold">Fastest Rising Type</span><Activity className="h-5 w-5 text-[var(--color-gold)]" /></div><div className="text-3xl font-extrabold">{risingType}</div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">Highest active case volume</p></div></section>
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]"><div className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Monthly Crime Trend</h2><div className="mt-5 h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyTrend}><defs><linearGradient id="crimeTrendsGold" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.45} /><stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="var(--color-border)" vertical={false} /><XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} /><YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid var(--color-border)', borderRadius: '1rem' }} /><Area dataKey="cases" fill="url(#crimeTrendsGold)" stroke="var(--color-gold)" strokeWidth={3} type="monotone" /></AreaChart></ResponsiveContainer></div></div><div className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Crime Type Distribution</h2><div className="mt-5 h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={typeBreakdown}><CartesianGrid stroke="var(--color-border)" vertical={false} /><XAxis dataKey="type" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} /><YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid var(--color-border)', borderRadius: '1rem' }} /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{typeBreakdown.map((item, index) => <Cell key={item.type} fill={chartColors[index % chartColors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></div></section>
        <section className="glass-card overflow-hidden rounded-[var(--radius-2xl)]"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><h2 className="text-xl font-bold">District Trend Table</h2><Select onValueChange={(value) => setSortKey(value as 'count' | 'change')} options={[{ label: 'Sort by Cases', value: 'count' }, { label: 'Sort by Change', value: 'change' }]} value={sortKey} /></div><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]"><tr><th className="px-4 py-3">District</th><th className="px-4 py-3">Crime Count</th><th className="px-4 py-3">% Change</th><th className="px-4 py-3">Direction</th></tr></thead><tbody>{districtRows.map((row) => <tr key={row.district} className="border-t border-[var(--color-border)]"><td className="px-4 py-3 font-semibold">{row.district}</td><td className="px-4 py-3">{row.count}</td><td className="px-4 py-3 text-[var(--color-gold)]">{row.change}%</td><td className="px-4 py-3"><span className="inline-flex items-center gap-2 capitalize text-[var(--color-text-secondary)]">{row.direction === 'up' ? <ArrowUp className="h-4 w-4 text-[var(--color-crime-red)]" /> : row.direction === 'down' ? <ArrowDown className="h-4 w-4 text-[var(--color-cyber-cyan)]" /> : <Activity className="h-4 w-4 text-[var(--color-crime-amber)]" />}{row.direction}</span></td></tr>)}</tbody></table></section>
      </>}
    </div>
  );
}

export default CrimeTrendsPage;
