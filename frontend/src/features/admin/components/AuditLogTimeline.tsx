import type { AuditLogDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { LoadingSkeleton } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';
import { formatDate, statusVariant } from './helpers';

export function AuditLogTimeline({ logs, loading = false, maxItems }: { logs: AuditLogDTO[]; loading?: boolean; maxItems?: number }) {
  if (loading) return <div className="grid gap-3">{[0, 1, 2].map((item) => <LoadingSkeleton key={item} variant="table-row" />)}</div>;
  return <div className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4">{logs.slice(0, maxItems ?? logs.length).map((log) => <details key={log.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 p-3"><summary className="cursor-pointer list-none"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{log.actor} · {log.action.replaceAll('_', ' ')}</p><p className="text-xs text-[var(--color-text-muted)]">{formatDate(log.timestamp)} · {log.target}</p></div><Badge variant={statusVariant(log.severity)}>{log.severity}</Badge></div></summary><div className="mt-3 text-sm text-[var(--color-text-secondary)]"><p>{log.details}</p><p className="mt-1 font-mono text-xs">{log.actorId} · {log.ip}</p></div></details>)}</div>;
}
