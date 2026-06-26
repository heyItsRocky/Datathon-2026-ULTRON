import { Brain, Link2, TrendingDown, TrendingUp } from 'lucide-react';
import type { IntelBrief } from '@/shared/api/dto-adapters/intel';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';

function priorityVariant(priority: IntelBrief['priority']) { return priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'green'; }
function categoryVariant(category: IntelBrief['category']) { return category === 'cyber' ? 'cyan' : category === 'intel' ? 'violet' : 'gold'; }

interface IntelBriefCardProps { brief?: IntelBrief; isLoading?: boolean; hasError?: boolean; isEmpty?: boolean; onClick?: () => void }

export function IntelBriefCard({ brief, isLoading = false, hasError = false, isEmpty = false, onClick }: IntelBriefCardProps) {
  if (isLoading) return <LoadingSkeleton variant="card" />;
  if (hasError) return <ErrorState message="Unable to load intelligence brief." />;
  if (isEmpty || !brief) return <EmptyState title="No intelligence briefs available" description="AI brief stream has no records for the current filters." />;
  const TrendIcon = brief.trend === 'down' ? TrendingDown : TrendingUp;
  return <button onClick={onClick} className="glass-card h-full rounded-[var(--radius-2xl)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--color-gold)]/40"><div className="mb-3 flex items-start justify-between gap-3"><Brain className="h-6 w-6 text-[var(--color-intel-violet)]" /><div className="flex gap-2"><Badge variant={categoryVariant(brief.category)}>{brief.category}</Badge><Badge variant={priorityVariant(brief.priority)}>{brief.priority}</Badge></div></div><h3 className="text-lg font-bold">{brief.title}</h3><p className="mt-3 line-clamp-3 text-sm text-[var(--color-text-secondary)]">{brief.summary}</p><div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]"><span>{brief.district}</span><span>{brief.date}</span><span className="flex items-center gap-1 text-[var(--color-gold)]"><TrendIcon className="h-3.5 w-3.5" />{brief.percentChange > 0 ? '+' : ''}{brief.percentChange}%</span><span className="flex items-center gap-1"><Link2 className="h-3.5 w-3.5" />{brief.relatedCases.length} cases</span></div><p className="mt-4 text-sm font-medium text-[var(--color-text-primary)]">{brief.recommendation}</p></button>;
}
