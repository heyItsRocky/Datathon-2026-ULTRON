# GOLIATH — PHASE 4 EXECUTION PROMPT

> Copy the entire contents of this file as your prompt to Goliath.
> Phase: 4 of 10 | Focus: Maps & Geospatial Intelligence

---

## 0. Context

Phases 0–3 are complete and verified. Crime and Cyber tracks are fully built.

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

### Current State

- 6 placeholder pages in `src/pages/maps/` — all `createPlaceholderPage()` stubs
- Routes exist: `/maps`, `/maps/hotspots`, `/maps/patrol`, `/maps/geofences`, `/maps/districts`, `/maps/routes`
- `/maps` → MapsOverviewPage (will become the main interactive map)
- `/maps/districts` → DistrictMapPage (will become district drill-down)
- `src/features/maps/` does NOT exist — create it
- `src/shared/api/dto-adapters/maps.ts` exists as a stub
- `src/mocks/` has no map data yet
- `filterStore` has `mapFilters` ready
- `useUiStore` has `openRightPanel({ title, content })` for the context panel
- `LoadingSkeleton` already has `variant="map"` (h-96 rounded)
- React-Leaflet / Leaflet are NOT installed yet — install them

---

## 1. Build Protocol

**BUILD → VERIFY → STOP → REPORT**

1. Install dependency: `npm install react-leaflet leaflet @types/leaflet`
2. Implement everything below
3. Run `npx tsc --noEmit` and `npm run build` — must pass
4. Verify against checklist
5. Report back
6. **Do NOT proceed to Phase 5 until instructed**

---

## 2. Hard Rules

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **MAY modify** | `router/routes.tsx`, `shared/api/mock/handlers.ts`, `shared/api/dto-adapters/maps.ts` |
| **No new design tokens** | Use CSS variables only |
| **No component duplication** | Check `src/shared/components/index.ts` first |
| **All 4 states required** | loading, empty, error, populated |
| **Mock mode** | All data from `src/mocks/` or inline |
| **Icons** | Lucide only |
| **Types** | No `any` |
| **Leaflet CSS** | Import `leaflet/dist/leaflet.css` in the map page or main.tsx |

---

## 3. Build Order — 15 Steps

---

### Step 1 — Install Dependencies & Configure

```bash
npm install react-leaflet leaflet @types/leaflet
```

Add leaflet CSS import in `src/main.tsx`:
```typescript
import 'leaflet/dist/leaflet.css';
```

### Step 2 — Create Karnataka GeoJSON Data

**File:** `public/data/karnataka-districts.geojson`

This is a GeoJSON FeatureCollection with 31 Karnataka district boundaries. Each feature:

```json
{
  "type": "Feature",
  "properties": {
    "name": "Bengaluru Urban",
    "id": "bengaluru-urban",
    "crimeDensity": 87,
    "riskLevel": "high"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

**CRITICAL:** Since you cannot generate real 31-district GeoJSON from scratch, use a simplified approach:
- Create a simplified GeoJSON with approximate polygon coordinates for the major districts (Bengaluru Urban, Bengaluru Rural, Mysuru, Belagavi, Hubli-Dharwad, Kalaburagi, Mangaluru, Tumakuru, Shivamogga, Davanagere — 10 districts minimum)
- Use realistic approximate coordinates for each district
- Include all properties: `name`, `id`, `crimeDensity` (0-100), `riskLevel` (low/medium/high/extreme)

For the remaining districts, include them with simplified bounding-box style polygons. The map should show all 31 districts even if some have simplified geometry — completeness matters for the demo.

**Include all 31 districts:**
Bengaluru Urban, Bengaluru Rural, Mysuru, Belagavi, Hubli-Dharwad, Kalaburagi, Mangaluru, Tumakuru, Shivamogga, Davanagere, Udupi, Dakshina Kannada, Uttara Kannada, Chikkamagaluru, Hassan, Kodagu, Mandya, Chamarajanagar, Ramanagara, Kolar, Chikkaballapur, Ballari, Vijayanagara, Vijapura, Bagalkote, Gadag, Haveri, Koppal, Raichur, Yadgiri, Bidar

---

### Step 3 — Create Mock Data Files

#### `src/mocks/hotspots.json`

Array of **15+** hotspot cluster records:

```json
{
  "id": "HS-001",
  "district": "Bengaluru Urban",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "radius": 1500,
  "crimeCount": 234,
  "topCrimeType": "Theft",
  "crimeTypes": { "Theft": 89, "Assault": 56, "Burglary": 45, "Robbery": 24, "Cyber": 20 },
  "riskLevel": "high",
  "trend": 12,
  "peakTime": "22:00-02:00"
}
```

Spread across districts: Bengaluru Urban (4), Mysuru (2), Belagavi (2), Hubli-Dharwad (2), Kalaburagi (1), Mangaluru (1), Tumakuru (1), Shivamogga (1), Davanagere (1)

#### `src/mocks/red-zones.json`

Array of **5+** red-zone district records:

```json
{
  "district": "Bengaluru Urban",
  "districtId": "bengaluru-urban",
  "level": "extreme",
  "crimeRate": 87,
  "trend": 12,
  "population": 12000000,
  "policeStations": 85,
  "priority": 1
}
```

#### `src/mocks/district-stats.json`

Object keyed by district ID with full stats:

```json
{
  "bengaluru-urban": {
    "totalCrimes": 12450,
    "trend": 8,
    "riskLevel": "extreme",
    "crimeBreakdown": { "Theft": 34, "Assault": 22, "Burglary": 18, "Cyber": 8, "Murder": 5, "Other": 13 },
    "monthlyTrend": [320, 280, 410, 380, 450, 390],
    "topCriminals": [
      { "name": "Ravi Kumar", "priors": 5, "riskScore": 85 },
      { "name": "Venkatesh", "priors": 3, "riskScore": 72 }
    ],
    "moPatterns": [
      { "pattern": "Armed robbery at night", "matches": 12 },
      { "pattern": "Chain snatching, daytime", "matches": 8 }
    ],
    "socioEconomic": {
      "literacy": 91.2,
      "povertyRate": 8.3,
      "populationDensity": 12000,
      "policeStations": 85
    },
    "lat": 12.9716,
    "lng": 77.5946
  }
}
```

Include data for all 10+ major districts.

#### `src/mocks/predictive-zones.json`

Array of 3+ predictive risk zones with tomorrow's date and confidence scores.

---

### Step 4 — Update Mock Handlers

**File:** `src/shared/api/mock/handlers.ts`

Add map data to registry:

```typescript
import hotspots from '@/mocks/hotspots.json';
import redZones from '@/mocks/red-zones.json';
import districtStats from '@/mocks/district-stats.json';
import predictiveZones from '@/mocks/predictive-zones.json';

// Add to registry:
'/maps/hotspots': hotspots,
'/maps/red-zones': redZones,
'/maps/predictive-zones': predictiveZones,

// District stats lookup:
if (key.startsWith('/maps/districts/')) {
  const id = key.split('/')[3];
  const found = (districtStats as any)[id];
  if (!found) throw new Error(`District not found: ${id}`);
  return found as T;
}
```

---

### Step 5 — Update DTO Adapters

**File:** `src/shared/api/dto-adapters/maps.ts`

Replace stub with types and adapters:

```typescript
export interface HotspotDTO {
  id: string;
  district: string;
  latitude: number;
  longitude: number;
  radius: number;
  crimeCount: number;
  topCrimeType: string;
  crimeTypes: Record<string, number>;
  riskLevel: string;
  trend: number;
  peakTime: string;
}

export interface RedZoneDTO {
  district: string;
  districtId: string;
  level: string;
  crimeRate: number;
  trend: number;
  population: number;
  policeStations: number;
  priority: number;
}

export interface DistrictStatsDTO {
  totalCrimes: number;
  trend: number;
  riskLevel: string;
  crimeBreakdown: Record<string, number>;
  monthlyTrend: number[];
  topCriminals: { name: string; priors: number; riskScore: number }[];
  moPatterns: { pattern: string; matches: number }[];
  socioEconomic: { literacy: number; povertyRate: number; populationDensity: number; policeStations: number };
  lat: number;
  lng: number;
}

export function adaptHotspot(raw: any): HotspotDTO { ... }
export function adaptRedZone(raw: any): RedZoneDTO { ... }
export function adaptDistrictStats(raw: any): DistrictStatsDTO { ... }
```

---

### Step 6 — Create Feature API Module

**Create directory:** `src/features/maps/api/`

**File:** `src/features/maps/api/mapsApi.ts`

```typescript
import { apiGet } from '@/shared/api/client';
import { adaptHotspot, adaptRedZone, adaptDistrictStats,
         type HotspotDTO, type RedZoneDTO, type DistrictStatsDTO } from '@/shared/api/dto-adapters/maps';

export async function fetchHotspots(): Promise<HotspotDTO[]> {
  const raw = await apiGet<any[]>('/maps/hotspots');
  return raw.map(adaptHotspot);
}

export async function fetchRedZones(): Promise<RedZoneDTO[]> {
  const raw = await apiGet<any[]>('/maps/red-zones');
  return raw.map(adaptRedZone);
}

export async function fetchDistrictStats(districtId: string): Promise<DistrictStatsDTO> {
  const raw = await apiGet<any>(`/maps/districts/${districtId}`);
  return adaptDistrictStats(raw);
}

export async function fetchPredictiveZones(): Promise<any[]> {
  return apiGet('/maps/predictive-zones');
}
```

---

### Step 7 — Create Query Hooks

**Create directory:** `src/features/maps/hooks/`

- `useHotspots()` — queryKey: `['map-hotspots']`
- `useRedZones()` — queryKey: `['map-red-zones']`
- `useDistrictStats(districtId)` — queryKey: `['district-stats', districtId]`, enabled: `!!districtId`
- `usePredictiveZones()` — queryKey: `['predictive-zones']`
- `useMapFilters()` — reads/writes `mapFilters` from filterStore

---

### Step 8 — Create Map Components

**Create directory:** `src/features/maps/components/`

#### `KarnatakaMap.tsx`
- **Core map component** using React-Leaflet
- Uses `MapContainer`, `TileLayer`, `GeoJSON`, `ZoomControl`
- Props: `onDistrictClick?: (districtId: string) => void`, `onDistrictHover?: (districtId: string) => void`
- Dark tile layer: use CartoDB dark tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- Center: [15.3, 75.5] (center of Karnataka)
- Zoom: 7
- Imports GeoJSON from `/data/karnataka-districts.geojson` (fetched at runtime)
- Each district polygon:
  - Fill color based on `crimeDensity` (green→yellow→red gradient)
  - Stroke: white/gray with opacity
  - On click: fire `onDistrictClick(district.properties.id)`
  - On hover: highlight polygon, show tooltip with district name + crime density
- Responsive: full width, 70vh minimum height

#### `DistrictLayer.tsx`
- Wrapper/overlay for the district GeoJSON layer
- Handles color mapping based on crime density

#### `CrimePinLayer.tsx`
- Adds crime pins to the map using Leaflet markers
- Use colored circle markers (not default blue pins) — use `L.circleMarker`
- Colors: red=Murder, orange=Robbery, yellow=Theft, blue=Cyber, gray=Other
- Click pin → show popup with crime type, date, FIR number
- Import crime data from `useQuery` or pass as prop

#### `HotspotLayer.tsx`
- Semi-transparent circles for hotspot clusters
- Radius proportional to crime count
- Color intensity by risk level
- Hover → tooltip with top crime type, count, peak time

#### `RedZoneLayer.tsx`
- District-level overlay with pulsing animation
- Uses CSS animation (`@keyframes pulse`) on the polygon
- Higher opacity = higher priority

#### `PredictiveRiskLayer.tsx`
- Gradient heat-style overlay showing predicted risk zones
- If complex, simplify to highlighted polygons with confidence labels

#### `LayerControl.tsx`
- UI overlay (top-right of map) with toggle checkboxes:
  - Crime Pins, Hotspots, Red Zones, Predictive, Socio-Economic
- Each toggle controls visibility of corresponding layer
- Glass card styling

#### `MapLegend.tsx`
- Bottom-right overlay showing color meanings:
  - Crime pins by type (colored dots)
  - Risk levels (green→red gradient)
  - Hotspot intensity
- Glass card styling

---

### Step 9 — Build Main Map Page (MapsOverviewPage)

**File:** `src/pages/maps/MapsOverviewPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/maps`

**Sections:**
1. **Full-width map** occupying most of the viewport
2. **LayerControl** overlay (top-right)
3. **MapLegend** overlay (bottom-right)
4. **Stats Panel** overlay (bottom-left) — shows selected district info:
   - District name, total crimes, trend, top crime type, risk level
   - [View Details →] button linking to `/maps/districts/:id`
5. **RightContextPanel integration** — when district clicked:
   ```typescript
   useUiStore.getState().openRightPanel({
     title: districtName,
     content: `${totalCrimes} crimes · ${riskLevel} risk`
   });
   ```

**States:**
- Loading: `LoadingSkeleton variant="map"` with layer control skeleton
- Empty: "Map data unavailable" with retry
- Error: error card with retry
- Populated: full interactive map

**Layout tip:** Use `h-[calc(100vh-var(--top-header-height))]` or similar to make the map fill the available space below the AppShell header.

---

### Step 10 — Build District Drill-down Page (DistrictMapPage)

**File:** `src/pages/maps/DistrictMapPage.tsx` — **REWRITE** (was placeholder)
**Route:** `/maps/districts/:districtId` — currently `/maps/districts`, you may need to modify the route to accept a param

**Data:** `useDistrictStats(districtId)` hook

**Sections:**
1. **District Header** — Name, total crimes, risk badge, MoM trend
2. **Intelligence Grid** (2-column):
   - **Left column:**
     - Crime Breakdown — horizontal bar chart (Recharts `BarChart`) showing crime type percentages
     - 30-Day Trend — Recharts `AreaChart` showing monthly trend
   - **Right column:**
     - Socio-Economic — literacy, poverty rate, population density, police stations (as stat cards)
     - Top Criminals — compact list with names, priors, risk scores
     - MO Patterns — list of patterns with match counts

**If route doesn't support params:** Change the route in `routes.tsx` from `/maps/districts` to `/maps/districts/:districtId`.

**States:** Loading, Empty ("District not found"), Error, Populated

---

### Step 11 — Build Predictive Risk Map Page

**File:** `src/pages/maps/PredictiveRiskMapPage.tsx` — **CREATE** (or use existing `CrimePredictivePage.tsx` equivalent)

Actually, check existing routes — there's no predictive map route. You can integrate the predictive layer toggle into the main MapsOverviewPage instead of building a separate page. If a separate page is desired, route it under `/maps/predictive`.

**Simplified approach:** Add "Predictive" as a toggleable layer in the main map. When enabled, show predictive risk zones as an overlay on the district polygons.

---

### Step 12 — Keep Other Map Pages

The remaining placeholder pages can remain as-is for now:
- `HotspotMapPage.tsx` — leave as placeholder (hotspot data is shown on main map)
- `PatrolMapPage.tsx` — leave as placeholder
- `GeoFencePage.tsx` — leave as placeholder
- `RouteAnalysisPage.tsx` — leave as placeholder

---

### Step 13 — Update Routes (if needed)

**File:** `src/router/routes.tsx`

If `/maps/districts` needs to become `/maps/districts/:districtId`:

```typescript
// Change:
{ path: '/maps/districts', element: DistrictMapPage },
// To:
{ path: '/maps/districts/:districtId', element: DistrictMapPage },
```

Add predictive route if building separate page:
```typescript
const PredictiveRiskMapPage = lazy(() => import('@/pages/maps/PredictiveRiskMapPage'));
{ path: '/maps/predictive', element: PredictiveRiskMapPage },
```

---

### Step 14 — Wire Up Map Interactions

#### District Click Flow:
1. User clicks district on map
2. `onDistrictClick` fires → `useUiStore.openRightPanel({ title: districtName, content: '...' })`
3. Stats panel (bottom-left overlay) updates with district summary
4. Double-click → navigate to `/maps/districts/:districtId`

#### Layer Toggle Flow:
1. User checks/unchecks layer in LayerControl
2. State tracked via local state or filterStore
3. Corresponding layer shows/hides

---

### Step 15 — Test All 4 States on Every Data View

Every data-dependent component/view must handle:
- **Loading:** Show skeleton matching the layout
- **Empty:** Appropriate message with action
- **Error:** Error card with retry
- **Populated:** Full data display

---

## 4. File Manifest

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `src/main.tsx` | Add `import 'leaflet/dist/leaflet.css'` |
| CREATE | `public/data/karnataka-districts.geojson` | 31 district boundaries |
| CREATE | `src/mocks/hotspots.json` | 15+ hotspot clusters |
| CREATE | `src/mocks/red-zones.json` | 5+ red-zone districts |
| CREATE | `src/mocks/district-stats.json` | Per-district full stats |
| CREATE | `src/mocks/predictive-zones.json` | 3+ predictive zones |
| MODIFY | `src/shared/api/mock/handlers.ts` | Add map handlers |
| MODIFY | `src/shared/api/dto-adapters/maps.ts` | Full adapter with types |
| CREATE | `src/features/maps/api/mapsApi.ts` | Map API functions |
| CREATE | `src/features/maps/hooks/useHotspots.ts` | Hook |
| CREATE | `src/features/maps/hooks/useRedZones.ts` | Hook |
| CREATE | `src/features/maps/hooks/useDistrictStats.ts` | Hook |
| CREATE | `src/features/maps/hooks/usePredictiveZones.ts` | Hook |
| CREATE | `src/features/maps/hooks/useMapFilters.ts` | Filter hook |
| CREATE | `src/features/maps/components/KarnatakaMap.tsx` | Base map component |
| CREATE | `src/features/maps/components/DistrictLayer.tsx` | District polygons |
| CREATE | `src/features/maps/components/CrimePinLayer.tsx` | Crime markers |
| CREATE | `src/features/maps/components/HotspotLayer.tsx` | Hotspot circles |
| CREATE | `src/features/maps/components/RedZoneLayer.tsx` | Pulsing red zones |
| CREATE | `src/features/maps/components/PredictiveRiskLayer.tsx` | Risk overlay |
| CREATE | `src/features/maps/components/LayerControl.tsx` | Toggle UI |
| CREATE | `src/features/maps/components/MapLegend.tsx` | Color legend |
| REWRITE | `src/pages/maps/MapsOverviewPage.tsx` | Main interactive map |
| REWRITE | `src/pages/maps/DistrictMapPage.tsx` | District drill-down |
| MODIFY | `src/router/routes.tsx` | Route param change if needed |

---

## 5. Leaflet Implementation Notes

### Dark Tile Setup
```typescript
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Tooltip } from 'react-leaflet';

<TileLayer
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
/>
```

### GeoJSON Styling
```typescript
const districtStyle = (feature: any) => ({
  fillColor: getColorByDensity(feature.properties.crimeDensity),
  weight: 1,
  opacity: 0.8,
  color: '#ffffff',
  fillOpacity: 0.4,
});

const onEachDistrict = (feature: any, layer: L.GeoJSON) => {
  layer.on({
    click: () => onDistrictClick?.(feature.properties.id),
    mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7 }); },
    mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.4 }); },
  });
  layer.bindTooltip(`${feature.properties.name}<br/>Density: ${feature.properties.crimeDensity}`);
};
```

### CircleMarker for Crime Pins
```typescript
<CircleMarker center={[lat, lng]} radius={8} pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8 }}>
  <Popup>Crime details...</Popup>
</CircleMarker>
```

---

## 6. Verification Checklist

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Karnataka map renders with district boundaries visible
- [ ] District polygons colored by crime density
- [ ] Click district → right panel opens with district info
- [ ] Double-click district → navigates to drill-down page
- [ ] Crime pins appear on map, colored by type
- [ ] Hotspot circles appear with tooltip on hover
- [ ] Red-zone districts pulse with animation
- [ ] Layer control toggles layers on/off
- [ ] Map legend shows color meanings
- [ ] District drill-down page shows crime breakdown, trend, socio-economic data
- [ ] All map pages have loading, empty, error, populated states
- [ ] Mock mode works — no backend dependency
- [ ] No frozen files modified
- [ ] No shared components duplicated

---

## 7. Report Format

```
## Phase 4 Complete — Report

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

### Ready for Phase 5
YES / NO
```

---

**Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.**
