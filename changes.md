# ULTRON — Change Log

> Rule from split.md: every push MUST have an entry here at the top. Write entry first, then commit + push.

---

## 2026-09-23 — Phase 0–4 completion session (HeyItsRocky / opencode)

**Reason:** Finish ULTRON submission: safety-net frontend fix, local API fallback (Catalyst OAuth blocked), real auth + live API wiring, demo artifacts.

### Commits (in order)

1. **`fix: resolve rules-of-hooks violations by renaming non-hook animation helpers`** `e6456a0`
   - Files: `frontend/src/hooks/useAnimeTransition.ts`, `CommandCenterPage.tsx`, `UnifiedDashboardPage.tsx`, `RadialNav.tsx`
   - Reason: `usePageEnter`/`useRadialTransition` were misnamed hooks breaking Rules of Hooks; renamed to `pageEnterProps`/`radialTransitionProps`. Baseline lint clean (warnings only), `npm run build` green.

2. **`feat: local API, JWT auth, live API wiring, demo artifacts`**
   - Files (new): `BLOCKERS.md`, `INTEGRATION_GAPS.md`, `DEMO_SCRIPT.md`, `scripts/local_api.py`, `frontend/src/features/dashboard/api/dashboardApi.ts`, `KSP_Datathon_2026_ULTRON_Submission.pptx`, `changes.md`
   - Files (modified): `frontend/.env.example`, `frontend/vite.config.ts`, `client.ts`, `authStore.ts`, `LoginPage.tsx`, DTO adapters (crime/cyber/admin), `crimeApi.ts`, CommandCenter + UnifiedDashboard pages, `README.md`, `.gitignore`, `COMPLETION_GUIDE.md`, `catalyst/functions/api/requirements.txt`
   - Reason: Catalyst `catalyst login` blocked (no Zoho OAuth/browser); shipped Flask+SQLite local API with envelope unwrap, UPPER_CASE→DTO mapping, real login, dashboard live adapter, filled PPTX, demo script.

3. **`feat: complete ULTRON with frontend, backend, ML models, and deployment config`** (prior session baseline — already on remote)

### Verification (this session)
- `npm run lint` → exit 0 (warnings only)
- `npm run build` → exit 0 (`✓ built`)
- Local API: `/health` healthy, `POST /auth/login` → JWT, modules smoke-tested after ZCQL COUNT fix

### Not done / blocked
- Cloud Catalyst deploy (OAuth) — BLOCKERS.md
- Chat UI page — backend only (`POST /chat/query` works)
- Demo video recording
- Vitest / mobile nav / pagination (quality backlog)
