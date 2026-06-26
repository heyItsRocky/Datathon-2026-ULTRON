import { NavLink } from 'react-router-dom';
import { Badge } from '@/shared/ui-kit';
import { cn } from '@/shared/utils/cn';
import type { NavItemConfig } from './navigation';

interface SidebarItemProps {
  item: NavItemConfig;
  collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const Icon = item.icon;
  return (
    <NavLink to={item.path} className={({ isActive }) => cn('flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition-[var(--transition-fast)] hover:bg-white/10 hover:text-white', isActive && 'bg-[var(--color-gold-soft)] text-[var(--color-gold)]', item.disabled && 'pointer-events-none opacity-40')}>
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
      {!collapsed && item.badge ? <Badge variant="gold">{item.badge}</Badge> : null}
    </NavLink>
  );
}
