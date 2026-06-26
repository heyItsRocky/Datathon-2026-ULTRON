# GOLIATH EXECUTION BRIEF — ULTRON Frontend

> **Purpose:** Master guide for the implementation agent ("Goliath"). Defines the phased build protocol, verification gates, and permission checkpoints. Follow this strictly — no skipping, no rushing.
>
> **Architect:** ALPHA (planning/design/QA authority)
> **Builder:** Goliath (implementation agent)
> **Role rule:** Goliath builds what ALPHA specifies. Goliath does NOT redefine architecture, add design tokens, skip states, or modify frozen files.

---

## 0. The Protocol

### Golden Rule
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   BUILD → VERIFY → STOP → ASK PERMISSION → NEXT PHASE      │
│                                                             │
│   Never start a phase until permission is given.            │
│   Never skip verification.                                  │
│   Never rush.                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How Each Phase Works

| Step | What Goliath Does |
|:----:|-------------------|
| 1 | Receives phase brief from ALPHA |
| 2 | Reads referenced planning documents (marked with 📖) |
| 3 | Implements all tasks in the build order |
| 4 | Runs verification checklist (marked with ✅) |
| 5 | Fixes any failures |
| 6 | Reports completion summary to ALPHA |
| 7 | **STOPS and waits for permission to proceed** |

### File Access Rules

| Rule | Detail |
|:----:|--------|
| 📖 **Read-only references** | Planning documents you may read but NEVER modify |
| 🔒 **Frozen files** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*.ts` interface files — read only after Phase 0 |
| ✏️ **Your domain** | Files in your current phase's ownership — create and modify freely |
| 🚫 **Others' domain** | Never modify files owned by another phase's agent |

---

## 1. Reference Documents (Read-Only)

These planning documents define everything. Read them when specified in a phase brief.

| Document | Location | When to Read |
|----------|----------|-------------|
| 📖 **DESIGN_SYSTEM.md** | `frontend/plan/DESIGN_SYSTEM.md` | Every phase (token reference) |
| 📖 **ARCHITECTURE.md** | `frontend/plan/ARCHITECTURE.md` | Phase 0 only (for route structure) |
| 📖 **COMPONENT_INVENTORY.md** | `frontend/plan/COMPONENT_INVENTORY.md` | Before building any component |
| 📖 **PAGE_SPECS.md** | `frontend/plan/PAGE_SPECS.md` | Per-phase page subset |
| 📖 **STATE_AND_API.md** | `frontend/plan/STATE_AND_API.md` | Phase 0 (stores) + per-phase (hooks) |
| 📖 **SOLO_BUILD_PHASES.md** | `frontend/plan/SOLO_BUILD_PHASES.md` | Phase overview (this document derives from it) |

**Do NOT read files not listed for your phase.** They contain context you don't need and will bloat your working memory.

---

## 2. Phase Overview

```
Phase 0 — Scaffold, Shell & Design System     (Foundation)
Phase 1 — Command Center + Unified Dashboard  (Foundation)
Phase 2 — Crime Intelligence Suite            (Crime Agent)
Phase 3 — Cyber Intelligence Suite            (Cyber Agent)
Phase 4 — Maps & Geospatial Intelligence      (Maps Agent)
Phase 5 — Network & Link Analysis             (Network Agent)
Phase 6 — Strategic Intelligence Hub          (Intel Agent)
Phase 7 — Intel Graph Workspace               (Intel Graph Agent)
Phase 8 — Admin & Data Operations             (Admin Agent)
Phase 9 — Polish, Responsive & Demo Flow      (QA Agent)
```

---

## 3. Phase 0 — Scaffold, Shell & Design System

### Goal
A working app skeleton that renders the shell with navigation, theme, and shared components.

### Ownership
**Goliath** — exclusive ownership of all files created in this phase. Many of these files become **frozen** after Phase 0.

### 📖 Read First
- `DESIGN_SYSTEM.md` — all tokens, glass formula, animation tokens
- `ARCHITECTURE.md` — route map, shell layout, data flow
- `COMPONENT_INVENTORY.md` — layout components, data display, UI kit
- `STATE_AND_API.md` — store interfaces, API client, mock infrastructure

### Build Order (Execute in Sequence)

#### Step 0.1 — Vite + React 19 + TypeScript Scaffold
```
Command: npm create vite@latest frontend -- --template react-ts
Then:    cd frontend && npm install
```

**Dependencies to install:**
```bash
npm install react-router-dom @tanstack/react-query zustand axios recharts
npm install lucide-react sonner @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs
npm install clsx tailwind-merge class-variance-authority
npm install -D @types/node
```

**Key config files to create:**
- `vite.config.ts` — with path aliases (`@/` → `src/`)
- `tsconfig.json` — strict mode, path aliases
- `tailwind.config.ts` — v4 CSS-based config
- `postcss.config.js`

#### Step 0.2 — Tailwind v4 + shadcn/ui Setup
- Configure `globals.css` with Tailwind v4 `@import "tailwindcss"` directive
- Set up CSS custom properties in `globals.css`

#### Step 0.3 — Theme Tokens (`globals.css`) 🔒 FROZEN
Implement ALL design tokens from DESIGN_SYSTEM.md sections 2-8:
- Surface colors (background, surface, elevated, border, text)
- Accent colors (gold, crime-red/amber, cyber-cyan/teal, network-magenta/purple, intel-violet)
- Severity colors (extreme, high, medium, low)
- Typography (Inter, JetBrains Mono, Noto Sans Kannada imports)
- Type scale (text-xs through text-4xl)
- Spacing (4px grid)
- Elevation shadows (surface-0 through surface-5)
- Border radius tokens
- Animation tokens (transition-fast through transition-spin)
- Glass card utility class

**After this step, NO agent may add or override tokens in this file.**

#### Step 0.4 — Zustand Stores (`stores/`) 🔒 FROZEN INTERFACES
Create four stores matching STATE_AND_API.md section 2:

1. **`stores/authStore.ts`** — user, token, isAuthenticated, login/logout/refreshToken/hasPermission
2. **`stores/navStore.ts`** — activeSection, sidebarCollapsed, breadcrumbs, navigateTo/toggleSidebar/setBreadcrumbs/goBack
3. **`stores/uiStore.ts`** — theme ('dark'), rightPanel state, modalStack, toasts, openRightPanel/closeRightPanel/pushModal/popModal/addToast/dismissToast
4. **`stores/filterStore.ts`** — globalDateRange, globalDistrict, filters per domain (crimeFilters, cyberFilters, mapFilters, networkFilters), setGlobalDateRange/setGlobalDistrict/setCrimeFilters/setCyberFilters/resetFilters

**Interfaces are frozen. Implementation can be extended (e.g., adding actions) but interface shapes must match exactly.**

#### Step 0.5 — React Router + Route Definitions (`router/`) 🔒 FROZEN
- Create `router/routes.tsx` with ALL 40+ routes from ARCHITECTURE.md section 2
- Use `React.lazy()` for code splitting on every page
- Create `router/ProtectedRoute.tsx` — reads authStore, redirects to login if unauthenticated, checks role if specified
- Create `router/AppRoutes.tsx` — assembles all routes

#### Step 0.6 — AppShell + Layout (`shared/layout/`) 🔒 FROZEN
Build the full AppShell from ARCHITECTURE.md section 1:

1. **`shared/layout/AppShell.tsx`** — TopHeader + SidebarNav + SectionToolbar + Outlet + RightContextPanel + FooterBar
2. **`shared/layout/TopHeader.tsx`** — KSP branding, ULTRON identity, role chip, global search, notification bell, user menu
3. **`shared/layout/SidebarNav.tsx`** — Collapsible nav rail with all sections, active state, icons
4. **`shared/layout/SidebarItem.tsx`** — Individual nav item with icon, label, badge, active/inactive/disabled states
5. **`shared/layout/SectionToolbar.tsx`** — Breadcrumbs + filter dropdowns + search + actions (context-driven per route)
6. **`shared/layout/RightContextPanel.tsx`** — Slide-in drawer, content driven by uiStore
7. **`shared/layout/FooterBar.tsx`** — Data freshness indicator

#### Step 0.7 — Page Placeholder Components
Create minimal placeholder files for every route. Each should render:
```tsx
export default function PageName() {
  return <PageHeader title="Page Name" subtitle="Coming soon" />;
}
```

This ensures routes don't 404 and lazy loading works.

#### Step 0.8 — Mock Mode Infrastructure (`shared/`)
- **`shared/config.ts`** — `MOCK_MODE` flag from `VITE_MOCK_MODE` env var
- **`shared/api/client.ts`** 🔒 FROZEN — Axios instance with interceptors, conditional mock fetch (`apiGet<T>()`)
- **`shared/api/mock/handlers.ts`** — Registry mapping query keys to mock JSON imports
- **`shared/api/error-handler.ts`** — `normalizeApiError()` function
- **`shared/api/dto-adapters/`** stub files per domain

#### Step 0.9 — ErrorBoundary + NotFoundPage
- **`shared/components/ErrorBoundary.tsx`** — Class component, catches errors, renders ErrorState
- **`pages/NotFoundPage.tsx`** — Fullscreen 404 with navigation back

#### Step 0.10 — Shared UI Kit (`shared/ui-kit/`) 🔒 FROZEN
Build these primitives matching DESIGN_SYSTEM component feel specs:
- `Button` — variants (primary, secondary, ghost, danger), sizes, loading state
- `Input` — base input with label, error state, disabled
- `Badge` — colored pill, variants matching StatusBadge/SeverityBadge/RiskBadge patterns
- `Modal` — dark overlay, centered card, slide-up entrance, close on escape
- `Drawer` (SlideOver) — slide from right, semi-transparent overlay, close on outside click
- `Select` (FilterDropdown) — dropdown with single/multi select
- `SearchInput` — glass surface, magnifying glass, clear button, keyboard shortcut hint

#### Step 0.11 — Shared Data Display (`shared/components/`) 🔒 FROZEN
- `KpiCard` — glass surface, gold top-border accent, count-up animation, trend indicator, clickable
- `TrendCard` — mini Recharts area chart in glass card
- `AlertFeed` + `AlertItem` — scrollable alert list with severity dots
- `StatusBadge` — colored pill (open=red, investigating=yellow, resolved=green)
- `SeverityBadge` — colored by severity level
- `RiskBadge` — auto-determines tier from score
- `MetricDelta` — inline trend indicator (up/down/flat)
- `InsightCard` — AI brief card for intel hub

#### Step 0.12 — Shared State Components (`shared/components/`) 🔒 FROZEN
- `LoadingSkeleton` — variant prop: 'card' | 'table-row' | 'chart' | 'map' | 'text', shimmer animation
- `EmptyState` — icon + title + description + optional action button
- `ErrorState` — red-tinted card, error icon, message, retry button

#### Step 0.13 — Dashboard Mock Data (`mocks/`)
- `mocks/dashboard-stats.json` — realistic KPI values, trend data, alerts

### ✅ Phase 0 Verification Checklist

Run through each item. Fix all failures before reporting completion.

- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` produces ZERO type errors
- [ ] `npm run build` succeeds
- [ ] Dark theme renders with all design tokens visible
- [ ] All 40+ routes navigate correctly (placeholder content loads)
- [ ] Sidebar nav collapses/expands, shows correct active state
- [ ] SectionToolbar renders with breadcrumbs
- [ ] ErrorBoundary catches errors and displays ErrorState
- [ ] LoadingSkeleton renders with shimmer animation
- [ ] EmptyState renders with icon + message
- [ ] ErrorState renders with retry button
- [ ] KpiCard shows count-up animation
- [ ] UI Kit components (Button, Input, Badge, Modal, Drawer) render correctly
- [ ] Mock mode flag is functional (toggling `VITE_MOCK_MODE` works)
- [ ] Globals.css has all DESIGN_SYSTEM tokens (no missing custom properties)
- [ ] Glass card utility renders with correct formula
- [ ] No console errors in browser

### Report Format

When done, report to ALPHA:
```
PHASE 0 COMPLETE
────────────────
Files created: [count]
TypeScript errors: 0
Build: ✅ Passes
Verification: ✅ All [N] checks passed
Demo state: ULTRON shell renders with dark theme, nav, routing, shared components
Next: Awaiting permission for Phase 1
```

### ⏸ STOP — Ask for permission before Phase 1

---

## 4. Phase 1 — Command Center + Unified Dashboard

(Will be provided after Phase 0 is approved and complete.)

---

## 5. General Instructions for All Phases

### UI Quality — Never Compromise

| Rule | Enforcement |
|:----:|-------------|
| **Every data-dependent view** must have loading, empty, error, AND loaded states | ✅ Mandatory |
| **Use shared components** — never build alternatives to KpiCard, DataTable, StatusBadge, LoadingSkeleton, EmptyState, ErrorState | ✅ Mandatory |
| **Use DESIGN_SYSTEM tokens** — never use inline colors, spacing, or radii | ✅ Mandatory |
| **Use glass card formula** — never create a variant | ✅ Mandatory |
| **Use animation tokens** — never add ad hoc durations or easings | ✅ Mandatory |
| **All icons from Lucide** — except custom SVG for graph/map nodes | ✅ Mandatory |

### Code Quality

| Rule | Detail |
|:----:|--------|
| TypeScript strict mode | `strict: true` in tsconfig |
| No `any` types | Use proper types or `unknown` with guards |
| Lazy loading | Every page via `React.lazy()` |
| Named exports | Prefer named exports over default exports for components |
| CSS modules / Tailwind | No inline styles except dynamic values |
| File naming | `PascalCase` for components, `camelCase` for hooks/utils, `kebab-case` for data files |

### If You Get Stuck

1. Check the planning docs listed in the phase brief
2. Check if a shared component already exists that fits your need
3. If something is unclear about architecture, ask ALPHA — do not guess
4. If a frozen file needs a change, flag it to ALPHA — do not modify it yourself

---

*This guide is your contract. Follow it precisely. Build slowly. Verify thoroughly. Stop at every gate. Quality over speed.*
