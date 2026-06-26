# ULTRON — Frontend

**AI-Driven Crime Analytics Platform** for the Karnataka State Police (SCRB) — Datathon 2026

> Unified Law Enforcement Threat Response & Optimization Nexus

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 + PostCSS |
| **Routing** | React Router v7 (lazy-loaded routes) |
| **State Management** | Zustand 5 |
| **Data Fetching** | TanStack React Query 5 + Axios |
| **Maps** | Leaflet + react-leaflet |
| **Graphs** | Cytoscape.js + react-cytoscapejs + @xyflow/react (React Flow v12) |
| **Charts** | Recharts |
| **Animations** | Motion (Framer Motion) |
| **UI Components** | Radix UI (Dialog, Dropdown, Select, Tabs) + custom component library |
| **Notifications** | Sonner |
| **Linting** | Oxlint |
| **Mock Data** | 28 JSON fixtures for offline development |

---

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route-level page components (50+ pages)
│   │   ├── admin/          # Admin: users, roles, ingestion, health, audit
│   │   ├── crime/          # Crime: cases, criminals, trends, hotspots, patterns, predictive
│   │   ├── cyber/          # Cyber: threats, cases, IP/domain intel, fraud, evidence, flows
│   │   ├── dashboard/      # Unified dashboard, alerts, reports
│   │   ├── intel/          # Strategic Hub: briefings, reports, watchlists, signals, forecast
│   │   ├── intel-graph/    # Investigation graph workspace with React Flow
│   │   ├── maps/           # Maps: hotspots, patrol zones, geo-fences, districts, routes
│   │   └── network/        # Network: entity explorer, link analysis, clusters, suspect profiles
│   ├── features/           # Feature-specific components, hooks, API modules
│   │   ├── admin/          # Admin data API + hooks
│   │   ├── crime/          # Crime API + hooks
│   │   ├── cyber/          # Cyber API + hooks
│   │   ├── intel-graph/    # Graph config, components, utilities
│   │   ├── intelligence/   # Intel API + hooks
│   │   ├── maps/           # Maps hooks (patrol zones, geo-fences, route analysis)
│   │   └── network/        # Network API + hooks
│   ├── shared/             # Shared infrastructure
│   │   ├── api/            # API layer: DTO adapters, mock handlers, Axios client
│   │   ├── components/     # Reusable components (18+ shared components)
│   │   ├── layout/         # App shell, sidebar nav, top header, panels
│   │   ├── ui-kit/         # Design system primitives (Button, Badge, Input, Select, Modal, Drawer)
│   │   └── utils/          # Utility functions
│   ├── stores/             # Zustand stores (auth, filter, graph, nav, UI)
│   ├── hooks/              # Shared hooks (anime transitions)
│   ├── mocks/              # JSON mock data (28 files covering all domains)
│   ├── router/             # Route definitions + protected route wrapper
│   ├── assets/             # Static assets (images)
│   ├── App.tsx             # Root component with providers
│   ├── main.tsx            # Entry point
│   └── globals.css         # Design tokens, Tailwind imports, dark theme
├── plan/                   # Architecture docs, phase completions, execution briefs
├── public/                 # Public static assets
├── dist/                   # Build output
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .oxlintrc.json
```

---

## Pages & Routes

### Dashboard (`/dashboard`)
- **`/dashboard`** — Unified command center with KPIs, trends, and alerts
- **`/dashboard/alerts`** — Real-time alert feed and notification management
- **`/dashboard/reports`** — Report generation and history

### Crime Intelligence (`/crime`)
- **`/crime`** — Crime overview with district stats and recent cases
- **`/crime/trends`** — Crime trend analytics with time-series charts
- **`/crime/hotspots`** — Crime hotspot density and risk indicators
- **`/crime/cases`** — Searchable case list with filters
- **`/crime/cases/:caseId`** — Detailed case view with evidence timeline
- **`/crime/criminals`** — Criminal records directory
- **`/crime/criminals/:criminalId`** — Criminal profile with network connections
- **`/crime/patterns`** — MO pattern discovery and analysis
- **`/crime/predictive`** — Predictive risk zones and recommendations

### Cyber Intelligence (`/cyber`)
- **`/cyber`** — Cyber overview with incident stats and live feed
- **`/cyber/threats`** — Threat intelligence dashboard
- **`/cyber/cases`** — Cyber incident case list
- **`/cyber/cases/:caseId`** — Cyber incident detail
- **`/cyber/ip/:ip`** — IP intelligence (geo, ISP, reputation, linked incidents)
- **`/cyber/domain/:domain`** — Domain intelligence (WHOIS, DNS, SSL)
- **`/cyber/fraud-analytics`** — Fraud pattern analytics with charts
- **`/cyber/digital-evidence`** — Digital forensics evidence tracker
- **`/cyber/heatmap`** — Cyber incident density heatmap
- **`/cyber/flows`** — Network flow visualization

### Maps & Geospatial (`/maps`)
- **`/maps`** — Maps overview with all layer toggles
- **`/maps/hotspots`** — Crime hotspot map with red-zone overlay
- **`/maps/patrol`** — Patrol beat management with team markers
- **`/maps/geofences`** — Geo-fence monitoring and alerts
- **`/maps/districts/:districtId`** — District drill-down analysis
- **`/maps/routes`** — Route analysis with risk scoring

### Network & Link Analysis (`/network`)
- **`/network`** — Network overview (crime, cyber, correlation views)
- **`/network/link-analysis`** — BFS shortest-path analysis between entities
- **`/network/entities`** — Entity explorer with domain/type filters
- **`/network/clusters`** — Connected-components cluster discovery
- **`/network/suspects/:suspectId`** — Suspect profile with one-hop network
- **`/network/association-matrix`** — Entity association matrix

### Strategic Intelligence (`/intel`)
- **`/intel`** — Strategic Intelligence Hub with briefs and KPIs
- **`/intel/briefings`** — Intelligence brief management
- **`/intel/reports`** — Intelligence report library
- **`/intel/watchlists`** — Watchlist management
- **`/intel/signals`** — Signal and indicator tracking
- **`/intel/forecast`** — Strategic crime forecast

### Intel Graph (`/intel-graph`)
- **`/intel-graph`** — Interactive investigation graph workspace (React Flow)
- **`/intel-graph/builder`** — Template and blank graph builder
- **`/intel-graph/search`** — Entity search and add-to-graph
- **`/intel-graph/timeline`** — Graph history timeline with restore

### Admin (`/admin`)
- **`/admin`** — Admin overview with system health cards
- **`/admin/users`** — User management table
- **`/admin/roles`** — Role and permissions matrix
- **`/admin/data-ingestion`** — Data upload, preview, and ingestion
- **`/admin/data-quality`** — Data quality monitoring
- **`/admin/audit-log`** — Audit trail with timeline
- **`/admin/system-health`** — System health and service status

---

## Design System

- **Theme:** Dark mode (`#07090d` background)
- **Colors:** Gold accents (`#f6c453`), crime red, cyber cyan, network magenta, intel violet
- **Typography:** Inter (primary), Noto Sans Kannada (regional), JetBrains Mono (code)
- **Components:** Custom UI kit (Button, Badge, Input, Select, Modal, Drawer, SearchInput) built on Radix primitives
- **Layout:** App shell with sidebar navigation, top header, and optional right context panel

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. Uses mock data by default — set `VITE_MOCK_MODE=false` in environment to connect to a live API.

### Build

```bash
npm run build
```

TypeScript check + Vite production build. Output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Mock Data

The app ships with **28 mock JSON files** in `src/mocks/` covering all domains:

| Category | Files |
|----------|-------|
| Crime | `crime-cases.json`, `criminals.json`, `district-stats.json`, `hotspots.json`, `predictive-zones.json`, `red-zones.json` |
| Cyber | `cyber-incidents.json`, `ip-intelligence.json`, `domain-intelligence.json`, `network-flows.json`, `evidence-records.json` |
| Network | `network-crime.json`, `network-cyber.json`, `network-correlation.json` |
| Maps | `patrol-zones.json`, `geofences.json`, `route-analysis.json` |
| Intel | `intel-briefs.json`, `intel-emerging-trends.json`, `intel-predictive-zones.json`, `intel-red-zones.json`, `intel-socio-economic.json` |
| Admin | `users.json`, `system-services.json`, `ml-models.json`, `audit-logs.json`, `data-ingestion.json` |
| Dashboard | `dashboard-stats.json` |

Mock mode is enabled by default (`VITE_MOCK_MODE=true`). The mock handler intercepts API calls and returns realistic data for full offline development.

---

## Key Features

- **50+ lazy-loaded pages** across 8 modules for optimal bundle size
- **Dark-themed command-center UI** with KSP branding
- **Mock-first development** — no backend required for frontend work
- **Realistic mock datasets** covering crime records, cyber incidents, IP intelligence, network flows, and more
- **Interactive maps** (Leaflet) with hotspot clusters, patrol zones, geo-fences, and route analysis
- **Graph visualization** (Cytoscape.js + React Flow) for criminal networks, cyber flows, and investigation graphs
- **Responsive design** with sidebar navigation and adaptive layouts
