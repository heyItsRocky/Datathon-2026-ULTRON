import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Boxes, Network, Orbit, Users } from 'lucide-react';
import { useCorrelationGraph } from '@/features/network/hooks/useCorrelationGraph';
import { useCrimeNetwork } from '@/features/network/hooks/useCrimeNetwork';
import { useCyberNetwork } from '@/features/network/hooks/useCyberNetwork';
import type { GraphData, GraphElement } from '@/shared/api/dto-adapters/network';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

type Mode = 'crime' | 'cyber' | 'correlation';
interface Cluster { id: string; nodes: GraphElement[]; edges: GraphElement[]; graph: GraphData }
const modes: Mode[] = ['crime', 'cyber', 'correlation'];
const colors = ['var(--color-network-purple)', 'var(--color-cyber-cyan)', 'var(--color-gold)', 'var(--color-crime-red)'];

function connectedComponents(graph: GraphData | undefined): Cluster[] {
  if (!graph) return [];
  const nodeById = new Map(graph.elements.nodes.map((node) => [node.data.id, node]));
  const adjacency = new Map<string, string[]>();
  graph.elements.nodes.forEach((node) => adjacency.set(node.data.id, []));
  graph.elements.edges.forEach((edge) => { const source = String(edge.data.source ?? ''); const target = String(edge.data.target ?? ''); if (adjacency.has(source) && adjacency.has(target)) { adjacency.get(source)?.push(target); adjacency.get(target)?.push(source); } });
  const visited = new Set<string>();
  const clusters: Cluster[] = [];
  graph.elements.nodes.forEach((node) => {
    if (visited.has(node.data.id)) return;
    const queue = [node.data.id]; visited.add(node.data.id); const ids = new Set<string>();
    while (queue.length) { const current = queue.shift(); if (!current) break; ids.add(current); (adjacency.get(current) ?? []).forEach((next) => { if (!visited.has(next)) { visited.add(next); queue.push(next); } }); }
    const nodes = [...ids].map((id) => nodeById.get(id)).filter((item): item is GraphElement => Boolean(item));
    const edges = graph.elements.edges.filter((edge) => ids.has(String(edge.data.source)) && ids.has(String(edge.data.target)));
    clusters.push({ id: `Cluster #${clusters.length + 1}`, nodes, edges, graph: { elements: { nodes, edges } } });
  });
  return clusters.sort((a, b) => b.nodes.length - a.nodes.length);
}

function breakdown(nodes: GraphElement[]): string {
  const counts = new Map<string, number>();
  nodes.forEach((node) => counts.set(String(node.data.type ?? 'unknown'), (counts.get(String(node.data.type ?? 'unknown')) ?? 0) + 1));
  return [...counts.entries()].map(([type, count]) => `${count} ${type}`).join(', ');
}

export function NetworkClustersPage() {
  const crime = useCrimeNetwork(); const cyber = useCyberNetwork(); const correlation = useCorrelationGraph();
  const [mode, setMode] = useState<Mode>('crime');
  const active = mode === 'crime' ? crime : mode === 'cyber' ? cyber : correlation;
  const clusters = useMemo(() => connectedComponents(active.data), [active.data]);
  const nonIsolated = clusters.filter((cluster) => cluster.edges.length > 0);
  const largest = clusters[0]?.nodes.length ?? 0;
  const avgSize = clusters.length ? Math.round(clusters.reduce((sum, cluster) => sum + cluster.nodes.length, 0) / clusters.length) : 0;
  const isolated = clusters.filter((cluster) => cluster.nodes.length === 1).length;
  const chartData = clusters.slice(0, 12).map((cluster, index) => ({ cluster: `C${index + 1}`, nodes: cluster.nodes.length }));

  if (active.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div><LoadingSkeleton className="h-80" variant="chart" /></div>;
  if (active.isError) return <ErrorState message={active.error.message} onRetry={() => void active.refetch()} />;
  if (!clusters.length) return <EmptyState title="No clusters discovered" description="No network communities are available for the selected domain." />;

  return <div className="grid gap-6"><PageHeader title="Network Clusters" subtitle="Automatically detected communities and groups" />
    <div className="flex flex-wrap gap-2">{modes.map((item) => <Button key={item} variant={mode === item ? 'primary' : 'secondary'} onClick={() => setMode(item)} className="capitalize">{item}</Button>)}</div>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Boxes} title="Total Clusters" value={clusters.length} trend={4} /><KpiCard icon={Network} title="Largest Cluster" value={largest} trend={2} /><KpiCard icon={Users} title="Avg Cluster Size" value={avgSize} trend={0} /><KpiCard icon={Orbit} title="Nodes in Isolation" value={isolated} trend={-3} /></section>
    <section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Cluster Size Distribution</h2><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="cluster" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8' }} allowDecimals={false} /><Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} /><Bar dataKey="nodes">{chartData.map((entry, index) => <Cell key={entry.cluster} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></section>
    {!nonIsolated.length ? <EmptyState title="Only isolated nodes found" description="No connected communities exist in this graph." /> : <section className="grid gap-4 xl:grid-cols-2">{nonIsolated.slice(0, 8).map((cluster) => <article key={cluster.id} className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">{cluster.id}</h2><Badge variant="violet">{cluster.nodes.length} nodes</Badge></div><div className="grid gap-3 text-sm md:grid-cols-2"><p><span className="text-[var(--color-text-muted)]">Edges:</span> {cluster.edges.length}</p><p><span className="text-[var(--color-text-muted)]">Types:</span> {breakdown(cluster.nodes)}</p></div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">Top entities: {cluster.nodes.slice(0, 3).map((node) => node.data.label ?? node.data.id).join(', ')}</p><div className="mt-4 h-64 rounded-[var(--radius-xl)] bg-black/20"><CytoscapeComponent elements={CytoscapeComponent.normalizeElements(cluster.graph.elements)} style={{ width: '100%', height: '100%' }} layout={{ name: 'cose', animate: false }} stylesheet={[{ selector: 'node', style: { label: 'data(label)', color: '#fff', 'font-size': 7, 'background-color': 'data(color)' } }, { selector: 'edge', style: { width: 2, 'line-color': '#6b7280', 'curve-style': 'bezier' } }]} /></div><Link to="/network"><Button className="mt-4" variant="secondary">Explore Cluster</Button></Link></article>)}</section>}
  </div>;
}

export default NetworkClustersPage;
