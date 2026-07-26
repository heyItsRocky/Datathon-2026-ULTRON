# ULTRON — Catalyst-Native Architecture

> **Unified Law Enforcement Threat Response & Optimization Nexus**
> KSP Datathon 2026 — Problem Statement #2: Data Visualization & AI-Driven Analytics (with Conversational AI as a feature)

---

## 1. Platform Architecture

```
┌─────────────────────────────────────────────────────┐
│                    SLATE (Frontend)                   │
│          React 19 + Vite + TypeScript + Tailwind      │
│     Hosted on Catalyst Slate (like Vercel/Netlify)    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / CORS
                       ▼
┌─────────────────────────────────────────────────────┐
│              CATALYST API GATEWAY                     │
│  Routes: /crime/* → crime-api function               │
│          /cyber/* → cyber-api function                │
│          /analytics/* → analytics-api function         │
│          /chat/* → chat-api function                  │
│          /admin/* → admin-api function                │
└───────┬──────────┬──────────┬──────────┬───────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ crime-api│ │cyber-api │ │analytics│ │ chat-api │
│ Python   │ │ Python   │ │-api     │ │ Python   │
│ Function │ │ Function │ │ Python  │ │ Function │
│          │ │          │ │Function │ │          │
│ CRUD +   │ │ Cyber    │ │8 ML     │ │ LLM +    │
│ Network  │ │ Threat   │ │Models + │ │ RAG for  │
│ Analysis │ │ Intel    │ │Stats    │ │ Query    │
└────┬─────┘ └────┬─────┘ └────┬────┘ └────┬─────┘
     │            │            │           │
     └────────────┴────────────┴───────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│              CATALYST CLOUD SCALE                      │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐  │
│  │DataStore│ │  NoSQL   │ │ Stratus │ │  Cache   │  │
│  │Relational│ │  Docs    │ │  Object │ │  In-Mem  │  │
│  │(ZCQL)   │ │          │ │ Storage │ │          │  │
│  └─────────┘ └──────────┘ └─────────┘ └──────────┘  │
│                        +                              │
│  ┌────────────┐ ┌─────────────┐ ┌─────────────────┐  │
│  │ QuickML    │ │ Knowledge   │ │ Authentication  │  │
│  │ LLM + RAG  │ │ Base (RAG)  │ │ Native + Social │  │
│  │ + Pipelines│ │ PDF/DOC/TXT │ │ OAuth           │  │
│  └────────────┘ └─────────────┘ └─────────────────┘  │
└───────────────────────────────────────────────────────┘
```

---

## 2. Catalyst Components Used

### 2.1 Python Functions (Advanced I/O HTTP)
- **Runtime:** Python 3.13
- **5 Independent Functions** — each a separate deployment unit
- **Max execution:** 30 seconds per request (standard)
- **Job Functions:** For ML training >30s (up to 15 min via cron/SDK trigger)

### 2.2 Data Store (Relational)
- **Tables:** Crimes, Criminals, CrimeCriminalLinks, Districts, CyberThreats, CyberIndicators, Users, AuditLogs
- **Query Language:** ZCQL (SQL-like)
- **Permissions:** Table-scoped (read/insert/update) per user role

### 2.3 QuickML — LLM Serving
- **Model:** GLM 4.7 or Vision 3.6 (Catalyst built-in)
- **Purpose:** Natural language → ZCQL translation for crime data queries
- **API:** REST with OAuth via Cloud Scale Connections

### 2.4 Knowledge Base + RAG
- **Purpose:** Context-aware Q&A on uploaded documents (FIR PDFs, legal docs)
- **Upload:** Catalyst Console → Knowledge Base → Get Document ID
- **Query:** POST to QuickML RAG endpoint with document ID

### 2.5 Slate (Frontend Hosting)
- **Service:** Catalyst front-end hosting (like Vercel/Netlify)
- **Frameworks:** React 19 + Vite output (static)
- **Features:** Auto-deploy, SSL, custom domain, one-click rollback

### 2.6 Authentication (Catalyst Native)
- **Support:** Email/password + Social login (Zoho, Google, GitHub)
- **Flow:** Embedded login widget in frontend
- **Policies:** Role-based (Admin, Investigator, Viewer)

### 2.7 Stratus (Object Storage)
- **Purpose:** Storing evidence files, documents, and large attachments
- **Features:** Versioning, encryption, malware scanning

---

## 3. Data Store Schema

### 3.1 Crimes (FIR Records)
| Column | Type | Description |
|--------|------|-------------|
| FIR_NUMBER | Text (PK) | Unique FIR identifier |
| CRIME_TYPE | Text | Type: Theft, Assault, Cyber, etc. |
| DISTRICT | Text | Karnataka district |
| FIR_DATE | Text | Date of FIR |
| STATUS | Text | Under Investigation, Closed, etc. |
| ACCUSED_DETAILS | Text | JSON array of accused info |
| VICTIM_DETAILS | Text | JSON array of victim info |
| DESCRIPTION | Text | Case description |
| LATITUDE | Text | Crime location lat |
| LONGITUDE | Text | Crime location lng |
| CRIME_TIME | Text | Time of incident |
| MODUS_OPERANDI | Text | Method description |
| WEAPON_USED | Text | Weapon if any |
| IS_VIOLENT | Boolean | Violent crime flag |
| CREATED_AT | DateTime | Record creation |

### 3.2 Criminals
| Column | Type | Description |
|--------|------|-------------|
| CRIMINAL_ID | Text (PK) | Unique ID |
| NAME | Text | Full name |
| ALIAS | Text | Known aliases |
| GENDER | Text | M/F/O |
| AGE | Integer | Age |
| ADDRESS | Text | Home address |
| DISTRICT | Text | Base district |
| CRIME_TYPE | Text | Primary crime type |
| MODUS_OPERANDI | Text | Signature method |
| STATUS | Text | Active/Incarcerated/Deceased |
| RECIDIVISM_RISK | Text | Low/Medium/High (ML output) |
| SOCIAL_MEDIA_HANDLES | Text | JSON for cyber intel |
| CYBER_ACTIVITY | Text | JSON for digital footprint |
| RISK_SCORE | Number | 0-100 (ML model output) |
| LAST_SEEN | Text | Last known location/date |

### 3.3 CrimeCriminalLinks (Many-to-Many)
| Column | Type | Description |
|--------|------|-------------|
| LINK_ID | Text (PK) | Unique ID |
| FIR_NUMBER | Text (FK → Crimes) | Case reference |
| CRIMINAL_ID | Text (FK → Criminals) | Criminal reference |
| ROLE | Text | Primary/Accomplice/Suspect |
| RELATIONSHIP_STRENGTH | Number | 0.0-1.0 (ML output) |
| NOTES | Text | Additional context |

### 3.4 Districts
| Column | Type | Description |
|--------|------|-------------|
| DISTRICT_ID | Text (PK) | District code |
| NAME | Text | District name |
| POPULATION | Number | Total population |
| AREA_SQKM | Number | Area in sq km |
| POLICE_STATIONS | Number | Count of stations |
| LITERACY_RATE | Number | Percentage |
| POVERTY_INDEX | Number | 0-100 index |

### 3.5 CyberThreats
| Column | Type | Description |
|--------|------|-------------|
| THREAT_ID | Text (PK) | Unique ID |
| THREAT_TYPE | Text | Phishing, Malware, DDoS, etc. |
| SEVERITY | Text | Critical/High/Medium/Low |
| SOURCE_IP | Text | Originating IP |
| TARGET_SYSTEM | Text | Targeted system/service |
| TIMESTAMP | DateTime | Detection time |
| STATUS | Text | Active/Mitigated/Investigating |
| DESCRIPTION | Text | Threat description |
| IOCs | Text | JSON list of IOCs |
| ATTACK_VECTOR | Text | Entry method |
| MITRE_TACTIC | Text | MITRE ATT&CK tactic |
| MITRE_TECHNIQUE | Text | MITRE ATT&CK technique |
| DETECTED_BY | Text | Detection method/tool |

### 3.6 CyberIndicators (IOCs)
| Column | Type | Description |
|--------|------|-------------|
| IOC_ID | Text (PK) | Unique ID |
| THREAT_ID | Text (FK) | Linked threat |
| IOC_TYPE | Text | IP/Domain/Hash/URL/Email |
| IOC_VALUE | Text | The indicator value |
| CONFIDENCE | Number | 0-100 score |
| FIRST_SEEN | DateTime | First observation |
| LAST_SEEN | DateTime | Last observation |
| TAGS | Text | JSON tag array |

### 3.7 Users
| Column | Type | Description |
|--------|------|-------------|
| USER_ID | Text (PK) | Catalyst user ID |
| NAME | Text | Display name |
| ROLE | Text | admin/investigator/viewer |
| DEPARTMENT | Text | Unit/department |
| CREATED_AT | DateTime | Account creation |

### 3.8 AuditLogs
| Column | Type | Description |
|--------|------|-------------|
| LOG_ID | Text (PK) | Auto-generated |
| USER_ID | Text | Who performed action |
| ACTION | Text | What was done |
| RESOURCE_TYPE | Text | Crimes/Threats/Users |
| RESOURCE_ID | Text | ID of affected resource |
| TIMESTAMP | DateTime | When |
| DETAILS | Text | JSON payload |

---

## 4. ML Models Strategy

### Model Deployment Plan (All on Catalyst)

| # | Model | Purpose | Algorithm | Implementation | Expected Latency |
|---|-------|---------|-----------|----------------|------------------|
| 1 | **Crime Hotspot DBSCAN** | Spatial clustering for hotspot detection | `sklearn.cluster.DBSCAN` | Python Function | < 5s |
| 2 | **Recidivism Risk RF** | Criminal re-offense risk scoring | `sklearn.ensemble.RandomForestClassifier` | Python Function / QuickML | < 10s |
| 3 | **Fraud/Anomaly IF** | Anomaly detection in crime patterns | `sklearn.ensemble.IsolationForest` | Python Function | < 5s |
| 4 | **MO Matching** | Modus Operandi similarity (Jaccard) | Pure Python | Python Function | < 2s |
| 5 | **IP Reputation** | Cyber IP risk scoring | Heuristic + RF | Python Function | < 3s |
| 6 | **Phishing Detection** | Email/URL phishing classifier | `sklearn` (SGDClassifier/LR) | Python Function | < 5s |
| 7 | **Network Flow Anomaly** | Traffic pattern anomaly | `sklearn.IsolationForest` | Python Function | < 10s |
| 8 | **Attack Path Graph** | Cyber kill chain correlation | BFS/Graph traversal | Python Function | < 3s |

**Key constraint:** All models run inference within Catalyst Functions' 30s timeout. Model training/r calibration uses **Catalyst Job Functions** (up to 15 min).

### QuickML Integration
- **LLM Serving** → Conversational Query → Natural language → ZCQL translation
- **RAG** → Document Q&A on FIR PDFs and legal documents
- **QuickML Pipeline** → Optional custom ML pipeline for primary prediction model

---

## 5. API Endpoints

### 5.1 Crime API (`/api/crime/`)
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

### 5.2 Cyber API (`/api/cyber/`)
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

### 5.3 Analytics API (`/api/analytics/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | All dashboard KPIs |
| GET | /api/analytics/anomalies | Anomaly detection results |
| GET | /api/analytics/predictive-zones | Predicted crime zones |
| GET | /api/analytics/socio-economic | Socio-economic correlations |
| GET | /api/analytics/geo-data | Map visualization data |
| GET | /api/analytics/recidivism-risk | Risk-scored criminal list |

### 5.4 Chat API (`/api/chat/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat/query | LLM natural language query |
| POST | /api/chat/rag-query | RAG document query |
| POST | /api/chat/translate | Translate query language |

### 5.5 Admin API (`/api/admin/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/health | System health |
| GET | /api/admin/users | List users |
| POST | /api/admin/ingest | Data ingestion |
| GET | /api/admin/audit | Audit log |

---

## 6. Frontend → Backend Integration

### Current Mock-to-Real Migration Path

The frontend has a `VITE_MOCK_MODE` env variable in `.env`:

```
VITE_MOCK_MODE=true    → Uses mock JSON data (current state)
VITE_MOCK_MODE=false   → Calls real Catalyst API Gateway
```

### API Adapter Pattern (already exists in frontend)
All data fetching goes through `src/services/` adapters that check the mode:
```ts
// Example: crimeService.ts
if (VITE_MOCK_MODE) {
  return mockCrimeCases;
}
return fetch(`${API_BASE}/api/crime/cases`).then(r => r.json());
```

### Migration Steps
1. Deploy all Functions to Catalyst
2. Get API Gateway URL from Catalyst Console
3. Set `VITE_API_BASE_URL=<gateway-url>` in frontend
4. Set `VITE_MOCK_MODE=false`
5. Test each page incrementally

---

## 7. Deployment Pipeline

```
Local Dev                    Catalyst Cloud
─────────                    ─────────────
Write Code  ──catalyst deploy──►  Slate (Frontend)
  │                                  │
  ├─ functions/crime_api/    ────────┤  Python Function
  ├─ functions/cyber_api/    ────────┤  Python Function  
  ├─ functions/analytics_api/ ───────┤  Python Function
  ├─ functions/chat_api/     ────────┤  Python Function
  ├─ functions/admin_api/    ────────┤  Python Function
  └─ frontend/               ────────┤  Slate Hosting
```

### Required Catalyst Console Config (Manual)
1. **Create Project** at console.catalyst.zoho.com
2. **Data Store Setup** — Create all 8 tables via UI or ZCQL
3. **Authentication** — Enable social logins, whitelist frontend domain
4. **QuickML Setup** — Connect LLM model, get deployment ID
5. **Knowledge Base** — Upload documents, get document IDs
6. **Cloud Scale Connections** — Create QuickML connection with scopes
7. **CORS** — Whitelist frontend Slate URL in Auth settings

---

## 8. Timeout & Scaling Strategy

| Scenario | Solution | Limit |
|----------|----------|-------|
| Normal API request | Standard Function | 30s |
| ML model inference | Standard Function (optimized) | ~10-20s |
| ML model training | Job Function (cron-triggered) | 15 min |
| Large data export | Job Function | 15 min |
| Real-time chat | Standard Function + Cache | 30s |

---

## 9. Security Model

- **Authentication:** Catalyst Native Auth with role-based access
- **API Security:** OAuth 2.0 via Cloud Scale Connections
- **Data:** Stratus encryption + PII mode for sensitive fields
- **Permissions:** Table-scoped (read-only for viewers, CRUD for admins)
- **Environment Variables:** Stored in `catalyst-config.json`, not in code
- **Audit Trail:** All write operations logged to AuditLogs table

---

## 10. Project Structure

```
ULTRON/
├── catalyst/                          # NEW — Catalyst-native backend
│   ├── catalyst-config.json            # Catalyst project config (auto-generated)
│   ├── common/                         # Shared utilities
│   │   ├── constants.py                # Table names, status enums
│   │   ├── db_utils.py                 # ZCQL query helpers
│   │   ├── models.py                   # Crime hotspot model
│   │   ├── cyber_models.py             # Cyber ML models
│   │   └── risk_model.py              # Recidivism risk model
│   └── functions/                      # Catalyst Advanced IO Functions
│       ├── crime_api/                  # Crime track CRUD + network
│       │   ├── __init__.py             # Handler
│       │   ├── function.json           # Config (runtime, memory, timeout)
│       │   └── requirements.txt        # Dependencies
│       ├── cyber_api/                  # Cyber threat intel
│       │   ├── __init__.py
│       │   ├── function.json
│       │   └── requirements.txt
│       ├── analytics_api/              # ML models + analytics
│       │   ├── __init__.py
│       │   ├── function.json
│       │   └── requirements.txt
│       ├── chat_api/                   # LLM + RAG conversational AI
│       │   ├── __init__.py
│       │   ├── function.json
│       │   └── requirements.txt
│       └── admin_api/                  # Admin + data ingestion
│           ├── __init__.py
│           ├── function.json
│           └── requirements.txt
├── scripts/                            # Synthetic data generators
│   ├── seed_data.py                    # Generate crime/people data
│   └── seed_cyber.py                   # Generate cyber threat data
├── frontend/                           # EXISTING — React 19 + Vite + TS
├── ARCHITECTURE.md                     # THIS FILE
├── PRD.md                              # UPDATED — Catalyst-native PRD
└── README.md                           # UPDATED — Installation + Setup
```
