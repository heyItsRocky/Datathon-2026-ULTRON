import { useQuery } from '@tanstack/react-query';
import { fetchRedZones } from '../api/intelApi';
export function useRedZones() { return useQuery({ queryKey: ['intel-red-zones'], queryFn: fetchRedZones, staleTime: 5 * 60_000 }); }
