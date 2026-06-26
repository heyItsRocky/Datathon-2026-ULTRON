import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Filter, RefreshCw } from 'lucide-react';
import { Button, SearchInput, Select } from '@/shared/ui-kit';
import { useFilterStore } from '@/stores/filterStore';

function crumbsFromPath(pathname: string) {
  if (pathname === '/') return [{ label: 'Command Center', path: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  return [{ label: 'Home', path: '/' }, ...segments.map((segment, index) => ({ label: segment.replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase()), path: `/${segments.slice(0, index + 1).join('/')}` }))];
}

export function SectionToolbar() {
  const location = useLocation();
  const district = useFilterStore((state) => state.globalDistrict);
  const setDistrict = useFilterStore((state) => state.setGlobalDistrict);
  const crumbs = crumbsFromPath(location.pathname);
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/55 px-4 py-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]" aria-label="Breadcrumb">
        {crumbs.map((crumb, index) => <span key={crumb.path} className="flex items-center gap-2">{index > 0 ? <span>/</span> : null}<Link className="hover:text-[var(--color-gold)]" to={crumb.path}>{crumb.label}</Link></span>)}
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput className="w-64" placeholder="Filter current view" shortcut="/" />
        <Select value={district} onValueChange={setDistrict} options={[{ label: 'All Karnataka', value: 'All Karnataka' }, { label: 'Bengaluru City', value: 'Bengaluru City' }, { label: 'Mysuru', value: 'Mysuru' }]} />
        <Button variant="secondary" size="sm"><CalendarDays className="h-4 w-4" /> 2026</Button>
        <Button variant="secondary" size="sm"><Filter className="h-4 w-4" /> Filters</Button>
        <Button variant="ghost" size="sm"><RefreshCw className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
