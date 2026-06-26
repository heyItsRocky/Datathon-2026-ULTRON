import { useQuery } from '@tanstack/react-query';
import { fetchNetworkFlows } from '../api/cyberApi';
export function useNetworkFlows(){ return useQuery({queryKey:['network-flows'], queryFn:fetchNetworkFlows}); }
