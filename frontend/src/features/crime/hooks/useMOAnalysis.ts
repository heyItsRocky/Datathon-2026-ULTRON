import { useQuery } from '@tanstack/react-query';
import { matchMO } from '../api/crimeApi';

export function useMOAnalysis(description: string, crimeType?: string, district?: string, enabled = false) {
  return useQuery({
    queryKey: ['mo-analysis', description, crimeType, district],
    queryFn: () => matchMO(description, crimeType, district),
    enabled: enabled && description.trim().length > 0,
  });
}
