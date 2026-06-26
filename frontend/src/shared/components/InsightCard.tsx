import { Brain } from 'lucide-react';

interface InsightCardProps {
  title: string;
  summary: string;
}

export function InsightCard({ title, summary }: InsightCardProps) {
  return <article className="glass-card rounded-[var(--radius-xl)] p-5"><div className="mb-3 flex items-center gap-2 text-[var(--color-intel-violet)]"><Brain className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">AI Brief</span></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{summary}</p></article>;
}
