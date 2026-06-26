import { useQuery } from '@tanstack/react-query';
import { fetchDomainIntelligence } from '../api/cyberApi';
export function useDomainIntelligence(domain:string){ return useQuery({queryKey:['domain-intelligence',domain], queryFn:()=>fetchDomainIntelligence(domain), enabled:!!domain}); }
