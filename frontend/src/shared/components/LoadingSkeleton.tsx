import { cn } from '@/shared/utils/cn';

type SkeletonVariant = 'card' | 'table-row' | 'chart' | 'map' | 'text';

const variants: Record<SkeletonVariant, string> = {
  card: 'h-36 rounded-[var(--radius-xl)]',
  'table-row': 'h-12 rounded-[var(--radius-md)]',
  chart: 'h-64 rounded-[var(--radius-xl)]',
  map: 'h-96 rounded-[var(--radius-2xl)]',
  text: 'h-4 rounded-[var(--radius-full)]',
};

export function LoadingSkeleton({ variant = 'card', className }: { variant?: SkeletonVariant; className?: string }) {
  return <div className={cn('shimmer bg-white/10', variants[variant], className)} aria-busy="true" aria-label="Loading" />;
}
