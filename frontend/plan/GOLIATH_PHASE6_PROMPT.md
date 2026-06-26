# GOLIATH — PHASE 6 EXECUTION PROMPT

> Copy the entire contents of this file as your prompt to Goliath.
> Phase: 6 of 10 | Focus: Strategic Intelligence Hub
> **This is the phase that wins the presentation — executive command page for senior officers.**

---

## 0. Context

Phases 0–5 are complete and verified. The app now has shell + dashboard + crime suite + cyber suite + interactive map + three Cytoscape network graphs.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### Current State

- `src/pages/intel/` — 6 placeholder pages (all `createPlaceholderPage()` stubs)
- Routes exist: `/intel`, `/intel/briefings`, `/intel/reports`, `/intel/watchlists`, `/intel/signals`, `/intel/forecast`
- `src/features/intelligence/` — does NOT exist (create it)
- `src/shared/api/dto-adapters/intel.ts` — exists as stub
- No intel mock data yet
- All existing hooks, API modules, dto-adapters follow strict patterns (see below)

---

## 1. Build Protocol

**BUILD → VERIFY → STOP → REPORT**

1. Implement everything below
2. Run `npx tsc --noEmit` and `npm run build` — must pass
3. Verify against 14-item checklist
4. Report back
5. **Do NOT proceed to Phase 7 until instructed**

---

## 2. Hard Rules

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **MAY modify** | `router/routes.tsx`, `shared/api/mock/handlers.ts`, `shared/api/dto-adapters/intel.ts` |
| **MAY modify** | `src/pages/intel/*` (all 6 placeholder pages) |
| **No new design tokens** | Use CSS variables from `globals.css` |
| **No component duplication** | Check `src/shared/components/index.ts` first; use `<StatusBadge>`, `<KPI>`, `<PageHeader>`, `<KSPHeader>`, `<EmergencyFooter>`, `<DataCard>` etc. |
| **All 4 states required** | loading, empty, error, populated |
| **Mock mode** | All data from `src/mocks/` |
| **Icons** | Lucide only |
| **Types** | No `any` |
| **Existing dep pattern** | Uses `recharts`, `leaflet`, `lucide-react` — already installed |

---

## 3. Reference Patterns

### API Module Pattern (example from Phase 5)
```typescript
// src/features/network/api/networkApi.ts
import { apiGet } from '@/shared/api/client';
import { adaptGraphData, type GraphData } from '@/shared/api/dto-adapters/network';

export async function fetchCrimeNetwork(): Promise<GraphData> {
  const raw = await apiGet<any>('/network/crime');
  return adaptGraphData(raw);
}
```

### Query Hook Pattern (example from Phase 5)
```typescript
// src/features/network/hooks/useCrimeNetwork.ts
import { useQuery } from '@tanstack/react-query';
import { fetchCrimeNetwork } from '../api/networkApi';

export function useCrimeNetwork() {
  return useQuery({
    queryKey: ['crime-network'],
    queryFn: fetchCrimeNetwork,
    staleTime: 5 * 60_000,
  });
}
```

### Mock Handler Pattern
```typescript
// src/shared/api/mock/handlers.ts — add imports + registry entries
import intelBriefs from '@/mocks/intel-briefs.json';
// ...
const registry: Record<string, unknown> = {
  // ...
  '/intel/briefs': intelBriefs,
};
```

---

## 4. Build Order — 12 Steps

---

### Step 1 — Create Mock Data Files

#### `src/mocks/intel-briefs.json`

Array of AI-generated intelligence brief objects:

```json
[
  {
    "id": "IB-2026-001",
    "title": "Bengaluru Urban Cyber Surge",
    "summary": "Cyber fraud cases in Bengaluru Urban have increased 45% month-over-month, correlating with a spike in new phishing domain registrations targeting banking customers.",
    "category": "cyber",
    "priority": "high",
    "district": "Bengaluru Urban",
    "date": "2026-06-24",
    "trend": "up",
    "percentChange": 45,
    "recommendation": "Deploy cyber patrol teams to monitor ATMs and issue public advisory through media channels.",
    "author": "KSP Intel AI",
    "tags": ["cyber fraud", "phishing", "banking"],
    "relatedCases": ["CYB-2026-0042", "CYB-2026-0051"]
  },
  {
    "id": "IB-2026-002",
    "title": "Mysuru Chain Snatching Pattern Shift",
    "summary": "Chain snatching incidents in Mysuru are shifting to evening hours (6–9 PM) near commercial districts. MO analysis shows a single group operating across 3 police station jurisdictions.",
    "category": "crime",
    "priority": "medium",
    "district": "Mysuru",
    "date": "2026-06-23",
    "trend": "up",
    "percentChange": 32,
    "recommendation": "Consider patrol timing adjustment to evening hours and deploy plainclothes officers in commercial areas.",
    "author": "KSP Intel AI",
    "tags": ["chain snatching", "evening", "MO pattern"],
    "relatedCases": ["KSP-2026-0031", "KSP-2026-0032"]
  },
  {
    "id": "IB-2026-003",
    "title": "Belagavi Domestic Violence Underreporting",
    "summary": "Domestic violence cases in Belagavi show 28% increase in reported incidents, likely due to improved outreach rather than actual increase. Correlation with NGO helpline data suggests historical underreporting.",
    "category": "crime",
    "priority": "medium",
    "district": "Belagavi",
    "date": "2026-06-22",
    "trend": "up",
    "percentChange": 28,
    "recommendation": "Continue outreach programs and strengthen victim support infrastructure.",
    "author": "KSP Intel AI",
    "tags": ["domestic violence", "reporting", "outreach"],
    "relatedCases": ["KSP-2026-0015", "KSP-2026-0018"]
  },
  {
    "id": "IB-2026-004",
    "title": "Hubli Vehicle Theft Ring Dismantled",
    "summary": "Intelligence-led operation in Hubli has led to the dismantling of a vehicle theft ring responsible for 15+ stolen vehicles. Three suspects in custody, recovery of 8 vehicles in progress.",
    "category": "crime",
    "priority": "high",
    "district": "Hubli",
    "date": "2026-06-21",
    "trend": "down",
    "percentChange": -25,
    "recommendation": "Monitor for retaliatory activity and continue vehicle recovery operations.",
    "author": "KSP Intel AI",
    "tags": ["vehicle theft", "operation", "dismantled"],
    "relatedCases": ["KSP-2026-0020", "KSP-2026-0021"]
  },
  {
    "id": "IB-2026-005",
    "title": "Karnataka-Goa Border Narcotics Alert",
    "summary": "Increased narcotics trafficking detected along the Karnataka-Goa border corridor. Three new smuggling routes identified. Coordination with Goa Police recommended.",
    "category": "crime",
    "priority": "high",
    "district": "Uttara Kannada",
    "date": "2026-06-20",
    "trend": "up",
    "percentChange": 60,
    "recommendation": "Coordinate with Goa Police for joint border patrol operations.",
    "author": "KSP Intel AI",
    "tags": ["narcotics", "border", "smuggling"],
    "relatedCases": ["KSP-2026-0009"]
  }
]
```

Create 12+ briefs spanning all districts, crime types (murder, theft, cyber fraud, DV, narcotics, vehicle theft, chain snatching), and all 3 priorities (low/medium/high).

#### `src/mocks/intel-emerging-trends.json`

```json
[
  {
    "id": "TR-001",
    "rank": 1,
    "name": "Cyber Fraud",
    "percentChange": 45,
    "direction": "up",
    "district": "Bengaluru Urban",
    "category": "cyber",
    "description": "Phishing and banking fraud rising sharply, correlated with new domain registrations.",
    "chartData": [
      { "month": "Jan", "value": 45 },
      { "month": "Feb", "value": 52 },
      { "month": "Mar", "value": 48 },
      { "month": "Apr", "value": 61 },
      { "month": "May", "value": 73 },
      { "month": "Jun", "value": 89 }
    ]
  },
  {
    "id": "TR-002",
    "rank": 2,
    "name": "Chain Snatching",
    "percentChange": 32,
    "direction": "up",
    "district": "Mysuru",
    "category": "crime",
    "description": "Shift to evening hours near commercial districts.",
    "chartData": [
      { "month": "Jan", "value": 22 },
      { "month": "Feb", "value": 25 },
      { "month": "Mar", "value": 24 },
      { "month": "Apr", "value": 30 },
      { "month": "May", "value": 35 },
      { "month": "Jun", "value": 38 }
    ]
  },
  {
    "id": "TR-003",
    "rank": 3,
    "name": "Domestic Violence",
    "percentChange": 28,
    "direction": "up",
    "district": "Belagavi",
    "category": "crime",
    "description": "Increase driven by improved reporting, not actual rise.",
    "chartData": [
      { "month": "Jan", "value": 15 },
      { "month": "Feb", "value": 17 },
      { "month": "Mar", "value": 18 },
      { "month": "Apr", "value": 20 },
      { "month": "May", "value": 22 },
      { "month": "Jun", "value": 24 }
    ]
  },
  {
    "id": "TR-004",
    "rank": 4,
    "name": "Burglary",
    "percentChange": 15,
    "direction": "up",
    "district": "Bengaluru Rural",
    "category": "crime",
    "description": "Night-time residential burglaries in developing areas.",
    "chartData": [
      { "month": "Jan", "value": 30 },
      { "month": "Feb", "value": 32 },
      { "month": "Mar", "value": 31 },
      { "month": "Apr", "value": 35 },
      { "month": "May", "value": 38 },
      { "month": "Jun", "value": 40 }
    ]
  },
  {
    "id": "TR-005",
    "rank": 5,
    "name": "Vehicle Theft",
    "percentChange": 12,
    "direction": "up",
    "district": "Hubli",
    "category": "crime",
    "description": "Declining after ring dismantled, but still elevated.",
    "chartData": [
      { "month": "Jan", "value": 28 },
      { "month": "Feb", "value": 30 },
      { "month": "Mar", "value": 27 },
      { "month": "Apr", "value": 32 },
      { "month": "May", "value": 25 },
      { "month": "Jun", "value": 20 }
    ]
  }
]
```

Create 8+ trends at minimum.

#### `src/mocks/intel-red-zones.json`

Array of red-zone district objects:

```json
[
  {
    "districtId": "bengaluru-urban",
    "districtName": "Bengaluru Urban",
    "severity": "high",
    "trend": "up",
    "incidentCount": 128,
    "percentChange": 18,
    "topCrimeTypes": ["Cyber Fraud", "Chain Snatching", "Vehicle Theft"],
    "riskScore": 92,
    "lastUpdated": "2026-06-24"
  },
  {
    "districtId": "belagavi",
    "districtName": "Belagavi",
    "severity": "medium",
    "trend": "stable",
    "incidentCount": 67,
    "percentChange": 3,
    "topCrimeTypes": ["Domestic Violence", "Burglary"],
    "riskScore": 65,
    "lastUpdated": "2026-06-24"
  },
  {
    "districtId": "mysuru",
    "districtName": "Mysuru",
    "severity": "medium",
    "trend": "up",
    "incidentCount": 54,
    "percentChange": 12,
    "topCrimeTypes": ["Chain Snatching", "Theft"],
    "riskScore": 71,
    "lastUpdated": "2026-06-24"
  },
  {
    "districtId": "hubli",
    "districtName": "Hubli",
    "severity": "low",
    "trend": "down",
    "incidentCount": 32,
    "percentChange": -8,
    "topCrimeTypes": ["Vehicle Theft"],
    "riskScore": 45,
    "lastUpdated": "2026-06-24"
  }
]
```

Include all 31 districts — at least 3 high severity, 6 medium, rest low.

#### `src/mocks/intel-predictive-zones.json`

```json
[
  {
    "zoneId": "PZ-001",
    "districtId": "bengaluru-urban",
    "districtName": "Bengaluru Urban",
    "predictedCrimeType": "Cyber Fraud",
    "confidenceScore": 88,
    "riskLevel": "critical",
    "predictedChange": 35,
    "timeframe": "next-7-days",
    "recommendation": "Deploy cyber crime response team to Whitefield and Electronic City corridors. Issue targeted SMS alerts to banking customers.",
    "contributingFactors": [
      "New phishing domain registrations up 200%",
      "Seasonal festival spending increase",
      "3 known cyber criminals recently released"
    ],
    "coordinates": { "lat": 12.9716, "lng": 77.5946 }
  }
]
```

Include 8+ predictive zones across districts with varying confidence (60–95%).

#### `src/mocks/intel-socio-economic.json`

```json
{
  "correlations": [
    { "xLabel": "Literacy Rate (%)", "yLabel": "Crime Rate (per 1000)", "correlationCoefficient": -0.72, "strength": "strong-negative", "dataPoints": [
      { "district": "Bengaluru Urban", "x": 89, "y": 8.2, "crimeRate": 8.2 },
      { "district": "Dakshina Kannada", "x": 87, "y": 4.1, "crimeRate": 4.1 },
      { "district": "Belagavi", "x": 74, "y": 6.5, "crimeRate": 6.5 },
      { "district": "Raichur", "x": 55, "y": 9.8, "crimeRate": 9.8 },
      { "district": "Kalaburagi", "x": 61, "y": 8.5, "crimeRate": 8.5 }
    ]},
    { "xLabel": "Poverty Rate (%)", "yLabel": "Crime Rate (per 1000)", "correlationCoefficient": 0.68, "strength": "strong-positive", "dataPoints": [
      { "district": "Bengaluru Urban", "x": 15, "y": 8.2 },
      { "district": "Raichur", "x": 65, "y": 9.8 },
      { "district": "Kalaburagi", "x": 55, "y": 8.5 },
      { "district": "Dakshina Kannada", "x": 20, "y": 4.1 },
      { "district": "Belagavi", "x": 40, "y": 6.5 }
    ]}
  ],
  "demographics": [
    { "district": "Bengaluru Urban", "population": 12000000, "literacyRate": 89, "povertyRate": 15, "crimeRate": 8.2 },
    { "district": "Belagavi", "population": 4800000, "literacyRate": 74, "povertyRate": 40, "crimeRate": 6.5 },
    { "district": "Mysuru", "population": 3000000, "literacyRate": 75, "povertyRate": 35, "crimeRate": 5.8 },
    { "district": "Raichur", "population": 1900000, "literacyRate": 55, "povertyRate": 65, "crimeRate": 9.8 },
    { "district": "Kalaburagi", "population": 2500000, "literacyRate": 61, "povertyRate": 55, "crimeRate": 8.5 },
    { "district": "Dakshina Kannada", "population": 2100000, "literacyRate": 87, "povertyRate": 20, "crimeRate": 4.1 },
    { "district": "Hubli", "population": 1400000, "literacyRate": 78, "povertyRate": 30, "crimeRate": 5.2 },
    { "district": "Uttara Kannada", "population": 1400000, "literacyRate": 82, "povertyRate": 25, "crimeRate": 3.5 }
  ]
}
```

Cover all 31 districts in demographics.

---

### Step 2 — Update Mock Handlers

**File:** `src/shared/api/mock/handlers.ts`

Add imports and registry entries:

```typescript
import intelBriefs from '@/mocks/intel-briefs.json';
import intelEmergingTrends from '@/mocks/intel-emerging-trends.json';
import intelRedZones from '@/mocks/intel-red-zones.json';
import intelPredictiveZones from '@/mocks/intel-predictive-zones.json';
import intelSocioEconomic from '@/mocks/intel-socio-economic.json';

// In registry:
'/intel/briefs': intelBriefs,
'/intel/trends': intelEmergingTrends,
'/intel/red-zones': intelRedZones,
'/intel/predictive-zones': intelPredictiveZones,
'/intel/socio-economic': intelSocioEconomic,
```

---

### Step 3 — Update DTO Adapters

**File:** `src/shared/api/dto-adapters/intel.ts`

Replace stub with:

```typescript
// ── Types ──────────────────────────────────────────────────

export interface IntelBrief {
  id: string;
  title: string;
  summary: string;
  category: 'crime' | 'cyber' | 'intel';
  priority: 'low' | 'medium' | 'high';
  district: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
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
  direction: 'up' | 'down' | 'stable';
  district: string;
  category: string;
  description: string;
  chartData: Array<{ month: string; value: number }>;
}

export interface RedZone {
  districtId: string;
  districtName: string;
  severity: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
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
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
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
  dataPoints: Array<{
    district: string;
    x: number;
    y: number;
    crimeRate?: number;
  }>;
}

export interface SocioEconomicData {
  correlations: SocioEconomicCorrelation[];
  demographics: Array<{
    district: string;
    population: number;
    literacyRate: number;
    povertyRate: number;
    crimeRate: number;
  }>;
}

// ── Adapters ───────────────────────────────────────────────

export function adaptIntelBrief(dto: any): IntelBrief {
  return dto as IntelBrief;
}

export function adaptIntelBriefs(dtos: any[]): IntelBrief[] {
  return dtos.map(adaptIntelBrief);
}

export function adaptEmergingTrends(dtos: any[]): EmergingTrend[] {
  return dtos as EmergingTrend[];
}

export function adaptRedZones(dtos: any[]): RedZone[] {
  return dtos as RedZone[];
}

export function adaptPredictiveZones(dtos: any[]): PredictiveZone[] {
  return dtos as PredictiveZone[];
}

export function adaptSocioEconomicData(dto: any): SocioEconomicData {
  return dto as SocioEconomicData;
}
```

---

### Step 4 — Create Feature API Module

**Create directory:** `src/features/intelligence/api/`

**File:** `src/features/intelligence/api/intelApi.ts`

```typescript
import { apiGet } from '@/shared/api/client';
import {
  adaptIntelBriefs,
  adaptEmergingTrends,
  adaptRedZones,
  adaptPredictiveZones,
  adaptSocioEconomicData,
  type IntelBrief,
  type EmergingTrend,
  type RedZone,
  type PredictiveZone,
  type SocioEconomicData,
} from '@/shared/api/dto-adapters/intel';

export async function fetchIntelBriefs(): Promise<IntelBrief[]> {
  const raw = await apiGet<any[]>('/intel/briefs');
  return adaptIntelBriefs(raw);
}

export async function fetchEmergingTrends(): Promise<EmergingTrend[]> {
  const raw = await apiGet<any[]>('/intel/trends');
  return adaptEmergingTrends(raw);
}

export async function fetchRedZones(): Promise<RedZone[]> {
  const raw = await apiGet<any[]>('/intel/red-zones');
  return adaptRedZones(raw);
}

export async function fetchPredictiveZones(): Promise<PredictiveZone[]> {
  const raw = await apiGet<any[]>('/intel/predictive-zones');
  return adaptPredictiveZones(raw);
}

export async function fetchSocioEconomicData(): Promise<SocioEconomicData> {
  const raw = await apiGet<any>('/intel/socio-economic');
  return adaptSocioEconomicData(raw);
}
```

---

### Step 5 — Create Query Hooks

**Create directory:** `src/features/intelligence/hooks/`

#### `useIntelBriefs.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchIntelBriefs } from '../api/intelApi';

export function useIntelBriefs() {
  return useQuery({
    queryKey: ['intel-briefs'],
    queryFn: fetchIntelBriefs,
    staleTime: 5 * 60_000,
  });
}
```

#### `useEmergingTrends.ts`
Same pattern. queryKey: `['intel-trends']`

#### `useRedZones.ts`
queryKey: `['intel-red-zones']`

#### `usePredictiveZones.ts`
queryKey: `['intel-predictive-zones']`

#### `useSocioEconomicData.ts`
queryKey: `['intel-socio-economic']`

---

### Step 6 — Create Intelligence Hub Components

**Create directory:** `src/features/intelligence/components/`

#### `IntelHubHero.tsx`

The top hero brief section — the first thing senior officers see:

```
┌─ 🧠 Strategic Intelligence Brief — 24 Jun 2026 ───────────────┐
│  3 active red zones · 5 emerging trends · 2 high-risk districts │
└────────────────────────────────────────────────────────────────┘
```

Props:
- `briefsCount: number`
- `redZonesCount: number`
- `trendsCount: number`
- `highRiskDistricts: number`
- `lastUpdated: string`

#### `IntelBriefCard.tsx`

An individual intelligence brief card:

```
┌──────────────────────────────────────────────────────────────┐
│ 🧠 "Bengaluru Urban cyber frauds up 45% MoM — correlation    │
│     detected with new phishing domain registrations."        │
│                                                              │
│ [cyber] [high] · Bengaluru Urban · 24 Jun 2026               │
│ ↗ +45% | 🔗 2 related cases                                  │
│ Deploy cyber patrol teams to monitor ATMs...                 │
└──────────────────────────────────────────────────────────────┘
```

Props: `brief: IntelBrief`, `onClick?: () => void`

States:
- Loading: skeleton card
- Empty: "No intelligence briefs available"
- Error: error card
- Populated: full brief card

#### `EmergingTrendsPanel.tsx`

Ranked list with mini charts:

```
┌─ Top Emerging Trends ──────────────────────────────────────┐
│ #1  Cyber Fraud    ↗ +45%  ▁▃▅▇  [Sparkline chart]         │
│ #2  Chain Snatch   ↗ +32%  ▂▃▄▅  [Sparkline chart]         │
│ #3  DV Cases       ↗ +28%  ▂▃▃▅  [Sparkline chart]         │
│ #4  Burglary       ↗ +15%  ▃▃▄▅  [Sparkline chart]         │
│ #5  Vehicle Theft  ↗ +12%  ▅▅▃▂  [Sparkline chart]         │
│                    [View All →]                              │
└────────────────────────────────────────────────────────────┘
```

Use existing `DataCard` from shared components. For sparklines, use a small Recharts `LineChart` or simple CSS bars.

Props: `trends: EmergingTrend[]`, `isLoading: boolean`, `isEmpty: boolean`, `hasError: boolean`

#### `RedZonePanel.tsx`

District list with severity + trend:

```
┌─ Red-Zone Districts ───────────────────────────────────────┐
│  Bengaluru Urban  [HIGH]    ↗ +18%  128 incidents          │
│  Belagavi         [MEDIUM]  → +3%    67 incidents          │
│  Mysuru           [MEDIUM]  ↗ +12%   54 incidents          │
│  Hubli            [LOW]     ↘ -8%    32 incidents          │
│                                [View All →]                 │
└────────────────────────────────────────────────────────────┘
```

Props: `zones: RedZone[]`, `isLoading`, `isEmpty`, `hasError`

#### `PredictiveZonesPanel.tsx`

Risk zones with confidence:

```
┌─ Predictive Risk Zones ────────────────────────────────────┐
│  Bengaluru Urban  Cyber Fraud  88% confidence [CRITICAL]   │
│  └─ New phishing domain registrations up 200%              │
│  Mysuru           Chain Snatch 74% confidence [HIGH]       │
│  └─ Evening hour shift detected                            │
│  [View All →]                                               │
└────────────────────────────────────────────────────────────┘
```

Props: `zones: PredictiveZone[]`, `isLoading`, `isEmpty`, `hasError`

#### `SocioEconomicPanel.tsx`

Correlation scatter plots using Recharts:

```
┌─ Socio-Economic Correlations ──────────────────────────────┐
│  Crime vs Literacy: -0.72 (strong negative)                │
│  [ScatterChart: x=Literacy, y=Crime Rate, dots by dist]   │
│                                                            │
│  Crime vs Poverty: +0.68 (strong positive)                 │
│  [ScatterChart: x=Poverty, y=Crime Rate, dots by dist]    │
└────────────────────────────────────────────────────────────┘
```

Use Recharts `<ScatterChart>` with `<Scatter>`. Use DESIGN_SYSTEM colors.

Props: `data: SocioEconomicData`, `isLoading`, `isEmpty`, `hasError`

---

### Step 7 — Build Intelligence Hub Page

**File:** `src/pages/intel/IntelHubPage.tsx` — **REWRITE** (was placeholder)

Route: `/intel`

**Layout (top to bottom):**

1. **KSPHeader** (from shared/layout)
2. **PageHeader** — "Strategic Intelligence Hub" with subtitle "Executive command center for Karnataka Police senior leadership"
3. **IntelHubHero** — hero brief strip
4. **Command View** — 2×2 grid:
   - **Top-Left** — `PredictiveZonesPanel` (small Leaflet risk map or just the panel)
   - **Top-Right** — `SocioEconomicPanel` (scatter charts)
   - **Bottom-Left** — `EmergingTrendsPanel`
   - **Bottom-Right** — `RedZonePanel`
5. **AI-Generated Briefs** section — grid of `IntelBriefCard` components (show top 6, "View All" link to `/intel/briefings`)
6. **EmergencyFooter** (from shared/layout)

**Data fetching:** Call all 5 query hooks in parallel. Show loading skeletons until all are ready.

**States:**
- Loading: Full-page skeleton grid matching the layout
- Error: Error banner at top with retry, partial data where available
- Empty: Appropriate empty state per panel
- Populated: Full command view

---

### Step 8 — Build Briefings List Page

**File:** `src/pages/intel/BriefingsPage.tsx` — **REWRITE** (was placeholder)

Route: `/intel/briefings`

**Layout:**
1. PageHeader — "Intelligence Briefings"
2. Filter bar: category dropdown (All / Crime / Cyber), priority dropdown, date range, search
3. Grid of IntelBriefCard components (paginated, 12 per page)
4. Empty state: "No briefings match your filters"

---

### Step 9 — Build Intel Reports Page

**File:** `src/pages/intel/IntelReportsPage.tsx` — **REWRITE**

Route: `/intel/reports`

- Table-style listing of all intelligence output (briefs, trends, zone snapshots)
- Sortable columns: title, date, category, priority, district
- Export button (placeholder)
- Download as PDF button (placeholder)

---

### Step 10 — Build Watchlists Page

**File:** `src/pages/intel/WatchlistsPage.tsx` — **REWRITE**

Route: `/intel/watchlists`

- Create/manage watchlists of districts, crime types, or entities
- Mock data: 3 pre-populated watchlists (Cyber Threats, Repeat Offenders, Red-Zone Districts)
- Each watchlist shows a summary card with linked items

---

### Step 11 — Build Signals Page

**File:** `src/pages/intel/SignalsPage.tsx` — **REWRITE**

Route: `/intel/signals`

- Intelligence signals / alerts feed
- Timeline view of notable events (brief published, zone escalated, trend crossed threshold)
- Filterable by type and date

---

### Step 12 — Build Strategic Forecast Page

**File:** `src/pages/intel/StrategicForecastPage.tsx` — **REWRITE**

Route: `/intel/forecast`

- Detailed predictive zone view
- Shows all predictive zones with confidence scores, factors, recommendations
- Mini map with risk zone markers
- 7-day / 30-day forecast toggle

---

## 5. Layout Architecture Reference

```
┌─ Hero Brief ───────────────────────────────────────────────────┐
│  🧠 Strategic Intelligence Brief — 24 Jun 2026                  │
│  3 active red zones · 5 emerging trends · 2 high-risk districts │
└────────────────────────────────────────────────────────────────┘
┌─ Command View ─────────────────────────────────────────────────┐
│ ┌─ Predictive Risk Map ─────┐ ┌─ Socio-Economic Correlations┐ │
│ │  [Small Leaflet map with  │ │  Crime vs Literacy: -0.72   │ │
│ │   tomorrow's risk zones   │ │  [scatter plot]              │ │
│ │   overlaid in red heat]   │ │  Crime vs Poverty: +0.68   │ │
│ └────────────────────────────┘ └────────────────────────────┘ │
│ ┌─ Top 5 Emerging Trends ───┐ ┌─ Red-Zone Districts ───────┐ │
│ │  #1  Cyber fraud   +45%   │ │  Bengaluru Urban  [HIGH]   │ │
│ │  #2  Chain snatch +32%   │ │  Belagavi         [MEDIUM] │ │
│ │  #3  DV cases     +28%   │ │  Mysuru            [MEDIUM] │ │
│ │  #4  Burglary     +15%   │ │  Hubli             [LOW]   │ │
│ │  #5  Vehicle theft +12%  │ │                  [View All] │ │
│ └────────────────────────────┘ └────────────────────────────┘ │
│ ┌─ AI-Generated Brief Cards ────────────────────────────────┐ │
│ │  🧠 "Bengaluru Urban cyber frauds up 45% MoM..."         │ │
│ │  🧠 "Chain snatching hotspots shifting in Mysuru..."     │ │
│ │  🧠 "Belagavi DV cases +28%..."                          │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. File Manifest

| Action | File |
|--------|------|
| CREATE | `src/mocks/intel-briefs.json` |
| CREATE | `src/mocks/intel-emerging-trends.json` |
| CREATE | `src/mocks/intel-red-zones.json` |
| CREATE | `src/mocks/intel-predictive-zones.json` |
| CREATE | `src/mocks/intel-socio-economic.json` |
| MODIFY | `src/shared/api/mock/handlers.ts` |
| REWRITE | `src/shared/api/dto-adapters/intel.ts` |
| CREATE | `src/features/intelligence/api/intelApi.ts` |
| CREATE | `src/features/intelligence/hooks/useIntelBriefs.ts` |
| CREATE | `src/features/intelligence/hooks/useEmergingTrends.ts` |
| CREATE | `src/features/intelligence/hooks/useRedZones.ts` |
| CREATE | `src/features/intelligence/hooks/usePredictiveZones.ts` |
| CREATE | `src/features/intelligence/hooks/useSocioEconomicData.ts` |
| CREATE | `src/features/intelligence/components/IntelHubHero.tsx` |
| CREATE | `src/features/intelligence/components/IntelBriefCard.tsx` |
| CREATE | `src/features/intelligence/components/EmergingTrendsPanel.tsx` |
| CREATE | `src/features/intelligence/components/RedZonePanel.tsx` |
| CREATE | `src/features/intelligence/components/PredictiveZonesPanel.tsx` |
| CREATE | `src/features/intelligence/components/SocioEconomicPanel.tsx` |
| REWRITE | `src/pages/intel/IntelHubPage.tsx` |
| REWRITE | `src/pages/intel/BriefingsPage.tsx` |
| REWRITE | `src/pages/intel/IntelReportsPage.tsx` |
| REWRITE | `src/pages/intel/WatchlistsPage.tsx` |
| REWRITE | `src/pages/intel/SignalsPage.tsx` |
| REWRITE | `src/pages/intel/StrategicForecastPage.tsx` |

No route changes needed — all 6 routes already exist in `routes.tsx`.

---

## 7. Verification Checklist

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds (expect 3200+ modules)
- [ ] IntelHubPage renders hero brief strip with correct counts
- [ ] Command view shows all 4 panels in a 2×2 grid
- [ ] IntelBriefCard shows title, summary, priority, category, trend
- [ ] EmergingTrendsPanel shows ranked list with sparklines
- [ ] RedZonePanel shows districts with severity badges
- [ ] PredictiveZonesPanel shows confidence scores + recommendations
- [ ] SocioEconomicPanel renders scatter charts with Recharts
- [ ] BriefingsPage shows filterable grid of 12+ briefs
- [ ] All 6 sub-pages render from mock data
- [ ] All 4 states (loading/empty/error/populated) on data-dependent views
- [ ] All data loads in mock mode — no backend dependency
- [ ] No frozen files modified

---

## 8. Demo Moment

**"Strategic Intelligence Hub — the command center for senior leadership. AI-generated intelligence briefs, socio-economic crime correlations, real-time emerging trends, and tomorrow's predictive risk zones with actionable recommendations."**

---

## 9. Report Format

```
## Phase 6 Complete — Report

### Files Created
- ...

### Files Modified / Rewritten
- ...

### Verification Results
- tsc --noEmit: PASS/FAIL
- npm run build: PASS/FAIL
- [checklist items]: PASS/FAIL

### Issues Encountered
- ...

### Ready for Phase 7
YES / NO
```

---

**Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.**
