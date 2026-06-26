interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="glass-card rounded-[var(--radius-2xl)] p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">ULTRON Intelligence Platform</p>
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-[var(--color-text-secondary)]">{subtitle}</p> : null}
    </section>
  );
}
