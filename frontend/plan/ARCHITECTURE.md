# ARCHITECTURE — ULTRON Frontend

> Version 2.0 · June 2026
> Purpose: Define the app shell, route hierarchy, component tree, data flow, module boundaries, and agent-execution ownership rules.

---

## 1. App Shell Architecture

Every operational screen (after the Command Center landing) renders inside this shell:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              TOP HEADER                                      │
│  [KSP Emblem]  ULTRON  |  [Role Badge]  |  [Search]  [Notifications]  [Avatar] │
├──────────┬───────────────────────────────────────────────────────────────────┤
│          │                     SECTION TOOLBAR                                │
│ SIDEBAR  │  [← Back]  [Breadcrumbs]  [Date Range]  [District]  [Search]  [⋮] │
│  NAV     ├───────────────────────────────────────────────────────────────────┤
│          │                                                                   │
│  ┌─────┐ │                    MAIN WORKSPACE                                 │
│  │ Dash│ │                                                                    │
│  │ Crime│ │   ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Cyber│ │   │  KPI      │  │  Trend   │  │  Alert   │                     │
│  │ Maps │ │   │  Card     │  │  Chart   │  │  Feed    │                     │
│  │ Netwrk│ │   └──────────┘  └──────────┘  └──────────┘                     │
│  │ Intel │ │                                                                    │
│  │ Graph │ │   ┌──────────────────────────────────────────┐                  │
│  │ Data  │ │   │          Table / Map / Graph             │                  │
│  │ Admin │ │   └──────────────────────────────────────────┘                  │
│  └───────┘ │                                                                    │
│            ├───────────────────────────────────────────────────────────────────┤
│            │                      RIGHT CONTEXT PANEL                         │
│            │                (slides open on entity select)                    │
│            │                                                                   │
│            │   ┌─────────────────────────────────────────┐                   │
│            │   │  Entity Details                         │                   │
│            │   │  Quick Actions                          │                   │
│            │   │  Related Cases                          │                   │
│            │   │  Jump To → Map / Graph / Detail         │                   │
│            │   └─────────────────────────────────────────┘                   │
├──────────┴───────────────────────────────────────────────────────────────────┤
│                              FOOTER (optional per page)                       │
│         Last updated: 2 min ago  ·  Data source: Catalyst Data Store          │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Shell Component Responsibilities

| Component | Role |
|-----------|------|
| `TopHeader` | KSP branding, ULTRON identity, role chip, global search, notification bell, user menu |
| `SidebarNav` | Collapsible navigation rail — icons + labels, active state, section grouping |
| `SectionToolbar` | Per-page context controls — breadcrumbs, filters, search, export, back navigation |
| `MainWorkspace` | Scrollable content area — renders the current page's component tree |
| `RightContextPanel` | Optional slide-in drawer for entity details, quick actions, and cross-module jumps |
| `FooterBar` | Timestamp, data source badge, sync status (shown only when relevant) |

---

## 2. Complete Route Map

```
Route                                    Page Component          Layout
──────────────────────────────────────────────────────────────────────────
/                                        CommandCenterPage       Fullscreen (no shell)
/login                                   LoginPage               Fullscreen (no shell)
/command-center                          CommandCenterPage       Fullscreen (no shell)

/dashboard                               DashboardPage           AppShell

/crime                                   CrimeDashboardPage      AppShell
/crime/cases                             CrimeListPage           AppShell
/crime/cases/:id                         CrimeDetailPage         AppShell
/crime/criminals                         CriminalListPage        AppShell
/crime/criminals/:id                     CriminalDetailPage      AppShell
/crime/mo-matcher                        MoMatcherPage           AppShell
/crime/hotspots                          HotspotExplorerPage     AppShell

/cyber                                   CyberDashboardPage      AppShell
/cyber/incidents                         CyberIncidentListPage   AppShell
/cyber/incidents/:id                     CyberIncidentDetailPage AppShell
/cyber/ip/:ip                            IpIntelligencePage      AppShell
/cyber/domain/:domain                    DomainIntelligencePage  AppShell
/cyber/flows                             NetworkFlowPage         AppShell
/cyber/threats                           ThreatIntelligencePage  AppShell
/cyber/evidence                          EvidenceTrackerPage     AppShell

/maps                                    MapsExplorerPage        AppShell
/maps/state                              KarnatakaMapPage        AppShell
/maps/district/:districtId               DistrictDrilldownPage   AppShell
/maps/predictive                         PredictiveRiskMapPage   AppShell
/maps/socio-economic                     SocioEconomicMapPage    AppShell

/network                                 NetworkOverviewPage     AppShell
/network/crime                           CrimeNetworkPage        AppShell
/network/cyber                           CyberNetworkPage        AppShell
/network/correlation                     CorrelationGraphPage    AppShell

/intelligence                            IntelligenceHubPage     AppShell
/intelligence/briefs                     IntelBriefsPage         AppShell
/intelligence/trends                     EmergingTrendsPage      AppShell
/intelligence/predictive-zones           PredictiveZonesPage     AppShell
/intelligence/red-zones                  RedZonesPage            AppShell

/intel-graph                             IntelGraphWorkspacePage AppShell (wide)

/data                                    DataOperationsPage      AppShell
/data/upload                             BulkUploadPage          AppShell
/data/sources                            ScrapeSourceManagerPage AppShell
/data/ingestion                          IngestionLogsPage       AppShell

/admin                                   AdminOverviewPage       AppShell
/admin/users                             UserManagementPage      AppShell
/admin/system                            SystemHealthPage        AppShell
/admin/models                            MlModelStatusPage       AppShell
/admin/audit                             AuditLogPage            AppShell

*                                        NotFoundPage            Fullscreen
```

**Total: 40+ routes, 24+ unique page components.**

---

## 3. Component Tree (Nesting)

```
<App>
  <BrowserRouter>
    <Routes>
      {/* Fullscreen routes */}
      <Route path="/" element={<CommandCenterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/command-center" element={<CommandCenterPage />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* AppShell routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Crime */}
          <Route path="/crime" element={<CrimeDashboardPage />} />
          <Route path="/crime/cases" element={<CrimeListPage />} />
          <Route path="/crime/cases/:id" element={<CrimeDetailPage />} />
          <Route path="/crime/criminals" element={<CriminalListPage />} />
          <Route path="/crime/criminals/:id" element={<CriminalDetailPage />} />
          <Route path="/crime/mo-matcher" element={<MoMatcherPage />} />
          <Route path="/crime/hotspots" element={<HotspotExplorerPage />} />

          {/* Cyber */}
          <Route path="/cyber" element={<CyberDashboardPage />} />
          <Route path="/cyber/incidents" element={<CyberIncidentListPage />} />
          <Route path="/cyber/incidents/:id" element={<CyberIncidentDetailPage />} />
          <Route path="/cyber/ip/:ip" element={<IpIntelligencePage />} />
          <Route path="/cyber/domain/:domain" element={<DomainIntelligencePage />} />
          <Route path="/cyber/flows" element={<NetworkFlowPage />} />
          <Route path="/cyber/threats" element={<ThreatIntelligencePage />} />
          <Route path="/cyber/evidence" element={<EvidenceTrackerPage />} />

          {/* Maps */}
          <Route path="/maps/state" element={<KarnatakaMapPage />} />
          <Route path="/maps/district/:districtId" element={<DistrictDrilldownPage />} />
          <Route path="/maps/predictive" element={<PredictiveRiskMapPage />} />
          <Route path="/maps/socio-economic" element={<SocioEconomicMapPage />} />

          {/* Network */}
          <Route path="/network/crime" element={<CrimeNetworkPage />} />
          <Route path="/network/cyber" element={<CyberNetworkPage />} />
          <Route path="/network/correlation" element={<CorrelationGraphPage />} />

          {/* Intelligence */}
          <Route path="/intelligence" element={<IntelligenceHubPage />} />
          <Route path="/intelligence/briefs" element={<IntelBriefsPage />} />
          <Route path="/intelligence/trends" element={<EmergingTrendsPage />} />
          <Route path="/intelligence/predictive-zones" element={<PredictiveZonesPage />} />
          <Route path="/intelligence/red-zones" element={<RedZonesPage />} />

          {/* Intel Graph */}
          <Route path="/intel-graph" element={<IntelGraphWorkspacePage />} />

          {/* Data */}
          <Route path="/data" element={<DataOperationsPage />} />
          <Route path="/data/upload" element={<BulkUploadPage />} />
          <Route path="/data/sources" element={<ScrapeSourceManagerPage />} />
          <Route path="/data/ingestion" element={<IngestionLogsPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/system" element={<SystemHealthPage />} />
          <Route path="/admin/models" element={<MlModelStatusPage />} />
          <Route path="/admin/audit" element={<AuditLogPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
</App>
```

---

## 4. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Catalyst / FastAPI)                      │
│                                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Crime    │  │ Criminal │  │ Cyber    │  │ Analysis │  │ Admin    │ │
│  │ API      │  │ API      │  │ API      │  │ API      │  │ API      │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼──────────────┼─────────────┼─────────────┼─────────────┼───────┘
        │              │             │             │             │
        ▼              ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API CLIENT LAYER (typed)                          │
│                                                                           │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
│  │ axios/fetch  │  │ Auth Token       │  │ Error Normalizer        │   │
│  │ instance     │  │ Injection        │  │ (parse 4xx/5xx → msg)   │   │
│  └──────┬───────┘  └──────────────────┘  └─────────────────────────┘   │
└─────────┼───────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DTO ADAPTATION LAYER                            │
│                                                                           │
│  Transforms raw API responses → frontend-friendly types:                 │
│    • normalizeDistrict(): "bengaluru urban" → "Bengaluru Urban"          │
│    • parseRiskTier(): 85 → { score: 85, tier: "High", color: "#ef4444" }│
│    • safeEnum(): handle null/undefined enum values with fallbacks         │
│    • derivePresentation(): computed fields for display                    │
│                                                                           │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TANSTACK QUERY (server state)                      │
│                                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ useCrime │  │ useCrimi │  │ useCyber │  │ useMaps  │  │ useAdmin │ │
│  │ Queries  │  │ nalQrys  │  │ Queries  │  │ Queries  │  │ Queries  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │             │             │       │
│       └─────────────┼─────────────┼─────────────┼─────────────┘       │
│                     │             │             │                      │
│                     ▼             ▼             ▼                      │
│              ┌─────────────────────────────────────┐                   │
│              │   TanStack Query Client             │                   │
│              │   • caching  • dedup  • refetch     │                   │
│              │   • stale time  • retry  • paginate  │                   │
│              └─────────────────────────────────────┘                   │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ZUSTAND (client state)                              │
│                                                                           │
│  ┌─────────┐  ┌────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐      │
│  │authStore│  │navStore│  │filterStore│  │graph   │  │uiStore   │      │
│  │         │  │        │  │          │  │Store   │  │(theme,   │      │
│  │user,    │  │section,│  │global    │  │nodes,  │  │sidebar,  │      │
│  │role,    │  │sidebar │  │filters + │  │edges,  │  │panel,    │      │
│  │permit   │  │state   │  │per-page  │  │selected│  │toasts)   │      │
│  └─────────┘  └────────┘  └──────────┘  └────────┘  └──────────┘      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT COMPONENTS                                  │
│                                                                           │
│  Pages → Domain Components → Shared UI Kit                               │
│  (query data)  (compose data)  (presentation)                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Module Boundaries (Agent-Ownership-Aware)

Each domain is a **self-contained feature module** owned by a **single agent at a time**:

```
src/
├── features/
│   ├── crime/              # Owner: Feature Agent 1 (Phase 2)
│   │   ├── pages/          # CrimeListPage, CrimeDetailPage, etc.
│   │   ├── components/     # CrimeTable, CrimeDetailCard, etc.
│   │   ├── hooks/          # useCrimeList, useCrimeDetail, etc.
│   │   ├── api/            # crimeApi.ts (typed API calls)
│   │   └── types/          # crime.types.ts
│   │
│   ├── cyber/              # Owner: Feature Agent 2 (Phase 3)
│   │   ├── pages/          # CyberIncidentListPage, IpIntelligencePage, etc.
│   │   ├── components/     # IpCard, DomainCard, PhishingBadge, etc.
│   │   ├── hooks/          # useIpIntelligence, useDomainLookup, etc.
│   │   ├── api/            # cyberApi.ts
│   │   └── types/          # cyber.types.ts
│   │
│   ├── maps/               # Owner: Visualization Agent (Phase 5)
│   ├── network/            # Owner: Graph Agent (Phase 6)
│   ├── intelligence/       # Owner: Feature Agent 1 (Phase 7)
│   ├── intel-graph/        # Owner: Interaction Agent (Phase 7)
│   ├── data-ops/           # Owner: Operations Agent (Phase 8)
│   └── admin/              # Owner: Operations Agent (Phase 8)
│
├── shared/
│   ├── components/         # KpiCard, DataTable, PageHeader, etc.
│   ├── hooks/              # useDebounce, useMediaQuery, etc.
│   ├── ui-kit/             # Button, Input, Badge, Modal, Drawer, etc.
│   ├── layout/             # AppShell, TopHeader, SidebarNav, etc.
│   └── api/                # client.ts, dto-adapters.ts, error-handler.ts
│
├── stores/                 # authStore, navStore, filterStore, graphStore, uiStore
├── types/                  # global types, shared interfaces
├── mocks/                  # mock data for demo mode
├── router/                 # route definitions, ProtectedRoute
└── App.tsx
```

### Ownership Rules

| Directory | Owner | Rule |
|-----------|-------|------|
| `shared/layout/` | Foundation agent only | No feature agent may touch |
| `shared/ui-kit/` | Foundation agent only | Feature agents import only |
| `shared/components/` | Shared by all | Feature agents may add new shared components here, but must check with orchestrator first |
| `stores/` | Shared by all | Must use interfaces from STATE_AND_API.md — no deviation |
| `features/*/` | One agent at a time | Exclusive ownership during that agent's phase |
| `mocks/` | Shared by all | Append-only per phase — never delete existing mock data |
| `router/` | Foundation agent + orchestrator | Only modified during Phase 0 or by explicit approval |

---

## 6. Key Architectural Decisions

| Decision | Choice | Rationale | Agent Impact |
|----------|--------|-----------|-------------|
| Routing | React Router v6 | De facto standard, supports layouts, code splitting | Simple to scaffold, one agent can set up all routes in Phase 0 |
| Server state | TanStack Query v5 | Caching, dedup, retry, pagination, stale management | Feature agents write hook wrappers — consistent pattern across all modules |
| Client state | Zustand | Minimal boilerplate, TypeScript-native, no providers | One agent writes stores, all agents consume — no provider nesting |
| Styling | Tailwind v4 + shadcn/ui | Design-system-friendly, fast iteration, consistent | Design tokens in one file — single-owner rule prevents drift |
| Map library | React-Leaflet | Karnataka GeoJSON support, heatmap plugins, district layers | Specialized — only one agent needs to learn it |
| Graph library | Cytoscape.js | Criminal network visualization, layout algorithms, styling | Specialized — only one agent needs to learn it |
| Node graph | React Flow (@xyflow/react) | Intel Graph workspace — drag, connect, export | Specialized — only one agent needs to learn it |
| Charts | Recharts | React-native, composable, good defaults | Simple API, any agent can pick up |
| Forms | React Hook Form + Zod | Performant, schema-validated, accessible | Only used in specific pages — isolated |
| Tables | TanStack Table | Headless, sortable, filterable, paginated, extensible | Wrapped by DataTable component — feature agents use wrapper only |
| HTTP client | Axios | Interceptors, cancel tokens, better error handling | Set up once in Phase 0, all agents use the pattern |
| Mock mode | Built-in flag | App runs fully without backend — essential for solo dev | Every agent uses same mock pattern — enforced |

---

## 7. Agent Handoff Contract

Between each phase, the following must be provided to the next agent:

```
┌──────────────────────────────────────────────────────────┐
│                   HANDOFF CHECKLIST                        │
├──────────────────────────────────────────────────────────┤
│  □ All files committed to the branch                      │
│  □ No TypeScript errors (tsc --noEmit)                    │
│  □ No lint errors (npm run lint)                          │
│  □ All acceptance criteria from previous phase met         │
│  □ New mock data (if any) is in place and seeded           │
│  □ Shared components used — no duplication                │
│  □ Design tokens respected — no overrides                 │
│  □ README updated with current demo state                 │
└──────────────────────────────────────────────────────────┘
```

---

*This architecture document defines every structural decision and execution ownership rule. All component and page specs derive from this foundation. Version 2.0 adds agent-ownership boundaries, shared-file single-owner rules, and handoff contract requirements.*
