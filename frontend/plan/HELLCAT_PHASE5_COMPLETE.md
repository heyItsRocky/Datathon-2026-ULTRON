# HELLCAT — PHASE 5 NETWORK & LINK ANALYSIS PROMPT

> Complete the 5 remaining placeholder pages in the Network & Link Analysis module.
> Phase: 5 of 10 | Focus: Entity exploration, link analysis, clusters, suspect profiles, association matrices

---

## 0. CONTEXT

The Network & Link Analysis module provides graph-based investigation across 3 domains — Crime, Cyber, and Cross-Domain Correlation.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### What's Already Built

**Infrastructure (all ready):**
- `cytoscape` + `react-cytoscapejs` installed in package.json ✓
- `GraphData`, `GraphElement` types in `src/shared/api/dto-adapters/network.ts` ✓
- `networkApi.ts` — 3 API functions (`fetchCrimeNetwork`, `fetchCyberNetwork`, `fetchCorrelationGraph`) ✓
- 3 hooks — `useCrimeNetwork`, `useCyberNetwork`, `useCorrelationGraph` ✓
- 3 graph components — `CrimeNetworkGraph`, `CyberNetworkGraph`, `CorrelationGraph` ✓
- `GraphControls` — search, layout switcher (cose/grid/concentric/breadthfirst), filter, export ✓
- `NodeDetailDrawer` — slide-in detail panel with node properties ✓
- 3 mock files — `network-crime.json` (145 nodes, 220 edges), `network-cyber.json`, `network-correlation.json` (30 nodes) ✓
- All mock handlers registered in `handlers.ts` ✓
- Routes registered in `routes.tsx` ✓

**Page Built:**
| Page | Route | Status | Lines |
|------|-------|:------:|:-----:|
| NetworkOverviewPage | `/network` | ✅ Complete | 17 |

### What's Missing — Build These 5 Pages

| # | Page | Route | Current State |
|:-:|------|-------|:-------------:|
| 1 | **LinkAnalysisPage** | `/network/link-analysis` | `createPlaceholderPage('Link Analysis')` |
| 2 | **EntityExplorerPage** | `/network/entities` | `createPlaceholderPage('Entity Explorer')` |
| 3 | **NetworkClustersPage** | `/network/clusters` | `createPlaceholderPage('Network Clusters')` |
| 4 | **SuspectProfilePage** | `/network/suspects/:suspectId` | `createPlaceholderPage('Suspect Profile')` |
| 5 | **AssociationMatrixPage** | `/network/association-matrix` | `createPlaceholderPage('Association Matrix')` |

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **Do NOT modify** | Already-built pages, main routes.tsx (routes are registered), or existing network components/graph components |
| **Do NOT add new npm packages** | Everything needed is installed. No new dependencies. |
| **No new design tokens** | Use CSS variables only: `var(--color-gold)`, `var(--color-crime-red)`, `var(--color-crime-amber)`, `var(--color-cyber-cyan)`, `var(--color-network-purple)`, `var(--color-intel-violet)`, `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`, `var(--color-border)`, `var(--radius-2xl)`, `var(--radius-xl)`, `var(--radius-lg)` |
| **No component duplication** | Check `src/shared/components/index.ts` before creating anything new |
| **All 4 states required** | `isLoading` → `ErrorState` → `EmptyState` → populated content |
| **Icons** | Lucide icons only (already in deps) |
| **Types** | No `any` — use proper types or `unknown` with type guards |
| **Named exports** for all components and hooks |
| **Dark theme** — all cards use `glass-card` class |

---

## 2. BUILD ORDER — 5 PAGES

---

### PAGE 1: EntityExplorerPage (`/network/entities`)

**Goal:** Browse, search, and filter all graph entities (criminals, victims, IPs, domains, servers, crimes) across crime and cyber domains. Acts as a directory into the graph.

**Pattern:** SearchInput + filter tabs + card grid from `CyberHeatmapPage` pattern. Reuse `EntityExplorerPage` name.

#### Requirements

1. **Create file:** `src/pages/network/EntityExplorerPage.tsx`
2. **Data source:** `useCrimeNetwork()` and `useCyberNetwork()` — extract all unique nodes. Merge both datasets client-side.
3. **Visual layout:**
   - **PageHeader** with title "Entity Explorer" and subtitle "Browse all entities across crime and cyber networks"
   - **SearchInput** — filter entities by label, id, type
   - **Domain filter tabs** — All / Crime / Cyber
   - **Type filter chips** — Criminal / Victim / Crime / IP / Domain / Server — toggleable
   - **Entity card grid** — each card shows:
     - Entity type badge (e.g., `SeverityBadge` or custom `Badge` color-coded by type)
     - Entity label (name/IP/domain)
     - Entity ID
     - Risk score (if applicable) with color
     - Connection count (degree — count of incident edges in the graph)
     - "View in Network" button → links to `/network`
     - "View Details" → links to detail pages (`/crime/criminals/:id`, `/cyber/ip/:ip`, etc.)
4. **States:** Loading (skeleton grid), Error (retry), Empty (no entities match filters), Populated
5. **Interactivity:** Search + filters update grid immediately

---

### PAGE 2: LinkAnalysisPage (`/network/link-analysis`)

**Goal:** Focused link analysis between two entities — select source and target, visualize the shortest path between them in the graph.

**Pattern:** Sidebar + graph layout from `NetworkOverviewPage`. Reuse existing `CrimeNetworkGraph` and hooks.

#### Requirements

1. **Create file:** `src/pages/network/LinkAnalysisPage.tsx`
2. **Data source:** `useCrimeNetwork()` and `useCyberNetwork()` — use all graph data for pathfinding
3. **Visual layout:**
   - **PageHeader** with title "Link Analysis" and subtitle "Trace connections between entities"
   - **Two selectors** side by side inside a glass-card:
     - "Source Entity" — searchable dropdown of all graph nodes (SearchInput + filtered list)
     - "Target Entity" — searchable dropdown of all graph nodes
     - "Analyze" button to compute path
   - **Path summary bar** — shows: path length (hops), intermediary entities count, domains crossed (crime ↔ cyber)
   - **Small Cytoscape graph** showing only the shortest path between source and target (highlighted nodes/edges)
   - **Path steps list** — ordered list of each hop: entity type icon → label → edge label → next entity
   - **"View Full Network"** button linking to `/network` with context
4. **Shortest path logic:** Implement a simple BFS client-side over the graph edges. No external library needed — use adjacency map.
5. **States:** Loading (skeleton), Error (retry), Empty (no path exists between selected entities), Populated

---

### PAGE 3: NetworkClustersPage (`/network/clusters`)

**Goal:** Show algorithmically detected communities/clusters within the network graphs — organized by domain (crime/cyber), with cluster cards and intra-cluster visualization.

**Pattern:** Domain tab switcher + cluster card grid + mini-graph per cluster. Reference `CrimeHotspotsPage` grid pattern.

#### Requirements

1. **Create file:** `src/pages/network/NetworkClustersPage.tsx`
2. **Data source:** `useCrimeNetwork()` and `useCyberNetwork()` — compute clusters client-side using simple connected-components algorithm (BFS/DFS over edges)
3. **Visual layout:**
   - **PageHeader** with title "Network Clusters" and subtitle "Automatically detected communities and groups"
   - **Domain tabs** — Crime / Cyber / Correlation
   - **Cluster summary KPI row** — Total Clusters, Largest Cluster (nodes), Avg Cluster Size, Nodes in Isolation
   - **Cluster cards grid** — each card:
     - Cluster ID/number (e.g., "Cluster #1")
     - Node count + edge count
     - Entity type breakdown (e.g., "8 criminals, 12 victims, 5 crimes")
     - Top entity labels (first 3 names/IPs)
     - Key crime type (if majority are crime nodes)
     - **Mini Cytoscape graph** (small, ~250px height) showing the cluster
     - "Explore Cluster" button → navigates to `/network` (opens that cluster)
   - **Cluster size distribution** — small BarChart showing cluster sizes (X: cluster, Y: node count)
4. **Clustering algorithm:** Use connected components (BFS) on edges. For each connected subgraph, return its nodes and edges as a `GraphData`. This is deterministic and simple. For the correlation graph, use the same approach.
5. **States:** Loading (skeleton), Error (retry), Empty (no clusters discovered), Populated

---

### PAGE 4: SuspectProfilePage (`/network/suspects/:suspectId`)

**Goal:** Deep-dive profile for a specific suspect — personal info, crime history, network connections mini-graph, timeline of associations.

**Pattern:** Two-column layout like `CrimeCaseDetailPage` + mini-graph like NetworkOverviewPage. Uses `suspectId` route param.

#### Requirements

1. **Create file:** `src/pages/network/SuspectProfilePage.tsx`
2. **Data source:** `useCrimeNetwork()` — filter the graph to the selected suspect node + their immediate neighbors (1-hop). Also use `apiGet('/crime/criminals/:suspectId')` for profile data.
3. **Visual layout:**
   - **PageHeader** with suspect name as title, "Suspect Profile" subtitle, and back link to `/network`
   - **Two-column grid:**
     - **Left column (profile):**
       - Profile card: Name, ID, Risk Score (color-coded Badge), Status, Priors count
       - Demographic info: Age, Gender, District, Last Known Location
       - Associated Crimes list (linked to `/crime/cases/:caseId`)
     - **Right column (network):**
       - **Mini Cytoscape graph** (400px height) showing suspect + 1-hop connections
       - Legend: node shapes/colors
       - Click node → NodeDetailDrawer (reuse from `@/features/network/components`)
   - **Association timeline** — list of edges (associations) with:
     - Date or time context
     - Target entity (linked) 
     - Relationship type (e.g., "perpetrator", "accomplice", "connected to")
     - Case reference (linked)
   - **Quick actions:** "View in Full Network", "View Criminal Detail", "View Cases"
4. **Route param:** `useParams<{ suspectId: string }>()` — use this to look up the suspect node by matching `node.data.id`
5. **States:** Loading (skeleton x2 grid), Error (retry — suspect not found or data error), Empty (suspect has no connections), Populated

---

### PAGE 5: AssociationMatrixPage (`/network/association-matrix`)

**Goal:** Matrix/grid view of entity associations — rows and columns are entities, cells show relationship strength/type. Inspired by link analysis matrices.

**Pattern:** Tabular/data-grid format. Reference `CriminalListPage` table patterns.

#### Requirements

1. **Create file:** `src/pages/network/AssociationMatrixPage.tsx`
2. **Data source:** `useCrimeNetwork()` — extract all nodes and edges
3. **Visual layout:**
   - **PageHeader** with title "Association Matrix" and subtitle "Entity-to-entity relationship grid"
   - **Filter controls:**
     - Entity type filter (which types to show as rows/columns)
     - Minimum relationship strength slider (filters by edge weight/count)
     - View mode: "Full Matrix" / "Compact" (only entities with connections)
   - **Matrix grid** — scrollable table/grid:
     - Rows = entities (label + type icon)
     - Columns = same entities (label + type icon)
     - Cells = relationship indicator:
       - Empty (no connection) = muted `—`
       - Single connection = filled circle, color = relationship type
       - Multiple connections = number badge
       - Strong connection = larger circle + brighter color
     - Diagonal = self (muted, no data)
   - **Legend** showing what colors represent (perpetrator → red, victim → blue, etc.)
   - **Click cell** → highlights row + column, shows connection details in a tooltip/popover
   - **"View in Network"** button for selected entity pair
4. **Implementation approach:** Build the matrix as a grid of `<div>` elements (not a heavy table). Use `useMemo` to compute adjacency from edges. For performance, limit to top 30 most-connected entities (or all if below threshold).
5. **States:** Loading (skeleton grid), Error (retry), Empty (no associations match filters), Populated

---

## 3. REFERENCE PATTERNS

### Graph Data Shape (from `network.ts` DTO adapter)
```ts
interface GraphElement { data: { id: string; label?: string; type?: string; color?: string; source?: string; target?: string; [key: string]: GraphPrimitive } }
interface GraphData { elements: { nodes: GraphElement[]; edges: GraphElement[] } }
```

### Mock Data Pattern (from `network-crime.json`)
```json
{ "elements": { "nodes": [{ "data": { "id": "CR-001", "label": "Ravi Kumar 1", "type": "criminal", "color": "#dc2626", ... } }], "edges": [{ "data": { "id": "ce1", "source": "CR-001", "target": "KSP-2026-001", "label": "perpetrator" } }] } }
```

### Cytoscape Graph Usage (from `CrimeNetworkGraph.tsx`)
```tsx
import CytoscapeComponent from 'react-cytoscapejs';
<CytoscapeComponent
  elements={CytoscapeComponent.normalizeElements(data.elements)}
  style={{ width: '100%', height: '100%' }}
  layout={{ name: 'cose', animate: false }}
  stylesheet={[
    { selector: 'node', style: { label: 'data(label)', color: '#fff', 'font-size': 8, 'background-color': 'data(color)' } },
    { selector: 'edge', style: { width: 2, 'line-color': '#6b7280', 'curve-style': 'bezier' } },
  ]}
  cy={cy => { cy.on('tap', 'node', evt => onNodeClick?.(evt.target.data('id') as string)); }}
/>
```

### Hook Pattern (from `useCrimeNetwork`)
```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchCrimeNetwork } from '../api/networkApi';
export function useCrimeNetwork() {
  return useQuery({ queryKey: ['crime-network'], queryFn: fetchCrimeNetwork });
}
```

### Route Parameter Pattern (from `CrimeCaseDetailPage`)
```tsx
import { useParams } from 'react-router-dom';
const { caseId } = useParams<{ caseId: string }>();
```

### Filter Tabs Pattern (from `CrimePredictivePage` or `NetworkOverviewPage`)
```tsx
<div className="flex flex-wrap gap-2">
  <Button variant={activeTab === 'all' ? 'primary' : 'secondary'} onClick={() => setActiveTab('all')}>All</Button>
  <Button variant={activeTab === 'crime' ? 'primary' : 'secondary'} onClick={() => setActiveTab('crime')}>Crime</Button>
</div>
```

### Entity Search Pattern
Derive the entity list from the graph:
```tsx
const allEntities = useMemo(() => {
  return [...(crimeNetwork.data?.elements.nodes ?? []), ...(cyberNetwork.data?.elements.nodes ?? [])];
}, [crimeNetwork.data, cyberNetwork.data]);
```

---

## 4. DELIVERABLES

### Files Created
- [ ] `src/pages/network/EntityExplorerPage.tsx`
- [ ] `src/pages/network/LinkAnalysisPage.tsx`
- [ ] `src/pages/network/NetworkClustersPage.tsx`
- [ ] `src/pages/network/SuspectProfilePage.tsx`
- [ ] `src/pages/network/AssociationMatrixPage.tsx`

### Acceptance Criteria
- [ ] All 5 pages compile with zero TypeScript errors (`npx tsc --noEmit`)
- [ ] `npm run build` succeeds
- [ ] Each page shows **all 4 states**: loading → error (retry) → empty → populated
- [ ] Design tokens match existing pages — no new CSS variables
- [ ] Reuses existing shared components — no duplicates
- [ ] Lucide icons used throughout
- [ ] All glass-card styling matches the existing dark theme
- [ ] Filter controls work on each page
- [ ] SuspectProfilePage reads `suspectId` route param correctly
- [ ] EntityExplorerPage merges crime + cyber data correctly
- [ ] LinkAnalysisPage computes shortest path correctly
- [ ] NetworkClustersPage computes connected components correctly
- [ ] AssociationMatrixPage builds adjacency matrix efficiently
- [ ] Changelog entry added to `changes.md`

### Demo Moment
**"Network & Link Analysis complete — browse 145+ entities across crime and cyber domains, trace shortest paths between suspects and crimes, discover algorithmically detected clusters, deep-dive into suspect profiles with 1-hop network visualization, and visualize the full association matrix."**

---

## 5. BUILD PROTOCOL

1. **Read reference files first:** `NetworkOverviewPage.tsx`, `CrimeNetworkGraph.tsx`, `NodeDetailDrawer.tsx`
2. **Build in order:** EntityExplorerPage → LinkAnalysisPage → NetworkClustersPage → SuspectProfilePage → AssociationMatrixPage (foundational to complex)
3. **Verify after each page:** `npx tsc --noEmit` must pass
4. **Do NOT modify** frozen files, already-completed pages, or existing network components
5. **Do NOT add new npm packages** — cytoscape and react-cytoscapejs are already installed
6. **Do NOT proceed** to any other phase — stop after Phase 5 is complete
7. **Report back** with a summary of what was built, any issues encountered, and verification results

---

*Phase 5 completion prompt for Hellcat. 5 pages remain. Follow all rules and patterns.*
