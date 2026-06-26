# HELLCAT — PHASE 7 INTEL GRAPH WORKSPACE PROMPT

> Build the interactive Intel Graph investigation workspace — a React Flow drag-and-drop graph editor for investigators.
> Phase: 7 of 10 | Focus: Interactive graph workspace (no data fetching, all client-side state)

---

## 0. CONTEXT

Phases 0–6 are complete. This phase is **greenfield** — nothing exists yet except 4 stub pages and routes.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### What Already Exists

| Item | Status |
|------|--------|
| Routes `/intel-graph`, `/intel-graph/builder`, `/intel-graph/search`, `/intel-graph/timeline` | ✅ Registered |
| Stub pages at `src/pages/intel-graph/*.tsx` | ✅ 2-line stubs |
| `shared/components/` — PageHeader, LoadingSkeleton, EmptyState, ErrorState, KpiCard, StatusBadge, Badge, Modal, Drawer | ✅ Available |
| Design tokens (CSS variables) | ✅ Available |
| Zustand stores | ✅ Available |
| Shared dark theme globals | ✅ Available |

### What Must Be Built

| # | Item | Type | Description |
|:-:|------|------|-------------|
| 1 | `@xyflow/react` | Dependency | React Flow v12 for interactive graph canvas |
| 2 | `stores/graphStore.ts` | Store | Zustand store for all graph state |
| 3 | `features/intel-graph/` | Directory | All intel-graph components, config, utils |
| 4 | `features/intel-graph/config/nodeTypes.ts` | Config | 7 node type definitions |
| 5 | `features/intel-graph/config/edgeConfig.ts` | Config | Edge appearance config |
| 6 | `features/intel-graph/components/IntelGraphCanvas.tsx` | Component | React Flow canvas wrapper |
| 7 | `features/intel-graph/components/NodePalette.tsx` | Component | Draggable palette sidebar |
| 8 | `features/intel-graph/components/NodePaletteItem.tsx` | Component | Individual palette item |
| 9 | `features/intel-graph/components/nodes/*.tsx` | 7 Components | Custom node renderers (1 per type) |
| 10 | `features/intel-graph/components/GraphActionBar.tsx` | Component | Top toolbar |
| 11 | `features/intel-graph/components/IntelNodeEditor.tsx` | Component | Right slide-in panel |
| 12 | `features/intel-graph/components/ReportPreview.tsx` | Component | Bottom bar |
| 13 | `features/intel-graph/utils/graphExport.ts` | Util | Export/import JSON |
| 14 | `features/intel-graph/utils/templates.ts` | Util | Pre-built templates |
| 15 | `src/pages/intel-graph/IntelGraphWorkspacePage.tsx` | Page | Main workspace (replaces stub) |
| 16 | `src/pages/intel-graph/GraphBuilderPage.tsx` | Page | Auto-graph builder (replaces stub) |
| 17 | `src/pages/intel-graph/GraphSearchPage.tsx` | Page | Search entities (replaces stub) |
| 18 | `src/pages/intel-graph/GraphTimelinePage.tsx` | Page | Timeline view (replaces stub) |

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/*`, `stores/*` (except graphStore.ts — create it) |
| **Do NOT modify** | routes.tsx, any completed pages from phases 0–6, any mock files |
| **No new design tokens** | CSS variables only. Dark theme inherited. React Flow canvas uses inline styles for background grid |
| **No data fetching** | Phase 7 is client-side only. No API calls, no mock endpoints, no React Query |
| **No new dependencies except** | `@xyflow/react` (React Flow v12). Install via `npm install @xyflow/react` |
| **Named exports** for all components and hooks |
| **TypeScript strict** | No `any` — proper types throughout |
| **All 4 states** on every page | Loading → Empty(initial) → Populated → Error (if applicable) |
| **Lucide icons** for all node type icons and UI icons |

---

## 2. BUILD ORDER — 10 Steps

---

### STEP 1: Install Dependency

```bash
cd D:\Datathon-2026-ULTRON\frontend
npm install @xyflow/react
```

Verify it resolves. `@xyflow/react` is React Flow v12 with TypeScript types included.

---

### STEP 2: Create Directory Structure

```
src/features/intel-graph/
├── config/
│   ├── nodeTypes.ts
│   └── edgeConfig.ts
├── components/
│   ├── IntelGraphCanvas.tsx
│   ├── NodePalette.tsx
│   ├── NodePaletteItem.tsx
│   ├── GraphActionBar.tsx
│   ├── IntelNodeEditor.tsx
│   └── ReportPreview.tsx
├── components/nodes/
│   ├── PersonNode.tsx
│   ├── IpAddressNode.tsx
│   ├── LocationNode.tsx
│   ├── EvidenceNode.tsx
│   ├── MethodNode.tsx
│   ├── MotiveNode.tsx
│   └── CrimeTypeNode.tsx
└── utils/
    ├── graphExport.ts
    └── templates.ts
```

---

### STEP 3: Create `stores/graphStore.ts`

**Zustand store** managing all graph state. Full CRUD on nodes and edges.

```ts
import { create } from 'zustand';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

// Types
export type IntelNodeType = 'person' | 'ipAddress' | 'location' | 'evidence' | 'method' | 'motive' | 'crimeType';

export interface IntelNodeData {
  label: string;
  type: IntelNodeType;
  description?: string;
  confidence?: number;    // 0-100
  source?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
  [key: string]: unknown;
}

export type IntelNode = Node<IntelNodeData>;
export type IntelEdge = Edge;

export interface GraphTemplate {
  name: string;
  description: string;
  nodes: IntelNode[];
  edges: IntelEdge[];
}

interface GraphState {
  // Graph data
  nodes: IntelNode[];
  edges: IntelEdge[];
  graphName: string;

  // Selection
  selectedNodeId: string | null;

  // History for undo?
  history: Array<{ nodes: IntelNode[]; edges: IntelEdge[] }>;

  // Actions — CRUD
  setGraphName: (name: string) => void;
  onNodesChange: OnNodesChange<IntelNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: IntelNodeType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateNodeData: (id: string, data: Partial<IntelNodeData>) => void;
  selectNode: (id: string | null) => void;

  // Bulk
  clearAll: () => void;
  loadTemplate: (template: GraphTemplate) => void;
  pushHistory: () => void;

  // Derived
  getConnectedNodes: (nodeId: string) => IntelNode[];
}
```

Implement all actions with type safety. `addNode` creates a node with:
- Unique ID (crypto.randomUUID() or Date.now().toString())
- Default position
- Correct type and empty data based on IntelNodeType
- A fresh node with placeholder label "New {Type}"

`selectNode` updates `selectedNodeId`. `updateNodeData` finds the node and patches its data.

`pushHistory` pushes current state. Max 50 history entries.

**Initialize with empty nodes+edges and "Untitled Investigation" as graphName.**

---

### STEP 4: Create `features/intel-graph/config/nodeTypes.ts`

Define 7 node types:

| Type | Label | Color | Icon (Lucide) | Default Label |
|------|-------|-------|---------------|---------------|
| `person` | Person | `#3b82f6` (blue-500) | `User` | "New Person" |
| `ipAddress` | IP Address | `#8b5cf6` (violet-500) | `Globe` | "New IP Address" |
| `location` | Location | `#10b981` (emerald-500) | `MapPin` | "New Location" |
| `evidence` | Evidence | `#f59e0b` (amber-500) | `FileSearch` | "New Evidence" |
| `method` | Method | `#ef4444` (red-500) | `Crosshair` | "New Method" |
| `motive` | Motive | `#ec4899` (pink-500) | `Heart` | "New Motive" |
| `crimeType` | Crime Type | `#f97316` (orange-500) | `Siren` | "New Crime Type" |

Export `IntelNodeTypeConfig` interface and a `NODE_TYPE_CONFIGS: Record<IntelNodeType, IntelNodeTypeConfig>` map.

---

### STEP 5: Create `features/intel-graph/config/edgeConfig.ts`

Edge styling:
- Default: `#555` with animated dashes for selected
- Width: 2px
- Selected: `var(--color-gold)` with 3px width
- Marker end arrow (default React Flow)
- Animated: false (or true for selected)

Export default edge options for `useEdge` or `EdgeProps`.

---

### STEP 6: Create Custom Node Components (7 files)

Each in `features/intel-graph/components/nodes/`. They all follow the same pattern:

```tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { IntelNodeData } from '@/stores/graphStore';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';

function PersonNode({ data, selected }: NodeProps<IntelNodeData>) {
  const config = NODE_TYPE_CONFIGS[data.type];
  return (
    <div className={`px-4 py-3 rounded-[var(--radius-lg)] border-2 min-w-[140px] ${selected ? 'border-[var(--color-gold)]' : 'border-transparent'} bg-[#1a1a2e] shadow-lg`}
         style={{ borderLeftColor: config.color, borderLeftWidth: '4px' }}>
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-text-muted)]" />
      <div className="flex items-center gap-2">
        <config.icon size={16} style={{ color: config.color }} />
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate max-w-[200px]">{data.description}</p>
      )}
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-text-muted)]" />
    </div>
  );
}

export default memo(PersonNode);
```

All 7 nodes are identical in structure — only the icon and color change via `NODE_TYPE_CONFIGS[data.type]`. Use one generic pattern for all.

Create a barrel export at `features/intel-graph/components/nodes/index.ts`:
```ts
export { default as PersonNode } from './PersonNode';
export { default as IpAddressNode } from './IpAddressNode';
export { default as LocationNode } from './LocationNode';
export { default as EvidenceNode } from './EvidenceNode';
export { default as MethodNode } from './MethodNode';
export { default as MotiveNode } from './MotiveNode';
export { default as CrimeTypeNode } from './CrimeTypeNode';
```

---

### STEP 7: Create Shared Graph Components (6 files)

#### `IntelGraphCanvas.tsx`

React Flow wrapper. Takes the store's nodes/edges and change handlers. Registers custom node types via `nodeTypes` prop.

```tsx
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '@/stores/graphStore';
import * as CustomNodes from './nodes';

export function IntelGraphCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } = useGraphStore();

  const nodeTypes: NodeTypes = useMemo(() => ({
    person: CustomNodes.PersonNode,
    ipAddress: CustomNodes.IpAddressNode,
    location: CustomNodes.LocationNode,
    evidence: CustomNodes.EvidenceNode,
    method: CustomNodes.MethodNode,
    motive: CustomNodes.MotiveNode,
    crimeType: CustomNodes.CrimeTypeNode,
  }), []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    selectNode(node.id);
  }, [selectNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={() => selectNode(null)}
      nodeTypes={nodeTypes}
      fitView
      colorMode="dark"
      className="bg-[#0f0f1a]"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
      <Controls className="!bg-[#1a1a2e] !border-[var(--color-border)] !rounded-[var(--radius-lg)]" />
      <MiniMap
        nodeColor={(n) => {
          const colors: Record<string, string> = {
            person: '#3b82f6', ipAddress: '#8b5cf6', location: '#10b981',
            evidence: '#f59e0b', method: '#ef4444', motive: '#ec4899', crimeType: '#f97316',
          };
          return colors[n.type || 'person'] || '#555';
        }}
        maskColor="rgba(0,0,0,0.6)"
        className="!border-[var(--color-border)]"
      />
    </ReactFlow>
  );
}
```

#### `NodePalette.tsx`

Left sidebar showing draggable node types.

```tsx
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';
import { NodePaletteItem } from './NodePaletteItem';

export function NodePalette() {
  return (
    <aside className="glass-card rounded-[var(--radius-xl)] p-3 w-[180px] shrink-0 flex flex-col gap-1">
      <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Node Types</h3>
      {Object.values(NODE_TYPE_CONFIGS).map((config) => (
        <NodePaletteItem key={config.type} config={config} />
      ))}
    </aside>
  );
}
```

#### `NodePaletteItem.tsx`

```tsx
import { type DragEvent } from 'react';
import type { IntelNodeTypeConfig } from '@/features/intel-graph/config/nodeTypes';

interface Props { config: IntelNodeTypeConfig }

export function NodePaletteItem({ config }: Props) {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', config.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
    >
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
      <config.icon size={14} style={{ color: config.color }} />
      <span className="text-sm text-[var(--color-text-secondary)]">{config.label}</span>
    </div>
  );
}
```

#### `GraphActionBar.tsx`

Top toolbar with graph name, node/edge count, and action buttons.

```tsx
import { useState } from 'react';
import { Save, Download, Upload, Trash2, FileText } from 'lucide-react';
import { useGraphStore } from '@/stores/graphStore';
import { exportGraph, importGraph } from '@/features/intel-graph/utils/graphExport';
import { TEMPLATES } from '@/features/intel-graph/utils/templates';

export function GraphActionBar() {
  const { graphName, setGraphName, nodes, edges, clearAll, loadTemplate, pushHistory } = useGraphStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleExport = () => {
    const json = exportGraph(nodes, edges, graphName);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${graphName.replace(/\s+/g, '_')}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = importGraph(text);
      if (result) {
        pushHistory();
        // Load into store — needs setNodes, setEdges, setGraphName actions
        // Or we destructure and call loadTemplate-like logic
        useGraphStore.setState({ nodes: result.nodes, edges: result.edges, graphName: result.graphName || graphName });
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (nodes.length === 0) return;
    if (window.confirm('Clear the entire graph? This cannot be undone.')) {
      clearAll();
    }
  };

  // ... render toolbar with buttons
}
```

Full implementation with Save (export JSON), Load (import JSON), Clear, and template dropdown. Display node/edge count and editable graph name.

#### `IntelNodeEditor.tsx`

Right panel — slide-in when a node is selected. Shows dynamic form based on node type.

```tsx
import { useEffect, useState, useCallback } from 'react';
import { X, Save } from 'lucide-react';
import { useGraphStore, type IntelNodeData } from '@/stores/graphStore';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';

export function IntelNodeEditor() {
  const { nodes, selectedNodeId, selectNode, updateNodeData } = useGraphStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [formData, setFormData] = useState<IntelNodeData | null>(null);

  useEffect(() => {
    if (selectedNode) setFormData({ ...selectedNode.data });
    else setFormData(null);
  }, [selectedNode]);

  const handleSave = useCallback(() => {
    if (selectedNodeId && formData) {
      updateNodeData(selectedNodeId, formData);
    }
  }, [selectedNodeId, formData, updateNodeData]);

  if (!selectedNode || !formData) return null;

  const config = NODE_TYPE_CONFIGS[selectedNode.data.type];

  return (
    <aside className="glass-card rounded-[var(--radius-xl)] p-4 w-[300px] shrink-0 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <config.icon size={18} style={{ color: config.color }} />
          <h3 className="font-semibold text-[var(--color-text-primary)]">Edit {config.label}</h3>
        </div>
        <button onClick={() => selectNode(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          <X size={18} />
        </button>
      </div>

      {/* Label field */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)]">Label</label>
        <input
          className="bg-white/5 border border-[var(--color-border)] rounded-[var(--radius-lg)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
      </div>

      {/* Description field */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)]">Description</label>
        <textarea
          className="bg-white/5 border border-[var(--color-border)] rounded-[var(--radius-lg)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Confidence field */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)]">Confidence (%)</label>
        <input
          type="range" min={0} max={100}
          className="w-full"
          value={formData.confidence ?? 50}
          onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
        />
        <span className="text-xs text-[var(--color-text-muted)] text-right">{formData.confidence ?? 50}%</span>
      </div>

      {/* Source field */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)]">Source</label>
        <input
          className="bg-white/5 border border-[var(--color-border)] rounded-[var(--radius-lg)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          value={formData.source || ''}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
        />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center justify-center gap-2 bg-[var(--color-gold)] text-black font-semibold rounded-[var(--radius-lg)] py-2 hover:opacity-90 transition-opacity"
      >
        <Save size={16} />
        Save Changes
      </button>
    </aside>
  );
}
```

#### `ReportPreview.tsx`

Bottom bar — auto-generated text summary of the graph.

```tsx
import { useGraphStore } from '@/stores/graphStore';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';

export function ReportPreview() {
  const { nodes, edges, graphName } = useGraphStore();

  if (nodes.length === 0) return (
    <div className="glass-card rounded-[var(--radius-xl)] p-3 text-sm text-[var(--color-text-muted)]">
      Add nodes to the canvas to generate a report preview.
    </div>
  );

  const counts: Record<string, number> = {};
  nodes.forEach((n) => {
    counts[n.data.type] = (counts[n.data.type] || 0) + 1;
  });

  return (
    <div className="glass-card rounded-[var(--radius-xl)] p-3 text-sm">
      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">{graphName} — Summary</h4>
      <p className="text-[var(--color-text-secondary)]">
        Investigation graph with {nodes.length} entities and {edges.length} connections.
        {' '}
        {Object.entries(counts).map(([type, count]) => (
          `${count} ${NODE_TYPE_CONFIGS[type]?.label || type}${count > 1 ? 's' : ''}`
        ).join(', ')}.
      </p>
    </div>
  );
}
```

---

### STEP 8: Create Utility Files

#### `features/intel-graph/utils/graphExport.ts`

```ts
import type { IntelNode, IntelEdge } from '@/stores/graphStore';

interface GraphJSON {
  graphName: string;
  version: '1.0';
  nodes: IntelNode[];
  edges: IntelEdge[];
}

export function exportGraph(nodes: IntelNode[], edges: IntelEdge[], graphName: string): string {
  const data: GraphJSON = { graphName, version: '1.0', nodes, edges };
  return JSON.stringify(data, null, 2);
}

export function importGraph(json: string): GraphJSON | null {
  try {
    const data = JSON.parse(json) as GraphJSON;
    if (!data.nodes || !data.edges || !data.version) return null;
    return data;
  } catch {
    return null;
  }
}
```

#### `features/intel-graph/utils/templates.ts`

2–3 pre-built investigation templates:

1. **"Phishing Investigation"** — IP Address → Method (Phishing) → Evidence (Email log) → Person (Suspect)
2. **"Burglary Case"** — Person → Location (address) → Evidence (fingerprint) → Crime Type (Burglary)
3. **"Cyber Attack"** — IP Address → Method (DDoS) → Motive (Financial) → Evidence (Server logs)

Each is a `GraphTemplate` object with ~3-5 nodes and 2-4 edges per template, using realistic mock labels.

---

### STEP 9: Drag-to-Add Logic for Canvas

The `IntelGraphCanvas` needs to handle `onDrop` and `onDragOver` to support dragging from `NodePalette`.

Add these to the canvas component:

```tsx
const onDragOver = useCallback((event: React.DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}, []);

const onDrop = useCallback((event: React.DragEvent) => {
  event.preventDefault();
  const type = event.dataTransfer.getData('application/reactflow') as IntelNodeType;
  if (!type || !NODE_TYPE_CONFIGS[type]) return;

  const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
  if (!bounds) return;

  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  pushHistory();
  addNode(type, position);
}, [reactFlowInstance]);
```

Use `useReactFlow()` hook to get `screenToFlowPosition` and `reactFlowInstance`.

---

### STEP 10: Wire Up Pages (4 files — replace stubs)

#### `IntelGraphWorkspacePage.tsx` — MAIN PAGE

```tsx
import { useGraphStore } from '@/stores/graphStore';
import { IntelGraphCanvas } from '@/features/intel-graph/components/IntelGraphCanvas';
import { NodePalette } from '@/features/intel-graph/components/NodePalette';
import { IntelNodeEditor } from '@/features/intel-graph/components/IntelNodeEditor';
import { GraphActionBar } from '@/features/intel-graph/components/GraphActionBar';
import { ReportPreview } from '@/features/intel-graph/components/ReportPreview';

export default function IntelGraphWorkspacePage() {
  const { selectedNodeId, nodes } = useGraphStore();

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      <GraphActionBar />
      <div className="flex flex-1 gap-3 min-h-0">
        <NodePalette />
        <div className="flex-1 rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--color-border)]">
          <IntelGraphCanvas />
        </div>
        {selectedNodeId && <IntelNodeEditor />}
      </div>
      <ReportPreview />
    </div>
  );
}
```

#### `GraphBuilderPage.tsx`

A page that uses the existing graph store to quickly build a graph. Shows pre-built templates and lets the user load one, then opens the workspace.

```tsx
import { useNavigate } from 'react-router-dom';
import { useGraphStore } from '@/stores/graphStore';
import { TEMPLATES } from '@/features/intel-graph/utils/templates';
import { PageHeader, LoadingSkeleton, EmptyState } from '@/shared/components';

export default function GraphBuilderPage() {
  const navigate = useNavigate();
  const { loadTemplate, clearAll } = useGraphStore();
  const [loading] = useState(false);

  const handleLoadTemplate = (template: typeof TEMPLATES[0]) => {
    clearAll();
    loadTemplate(template);
    navigate('/intel-graph');
  };

  // Show template cards — each shows name, description, node/edge count, and "Open Template" button
  // Loading → Empty (no templates) → populated grid
  return (
    <div className="flex flex-col gap-4 p-4">
      <PageHeader title="Graph Builder" subtitle="Start from a template or build from scratch" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <div key={template.name} className="glass-card rounded-[var(--radius-2xl)] p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[var(--color-text-primary)]">{template.name}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{template.description}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{template.nodes.length} nodes · {template.edges.length} edges</p>
            <button
              onClick={() => handleLoadTemplate(template)}
              className="mt-auto bg-[var(--color-gold)] text-black font-semibold rounded-[var(--radius-lg)] py-2 hover:opacity-90"
            >
              Open Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### `GraphSearchPage.tsx`

Search interface for finding entities across the platform. Uses the existing filter/search patterns.

- **SearchInput** to type query
- **Filter tabs** — entity types (All / Person / IP / Location / Evidence / Method / Motive / Crime Type)
- **Results list** — shows matched items with type icon, label, confidence, and "Add to Graph" button
- **"Add to Graph"** calls `addNode()` to place the entity on the graph, shows toast, navigates to workspace

For mock data, create a hardcoded list of ~15 sample entities covering all 7 types, or use the search pattern with a local filtered list.

States: Loading → Empty ("No results") → Populated results.

#### `GraphTimelinePage.tsx`

Timeline of graph changes (a history viewer). Not a real time-series — shows the `history` from graphStore as a chronological list.

- **Timeline list** — each entry shows snapshot time and node/edge count
- **Click to restore** — restores the graph to that point in history
- If history is empty, show EmptyState: "No history yet. Start editing the graph in the workspace."

States: Loading → Empty → Populated timeline.

---

## 3. VERIFICATION PROTOCOL

After completing ALL steps:

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Build check
npm run build

# 3. Verify pages
check file exists: src/pages/intel-graph/IntelGraphWorkspacePage.tsx
check file exists: src/pages/intel-graph/GraphBuilderPage.tsx
check file exists: src/pages/intel-graph/GraphSearchPage.tsx
check file exists: src/pages/intel-graph/GraphTimelinePage.tsx
check file exists: stores/graphStore.ts
check directory exists: src/features/intel-graph/
```

---

## 4. DELIVERABLES

### Files Created

- [ ] `stores/graphStore.ts` — Zustand graph store with full CRUD
- [ ] `features/intel-graph/config/nodeTypes.ts` — 7 node type definitions
- [ ] `features/intel-graph/config/edgeConfig.ts` — Edge styling
- [ ] `features/intel-graph/components/IntelGraphCanvas.tsx` — React Flow canvas
- [ ] `features/intel-graph/components/NodePalette.tsx` — Draggable palette
- [ ] `features/intel-graph/components/NodePaletteItem.tsx` — Palette item
- [ ] `features/intel-graph/components/GraphActionBar.tsx` — Toolbar
- [ ] `features/intel-graph/components/IntelNodeEditor.tsx` — Node editor panel
- [ ] `features/intel-graph/components/ReportPreview.tsx` — Summary bar
- [ ] `features/intel-graph/components/nodes/PersonNode.tsx`
- [ ] `features/intel-graph/components/nodes/IpAddressNode.tsx`
- [ ] `features/intel-graph/components/nodes/LocationNode.tsx`
- [ ] `features/intel-graph/components/nodes/EvidenceNode.tsx`
- [ ] `features/intel-graph/components/nodes/MethodNode.tsx`
- [ ] `features/intel-graph/components/nodes/MotiveNode.tsx`
- [ ] `features/intel-graph/components/nodes/CrimeTypeNode.tsx`
- [ ] `features/intel-graph/components/nodes/index.ts` — Barrel export
- [ ] `features/intel-graph/utils/graphExport.ts` — Export/import JSON
- [ ] `features/intel-graph/utils/templates.ts` — Pre-built templates
- [ ] `src/pages/intel-graph/IntelGraphWorkspacePage.tsx` — **Replaced**
- [ ] `src/pages/intel-graph/GraphBuilderPage.tsx` — **Replaced**
- [ ] `src/pages/intel-graph/GraphSearchPage.tsx` — **Replaced**
- [ ] `src/pages/intel-graph/GraphTimelinePage.tsx` — **Replaced**

### Dependency Added

- [ ] `@xyflow/react` — React Flow v12

### Updated

- [ ] `changes.md` — Phase 7 completion entry

### Acceptance Criteria

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] 7 node types render with correct colors and icons
- [ ] Nodes can be dragged from palette to canvas
- [ ] Nodes connect via handle drag
- [ ] Click node → right panel shows editable form
- [ ] Save updates node data in graphStore
- [ ] Export produces valid JSON with all nodes and edges
- [ ] Load template populates the canvas
- [ ] Delete node works with confirmation
- [ ] Clear canvas works with confirmation
- [ ] Report preview updates as graph changes
- [ ] GraphStore persists through navigation
- [ ] No design token overrides
- [ ] Builder page shows templates; GraphSearch shows searchable entities; GraphTimeline shows history
- [ ] All 4 pages have all states (loading/error/empty/populated) where applicable

---

## 5. WHAT NOT TO DO

- Do NOT modify routes.tsx (already registered)
- Do NOT modify any existing page from phases 0–6
- Do NOT modify globals.css, shared/layout, shared/ui-kit
- Do NOT add any dependencies besides `@xyflow/react`
- Do NOT create mock API endpoints or React Query hooks (Phase 7 is client-side only)
- Do NOT proceed to Phase 8

---

**Build the graph workspace. Report back with verification results and any issues encountered.**
