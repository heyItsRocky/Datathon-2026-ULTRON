import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { GitBranch, Network } from 'lucide-react';
import { useCorrelationGraph } from '@/features/network/hooks/useCorrelationGraph';
import { useCrimeNetwork } from '@/features/network/hooks/useCrimeNetwork';
import { useCyberNetwork } from '@/features/network/hooks/useCyberNetwork';
import type { GraphData, GraphElement } from '@/shared/api/dto-adapters/network';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button, SearchInput, Select } from '@/shared/ui-kit';

interface PathStep { from: GraphElement; edge: GraphElement; to: GraphElement }

function mergeGraphs(graphs: Array<GraphData | undefined>): GraphData {
  const nodes = new Map<string, GraphElement>();
  const edges = new Map<string, GraphElement>();
  graphs.forEach((graph) => { graph?.elements.nodes.forEach((node) => nodes.set(node.data.id, node)); graph?.elements.edges.forEach((edge) => edges.set(edge.data.id, edge)); });
  return { elements: { nodes: [...nodes.values()], edges: [...edges.values()] } };
}

function shortestPath(graph: GraphData, source: string, target: string): PathStep[] {
  if (!source || !target || source === target) return [];
  const nodeById = new Map(graph.elements.nodes.map((node) => [node.data.id, node]));
  const adjacency = new Map<string, Array<{ next: string; edge: GraphElement }>>();
  graph.elements.edges.forEach((edge) => { const a = String(edge.data.source ?? ''); const b = String(edge.data.target ?? ''); if (!a || !b) return; adjacency.set(a, [...(adjacency.get(a) ?? []), { next: b, edge }]); adjacency.set(b, [...(adjacency.get(b) ?? []), { next: a, edge }]); });
  const queue = [source];
  const seen = new Set([source]);
  const parent = new Map<string, { previous: string; edge: GraphElement }>();
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    if (current === target) break;
    (adjacency.get(current) ?? []).forEach(({ next, edge }) => { if (!seen.has(next)) { seen.add(next); parent.set(next, { previous: current, edge }); queue.push(next); } });
  }
  if (!parent.has(target)) return [];
  const steps: PathStep[] = [];
  let cursor = target;
  while (cursor !== source) {
    const item = parent.get(cursor);
    if (!item) return [];
    const from = nodeById.get(item.previous); const to = nodeById.get(cursor);
    if (!from || !to) return [];
    steps.unshift({ from, edge: item.edge, to });
    cursor = item.previous;
  }
  return steps;
}

function pathGraph(steps: PathStep[]): GraphData {
  const nodes = new Map<string, GraphElement>();
  const edges = new Map<string, GraphElement>();
  steps.forEach((step) => { nodes.set(step.from.data.id, step.from); nodes.set(step.to.data.id, step.to); edges.set(step.edge.data.id, step.edge); });
  return { elements: { nodes: [...nodes.values()], edges: [...edges.values()] } };
}

export function LinkAnalysisPage() {
  const crime = useCrimeNetwork(); const cyber = useCyberNetwork(); const correlation = useCorrelationGraph();
  const [sourceQuery, setSourceQuery] = useState(''); const [targetQuery, setTargetQuery] = useState(''); const [source, setSource] = useState(''); const [target, setTarget] = useState(''); const [analyzed, setAnalyzed] = useState(false);
  const graph = useMemo(() => mergeGraphs([crime.data, cyber.data, correlation.data]), [correlation.data, crime.data, cyber.data]);
  const nodeOptions = useMemo(() => graph.elements.nodes.map((node) => ({ label: `${node.data.label ?? node.data.id} · ${node.data.type ?? 'node'}`, value: node.data.id })).slice(0, 240), [graph]);
  const filteredSource = nodeOptions.filter((item) => item.label.toLowerCase().includes(sourceQuery.toLowerCase())).slice(0, 18);
  const filteredTarget = nodeOptions.filter((item) => item.label.toLowerCase().includes(targetQuery.toLowerCase())).slice(0, 18);
  const steps = useMemo(() => analyzed ? shortestPath(graph, source, target) : [], [analyzed, graph, source, target]);
  const miniGraph = useMemo(() => pathGraph(steps), [steps]);
  const domainsCrossed = new Set(steps.flatMap((step) => [String(step.from.data.type ?? ''), String(step.to.data.type ?? '')]).map((type) => ['ip', 'domain', 'server'].includes(type) ? 'cyber' : 'crime')).size;

  if (crime.isLoading || cyber.isLoading || correlation.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-[28rem]" variant="chart" /></div>;
  if (crime.isError) return <ErrorState message={crime.error.message} onRetry={() => void crime.refetch()} />;
  if (cyber.isError) return <ErrorState message={cyber.error.message} onRetry={() => void cyber.refetch()} />;
  if (correlation.isError) return <ErrorState message={correlation.error.message} onRetry={() => void correlation.refetch()} />;
  if (!graph.elements.nodes.length) return <EmptyState title="No graph data" description="No network nodes are available for link analysis." />;

  return <div className="grid gap-6"><PageHeader title="Link Analysis" subtitle="Trace connections between entities" />
    <section className="glass-card grid gap-4 rounded-[var(--radius-2xl)] p-4 xl:grid-cols-[1fr_1fr_140px]"><div><SearchInput value={sourceQuery} onChange={(event) => setSourceQuery(event.target.value)} placeholder="Search source entity" /><Select value={source} onValueChange={setSource} options={filteredSource.length ? filteredSource : nodeOptions.slice(0, 20)} placeholder="Source Entity" /></div><div><SearchInput value={targetQuery} onChange={(event) => setTargetQuery(event.target.value)} placeholder="Search target entity" /><Select value={target} onValueChange={setTarget} options={filteredTarget.length ? filteredTarget : nodeOptions.slice(0, 20)} placeholder="Target Entity" /></div><Button disabled={!source || !target || source === target} onClick={() => setAnalyzed(true)}><GitBranch className="h-4 w-4" /> Analyze</Button></section>
    {analyzed && !steps.length ? <EmptyState title="No path found" description="No link exists between the selected entities in the current graph set." /> : null}
    {steps.length ? <><section className="grid gap-4 md:grid-cols-3"><div className="glass-card rounded-[var(--radius-xl)] p-4"><p className="text-sm text-[var(--color-text-secondary)]">Path Length</p><b className="text-3xl text-[var(--color-gold)]">{steps.length}</b></div><div className="glass-card rounded-[var(--radius-xl)] p-4"><p className="text-sm text-[var(--color-text-secondary)]">Intermediaries</p><b className="text-3xl text-[var(--color-gold)]">{Math.max(0, steps.length - 1)}</b></div><div className="glass-card rounded-[var(--radius-xl)] p-4"><p className="text-sm text-[var(--color-text-secondary)]">Domains Crossed</p><b className="text-3xl text-[var(--color-gold)]">{domainsCrossed}</b></div></section><section className="grid gap-6 xl:grid-cols-[2fr_1fr]"><div className="glass-card h-[30rem] rounded-[var(--radius-2xl)] p-2"><CytoscapeComponent elements={CytoscapeComponent.normalizeElements(miniGraph.elements)} style={{ width: '100%', height: '100%' }} layout={{ name: 'breadthfirst', directed: true }} stylesheet={[{ selector: 'node', style: { label: 'data(label)', color: '#fff', 'font-size': 9, 'background-color': 'data(color)' } }, { selector: 'edge', style: { label: 'data(label)', color: '#cbd5e1', width: 4, 'line-color': '#f0b000', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#f0b000', 'curve-style': 'bezier' } }]} /></div><aside className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Path Steps</h2><ol className="mt-4 space-y-3">{steps.map((step, index) => <li key={step.edge.data.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3"><p className="text-xs text-[var(--color-text-muted)]">Hop {index + 1}</p><p className="font-semibold">{step.from.data.label ?? step.from.data.id}</p><Badge variant="gold">{step.edge.data.label ?? 'linked_to'}</Badge><p className="mt-1 font-semibold">{step.to.data.label ?? step.to.data.id}</p></li>)}</ol><Link to="/network"><Button className="mt-4" variant="secondary"><Network className="h-4 w-4" /> View Full Network</Button></Link></aside></section></> : null}
  </div>;
}

export default LinkAnalysisPage;
