import { Link } from 'react-router-dom';
import { Activity, ClipboardList, Database, FileText, HeartPulse, Shield, ShieldCheck, Users } from 'lucide-react';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { AuditLogTimeline, SystemHealthPanel } from '@/features/admin/components';
import { useAuditLogs, useDataIngestion, useSystemHealth, useUsers } from '@/features/admin/hooks/useAdminData';

const actions = [
  { title: 'User Management', href: '/admin/users', icon: Users }, { title: 'Role Permissions', href: '/admin/roles', icon: ShieldCheck },
  { title: 'Data Ingestion', href: '/admin/data-ingestion', icon: Database }, { title: 'Data Quality', href: '/admin/data-quality', icon: HeartPulse },
  { title: 'Audit Log', href: '/admin/audit-log', icon: ClipboardList }, { title: 'System Health', href: '/admin/system-health', icon: Activity },
  { title: 'Generate Report', href: '/dashboard/reports', icon: FileText },
];

export function AdminOverviewPage() {
  const users = useUsers(); const logs = useAuditLogs(); const services = useSystemHealth(); const jobs = useDataIngestion();
  const isLoading = users.isLoading || logs.isLoading || services.isLoading || jobs.isLoading;
  const isError = users.isError || logs.isError || services.isError || jobs.isError;
  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-4">{[0,1,2,3].map((i)=><LoadingSkeleton key={i} variant="card" />)}</div><LoadingSkeleton className="h-80" variant="chart" /></div>;
  if (isError) return <ErrorState message={users.error?.message ?? logs.error?.message ?? services.error?.message ?? jobs.error?.message ?? 'Failed to load admin overview'} onRetry={() => { void users.refetch(); void logs.refetch(); void services.refetch(); void jobs.refetch(); }} />;
  if (!users.data?.length) return <EmptyState title="No admin data" description="Administrative datasets are not available." />;
  const activeUsers = users.data.filter((user) => user.status === 'active').length;
  const pendingJobs = (jobs.data ?? []).filter((job) => job.status === 'pending' || job.status === 'running').length;
  const uptime = Math.round((services.data ?? []).filter((service) => service.status === 'healthy').length / Math.max(1, services.data?.length ?? 1) * 100);
  return <div className="grid gap-6"><PageHeader title="Admin Overview" subtitle="System administration and monitoring" /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Users} title="Total Users" value={users.data.length} trend={4} /><KpiCard icon={Shield} title="Active Sessions" value={activeUsers} trend={2} /><KpiCard icon={Database} title="Pending Jobs" value={pendingJobs} trend={-3} /><KpiCard icon={HeartPulse} title="System Uptime" value={uptime} trend={1} /></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{actions.map((action) => <Link key={action.href} to={action.href} className="glass-card rounded-[var(--radius-xl)] p-5 transition hover:-translate-y-0.5"><action.icon className="mb-4 h-6 w-6 text-[var(--color-gold)]" /><h3 className="font-bold">{action.title}</h3><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Open admin section</p></Link>)}</section><section className="grid gap-6 xl:grid-cols-[1fr_1fr]"><div><h2 className="mb-3 text-xl font-bold">Recent Activity</h2><AuditLogTimeline logs={logs.data ?? []} maxItems={10} /></div><section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="mb-4 text-xl font-bold">System Health Summary</h2><SystemHealthPanel services={(services.data ?? []).filter((service) => service.status !== 'healthy').slice(0, 4)} /></section></section></div>;
}
export default AdminOverviewPage;
