import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Flame, MapPin, Radar, TrendingDown, TrendingUp } from 'lucide-react';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader, SeverityBadge } from '@/shared/components';
import { Button, Select } from '@/shared/ui-kit';
import { apiGet } from '@/shared/api/client';

type HotspotRisk = 'low' | 'medium' | 'high';
type RiskFilter = 'all' | HotspotRisk;
type SortKey = 'crimeCount' | 'trend';

interface HotspotDTO {
  id: string;
  district: string;
  latitude: number;
  longitude: number;
  radius: number;
  crimeCount: number;
  topCrimeType: string;
  crimeTypes: Record<string, number>;
  riskLevel: HotspotRisk;
  trend: number;
  peakTime: string;
}

const riskOptions = [{ label: 'All Risk', value: 'all' }, { label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' }];
const sortOptions = [{ label: 'Sort by Crime Count', value: 'crimeCount' }, { label: 'Sort by Trend', value: 'trend' }];

function fetchHotspots() {
  return apiGet<HotspotDTO[]>('/maps/hotspots');
}

function crimeTypeBreakdown(crimeTypes: Record<string, number>) {
  return Object.entries(crimeTypes).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
}

function mostActiveDistrict(hotspots: HotspotDTO[]) {
  const totals = hotspots.reduce<Record<string, number>>((acc, hotspot) => {
    acc[hotspot.district] = (acc[hotspot.district] ?? 0) + hotspot.crimeCount;
    return acc;
  }, {});
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None';
}

export function CrimeHotspotsPage() {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('crimeCount');
  const { data = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['crime-hotspots'], queryFn: fetchHotspots });

  const filtered = useMemo(() => data.filter((item) => riskFilter === 'all' || item.riskLevel === riskFilter).sort((a, b) => sortKey === 'crimeCount' ? b.crimeCount - a.crimeCount : b.trend - a.trend), [data, riskFilter, sortKey]);
  const maxCrimeCount = Math.max(...data.map((item) => item.crimeCount), 1);
  const totalHotspots = data.length;
  const highRiskZones = data.filter((item) => item.riskLevel === 'high').length;
  const avgDensity = totalHotspots > 0 ? Math.round(data.reduce((sum, item) => sum + item.crimeCount / Math.max(item.radius / 1000, 1), 0) / totalHotspots) : 0;
  const activeDistrict = mostActiveDistrict(data);

  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} variant="card" />)}</div><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} className="h-80" variant="card" />)}</div></div>;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : 'Unable to load crime hotspots'} onRetry={() => void refetch()} />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Crime Hotspots" subtitle={`${filtered.length} active hotspot clusters visible from ${data.length} total zones.`} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={MapPin} title="Total Hotspots" value={totalHotspots} trend={6} /><KpiCard icon={Flame} title="High-Risk Zones" value={highRiskZones} trend={12} /><KpiCard icon={Radar} title="Avg Crime Density" value={avgDensity} trend={4} /><div className="glass-card rounded-[var(--radius-xl)] border-t-2 border-t-[var(--color-gold)] p-5"><div className="mb-5 flex items-center justify-between text-[var(--color-text-secondary)]"><span className="text-sm font-semibold">Most Active District</span><Activity className="h-5 w-5 text-[var(--color-gold)]" /></div><div className="text-3xl font-extrabold">{activeDistrict}</div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">Highest aggregate hotspot load</p></div></section>
      <section className="glass-card flex flex-wrap items-center gap-3 rounded-[var(--radius-2xl)] p-4"><Select onValueChange={(value) => setRiskFilter(value as RiskFilter)} options={riskOptions} value={riskFilter} /><Select onValueChange={(value) => setSortKey(value as SortKey)} options={sortOptions} value={sortKey} /></section>
      {filtered.length === 0 ? <EmptyState description="No hotspot clusters match the selected risk filter." title="No hotspots found" /> : <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{filtered.map((hotspot) => {
        const density = Math.round((hotspot.crimeCount / maxCrimeCount) * 100);
        const breakdown = crimeTypeBreakdown(hotspot.crimeTypes);
        return (
          <article key={hotspot.id} className="glass-card grid gap-5 rounded-[var(--radius-2xl)] p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-[var(--color-gold)]">{hotspot.id}</p><h2 className="mt-1 text-xl font-bold">{hotspot.district}</h2><p className="text-sm text-[var(--color-text-secondary)]">Peak activity: {hotspot.peakTime}</p></div><SeverityBadge severity={hotspot.riskLevel} /></div>
            <div><div className="flex items-center justify-between text-sm"><span className="text-[var(--color-text-secondary)]">Crime Density</span><span className="font-bold text-[var(--color-gold)]">{hotspot.crimeCount} cases</span></div><div className="mt-2 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-[var(--color-gold)]" style={{ width: `${density}%` }} /></div></div>
            <div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Top Crime Types</h3><span className="text-xs text-[var(--color-text-muted)]">Top: {hotspot.topCrimeType}</span></div><div className="h-28"><ResponsiveContainer width="100%" height="100%"><BarChart data={breakdown} layout="vertical" margin={{ left: 4, right: 12 }}><XAxis hide type="number" /><YAxis dataKey="type" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} type="category" width={58} /><Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid var(--color-border)', borderRadius: '1rem' }} /><Bar dataKey="count" fill="var(--color-crime-amber)" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div></div>
            <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 p-3"><span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">{hotspot.trend >= 0 ? <TrendingUp className="h-4 w-4 text-[var(--color-crime-red)]" /> : <TrendingDown className="h-4 w-4 text-[var(--color-cyber-cyan)]" />}Trend</span><span className="font-bold text-[var(--color-text-primary)]">{hotspot.trend > 0 ? '+' : ''}{hotspot.trend}%</span></div>
            <Link to="/maps/hotspots"><Button className="w-full" variant="secondary">View on Map</Button></Link>
          </article>
        );
      })}</section>}
    </div>
  );
}

export default CrimeHotspotsPage;
