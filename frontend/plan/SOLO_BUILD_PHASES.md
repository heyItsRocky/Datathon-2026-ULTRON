# SOLO BUILD PHASES — ULTRON Frontend (Agent-Aware)

> Version 2.0 · June 2026
> Purpose: Define a phased incremental build strategy optimized for execution by AI agents with bounded context, limited parallelization, and strict ownership rules. Zero feature cuts. Zero UI compromise.

---

## 0. Execution Model

### Role Boundaries

| Role | Identity | Responsibility |
|------|----------|---------------|
| **Architect** | ALPHA (this agent) | Design system, architecture, page specs, component inventory, phase definition, quality gates, handoff contracts. **Does not write code.** |
| **Foundation Agent** | Execution agent | Scaffold, shell, design tokens, routing, stores, API client, shared UI kit, mock infrastructure. One agent, one phase. |
| **Feature Agent** | Execution agent | One per feature module — crime, cyber, maps, network, intelligence, intel-graph, admin. Builds pages, components, hooks, API modules, mocks, and DTO adapters for that module. |
| **QA Agent** | Execution agent | Browser validation, responsive checks, motion review, state coverage, design token compliance, accessibility audit. Runs after every phase. |

### Parallelization Limit
**Max 2 agents may execute simultaneously.**  
**Never two agents touching the same module boundary at the same time.**  
**Shared files (globals.css, stores, layout, router, shared components) are single-owner at all times.**

### Context Budget Per Agent
Each agent receives:
- The DESIGN_SYSTEM.md (token reference, frozen)
- Their specific phase brief (this document)
- Their specific page spec subset
- The component ownership rules

They do NOT receive:
- The full architecture document (too much context)
- Other phase details
- Other module spec details

---

## 1. Build Philosophy

### The Rule
> **"Every phase produces a working, demonstrable application."**

No phase leaves the app in a broken state. Each phase has:
- A clear deliverable
- An acceptance criteria checklist
- A "demo moment" you can show
- A designated agent owner
- A handoff checklist for the next phase

### The Strategy
| Principle | How We Apply It |
|-----------|----------------|
| **Foundation first** | Shell, routing, design tokens, auth before any page |
| **Data before visualization** | Tables and lists before maps and graphs |
| **Mock mode from day one** | Don't wait for backend — build with mocks |
| **Reuse aggressively** | Build shared components early, use them everywhere |
| **Demo narrative drives order** | Build the demo path first |
| **Single owner per phase** | Prevents context drift and merge conflicts |
| **QA after every phase** | No accumulated design debt |
| **Polish last** | Won't ship a broken UI, but won't pixel-perfect until Phase 9 |

### Estimated Timeline
| Phase | Focus | Agent | Est. Sessions |
|-------|-------|-------|:------------:|
| 0 | Scaffold + Shell + Tokens | Foundation Agent | 2 |
| 1 | Command Center + Dashboard | Foundation Agent | 2 |
| 2 | Crime Suite | Crime Feature Agent | 3 |
| 3 | Cyber Suite | Cyber Feature Agent | 3 |
| 4 | Maps + Geospatial | Maps Feature Agent | 3 |
| 5 | Network Graphs | Network Feature Agent | 3 |
| 6 | Strategic Intelligence Hub | Intel Feature Agent | 2 |
| 7 | Intel Graph Workspace | Intel Graph Agent | 3 |
| 8 | Admin + Data Ops | Admin Feature Agent | 2 |
| 9 | Polish + Demo + QA | QA / Integration Agent | 2 |

**Total: ~25 execution sessions.** Each session is a focused agent invocation with a clear brief.

---

## 2. Phase 0 — Scaffold, Shell & Design System

### Goal
A working app skeleton that renders the shell with navigation and theme.

### Owner
**Foundation Agent** — single agent, exclusive ownership of shared files.

### Skills to Load
- `frontend-patterns` (architecture patterns)
- `design-system` (token implementation)
- `coding-standards` (file structure)
- `agent-harness-construction` (shadcn setup)

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 0.1 | Vite + React 19 + TS scaffold | `vite.config.ts`, `tsconfig.json`, `package.json` | — |
| 0.2 | Tailwind v4 + shadcn/ui setup | `tailwind.config.ts`, `globals.css`, `components.json` | Token file is frozen after this phase |
| 0.3 | Theme tokens implementation | `globals.css` (CSS variables from DESIGN_SYSTEM.md) | No agent may add tokens later |
| 0.4 | Zustand stores (auth, nav, ui, filter) | `stores/authStore.ts`, `stores/navStore.ts`, `stores/uiStore.ts`, `stores/filterStore.ts` | Interfaces must match STATE_AND_API.md |
| 0.5 | React Router + route definitions | `router/routes.tsx`, `router/ProtectedRoute.tsx` | All 40+ routes with lazy loading |
| 0.6 | AppShell + TopHeader + SidebarNav | `shared/layout/AppShell.tsx` and children | Single-owner — no feature agent touches |
| 0.7 | Page placeholder components | Empty page files with titles only | One file per route, minimal |
| 0.8 | Mock mode infrastructure | `shared/config.ts`, `shared/api/client.ts` | Must support the apiGet(pattern) |
| 0.9 | ErrorBoundary + NotFoundPage | `shared/components/ErrorBoundary.tsx` | Wrap all routes |
| 0.10 | Shared UI Kit base | `shared/ui-kit/Button`, `Input`, `Badge`, `Modal`, `Drawer`, `SlideOver` | Frozen — no feature agent builds duplicates |
| 0.11 | Shared data display base | `shared/components/KpiCard`, `TrendCard`, `AlertFeed`, `StatusBadge`, `SeverityBadge`, `RiskBadge`, `MetricDelta` | Foundation for all pages |
| 0.12 | Shared state components | `shared/components/LoadingSkeleton`, `EmptyState`, `ErrorState` | Used by every page |
| 0.13 | Dashboard mock data | `mocks/dashboard-stats.json` | Seeded with realistic data |

### Deliverable
```
Working app showing:
- Dark theme with gold accents
- Sidebar navigation with all sections
- Top header with branding
- Routing between all pages (placeholder content)
- Mock mode flag functional
- Error boundary wrapping every route
- Shared UI kit with 7+ components
- All mock mode infrastructure in place
```

### Acceptance Criteria
- [ ] App compiles with zero TypeScript errors (`tsc --noEmit`)
- [ ] Tailwind theme matches DESIGN_SYSTEM tokens
- [ ] All 40+ routes render (placeholder content)
- [ ] Sidebar navigation works with route changes
- [ ] SectionToolbar renders breadcrumbs correctly
- [ ] Error boundary catches and displays errors
- [ ] Mock mode flag is functional
- [ ] Shared UI kit renders correctly in isolation
- [ ] LoadingSkeleton, EmptyState, ErrorState render correctly
- [ ] KpiCard shows count-up animation

### Handoff to Phase 1
- [ ] `tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Shared components are documented
- [ ] All mock infrastructure is in place

### Demo Moment
**"This is the ULTRON command shell. Every section of the platform is accessible — now we fill them with intelligence."**

---

## 3. Phase 1 — Command Center + Unified Dashboard

### Goal
The two highest-visibility pages — where every demo begins.

### Owner
**Foundation Agent** (continues from Phase 0 — maintains ownership of shell-level components)

### Skills to Load
- `frontend-patterns`
- `motion-dev-react-mcp` (for anime.js patterns)
- `design-system`
- `ui-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 1.1 | Radial SVG navigation component | `shared/components/RadialNav.tsx` | Uses DESIGN_SYSTEM radial colors |
| 1.2 | CommandCenterPage layout | `pages/CommandCenterPage.tsx` | Fullscreen, no AppShell |
| 1.3 | KSP branding elements | `shared/components/KSPEmblem.tsx`, `shared/components/KSPHeader.tsx` | Official look |
| 1.4 | anime.js integration + transition hooks | `hooks/useAnimeTransition.ts` | Uses centralized timing tokens |
| 1.5 | Emergency contacts footer | `shared/components/EmergencyFooter.tsx` | KSP emergency numbers |
| 1.6 | DashboardPage - KPI row | `pages/DashboardPage.tsx` | Uses existing KpiCard |
| 1.7 | DashboardPage - Trend + Alert | `pages/DashboardPage.tsx` | Uses existing TrendCard, AlertFeed |
| 1.8 | Dashboard filters | SectionToolbar integration | Date range + district |

### Deliverable
```
Two fully functional pages:
Command Center with radial navigation + anime.js transitions
Dashboard with real KPI cards, trend chart, alert feed
```

### Acceptance Criteria
- [ ] Radial rings render with correct Gold/Teal/Purple/Red segments
- [ ] Click ring → anime.js transition to section page
- [ ] KPI cards show count-up animation on load
- [ ] Trend chart renders with mock data
- [ ] Alert feed shows scrollable list with severity dots
- [ ] Emergency footer appears on landing page
- [ ] Dashboard filters work (date range, district dropdown)
- [ ] All states handled: loading, empty, error, populated

### Handoff to Phase 2
- [ ] No design token overrides
- [ ] No component duplication
- [ ] All states implemented

### Demo Moment
**"Opening ULTRON Command Center — one click enters the operational dashboard with real-time KPIs, crime trends, and anomaly alerts across Karnataka."**

---

## 4. Phase 2 — Crime Intelligence Suite

### Goal
Full crime track — list, detail, criminal profiles, MO matcher.

### Owner
**Crime Feature Agent** — exclusive ownership of `features/crime/`

### Skills to Load
- `frontend-patterns`
- `typescript-reviewer`
- `state-manager-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 2.1 | Crime API module + mocks | `features/crime/api/crimeApi.ts`, `mocks/crime-*.json` | Follows API pattern from STATE_AND_API.md |
| 2.2 | Crime DTO adapters | `shared/api/dto-adapters/crime-adapters.ts` | Handles backend shape variations |
| 2.3 | Crime query hooks | `features/crime/hooks/useCrimeList.ts`, `useCrimeDetail.ts`, etc. | Uses TanStack Query |
| 2.4 | CrimeTable (extends DataTable) | `features/crime/components/CrimeTable.tsx` | Uses existing DataTable |
| 2.5 | CrimeListPage | `features/crime/pages/CrimeListPage.tsx` | SectionToolbar + filters + table |
| 2.6 | CrimeDetailPage | `features/crime/pages/CrimeDetailPage.tsx` | Two-column + timeline + evidence |
| 2.7 | CriminalTable (extends DataTable) | `features/crime/components/CriminalTable.tsx` | Uses existing DataTable |
| 2.8 | CriminalListPage | `features/crime/pages/CriminalListPage.tsx` | Search + filter + table |
| 2.9 | CriminalDetailPage | `features/crime/pages/CriminalDetailPage.tsx` | Profile + crimes + graph + MO |
| 2.10 | MO Matcher UI | `features/crime/pages/MoMatcherPage.tsx` | Input + results table |
| 2.11 | Crime Dashboard page | `features/crime/pages/CrimeDashboardPage.tsx` | KPIs + trends + alerts |
| 2.12 | Crime-specific filter wiring | `features/crime/hooks/useCrimeFilters.ts` | Extends filterStore |

### Deliverable
```
Complete crime workflow:
Crime dashboard → case list (filterable, paginated) → case detail
Criminal directory → criminal profile with risk score
MO matcher with description input and similarity results
```

### Acceptance Criteria
- [ ] Crime list loads with pagination, sorting, filtering
- [ ] Crime detail shows full case breakdown with timeline
- [ ] Criminal profile shows associated crimes and network mini-graph
- [ ] MO matcher accepts input and returns matches with percentage
- [ ] All tables have sort, search, pagination (uses DataTable)
- [ ] All pages handle loading/empty/error states
- [ ] FilterStore integrates with crime filters
- [ ] Date range + district filters work across all crime pages
- [ ] No design token overrides
- [ ] No shared component duplication

### Handoff to Phase 3
- [ ] Crime module builds in isolation
- [ ] Mock data seeded with 500+ records
- [ ] All adapters handle null/missing fields

### Demo Moment
**"Crime Intelligence Suite — view all 500+ cases, filter by district or type, drill down to any case detail, see criminal profiles with risk scores, and match MO descriptions across the database."**

---

## 5. Phase 3 — Cyber Intelligence Suite

### Goal
Full cyber track — incidents, IP intelligence, domain analysis, threats.

### Owner
**Cyber Feature Agent** — exclusive ownership of `features/cyber/`

### Skills to Load
- `frontend-patterns`
- `typescript-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 3.1 | Cyber API module + mocks | `features/cyber/api/cyberApi.ts`, `mocks/cyber-*.json` | Follows API pattern |
| 3.2 | Cyber DTO adapters | `shared/api/dto-adapters/cyber-adapters.ts` | Handles IP/domain field variability |
| 3.3 | Cyber query hooks | `features/cyber/hooks/useCyberIncidents.ts`, `useIpIntelligence.ts`, etc. | Uses TanStack Query |
| 3.4 | CyberIncidentTable | `features/cyber/components/CyberIncidentTable.tsx` | Extends DataTable |
| 3.5 | CyberIncidentListPage | `features/cyber/pages/CyberIncidentListPage.tsx` | Filters + table |
| 3.6 | CyberIncidentDetailPage | `features/cyber/pages/CyberIncidentDetailPage.tsx` | Full breakdown |
| 3.7 | IpIntelligencePage | `features/cyber/pages/IpIntelligencePage.tsx` | Three-column layout |
| 3.8 | DomainIntelligencePage | `features/cyber/pages/DomainIntelligencePage.tsx` | WHOIS + SSL + DNS |
| 3.9 | CyberDashboardPage | `features/cyber/pages/CyberDashboardPage.tsx` | KPIs + threat feed |
| 3.10 | EvidenceTrackerPage | `features/cyber/pages/EvidenceTrackerPage.tsx` | Chain-of-custody |
| 3.11 | ThreatIntelligencePage | `features/cyber/pages/ThreatIntelligencePage.tsx` | Cross-case correlation |
| 3.12 | NetworkFlowPage | `features/cyber/pages/NetworkFlowPage.tsx` | Flow table |

### Deliverable
```
Complete cyber workflow:
Cyber dashboard → incident list → detail with IP/domain/evidence
IP lookup page with reputation, geo, WHOIS
Domain lookup with WHOIS, SSL, DNS
Threat intelligence with cross-case correlation
```

### Acceptance Criteria
- [ ] Cyber incident list filters by type, status, date
- [ ] IP intelligence shows geo, ISP, ASN, reputation, linked incidents
- [ ] Domain intelligence shows WHOIS, SSL, DNS, phishing probability
- [ ] Evidence tracker shows chain-of-custody
- [ ] Threat intelligence correlates IPs/domains across incidents
- [ ] All pages have loading/empty/error states
- [ ] Cyber filter store works correctly
- [ ] No design token overrides
- [ ] No shared component duplication

### Handoff to Phase 4
- [ ] Cyber module builds in isolation
- [ ] Mock data seeded with 200+ records
- [ ] All adapters handle null/missing fields

### Demo Moment
**"Cyber Intelligence Suite — investigate cyber incidents, look up any IP address for reputation and geolocation, scan domains for phishing indicators, trace digital evidence chains, and see correlated threats across cases."**

---

## 6. Phase 4 — Maps & Geospatial Intelligence

### Goal
Karnataka map with all layers — crime pins, hotspots, red-zones, predictive, socio-economic.

### Owner
**Maps Feature Agent** — exclusive ownership of `features/maps/`

### Skills to Load
- `frontend-patterns`
- `performance-optimizer` (map layers can be expensive)
- `ui-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 4.1 | KarnatakaMap base component | `features/maps/components/KarnatakaMap.tsx` | Uses React-Leaflet |
| 4.2 | Karnataka GeoJSON data | `public/data/karnataka-districts.geojson` | 31 districts |
| 4.3 | DistrictPolygonLayer | `features/maps/components/DistrictLayer.tsx` | Fill by crime density |
| 4.4 | CrimePinLayer | `features/maps/components/CrimePinLayer.tsx` | Colored by type |
| 4.5 | HotspotLayer | `features/maps/components/HotspotLayer.tsx` | DBSCAN clusters |
| 4.6 | RedZoneLayer (pulsing animation) | `features/maps/components/RedZoneLayer.tsx` | CSS pulse animation |
| 4.7 | PredictiveRiskLayer | `features/maps/components/PredictiveRiskLayer.tsx` | Gradient heat |
| 4.8 | LayerControl | `features/maps/components/LayerControl.tsx` | Toggle UI |
| 4.9 | MapLegend | `features/maps/components/MapLegend.tsx` | Bottom-right |
| 4.10 | KarnatakaMapPage | `features/maps/pages/KarnatakaMapPage.tsx` | Full-width map |
| 4.11 | DistrictDrilldownPage | `features/maps/pages/DistrictDrilldownPage.tsx` | Intelligence grid |
| 4.12 | PredictiveRiskMapPage | `features/maps/pages/PredictiveRiskMapPage.tsx` | Risk overlay |
| 4.13 | SocioEconomicMapPage | `features/maps/pages/SocioEconomicMapPage.tsx` | Literacy/poverty |
| 4.14 | Map mock data | `mocks/hotspots.json`, `mocks/red-zones.json`, `mocks/districts.json` | Realistic |
| 4.15 | RightContextPanel integration | `shared/layout/RightContextPanel.tsx` update | Entity detail on district click |

### Deliverable
```
Interactive Karnataka map with:
- District polygons colored by crime density
- Crime pins grouped by type
- Hotspot clusters with density visualization
- Pulsing red-zone districts
- Predictive risk overlay
- District drill-down with full intelligence
```

### Acceptance Criteria
- [ ] Karnataka map renders with all 31 district boundaries
- [ ] Each layer toggles on/off independently
- [ ] Click district → select + info panel
- [ ] Double-click district → navigate to drill-down
- [ ] Red-zone districts pulse with animation
- [ ] Hotspot clusters show density and top crime types
- [ ] RightContextPanel shows entity details on selection
- [ ] Map responds to filterStore changes
- [ ] Performance is smooth (no layer-caused lag)
- [ ] No design token overrides

### Demo Moment
**"Karnataka Geospatial Intelligence — full state map with crime density, live red-zone alerts pulsing in real time, hotspot clusters showing where crimes concentrate, and district drill-down revealing trends, MO patterns, and socio-economic correlations."**

---

## 7. Phase 5 — Network & Link Analysis

### Goal
All three graph modes — crime, cyber, and correlation.

### Owner
**Network Feature Agent** — exclusive ownership of `features/network/`

### Skills to Load
- `frontend-patterns`
- `performance-optimizer` (large graphs)
- `ui-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 5.1 | CrimeNetworkPage | `features/network/pages/CrimeNetworkPage.tsx` | Full-height canvas |
| 5.2 | CrimeNetworkGraph (Cytoscape) | `features/network/components/CrimeNetworkGraph.tsx` | Criminal nodes + edges |
| 5.3 | CyberNetworkPage | `features/network/pages/CyberNetworkPage.tsx` | Full-height canvas |
| 5.4 | CyberNetworkGraph (Cytoscape) | `features/network/components/CyberNetworkGraph.tsx` | IP + domain nodes |
| 5.5 | CorrelationGraphPage | `features/network/pages/CorrelationGraphPage.tsx` | Combined view |
| 5.6 | CorrelationGraph | `features/network/components/CorrelationGraph.tsx` | Cross-domain |
| 5.7 | GraphControls | `features/network/components/GraphControls.tsx` | Search, filter, layout, timeline, export |
| 5.8 | NodeDetailDrawer | `features/network/components/NodeDetailDrawer.tsx` | Slide-in detail panel |
| 5.9 | Network mock data | `mocks/network-crime.json`, `mocks/network-cyber.json` | Realistic graph structures |

### Deliverable
```
Three interactive graph views:
Crime network — criminals, victims, crimes, MO connections
Cyber network — IPs, domains, servers, attack paths
Correlation graph — cross-domain links between crime + cyber
```

### Acceptance Criteria
- [ ] All three graphs render with mock data
- [ ] Node filtering by type works
- [ ] Timeline slider filters graph by date
- [ ] Search highlights matching entities
- [ ] Click node → NodeDetailDrawer with jump-links
- [ ] Layout selection changes graph arrangement
- [ ] Cytoscape styles match DESIGN_SYSTEM tokens
- [ ] Performance is smooth for 500+ node graphs
- [ ] No design token overrides

### Demo Moment
**"Network & Link Analysis — explore criminal connections across 500+ profiles, trace cyber attack paths from source IP to victim, and discover cross-domain correlations that traditional tools miss."**

---

## 8. Phase 6 — Strategic Intelligence Hub

### Goal
The executive-level command page — designed to impress senior officers and evaluators.

### Owner
**Intel Feature Agent** — exclusive ownership of `features/intelligence/`

### Skills to Load
- `frontend-patterns`
- `motion-dev-react-mcp` (for smooth entry animations)
- `ui-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 6.1 | Intel API module + mocks | `features/intelligence/api/intelApi.ts`, `mocks/intel-*.json` | Follows API pattern |
| 6.2 | Intel DTO adapters | `shared/api/dto-adapters/intelligence-adapters.ts` | Handles AI brief format |
| 6.3 | Intel query hooks | `features/intelligence/hooks/useIntelBrief.ts`, `useEmergingTrends.ts` | Uses TanStack Query |
| 6.4 | IntelligenceHubPage | `features/intelligence/pages/IntelligenceHubPage.tsx` | Hero brief + command view |
| 6.5 | IntelBriefCard | `features/intelligence/components/IntelBriefCard.tsx` | AI-generated summary |
| 6.6 | EmergingTrendsPanel | `features/intelligence/components/EmergingTrendsPanel.tsx` | Ranked list + charts |
| 6.7 | RedZonePanel | `features/intelligence/components/RedZonePanel.tsx` | Active red zones |
| 6.8 | PredictiveZonesPanel | `features/intelligence/components/PredictiveZonesPanel.tsx` | Risk zones + recommendations |
| 6.9 | IntelBriefsPage | `features/intelligence/pages/IntelBriefsPage.tsx` | Full brief list |
| 6.10 | EmergingTrendsPage | `features/intelligence/pages/EmergingTrendsPage.tsx` | Full trend data |
| 6.11 | PredictiveZonesPage | `features/intelligence/pages/PredictiveZonesPage.tsx` | Full zone data |
| 6.12 | RedZonesPage | `features/intelligence/pages/RedZonesPage.tsx` | Full red-zone data |

### Deliverable
```
Executive command page showing:
AI-generated intelligence briefs
Socio-economic correlation charts
Top emerging crime trends
Active red-zone districts
Predictive risk zones with recommendations
```

### Acceptance Criteria
- [ ] Intelligence hub shows all panels in a cohesive layout
- [ ] Brief cards display AI-generated summaries
- [ ] Trend data renders with charts and percent change
- [ ] Red-zone panel shows districts with severity + trend
- [ ] Predictive zones show confidence scores + recommendations
- [ ] All data is filterable by district and date range
- [ ] No design token overrides
- [ ] No shared component duplication

### Demo Moment (Wins The Presentation)
**"Strategic Intelligence Hub — the command center for senior leadership. AI-generated intelligence briefs, socio-economic crime correlations, real-time emerging trends, and tomorrow's predictive risk zones with actionable recommendations."**

---

## 9. Phase 7 — Intel Graph Workspace

### Goal
The Flowsint-style investigation graph editor — drag, connect, edit, export.

### Owner
**Intel Graph Agent** — exclusive ownership of `features/intel-graph/` and `stores/graphStore.ts`

### Skills to Load
- `frontend-patterns`
- `state-manager-reviewer` (graph state complexity)
- `ui-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 7.1 | React Flow setup | `features/intel-graph/config/nodeTypes.ts` | Dark theme, dot grid |
| 7.2 | graphStore (Zustand) | `stores/graphStore.ts` | Full CRUD on nodes/edges |
| 7.3 | IntelGraphCanvas | `features/intel-graph/components/IntelGraphCanvas.tsx` | React Flow wrapper |
| 7.4 | NodePalette + NodePaletteItem | `features/intel-graph/components/NodePalette.tsx` | 7 types, drag-to-add |
| 7.5 | Custom node renderers (7 types) | `features/intel-graph/components/nodes/*.tsx` | Colored by type |
| 7.6 | GraphActionBar | `features/intel-graph/components/GraphActionBar.tsx` | Save, export, load, clear |
| 7.7 | IntelNodeEditor (right panel) | `features/intel-graph/components/IntelNodeEditor.tsx` | Dynamic form per type |
| 7.8 | ReportPreview (bottom bar) | `features/intel-graph/components/ReportPreview.tsx` | Auto-generated text |
| 7.9 | Export JSON + Load Template | `features/intel-graph/utils/graphExport.ts` | Full JSON export |
| 7.10 | IntelGraphWorkspacePage | `features/intel-graph/pages/IntelGraphWorkspacePage.tsx` | Assembles all subcomponents |

### Deliverable
```
Complete graph investigation tool:
Drag-drop 7 node types from palette to canvas
Connect nodes with edges
Edit node data in slide-in panel
Export full graph as JSON
Load pre-built investigation templates
Auto-generated report preview
```

### Acceptance Criteria
- [ ] All 7 node types render with correct colors and icons
- [ ] Nodes can be dragged from palette to canvas
- [ ] Nodes connect via handle drag
- [ ] Click node → right panel shows editable form
- [ ] Save updates node data in graphStore
- [ ] Export produces valid JSON with all nodes and edges
- [ ] Load template populates the canvas
- [ ] Delete node works with confirmation
- [ ] Clear canvas works with confirmation
- [ ] Report preview updates as graph changes
- [ ] GraphStore persists through navigation
- [ ] No design token overrides

### Demo Moment
**"Intel Graph Workspace — drag IP addresses, suspect names, locations, evidence, methods, motives, and crime types onto the canvas. Connect them to build an investigation. Export the complete graph as JSON for reports. This is an investigator's digital lab."**

---

## 10. Phase 8 — Admin & Data Operations

### Goal
Administrative pages and data ingestion workflows.

### Owner
**Admin Feature Agent** — exclusive ownership of `features/admin/` and `features/data-ops/`

### Skills to Load
- `frontend-patterns`
- `typescript-reviewer`

### Build Order
| Step | Task | Key Files | Constraint |
|:----:|------|-----------|------------|
| 8.1 | Admin API module + mocks | `features/admin/api/adminApi.ts`, `mocks/users.json` | Follows API pattern |
| 8.2 | Admin DTO adapters | `shared/api/dto-adapters/admin-adapters.ts` | Handles user/system shapes |
| 8.3 | UserManagementPage | `features/admin/pages/UserManagementPage.tsx` | Table + role editor |
| 8.4 | SystemHealthPage | `features/admin/pages/SystemHealthPage.tsx` | Status cards |
| 8.5 | MlModelStatusPage | `features/admin/pages/MlModelStatusPage.tsx` | Model cards + retrain |
| 8.6 | AuditLogPage | `features/admin/pages/AuditLogPage.tsx` | Timeline |
| 8.7 | AdminOverviewPage | `features/admin/pages/AdminOverviewPage.tsx` | Summary |
| 8.8 | BulkUploadPage | `features/data-ops/pages/BulkUploadPage.tsx` | Dropzone + preview |
| 8.9 | ScrapeSourceManagerPage | `features/data-ops/pages/ScrapeSourceManagerPage.tsx` | Source CRUD |
| 8.10 | IngestionLogsPage | `features/data-ops/pages/IngestionLogsPage.tsx` | Job history |
| 8.11 | DataOperationsPage | `features/data-ops/pages/DataOperationsPage.tsx` | Overview |

### Deliverable
```
Admin section with user management, system health, ML monitoring, audit logs
Data operations with bulk upload, scrape management, ingestion logs
```

### Acceptance Criteria
- [ ] User table shows all users with role dropdown editor
- [ ] System health shows all services with status indicators
- [ ] ML model cards show health and retrain capability
- [ ] Audit log shows chronological action history
- [ ] Bulk upload validates files and shows preview
- [ ] Scrape source manager supports add/edit/delete/trigger
- [ ] Ingestion logs show job history and status
- [ ] Admin routes are role-gated (Admin only)
- [ ] No design token overrides
- [ ] No shared component duplication

### Demo Moment
**"Admin & Operations — manage users and roles, monitor system health across all services, track ML model training status, upload crime data with validation and preview, and audit every action in the system."**

---

## 11. Phase 9 — Polish, Responsive & Demo Flow

### Goal
Make everything look finished, work on tablet, and tell the demo story. **This is the QA phase — the UI quality gate.**

### Owner
**QA / Integration Agent** — exclusive ownership of validation, not code changes. Bug fixes go back to the original agent.

### Skills to Load
- `browser-qa` (responsive, cross-browser)
- `e2e-testing` (demo flow)
- `verification-loop` (state coverage)
- `ui-reviewer` (visual consistency)
- `performance-optimizer` (bundle, rendering)
- `a11y-architect` (accessibility)

### Build Order
| Step | Task | Owner | Constraint |
|:----:|------|-------|------------|
| 9.1 | Responsive audit — all pages at 3 breakpoints | QA Agent | 1280px, 1024px, 768px |
| 9.2 | Design token compliance scan | QA Agent | All colors/type match DESIGN_SYSTEM |
| 9.3 | State coverage audit — loading/empty/error on every page | QA Agent | No page missing a state |
| 9.4 | Animation consistency check | QA Agent | All durations/easings from DESIGN_SYSTEM |
| 9.5 | Empty state copy review | QA Agent | Helpful, not generic |
| 9.6 | Error boundary testing | QA Agent | Simulate failures |
| 9.7 | Keyboard navigation pass | QA Agent | Tab through all interactive elements |
| 9.8 | Route-based code splitting verification | QA Agent | React.lazy on all routes |
| 9.9 | Cross-browser quick check | QA Agent | Chrome, Firefox, Edge |
| 9.10 | Demo walkthrough script | QA Agent | Frictionless execution |
| 9.11 | README with screenshots + demo flow | QA Agent | Documents the demo narrative |
| 9.12 | Final TypeScript audit | QA Agent | `tsc --noEmit`, strict mode, zero errors |

### Deliverable
```
Production-ready, demo-optimized frontend with:
- Zero console errors
- Responsive on tablet + desktop
- Consistent animations
- Meaningful empty states
- Keyboard-navigable
- Lazy-loaded routes
- Documented demo walkthrough
- Design token compliance verified
- All 4 states implemented on every page
```

### Acceptance Criteria
- [ ] All pages render correctly at 1280px, 1024px, 768px widths
- [ ] All colors match DESIGN_SYSTEM tokens
- [ ] Every page has loading, empty, error, and loaded states
- [ ] All animations use centralized timing/easing tokens
- [ ] Every empty state has a helpful message + action
- [ ] Error boundaries catch and display gracefully
- [ ] Tab key navigates through all interactive elements
- [ ] Route-based code splitting works (React.lazy)
- [ ] TypeScript compiles with strict mode, zero errors
- [ ] Demo walkthrough can be executed without friction
- [ ] No console errors in any browser
- [ ] No design token overrides anywhere in the codebase

### Demo Moment
**"ULTRON Frontend — deployed, responsive, production-ready. Every feature we planned is built. Every screen tells the story. This is what intelligence policing looks like."**

---

## 12. Dependency Map

```
Phase 0 ────────────────────► everyone (foundation — frozen tokens, stores, shell, shared components)
  │
  ├──► Phase 1 ──► Phase 2 ──► Phase 5 (crime data feeds crime graph)
  │                   │
  │                   └──────► Phase 6 (crime data feeds intelligence hub)
  │
  ├──► Phase 3 ──► Phase 5 (cyber data feeds cyber graph)
  │                   │
  │                   └──────► Phase 6 (cyber data feeds intelligence hub)
  │
  ├──► Phase 4 ──► Phase 6 (map data feeds intel hub visualizations)
  │
  ├──► Phase 7 (independent — can start after Phase 0)
  │
  └──► Phase 8 (independent — can start after Phase 0)
  
Phase 9 ───► depends on all phases 0-8
```

### Suggested Agent Order (optimized for demo impact)
```
Phase 0 (Foundation Agent — scaffold, shell, tokens, UI kit, stores, API client, mocks)
  → Phase 1 (Foundation Agent — Command Center + Dashboard)
    → Phase 2 (Crime Agent — Crime Suite) ← core value prop
      → Phase 4 (Maps Agent — Geospatial) ← visual wow
        → Phase 6 (Intel Agent — Intelligence Hub) ← wins presentations
          → Phase 3 (Cyber Agent — Cyber Suite) ← second major track
            → Phase 5 (Network Agent — Graph Analysis) ← advanced visualization
              → Phase 7 (Intel Graph Agent — Investigation Lab)
                → Phase 8 (Admin Agent — Operations)
                  → Phase 9 (QA Agent — Polish + Demo)
```

---

## 13. Critical Path Rules for Agents

### Do This
- **Keep mock mode working at all times** — never break it while adding real API integration
- **Use existing shared components** — never build alternatives to KpiCard, DataTable, StatusBadge, LoadingSkeleton, EmptyState, ErrorState
- **Respect frozen files** — never modify `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, or `shared/api/client.ts` after Phase 0
- **Commit after every phase** — not every file, every phase
- **Leave a handoff note** — what works, what doesn't, what the next agent needs to know

### Avoid This
- Don't override design tokens — use the CSS variables from `globals.css`
- Don't add new animation durations or easings — use the tokens from DESIGN_SYSTEM Section 8
- Don't build components that already exist in `shared/` — check the inventory first
- Don't skip error states — every page must have loading, empty, error, and loaded states
- Don't optimize prematurely — React 19 + TanStack Query handle most performance concerns
- Don't create new route patterns — use the existing route structure from Phase 0
- Don't modify another agent's feature module — if something is broken, flag it for the orchestrator

### UI Quality Blockers
These are NOT optional and will block phase sign-off:
- Missing loading state on any data-dependent page
- Missing empty state on any list/filter page
- Missing error state on any page with API calls
- Design tokens not matching DESIGN_SYSTEM.md
- Shared component not used where available
- Responsive breakpoints not respected
- Animation token not matching DESIGN_SYSTEM

---

*This build plan preserves every feature in the scope while making execution realistic for AI agents with bounded context and strict ownership rules. Follow the phases in order, respect frozen files, keep mock mode alive, and maintain the no-compromise UI standard throughout. Version 2.0 adds agent ownership per phase, context budget boundaries, parallelization limits, QA enforcement after every phase, and UI quality blocker rules.*
