import { Link } from 'react-router-dom';
import type { PredictiveZone } from '@/shared/api/dto-adapters/intel';
import { EmptyState, ErrorState, LoadingSkeleton, SeverityBadge, type SeverityLevel } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';

interface Props { zones: PredictiveZone[]; isLoading: boolean; isEmpty: boolean; hasError: boolean }
function severity(level: PredictiveZone['riskLevel']): SeverityLevel { return level === 'critical' ? 'extreme' : level; }

export function PredictiveZonesPanel({ zones, isLoading, isEmpty, hasError }: Props) {
  if (isLoading) return <LoadingSkeleton className="h-80" variant="chart" />;
  if (hasError) return <ErrorState message="Unable to load predictive zones." />;
  if (isEmpty) return <EmptyState title="No predictive zones" description="No AI forecast zones are available." />;
  return <section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Predictive Risk Zones</h2><Link className="text-sm text-[var(--color-gold)]" to="/intel/forecast">View All →</Link></div><div className="grid gap-4">{zones.slice(0, 5).map((zone) => <div key={zone.zoneId} className="rounded-[var(--radius-lg)] bg-white/5 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{zone.districtName}</p><p className="text-sm text-[var(--color-text-secondary)]">{zone.predictedCrimeType}</p></div><SeverityBadge severity={severity(zone.riskLevel)} /></div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${zone.confidenceScore}%` }} /></div><div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]"><span>{zone.confidenceScore}% confidence</span><Badge variant="violet">{zone.timeframe}</Badge></div><p className="mt-2 text-xs text-[var(--color-text-muted)]">{zone.contributingFactors[0]}</p></div>)}</div></section>;
}
