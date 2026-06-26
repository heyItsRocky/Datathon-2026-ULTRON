import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Network, WandSparkles } from 'lucide-react';
import { TEMPLATES } from '@/features/intel-graph/utils/templates';
import { useGraphStore, type GraphTemplate } from '@/stores/graphStore';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Button, Badge } from '@/shared/ui-kit';

export function GraphBuilderPage() {
  const navigate = useNavigate();
  const { loadTemplate, clearAll, addNode } = useGraphStore();
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const templates = useMemo(() => TEMPLATES, []);

  const handleLoadTemplate = (template: GraphTemplate) => {
    try {
      loadTemplate(template);
      navigate('/intel-graph');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load template');
    }
  };

  const handleBlank = () => {
    clearAll();
    addNode('person', { x: 120, y: 140 }, { label: 'Primary Subject', description: 'Start your investigation here.' });
    navigate('/intel-graph');
  };

  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div></div>;
  if (error) return <ErrorState message={error} onRetry={() => setError(null)} />;
  if (!templates.length) return <EmptyState title="No graph templates" description="Template library is empty. Start from a blank graph in the workspace." />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Graph Builder" subtitle="Start from a template or build a blank intel graph" />
      <section className="glass-card rounded-[var(--radius-2xl)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Quick start</h2><p className="text-sm text-[var(--color-text-secondary)]">Load a structured investigation template or create an empty canvas.</p></div><Button onClick={handleBlank}><FilePlus2 className="h-4 w-4" />Start Blank Graph</Button></div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => <article key={template.name} className="glass-card flex flex-col gap-3 rounded-[var(--radius-2xl)] p-5"><div className="flex items-start justify-between gap-3"><WandSparkles className="h-6 w-6 text-[var(--color-gold)]" /><Badge variant="violet">Template</Badge></div><h3 className="text-lg font-bold">{template.name}</h3><p className="min-h-14 text-sm text-[var(--color-text-secondary)]">{template.description}</p><p className="text-xs text-[var(--color-text-muted)]">{template.nodes.length} nodes · {template.edges.length} edges</p><Button className="mt-auto" onClick={() => handleLoadTemplate(template)}><Network className="h-4 w-4" />Open Template</Button></article>)}
      </section>
    </div>
  );
}

export default GraphBuilderPage;
