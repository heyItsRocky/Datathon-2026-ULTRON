import { useQuery } from '@tanstack/react-query';
import { fetchCriminalDetail } from '../api/crimeApi';

export function useCriminalDetail(id: string) {
  return useQuery({ queryKey: ['criminal', id], queryFn: () => fetchCriminalDetail(id), enabled: !!id });
}
