import { create } from 'zustand';
import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type OnConnect } from '@xyflow/react';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';

export type IntelNodeType = 'person' | 'ipAddress' | 'location' | 'evidence' | 'method' | 'motive' | 'crimeType';

export interface IntelNodeData extends Record<string, unknown> {
  label: string;
  type: IntelNodeType;
  description?: string;
  confidence?: number;
  source?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
}

export type IntelNode = Node<IntelNodeData, IntelNodeType>;
export type IntelEdge = Edge<Record<string, unknown>>;

export interface GraphTemplate {
  name: string;
  description: string;
  nodes: IntelNode[];
  edges: IntelEdge[];
}

export interface GraphHistoryEntry {
  id: string;
  at: string;
  label: string;
  nodes: IntelNode[];
  edges: IntelEdge[];
}

interface GraphState {
  nodes: IntelNode[];
  edges: IntelEdge[];
  graphName: string;
  selectedNodeId: string | null;
  history: GraphHistoryEntry[];
  setGraphName: (name: string) => void;
  onNodesChange: (changes: NodeChange<IntelNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<IntelEdge>[]) => void;
  onConnect: OnConnect;
  addNode: (type: IntelNodeType, position: { x: number; y: number }, data?: Partial<IntelNodeData>) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateNodeData: (id: string, data: Partial<IntelNodeData>) => void;
  selectNode: (id: string | null) => void;
  clearAll: () => void;
  loadTemplate: (template: GraphTemplate) => void;
  loadGraph: (nodes: IntelNode[], edges: IntelEdge[], graphName?: string) => void;
  restoreHistory: (entryId: string) => void;
  pushHistory: (label?: string) => void;
  getConnectedNodes: (nodeId: string) => IntelNode[];
}

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100_000)}`;
}

function cloneNodes(nodes: IntelNode[]): IntelNode[] {
  return nodes.map((node) => ({ ...node, position: { ...node.position }, data: { ...node.data } }));
}

function cloneEdges(edges: IntelEdge[]): IntelEdge[] {
  return edges.map((edge) => ({ ...edge, data: edge.data ? { ...edge.data } : undefined }));
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  graphName: 'Untitled Investigation',
  selectedNodeId: null,
  history: [],
  setGraphName: (graphName) => set({ graphName }),
  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection: Connection) => {
    get().pushHistory('Connected entities');
    set((state) => ({
      edges: addEdge({ ...connection, id: makeId('edge'), type: 'default', animated: false, data: { label: 'connected to' } }, state.edges),
    }));
  },
  addNode: (type, position, data) => {
    const config = NODE_TYPE_CONFIGS[type];
    const node: IntelNode = {
      id: makeId(type),
      type,
      position,
      data: {
        label: data?.label ?? config.defaultLabel,
        type,
        description: data?.description ?? '',
        confidence: data?.confidence ?? 50,
        source: data?.source ?? 'Manual entry',
        riskLevel: data?.riskLevel ?? 'medium',
        ...data,
      },
    };
    set((state) => ({ nodes: [...state.nodes, node], selectedNodeId: node.id }));
  },
  removeNode: (id) => {
    get().pushHistory('Removed node');
    set((state) => ({ nodes: state.nodes.filter((node) => node.id !== id), edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id), selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId }));
  },
  removeEdge: (id) => {
    get().pushHistory('Removed edge');
    set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id) }));
  },
  updateNodeData: (id, data) => {
    get().pushHistory('Updated node');
    set((state) => ({ nodes: state.nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...data } } : node)) }));
  },
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  clearAll: () => {
    get().pushHistory('Cleared canvas');
    set({ nodes: [], edges: [], selectedNodeId: null, graphName: 'Untitled Investigation' });
  },
  loadTemplate: (template) => {
    get().pushHistory(`Loaded template: ${template.name}`);
    set({ nodes: cloneNodes(template.nodes), edges: cloneEdges(template.edges), graphName: template.name, selectedNodeId: null });
  },
  loadGraph: (nodes, edges, graphName) => {
    get().pushHistory('Imported graph');
    set((state) => ({ nodes: cloneNodes(nodes), edges: cloneEdges(edges), graphName: graphName ?? state.graphName, selectedNodeId: null }));
  },
  restoreHistory: (entryId) => {
    const entry = get().history.find((item) => item.id === entryId);
    if (!entry) return;
    set({ nodes: cloneNodes(entry.nodes), edges: cloneEdges(entry.edges), selectedNodeId: null });
  },
  pushHistory: (label = 'Graph snapshot') => {
    const state = get();
    const entry: GraphHistoryEntry = { id: makeId('history'), at: new Date().toISOString(), label, nodes: cloneNodes(state.nodes), edges: cloneEdges(state.edges) };
    set({ history: [entry, ...state.history].slice(0, 50) });
  },
  getConnectedNodes: (nodeId) => {
    const state = get();
    const connectedIds = new Set(state.edges.flatMap((edge) => (edge.source === nodeId ? [edge.target] : edge.target === nodeId ? [edge.source] : [])));
    return state.nodes.filter((node) => connectedIds.has(node.id));
  },
}));
