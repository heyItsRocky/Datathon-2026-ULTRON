import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Grid3X3, Network } from 'lucide-react';
import { useCrimeNetwork } from '@/features/network/hooks/useCrimeNetwork';
import type { GraphElement } from '@/shared/api/dto-adapters/network';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button, Select } from '@/shared/ui-kit';
import type { BadgeVariant } from '@/shared/ui-kit/Badge';

type ViewMode = 'full' | 'compact';
interface MatrixEdge { edge: GraphElement; count: number }
interface SelectedCell { row: GraphElement; column: GraphElement; edge?: MatrixEdge }

const relationColors: Record<string, string> = { perpetrator: 'var(--color-crime-red)', victim_of: 'var(--color-cyber-cyan)', associate: 'var(--color-gold)', connected_to: 'var(--color-network-purple)' };
const typeVariant: Record<string, BadgeVariant> = { criminal: 'red', victim: 'cyan', crime: 'amber' };

function degree(node: GraphElement, edges: GraphElement[]): number {
  return edges.filter((edge) => edge.data.source === node.data.id || edge.data.target === node.data.id).length;
}

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join('::');
}

function matrixMap(edges: GraphElement[]): Map<string, MatrixEdge> {
  const map = new Map<string, MatrixEdge>();
  edges.forEach((edge) => {
    const source = String(edge.data.source ?? ''); const target = String(edge.data.target ?? '');
    if (!source || !target) return;
    const key = edgeKey(source, target);
    const current = map.get(key);
    map.set(key, { edge, count: (current?.count ?? 0) + 1 });
  });
  return map;
}

function cellColor(edge?: MatrixEdge): string {
  if (!edge) return 'transparent';
  return relationColors[String(edge.edge.data.label ?? '')] ?? 'var(--color-network-purple)';
}

export function AssociationMatrixPage() {
  const query = useCrimeNetwork();
  const [type, setType] = useState('all');
  const [minStrength, setMinStrength] = useState('1');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  const availableTypes = useMemo(() => [...new Set((query.data?.elements.nodes ?? []).map((node) => String(node.data.type ?? 'unknown')))].sort(), [query.data]);
  const adjacency = useMemo(() => matrixMap(query.data?.elements.edges ?? []), [query.data]);
  const nodes = useMemo(() => {
    const edges = query.data?.elements.edges ?? [];
    return (query.data?.elements.nodes ?? [])
      .filter((node) => type === 'all' || node.data.type === type)
      .filter((node) => viewMode === 'full' || degree(node, edges) > 0)
      .sort((a, b) => degree(b, edges) - degree(a, edges))
      .slice(0, 30);
  }, [query.data, type, viewMode]);
  const min = Number(minStrength);
  const filteredNodes = useMemo(() => nodes.filter((node) => nodes.some((other) => node.data.id !== other.data.id && (adjacency.get(edgeKey(node.data.id, other.data.id))?.count ?? 0) >= min)), [adjacency, min, nodes]);
  const matrixNodes = viewMode === 'full' ? nodes : filteredNodes;

  if (query.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-[34rem]" variant="chart" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data?.elements.edges.length) return <EmptyState title="No associations available" description="No graph edges are available to build the association matrix." />;
  if (!matrixNodes.length) return <div className="grid gap-6"><PageHeader title="Association Matrix" subtitle="Entity-to-entity relationship grid" /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 md:grid-cols-3"><Select value={type} onValueChange={setType} options={[{ label: 'All Entity Types', value: 'all' }, ...availableTypes.map((item) => ({ label: item, value: item }))]} /><Select value={minStrength} onValueChange={setMinStrength} options={[1, 2, 3].map((item) => ({ label: `Min Strength ${item}`, value: String(item) }))} /><Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} options={[{ label: 'Compact', value: 'compact' }, { label: 'Full Matrix', value: 'full' }]} /></section><EmptyState title="No associations match filters" description="Lower the minimum relationship strength or change entity type filters." /></div>;

  return <div className="grid gap-6"><PageHeader title="Association Matrix" subtitle="Entity-to-entity relationship grid" />
    <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 md:grid-cols-3"><Select value={type} onValueChange={setType} options={[{ label: 'All Entity Types', value: 'all' }, ...availableTypes.map((item) => ({ label: item, value: item }))]} /><Select value={minStrength} onValueChange={setMinStrength} options={[1, 2, 3].map((item) => ({ label: `Min Strength ${item}`, value: String(item) }))} /><Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} options={[{ label: 'Compact', value: 'compact' }, { label: 'Full Matrix', value: 'full' }]} /></section>
    <section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-bold"><Grid3X3 className="h-5 w-5 text-[var(--color-gold)]" /> Top {matrixNodes.length} Associated Entities</h2><p className="text-sm text-[var(--color-text-secondary)]">Click any relationship cell to inspect the linked pair.</p></div><div className="flex flex-wrap gap-2 text-xs"><Badge variant="red">perpetrator</Badge><Badge variant="cyan">victim_of</Badge><Badge variant="gold">associate</Badge><Badge variant="violet">other</Badge></div></div>
      <div className="overflow-auto"><div className="min-w-[1100px]" style={{ display: 'grid', gridTemplateColumns: `220px repeat(${matrixNodes.length}, 56px)` }}><div className="sticky left-0 top-0 z-20 border-b border-[var(--color-border)] bg-[#111827] p-2 text-xs font-semibold uppercase text-[var(--color-text-muted)]">Entity</div>{matrixNodes.map((node) => <div key={`head-${node.data.id}`} title={String(node.data.label ?? node.data.id)} className="border-b border-l border-[var(--color-border)] p-1 text-center text-[10px] text-[var(--color-text-muted)] [writing-mode:vertical-rl]">{String(node.data.label ?? node.data.id).slice(0, 18)}</div>)}{matrixNodes.map((row) => <div key={`row-${row.data.id}`} className="contents"><div className="sticky left-0 z-10 border-b border-[var(--color-border)] bg-[#111827] p-2"><p className="truncate text-sm font-semibold">{row.data.label ?? row.data.id}</p><Badge variant={typeVariant[String(row.data.type ?? '')] ?? 'muted'} className="mt-1 capitalize">{row.data.type ?? 'node'}</Badge></div>{matrixNodes.map((column) => { const edge = row.data.id === column.data.id ? undefined : adjacency.get(edgeKey(row.data.id, column.data.id)); const visible = edge && edge.count >= min; return <button key={`${row.data.id}-${column.data.id}`} title={visible ? `${row.data.label ?? row.data.id} ↔ ${column.data.label ?? column.data.id}: ${edge.count} ${edge.edge.data.label ?? 'links'}` : 'No relationship'} onClick={() => setSelected({ row, column, edge: visible ? edge : undefined })} className="grid h-14 place-items-center border-b border-l border-[var(--color-border)] text-xs font-bold transition hover:bg-white/10" style={{ color: visible ? 'white' : 'var(--color-text-muted)' }}>{row.data.id === column.data.id ? '—' : visible ? <span className="grid place-items-center rounded-full" style={{ width: 18 + edge.count * 4, height: 18 + edge.count * 4, backgroundColor: cellColor(edge) }}>{edge.count > 1 ? edge.count : ''}</span> : '·'}</button>; })}</div>)}</div></div>
    </section>
    {selected ? <section className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Selected Association</h2><p className="text-[var(--color-text-secondary)]">{selected.row.data.label ?? selected.row.data.id} ↔ {selected.column.data.label ?? selected.column.data.id}</p></div>{selected.edge ? <Badge variant="gold">{selected.edge.edge.data.label ?? 'linked'}</Badge> : <Badge variant="muted">No direct link</Badge>}</div>{selected.edge ? <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Relationship strength {selected.edge.count}; edge ID {selected.edge.edge.data.id}</p> : <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No direct graph edge is present for this pair.</p>}<Link to="/network"><Button className="mt-4" variant="secondary"><Eye className="h-4 w-4" /> View in Network</Button></Link></section> : null}
    <Link to="/network"><Button variant="secondary"><Network className="h-4 w-4" /> Open Full Network</Button></Link>
  </div>;
}

export default AssociationMatrixPage;
