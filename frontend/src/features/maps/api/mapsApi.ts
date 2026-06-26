import { apiGet } from '@/shared/api/client';
import { adaptDistrictStats, adaptHotspot, adaptRedZone, type DistrictStatsDTO, type HotspotDTO, type RedZoneDTO } from '@/shared/api/dto-adapters/maps';
export interface PredictiveZoneDTO { id:string; districtId:string; district:string; confidence:number; riskLevel:string; date:string }
export async function fetchHotspots():Promise<HotspotDTO[]>{return (await apiGet<unknown[]>('/maps/hotspots')).map(adaptHotspot)}
export async function fetchRedZones():Promise<RedZoneDTO[]>{return (await apiGet<unknown[]>('/maps/red-zones')).map(adaptRedZone)}
export async function fetchDistrictStats(districtId:string):Promise<DistrictStatsDTO>{return adaptDistrictStats(await apiGet<unknown>(`/maps/districts/${districtId}`))}
export async function fetchPredictiveZones():Promise<PredictiveZoneDTO[]>{return apiGet<PredictiveZoneDTO[]>('/maps/predictive-zones')}
