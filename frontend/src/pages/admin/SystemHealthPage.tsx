import { Activity, AlertTriangle, CheckCircle, Server, XCircle } from 'lucide-react';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { MlModelStatusCard, SystemHealthPanel, formatDate } from '@/features/admin/components';
import { useMlModels, useRetrainModel, useSystemHealth } from '@/features/admin/hooks/useAdminData';

export function SystemHealthPage() {
  const services = useSystemHealth();
  const models = useMlModels();
  const retrain = useRetrainModel();
  const isLoading = services.isLoading || models.isLoading;
  const isError = services.isError || models.isError;
  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-4">{[0,1,2,3].map((i)=><LoadingSkeleton key={i} variant="card" />)}</div><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (isError) return <ErrorState message={services.error?.message ?? models.error?.message ?? 'Failed to load system health'} onRetry={() => { void services.refetch(); void models.refetch(); }} />;
  if (!services.data?.length) return <EmptyState title="No services found" description="System service telemetry is not available." />;
  const healthy = services.data.filter((service) => service.status === 'healthy').length;
  const degraded = services.data.filter((service) => service.status === 'degraded').length;
  const down = services.data.filter((service) => service.status === 'down').length;
  return <div className="grid gap-6"><PageHeader title="System Health" subtitle={`Last checked ${formatDate(services.data[0]?.lastChecked ?? '')}`} /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Server} title="Total Services" value={services.data.length} trend={0} /><KpiCard icon={CheckCircle} title="Healthy" value={healthy} trend={6} /><KpiCard icon={AlertTriangle} title="Degraded" value={degraded} trend={-2} /><KpiCard icon={XCircle} title="Down" value={down} trend={-1} /></section><section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Activity className="h-5 w-5 text-[var(--color-gold)]" /> Service Health</h2><SystemHealthPanel services={services.data} /></section><section className="grid gap-4 xl:grid-cols-3">{(models.data ?? []).map((model) => <MlModelStatusCard key={model.id} model={model} loading={retrain.isPending} onRetrain={(id) => retrain.mutate(id)} />)}</section></div>;
}
export default SystemHealthPage;
