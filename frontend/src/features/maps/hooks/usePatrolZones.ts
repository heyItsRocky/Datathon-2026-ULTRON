import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';

export interface PatrolZoneDTO {
  id: string;
  districtId: string;
  district: string;
  zoneName: string;
  boundaries: Array<{ lat: number; lng: number }>;
  centerLat: number;
  centerLng: number;
  radius: number;
  assignedTeam: string;
  teamSize: number;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'patrolling' | 'standby';
  coverage: number;
  lastPatrol: string;
}

export function usePatrolZones() {
  return useQuery({ queryKey: ['map-patrol-zones'], queryFn: () => apiGet<PatrolZoneDTO[]>('/maps/patrol-zones') });
}
