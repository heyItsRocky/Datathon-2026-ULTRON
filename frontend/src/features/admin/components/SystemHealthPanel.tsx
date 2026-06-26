import type { SystemServiceDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { LoadingSkeleton } from '@/shared/components';
import { ServiceStatusCard } from './ServiceStatusCard';

export function SystemHealthPanel({ services, loading = false }: { services: SystemServiceDTO[]; loading?: boolean }) {
  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div>;
  const groups = ['api', 'database', 'ml-model', 'cache', 'queue'];
  return <div className="grid gap-5">{groups.map((group) => { const rows = services.filter((service) => service.type === group); if (!rows.length) return null; return <section key={group}><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{group.replace('-', ' ')}</h3><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((service) => <ServiceStatusCard key={service.id} name={service.name} status={service.status} latency={service.latency} uptime={service.uptime} lastChecked={service.lastChecked} />)}</div></section>; })}</div>;
}
