import { Brain, RadioTower } from 'lucide-react';
import { Badge } from '@/shared/ui-kit';

interface IntelHubHeroProps { briefsCount: number; redZonesCount: number; trendsCount: number; highRiskDistricts: number; lastUpdated: string }

export function IntelHubHero({ briefsCount, redZonesCount, trendsCount, highRiskDistricts, lastUpdated }: IntelHubHeroProps) {
  return <section className="glass-card rounded-[var(--radius-2xl)] border border-[var(--color-intel-violet)]/30 p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-4"><div className="rounded-[var(--radius-xl)] bg-violet-500/15 p-3"><Brain className="h-8 w-8 text-[var(--color-intel-violet)]" /></div><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">Strategic Intelligence Brief — {lastUpdated}</p><h2 className="mt-2 text-2xl font-black">Executive command signal is live</h2><p className="mt-2 text-[var(--color-text-secondary)]">{briefsCount} AI briefs · {redZonesCount} active red zones · {trendsCount} emerging trends · {highRiskDistricts} high-risk districts</p></div></div><Badge variant="violet" className="gap-2"><RadioTower className="h-4 w-4" /> Live Intel Feed</Badge></div></section>;
}
