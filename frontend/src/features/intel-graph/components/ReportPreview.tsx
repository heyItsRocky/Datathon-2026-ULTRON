import { NODE_TYPE_CONFIGS, isIntelNodeType } from '@/features/intel-graph/config/nodeTypes';
import { useGraphStore } from '@/stores/graphStore';

export function ReportPreview() {
  const { nodes, edges, graphName } = useGraphStore();
  if (!nodes.length) return <div className="glass-card rounded-[var(--radius-xl)] p-3 text-sm text-[var(--color-text-muted)]">Add nodes to the canvas to generate a report preview.</div>;
  const counts = nodes.reduce<Record<string, number>>((acc, node) => ({ ...acc, [node.data.type]: (acc[node.data.type] ?? 0) + 1 }), {});
  const summary = Object.entries(counts).map(([type, count]) => `${count} ${isIntelNodeType(type) ? NODE_TYPE_CONFIGS[type].label : type}${count > 1 ? 's' : ''}`).join(', ');
  return <div className="glass-card rounded-[var(--radius-xl)] p-3 text-sm"><h4 className="mb-1 font-semibold text-[var(--color-text-primary)]">{graphName} — Summary</h4><p className="text-[var(--color-text-secondary)]">Investigation graph with {nodes.length} entities and {edges.length} connections. {summary}.</p></div>;
}
