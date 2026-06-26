# HELLCAT — PHASE 3 CYBER SUITE COMPLETION PROMPT

> Complete the final 2 placeholder pages in the Cyber Intelligence Suite.
> Phase: 3 of 10 | Focus: Cyber Fraud Analytics & Heatmap

---

## 0. CONTEXT

Phase 2 (Crime Suite) is complete. **Phase 3 (Cyber Suite) is ~80% built.**

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### What's Already Built in Phase 3

| Module | Status |
|--------|--------|
| Mock data (5 files) | ✅ Complete |
| Mock handlers (`/cyber/*` endpoints) | ✅ Complete |
| DTO adapters (`cyber.ts`) | ✅ Complete |
| API module (`cyberApi.ts`) | ✅ Complete |
| Query hooks (7 hooks) | ✅ Complete |
| Shared components (CyberIncidentTable, EvidenceChain, ThreatCard) | ✅ Complete |
| `CyberOverviewPage` — Dashboard | ✅ Complete |
| `CyberCasesPage` — Incident list | ✅ Complete |
| `CyberCaseDetailPage` — Incident detail | ✅ Complete |
| `IpIntelligencePage` — IP lookup | ✅ Complete |
| `DomainIntelligencePage` — Domain lookup | ✅ Complete |
| `CyberThreatsPage` — Threat intelligence | ✅ Complete |
| `DigitalEvidencePage` — Evidence tracker | ✅ Complete |
| `NetworkFlowPage` — Network flows | ✅ Complete |
| Routes — all exist | ✅ Complete |

### What's Missing — Build These 2 Pages

| # | Page | Route | Current State |
|:-:|------|-------|:-------------:|
| 1 | `FraudAnalyticsPage.tsx` | `/cyber/fraud-analytics` | `createPlaceholderPage('Fraud Analytics')` |
| 2 | `CyberHeatmapPage.tsx` | `/cyber/heatmap` | `createPlaceholderPage('Cyber Heatmap')` |

### Infrastructure Ready

- **Shared components:** `KpiCard`, `PageHeader`, `LoadingSkeleton` (variants: `card`, `table-row`, `chart`, `text`), `EmptyState`, `ErrorState`, `SeverityBadge`, `Badge`, `RiskBadge`
- **UI Kit:** `Button`, `Input`, `Select`, `SearchInput`, `Badge`, `Modal`
- **Charts:** Recharts installed (`Area`, `Bar`, `Pie`, `Cell`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`, `CartesianGrid`, `Legend`)
- **Icons:** Lucide React
- **Stores:** `filterStore` with `cyberFilters: DomainFilters` and `setCyberFilters()`
- **Existing hooks:** `useCyberIncidents()`, `useNetworkFlows()`, `useCyberFilters()`
- **Existing data:** `cyber-incidents.json` (100+ records with types, severities, districts)
- **Routes:** Already registered — just need working components
- **Design tokens:** CSS variables in `globals.css` only

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*`, `router/routes.tsx` |
| **Do NOT modify** | Already-built cyber pages, hooks, API module, DTO adapters |
| **MAY modify** | `src/shared/api/mock/handlers.ts` (only to add `/cyber/fraud-analytics` endpoint) |
| **MAY create** | New mock data file `src/mocks/fraud-analytics.json` if needed |
| **No new design tokens** | Use CSS variables only |
| **No component duplication** | Check `src/shared/components/index.ts` first |
| **All 4 states required** | loading, empty, error, populated on every page |
| **Mock mode** | All data from `src/mocks/` or derived from existing cyber data |
| **Icons** | Lucide only |
| **Types** | No `any` |
| **Named exports** for all components |
| **Recharts** for all chart visualizations |
| **Dark theme** — all cards use `glass-card` class |

---

## 2. BUILD ORDER — 2 PAGES

---

### PAGE 1: FraudAnalyticsPage (`/cyber/fraud-analytics`)

**Goal:** Visualize fraud-related cyber incidents — type distribution, trends over time, top targets, and monetary impact.

**Data strategy:** Derive from existing `cyber-incidents.json` via `useCyberIncidents()`, filtered to fraud-related types:
- `Cyber Fraud`, `Identity Theft`, `Phishing`, `Social Engineering`

#### Requirements

1. **Create file:** `src/pages/cyber/FraudAnalyticsPage.tsx`

2. **Data source:** `useCyberIncidents()` filtered to fraud-related types. No new mock data needed.

3. **Visual layout:**

   - **PageHeader** — title "Fraud Analytics" with subtitle "Fraud pattern analysis across cyber incidents"
   - **KPI row** (4 cards):
     - Total Fraud Cases (filtered count)
     - Active Investigations (Open/Under Investigation status)
     - Amount at Risk / Impact (derive from impact descriptions, or show total unique targets)
     - Avg Resolution Rate
   - **Two-column grid:**
     - **Left (1/2):** Fraud Type Distribution — Recharts `PieChart` with colored slices (use existing `colors` pattern: cyan, red, gold, purple, violet)
     - **Right (1/2):** Monthly Fraud Trend — Recharts `AreaChart` with gold gradient fill showing fraud incidents over months
   - **Bottom row:**
     - **Top Targeted Entities** — table showing target, incident count, most common fraud type, status
     - Sortable by incident count
   - **Filter bar** — Fraud type dropdown, Status dropdown below PageHeader

4. **States:**
   - **Loading:** `LoadingSkeleton` with chart variant + KPI skeleton row
   - **Error:** `ErrorState` with retry
   - **Empty:** `EmptyState` — "No fraud analytics data available. Cyber incidents may not contain fraud records."
   - **Populated:** Full layout as described

5. **Interactivity:** Filter dropdowns update KPIs, charts, and table in real time

#### Reference — PieChart Pattern (from existing code)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
      {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

### PAGE 2: CyberHeatmapPage (`/cyber/heatmap`)

**Goal:** Show a heatmap-style visualization of cyber incident activity — cross-referencing crime types and districts to reveal density patterns.

**Data strategy:** Use `useCyberIncidents()` — group incidents by type × district to build a heatmap matrix.

#### Requirements

1. **Create file:** `src/pages/cyber/CyberHeatmapPage.tsx`

2. **Data source:** `useCyberIncidents()` — no new mock data needed. Derive heatmap cells by aggregating incidents.

3. **Visual layout:**

   - **PageHeader** — title "Cyber Heatmap" with subtitle "Incident density by type and district"
   - **Summary KPI row** (3 cards):
     - Total Incidents Mapped
     - Most Active District
     - Most Common Attack Type
   - **Heatmap grid** — a CSS grid/table where:
     - **Rows** = crime types (Phishing, Malware, Ransomware, etc.)
     - **Columns** = districts
     - **Cells** = color-coded by incident count (use background opacity/color intensity)
     - Cell contains the count number
     - Hover shows tooltip with type, district, count
   - **Legend** — color scale from low (green/cyan) → medium (amber) → high (red)
   - **Filter bar** — Severity dropdown, Date range filter

4. **States:**
   - **Loading:** `LoadingSkeleton` with chart variant
   - **Error:** `ErrorState` with retry
   - **Empty:** `EmptyState` — "No heatmap data available."
   - **Populated:** Full heatmap grid

5. **Interactivity:** Filters update the heatmap. Hover reveals details.

#### Heatmap Cell Color Algorithm
```tsx
function getHeatColor(count: number, max: number): string {
  const ratio = count / max;
  if (ratio > 0.66) return 'rgba(239, 68, 68, 0.8)';    // red - high
  if (ratio > 0.33) return 'rgba(245, 158, 11, 0.8)';   // amber - medium
  return 'rgba(34, 211, 238, 0.6)';                       // cyan - low
}
```

---

## 3. REFERENCE PATTERNS

### Data Derivation Pattern (use existing hooks)
```tsx
import { useMemo } from 'react';
import { useCyberIncidents } from '@/features/cyber/hooks/useCyberIncidents';

const FRAUD_TYPES = ['Cyber Fraud', 'Identity Theft', 'Phishing', 'Social Engineering'];

export default function FraudAnalyticsPage() {
  const { data: allIncidents, isLoading, isError, error, refetch } = useCyberIncidents();

  const fraudIncidents = useMemo(
    () => (allIncidents ?? []).filter(i => FRAUD_TYPES.includes(i.type)),
    [allIncidents]
  );

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    fraudIncidents.forEach(i => map.set(i.type, (map.get(i.type) ?? 0) + 1));
    return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
  }, [fraudIncidents]);
  // ...
}
```

### Glass Card Pattern
```tsx
<section className="glass-card rounded-[var(--radius-2xl)] p-5">
  <h2 className="text-xl font-bold">Section Title</h2>
  {/* content */}
</section>
```

### Filter Bar Pattern
```tsx
<section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_180px]">
  <Select onValueChange={setFraudType} options={fraudTypeOptions} value={fraudType} />
  <Select onValueChange={setStatus} options={statusOptions} value={status} />
</section>
```

---

## 4. MOCK DATA

Both pages can derive their data from the **existing** `cyber-incidents.json` (100+ records) via `useCyberIncidents()`, filtered and aggregated with `useMemo`.

If you want separate mock endpoints for clean routing:
- Create `/cyber/fraud-analytics` as a computed subset in `handlers.ts`
- Create `/cyber/heatmap` as a computed matrix in `handlers.ts`

But deriving client-side from `useCyberIncidents()` is simpler and follows the existing pattern.

---

## 5. DELIVERABLES

### Files Created
- [ ] `src/pages/cyber/FraudAnalyticsPage.tsx`
- [ ] `src/pages/cyber/CyberHeatmapPage.tsx`

### Files Possibly Modified
- [ ] `src/shared/api/mock/handlers.ts` (only if adding dedicated fraud-analytics endpoint)

### Acceptance Criteria
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Fraud Analytics at `/cyber/fraud-analytics` shows fraud KPIs, PieChart, AreaChart, targets table
- [ ] Cyber Heatmap at `/cyber/heatmap` shows interactive heatmap grid with type×district density
- [ ] Both pages have **all 4 states**: loading → error → empty → populated
- [ ] Design tokens match existing pages — no new CSS variables
- [ ] Reuses existing shared components — no duplicates
- [ ] Lucide icons used throughout
- [ ] All glass-card styling matches existing dark theme
- [ ] Filter controls work on each page
- [ ] Changelog entry added to `changes.md`

### Demo Moment
**"Cyber Intelligence Suite Complete — fraud analytics with type distribution and monthly trends, plus an interactive heatmap showing incident density across crime types and Karnataka districts."**

---

## 6. BUILD PROTOCOL

1. **Read reference files first:** `CyberOverviewPage.tsx`, `CyberThreatsPage.tsx`, `DigitalEvidencePage.tsx`
2. **Build both pages** (FraudAnalytics first, then CyberHeatmap)
3. **Verify:** `npx tsc --noEmit` then `npm run build` — both must pass
4. **Do NOT modify** frozen files or already-completed pages
5. **Do NOT proceed** to any other phase — stop after Phase 3 is complete
6. **Report back** with a summary of what was built, any issues encountered, and verification results

---

*Phase 3 completion prompt for Hellcat. 2 pages remain. Follow all rules and patterns.*
