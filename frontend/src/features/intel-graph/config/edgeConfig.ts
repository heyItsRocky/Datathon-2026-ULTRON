import { MarkerType, type DefaultEdgeOptions } from '@xyflow/react';

export const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
  style: { stroke: '#555', strokeWidth: 2 },
};

export const SELECTED_EDGE_STYLE = { stroke: 'var(--color-gold)', strokeWidth: 3 };
