import { useFilterStore } from '@/stores/filterStore';

export function useCrimeFilters() {
  const filters = useFilterStore((state) => state.crimeFilters);
  const setCrimeFilters = useFilterStore((state) => state.setCrimeFilters);
  return {
    filters,
    setType: (type: string) => setCrimeFilters({ type }),
    setStatus: (status: string) => setCrimeFilters({ status }),
    setDistrict: (district: string) => setCrimeFilters({ district }),
    setSearch: (search: string) => setCrimeFilters({ search }),
    setDateRange: (range: { from: string; to: string }) => setCrimeFilters({ dateFrom: range.from, dateTo: range.to }),
    reset: () => setCrimeFilters({ type: undefined, status: undefined, district: undefined, search: undefined, dateRange: undefined }),
  };
}
