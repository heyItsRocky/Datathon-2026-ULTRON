# ULTRON — Work Split & Execution Plan

## 👥 Team Structure

| Role | Person | Responsibilities |
|---|---|---|
| **You** | Backend + DB + ML + Infra | Catalyst Functions, Catalyst Data Store, Zia AutoML, Cron, AppSail, seed data |
| **Person 1** | Frontend | React + TypeScript + Vite (Catalyst Slate), Leaflet maps, Cytoscape, Zustand |

---

## 🚦 Critical Rules for OpenCode

### 1. Log Before Push
> Every push MUST have a corresponding entry in `changes.md` at the top with date, author, files changed, and reason. Write the entry first, then commit + push. Never push without logging.

### 2. One Task at a Time
> Work through the execution plan in order (D1 → D2 → D3). Do NOT skip ahead or parallelize across days unless explicitly told.

### 3. Test Before Marking Done
> Every API endpoint, every ML model, every frontend page must be verified working before moving to the next day's tasks.

### 4. Document Breaking Changes
> If a task requires changing something from a previous day (schema change, API redesign, etc.), document it in a comment or commit message. Do not silently rewrite.

### 5. Seed Data First
> Before any frontend can be built, seed data must exist. Always run seed scripts after schema migrations.
### 6. Catalyst Deployment

> At the end of D3, the entire system must be deployed and working on Zoho Catalyst (Slate + Functions + Data Store + Zia AutoML).

### 7. Commit Often
> Commit after every meaningful unit of work (a working API, a working page, a fixed bug). Messages: `feat:`, `fix:`, `db:`, `ml:`, `frontend:`, `infra:`.

### 8. Never Delete Without Asking
> If you think a file, route, or component needs removal — ask first.

---

## 📋 3-Day Execution Plan

### Day 1 — Design + Architecture + Frontend

> **Goal:** Complete frontend built (all pages + components), architecture finalized, project skeleton ready.
> **Primary user:** SCRB (State Crime Records Bureau) — all UIs are designed for intelligence officers.

#### You (Backend + DB + Architecture)
| Time | Task | Files |
|---|---|---|
| 2h | Design full architecture diagrams, finalize project structure, Catalyst Project Setup | `catalyst.json` |
| 1h | Catalyst Data Store (ZCQL) schema — ALL tables (Crimes, Criminals, CyberIncidents, Districts) | `catalyst_schema.sql` |
| 1h | Config + requirements + Catalyst Functions setup | `functions/requirements.txt`, `functions/main.py` |
| 1h | API contract shapes finalized — all response schemas (including new: hotspots spatiotemporal, red-zone alerts, MO matching, socio-economic overlays, strategic intelligence endpoints) | `schemas/*.py` |

**Definition of Done:** Architecture design complete, all Data Store models defined, Catalyst project ready, seed data prepared.

#### Person 1 (Frontend)
| Time | Task | Files |
|---|---|---|
| 1h | Vite + React + Tailwind scaffold, routing, Zustand stores | `App.tsx`, `pages/*`, `stores/*` |
| 1h | **KSP Header Bar** (KSP logo + CM + Dy CM photos) + **Section Nav** with anime.js underline animation | `components/layout/KSPHeader.tsx`, `components/layout/SectionNav.tsx` |
| 2h | **4-Ring Radial Navigation** — SVG circular menu with 4 colored segments (Gold `#f0b000`, Teal `#20a080`, Purple `#800060`, Red `#c02040`). Anime.js entrance animation and on-click full-page transitions to Dashboard/Maps/Network/Intel sections | `components/layout/RadialNav.tsx` |
| 1h | Dashboard page + Maps page with Leaflet map of Karnataka | `pages/DashboardPage.tsx`, `pages/MapsPage.tsx`, `components/map/*` |
| 1h | Network page (Cytoscape graph) + Intelligence page (predictive charts, briefs) | `pages/NetworkPage.tsx`, `pages/IntelligencePage.tsx` |
| 2h | **Flowsint-style Intel Graph Page** — React Flow (xyflow) drag-drop node editor with 7 pre-defined node types: IP (cyan), Name (red), Place (green), Object (orange), How (purple), Why (pink), What (yellow). Connect nodes, editable fields, export JSON. Uses `@xyflow/react`. | `components/intelgraph/*`, `pages/IntelGraphPage.tsx` |
| 1h | Dummy data — CSV files in `public/data/` with real SCRB format: `crime_records.csv` (500+ FIR records), `criminals.csv`, `cyber_incidents.csv`. Parsed via `papaparse`. | `public/data/*.csv`, `hooks/useCSVData.ts` |

**Definition of Done:** All frontend pages render with mock data — including new Strategic Hub, red-zone pulses, MO tracking, socio-economic overlays. Cyber pages intact.

---

### Day 2 — Backend + Verify + Deploy + Setup

> **Goal:** All backend APIs built, frontend connected to live backend, Catalyst deployment working.

#### You (Backend + DB + ML)
| Time | Task | Files |
|---|---|---|
| 1h | Catalyst Functions (Advanced I/O) scaffold + Catalyst Authentication setup | `functions/auth.py`, `functions/main.py` |
| 1h | Crime + Criminal CRUD APIs on Functions, file upload to Stratus | `functions/crimes.py`, `functions/criminals.py` |
| 1h | Cyber endpoints (incidents, IP lookup, domain lookup, flows), enrichment service | `functions/cyber.py` |
| 1h | Scrape engine via Catalyst Cron + SmartBrowz | `functions/cron.py` |
| 1h | ML Models: Zia AutoML setup (RF, IF), AppSail custom container (ARIMA, TF-IDF) | `appsail/app.py` |
| 1h | API Gateway config + Dashboard stats + Intelligence Hub APIs | `api-gateway.json`, `functions/dashboard.py` |
| 1h | Catalyst Deploy, smoke test all endpoints | Verify `catalyst deploy` |

**Definition of Done:** Catalyst Auth works, all Functions return data, Zia AutoML returns predictions, `catalyst deploy` launches everything.

#### Person 1 (Frontend — Integration)
| Time | Task | Files |
|---|---|---|
| 3h | Connect all frontend pages to live backend APIs — swap mock data for real API calls, verify every page renders real data | All page + component files |
| 2h | Fix TypeScript errors, ensure Leaflet map pins load from API, Cytoscape graph renders real network data, Recharts show real trends, upload forms submit to real endpoints | All component files |
| 1h | Loading states + error boundaries + empty states across all pages | Global components, hooks |

**Definition of Done:** Frontend displays real DB data for all features, no console errors, all interactions work.

---

### Day 3 — Test + Demo

> **Goal:** Everything stable, polished, and demo-ready.

#### You (Backend + DB)
| Time | Task | Files |
|---|---|---|
| 2h | Full smoke test — curl/httpx every endpoint, test edge cases (empty lists, missing IDs, bad params, auth failures), fix bugs | All backend files |
| 1h | Fresh `docker compose down -v` → `docker compose up -d` → verify everything works from scratch | Docker, seed scripts |
| 1h | Final README/split.md updates, verify `.gitignore` and `secret.md` | `README.md`, `split.md`, `.gitignore`, `secret.md` |

**Definition of Done:** Backend zero errors, fresh deploy works end-to-end.

#### Person 1 (Frontend)
| Time | Task | Files |
|---|---|---|
| 2h | UI polish — consistent spacing/colors/fonts, responsive fixes (mobile + tablet), dark mode check | Global CSS, Tailwind config |
| 1h | Demo walkthrough — record screen flow (Loom/QuickTime), verify all features in demo order | — |
| 1h | Final bug fixes from integration testing | Component-level fixes |

**Definition of Done:** Frontend visually polished, responsive, demo recorded, zero console errors.

---

## 📂 File Ownership Map

```
ULTRON/
├── backend/
│   ├── app/
│   │   ├── main.py              ← YOU
│   │   ├── config.py            ← YOU
│   │   ├── database.py          ← YOU
│   │   ├── models/              ← YOU (all)
│   │   ├── schemas/             ← YOU (all)
│   │   ├── routers/             ← YOU (all)
│   │   ├── services/            ← YOU (all)
│   │   └── middleware/          ← YOU
│   ├── workers/                 ← YOU (all)
│   ├── scripts/                 ← YOU (all)
│   ├── requirements.txt         ← YOU
│   └── Dockerfile               ← YOU
├── frontend/
│   ├── src/
│   │   ├── components/          ← PERSON 1
│   │   │   ├── layout/          ← PERSON 1
│   │   │   ├── dashboard/       ← PERSON 1
│   │   │   ├── crime/           ← PERSON 1
│   │   │   ├── cyber/           ← PERSON 1
│   │   │   ├── analysis/        ← PERSON 1
│   │   │   └── data/            ← PERSON 1
│   │   ├── pages/               ← PERSON 1
│   │   ├── hooks/               ← PERSON 1
│   │   ├── context/             ← PERSON 1
│   │   ├── api/                 ← PERSON 1
│   │   ├── types/               ← PERSON 1
│   │   └── App.tsx              ← PERSON 1
│   ├── package.json             ← PERSON 1
│   ├── vite.config.ts           ← PERSON 1
│   ├── tailwind.config.js       ← PERSON 1
│   └── Dockerfile               ← PERSON 1
├── docker-compose.yml           ← YOU
├── nginx/
│   └── default.conf             ← YOU
├── split.md                     ← YOU
└── README.md                    ← YOU
```

---

## 🔗 API Contract (You → Person 1)

Person 1 builds frontend components that consume these APIs. Agree on shapes early.

### Crime Track
| Method | Endpoint | Response Shape |
|---|---|---|
| GET | `/crime/list?district=&type=&from=&to=` | `{ crimes: [{id, type, date, location, lat, lng, district, status, description}] }` |
| GET | `/crime/{id}` | `{ id, type, date, location, lat, lng, district, status, description, criminals: [...], evidence: [...] }` |
| GET | `/criminal?search=&page=` | `{ criminals: [{id, name, age, risk_score, risk_tier, priors_count, photo_url}] }` |
| GET | `/criminal/{id}` | `{ id, name, age, risk_score, risk_tier, priors, crimes: [...], links: [...] }` |
| GET | `/crime/spatiotemporal?range=week\|month\|all` | `{ clusters: [{id, center_lat, center_lng, radius, density, crime_types: [{type, count}], peak_hours, top_criminals}] }` |
| GET | `/crime/red-zones` | `{ red_zones: [{district, severity: high\|med\|low, trend: rising\|stable\|falling, anomaly_score, emerging_types: [...], affected_area_lat, affected_area_lng}] }` |
| POST | `/crime/match-mo` | `body: { description, crime_type?, location? }` → `{ matches: [{criminal_id, name, match_percent, shared_types: [...], total_priors, risk_score}] }` |
| GET | `/crime/mo/{criminal_id}` | `{ criminal_id, mo_signature, similar_criminals: [{id, name, match_percent, shared_types}], linked_cases: [{id, type, date, match_score}] }` |
| GET | `/crime/socio-economic?district=` | `{ district, crime_rate, literacy_rate, poverty_index, population_density, police_coverage, correlation_scores: { vs_literacy, vs_poverty, vs_density } }` |
| GET | `/intelligence/brief` | `{ briefs: [{type, title, summary, severity, affected_district, timestamp, related_crime_ids}] }` |
| GET | `/intelligence/trending?days=30` | `{ trends: [{crime_type, district, percent_change, direction: up\|down, volume}] }` |
| GET | `/intelligence/predictive-zones` | `{ predictions: [{district, risk_level, confidence, top_types: [{type, probability}], recommendations: [...] }] }`

### Cyber Track
| Method | Endpoint | Response Shape |
|---|---|---|
| GET | `/cyber/incidents?type=&status=` | `{ incidents: [{id, type, title, status, date, source_ip, target_domain}] }` |
| GET | `/cyber/incident/{id}` | `{ id, type, title, description, status, ips: [...], domains: [...], evidence: [...], flows: [...] }` |
| GET | `/cyber/ip/{address}` | `{ ip, country, city, isp, asn, reputation_score, linked_incidents: [...], whois, first_seen }` |
| GET | `/cyber/domain/{domain}` | `{ domain, registrar, creation_date, expiry, ssl_valid, dns_records: [...], phishing_probability, flags: [...] }` |

### Analysis
| Method | Endpoint | Response Shape |
|---|---|---|
| GET | `/crime/hotspots` | `{ clusters: [{id, center_lat, center_lng, radius, density, crimes_count, top_types: [...]}] }` |
| GET | `/criminal/risk/{id}` | `{ risk_score, risk_tier, contributing_factors: [...] }` |
| GET | `/analysis/anomalies` | `{ anomalies: [{district, type, expected_count, actual_count, severity, timestamp}] }` |
| GET | `/cyber/flow/{id}` | `{ flow: {src_ip, dst_ip, src_port, dst_port, protocol, bytes, duration, anomaly_score} }` |
| GET | `/cyber/network` | `{ nodes: [{id, label, type}], edges: [{source, target, label, weight}] }` |

### Dashboard
| Method | Endpoint | Response Shape |
|---|---|---|
| GET | `/dashboard/stats` | `{ total_crimes, active_cases, alerts_today, cyber_incidents_today, crimes_trend: [...], cyber_trend: [...], top_districts: [...], red_zone_count, emerging_trend_count }` |

---

## 🧪 Verification Checklist

Before marking any day complete, verify:

- [ ] All new APIs return correct JSON (test with curl/httpx)
- [ ] No 500 errors on edge cases (empty list, missing ID, bad params)
- [ ] Seed data is in the DB and queryable
- [ ] Frontend compiles without TypeScript errors
- [ ] Frontend pages render without console errors
- [ ] Maps/graphs render with real data (not hardcoded)
- [ ] Auth works — correct role sees correct content
- [ ] New code doesn't break previously working features
