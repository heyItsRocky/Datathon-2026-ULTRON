# ULTRON — Full Project Prompt

## Project Overview

**ULTRON (Unified Law Enforcement Threat Response & Optimization Nexus)** is an **AI-Driven Crime Analytics Platform** purpose-built for the **Karnataka State Police — State Crime Records Bureau (SCRB)** for Datathon 2026.

The platform transforms fragmented crime and cybercrime data into actionable intelligence through **6 core capabilities**:

| # | Capability | Description |
|---|---|---|
| 1 | 🗺️ **Advanced Visualization** | District drill-down, spatiotemporal clusters, emerging trend alerts (red-zone pulsing) |
| 2 | 🔗 **Criminological Network & Link Analysis** | Relationship mapping, repeat offender tracking by MO, association detection |
| 3 | 📊 **Sociological & AI-Driven Predictive Dashboards** | Socio-economic correlation, predictive risk scoring, anomaly detection |
| 4 | 📈 **Pattern & Trend Discovery** | Spatial/temporal hotspot identification — find where AND when crimes cluster |
| 5 | 🧠 **Network & Behavioral Analysis** | Connections between suspects, behavioral patterns, organized crime structures |
| 6 | 🤖 **AI/ML-Driven Intelligence** | 7 ML models for hidden correlations, real-time anomalies, predictive risk scores |

## Two Major Tracks

### 1. 🚔 Crime Track (OSINT + Tracking + Records + Intelligence)

AI-powered crime intelligence aligned with the 6 SCRB capabilities:

- **Spatiotemporal Clusters** — DBSCAN finds crime clusters by location AND time (e.g., "chain snatching spikes in this area on weekends")
- **District Drill-Down** — Click any district for granular stats, trend charts, hotspot clusters
- **Emerging Trend Alerts (Red-Zone Pulsing)** — Isolation Forest detects spikes → district glows red and pulses on map
- **Criminological Network Graph** — Cytoscape.js shows connections: shared locations, associates, matching MO
- **MO Pattern Tracking** — Auto-match criminals across cases by Modus Operandi similarity
- **Sociological & AI-Driven Dashboard** — KPI cards, predictive risk scores, anomaly feed, 30-day trends
- **Strategic Intelligence Hub** — Senior officer command page: socio-economic correlation charts, predictive heatmap, top-5 trends
- **Socio-Economic Map Overlays** — Toggle literacy, poverty, density layers on crime map
- **Pattern & Trend Discovery** — Time-series analysis by type, district, time of day
- **OSINT Scraping** — News website scraping → auto-extract location, suspects, case details
- **Bulk Upload** — CSV/JSON drag-drop → Catalyst Stratus → auto-parse into DB

### 2. 💻 CyberCrime Track (IPs + Websites + Network Flow + Forensics)
Advanced cybercrime investigation with digital trail tracking:
- IP Tracker — geolocation, ISP, reputation score, associated domains
- Domain Analyzer — WHOIS lookup, SSL certificate, DNS records, domain age
- Network Flow Visualizer — interactive Cytoscape.js graph of IP↔domain↔victim connections
- Phishing Case Manager — campaign tracking, source IPs, target domains, takedown status
- Cyber Dashboard — KPI cards, live cyber feed, trend charts
- Network Evidence — PCAP metadata, NetFlow records, firewall log visualization
- Threat Intelligence — auto-correlate IPs/domains across cases
- Digital Forensics Tracker — chain-of-custody for digital evidence

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Maps | Leaflet + React-Leaflet + Leaflet.heat |
| Graphs | Cytoscape.js |
| Charts | Recharts |
| Backend | Catalyst Functions (Python Advanced I/O) + API Gateway |
| ML/AI | Zia AutoML + Catalyst AppSail |
| Cyber Intel | Python `whois`, `dnspython`, `ipinfo`, `pyshark` |
| OSINT | Catalyst Cron + SmartBrowz |
| Task Queue | Catalyst Cron |
| Database | Catalyst Data Store (ZCQL) |
| File Storage | Catalyst Stratus |
| Auth | Catalyst Authentication (Embedded) — Role-based (Admin / Analyst / Viewer) |
| Infrastructure | Zoho Catalyst (Slate, Functions, AppSail) |

## Architecture

```
User Browser (React 19 + TypeScript + Tailwind + anime.js + React Flow)
  ├── KSP Header Bar (Logo | CM | Dy CM)
  ├── Section Nav (anime.js animated tabs)
  ├── 4-Ring Radial Navigation (SVG circle — gold/teal/purple/red segments)
  │   └── Click segment → anime.js full-page transition
  ├── Pages: Dashboard, Maps, Network, Intelligence, Admin
  └── Intel Graph (Flowsint-style React Flow editor — 7 node types)

All → Nginx Reverse Proxy (:80)
      ├── Catalyst Functions (:8000)
      │   ├── Crime Track (Crime CRUD, Criminals, OSINT Scrape, Network Graph, Hotspot ML)
      │   ├── CyberCrime Track (IP/Domain APIs, Phishing Cases, Network Flow, Forensics, Threat Intel)
      │   └── Shared Services (Catalyst Auth, Stratus, Cron, AppSail)
      └── Vite Dev Server (:5173)

Backend connects to:
  ├── Catalyst Data Store (ZCQL) (:5432)
  ├── Catalyst Stratus (:4566)
  ├── Redis (:6379)
  └── Cron + SmartBrowz (scrape) + AppSail (ML)
```

## Data Flow

**Crime Pipeline:** File Upload / Web Scrape → Catalyst Stratus → Parse → PostgreSQL + PostGIS → ML (DBSCAN, RF, IF) → FastAPI → React

**CyberCrime Pipeline:** Manual Entry / IP Lookup → Catalyst Stratus → Enrich (WHOIS, DNS, IPinfo) → Data Store → ML (Anomaly, Correlate) → Functions → React

## API Endpoints

### Auth
- `POST /auth/login` — Catalyst Auth login (All)
- `POST /auth/register` — Create user (Admin)

### Crime Track
- `GET /crime/list` — List crimes with filters (district, type, date range)
- `GET /crime/{id}` — Crime detail
- `POST /crime` — Add crime (Admin/Sudo)
- `POST /crime/bulk` — Bulk CSV/JSON upload
- `PUT /crime/{id}` — Update crime
- `DELETE /crime/{id}` — Delete crime (Admin)
- `GET /crime/hotspots` — DBSCAN cluster results
- `GET /crime/trends` — Time-series trends

### Criminal Track
- `GET /criminal` — List criminals with search
- `GET /criminal/{id}` — Criminal detail + network
- `POST /criminal` — Add criminal (Admin/Sudo)
- `GET /criminal/risk/{id}` — Predictive risk score
- `GET /criminal/network` — Full criminal network graph

### CyberCrime Track
- `GET /cyber/incidents` — List cyber incidents
- `GET /cyber/incident/{id}` — Incident detail
- `POST /cyber/incident` — Add incident (Admin/Sudo)
- `PUT /cyber/incident/{id}` — Update incident
- `GET /cyber/ip/{address}` — IP intelligence (geo, ISP, reputation, cases)
- `GET /cyber/domain/{domain}` — Domain intelligence (WHOIS, DNS, SSL)
- `POST /cyber/ip/enrich` — Trigger async IP enrichment (Sudo)
- `GET /cyber/flows` — Network flow records
- `GET /cyber/flow/{id}` — Single flow detail
- `GET /cyber/network` — Cyber network graph
- `GET /cyber/evidence` — Digital evidence records
- `POST /cyber/evidence` — Add evidence (Admin/Sudo)
- `GET /cyber/threats` — Correlated threat intelligence
- `GET /cyber/stats` — Cyber dashboard stats
- `GET /cyber/trends` — Cyber incident trends

### Shared
- `GET /analysis/anomalies` — Anomaly detection (both tracks)
- `GET /analysis/correlations` — Socio-economic + cyber correlation
- `GET /dashboard/stats` — Unified dashboard stats
- `POST /scrape/run` — Trigger web scrape (Admin/Sudo)
- `POST /scrape/sources` — Add scrape source
- `GET /scrape/sources` — List scrape sources
- `POST /ml/retrain` — Retrain ML models (Sudo)

## ML Models

### Crime
- **Spatiotemporal Hotspot Detection:** DBSCAN — lat/lng + timestamp → cluster polygons with density + time pattern
- **Predictive Risk Scoring:** Random Forest — age, priors, crime types, MO → risk score 0-100 + tier
- **Emerging Trend Alert:** Isolation Forest — crime frequency by district/time → anomaly score + red-zone trigger
- **MO & Link Prediction:** Jaccard Similarity + Association Rules — shared attributes + MO patterns → link confidence + match %

### CyberCrime
- **IP Reputation:** Random Forest — geolocation, ASN, past incidents, WHOIS → reputation score 0-100
- **Phishing Detection:** Heuristic + ML classifier — domain age, registrar, SSL, DNS, URL → probability 0-1
- **Flow Anomaly:** Isolation Forest + Statistical — duration, bytes, packets, ports → anomaly score
- **Attack Path Correlation:** Graph BFS + Association — shared IPs/domains/certs → attack cluster ID

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full control — manage users, all CRUD, data ingestion, ML retrain, system config, both tracks |
| **Sudo** | Data manager — upload data, scrape sources, manual entry, enrich IPs, train models, view everything |
| **User** | Intelligence officer (view-only) — dashboards, maps, graphs, IP lookups, analysis reports |

## Dataset

### Crime Track
- Real aggregated data from data.opencity.in — Karnataka crime statistics (~70 categories, 40 districts)
- Synthetic individual crime records with realistic lat/lng (5,000+ records)
- Synthetic criminal profiles with cross-references (500+ profiles, 2,000+ links)

### CyberCrime Track
- Synthetic cyber incidents — phishing, hacking, fraud with realistic IPs, domains, trails (500+)
- Synthetic NetFlow-style records (2,000+ flows)
- On-demand enrichment via ipinfo.io / WHOIS lookups

## Project Structure

```
ULTRON/
├── backend/
│   ├── app/
│   │   ├── functions.py          # Catalyst Functions entry
│   │   ├── config.py            # Config
│   │   ├── datastore.py         # Catalyst Data Store config
│   │   ├── models/              # DB models (user, crime, criminal, crime_link, cyber_*, scrape_source, ml_prediction)
│   │   ├── schemas/             # Pydantic schemas (auth, crime, criminal, cyber, analysis, dashboard)
│   │   ├── routers/             # API routes (auth, crimes, criminals, analysis, network, cyber, cyber_network, scrape, ingestion, dashboard)
│   │   ├── services/            # Business logic (auth, ml, scrape, s3, network, cyber, ip_enrich, forensics)
│   │   └── middleware/          # Auth middleware
│   ├── functions/              # Catalyst Functions + Cron
│   ├── scripts/                 # seed_data.py, seed_cyber.py, load_opencity.py
│   ├── requirements.txt
│   └── Dockerfile (AppSail container)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header, ProtectedRoute
│   │   │   ├── dashboard/       # Overview, TrendChart, AlertPanel
│   │   │   ├── crime/           # CrimeMap, CrimeList, CrimeDetail, CriminalTable, CrimeNetworkGraph
│   │   │   ├── cyber/           # CyberDashboard, IPTracker, DomainAnalyzer, NetworkFlowGraph, PhishingCaseView, ForensicsTracker
│   │   │   ├── analysis/        # HotspotPanel, RiskScores, Correlations
│   │   │   └── data/            # FileUpload, ScrapeConfig, ManualEntry
│   │   ├── pages/               # Login, Dashboard, Crime, Criminals, Cyber, Network, Analysis, Data, Admin
│   │   ├── hooks/               # Custom hooks
│   │   ├── context/             # AuthContext
│   │   ├── api/                 # API client
│   │   ├── types/               # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile (AppSail container)
├── docker-compose.yml
├── nginx/default.conf
├── .gitignore
├── secret.md
├── split.md
├── Promts/
│   ├── main.md
│   ├── frontend.md
│   └── ppt.md
└── README.md
```

## 3-Day Execution Plan

### Day 1 — Design + Architecture + Frontend
- **You:** Architecture design, all DB models, Catalyst project, seed scripts, API contract shapes
- **Person 1 (Frontend):** Single dynamic page: KSP Header (logo + CM + Dy CM) → Section Nav (anime.js) → 4-Ring Radial Navigation (SVG gold/teal/purple/red) → full-page transitions to Dashboard | Maps | Network | Intel. Flowsint-style Intel Graph (React Flow, 7 nodes: IP/Name/Place/Object/How/Why/What). All crime/cyber/analysis/data/admin features. Dummy SCRB CSV data.

### Day 2 — Backend + Verify + Deploy + Setup
- **You:** Catalyst Functions setup, API Gateway routing, Catalyst Authentication, Zia AutoML training, AppSail setup for heavy models, Strategic Hub APIs
- **Person 1 (Frontend):** Connect frontend to live backend APIs, verify every page, fix errors

### Day 3 — Test + Demo
- **You:** Full smoke test deployed Catalyst app, final Data Store seeding, README updates
- **Person 1 (Frontend):** UI polish, responsive fixes, demo walkthrough recording

## Team
- **You:** Backend + DB + ML + Infra (Medium)
- **Person 1:** Frontend — all React/Tailwind/Leaflet/Cytoscape/Recharts (Good)
