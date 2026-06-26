# GOLIATH — PHASE 3 EXECUTION PROMPT

> Copy the entire contents of this file as your prompt to Goliath.
> Phase: 3 of 10 | Focus: Cyber Intelligence Suite

---

## 0. Context

Phase 0 (shell), Phase 1 (Command Center + Dashboard), and Phase 2 (Crime Suite) are complete and verified.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### Current State

- 7 placeholder pages exist in `src/pages/cyber/` — all are `createPlaceholderPage()` stubs
- Routes already exist: `/cyber`, `/cyber/threats`, `/cyber/cases`, `/cyber/cases/:caseId`, `/cyber/fraud-analytics`, `/cyber/digital-evidence`, `/cyber/heatmap`
- Routes you MUST ADD: `/cyber/ip/:ip`, `/cyber/domain/:domain`, `/cyber/flows`
- `src/features/cyber/` does NOT exist — create it (mirror the crime pattern)
- `src/shared/api/dto-adapters/cyber.ts` exists as a stub — replace it
- `src/mocks/` has only crime data — add cyber mock files
- `filterStore` has `cyberFilters: DomainFilters` and `setCyberFilters()` ready to use
- Mock handler (`src/shared/api/mock/handlers.ts`) uses a registry + ID-lookup pattern

---

## 1. Build Protocol

**BUILD → VERIFY → STOP → REPORT**

1. Implement everything listed below
2. Run `npx tsc --noEmit` and `npm run build` — must pass
3. Verify against checklist
4. Report back
5. **Do NOT proceed to Phase 4 until instructed**

---

## 2. Hard Rules

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **MAY modify** | `router/routes.tsx`, `shared/api/mock/handlers.ts`, `shared/api/dto-adapters/cyber.ts` |
| **No new design tokens** | Use CSS variables from `globals.css` only |
| **No component duplication** | Check `src/shared/components/index.ts` first |
| **All 4 states required** | loading, empty, error, populated on every data-dependent page |
| **Mock mode** | All data from `src/mocks/` or inline |
| **Icons** | Lucide only |
| **Types** | No `any` |
| **Named exports** for components and hooks | |
| **Mirror Phase 2 crime pattern** | Same architecture: API module → DTO adapters → hooks → components → pages |

---

## 3. Build Order — 14 Steps

---

### Step 1 — Create Mock Data Files

#### `src/mocks/cyber-incidents.json`

Array of **100+** cyber incident records:

```json
{
  "id": "CYB/2026/001",
  "type": "Phishing",
  "severity": "high",
  "status": "Under Investigation",
  "title": "Phishing campaign targeting bank customers",
  "description": "Organized phishing campaign mimicking State Bank of India login pages...",
  "date": "2026-06-15",
  "detectedAt": "2026-06-15T08:30:00Z",
  "source": "SOC Alert",
  "target": "bank-secure.com",
  "affectedSystems": ["mail-server-01", "web-gateway-03"],
  "indicators": {
    "ips": ["192.168.1.100", "10.0.0.55"],
    "domains": ["bank-secure-login.com", "sbi-verify.net"],
    "hashes": ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"]
  },
  "attackVector": "Email phishing",
  "impact": "Potential credential compromise of 200+ users",
  "remediation": "Blocked domains, alerted users, password reset initiated",
  "assignedTo": "Cyber Cell A",
  "timeline": [
    { "date": "2026-06-15", "event": "Phishing campaign detected" },
    { "date": "2026-06-15", "event": "Domains blocked" },
    { "date": "2026-06-16", "event": "Forensic analysis started" }
  ],
  "evidence": ["EV-001", "EV-002"]
}
```

Requirements:
- **Types:** Phishing, Malware, Ransomware, DDoS, Data Breach, Social Engineering, Insider Threat, Web Defacement, Cyber Fraud, Identity Theft
- **Severities:** extreme (10%), high (25%), medium (40%), low (25%)
- **Statuses:** Under Investigation, Open, Resolved, Pending Review, False Positive
- **Districts:** Same 10 districts as crime (cross-reference)
- Include `indicators.ips` (1-3 IPs per incident) and `indicators.domains` (0-2 domains per incident)
- Include `timeline` with 3-8 entries
- Include `evidence` array

#### `src/mocks/ip-intelligence.json`

Array of **20+** IP intelligence records:

```json
{
  "ip": "192.168.1.100",
  "reputation": "high",
  "reputationScore": 23,
  "geolocation": {
    "city": "Bengaluru",
    "region": "Karnataka",
    "country": "India",
    "lat": 12.9716,
    "lng": 77.5946
  },
  "network": {
    "isp": "BSNL",
    "asn": "AS9829",
    "org": "BSNL Ltd",
    "type": "Broadband"
  },
  "threatData": {
    "riskLevel": 78,
    "incidentCount": 5,
    "firstSeen": "2024-08-12",
    "lastSeen": "2026-06-20",
    "categories": ["Phishing", "Malware C2"]
  },
  "associatedIncidents": [
    { "id": "CYB/2026/001", "type": "Phishing", "target": "bank-secure.com" },
    { "id": "CYB/2026/012", "type": "Hacking", "target": "corpdata.in" }
  ]
}
```

#### `src/mocks/domain-intelligence.json`

Array of **15+** domain intelligence records:

```json
{
  "domain": "bank-secure-login.com",
  "threatScore": 87,
  "riskLevel": "high",
  "whois": {
    "registrar": "Namecheap",
    "creationDate": "2026-05-01",
    "expirationDate": "2027-05-01",
    "organization": "Privacy Protection",
    "country": "IS"
  },
  "ssl": {
    "valid": false,
    "issuer": null,
    "expiryDate": null
  },
  "dns": {
    "aRecords": ["192.168.1.100"],
    "mxRecords": [],
    "nsRecords": ["ns1.fake-dns.com", "ns2.fake-dns.com"]
  },
  "phishingProbability": 92,
  "categories": ["Phishing", "Suspicious"],
  "associatedIncidents": [
    { "id": "CYB/2026/001", "type": "Phishing" }
  ]
}
```

#### `src/mocks/evidence-records.json`

Array of **30+** evidence records:

```json
{
  "id": "EV-001",
  "type": "Email",
  "title": "Phishing email screenshot",
  "description": "Screenshot of the phishing email targeting bank customers",
  "caseId": "CYB/2026/001",
  "collectedAt": "2026-06-15T09:00:00Z",
  "collectedBy": "Inspector Sharma",
  "status": "Collected",
  "chainOfCustody": [
    { "action": "Collected", "by": "Inspector Sharma", "at": "2026-06-15T09:00:00Z" },
    { "action": "Analyzed", "by": "Forensic Lab A", "at": "2026-06-16T14:30:00Z" }
  ],
  "hash": "sha256:a1b2c3d4e5f6..."
}
```

#### `src/mocks/network-flows.json`

Array of **50+** network flow records:

```json
{
  "id": "FLOW-001",
  "timestamp": "2026-06-15T08:15:00Z",
  "sourceIp": "203.0.113.50",
  "destIp": "192.168.1.100",
  "sourcePort": 44321,
  "destPort": 443,
  "protocol": "TCP",
  "bytes": 152400,
  "packets": 320,
  "duration": 45,
  "threatIndicator": true,
  "threatType": "Data exfiltration"
}
```

---

### Step 2 — Update Mock Handlers

**File:** `src/shared/api/mock/handlers.ts`

Add cyber data to the registry and ID-lookup logic:

```typescript
import cyberIncidents from '@/mocks/cyber-incidents.json';
import ipIntelligence from '@/mocks/ip-intelligence.json';
import domainIntelligence from '@/mocks/domain-intelligence.json';
import evidenceRecords from '@/mocks/evidence-records.json';
import networkFlows from '@/mocks/network-flows.json';

const registry: Record<string, unknown> = {
  // existing entries...
  '/cyber/incidents': cyberIncidents,
  '/cyber/evidence': evidenceRecords,
  '/cyber/flows': networkFlows,
  '/cyber/stats': { /* computed stats */ },
};

// ID-based lookups:
if (key.startsWith('/cyber/incidents/')) {
  const id = key.split('/')[3];
  const found = (cyberIncidents as any[]).find(c => c.id === id);
  if (!found) throw new Error(`Incident not found: ${id}`);
  return found as T;
}

// IP intelligence lookup:
if (key.startsWith('/cyber/ip/')) {
  const ip = key.split('/')[3];
  const found = (ipIntelligence as any[]).find(i => i.ip === ip);
  if (!found) throw new Error(`IP not found: ${ip}`);
  return found as T;
}

// Domain intelligence lookup:
if (key.startsWith('/cyber/domain/')) {
  const domain = key.split('/')[3];
  const found = (domainIntelligence as any[]).find(d => d.domain === domain);
  if (!found) throw new Error(`Domain not found: ${domain}`);
  return found as T;
}
```

Also add a `/cyber/stats` endpoint returning computed stats object with total incidents, open incidents, critical count, type breakdown, monthly trend.

---

### Step 3 — Update DTO Adapters

**File:** `src/shared/api/dto-adapters/cyber.ts`

Replace the stub with real types and adapters:

```typescript
export interface CyberIncidentDTO {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  date: string;
  detectedAt: string;
  source: string;
  target: string;
  affectedSystems: string[];
  indicators: { ips: string[]; domains: string[]; hashes: string[] };
  attackVector: string;
  impact: string;
  remediation: string;
  assignedTo: string;
  timeline: { date: string; event: string }[];
  evidence: string[];
}

export interface IpIntelligenceDTO {
  ip: string;
  reputation: string;
  reputationScore: number;
  geolocation: { city: string; region: string; country: string; lat: number; lng: number };
  network: { isp: string; asn: string; org: string; type: string };
  threatData: { riskLevel: number; incidentCount: number; firstSeen: string; lastSeen: string; categories: string[] };
  associatedIncidents: { id: string; type: string; target: string }[];
}

export interface DomainIntelligenceDTO { ... }
export interface EvidenceRecordDTO { ... }
export interface NetworkFlowDTO { ... }

export function adaptCyberIncident(raw: any): CyberIncidentDTO { ... }
export function adaptIpIntelligence(raw: any): IpIntelligenceDTO { ... }
export function adaptDomainIntelligence(raw: any): DomainIntelligenceDTO { ... }
export function adaptEvidenceRecord(raw: any): EvidenceRecordDTO { ... }
export function adaptNetworkFlow(raw: any): NetworkFlowDTO { ... }
```

Handle null/missing fields gracefully.

---

### Step 4 — Create Feature API Module

**Create directory:** `src/features/cyber/api/`

**File:** `src/features/cyber/api/cyberApi.ts`

```typescript
import { apiGet } from '@/shared/api/client';
import { adaptCyberIncident, adaptIpIntelligence, adaptDomainIntelligence,
         adaptEvidenceRecord, adaptNetworkFlow,
         type CyberIncidentDTO, type IpIntelligenceDTO,
         type DomainIntelligenceDTO, type EvidenceRecordDTO, type NetworkFlowDTO } from '@/shared/api/dto-adapters/cyber';

export async function fetchCyberIncidents(): Promise<CyberIncidentDTO[]> {
  const raw = await apiGet<any[]>('/cyber/incidents');
  return raw.map(adaptCyberIncident);
}

export async function fetchCyberIncidentDetail(id: string): Promise<CyberIncidentDTO> {
  const raw = await apiGet<any>(`/cyber/incidents/${id}`);
  return adaptCyberIncident(raw);
}

export async function fetchIpIntelligence(ip: string): Promise<IpIntelligenceDTO> {
  const raw = await apiGet<any>(`/cyber/ip/${ip}`);
  return adaptIpIntelligence(raw);
}

export async function fetchDomainIntelligence(domain: string): Promise<DomainIntelligenceDTO> {
  const raw = await apiGet<any>(`/cyber/domain/${domain}`);
  return adaptDomainIntelligence(raw);
}

export async function fetchEvidenceRecords(): Promise<EvidenceRecordDTO[]> {
  const raw = await apiGet<any[]>('/cyber/evidence');
  return raw.map(adaptEvidenceRecord);
}

export async function fetchNetworkFlows(): Promise<NetworkFlowDTO[]> {
  const raw = await apiGet<any[]>('/cyber/flows');
  return raw.map(adaptNetworkFlow);
}

export async function fetchCyberStats(): Promise<any> {
  return apiGet('/cyber/stats');
}
```

---

### Step 5 — Create Query Hooks

**Create directory:** `src/features/cyber/hooks/`

All hooks use `@tanstack/react-query` with `useQuery`.

#### `src/features/cyber/hooks/useCyberIncidents.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchCyberIncidents } from '../api/cyberApi';

export function useCyberIncidents() {
  return useQuery({
    queryKey: ['cyber-incidents'],
    queryFn: () => fetchCyberIncidents(),
  });
}
```

#### `src/features/cyber/hooks/useCyberIncidentDetail.ts`
- Query key: `['cyber-incident', id]`
- Enabled: `!!id`

#### `src/features/cyber/hooks/useIpIntelligence.ts`
- Query key: `['ip-intelligence', ip]`
- Enabled: `!!ip`

#### `src/features/cyber/hooks/useDomainIntelligence.ts`
- Query key: `['domain-intelligence', domain]`
- Enabled: `!!domain`

#### `src/features/cyber/hooks/useEvidenceRecords.ts`
- Query key: `['cyber-evidence']`
- Optional: filter by `caseId`

#### `src/features/cyber/hooks/useNetworkFlows.ts`
- Query key: `['network-flows']`

#### `src/features/cyber/hooks/useCyberFilters.ts`
Same pattern as `useCrimeFilters` but using `cyberFilters` / `setCyberFilters`:

```typescript
import { useFilterStore } from '@/stores/filterStore';

export function useCyberFilters() {
  const filters = useFilterStore((s) => s.cyberFilters);
  const setCyberFilters = useFilterStore((s) => s.setCyberFilters);
  return {
    filters,
    setType: (type: string) => setCyberFilters({ type }),
    setSeverity: (severity: string) => setCyberFilters({ severity }),
    setStatus: (status: string) => setCyberFilters({ status }),
    reset: () => setCyberFilters({}),
  };
}
```

---

### Step 6 — Create Shared Cyber Components

#### `src/features/cyber/components/CyberIncidentTable.tsx`

- Columns: ID, Type, Severity (color badge), Date, Status, Target, Actions
- Sortable headers
- Row click → navigate to `/cyber/cases/:id`
- Filter bar: Type dropdown, Severity dropdown, Status dropdown, Search
- Pagination (20 per page)
- States: Loading (10 skeleton rows), Empty, Error, Populated

#### `src/features/cyber/components/EvidenceChain.tsx`

- Shows chain-of-custody for a single evidence item
- Timeline-style layout with actions listed chronologically
- Each step: action name, person, timestamp
- Glass card container

#### `src/features/cyber/components/ThreatCard.tsx`

- Compact card showing a correlated threat
- Threat type, severity badge, linked entities, brief description

---

### Step 7 — Build Cyber Dashboard (CyberOverviewPage)

**File:** `src/pages/cyber/CyberOverviewPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/cyber`

**Sections:**
1. **PageHeader** — "Cyber Intelligence Dashboard" with subtitle
2. **KPI Row** (4 `KpiCard`s):
   - Total Incidents, Open Cases, Critical (extreme severity), Avg Response Time
   - Icons: Shield, AlertTriangle, Skull, Clock
3. **Two-column grid:**
   - **Left (2/3):** Incident Type Breakdown — Recharts `PieChart` or `BarChart`
   - **Right (1/3):** Recent Critical Incidents — compact feed with severity badges
4. **Bottom:** Monthly Trend — Recharts `AreaChart` showing cyber incidents over months

**States:** Loading (skeleton), Empty, Error, Populated

---

### Step 8 — Build Incident List Page (CyberCasesPage)

**File:** `src/pages/cyber/CyberCasesPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/cyber/cases`

**Sections:**
1. **PageHeader** — "Cyber Incidents" with total count
2. **Filter bar** — Type, Severity, Status dropdowns + search
3. **CyberIncidentTable** — full interactive table

**States:** Loading, Empty, Error, Populated

---

### Step 9 — Build Incident Detail Page (CyberCaseDetailPage)

**File:** `src/pages/cyber/CyberCaseDetailPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/cyber/cases/:caseId`

**Sections:**
1. **Back + Status bar** — [← Cyber Incidents] Incident ID, Status badge, Severity badge
2. **Two-column layout:**
   - **Left (2/3):**
     - Incident Information — title, type, description, source, attack vector, impact, remediation
     - Timeline — chronological case events
     - IOCs — IPs, domains, hashes displayed as tag/badge groups
   - **Right (1/3):**
     - Quick Info — assigned to, detected at, affected systems count
     - Evidence list — linked evidence items as clickable cards

**States:** Loading, Empty ("Incident not found"), Error, Populated

---

### Step 10 — Build IP Intelligence Page (NEW)

**File:** `src/pages/cyber/IpIntelligencePage.tsx` — **CREATE**
**Route:** `/cyber/ip/:ip` — **must add to routes.tsx**

**Sections:**
1. **IP Header** — IP address display, Reputation badge (reputationScore), action buttons [Enrich Now] [Add to Investigation] (placeholder)
2. **Three-column intelligence grid:**
   - **Geolocation:** City, Region, Country, Lat/Lng
   - **Network Info:** ISP, ASN, Organization, Type
   - **Threat Data:** Risk Level (0-100 bar), Incident Count, First/Last Seen, Categories (as tags)
3. **Associated Incidents** — table of linked incidents with type and target

**States:** Loading, Empty ("IP not found"), Error, Populated

---

### Step 11 — Build Domain Intelligence Page (NEW)

**File:** `src/pages/cyber/DomainIntelligencePage.tsx` — **CREATE**
**Route:** `/cyber/domain/:domain` — **must add to routes.tsx**

**Sections:**
1. **Domain Header** — Domain name, Threat Score badge, Risk Level badge
2. **Two-column layout:**
   - **Left (1/2):**
     - WHOIS Information — registrar, creation/expiration dates, organization, country
     - SSL Status — valid/invalid, issuer, expiry
     - DNS Records — A, MX, NS records as collapsible lists
   - **Right (1/2):**
     - Phishing Probability — large percentage display with color coding
     - Categories — tag badges
     - Associated Incidents — linked incident cards

**States:** Loading, Empty ("Domain not found"), Error, Populated

---

### Step 12 — Build Evidence Tracker (DigitalEvidencePage)

**File:** `src/pages/cyber/DigitalEvidencePage.tsx` — **REWRITE** (was placeholder)
**Route:** `/cyber/digital-evidence`

**Sections:**
1. **PageHeader** — "Digital Evidence Tracker"
2. **Filter bar** — Search, Case ID filter, Status filter, Type filter
3. **Evidence list** — card-based layout showing:
   - Evidence ID, title, type, status, collected by, case ID
   - Click to expand and show chain-of-custody using EvidenceChain component
4. **Chain-of-custody detail** — expands inline or slides in on selection

**States:** Loading, Empty ("No evidence records"), Error, Populated

---

### Step 13 — Build Threat Intelligence Page (CyberThreatsPage)

**File:** `src/pages/cyber/CyberThreatsPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/cyber/threats`

**Sections:**
1. **PageHeader** — "Threat Intelligence"
2. **Summary strip** — Total threats tracked, Active campaigns, High-severity alerts
3. **Threat cards** — grid of `ThreatCard` components showing:
   - Threat type, severity, linked IPs/domains, incidents count
   - Click to expand correlation details
4. **Correlation view** — selected threat showing all linked IPs, domains, and incidents

**States:** Loading, Empty, Error, Populated

---

### Step 14 — Update Routes

**File:** `src/router/routes.tsx`

Add lazy imports and new routes:

```typescript
const IpIntelligencePage = lazy(() => import('@/pages/cyber/IpIntelligencePage'));
const DomainIntelligencePage = lazy(() => import('@/pages/cyber/DomainIntelligencePage'));
const NetworkFlowPage = lazy(() => import('@/pages/cyber/NetworkFlowPage'));

// Add to protectedRoutes:
{ path: '/cyber/ip/:ip', element: IpIntelligencePage },
{ path: '/cyber/domain/:domain', element: DomainIntelligencePage },
{ path: '/cyber/flows', element: NetworkFlowPage },
```

---

## 4. File Manifest

| Action | File |
|--------|------|
| CREATE | `src/mocks/cyber-incidents.json` |
| CREATE | `src/mocks/ip-intelligence.json` |
| CREATE | `src/mocks/domain-intelligence.json` |
| CREATE | `src/mocks/evidence-records.json` |
| CREATE | `src/mocks/network-flows.json` |
| MODIFY | `src/shared/api/mock/handlers.ts` |
| MODIFY | `src/shared/api/dto-adapters/cyber.ts` |
| CREATE | `src/features/cyber/api/cyberApi.ts` |
| CREATE | `src/features/cyber/hooks/useCyberIncidents.ts` |
| CREATE | `src/features/cyber/hooks/useCyberIncidentDetail.ts` |
| CREATE | `src/features/cyber/hooks/useIpIntelligence.ts` |
| CREATE | `src/features/cyber/hooks/useDomainIntelligence.ts` |
| CREATE | `src/features/cyber/hooks/useEvidenceRecords.ts` |
| CREATE | `src/features/cyber/hooks/useNetworkFlows.ts` |
| CREATE | `src/features/cyber/hooks/useCyberFilters.ts` |
| CREATE | `src/features/cyber/components/CyberIncidentTable.tsx` |
| CREATE | `src/features/cyber/components/EvidenceChain.tsx` |
| CREATE | `src/features/cyber/components/ThreatCard.tsx` |
| REWRITE | `src/pages/cyber/CyberOverviewPage.tsx` |
| REWRITE | `src/pages/cyber/CyberCasesPage.tsx` |
| REWRITE | `src/pages/cyber/CyberCaseDetailPage.tsx` |
| REWRITE | `src/pages/cyber/DigitalEvidencePage.tsx` |
| REWRITE | `src/pages/cyber/CyberThreatsPage.tsx` |
| CREATE | `src/pages/cyber/IpIntelligencePage.tsx` |
| CREATE | `src/pages/cyber/DomainIntelligencePage.tsx` |
| CREATE | `src/pages/cyber/NetworkFlowPage.tsx` |
| MODIFY | `src/router/routes.tsx` |

---

## 5. Verification Checklist

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Cyber Dashboard at `/cyber` shows KPI cards with cyber stats
- [ ] Cyber Dashboard shows incident type breakdown chart
- [ ] Incident List at `/cyber/cases` shows filterable, paginated table
- [ ] Incident Detail at `/cyber/cases/:id` shows full breakdown with timeline + IOCs
- [ ] IP Intelligence at `/cyber/ip/:ip` shows geo, network, threat, associated incidents
- [ ] Domain Intelligence at `/cyber/domain/:domain` shows WHOIS, SSL, DNS, phishing probability
- [ ] Evidence Tracker at `/cyber/digital-evidence` shows evidence cards with chain-of-custody
- [ ] Threat Intelligence at `/cyber/threats` shows threat cards with correlation
- [ ] Network Flows at `/cyber/flows` shows flow table (route exists)
- [ ] All pages have loading, empty, error, populated states
- [ ] Mock mode works — no backend dependency
- [ ] No frozen files modified
- [ ] No shared components duplicated

---

## 6. Report Format

```
## Phase 3 Complete — Report

### Files Created
- ...

### Files Modified
- ...

### Verification Results
- tsc --noEmit: PASS/FAIL
- npm run build: PASS/FAIL
- [checklist item]: PASS/FAIL

### Issues Encountered
- ...

### Ready for Phase 4
YES / NO
```

---

**Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.**
