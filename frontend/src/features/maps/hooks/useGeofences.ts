import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';

export interface GeoFenceDTO {
  id: string;
  name: string;
  districtId: string;
  district: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  type: 'alert' | 'restricted' | 'monitoring' | 'vip';
  status: 'active' | 'triggered' | 'inactive';
  priority: number;
  triggerEvents: number;
  lastTriggered: string | null;
  description: string;
}

export function useGeofences() {
  return useQuery({ queryKey: ['map-geofences'], queryFn: () => apiGet<GeoFenceDTO[]>('/maps/geofences') });
}
