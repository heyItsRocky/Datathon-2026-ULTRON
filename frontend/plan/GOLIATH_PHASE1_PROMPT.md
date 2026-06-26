# GOLIATH — PHASE 1 EXECUTION PROMPT

> Copy the entire contents of this file as your prompt to Goliath.
> Phase: 1 of 10 | Focus: Command Center + Unified Dashboard

---

## 0. Context

Phase 0 is complete and verified. The project lives at:

```
D:\Datathon-2026-ULTRON\frontend\
```

The app compiles, builds, and runs. You have the shell (AppShell), routing (40+ lazy routes), Zustand stores (auth, nav, ui, filter), shared UI kit, mock infrastructure, and placeholder pages.

**Your job now:** Build two real, functioning pages — the Command Center landing page and the Unified Dashboard.

---

## 1. Build Protocol

**BUILD → VERIFY → STOP → REPORT**

1. Implement everything listed below
2. Run `npx tsc --noEmit` and `npm run build` — they must pass
3. Verify against the checklist
4. Report back with results
5. **Do NOT proceed to Phase 2 until instructed**

---

## 2. Hard Rules — Read Carefully

| Rule | Detail |
|------|--------|
| **Do NOT modify frozen files** | `src/globals.css`, `src/shared/layout/*`, `src/shared/ui-kit/*`, `src/shared/api/client.ts`, `src/stores/*` |
| **MAY modify these** | `src/router/routes.tsx`, `src/router/AppRoutes.tsx` |
| **No new design tokens** | Use CSS variables from `globals.css` only |
| **No component duplication** | Check `src/shared/components/index.ts` before creating anything |
| **All 4 states required** | loading, empty, error, populated — every data-dependent view |
| **Mock mode** | All data comes from `src/mocks/` or inline mock data |
| **Icons** | Use Lucide icons only (already in deps) |
| **Types** | No `any` — use proper types or `unknown` with guards |
| **Named exports** | Prefer named over default exports |

---

## 3. Install Dependency

```bash
npm install motion
```

`motion` (Motion for React) replaces anime.js for animations.

---

## 4. Build Order — Step by Step

### Step 1: Create Shared Components

All go in `src/shared/components/` and must be exported from `src/shared/components/index.ts`.

#### `KSPEmblem.tsx`
- SVG component for the KSP emblem
- Gold color (`#f0b000` or CSS variable `--color-gold`) primary, dark background compatible
- Props: `className?: string`, `size?: number` (default 48)

#### `KSPHeader.tsx`
- Layout (horizontal row, vertically centered):
  ```
  [KSP Emblem 48px] | [CM placeholder] [Dy CM placeholder] | "ULTRON" title | subtitle
  ```
- CM/Dy CM: circular divs (36px), `rounded-full`, `bg-surface`, gold border, initials inside
- "ULTRON": `text-4xl font-black`, gold color
- Subtitle: "Karnataka State Police Intelligence Platform" in `text-sm`, muted

#### `EmergencyFooter.tsx`
- Fixed/section footer with KSP emergency numbers as badge pills:
  - 112 (Emergency), 100 (Police), 101 (Fire), 108 (Ambulance), 1070 (Helpline), 1091 (Women), 1098 (Children), 1930 (Cyber), 14567 (Traffic)
- Gold accent on numbers, muted text for labels
- Use glass card styling or existing Badge component

#### `RadialNav.tsx`
- **Critical component** — 4-segment ring navigation
- Props: `onSegmentClick?: (segment: string) => void`
- **Implementation approach**: Circular container (`rounded-full`, square aspect ratio) with absolutely-positioned colored segments using CSS clip-path or SVG paths
- Colors:
  - **Gold** (`#f0b000`) → Dashboard
  - **Teal** (`#20a080`) → Maps & Geospatial
  - **Purple** (`#800060`) → Network Analysis
  - **Red** (`#c02040`) → Intelligence
- Center: KSP emblem at 64px (z-index above segments)
- Each segment: hover brightens + scales, click fires `onSegmentClick`
- Labels on segments: "DASHBOARD", "MAPS", "NETWORK", "INTELLIGENCE"
- Enter animation: staggered scale 0→1 using `motion` (Motion for React)
- Segment click → animate transition, then navigate via `useNavigate()`

### Step 2: Create Animation Hook

#### `src/hooks/useAnimeTransition.ts`
- Uses `motion` package (Motion for React)
- Export:
  - `usePageEnter()` — returns `MotionProps` for staggered fade-in on page mount
  - `useRadialTransition(target)` — animation config for ring-click → page transition
- Timing: stagger 80ms, enter 400ms, ease-out-expo

```typescript
// Pattern example — adapt as needed:
import { Variants } from 'motion';

export function usePageEnter(): { initial: object; animate: object; transition: object } {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };
}

export function useRadialTransition(target: string) {
  // Returns animation config + navigation callback
}
```

### Step 3: Expand Mock Data

#### `src/mocks/dashboard-stats.json` — replace with:

```json
{
  "kpis": [
    { "title": "Total Crimes", "value": 12450, "trend": 8, "icon": "fingerprint" },
    { "title": "Active Cases", "value": 234, "trend": -3, "icon": "briefcase" },
    { "title": "Alerts Today", "value": 17, "trend": 12, "icon": "bell" },
    { "title": "Cyber Incidents", "value": 89, "trend": 5, "icon": "shield" }
  ],
  "trend": {
    "labels": ["Jun 1", "Jun 5", "Jun 10", "Jun 15", "Jun 20", "Jun 25", "Jun 30"],
    "crime": [320, 280, 410, 380, 450, 390, 420],
    "cyber": [45, 52, 48, 63, 55, 70, 61]
  },
  "alerts": [
    { "id": "a1", "message": "Bengaluru Urban — theft spike", "severity": "high", "time": "2m ago" },
    { "id": "a2", "message": "Mysuru — vehicle theft ring", "severity": "medium", "time": "15m ago" },
    { "id": "a3", "message": "Belagavi — cyber fraud cluster", "severity": "high", "time": "1h ago" }
  ],
  "districtRankings": [
    { "name": "Bengaluru Urban", "score": 87, "trend": 12 },
    { "name": "Mysuru", "score": 72, "trend": 5 },
    { "name": "Belagavi", "score": 68, "trend": -2 },
    { "name": "Hubballi", "score": 61, "trend": 8 },
    { "name": "Kalaburagi", "score": 55, "trend": 3 }
  ],
  "anomalies": [
    { "id": "an1", "district": "Bengaluru Urban", "type": "theft", "description": "↑40% above baseline", "severity": "high" },
    { "id": "an2", "district": "Belagavi", "type": "cyber", "description": "↑25% MoM", "severity": "medium" },
    { "id": "an3", "district": "Mysuru", "type": "robbery", "description": "New pattern detected", "severity": "medium" }
  ],
  "quickActions": [
    { "label": "Add Crime", "route": "/crime/cases/new", "icon": "plus" },
    { "label": "MO Match", "route": "/crime/mo-matcher", "icon": "search" },
    { "label": "Upload Data", "route": "/data/upload", "icon": "upload" },
    { "label": "Scrape", "route": "/data/sources", "icon": "globe" }
  ]
}
```

### Step 4: Rebuild CommandCenterPage

**File:** `src/pages/CommandCenterPage.tsx`
**Layout:** Fullscreen, NO AppShell

**Route change required:**
1. `src/router/routes.tsx`: Remove `{ path: '/', element: CommandCenterPage }` from `protectedRoutes`
2. `src/router/AppRoutes.tsx`: Add a `<Route path="/">` OUTSIDE the AppShell wrapper:
   ```tsx
   // BEFORE the <Route element={<AppShell />}> block
   <Route path="/" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
   ```

**Page sections (top → bottom):**

1. **KSP Header** — `<KSPHeader />` component
2. **Radial Navigation** — `<RadialNav />` component
   - If authenticated (check `authStore`): show "Enter Workspace" as center clickable
   - If unauthenticated: show "Login" prompt in center
3. **Quick Stats Strip** — 4 compact KPI cards in a row:
   - Total Crimes, Alerts Today, Active Cases, Cyber Incidents
   - Count-up animation on mount
   - Glass card style
4. **Emergency Footer** — `<EmergencyFooter />`

**Animations:**
- On mount: stagger in (header → rings → stats → footer)
- Ring segments: scale 0→1 staggered
- On ring click: brief fade, then navigate

**States:**
- Loading: skeleton rings, pulsing emblem
- Loaded: full animated entrance
- Authenticated: "Enter Workspace" center option
- Error: error card with retry

### Step 5: Rebuild UnifiedDashboardPage

**File:** `src/pages/dashboard/UnifiedDashboardPage.tsx`
**Layout:** Uses AppShell (standard page)

**Sections:**

1. **SectionToolbar** — breadcrumbs, date range filter, district dropdown
2. **KPI Row** — 4 `KpiCard` components with icons:
   - Total Crimes (fingerprint), Active Cases (briefcase), Alerts Today (bell), Cyber Incidents (shield)
   - Each shows value + trend arrow
3. **Main Content (2-column grid):**
   - **Left (2/3):** Combined Trend Chart
     - Recharts `AreaChart`, dual series (crime + cyber)
     - Gold (`#f0b000`) and Cyan (`#06b6d4`) gradient fills
     - 30-day data from mock
   - **Right (1/3):** District Risk Ranking
     - Ranked list with score bars
     - Glass card container
4. **Bottom row (2-column):**
   - **Left (2/3):** Anomaly Feed
     - Scrollable list with severity dots (use AlertFeed or similar)
   - **Right (1/3):** Quick Actions
     - 4 action card buttons → navigate on click

**States:**
- **Loading:** Skeleton grid (4 KPI skeletons + chart skeleton + list skeleton)
- **Empty:** "Welcome to ULTRON. Upload data or trigger a scrape to begin." + action buttons
- **Error:** Red-tinted glass card with error message + [Retry] button
- **Populated:** Full dashboard

**Filters:** Date range + district. In mock mode, show "filtered by X" indicator.

---

## 5. File Manifest — Summary

| Action | File |
|--------|------|
| CREATE | `src/shared/components/KSPEmblem.tsx` |
| CREATE | `src/shared/components/KSPHeader.tsx` |
| CREATE | `src/shared/components/EmergencyFooter.tsx` |
| CREATE | `src/shared/components/RadialNav.tsx` |
| CREATE | `src/hooks/useAnimeTransition.ts` |
| MODIFY | `src/shared/components/index.ts` — export new components |
| MODIFY | `src/mocks/dashboard-stats.json` — enriched data |
| MODIFY | `src/router/routes.tsx` — remove `/` from protectedRoutes |
| MODIFY | `src/router/AppRoutes.tsx` — add `/` route outside AppShell |
| REWRITE | `src/pages/CommandCenterPage.tsx` |
| REWRITE | `src/pages/dashboard/UnifiedDashboardPage.tsx` |

---

## 6. Verification Checklist

Run and confirm each:

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — production build succeeds
- [ ] Command Center renders fullscreen WITHOUT AppShell sidebar/header/footer
- [ ] 4-color radial nav renders (Gold, Teal, Purple, Red segments)
- [ ] Clicking a ring segment navigates to the corresponding section page
- [ ] KSP header shows emblem + CM/Dy CM placeholders + ULTRON title
- [ ] Quick stats strip shows 4 animated stat cards with count-up
- [ ] Emergency footer shows all KSP emergency numbers
- [ ] Dashboard KPI row renders 4 KpiCards with trend indicators
- [ ] Combined trend chart shows dual-series area chart (gold + cyan)
- [ ] District risk ranking shows ranked list with horizontal score bars
- [ ] Anomaly feed shows scrollable list with severity dots
- [ ] Quick actions section shows 4 action cards that navigate on click
- [ ] Dashboard SectionToolbar shows breadcrumbs + date range + district filter
- [ ] Dashboard loading state shows skeleton grid matching layout
- [ ] Dashboard empty state shows welcome message with action buttons
- [ ] Dashboard error state shows error card with retry button
- [ ] Entrance animations play on page mount (staggered)
- [ ] No frozen files were modified (globals.css, layout/, ui-kit/, stores/, api/client.ts)

---

## 7. Report Format

```
## Phase 1 Complete — Report

### Files Created
- src/shared/components/KSPEmblem.tsx
- ...

### Files Modified
- ...

### Verification Results
- tsc --noEmit: PASS/FAIL
- npm run build: PASS/FAIL
- [Checklist items all PASS/FAIL]

### Issues Encountered
- (any blockers, questions, or notes)

### Ready for Phase 2
YES / NO (if NO, explain why)
```

---

**Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.**
