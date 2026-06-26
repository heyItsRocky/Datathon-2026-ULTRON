import { Link } from 'react-router-dom';
import type { RedZone } from '@/shared/api/dto-adapters/intel';
import { EmptyState, ErrorState, LoadingSkeleton, SeverityBadge } from '@/shared/components';

interface Props { zones: RedZone[]; isLoading: boolean; isEmpty: boolean; hasError: boolean }

export function RedZonePanel({ zones, isLoading, isEmpty, hasError }: Props) {
  if (isLoading) return <LoadingSkeleton className="h-80" variant="chart" />;
  if (hasError) return <ErrorState message="Unable to load red-zone districts." />;
  if (isEmpty) return <EmptyState title="No red zones" description="No red-zone districts match this view." />;
  return <section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Red-Zone Districts</h2><Link className="text-sm text-[var(--color-gold)]" to="/maps/hotspots">View All →</Link></div><div className="grid gap-3">{zones.slice(0, 6).map((zone) => <div key={zone.districtId} className="rounded-[var(--radius-lg)] bg-white/5 p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{zone.districtName}</p><p className="text-xs text-[var(--color-text-secondary)]">{zone.incidentCount} incidents · score {zone.riskScore}</p></div><SeverityBadge severity={zone.severity} /></div><div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]"><span>{zone.topCrimeTypes.slice(0, 2).join(', ')}</span><span className={zone.trend === 'down' ? 'text-[var(--severity-low)]' : 'text-[var(--color-gold)]'}>{zone.percentChange > 0 ? '+' : ''}{zone.percentChange}%</span></div></div>)}</div></section>;
}
