import { useMemo, useState } from 'react';
import { ClipboardList, Download } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { AuditLogTimeline } from '@/features/admin/components';
import { useAuditLogs } from '@/features/admin/hooks/useAdminData';
import { Button, SearchInput, Select } from '@/shared/ui-kit';

const severities = ['all', 'info', 'warning', 'critical'].map((value) => ({ label: value === 'all' ? 'All Severities' : value, value }));
const ranges = [{ label: 'All Dates', value: 'all' }, { label: 'Last 24 Hours', value: '1d' }, { label: 'Last 7 Days', value: '7d' }];

export function AuditLogPage() {
  const query = useAuditLogs(); const [search, setSearch] = useState(''); const [action, setAction] = useState('all'); const [severity, setSeverity] = useState('all'); const [range, setRange] = useState('all');
  const actionOptions = useMemo(() => [{ label: 'All Actions', value: 'all' }, ...[...new Set((query.data ?? []).map((log) => log.action))].map((item) => ({ label: item.replaceAll('_', ' '), value: item }))], [query.data]);
  const logs = useMemo(() => { const latest = Math.max(...(query.data ?? []).map((log) => new Date(log.timestamp).getTime())); const threshold = range === 'all' ? Number.NEGATIVE_INFINITY : latest - Number(range.replace('d', '')) * 86400000; return (query.data ?? []).filter((log) => (`${log.actor} ${log.action} ${log.target} ${log.details}`.toLowerCase().includes(search.toLowerCase())) && (action === 'all' || log.action === action) && (severity === 'all' || log.severity === severity) && (range === 'all' || new Date(log.timestamp).getTime() >= threshold)); }, [action, query.data, range, search, severity]);
  if (query.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <EmptyState icon={ClipboardList} title="No audit records found" description="System actions will appear here." />;
  return <div className="grid gap-6"><PageHeader title="Audit Log" subtitle="Chronological record of system actions" /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_190px_160px_150px_130px]"><SearchInput value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search logs" /><Select value={action} onValueChange={setAction} options={actionOptions} /><Select value={severity} onValueChange={setSeverity} options={severities} /><Select value={range} onValueChange={setRange} options={ranges} /><Button variant="secondary"><Download className="h-4 w-4" />Export</Button></section>{logs.length ? <AuditLogTimeline logs={logs} /> : <EmptyState title="No audit records found" description="Adjust filters to view more system actions." />}</div>;
}
export default AuditLogPage;
