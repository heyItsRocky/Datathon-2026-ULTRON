import { useQuery } from '@tanstack/react-query';
import { fetchCyberIncidentDetail } from '../api/cyberApi';
export function useCyberIncidentDetail(id:string){ return useQuery({queryKey:['cyber-incident',id], queryFn:()=>fetchCyberIncidentDetail(id), enabled:!!id}); }
