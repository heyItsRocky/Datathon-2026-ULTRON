import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MetricDelta } from './MetricDelta';

interface KpiCardProps {
  title: string;
  value: number;
  trend?: number;
  icon?: LucideIcon;
  onClick?: () => void;
}

export function KpiCard({ title, value, trend = 0, icon: Icon, onClick }: KpiCardProps) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 24;
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setDisplay(Math.round((value / steps) * current));
      if (current >= steps) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [value]);
  return (
    <button onClick={onClick} className="glass-card w-full rounded-[var(--radius-xl)] border-t-2 border-t-[var(--color-gold)] p-5 text-left transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]">
      <div className="mb-5 flex items-center justify-between text-[var(--color-text-secondary)]">
        <span className="text-sm font-semibold">{title}</span>
        {Icon ? <Icon className="h-5 w-5 text-[var(--color-gold)]" /> : null}
      </div>
      <div className="count-up text-4xl font-extrabold">{display.toLocaleString()}</div>
      <div className="mt-3"><MetricDelta value={trend} /></div>
    </button>
  );
}
