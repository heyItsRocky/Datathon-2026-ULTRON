# PHASE 1 — Command Center + Unified Dashboard

> Execution Brief for Goliath · June 2026
> Build: Command Center (fullscreen radial nav) + Unified Dashboard (KPI row, trends, alerts, filters)

---

## 0. Build Protocol Reminder

**BUILD → VERIFY → STOP → REPORT** — do not proceed beyond Phase 1 without confirmation.

### Hard Rules
- **Do NOT modify** frozen files: `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*`
- **MAY modify** `router/routes.tsx` and `router/AppRoutes.tsx` — these are NOT frozen
- **Do NOT duplicate** existing shared components — check `src/shared/components/index.ts` first
- **Do NOT add** new design tokens — use CSS variables from `globals.css` only
- **Do NOT skip** any of the 4 states: loading, empty, error, populated on every data-dependent page
- **Mock mode must work** — all data comes from `src/mocks/` or inline mock data

---

## 1. Dependencies to Install

```bash
npm install motion   # Motion for React (animation library - replaces anime.js)
```

---

## 2. Build Order

### Step 2.1 — Create Shared Components

These go in `src/shared/components/` and are exported from `src/shared/components/index.ts`.

#### `KSPEmblem.tsx`
- SVG component rendering the KSP (Karnataka State Police) emblem
- Gold color (`#f0b000`) primary, dark background compatible
- Props: `className?: string`, `size?: number` (default 48)
- Used in Command Center header

#### `KSPHeader.tsx`
- Props: none (self-contained)
- Layout:
  ```
  [KSP Emblem] | [CM + Dy CM placeholder photos] | "ULTRON" title | KSP subtitle
  ```
- Left: KSPEmblem (48px)
- Center-left: Two circular placeholders (36px) with "CM" and "Dy CM" initials — use `div` with border-radius-full, bg-surface, gold border
- Center-right: "ULTRON" in text-4xl font-black, gold color; subtitle "Karnataka State Police Intelligence Platform" in text-sm
- All on one horizontal row, vertically centered

#### `EmergencyFooter.tsx`
- Fixed bottom bar or section footer
- Shows KSP emergency numbers as a row of badge-style pills:
  - 112 (Emergency), 100 (Police), 101 (Fire), 108 (Ambulance), 1070 (Helpline), 1091 (Women), 1098 (Children), 1930 (Cyber), 14567 (Traffic)
- Use `src/shared/ui-kit/Badge.tsx` or simple divs with glass styling
- Gold accent on the numbers, muted text for labels

#### `RadialNav.tsx`
- **Critical component** — SVG-based 4-segment ring navigation
- Props: `onSegmentClick?: (segment: string) => void`
- 4 color segments matching DESIGN_SYSTEM radial colors:
  - **Gold** (`#f0b000`) → Dashboard (0°–50° / 300°–360°)
  - **Teal** (`#20a080`) → Maps & Geospatial (50°–130°)
  - **Purple** (`#800060`) → Network Analysis (130°–240°)
  - **Red** (`#c02040`) → Intelligence (240°–300°)
- Center: KSP emblem (use `KSPEmblem` component at 64px)
- Each segment has:
  - Hover effect: brighten, slight scale pulse
  - click → `onSegmentClick(segmentId)` + Motion animation
- Labels on each segment: "DASHBOARD", "MAPS", "NETWORK", "INTELLIGENCE"
- Enter animation: staggered scale from 0→1 using Motion
- Responsive: scales down on smaller screens
- Use `<svg>` with `<path>` elements for arc segments (or a simpler approach: absolutely positioned wedge divs in a circular container, rotated with CSS transforms)

**Simpler implementation approach for RadialNav:**
- Use a circular container (square, `rounded-full`)
- Position 4 colored segments as absolutely-positioned semicircles/arcs using CSS clip-path or SVG
- Each segment is a clickable button
- Center circle (with emblem) sits on top via z-index
- This avoids complex SVG arc math

### Step 2.2 — Create Hook

#### `src/hooks/useAnimeTransition.ts`
- Uses Motion for React (the `motion` package)
- Provides:
  - `usePageEnter()` — returns `MotionProps` for staggered fade-in on page mount
  - `useRadialTransition(target)` — returns animation config for transitioning from radial nav to a new page
- Timing tokens from DESIGN_SYSTEM Section 8:
  - transition-enter: 400ms, ease-out-expo
  - transition-stagger: 80ms delay between items
  - transition-slow: 300ms

```typescript
// Example usage:
import { usePageEnter } from '@/hooks/useAnimeTransition';

function MyPage() {
  const animProps = usePageEnter();
  return <motion.div {...animProps}>Content</motion.div>;
}
```

### Step 2.3 — Expand Mock Data

#### Update `src/mocks/dashboard-stats.json`
Replace with richer data including:

```json
{
  "kpis": [
    { "title": "Total Crimes", "value": 12450, "trend": 8 },
    { "title": "Active Cases", "value": 234, "trend": -3 },
    { "title": "Alerts Today", "value": 17, "trend": 12 },
    { "title": "Cyber Incidents", "value": 89, "trend": 5 }
  ],
  "trend": { ... },
  "alerts": [ ... ],
  "districtRankings": [
    { "name": "Bengaluru Urban", "score": 87, "trend": 12 },
    { "name": "Mysuru", "score": 72, "trend": 5 },
    ...
  ],
  "anomalies": [
    { "id": "an1", "district": "Bengaluru Urban", "type": "theft", "description": "↑40% above baseline", "severity": "high" },
    { "id": "an2", "district": "Belagavi", "type": "cyber", "description": "↑25% MoM", "severity": "medium" }
  ],
  "quickActions": [
    { "label": "Add Crime", "route": "/crime/cases/new", "icon": "plus" },
    { "label": "MO Match", "route": "/crime/mo-matcher", "icon": "search" },
    { "label": "Upload Data", "route": "/data/upload", "icon": "upload" },
    { "label": "Scrape", "route": "/data/sources", "icon": "globe" }
  ]
}
```

### Step 2.4 — Rebuild CommandCenterPage

**File:** `src/pages/CommandCenterPage.tsx`

- **Layout:** Fullscreen, no AppShell
- **IMPORTANT — Route modification needed:**
  1. In `src/router/routes.tsx`: Remove the `{ path: '/', element: CommandCenterPage }` entry from `protectedRoutes`
  2. In `src/router/AppRoutes.tsx`: Add a new `<Route>` for `/` OUTSIDE the AppShell wrapper:
     ```tsx
     // Add before the AppShell Routes:
     <Route path="/" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
     ```
     This ensures the Command Center renders fullscreen without SidebarNav, TopHeader, SectionToolbar, FooterBar, or RightContextPanel.

- **Sections (top to bottom):**
  1. **KSP Header** — Use `<KSPHeader />` component
  2. **Radial Navigation** — Use `<RadialNav />` component
     - Show "Enter Workspace" as center option if authenticated (check authStore)
     - Show login prompt if unauthenticated
  3. **Quick Stats Strip** — 4 stat cards in a row:
     - Total Crimes, Alerts Today, Active Cases, Cyber Incidents
     - Use animation: count up on mount
     - Glass card style, compact
  4. **Emergency Footer** — Use `<EmergencyFooter />`

- **Animations (Motion):**
  - On mount: all elements stagger in (header → rings → stats → footer)
  - Ring segments: scale from 0 to 1 with staggered delay
  - On ring click: animate page transition (brief fade, then navigate via react-router)

- **States:**
  - Loading: Skeleton rings, pulsing emblem
  - Loaded: Full animated entrance
  - Authenticated: Show "Enter Workspace" in center
  - Error: Error state with retry

### Step 2.5 — Rebuild UnifiedDashboardPage

**File:** `src/pages/dashboard/UnifiedDashboardPage.tsx`

- **Layout:** Uses AppShell (standard page)
- **Imports needed:**
  - `KpiCard`, `TrendCard` from shared components
  - `AlertFeed` from shared components (already exists — check if it handles the data shape)
  - SectionToolbar (from shared/layout)
  - Recharts for charts
  - `useAnimeTransition` for entrance animations
  - Lucide icons

- **Sections:**
  1. **SectionToolbar** — Breadcrumbs, date range filter, district dropdown
  2. **KPI Row** —
     ```
     [Total Crimes: 12,450 ↑8%] [Active Cases: 234 ↓3%] [Alerts Today: 17 ↑12%] [Cyber Incidents: 89 ↑5%]
     ```
     - Use existing `KpiCard` component
     - Icons: Fingerprint, Briefcase, Bell, Shield
  3. **Main Content (2-column grid)** —
     - **Left (2/3):** Combined Trend Chart
       - Recharts `AreaChart` with dual series (crime + cyber)
       - Gold (`#f0b000`) and Cyan (`#06b6d4`) fills
       - 30-day data point
     - **Right (1/3):** District Risk Ranking
       - Simple ranked list with score bars
       - Each row: rank number, district name, score, trend indicator
       - Glass card container
  4. **Bottom row (2-column)** —
     - **Left (2/3):** Anomaly Feed
       - Use AlertFeed component or similar
       - Shows district anomalies with severity indicators
     - **Right (1/3):** Quick Actions
       - 4 action buttons as cards
       - Navigate on click

- **States (ALL 4 REQUIRED):**
  - **Loading:** Skeleton grid — 4 KPI skeleton cards + chart skeleton + list skeleton
  - **Empty:** "Welcome to ULTRON. Upload data or trigger a scrape to begin." with action buttons
  - **Error:** Red-tinted glass card with error message + Retry button
  - **Populated:** Full dashboard with all sections

- **Filters:**
  - Date range picker (use existing SectionToolbar or simple inline date inputs)
  - District dropdown (use existing Select component)
  - These filter the data shown (for mock mode, just display a "filtered by X" indicator)

---

## 3. File Manifest

| Action | File | Description |
|--------|------|-------------|
| CREATE | `src/shared/components/KSPEmblem.tsx` | KSP SVG emblem component |
| CREATE | `src/shared/components/KSPHeader.tsx` | KSP branding header bar |
| CREATE | `src/shared/components/EmergencyFooter.tsx` | Emergency contacts bar |
| CREATE | `src/shared/components/RadialNav.tsx` | 4-segment radial navigation |
| CREATE | `src/hooks/useAnimeTransition.ts` | Animation transition hooks |
| MODIFY | `src/shared/components/index.ts` | Export new components |
| MODIFY | `src/mocks/dashboard-stats.json` | Enriched dashboard mock data |
| REWRITE | `src/pages/CommandCenterPage.tsx` | Full command center |
| REWRITE | `src/pages/dashboard/UnifiedDashboardPage.tsx` | Full dashboard |

---

## 4. Verification Checklist

Run these after all files are created:

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] Command Center renders fullscreen without AppShell chrome
- [ ] Radial navigation shows 4 colored segments (Gold, Teal, Purple, Red)
- [ ] Clicking a ring segment triggers navigation to the corresponding section
- [ ] KSP header shows emblem, CM/Dy CM placeholders, ULTRON title
- [ ] Quick stats strip shows 4 animated stat cards
- [ ] Emergency footer shows all KSP numbers
- [ ] Dashboard KPI row renders 4 KpiCards with count-up animation
- [ ] Combined trend chart shows dual-series area chart (gold + cyan)
- [ ] District risk ranking shows ranked list with score bars
- [ ] Anomaly feed shows scrollable list with severity indicators
- [ ] Quick actions section shows 4 action cards
- [ ] Dashboard SectionToolbar shows breadcrumbs + filters
- [ ] Dashboard loading state shows skeleton grid
- [ ] Dashboard empty state shows welcome message
- [ ] Dashboard error state shows error card + retry button
- [ ] Entrance animations play on page mount
- [ ] No frozen files were modified

---

## 5. Handoff to Phase 2

After verification, report:
- Files created/modified
- Verification results (all passed/failed items)
- Any issues encountered
- Ready for Phase 2 (Crime Suite)
