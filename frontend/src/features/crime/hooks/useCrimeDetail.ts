import { useQuery } from '@tanstack/react-query';
import { fetchCrimeCaseDetail } from '../api/crimeApi';

export function useCrimeDetail(id: string) {
  return useQuery({ queryKey: ['crime-case', id], queryFn: () => fetchCrimeCaseDetail(id), enabled: !!id });
}
