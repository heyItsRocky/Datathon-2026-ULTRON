import { useMemo, useState } from 'react';
import { MapPin, Newspaper, TrendingUp } from 'lucide-react';
import { useEmergingTrends } from '@/features/intelligence/hooks/useEmergingTrends';
import { useIntelBriefs } from '@/features/intelligence/hooks/useIntelBriefs';
import { useRedZones } from '@/features/intelligence/hooks/useRedZones';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Select } from '@/shared/ui-kit';

type SignalType = 'brief' | 'zone' | 'trend';
interface SignalEvent { id: string; type: SignalType; date: string; title: string; district: string; detail: string; severity: 'low' | 'medium' | 'high' }
const typeOptions = [{ label: 'All Signals', value: 'all' }, { label: 'Brief Published', value: 'brief' }, { label: 'Zone Escalated', value: 'zone' }, { label: 'Trend Threshold', value: 'trend' }];
const dateOptions = [{ label: 'All Dates', value: 'all' }, { label: 'Last 7 Days', value: '7' }, { label: 'Last 14 Days', value: '14' }];
function withinDays(date: string, days: string) { if (days === 'all') return true; const now = new Date('2026-06-26').getTime(); return now - new Date(date).getTime() <= Number(days) * 24 * 60 * 60 * 1000; }
function icon(type: SignalType) { return type === 'brief' ? Newspaper : type === 'zone' ? MapPin : TrendingUp; }

export function SignalsPage() {
  const briefs = useIntelBriefs();
  const trends = useEmergingTrends();
  const zones = useRedZones();
  const [type, setType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const events = useMemo<SignalEvent[]>(() => {
    const briefEvents = (briefs.data ?? []).map((brief) => ({ id: brief.id, type: 'brief' as const, date: brief.date, title: `Brief published: ${brief.title}`, district: brief.district, detail: brief.recommendation, severity: brief.priority }));
    const trendEvents = (trends.data ?? []).map((trend) => ({ id: trend.id, type: 'trend' as const, date: '2026-06-24', title: `${trend.name} crossed ${trend.percentChange}% threshold`, district: trend.district, detail: trend.description, severity: trend.percentChange > 30 ? 'high' as const : trend.percentChange > 15 ? 'medium' as const : 'low' as const }));
    const zoneEvents = (zones.data ?? []).filter((zone) => zone.severity !== 'low').map((zone) => ({ id: zone.districtId, type: 'zone' as const, date: zone.lastUpdated, title: `${zone.districtName} zone ${zone.trend === 'up' ? 'escalated' : 'updated'}`, district: zone.districtName, detail: `${zone.incidentCount} incidents; top types: ${zone.topCrimeTypes.join(', ')}`, severity: zone.severity }));
    return [...briefEvents, ...trendEvents, ...zoneEvents].filter((event) => (type === 'all' || event.type === type) && withinDays(event.date, dateRange)).sort((a, b) => b.date.localeCompare(a.date));
  }, [briefs.data, dateRange, trends.data, type, zones.data]);
  const error = briefs.error ?? trends.error ?? zones.error;
  if (briefs.isLoading || trends.isLoading || zones.isLoading) return <LoadingSkeleton className="h-96" variant="chart" />;
  if (error) return <ErrorState message={error.message} onRetry={() => { void briefs.refetch(); void trends.refetch(); void zones.refetch(); }} />;
  if (!events.length && type === 'all' && dateRange === 'all') return <EmptyState title="No signals" description="No intelligence timeline events are available." />;
  return <div className="grid gap-6"><PageHeader title="Signals" subtitle="Timeline of notable intelligence events, escalations, and threshold crossings" /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 sm:grid-cols-2"><Select value={type} onValueChange={setType} options={typeOptions} /><Select value={dateRange} onValueChange={setDateRange} options={dateOptions} /></section>{!events.length ? <EmptyState title="No signals match your filters" description="Try a broader signal type or date range." /> : <section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="relative grid gap-4 before:absolute before:bottom-0 before:left-5 before:top-0 before:w-px before:bg-[var(--color-border)]">{events.map((event) => { const Icon = icon(event.type); return <div key={`${event.type}-${event.id}`} className="relative grid grid-cols-[42px_1fr] gap-3"><div className="z-10 grid h-10 w-10 place-items-center rounded-full bg-[var(--color-surface-elevated)] ring-1 ring-[var(--color-border)]"><Icon className="h-5 w-5 text-[var(--color-gold)]" /></div><div className="rounded-[var(--radius-lg)] bg-white/5 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{event.title}</h3><Badge variant={event.severity === 'high' ? 'red' : event.severity === 'medium' ? 'amber' : 'green'}>{event.severity}</Badge></div><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{event.district} · {event.date}</p><p className="mt-2 text-sm">{event.detail}</p></div></div>; })}</div></section>}</div>;
}

export default SignalsPage;
