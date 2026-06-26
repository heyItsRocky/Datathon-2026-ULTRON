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
    id: stringValue(record.id, 'UNKNOWN-CASE'),
    type: stringValue(record.type),
    district: stringValue(record.district),
    location: stringValue(record.location),
    date: stringValue(record.date, ''),
    time: stringValue(record.time, ''),
    status: stringValue(record.status, 'Open'),
    description: stringValue(record.description, 'No description available'),
    riskLevel: stringValue(record.riskLevel, 'LOW'),
    moDescription: stringValue(record.moDescription, 'No MO description available'),
    victim: stringValue(record.victim, 'Unknown'),
    criminals: stringArray(record.criminals),
    evidence: stringArray(record.evidence),
    timeline: timelineArray(record.timeline),
    lat: numberValue(record.lat),
    lng: numberValue(record.lng),
  };
}

export function adaptCriminal(raw: unknown): CriminalDTO {
  const record = asRecord(raw);
  return {
    id: stringValue(record.id, 'UNKNOWN-CRIMINAL'),
    name: stringValue(record.name),
    alias: stringValue(record.alias, 'N/A'),
    dob: stringValue(record.dob, ''),
    photo: typeof record.photo === 'string' ? record.photo : null,
    district: stringValue(record.district),
    riskScore: numberValue(record.riskScore),
    priors: numberValue(record.priors),
    status: stringValue(record.status, 'Active'),
    moSignature: stringValue(record.moSignature, 'No MO signature available'),
    associatedCrimes: stringArray(record.associatedCrimes),
    associates: stringArray(record.associates),
    riskFactors: riskFactors(record.riskFactors),
  };
}

export function adaptCrimeDto<T>(dto: T): T { return dto; }
