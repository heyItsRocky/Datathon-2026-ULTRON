import { Activity } from 'lucide-react';
import { Badge } from '@/shared/ui-kit';
import { formatDate, statusVariant } from './helpers';

export function ServiceStatusCard({ name, status, latency, details, uptime, lastChecked }: { name: string; status: 'healthy' | 'degraded' | 'down' | string; latency?: string; details?: string; uptime?: string; lastChecked?: string }) {
  return <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/5 p-4"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[var(--color-gold)]" /><h3 className="font-semibold">{name}</h3></div><Badge variant={statusVariant(status)}>{status}</Badge></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--color-text-secondary)]"><span>Latency <b className="text-[var(--color-text-primary)]">{latency ?? '—'}</b></span><span>Uptime <b className="text-[var(--color-text-primary)]">{uptime ?? '—'}</b></span></div><p className="mt-3 text-xs text-[var(--color-text-muted)]">{details ?? (lastChecked ? `Checked ${formatDate(lastChecked)}` : 'No details')}</p></article>;
}
