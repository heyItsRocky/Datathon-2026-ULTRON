import { Badge } from '@/shared/ui-kit';

export type SeverityLevel = 'extreme' | 'high' | 'medium' | 'low';

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  const variant = severity === 'extreme' || severity === 'high' ? 'red' : severity === 'medium' ? 'amber' : 'green';
  return <Badge variant={variant}>{severity}</Badge>;
}
