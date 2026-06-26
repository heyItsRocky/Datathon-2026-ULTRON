import { useMemo, useState } from 'react';
import { Database } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { BulkUploadDropzone, CSVPreviewTable, IngestionJobTable } from '@/features/admin/components';
import { useDataIngestion } from '@/features/admin/hooks/useAdminData';
import { Button, Select } from '@/shared/ui-kit';

const types = ['all', 'crime', 'criminal', 'cyber', 'district'].map((value) => ({ label: value === 'all' ? 'All Types' : value, value }));
const statuses = ['all', 'completed', 'failed', 'running', 'pending', 'partial'].map((value) => ({ label: value === 'all' ? 'All Statuses' : value, value }));

export function DataIngestionPage() {
  const query = useDataIngestion(); const [tab, setTab] = useState<'upload' | 'history'>('upload'); const [type, setType] = useState('all'); const [status, setStatus] = useState('all'); const [fileName, setFileName] = useState('');
  const jobs = useMemo(() => (query.data ?? []).filter((job) => (type === 'all' || job.type === type) && (status === 'all' || job.status === status)), [query.data, status, type]);
  const preview = [{ caseId: 'KSP-2026-501', district: 'Bengaluru Urban', type: 'Theft', status: 'Open' }, { caseId: 'KSP-2026-502', district: 'Mysuru', type: 'Cyber Fraud', status: 'Investigating' }];
  if (query.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <EmptyState icon={Database} title="No ingestion jobs" description="Upload source files to start data ingestion." />;
  return <div className="grid gap-6"><PageHeader title="Data Ingestion" subtitle={`${query.data.length} ingestion jobs tracked`} /><section className="flex gap-2"><Button variant={tab === 'upload' ? 'primary' : 'secondary'} onClick={() => setTab('upload')}>Upload</Button><Button variant={tab === 'history' ? 'primary' : 'secondary'} onClick={() => setTab('history')}>Job History</Button></section>{tab === 'upload' ? <section className="grid gap-4"><BulkUploadDropzone onFileDrop={(file) => setFileName(file.name)} /><CSVPreviewTable rows={preview} columns={['caseId', 'district', 'type', 'status']} /><Button className="w-fit" disabled={!fileName}>Upload {fileName || 'File'}</Button></section> : <section className="grid gap-4"><div className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 sm:grid-cols-2"><Select value={type} onValueChange={setType} options={types} /><Select value={status} onValueChange={setStatus} options={statuses} /></div>{jobs.length ? <IngestionJobTable jobs={jobs} /> : <EmptyState title="No matching jobs" description="Adjust job filters to find records." />}</section>}</div>;
}
export default DataIngestionPage;
