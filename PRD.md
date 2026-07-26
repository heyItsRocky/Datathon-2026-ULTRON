# ULTRON: Unified Law Enforcement Threat Response & Optimization Nexus
**Product Requirements Document (PRD) — Catalyst-Native Stack**
**Client:** Karnataka State Police (SCRB) — Datathon 2026
**Target Platform:** Zoho Catalyst

---

## 1. Product Overview

**ULTRON** is an AI-powered intelligence platform designed to bridge the gap between siloed crime data and proactive policing. Built specifically for the State Crime Records Bureau (SCRB), it transforms raw FIRs, criminal records, and cyber incident logs into actionable, predictive intelligence.

The platform is split into two specialized investigation tracks:
1. **Crime Track:** Physical crime analysis, spatiotemporal mapping, criminal network analysis, and socio-economic correlation.
2. **CyberCrime Track:** Digital forensics, IP/domain reputation, network flow mapping, and phishing threat detection.

**Plus:** A **Conversational AI** interface allowing officers to query the crime database in natural language (with multilingual support via QuickML LLM).

---

## 2. Core Capabilities (Official SCRB Pillars)

1. **Advanced Visualization:** High-fidelity interactive dashboards and map-based interfaces (Leaflet) with real-time crime hotspots.
2. **Network & Link Analysis:** Criminal syndicate mapping and cyber attack path visualization (Cytoscape).
3. **Sociological & Predictive Dashboards:** Correlating crime with literacy, poverty, and predicting future risk zones.
4. **Pattern & Trend Discovery:** Automated detection of Modus Operandi (MO) similarities across jurisdictions (Jaccard similarity).
5. **Network & Behavioral Analysis:** Profiling suspect behavior and interaction frequencies (BFS graph traversal).
6. **AI/ML-Driven Intelligence:** 8 specialized machine learning models powering automated insights.
7. **Conversational Crime Analyst:** Natural language queries against the crime database via QuickML LLM with Intent Classification.

---

## 3. Architecture Overview (Zoho Catalyst Ecosystem)

The entire stack is hosted natively on Catalyst by Zoho, as required by Datathon 2026 submission guidelines.

| Component | Technology | Catalyst Service |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS | Catalyst Static Hosting |
| **Backend API** | Python 3.13 — Unified Catalyst Function | **Catalyst Functions (Advanced I/O)** |
| **Database** | Relational (8 tables) | **Catalyst Data Store** (ZCQL) |
| **LLM / RAG** | GLM-4.7 via QuickML | **Catalyst QuickML** |
| **ML Inference** | scikit-learn (Random Forest, DBSCAN, Isolation Forest, TF-IDF) | Embedded in Catalyst Functions |
| **Authentication** | Catalyst Embedded Auth | **Catalyst Authentication** |
| **File Storage** | Crime photos, FIR PDFs, evidence | **Catalyst Stratus** |
| **API Routing** | Internal routing in Python (no gateway needed for single function) | Catalyst API Gateway (optional) |

---

## 4. Key Features & Interface

### 4.1 Frontend Architecture (Single Page Application)
- **KSP Header:** Official branding, CM & Deputy CM photos, deep dark blue (`#0a0e1a`) with gold accents.
- **Section Navigation:** 5 items with `anime.js` sliding underline transitions.
- **Radial Navigation:** 4-ring SVG radial menu (Gold, Teal, Purple, Red segments).
- **Intel Graph:** React Flow node editor (Flowsint-style) with 7 node types (IP, Name, Place, Object, How, Why, What).
- **50+ Pages:** Crime dashboard, cyber dashboard, maps, network graphs, intelligence briefs, admin panel, and conversational AI interface.

### 4.2 Strategic Intelligence Hub (Command Center)
- **Socio-Economic Correlation:** Heatmaps comparing crime vs. literacy/poverty indexes.
- **Predictive Risk Heatmap:** ML-generated high-risk zones overlaid on Karnataka map.
- **Emerging Trends:** Fastest-rising crime types per district.
- **Red-Zone Alerts:** Pulsing district borders when anomaly thresholds are breached.
- **Intelligence Briefs:** Auto-generated daily briefs with AI-sourced recommendations.

### 4.3 Map & Graph Enhancements
- **Leaflet Map:** Spatiotemporal toggles (All-time, Weekly, Monthly), socio-economic overlays, cluster expansion, hotspot overlays.
- **Cytoscape Graph:** MO match highlighting (thick edges for high similarity), timeline slider, recency heat-glow.
- **Cyber Flow:** Attack path highlighting (shortest path IP to victim), threat level coloring.

### 4.4 Conversational AI
- Natural language crime database queries (e.g., "How many theft cases in Bengaluru this month?")
- Intent classification system routing queries to appropriate DB lookups
- Multi-language translation (via QuickML)
- RAG document queries against police knowledge base

---

## 5. Machine Learning Models (8 Total)

All models run in **Catalyst Functions** using `scikit-learn` (inference only — pre-trained on seed data). No external ML infrastructure required.

### Crime Track (4 Models)

| # | Model | Algorithm | Purpose | File |
|---|-------|-----------|---------|------|
| 1 | **Hotspot Detection** | DBSCAN clustering | Identifies spatial crime clusters from lat/lng | `models.py` / `db_utils.py` |
| 2 | **Recidivism Risk** | Random Forest Classifier | Predicts criminal re-offense probability (1-100) | `models.py` |
| 3 | **Anomaly Detection** | Isolation Forest | Flags unusual crime spikes per district | `models.py` |
| 4 | **MO Matching** | Jaccard Similarity | Links unsolved cases by modus operandi similarity | `db_utils.py` |

### Cyber Track (4 Models)

| # | Model | Algorithm | Purpose | File |
|---|-------|-----------|---------|------|
| 5 | **IP Reputation** | Random Forest Classifier | Scores IP addresses as malicious/benign | `cyber_models.py` |
| 6 | **Phishing Detection** | Logistic Regression | Classifies domains as phishing or legitimate | `cyber_models.py` |
| 7 | **Network Flow Anomaly** | Isolation Forest | Detects anomalous traffic patterns in network flows | `cyber_models.py` |
| 8 | **Attack Path Correlation** | BFS + scoring heuristics | Maps shortest attack path from source to target | `cyber_models.py` |

### Combined Risk Scoring
A `CombinedRiskScorer` in `risk_model.py` merges crime recidivism risk + cyber threat scores into a unified risk profile.

---

## 6. Database Schema (Catalyst Data Store / ZCQL)

8 tables for complete crime + cyber tracking:

### Crimes
| Column | Type | Notes |
|--------|------|-------|
| FIR_NUMBER | varchar(50) | **PK** |
| CRIME_TYPE | varchar(100) | e.g., Homicide, Theft, Burglary |
| DESCRIPTION | text | Free-text MO description |
| DATE_OCCURRED | date | |
| DISTRICT | varchar(100) | FK to Districts |
| LATITUDE / LONGITUDE | double | For geo-spatial queries |
| STATUS | varchar(50) | Open / Under Investigation / Closed |
| SEVERITY | varchar(20) | Low / Medium / High / Critical |

### Criminals
| Column | Type | Notes |
|--------|------|-------|
| CRIMINAL_ID | varchar(50) | **PK** |
| NAME | varchar(200) | |
| AGE | int | |
| CRIMINAL_TYPE | varchar(100) | e.g., Violent, Property, Cyber |
| MODUS_OPERANDI | text | Text for MO similarity matching |
| DANGER_SCORE | double | 0.0 – 1.0 (from ML model) |
| STATUS | varchar(50) | Active / Incarcerated / Deceased |

### CrimeCriminalLinks
Links crimes to criminals (many-to-many).

### Districts
Karnataka district data with population, literacy rate, poverty index, police station count, and boundary geo-coordinates.

### CyberThreats
Cyber incidents with MITRE ATT&CK technique mapping, severity, source/target IPs, and domains.

### CyberIndicators
IOCs (IPs, domains, hashes, URLs) linked to threats.

### Users
System user accounts with roles (admin, officer, analyst, viewer).

### AuditLogs
Immutable audit trail for all admin actions.

---

## 7. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (React + Vite + 50+ pages) | ✅ Complete | Full mock data layer (28 JSON files) |
| Catalyst Config & Structure | ✅ Complete | `catalyst-config.json`, `catalyst/` directory |
| Shared Common Layer | ✅ Complete | Constants, DB utils, all 8 ML models, risk scorer |
| Crime API Handler | ✅ Complete | 20+ routes (cases, criminals, hotspots, MO matching) |
| Cyber API Handler | ✅ Complete | Incidents, IP/domain reputation, phishing, flows, attack paths |
| Analytics API Handler | ✅ Complete | Dashboard KPIs, intel briefs, trends, red zones, predictive zones |
| Chat API Handler | ✅ Complete | NL query, intent classification, RAG, translation |
| Admin API Handler | ✅ Complete | Health check, users CRUD, data ingest, audit logs |
| Seed Data Scripts | ✅ Complete | `seed_data.py` (500+ crimes), `seed_cyber.py` (200+ threats) |
| Deployment Guide | ✅ Complete | `catalyst/DEPLOYMENT.md` |
| Architecture Doc | ✅ Complete | `ARCHITECTURE.md` |

---

## 8. Datathon Submission Checklist

- [x] Public GitHub Repository created.
- [x] Frontend prototype built (React 19 / Vite, 50+ pages).
- [x] Backend Catalyst Functions (unified API, all routes implemented).
- [x] ML models (8 models, sklearn-based, embedded in functions).
- [x] Seed data generation scripts.
- [x] Deployment guide and architecture documentation.
- [ ] Deployed on Catalyst (Static Hosting + Functions + Data Store).
- [ ] Prototype Brief finalized.
- [ ] Demo Video recorded.
- [ ] Submission Template completed.
