import { Badge } from '@/shared/ui-kit';

const emergencyNumbers = [
  { number: '112', label: 'Emergency' },
  { number: '100', label: 'Police' },
  { number: '101', label: 'Fire' },
  { number: '108', label: 'Ambulance' },
  { number: '1070', label: 'Helpline' },
  { number: '1091', label: 'Women' },
  { number: '1098', label: 'Children' },
  { number: '1930', label: 'Cyber' },
  { number: '14567', label: 'Traffic' },
];

export function EmergencyFooter() {
  return (
    <footer className="glass-card rounded-[var(--radius-2xl)] border border-[var(--color-gold)]/20 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">Emergency Grid</span>
        {emergencyNumbers.map((item) => (
          <Badge key={item.number} className="gap-2 border-[var(--color-gold)]/20 bg-white/5 px-3 py-1.5" variant="muted">
            <span className="font-bold text-[var(--color-gold)]">{item.number}</span>
            <span className="text-[var(--color-text-secondary)]">{item.label}</span>
          </Badge>
        ))}
      </div>
    </footer>
  );
}
