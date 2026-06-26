import { AlertTriangle } from 'lucide-react';
import { GraphActionBar } from '@/features/intel-graph/components/GraphActionBar';
import { IntelGraphCanvas } from '@/features/intel-graph/components/IntelGraphCanvas';
import { IntelNodeEditor } from '@/features/intel-graph/components/IntelNodeEditor';
import { NodePalette } from '@/features/intel-graph/components/NodePalette';
import { ReportPreview } from '@/features/intel-graph/components/ReportPreview';
import { useGraphStore } from '@/stores/graphStore';

export function IntelGraphWorkspacePage() {
  const { selectedNodeId, nodes } = useGraphStore();

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-3">
      <GraphActionBar />
      {!nodes.length ? <div className="glass-card flex items-center gap-2 rounded-[var(--radius-xl)] p-3 text-sm text-[var(--color-text-secondary)]"><AlertTriangle className="h-4 w-4 text-[var(--color-gold)]" />Empty workspace — drag a node type from the palette or load a template to start.</div> : null}
      <div className="flex min-h-0 flex-1 gap-3">
        <NodePalette />
        <div className="flex-1 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)]">
          <IntelGraphCanvas />
        </div>
        {selectedNodeId ? <IntelNodeEditor /> : null}
      </div>
      <ReportPreview />
    </div>
  );
}

export default IntelGraphWorkspacePage;
