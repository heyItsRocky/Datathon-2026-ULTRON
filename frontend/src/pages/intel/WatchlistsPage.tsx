import { useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useIntelBriefs } from '@/features/intelligence/hooks/useIntelBriefs';
import { useRedZones } from '@/features/intelligence/hooks/useRedZones';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

interface Watchlist { id: string; title: string; summary: string; type: string; items: string[]; priority: 'high' | 'medium' | 'low' }

export function WatchlistsPage() {
  const briefs = useIntelBriefs();
  const zones = useRedZones();
  const [open, setOpen] = useState('cyber');
  const watchlists = useMemo<Watchlist[]>(() => [
    { id: 'cyber', title: 'Cyber Threats', summary: 'Fraud, ransomware, and phishing signals under command watch.', type: 'cyber', priority: 'high', items: (briefs.data ?? []).filter((brief) => brief.category === 'cyber').map((brief) => brief.title).slice(0, 5) },
    { id: 'offenders', title: 'Repeat Offenders', summary: 'District-level repeat activity and release-monitoring signals.', type: 'crime', priority: 'medium', items: (briefs.data ?? []).filter((brief) => brief.tags.includes('repeat offenders') || brief.tags.includes('theft')).map((brief) => brief.title).slice(0, 5) },
    { id: 'red-zone', title: 'Red-Zone Districts', summary: 'High and medium district risk clusters for senior review.', type: 'district', priority: 'high', items: (zones.data ?? []).filter((zone) => zone.severity !== 'low').map((zone) => `${zone.districtName} · ${zone.riskScore} risk score`).slice(0, 8) },
  ], [briefs.data, zones.data]);
  const error = briefs.error ?? zones.error;
  if (briefs.isLoading || zones.isLoading) return <LoadingSkeleton className="h-96" variant="chart" />;
  if (error) return <ErrorState message={error.message} onRetry={() => { void briefs.refetch(); void zones.refetch(); }} />;
  if (!watchlists.some((list) => list.items.length)) return <EmptyState title="No watchlists" description="No watchlist items are available." />;
  return <div className="grid gap-6"><PageHeader title="Watchlists" subtitle="Command-managed watchlists for cyber threats, repeat offenders, and red-zone districts" /><section className="glass-card flex justify-between rounded-[var(--radius-2xl)] p-4"><div><h2 className="font-bold">Active watchlists</h2><p className="text-sm text-[var(--color-text-secondary)]">{watchlists.length} pre-populated command watchlists</p></div><Button><Plus className="h-4 w-4" /> Create Watchlist</Button></section><section className="grid gap-4">{watchlists.map((list) => <div key={list.id} className="glass-card rounded-[var(--radius-2xl)] p-5"><button onClick={() => setOpen(open === list.id ? '' : list.id)} className="flex w-full items-center justify-between gap-3 text-left"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-bold">{list.title}</h3><Badge variant={list.priority === 'high' ? 'red' : 'amber'}>{list.priority}</Badge><Badge variant="violet">{list.type}</Badge></div><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{list.summary}</p></div><ChevronDown className="h-5 w-5 text-[var(--color-gold)]" /></button>{open === list.id ? <div className="mt-4 grid gap-2">{list.items.map((item) => <div key={item} className="rounded-[var(--radius-lg)] bg-white/5 p-3 text-sm">{item}</div>)}</div> : null}</div>)}</section></div>;
}

export default WatchlistsPage;
