import { cn } from '@/shared/utils/cn';

export type BadgeVariant = 'gold' | 'red' | 'amber' | 'cyan' | 'teal' | 'magenta' | 'violet' | 'green' | 'muted';

const variants: Record<BadgeVariant, string> = {
  gold: 'bg-[var(--color-gold-soft)] text-[var(--color-gold)] border-[var(--color-gold)]/40',
  red: 'bg-red-500/15 text-[var(--severity-extreme)] border-red-500/30',
  amber: 'bg-amber-500/15 text-[var(--severity-medium)] border-amber-500/30',
  cyan: 'bg-cyan-500/15 text-[var(--color-cyber-cyan)] border-cyan-500/30',
  teal: 'bg-teal-500/15 text-[var(--color-cyber-teal)] border-teal-500/30',
  magenta: 'bg-fuchsia-500/15 text-[var(--color-network-magenta)] border-fuchsia-500/30',
  violet: 'bg-violet-500/15 text-[var(--color-intel-violet)] border-violet-500/30',
  green: 'bg-green-500/15 text-[var(--severity-low)] border-green-500/30',
  muted: 'bg-white/5 text-[var(--color-text-secondary)] border-white/10',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'muted', className, ...props }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-[var(--radius-full)] border px-2.5 py-1 text-xs font-semibold', variants[variant], className)} {...props} />;
}
