# ULTRON — Catalyst Deployment Guide

## Prerequisites

| Item | Version | Notes |
|------|---------|-------|
| Node.js | >= 18 | `node -v` to check |
| Zoho Catalyst CLI | 1.26.1+ | `npm install -g zcatalyst-cli` |
| Python | 3.12+ | Catalyst supports 3.12 on the platform |
| Zoho Catalyst Account | — | Register at [catalyst.zoho.com](https://catalyst.zoho.com) |
| GitHub Account | — | For version control integration |

---

## Step 1: Create a Catalyst Project

1. Log in to [Catalyst Console](https://console.catalyst.zoho.com)
2. Click **New Project**
3. Enter project name: `ULTRON`
4. Select **Blank Project** template
5. Choose region closest to Karnataka (e.g., **India — Mumbai**)
6. Click **Create**

> ⚠️ Note your **Project ID** from the project settings page. You'll need it for the config.

---

## Step 2: Install & Initialize Catalyst CLI

```bash
# Install CLI (if not already installed)
npm install -g zcatalyst-cli

# Verify installation
zcatalyst --version
# Expected: 1.26.1 or higher

# Log in to your Catalyst account
zcatalyst auth login
# Opens a browser for OAuth authentication

# Initialize project in the catalyst/ directory
cd /mnt/e/Datathon-2026-ULTRON/catalyst
zcatalyst init

# When prompted:
# 1. Select your ULTRON project from the list
# 2. Accept the default folder structure
```

---

## Step 3: Configure Environment Variables

Edit `catalyst/catalyst-config.json` with your values:

```json
{
  "CATALYST_PROJECT_ID": "your_project_id",
  "CATALYST_ORG_ID": "your_org_id",
  "LLM_ENDPOINT": "https://quickml-llm.catalyst.zoho.com/your-deployment/",
  "LLM_DEPLOYMENT_ID": "your_llm_deployment_id",
  "KB_DOCUMENT_ID": "your_knowledge_base_doc_id"
}
```

---

## Step 4: Deploy Functions

### Option A: Deploy the Unified API Function (Recommended)

```bash
cd /mnt/e/Datathon-2026-ULTRON/catalyst/functions/api

# Deploy the function
zcatalyst functions:deploy

# The CLI will:
# 1. Package the function (function.json + requirements.txt + Python files)
# 2. Upload to Catalyst
# 3. Install dependencies (catalyst-light, scikit-learn, numpy, scipy)
# 4. Return the function endpoint URL
```

After deploy, note the **Function URL** — it will look like:
`https://{project_id}-{deployment_id}.cs.{region}.catalyst.zoho.com/api/`

### Option B: Deploy Individual Functions (Alternative)

If you'd rather deploy the 5 separate functions:

```bash
# Deploy each independently
for func in crime_api cyber_api analytics_api chat_api admin_api; do
  cd /mnt/e/Datathon-2026-ULTRON/catalyst/functions/$func
  zcatalyst functions:deploy
done
```

> **Option A** (single function) is recommended because it gives the frontend a single URL, avoids API Gateway complexity, and simplifies cross-function imports.

---

## Step 5: Set Up Data Store Tables

### Create Tables via Catalyst Console

1. Go to **Data Store** → **Tables** in Catalyst Console
2. Create the following 8 tables:

### Table: `Crimes`

| Column | Type | Constraints |
|--------|------|-------------|
| FIR_NUMBER | varchar(50) | **Primary Key** |
| CRIME_TYPE | varchar(100) | NOT NULL |
| DESCRIPTION | text | — |
| DATE_OCCURRED | date | NOT NULL |
| TIME_OCCURRED | varchar(20) | — |
| DISTRICT | varchar(100) | NOT NULL |
| LATITUDE | double | — |
| LONGITUDE | double | — |
| STATUS | varchar(50) | Default: 'Open' |
| SEVERITY | varchar(20) | — |
| WEAPON_USED | varchar(100) | — |
| WEATHER_CONDITION | varchar(50) | — |
| TIME_OF_DAY | varchar(20) | — |
| CRIME_SCENE_TYPE | varchar(50) | — |
| CREATED_AT | timestamp | Default: CURRENT_TIMESTAMP |
| UPDATED_AT | timestamp | — |

### Table: `Criminals`

| Column | Type | Constraints |
|--------|------|-------------|
| CRIMINAL_ID | varchar(50) | **Primary Key** |
| NAME | varchar(200) | NOT NULL |
| AGE | int | — |
| GENDER | varchar(20) | — |
| ADDRESS | text | — |
| DISTRICT | varchar(100) | — |
| CRIMINAL_TYPE | varchar(100) | — |
| MODUS_OPERANDI | text | — |
| STATUS | varchar(50) | Default: 'Active' |
| DANGER_SCORE | double | — |
| KNOWN_ACCOMPLICES | text | — |
| PREVIOUS_CONVICTIONS | int | Default: 0 |
| CREATED_AT | timestamp | Default: CURRENT_TIMESTAMP |

### Table: `CrimeCriminalLinks`

| Column | Type | Constraints |
|--------|------|-------------|
| LINK_ID | varchar(50) | **Primary Key** |
| FIR_NUMBER | varchar(50) | **Foreign Key → Crimes** |
| CRIMINAL_ID | varchar(50) | **Foreign Key → Criminals** |
| ROLE | varchar(100) | — |
| RELATIONSHIP_TYPE | varchar(50) | — |
| CREATED_AT | timestamp | Default: CURRENT_TIMESTAMP |

### Table: `Districts`

| Column | Type | Constraints |
|--------|------|-------------|
| DISTRICT_ID | varchar(50) | **Primary Key** |
| NAME | varchar(100) | NOT NULL |
| REGION | varchar(50) | — |
| POPULATION | bigint | — |
| AREA_SQKM | double | — |
| POLICE_STATIONS | int | — |
| LITERACY_RATE | double | — |
| POVERTY_INDEX | double | — |
| LATITUDE | double | — |
| LONGITUDE | double | — |
| BOUNDARY_GEOJSON | text | Polygon coordinates |

### Table: `CyberThreats`

| Column | Type | Constraints |
|--------|------|-------------|
| THREAT_ID | varchar(50) | **Primary Key** |
| THREAT_TYPE | varchar(100) | NOT NULL |
| SEVERITY | varchar(20) | — |
| SOURCE_IP | varchar(50) | — |
| TARGET_IP | varchar(50) | — |
| DOMAIN | varchar(200) | — |
| ATTACK_VECTOR | varchar(100) | — |
| MITRE_TECHNIQUE | varchar(200) | — |
| DETECTION_DATE | timestamp | Default: CURRENT_TIMESTAMP |
| STATUS | varchar(50) | Default: 'Active' |
| DESCRIPTION | text | — |

### Table: `CyberIndicators`

| Column | Type | Constraints |
|--------|------|-------------|
| IOC_ID | varchar(50) | **Primary Key** |
| INDICATOR_TYPE | varchar(100) | NOT NULL |
| VALUE | varchar(500) | NOT NULL |
| THREAT_ID | varchar(50) | **Foreign Key → CyberThreats** |
| CONFIDENCE | double | — |
| FIRST_SEEN | timestamp | — |

### Table: `Users`

| Column | Type | Constraints |
|--------|------|-------------|
| USER_ID | varchar(50) | **Primary Key** |
| NAME | varchar(200) | NOT NULL |
| EMAIL | varchar(200) | NOT NULL |
| ROLE | varchar(50) | Default: 'viewer' |
| STATUS | varchar(50) | Default: 'active' |
| CREATED_AT | timestamp | Default: CURRENT_TIMESTAMP |

### Table: `AuditLogs`

| Column | Type | Constraints |
|--------|------|-------------|
| EVENT_ID | varchar(50) | **Primary Key** |
| ACTION | varchar(200) | NOT NULL |
| PERFORMED_BY | varchar(200) | — |
| TIMESTAMP | timestamp | Default: CURRENT_TIMESTAMP |
| DETAIL | text | — |

---

## Step 6: Seed Data

After tables are created and the function is deployed, seed the database:

### Option A: Run seed scripts locally (requires Catalyst connection)

```bash
cd /mnt/e/Datathon-2026-ULTRON/scripts

# Set up environment
export CATALYST_PROJECT_ID="your_project_id"
export CATALYST_ORG_ID="your_org_id"

# Install Catalyst Python SDK
pip install zcatalyst-sdk-python

# Run seed scripts
python seed_data.py    # Generates 500+ crimes, 200 criminals, 30 districts
python seed_cyber.py   # Generates 200+ cyber threats, 500+ IOCs
```

### Option B: Run via function endpoint (recommended after deployment)

```bash
# After deploying the unified API function, you can call:
curl -X POST https://{function-url}/admin/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "crimes": [{"FIR_NUMBER": "FIR-001", "CRIME_TYPE": "Theft", "DISTRICT": "Bengaluru Urban", ...}]
  }'
```

> **⚠️ Important:** For the hackathon submission, the frontend already has full mock data baked in. The real backend is only needed to demonstrate the working integration during the live demo.

---

## Step 7: Set Up API Gateway (Optional for Single Function)

If you deployed **Option A** (unified function), API Gateway is optional — the function handles all routing internally.

If you deployed **Option B** (5 separate functions), set up API Gateway:

1. Go to **API Gateway** in Catalyst Console
2. Create a new API with base path `/api`
3. Add resources for each domain:
   - `/crime/*` → Proxy to `crime_api` function
   - `/cyber/*` → Proxy to `cyber_api` function
   - `/dashboard/*` → Proxy to `analytics_api` function
   - `/intel/*` → Proxy to `analytics_api` function
   - `/maps/*` → Proxy to `crime_api` function
   - `/network/*` → Proxy to `crime_api` function
   - `/chat/*` → Proxy to `chat_api` function
   - `/admin/*` → Proxy to `admin_api` function
4. Enable CORS for the frontend domain
5. Deploy the API

---

## Step 8: Connect Frontend

1. Edit `frontend/.env` (create from `.env.example`):

```env
VITE_MOCK_MODE=false
VITE_API_BASE_URL=https://{function-url}/
```

2. Build and deploy the frontend as a Catalyst Static Hosting app:

```bash
cd /mnt/e/Datathon-2026-ULTRON/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Catalyst Static Hosting
zcatalyst hosting:deploy ./dist
```

> **💡 Tip:** For the hackathon submission, you can keep `VITE_MOCK_MODE=true` to demo without a live backend. The mock layer has 120ms simulated delay for realistic UX.

---

## Step 9: Set Up QuickML for LLM Features

The conversational AI features (`/chat/*`) require QuickML deployment:

1. Go to **QuickML** in Catalyst Console
2. Create a new **LLM Deployment**
3. Upload or select a model (GLM-4.7 or similar)
4. Note the **Deployment ID** — add to `catalyst-config.json`
5. (Optional) Create a **Knowledge Base** document for RAG queries
6. Update the environment variables in your Catalyst function settings

---

## Verification Checklist

After deployment, verify each endpoint:

```bash
# Health check
curl https://{function-url}/admin/health

# Crime endpoints
curl https://{function-url}/crime/cases?limit=5
curl https://{function-url}/crime/criminals?limit=5
curl https://{function-url}/maps/hotspots
curl https://{function-url}/network/graph

# Cyber endpoints
curl https://{function-url}/cyber/incidents?limit=5
curl https://{function-url}/cyber/stats

# Analytics
curl https://{function-url}/dashboard/stats
curl https://{function-url}/intel/trends
curl https://{function-url}/maps/red-zones
curl https://{function-url}/maps/predictive-zones

# Chat
curl -X POST https://{function-url}/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How many theft cases in Bengaluru?"}'
```

---

## Troubleshooting

### "No module named 'catalyst_light'" / ImportError

If the Catalyst platform can't find dependencies:

1. Ensure `requirements.txt` includes the right package name
2. Catalyst Functions auto-install from `requirements.txt` on deploy
3. For scikit-learn, note that the platform may have a pre-installed version

### Function Timeout (30s)

- Catalyst Functions have a **30-second timeout** by default
- Long-running tasks (seed data, bulk processing) should use **Job Functions**
- For regular API calls, most responses are <500ms

### CORS Errors

- The `__init__.py` handler returns `Access-Control-Allow-Origin: *` for OPTIONS requests
- If using API Gateway, enable CORS in the gateway settings
- For development: use `VITE_MOCK_MODE=true` to bypass backend entirely

### Data Store Connection Errors

1. Verify table names in Catalyst Console match exactly (case-sensitive)
2. Check the function has Data Store permissions in Catalyst Console
3. Ensure `CATALYST_PROJECT_ID` and `CATALYST_ORG_ID` are set correctly

---

## Architecture Diagram (High-Level)

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│          React + Vite + TypeScript                  │
│        VITE_MOCK_MODE=true|false                    │
└──────────┬──────────────────────────┬──────────────┘
           │ VITE_API_BASE_URL         │ (optional)
           ▼                          ▼
┌─────────────────────┐   ┌─────────────────────┐
│  Catalyst Static    │   │  Function Mock       │
│  Hosting (prod)     │   │  (dev, VITE_MOCK)    │
└──────────┬──────────┘   └─────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────────────────────┐
│              Unified API Function                    │
│          catalyst/functions/api/                     │
│  ┌─────────┬──────────┬──────────┬──────────┐      │
│  │ Crime   │  Cyber   │  Anal.   │  Chat    │      │
│  │ Handler │  Handler │  Handler │  Handler  │      │
│  └────┬────┴────┬─────┴────┬─────┴────┬─────┘      │
│       │         │          │          │              │
│  ┌────▼─────────▼──────────▼──────────▼────┐        │
│  │           Common Layer                   │        │
│  │  db_utils.py, models.py, cyber_models,  │        │
│  │  risk_model.py, constants.py            │        │
│  └──────────────────────────┬──────────────┘        │
└─────────────────────────────┼───────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Catalyst      │ │   Catalyst      │ │   QuickML       │
│   Data Store    │ │   Functions     │ │   (LLM/RAG)     │
│   (8 tables)    │ │   (Job Fn.)     │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Submission Notes (KSP Datathon 2026)

- **Deployment platform**: Zoho Catalyst (mandatory)
- **Frontend**: Fully functional with mock data — no backend needed for judging
- **Backend**: Ready to deploy — connect to real data for live demo
- **Key differentiators**: 8 ML models (hotspot detection, recidivism risk, anomaly detection, IP reputation, phishing detection, network flow anomaly, attack path correlation, combined risk scoring), conversational AI via QuickML, real-time maps with geo-spatial analytics
- **Submission includes**: Working frontend + deployable backend + seed data scripts + this deployment guide
