# ULTRON — Frontend Prompt for v0.dev (v0.app)

## Project Overview
ULTRON is an AI-Driven Crime Analytics Platform for the Karnataka State Police SCRB Datathon 2026. This is a **single dynamic page** React app with an immersive radial navigation interface, anime.js transitions, a Flowsint-style drag-drop graph editor, and dummy data in real SCRB CSV format.

## Tech Stack
- React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- `anime.js` for all animations (page transitions, ring nav, hover effects)
- `leaflet` + `react-leaflet` for Karnataka maps with district boundaries
- `cytoscape` for criminal network graphs
- `@xyflow/react` (React Flow) for the Flowsint-style Intel Graph node editor
- `recharts` for charts
- `lucide-react` for icons
- `zustand` for state management
- `papaparse` for CSV parsing (dummy data from `public/data/`)

## Layout Structure (Single Page)

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER 1 — KSP Branding Bar (#0a0e1a, gold borders)       │
│  [KSP Logo]  |  CM Photo + "Chief Minister"  |  Dy CM      │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  HEADER 2 — Section Nav (#111827, anime.js animated)        │
│  Dashboard | Maps | Network | Intelligence | Admin           │
│  ──── active underline slides with anime.js                  │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  CENTER — 4-Ring Radial Navigation SVG                      │
│  (4 concentric colored ring segments)                        │
│  Gold(#f0b000) | Teal(#20a080) | Purple(#800060) | Red(#c02040) │
│  Click a ring → anime.js full-page transition                │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  PAGES LOAD HERE (anime.js transition between them)          │
│  Dashboard → Maps → Network → Intelligence → Admin          │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  INTEL GRAPH (bottom section, full width)                    │
│  Flowsint-style React Flow editor with 7 node types          │
└──────────────────────────────────────────────────────────────┘
```

---

## HEADER 1 — KSP Branding Bar

**Background:** `#0a0e1a` (very dark navy)  
**Height:** ~64px  
**Border-bottom:** 1px solid `#f0b000` (gold accent)

Layout (flex, space-between):
- **Left:** Karnataka State Police logo (SVG or text "KARNATAKA STATE POLICE" in gold, small font)
- **Center:** Two circular photo frames (40px) with name labels:
  - CM Photo + "Chief Minister" below in gold text
  - Deputy CM Photo + "Deputy Chief Minister" below in gold text
- **Right:** ULTRON branding text or small emblem

---

## HEADER 2 — Section Navigation

**Background:** `#111827`  
**Height:** ~44px  
**Padding:** 0 24px

5 nav items as text buttons:
- Dashboard | Maps | Network | Intelligence | Admin

**Anime.js behavior:**
- On load: nav items fade in sequentially (stagger: 80ms)
- On hover: a gold underline line slides from current position to hovered item's center (anime.js `translateX` tween)
- On click: underline locks to active item with a smooth spring animation
- Colors: Text is `#94a3b8`, active is `#f1f5f9`, active underline is `#f0b000`

---

## 4-Ring Radial Navigation (CENTRAL INTERFACE)

This is the **main landing view** — shown when no page section is active yet. Inspired by centre.jpeg reference image.

### SVG Structure
A circular SVG with 4 concentric ring bands, each divided into segments by angle:

```
Outer Ring (r=175-200px): Gold segment (0°-50° + 300°-360°), Teal (50°-130°), Purple (130°-240°), Red (240°-300°)
Ring 2 (r=140-175px): Same angular segments, slightly darker/more saturated version of each color
Ring 3 (r=60-100px): Scattered accent elements in matching segment colors
Center (r=0-60px): Deep red core (#c6010a) with concentric band rings
```

### Colors by Segment
| Segment | Angle Range | Color | Page Destination |
|---|---|---|---|
| Gold/Amber | 0°—50° + 300°—360° (top arc) | `#f0b000` | **Dashboard** |
| Green/Teal | 50°—130° (right arc) | `#20a080` | **Maps** |
| Purple/Magenta | 130°—240° (bottom arc) | `#800060` | **Network** |
| Red/Pink | 240°—300° (left arc) | `#c02040` | **Intelligence** |

### Interaction & Animation
1. **On page load:** Radial navigation zooms in from center (anime.js: scale 0 → 1, 0.6s easeOutExpo). Rings appear sequentially with a stagger delay.
2. **Hover on a segment:** That segment brightens (opacity from 0.8 → 1.0), subtle scale pulse (1.0 → 1.05)
3. **Click a segment:**
   - anime.js transition: current view scales down and fades (0.4s)
   - Target page content slides in from bottom (translateY 40px → 0, opacity 0 → 1, 0.5s easeOutExpo)
   - Section nav underline updates to active section
4. **White annular gaps** separate the ring bands (r=100-140px between Ring 2 and Ring 3)

### Bottom Arc Label
The top arc (Gold segment) should contain a subtle title text read from the image — likely "CENTRE" or "ULTRON" in small white/semi-transparent text along the arc curve.

### Static Reference
Reference image at `centre.jpeg` shows this exact layout. Reproduce the SVG circle with 4 colored segments exactly as described above.

---

## PAGES (Accessed via Ring Click + Section Nav)

### Dashboard Page
- **KPI Row:** 4 glass-effect cards (Total Crimes, Solved %, Active Cases, Cyber Incidents) with Lucide icons and anime.js count-up animation on load
- **Monthly Trend Chart:** Recharts area chart — 12 months, gradient fill (gold to transparent)
- **Crime Type Distribution:** Recharts horizontal bar chart
- **District Comparison:** Bar chart with top-10 districts
- **Recent Feed:** Scrollable list with severity dots, time ago, district tags
- All transitions use anime.js

### Maps Page
- **Full-screen Leaflet map** of Karnataka with district boundary polygons
- Crime pins colored by type (red=violent, orange=property, blue=cyber, purple=women/child, gray=other)
- Click district → popup with stats (name, total crimes, top crime type, trend)
- Layer toggles: "Crime Pins" | "Heatmap" | "Districts" | "Clear"
- Search input for FIR/location/criminal name
- **Data loaded from CSV:** `public/data/crime_records.csv` parsed by papaparse

### Network Page
- **Cytoscape.js graph** — full screen below header
- Nodes: Criminal (red circle, sized by crime count), Victim (blue diamond), Location (green hexagon), Crime (orange square)
- Edges labeled by relationship type
- Controls: search, filter by crime type, timeline slider, layout selector
- Click node → detail popup with connection highlights

### Intelligence Page
- **Predictive Zone Map:** Small Leaflet map with risk overlay (green→red gradient)
- **Socio-Economic Charts:** Scatter plot (crime rate vs literacy/poverty)
- **Emerging Trends:** Top-5 fastest rising crime types with % change
- **MO Match Alerts:** Cards showing matched MO patterns
- **Red-Zone Districts:** Table with severity and trend
- **Intelligence Briefs:** Auto-generated summary cards

### Admin Page
- Users table with roles
- Role editor dropdown
- System status panel (API health, DB, ML models)
- Activity log

---

## Intel Graph Page (Flowsint-style Node Editor)

**Location:** Bottom section of the app, accessed via login or a dedicated sub-nav button.  
**Layout:** Full-width React Flow canvas with left-side node palette.

### Node Palette (Left Sidebar, ~220px)
7 pre-defined node types, each with a distinct color and icon from Lucide:

| Node Type | Color | Icon | Description |
|---|---|---|---|
| `[IP]` | Cyan `#06b6d4` | `globe` | IP address node |
| `[Name]` | Red `#ef4444` | `user` | Person name node |
| `[Place]` | Green `#22c55e` | `map-pin` | Location node |
| `[Object]` | Orange `#f97316` | `package` | Evidence/object node |
| `[How]` | Purple `#a855f7` | `zap` | Method node |
| `[Why]` | Pink `#ec4899` | `help-circle` | Motive node |
| `[What]` | Yellow `#eab308` | `alert-triangle` | Crime type node |

### Canvas (Center, Dark Background)
- Background: `#0a0e1a` with dot grid pattern
- Drag nodes from palette onto canvas
- Connect nodes by dragging from output handle to input handle
- Nodes have colored borders matching their type
- Group select, pan, zoom (all React Flow built-in)

### Node Detail Panel (Right Side, Slides Open on Click)
When a node is clicked, a right panel slides in (anime.js, 0.3s easeOutExpo) showing:
- Node type badge with color
- Editable form fields depending on type:
  - IP → address, ISP, geolocation, timestamp
  - Name → full name, alias, DOB, ID proof number
  - Place → address, lat/lng coordinates, type dropdown (residence/crime scene/meeting point)
  - Object → description, seized from (text input), case reference number
  - How → method description, tools used (tags input), steps
  - Why → motive category dropdown, trigger description, background notes
  - What → crime category dropdown, FIR number, date, status
- Save button (stores node data in Zustand)
- Delete node button

### Action Bar (Top of Graph Canvas)
- **Save Graph** — exports current node+edge state as JSON
- **Export JSON** — downloads graph as `.json` file
- **Clear Canvas** — confirmation dialog then clears all nodes
- **Load Template** — loads a pre-built sample investigation graph

### Bottom Bar
- Auto-generated report preview — text summary that updates as nodes connect (e.g., "IP 192.168.1.1 → connected to Suspect Name → via Phishing Method")
- Node count / edge count display

### User Flow
1. User clicks "Login" or "Graph" → Intel Graph page slides in
2. User drags an IP node from palette to canvas
3. User drags a Name node, connects IP → Name
4. Right panel shows editable fields for the selected node
5. User fills in details, saves
6. Adds Place, Object, How, Why, What nodes and connects them
7. Exports the completed investigation graph as JSON
8. The graph persists in Zustand store

---

## DUMMY DATA (v0.dev — No API Required)

All data comes from CSV files in `public/data/`, parsed by `papaparse` on app load and stored in Zustand.

### `public/data/crime_records.csv` (500+ records)
```
FIR_No,District,UnitName,Crime_Head,Date,Time,Latitude,Longitude,Status,Criminal_Name,Victim_Name,MO_Description
KSP/2025/001,Bengaluru City,Halasuru Gate,Murder,2025-01-15,22:30,12.9716,77.5946,Under Investigation,Ravi Kumar,Prakash Singh,Stabbing with knife during robbery
KSP/2025/002,Bengaluru Rural,Yelahanka,Theft,2025-01-16,14:15,13.1007,77.5963,Resolved,Venkatesh,M/S Gupta Stores,Breaking and entering at night
...
```

### `public/data/criminals.csv` (200+ records)
```
Criminal_ID,Name,Alias,DOB,Gender,Address,District,Crime_Count,Risk_Score
CR-001,Ravi Kumar,Ravi,1990-05-12,Male,123 MG Road,Bengaluru City,5,85
CR-002,Venkatesh,Venky,1985-11-03,Male,456 Whitefield,Bengaluru Rural,3,62
...
```

### `public/data/cyber_incidents.csv` (200+ records)
```
Case_No,Incident_Type,Date,Source_IP,Target_Domain,Victim,Status,Geo_City,Geo_Country
CYB/2025/001,Phishing,2025-02-01,192.168.1.100,bank-secure-login.com,Anil Kumar,Open,Bengaluru,India
CYB/2025/002,Hacking,2025-02-03,10.0.0.50,corpdata.in,PQRS Corp,Investigating,Mumbai,India
...
```

### `public/data/districts.csv` (40 districts)
```
District_Name,Crime_Rate,Literacy_Rate,Poverty_Index,Population_Density,Police_Stations
Bengaluru City,1250.5,91.2,8.3,12000,85
Mysuru,780.3,82.5,12.1,4500,42
...
```

### Data Loading Pattern
```typescript
// hooks/useCSVData.ts
import Papa from 'papaparse';
import { useCrimeStore } from '@/stores/crimeStore';

export function useLoadCSVData() {
  useEffect(() => {
    const crimes = Papa.parse('/data/crime_records.csv', { header: true }).data;
    const criminals = Papa.parse('/data/criminals.csv', { header: true }).data;
    const cyber = Papa.parse('/data/cyber_incidents.csv', { header: true }).data;
    const districts = Papa.parse('/data/districts.csv', { header: true }).data;
    
    useCrimeStore.setState({ crimes, criminals, cyber, districts, loaded: true });
  }, []);
}
```

---

## ZUSTAND STORES

```typescript
// stores/authStore.ts
interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; role: 'Admin' | 'Sudo' | 'User' } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}

// stores/navStore.ts  
interface NavState {
  activeSection: 'dashboard' | 'maps' | 'network' | 'intelligence' | 'admin' | null;
  showRadialNav: boolean;
  setActiveSection: (section: string) => void;
}

// stores/crimeStore.ts
interface CrimeState {
  crimes: CrimeRecord[];
  criminals: CriminalRecord[];
  cyber: CyberRecord[];
  districts: DistrictRecord[];
  loaded: boolean;
}

// stores/graphStore.ts
interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  addNode: (type: string, position: XYPosition) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: any) => void;
  onConnect: (connection: Connection) => void;
  exportGraph: () => string;
  clearGraph: () => void;
  loadTemplate: () => void;
}
```

---

## ANIMATION SPEC (Anime.js)

All animations use `anime.js` library loaded via npm:

### Page Transitions
```javascript
// Leaving current section
anime({
  targets: '.page-content',
  opacity: [1, 0],
  translateY: [0, -40],
  duration: 400,
  easing: 'easeOutExpo'
});

// Entering new section  
anime({
  targets: '.page-content',
  opacity: [0, 1],
  translateY: [40, 0],
  duration: 500,
  easing: 'easeOutExpo'
});
```

### Radial Nav Entrance
```javascript
anime({
  targets: '.radial-ring',
  scale: [0, 1],
  opacity: [0, 1],
  delay: anime.stagger(120), // each ring appears sequentially
  duration: 600,
  easing: 'easeOutExpo'
});
```

### Section Nav Underline
```javascript
// On nav item click:
anime({
  targets: '.nav-underline',
  translateX: targetPosition, // calculated from active item's offsetLeft
  duration: 400,
  easing: 'easeInOutSine'
});
```

### KPI Count-Up
```javascript
anime({
  targets: '.kpi-number',
  innerHTML: [0, finalValue],
  round: 1,
  duration: 2000,
  easing: 'easeOutCubic'
});
```

---

## COLOR PALETTE (Dark Theme)

| Token | Hex | Usage |
|---|---|---|
| Background | `#0a0e1a` | Page body |
| Surface | `#111827` | Cards, panels |
| Elevated | `#1a1a24` | Hover states, elevated cards |
| Border | `#2a2a3a` | Borders, dividers |
| Gold | `#f0b000` | Primary accent, active states, radial Gold segment |
| Teal | `#20a080` | Maps accent, radial Teal segment |
| Purple | `#800060` | Network accent, radial Purple segment |
| Red | `#c02040` | Alerts, radial Red segment |
| Text Primary | `#f1f5f9` | Main text |
| Text Secondary | `#94a3b8` | Secondary text |
| Text Muted | `#64748b` | Muted text, placeholders |

---

## VISUAL DESIGN PRINCIPLES

1. **Dark theme throughout** — no light mode
2. **Glassmorphism** on cards: `background: rgba(17, 24, 39, 0.8)`, `backdrop-filter: blur(12px)`
3. **Subtle gold accents** on active/hover states (borders, underlines, highlights)
4. **4px spacing grid** — consistent margins/padding
5. **8px border-radius** on cards, **6px** on buttons, **4px** on inputs
6. **Inter font** for UI, **JetBrains Mono** for technical data (IPs, domain, code)
7. **Loading skeletons** for data-dependent content (shimmer animation)
8. **Smooth 150-200ms transitions** on all interactive elements
9. **Sonner toasts** for actions (success green, error red)

## DELIVERABLES

Generate a fully functional React 19 + TypeScript + Vite + Tailwind v4 single-page application with:

1. KSP Branding Bar (logo + CM + Dy CM)
2. Section Nav with anime.js animated underline
3. 4-Ring Radial Navigation SVG (Gold/Teal/Purple/Red segments, anime.js entrance + click transitions)
4. Dashboard, Maps, Network, Intelligence, Admin pages with full-page anime.js transitions
5. Flowsint-style Intel Graph page with React Flow — 7 node types, drag-drop, connect, edit, export
6. Dummy SCRB CSV data in `public/data/` parsed by papaparse
7. All maps (Leaflet), graphs (Cytoscape), charts (Recharts) functional with CSV data
8. Zustand stores for all state
9. Dark theme with specified color palette
10. No external API dependencies — fully self-contained with CSV data
