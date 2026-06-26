import { cn } from '@/shared/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label className="grid gap-2 text-sm text-[var(--color-text-secondary)]" htmlFor={inputId}>
      {label ? <span>{label}</span> : null}
      <input
        id={inputId}
        className={cn('h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-text-primary)] outline-none transition-[var(--transition-fast)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-50', error && 'border-[var(--severity-extreme)]', className)}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--severity-extreme)]">{error}</span> : null}
    </label>
  );
}
