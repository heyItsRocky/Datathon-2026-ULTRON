import { useQuery } from '@tanstack/react-query';
import { fetchEvidenceRecords } from '../api/cyberApi';
export function useEvidenceRecords(caseId?:string){ return useQuery({queryKey:['cyber-evidence',caseId], queryFn:async()=>{const rows=await fetchEvidenceRecords(); return caseId?rows.filter(r=>r.caseId===caseId):rows;}}); }
