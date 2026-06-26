import { useEffect, useState } from 'react';
import { Save, Trash2, X } from 'lucide-react';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';
import { useGraphStore, type IntelNodeData } from '@/stores/graphStore';
import { Button, Select } from '@/shared/ui-kit';

const riskOptions = ['low', 'medium', 'high', 'extreme'].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }));

export function IntelNodeEditor() {
  const { nodes, selectedNodeId, selectNode, updateNodeData, removeNode, getConnectedNodes } = useGraphStore();
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const [formData, setFormData] = useState<IntelNodeData | null>(null);

  useEffect(() => setFormData(selectedNode ? { ...selectedNode.data } : null), [selectedNode]);

  if (!selectedNode || !formData) return null;

  const config = NODE_TYPE_CONFIGS[selectedNode.data.type];
  const Icon = config.icon;
  const connected = getConnectedNodes(selectedNode.id);

  const handleDelete = () => {
    if (window.confirm(`Delete ${selectedNode.data.label}?`)) removeNode(selectedNode.id);
  };

  return (
    <aside className="glass-card flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto rounded-[var(--radius-xl)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Icon size={18} style={{ color: config.color }} /><h3 className="font-semibold text-[var(--color-text-primary)]">Edit {config.label}</h3></div>
        <button onClick={() => selectNode(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"><X size={18} /></button>
      </div>
      <label className="grid gap-1 text-xs text-[var(--color-text-muted)]">Label<input className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.label} onChange={(event) => setFormData({ ...formData, label: event.target.value })} /></label>
      <label className="grid gap-1 text-xs text-[var(--color-text-muted)]">Description<textarea className="h-24 resize-none rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.description ?? ''} onChange={(event) => setFormData({ ...formData, description: event.target.value })} /></label>
      <label className="grid gap-2 text-xs text-[var(--color-text-muted)]">Confidence (%)<input type="range" min={0} max={100} value={formData.confidence ?? 50} onChange={(event) => setFormData({ ...formData, confidence: Number(event.target.value) })} /><span className="text-right text-[var(--color-text-secondary)]">{formData.confidence ?? 50}%</span></label>
      <label className="grid gap-1 text-xs text-[var(--color-text-muted)]">Source<input className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none" value={formData.source ?? ''} onChange={(event) => setFormData({ ...formData, source: event.target.value })} /></label>
      <div className="grid gap-1 text-xs text-[var(--color-text-muted)]"><span>Risk Level</span><Select value={formData.riskLevel ?? 'medium'} onValueChange={(riskLevel) => setFormData({ ...formData, riskLevel: riskLevel as IntelNodeData['riskLevel'] })} options={riskOptions} /></div>
      <div className="rounded-[var(--radius-lg)] bg-white/5 p-3"><p className="text-xs uppercase text-[var(--color-text-muted)]">Connected nodes</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{connected.length ? connected.map((node) => node.data.label).join(', ') : 'No direct connections yet.'}</p></div>
      <Button onClick={() => updateNodeData(selectedNode.id, formData)}><Save className="h-4 w-4" />Save Changes</Button>
      <Button variant="danger" onClick={handleDelete}><Trash2 className="h-4 w-4" />Delete Node</Button>
    </aside>
  );
}
