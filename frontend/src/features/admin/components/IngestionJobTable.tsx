import type { IngestionJobDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { LoadingSkeleton } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';
import { formatDate, statusVariant } from './helpers';

export function IngestionJobTable({ jobs, loading = false }: { jobs: IngestionJobDTO[]; loading?: boolean }) {
  if (loading) return <LoadingSkeleton className="h-72" variant="chart" />;
  return <div className="glass-card overflow-x-auto rounded-[var(--radius-2xl)] p-4"><table className="w-full min-w-[840px] text-left text-sm"><thead className="text-[var(--color-text-muted)]"><tr><th className="py-3">File</th><th>Type</th><th>Rows</th><th>Status</th><th>Started</th><th>Completed</th><th>Uploaded By</th><th>Action</th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id} className="border-t border-[var(--color-border)]"><td className="py-3"><b>{job.fileName}</b><p className="font-mono text-xs text-[var(--color-text-muted)]">{job.id}</p></td><td>{job.type}</td><td>{job.successCount}/{job.errorCount}/{job.rowCount}</td><td><Badge variant={statusVariant(job.status)}>{job.status}</Badge></td><td>{formatDate(job.startedAt)}</td><td>{job.completedAt ? formatDate(job.completedAt) : '—'}</td><td>{job.uploadedBy}</td><td><Button size="sm" variant="secondary" disabled={job.status !== 'failed'}>Retry</Button></td></tr>)}</tbody></table></div>;
}
