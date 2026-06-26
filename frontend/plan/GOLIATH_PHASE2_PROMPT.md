# GOLIATH — PHASE 2 EXECUTION PROMPT

> Copy the entire contents of this file as your prompt to Goliath.
> Phase: 2 of 10 | Focus: Crime Intelligence Suite

---

## 0. Context

Phase 0 (shell, routing, design tokens, stores, shared UI kit) and Phase 1 (Command Center + Unified Dashboard) are complete and verified.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### Current State

- 7 placeholder files exist in `src/pages/crime/` (CrimeOverviewPage, CrimeCasesPage, CrimeCaseDetailPage, CrimePatternsPage, CrimeHotspotsPage, CrimeTrendsPage, CrimePredictivePage)
- Routes exist for: `/crime`, `/crime/cases`, `/crime/cases/:caseId`, `/crime/patterns`, `/crime/trends`, `/crime/hotspots`, `/crime/predictive`
- Routes do **NOT** exist yet for criminal list/detail — you must add them
- `src/features/crime/` does NOT exist — create it
- `src/shared/api/dto-adapters/crime.ts` exists as a stub (`export function adaptCrimeDto<T>(dto: T): T { return dto; }`)
- Mock handler (`src/shared/api/mock/handlers.ts`) uses a simple registry pattern
- `filterStore` already has `crimeFilters: DomainFilters` and `setCrimeFilters()`
- Shared components ready: `KpiCard`, `PageHeader`, `LoadingSkeleton` (variant: `card`, `table-row`, `chart`, `map`, `text`), `EmptyState`, `ErrorState`, `StatusBadge`, `RiskBadge`, `SeverityBadge`, `Badge`
- `src/shared/api/client.ts` has `apiGet<T>(url)` which auto-routes to mock mode

---

## 1. Build Protocol

**BUILD → VERIFY → STOP → REPORT**

1. Implement everything listed below (follow the exact build order)
2. Run `npx tsc --noEmit` and `npm run build` — they must pass
3. Verify against the checklist
4. Report back with results
5. **Do NOT proceed to Phase 3 until instructed**

---

## 2. Hard Rules

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **MAY modify** | `router/routes.tsx`, `router/AppRoutes.tsx`, `shared/api/mock/handlers.ts`, `shared/api/dto-adapters/crime.ts` |
| **No new design tokens** | Use CSS variables from `globals.css` only |
| **No component duplication** | Check `src/shared/components/index.ts` before creating anything |
| **All 4 states required** | loading, empty, error, populated on every data-dependent page |
| **Mock mode** | All data comes from `src/mocks/` or inline mock data |
| **Icons** | Use Lucide icons only (already in deps) |
| **Types** | No `any` — use proper types or `unknown` with guards |
| **Named exports** for components and hooks | |
| **Recharts** already installed for charts | |
| **@tanstack/react-query** already installed | |

---

## 3. Build Order — 14 Steps

---

### Step 1 — Create Mock Data Files

#### `src/mocks/crime-cases.json`

Array of **50+** crime case records:

```json
{
  "id": "KSP/2026/001",
  "type": "Murder",
  "district": "Bengaluru City",
  "location": "MG Road, Bengaluru",
  "date": "2026-01-15",
  "time": "22:30",
  "status": "Under Investigation",
  "description": "Stabbing during robbery at electronics store",
  "riskLevel": "HIGH",
  "moDescription": "Armed robbery, stabbing, motorcycle escape",
  "victim": "Prakash Singh",
  "criminals": ["CR-001"],
  "evidence": ["FIRS0001", "PHO0001", "CCT0001"],
  "timeline": [
    { "date": "2026-01-15", "event": "Incident reported" },
    { "date": "2026-01-16", "event": "FIR registered" },
    { "date": "2026-01-17", "event": "Investigation started" }
  ],
  "lat": 12.9716,
  "lng": 77.5946
}
```

Requirements:
- **Types:** Murder, Theft, Assault, Burglary, Robbery, Cyber Crime, Chain Snatching, Domestic Violence
- **Districts:** Bengaluru City, Bengaluru Urban, Mysuru, Belagavi, Hubli-Dharwad, Kalaburagi, Mangaluru, Tumakuru, Shivamogga, Davanagere
- **Statuses:** Under Investigation, Open, Resolved, Pending Review
- **Risk levels:** HIGH, MEDIUM, LOW (distribute across records)
- At least 5 timeline entries per case
- At least 2 evidence items per case
- Realistic lat/lng coordinates for each district

#### `src/mocks/criminals.json`

Array of **20+** criminal records:

```json
{
  "id": "CR-001",
  "name": "Ravi Kumar",
  "alias": "Ravi",
  "dob": "1990-05-12",
  "photo": null,
  "district": "Bengaluru City",
  "riskScore": 85,
  "priors": 5,
  "status": "Active",
  "moSignature": "Armed robbery at night, targets electronics stores",
  "associatedCrimes": ["KSP/2026/001", "KSP/2025/088"],
  "associates": ["CR-002", "CR-015"],
  "riskFactors": {
    "age": "HIGH",
    "priors": "HIGH",
    "crimeType": "VIOLENT",
    "associates": "MEDIUM"
  }
}
```

Requirements:
- Risk scores: range 25–95
- Priors: range 0–12
- Statuses: Active, Incarcerated, Parole
- Each criminal linked to 2+ crimes via `associatedCrimes`
- Some criminals linked as associates of each other

---

### Step 2 — Update Mock Handlers

**File:** `src/shared/api/mock/handlers.ts`

The current handler uses a simple registry pattern:

```typescript
import dashboardStats from '@/mocks/dashboard-stats.json';
import crimeCases from '@/mocks/crime-cases.json';
import criminals from '@/mocks/criminals.json';

const registry: Record<string, unknown> = {
  '/dashboard/stats': dashboardStats,
  '/crime/cases': crimeCases,
  '/crime/criminals': criminals,
};

export async function mockFetch<T>(key: string): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 120));
  
  // Handle ID-based lookups: /crime/cases/KSP/2026/001
  const parts = key.split('/');
  if (key.startsWith('/crime/cases/') && parts.length === 4) {
    const caseId = parts[3];
    const found = (crimeCases as any[]).find(c => c.id === caseId);
    if (!found) throw new Error(`Crime case not found: ${caseId}`);
    return found as T;
  }
  
  // Handle criminal lookups: /crime/criminals/CR-001
  if (key.startsWith('/crime/criminals/') && parts.length === 4) {
    const criminalId = parts[3];
    const found = (criminals as any[]).find(c => c.id === criminalId);
    if (!found) throw new Error(`Criminal not found: ${criminalId}`);
    return found as T;
  }
  
  if (!(key in registry)) throw new Error(`No mock handler registered for ${key}`);
  return registry[key] as T;
}
```

Also add mock endpoints for:
- `/crime/stats` — computed stats object with totals, open cases, resolved rate, type breakdown, monthly trend
- `/crime/mo-match` — array of 4-5 mock MO match results with criminal name, match percentage, priors, similar cases

---

### Step 3 — Update DTO Adapters

**File:** `src/shared/api/dto-adapters/crime.ts`

Replace the stub with real adapters:

```typescript
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
  timeline: { date: string; event: string }[];
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

// Adapters handle null/missing fields gracefully
export function adaptCrimeCase(raw: any): CrimeCaseDTO { ... }
export function adaptCriminal(raw: any): CriminalDTO { ... }
```

Each adapter must gracefully handle missing/null fields (hackathon backend guarantee).

---

### Step 4 — Create Feature API Module

**Create directory:** `src/features/crime/api/`

**File:** `src/features/crime/api/crimeApi.ts`

```typescript
import { apiGet } from '@/shared/api/client';
import { adaptCrimeCase, adaptCriminal, type CrimeCaseDTO, type CriminalDTO } from '@/shared/api/dto-adapters/crime';

export async function fetchCrimeCases(filters?: Record<string, string>): Promise<CrimeCaseDTO[]> {
  const raw = await apiGet<any[]>('/crime/cases');
  return raw.map(adaptCrimeCase);
}

export async function fetchCrimeCaseDetail(id: string): Promise<CrimeCaseDTO> {
  const raw = await apiGet<any>(`/crime/cases/${id}`);
  return adaptCrimeCase(raw);
}

export async function fetchCriminals(): Promise<CriminalDTO[]> {
  const raw = await apiGet<any[]>('/crime/criminals');
  return raw.map(adaptCriminal);
}

export async function fetchCriminalDetail(id: string): Promise<CriminalDTO> {
  const raw = await apiGet<any>(`/crime/criminals/${id}`);
  return adaptCriminal(raw);
}

export async function fetchCrimeStats(): Promise<any> {
  return apiGet('/crime/stats');
}

export async function matchMO(description: string, crimeType?: string, district?: string): Promise<any[]> {
  return apiGet('/crime/mo-match');
}
```

---

### Step 5 — Create Query Hooks

**Create directory:** `src/features/crime/hooks/`

#### `src/features/crime/hooks/useCrimeList.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchCrimeCases } from '../api/crimeApi';

export function useCrimeList() {
  return useQuery({
    queryKey: ['crime-cases'],
    queryFn: () => fetchCrimeCases(),
  });
}
```

#### `src/features/crime/hooks/useCrimeDetail.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchCrimeCaseDetail } from '../api/crimeApi';

export function useCrimeDetail(id: string) {
  return useQuery({
    queryKey: ['crime-case', id],
    queryFn: () => fetchCrimeCaseDetail(id),
    enabled: !!id,
  });
}
```

#### `src/features/crime/hooks/useCriminalList.ts`
Query hook for `fetchCriminals`.

#### `src/features/crime/hooks/useCriminalDetail.ts`
Query hook for `fetchCriminalDetail`.

#### `src/features/crime/hooks/useMOAnalysis.ts`
Query hook for `matchMO`.

#### `src/features/crime/hooks/useCrimeFilters.ts`
Hook that reads/writes crime-specific filters:

```typescript
import { useFilterStore } from '@/stores/filterStore';

export function useCrimeFilters() {
  const filters = useFilterStore((s) => s.crimeFilters);
  const setCrimeFilters = useFilterStore((s) => s.setCrimeFilters);
  return {
    filters,
    setType: (type: string) => setCrimeFilters({ type }),
    setStatus: (status: string) => setCrimeFilters({ status }),
    setDateRange: (range: { from: string; to: string }) => setCrimeFilters({ dateRange: range }),
    reset: () => setCrimeFilters({}),
  };
}
```

---

### Step 6 — Create Crime Dashboard (CrimeOverviewPage)

**File:** `src/pages/crime/CrimeOverviewPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/crime`

Layout: AppShell-based (standard page).

**Sections:**
1. **PageHeader** — "Crime Intelligence Dashboard" with subtitle
2. **KPI Row** (4 cards using `KpiCard`):
   - Total Cases, Open Cases, Resolved Rate (%), Avg Response Time (days)
   - Use Lucide icons: Fingerprint, Briefcase, CheckCircle, Clock
3. **Two-column grid:**
   - **Left (2/3):** Crime Type Breakdown — Recharts `PieChart` or `BarChart` showing cases by type
   - **Right (1/3):** Recent Cases feed — compact list of 5 most recent cases with status badges
4. **Bottom:** Monthly Trend — Recharts `AreaChart` showing cases over months

**Data:** `useQuery({ queryKey: ['crime-stats'], queryFn: fetchCrimeStats })`

**States:**
- Loading: skeleton grid (4 KPI skeletons + chart skeleton + list skeleton)
- Empty: "No crime data available yet" with action prompt
- Error: error card with retry
- Populated: full page

---

### Step 7 — Build Crime List Page (CrimeCasesPage)

**File:** `src/pages/crime/CrimeCasesPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/crime/cases`

**Sections:**
1. **PageHeader** — "Crime Cases" with total count
2. **SectionToolbar or inline filter bar:**
   - Type dropdown, Status dropdown, District dropdown, Date range, Search input
   - Use `useCrimeFilters()` to manage filter state
3. **CrimeTable** — full interactive table:
   - Columns: FIR No., Type, District, Date, Status, Actions (⋮ dropdown)
   - Sortable columns (click header)
   - Row click → navigate to `/crime/cases/:caseId`
   - Pagination (20 per page)
   - Actions per row: View, Edit, Delete (placeholder actions)
   - Build this component at `src/features/crime/components/CrimeTable.tsx`

**States:**
- Loading: 10 shimmer skeleton rows (use `LoadingSkeleton variant="table-row"`)
- Empty: "No crime records match your filters" + "Clear filters" action
- Error: error card with retry
- Populated: full table

---

### Step 8 — Build Crime Detail Page (CrimeCaseDetailPage)

**File:** `src/pages/crime/CrimeCaseDetailPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/crime/cases/:caseId`
**Data:** `useCrimeDetail(id)` hook

**Sections:**
1. **Back + Status bar:**
   - [← Crime Cases] link back to list
   - FIR number (from `id`)
   - Status badge
   - Action buttons: [Link to Network] [Link to Map] (placeholder)
2. **Two-column layout:**
   - **Left (2/3):**
     - Case Information card — type, date, time, district, location, description
     - Timeline — chronological list of case events (use the `timeline` array from mock data)
     - Evidence — evidence items as compact cards
   - **Right (1/3):**
     - Quick Info panel — Risk Level badge, MO description, linked criminals count, victim name
     - Quick Actions — [Link to Network], [Link to Map]

**States:**
- Loading: detail skeleton
- Empty: "Case not found" with link back to list
- Error: error card with retry
- Populated: full detail page

---

### Step 9 — Create Criminal List Page (NEW)

**File:** `src/pages/crime/CriminalListPage.tsx` — **CREATE**
**Route:** `/crime/criminals` — **must add to routes.tsx**

**Sections:**
1. **PageHeader** — "Criminal Directory"
2. **Search + filter bar:** Search by name/alias, District dropdown, Status dropdown
3. **CriminalTable** — built at `src/features/crime/components/CriminalTable.tsx`:
   - Columns: Name, Alias, District, Risk Score (use `RiskBadge`), Priors, Status
   - Row click → navigate to `/crime/criminals/:criminalId`
   - Search by name/alias
   - Pagination (20 per page)

**States:** Loading (skeleton), Empty ("No criminals found"), Error, Populated

---

### Step 10 — Create Criminal Detail Page (NEW)

**File:** `src/pages/crime/CriminalDetailPage.tsx` — **CREATE**
**Route:** `/crime/criminals/:criminalId` — **must add to routes.tsx**
**Data:** `useCriminalDetail(id)` hook

**Sections:**
1. **Profile Header:**
   - Photo placeholder (gray circle with initials)
   - Name, alias, DOB, district
   - Risk Score badge (`RiskBadge`)
   - Priors count, status
2. **Two-column layout:**
   - **Left (2/3):**
     - Associated Crimes table — linked crimes with type, date, status
     - Placeholder for Network Graph: "Network visualization coming in Phase 5"
   - **Right (1/3):**
     - MO Profile — signature description, matched cases count
     - Risk Factors — list of factors with HIGH/MEDIUM/LOW labels
     - Associates — linked criminal names as clickable links

**States:** Loading, Empty ("Criminal not found"), Error, Populated

---

### Step 11 — Build MO Matcher Page (CrimePatternsPage)

**File:** `src/pages/crime/CrimePatternsPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/crime/patterns`

**Sections:**
1. **PageHeader** — "MO Pattern Matcher"
2. **Description Input:** Large textarea for pasting FIR/MO description
3. **Filter row:** Crime Type dropdown, District dropdown, [🔍 Find Matches] button
4. **Results table** — Top MO matches:
   - Criminal name, Match percentage (color-coded bar), Priors count, Similar cases count

**States:**
- Loading: skeleton results
- Empty (no search yet): "Paste a crime description to find matching MO patterns"
- Empty (no results): "No matching MO patterns found. Try adjusting filters."
- Error: error card with retry
- Populated: match results table

---

### Step 12 — Build CrimeTable Component

**File:** `src/features/crime/components/CrimeTable.tsx`

A purpose-built table for crime cases (no generic DataTable exists in shared components):

- Columns: FIR No., Type, District, Date, Status, Actions
- Sortable: click column header to toggle asc/desc
- Row click → navigate to detail
- Actions dropdown per row: View, Edit, Delete
- Pagination controls (prev/next, page numbers, showing X of Y)
- States: Loading (10 shimmer skeleton rows), Empty (no results message), Error, Populated
- Use `React.useMemo` for sorting/filtering
- Use `StatusBadge` for the status column

---

### Step 13 — Build CriminalTable Component

**File:** `src/features/crime/components/CriminalTable.tsx`

Similar to CrimeTable but for criminals:

- Columns: Name, Alias, District, Risk Score, Priors, Status
- Risk score column: use `RiskBadge` with color-coded display
- Row click → navigate to `/crime/criminals/:criminalId`
- Search by name/alias
- Pagination (20 per page)
- States: Loading (skeleton), Empty, Error, Populated

---

### Step 14 — Update Routes

**File:** `src/router/routes.tsx`

Add lazy imports and routes for the new criminal pages:

```typescript
const CriminalListPage = lazy(() => import('@/pages/crime/CriminalListPage'));
const CriminalDetailPage = lazy(() => import('@/pages/crime/CriminalDetailPage'));

// Add to protectedRoutes array:
{ path: '/crime/criminals', element: CriminalListPage },
{ path: '/crime/criminals/:criminalId', element: CriminalDetailPage },
```

No changes needed to AppRoutes.tsx — it already iterates `protectedRoutes` dynamically.

---

## 4. File Manifest

| Action | File | Description |
|--------|------|-------------|
| CREATE | `src/mocks/crime-cases.json` | 50+ crime case records |
| CREATE | `src/mocks/criminals.json` | 20+ criminal records |
| MODIFY | `src/shared/api/mock/handlers.ts` | Add crime mock handlers + ID-based lookups |
| MODIFY | `src/shared/api/dto-adapters/crime.ts` | Full adapter with CrimeCaseDTO, CriminalDTO types |
| CREATE | `src/features/crime/api/crimeApi.ts` | All crime API functions |
| CREATE | `src/features/crime/hooks/useCrimeList.ts` | Crime list query hook |
| CREATE | `src/features/crime/hooks/useCrimeDetail.ts` | Crime detail query hook |
| CREATE | `src/features/crime/hooks/useCriminalList.ts` | Criminal list query hook |
| CREATE | `src/features/crime/hooks/useCriminalDetail.ts` | Criminal detail query hook |
| CREATE | `src/features/crime/hooks/useMOAnalysis.ts` | MO analysis query hook |
| CREATE | `src/features/crime/hooks/useCrimeFilters.ts` | Crime filter hook wrapper |
| CREATE | `src/features/crime/components/CrimeTable.tsx` | Cases data table with sort/paginate |
| CREATE | `src/features/crime/components/CriminalTable.tsx` | Criminals data table |
| REWRITE | `src/pages/crime/CrimeOverviewPage.tsx` | Crime dashboard with KPIs + charts |
| REWRITE | `src/pages/crime/CrimeCasesPage.tsx` | Crime case list with filters + table |
| REWRITE | `src/pages/crime/CrimeCaseDetailPage.tsx` | Crime case detail with timeline |
| REWRITE | `src/pages/crime/CrimePatternsPage.tsx` | MO Matcher with input + results |
| CREATE | `src/pages/crime/CriminalListPage.tsx` | Criminal directory |
| CREATE | `src/pages/crime/CriminalDetailPage.tsx` | Criminal profile |
| MODIFY | `src/router/routes.tsx` | Add criminal routes |

---

## 5. Verification Checklist

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Crime Dashboard at `/crime` shows KPI cards with crime stats
- [ ] Crime Dashboard shows crime type breakdown chart
- [ ] Crime List at `/crime/cases` shows filterable, paginated table
- [ ] Crime List sorting works (click column headers)
- [ ] Crime Detail at `/crime/cases/:id` shows full case breakdown with timeline
- [ ] Crime Detail shows evidence items and quick info panel
- [ ] Criminal List at `/crime/criminals` shows searchable table with risk scores
- [ ] Criminal Detail at `/crime/criminals/:id` shows profile with crimes and MO
- [ ] MO Matcher at `/crime/patterns` accepts text input and shows mock results
- [ ] Crime Dashboard has loading, empty, error, populated states
- [ ] Crime Case List has loading, empty, error, populated states
- [ ] Crime Case Detail has loading, empty, error, populated states
- [ ] Criminal List has loading, empty, error, populated states
- [ ] Criminal Detail has loading, empty, error, populated states
- [ ] MO Matcher has loading, empty (pre-search), empty (no results), error, populated states
- [ ] Filters interact with filterStore correctly
- [ ] Mock mode works — no backend dependency
- [ ] No frozen files modified
- [ ] No shared components duplicated

---

## 6. Report Format

```
## Phase 2 Complete — Report

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

### Ready for Phase 3
YES / NO (if NO, explain why)
```

---

**Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.**
