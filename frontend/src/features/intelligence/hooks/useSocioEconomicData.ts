import { useQuery } from '@tanstack/react-query';
import { fetchSocioEconomicData } from '../api/intelApi';
export function useSocioEconomicData() { return useQuery({ queryKey: ['intel-socio-economic'], queryFn: fetchSocioEconomicData, staleTime: 5 * 60_000 }); }
