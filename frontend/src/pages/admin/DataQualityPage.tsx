import { useState } from 'react';
import { AlertTriangle, CheckCircle, Database, ShieldAlert } from 'lucide-react';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { useDataIngestion } from '@/features/admin/hooks/useAdminData';
import { Badge, Button } from '@/shared/ui-kit';

const domains = [
  { name: 'Crime', records: 15420, completeness: 94, accuracy: 91, lastValidated: '2026-06-25' }, { name: 'Cyber', records: 8840, completeness: 89, accuracy: 87, lastValidated: '2026-06-25' },
  { name: 'Maps', records: 3200, completeness: 96, accuracy: 93, lastValidated: '2026-06-24' }, { name: 'Network', records: 2210, completeness: 82, accuracy: 85, lastValidated: '2026-06-24' },
  { name: 'Intel', records: 1180, completeness: 78, accuracy: 81, lastValidated: '2026-06-23' },
];

export function DataQualityPage() {
  const query = useDataIngestion(); const [validated, setValidated] = useState(false);
  if (query.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <EmptyState title="No data quality inputs" description="Ingestion history is required for quality checks." />;
  const totalRecords = domains.reduce((sum, domain) => sum + domain.records, 0); const errors = query.data.reduce((sum, job) => sum + job.errorCount, 0); const rows = query.data.reduce((sum, job) => sum + job.rowCount, 0); const errorRate = Math.round((errors / rows) * 100);
  return <div className="grid gap-6"><PageHeader title="Data Quality" subtitle="Data integrity and validation status" /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Database} title="Total Records" value={totalRecords} trend={5} /><KpiCard icon={ShieldAlert} title="Error Rate %" value={errorRate} trend={-2} /><KpiCard icon={AlertTriangle} title="Missing Fields" value={errors} trend={-4} /><KpiCard icon={CheckCircle} title="Last Validation" value={validated ? 1 : 0} trend={0} /></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{domains.map((domain) => { const score = Math.round((domain.completeness + domain.accuracy) / 2); return <article key={domain.name} className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{domain.name}</h3><Badge variant={score > 90 ? 'green' : score >= 70 ? 'amber' : 'red'}>{score}%</Badge></div><p className="text-sm text-[var(--color-text-secondary)]">{domain.records.toLocaleString()} records</p><div className="mt-4 grid gap-2 text-sm"><span>Completeness {domain.completeness}%</span><span>Accuracy {domain.accuracy}%</span></div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--color-gold)]" style={{ width: `${score}%` }} /></div><p className="mt-3 text-xs text-[var(--color-text-muted)]">Validated {domain.lastValidated}</p></article>; })}</section><section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Recent Validation Errors</h2><Button variant="secondary" onClick={() => setValidated(true)}>Run Validation</Button></div><div className="grid gap-2">{query.data.flatMap((job) => job.errors.map((error) => ({ ...error, id: job.id, fileName: job.fileName }))).slice(0, 8).map((error) => <div key={`${error.id}-${error.row}-${error.field}`} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 p-3 text-sm"><b>{error.fileName}</b> row {error.row}: {error.field} — <span className="text-[var(--color-text-secondary)]">{error.message}</span></div>)}</div></section></div>;
}
export default DataQualityPage;
