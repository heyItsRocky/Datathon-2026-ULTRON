# HELLCAT — PHASE 4 MAPS & GEOSPATIAL INTELLIGENCE COMPLETION PROMPT

> Build the 4 remaining placeholder pages in the Maps & Geospatial Intelligence suite.
> Phase: 4 of 10 | Focus: Hotspot map, patrol beat, geo-fence & route analysis pages

---

## 0. CONTEXT

Phases 0–3 are complete. The Maps module has existing infrastructure: Leaflet/react-leaflet, map components (KarnatakaMap, DistrictLayer, HotspotLayer, RedZoneLayer, CrimePinLayer, PredictiveRiskLayer, LayerControl, MapLegend), 5 hooks (useHotspots, useRedZones, usePredictiveZones, useDistrictStats, useMapFilters), a maps API module, and DTO adapters.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### What's Already Built in Phase 4

| Page | Status | Lines |
|------|--------|:-----:|
| `MapsOverviewPage.tsx` (Main Map) | ✅ Complete | 16 |
| `DistrictMapPage.tsx` (District Drill-down) | ✅ Complete | 7 |

### What's Missing — Build These 4 Pages

| # | Page | Route | Current State |
|:-:|------|-------|:-------------:|
| 1 | `HotspotMapPage.tsx` | `/maps/hotspots` | `createPlaceholderPage('Hotspot Map')` |
| 2 | `PatrolMapPage.tsx` | `/maps/patrol` | `createPlaceholderPage('Patrol Map')` |
| 3 | `GeoFencePage.tsx` | `/maps/geofences` | `createPlaceholderPage('Geo Fences')` |
| 4 | `RouteAnalysisPage.tsx` | `/maps/routes` | `createPlaceholderPage('Route Analysis')` |

### Infrastructure Ready

- **Leaflet:** `react-leaflet` v5, `leaflet` v1.9, `@types/leaflet` — MapContainer, TileLayer, Circle, CircleMarker, GeoJSON, Tooltip, Popup, Polyline, Polygon, ZoomControl
- **Map components:** `KarnatakaMap` (full map with layers), `DistrictLayer` (GeoJSON district polygons), `HotspotLayer`, `RedZoneLayer`, `PredictiveRiskLayer`, `CrimePinLayer`, `LayerControl`, `MapLegend`
- **Shared components:** `KpiCard`, `PageHeader`, `LoadingSkeleton` (map/chart/card variants), `EmptyState`, `ErrorState`, `RiskBadge`, `SeverityBadge`, `Badge`, `StatusBadge`, `TrendCard`
- **UI Kit:** `Button`, `Input`, `Select`, `SearchInput`, `Badge`, `Modal`, `Drawer`
- **Icons:** Lucide React
- **Stores:** `filterStore` with `mapFilters`
- **Existing hooks:** `useHotspots()`, `useRedZones()`, `usePredictiveZones()`, `useDistrictStats(id)`, `useMapFilters()`, `useCrimeList()`, `useUiStore`
- **Existing mock data:** `hotspots.json` (287 lines), `red-zones.json`, `predictive-zones.json`, `district-stats.json` (all 9 districts), `crime-cases.json` (30 records with lat/lng)
- **Mock handlers:** `/maps/hotspots`, `/maps/red-zones`, `/maps/predictive-zones`, `/maps/districts/:id` all registered in `handlers.ts`
- **Routes:** Already registered — just need working components
- **Design tokens:** CSS variables only — no new tokens
- **Dark tile layer:** `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` with CARTO attribution
- **District geoJSON:** fetched from `/data/karnataka-districts.geojson` at runtime

### District ID Map (for navigation & display)

```ts
const DISTRICT_NAMES: Record<string, string> = {
  'bengaluru-urban': 'Bengaluru Urban',
  'bengaluru-rural': 'Bengaluru Rural',
  'mysuru': 'Mysuru',
  'belagavi': 'Belagavi',
  'hubli-dharwad': 'Hubli-Dharwad',
  'kalaburagi': 'Kalaburagi',
  'mangaluru': 'Mangaluru',
  'tumakuru': 'Tumakuru',
  'shivamogga': 'Shivamogga',
  'davanagere': 'Davanagere',
};
```

### District Coordinates Map (for Leaflet markers)

```ts
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'bengaluru-urban': [12.9716, 77.5946],
  'mysuru': [12.30, 76.65],
  'belagavi': [15.85, 74.50],
  'hubli-dharwad': [15.36, 75.12],
  'kalaburagi': [17.33, 76.83],
  'mangaluru': [12.91, 74.86],
  'bengaluru-rural': [13.0, 77.5],
  'tumakuru': [13.34, 77.10],
  'shivamogga': [13.93, 75.57],
  'davanagere': [14.46, 75.92],
};
```

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **Do NOT modify** | Already-built pages, routes.tsx, already-registered mock handlers in handlers.ts |
| **Do NOT modify** | `MapsOverviewPage.tsx`, `DistrictMapPage.tsx` (already built), any map component in `features/maps/components/` |
| **New mock data** | Only add new JSON files to `src/mocks/` and register in `handlers.ts` registry + add to imports at top |
| **No new design tokens** | Use CSS variables only |
| **No component duplication** | Check `src/shared/components/index.ts` and `src/features/maps/components/` before creating anything new |
| **All 4 states required** | `isLoading` → `ErrorState` → `EmptyState` → populated content |
| **Icons** | Lucide icons only |
| **Types** | No `any` — use proper types or `unknown` with type guards |
| **Named exports** for all components and hooks |
| **Recharts** for non-map chart visualizations |
| **Leaflet** for all map components |
| **Dark theme** — all cards use `glass-card` class |

---

## 2. BUILD ORDER — 4 PAGES

---

### PAGE 1: HotspotMapPage (`/maps/hotspots`)

**Goal:** Interactive map focused on crime hotspot clusters with a detail sidebar, risk filtering, and district navigation.

**Pattern to follow:** See `MapsOverviewPage.tsx` and `DistrictMapPage.tsx` for Leaflet map + data fetching patterns.

#### Requirements

1. **Create file:** `src/pages/maps/HotspotMapPage.tsx`
2. **Data source:** `useHotspots()` hook + `useRedZones()` hook — both already exist
3. **Visual layout:**
   - **PageHeader** with title "Hotspot Map" and subtitle "{n} active hotspots"
   - **Full-height Leaflet map** (left ~70% width) with:
     - `MapContainer` using same CARTO dark tile layer
     - Center on Karnataka, zoom level 7
     - **HotspotLayer** — Circle markers with color by risk level
     - **RedZoneLayer** — Red circles for red zones
     - Optionally import KarnatakaMap if it fits, or build a dedicated map
   - **Hotspot detail sidebar** (right ~30% width) containing:
     - **Summary KPIs** — Total hotspots, high-risk count, avg crime density
     - **Hotspot list** — scrollable list of hotspot cards showing:
       - District name, risk badge, crime count, top crime type
       - Trend arrow (up/down) with percentage
       - Clicking a hotspot centers the map on its coordinates
     - **Filter control** — risk level dropdown (All / High / Medium / Low)
4. **States:** Loading (skeleton map), Error (retry with full map error), Empty (no hotspot data), Populated
5. **Interactivity:** Click hotspot card → map flies to hotspot location; filter → cards and map update

#### Map Interaction Pattern (from existing code)

```tsx
import { MapContainer, TileLayer, ZoomControl, Circle, Tooltip } from 'react-leaflet';

<MapContainer className="h-[80vh] w-full rounded-[var(--radius-2xl)]" center={[15.3, 75.5]} zoom={7} zoomControl={false} scrollWheelZoom>
  <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
  <ZoomControl position="bottomleft" />
  {/* Marker layers */}
</MapContainer>
```

---

### PAGE 2: PatrolMapPage (`/maps/patrol`)

**Goal:** Patrol beat visualization — show patrol zones on a map with officer assignments, beat boundaries, and patrol metrics.

#### Requirements

1. **Create file:** `src/pages/maps/PatrolMapPage.tsx`
2. **Data source:**
   - **New mock data file:** `src/mocks/patrol-zones.json` — see shape below
   - **New mock handler:** Add `/maps/patrol-zones` to handlers.ts registry + import
   - **Existing data:** Can also use `useHotspots()` to show hotspot density overlay
3. **New mock data shape (`src/mocks/patrol-zones.json`):**
   ```ts
   interface PatrolZoneDTO {
     id: string;
     districtId: string;
     district: string;
     zoneName: string;          // e.g. "Beat A-1"
     boundaries: Array<{        // polygon vertices
       lat: number;
       lng: number;
     }>;
     centerLat: number;
     centerLng: number;
     radius: number;            // meters
     assignedTeam: string;
     teamSize: number;
     shift: 'morning' | 'afternoon' | 'night';
     status: 'active' | 'patrolling' | 'standby';
     coverage: number;          // percentage
     lastPatrol: string;        // date
   }
   ```
4. **Create hook:** `src/features/maps/hooks/usePatrolZones.ts` — standard useQuery fetching from `/maps/patrol-zones`
5. **Visual layout:**
   - **PageHeader** with title "Patrol Management" and subtitle "Live patrol beat map"
   - **KPI row** — Total Beats, Active Patrols, Avg Coverage %, Teams Deployed
   - **Full-height Leaflet map** with:
     - **Patrol zone polygons** — Leaflet `Polygon` with different colors per shift (morning=gold, afternoon=cyan, night=violet)
     - **Team markers** — Leaflet `CircleMarker` with team info tooltip at zone center
     - Optional hotspot overlay toggle (checkbox)
   - **Patrol zone list sidebar** — scrollable list showing:
     - Zone name, district, assigned team
     - Status badge, coverage bar, shift badge
     - "View on Map" button that flies to zone center
   - **Shift filter tabs** — All / Morning / Afternoon / Night
6. **States:** Loading (skeleton map), Error (retry), Empty (no patrol zones), Populated
7. **Interactivity:** Click zone card → map flies to zone polygon; shift filter → zones update

---

### PAGE 3: GeoFencePage (`/maps/geofences`)

**Goal:** Geo-fence management — show geo-fence zones on a map with status, trigger events, and active alerts.

#### Requirements

1. **Create file:** `src/pages/maps/GeoFencePage.tsx`
2. **Data source:**
   - **New mock data file:** `src/mocks/geofences.json` — see shape below
   - **New mock handler:** Add `/maps/geofences` to handlers.ts registry + import
   - **Existing data:** Can also use `useRedZones()` to show red-zone overlay
3. **New mock data shape (`src/mocks/geofences.json`):**
   ```ts
   interface GeoFenceDTO {
     id: string;
     name: string;              // e.g. "VIP Route Corridor"
     districtId: string;
     district: string;
     centerLat: number;
     centerLng: number;
     radius: number;            // meters (for circular fences)
     type: 'alert' | 'restricted' | 'monitoring' | 'vip';
     status: 'active' | 'triggered' | 'inactive';
     priority: number;          // 1-5
     triggerEvents: number;     // count
     lastTriggered: string | null; // date or null
     description: string;
   }
   ```
4. **Create hook:** `src/features/maps/hooks/useGeofences.ts` — standard useQuery fetching from `/maps/geofences`
5. **Visual layout:**
   - **PageHeader** with title "Geo Fences" and subtitle "Monitoring {n} active geo-fences"
   - **KPI row** — Active Fences, Triggered Alerts, High Priority, Restricted Zones
   - **Full-height Leaflet map** with:
     - **Fence circles** — Leaflet `Circle` colored by type (alert=red, restricted=orange, monitoring=cyan, vip=gold), dashed stroke for triggered fences
     - **Popup** on click showing fence name, status, last triggered
   - **Fence list sidebar** — scrollable list showing:
     - Fence name, district, type badge
     - Status badge (active/triggered/inactive)
     - Priority stars/badge, trigger event count
     - "View Details" button — flies to fence center
   - **Type filter tabs** — All / Alert / Restricted / VIP / Monitoring
   - **Status filter** — All / Active / Triggered / Inactive
6. **States:** Loading (skeleton map), Error (retry), Empty (no geo-fences), Populated
7. **Interactivity:** Filter tabs → map and list update; click fence → map flies to center

---

### PAGE 4: RouteAnalysisPage (`/maps/routes`)

**Goal:** Crime route analysis — show escape routes, movement patterns, and route correlation on a map.

#### Requirements

1. **Create file:** `src/pages/maps/RouteAnalysisPage.tsx`
2. **Data source:**
   - **New mock data file:** `src/mocks/route-analysis.json` — see shape below
   - **New mock handler:** Add `/maps/route-analysis` to handlers.ts registry + import
   - **Existing data:** Can also use `useCrimeList()` to show crime pins as route endpoints
3. **New mock data shape (`src/mocks/route-analysis.json`):**
   ```ts
   interface CrimeRouteDTO {
     id: string;
     name: string;              // e.g. "Route: KR Puram → MG Road"
     type: 'escape' | 'suspected' | 'patrol' | 'pattern';
     confidence: number;        // 0-100
     distance: number;          // km
     estimatedTime: number;     // minutes
     waypoints: Array<{
       lat: number;
       lng: number;
       label: string;           // e.g. "Origin", "Choke point", "Destination"
     }>;
     incidents: number;         // associated crime count
     riskLevel: 'low' | 'medium' | 'high' | 'extreme';
     status: 'active' | 'monitored' | 'historical';
   }
   ```
4. **Create hook:** `src/features/maps/hooks/useRouteAnalysis.ts` — standard useQuery fetching from `/maps/route-analysis`
5. **Visual layout:**
   - **PageHeader** with title "Route Analysis" and subtitle "{n} routes under analysis"
   - **KPI row** — Total Routes, Escape Routes, High Confidence, Active Monitoring
   - **Full-height Leaflet map** with:
     - **Route polylines** — Leaflet `Polyline` colored by type (escape=red, suspected=orange, patrol=cyan, pattern=gold), with arrow markers or dashed patterns
     - **Waypoint markers** — Leaflet `CircleMarker` with tooltip at each waypoint
     - **Crime pin overlay** — Optional toggle to show crime case pins at route endpoints
   - **Route list sidebar** — scrollable list showing:
     - Route name, type badge
     - Confidence percentage (progress bar), risk badge
     - Distance, estimated time
     - Incident count, status badge
     - "View Route" button — flies to route bounds
   - **Type filter tabs** — All / Escape / Suspected / Patrol / Pattern
   - **Risk filter** — All / Extreme / High / Medium / Low
6. **States:** Loading (skeleton map), Error (retry), Empty (no route data), Populated
7. **Interactivity:** Click route card → map flies to route bounds and highlights polyline; filters → list and map update

---

## 3. REFERENCE PATTERNS

### Data Fetching (for new hooks)
```ts
// src/features/maps/hooks/useGeofences.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';
import type { GeoFenceDTO } from '@/shared/api/dto-adapters/maps';

export function useGeofences() {
  return useQuery({
    queryKey: ['map-geofences'],
    queryFn: () => apiGet<GeoFenceDTO[]>('/maps/geofences'),
  });
}
```

### Mock Data Registration (in handlers.ts)
Add at top:
```ts
import geofences from '@/mocks/geofences.json';
```
Add to registry:
```ts
'/maps/geofences': geofences,
```

### Leaflet Map Pattern (dedicated per page)
```tsx
import { MapContainer, TileLayer, ZoomControl, Polygon, Circle, Polyline, Tooltip, Popup } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';

<MapContainer
  className="h-[80vh] w-full rounded-[var(--radius-2xl)]"
  center={[15.3, 75.5]}
  zoom={7}
  zoomControl={false}
  scrollWheelZoom
>
  <TileLayer
    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  />
  <ZoomControl position="bottomleft" />
  {/* Your layer here */}
</MapContainer>
```

### Polygon with Tooltip (for patrol zones)
```tsx
import { Polygon, Tooltip } from 'react-leaflet';

<Polygon
  positions={zone.boundaries.map(b => [b.lat, b.lng])}
  pathOptions={{
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.12,
    weight: 2
  }}
>
  <Tooltip>{zone.zoneName}: {zone.assignedTeam}</Tooltip>
</Polygon>
```

### Polyline with Waypoints (for routes)
```tsx
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

<Polyline
  positions={route.waypoints.map(w => [w.lat, w.lng])}
  pathOptions={{ color: '#ef4444', weight: 3, dashArray: '10 5' }}
/>
{route.waypoints.map(w => (
  <CircleMarker key={w.label} center={[w.lat, w.lng]} radius={6} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}>
    <Tooltip>{w.label}</Tooltip>
  </CircleMarker>
))}
```

### Flying to Location (for card→map interaction)
```tsx
import { useMap } from 'react-leaflet';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 12, { duration: 1 }); }, [center]);
  return null;
}
```

### Sidebar Layout Pattern
```tsx
<section className="flex gap-4">
  <section className="w-[70%]">
    {/* Map goes here */}
  </section>
  <section className="w-[30%] space-y-3">
    {/* Sidebar content */}
  </section>
</section>
```

### PageHeader Pattern
```tsx
<PageHeader title="Hotspot Map" subtitle={`${hotspots.length} active hotspots across Karnataka`} />
```

### Filter Tab Pattern
```tsx
<section className="flex gap-2">
  {['all', 'high', 'medium', 'low'].map(level => (
    <Button
      key={level}
      variant={activeFilter === level ? 'default' : 'ghost'}
      onClick={() => setActiveFilter(level)}
      className="capitalize"
    >
      {level}
    </Button>
  ))}
</section>
```

---

## 4. MOCK DATA PRODUCTION

Create these 3 new mock data files. Each should have 8–12 realistic entries covering multiple districts.

### `src/mocks/patrol-zones.json` — 10 patrol zones
Each zone covers a different district with realistic beat names like "Beat B1", "Beat M2", shift assignments (morning/afternoon/night), team sizes (3–6), coverage percentages (65–95%), and recent patrol dates.

### `src/mocks/geofences.json` — 8 geo-fences
Mix of types (alert, restricted, monitoring, vip) across districts. Some triggered, some active, some inactive. Realistic names like "VIP Route - Vidhana Soudha", "Restricted - HAL Airport Perimeter".

### `src/mocks/route-analysis.json` — 8 crime routes
Mix of types (escape, suspected, patrol, pattern) with 3–5 waypoints each (origin → choke points → destination). Include confidence scores, distances (5–60km), and time estimates.

---

## 5. DELIVERABLES

By the end of this phase, you must have:

### Files Created
- [ ] `src/pages/maps/HotspotMapPage.tsx`
- [ ] `src/pages/maps/PatrolMapPage.tsx`
- [ ] `src/pages/maps/GeoFencePage.tsx`
- [ ] `src/pages/maps/RouteAnalysisPage.tsx`
- [ ] `src/mocks/patrol-zones.json`
- [ ] `src/mocks/geofences.json`
- [ ] `src/mocks/route-analysis.json`
- [ ] `src/features/maps/hooks/usePatrolZones.ts`
- [ ] `src/features/maps/hooks/useGeofences.ts`
- [ ] `src/features/maps/hooks/useRouteAnalysis.ts`

### Files Modified
- [ ] `src/shared/api/mock/handlers.ts` — add imports for 3 new mock JSON files + register in registry object

### Acceptance Criteria
- [ ] All 4 pages compile with zero TypeScript errors (`npx tsc --noEmit`)
- [ ] `npm run build` succeeds
- [ ] Each page shows **all 4 states**: loading → error (retry) → empty → populated
- [ ] Design tokens match existing pages — no new CSS variables
- [ ] Reuses existing shared components and map components — no duplicates
- [ ] Lucide icons used throughout
- [ ] All glass-card styling matches the existing dark theme
- [ ] Filter controls work on each page
- [ ] Map interactions work (flyTo on card click, tooltips on hover, popups on click)
- [ ] Changelog entry added to `changes.md` at project root (`../../../changes.md`)

### Demo Moment
**"Maps & Geospatial Intelligence complete — explore hotspot clusters with risk analysis, manage patrol beats and geo-fence zones, analyze crime escape routes across Karnataka."**

---

## 6. BUILD PROTOCOL

1. **Read reference files first:** `MapsOverviewPage.tsx`, `DistrictMapPage.tsx`
2. **Read existing map components:** `HotspotLayer.tsx`, `RedZoneLayer.tsx`, `CrimePinLayer.tsx`
3. **Build in order:** HotspotMap → PatrolMap → GeoFence → RouteAnalysis
4. **For new mocks:** Create JSON first, register in handlers.ts, then build pages
5. **Verify after each page:** `npx tsc --noEmit` must pass
6. **Do NOT modify** frozen files or already-completed pages
7. **Do NOT modify** existing `features/maps/components/*` or `features/maps/api/*`
8. **Do NOT proceed** to any other phase — stop after Phase 4 is complete
9. **Report back** with a summary of what was built, any issues encountered, and verification results

---

*Phase 4 completion prompt for Hellcat. 4 pages remain. Follow all rules and patterns.*
