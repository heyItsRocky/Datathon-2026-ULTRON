import { useQuery } from '@tanstack/react-query';
import { fetchCriminals } from '../api/crimeApi';

export function useCriminalList() {
  return useQuery({ queryKey: ['criminals'], queryFn: fetchCriminals });
}
