import { apiGet } from '@/shared/api/client';
import { adaptEmergingTrends, adaptIntelBriefs, adaptPredictiveZones, adaptRedZones, adaptSocioEconomicData, type EmergingTrend, type IntelBrief, type PredictiveZone, type RedZone, type SocioEconomicData } from '@/shared/api/dto-adapters/intel';

export async function fetchIntelBriefs(): Promise<IntelBrief[]> { return adaptIntelBriefs(await apiGet<unknown[]>('/intel/briefs')); }
export async function fetchEmergingTrends(): Promise<EmergingTrend[]> { return adaptEmergingTrends(await apiGet<unknown[]>('/intel/trends')); }
export async function fetchRedZones(): Promise<RedZone[]> { return adaptRedZones(await apiGet<unknown[]>('/intel/red-zones')); }
export async function fetchPredictiveZones(): Promise<PredictiveZone[]> { return adaptPredictiveZones(await apiGet<unknown[]>('/intel/predictive-zones')); }
export async function fetchSocioEconomicData(): Promise<SocioEconomicData> { return adaptSocioEconomicData(await apiGet<unknown>('/intel/socio-economic')); }
