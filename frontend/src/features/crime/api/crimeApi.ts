import { apiGet } from '@/shared/api/client';
import { adaptCrimeCase, adaptCriminal, type CrimeCaseDTO, type CriminalDTO } from '@/shared/api/dto-adapters/crime';

export interface CrimeStatsDTO {
  totals: {
    totalCases: number;
    openCases: number;
    resolvedRate: number;
    avgResponseDays: number;
  };
  typeBreakdown: Array<{ type: string; count: number }>;
  monthlyTrend: Array<{ month: string; cases: number }>;
  recentCases: CrimeCaseDTO[];
}

export interface MoMatchDTO {
  criminalId: string;
  criminalName: string;
  matchPercentage: number;
  priors: number;
  similarCases: number;
  district: string;
}

interface RawCrimeStats {
  totals?: CrimeStatsDTO['totals'];
  typeBreakdown?: CrimeStatsDTO['typeBreakdown'];
  monthlyTrend?: CrimeStatsDTO['monthlyTrend'];
  recentCases?: unknown[];
}

function adaptCrimeStats(raw: RawCrimeStats): CrimeStatsDTO {
  return {
    totals: raw.totals ?? { totalCases: 0, openCases: 0, resolvedRate: 0, avgResponseDays: 0 },
    typeBreakdown: raw.typeBreakdown ?? [],
    monthlyTrend: raw.monthlyTrend ?? [],
    recentCases: (raw.recentCases ?? []).map(adaptCrimeCase),
  };
}

export async function fetchCrimeCases(_filters?: Record<string, string>): Promise<CrimeCaseDTO[]> {
  const raw = await apiGet<unknown[]>('/crime/cases');
  return raw.map(adaptCrimeCase);
}

export async function fetchCrimeCaseDetail(id: string): Promise<CrimeCaseDTO> {
  const raw = await apiGet<unknown>(`/crime/cases/${encodeURIComponent(id)}`);
  return adaptCrimeCase(raw);
}

export async function fetchCriminals(): Promise<CriminalDTO[]> {
  const raw = await apiGet<unknown[]>('/crime/criminals');
  return raw.map(adaptCriminal);
}

export async function fetchCriminalDetail(id: string): Promise<CriminalDTO> {
  const raw = await apiGet<unknown>(`/crime/criminals/${encodeURIComponent(id)}`);
  return adaptCriminal(raw);
}

export async function fetchCrimeStats(): Promise<CrimeStatsDTO> {
  const raw = await apiGet<RawCrimeStats>('/crime/stats');
  return adaptCrimeStats(raw);
}

export async function matchMO(_description: string, _crimeType?: string, _district?: string): Promise<MoMatchDTO[]> {
  return apiGet<MoMatchDTO[]>('/crime/mo-match');
}
