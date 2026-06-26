import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import type { EmergingTrend } from '@/shared/api/dto-adapters/intel';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';

interface Props { trends: EmergingTrend[]; isLoading: boolean; isEmpty: boolean; hasError: boolean }

export function EmergingTrendsPanel({ trends, isLoading, isEmpty, hasError }: Props) {
  if (isLoading) return <LoadingSkeleton className="h-80" variant="chart" />;
  if (hasError) return <ErrorState message="Unable to load emerging trends." />;
  if (isEmpty) return <EmptyState title="No emerging trends" description="Trend detection has no current signals." />;
  return <section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Top Emerging Trends</h2><Link className="text-sm text-[var(--color-gold)]" to="/intel/signals">View All →</Link></div><div className="grid gap-3">{trends.slice(0, 5).map((trend) => <div key={trend.id} className="grid grid-cols-[42px_1fr_84px_110px] items-center gap-3 rounded-[var(--radius-lg)] bg-white/5 p-3"><b className="text-[var(--color-gold)]">#{trend.rank}</b><div><p className="font-semibold">{trend.name}</p><p className="text-xs text-[var(--color-text-secondary)]">{trend.district}</p></div><Badge variant={trend.direction === 'down' ? 'green' : trend.direction === 'stable' ? 'muted' : 'amber'}>{trend.percentChange > 0 ? '+' : ''}{trend.percentChange}%</Badge><div className="h-12"><ResponsiveContainer><LineChart data={trend.chartData}><Tooltip /><Line type="monotone" dataKey="value" stroke="var(--color-gold)" dot={false} strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>)}</div></section>;
}
