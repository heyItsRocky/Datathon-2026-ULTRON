# PAGE SPECS — ULTRON Frontend

> Version 2.0 · June 2026
> Purpose: Specify every page in the application — what it shows, what blocks it contains, what interactions it supports, what states it handles, and which agent owns building it.

---

## 0. Page Ownership & Parallelization Rules

| Page Type | Owner | Parallel? | Constraint |
|-----------|-------|-----------|------------|
| Command Center Landing | Foundation agent (Phase 1) | — | Must be built before any AppShell page |
| Dashboard | Foundation agent (Phase 1) | — | Foundation for all KPI patterns |
| Crime pages | Crime agent (Phase 2) | Serial within phase | Build list → detail → profile → MO |
| Cyber pages | Cyber agent (Phase 3) | Serial within phase | Build list → detail → IP → domain → threats |
| Map pages | Maps agent (Phase 4) | Serial within phase | Build base map → layers → drill-down |
| Network pages | Network agent (Phase 5) | Serial within phase | Build crime graph → cyber graph → correlation |
| Intelligence pages | Intel agent (Phase 6) | Serial within phase | Build hub → briefs → trends → zones |
| Intel Graph | Intel Graph agent (Phase 7) | Independent | Can be built in parallel with Phases 5 or 6 |
| Admin pages | Admin agent (Phase 8) | Independent | Lowest priority, built last |
| Data Ops pages | Admin agent (Phase 8) | Independent | Lowest priority, built last |

**Shared across pages (must be built before any page phase):**
- SectionToolbar
- RightContextPanel
- LoadingSkeleton, EmptyState, ErrorState

These are built in Phase 0 by the Foundation agent.

---

## 1. Command Center Landing

| Property | Value |
|----------|-------|
| **Route** | `/command-center` |
| **Layout** | Fullscreen (no AppShell) |
| **Role access** | All (public) |
| **Entry point** | Default redirect after login |
| **Owner** | Foundation agent (Phase 1) |

### Layout Blocks

```
┌─────────────────────────────────────────────────────────────────┐
│  COMMAND CENTER LANDING                                         │
│  (Fullscreen, no shell)                                         │
│                                                                   │
│  ┌─ KSP Branding Line ────────────────────────────────────────┐ │
│  │  [KSP Logo]  |  CM + Dy CM Photos  |  ULTRON Title         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ 4-Ring Radial Navigation ─────────────────────────────────┐ │
│  │                                                             │ │
│  │          ┌── Gold ──┐  (Dashboard)                         │ │
│  │        ╱              ╲                                     │ │
│  │      ╱  Teal            ╲  (Maps)                           │ │
│  │     │                     │                                  │ │
│  │     │   [KSP Emblem]     │                                  │ │
│  │     │                     │                                  │ │
│  │      ╲  Purple          ╱   (Network)                       │ │
│  │        ╲              ╱                                     │ │
│  │          └── Red ────┘   (Intelligence)                     │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ Quick Stats Strip ────────────────────────────────────────┐ │
│  │  Total Crimes  │  Alerts Today  │  Active Cases  │  Cyber   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ Emergency Contacts Footer ────────────────────────────────┐ │
│  │  112 │ 100 │ 101 │ 108 │ 1070 │ 1091 │ 1098 │ 1930 │ 14567 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Interactions
- Click ring segment → anime.js transition to corresponding section
- Hover ring → segment brightens, slight scale pulse
- Stats strip shows live data with count-up animation
- Login state: if authenticated, auto-navigate to `/dashboard` on second visit

### States
| State | Behavior |
|-------|----------|
| Loading | Rings skeleton, emblem pulse animation |
| Loaded | Rings animate in (staggered scale), stats count up |
| Authenticated | Show "Enter Workspace" as a fifth central option |
| Unauthenticated | Show login prompt below rings |

---

## 2. Unified Dashboard

| Property | Value |
|----------|-------|
| **Route** | `/dashboard` |
| **Layout** | AppShell |
| **Role access** | All |
| **Owner** | Foundation agent (Phase 1) |

### Data Dependencies
- `useDashboardStats()` — KPIs, trends, alerts
- `useRedZones()` — active red-zone districts
- `useEmergingTrends(30)` — top emerging crime types

### Layout Blocks

```
┌─ KPI Row ──────────────────────────────────────────────────────┐
│ [Total Crimes] [Active Cases] [Alerts Today] [Cyber Incidents]  │
│  12,450 ↑8%     234 ↓3%        17 ↑12%        89 ↑5%           │
└────────────────────────────────────────────────────────────────┘
┌─ Main Content ─────────────────────────────────────────────────┐
│ ┌─ Combined Trend Chart ─────────┐ ┌─ District Risk Ranking ─┐│
│ │  30-day crime + cyber trend    │ │  #  District     Score   ││
│ │  (Recharts area chart, dual    │ │  1  Bengaluru    87      ││
│ │   series, gold + cyan fills)   │ │  2  Mysuru       72      ││
│ └────────────────────────────────┘ │  3  Belagavi     68      ││
│                                   │  ...                       ││
│ ┌─ Anomaly Feed ────────────────┐ │ └─────────────────────────┘│
│ │  ⚠ Bengaluru Urban — thefts   │                              │
│ │    ↑40% above baseline        │ ┌─ Quick Actions ─────────┐ │
│ │  ⚠ Belagavi — cyber incidents │ │  [Add Crime] [MO Match] │ │
│ │    ↑25% MoM                    │ │  [Upload Data] [Scrape] │ │
│ └────────────────────────────────┘ └─────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton grid matching KPI + chart layout |
| Empty | "Welcome to ULTRON. Upload data or trigger a scrape to begin." |
| Error | "Dashboard data unavailable. Retry or check system status." + [Retry] |
| Populated | Full dashboard with interactive charts |

---

## 3. Crime List Page

| Property | Value |
|----------|-------|
| **Route** | `/crime/cases` |
| **Layout** | AppShell |
| **Role access** | All (Admin/Sudo can edit/delete) |
| **Owner** | Crime agent (Phase 2) |

### Data Dependencies
- `useCrimeList(filters)` — paginated crime records

### Layout Blocks

```
┌─ Section Toolbar ──────────────────────────────────────────────┐
│  [← Back to Crime]  [Date Range]  [District ▼]  [Type ▼]      │
│  [Status ▼]  [Search…]  [Export CSV]  [+ Add Crime]           │
└────────────────────────────────────────────────────────────────┘
┌─ Table ────────────────────────────────────────────────────────┐
│  FIR No.  │ Type    │ District     │ Date       │ Status    │ ≡ │
│ ─────────┼─────────┼──────────────┼────────────┼───────────┼───┤
│ KSP/001  │ Murder  │ Bengaluru    │ 2025-01-15 │ Open      │ ⋮ │
│ KSP/002  │ Theft   │ Mysuru       │ 2025-01-16 │ Resolved  │ ⋮ │
│ ...      │         │              │            │           │   │
└────────────────────────────────────────────────────────────────┘
┌─ Pagination ───────────────────────────────────────────────────┐
│  Showing 1-25 of 512  ◀ 1 2 3 … 21 ▶                           │
└────────────────────────────────────────────────────────────────┘
```

### Interactions
- Click row → navigate to `/crime/cases/:id`
- Click ⋮ → dropdown: View, Edit, Delete
- Click [+ Add Crime] → slide-in form panel
- Export CSV → downloads filtered data

### States
| State | Behavior |
|-------|----------|
| Loading | Table skeleton with 10 shimmer rows |
| Empty | "No crime records match your filters. Try adjusting the date range or adding a new case." |
| Error | "Unable to load crime records. Check your connection." + [Retry] |
| Populated | Full interactive table |

---

## 4. Crime Detail Page

| Property | Value |
|----------|-------|
| **Route** | `/crime/cases/:id` |
| **Layout** | AppShell |
| **Role access** | All |
| **Owner** | Crime agent (Phase 2) |

### Data Dependencies
- `useCrimeDetail(id)` — full case detail

### Layout Blocks

```
┌─ Back + Status Bar ────────────────────────────────────────────┐
│  [← Crime Cases]  FIR: KSP/2025/001  [Status: Investigating]  │
│  [Edit] [Delete] [Link to Network] [Link to Map]              │
└────────────────────────────────────────────────────────────────┘
┌─ Two-Column Layout ────────────────────────────────────────────┐
│ ┌─ Case Information ──────────┐ ┌─ Map Location ─────────────┐│
│ │  Type: Murder               │ │                            ││
│ │  Date: 2025-01-15  22:30    │ │  [Leaflet map with crime   ││
│ │  District: Bengaluru City   │ │   pin at this location]    ││
│ │  Location: MG Road,         │ │                            ││
│ │            Bengaluru         │ │                            ││
│ │  Status: Under Investigation│ └────────────────────────────┘│
│ │  Description: Stabbing      │                                │
│ │  during robbery at          │ ┌─ Quick Info ──────────────┐ │
│ │  electronics store          │ │  Risk Level: HIGH         │ │
│ └─────────────────────────────┘ │  MO: Armed robbery,       │ │
│                                 │      stabbing             │ │
│ ┌─ Timeline ───────────────────┐│  Linked Criminals: 2     │ │
│ │  📅 15 Jan — Incident        ││  Victim: Prakash Singh   │ │
│ │  📅 16 Jan — FIR registered  │└──────────────────────────┘ │
│ │  📅 17 Jan — Investigation   │                               │
│ │  ...                          │                               │
│ └──────────────────────────────┘                               │
│                                 ┌─ Linked Evidence ─────────┐ │
│                                 │  📄 FIR Scan (PDF)        │ │
│                                 │  📷 Scene Photo (JPG)     │ │
│                                 │  🎥 CCTV Footage (MP4)    │ │
│                                 └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Criminal Detail Page

| Property | Value |
|----------|-------|
| **Route** | `/crime/criminals/:id` |
| **Layout** | AppShell |
| **Role access** | All |
| **Owner** | Crime agent (Phase 2) |

### Layout Blocks

```
┌─ Criminal Profile Header ──────────────────────────────────────┐
│  [Photo]  Name: Ravi Kumar        Risk: [HIGH] ● 85/100       │
│           Alias: "Ravi"           Priors: 5                    │
│           DOB: 1990-05-12         District: Bengaluru City     │
└────────────────────────────────────────────────────────────────┘
┌─ Two-Column ───────────────────────────────────────────────────┐
│ ┌─ Associated Crimes ──────────┐ ┌─ Network Graph ───────────┐│
│ │  2025-001  Murder     Open   │ │                            ││
│ │  2024-088  Theft     Resolved│ │  [Cytoscape graph —       ││
│ │  2024-032  Assault   Resolved│ │   this criminal's         ││
│ │  2023-155  Robbery   Resolved│ │   connections]             ││
│ │  2023-012  Burglary  Resolved│ │                            ││
│ └──────────────────────────────┘ └────────────────────────────┘│
│ ┌─ MO Profile ──────────────────┐ ┌─ Risk Factors ───────────┐│
│ │  Signature: Armed robbery     │ │  Age: 35 (HIGH)          ││
│ │  at night, targets           │ │  Priors: 5 (HIGH)        ││
│ │  electronics stores           │ │  Crime type: VIOLENT     ││
│ │  Matched cases: 3             │ │  Associates: 2 (MEDIUM)  ││
│ └──────────────────────────────┘ └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. MO Matcher Page

| Property | Value |
|----------|-------|
| **Route** | `/crime/mo-matcher` |
| **Layout** | AppShell |
| **Role access** | Sudo, Admin |
| **Owner** | Crime agent (Phase 2) |

### Layout Blocks

```
┌─ Description Input ────────────────────────────────────────────┐
│  Paste FIR/MO description:                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "The suspect entered the store at 11 PM, brandished a   │   │
│  │ knife, demanded cash, and fled on a motorcycle..."       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [Crime Type: ▼] [District: ▼]  [🔍 Find Matches]             │
└────────────────────────────────────────────────────────────────┘
┌─ Results ──────────────────────────────────────────────────────┐
│  Top MO matches:                                                │
│  ┌───────────────────────┬───────┬──────────┬───────────────┐  │
│  │ Criminal              │ Match │  Priors  │ Similar Cases │  │
│  ├───────────────────────┼───────┼──────────┼───────────────┤  │
│  │ Venkatesh (CR-002)    │ 87%   │  3       │  2            │  │
│  │ Kumar (CR-015)        │ 72%   │  7       │  4            │  │
│  │ ...                   │       │          │               │  │
│  └───────────────────────┴───────┴──────────┴───────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. IP Intelligence Page

| Property | Value |
|----------|-------|
| **Route** | `/cyber/ip/:ip` |
| **Layout** | AppShell |
| **Role access** | All |
| **Owner** | Cyber agent (Phase 3) |

### Layout Blocks

```
┌─ IP Header ────────────────────────────────────────────────────┐
│  🌐 192.168.1.100   Reputation: [HIGH RISK] ● 23/100         │
│  [Enrich Now] [Add to Investigation] [Copy]                   │
└────────────────────────────────────────────────────────────────┘
┌─ Three-Column Intelligence ────────────────────────────────────┐
│ ┌─ Geolocation ────┐ ┌─ Network Info ──┐ ┌─ Threat Data ──┐ │
│ │  City: Bengaluru │ │  ISP: BSNL      │ │  Risk Level: 78│ │
│ │  Region: KA      │ │  ASN: AS9829    │ │  Incidents: 5  │ │
│ │  Country: IN     │ │  Org: BSNL Ltd  │ │  First Seen:   │ │
│ │  Lat: 12.97      │ │  Type: Broadband│ │  2024-08-12    │ │
│ │  Lng: 77.59      │ └─────────────────┘ │  Last Seen:    │ │
│ └──────────────────┘                      │  2025-06-20    │ │
│                                           └────────────────┘ │
│ ┌─ Associated Incidents ────────────────────────────────────┐ │
│ │  CYB/2025/001  Phishing    192.168.1.100 → bank-secure    │ │
│ │  CYB/2025/012  Hacking     192.168.1.100 → corpdata.in    │ │
│ └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Karnataka Map Page

| Property | Value |
|----------|-------|
| **Route** | `/maps/state` |
| **Layout** | AppShell (wide mode) |
| **Role access** | All |
| **Owner** | Maps agent (Phase 4) |

### Layout Blocks

```
┌─ Full-Width Map ───────────────────────────────────────────────┐
│  ┌─ Layer Controls (top-right overlay) ───────────────────┐   │
│  │  ☑ Crime Pins    ☑ Hotspots    ☐ Red Zones             │   │
│  │  ☐ Predictive    ☐ Literacy    ☐ Police Stations       │   │
│  │  [Time: All ▼]   [Crime Type: All ▼]   [Clear]       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │      [Karnataka map with district polygons]             │  │
│  │                                                         │  │
│  │      [Crime pins colored by type]                       │  │
│  │      [Hotspot clusters as semi-transparent circles]     │  │
│  │      [Red-zone districts pulsing]                       │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─ Stats Panel (bottom-right overlay) ───────────────────┐   │
│  │  Selected District: Bengaluru City                     │   │
│  │  Total Crimes: 1,250     Trend: ↑8%                    │   │
│  │  Top Crime: Theft (34%)  Risk Level: HIGH              │   │
│  │  [View Details →]                                      │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Interactions
- Click district → select + show overlay info panel
- Double-click district → navigate to `/maps/district/:id`
- Toggle layers → map re-renders with active layers
- Hover cluster → tooltip: crime count, top types, peak time
- Time slider → animate map through time periods

---

## 9. District Drilldown Page

| Property | Value |
|----------|-------|
| **Route** | `/maps/district/:districtId` |
| **Layout** | AppShell |
| **Role access** | All |
| **Owner** | Maps agent (Phase 4) |

### Layout Blocks

```
┌─ District Header ──────────────────────────────────────────────┐
│  Bengaluru City  |  Crimes: 1,250  |  Risk: HIGH  |  ↑8% MoM │
│  [Compare with… ▼]  [Export Report]                            │
└────────────────────────────────────────────────────────────────┘
┌─ Intelligence Grid ────────────────────────────────────────────┐
│ ┌─ Crime Breakdown ──────────┐ ┌─ 30-Day Trend ─────────────┐ │
│ │  Theft        34%   ███████│ │  [Recharts area chart]      │ │
│ │  Assault      22%   █████  │ │                             │ │
│ │  Burglary     18%   ████   │ └────────────────────────────┘ │
│ │  Cyber         8%   ██     │                                │
│ │  Murder        5%   █      │ ┌─ Socio-Economic ──────────┐ │
│ └─────────────────────────────┘ │  Literacy: 91.2%          │ │
│                                │  Poverty: 8.3%            │ │
│ ┌─ Hotspots ─────────────────┐ │  Density: 12,000/km²      │ │
│ │  [Mini leaflet map with    │ │  Police: 85 stations       │ │
│ │   this district's clusters] │ └────────────────────────────┘ │
│ └────────────────────────────┘                                │
│                                ┌─ Top Criminals ────────────┐ │
│ ┌─ MO Patterns ──────────────┐ │  1. Ravi Kumar — 5 priors │ │
│ │  Armed robbery at night    │ │  2. Venkatesh — 3 priors  │ │
│ │    — 12 matches             │ │  3. ...                   │ │
│ │  Chain snatching,          │ └────────────────────────────┘ │
│ │    daytime — 8 matches      │                               │
│ └─────────────────────────────┘                               │
└────────────────────────────────────────────────────────────────┘
```

---

## 10. Network Graph Pages

### Crime Network (`/network/crime`) — Owner: Network agent (Phase 5)

```
┌─ Graph Toolbar ────────────────────────────────────────────────┐
│  [Graph: Crime ▼]  [Search entity…]  [Filter by type ▼]       │
│  [Timeline: 2024 ───●─── 2026]  [Layout: ▼]                   │
└────────────────────────────────────────────────────────────────┘
┌─ Full-Height Canvas ──────────────────────────────────────────┐
│  [Cytoscape graph with:]                                       │
│    - Criminal nodes (red circle, sized by priors count)        │
│    - Victim nodes (blue diamond)                               │
│    - Crime nodes (orange square, typed)                       │
│    - Edges labeled by relationship                             │
│    - MO-match edges highlighted (thicker, pulsing)            │
│    - Click node → highlight connections + show detail panel   │
└────────────────────────────────────────────────────────────────┘
┌─ Node Detail Panel (right side, slide-in) ────────────────────┐
│  Name: Ravi Kumar                                              │
│  Type: Criminal  ● Risk: HIGH (85/100)                        │
│  Crimes: 5  |  Associates: 3  |  MO Match: 87%               │
│  [View Profile →]  [View Cases →]  [Jump to Map →]           │
└────────────────────────────────────────────────────────────────┘
```

### Cyber Network (`/network/cyber`) — Owner: Network agent (Phase 5)

```
┌─ Graph Toolbar ────────────────────────────────────────────────┐
│  [Graph: Cyber ▼]  [Search IP/domain…]  [Threat Level: ▼]     │
│  [Timeline]  [Layout: ▼]                                       │
└────────────────────────────────────────────────────────────────┘
┌─ Full-Height Canvas ──────────────────────────────────────────┐
│  [Cytoscape graph with:]                                       │
│    - IP nodes (cyan, sized by incident count)                  │
│    - Domain nodes (yellow, threat-colored border)             │
│    - Server nodes (gray, hexagon)                              │
│    - Victim nodes (blue, human icon)                           │
│    - Attack path highlighted (red, animated dash)             │
│    - Edge thickness by connection strength                    │
└────────────────────────────────────────────────────────────────┘
```

### Correlation Graph (`/network/correlation`) — Owner: Network agent (Phase 5)

Combines crime + cyber into a unified view showing cross-domain connections (e.g., a criminal who also appears in cyber evidence).

---

## 11. Strategic Intelligence Hub

| Property | Value |
|----------|-------|
| **Route** | `/intelligence` |
| **Layout** | AppShell |
| **Role access** | All (designed for senior officers) |
| **Owner** | Intel agent (Phase 6) |

### Layout Blocks

```
┌─ Hero Brief ───────────────────────────────────────────────────┐
│  [🧠 Strategic Intelligence Brief — 24 Jun 2026]               │
│  3 active red zones · 5 emerging trends · 2 high-risk districts│
└────────────────────────────────────────────────────────────────┘
┌─ Command View ─────────────────────────────────────────────────┐
│ ┌─ Predictive Risk Map ─────┐ ┌─ Socio-Economic Correlations┐ │
│ │  [Small Leaflet map with  │ │  Crime vs Literacy: -0.72   │ │
│ │   tomorrow's risk zones   │ │  [scatter plot]              │ │
│ │   overlaid in red heat     │ │  Crime vs Poverty: +0.68   │ │
│ │   gradient]                │ │  [scatter plot]              │ │
│ └────────────────────────────┘ └────────────────────────────┘ │
│ ┌─ Top 5 Emerging Trends ───┐ ┌─ Red-Zone Districts ───────┐ │
│ │  #1  Cyber fraud   +45%   │ │  Bengaluru Urban  [HIGH]   │ │
│ │  #2  Chain snatch +32%   │ │  Belagavi         [MEDIUM] │ │
│ │  #3  DV cases     +28%   │ │  Mysuru            [MEDIUM] │ │
│ │  #4  Burglary     +15%   │ │  Hubli             [LOW]   │ │
│ │  #5  Vehicle theft +12%  │ │  ...                        │ │
│ └────────────────────────────┘ │                    [View All]│ │
│                                └────────────────────────────┘ │
│ ┌─ AI-Generated Brief Cards ────────────────────────────────┐ │
│ │  🧠 "Bengaluru Urban cyber frauds up 45% MoM — correlation │ │
│ │     detected with new phishing domain registrations."      │ │
│ │  🧠 "Chain snatching hotspots shifting to evening hours   │ │
│ │     in Mysuru — consider patrol timing adjustment."        │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 12. Intel Graph Workspace

| Property | Value |
|----------|-------|
| **Route** | `/intel-graph` |
| **Layout** | AppShell (wide, minimal chrome) |
| **Role access** | Sudo, Admin |
| **Owner** | Intel Graph agent (Phase 7) |

### Layout Blocks

```
┌─ Action Bar ───────────────────────────────────────────────────┐
│  [💾 Save]  [📥 Export JSON]  [📂 Load Template ▼]  [🗑 Clear]│
│  Nodes: 7  Edges: 5  [Graph Name: Untitled]                    │
└────────────────────────────────────────────────────────────────┘
┌─ Split Layout ─────────────────────────────────────────────────┐
│ ┌─ Node Palette (left) ──┐ ┌─ Canvas ───────────────────────┐ │
│ │  Drag to add:           │ │                                │ │
│ │                         │ │  [React Flow canvas —         │ │
│ │  [IP]      (cyan)      │ │   dark background, dot grid]   │ │
│ │  [Name]    (red)       │ │                                │ │
│ │  [Place]   (green)     │ │  [Nodes with colored borders  │ │
│ │  [Object]  (orange)    │ │   by type, connection handles] │ │
│ │  [How]     (purple)    │ │                                │ │
│ │  [Why]     (pink)      │ │  [Edges with labels]           │ │
│ │  [What]    (yellow)    │ │                                │ │
│ └─────────────────────────┘ └────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
┌─ Bottom Bar ───────────────────────────────────────────────────┐
│  📄 Report Preview: "IP 192.168.1.100 → connected to Ravi      │
│  Kumar via phishing method."                                   │
└────────────────────────────────────────────────────────────────┘
┌─ Right Panel (slides open on node click) ──────────────────────┐
│  [IP Node]      ● #06b6d4                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  IP Address: 192.168.1.100                              │   │
│  │  ISP: BSNL                                              │   │
│  │  Geolocation: Bengaluru, India                          │   │
│  │  Timestamp: 2025-02-01 14:30:00                        │   │
│  │                                                         │   │
│  │  [💾 Save]  [🗑 Delete]                                 │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 13. Data Upload Page

| Property | Value |
|----------|-------|
| **Route** | `/data/upload` |
| **Layout** | AppShell |
| **Role access** | Sudo, Admin |
| **Owner** | Admin agent (Phase 8) |

### Layout Blocks

```
┌─ Upload Zone ──────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │   📂 Drag & drop CSV or JSON files here                 │   │
│  │   or click to browse                                    │   │
│  │                                                         │   │
│  │   Supported: Crime records, Criminal profiles,          │   │
│  │              Cyber incidents, District data              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
┌─ Validation Preview ───────────────────────────────────────────┐
│  File: crime_records.csv  |  Size: 2.4 MB  |  Rows: 512       │
│  Schema: ✅ FIR_No, District, Crime_Head, Date, Time, Lat, Lng │
│  Warnings: 3 rows missing District — will be skipped           │
│  ┌─ Preview (first 5 rows) ───────────────────────────────┐   │
│  │  FIR_No     │ District    │ Crime_Head  │ Date         │   │
│  │  KSP/001    │ Bengaluru   │ Murder      │ 2025-01-15   │   │
│  │  ...        │             │             │              │   │
│  └────────────────────────────────────────────────────────┘   │
│  [Upload] [Cancel]                                             │
└────────────────────────────────────────────────────────────────┘
```

---

## 14. Admin — System Health Page

| Property | Value |
|----------|-------|
| **Route** | `/admin/system` |
| **Layout** | AppShell |
| **Role access** | Admin only |
| **Owner** | Admin agent (Phase 8) |

### Layout Blocks

```
┌─ System Status Grid ───────────────────────────────────────────┐
│ ┌─ API Health ───────┐ ┌─ Database ────────┐ ┌─ ML Models ──┐ │
│ │  ✅ Crime API      │ │  ✅ Connected     │ │  ✅ RF Risk  │ │
│ │  ✅ Cyber API      │ │  ⚠ Latency: 45ms │ │  ✅ DBSCAN   │ │
│ │  ✅ Auth API       │ │  Size: 2.3 GB    │ │  ⚠ ARIMA     │ │
│ │                    │ │                  │ │  ✅ IF Anomaly│ │
│ │                    │ │                  │ │  ✅ Phishing  │ │
│ ├────────────────────┤ ├──────────────────┤ └──────────────┘ │
│ │  ✅ All APIs up    │ │  ✅ Connected    │                   │
│ └────────────────────┘ └──────────────────┘                   │
└────────────────────────────────────────────────────────────────┘
```

---

## 15. Remaining Pages (Summary)

Each remaining page follows the same pattern as the ones above.

| Page | Route | Key Data | Key Component | Owner |
|------|-------|----------|---------------|-------|
| Crime Dashboard | `/crime` | Crime stats, recent cases, alerts | KpiCard, TrendCard, AlertFeed | Crime Agent |
| Criminal List | `/crime/criminals` | Criminal table, search | CriminalTable, SearchInput | Crime Agent |
| Cyber Dashboard | `/cyber` | Cyber KPIs, recent incidents, threat feed | KpiCard, CyberFeed | Cyber Agent |
| Cyber Incident List | `/cyber/incidents` | Incident table, filters | CyberIncidentTable | Cyber Agent |
| Cyber Incident Detail | `/cyber/incidents/:id` | Full incident breakdown | IncidentDetailCard, EvidenceChain | Cyber Agent |
| Domain Intelligence | `/cyber/domain/:domain` | WHOIS, SSL, DNS, threat score | DomainCard, WhoisTable, DnsRecords | Cyber Agent |
| Network Flow | `/cyber/flows` | Flow table, search | FlowTable, FlowDetail | Cyber Agent |
| Threat Intelligence | `/cyber/threats` | Correlated threats across cases | ThreatCard, CorrelationList | Cyber Agent |
| Evidence Tracker | `/cyber/evidence` | Evidence chain-of-custody | EvidenceTable, ChainOfCustody | Cyber Agent |
| Predictive Risk Map | `/maps/predictive` | Tomorrow's risk zones overlay | PredictiveRiskLayer, MapLegend | Maps Agent |
| Socio-Economic Map | `/maps/socio-economic` | Literacy/poverty overlays | SocioEconomicOverlayPanel | Maps Agent |
| Emerging Trends | `/intelligence/trends` | Trend data, charts | TrendCard, TrendChart | Intel Agent |
| Predictive Zones | `/intelligence/predictive-zones` | Zone list, confidence scores | PredictiveZoneCard | Intel Agent |
| Red Zones | `/intelligence/red-zones` | Active red-zone districts | RedZonePanel, RedZoneTable | Intel Agent |
| Scrape Source Manager | `/data/sources` | Source list, add/edit/trigger | ScrapeSourceCard | Admin Agent |
| Ingestion Logs | `/data/ingestion` | Job history, status | IngestionTable | Admin Agent |
| User Management | `/admin/users` | User table, role editor | RoleMatrix, UserTable | Admin Agent |
| ML Model Status | `/admin/models` | Model list, health, retrain button | MlModelCard | Admin Agent |
| Audit Log | `/admin/audit` | Timeline of all system actions | AuditLogTimeline | Admin Agent |
| Admin Overview | `/admin` | Quick system summary | SystemHealthPanel | Admin Agent |

---

*This document defines every page in the application and which agent owns building it. Each page spec is derived from the Architecture and Design System documents. Version 2.0 adds agent ownership per page, parallelization rules, and shared-dependency ordering.*
