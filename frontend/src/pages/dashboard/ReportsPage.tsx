import { useMemo, useState } from 'react';
import { Download, FileText, Plus, TrendingUp } from 'lucide-react';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { ReportList } from '@/features/admin/components';
import type { ReportDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { Button, Input, Select } from '@/shared/ui-kit';

const initialReports: ReportDTO[] = [
  { id: 'REP-001', title: 'Crime Summary - June', type: 'Crime Summary', format: 'pdf', generatedAt: '2026-06-25T08:00:00Z', generatedBy: 'USR-001', status: 'completed', size: '2.4 MB', districts: ['Bengaluru Urban'], dateRange: { from: '2026-06-01', to: '2026-06-25' } },
  { id: 'REP-002', title: 'Cyber Weekly Digest', type: 'Cyber Summary', format: 'xlsx', generatedAt: '2026-06-24T16:10:00Z', generatedBy: 'SYS-002', status: 'completed', size: '1.1 MB', districts: ['All'], dateRange: { from: '2026-06-17', to: '2026-06-24' } },
  { id: 'REP-003', title: 'Full Intelligence Report', type: 'Full Intelligence Report', format: 'pdf', generatedAt: '2026-06-25T09:30:00Z', generatedBy: 'USR-005', status: 'generating', districts: ['All'], dateRange: { from: '2026-06-01', to: '2026-06-25' } },
];
const reportTypes = ['Crime Summary', 'Cyber Summary', 'District Comparison', 'Full Intelligence Report'].map((value) => ({ label: value, value }));
const formats = ['pdf', 'csv', 'xlsx'].map((value) => ({ label: value.toUpperCase(), value }));

export function ReportsPage() {
  const [loading] = useState(false); const [error] = useState(''); const [reports, setReports] = useState<ReportDTO[]>(initialReports); const [type, setType] = useState('Crime Summary'); const [format, setFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf'); const [from, setFrom] = useState('2026-06-01'); const [to, setTo] = useState('2026-06-25'); const [district, setDistrict] = useState('All');
  const completed = reports.filter((report) => report.status === 'completed').length; const weekly = reports.filter((report) => new Date(report.generatedAt).getTime() >= new Date('2026-06-18').getTime()).length; const topType = useMemo(() => reports.reduce<Record<string, number>>((acc, report) => ({ ...acc, [report.type]: (acc[report.type] ?? 0) + 1 }), {}), [reports]); const mostDownloaded = Object.entries(topType).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0;
  if (loading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (error) return <ErrorState message={error} />;
  const generate = (selectedType = type) => { const id = `REP-${String(reports.length + 1).padStart(3, '0')}`; setReports((current) => [{ id, title: `${selectedType} - Generated`, type: selectedType, format, generatedAt: new Date().toISOString(), generatedBy: 'USR-001', status: 'generating', districts: [district], dateRange: { from, to } }, ...current]); };
  return <div className="grid gap-6"><PageHeader title="Reports" subtitle="Generate and download intelligence reports" /><section className="grid gap-4 md:grid-cols-4"><KpiCard icon={FileText} title="Total Reports" value={reports.length} trend={4} /><KpiCard icon={Download} title="Completed Reports" value={completed} trend={3} /><KpiCard icon={TrendingUp} title="Generated This Week" value={weekly} trend={8} /><KpiCard icon={Download} title="Most Downloaded Type" value={mostDownloaded} trend={2} /></section><section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="mb-4 text-xl font-bold">Generate Report</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_120px_150px_150px_160px_140px]"><Select value={type} onValueChange={setType} options={reportTypes} /><Select value={format} onValueChange={(value) => setFormat(value as 'pdf' | 'csv' | 'xlsx')} options={formats} /><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /><Input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="District" /><Button onClick={() => generate()}><Plus className="h-4 w-4" />Generate</Button></div></section>{reports.length ? <ReportList reports={reports} onGenerate={generate} onDownload={() => undefined} /> : <EmptyState title="No reports generated yet" description="Generate a report to populate this table." />}</div>;
}
export default ReportsPage;
