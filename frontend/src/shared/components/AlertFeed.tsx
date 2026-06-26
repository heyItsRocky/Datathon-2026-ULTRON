import { AlertTriangle } from 'lucide-react';
import { SeverityBadge, type SeverityLevel } from './SeverityBadge';

export interface AlertItemData {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  time: string;
}

export function AlertItem({ alert }: { alert: AlertItemData }) {
  return (
    <li className="flex gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0">
      <AlertTriangle className="mt-1 h-4 w-4 text-[var(--color-gold)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3"><p className="font-semibold">{alert.title}</p><SeverityBadge severity={alert.severity} /></div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{alert.description}</p>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{alert.time}</p>
      </div>
    </li>
  );
}

export function AlertFeed({ alerts }: { alerts: AlertItemData[] }) {
  return <ul className="glass-card max-h-96 overflow-y-auto rounded-[var(--radius-xl)] p-4">{alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)}</ul>;
}
