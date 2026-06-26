# HELLCAT — PHASE 2 CRIME SUITE COMPLETION PROMPT

> Complete the 3 remaining placeholder pages in the Crime Intelligence Suite.
> Phase: 2 of 10 | Focus: Crime Trend, Hotspot & Predictive Pages

---

## 0. CONTEXT

Phase 0 (shell, routing, design tokens, stores, shared UI kit), Phase 1 (Command Center + Dashboard), and **most of Phase 2** are complete.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### What's Already Built in Phase 2

| Page | Status | Lines |
|------|--------|:-----:|
| `CrimeOverviewPage` (Dashboard) | ✅ Complete | 45 |
| `CrimeCasesPage` (Case List) | ✅ Complete | 46 |
| `CrimeCaseDetailPage` | ✅ Complete | 34 |
| `CriminalListPage` | ✅ Complete | 24 |
| `CriminalDetailPage` | ✅ Complete | 43 |
| `CrimePatternsPage` (MO Matcher) | ✅ Complete | 37 |

### What's Missing — Build These 3 Pages

| # | Page | Route | Current State |
|:-:|------|-------|:-------------:|
| 1 | `CrimeTrendsPage.tsx` | `/crime/trends` | `createPlaceholderPage('Crime Trends')` |
| 2 | `CrimeHotspotsPage.tsx` | `/crime/hotspots` | `createPlaceholderPage('Crime Hotspots')` |
| 3 | `CrimePredictivePage.tsx` | `/crime/predictive` | `createPlaceholderPage('Crime Predictive Intelligence')` |

### Infrastructure Ready

- **Shared components:** `KpiCard`, `PageHeader`, `LoadingSkeleton` (variants: `card`, `table-row`, `chart`, `map`, `text`), `EmptyState`, `ErrorState`, `StatusBadge`, `RiskBadge`, `SeverityBadge`, `Badge`, `TrendCard`, `AlertFeed`
- **UI Kit:** `Button`, `Input`, `Select`, `SearchInput`, `Badge`, `Modal`, `Drawer`
- **Charts:** Recharts installed (`Area`, `Bar`, `Pie`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`, `CartesianGrid`, `Cell`, `Legend`)
- **Icons:** Lucide React
- **Stores:** `filterStore` with `crimeFilters: DomainFilters` and `setCrimeFilters()`
- **Mock data available:** `crime-cases.json` (30 records), `criminals.json` (22 records), `hotspots.json`, `predictive-zones.json`, `red-zones.json`, `dashboard-stats.json`, `district-stats.json`
- **Mock handlers:** Already registered in `src/shared/api/mock/handlers.ts` for `/crime/cases`, `/crime/criminals`, `/crime/stats`, `/maps/hotspots`, `/maps/predictive-zones`, `/maps/red-zones`
- **Routes:** Already registered in `src/router/routes.tsx` — just need working components
- **API client:** `apiGet<T>(url)` from `@/shared/api/client` — auto-routes to mock mode
- **Design tokens:** CSS variables in `globals.css` — use only these, no new tokens

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **Do NOT modify** | Already-built crime pages, routes.tsx, mock handlers (unless adding new mock endpoints) |
| **No new design tokens** | Use CSS variables only: `var(--color-gold)`, `var(--color-crime-red)`, `var(--color-crime-amber)`, `var(--color-cyber-cyan)`, `var(--color-network-purple)`, `var(--color-intel-violet)`, `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`, `var(--color-border)`, `var(--radius-2xl)`, `var(--radius-xl)`, `var(--radius-lg)` |
| **No component duplication** | Check `src/shared/components/index.ts` before creating anything new |
| **All 4 states required** | `isLoading` → `ErrorState` → `EmptyState` → populated content |
| **Icons** | Lucide icons only (already in deps) |
| **Types** | No `any` — use proper types or `unknown` with type guards |
| **Named exports** for all components and hooks |
| **Recharts** for all chart visualizations |
| **Dark theme** — all cards use `glass-card` class from globals.css |

---

## 2. BUILD ORDER — 3 PAGES

---

### PAGE 1: CrimeTrendsPage (`/crime/trends`)

**Goal:** Show crime trends over time — monthly case counts, type distribution, district-level trends.

**Pattern to follow:** See `CrimeOverviewPage.tsx` for chart, KPI card, and data fetching patterns.

#### Requirements

1. **Create file:** `src/pages/crime/CrimeTrendsPage.tsx`
2. **Data source:** Use `apiGet('/crime/stats')` + `apiGet('/crime/cases')` to derive trend data, OR create new mock endpoints
3. **Visual layout:**
   - **PageHeader** with title "Crime Trends" and subtitle showing time range
   - **Filter bar** — date range (preset: 7d, 30d, 90d, YTD), district dropdown, crime type dropdown
   - **KPI cards row** — Total Cases, Monthly Avg, % Change, Fastest Rising Type
   - **AreaChart** — Monthly crime trend (X: month, Y: cases, smooth curve, gold gradient fill)
   - **BarChart** — Crime type distribution (X: type, Y: count, colored by type severity)
   - **District trend table** — sortable table showing district, crime count, % change, trending direction (up/down/stable)
4. **States:** Loading (skeleton), Error (retry), Empty (no data), Populated
5. **Interactivity:** Filtering updates charts and table

#### Routing
Already exists at `{ path: '/crime/trends', element: CrimeTrendsPage }` — no changes needed.

---

### PAGE 2: CrimeHotspotsPage (`/crime/hotspots`)

**Goal:** Show crime hotspot clusters with density, risk level, and trend data.

**Pattern to follow:** Refer to the `useCrimeList` / `useCriminalList` hook pattern for data fetching.

#### Requirements

1. **Create file:** `src/pages/crime/CrimeHotspotsPage.tsx`
2. **Data source:** `apiGet('/maps/hotspots')` — mock data already exists in `src/mocks/hotspots.json`
3. **Visual layout:**
   - **PageHeader** with title "Crime Hotspots" and subtitle showing active hotspot count
   - **Summary KPI row** — Total Hotspots, High-Risk Zones, Avg Crime Density, Most Active District
   - **Hotspot cards grid** — each card shows:
     - District name + risk level badge (SeverityBadge)
     - Crime count with density bar
     - Top crime type breakdown (small pie or horizontal bar using Recharts)
     - Trend direction (up ↑ / down ↓ with percentage)
     - Peak time indicator
     - Button to "View on Map" (links to `/maps/hotspots`)
   - **Sort/filter controls** — filter by risk level (All/High/Medium/Low), sort by crime count
4. **States:** Loading (skeleton grid), Error (retry), Empty (no hotspots), Populated
5. **Interactivity:** Filtering and sorting update the card grid

#### Routing
Already exists at `{ path: '/crime/hotspots', element: CrimeHotspotsPage }` — no changes needed.

---

### PAGE 3: CrimePredictivePage (`/crime/predictive`)

**Goal:** Show predictive intelligence — tomorrow's predicted high-risk zones, confidence scores, and recommendations.

**Pattern to follow:** See `CrimePatternsPage.tsx` for layout patterns and state handling.

#### Requirements

1. **Create file:** `src/pages/crime/CrimePredictivePage.tsx`
2. **Data source:** `apiGet('/maps/predictive-zones')` — mock data exists in `src/mocks/predictive-zones.json`. Also use `apiGet('/maps/red-zones')` from `src/mocks/red-zones.json` for current red-zone context.
3. **Visual layout:**
   - **PageHeader** with title "Predictive Intelligence" and subtitle "AI-forecasted high-risk zones"
   - **KPI row** — Zones Predicted, Extreme Risk Count, High Risk Count, Avg Confidence
   - **Predictive zones grid** — each card shows:
     - District name + confidence percentage (color-coded progress bar)
     - Risk level badge (SeverityBadge: extreme/high/medium/low)
     - Predicted date
     - Actionable recommendation text (derived from risk data)
     - Button "View Details" (links to `/maps/districts/:districtId`)
   - **Risk level filter tabs** — All / Extreme / High / Medium
4. **States:** Loading (skeleton), Error (retry), Empty (no predictions), Populated
5. **Interactivity:** Filter tabs update the card grid

#### Routing
Already exists at `{ path: '/crime/predictive', element: CrimePredictivePage }` — no changes needed.

---

## 3. REFERENCE PATTERNS

### Data Fetching Pattern (from `CrimeOverviewPage`)
```tsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';
import { LoadingSkeleton, ErrorState, EmptyState, PageHeader, KpiCard } from '@/shared/components';

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['crime-stats'],
  queryFn: () => apiGet<YourType>('/crime/stats'),
});
```

### Glass Card Pattern
```tsx
<section className="glass-card rounded-[var(--radius-2xl)] p-5">
  <h2 className="text-xl font-bold">Section Title</h2>
  {/* content */}
</section>
```

### Filter Bar Pattern (from `CrimeCasesPage`)
```tsx
<section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_180px_180px_180px_150px]">
  <SearchInput onChange={...} placeholder="..." value={...} />
  <Select onValueChange={...} options={...} value={...} />
  <Select onValueChange={...} options={...} value={...} />
</section>
```

### Chart Pattern (from `CrimeOverviewPage`)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.3} />
        <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
    <XAxis dataKey="month" stroke="var(--color-text-muted)" />
    <YAxis stroke="var(--color-text-muted)" />
    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
    <Area type="monotone" dataKey="cases" stroke="var(--color-gold)" fillOpacity={1} fill="url(#colorCases)" />
  </AreaChart>
</ResponsiveContainer>
```

---

## 4. MOCK DATA SHAPES

### `/maps/hotspots` response shape (from `src/mocks/hotspots.json`)
```ts
interface HotspotDTO {
  id: string;
  district: string;
  latitude: number;
  longitude: number;
  radius: number;
  crimeCount: number;
  topCrimeType: string;
  crimeTypes: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high';
  trend: number;        // percentage change
  peakTime: string;      // e.g. "22:00-02:00"
}
```

### `/maps/predictive-zones` response shape (from `src/mocks/predictive-zones.json`)
```ts
interface PredictiveZoneDTO {
  id: string;
  districtId: string;
  district: string;
  confidence: number;   // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  date: string;          // YYYY-MM-DD
}
```

### `/maps/red-zones` response shape (from `src/mocks/red-zones.json`)
```ts
interface RedZoneDTO {
  district: string;
  districtId: string;
  level: 'low' | 'medium' | 'high' | 'extreme';
  crimeRate: number;
  trend: number;
  population: number;
  policeStations: number;
  priority: number;
}
```

---

## 5. DELIVERABLES

By the end of this phase, you must have:

### Files Created
- [ ] `src/pages/crime/CrimeTrendsPage.tsx`
- [ ] `src/pages/crime/CrimeHotspotsPage.tsx`
- [ ] `src/pages/crime/CrimePredictivePage.tsx`

### Files Modified (if needed)
- [ ] `src/features/crime/api/crimeApi.ts` — add `fetchTrends()`, `fetchHotspots()`, `fetchPredictiveZones()` if needed

### Acceptance Criteria
- [ ] All 3 pages compile with zero TypeScript errors (`npx tsc --noEmit`)
- [ ] `npm run build` succeeds
- [ ] Each page shows **all 4 states**: loading → error (retry) → empty → populated
- [ ] Design tokens match existing pages — no new CSS variables
- [ ] Reuses existing shared components — no duplicates
- [ ] Lucide icons used throughout
- [ ] All glass-card styling matches the existing dark theme
- [ ] Filter controls work on each page
- [ ] Changelog entry added to `changes.md`

### Demo Moment
**"Crime Intelligence Suite Complete — view trends across time, drill into hotspot clusters with risk analysis, and see AI-predicted high-risk zones with confidence scores."**

---

## 6. BUILD PROTOCOL

1. **Read reference files first:** `CrimeOverviewPage.tsx`, `CrimeCasesPage.tsx`, `CrimePatternsPage.tsx`
2. **Build in order:** Trends → Hotspots → Predictive (most complex first)
3. **Verify after each page:** `npx tsc --noEmit` must pass
4. **Do NOT modify** frozen files or already-completed pages
5. **Do NOT proceed** to any other phase — stop after Phase 2 is complete
6. **Report back** with a summary of what was built, any issues encountered, and verification results

---

*Phase 2 completion prompt for Hellcat. 3 pages remain. Follow all rules and patterns.*
