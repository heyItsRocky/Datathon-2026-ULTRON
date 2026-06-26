import { useMemo, useState } from 'react';
import { IntelBriefCard } from '@/features/intelligence/components/IntelBriefCard';
import { useIntelBriefs } from '@/features/intelligence/hooks/useIntelBriefs';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Button, SearchInput, Select } from '@/shared/ui-kit';

const categoryOptions = [{ label: 'All Categories', value: 'all' }, { label: 'Crime', value: 'crime' }, { label: 'Cyber', value: 'cyber' }, { label: 'Intel', value: 'intel' }];
const priorityOptions = [{ label: 'All Priorities', value: 'all' }, { label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' }];
const dateOptions = [{ label: 'All Dates', value: 'all' }, { label: 'Last 7 Days', value: '7' }, { label: 'Last 14 Days', value: '14' }, { label: 'Last 30 Days', value: '30' }];

function withinDays(date: string, days: string) { if (days === 'all') return true; const now = new Date('2026-06-26').getTime(); return now - new Date(date).getTime() <= Number(days) * 24 * 60 * 60 * 1000; }

export function BriefingsPage() {
  const q = useIntelBriefs();
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => (q.data ?? []).filter((brief) => (category === 'all' || brief.category === category) && (priority === 'all' || brief.priority === priority) && withinDays(brief.date, dateRange) && (!search || `${brief.title} ${brief.summary} ${brief.district} ${brief.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()))), [category, dateRange, priority, q.data, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12));
  const visible = filtered.slice((page - 1) * 12, page * 12);
  if (q.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div></div>;
  if (q.isError) return <ErrorState message={q.error.message} onRetry={() => void q.refetch()} />;
  if (!q.data?.length) return <EmptyState title="No briefings" description="No intelligence briefings are available." />;
  return <div className="grid gap-6"><PageHeader title="Intelligence Briefings" subtitle="Filterable AI-generated briefings for district and command teams" /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_160px_160px_160px]"><SearchInput value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} onClear={() => setSearch('')} placeholder="Search briefings" /><Select value={category} onValueChange={(value) => { setCategory(value); setPage(1); }} options={categoryOptions} /><Select value={priority} onValueChange={(value) => { setPriority(value); setPage(1); }} options={priorityOptions} /><Select value={dateRange} onValueChange={(value) => { setDateRange(value); setPage(1); }} options={dateOptions} /></section>{!visible.length ? <EmptyState title="No briefings match your filters" description="Try widening category, priority, date range, or search text." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((brief) => <IntelBriefCard key={brief.id} brief={brief} />)}</div>}<div className="flex items-center justify-between"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><span className="text-sm text-[var(--color-text-secondary)]">Page {page} of {pageCount}</span><Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button></div></div>;
}

export default BriefingsPage;
