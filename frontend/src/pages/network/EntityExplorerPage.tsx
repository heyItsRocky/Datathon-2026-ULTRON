import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Network } from 'lucide-react';
import { useCrimeNetwork } from '@/features/network/hooks/useCrimeNetwork';
import { useCyberNetwork } from '@/features/network/hooks/useCyberNetwork';
import type { GraphElement } from '@/shared/api/dto-adapters/network';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button, SearchInput } from '@/shared/ui-kit';
import type { BadgeVariant } from '@/shared/ui-kit/Badge';

type Domain = 'crime' | 'cyber';
interface EntityRow { node: GraphElement; domain: Domain; degree: number }

const domainTabs: Array<Domain | 'all'> = ['all', 'crime', 'cyber'];
const preferredTypes = ['criminal', 'victim', 'crime', 'ip', 'domain', 'server'];
const typeVariant: Record<string, BadgeVariant> = { criminal: 'red', victim: 'cyan', crime: 'amber', ip: 'cyan', domain: 'violet', server: 'green' };

function degreeFor(nodeId: string, edges: GraphElement[]): number {
  return edges.filter((edge) => edge.data.source === nodeId || edge.data.target === nodeId).length;
}

function detailPath(node: GraphElement): string {
  const type = String(node.data.type ?? '');
  if (type === 'criminal') return `/crime/criminals/${encodeURIComponent(node.data.id)}`;
  if (type === 'crime') return `/crime/cases/${encodeURIComponent(node.data.id)}`;
  if (type === 'ip') return `/cyber/ip/${encodeURIComponent(String(node.data.label ?? node.data.id))}`;
  if (type === 'domain') return `/cyber/domain/${encodeURIComponent(String(node.data.label ?? node.data.id))}`;
  return '/network';
}

export function EntityExplorerPage() {
  const crime = useCrimeNetwork();
  const cyber = useCyberNetwork();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [types, setTypes] = useState<string[]>([]);

  const entities = useMemo<EntityRow[]>(() => {
    const rows: EntityRow[] = [];
    (crime.data?.elements.nodes ?? []).forEach((node) => rows.push({ node, domain: 'crime', degree: degreeFor(node.data.id, crime.data?.elements.edges ?? []) }));
    (cyber.data?.elements.nodes ?? []).forEach((node) => rows.push({ node, domain: 'cyber', degree: degreeFor(node.data.id, cyber.data?.elements.edges ?? []) }));
    return rows.sort((a, b) => b.degree - a.degree);
  }, [crime.data, cyber.data]);

  const availableTypes = useMemo(() => {
    const discovered = [...new Set(entities.map((row) => String(row.node.data.type ?? 'unknown')))];
    return [...preferredTypes.filter((type) => discovered.includes(type)), ...discovered.filter((type) => !preferredTypes.includes(type))];
  }, [entities]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return entities.filter((row) => {
      const haystack = `${row.node.data.id} ${row.node.data.label ?? ''} ${row.node.data.type ?? ''}`.toLowerCase();
      return (!normalized || haystack.includes(normalized)) && (domain === 'all' || row.domain === domain) && (!types.length || types.includes(String(row.node.data.type ?? 'unknown')));
    });
  }, [domain, entities, query, types]);

  const toggleType = (type: string) => setTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);

  if (crime.isLoading || cyber.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div></div>;
  if (crime.isError) return <ErrorState message={crime.error.message} onRetry={() => void crime.refetch()} />;
  if (cyber.isError) return <ErrorState message={cyber.error.message} onRetry={() => void cyber.refetch()} />;
  if (!entities.length) return <EmptyState title="No entities available" description="No graph entities were found in crime or cyber networks." />;

  return <div className="grid gap-6"><PageHeader title="Entity Explorer" subtitle="Browse all entities across crime and cyber networks" />
    <section className="glass-card grid gap-4 rounded-[var(--radius-2xl)] p-4"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by label, ID, or type" /><div className="flex flex-wrap gap-2">{domainTabs.map((item) => <Button key={item} size="sm" variant={domain === item ? 'primary' : 'secondary'} onClick={() => setDomain(item)} className="capitalize">{item}</Button>)}</div><div className="flex flex-wrap gap-2">{availableTypes.map((type) => <Button key={type} size="sm" variant={types.includes(type) ? 'primary' : 'ghost'} onClick={() => toggleType(type)} className="capitalize">{type}</Button>)}</div></section>
    {!filtered.length ? <EmptyState title="No entities match filters" description="Adjust search, domain, or entity type filters." /> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((row) => { const type = String(row.node.data.type ?? 'unknown'); const risk = typeof row.node.data.riskScore === 'number' ? row.node.data.riskScore : typeof row.node.data.incidentCount === 'number' ? row.node.data.incidentCount * 10 : 0; return <article key={`${row.domain}-${row.node.data.id}`} className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="flex items-start justify-between gap-3"><Badge variant={typeVariant[type] ?? 'muted'} className="capitalize">{type}</Badge><Badge variant={row.domain === 'crime' ? 'red' : 'cyan'}>{row.domain}</Badge></div><h2 className="mt-4 text-xl font-bold">{row.node.data.label ?? row.node.data.id}</h2><p className="font-mono text-xs text-[var(--color-text-muted)]">{row.node.data.id}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-[var(--radius-lg)] bg-white/5 p-3"><p className="text-[var(--color-text-muted)]">Risk</p><b className="text-[var(--color-gold)]">{risk}</b></div><div className="rounded-[var(--radius-lg)] bg-white/5 p-3"><p className="text-[var(--color-text-muted)]">Connections</p><b className="text-[var(--color-gold)]">{row.degree}</b></div></div><div className="mt-5 flex flex-wrap gap-2"><Link to="/network"><Button size="sm" variant="secondary"><Network className="h-4 w-4" /> View in Network</Button></Link><Link to={detailPath(row.node)}><Button size="sm" variant="secondary"><ExternalLink className="h-4 w-4" /> View Details</Button></Link></div></article>; })}</section>}
  </div>;
}

export default EntityExplorerPage;
