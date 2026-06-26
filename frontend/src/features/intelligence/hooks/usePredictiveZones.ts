import { useQuery } from '@tanstack/react-query';
import { fetchPredictiveZones } from '../api/intelApi';
export function usePredictiveZones() { return useQuery({ queryKey: ['intel-predictive-zones'], queryFn: fetchPredictiveZones, staleTime: 5 * 60_000 }); }
