import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface MetricDeltaProps {
  value: number;
  direction?: 'up' | 'down' | 'flat';
}

export function MetricDelta({ value, direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat' }: MetricDeltaProps) {
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : ArrowRight;
  return <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', direction === 'up' && 'text-[var(--severity-low)]', direction === 'down' && 'text-[var(--severity-extreme)]', direction === 'flat' && 'text-[var(--color-text-muted)]')}><Icon className="h-3.5 w-3.5" />{Math.abs(value)}%</span>;
}
