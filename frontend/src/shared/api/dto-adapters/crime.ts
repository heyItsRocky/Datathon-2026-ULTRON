export interface CrimeTimelineItem {
  date: string;
  event: string;
}

export interface CrimeCaseDTO {
  id: string;
  type: string;
  district: string;
  location: string;
  date: string;
  time: string;
  status: string;
  description: string;
  riskLevel: string;
  moDescription: string;
  victim: string;
  criminals: string[];
  evidence: string[];
  timeline: CrimeTimelineItem[];
  lat: number;
  lng: number;
}

export interface CriminalDTO {
  id: string;
  name: string;
  alias: string;
  dob: string;
  photo: string | null;
  district: string;
  riskScore: number;
  priors: number;
  status: string;
  moSignature: string;
  associatedCrimes: string[];
  associates: string[];
  riskFactors: Record<string, string>;
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback = 'Unknown'): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function timelineArray(value: unknown): CrimeTimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const record = asRecord(item);
    return { date: stringValue(record.date, ''), event: stringValue(record.event, 'Case update') };
  });
}

function riskFactors(value: unknown): Record<string, string> {
  const record = asRecord(value);
  return Object.fromEntries(Object.entries(record).map(([key, factor]) => [key, stringValue(factor, 'LOW')]));
}

export function adaptCrimeCase(raw: unknown): CrimeCaseDTO {
  const record = asRecord(raw);
  return {
    id: stringValue(record.id ?? record.FIR_NUMBER, 'UNKNOWN-CASE'),
    type: stringValue(record.type ?? record.CRIME_TYPE),
    district: stringValue(record.district ?? record.DISTRICT),
    location: stringValue(record.location, ''),
    date: stringValue(record.date ?? record.DATE_OCCURRED ?? record.FIR_DATE, ''),
    time: stringValue(record.time ?? record.TIME_OCCURRED, ''),
    status: stringValue(record.status ?? record.STATUS, 'Open'),
    description: stringValue(record.description ?? record.DESCRIPTION, 'No description available'),
    riskLevel: stringValue(record.riskLevel ?? record.SEVERITY, 'LOW'),
    moDescription: stringValue(record.moDescription ?? record.MODUS_OPERANDI, 'No MO description available'),
    victim: stringValue(record.victim, 'Unknown'),
    criminals: stringArray(record.criminals),
    evidence: stringArray(record.evidence),
    timeline: timelineArray(record.timeline),
    lat: numberValue(record.lat ?? record.LATITUDE),
    lng: numberValue(record.lng ?? record.LONGITUDE),
  };
}

export function adaptCriminal(raw: unknown): CriminalDTO {
  const record = asRecord(raw);
  return {
    id: stringValue(record.id ?? record.CRIMINAL_ID, 'UNKNOWN-CRIMINAL'),
    name: stringValue(record.name ?? record.NAME),
    alias: stringValue(record.alias ?? record.ALIAS, 'N/A'),
    dob: stringValue(record.dob, ''),
    photo: typeof record.photo === 'string' ? record.photo : null,
    district: stringValue(record.district ?? record.DISTRICT),
    riskScore: numberValue(record.riskScore ?? record.RISK_SCORE),
    priors: numberValue(record.priors ?? record.PRIORS ?? record.PREVIOUS_CONVICTIONS),
    status: stringValue(record.status ?? record.STATUS, 'Active'),
    moSignature: stringValue(record.moSignature ?? record.MO_SIGNATURE, 'No MO signature available'),
    associatedCrimes: stringArray(record.associatedCrimes),
    associates: stringArray(record.associates),
    riskFactors: riskFactors(record.riskFactors),
  };
}

export function adaptCrimeDto<T>(dto: T): T { return dto; }
