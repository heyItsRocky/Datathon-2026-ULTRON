import { useQuery } from '@tanstack/react-query';
import { fetchCyberIncidents } from '../api/cyberApi';
export function useCyberIncidents(){ return useQuery({queryKey:['cyber-incidents'], queryFn:fetchCyberIncidents}); }
