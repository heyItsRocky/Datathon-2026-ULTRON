import { KSPEmblem } from './KSPEmblem';

function PlaceholderPortrait({ label }: { label: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-gold)]/50 bg-white/5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-gold)]">
      {label}
    </div>
  );
}

export function KSPHeader() {
  return (
    <header className="glass-card flex flex-wrap items-center gap-4 rounded-[var(--radius-2xl)] px-5 py-4 sm:px-6">
      <KSPEmblem size={48} />
      <div className="hidden h-10 w-px bg-white/10 sm:block" />
      <div className="flex items-center gap-2">
        <PlaceholderPortrait label="CM" />
        <PlaceholderPortrait label="Dy CM" />
      </div>
      <div className="min-w-0">
        <h1 className="text-3xl font-black tracking-[0.18em] text-[var(--color-gold)] sm:text-4xl">ULTRON</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Karnataka State Police Intelligence Platform</p>
      </div>
    </header>
  );
}
