import { Badge } from '@/shared/ui-kit';

export function RiskBadge({ score }: { score: number }) {
  const tier = score >= 85 ? 'Extreme' : score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low';
  const variant = score >= 65 ? 'red' : score >= 40 ? 'amber' : 'green';
  return <Badge variant={variant}>{tier} · {score}</Badge>;
}
