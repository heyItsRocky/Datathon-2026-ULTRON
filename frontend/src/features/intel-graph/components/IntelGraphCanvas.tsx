import { useCallback, useMemo } from 'react';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DEFAULT_EDGE_OPTIONS } from '@/features/intel-graph/config/edgeConfig';
import { isIntelNodeType, NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';
import { useGraphStore, type IntelNode } from '@/stores/graphStore';
import * as CustomNodes from './nodes';

function IntelGraphCanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode, addNode, pushHistory } = useGraphStore();
  const { screenToFlowPosition } = useReactFlow<IntelNode>();

  const nodeTypes: NodeTypes = useMemo(() => ({
    person: CustomNodes.PersonNode,
    ipAddress: CustomNodes.IpAddressNode,
    location: CustomNodes.LocationNode,
    evidence: CustomNodes.EvidenceNode,
    method: CustomNodes.MethodNode,
    motive: CustomNodes.MotiveNode,
    crimeType: CustomNodes.CrimeTypeNode,
  }), []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: IntelNode) => selectNode(node.id), [selectNode]);
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!isIntelNodeType(type)) return;
    pushHistory('Added node');
    addNode(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }, [addNode, pushHistory, screenToFlowPosition]);

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} defaultEdgeOptions={DEFAULT_EDGE_OPTIONS} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={() => selectNode(null)} onDragOver={onDragOver} onDrop={onDrop} fitView colorMode="dark" className="bg-[#0f0f1a]">
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
      <Controls className="!rounded-[var(--radius-lg)] !border-[var(--color-border)] !bg-[#1a1a2e]" />
      <MiniMap nodeColor={(node) => NODE_TYPE_CONFIGS[isIntelNodeType(node.type ?? '') ? node.type : 'person'].color} maskColor="rgba(0,0,0,0.6)" className="!border-[var(--color-border)]" />
    </ReactFlow>
  );
}

export function IntelGraphCanvas() {
  return <ReactFlowProvider><IntelGraphCanvasInner /></ReactFlowProvider>;
}
