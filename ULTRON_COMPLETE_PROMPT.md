# 🚀 ULTRON — COMPLETE PROMPT (All 3 Prompts Synced)
# Unified Law Enforcement Threat Response & Optimization Nexus

> **Feed this ENTIRE prompt to Google AI Studio (Gemini 2.5 Pro) to generate the COMPLETE ULTRON frontend.**
> **Stack:** React 19 + TypeScript + Tailwind CSS 4 + Vite + Three.js/React Three Fiber + framer-motion
> **Aesthetic:** Sci-fi command center meets military intelligence HQ — *Minority Report × Batman's Arkham × animejs.com × Spider-Verse*

---

## PROMPT ORIGIN
This is a **verified merge** of 3 source prompts with all 10 naming/consistency conflicts resolved:
- **ULTIMATE_PROMPT.md** → 50+ page scaffold, design tokens, 3D heatmap spec, glass morphism system
- **3D_KARNATAKA_WHEEL_ANIMATIONS.md** → 3D Karnataka GeoJSON map, 4-ring Radial Navigation Wheel, 12 animejs-style animations
- **ANIME_STYLE_SCROLL_ANIMATIONS.md** → animejs.com section-by-section scroll loading, 13 features mapped to framer-motion

### Conflict Resolutions Applied
| # | Conflict | Chosen Resolution |
|---|----------|-------------------|
| 1 | `KarnatakaMap3D.tsx` vs `Karnataka3DMap.tsx` | **`Karnataka3DMap.tsx`** |
| 2 | `DistrictMesh.tsx` vs `DistrictMesh3D.tsx` | **`DistrictMesh3D.tsx`** |
| 3 | Crime thresholds `>75/50` vs `>80/55/25` | **`>80 red, >55 orange, >25 amber, <=25 green`** |
| 4 | Elevation (linear multiplier vs tiered per-color) | **Tiered per-color approach** |
| 5 | Stagger component name | **Both: `StaggerGrid` (grid-origin) + `StaggerContainer` (directional list)** |
| 6 | Scroll system | **`ScrollSections` as primary Command Center scroll + `ScrollReveal` as simple wrapper for regular pages** |
| 7 | Animation constants location | **Extract SPRINGS/EASINGS to `shared/constants/animations.ts`** |
| 8 | File structure | **ULTIMATE's directory structure as canonical reference** |
| 9 | GeoJSON utility | **`utils/geoTo3d.ts` for coord projection** |
| 10 | Particle background name | **`ParticleNetwork.tsx`** |

---

## YOUR TASK

Generate a **complete, production-ready React 19 + TypeScript + Tailwind CSS 4 + Vite** frontend for **ULTRON** — an AI-powered crime analytics platform for the **Karnataka State Police (SCRB)** for **Datathon 2026**.

### The app MUST have:
- **3D Karnataka heatmap** (React Three Fiber) with extruded districts, glow, pulse, particle columns, red zone rings
- **50+ pages** across Crime Track, Cyber Track, Maps, Network, Intel, Admin — all functional
- **Glass morphism** everywhere — every card, panel, modal
- **Particle network background** (HTML Canvas, not Three.js) with connection lines
- **animejs.com-style scroll loading** — Command Center homepage loads sections one by one
- **All 13 animejs.com features mapped to framer-motion** (scroll observer, stagger, SVG morph, motion path, line drawing, draggable, timeline, responsive, text split, scrambleText, springs, keyframes, individual transforms)
- **4-ring Radial Navigation Wheel** (SVG) with hover glow + click navigation
- **Zero light mode** — dark futuristic command center ONLY
- **Working mock data** — no backend required, runs with `npm install && npm run dev`

---

## BRAND IDENTITY & DESIGN TOKENS

### Color System
```css
/* ─── BACKGROUNDS ─── */
--bg-deep:       #03050a;     /* Deepest background */
--bg-primary:    #070b12;     /* Page background */
--bg-secondary:  #0c1320;     /* Section backgrounds */
--bg-surface:    #111b2e;     /* Cards, panels */
--bg-elevated:   #172240;     /* Modals, dropdowns */
--bg-glass:      rgba(17, 27, 46, 0.78);  /* Glass morphism */

/* ─── KSP GOLD - Primary Brand ─── */
--gold:          #f6c453;     /* Primary gold */
--gold-bright:   #ffd966;     /* Hover/bright gold */
--gold-dim:      #c49b2e;     /* Muted gold */
--gold-glow:     rgba(246, 196, 83, 0.30);
--gold-subtle:   rgba(246, 196, 83, 0.10);

/* ─── CRIME TRACK - Red Zone System ─── */
--red-critical:  #ff1744;     /* Critical alert */
--red-high:      #ff5252;     /* High alert */
--red-pulse:     rgba(255, 23, 68, 0.50);
--red-glow:      rgba(255, 23, 68, 0.20);

/* ─── THREAT LEVELS ─── */
--danger:        #ff1744;     /* Critical */
--warning:       #ff9100;     /* High */
--caution:       #ffd600;     /* Medium */
--safe:          #00e676;     /* Low/Safe */

/* ─── CYBER TRACK - Neon Cyberpunk ─── */
--cyan:          #00e5ff;     /* Primary cyber */
--cyan-glow:     rgba(0, 229, 255, 0.25);
--teal:          #1de9b6;     /* Safe cyber */
--magenta:       #e040fb;     /* Attack detected */

/* ─── INTEL TRACK ─── */
--violet:        #7c4dff;     /* Intelligence primary */
--lavender:      #b388ff;     /* Soft intel */
--purple-glow:   rgba(124, 77, 255, 0.20);

/* ─── TEXT ─── */
--text-primary:  #ebf0f7;
--text-secondary:#94a3b8;
--text-muted:    #64748b;
--text-gold:     #f6c453;

/* ─── BORDERS ─── */
--border-subtle:  rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong:  rgba(255, 255, 255, 0.18);
--border-gold:    rgba(246, 196, 83, 0.25);
```

### Typography
```css
--font-display: 'Space Grotesk', sans-serif;   /* All headings, H1-H4 */
--font-body:    'Inter', sans-serif;            /* Body text, labels */
--font-mono:    'JetBrains Mono', monospace;    /* Data, IPs, codes, timestamps */
--font-kannada: 'Noto Sans Kannada', sans-serif;/* Kannada text fallback */
```

### Glass Card Recipe (USE FOR ALL CARDS)
```tsx
<div className="
  relative
  bg-gradient-to-br from-[rgba(17,27,46,0.80)] to-[rgba(7,11,18,0.60)]
  backdrop-blur-xl saturate-[1.5]
  border border-[rgba(255,255,255,0.06)]
  shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
  rounded-xl
  transition-all duration-300
  hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]
  hover:border-[rgba(255,255,255,0.12)]
  hover:-translate-y-0.5
">
```

### Animation Philosophy
- **Every entrance:** stagger, fade-up, scale-in with framer-motion
- **Every hover:** lift + glow border + shadow intensify
- **Every click:** scale bounce (0.98 → 1.0)
- **Every number:** count-up animation with requestAnimationFrame
- **Every chart:** draw-on-mount with path animation (isAnimationActive)
- **Every page:** 3D transition between routes (scale + rotateY + blur)
- **Every data change:** old fades out → new slides up with green flash
- **Duration:** fast = 150ms, base = 250ms, slow = 400ms, stagger = 80ms

---

## ═══════════════════════════════════════════════════════════════
## SPRING & EASING CONSTANTS (Used everywhere — file: shared/constants/animations.ts)
## ═══════════════════════════════════════════════════════════════

```typescript
// SPRING PRESETS — mapped from animejs createSpring()
export const SPRINGS = {
  bouncy:  { type: 'spring' as const, stiffness: 300, damping: 15, mass: 0.8 },
  smooth:  { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 },
  snappy:  { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },
  wobbly:  { type: 'spring' as const, stiffness: 180, damping: 8, mass: 1.2 },
  heavy:   { type: 'spring' as const, stiffness: 200, damping: 25, mass: 2 },
};

// EASING PRESETS — mapped from animejs
export const EASINGS = {
  linear:        [0, 0, 1, 1] as [number, number, number, number],
  easeInQuad:    [0.55, 0.085, 0.68, 0.53] as [number, number, number, number],
  easeOutQuad:   [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955] as [number, number, number, number],
  ultraSmooth:   [0.87, 0, 0.13, 1] as [number, number, number, number],    // animejs easeInOutExpo
  dramatic:      [0.785, 0.135, 0.15, 0.86] as [number, number, number, number], // easeInOutCirc
  bouncy:        [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], // easeOutBack
};
```

---

## ═══════════════════════════════════════════════════════════════
## 🏆 THE CROWN JEWEL — 3D KARNATAKA HEATMAP (React Three Fiber)
## ═══════════════════════════════════════════════════════════════

This is the **most important component** in the entire app. It appears on the Command Center homepage as the HERO section.

### File: `features/command-center/Karnataka3DMap.tsx`
Libraries: `@react-three/fiber`, `@react-three/drei`, `three`, `geojson`

### Data Source
Create `public/data/karnataka-districts.geojson` with all 31 districts of Karnataka. Each feature has:
```json
{
  "type": "Feature",
  "properties": {
    "id": "bengaluru-urban",
    "name": "Bengaluru Urban",
    "nameKn": "ಬೆಂಗಳೂರು ನಗರ",
    "adminCenter": "Bengaluru",
    "area_km2": 2196,
    "population": 9620000,
    "policeStations": 85,
    "crimeDensity": 87,
    "trend": "rising",
    "isRedZone": true,
    "severityScore": 72
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[77.3, 12.8], [77.4, 12.9], ...]]
  }
}
```
Karnataka span: longitude 74.0°E to 78.5°E, latitude 11.5°N to 18.5°N. Use real-ish polygon coordinates.

### GeoJSON to 3D Utility — `utils/geoTo3d.ts`
```typescript
// Convert GeoJSON [lng, lat] → Three.js world coordinates
const CENTER_LNG = 76.0;
const CENTER_LAT = 15.0;
const SCALE = 0.45;  // 1 degree ≈ 0.45 units

export function geoTo3d(lng: number, lat: number): [number, number, number] {
  return [(lng - CENTER_LNG) * SCALE, 0, (lat - CENTER_LAT) * SCALE];
}
```

### District Mesh — `features/command-center/components/DistrictMesh3D.tsx`
- Uses `THREE.ExtrudeGeometry` from polygon coordinates (converted via geoTo3d)
- Elevation = depth of extrusion
- Accepts: `feature`, `elevation`, `color`, `emissiveIntensity`, `isHovered`, `isSelected`
- Animates hover/select with useFrame: rises 0.15 on hover, 0.3 on select
- Pulse glow on hover via emissiveIntensity * (1 + sin(time * 3) * 0.15)

### COLOR MAPPING — CRITICAL (USE THESE EXACT THRESHOLDS)
```typescript
function getColorAndElevation(density: number, isRedZone: boolean) {
  if (isRedZone || density > 80) return { color: '#ff1744', elevation: 0.4 + (density / 100) * 1.6 };
  if (density > 55) return { color: '#ff9100', elevation: 0.3 + (density / 100) * 1.2 };
  if (density > 25) return { color: '#ffd600', elevation: 0.2 + (density / 100) * 1.0 };
  return { color: '#00e676', elevation: 0.1 + (density / 100) * 0.8 };
}
// emissiveIntensity = 0.1 + (density / 100) * 0.4
```

### Visual Effects ON TOP of the 3D Map

**1. HotspotColumn** — Particle column rising from each hotspot district. Particles float upward in column formation, color matches crime type (violent=red, cyber=cyan, property=amber).

**2. PulsingRing** — Expanding/contracting ring around red-zone districts. Uses useFrame: scale oscillates 0.8×-1.2×, opacity 0.2-0.5. Sits flat on ground plane.

**3. DistrictBorder** — Animated dashed border along district boundaries. DashOffset animates with useFrame for flow effect. On hover: turns gold and thickens.

**4. Ground Grid** — Holographic circular grid under the map: `gridHelper args={[14, 28, '#00e5ff', '#1a237e']}`.

**5. AmbientParticles** — 400 floating particles around the scene with connection lines. Colors mix of violet, gold, cyan.

**6. Mouse Interaction** — Camera auto-orbits at 0.5 speed. Drag = manual orbit (sticky). Scroll = zoom. Click district = smooth camera zoom + DistrictDetailPanel.

### 3D Scene Composition
- Canvas camera: `position: [0, 5, 10], fov: 40`
- Atmosphere: fog `['#05070a', 8, 18]`, hemisphereLight `['#1a237e', '#05070a', 0.5]`
- OrbitControls: `maxPolarAngle: PI/2.5, minDistance: 4, maxDistance: 16, autoRotate: true, autoRotateSpeed: 0.5`
- SetClearColor: `'#05070a'`

### District Detail Panel (Opens on Click)
Slides in from LEFT, 380px wide, glass morphism. Shows: district name, risk level badge, trend, stats (cases, severity, alerts, police stations), top crime types bar chart, 7-day trend chart, "View Full Report" button.

---

## ═══════════════════════════════════════════════════════════════
## 2️⃣ THE 4-RING RADIAL NAVIGATION WHEEL
## ═══════════════════════════════════════════════════════════════

### File: `features/radial-wheel/RadialNavigationWheel.tsx`

A **circular SVG navigation menu** split into 4 colored segments (Crime, Cyber, Intel, Maps). Iron Man holographic × Spider-Verse dimension wheel.

### Segment Configuration
```typescript
const SEGMENTS = [
  { id: 'crime', label: 'CRIME',   color: '#ff1744', path: '/crime',  angle: -45, stats: { primary: '12,847', label: 'Total Cases', trend: '+5.2%' } },
  { id: 'cyber', label: 'CYBER',   color: '#00e5ff', path: '/cyber',  angle: 45,  stats: { primary: '1,247',  label: 'Incidents',  trend: '+12.8%' } },
  { id: 'intel', label: 'INTEL',   color: '#7c4dff', path: '/intel',  angle: 135, stats: { primary: '23',     label: 'Active Intel', trend: '-3.1%' } },
  { id: 'maps',  label: 'MAPS',    color: '#00e676', path: '/maps',   angle: 225, stats: { primary: '6',      label: 'Layers Active', trend: '—' } },
];
```

### Features
- SVG arc segments drawn with `describeArc()` path calculator
- Outer radius 180px, inner radius 80px, center hub 45px
- Auto-rotates slowly when idle (0.5 deg per 50ms)
- Hover: segment expands (1.04×), glows (SVG filter), shows detailed stats
- Click: `navigate(seg.path)`
- Center hub: KSP/ULTRON logo with breathing animation
- Tick marks on outer ring (8 ticks)
- Mini version for sticky scroll (120px, thin arcs)

---

## ═══════════════════════════════════════════════════════════════
## 3️⃣ ANIMEJS-STYLE SCROLL SECTION LOADING (Command Center)
## ═══════════════════════════════════════════════════════════════

### File: `shared/components/ScrollSections.tsx`

The Command Center homepage uses section-by-section loading like animejs.com.

### Core Components

**ScrollSections** — Main wrapper that maps through sections, renders progress bar + section dots + SectionViews. Uses `useScroll` with `offset: ['start start', 'end end']`.

**SectionView** — Individual section with `useInView` + `useAnimation` for timed entrance sequence:
```
0ms → Background fades in
200ms → Section number slides in (01/02/03)
300ms → Title drops down with blur dissolve
450ms → Subtitle fades in
600ms → Main content with staggered children
```

Each section has: `id`, `bgGradient`, `title`, `subtitle`, `content` (ReactNode). Progress dots on right side track current section.

**ScrollReveal** — Simple wrapper for regular pages (non-Command Center). Each element animates when scrolled into view. Props: `delay`, `direction` (up/down/left/right/none), `distance`, `duration`, `once`.

---

## ═══════════════════════════════════════════════════════════════
## 4️⃣ ALL 13 ANIMEJS FEATURES MAPPED TO FRAMER-MOTION
## ═══════════════════════════════════════════════════════════════

### 1. Scroll Observer → `useScroll` + `useTransform` + `useInView`
- `ScrollDrivenAnimation` — animation progress synced to scroll position
- `useInView` for enter/leave callbacks

### 2. Stagger → `staggerChildren` in variants
- **StaggerGrid**: Grid-based stagger with configurable origin (center/top-left/top-right/bottom-left/bottom-right/random). Used for KPI cards grid.
- **StaggerContainer**: Directional list stagger (up/down/left/right/fade). Used for section content.

### 3. SVG Morph → `AnimatePresence` + `motion.path` `d` prop
- `MorphingCrimeIcon` cycles through 3 shapes (shield, target, alert triangle)
- `MorphingIcon` cycles through 5 shapes (shield, hexagon, circle, triangle, diamond)

### 4. Motion Path → `offsetPath` + `offsetDistance` CSS
- `CrimeMotionPath` — circle moving along SVG path with glowing trail

### 5. Line Drawing → `pathLength` animation
- `AnimatedKarnatakaOutline` — SVG outline of Karnataka draws itself on scroll

### 6. Draggable → framer `drag` prop + spring physics
- `DraggableIntelCard` — card that can be dragged, snaps back with spring
- `dragElastic={0.7}`, `whileDrag={{ scale: 1.05 }}`

### 7. Timeline → `useAnimation` + async sequence
- `CommandCenterEntrance` — orchestrates bg → title → subtitle → kpis → chart → glow sequence

### 8. Responsive → `useMediaQuery` hook + Tailwind classes
- `useAnimationMedia` returns `{ isMobile, isTablet, prefersReduced, isPortrait }`
- `prefersReducedMotion` disables all animations

### 9. Text Split → Character-level staggered spans
- `AnimatedHeading` — each character wrapped in `motion.span` with staggered entrance
- Uses `rotateX: -90 → 0` for 3D flip effect

### 10. scrambleText → Custom React hook
- `ScrambleText` — characters rapidly scramble before settling on final text
- Configurable `scrambleSpeed` and `revealDuration`
- Shows blinking cursor `_` while scrambling

### 11. Springs → `type: 'spring'` with stiffness/damping/mass
- SPRINGS constant (see above): bouncy, smooth, snappy, wobbly, heavy

### 12. Keyframes → Array values in `animate` prop
- `animate={{ x: [0, 100, -50, 0], opacity: [1, 0.5, 1] }}`

### 13. Individual CSS Transforms → Individual transform props
- framer-motion handles x, y, rotate, scale independently by default

### Bonus: Loading Shield
- `LoadingScreen` — animated KSP shield SVG draws path, progress bar loads, then fades out

---

## ═══════════════════════════════════════════════════════════════
## AMBIENT BACKGROUND EFFECTS (Applied Site-Wide)
## ═══════════════════════════════════════════════════════════════

### Particle Network — `shared/components/ParticleNetwork.tsx`
- HTML Canvas (NOT Three.js — keep it lightweight)
- 120 floating particles, colors: gold/cyan/violet, opacity 0.15-0.35
- Connection lines between particles within 120px distance
- Mouse: nearest particle connects with gold line
- Scan line CRT overlay via CSS pseudo-element

### Scan Line Overlay
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
  pointer-events: none;
  z-index: 9999;
}
```

### Page Transition
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.98, rotateY: 2, filter: 'blur(4px)' }}
  animate={{ opacity: 1, scale: 1, rotateY: 0, filter: 'blur(0)' }}
  exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
/>
```

---

## ═══════════════════════════════════════════════════════════════
## COMMAND CENTER HOMEPAGE (The Masterpiece)
## ═══════════════════════════════════════════════════════════════

### Layout
```
┌─ KSP Command Bar ────────────────────────────────────────────┐
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           3D KARNATAKA MAP (Full hero)                  │ │
│  │           + Radial Wheel overlay (bottom-right)          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │Total │ │Active│ │Alerts│ │Cyber │ │Red   │ │ML    │     │
│  │Crimes│ │Cases │ │Today │ │Inc.  │ │Zones │ │Active│     │
│  │12,847│ │ 843  │ │  47  │ │ 128  │ │  6   │ │8/8   │     │
│  │ -2.3%│ │ +5.1%│ │ +12% │ │ -8%  │ │ ⚠️   │ │ ✅   │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                              │
│  ┌────────────────────┐ ┌────────────────┐ ┌──────────────┐  │
│  │ Crime Trend        │ │ Cyber Threat   │ │ Red Zone     │  │
│  │ (Area Chart)       │ │ (Bar Chart)    │ │ Alerts       │  │
│  └────────────────────┘ └────────────────┘ └──────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ AI Intelligence Brief — 4 rotating cards              │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### SECTIONS (Section-by-section scroll like animejs.com)
1. **Hero** — 3D Karnataka Map + Radial Wheel overlay + title
2. **KPI Dashboard** — 6 KPI cards in StaggerGrid
3. **Crime Trends** — CrimeTrendChart + CrimeTypeChart + AnimatedKarnatakaOutline
4. **Radial Navigation** — Full RadialNavigationWheel
5. **Cyber Threats** — ThreatTimeline + cyber stats
6. **Network Graph** — NetworkGraph

### Entrance Animation
- Hero: map animates in, title drops with blur, radial wheel scales up (0 → 1)
- KPIs: stagger in from bottom (80ms apart) when scrolled into view
- Charts: scroll-triggered fade-up with direction variants
- Each section: number → title → subtitle → content with staggered children

---

## ═══════════════════════════════════════════════════════════════
## SITE-WIDE COMPONENTS
## ═══════════════════════════════════════════════════════════════

### 1. KSP Command Bar (Top Nav)
- Height: 56px, glass morphism, edge-to-edge with gold gradient bottom border
- Left: KSP shield SVG + "ULTRON" + "v2.0" badge
- Center: Search bar (Cmd+K opens Command Palette)
- Right: Notification bell (animated count) + AI button (pulsing cyan) + Avatar
- Nav links: Dashboard, Crime, Cyber, Maps, Network, Intel, Graph, Admin
- Active link: text-gold + glow; underline slides between sections (300ms)

### 2. Command Palette (Cmd+K)
- Modal with backdrop blur
- Fuzzy search: cases, criminals, IPs, domains, pages
- Quick commands: /crime, /cyber, /maps, /intel, /admin
- Keyboard nav: ↑↓ arrows, Enter, Escape
- Recent searches on empty input

### 3. Side Panel (Data Stream)
- 320px right panel toggled by edge button
- Live feed of system events (new cases, alerts, updates)
- Severity color bar on left edge
- New entries slide in from top with flash
- Auto-scroll: newest at top

### 4. Notification System (sonner)
- Position: bottom-right, dark theme
- toast.success (green), toast.error (red + Retry), toast.warning (amber, persistent), toast.info

### 5. Loading States
- Page load: skeleton matching layout
- Table: 5 rows of shimmer
- Chart: pulsing outline
- Card: shimmer sweep
- Data refresh: old dims → spinner → new fades in

### 6. Empty States
- EVERY list/table/graph must have animated empty state
- Cases: magnifying glass + "No cases found"
- Criminals: silhouette + "?"
- Alerts: green shield + "All Clear"
- Search: animated robot

### 7. Error States
- API error: AlertTriangle icon + error message + "Retry" button (red)
- Network offline: fixed top banner "Connection lost — cached data"
- Component crash: ErrorBoundary with reload button

---

## ═══════════════════════════════════════════════════════════════
## PAGE SPECIFICATIONS (All 50+ pages)
## ═══════════════════════════════════════════════════════════════

### DASHBOARD PAGES (3)

**Unified Dashboard** `/dashboard` — 6 KPI cards, Cases Over Time area chart, Cases by Type donut chart, Top Districts bar chart, Recent Cases table (paginated, sortable)

**Alerts** `/dashboard/alerts` — 3 sections (Critical, Warnings, Info), severity bar, timestamp, district, type, action button. Filter by severity/district/type/date. Real-time new alerts slide in with flash.

**Reports** `/dashboard/reports` — Grid of report cards with download (PDF/CSV/PNG). Generate report modal with selectors.

### CRIME TRACK PAGES (9)

**Crime Overview** `/crime` — 4 KPI cards, Donut + Horizontal Bar charts, District table (sortable, searchable, paginated with sparkline trends + severity badges)

**Crime Trends** `/crime/trends` — Large area chart (12 months, toggle types), heatmap calendar (GitHub-style), date range + multi-select filters

**Crime Hotspots** `/crime/hotspots` — Full Leaflet map with DBSCAN clusters, heatmap, red zones, predictive grid, socio-economic overlays. Time slider animation. Cluster panel on click.

**Crime Cases** `/crime/cases` — Table (FIR#, Type, District, Date, Status, Severity), sortable, paginated. Row hover: gold border. Row click: detail page.

**Case Detail** `/crime/cases/:caseId` — Full case profile: victim/accused/evidence cards, Leaflet map of location, case timeline (horizontal with status dots)

**Criminals List** `/crime/criminals` — Table (Name, Age, Type, Risk Score bar, Priors, Status, Last Seen). Risk score animated bar.

**Criminal Detail** `/crime/criminals/:criminalId` — Photo, name, alias, risk gauge. Stats cards (crimes, warrants, connections). Case history timeline. Network graph mini. MO analysis.

**Crime Patterns** `/crime/patterns` — MO cluster analysis, crime type correlation matrix

**Crime Predictive** `/crime/predictive` — Risk forecast charts, "Next 30 days" hotspots, ML confidence scores

### CYBER TRACK PAGES (10)

**Cyber Overview** `/cyber` — 5 KPI cards, Cyber Threat Timeline (horizontal with sized/colored dots), Top Vectors bar chart, Top Targets pie chart, Threat Actor Map

**Cyber Threats** `/cyber/threats` — Table (ID, Type, Severity, Source IP, Target, Date, Status)
**Cyber Case Detail** `/cyber/cases/:caseId` — Full report: type badge, IOCs list (copy), attack path graph (Cytoscape), MITRE ATT&CK mapping

**IP Intelligence** `/cyber/ip/:ip` — Mini 3D Globe, location, ISP, reputation gauge, WHOIS/DNS/Incidents panels, attack path graph

**Domain Intelligence** `/cyber/domain/:domain` — WHOIS, SSL, DNS, phishing score gauge, screenshots

**Network Flow** `/cyber/flows` — Cytoscape graph with hierarchical layout, colored nodes (IP=cyan, Domain=orange, Victim=red), timeline slider

**Fraud Analytics** `/cyber/fraud-analytics` — Fraud trend chart, top types, loss map with circles

**Digital Evidence** `/cyber/digital-evidence` — Evidence grid (filename, type, size, date), upload modal, viewer (image/text/hex)

**Cyber Heatmap** `/cyber/heatmap` — Leaflet map with cyber incident heatmap, filter by type/date/severity

### MAP PAGES (6)

**Maps Overview** `/maps` — 6 map type cards with mini previews
**Hotspot Map** `/maps/hotspots` — Full Leaflet with all layers (DBSCAN, heatmap, pins, red zones, predictive, socio-economic), time animation, draw tools
**Patrol Map** `/maps/patrol` — Police station markers, patrol routes (animated dashes), coverage heatmap, response time contours
**Geo-Fence Map** `/maps/geofences` — Animated geo-fence polygons, alert zones, draw tool
**District Map** `/maps/districts/:districtId` — Ward boundaries, crime dot density, station coverage, stats panel
**Route Analysis** `/maps/routes` — Crime route prediction, animated flow lines, crime corridor heatmap

### NETWORK / LINK ANALYSIS PAGES (6)

**Network Overview** `/network` — KPI cards, full-screen Cytoscape graph (force-directed, drag to reposition, hover highlight, double-click expand, right-click menu), filter panel
**Link Analysis** `/network/link-analysis` — Full graph + left filter panel + right detail panel
**Entity Explorer** `/network/entities` — Searchable entity database, cards with risk score, click to highlight in graph
**Network Clusters** `/network/clusters` — Detected communities list, click to focus graph
**Suspect Profile** `/network/suspects/:suspectId` — Full dossier: personal info, criminal history, associates graph, timeline, MO
**Association Matrix** `/network/association-matrix` — Heatmap matrix, cell color = strength, click for connection details

### INTEL GRAPH PAGES (React Flow) (4)

**Intel Graph Workspace** `/intel-graph` — React Flow canvas with 7 node types (Person, Place, Object, IP, Event, Motive, Result), drag from toolbar, connect handles, auto-layout, mini-map, snap-to-grid
**Graph Builder** `/intel-graph/builder` — Empty canvas + templates
**Graph Search** `/intel-graph/search` — Full-text search across graphs, preview + highlights
**Graph Timeline** `/intel-graph/timeline` — Timeline view, play animation to watch graph build

### INTELLIGENCE HUB PAGES (6)

**Intel Hub** `/intel` — 4 KPI cards, Predictive Risk Heatmap (3D map with ML predictions), Socio-Economic scatter plot, Emerging Trends list, Top Signals cards
**Briefings** `/intel/briefings` — AI-generated briefs, download PDF
**Intel Reports** `/intel/reports` — Filterable report list, download
**Watchlists** `/intel/watchlists` — Named watchlists, entity items with risk score
**Signals** `/intel/signals` — Real-time signal cards, filter by confidence/type/source
**Strategic Forecast** `/intel/forecast` — 30/60/90 day charts with confidence intervals

### ADMIN PAGES (7)

**Admin Overview** `/admin` — System health gauges (CPU, memory, API, DB), active users, storage, audit count
**User Management** `/admin/users` — Table with avatar, name, email, role, status, last login
**Role Permissions** `/admin/roles` — Permission matrix with toggle switches
**Data Ingestion** `/admin/ingestion` — Drag-drop file upload, progress bars, ingestion history
**Data Quality** `/admin/quality` — Completeness/Accuracy/Timeliness radar chart, missing fields table
**Audit Log** `/admin/audit` — Filterable timeline (user, action, resource, timestamp)
**System Health** `/admin/health` — Real-time gauges, uptime, version, service status

### LOGIN PAGE `/login`
- Full viewport, particle network background
- Glass card with KSP logo (animated glow), email input, password input
- Sign In button (gold accent)
- Social buttons: Google, Zoho, GitHub
- Footer: "KARNATAKA STATE POLICE · CONFIDENTIAL"

### 404 PAGE
- "⚠️ 404 — CASE NOT FOUND" with searching flashlight animation
- Particle network background

---

## ═══════════════════════════════════════════════════════════════
## TECHNICAL IMPLEMENTATION
## ═══════════════════════════════════════════════════════════════

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.0",
    "@tanstack/react-query": "^5.101.1",
    "zustand": "^5.0.14",
    "axios": "^1.18.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.6.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^1.21.0",
    "sonner": "^2.0.7",
    "framer-motion": "^12.x",
    "@react-three/fiber": "^9.x",
    "@react-three/drei": "^10.x",
    "three": "^0.175.x",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "@types/leaflet": "^1.9.21",
    "leaflet.heat": "^0.2.0",
    "cytoscape": "^3.34.0",
    "react-cytoscapejs": "^2.0.0",
    "@xyflow/react": "^12.11.1",
    "recharts": "^3.9.0",
    "@radix-ui/react-dialog": "^1.1.17",
    "@radix-ui/react-select": "^2.3.1",
    "@radix-ui/react-dropdown-menu": "^2.1.18",
    "@radix-ui/react-tabs": "^1.1.15",
    "geojson": "^0.5.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "tailwindcss": "^4.3.1",
    "@tailwindcss/postcss": "^4.3.1",
    "vite": "^7.2.7",
    "@vitejs/plugin-react": "^5.1.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@types/cytoscape": "^3.21.9",
    "@types/three": "^0.175.x"
  }
}
```

### Complete File Structure
```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── .env                            # VITE_MOCK_MODE=true
│
├── public/
│   └── data/
│       ├── karnataka-districts.geojson  # 31 districts + state outline
│       ├── crime_records.csv
│       └── cyber_incidents.csv
│
└── src/
    ├── main.tsx                    # Entry point, providers
    ├── App.tsx                     # Router + Providers
    ├── globals.css                 # Tailwind + CSS variables + animations
    │
    ├── shared/
    │   ├── constants/
    │   │   └── animations.ts       # SPRINGS, EASINGS constants
    │   ├── api/
    │   │   ├── client.ts           # Axios with mock/real switching
    │   │   ├── mock/               # Mock JSON for all endpoints
    │   │   └── dto-adapters/       # Response → frontend type mappers
    │   ├── components/
    │   │   ├── ScrollSections.tsx   # animejs-style section-by-section loading
    │   │   ├── ScrollReveal.tsx     # Simple scroll-triggered animation wrapper
    │   │   ├── StaggerGrid.tsx      # Grid stagger with configurable origin
    │   │   ├── StaggerContainer.tsx # Directional list stagger
    │   │   ├── MorphingCrimeIcon.tsx# SVG path morphing
    │   │   ├── AnimatedKarnatakaOutline.tsx # SVG line drawing
    │   │   ├── CrimeMotionPath.tsx  # Motion path animation
    │   │   ├── DraggableIntelCard.tsx # Draggable card
    │   │   ├── AnimatedHeading.tsx  # Character split animation
    │   │   ├── ScrambleText.tsx     # Scramble/unscramble text effect
    │   │   ├── LoadingScreen.tsx    # Shield loading animation
    │   │   ├── ParticleNetwork.tsx  # Canvas particle background
    │   │   ├── GlassCard.tsx        # Reusable glass card
    │   │   ├── KpiCard.tsx          # KPI with count-up, sparkline
    │   │   ├── LoadingSkeleton.tsx  # Shimmer skeleton
    │   │   ├── ErrorBoundary.tsx    # Error boundary
    │   │   ├── EmptyState.tsx       # Animated empty states
    │   │   ├── Badge.tsx            # Severity/status badges
    │   │   ├── DataTable.tsx        # Sort, filter, paginate
    │   │   ├── Pagination.tsx
    │   │   ├── SearchInput.tsx      # Debounced search
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── StatusDot.tsx        # Pulsing status indicator
    │   │   └── PageTransition.tsx   # 3D page transitions
    │   ├── layout/
    │   │   ├── AppShell.tsx         # Main layout shell
    │   │   ├── CommandBar.tsx       # Top nav bar
    │   │   ├── SidePanel.tsx        # Right data stream
    │   │   └── CommandPalette.tsx   # Cmd+K overlay
    │   └── ui-kit/
    │       ├── Button.tsx, Input.tsx, Select.tsx, Modal.tsx,
    │       ├── Dropdown.tsx, Tabs.tsx, Tooltip.tsx
    │
    ├── features/
    │   ├── command-center/
    │   │   ├── Karnataka3DMap.tsx       # MAIN: 3D heatmap scene
    │   │   ├── components/
    │   │   │   ├── DistrictMesh3D.tsx   # Single district 3D extrusion
    │   │   │   ├── DistrictBorder.tsx   # Animated dashed borders
    │   │   │   ├── HotspotColumn.tsx    # Particle columns
    │   │   │   ├── PulsingRing.tsx      # Red zone pulsing rings
    │   │   │   └── AmbientParticles.tsx # Floating particles
    │   │   ├── hooks/
    │   │   │   └── useKarnatakaGeoData.ts
    │   │   └── DistrictDetailPanel.tsx  # Click detail panel
    │   ├── radial-wheel/
    │   │   └── RadialNavigationWheel.tsx # 4-ring SVG wheel
    │   ├── crime/
    │   │   ├── CrimeStatsGrid.tsx, CrimeTypeChart.tsx, CrimeTrendChart.tsx,
    │   │   ├── DistrictTable.tsx, HotspotMap.tsx, ClusterPanel.tsx,
    │   │   ├── RedZoneOverlay.tsx, CrimeTimeline.tsx, CrimeCaseCard.tsx,
    │   │   └── CriminalProfile.tsx
    │   ├── cyber/
    │   │   ├── CyberStatsGrid.tsx, ThreatTimeline.tsx, IpReport.tsx,
    │   │   ├── DomainReport.tsx, AttackPathGraph.tsx, MiniGlobe.tsx
    │   ├── maps/
    │   │   └── MapControls.tsx, MapLegend.tsx, DrawTools.tsx
    │   ├── network/
    │   │   └── NetworkGraph.tsx, NodeDetail.tsx, GraphControls.tsx
    │   ├── intel-graph/
    │   │   └── GraphCanvas.tsx, NodePalette.tsx, MiniMap.tsx
    │   ├── intelligence/
    │   │   └── IntelBriefCard.tsx, PredictiveHeatmap.tsx, CorrelationChart.tsx
    │   └── admin/
    │       └── SystemHealthGauge.tsx, PermissionMatrix.tsx
    │
    ├── router/
    │   ├── AppRoutes.tsx           # All routes, lazy loading
    │   └── ProtectedRoute.tsx      # Auth wrapper
    │
    ├── stores/
    │   ├── authStore.ts
    │   ├── uiStore.ts              # Sidebar, palette, theme
    │   ├── filterStore.ts          # Global filters (time, district, type)
    │   └── navStore.ts             # Navigation history, active section
    │
    ├── pages/
    │   ├── CommandCenterPage.tsx    # Sections: hero, kpis, trends, wheel, cyber, network
    │   ├── LoginPage.tsx
    │   ├── NotFoundPage.tsx
    │   ├── dashboard/
    │   │   ├── UnifiedDashboardPage.tsx, AlertsPage.tsx, ReportsPage.tsx
    │   ├── crime/
    │   │   ├── CrimeOverviewPage.tsx, CrimeTrendsPage.tsx, CrimeHotspotsPage.tsx,
    │   │   ├── CrimeCasesPage.tsx, CrimeCaseDetailPage.tsx, CriminalListPage.tsx,
    │   │   ├── CriminalDetailPage.tsx, CrimePatternsPage.tsx, CrimePredictivePage.tsx
    │   ├── cyber/
    │   │   ├── CyberOverviewPage.tsx, CyberThreatsPage.tsx, CyberCasesPage.tsx,
    │   │   ├── CyberCaseDetailPage.tsx, IpIntelligencePage.tsx, DomainIntelligencePage.tsx,
    │   │   ├── FraudAnalyticsPage.tsx, DigitalEvidencePage.tsx, CyberHeatmapPage.tsx,
    │   │   └── NetworkFlowPage.tsx
    │   ├── maps/
    │   │   ├── MapsOverviewPage.tsx, HotspotMapPage.tsx, PatrolMapPage.tsx,
    │   │   ├── GeoFencePage.tsx, DistrictMapPage.tsx, RouteAnalysisPage.tsx
    │   ├── network/
    │   │   ├── NetworkOverviewPage.tsx, LinkAnalysisPage.tsx, EntityExplorerPage.tsx,
    │   │   ├── NetworkClustersPage.tsx, SuspectProfilePage.tsx, AssociationMatrixPage.tsx
    │   ├── intel-graph/
    │   │   ├── IntelGraphWorkspacePage.tsx, GraphBuilderPage.tsx,
    │   │   ├── GraphSearchPage.tsx, GraphTimelinePage.tsx
    │   ├── intel/
    │   │   ├── IntelHubPage.tsx, BriefingsPage.tsx, IntelReportsPage.tsx,
    │   │   ├── WatchlistsPage.tsx, SignalsPage.tsx, StrategicForecastPage.tsx
    │   └── admin/
    │       ├── AdminOverviewPage.tsx, UserManagementPage.tsx, RolePermissionsPage.tsx,
    │       ├── DataIngestionPage.tsx, DataQualityPage.tsx, AuditLogPage.tsx,
    │       └── SystemHealthPage.tsx
    │
    ├── hooks/
    │   ├── useCountUp.ts           # Animated number counter
    │   ├── useAnimationMedia.ts    # Media query + reduced motion
    │   └── useKeyboard.ts          # Key bindings
    │
    └── utils/
        └── geoTo3d.ts             # GeoJSON → Three.js coordinate projection
```

### State Management
- **Zustand** for global UI state (sidebar, palette, panel toggles, filters, nav)
- **TanStack Query** for all server state (caching, refetching, polling every 30s)

### Data Fetching
```typescript
const MOCK_ENABLED = import.meta.env.VITE_MOCK_MODE === 'true';

async function apiGet<T>(url: string): Promise<T> {
  if (MOCK_ENABLED) {
    const mock = await import(`../shared/api/mock${url}.json`);
    return mock.default as T;
  }
  const { data } = await axios.get(`${API_BASE}${url}`);
  return data;
}
```

### Mock Data Structure
```
src/shared/api/mock/
├── dashboard/stats.json
├── crime/cases.json, case-{id}.json, criminals.json, criminal-{id}.json,
│       hotspots.json, red-zones.json, trends.json, predictive.json
├── cyber/incidents.json, ip-{address}.json, domain-{domain}.json, flows.json
├── maps/geo-data.json, patrol-zones.json
├── network/graph.json
├── intel/briefs.json, socio-economic.json
└── admin/users.json, audit-logs.json
```

### Performance MUST-Haves
- **Lazy load EVERY page** with `React.lazy()`
- **React.memo** on: KpiCard, GlassCard, Badge, table rows, chart wrappers
- **useMemo** on: chart data, filtered lists, GeoJSON processing
- **useCallback** on: event handlers passed to children
- **Animations:** ONLY use `transform` and `opacity` (GPU-composited)
- **TanStack Query:** aggressive caching, staleTime: 30s
- **Virtual scroll** for tables with >100 rows
- **prefers-reduced-motion** disables ALL animations

---

## ═══════════════════════════════════════════════════════════════
## ACCESSIBILITY & QUALITY
## ═══════════════════════════════════════════════════════════════

- [ ] All interactive elements keyboard-navigable (Tab, Enter, Escape)
- [ ] ARIA labels on all icon-only buttons
- [ ] Visible focus ring (gold 2px outline)
- [ ] Color contrast AA minimum (AAA for text)
- [ ] Screen reader announcements for dynamic updates
- [ ] `prefers-reduced-motion` media query disables all animations
- [ ] Zero console errors
- [ ] TypeScript strict mode, zero errors
- [ ] Build succeeds: `npm run build`
- [ ] Lighthouse score ≥ 90

---

## ═══════════════════════════════════════════════════════════════
## COMPLETE ANIMATION REFERENCE — All animejs.com features
## ═══════════════════════════════════════════════════════════════

| animejs.com Feature | React/framer-motion Equivalent | File |
|---------------------|-------------------------------|------|
| Scroll Observer (`onScroll`) | `useScroll()` + `useTransform()` + `useInView()` | ScrollSections.tsx |
| Stagger (`stagger(40)`) | `staggerChildren` in variants | StaggerGrid.tsx / StaggerContainer.tsx |
| SVG Morph (`svg.morphTo()`) | `AnimatePresence` + `motion.path` `d` prop | MorphingCrimeIcon.tsx |
| SVG Draw (`createDrawable()`) | `pathLength` animation | AnimatedKarnatakaOutline.tsx |
| Motion Path (`createMotionPath()`) | `offsetPath` + `offsetDistance` CSS | CrimeMotionPath.tsx |
| Draggable (`createDraggable()`) | framer `drag` prop + spring physics | DraggableIntelCard.tsx |
| Timeline (`createTimeline()`) | `useAnimation` + async sequence | CommandCenterEntrance.tsx |
| Responsive (Scope + mediaQueries) | `useMediaQuery` hook + Tailwind responsive | useAnimationMedia.ts |
| Text Split (`splitText()`) | Character-level staggered spans | AnimatedHeading.tsx |
| scrambleText (NEW) | Custom React hook with character scrambling | ScrambleText.tsx |
| Keyframes | Array values in `animate` prop | All animated components |
| Spring (`createSpring()`) | `type: 'spring'` with stiffness/damping/mass | SPRINGS constant |
| Individual Transforms | Individual transform props (x, y, rotate, scale) | All motion.div |
| Playback controls | `useAnimation` controls | All animated components |
| Callbacks | `onAnimationStart`/`onAnimationComplete` | All animated components |
| Easing functions | `ease` prop with cubic-bezier or built-in | EASINGS constant |

---

## ═══════════════════════════════════════════════════════════════
## WHAT TO GENERATE
## ═══════════════════════════════════════════════════════════════

Generate the **COMPLETE `frontend/` directory** with ALL files listed above.

**IMPORTANT:**
- Generate REAL, working code. No placeholders, no "TODO", no "implement later".
- Use mock data from JSON files (no backend required to run).
- The app MUST run with `npm install && npm run dev` and show a fully functional UI.
- Every page must render SOMETHING (even if it's an empty state or skeleton).
- The 3D Karnataka heatmap must be the star of the show.
- Glass morphism must be everywhere.
- Animations must be smooth and plentiful — like animejs.com and a Hollywood command center.
- Command Center homepage must load sections one by one as the user scrolls.
- All 13 animejs.com features must be present and working.

**YOU ARE BUILDING A DATATHON SUBMISSION. THIS NEEDS TO WIN. GO ALL OUT.**
