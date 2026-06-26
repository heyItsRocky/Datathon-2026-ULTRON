import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui-kit';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return <div className="rounded-[var(--radius-xl)] border border-red-500/30 bg-red-500/10 p-6 text-center"><AlertCircle className="mx-auto mb-3 h-10 w-10 text-[var(--severity-extreme)]" /><h3 className="font-bold">Something went wrong</h3><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{message}</p>{onRetry ? <Button variant="danger" className="mt-4" onClick={onRetry}>Retry</Button> : null}</div>;
}
