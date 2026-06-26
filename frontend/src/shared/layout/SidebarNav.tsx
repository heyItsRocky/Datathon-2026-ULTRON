import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/shared/ui-kit';
import { useNavStore } from '@/stores/navStore';
import { cn } from '@/shared/utils/cn';
import { navItems } from './navigation';
import { SidebarItem } from './SidebarItem';

export function SidebarNav() {
  const collapsed = useNavStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useNavStore((state) => state.toggleSidebar);
  return (
    <aside className={cn('hidden border-r border-[var(--color-border)] bg-[var(--color-surface)]/70 p-3 transition-[var(--transition-panel)] lg:block', collapsed ? 'w-20' : 'w-72')}>
      <div className="mb-4 flex justify-end"><Button aria-label="Toggle sidebar" variant="ghost" size="sm" onClick={toggleSidebar}>{collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</Button></div>
      <nav className="grid gap-1" aria-label="Primary navigation">{navItems.map((item) => <SidebarItem key={item.path} item={item} collapsed={collapsed} />)}</nav>
    </aside>
  );
}
