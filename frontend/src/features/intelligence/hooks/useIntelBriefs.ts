import { useQuery } from '@tanstack/react-query';
import { fetchIntelBriefs } from '../api/intelApi';
export function useIntelBriefs() { return useQuery({ queryKey: ['intel-briefs'], queryFn: fetchIntelBriefs, staleTime: 5 * 60_000 }); }
