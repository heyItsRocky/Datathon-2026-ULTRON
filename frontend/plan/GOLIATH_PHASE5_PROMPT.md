# GOLIATH — PHASE 5 EXECUTION PROMPT

> Copy the entire contents of this file as your prompt to Goliath.
> Phase: 5 of 10 | Focus: Network & Link Analysis

---

## 0. Context

Phases 0–4 are complete and verified. The app now has shell, dashboard, crime suite, cyber suite, and interactive Karnataka map.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### Current State

- 6 placeholder pages in `src/pages/network/` — all `createPlaceholderPage()` stubs
- Routes exist: `/network`, `/network/link-analysis`, `/network/entities`, `/network/clusters`, `/network/suspects/:suspectId`, `/network/association-matrix`
- Routes you MUST ADD: `/network/crime`, `/network/cyber`, `/network/correlation`
- `src/features/network/` does NOT exist — create it
- `src/shared/api/dto-adapters/network.ts` exists as a stub
- `src/mocks/` has crime, cyber, map data — add network mock data
- Cytoscape.js is NOT installed — install it

---

## 1. Build Protocol

**BUILD → VERIFY → STOP → REPORT**

1. Install dependency: `npm install cytoscape react-cytoscapejs @types/cytoscape`
2. Implement everything below
3. Run `npx tsc --noEmit` and `npm run build` — must pass
4. Verify against checklist
5. Report back
6. **Do NOT proceed to Phase 6 until instructed**

---

## 2. Hard Rules

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **MAY modify** | `router/routes.tsx`, `shared/api/mock/handlers.ts`, `shared/api/dto-adapters/network.ts` |
| **No new design tokens** | Use CSS variables only |
| **No component duplication** | Check `src/shared/components/index.ts` first |
| **All 4 states required** | loading, empty, error, populated |
| **Mock mode** | All data from `src/mocks/` or inline |
| **Icons** | Lucide only |
| **Types** | No `any` |

---

## 3. Build Order — 11 Steps

---

### Step 1 — Install Dependency

```bash
npm install cytoscape react-cytoscapejs @types/cytoscape
```

### Step 2 — Create Mock Data Files

#### `src/mocks/network-crime.json`

A Cytoscape-compatible graph elements array. Crime network has 100+ nodes and 200+ edges:

```json
{
  "elements": {
    "nodes": [
      { "data": { "id": "CR-001", "label": "Ravi Kumar", "type": "criminal", "riskScore": 85, "priors": 5, "color": "#dc2626" }},
      { "data": { "id": "VIC-001", "label": "Prakash Singh", "type": "victim", "color": "#3b82f6" }},
      { "data": { "id": "KSP-2026-001", "label": "KSP/2026/001", "type": "crime", "crimeType": "Murder", "color": "#f97316" }},
      { "data": { "id": "KSP-2026-002", "label": "KSP/2026/002", "type": "crime", "crimeType": "Theft", "color": "#eab308" }}
    ],
    "edges": [
      { "data": { "id": "e1", "source": "CR-001", "target": "KSP-2026-001", "label": "perpetrator", "color": "#6b7280" }},
      { "data": { "id": "e2", "source": "VIC-001", "target": "KSP-2026-001", "label": "victim_of", "color": "#6b7280" }},
      { "data": { "id": "e3", "source": "CR-001", "target": "KSP-2026-002", "label": "perpetrator", "color": "#6b7280" }}
    ]
  }
}
```

Node types: `criminal` (red circle, sized by priors), `victim` (blue diamond), `crime` (orange square, typed with different shades for different crime types)

Include:
- 50+ criminal nodes (use realistic names like data from crime-cases.json)
- 30+ victim nodes
- 50+ crime nodes spanning all crime types
- MO-match edges highlighted with thicker stroke

#### `src/mocks/network-cyber.json`

Similar Cytoscape-compatible format. Cyber network:

Node types: `ip` (cyan, sized by incident count), `domain` (yellow, with threat-colored border), `server` (gray hexagon), `victim` (blue)

Include:
- 30+ IP nodes
- 20+ domain nodes
- 15+ server nodes
- 10+ victim nodes
- Attack path edges highlighted in red with animated dash
- Edge thickness by connection strength

#### `src/mocks/network-correlation.json`

Cross-domain graph linking crime + cyber:

- 15+ criminal nodes (from crime network)
- 10+ IP nodes (from cyber network)
- 5+ domain nodes (from cyber network)
- Edges that cross domains (e.g., a criminal who appears in cyber evidence)
- Mixed node types with distinct visual styles

---

### Step 3 — Update Mock Handlers

**File:** `src/shared/api/mock/handlers.ts`

Add network data to registry:

```typescript
import networkCrime from '@/mocks/network-crime.json';
import networkCyber from '@/mocks/network-cyber.json';
import networkCorrelation from '@/mocks/network-correlation.json';

// Add to registry:
'/network/crime': networkCrime,
'/network/cyber': networkCyber,
'/network/correlation': networkCorrelation,
```

---

### Step 4 — Update DTO Adapters

**File:** `src/shared/api/dto-adapters/network.ts`

Replace stub:

```typescript
export interface GraphElement {
  data: {
    id: string;
    label: string;
    type: string;
    color: string;
    [key: string]: any;
  };
}

export interface GraphData {
  elements: {
    nodes: GraphElement[];
    edges: GraphElement[];
  };
}

export function adaptGraphData(raw: any): GraphData {
  return {
    elements: {
      nodes: (raw.elements?.nodes || []).map((n: any) => ({ data: n.data })),
      edges: (raw.elements?.edges || []).map((e: any) => ({ data: e.data })),
    },
  };
}
```

---

### Step 5 — Create Feature API Module

**Create directory:** `src/features/network/api/`

**File:** `src/features/network/api/networkApi.ts`

```typescript
import { apiGet } from '@/shared/api/client';
import { adaptGraphData, type GraphData } from '@/shared/api/dto-adapters/network';

export async function fetchCrimeNetwork(): Promise<GraphData> {
  const raw = await apiGet<any>('/network/crime');
  return adaptGraphData(raw);
}

export async function fetchCyberNetwork(): Promise<GraphData> {
  const raw = await apiGet<any>('/network/cyber');
  return adaptGraphData(raw);
}

export async function fetchCorrelationGraph(): Promise<GraphData> {
  const raw = await apiGet<any>('/network/correlation');
  return adaptGraphData(raw);
}
```

---

### Step 6 — Create Query Hooks

**Create directory:** `src/features/network/hooks/`

- `useCrimeNetwork()` — queryKey: `['crime-network']`
- `useCyberNetwork()` — queryKey: `['cyber-network']`
- `useCorrelationGraph()` — queryKey: `['correlation-graph']`

All follow the standard TanStack Query pattern.

---

### Step 7 — Create Graph Components

**Create directory:** `src/features/network/components/`

#### `CrimeNetworkGraph.tsx`

Cytoscape graph component using `react-cytoscapejs`:

```typescript
import CytoscapeComponent from 'react-cytoscapejs';
import type { GraphData } from '@/shared/api/dto-adapters/network';

interface Props {
  data: GraphData;
  onNodeClick?: (nodeId: string) => void;
  layout?: string;
  highlightedNodes?: string[];
}

export function CrimeNetworkGraph({ data, onNodeClick, layout = 'cose', highlightedNodes }: Props) {
  const stylesheet = [
    {
      selector: 'node[criminal]',
      style: { backgroundColor: '#dc2626', shape: 'ellipse', width: 'mapData(priors, 0, 12, 20, 80)' },
    },
    {
      selector: 'node[victim]',
      style: { backgroundColor: '#3b82f6', shape: 'diamond', width: 30, height: 30 },
    },
    {
      selector: 'node[crime]',
      style: { backgroundColor: '#f97316', shape: 'rectangle', width: 40, height: 40 },
    },
    {
      selector: 'edge',
      style: { width: 2, lineColor: '#6b7280', targetArrowColor: '#6b7280', targetArrowShape: 'triangle' },
    },
    // MO-match edges highlighted
    {
      selector: 'edge[moMatch]',
      style: { width: 4, lineColor: '#f0b000', opacity: 0.8 },
    },
    // Highlighted nodes
    {
      selector: 'node.highlighted',
      style: { borderColor: '#f0b000', borderWidth: 4, opacity: 1 },
    },
  ];

  return (
    <CytoscapeComponent
      elements={CytoscapeComponent.normalizeElements(data.elements)}
      style={{ width: '100%', height: '100%' }}
      layout={{ name: layout }}
      stylesheet={stylesheet}
      cy={(cy) => {
        cy.on('tap', 'node', (evt) => onNodeClick?.(evt.target.data('id')));
      }}
    />
  );
}
```

The stylesheet MUST differentiate:
- **Criminal nodes:** Red circles, sized by priors count
- **Victim nodes:** Blue diamonds
- **Crime nodes:** Orange squares, typed
- **Edges:** Labeled by relationship, MO-match edges thicker + pulsing

#### `CyberNetworkGraph.tsx`

Similar structure with different node types:

- **IP nodes:** Cyan circles, sized by incident count
- **Domain nodes:** Yellow circles with threat-colored border
- **Server nodes:** Gray hexagons
- **Victim nodes:** Blue diamonds
- **Attack path edges:** Red with animated dash line (use `lineStyle: 'dashed'` and a CSS animation class)

#### `CorrelationGraph.tsx`

Mixed graph combining crime + cyber node types. Uses a combined stylesheet from both graphs.

#### `GraphControls.tsx`

Toolbar component for graph interactions:

- Search input (filters nodes by label match)
- Node type filter (checkboxes for each type)
- Layout selector dropdown (cose, grid, concentric, breadthfirst)
- Timeline range slider (filters by date — for mock, it's cosmetic)
- Export button (placeholder)

```typescript
interface GraphControlsProps {
  onSearch: (query: string) => void;
  onLayoutChange: (layout: string) => void;
  onFilterChange: (types: string[]) => void;
  availableTypes: string[];
}
```

#### `NodeDetailDrawer.tsx`

Slide-in detail panel that appears when a node is clicked:

```typescript
interface NodeDetailDrawerProps {
  open: boolean;
  node: GraphNode | null;
  onClose: () => void;
}
```

Shows:
- Node ID, label, type
- Properties specific to type (risk score, priors for criminals; IP, ISP for IP nodes)
- Jump-links: [View Profile →], [View Cases →], [Jump to Map →]
- Use the existing Drawer component from shared/ui-kit

---

### Step 8 — Build Crime Network Page

**File:** `src/pages/network/NetworkOverviewPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/network`

Make this page a hub that shows the crime network graph by default, with tabs/buttons to switch between crime, cyber, and correlation.

Actually simpler: use this as the **Crime Network** landing page with a section toolbar allowing switch between the three graph views.

**Sections:**
1. **PageHeader** — "Network & Link Analysis"
2. **Graph mode tabs** — [Crime Network] [Cyber Network] [Correlation Graph]
   - Each tab changes the route or swaps the graph component
3. **GraphControls** toolbar
4. **Full-height Cytoscape graph** canvas (occupies most of viewport)
5. **NodeDetailDrawer** — slides in on node click

**States:**
- Loading: Chart skeleton filling the canvas area
- Empty: "No network data available" with retry
- Error: Error card with retry
- Populated: Interactive graph

---

### Step 9 — Build Cyber Network Page & Correlation Page

Rather than building separate pages, use the main `/network` page with tab switching:

- **Tab 1: Crime Network** — renders `CrimeNetworkGraph`
- **Tab 2: Cyber Network** — renders `CyberNetworkGraph`
- **Tab 3: Correlation** — renders `CorrelationGraph`

Each tab:
- Calls the corresponding hook (`useCrimeNetwork`, `useCyberNetwork`, `useCorrelationGraph`)
- Passes data to the appropriate graph component
- GraphControls stays consistent across tabs

**Alternatively**, if you prefer separate pages:

#### Create pages:
- `/network/crime` → CrimeNetworkPage (if building separately from the hub)
- `/network/cyber` → CyberNetworkPage
- `/network/correlation` → CorrelationGraphPage

**Recommended approach:** Single page with tab switching. Simpler, fewer routes, consistent UX.

---

### Step 10 — Update Routes

**File:** `src/router/routes.tsx`

If building separate pages:
```typescript
const CrimeNetworkPage = lazy(() => import('@/pages/network/CrimeNetworkPage'));
const CyberNetworkPage = lazy(() => import('@/pages/network/CyberNetworkPage'));
const CorrelationGraphPage = lazy(() => import('@/pages/network/CorrelationGraphPage'));

// Add to protectedRoutes:
{ path: '/network/crime', element: CrimeNetworkPage },
{ path: '/network/cyber', element: CyberNetworkPage },
{ path: '/network/correlation', element: CorrelationGraphPage },
```

If using single page with tabs (recommended), no new routes needed — just rewrite `NetworkOverviewPage`.

---

### Step 11 — Verify States on All Views

Every data-dependent view must have: Loading (skeleton), Empty (message + action), Error (card + retry), Populated.

---

## 4. Cytoscape Implementation Notes

### Layouts
```typescript
const layouts: Record<string, object> = {
  cose: { name: 'cose', animate: false, nodeRepulsion: 8000 },
  grid: { name: 'grid' },
  concentric: { name: 'concentric', concentric: (node: any) => node.data('priors') || 1 },
  breadthfirst: { name: 'breadthfirst' },
};
```

### Styling
Match the DESIGN_SYSTEM dark theme. Graph background should be transparent or very dark. Use the exact colors from DESIGN_SYSTEM:
- Criminal: `#dc2626` (crime-red)
- Victim: `#3b82f6` (blue-500)
- Crime: `#f97316` (orange-500)
- IP: `#06b6d4` (cyan-500)
- Domain: `#eab308` (yellow-500)
- Gold highlight: `#f0b000` (gold)

### Node Highlight on Click
```typescript
cy.on('tap', 'node', (evt) => {
  const node = evt.target;
  // Highlight connected nodes and edges
  node.connectedEdges().addClass('highlighted');
  node.connectedNodes().addClass('highlighted');
  // Open detail drawer
  onNodeClick?.(node.data('id'));
});
```

---

## 5. File Manifest

| Action | File |
|--------|------|
| CREATE | `src/mocks/network-crime.json` |
| CREATE | `src/mocks/network-cyber.json` |
| CREATE | `src/mocks/network-correlation.json` |
| MODIFY | `src/shared/api/mock/handlers.ts` |
| MODIFY | `src/shared/api/dto-adapters/network.ts` |
| CREATE | `src/features/network/api/networkApi.ts` |
| CREATE | `src/features/network/hooks/useCrimeNetwork.ts` |
| CREATE | `src/features/network/hooks/useCyberNetwork.ts` |
| CREATE | `src/features/network/hooks/useCorrelationGraph.ts` |
| CREATE | `src/features/network/components/CrimeNetworkGraph.tsx` |
| CREATE | `src/features/network/components/CyberNetworkGraph.tsx` |
| CREATE | `src/features/network/components/CorrelationGraph.tsx` |
| CREATE | `src/features/network/components/GraphControls.tsx` |
| CREATE | `src/features/network/components/NodeDetailDrawer.tsx` |
| REWRITE | `src/pages/network/NetworkOverviewPage.tsx` |
| MODIFY | `src/router/routes.tsx` (if needed) |

---

## 6. Verification Checklist

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Crime network graph renders with criminal/victim/crime nodes
- [ ] Cyber network graph renders with IP/domain/server nodes
- [ ] Correlation graph renders with mixed crime+cyber nodes
- [ ] GraphControls search filters nodes
- [ ] GraphControls layout selector changes graph arrangement
- [ ] Node click opens NodeDetailDrawer with relevant info
- [ ] NodeDetailDrawer shows jump-links (profile, cases, map)
- [ ] Node type filter works (show/hide specific node types)
- [ ] All three graph views load from mock data
- [ ] Loading/empty/error states on graph
- [ ] Mock mode works — no backend dependency
- [ ] No frozen files modified

---

## 7. Report Format

```
## Phase 5 Complete — Report

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

### Ready for Phase 6
YES / NO
```

---

**Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.**
