import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';
import { NodePaletteItem } from './NodePaletteItem';

export function NodePalette() {
  return (
    <aside className="glass-card flex w-[190px] shrink-0 flex-col gap-1 rounded-[var(--radius-xl)] p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Node Types</h3>
      {Object.values(NODE_TYPE_CONFIGS).map((config) => <NodePaletteItem key={config.type} config={config} />)}
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">Drag nodes onto the canvas, then connect handles to build an investigation graph.</p>
    </aside>
  );
}
