# ULTRON Demo Script — KSP Datathon 2026 (3 minutes)

## Prerequisites
```bash
# Terminal 1 — local API (SQLite + seeds)
python3 scripts/local_api.py --seed
# → http://127.0.0.1:8787

# Terminal 2 — frontend
cd frontend
cp .env.example .env   # VITE_MOCK_MODE=false, VITE_API_BASE_URL=http://127.0.0.1:8787
npm ci && npm run dev
# → http://localhost:5173
```

Demo login: **admin@ksp.gov.in / admin123**  
(Alternative: analyst@ksp.gov.in / analyst123)

---

## Walkthrough (≈3 min)

| # | Screen | Path | What to show / say | Time |
|---|--------|------|--------------------|------|
| 1 | **Login** | `/login` | Real JWT auth — not a hardcoded demo user. Credentials hit `POST /auth/login`, get HS256 token, store in auth store. | 20s |
| 2 | **Command Center** | `/` | KPI strip from **live** `GET /dashboard/stats` (Total Crimes, Active Cases, Alerts, Cyber Incidents). Radial 4-ring nav: Crime / Cyber / Maps / Intel. | 30s |
| 3 | **Crime** | `/crime` | Crime intelligence overview — totals, type breakdown from `GET /crime/stats` (envelope unwrapped, UPPER_CASE → DTO mapped). | 30s |
| 4 | **Cyber** | `/cyber` | SOC overview — incidents, severity, IOCs from `GET /cyber/incidents`. | 25s |
| 5 | **Maps** | `/maps` | Hotspots (DBSCAN clusters), red zones, district drill-down via `GET /maps/*`. | 30s |
| 6 | **Intel Graph** | `/intel` + Network | Link analysis / intel graph from `GET /network/crime` (or Intel hub briefs from `GET /intel/briefs`). | 30s |
| 7 | **Admin** | `/admin` | Users & audit logs from `GET /admin/users`, `GET /admin/audit-logs` — role-gated (`admin:users`). | 20s |
| 8 | **Chat** ⚠️ | — | **Gap:** Frontend has no `/chat` page yet. Backend `POST /chat/query` works — demo via curl if asked: `curl -X POST localhost:8787/chat/query -H 'Content-Type: application/json' -d '{"query":"thefts in Bengaluru"}'`. | 15s |

**Close:** Architecture (React + Vite → Axios client with envelope unwrap → Catalyst Functions / local Flask fallback → SQLite Data Store) + 8 ML models + Catalyst services.

---

## Live curl probes (for judges)

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8787/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ksp.gov.in","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s http://127.0.0.1:8787/health
curl -s http://127.0.0.1:8787/crime/cases -H "Authorization: Bearer $TOKEN" | head -c 200
curl -s http://127.0.0.1:8787/dashboard/stats -H "Authorization: Bearer $TOKEN" | head -c 300
curl -s http://127.0.0.1:8787/cyber/incidents -H "Authorization: Bearer $TOKEN" | head -c 200
curl -s -X POST http://127.0.0.1:8787/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query":"top crime types this year"}'
```

---

## Known gaps (be honest if asked)
1. **Catalyst cloud deploy** — blocked on Zoho OAuth login (see `BLOCKERS.md`). Local Flask + SQLite is the working fallback this session.
2. **Chat UI** — backend ready, frontend page not built yet.
3. **Docker Compose** — not available on this host; not used.
