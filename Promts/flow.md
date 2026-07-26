# ULTRON — Flowcharts & System Diagrams

---

## 1. System Architecture — How Everything Connects

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USERS (SCRB)                                  │
│         ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐        │
│         │SCRB Admin│  │ Analyst │  │Cyber Cell│  │District Ofc│        │
│         └────┬─────┘  └────┬────┘  └────┬─────┘  └─────┬─────┘        │
│              │              │             │               │              │
└──────────────┼──────────────┼─────────────┼───────────────┼──────────────┘
               │              │  🔐 Catalyst Auth│               │
               ▼              ▼             ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND (Vite + TS)                       │
│                                                                         │
│   ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│   │  Dashboard │  │  Crime   │  │  Cyber   │  │   Intelligence   │    │
│   │  /dashboard│  │  /crime  │  │  /cyber  │  │   Hub /intel     │    │
│   └─────┬──────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘    │
│         │              │              │                  │              │
│   ┌─────▼──────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────────▼─────────┐   │
│   │ Leaflet Map│  │Cytoscape│  │Cytoscape│  │Recharts Charts   │   │
│   │(crime pins)│  │(criminal│  │(cyber   │  │(socio-economic   │   │
│   │+ heatmaps) │  │ network)│  │ flow)   │  │+ trends)         │   │
│   └────────────┘  └─────────┘  └─────────┘  └──────────────────┘   │
│                                                                         │
│   Libraries: React Router | Zustand (state) | Tailwind | Recharts      │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │  🔄 REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND (Python)                           │
│                                                                         │
│   ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────────┐    │
│   │ Auth API │  │ Crime API│  │  Cyber API  │  │ Intelligence API │    │
│   │/auth/*   │  │/crime/*  │  │  /cyber/*   │  │  /intel/*        │    │
│   └────┬─────┘  └────┬─────┘  └─────┬──────┘  └───────┬──────────┘    │
│        │              │              │                  │              │
│   ┌────▼──────────────▼──────────────▼──────────────────▼──────────┐   │
│   │                  SERVICE LAYER  (Business Logic)                 │   │
│   │   Risk Scoring  │  MO Matching  │  Anomaly Detection  │  Trend  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│        │              │              │                                  │
│   ┌────▼──────────────▼──────────────▼────────────────────────────────┐ │
│   │                     Zia AutoML + AppSail                       │ │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │ │
│   │  │RiskScore │  │ Anomaly  │  │ MO Match │  │  Predictive    │   │ │
│   │  │Classifier│  │ Detector │  │(TF-IDF + │  │  Zone Forecaster│   │ │
│   │  │(RF)      │  │(Isolation│  │ Cosine   │  │  (Time Series)  │   │ │
│   │  │          │  │ Forest)  │  │ Sim)     │  │                 │   │ │
│   │  └──────────┘  └──────────┘  └──────────┘  └────────────────┘   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│        │                                                                │
│   ┌────▼──────────────────────────────────────────────────────────────┐ │
│   │                    DATA LAYER                                      │ │
│   │   Catalyst Data Store     │   Catalyst Cache       │ │
│   │   ┌─────────────────┐     │   ┌──────────────────┐                │ │
│   │   │ crimes, criminals│     │   │ session cache,   │                │ │
│   │   │ cyber_incidents  │     │   │ task queue       │                │ │
│   │   │ evidence, users  │     │   │                  │                │ │
│   │   └─────────────────┘     │   └──────────────────┘                │ │
│   └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                                │
│                                                                         │
│   ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐   │
│   │   Celery Scraper │    │  Catalyst Stratus         │    │  opencity.in    │   │
│   │   (scheduled)   │    │  (file storage)   │    │  (demographic   │   │
│   │   ↓             │    │  - evidence docs  │    │   data)         │   │
│   │   Cyber threat   │    │  - ML exports     │    │                 │   │
│   │   feeds, OSINT   │    │                   │    │                 │   │
│   └─────────────────┘    └──────────────────┘    └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Crime Track — Data Flow (How a Crime Becomes Intelligence)

```
CRIME REPORTED
      │
      ▼
┌───────────────────────────────────────────────────────┐
│                  POST /crime (API)                     │
│  Fields: type, date, location, description, criminal  │
└───────────────────────┬───────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
┌─────────────────┐ ┌──────────┐ ┌──────────────┐
│  DB INSERT      │ │ ML MODEL │ │ RED-ZONE     │
│  crimes table   │ │ MO Match │ │ CHECK        │
└────────┬────────┘ │ Score +  │ │ Detect if    │
         │          │ Similar  │ │ district in  │
         ▼          │ Criminals│ │ anomaly      │
┌─────────────────┐ └────┬─────┘ └──────┬───────┘
│  MAP UPDATE     │      │               │
│  New pin on     │      ▼               ▼
│  Leaflet +      │ ┌──────────┐ ┌──────────────┐
│  recluster      │ │ Linked   │ │ PULSING RED  │
└─────────────────┘ │ Criminals│ │ GLOW ON MAP  │
                    │ & Cases  │ │ + Alert Card │
                    └──────────┘ └──────────────┘
```

---

## 3. Page Structure — What the User Sees

```
                        ┌─────────────────────────┐
                        │      LOGIN PAGE         │
                        │   Username + Password   │
                        └───────────┬─────────────┘
                                    │  🔐 Catalyst Auth
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SIDEBAR (Collapsible)                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  🏠 Dashboard ├───►  📊 Stats, alerts, top districts, trends  │ │
│  │  🔍 Crime     ├───►  🗺️ Map, filters, table, detail          │ │
│  │  👤 Criminals ├───►  👥 Table, network graph, risk scores    │ │
│  │  💻 Cyber     ├───►  🌐 IP/domain lookup, flow graph         │ │
│  │  🔗 Network   ├───►  🕸️ Full Cytoscape (crime + cyber)      │ │
│  │  📈 Analysis  ├───►  📊 Hotspots, anomalies, trends          │ │
│  │  🧠 Intel Hub ├───►  🎯 Predictive zones, briefs, red-zones  │ │
│  │  📁 Data      ├───►  📤 Upload, scrape, manual entry          │ │
│  │  ⚙️ Admin     ├───►  👥 Users, roles, system config          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Crime Page — Deep Dive (The Most Complex Page)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CRIME PAGE (/crime)                          │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  FILTERS:  [District ▼] [Crime Type ▼] [From] [To] [Search]   │ │
│  │           [Spatiotemporal: ● Week  ○ Month  ○ All Time]        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────┐  ┌────────────────────────────────┐ │
│  │     LEAFLET MAP OF KARNATAKA │  │  CRIME TABLE                  │ │
│  │                             │  │  ┌──────┬────────┬──────┬───┐ │ │
│  │  • Colored pins by type     │  │  │ Type │ Date   │Dist  │St │ │ │
│  │  • Red-zone pulsing alerts  │  │  ├──────┼────────┼──────┼───┤ │ │
│  │  • Socio-economic overlay   │  │  │Theft │06/15  │BLR   │Act│ │ │
│  │    [None ▼]                 │  │  │...   │        │      │   │ │ │
│  │  • DBSCAN hotspot clusters  │  │  └──────┴────────┴──────┴───┘ │ │
│  │  • Click cluster → popup    │  │  Click row → crime detail      │ │
│  └─────────────────────────────┘  └────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    CRIME DETAIL (sidebar/overlay)               │ │
│  │  ┌──────┬────────┬──────┬─────┬──────────┐                    │ │
│  │  │Field │ Value  │Field │Value│ Criminals│                    │ │
│  │  ├──────┼────────┼──────┼─────┼──────────┤                    │ │
│  │  │Type  │Theft   │Date  │...  │ 👤 A.Rao │  risk: 72 (🔴)    │ │
│  │  │Place │Indiranagar│    │     │ 👤 B.Lal │  risk: 45 (🟡)    │ │
│  │  └──────┴────────┴──────┴─────┴──────────┘                    │ │
│  │  [📎 Evidence] [🔗 Network Graph] [📊 Risk Breakdown]         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Intelligence Hub — The "Senior Officer View"

```
┌──────────────────────────────────────────────────────────────────────┐
│                   STRATEGIC INTELLIGENCE HUB (/intel)                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌──────────────────────┐  ┌────────────────────────────────────────┐ │
│ │ PREDICTIVE RISK MAP  │  │ TOP-5 EMERGING TRENDS                  │ │
│ │ (Tomorrow's zones)   │  │ ┌──────────────────────────────────┐  │ │
│ │                      │  │ │ 🔺 Chain Snatching — BLR +27%   │  │ │
│ │   District shading:  │  │ │ 🔺 Cyber Fraud — Mysore +18%    │  │ │
│ │   🔴 High (3)        │  │ │ 🔻 Burglary — Hubli -12%        │  │ │
│ │   🟡 Medium (5)      │  │ │ 🔺 Assault — Mangalore +9%      │  │ │
│ │   🟢 Low (rest)      │  │ │ 🔺 Vehicle Theft — BLR +15%     │  │ │
│ │                      │  │ └──────────────────────────────────┘  │ │
│ └──────────────────────┘  └────────────────────────────────────────┘ │
│                                                                       │
│ ┌──────────────────────┐  ┌────────────────────────────────────────┐ │
│ │ RED-ZONE DISTRICTS   │  │ SOCIO-ECONOMIC CORRELATION             │ │
│ │ ┌────────────────┐   │  │ ┌──────────────────────────────────┐  │ │
│ │ │ Bengaluru Urban│   │  │ │                                │  │ │
│ │ │ Severity: HIGH │   │  │ │  📊 Bar chart: Crime Rate vs   │  │ │
│ │ │ Trend: 🔺Rising│   │  │ │  Literacy / Poverty / Density  │  │ │
│ │ │ Types: theft,  │   │  │ │  (toggle between factors)      │  │ │
│ │ │ chain-snatching│   │  │ │                                │  │ │
│ │ ├────────────────┤   │  │ │  Insight: High-crime districts │  │ │
│ │ │ Mysore         │   │  │ │  have 22% lower literacy avg   │  │ │
│ │ │ Severity: MED  │   │  │ └──────────────────────────────────┘  │ │
│ │ └────────────────┘   │  └────────────────────────────────────────┘ │
│ └──────────────────────┘                                              │
│                                                                       │
│ ┌──────────────────────────────────────────────────────────────────┐  │
│ │ INTELLIGENCE BRIEFS (Auto-generated by ML)                      │  │
│ │ ┌─────────────────────────────────────────────────────────────┐ │  │
│ │ │ 🔍 MO MATCH DETECTED: 3 chain-snatchings in BLR linked    │ │  │
│ │ │    to same suspect (92% match). Locations: Indiranagar,    │ │  │
│ │ │    Koramangala, Whitefield. Time: 6pm-8pm window.          │ │  │
│ │ ├─────────────────────────────────────────────────────────────┤ │  │
│ │ │ 🚨 RED ZONE ALERT: Bengaluru Urban crossed anomaly         │ │  │
│ │ │    threshold (expected: 45, actual: 73). Suggests patrolling│ │  │
│ │ │    in 3 high-risk zones tomorrow.                          │ │  │
│ │ └─────────────────────────────────────────────────────────────┘ │  │
│ └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Catalyst Data Store Schema (ZCQL) — Full Entity Relationship

```
┌─────────────┐       ┌────────────────┐       ┌──────────────────┐
│   users     │       │   crimes       │       │  criminals       │
├─────────────┤       ├────────────────┤       ├──────────────────┤
│ id (PK)     │──┐    │ id (PK)        │──┐    │ id (PK)          │
│ username    │  │    │ type           │  │    │ name             │
│ password    │  │    │ description    │  │    │ age              │
│ role        │  │    │ date           │  │    │ mo_signature     │
│ district    │  │    │ location       │  │    │ risk_score       │
└─────────────┘  │    │ lat, lng       │  │    │ risk_tier        │
                 │    │ district_id(FK)│  │    │ photo_url        │
                 │    │ status         │  │    │ address          │
                 │    │ created_by(FK)─┘  │    └────────┬─────────┘
                 │    └────────┬────────┘  │            │
                 │             │           │   ┌────────▼─────────┐
                 │    ┌────────▼────────┐  │   │ crime_criminal   │
                 │    │ evidence        │  │   │ (junction table) │
                 │    ├────────────────┤  │   ├──────────────────┤
                 │    │ id (PK)        │  │   │ crime_id (FK)    │
                 │    │ crime_id (FK)──┘  │   │ criminal_id (FK) │
                 │    │ file_url        │  └───│ role             │
                 │    │ type            │      └──────────────────┘
                 │    │ uploaded_by(FK)─┘
                 │    └─────────────────┘
                 │
                 │    ┌──────────────────┐     ┌──────────────────┐
                 │    │ cyber_incidents  │     │ cyber_flow_data │
                 │    ├──────────────────┤     ├──────────────────┤
                 │    │ id (PK)          │     │ id (PK)          │
                 │    │ type             │     │ incident_id(FK)─┘
                 │    │ title            │     │ src_ip, dst_ip   │
                 │    │ description      │     │ protocol, bytes  │
                 │    │ status           │     │ duration         │
                 │    │ source_ip        │     │ anomaly_score    │
                 │    │ target_domain    │     └──────────────────┘
                 │    │ created_by(FK)───┘
                 │    └──────────────────┘
                 │
                 │    ┌──────────────────┐
                 │    │ districts        │
                 │    ├──────────────────┤
                 │    │ id (PK)          │
                 │    │ name             │
                 │    │ geometry (poly)  │
                 │    │ literacy_rate    │
                 │    │ poverty_index    │
                 │    │ pop_density      │
                 │    │ police_coverage  │
                 └────│ updated_by(FK)───┘
                      └──────────────────┘
```

---

## 7. ML Models — What They Actually Do

```
┌─────────────────────────────────────────────────────────────────────┐
│  MODEL 1: CRIMINAL RISK SCORER                                      │
│  Input:  criminal's age, priors_count, crime_types, district, MO   │
│  Output: risk_score (0-100) + risk_tier (🔴 HIGH / 🟡 MED / 🟢 LOW) │
│  Model: Random Forest Classifier                                     │
│  Why:  Officers can prioritize high-risk offenders for surveillance   │
├─────────────────────────────────────────────────────────────────────┤
│  MODEL 2: ANOMALY / RED-ZONE DETECTOR                               │
│  Input:  crime counts per district per type for last 90 days        │
│  Output: anomaly_score + severity for each district                  │
│  Model: Isolation Forest (unsupervised)                              │
│  Why:  "This district had 73 crimes this week when it usually has   │
│        45 — something's wrong, flag it red"                         │
├─────────────────────────────────────────────────────────────────────┤
│  MODEL 3: MO (MODUS OPERANDI) MATCHER                               │
│  Input:  crime description text → criminal MO signatures            │
│  Output: top-5 matching criminals with similarity %                  │
│  Model: TF-IDF Vectorizer + Cosine Similarity                       │
│  Why:  Link serial offenders who use the same method across cases    │
├─────────────────────────────────────────────────────────────────────┤
│  MODEL 4: PREDICTIVE ZONE FORECASTER                                │
│  Input:  historical crime counts per district (time series)         │
│  Output: tomorrow's predicted high-risk districts + probability      │
│  Model: ARIMA / Prophet (time series)                                │
│  Why:  Pre-deploy officers to areas likely to have crime spikes      │
├─────────────────────────────────────────────────────────────────────┤
│  MODEL 5: PHISHING DOMAIN DETECTOR                                  │
│  Input:  domain name, registrar, SSL, DNS records                   │
│  Output: phishing_probability (0-1) + risk flags                    │
│  Model: Logistic Regression (on WHOIS + DNS features)               │
│  Why:  Automatically flag suspicious domains before they're used    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Detective User Journey — End-to-End Flow

```
DETECTIVE logs in
       │
       ▼
Sees DASHBOARD → "14 crimes today, 3 red-zone alerts, Bengaluru Urban spiking"
       │
       ▼
Opens CRIME page → Map shows clusters. Clicks one near Koramangala
       │
       ▼
Sees 5 chain-snatchings in that cluster. Clicks MO Match button
       │
       ▼
ML returns: "92% match with Suspect X — 3 similar cases in Whitefield"
       │
       ▼
Opens CRIMINAL page → Searches Suspect X. Sees network graph of accomplices
       │
       ▼
Clicks Risk Score: "78 — HIGH. Priors: 4, Pattern: evening, solo, snatch-and-run"
       │
       ▼
Opens INTELLIGENCE HUB → Socio-economic chart shows this area has 32% lower literacy
                              → Predictive zone shows high risk tomorrow 6-9pm
                              → Brief: "Deploy patrol in Koramangala-Whitefield corridor"
```

---

## 9. Cyber Track — Investigation Flow

```
CYBER INVESTIGATOR opens /cyber
       │
       ▼
Sees table of recent incidents + IP reputation sidebar
       │
       ▼
Types IP "103.xxx.xxx" into search
       │
       ▼
System returns: Country, ISP, ASN, reputation_score: 18/100 (🟢 clean)
       │
       ▼
Types domain "axis-bank-secure[.]top"
       │
       ▼
System returns: phishing_probability 0.94 — created 2 days ago, no SSL, suspicious registrar
       │
       ▼
Opens Network Flow tab → Cytoscape graph shows:
   Victim (192.168.x.x) ──► Phishing Site (axis-bank-secure.top)
                                     │
                                     ▼
                              Attacker C2 (45.x.x.x)
```

---

## 10. Auth Flow — Who Sees What

```
USER LOGIN (/auth/login)
      │
      ▼
┌───────────────────────────────────────────────────┐
│  Catalyst Auth Token with: { user_id, role, district }│
└──────────────────────┬────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ SCRB ADMIN  │ │  ANALYST    │ │ CYBER CELL  │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ All pages   │ │ Crime, Crim │ │ Cyber,      │
│ All data    │ │ Intel, Dash │ │ Network     │
│ User mgmt   │ │ Analysis    │ │ (no crime)  │
│ System cfg  │ │ (no admin)  │ │ (no admin)  │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 11. Data Pipeline (Cron + SmartBrowz) — Crawl → Enrich → Analyze

```
SCHEDULED SCRAPE (Catalyst Cron every 6hrs)
       │
       ▼
┌─────────────────────────────────────────────┐
│  CRIME DATA PIPELINE                         │
│                                              │
│  opencity.in ──► District demographic data   │
│                     (literacy, poverty, pop)  │
│                          │                    │
│                          ▼                    │
│                     Update districts table    │
│                          │                    │
│                          ▼                    │
│              ┌─────────────────────┐         │
│              │ ML Models retrain   │         │
│              │ on latest data      │         │
│              │ → Risk scores update│         │
│              │ → Red zones refresh │         │
│              │ → Anomalies rescore │         │
│              └─────────────────────┘         │
│                                              │
├─────────────────────────────────────────────┤
│  CYBER DATA PIPELINE                         │
│                                              │
│  Threat feeds ──► IP reputation scores       │
│  AbuseIPDB         → Update ip_reputation    │
│  URLhaus           → Flag malicious domains  │
│  PhishTank         → Phishing alerts         │
│                          │                    │
│                          ▼                    │
│              ┌─────────────────────┐         │
│              │ ML Model retrain    │         │
│              │ Phishing classifier │         │
│              │ refreshes weights   │         │
│              └─────────────────────┘         │
└─────────────────────────────────────────────┘
```

---

## 12. Deployment Architecture (Zoho Catalyst)

```
┌──────────────────────────────────────────────────────────────┐
│                    ZOHO CATALYST ECOSYSTEM                    │
│                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │     SLATE (Frontend)    │  │   FUNCTIONS (Backend)   │   │
│  │  React 19 + TypeScript  │◄─┤   Advanced I/O Python  │   │
│  │  Auto-deploy via GitHub │  │   REST API endpoints    │   │
│  │  Free SSL + Preview URL │  │   ZCQL database access  │   │
│  └─────────────────────────┘  └──────────┬──────────────┘   │
│                                          │                   │
│  ┌─────────────────────────┐  ┌──────────▼──────────────┐   │
│  │     DATA STORE          │  │   AppSail (Docker)      │   │
│  │  ZCQL Relational DB     │◄─┤   Custom ML Models      │   │
│  │  OLAP for analytics     │  │   TF-IDF + ARIMA        │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │     ZIA AutoML          │  │   CRON + SMARTBROWZ     │   │
│  │  No-code tabular ML     │  │   Scheduled scraping    │   │
│  │  RF, IF, Logistic Reg   │  │   Headless browser      │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │     AUTHENTICATION      │  │   STRATUS (Storage)     │   │
│  │  Embedded UI in React   │  │   Evidence & file sync  │   │
│  │  Role-based access      │  │   S3-compatible API     │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
│                                                              │
│  One command: catalyst deploy                                 │
│  GitHub push → auto-build + deploy on Slate                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. API Request Lifecycle — Trace a Single Request

```
USER clicks "Get Crime Details (#1423)"
       │
       ▼
React Router → /crime/1423
       │
       ▼
Zustand store dispatches → fetch('/api/crime/1423')
       │
       ▼
Headers: { Authorization: "Bearer <Catalyst Token>" }
       │
       ▼
Catalyst Auth:  Verifies token signature
       │               Extracts user_id, role
       │               Attaches user to request
       ▼
┌──────────────────────────────────────────────┐
│  CRIME ROUTER (/crime/{id})                   │
│                                               │
│  1. Check user has permission for this crime  │
│     (SCRB admin → all, district ofc → own)   │
│                                               │
│  2. Query Data Store:                         │
│     SELECT * FROM crimes WHERE id=1423       │
│                                               │
│  3. Query related:                            │
│     SELECT criminals + evidence + links       │
│                                               │
│  4. If requested, also return:                │
│     - MO similar crimes (from ML cache)       │
│     - Risk score of linked criminals          │
│                                               │
│  5. Format response as JSON                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
Response: { id: 1423, type: "theft", criminals: [...], ... }
```

---

## 14. Frontend Component Tree — Full Hierarchy

```
App.tsx
├── AuthProvider (Catalyst Auth context)
├── Router
│   ├── /login → LoginPage
│   │   ├── LoginForm
│   │   └── BrandLogo
│   │
│   └── / → Layout (protected)
│       ├── Sidebar
│       │   ├── Logo
│       │   ├── NavItem[] (9 pages)
│       │   └── UserBadge (avatar + role)
│       ├── TopHeader
│       │   ├── GlobalSearch (crimes, criminals, IPs)
│       │   └── NotificationBell
│       │
│       ├── /dashboard → DashboardPage
│       │   ├── StatCard[] (4: crimes, alerts, cyber, red-zones)
│       │   ├── CrimeTrendChart (Recharts line)
│       │   ├── CyberTrendChart (Recharts line)
│       │   ├── TopDistrictsTable
│       │   └── AlertFeed (scrollable)
│       │
│       ├── /crime → CrimePage
│       │   ├── CrimeFilters (district, type, date range, spatiotemporal)
│       │   ├── CrimeMap (Leaflet)
│       │   │   ├── CrimePinLayer
│       │   │   ├── DBSCANClusterLayer
│       │   │   ├── RedZonePulseLayer
│       │   │   └── SocioEconomicOverlay
│       │   ├── CrimeTable
│       │   └── CrimeDetail (slideover)
│       │       ├── BasicInfo
│       │       ├── CriminalList
│       │       ├── EvidenceList
│       │       └── MOMatchButton
│       │
│       ├── /criminal → CriminalPage
│       │   ├── CriminalTable (searchable)
│       │   ├── CriminalDetail
│       │   │   ├── RiskScoreBadge
│       │   │   ├── PriorsList
│       │   │   └── NetworkGraph (Cytoscape mini)
│       │   └── RiskDistributionChart
│       │
│       ├── /cyber → CyberPage
│       │   ├── Tabs: Incidents | IP Search | Domains | Network Flow
│       │   ├── IncidentTable
│       │   ├── IPSearchPanel
│       │   ├── DomainSearchPanel
│       │   └── CyberFlowGraph (Cytoscape full)
│       │
│       ├── /network → NetworkPage
│       │   ├── Tabs: Crime Network | Cyber Network
│       │   ├── CrimeGraph (Cytoscape)
│       │   │   ├── MOMatchHighlighting
│       │   │   ├── TimelineSlider
│       │   │   └── ActivityHeat
│       │   └── CyberGraph (Cytoscape)
│       │       ├── AttackPathHighlight
│       │       └── ThreatLevelColoring
│       │
│       ├── /analysis → AnalysisPage
│       │   ├── HotspotPanel (precomputed clusters)
│       │   ├── AnomalyTable (red-zone details)
│       │   └── TrendChart (by crime type)
│       │
│       ├── /intel → IntelligenceHub
│       │   ├── PredictiveRiskMap (Leaflet)
│       │   ├── TopTrendsCards[]
│       │   ├── RedZoneDistrictTable
│       │   ├── SocioEconomicCharts (Recharts)
│       │   └── IntelligenceBriefs[]
│       │
│       ├── /data → DataPage
│       │   ├── Tabs: Upload | Web Scraping | Manual Entry
│       │   ├── FileUploader
│       │   ├── ScrapeConfigForm
│       │   └── ManualEntryForm
│       │
│       └── /admin → AdminPage
│           ├── UserTable (with role editor)
│           └── SystemConfig
│
└── Zustand Stores
    ├── authStore (user, token, role)
    ├── crimeStore (crimes, filters, detail)
    ├── criminalStore (criminals, search)
    ├── cyberStore (incidents, IP, domains)
    ├── intelStore (briefs, trends, red-zones)
    └── uiStore (sidebar collapsed, theme)
```
