import type { DragEvent } from 'react';
import type { IntelNodeTypeConfig } from '@/features/intel-graph/config/nodeTypes';

interface NodePaletteItemProps {
  config: IntelNodeTypeConfig;
}

export function NodePaletteItem({ config }: NodePaletteItemProps) {
  const Icon = config.icon;
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', config.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div draggable onDragStart={onDragStart} className="flex cursor-grab items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 transition-colors hover:bg-white/5 active:cursor-grabbing">
      <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: config.color }} />
      <Icon size={14} style={{ color: config.color }} />
      <span className="text-sm text-[var(--color-text-secondary)]">{config.label}</span>
    </div>
  );
}
