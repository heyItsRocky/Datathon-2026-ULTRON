import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { SocioEconomicData } from '@/shared/api/dto-adapters/intel';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';

interface Props { data?: SocioEconomicData; isLoading: boolean; isEmpty: boolean; hasError: boolean }
const tooltipStyle = { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' };

export function SocioEconomicPanel({ data, isLoading, isEmpty, hasError }: Props) {
  if (isLoading) return <LoadingSkeleton className="h-80" variant="chart" />;
  if (hasError) return <ErrorState message="Unable to load socio-economic correlations." />;
  if (isEmpty || !data) return <EmptyState title="No socio-economic data" description="Correlation data is unavailable." />;
  return <section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Socio-Economic Correlations</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{data.correlations.slice(0, 2).map((correlation) => <div key={correlation.xLabel} className="rounded-[var(--radius-lg)] bg-white/5 p-3"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-semibold">{correlation.xLabel} vs Crime</p><Badge variant={correlation.correlationCoefficient > 0 ? 'amber' : 'cyan'}>{correlation.correlationCoefficient.toFixed(2)}</Badge></div><div className="h-48"><ResponsiveContainer><ScatterChart><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="x" name={correlation.xLabel} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis dataKey="y" name={correlation.yLabel} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} /><Scatter data={correlation.dataPoints} fill="var(--color-intel-violet)" /></ScatterChart></ResponsiveContainer></div><p className="text-xs text-[var(--color-text-muted)]">{correlation.strength}</p></div>)}</div></section>;
}
