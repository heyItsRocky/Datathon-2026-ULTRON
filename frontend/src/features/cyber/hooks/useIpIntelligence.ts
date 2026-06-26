import { useQuery } from '@tanstack/react-query';
import { fetchIpIntelligence } from '../api/cyberApi';
export function useIpIntelligence(ip:string){ return useQuery({queryKey:['ip-intelligence',ip], queryFn:()=>fetchIpIntelligence(ip), enabled:!!ip}); }
