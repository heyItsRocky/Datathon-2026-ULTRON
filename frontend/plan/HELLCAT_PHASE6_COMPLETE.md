# HELLCAT — PHASE 6 STRATEGIC INTELLIGENCE HUB PROMPT

> Complete the remaining 6 Intel Intelligence pages in the Strategic Intelligence Hub.
> Phase: 6 of 10 | Focus: Executive Command Center for Senior Officers

---

## 0. CONTEXT

Phases 0–5 are complete and verified. The app now has shell + dashboard + crime suite + cyber suite + interactive map + network graphs.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### What Already Exists

- `src/pages/intel/` — **6 placeholder pages** (all `createPlaceholderPage()` stubs)
- Routes already exist: `/intel`, `/intel/briefings`, `/intel/reports`, `/intel/watchlists`, `/intel/signals`, `/intel/forecast`
- `src/features/intelligence/` — **does NOT exist** (must create it)
- `src/shared/api/dto-adapters/intel.ts` — exists as a stub (will rewrite)
- Full shared component library available (17+ components in `src/shared/components/`)

### What Needs Building

| # | Page | Route | Current State |
|:-:|------|-------|:-------------:|
| 1 | `IntelHubPage.tsx` | `/intel` | `createPlaceholderPage('Intel Hub')` |
| 2 | `BriefingsPage.tsx` | `/intel/briefings` | `createPlaceholderPage('Briefings')` |
| 3 | `IntelReportsPage.tsx` | `/intel/reports` | `createPlaceholderPage('Intel Reports')` |
| 4 | `WatchlistsPage.tsx` | `/intel/watchlists` | `createPlaceholderPage('Watchlists')` |
| 5 | `SignalsPage.tsx` | `/intel/signals` | `createPlaceholderPage('Signals')` |
| 6 | `StrategicForecastPage.tsx` | `/intel/forecast` | `createPlaceholderPage('Strategic Forecast')` |

### Detailed Reference

A full 948-line GOLIATH prompt exists at `plan/GOLIATH_PHASE6_PROMPT.md` with complete mock data shapes, types, adapters, API module, hooks, and component specs **verbatim**. Read it for all detailed specs. The instructions below are the condensed Hellcat build order — use the GOLIATH file for exact mock data content, type definitions, and component interfaces.

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **Do NOT modify** | Already-completed pages from Phases 0–5 |
| **MAY modify** | `router/routes.tsx`, `shared/api/mock/handlers.ts`, `shared/api/dto-adapters/intel.ts` |
| **MAY modify** | `src/pages/intel/*` (all 6 placeholder pages) |
| **No new design tokens** | Use CSS variables from `globals.css` |
| **No component duplication** | Check `src/shared/components/index.ts` first |
| **All 4 states required** | Loading, Empty, Error (with retry), Populated |
| **Mock mode only** | All data from `src/mocks/` via `apiGet()` |
| **Icons** | Lucide only (already in deps) |
| **Charts** | Recharts only (already in deps) |
| **Types** | No `any` — use proper DTO types |
| **Named exports** for all components and hooks |

---

## 2. BUILD ORDER — 12 STEPS

### Step 1 — Create Mock Data (5 files)

Read `plan/GOLIATH_PHASE6_PROMPT.md` lines 101-400 for complete mock data shapes and sample data. Create these files:

| File | Contents |
|------|----------|
| `src/mocks/intel-briefs.json` | 12+ briefs across all districts, categories, priorities |
| `src/mocks/intel-emerging-trends.json` | 8+ trends with monthly chartData arrays |
| `src/mocks/intel-red-zones.json` | 10+ red-zone districts (3 high, rest medium/low) |
| `src/mocks/intel-predictive-zones.json` | 8+ predictive zones with confidence 60–95% |
| `src/mocks/intel-socio-economic.json` | 2 correlations + demographics for all 31 districts |

### Step 2 — Register Mock Handlers

**File:** `src/shared/api/mock/handlers.ts`
- Import all 5 new JSON files
- Add registry entries for `/intel/briefs`, `/intel/trends`, `/intel/red-zones`, `/intel/predictive-zones`, `/intel/socio-economic`

### Step 3 — Rewrite DTO Adapters

**File:** `src/shared/api/dto-adapters/intel.ts`
- Define interfaces: `IntelBrief`, `EmergingTrend`, `RedZone`, `PredictiveZone`, `SocioEconomicCorrelation`, `SocioEconomicData`
- Write adapter functions for each
- See GOLIATH prompt lines 436-541 for exact code

### Step 4 — Create Feature API Module

**Directory:** `src/features/intelligence/api/`
**File:** `intelApi.ts`
- 5 exported functions: `fetchIntelBriefs`, `fetchEmergingTrends`, `fetchRedZones`, `fetchPredictiveZones`, `fetchSocioEconomicData`
- Each calls `apiGet()` then adapts through DTO adapters
- See GOLIATH prompt lines 551-589

### Step 5 — Create Query Hooks (5 files)

**Directory:** `src/features/intelligence/hooks/`
- `useIntelBriefs.ts` — queryKey: `['intel-briefs']`
- `useEmergingTrends.ts` — queryKey: `['intel-trends']`
- `useRedZones.ts` — queryKey: `['intel-red-zones']`
- `usePredictiveZones.ts` — queryKey: `['intel-predictive-zones']`
- `useSocioEconomicData.ts` — queryKey: `['intel-socio-economic']`
- Each uses `useQuery` with `staleTime: 5 * 60_000`

### Step 6 — Create Intel Components (6 files)

**Directory:** `src/features/intelligence/components/`
- `IntelHubHero.tsx` — Hero brief strip (briefs count, red zones, trends, etc.)
- `IntelBriefCard.tsx` — Individual brief card (4 states: loading/error/empty/populated)
- `EmergingTrendsPanel.tsx` — Ranked trends with Recharts sparklines
- `RedZonePanel.tsx` — Red-zone district list with SeverityBadge + trend indicators
- `PredictiveZonesPanel.tsx` — Predictive zones with confidence bars
- `SocioEconomicPanel.tsx` — Recharts ScatterChart for literacy vs crime / poverty vs crime

**See GOLIATH prompt lines 628-737** for exact component specs, layout diagrams, and props.

### Step 7 — Build IntelHubPage (`/intel`)

**File:** `src/pages/intel/IntelHubPage.tsx`

The executive command center — senior leadership dashboard.

**Layout:**
1. **PageHeader** — "Strategic Intelligence Hub"
2. **IntelHubHero** — hero brief strip
3. **Command View** — 2×2 grid:
   - Top-left: `PredictiveZonesPanel`
   - Top-right: `SocioEconomicPanel` (Recharts ScatterChart)
   - Bottom-left: `EmergingTrendsPanel`
   - Bottom-right: `RedZonePanel`
4. **AI-Generated Briefs** section — grid of top 6 `IntelBriefCard` components
5. **EmergencyFooter** (from `shared/layout`)

**Data:** Call all 5 hooks in parallel via `useQueries` or individual `useQuery` calls.

### Step 8 — Build BriefingsPage (`/intel/briefings`)

**File:** `src/pages/intel/BriefingsPage.tsx`

- **PageHeader** — "Intelligence Briefings"
- **Filter bar:** category dropdown (All/Crime/Cyber), priority dropdown, date range, search
- **Card grid** of `IntelBriefCard` (paginated, 12 per page)
- Empty state: "No briefings match your filters"

### Step 9 — Build IntelReportsPage (`/intel/reports`)

**File:** `src/pages/intel/IntelReportsPage.tsx`

- Table-style listing of all intelligence output
- Sortable columns: title, date, category, priority, district
- Export button (placeholder UI)
- Download as PDF button (placeholder UI)

### Step 10 — Build WatchlistsPage (`/intel/watchlists`)

**File:** `src/pages/intel/WatchlistsPage.tsx`

- 3 pre-populated watchlists (Cyber Threats, Repeat Offenders, Red-Zone Districts)
- Each watchlist = expandable card with summary + linked items
- "Create Watchlist" button (placeholder)

### Step 11 — Build SignalsPage (`/intel/signals`)

**File:** `src/pages/intel/SignalsPage.tsx`

- Timeline view of notable intel events
- Events: brief published, zone escalated, trend crossed threshold
- Filterable by type and date

### Step 12 — Build StrategicForecastPage (`/intel/forecast`)

**File:** `src/pages/intel/StrategicForecastPage.tsx`

- All predictive zones with confidence scores, contributing factors, recommendations
- 7-day / 30-day forecast toggle
- Detail view per prediction zone

---

## 3. REFERENCE PATTERNS

### Data Fetching
```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchIntelBriefs } from '@/features/intelligence/api/intelApi';
import { LoadingSkeleton, ErrorState } from '@/shared/components';

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['intel-briefs'],
  queryFn: fetchIntelBriefs,
  staleTime: 5 * 60_000,
});
```

### Glass Card + Page Layout
```tsx
<section className="glass-card rounded-[var(--radius-2xl)] p-5">
  <h2 className="text-xl font-bold mb-4">Section Title</h2>
  {/* content */}
</section>
```

### 4-State Rendering Pattern
```tsx
if (isLoading) return <LoadingSkeleton variant="card" count={6} />;
if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState message="No data available" />;
return <>{/* populated content */}</>;
```

---

## 4. DELIVERABLES CHECKLIST

### Files Created (17)
- [ ] `src/mocks/intel-briefs.json`
- [ ] `src/mocks/intel-emerging-trends.json`
- [ ] `src/mocks/intel-red-zones.json`
- [ ] `src/mocks/intel-predictive-zones.json`
- [ ] `src/mocks/intel-socio-economic.json`
- [ ] `src/features/intelligence/api/intelApi.ts`
- [ ] `src/features/intelligence/hooks/useIntelBriefs.ts`
- [ ] `src/features/intelligence/hooks/useEmergingTrends.ts`
- [ ] `src/features/intelligence/hooks/useRedZones.ts`
- [ ] `src/features/intelligence/hooks/usePredictiveZones.ts`
- [ ] `src/features/intelligence/hooks/useSocioEconomicData.ts`
- [ ] `src/features/intelligence/components/IntelHubHero.tsx`
- [ ] `src/features/intelligence/components/IntelBriefCard.tsx`
- [ ] `src/features/intelligence/components/EmergingTrendsPanel.tsx`
- [ ] `src/features/intelligence/components/RedZonePanel.tsx`
- [ ] `src/features/intelligence/components/PredictiveZonesPanel.tsx`
- [ ] `src/features/intelligence/components/SocioEconomicPanel.tsx`

### Files Modified / Rewritten (9)
- [ ] `src/shared/api/mock/handlers.ts` — add 5 imports + registry entries
- [ ] `src/shared/api/dto-adapters/intel.ts` — rewrite with full types + adapters
- [ ] `src/pages/intel/IntelHubPage.tsx` — rewrite from placeholder
- [ ] `src/pages/intel/BriefingsPage.tsx` — rewrite from placeholder
- [ ] `src/pages/intel/IntelReportsPage.tsx` — rewrite from placeholder
- [ ] `src/pages/intel/WatchlistsPage.tsx` — rewrite from placeholder
- [ ] `src/pages/intel/SignalsPage.tsx` — rewrite from placeholder
- [ ] `src/pages/intel/StrategicForecastPage.tsx` — rewrite from placeholder
- [ ] `changes.md` — add Phase 6 completion entry

### Verification
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] IntelHubPage renders all 6 sections (hero, 4 panels, brief cards)
- [ ] All 6 sub-pages render from mock data with all 4 states
- [ ] No frozen files modified

---

## 5. BUILD PROTOCOL

1. **Read `plan/GOLIATH_PHASE6_PROMPT.md` first** for exact mock data shapes, types, and component specs
2. Build in order: mocks → handlers → adapters → API → hooks → components → pages
3. **Verify after each logical group** with `npx tsc --noEmit`
4. **Do NOT proceed** to Phase 7 (Intel Graph Workspace) — stop when Phase 6 is complete
5. **Report back** with file manifest, verification results, and any issues

---

*Phase 6 completion prompt for Hellcat. 6 pages, 5 mocks, 5 hooks, 6 components. Full specs in GOLIATH_PHASE6_PROMPT.md.*
