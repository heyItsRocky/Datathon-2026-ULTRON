import { apiGet } from '@/shared/api/client';
import { adaptCyberIncident, adaptDomainIntelligence, adaptEvidenceRecord, adaptIpIntelligence, adaptNetworkFlow, type CyberIncidentDTO, type DomainIntelligenceDTO, type EvidenceRecordDTO, type IpIntelligenceDTO, type NetworkFlowDTO } from '@/shared/api/dto-adapters/cyber';

export interface CyberStatsDTO { totals:{totalIncidents:number;openIncidents:number;criticalCount:number;avgResponseHours:number}; typeBreakdown:Array<{type:string;count:number}>; monthlyTrend:Array<{month:string;incidents:number}>; recentCritical:CyberIncidentDTO[] }
interface RawCyberStats { totals?:CyberStatsDTO['totals']; typeBreakdown?:CyberStatsDTO['typeBreakdown']; monthlyTrend?:CyberStatsDTO['monthlyTrend']; recentCritical?:unknown[] }
function adaptStats(raw: RawCyberStats): CyberStatsDTO { return {totals:raw.totals??{totalIncidents:0,openIncidents:0,criticalCount:0,avgResponseHours:0}, typeBreakdown:raw.typeBreakdown??[], monthlyTrend:raw.monthlyTrend??[], recentCritical:(raw.recentCritical??[]).map(adaptCyberIncident)}; }
export async function fetchCyberIncidents(): Promise<CyberIncidentDTO[]> { return (await apiGet<unknown[]>('/cyber/incidents')).map(adaptCyberIncident); }
export async function fetchCyberIncidentDetail(id: string): Promise<CyberIncidentDTO> { return adaptCyberIncident(await apiGet<unknown>(`/cyber/incidents/${encodeURIComponent(id)}`)); }
export async function fetchIpIntelligence(ip: string): Promise<IpIntelligenceDTO> { return adaptIpIntelligence(await apiGet<unknown>(`/cyber/ip/${encodeURIComponent(ip)}`)); }
export async function fetchDomainIntelligence(domain: string): Promise<DomainIntelligenceDTO> { return adaptDomainIntelligence(await apiGet<unknown>(`/cyber/domain/${encodeURIComponent(domain)}`)); }
export async function fetchEvidenceRecords(): Promise<EvidenceRecordDTO[]> { return (await apiGet<unknown[]>('/cyber/evidence')).map(adaptEvidenceRecord); }
export async function fetchNetworkFlows(): Promise<NetworkFlowDTO[]> { return (await apiGet<unknown[]>('/cyber/flows')).map(adaptNetworkFlow); }
export async function fetchCyberStats(): Promise<CyberStatsDTO> { return adaptStats(await apiGet<RawCyberStats>('/cyber/stats')); }
