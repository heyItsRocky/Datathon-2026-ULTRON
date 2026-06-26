import { apiGet } from '@/shared/api/client';
import { adaptGraphData, type GraphData } from '@/shared/api/dto-adapters/network';
export async function fetchCrimeNetwork():Promise<GraphData>{return adaptGraphData(await apiGet<unknown>('/network/crime'))}
export async function fetchCyberNetwork():Promise<GraphData>{return adaptGraphData(await apiGet<unknown>('/network/cyber'))}
export async function fetchCorrelationGraph():Promise<GraphData>{return adaptGraphData(await apiGet<unknown>('/network/correlation'))}
