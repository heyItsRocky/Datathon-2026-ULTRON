import { Badge } from '@/shared/ui-kit';

export type Status = 'open' | 'investigating' | 'resolved';

export function StatusBadge({ status }: { status: Status }) {
  const variant = status === 'open' ? 'red' : status === 'investigating' ? 'amber' : 'green';
  return <Badge variant={variant}>{status}</Badge>;
}
