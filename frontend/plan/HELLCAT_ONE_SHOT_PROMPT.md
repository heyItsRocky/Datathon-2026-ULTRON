# 🚨 HELLCAT: ULTRON Frontend — One-Shot Build

**Context:** This is the **entire frontend** of **ULTRON** — a KSP Police Command Center for Datathon 2026. You must build ALL of it in a single session. Every page, every component, every integration.

**Do NOT ask any follow-up questions.** All decisions are already made below. If something is ambiguous, read the existing mock JSON files or existing component files in the project. Follow patterns already established.

**Start by reading the existing codebase first** — then build everything that's missing or incomplete. Do not rewrite what's already there. Build on top of it.

---

## 📋 Pre-Build Checklist (Read These First)

Before writing any code, read:
1. `frontend/package.json` — exact dependency versions
2. `frontend/vite.config.ts` — aliases, proxy config
3. `frontend/src/globals.css` — CSS variables, glass styles
4. `frontend/src/shared/config.ts` — `MOCK_MODE` / `API_BASE_URL`
5. `frontend/src/shared/api/client.ts` — `apiGet<T>()` pattern
6. `frontend/src/shared/layout/AppShell.tsx` — existing layout structure
7. `frontend/src/shared/layout/TopHeader.tsx` — existing header
8. `frontend/src/shared/layout/SidebarNav.tsx` — existing sidebar
9. `frontend/src/shared/layout/navigation.ts` — existing nav items
10. `frontend/src/shared/components/RadialNav.tsx` — existing radial nav
11. `frontend/src/shared/components/KSPHeader.tsx` — existing KSP header
12. `frontend/src/shared/components/KpiCard.tsx` — existing KPI card pattern
13. `frontend/src/router/AppRoutes.tsx` — existing routing
14. `frontend/src/router/routes.tsx` — existing route definitions
15. `frontend/src/pages/CommandCenterPage.tsx` — existing command center
16. `frontend/src/pages/dashboard/UnifiedDashboardPage.tsx` — existing dashboard page (use as PATTERN for all pages)
17. All 28 mock JSON files in `frontend/src/mocks/`
18. `frontend/src/stores/` — all 5 Zustand stores
19. `PRD.md`, `ARCHITECTURE.md`, `split.md` from project root

---

## 🎯 ONE-SHOT INSTRUCTION

Build ALL of the following. Work in this EXACT order:

### PHASE 1: Foundation (Already Partially Built)

Verify these already exist and are correct. Fix anything broken:
- [ ] `src/shared/ui-kit/` — Button, Input, Select, Badge, Modal, Drawer, SearchInput, index.ts
- [ ] `src/shared/components/` — ALL 18 components exist with correct props
- [ ] `src/shared/layout/` — AppShell, TopHeader, SidebarNav, FooterBar, RightContextPanel, SectionToolbar, navigation.ts
- [ ] `src/shared/api/` — client.ts with apiGet<T>(), mock handlers, DTO adapters
- [ ] `src/stores/` — authStore, navStore, filterStore, uiStore, graphStore
- [ ] `src/router/` — AppRoutes with lazy loading, ProtectedRoute, all 53 routes defined
- [ ] `src/hooks/` — useAnimeTransition with usePageEnter(delay)

### PHASE 2: Build ALL Missing Pages

Each page MUST:
1. Use `apiGet<T>()` via `useQuery` from TanStack Query (import from `@tanstack/react-query`)
2. Handle 4 states: `isLoading` → LoadingSkeleton, `error` → ErrorState, `empty` → EmptyState, `data` → Render
3. Use `motion.div {...usePageEnter(index)}` for staggered entrance animations
4. Import mock JSON directly IF the API endpoint doesn't exist yet (fallback pattern from UnifiedDashboardPage)

#### Build these pages (in order):

**Dashboard section:**
- [ ] `AlertsPage.tsx` — Alert feed with severity filters, pagination
- [ ] `ReportsPage.tsx` — Report list with date range filter, export buttons

**Crime section:**
- [ ] `CrimeOverviewPage.tsx` — KPIs, crime-by-type donut chart, district breakdown
- [ ] `CrimeTrendsPage.tsx` — Time-series area chart with 30d/90d/YTD toggle, MO trend table
- [ ] `CrimeHotspotsPage.tsx` — List of DBSCAN clusters with density/radius/coordinates
- [ ] `CrimeCasesPage.tsx` — Table of all FIRs, sortable columns, type/district/status/severity badges, search bar
- [ ] `CrimeCaseDetailPage.tsx` — Full case view: FIR number, description, accused list, victim list, evidence gallery, timeline, status badge
- [ ] `CriminalListPage.tsx` — Searchable grid of criminals with risk score bar, priors count, status badge
- [ ] `CriminalDetailPage.tsx` — Full profile: MO signature, risk tier (0-100), linked cases table, network graph placeholder, timeline
- [ ] `CrimePatternsPage.tsx` — MO similarity matches, Jaccard scores, linked cases across districts
- [ ] `CrimePredictivePage.tsx` — Predictive risk zones, recidivism risk scoring results, ML confidence indicators

**Cyber section:**
- [ ] `CyberOverviewPage.tsx` — Cyber KPIs, threat type breakdown, active investigations count
- [ ] `CyberThreatsPage.tsx` — Table of threats with MITRE ATT&CK mapping, severity badges, status
- [ ] `CyberCasesPage.tsx` — Cyber case list, filterable by type/status/severity
- [ ] `CyberCaseDetailPage.tsx` — Full cyber case: IOCs list, attack path, source/target IPs, status, evidence
- [ ] `IpIntelligencePage.tsx` — IP reputation card (geolocation, ISP, ASN, score 0-100), linked incidents table, WHOIS data
- [ ] `DomainIntelligencePage.tsx` — Domain card: registrar, creation date, SSL status, DNS records table, phishing probability gauge
- [ ] `FraudAnalyticsPage.tsx` — Fraud transaction timeline, anomaly scores, flagged patterns
- [ ] `DigitalEvidencePage.tsx` — Evidence grid with file type icons, upload date, case links, search
- [ ] `CyberHeatmapPage.tsx` — Heatmap grid of cyber incidents by district/type
- [ ] `NetworkFlowPage.tsx` — Full Cytoscape.js interactive graph showing IP→domain→victim flows

**Maps section:**
- [ ] `MapsOverviewPage.tsx` — Full-screen Leaflet map centered on Karnataka (15.3, 75.7, zoom 7), with layer toggles, district boundaries
- [ ] `HotspotMapPage.tsx` — Map + sidebar: DBSCAN clusters as circle markers, color by density, click for detail
- [ ] `PatrolMapPage.tsx` — Map with patrol zone polygons, GPS marker tracks
- [ ] `GeoFencePage.tsx` — Map with geo-fence polygons, add/edit/delete controls
- [ ] `DistrictMapPage.tsx` — District drill-down: boundary highlight, crime stats overlay, hotspot markers
- [ ] `RouteAnalysisPage.tsx` — Map with route lines between crime locations, distance/time info

**Network section:**
- [ ] `NetworkOverviewPage.tsx` — Tabbed Cytoscape view: Crime graph | Cyber graph | Correlation graph
- [ ] `LinkAnalysisPage.tsx` — Shared associate detection, MO similarity links, interactive graph
- [ ] `EntityExplorerPage.tsx` — Search bar + results grid for people/IPs/places, click to add to graph
- [ ] `NetworkClustersPage.tsx` — Clustered network view with community detection coloring
- [ ] `SuspectProfilePage.tsx` — Detail view: personal info, linked crimes, network subgraph, activity timeline
- [ ] `AssociationMatrixPage.tsx` — Heatmap matrix of entity associations, color-coded by strength

**Intel section:**
- [ ] `IntelHubPage.tsx` — Socio-economic correlation charts (crime vs literacy/poverty bar combo), emerging trends table, red-zone alert cards, predictive zone cards
- [ ] `BriefingsPage.tsx` — Daily intel brief cards with AI-sourced recommendations, date navigation
- [ ] `IntelReportsPage.tsx` — Generated report list with download buttons, date range filter
- [ ] `WatchlistsPage.tsx` — Watchlist CRUD: tracked entities, cases, alerts, notification settings
- [ ] `SignalsPage.tsx` — Signal detection feed: anomaly signals with confidence, assign/dismiss actions
- [ ] `StrategicForecastPage.tsx` — 30/60/90-day risk forecast charts, district-level prediction cards

**Intel Graph section:**
- [ ] `IntelGraphWorkspacePage.tsx` — React Flow (xyflow) workspace: empty canvas with sidebar node palette (7 types: IP/Name/Place/Object/How/Why/What), add nodes by drag, connect, edit labels, delete, export as JSON
- [ ] `GraphBuilderPage.tsx` — Advanced builder with search-add from existing entities
- [ ] `GraphSearchPage.tsx` — Search existing entity graph, filter by type/date/connection count
- [ ] `GraphTimelinePage.tsx` — Timeline slider that filters visible nodes/edges by date

**Admin section:**
- [ ] `AdminOverviewPage.tsx` — System stats cards, quick links to all admin sub-pages
- [ ] `UserManagementPage.tsx` — User table with roles, status toggle, add user modal
- [ ] `RolePermissionsPage.tsx` — Role-permission matrix grid, editable
- [ ] `DataIngestionPage.tsx` — Upload zone, file type selector, ingestion log table
- [ ] `DataQualityPage.tsx` — Data quality score cards, field-by-field completeness table, issue alerts
- [ ] `AuditLogPage.tsx` — Filterable audit log table with user/action/resource/time columns
- [ ] `SystemHealthPage.tsx` — Service status cards (green/red), uptime charts, version info

**Other:**
- [ ] `LoginPage.tsx` — KSP branding + RadialNav as hero + login form with email/password
- [ ] `NotFoundPage.tsx` — 404 with KSP emblem, "Page not found" text, back to command center button

### PHASE 3: Feature Components

For each feature module (`src/features/`), build the domain-specific components:

**Crime features (`features/crime/components/`):**
- CrimeCaseTable — sortable, filterable table
- CrimeCaseDetail — full detail view
- CriminalCard — risk score, priors, status
- CriminalProfile — full profile with network
- CrimeTrendChart — Recharts area/bar
- HotspotPanel — cluster list
- MOMatchPanel — similarity matches
- RedZoneAlert — pulsing alert card
- CrimeTypeDonut — donut chart
- DistrictBreakdown — bar chart

**Cyber features (`features/cyber/components/`):**
- ThreatTable — MITRE ATT&CK tags
- ThreatDetailPanel
- IpReputationCard — geolocation + score gauge
- DomainIntelCard — WHOIS + SSL + DNS
- NetworkFlowGraph — Cytoscape
- PhishingCaseCard
- CyberKpiRow
- IncidentTimeline

**Maps features (`features/maps/components/`):**
- KarnatakaMap — Leaflet base map
- HotspotLayer — DBSCAN clusters
- DistrictBoundaryLayer
- SocioEconomicLayer — choropleth
- PredictiveZoneLayer
- RedZoneMarker — pulsing
- GeoFenceEditor
- RoutePathLayer
- MapLegend
- LayerToggle

**Network features (`features/network/components/`):**
- CriminalNetworkGraph — Cytoscape
- CyberNetworkGraph — Cytoscape
- CorrelationGraph — combined
- LinkAnalysisPanel
- EntityExplorerPanel
- AssociationHeatmap — matrix
- NetworkLegend

**Intelligence features (`features/intelligence/components/`):**
- SocioEconomicChart — Recharts combo bar
- EmergingTrendsTable
- RedZoneGrid — pulsing district cards
- PredictiveRiskGrid
- IntelBriefCard
- WatchlistPanel
- SignalFeed
- ForecastChart

**Intel Graph features (`features/intel-graph/components/`):**
- NodePalette — drag source sidebar
- NodeConfigPanel — edit node
- EdgeConfigPanel — edit edge
- GraphCanvas — React Flow wrapper
- ExportToolbar
- TimelineSlider

**Admin features (`features/admin/components/`):**
- UserTable
- RoleMatrix
- IngestionDropzone
- AuditLogTable
- HealthStatusCard
- DataQualityScore

### PHASE 4: Integration

- [ ] Every page imports from `@/shared/api/client` using `apiGet<T>()` — NOT direct JSON imports in page files. Pages should use mock JSON only as fallback via the mock handler layer.
- [ ] Every `apiGet<T>()` call must have a corresponding mock handler route in `src/shared/api/mock/handlers.ts` that maps the URL path to the correct JSON file.
- [ ] All 28 mock JSON files are indexed and wired up.
- [ ] `ProtectedRoute` checks auth + optional permission strings.
- [ ] `SectionToolbar` shows sub-navigation for current section.
- [ ] `RightContextPanel` opens via `uiStore` on item click.
- [ ] Global `filterStore` filters are applied to relevant queries.
- [ ] All Zustand stores are connected to relevant components.

### PHASE 5: Polish

- [ ] Responsive: test at 375px, 768px, 1280px. Use `hidden md:flex`, `grid md:grid-cols-2 xl:grid-cols-4`, `p-4 lg:p-6` patterns.
- [ ] Loading skeletons match the layout shape of each page.
- [ ] Empty states have contextual descriptions and relevant action buttons.
- [ ] Error states have retry callbacks using `refetch()` from TanStack Query.
- [ ] Hover states on all interactive cards/rows (`hover:-translate-y-0.5 hover:border-strong`).
- [ ] Consistent glass card styling (`glass-card` class) on all card-like surfaces.
- [ ] No hardcoded colors — use CSS variables from `globals.css`.
- [ ] No console.logs, no TODO comments, no dead code.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `npm run lint` passes with zero warnings.

---

## 🧱 EXISTING PATTERNS TO FOLLOW (MANDATORY)

### Page Pattern
Every page in this codebase follows the `UnifiedDashboardPage.tsx` pattern exactly. Study it before building anything.

```typescript
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { apiGet } from '@/shared/api/client';
import { usePageEnter } from '@/hooks/useAnimeTransition';
import { LoadingSkeleton, ErrorState, EmptyState, PageHeader } from '@/shared/components';
import { useFilterStore } from '@/stores/filterStore';

type LoadState = 'loading' | 'ready' | 'error';

export default function ExamplePage() {
  const district = useFilterStore((s) => s.globalDistrict);
  const setDistrict = useFilterStore((s) => s.setGlobalDistrict);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['example-key', district],
    queryFn: () => apiGet<DataType>('/api/endpoint'),
  });

  if (isLoading) return /* LoadingSkeletons matching layout */;
  if (error) return <ErrorState message="..." onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState title="..." description="..." actionLabel="..." onAction={...} />;

  return (
    <div className="grid gap-6">
      <motion.section {...usePageEnter(0)} className="glass-card flex ... rounded-[var(--radius-2xl)] p-5">
        <PageHeader title="..." description="..." />
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, i) => (
          <motion.div key={item.id} {...usePageEnter(i + 1)}>
            {/* Glass card content */}
          </motion.div>
        ))}
      </section>
    </div>
  );
}
```

### Glass Card Pattern
```tsx
<div className="glass-card rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-5
  bg-[linear-gradient(180deg,rgba(18,24,36,0.84),rgba(13,17,23,0.72))]
  backdrop-filter-[blur(18px)_saturate(135%)]
  shadow-[var(--shadow-surface-2)]">
```

### KPI Card Pattern
```tsx
<KpiCard icon={Icon} title="Total FIRs" value={1247} trend={12} />
```

### Trend Chart Pattern
```tsx
<ResponsiveContainer width="100%" height={320}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f0b000" stopOpacity={0.45} />
        <stop offset="95%" stopColor="#f0b000" stopOpacity={0.02} />
      </linearGradient>
    </defs>
    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
    <XAxis axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} dataKey="name" />
    <YAxis axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
    <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem' }} />
    <Area dataKey="value" fill="url(#fill)" stroke="#f0b000" strokeWidth={3} type="monotone" />
  </AreaChart>
</ResponsiveContainer>
```

### State Management Pattern
```typescript
// Zustand store access
const district = useFilterStore((s) => s.globalDistrict);
const setDistrict = useFilterStore((s) => s.setGlobalDistrict);
const dateRange = useFilterStore((s) => s.globalDateRange);
const user = useAuthStore((s) => s.user);
const openRightPanel = useUIStore((s) => s.openRightPanel);
```

---

## 🎨 DESIGN SYSTEM REFERENCE

### Gold Section Labels Pattern
```tsx
<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">SECTION LABEL</p>
<h2 className="mt-1 text-xl font-bold">Section heading title</h2>
<p className="mt-1 text-sm text-[var(--color-text-secondary)]">Section subtitle description...</p>
```

### Badge Variants
```tsx
<Badge variant="gold">Role: admin</Badge>
<Badge variant="cyan">Cyber Track</Badge>
<Badge variant="muted">Filtered</Badge>
<Badge variant="red">Critical</Badge>
<Badge variant="green">Low</Badge>
```

### Severity Colors
```tsx
// severity: 'extreme' | 'high' | 'medium' | 'low'
const severityColors = {
  extreme: { bg: 'bg-red-500/15', text: 'text-red-300', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-300', dot: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-300', dot: 'bg-yellow-500' },
  low: { bg: 'bg-green-500/15', text: 'text-green-300', dot: 'bg-green-500' },
};
```

### Active Navigation Item
```tsx
// SidebarItem active state:
className={`relative flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-sm font-semibold transition-[var(--transition-base)] ${
  isActive
    ? 'bg-[var(--color-gold-soft)] text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]'
    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
}`}
```

---

## 📁 COMPLETE FILE LIST TO VERIFY/CREATE

### Pages (53)
```
src/pages/CommandCenterPage.tsx             ← EXISTS
src/pages/LoginPage.tsx                     ← CREATE
src/pages/NotFoundPage.tsx                   ← CREATE
src/pages/dashboard/UnifiedDashboardPage.tsx ← EXISTS
src/pages/dashboard/AlertsPage.tsx          ← CREATE
src/pages/dashboard/ReportsPage.tsx         ← CREATE
src/pages/crime/CrimeOverviewPage.tsx       ← CREATE
src/pages/crime/CrimeTrendsPage.tsx         ← CREATE
src/pages/crime/CrimeHotspotsPage.tsx       ← CREATE
src/pages/crime/CrimeCasesPage.tsx          ← CREATE
src/pages/crime/CrimeCaseDetailPage.tsx     ← CREATE
src/pages/crime/CriminalListPage.tsx        ← CREATE
src/pages/crime/CriminalDetailPage.tsx      ← CREATE
src/pages/crime/CrimePatternsPage.tsx       ← CREATE
src/pages/crime/CrimePredictivePage.tsx     ← CREATE
src/pages/cyber/CyberOverviewPage.tsx       ← CREATE
src/pages/cyber/CyberThreatsPage.tsx        ← CREATE
src/pages/cyber/CyberCasesPage.tsx          ← CREATE
src/pages/cyber/CyberCaseDetailPage.tsx     ← CREATE
src/pages/cyber/IpIntelligencePage.tsx      ← CREATE
src/pages/cyber/DomainIntelligencePage.tsx  ← CREATE
src/pages/cyber/FraudAnalyticsPage.tsx      ← CREATE
src/pages/cyber/DigitalEvidencePage.tsx     ← CREATE
src/pages/cyber/CyberHeatmapPage.tsx        ← CREATE
src/pages/cyber/NetworkFlowPage.tsx         ← CREATE
src/pages/maps/MapsOverviewPage.tsx         ← CREATE
src/pages/maps/HotspotMapPage.tsx           ← CREATE
src/pages/maps/PatrolMapPage.tsx            ← CREATE
src/pages/maps/GeoFencePage.tsx             ← CREATE
src/pages/maps/DistrictMapPage.tsx          ← CREATE
src/pages/maps/RouteAnalysisPage.tsx        ← CREATE
src/pages/network/NetworkOverviewPage.tsx   ← CREATE
src/pages/network/LinkAnalysisPage.tsx      ← CREATE
src/pages/network/EntityExplorerPage.tsx    ← CREATE
src/pages/network/NetworkClustersPage.tsx   ← CREATE
src/pages/network/SuspectProfilePage.tsx    ← CREATE
src/pages/network/AssociationMatrixPage.tsx ← CREATE
src/pages/intel/IntelHubPage.tsx            ← CREATE
src/pages/intel/BriefingsPage.tsx           ← CREATE
src/pages/intel/IntelReportsPage.tsx        ← CREATE
src/pages/intel/WatchlistsPage.tsx          ← CREATE
src/pages/intel/SignalsPage.tsx             ← CREATE
src/pages/intel/StrategicForecastPage.tsx   ← CREATE
src/pages/intel-graph/IntelGraphWorkspacePage.tsx ← CREATE
src/pages/intel-graph/GraphBuilderPage.tsx  ← CREATE
src/pages/intel-graph/GraphSearchPage.tsx   ← CREATE
src/pages/intel-graph/GraphTimelinePage.tsx ← CREATE
src/pages/admin/AdminOverviewPage.tsx       ← CREATE
src/pages/admin/UserManagementPage.tsx      ← CREATE
src/pages/admin/RolePermissionsPage.tsx     ← CREATE
src/pages/admin/DataIngestionPage.tsx       ← CREATE
src/pages/admin/DataQualityPage.tsx         ← CREATE
src/pages/admin/AuditLogPage.tsx            ← CREATE
src/pages/admin/SystemHealthPage.tsx        ← CREATE
```

### Feature Components
Each `src/features/{domain}/components/` directory needs its components built (listed in Phase 3 above). Follow existing patterns:

```
src/features/
  crime/       → api/, components/, hooks/
  cyber/       → api/, components/, hooks/
  maps/        → api/, components/, hooks/
  network/     → api/, components/, hooks/
  intelligence/ → api/, components/, hooks/
  intel-graph/ → api/ (not needed), components/, utils/
  admin/       → api/, components/, hooks/
```

---

## ✅ VERIFICATION COMMANDS

Run these after completing all phases:

```bash
# 1. TypeScript check
cd /mnt/e/Datathon-2026-ULTRON/frontend && npx tsc --noEmit

# 2. Build
npm run build

# 3. Lint
npm run lint

# 4. Dev server smoke test
npm run dev
```

**Success criteria:**
- `tsc --noEmit` → zero errors
- `npm run build` → `dist/` produced successfully
- `npm run lint` → zero warnings
- Dev server starts on `localhost:5173` without console errors
- All 53 routes are accessible and render their pages
- Mock data renders on every page
- Every page passes through loading → data/empty/error states

---

## 🚫 RULES FOR HELLCAT

1. **No code outside `frontend/`** — backend changes are NOT your job.
2. **Do NOT delete any existing files** — only add new files and fix broken ones.
3. **Do NOT modify `package.json`** unless adding a dependency that's truly missing.
4. **Do NOT modify `vite.config.ts`** — it's already correct.
5. **Do NOT modify existing mock JSON files** — they're the source of truth.
6. **Do NOT hardcode data** — always use `apiGet<T>()` with mock fallback.
7. **Do NOT add CSS files** — use `globals.css` variables and Tailwind utility classes only.
8. **Do NOT add new npm packages** unless absolutely essential.
9. **Every new file must be importable** — lazy-loaded via `React.lazy()` in routes.
10. **Follow the exact patterns** in UnifiedDashboardPage.tsx for loading/error/empty/data states.
11. **Commit after every meaningful unit of work** with conventional commit messages (feat:, fix:, chore:).
12. **If you hit a build error, fix it immediately** — do not leave broken code.
13. **Report progress clearly** — tell me what you built, what's left, and any blockers.
