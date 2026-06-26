import { useMemo } from 'react';
import { CrimeTable } from '@/features/crime/components/CrimeTable';
import { useCrimeFilters } from '@/features/crime/hooks/useCrimeFilters';
import { useCrimeList } from '@/features/crime/hooks/useCrimeList';
import { PageHeader } from '@/shared/components';
import { Input, SearchInput, Select } from '@/shared/ui-kit';

const typeOptions = ['All Types', 'Murder', 'Theft', 'Assault', 'Burglary', 'Robbery', 'Cyber Crime', 'Chain Snatching', 'Domestic Violence'].map((value) => ({ label: value, value }));
const statusOptions = ['All Statuses', 'Under Investigation', 'Open', 'Resolved', 'Pending Review'].map((value) => ({ label: value, value }));
const districtOptions = ['All Districts', 'Bengaluru City', 'Bengaluru Urban', 'Mysuru', 'Belagavi', 'Hubli-Dharwad', 'Kalaburagi', 'Mangaluru', 'Tumakuru', 'Shivamogga', 'Davanagere'].map((value) => ({ label: value, value }));

function filterString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

export default function CrimeCasesPage() {
  const { data = [], isLoading, isError, error, refetch } = useCrimeList();
  const { filters, setType, setStatus, setDistrict, setSearch, reset } = useCrimeFilters();
  const type = filterString(filters.type, 'All Types');
  const status = filterString(filters.status, 'All Statuses');
  const district = filterString(filters.district, 'All Districts');
  const search = filterString(filters.search, '');

  const filtered = useMemo(() => data.filter((item) => {
    const matchesType = type === 'All Types' || item.type === type;
    const matchesStatus = status === 'All Statuses' || item.status === status;
    const matchesDistrict = district === 'All Districts' || item.district === district;
    const query = search.toLowerCase();
    const matchesSearch = !query || item.id.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.location.toLowerCase().includes(query);
    return matchesType && matchesStatus && matchesDistrict && matchesSearch;
  }), [data, district, search, status, type]);

  return (
    <div className="grid gap-6">
      <PageHeader title="Crime Cases" subtitle={`${filtered.length} of ${data.length} records visible across Karnataka crime intelligence.`} />
      <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_180px_180px_180px_150px]">
        <SearchInput onChange={(event) => setSearch(event.target.value)} placeholder="Search FIR, location, description" value={search} />
        <Select onValueChange={setType} options={typeOptions} value={type} />
        <Select onValueChange={setStatus} options={statusOptions} value={status} />
        <Select onValueChange={setDistrict} options={districtOptions} value={district} />
        <Input aria-label="Date range" readOnly value="2026 YTD" />
      </section>
      <CrimeTable cases={filtered} emptyAction={reset} error={isError ? error : null} loading={isLoading} onRetry={() => void refetch()} />
    </div>
  );
}
