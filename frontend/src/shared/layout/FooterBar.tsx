import { DatabaseZap } from 'lucide-react';

export function FooterBar() {
  return <footer className="flex h-10 items-center justify-between border-t border-[var(--color-border)] px-4 text-xs text-[var(--color-text-muted)]"><span>ULTRON Frontend · Mock mode ready</span><span className="inline-flex items-center gap-2"><DatabaseZap className="h-3.5 w-3.5 text-[var(--severity-low)]" />Data refreshed 2 min ago</span></footer>;
}
