import { useMemo, useState } from 'react';
import { Download, FileDown } from 'lucide-react';
import { useEmergingTrends } from '@/features/intelligence/hooks/useEmergingTrends';
import { useIntelBriefs } from '@/features/intelligence/hooks/useIntelBriefs';
import { usePredictiveZones } from '@/features/intelligence/hooks/usePredictiveZones';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

interface ReportRow { id: string; title: string; date: string; category: string; priority: 'low' | 'medium' | 'high'; district: string }
type SortKey = keyof Pick<ReportRow, 'title' | 'date' | 'category' | 'priority' | 'district'>;
function priorityVariant(priority: ReportRow['priority']) { return priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'green'; }

export function IntelReportsPage() {
  const briefs = useIntelBriefs();
  const trends = useEmergingTrends();
  const zones = usePredictiveZones();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const rows = useMemo<ReportRow[]>(() => {
    const briefRows = (briefs.data ?? []).map((brief) => ({ id: brief.id, title: brief.title, date: brief.date, category: brief.category, priority: brief.priority, district: brief.district }));
    const trendRows = (trends.data ?? []).map((trend) => ({ id: trend.id, title: `Trend: ${trend.name}`, date: '2026-06-24', category: trend.category, priority: trend.percentChange > 30 ? 'high' as const : trend.percentChange > 15 ? 'medium' as const : 'low' as const, district: trend.district }));
    const zoneRows = (zones.data ?? []).map((zone) => ({ id: zone.zoneId, title: `Forecast: ${zone.predictedCrimeType}`, date: '2026-06-24', category: 'forecast', priority: zone.riskLevel === 'critical' || zone.riskLevel === 'high' ? 'high' as const : zone.riskLevel === 'medium' ? 'medium' as const : 'low' as const, district: zone.districtName }));
    return [...briefRows, ...trendRows, ...zoneRows].sort((a, b) => String(b[sortKey]).localeCompare(String(a[sortKey])));
  }, [briefs.data, sortKey, trends.data, zones.data]);
  const error = briefs.error ?? trends.error ?? zones.error;
  if (briefs.isLoading || trends.isLoading || zones.isLoading) return <LoadingSkeleton className="h-96" variant="chart" />;
  if (error) return <ErrorState message={error.message} onRetry={() => { void briefs.refetch(); void trends.refetch(); void zones.refetch(); }} />;
  if (!rows.length) return <EmptyState title="No intelligence reports" description="No report rows are available." />;
  return <div className="grid gap-6"><PageHeader title="Intel Reports" subtitle="Sortable intelligence products, trend summaries, and predictive snapshots" /><section className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-4"><div className="flex flex-wrap gap-2">{(['title', 'date', 'category', 'priority', 'district'] as SortKey[]).map((key) => <Button key={key} size="sm" variant={sortKey === key ? 'primary' : 'secondary'} onClick={() => setSortKey(key)}>{key}</Button>)}</div><div className="flex gap-2"><Button variant="secondary"><Download className="h-4 w-4" /> Export</Button><Button variant="secondary"><FileDown className="h-4 w-4" /> PDF</Button></div></section><section className="glass-card overflow-hidden rounded-[var(--radius-2xl)] p-5"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-[var(--color-text-muted)]"><tr><th className="py-3">Title</th><th>Date</th><th>Category</th><th>Priority</th><th>District</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[var(--color-border)]"><td className="py-3 font-semibold">{row.title}<p className="font-mono text-xs text-[var(--color-text-muted)]">{row.id}</p></td><td>{row.date}</td><td><Badge variant="violet">{row.category}</Badge></td><td><Badge variant={priorityVariant(row.priority)}>{row.priority}</Badge></td><td>{row.district}</td></tr>)}</tbody></table></div></section></div>;
}

export default IntelReportsPage;
