import { useQuery } from '@tanstack/react-query';
import { fetchCrimeCases } from '../api/crimeApi';

export function useCrimeList() {
  return useQuery({ queryKey: ['crime-cases'], queryFn: () => fetchCrimeCases() });
}
