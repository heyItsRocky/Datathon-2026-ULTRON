import { useState } from 'react';
import { Download, FileText, FolderOpen, Save, Trash2, Upload } from 'lucide-react';
import { TEMPLATES } from '@/features/intel-graph/utils/templates';
import { exportGraph, importGraph } from '@/features/intel-graph/utils/graphExport';
import { useGraphStore } from '@/stores/graphStore';
import { Button } from '@/shared/ui-kit';

export function GraphActionBar() {
  const { graphName, setGraphName, nodes, edges, clearAll, loadTemplate, loadGraph } = useGraphStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    const blob = new Blob([exportGraph(nodes, edges, graphName)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${graphName.replace(/\s+/g, '_')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const result = importGraph(await file.text());
      if (!result) {
        setError('Invalid graph JSON file.');
        return;
      }
      setError(null);
      loadGraph(result.nodes, result.edges, result.graphName);
    };
    input.click();
  };

  const handleClear = () => {
    if (!nodes.length) return;
    if (window.confirm('Clear the entire graph? This cannot be undone.')) clearAll();
  };

  return (
    <div className="glass-card relative flex flex-wrap items-center gap-3 rounded-[var(--radius-xl)] p-3">
      <div className="flex min-w-[260px] flex-1 items-center gap-2">
        <FileText className="h-5 w-5 text-[var(--color-gold)]" />
        <input value={graphName} onChange={(event) => setGraphName(event.target.value)} className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none" />
      </div>
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--color-text-secondary)]">{nodes.length} nodes · {edges.length} edges</span>
      {error ? <span className="text-xs text-[var(--severity-extreme)]">{error}</span> : null}
      <Button variant="secondary" size="sm" onClick={() => setShowTemplates((value) => !value)}><FolderOpen className="h-4 w-4" />Templates</Button>
      <Button variant="secondary" size="sm" onClick={handleImport}><Upload className="h-4 w-4" />Import</Button>
      <Button variant="secondary" size="sm" onClick={handleExport}><Download className="h-4 w-4" />Export</Button>
      <Button variant="primary" size="sm" onClick={handleExport}><Save className="h-4 w-4" />Save</Button>
      <Button variant="danger" size="sm" onClick={handleClear} disabled={!nodes.length}><Trash2 className="h-4 w-4" />Clear</Button>
      {showTemplates ? <div className="absolute right-3 top-14 z-30 grid w-80 gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[#111827] p-3 shadow-xl">{TEMPLATES.map((template) => <button key={template.name} onClick={() => { loadTemplate(template); setShowTemplates(false); }} className="rounded-[var(--radius-lg)] p-3 text-left hover:bg-white/10"><span className="font-semibold text-[var(--color-text-primary)]">{template.name}</span><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{template.description}</p></button>)}</div> : null}
    </div>
  );
}
