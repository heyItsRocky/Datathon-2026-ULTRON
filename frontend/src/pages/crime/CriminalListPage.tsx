import { useMemo, useState } from 'react';
import { CriminalTable } from '@/features/crime/components/CriminalTable';
import { useCriminalList } from '@/features/crime/hooks/useCriminalList';
import { PageHeader } from '@/shared/components';
import { SearchInput, Select } from '@/shared/ui-kit';

const districtOptions = ['All Districts', 'Bengaluru City', 'Bengaluru Urban', 'Mysuru', 'Belagavi', 'Hubli-Dharwad', 'Kalaburagi', 'Mangaluru', 'Tumakuru', 'Shivamogga', 'Davanagere'].map((value) => ({ label: value, value }));
const statusOptions = ['All Statuses', 'Active', 'Incarcerated', 'Parole'].map((value) => ({ label: value, value }));

export default function CriminalListPage() {
  const { data = [], isLoading, isError, error, refetch } = useCriminalList();
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All Districts');
  const [status, setStatus] = useState('All Statuses');
  const filtered = useMemo(() => data.filter((criminal) => (district === 'All Districts' || criminal.district === district) && (status === 'All Statuses' || criminal.status === status)), [data, district, status]);

  return (
    <div className="grid gap-6">
      <PageHeader title="Criminal Directory" subtitle="Search criminal profiles, risk scores, priors, aliases, and active status." />
      <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_180px_180px]"><SearchInput onChange={(event) => setSearch(event.target.value)} placeholder="Search name or alias" value={search} /><Select onValueChange={setDistrict} options={districtOptions} value={district} /><Select onValueChange={setStatus} options={statusOptions} value={status} /></section>
      <CriminalTable criminals={filtered} error={isError ? error : null} loading={isLoading} onRetry={() => void refetch()} search={search} />
    </div>
  );
}
