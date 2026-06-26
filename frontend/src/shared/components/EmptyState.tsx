import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from '@/shared/ui-kit';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  return <div className="glass-card grid place-items-center rounded-[var(--radius-xl)] p-8 text-center"><Icon className="mb-3 h-10 w-10 text-[var(--color-text-muted)]" /><h3 className="font-bold">{title}</h3><p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>{actionLabel ? <Button className="mt-4" onClick={onAction}>{actionLabel}</Button> : null}</div>;
}
