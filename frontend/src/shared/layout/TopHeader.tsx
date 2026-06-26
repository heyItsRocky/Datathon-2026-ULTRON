import { Bell, ChevronDown, Shield, UserCircle } from 'lucide-react';
import { Badge, Button, SearchInput } from '@/shared/ui-kit';
import { useAuthStore } from '@/stores/authStore';

export function TopHeader() {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/85 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-lg)] bg-[var(--color-gold-soft)] text-[var(--color-gold)]"><Shield className="h-6 w-6" /></div>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Karnataka State Police</p><h1 className="text-lg font-black tracking-wider">ULTRON</h1></div>
        <Badge variant="gold">{user?.role ?? 'viewer'}</Badge>
      </div>
      <SearchInput className="hidden w-[min(36vw,520px)] md:flex" placeholder="Search cases, entities, alerts" />
      <div className="flex items-center gap-2">
        <Button aria-label="Notifications" variant="ghost" size="sm"><Bell className="h-5 w-5" /></Button>
        <Button variant="secondary" size="sm"><UserCircle className="h-4 w-4" /> <span className="hidden sm:inline">{user?.name}</span><ChevronDown className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
