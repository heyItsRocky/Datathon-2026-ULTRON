# PHASE 2 — Crime Intelligence Suite

> Execution Brief for Goliath · June 2026
> Build: Complete crime track — dashboard, cases, criminals, MO matcher, detail pages

---

## 0. Build Protocol

**BUILD → VERIFY → STOP → REPORT** — do not proceed beyond Phase 2 without confirmation.

### Hard Rules
- **Do NOT modify** frozen files: `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*`
- **Do NOT duplicate** existing shared components — check `src/shared/components/index.ts` first
- **Do NOT skip** any of the 4 states: loading, empty, error, populated on every data-dependent page
- **Mock mode must work** — all data comes from `src/mocks/` or inline mock data
- **MAY modify** `router/routes.tsx` and `router/AppRoutes.tsx` — these are NOT frozen
- **MAY modify** `shared/api/mock/handlers.ts` and `shared/api/dto-adapters/crime.ts` — these are NOT frozen

### Context
- `src/pages/crime/` has 7 placeholder files (all using `createPlaceholderPage`)
- `src/features/` does NOT exist yet — create `src/features/crime/` with api/, components/, hooks/
- Page files stay in `src/pages/crime/` (routes already point there)
- Routes are defined in `src/router/routes.tsx`

---

## 1. Build Order

### Step 1 — Create mock data files

#### `src/mocks/crime-cases.json`
Array of 50+ crime case records. Each record:
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
Include varied types: Murder, Theft, Assault, Burglary, Robbery, Cyber Crime, Chain Snatching, DV cases
Include varied districts: Bengaluru City, Bengaluru Urban, Mysuru, Belagavi, Hubli-Dharwad, Kalaburagi, Mangaluru, Tumakuru, Shivamogga, Davanagere
Include varied statuses: Under Investigation, Open, Resolved, Pending Review
5+ timeline entries per case
2+ evidence items per case

#### `src/mocks/criminals.json`
Array of 20+ criminal records. Each record:
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
Cover a range of risk scores (25-95), priors (0-12), statuses (Active, Incarcerated, Parole)

### Step 2 — Update mock handlers

#### `src/shared/api/mock/handlers.ts`
Add crime data to registry:
```typescript
import crimeCases from '@/mocks/crime-cases.json';
import criminals from '@/mocks/criminals.json';

// Add to registry:
'/crime/cases': crimeCases,
'/crime/cases/:id': (id) => crimeCases.find(c => c.id === id),
'/crime/criminals': criminals,
'/crime/criminals/:id': (id) => criminals.find(c => c.id === id),
'/crime/stats': { ... computed stats ... },
'/crime/mo-match': { ... mo match results ... },
```

For the ID-based lookups, use a helper function pattern in the mock handler.

### Step 3 — Update DTO adapters

#### `src/shared/api/dto-adapters/crime.ts`
Create real adapters:
```typescript
export interface CrimeCaseDTO { ... }
export interface CriminalDTO { ... }
export interface CrimeListResponse { cases: CrimeCaseDTO[]; total: number; page: number }
export interface CriminalListResponse { criminals: CriminalDTO[]; total: number }

export function adaptCrimeCase(raw: any): CrimeCaseDTO { ... }
export function adaptCriminal(raw: any): CriminalDTO { ... }
export function adaptCrimeList(raw: any): CrimeListResponse { ... }
```
These handle null/missing fields gracefully (hackathon backend shapes change frequently).

### Step 4 — Create feature API module

#### `src/features/crime/api/crimeApi.ts`
```typescript
import { apiGet } from '@/shared/api/client';
import { adaptCrimeCase, adaptCriminal, adaptCrimeList, type CrimeCaseDTO, type CriminalDTO } from '@/shared/api/dto-adapters/crime';

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

### Step 5 — Create query hooks

#### `src/features/crime/hooks/useCrimeList.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchCrimeCases } from '../api/crimeApi';
import { useFilterStore } from '@/stores/filterStore';

export function useCrimeList() {
  const filters = useFilterStore((s) => s.crimeFilters);
  const district = useFilterStore((s) => s.globalDistrict);
  return useQuery({
    queryKey: ['crime-cases', filters, district],
    queryFn: () => fetchCrimeCases({ ...filters, district }),
  });
}
```

#### `src/features/crime/hooks/useCrimeDetail.ts`
```typescript
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
Hook that reads/writes crime-specific filters from filterStore:
```typescript
export function useCrimeFilters() {
  const filters = useFilterStore((s) => s.crimeFilters);
  const setCrimeFilters = useFilterStore((s) => s.setCrimeFilters);
  return {
    filters: filters as CrimeFilters,
    setType: (type: string) => setCrimeFilters({ type }),
    setStatus: (status: string) => setCrimeFilters({ status }),
    setDateRange: (range: DateRange) => setCrimeFilters({ dateRange: range }),
    reset: () => setCrimeFilters({}),
  };
}
```

### Step 6 — Create components

#### `src/features/crime/components/CrimeTable.tsx`
- DataTable-style component (build from scratch or use a simple table with Tailwind)
- No DataTable exists in shared components — build a purpose-specific table
- Columns: FIR No., Type, District, Date, Status, Actions
- Sortable columns (click header to sort)
- Row click → navigate to detail
- Actions dropdown per row (View, Edit, Delete)
- Integrates with filterStore for district/type filtering
- Pagination controls (20 per page)
- **States:**
  - Loading: 10 shimmer skeleton rows
  - Empty: "No crime records match your filters" with clear-filters action
  - Error: Error card with retry
  - Populated: Full table

#### `src/features/crime/components/CriminalTable.tsx`
- Similar to CrimeTable but for criminals
- Columns: Name, Alias, District, Risk Score, Priors, Status
- Risk score column with color-coded badges (use existing RiskBadge)
- Row click → navigate to criminal detail
- Search by name/alias
- Pagination (20 per page)
- **States:** Loading (skeleton), Empty, Error, Populated

### Step 7 — Build Crime Dashboard (CrimeOverviewPage)

**File:** `src/pages/crime/CrimeOverviewPage.tsx`
- **Route:** `/crime`
- **Layout:** AppShell-based (standard page)
- **Sections:**
  1. **PageHeader** — "Crime Intelligence Dashboard" subtitle
  2. **KPI Row** (4 cards):
     - Total Cases, Open Cases, Resolved Rate, Avg Response Time
     - Use existing `KpiCard` component
  3. **Two-column layout:**
     - Left (2/3): Crime Type Breakdown chart (Recharts PieChart or BarChart)
     - Right (1/3): Recent Cases feed (compact list with severity badges)
  4. **Bottom:** Monthly Trend chart (Recharts AreaChart)
- **States:** Loading (skeleton grid), Empty, Error, Populated
- **Data source:** `useQuery` fetching from `/crime/stats` mock endpoint

### Step 8 — Build Crime List Page (CrimeCasesPage)

**File:** `src/pages/crime/CrimeCasesPage.tsx` with route `/crime/cases`
- **Layout:** AppShell
- **Sections:**
  1. **PageHeader** — Cases list header with count
  2. **Filter bar** — Type dropdown, Status dropdown, District dropdown, Date range, Search
  3. **CrimeTable** — Full interactive table with sorting, pagination, actions
- **States:** Loading, Empty, Error, Populated
- **Data:** `useCrimeList()` hook
- **On row click:** Navigate to `/crime/cases/:caseId`

### Step 9 — Build Crime Detail Page (CrimeCaseDetailPage)

**File:** `src/pages/crime/CrimeCaseDetailPage.tsx` with route `/crime/cases/:caseId`
- **Layout:** AppShell
- **Sections:**
  1. **Back + Status bar** — [← Crime Cases] FIR number, Status badge, action buttons
  2. **Two-column layout:**
     - **Left (2/3):**
       - Case Information card — type, date, time, district, location, description
       - Timeline — chronological list of case events (using the timeline array from mock)
       - Evidence cards — linked evidence items
     - **Right (1/3):**
       - Quick Info panel — Risk Level badge, MO description, linked criminals count, victim name
       - Linked Evidence — evidence items as cards
       - Quick Actions — [Link to Network] [Link to Map] buttons
- **States:** Loading (detail skeleton), Empty ("Case not found"), Error, Populated
- **Data:** `useCrimeDetail(id)` hook

### Step 10 — Build Criminal List Page (needs new route)

Create `src/pages/crime/CriminalListPage.tsx` with route `/crime/criminals`
- **Route:** Need to add to `routes.tsx` and create lazy import
- **Layout:** AppShell
- **Sections:**
  1. **PageHeader** — "Criminal Directory"
  2. **Search + filter bar** — Search by name/alias, District dropdown, Status dropdown
  3. **CriminalTable** — Full table with risk scores, priors, status
- **States:** Loading, Empty, Error, Populated
- **On row click:** Navigate to `/crime/criminals/:criminalId`

### Step 11 — Build Criminal Detail Page (needs new route)

Create `src/pages/crime/CriminalDetailPage.tsx` with route `/crime/criminals/:criminalId`
- **Layout:** AppShell
- **Sections:**
  1. **Profile Header** — Name, alias, DOB, district, Risk Score badge, criminal photo placeholder
  2. **Two-column layout:**
     - **Left (2/3):**
       - Associated Crimes table — list of linked crimes with status
       - Mini Network Graph placeholder — "Network visualization coming in Phase 5"
     - **Right (1/3):**
       - MO Profile — signature description, matched cases count
       - Risk Factors — age, priors, crime type, associates (each with HIGH/MEDIUM/LOW label)
       - Associates list — linked criminal names
- **States:** Loading, Empty ("Criminal not found"), Error, Populated

### Step 12 — Build MO Matcher Page (CrimePatternsPage)

**File:** `src/pages/crime/CrimePatternsPage.tsx` with route `/crime/patterns`
- **Layout:** AppShell
- **Sections:**
  1. **PageHeader** — "MO Pattern Matcher"
  2. **Description Input:** Large textarea for pasting FIR/MO description
  3. **Filter row:** Crime Type dropdown, District dropdown, [Find Matches] button
  4. **Results table:** Top MO matches showing:
     - Criminal name, Match percentage (color-coded bar), Priors count, Similar cases count
- **States:**
  - Loading: Skeleton results
  - Empty (no search yet): "Paste a crime description to find matching MO patterns"
  - Empty (no results): "No matching MO patterns found. Try adjusting filters."
  - Error: Error card with retry
  - Populated: Match results table

### Step 13 — Update routes

**File:** `src/router/routes.tsx`
Add imports and routes:
```typescript
const CriminalListPage = lazy(() => import('@/pages/crime/CriminalListPage'));
const CriminalDetailPage = lazy(() => import('@/pages/crime/CriminalDetailPage'));

// Add to protectedRoutes:
{ path: '/crime/criminals', element: CriminalListPage },
{ path: '/crime/criminals/:criminalId', element: CriminalDetailPage },
```

### Step 14 — Verify build states on every page

Every data-dependent page must implement a state switch:
```tsx
if (isLoading) return <LoadingSkeleton variant="page" />;
if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState title="..." description="..." action={...} />;
return <PopulatedView data={data} />;
```

---

## 2. File Manifest

| Action | File | Description |
|--------|------|-------------|
| CREATE | `src/mocks/crime-cases.json` | 50+ crime case records |
| CREATE | `src/mocks/criminals.json` | 20+ criminal records |
| MODIFY | `src/shared/api/mock/handlers.ts` | Add crime mock handlers |
| MODIFY | `src/shared/api/dto-adapters/crime.ts` | Full adapter with types |
| CREATE | `src/features/crime/api/crimeApi.ts` | All crime API functions |
| CREATE | `src/features/crime/hooks/useCrimeList.ts` | Crime list query hook |
| CREATE | `src/features/crime/hooks/useCrimeDetail.ts` | Crime detail query hook |
| CREATE | `src/features/crime/hooks/useCriminalList.ts` | Criminal list query hook |
| CREATE | `src/features/crime/hooks/useCriminalDetail.ts` | Criminal detail query hook |
| CREATE | `src/features/crime/hooks/useMOAnalysis.ts` | MO analysis query hook |
| CREATE | `src/features/crime/hooks/useCrimeFilters.ts` | Crime filter hook |
| CREATE | `src/features/crime/components/CrimeTable.tsx` | Cases data table |
| CREATE | `src/features/crime/components/CriminalTable.tsx` | Criminals data table |
| REWRITE | `src/pages/crime/CrimeOverviewPage.tsx` | Crime dashboard |
| REWRITE | `src/pages/crime/CrimeCasesPage.tsx` | Crime case list |
| REWRITE | `src/pages/crime/CrimeCaseDetailPage.tsx` | Crime case detail |
| REWRITE | `src/pages/crime/CrimePatternsPage.tsx` | MO Matcher page |
| CREATE | `src/pages/crime/CriminalListPage.tsx` | Criminal list |
| CREATE | `src/pages/crime/CriminalDetailPage.tsx` | Criminal detail |
| MODIFY | `src/router/routes.tsx` | Add criminal routes |

---

## 3. Verification Checklist

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Crime Dashboard at `/crime` shows KPI cards with crime stats
- [ ] Crime List at `/crime/cases` shows filterable, paginated table
- [ ] Crime Detail at `/crime/cases/:id` shows full case breakdown with timeline
- [ ] Criminal List at `/crime/criminals` shows searchable table with risk scores
- [ ] Criminal Detail at `/crime/criminals/:id` shows profile with crimes and MO
- [ ] MO Matcher at `/crime/patterns` accepts text input and shows mock results
- [ ] Every page has loading, empty, error, and populated states
- [ ] All 4 states visible on Crime Dashboard
- [ ] All 4 states visible on Crime Case List
- [ ] All 4 states visible on Crime Case Detail
- [ ] All 4 states visible on Criminal List
- [ ] All 4 states visible on Criminal Detail
- [ ] All 4 states visible on MO Matcher
- [ ] Filters interact with filterStore correctly
- [ ] Mock mode works — no backend dependency
- [ ] No frozen files modified
- [ ] No shared components duplicated

---

## 4. Design Reference

**Color tokens to use:**
- Crime accent: `var(--color-crime-red)` (#dc2626) for violent crime
- Crime amber: `var(--color-crime-amber)` (#f59e0b) for property crime
- Risk badges: Use existing `RiskBadge` component
- Severity badges: Use existing `SeverityBadge` component
- Status badges: Use existing `StatusBadge` component

**Fonts:**
- UI: Inter (default)
- Technical data (FIR numbers, case IDs): Use `font-mono` class (JetBrains Mono)

**Spacing:** Use Tailwind spacing scale (4px grid)

**Glass card formula:**
```css
background: rgba(17, 24, 39, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
```
Use the `glass-card` class which already applies this.

---

## 5. Handoff to Phase 3

After verification, report:
- Files created/modified
- Verification results
- Any issues encountered
- Ready for Phase 3 (Cyber Intelligence Suite)
