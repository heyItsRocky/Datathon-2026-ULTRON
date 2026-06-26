import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { IntelNode } from '@/stores/graphStore';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';

function BaseIntelNode({ data, selected }: NodeProps<IntelNode>) {
  const config = NODE_TYPE_CONFIGS[data.type];
  const Icon = config.icon;
  return (
    <div className={`min-w-[150px] rounded-[var(--radius-lg)] border-2 bg-[#1a1a2e] px-4 py-3 shadow-lg ${selected ? 'border-[var(--color-gold)]' : 'border-transparent'}`} style={{ borderLeftColor: config.color, borderLeftWidth: '4px' }}>
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-text-muted)]" />
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: config.color }} />
        <span className="max-w-[180px] truncate text-sm font-semibold text-[var(--color-text-primary)]">{data.label}</span>
      </div>
      {data.description ? <p className="mt-1 max-w-[200px] truncate text-xs text-[var(--color-text-muted)]">{data.description}</p> : null}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${data.confidence ?? 50}%`, backgroundColor: config.color }} /></div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-text-muted)]" />
    </div>
  );
}

export default memo(BaseIntelNode);
