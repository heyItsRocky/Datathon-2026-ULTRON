# ULTRON — Session Blockers

## Phase 2: Zoho Catalyst cloud deploy — BLOCKED

**Blocker:** Catalyst CLI login requires interactive OAuth in a browser with a Zoho account.

**Exact steps attempted:**
1. Installed `zcatalyst-cli@1.28.0` globally (`npm install -g zcatalyst-cli`).
2. Ran `catalyst login --dc in` and `catalyst login --no-localhost --dc in`.
3. CLI printed the OAuth URL:
   `https://accounts.zoho.in/oauth/v2/auth?client_id=1000.…&redirect_uri=http://localhost:9005&…`
4. No Zoho credentials, browser session, or pre-issued `ZCATALYST_TOKEN` exist in this environment.
5. `catalyst whoami` → “Not logged in yet.”
6. `catalyst serve` → same auth wall (“you haven’t logged in yet”).

**Consequence:** Cannot `catalyst functions:deploy`, create Data Store tables, seed via `zcatalyst-sdk`, or obtain a production function URL from this session.

**Workaround shipped this session:**
- Local API fallback: `scripts/local_api.py` (Flask) with SQLite-backed Data Store shim + seed loaders.
- Frontend `VITE_MOCK_MODE=false` points at `http://127.0.0.1:8787` for live-API development and smoke tests.
- Production Catalyst deploy remains: complete OAuth in a browser with the team Zoho account, then follow `catalyst/DEPLOYMENT.md`.

**Host note:** `/tmp` was full (tmpfs 100%) mid-session — logs written under project path (`/tmp` unreliable on this host).

**To unblock (human, ~10 min):**
```bash
npm install -g zcatalyst-cli
cd catalyst && catalyst login --dc in   # open printed URL in browser, sign in to Zoho
catalyst project:use 49084000000013049
cd functions/api && catalyst functions:deploy
# Then create 8 tables in Console (schema in catalyst/DEPLOYMENT.md) and run:
pip install zcatalyst-sdk
python scripts/seed_data.py
python scripts/seed_cyber.py --output /tmp/cyber.json
# Point frontend/.env VITE_API_BASE_URL at the function URL, rebuild, slate:link / hosting:deploy
```

## Phase 2: Docker Compose local fallback — NOT FEASIBLE

Docker / `docker-compose` are not installed on this machine. Local fallback is the Flask server above instead.

## QuickML / Chat LLM — partially offline

`POST /chat/query` routes exist but `QUICKML_ENDPOINT` / `LLM_DEPLOYMENT_ID` are unset in `catalyst-config.json`. Local API returns intent-classified DB answers without an LLM until QuickML is configured.
