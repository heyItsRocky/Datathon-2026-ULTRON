import { useQuery } from '@tanstack/react-query';
import { fetchEmergingTrends } from '../api/intelApi';
export function useEmergingTrends() { return useQuery({ queryKey: ['intel-trends'], queryFn: fetchEmergingTrends, staleTime: 5 * 60_000 }); }
