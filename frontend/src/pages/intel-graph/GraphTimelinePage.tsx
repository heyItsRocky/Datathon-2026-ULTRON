import { useState } from 'react';
import { RotateCcw, TimerReset } from 'lucide-react';
import { useGraphStore } from '@/stores/graphStore';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui-kit';

export function GraphTimelinePage() {
  const { history, restoreHistory } = useGraphStore();
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRestore = (id: string) => {
    try {
      restoreHistory(id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to restore graph snapshot');
    }
  };

  if (isLoading) return <LoadingSkeleton className="h-96" variant="chart" />;
  if (error) return <ErrorState message={error} onRetry={() => setError(null)} />;
  if (!history.length) return <div className="grid gap-6"><PageHeader title="Graph Timeline" subtitle="Review graph editing history and restore prior snapshots" /><EmptyState icon={TimerReset} title="No history yet" description="Start editing the graph in the workspace to create timeline snapshots." actionLabel="Open Workspace" onAction={() => window.location.assign('/intel-graph')} /></div>;

  return (
    <div className="grid gap-6">
      <PageHeader title="Graph Timeline" subtitle={`${history.length} saved graph snapshots`} />
      <section className="glass-card rounded-[var(--radius-2xl)] p-5">
        <div className="relative grid gap-4 border-l border-[var(--color-border)] pl-5">
          {history.map((entry) => <article key={entry.id} className="relative rounded-[var(--radius-xl)] bg-white/5 p-4"><span className="absolute -left-[1.72rem] top-5 h-3 w-3 rounded-full bg-[var(--color-gold)]" /><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{entry.label}</h3><p className="text-sm text-[var(--color-text-secondary)]">{new Date(entry.at).toLocaleString('en-IN')} · {entry.nodes.length} nodes · {entry.edges.length} edges</p></div><Button size="sm" variant="secondary" onClick={() => handleRestore(entry.id)}><RotateCcw className="h-4 w-4" />Restore</Button></div></article>)}
        </div>
      </section>
    </div>
  );
}

export default GraphTimelinePage;
