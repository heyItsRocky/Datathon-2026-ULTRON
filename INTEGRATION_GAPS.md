# ULTRON Integration Gaps — Frontend ↔ Backend API

**Date:** 2026-09-23  
**Status:** Phase 3 complete — frontend wired to real API (local Flask fallback)

---

## Envelope & Field-Name Mismatches (FIXED)

| Endpoint | Backend Shape | Frontend Expects | Fix Applied |
|----------|--------------|------------------|-------------|
| `GET /crime/cases` | `{cases: [...], total: N}` | `CrimeCaseDTO[]` (bare array) | `unwrapEnvelope` in `client.ts` response interceptor |
| `GET /crime/case/{id}` | `{case: {...}}` | `CrimeCaseDTO` (bare object) | `unwrapEnvelope` DETAIL_ENVELOPE_KEYS |
| `GET /cyber/incidents` | `{incidents: [...], total}` | `CyberIncidentDTO[]` | Same as above |
| `GET /admin/users` | `{users: [...], total}` | `AdminUserDTO[]` | Same |
| `GET /admin/audit` | `{logs: [...], total}` | `AuditLogDTO[]` | Same |
| `GET /models` / `/pipelines` | `{models: []}` / `{pipelines: []}` | Array | Same |
| `GET /dashboard/stats` | `{crime: {...}, cyber: {...}, people: {...}}` | `{kpis, trend, ...}` | **NOT YET MAPPED** — dashboard pages still import mock JSON directly (see below) |
| `GET /crime/stats` | `{total_cases, by_crime_type, ...}` | `{totals, typeBreakdown, ...}` | **NOT YET MAPPED** — needs `adaptCrimeStats` in dto-adapters |

### Backend Row → DTO Field Mapping (applied in dto-adapters)

| Backend (UPPER_CASE) | Frontend DTO | Adapter Field |
|----------------------|--------------|---------------|
| `FIR_NUMBER` | `id` | `id` |
| `CRIME_TYPE` | `type` | `type` |
| `DATE_OCCURRED` | `date` | `date` |
| `DISTRICT` | `district` | `district` |
| `LATITUDE` / `LONGITUDE` | `lat` / `lng` | `lat` / `lng` |
| `STATUS` | `status` | `status` |
| `SEVERITY` | `riskLevel` | `riskLevel` |
| `CRIMINAL_ID` | `id` | `id` |
| `NAME` | `name` | `name` |
| `AGE` / `GENDER` | `age` / `gender` | `age` / `gender` |
| `RISK_SCORE` | `riskScore` | `riskScore` |
| `MO_SIGNATURE` | `moSignature` | `moSignature` |
| `THREAT_ID` | `id` | `id` |
| `THREAT_TYPE` | `type` | `type` |
| `IOC_TYPE` / `IOC_VALUE` | `type` / `value` | `type` / `value` |

Adapters updated in:
- `frontend/src/shared/api/dto-adapters/crime.ts`
- `frontend/src/shared/api/dto-adapters/cyber.ts`
- `frontend/src/shared/api/dto-adapters/admin-adapters.ts`
- `frontend/src/shared/api/dto-adapters/intel.ts`

---

## Auth (FIXED)

| Auth | Status | Notes |
|------|--------|-------|
| `authStore` hardcoded demo user / mock token / always-authenticated | **FIXED** | Unauthenticated by default; real JWT via `POST /auth/login` |
| `LoginPage.tsx` "Coming soon" placeholder | **FIXED** | Real email/password form |
| Backend `POST /auth/login` mock redirect only | **FIXED (local)** | Local API issues HS256 JWT (stdlib hmac) |
| Backend `get_auth_user` MOCK_MODE fallback | **BYPASSED (local)** | Local API injects `X-Catalyst-User-*` from JWT |
| Production Catalyst Embedded/Zoho OAuth | **NOT WIRED** | Needs `VITE_CATALYST_CLIENT_ID` + browser OAuth — blocked, see BLOCKERS.md |

---

## Mock Bypass & Dashboard Gap (OPEN)

| Item | Status | Action |
|------|--------|--------|
| `MOCK_MODE` gate in `client.ts` | **DONE** | `VITE_MOCK_MODE=false` → real API |
| `frontend/.env` / `.env.example` | **DONE** | `VITE_MOCK_MODE=false`, `VITE_API_BASE_URL=http://127.0.0.1:8787` |
| `CommandCenterPage.tsx` direct mock import | **FIXED** | `fetchDashboardStats()` → `/dashboard/stats` with shape adapter |
| `UnifiedDashboardPage.tsx` direct mock import | **FIXED** | same adapter path |
| `GET /crime/stats` shape mismatch | **FIXED** | `adaptCrimeStats` maps backend `total_cases`/`by_crime_type` → DTO |
| Chat UI | **MISSING** | Backend `POST /chat/query` ready; no frontend page — curl demo in DEMO_SCRIPT.md |
| Catalyst cloud auth (Embedded OAuth) | **BLOCKED** | Needs Zoho browser login — see BLOCKERS.md |

---

## Endpoints verified against local API (Phase 3 smoke)

```bash
python3 scripts/local_api.py --seed   # → http://127.0.0.1:8787

# health, login, crime/cases, dashboard/stats, cyber/incidents, chat/query, admin/users
# — see DEMO_SCRIPT.md "Live curl probes"
```

**Still to verify end-to-end in browser:** Maps, Network, Intel Graph, Admin Users/Audit/Roles, full dashboard charts.

---

## Remaining work (Phase 4+ / outside this session if blocked)

1. **Chat UI page** — minimal `/chat` route hitting `POST /chat/query`.
2. **Catalyst cloud auth** — Embedded Login / OAuth when `VITE_CATALYST_CLIENT_ID` set (requires Zoho browser login — BLOCKERS.md).
3. **Demo video recording** — PPTX link slide has placeholder.
4. Optional: tests (vitest), mobile nav, pagination — quality backlog from COMPLETION_GUIDE.md.

---

## How to Run Locally (No Docker, No Catalyst Login)

```bash
# 1. Local API (SQLite + seed)
pip3 install flask scikit-learn --user --break-system-packages
python3 scripts/local_api.py --seed

# 2. Frontend
cd frontend
cp .env.example .env   # VITE_MOCK_MODE=false, VITE_API_BASE_URL=http://127.0.0.1:8787
npm ci && npm run dev
# → open http://localhost:5173 → login with admin@ksp.gov.in / admin123
```

Cloud deploy path (when Zoho OAuth available): see `BLOCKERS.md` → unblock steps.
