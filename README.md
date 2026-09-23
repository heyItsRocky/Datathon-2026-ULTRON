# ⚡ ULTRON — Unified Law Enforcement Threat Response & Optimization Nexus

**Datathon 2026** — *Nationwide Innovation Challenge by the Karnataka State Police*

> **AI-Driven Crime Analytics Platform for the Karnataka State Police.** Transforming fragmented crime and cybercrime data into actionable intelligence through 8 ML models — spatiotemporal clustering, predictive risk scoring, anomaly detection, MO matching, IP reputation analysis, phishing detection, network flow anomaly detection, and attack path correlation — all unified in a single command platform for the SCRB.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [AI-Driven at Its Core](#ai-driven-at-its-core)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [ML Models](#ml-models)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Team](#team)

---

## Getting Started

### Quick start (local — no Catalyst login required)

```bash
# 1) Local API (SQLite + mock/seed data)
pip3 install flask scikit-learn --user --break-system-packages
python3 scripts/local_api.py --seed
# → http://127.0.0.1:8787

# 2) Frontend (live API mode)
cd frontend
cp .env.example .env   # VITE_MOCK_MODE=false, VITE_API_BASE_URL=http://127.0.0.1:8787
npm ci
npm run dev
# → http://localhost:5173

# Login: admin@ksp.gov.in / admin123
```

### Catalyst cloud deploy

See `catalyst/DEPLOYMENT.md`. Requires interactive Zoho OAuth (`catalyst login`) — documented blocker in `BLOCKERS.md` if credentials are unavailable.

### Docs

| Doc | Purpose |
|-----|---------|
| [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | 3-minute judge walkthrough + curl probes |
| [BLOCKERS.md](BLOCKERS.md) | Catalyst OAuth / Docker blockers + unblock steps |
| [INTEGRATION_GAPS.md](INTEGRATION_GAPS.md) | Frontend↔backend envelope/field mapping status |
| `KSP_Datathon_2026_ULTRON_Submission.pptx` | Filled submission deck |

### Mock vs live

| `VITE_MOCK_MODE` | Behavior |
|------------------|----------|
| `true` (default if unset) | `mockFetch` intercepts — no network |
| `false` | Axios → real API (local Flask or Catalyst gateway) with envelope unwrap + DTO field mapping |

---

## Problem Statement

The Karnataka State Police, through its **State Crime Records Bureau (SCRB)**, faces critical challenges in modern crime fighting: **siloed data, manual reporting, and the inability to predict threats before they escalate**. Officers and analysts lack the integrated, intelligent tools needed for proactive policing in both physical and digital domains.

**ULTRON** is an **AI-Driven Crime Analytics Platform** built for the SCRB that unifies six core capabilities:

| # | Capability | What It Means |
|---|---|---|
| 1 | **Advanced Visualization** | District drill-down with interactive maps, spatiotemporal crime clusters, and emerging trend alerts (red-zone pulsing when crime spikes) |
| 2 | **Criminological Network & Link Analysis** | Relationship mapping between criminals, repeat offender tracking by MO (Modus Operandi), and automatic association detection |
| 3 | **Sociological & AI-Driven Predictive Dashboards** | Socio-economic correlation overlays (literacy, poverty, density), predictive risk scoring, and anomaly detection |
| 4 | **Pattern & Trend Discovery** | Spatial and temporal hotspot identification — find where and when crimes cluster |
| 5 | **Network & Behavioral Analysis** | Map connections between suspects, track behavioral patterns, detect organized crime structures |
| 6 | **AI/ML-Driven Intelligence** | 8 ML models discover hidden correlations, detect real-time anomalies, and generate predictive risk scores automatically |

**Plus:** A **Conversational AI** interface allowing officers to query the crime database in natural language and Kannada.

---

## AI-Driven at Its Core

| ML Model | Algorithm | What It Does |
|---|---|---|
| **Spatiotemporal Hotspot Detection** | DBSCAN clustering | Finds crime clusters by location AND time |
| **Predictive Risk Scoring** | Random Forest | Learns which factors (age, priors, crime type) predict re-offending risk (0-100) |
| **Emerging Trend Alerts** | Isolation Forest | Spikes red-zone alerts when a district's crime breaks its normal pattern |
| **MO & Link Matching** | Jaccard Similarity | Auto-matches criminals by MO similarity across jurisdictions |
| **IP Reputation Scoring** | Random Forest | Each IP scored by past incidents, WHOIS, DNS — repeat appearance auto-escalates |
| **Phishing Domain Detection** | Logistic Regression | Flags zero-day phishing domains by behavior (age, registrar, SSL, DNS patterns) |
| **Network Flow Anomaly** | Isolation Forest | Learns normal traffic per network — flags C2 beacons, data exfiltration |
| **Attack Path Correlation** | BFS + scoring heuristics | Maps shortest attack path from source IP to victim |

All 8 models run in **Catalyst Functions** using `scikit-learn` (inference only), pre-trained on seed data. Results → API → Dashboard in real time.

---

## Features

### Crime Track (OSINT + Tracking + Records + Intelligence)

| Feature | Description |
|---|---|
| **4-Ring Radial Navigation** | Four concentric ring segments (Gold/Teal/Purple/Red) in an SVG circle — click to transition via anime.js |
| **Advanced Visualization** | Full-screen Leaflet map with DBSCAN hotspot overlays — spatiotemporal crime clusters |
| **District Drill-Down** | Click any district → see its crime stats, trend charts, hotspot clusters |
| **Emerging Trend Alerts (Red-Zone Pulsing)** | Districts glow red and pulse when crime spikes beyond normal pattern (Isolation Forest) |
| **Network & Link Analysis** | Interactive Cytoscape.js graph showing criminal connections — MO matching, shared associates |
| **Predictive Dashboard** | KPI cards, 30-day trends, predictive risk scores, anomaly feed |
| **Strategic Intelligence Hub** | Socio-economic correlations, predictive heatmap, top-5 emerging trends, daily intel briefs |
| **Socio-Economic Map Overlays** | Toggle literacy, poverty, population density, police station coverage on crime map |

### CyberCrime Track (IPs + Domains + Network Flow + Forensics)

| Feature | Description |
|---|---|
| **IP Tracker** | Search IP addresses — geolocation, ISP, reputation score, associated domains |
| **Domain Analyzer** | WHOIS lookup, SSL certificate analysis, DNS records, domain age |
| **Network Flow Visualizer** | Interactive Cytoscape.js graph showing IP-domain-victim connections — trace attack paths |
| **Phishing Case Manager** | Track phishing campaigns — source IPs, target domains, victim list, takedown status |
| **Cyber Dashboard** | KPI cards (incidents today, active investigations, blacklisted IPs), live feed, trends |
| **Threat Intelligence** | Auto-correlate IPs/domains across cases — flag repeat offenders |

### Conversational AI

| Feature | Description |
|---|---|
| **NL Crime Query** | "How many theft cases in Bengaluru this month?" → Intent classification → ZCQL → LLM response |
| **RAG Document Query** | Query police knowledge base documents via QuickML |
| **Multi-language Translation** | Real-time translation between Kannada, Hindi, English |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Hosting** | Catalyst Static Hosting |
| **Frontend UI** | React 19 + TypeScript + Tailwind CSS 4 |
| **Animations** | anime.js |
| **Maps & Graphs** | Leaflet + React-Leaflet + Cytoscape.js + React Flow |
| **Backend API** | Catalyst Functions (Advanced I/O) — Python 3.13 |
| **Database** | Catalyst Data Store (ZCQL) — 8 tables |
| **LLM / RAG** | Catalyst QuickML (GLM-4.7) |
| **ML Inference** | scikit-learn (embedded in Functions) |
| **Auth** | Catalyst Authentication (Embedded) |
| **File Storage** | Catalyst Stratus |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                      │
│   Catalyst Static Hosting  |  VITE_MOCK_MODE=true|false      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified API Function (Python 3.13)              │
│            catalyst/functions/api/  (single deploy)          │
│                                                              │
│  CrimeHandler ── CyberHandler ── AnalyticsHandler            │
│  ChatHandler  ── AdminHandler                                │
│                                                              │
│  Common Layer: db_utils, models, cyber_models, risk_model    │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────────┐
│  Catalyst Data Store │          │  Catalyst QuickML        │
│  8 Tables (ZCQL)     │          │  GLM-4.7 LLM + RAG      │
└─────────────────────┘          └─────────────────────────┘
```

**Data Flow:**
```
Frontend → Catalyst Functions → ZCQL → Data Store → ML Inference → JSON Response
Frontend → Catalyst Functions → QuickML API → LLM Response
```

---

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm

### Quick Start (Frontend Dev with Mock Data)

```bash
# 1. Clone the repository
git clone https://github.com/ADITYA02NM/Datathon-2026-ULTRON.git
cd Datathon-2026-ULTRON/frontend

# 2. Install dependencies
npm install

# 3. Start dev server (uses mock data by default)
npm run dev

# 4. Open in browser
http://localhost:5173
```

The frontend runs fully with mock data — no backend needed for development. Set `VITE_MOCK_MODE=false` and `VITE_API_BASE_URL` in `frontend/.env` to connect to a live Catalyst backend.

### Catalyst Deployment

Full deployment guide at [`catalyst/DEPLOYMENT.md`](catalyst/DEPLOYMENT.md).

---

## ML Models (8 Total)

### Crime Track

| Model | Algorithm | File |
|---|---|---|
| Hotspot Detection | DBSCAN clustering | `catalyst/common/models.py` |
| Recidivism Risk | Random Forest | `catalyst/common/models.py` |
| Anomaly Detection | Isolation Forest | `catalyst/common/models.py` |
| MO Matching | Jaccard Similarity | `catalyst/common/db_utils.py` |

### Cyber Track

| Model | Algorithm | File |
|---|---|---|
| IP Reputation | Random Forest | `catalyst/common/cyber_models.py` |
| Phishing Detection | Logistic Regression | `catalyst/common/cyber_models.py` |
| Network Flow Anomaly | Isolation Forest | `catalyst/common/cyber_models.py` |
| Attack Path Correlation | BFS + scoring | `catalyst/common/cyber_models.py` |

### Combined Risk

`catalyst/common/risk_model.py` merges crime + cyber scores into unified risk profiles.

---

## Project Structure

```
ULTRON/
├── catalyst/
│   ├── catalyst-config.json           # Environment variables template
│   ├── ARCHITECTURE.md                # Platform architecture document
│   ├── DEPLOYMENT.md                  # Step-by-step Catalyst deployment guide
│   ├── common/                        # Shared Python modules
│   │   ├── constants.py               # Table names, response helpers
│   │   ├── db_utils.py                # ZCQL helpers, crime stats, MO matching
│   │   ├── models.py                  # Crime ML models (hotspots, risk, anomaly)
│   │   ├── cyber_models.py            # Cyber ML models (IP, phishing, flow, attack)
│   │   └── risk_model.py              # Combined risk scoring
│   └── functions/
│       ├── api/                       # ★ UNIFIED API FUNCTION (recommended)
│       │   ├── function.json          # Config (python3.13, 512MB)
│       │   ├── requirements.txt       # catalyst-light, scikit-learn, numpy, scipy
│       │   ├── __init__.py            # Main handler + route dispatcher
│       │   ├── crime_handler.py       # /crime/*, /maps/*, /network/*
│       │   ├── cyber_handler.py       # /cyber/*
│       │   ├── analytics_handler.py   # /dashboard/*, /intel/*
│       │   ├── chat_handler.py        # /chat/* (LLM + RAG + translation)
│       │   └── admin_handler.py       # /admin/* (health, users, audit)
│       ├── crime_api/                 # Original separate function (preserved)
│       ├── cyber_api/                 # Original separate function (preserved)
│       ├── analytics_api/             # Original separate function (preserved)
│       ├── chat_api/                  # Original separate function (preserved)
│       └── admin_api/                 # Original separate function (preserved)
├── frontend/
│   ├── src/
│   │   ├── components/               # React components (crime, cyber, maps, etc.)
│   │   ├── pages/                    # Page components (50+ pages)
│   │   ├── shared/
│   │   │   ├── api/                  # API client + mock data + DTO adapters
│   │   │   │   ├── client.ts         # apiGet<T>(url) — checks MOCK_MODE
│   │   │   │   ├── mock/             # 28 mock JSON files + handlers.ts
│   │   │   │   └── dto-adapters/     # Frontend↔Backend DTO mappers
│   │   │   ├── config.ts             # Reads VITE_MOCK_MODE, VITE_API_BASE_URL
│   │   │   └── types/                # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   ├── local_api.py                   # ★ Local Flask API (SQLite fallback when Catalyst login blocked)
│   ├── seed_data.py                  # Crime seed data (500+ crimes, 200+ criminals)
│   └── seed_cyber.py                 # Cyber seed data (200+ threats, 500+ IOCs)
├── PRD.md                            # Product Requirements Document
├── BLOCKERS.md                       # Cloud deploy blockers + unblock steps
├── INTEGRATION_GAPS.md               # API integration status
├── DEMO_SCRIPT.md                    # 3-minute demo walkthrough
└── README.md                         # This file
```

---

## API Overview

The unified API function serves all routes. When `VITE_MOCK_MODE=true` (default if unset), the frontend uses mock data; set to `false` to hit the live backend (local Flask fallback or Catalyst).

| Prefix | Handler | Key Endpoints |
|---|---|---|
| `/crime/` | `crime_handler` | `GET /crime/cases`, `GET /crime/case/{id}`, `GET /crime/criminals`, `GET /crime/criminal/{id}`, `GET /crime/by-district`, `GET /crime/by-type`, `GET /crime/trends`, `GET /crime/mo-match` |
| `/cyber/` | `cyber_handler` | `GET /cyber/incidents`, `GET /cyber/ip/{ip}`, `GET /cyber/domain/{domain}`, `GET /cyber/flows`, `GET /cyber/stats`, `POST /cyber/phishing/analyze`, `POST /cyber/traffic/analyze`, `GET /cyber/attack-paths` |
| `/maps/` | `crime_handler` + `analytics_handler` | `GET /maps/hotspots`, `GET /maps/red-zones`, `GET /maps/predictive-zones`, `GET /maps/route-analysis` |
| `/network/` | `crime_handler` | `GET /network/graph`, `GET /network/correlation-graph` |
| `/dashboard/` | `analytics_handler` | `GET /dashboard/stats` |
| `/intel/` | `analytics_handler` | `GET /intel/briefs`, `GET /intel/trends`, `GET /intel/socio-economic` |
| `/chat/` | `chat_handler` | `POST /chat/query`, `POST /chat/rag-query`, `POST /chat/translate` |
| `/admin/` | `admin_handler` | `GET /admin/health`, `GET /admin/users`, `POST /admin/ingest`, `GET /admin/audit-logs` |

---

## Team

| Member | Focus |
|---|---|
| **You** | Backend (Catalyst Functions, ML models, Database, Architecture) |
| **Person 1** | Frontend (React, Components, Maps, Graphs, UI/UX) |
