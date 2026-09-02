# ULTRON — Completion Guide

**Project**: Unified Law Enforcement Threat Response & Optimization Nexus — KSP Datathon 2026
**Status**: 70% built | Needs: Catalyst deployment, auth, demo video
**Stack**: React 19, Vite 7, TypeScript, Tailwind v4, Zustand, Leaflet, Cytoscape.js, React Flow, Python 3.13, Zoho Catalyst

---

## What Exists

### Frontend (Complete — 55 routes, 115+ files)

| Module | Pages | Status |
|--------|-------|--------|
| **Command Center** | RadialNav landing with KSP branding | ✅ Full |
| **Dashboard** | Unified KPIs, trends, anomalies, quick actions | ✅ Full |
| **Crime** | Overview, trends, hotspots, cases, criminals, patterns, predictive | ✅ 9 pages |
| **Cyber** | Overview, threats, cases, IP/domain intel, fraud, evidence, heatmap, flows | ✅ 10 pages |
| **Maps** | Leaflet interactive map, hotspots, patrol, geofence, districts, routes | ✅ 6 pages |
| **Network** | Cytoscape graphs, link analysis, entity explorer, clusters, suspect profiles | ✅ 6 pages |
| **Intel Hub** | Briefings, reports, watchlists, signals, strategic forecast | ✅ 6 pages |
| **Intel Graph** | React Flow workspace with 7 custom node types, palette, editor | ✅ 4 pages |
| **Admin** | Users, roles, data ingestion, quality, audit, system health | ✅ 7 pages |

**Design System**: Button, Badge, Input, Select, Modal, Drawer, SearchInput (Radix UI)
**State**: 5 Zustand stores (auth, filter, graph, nav, UI)
**Data**: 28 mock JSON files, DTO adapter layer, Axios client with mock intercept

### Backend (Complete on GitHub)

| Component | File | Status |
|-----------|------|--------|
| **Constants** | `catalyst/common/constants.py` (10KB) | ✅ |
| **DB Utils** | `catalyst/common/db_utils.py` (17KB) | ✅ |
| **Crime Models** | `catalyst/common/models.py` (16KB) | ✅ |
| **Cyber Models** | `catalyst/common/cyber_models.py` (23KB) | ✅ |
| **Risk Model** | `catalyst/common/risk_model.py` (3KB) | ✅ |
| **Crime API** | `catalyst/functions/crime_api/` | ✅ |
| **Cyber API** | `catalyst/functions/cyber_api/` | ✅ |
| **Analytics API** | `catalyst/functions/analytics_api/` | ✅ |
| **Chat API** | `catalyst/functions/chat_api/` | ✅ |
| **Admin API** | `catalyst/functions/admin_api/` | ✅ |
| **Seed Scripts** | `scripts/seed_data.py` (26KB), `scripts/seed_cyber.py` (12KB) | ✅ |

### ML Models (8 total, all implemented)

| # | Model | Algorithm | Purpose |
|---|-------|-----------|---------|
| 1 | Hotspot Detection | DBSCAN | Spatial crime clustering |
| 2 | Recidivism Risk | Random Forest | Criminal re-offense scoring |
| 3 | Anomaly Detection | Isolation Forest | Crime spike detection |
| 4 | MO Matching | Jaccard Similarity | Case linking by method |
| 5 | IP Reputation | Random Forest | IP risk scoring |
| 6 | Phishing Detection | Logistic Regression | Domain classification |
| 7 | Network Flow Anomaly | Isolation Forest | Traffic anomaly detection |
| 8 | Attack Path | BFS + scoring | Cyber kill chain mapping |

---

## What's Missing

### CRITICAL — Blocks Deployment

| # | Gap | Effort |
|---|-----|--------|
| 1 | **Catalyst deployment** — Backend not deployed to Zoho Catalyst | 4-6 hrs |
| 2 | **Data Store setup** — 8 tables not created in Catalyst | 2 hrs |
| 3 | **Seed data not loaded** — Run seed scripts against Catalyst DB | 1 hr |
| 4 | **Auth not wired** — LoginPage is placeholder ("Coming soon") | 2 hrs |
| 5 | **Mock mode toggle** — Frontend still uses `VITE_MOCK_MODE=true` | 30 min |

### HIGH — Quality

| # | Gap | Effort |
|---|-----|--------|
| 6 | **No tests** — Zero test files anywhere | 4-6 hrs |
| 7 | **No mobile nav** — Sidebar hidden on mobile, no hamburger | 2 hrs |
| 8 | **No real search** — SearchInput exists but non-functional | 1 hr |
| 9 | **No pagination** — Lists load all data at once | 2 hrs |
| 10 | **No responsive design** — Desktop-only layout | 3 hrs |

### MEDIUM — Production

| # | Gap | Effort |
|---|-----|--------|
| 11 | **No CI/CD** — No GitHub Actions | 1 hr |
| 12 | **No error tracking** — No Sentry or similar | 30 min |
| 13 | **No demo video** — Datathon requires it | 2-3 hrs |
| 14 | **No prototype brief** — Submission template unfilled | 1 hr |

---

## Completion Procedure

### Step 1: Catalyst Setup (4-6 hrs)
```bash
# 1. Install Catalyst CLI
npm install -g @anthropic-ai/catalyst-cli

# 2. Login to Catalyst
catalyst login

# 3. Initialize project
cd catalyst
catalyst project deploy

# 4. Create Data Store tables (8 tables via Catalyst Console)
# - Crimes, Criminals, CrimeCriminalLinks, Districts
# - CyberThreats, CyberIndicators, Users, AuditLogs

# 5. Run seed scripts
python scripts/seed_data.py    # 500+ crimes, 200+ criminals
python scripts/seed_cyber.py   # 200+ threats, 500+ IOCs

# 6. Deploy functions
catalyst functions deploy

# 7. Get API Gateway URL from Catalyst Console
```

### Step 2: Frontend-Backend Integration (2-3 hrs)
```bash
# 1. Create frontend/.env
VITE_MOCK_MODE=false
VITE_API_BASE_URL=https://<catalyst-gateway-url>

# 2. Wire LoginPage to Catalyst Auth
# - Replace placeholder with real login form
# - Integrate Catalyst Embedded Auth widget

# 3. Update authStore.ts
# - Replace hardcoded demo user with real token management
# - Add role-based permission checks

# 4. Test each module with live data
```

### Step 3: Production Hardening (3-4 hrs)
```
1. Add mobile hamburger menu (sidebar collapse on <lg)
2. Add pagination to list views (CrimeCases, CyberCases, etc.)
3. Add real search functionality (debounced, API-backed)
4. Add per-page error boundaries
5. Add responsive breakpoints (768px, 1024px, 1440px)
6. Fill out submission template PPTX
```

### Step 4: Demo & Submission (3-4 hrs)
```
1. Record demo video (5-10 min):
   - Command Center landing
   - Crime module walkthrough
   - Cyber module walkthrough
   - Maps with layers
   - Intel Graph workspace
   - Conversational AI query
   - Admin panel
2. Finalize prototype brief
3. Submit via Hack2skill portal
4. Update README with live URL
```

---

## API Endpoints (All Implemented)

### Crime API (`/api/crime/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/crime/cases | List cases (paginated, filterable) |
| GET | /api/crime/cases/{id} | Case detail |
| POST | /api/crime/cases | Create new case |
| GET | /api/crime/criminals | List criminals |
| GET | /api/crime/criminals/{id} | Criminal profile + links |
| GET | /api/crime/network/{id} | Criminal network graph |
| GET | /api/crime/stats | Aggregate statistics |
| GET | /api/crime/trends | Time-series trend data |
| GET | /api/crime/hotspots | Hotspot cluster data |
| GET | /api/crime/mo-similar/{id} | MO matching results |

### Cyber API (`/api/cyber/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cyber/threats | List threats |
| GET | /api/cyber/threats/{id} | Threat detail |
| GET | /api/cyber/iocs | List IOCs |
| GET | /api/cyber/ip-reputation/{ip} | IP reputation score |
| POST | /api/cyber/analyze-phishing | Analyze email/URL |
| POST | /api/cyber/analyze-traffic | Analyze network flow |
| GET | /api/cyber/attack-paths/{id} | Attack path visualization |
| GET | /api/cyber/stats | Cyber dashboard stats |

### Analytics API (`/api/analytics/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | All dashboard KPIs |
| GET | /api/analytics/anomalies | Anomaly detection results |
| GET | /api/analytics/predictive-zones | Predicted crime zones |
| GET | /api/analytics/socio-economic | Socio-economic correlations |
| GET | /api/analytics/geo-data | Map visualization data |
| GET | /api/analytics/recidivism-risk | Risk-scored criminal list |

### Chat API (`/api/chat/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat/query | LLM natural language query |
| POST | /api/chat/rag-query | RAG document query |
| POST | /api/chat/translate | Translate query language |

### Admin API (`/api/admin/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/health | System health |
| GET | /api/admin/users | List users |
| POST | /api/admin/ingest | Data ingestion |
| GET | /api/admin/audit | Audit log |

---

## Database Schema (8 Tables)

| Table | Columns | Purpose |
|-------|---------|---------|
| **Crimes** | FIR_NUMBER (PK), CRIME_TYPE, DISTRICT, DATE_OCCURRED, STATUS, LAT/LNG, SEVERITY, MO | FIR records |
| **Criminals** | CRIMINAL_ID (PK), NAME, AGE, CRIMINAL_TYPE, MODUS_OPERANDI, DANGER_SCORE, STATUS | Criminal profiles |
| **CrimeCriminalLinks** | LINK_ID (PK), FIR_NUMBER (FK), CRIMINAL_ID (FK), ROLE, STRENGTH | Many-to-many |
| **Districts** | DISTRICT_ID (PK), NAME, POPULATION, AREA, POLICE_STATIONS, LITERACY, POVERTY | Karnataka districts |
| **CyberThreats** | THREAT_ID (PK), THREAT_TYPE, SEVERITY, SOURCE_IP, TARGET, MITRE_TACTIC | Cyber incidents |
| **CyberIndicators** | IOC_ID (PK), THREAT_ID (FK), IOC_TYPE, IOC_VALUE, CONFIDENCE | IOCs |
| **Users** | USER_ID (PK), NAME, ROLE, DEPARTMENT | System users |
| **AuditLogs** | LOG_ID (PK), USER_ID, ACTION, RESOURCE_TYPE, RESOURCE_ID, TIMESTAMP | Audit trail |

---

## Deployment (Zero Budget)

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Zoho Catalyst** | Free tier available | Required for Datathon |
| **Catalyst Slate** | Static hosting included | Frontend hosting |

**Required**: Zoho Catalyst account (free tier sufficient for Datathon)

---

## Commands

```bash
# Frontend
cd frontend
npm install
npm run dev          # Development
npm run build        # Production build

# Backend (Catalyst)
cd catalyst
catalyst login
catalyst project deploy
catalyst functions deploy

# Seed Data
python scripts/seed_data.py
python scripts/seed_cyber.py
```

---

## Estimated Time: 13-20 hours

| Phase | Hours |
|-------|-------|
| Catalyst setup | 5 |
| Frontend-backend integration | 2.5 |
| Production hardening | 3.5 |
| Demo + submission | 3.5 |
| Buffer | 2 |
| **Total** | **~17** |
