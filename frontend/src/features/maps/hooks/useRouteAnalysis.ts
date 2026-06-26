import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';

export interface CrimeRouteDTO {
  id: string;
  name: string;
  type: 'escape' | 'suspected' | 'patrol' | 'pattern';
  confidence: number;
  distance: number;
  estimatedTime: number;
  waypoints: Array<{ lat: number; lng: number; label: string }>;
  incidents: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  status: 'active' | 'monitored' | 'historical';
}

export function useRouteAnalysis() {
  return useQuery({ queryKey: ['map-route-analysis'], queryFn: () => apiGet<CrimeRouteDTO[]>('/maps/route-analysis') });
}
