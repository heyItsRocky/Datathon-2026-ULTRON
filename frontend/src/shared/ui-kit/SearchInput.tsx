import { Search, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcut?: string;
}

export function SearchInput({ className, value, onClear, shortcut = '⌘K', ...props }: SearchInputProps) {
  return (
    <div className={cn('glass-card flex h-10 items-center gap-2 rounded-[var(--radius-full)] px-3 text-sm', className)}>
      <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
      <input value={value} className="min-w-0 flex-1 bg-transparent text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]" {...props} />
      {value && onClear ? <button aria-label="Clear search" onClick={onClear}><X className="h-4 w-4" /></button> : <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">{shortcut}</kbd>}
    </div>
  );
}
