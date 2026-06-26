import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Network, ShieldAlert, Users } from 'lucide-react';
import { CrimeNetworkGraph } from '@/features/network/components/CrimeNetworkGraph';
import { NodeDetailDrawer } from '@/features/network/components/NodeDetailDrawer';
import { useCrimeNetwork } from '@/features/network/hooks/useCrimeNetwork';
import { useCriminalDetail } from '@/features/crime/hooks/useCriminalDetail';
import type { GraphData, GraphElement } from '@/shared/api/dto-adapters/network';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

function oneHopGraph(graph: GraphData | undefined, suspectId: string): GraphData {
  if (!graph || !suspectId) return { elements: { nodes: [], edges: [] } };
  const connectedEdges = graph.elements.edges.filter((edge) => edge.data.source === suspectId || edge.data.target === suspectId);
  const ids = new Set<string>([suspectId]);
  connectedEdges.forEach((edge) => { if (typeof edge.data.source === 'string') ids.add(edge.data.source); if (typeof edge.data.target === 'string') ids.add(edge.data.target); });
  return { elements: { nodes: graph.elements.nodes.filter((node) => ids.has(node.data.id)), edges: connectedEdges } };
}

function ageFromDob(dob: string): number {
  const year = new Date(dob).getFullYear();
  return Number.isFinite(year) ? new Date().getFullYear() - year : 0;
}

export function SuspectProfilePage() {
  const { suspectId = '' } = useParams<{ suspectId: string }>();
  const decodedId = decodeURIComponent(suspectId);
  const network = useCrimeNetwork();
  const criminal = useCriminalDetail(decodedId);
  const [selected, setSelected] = useState<GraphElement | null>(null);
  const suspectNode = useMemo(() => network.data?.elements.nodes.find((node) => node.data.id === decodedId), [decodedId, network.data]);
  const graph = useMemo(() => oneHopGraph(network.data, decodedId), [decodedId, network.data]);
  const timeline = useMemo(() => graph.elements.edges.map((edge, index) => {
    const targetId = edge.data.source === decodedId ? String(edge.data.target ?? '') : String(edge.data.source ?? '');
    const target = graph.elements.nodes.find((node) => node.data.id === targetId);
    return { id: edge.data.id, index, relationship: String(edge.data.label ?? 'connected_to'), target, caseId: target?.data.type === 'crime' ? target.data.id : undefined };
  }), [decodedId, graph]);

  if (network.isLoading || criminal.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-6 xl:grid-cols-2"><LoadingSkeleton className="h-96" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div></div>;
  if (network.isError) return <ErrorState message={network.error.message} onRetry={() => void network.refetch()} />;
  if (criminal.isError) return <ErrorState message={criminal.error.message} onRetry={() => void criminal.refetch()} />;
  if (!suspectNode || !criminal.data || criminal.data.id === 'UNKNOWN-CRIMINAL') return <EmptyState title="Suspect not found" description="The requested suspect was not found in network or criminal intelligence records." />;
  if (!graph.elements.edges.length) return <EmptyState title="No suspect connections" description="This suspect has no one-hop graph associations in the crime network." />;

  return <div className="grid gap-6"><section className="glass-card rounded-[var(--radius-2xl)] p-5"><Link className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]" to="/network"><ArrowLeft className="h-4 w-4" /> Back to Network</Link><PageHeader title={criminal.data.name} subtitle="Suspect Profile" /></section>
    <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]"><div className="grid gap-6"><article className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Profile</h2><Badge variant={criminal.data.riskScore > 70 ? 'red' : criminal.data.riskScore > 40 ? 'amber' : 'green'}>Risk {criminal.data.riskScore}</Badge></div><dl className="mt-4 grid gap-4 md:grid-cols-2"><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">ID</dt><dd className="font-mono text-[var(--color-gold)]">{criminal.data.id}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Status</dt><dd>{criminal.data.status}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Age</dt><dd>{ageFromDob(criminal.data.dob)}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Gender</dt><dd>Unknown</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">District</dt><dd>{criminal.data.district}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Priors</dt><dd>{criminal.data.priors}</dd></div></dl><p className="mt-4 text-sm text-[var(--color-text-secondary)]">MO Signature: {criminal.data.moSignature}</p></article><article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Associated Crimes</h2><div className="mt-4 grid gap-2">{criminal.data.associatedCrimes.map((caseId) => <Link key={caseId} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3 font-mono text-sm text-[var(--color-gold)] hover:bg-white/5" to={`/crime/cases/${encodeURIComponent(caseId)}`}>{caseId}</Link>)}</div></article></div><aside className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">1-Hop Network</h2><div className="mt-4 h-[400px] rounded-[var(--radius-xl)] bg-black/20"><CrimeNetworkGraph data={graph} layout="concentric" onNodeClick={(id) => setSelected(graph.elements.nodes.find((node) => node.data.id === id) ?? null)} /></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><Badge variant="red">Criminal</Badge><Badge variant="amber">Crime</Badge><Badge variant="cyan">Victim</Badge><Badge variant="muted">Association</Badge></div></aside></section>
    <section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Association Timeline</h2><ol className="mt-4 space-y-3">{timeline.map((item) => <li key={item.id} className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/15 text-sm font-bold text-[var(--color-gold)]">{item.index + 1}</span><div><p className="font-semibold">{item.relationship} → {item.target?.data.label ?? item.target?.data.id ?? 'Unknown'}</p>{item.caseId ? <Link className="text-sm text-[var(--color-gold)]" to={`/crime/cases/${encodeURIComponent(item.caseId)}`}>Case reference: {item.caseId}</Link> : <p className="text-sm text-[var(--color-text-secondary)]">Network association record</p>}</div></li>)}</ol></section>
    <section className="flex flex-wrap gap-2"><Link to="/network"><Button variant="secondary"><Network className="h-4 w-4" /> View in Full Network</Button></Link><Link to={`/crime/criminals/${encodeURIComponent(criminal.data.id)}`}><Button variant="secondary"><ShieldAlert className="h-4 w-4" /> View Criminal Detail</Button></Link><Link to="/crime/cases"><Button variant="secondary"><FileText className="h-4 w-4" /> View Cases</Button></Link><Button variant="secondary"><Users className="h-4 w-4" /> Associates {criminal.data.associates.length}</Button></section>
    <NodeDetailDrawer open={Boolean(selected)} node={selected} onClose={() => setSelected(null)} />
  </div>;
}

export default SuspectProfilePage;
