export type IntelCategory = 'crime' | 'cyber' | 'intel';
export type IntelPriority = 'low' | 'medium' | 'high';
export type IntelTrend = 'up' | 'down' | 'stable';
export type RedZoneSeverity = 'high' | 'medium' | 'low';
export type PredictiveRisk = 'critical' | 'high' | 'medium' | 'low';

export interface IntelBrief {
  id: string;
  title: string;
  summary: string;
  category: IntelCategory;
  priority: IntelPriority;
  district: string;
  date: string;
  trend: IntelTrend;
  percentChange: number;
  recommendation: string;
  author: string;
  tags: string[];
  relatedCases: string[];
}

export interface EmergingTrend {
  id: string;
  rank: number;
  name: string;
  percentChange: number;
  direction: IntelTrend;
  district: string;
  category: string;
  description: string;
  chartData: Array<{ month: string; value: number }>;
}

export interface RedZone {
  districtId: string;
  districtName: string;
  severity: RedZoneSeverity;
  trend: IntelTrend;
  incidentCount: number;
  percentChange: number;
  topCrimeTypes: string[];
  riskScore: number;
  lastUpdated: string;
}

export interface PredictiveZone {
  zoneId: string;
  districtId: string;
  districtName: string;
  predictedCrimeType: string;
  confidenceScore: number;
  riskLevel: PredictiveRisk;
  predictedChange: number;
  timeframe: string;
  recommendation: string;
  contributingFactors: string[];
  coordinates: { lat: number; lng: number };
}

export interface SocioEconomicCorrelation {
  xLabel: string;
  yLabel: string;
  correlationCoefficient: number;
  strength: string;
  dataPoints: Array<{ district: string; x: number; y: number; crimeRate?: number }>;
}

export interface SocioEconomicData {
  correlations: SocioEconomicCorrelation[];
  demographics: Array<{ district: string; population: number; literacyRate: number; povertyRate: number; crimeRate: number }>;
}

function rec(raw: unknown): Record<string, unknown> { return raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}; }
function str(value: unknown, fallback = ''): string { return typeof value === 'string' && value.length ? value : fallback; }
function num(value: unknown, fallback = 0): number { return typeof value === 'number' && Number.isFinite(value) ? value : fallback; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
function category(value: unknown): IntelCategory { return value === 'cyber' || value === 'intel' ? value : 'crime'; }
function priority(value: unknown): IntelPriority { return value === 'high' || value === 'medium' ? value : 'low'; }
function trend(value: unknown): IntelTrend { return value === 'down' || value === 'stable' ? value : 'up'; }
function redSeverity(value: unknown): RedZoneSeverity { return value === 'high' || value === 'medium' ? value : 'low'; }
function predictiveRisk(value: unknown): PredictiveRisk { return value === 'critical' || value === 'high' || value === 'medium' ? value : 'low'; }

export function adaptIntelBrief(raw: unknown): IntelBrief { const r = rec(raw); return { id: str(r.id, 'IB-UNKNOWN'), title: str(r.title, 'Untitled Brief'), summary: str(r.summary), category: category(r.category), priority: priority(r.priority), district: str(r.district, 'Karnataka'), date: str(r.date), trend: trend(r.trend), percentChange: num(r.percentChange), recommendation: str(r.recommendation), author: str(r.author, 'KSP Intel AI'), tags: strings(r.tags), relatedCases: strings(r.relatedCases) }; }
export function adaptIntelBriefs(raw: unknown[]): IntelBrief[] { return raw.map(adaptIntelBrief); }
export function adaptEmergingTrend(raw: unknown): EmergingTrend { const r = rec(raw); return { id: str(r.id, 'TR-UNKNOWN'), rank: num(r.rank), name: str(r.name), percentChange: num(r.percentChange), direction: trend(r.direction), district: str(r.district), category: str(r.category), description: str(r.description), chartData: Array.isArray(r.chartData) ? r.chartData.map((item) => { const c = rec(item); return { month: str(c.month), value: num(c.value) }; }) : [] }; }
export function adaptEmergingTrends(raw: unknown[]): EmergingTrend[] { return raw.map(adaptEmergingTrend); }
export function adaptRedZone(raw: unknown): RedZone { const r = rec(raw); return { districtId: str(r.districtId), districtName: str(r.districtName), severity: redSeverity(r.severity), trend: trend(r.trend), incidentCount: num(r.incidentCount), percentChange: num(r.percentChange), topCrimeTypes: strings(r.topCrimeTypes), riskScore: num(r.riskScore), lastUpdated: str(r.lastUpdated) }; }
export function adaptRedZones(raw: unknown[]): RedZone[] { return raw.map(adaptRedZone); }
export function adaptPredictiveZone(raw: unknown): PredictiveZone { const r = rec(raw); const coords = rec(r.coordinates); return { zoneId: str(r.zoneId), districtId: str(r.districtId), districtName: str(r.districtName), predictedCrimeType: str(r.predictedCrimeType), confidenceScore: num(r.confidenceScore), riskLevel: predictiveRisk(r.riskLevel), predictedChange: num(r.predictedChange), timeframe: str(r.timeframe), recommendation: str(r.recommendation), contributingFactors: strings(r.contributingFactors), coordinates: { lat: num(coords.lat), lng: num(coords.lng) } }; }
export function adaptPredictiveZones(raw: unknown[]): PredictiveZone[] { return raw.map(adaptPredictiveZone); }
export function adaptSocioEconomicData(raw: unknown): SocioEconomicData { const r = rec(raw); return { correlations: Array.isArray(r.correlations) ? r.correlations.map((item) => { const c = rec(item); return { xLabel: str(c.xLabel), yLabel: str(c.yLabel), correlationCoefficient: num(c.correlationCoefficient), strength: str(c.strength), dataPoints: Array.isArray(c.dataPoints) ? c.dataPoints.map((point) => { const p = rec(point); return { district: str(p.district), x: num(p.x), y: num(p.y), crimeRate: typeof p.crimeRate === 'number' ? p.crimeRate : undefined }; }) : [] }; }) : [], demographics: Array.isArray(r.demographics) ? r.demographics.map((item) => { const d = rec(item); return { district: str(d.district), population: num(d.population), literacyRate: num(d.literacyRate), povertyRate: num(d.povertyRate), crimeRate: num(d.crimeRate) }; }) : [] }; }
export function adaptIntelDto<T>(dto: T): T { return dto; }
