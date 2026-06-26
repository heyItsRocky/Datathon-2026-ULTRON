import { useState } from 'react';
import { Map, LayoutDashboard, Network, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useRadialTransition } from '@/hooks/useAnimeTransition';
import { useAuthStore } from '@/stores/authStore';
import { KSPEmblem } from './KSPEmblem';

interface RadialNavProps {
  onSegmentClick?: (segment: string) => void;
}

interface SegmentDefinition {
  id: string;
  label: string;
  color: string;
  start: number;
  end: number;
  icon: typeof LayoutDashboard;
}

const segments: SegmentDefinition[] = [
  { id: 'dashboard', label: 'DASHBOARD', color: '#f0b000', start: 300, end: 410, icon: LayoutDashboard },
  { id: 'maps', label: 'MAPS', color: '#20a080', start: 50, end: 130, icon: Map },
  { id: 'network', label: 'NETWORK', color: '#800060', start: 130, end: 240, icon: Network },
  { id: 'intel', label: 'INTELLIGENCE', color: '#c02040', start: 240, end: 300, icon: ShieldAlert },
];

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) {
  const startOuter = polarToCartesian(200, 200, outerRadius, endAngle);
  const endOuter = polarToCartesian(200, 200, outerRadius, startAngle);
  const startInner = polarToCartesian(200, 200, innerRadius, startAngle);
  const endInner = polarToCartesian(200, 200, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

function labelPosition(startAngle: number, endAngle: number) {
  const midpoint = startAngle + (endAngle - startAngle) / 2;
  return polarToCartesian(200, 200, 150, midpoint);
}

export function RadialNav({ onSegmentClick }: RadialNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <svg className="h-auto w-full" viewBox="0 0 400 400">
        <defs>
          <filter id="ring-glow">
            <feDropShadow dx="0" dy="0" floodColor="rgba(240, 176, 0, 0.35)" stdDeviation="8" />
          </filter>
        </defs>
        <circle cx="200" cy="200" fill="rgba(255,255,255,0.03)" r="176" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        {segments.map((segment, index) => {
          const Icon = segment.icon;
          const position = labelPosition(segment.start, segment.end);
          const isHovered = hovered === segment.id;

          return (
            <motion.g
              key={segment.id}
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.path
                {...useRadialTransition(segment.id)}
                d={describeArc(segment.start, segment.end, 94, 170)}
                fill={segment.color}
                filter={isHovered ? 'url(#ring-glow)' : undefined}
                onClick={() => onSegmentClick?.(segment.id)}
                onHoverEnd={() => setHovered(null)}
                onHoverStart={() => setHovered(segment.id)}
                opacity={isHovered ? 1 : 0.9}
                role="button"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                style={{ cursor: 'pointer', transformOrigin: '200px 200px' }}
              />
              <motion.g
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: 0.18 + index * 0.08 }}
              >
                <foreignObject height="56" width="96" x={position.x - 48} y={position.y - 28}>
                  <div className="flex h-full w-full flex-col items-center justify-center text-center text-[11px] font-black tracking-[0.16em] text-white">
                    <Icon className="mb-1 h-4 w-4" />
                    <span>{segment.label}</span>
                  </div>
                </foreignObject>
              </motion.g>
            </motion.g>
          );
        })}
        <motion.g
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <circle cx="200" cy="200" fill="rgba(17, 24, 39, 0.92)" r="82" stroke="rgba(240, 176, 0, 0.35)" strokeWidth="3" />
          <foreignObject height="140" width="140" x="130" y="130">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(240,176,0,0.14),rgba(17,24,39,0.92))] text-center">
              <KSPEmblem size={64} />
              <span className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-gold)]">{isAuthenticated ? 'Enter Workspace' : 'Login'}</span>
            </div>
          </foreignObject>
        </motion.g>
      </svg>
    </div>
  );
}
