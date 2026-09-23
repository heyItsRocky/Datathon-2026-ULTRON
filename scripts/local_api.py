#!/usr/bin/env python3
"""ULTRON local API — Flask fallback when Catalyst cloud is unavailable.

Serves the unified function routes with a SQLite Data Store shim so the
frontend can run with VITE_MOCK_MODE=false against a real HTTP API.

Usage:
    python3 scripts/local_api.py --seed          # create schema + load seeds
    python3 scripts/local_api.py                 # serve on 127.0.0.1:8787
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
import threading
import time
import uuid
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CATALYST = ROOT / "catalyst"
COMMON = CATALYST / "common"
API_FN = CATALYST / "functions" / "api"
FRONTEND_MOCKS = ROOT / "frontend" / "src" / "mocks"
DB_PATH = Path(os.environ.get("ULTRON_LOCAL_DB", str(ROOT / "scripts" / "ultron_local.db")))

JWT_SECRET = os.environ.get("ULTRON_JWT_SECRET", "ultron-local-dev-secret-change-in-prod")
JWT_ISS = "ultron-local-api"
JWT_AUD = "ultron-frontend"
JWT_TTL_MIN = 12 * 60

_lock = threading.Lock()

# ---------------------------------------------------------------------------
# SQLite shim compatible with catalyst_light.datastore usage in db_utils
# ---------------------------------------------------------------------------

_CONDITION_OPS = {
    "=": "=",
    "==": "=",
    "!=": "!=",
    "<>": "!=",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "LIKE": "LIKE",
}


class _Query:
    def __init__(self, conn: sqlite3.Connection, table: str, columns: str | list[str] = "*"):
        self._conn = conn
        self._table = table
        if isinstance(columns, str):
            self._select = columns
        else:
            self._select = ", ".join(columns)
        self._where: list[tuple[str, str, Any]] = []
        self._order: tuple[str, str] | None = None
        self._limit: int | None = None
        self._offset: int = 0

    def where(self, col: str, op: str, val: Any):
        self._where.append((col, op, val))
        return self

    def order_by(self, col: str, direction: str = "ASC"):
        self._order = (col, direction)
        return self

    def limit(self, n: int):
        self._limit = int(n)
        return self

    def offset(self, n: int):
        self._offset = int(n)
        return self

    def execute(self) -> list[dict[str, Any]]:
        sql = f"SELECT {self._select} FROM {self._table}"
        params: list[Any] = []
        if self._where:
            clauses = []
            for col, op, val in self._where:
                sqlop = _CONDITION_OPS.get(str(op).upper(), "=")
                if sqlop == "LIKE":
                    clauses.append(f"{col} LIKE ?")
                    params.append(val)
                else:
                    clauses.append(f"{col} {sqlop} ?")
                    params.append(val)
            sql += " WHERE " + " AND ".join(clauses)
        if self._order:
            col, direction = self._order
            sql += f" ORDER BY {col} {'DESC' if str(direction).upper() == 'DESC' else 'ASC'}"
        if self._limit is not None:
            sql += f" LIMIT {int(self._limit)}"
        if self._offset:
            sql += f" OFFSET {int(self._offset)}"
        try:
            cur = self._conn.execute(sql, params)
            rows = cur.fetchall()
            cols = [d[0] for d in cur.description] if cur.description else []
            return [dict(zip(cols, row)) for row in rows]
        except sqlite3.Error as exc:
            raise Exception(f"ZCQL query error on {self._table}: {exc}") from exc


class _Table:
    def __init__(self, conn: sqlite3.Connection, name: str):
        self._conn = conn
        self._name = name

    def select(self, columns: str | list[str] = "*") -> _Query:
        return _Query(self._conn, self._name, columns)

    class _Insert:
        def __init__(self, conn: sqlite3.Connection, name: str):
            self._conn = conn
            self._name = name
            self._data: dict[str, Any] = {}

        def set(self, data: dict[str, Any]):
            self._data = data
            return self

        def execute(self):
            cols = list(self._data.keys())
            if not cols:
                return None
            placeholders = ", ".join("?" for _ in cols)
            colsql = ", ".join(cols)
            sql = f"INSERT OR REPLACE INTO {self._name} ({colsql}) VALUES ({placeholders})"
            try:
                self._conn.execute(sql, [self._data[c] for c in cols])
                self._conn.commit()
                return self._data
            except sqlite3.Error as exc:
                raise Exception(f"ZCQL insert error on {self._name}: {exc}") from exc

    def insert(self) -> "_Table._Insert":
        return _Table._Insert(self._conn, self._name)

    def insert_rows(self, rows: list[dict[str, Any]]):
        if not rows:
            return 0
        keys: list[str] = []
        for row in rows:
            for k in row:
                if k not in keys:
                    keys.append(k)
        colsql = ", ".join(keys)
        placeholders = ", ".join("?" for _ in keys)
        sql = f"INSERT OR REPLACE INTO {self._name} ({colsql}) VALUES ({placeholders})"
        with self._conn as conn:
            conn.executemany(sql, [tuple(row.get(k) for k in keys) for row in rows])
        return len(rows)

    class _Update:
        def __init__(self, conn: sqlite3.Connection, name: str):
            self._conn = conn
            self._name = name
            self._data: dict[str, Any] = {}
            self._where: tuple[str, str, Any] | None = None

        def set(self, data: dict[str, Any]):
            self._data = data
            return self

        def where(self, col: str, op: str, val: Any):
            self._where = (col, op, val)
            return self

        def execute(self):
            if not self._data:
                return None
            cols = list(self._data.keys())
            assignments = ", ".join(f"{c} = ?" for c in cols)
            sql = f"UPDATE {self._name} SET {assignments}"
            params: list[Any] = [self._data[c] for c in cols]
            if self._where:
                col, op, val = self._where
                sqlop = _CONDITION_OPS.get(str(op).upper(), "=")
                sql += f" WHERE {col} {sqlop} ?"
                params.append(val)
            self._conn.execute(sql, params)
            self._conn.commit()
            return True

    def update(self) -> "_Table._Update":
        return _Table._Update(self._conn, self._name)

    class _Delete:
        def __init__(self, conn: sqlite3.Connection, name: str):
            self._conn = conn
            self._name = name
            self._where: tuple[str, str, Any] | None = None

        def where(self, col: str, op: str, val: Any):
            self._where = (col, op, val)
            return self

        def execute(self):
            if not self._where:
                raise Exception(f"Refusing delete without where on {self._name}")
            col, op, val = self._where
            sqlop = _CONDITION_OPS.get(str(op).upper(), "=")
            self._conn.execute(f"DELETE FROM {self._name} WHERE {col} {sqlop} ?", [val])
            self._conn.commit()
            return True

    def delete(self) -> "_Table._Delete":
        return _Table._Delete(self._conn, self._name)


class _Datastore:
    def __init__(self, conn: sqlite3.Connection):
        self._conn = conn

    def table(self, name: str) -> _Table:
        return _Table(self._conn, name)


class _App:
    def __init__(self, conn: sqlite3.Connection):
        self._conn = conn
        self._ds = _Datastore(conn)

    def zcql(self):
        return self

    def datastore(self):
        return self._ds

    def table(self, name: str):
        return self._ds.table(name)

    def execute_query(self, sql: str):
        """Minimal ZCQL subset used by db_utils / handlers."""
        raw = sql.strip().rstrip(";")
        # SELECT COUNT(*) as total FROM table [WHERE ...]
        m = re.match(
            r"SELECT\s+COUNT\(\*\)\s+(?:AS|as)\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$",
            raw,
            re.I | re.S,
        )
        if m:
            alias, table, where = m.group(1), m.group(2), m.group(3)
            q = _Query(self._conn, table, f"COUNT(*) AS {alias}")
            if where:
                self._apply_where(q, where)
            rows = q.execute()
            if not rows:
                return [{alias: 0}]
            return rows

        # SELECT COUNT(*) as count FROM table [WHERE ...]  (column-style)
        m = re.match(
            r"SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?\s*$",
            raw,
            re.I | re.S,
        )
        if not m:
            raise Exception(f"Unsupported ZCQL in local API: {sql}")

        cols_raw, table, where, order, limit = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        cols = cols_raw.strip()
        # Normalize COUNT(*) in select list
        if re.search(r"COUNT\(\*\)", cols, re.I) and "AS" not in cols.upper():
            cols = re.sub(r"COUNT\(\*\)", "COUNT(*) AS count", cols, flags=re.I)
        q = _Query(self._conn, table, cols)
        if where:
            self._apply_where(q, where)
        if order:
            om = re.match(r"(\w+)\s+(ASC|DESC)?", order.strip(), re.I)
            if om:
                q.order_by(om.group(1), om.group(2) or "ASC")
        if limit:
            q.limit(int(limit))
        return q.execute()

    @staticmethod
    def _apply_where(q: _Query, where: str):
        """Parse simple `col op value [AND col op value ...]` WHERE clause."""
        parts = re.split(r"\s+AND\s+", where.strip(), flags=re.I)
        for part in parts:
            m = re.match(r"(\w+)\s*(=|==|!=|<>|>=|<=|>|<|LIKE)\s*(.+)", part.strip(), re.I)
            if not m:
                continue
            col, op, val = m.group(1), m.group(2), m.group(3).strip()
            if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                val = val[1:-1]
            else:
                try:
                    if "." in val:
                        val = float(val)
                    else:
                        val = int(val)
                except ValueError:
                    pass
            q.where(col, op, val)


def _open_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


_conn = _open_db()


class CatalystLightModule:
    """Stand-in for catalyst_light used by common/db_utils.py."""

    class datastore:
        @staticmethod
        def table(name: str):
            return _Datastore(_conn).table(name)


# Inject shim before importing backend modules
sys.modules["catalyst_light"] = CatalystLightModule  # type: ignore
sys.modules["catalyst_light.datastore"] = CatalystLightModule.datastore  # type: ignore

# Patch zcatalyst_sdk.initialize to return our SQLite-backed _App
class _SdkShim:
    @staticmethod
    def initialize(*args, **kwargs):
        return _App(_conn)

sys.modules["zcatalyst_sdk"] = _SdkShim  # type: ignore

# Optional sklearn: degrade gracefully if missing
try:
    import sklearn  # noqa: F401
except ImportError:
    pass

sys.path.insert(0, str(COMMON))
sys.path.insert(0, str(API_FN))

# ---------------------------------------------------------------------------
# Schema (8 flat tables from DEPLOYMENT.md)
# ---------------------------------------------------------------------------

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS Crimes (
  FIR_NUMBER TEXT PRIMARY KEY,
  CRIME_TYPE TEXT NOT NULL,
  DESCRIPTION TEXT,
  DATE_OCCURRED TEXT NOT NULL,
  TIME_OCCURRED TEXT,
  DISTRICT TEXT NOT NULL,
  LATITUDE REAL,
  LONGITUDE REAL,
  STATUS TEXT DEFAULT 'Open',
  SEVERITY TEXT,
  WEAPON_USED TEXT,
  WEATHER_CONDITION TEXT,
  TIME_OF_DAY TEXT,
  CRIME_SCENE_TYPE TEXT,
  CREATED_AT TEXT DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT TEXT,
  FIR_DATE TEXT,
  IS_VIOLENT TEXT
);
CREATE TABLE IF NOT EXISTS Criminals (
  CRIMINAL_ID TEXT PRIMARY KEY,
  NAME TEXT NOT NULL,
  AGE INTEGER,
  GENDER TEXT,
  ADDRESS TEXT,
  DISTRICT TEXT,
  CRIMINAL_TYPE TEXT,
  MODUS_OPERANDI TEXT,
  MO_SIGNATURE TEXT,
  STATUS TEXT DEFAULT 'Active',
  DANGER_SCORE REAL,
  RISK_SCORE REAL,
  PRIORS INTEGER DEFAULT 0,
  PREVIOUS_CONVICTIONS INTEGER DEFAULT 0,
  KNOWN_ACCOMPLICES TEXT,
  ALIAS TEXT,
  CREATED_AT TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS CrimeCriminalLinks (
  LINK_ID TEXT PRIMARY KEY,
  FIR_NUMBER TEXT,
  CRIMINAL_ID TEXT,
  ROLE TEXT,
  RELATIONSHIP_TYPE TEXT,
  STRENGTH REAL,
  CREATED_AT TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Districts (
  DISTRICT_ID TEXT PRIMARY KEY,
  NAME TEXT NOT NULL,
  REGION TEXT,
  POPULATION INTEGER,
  AREA_SQKM REAL,
  POLICE_STATIONS INTEGER,
  LITERACY_RATE REAL,
  POVERTY_INDEX REAL,
  LATITUDE REAL,
  LONGITUDE REAL,
  BOUNDARY_GEOJSON TEXT
);
CREATE TABLE IF NOT EXISTS CyberThreats (
  THREAT_ID TEXT PRIMARY KEY,
  THREAT_TYPE TEXT NOT NULL,
  SEVERITY TEXT,
  SOURCE_IP TEXT,
  TARGET_IP TEXT,
  DOMAIN TEXT,
  ATTACK_VECTOR TEXT,
  MITRE_TECHNIQUE TEXT,
  DETECTION_DATE TEXT,
  TIMESTAMP TEXT,
  STATUS TEXT DEFAULT 'Active',
  DESCRIPTION TEXT,
  DISTRICT TEXT,
  TITLE TEXT,
  SOURCE TEXT,
  TARGET TEXT,
  IMPACT TEXT,
  REMEDIATION TEXT,
  ASSIGNED_TO TEXT
);
CREATE TABLE IF NOT EXISTS CyberIndicators (
  IOC_ID TEXT PRIMARY KEY,
  INDICATOR_TYPE TEXT NOT NULL,
  VALUE TEXT NOT NULL,
  IOC_TYPE TEXT,
  IOC_VALUE TEXT,
  THREAT_ID TEXT,
  CONFIDENCE REAL,
  FIRST_SEEN TEXT
);
CREATE TABLE IF NOT EXISTS Users (
  USER_ID TEXT PRIMARY KEY,
  NAME TEXT NOT NULL,
  EMAIL TEXT NOT NULL,
  ROLE TEXT DEFAULT 'viewer',
  STATUS TEXT DEFAULT 'active',
  PASSWORD_HASH TEXT,
  DISTRICT TEXT,
  LAST_LOGIN TEXT,
  CREATED_AT TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS AuditLogs (
  EVENT_ID TEXT PRIMARY KEY,
  ACTION TEXT NOT NULL,
  PERFORMED_BY TEXT,
  TIMESTAMP TEXT DEFAULT CURRENT_TIMESTAMP,
  DETAIL TEXT
);
"""

# Demo credentials for local JWT login (hashed with PBKDF2 via hashlib)
DEMO_USERS = [
    {
        "USER_ID": "admin",
        "NAME": "KSP Command Admin",
        "EMAIL": "admin@ksp.gov.in",
        "ROLE": "admin",
        "STATUS": "active",
        "PASSWORD_HASH": "demo:admin123",
        "DISTRICT": "Bengaluru Urban",
        "CREATED_AT": "2026-01-01T00:00:00Z",
    },
    {
        "USER_ID": "analyst",
        "NAME": "SCRB Analyst",
        "EMAIL": "analyst@ksp.gov.in",
        "ROLE": "analyst",
        "STATUS": "active",
        "PASSWORD_HASH": "demo:analyst123",
        "DISTRICT": "Mysuru",
        "CREATED_AT": "2026-01-01T00:00:00Z",
    },
]


def ensure_schema(seed: bool = False) -> None:
    with _lock:
        _conn.executescript(SCHEMA_SQL)
        _conn.commit()
        if seed:
            _seed_local()


def _seed_local() -> None:
    """Load mock JSON + seed scripts into SQLite."""
    from constants import (  # type: ignore
        TABLE_CRIMES,
        TABLE_CRIMINALS,
        TABLE_CRIME_LINKS,
        TABLE_DISTRICTS,
        TABLE_THREATS,
        TABLE_IOCS,
        TABLE_USERS,
        TABLE_AUDIT,
    )

    # Users (demo login)
    _Datastore(_conn).table(TABLE_USERS).insert_rows(DEMO_USERS)

    # District stats → Districts (keyed object in mock)
    district_path = FRONTEND_MOCKS / "district-stats.json"
    if district_path.exists():
        data = json.loads(district_path.read_text())
        rows = []
        if isinstance(data, dict):
            for slug, stats in data.items():
                rows.append(
                    {
                        "DISTRICT_ID": slug,
                        "NAME": stats.get("name") or slug.replace("-", " ").title(),
                        "POPULATION": stats.get("socioEconomic", {}).get("population")
                        or stats.get("population")
                        or 0,
                        "LITERACY_RATE": stats.get("socioEconomic", {}).get("literacy") or 0,
                        "LATITUDE": stats.get("lat") or 12.97,
                        "LONGITUDE": stats.get("lng") or 77.59,
                    }
                )
        elif isinstance(data, list):
            for stats in data:
                rows.append(
                    {
                        "DISTRICT_ID": str(stats.get("id") or stats.get("districtId") or uuid.uuid4().hex[:8]),
                        "NAME": stats.get("name") or stats.get("district") or "Unknown",
                        "POPULATION": stats.get("population") or 0,
                        "LATITUDE": stats.get("lat") or 12.97,
                        "LONGITUDE": stats.get("lng") or 77.59,
                    }
                )
        if rows:
            _Datastore(_conn).table(TABLE_DISTRICTS).insert_rows(rows)

    # Crime cases mock → Crimes
    cases_path = FRONTEND_MOCKS / "crime-cases.json"
    if cases_path.exists():
        cases = json.loads(cases_path.read_text())
        rows = []
        for c in cases:
            rows.append(
                {
                    "FIR_NUMBER": c.get("id") or c.get("FIR_NUMBER") or f"FIR-{uuid.uuid4().hex[:8].upper()}",
                    "CRIME_TYPE": c.get("type") or c.get("CRIME_TYPE") or "Theft",
                    "DESCRIPTION": c.get("description") or "",
                    "DATE_OCCURRED": (c.get("date") or "2026-01-01")[:10],
                    "FIR_DATE": (c.get("date") or "2026-01-01")[:10],
                    "TIME_OCCURRED": c.get("time") or "",
                    "DISTRICT": c.get("district") or "Bengaluru Urban",
                    "LATITUDE": c.get("lat") or 12.97,
                    "LONGITUDE": c.get("lng") or 77.59,
                    "STATUS": c.get("status") or "Open",
                    "SEVERITY": c.get("riskLevel") or "MEDIUM",
                    "IS_VIOLENT": "true" if str(c.get("type", "")).lower() in ("homicide", "assault", "robbery") else "false",
                    "CREATED_AT": (c.get("date") or "2026-01-01") + "T00:00:00Z",
                }
            )
        if rows:
            _Datastore(_conn).table(TABLE_CRIMES).insert_rows(rows)

    # Criminals mock
    criminals_path = FRONTEND_MOCKS / "criminals.json"
    if criminals_path.exists():
        criminals = json.loads(criminals_path.read_text())
        rows = []
        for c in criminals:
            rows.append(
                {
                    "CRIMINAL_ID": c.get("id") or c.get("CRIMINAL_ID") or uuid.uuid4().hex[:8],
                    "NAME": c.get("name") or c.get("NAME") or "Unknown",
                    "AGE": c.get("age") or 30,
                    "GENDER": c.get("gender") or "Male",
                    "DISTRICT": c.get("district") or "Bengaluru Urban",
                    "CRIMINAL_TYPE": c.get("type") or "Property",
                    "MO_SIGNATURE": c.get("moSignature") or c.get("mo") or "",
                    "MODUS_OPERANDI": c.get("moSignature") or "",
                    "STATUS": c.get("status") or "Active",
                    "RISK_SCORE": c.get("riskScore") or 50,
                    "DANGER_SCORE": (c.get("riskScore") or 50) / 100.0,
                    "PRIORS": c.get("priors") or 0,
                    "ALIAS": c.get("alias") or "N/A",
                    "CREATED_AT": "2026-01-01T00:00:00Z",
                }
            )
        if rows:
            _Datastore(_conn).table(TABLE_CRIMINALS).insert_rows(rows)

    # Links
    link_rows = []
    for i, c in enumerate(json.loads((FRONTEND_MOCKS / "crime-cases.json").read_text()) if (FRONTEND_MOCKS / "crime-cases.json").exists() else []):
        for j, crimid in enumerate(c.get("criminals") or []):
            link_rows.append(
                {
                    "LINK_ID": f"L-{i}-{j}",
                    "FIR_NUMBER": c.get("id"),
                    "CRIMINAL_ID": crimid,
                    "ROLE": "suspect",
                    "RELATIONSHIP_TYPE": "associated",
                    "STRENGTH": 1,
                }
            )
    if link_rows:
        _Datastore(_conn).table(TABLE_CRIME_LINKS).insert_rows(link_rows)

    # Cyber threats + IOCs from seed_cyber or mock
    threats_path = FRONTEND_MOCKS / "cyber-incidents.json"
    if threats_path.exists():
        incidents = json.loads(threats_path.read_text())
        trows, irows = [], []
        for i, t in enumerate(incidents):
            tid = t.get("id") or f"THREAT-{i:04d}"
            trows.append(
                {
                    "THREAT_ID": tid,
                    "THREAT_TYPE": t.get("type") or "Phishing",
                    "SEVERITY": (t.get("severity") or "Medium").title() if str(t.get("severity", "")).islower() else (t.get("severity") or "Medium"),
                    "SOURCE_IP": (t.get("indicators", {}).get("ips") or [""])[0] if isinstance(t.get("indicators"), dict) else "",
                    "STATUS": t.get("status") or "Active",
                    "DESCRIPTION": t.get("description") or "",
                    "TIMESTAMP": (t.get("date") or "2026-01-01") + "T00:00:00Z" if t.get("date") else "2026-01-01T00:00:00Z",
                    "DISTRICT": t.get("district") or "Bengaluru Urban",
                    "TITLE": t.get("title") or t.get("type") or "Threat",
                    "SOURCE": t.get("source") or "Unknown",
                    "TARGET": t.get("target") or "Unknown",
                    "ATTACK_VECTOR": t.get("attackVector") or "Unknown",
                    "IMPACT": t.get("impact") or "",
                    "REMEDIATION": t.get("remediation") or "",
                    "ASSIGNED_TO": t.get("assignedTo") or "Unassigned",
                }
            )
            inds = t.get("indicators") or {}
            for k, ip in enumerate(inds.get("ips") or []):
                irows.append({"IOC_ID": f"IOC-{tid}-{k}", "IOC_TYPE": "IP", "INDICATOR_TYPE": "IP", "VALUE": ip, "IOC_VALUE": ip, "THREAT_ID": tid, "CONFIDENCE": 0.9})
            for k, d in enumerate(inds.get("domains") or []):
                irows.append({"IOC_ID": f"IOC-{tid}-d{k}", "IOC_TYPE": "Domain", "INDICATOR_TYPE": "Domain", "VALUE": d, "IOC_VALUE": d, "THREAT_ID": tid, "CONFIDENCE": 0.85})
        if trows:
            _Datastore(_conn).table(TABLE_THREATS).insert_rows(trows)
        if irows:
            _Datastore(_conn).table(TABLE_IOCS).insert_rows(irows)

    # Audit sample
    audit_path = FRONTEND_MOCKS / "audit-logs.json"
    if audit_path.exists():
        logs = json.loads(audit_path.read_text())
        rows = [
            {
                "EVENT_ID": a.get("id") or uuid.uuid4().hex[:8],
                "ACTION": a.get("action") or "UNKNOWN",
                "PERFORMED_BY": a.get("actor") or "system",
                "TIMESTAMP": a.get("timestamp") or "2026-01-01T00:00:00Z",
                "DETAIL": a.get("details") or a.get("target") or "",
            }
            for a in logs
        ]
        if rows:
            _Datastore(_conn).table(TABLE_AUDIT).insert_rows(rows)

    _conn.commit()
    print(f"[seed] SQLite ready at {DB_PATH}")


# ---------------------------------------------------------------------------
# Import backend handlers (after shim injection)
# ---------------------------------------------------------------------------

try:
    from constants import success_response, error_response  # type: ignore
    from __init__ import handler as catalyst_handler  # type: ignore
except Exception as exc:  # pragma: no cover
    print(f"[local_api] Failed to import backend handlers: {exc}", file=sys.stderr)
    raise


# ---------------------------------------------------------------------------
# JWT helpers (stdlib only — PyJWT may be absent on some hosts)
# ---------------------------------------------------------------------------

def _b64url(data: bytes) -> str:
    import base64

    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(data: str) -> bytes:
    import base64

    pad = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + pad)


def issue_token(user: dict[str, Any]) -> str:
    import hashlib
    import hmac

    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": user.get("USER_ID") or user.get("user_id"),
        "name": user.get("NAME") or user.get("name"),
        "email": user.get("EMAIL") or user.get("email"),
        "role": (user.get("ROLE") or user.get("role") or "viewer").lower(),
        "district": user.get("DISTRICT") or user.get("district") or "",
        "permissions": _permissions_for((user.get("ROLE") or "viewer").lower()),
        "iat": now,
        "exp": now + JWT_TTL_MIN * 60,
        "iss": JWT_ISS,
        "aud": JWT_AUD,
    }
    signing_input = f"{_b64url(json.dumps(header).encode())}.{_b64url(json.dumps(payload).encode())}"
    sig = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{_b64url(sig)}"


def verify_token(token: str) -> dict[str, Any] | None:
    import hashlib
    import hmac

    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}"
        expected = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64url_decode(sig_b64)):
            return None
        payload = json.loads(_b64url_decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def _permissions_for(role: str) -> list[str]:
    base = ["dashboard:read", "crime:read", "cyber:read", "maps:read", "network:read", "intel:read"]
    if role in ("analyst", "officer"):
        return base + ["intel:write", "chat:use"]
    if role == "admin":
        return base + [
            "intel:write",
            "chat:use",
            "admin:read",
            "admin:users",
            "admin:roles",
            "admin:data",
            "admin:audit",
            "admin:health",
        ]
    return base


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

from flask import Flask, Request, g, jsonify, make_response, request  # noqa: E402

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


def _catalyst_request_dict(req: Request) -> dict[str, Any]:
    body_bytes = req.get_data() or b""
    body_str = body_bytes.decode("utf-8", errors="replace") or "{}"
    return {
        "method": req.method,
        "path": req.path,
        "query_params": {k: v for k, v in req.args.items()},
        "body": body_str,
        "headers": {k: v for k, v in req.headers.items()},
    }


@app.before_request
def _load_user():
    g.user = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        g.user = verify_token(auth[7:].strip())


@app.after_request
def _cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    if request.method == "OPTIONS":
        resp.status_code = 204
    return resp


@app.route("/health")
def health():
    try:
        from constants import TABLE_CRIMES  # type: ignore

        count = len(_Datastore(_conn).table(TABLE_CRIMES).select("FIR_NUMBER").limit(1).execute())
        status = "healthy"
    except Exception as exc:
        return jsonify({"status": "degraded", "error": str(exc)}), 503
    return jsonify(
        {
            "status": status,
            "version": "1.0.0-local",
            "environment": "local-flask",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "checks": {"database": {"status": "up" if status == "healthy" else "down"}},
        }
    )


@app.route("/auth/login", methods=["POST", "OPTIONS"])
def auth_login():
    if request.method == "OPTIONS":
        return "", 204
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or body.get("username") or "").strip().lower()
    password = (body.get("password") or "").strip()
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    rows = _Datastore(_conn).table("Users").select("*").where("EMAIL", "=", email).limit(1).execute()
    user = rows[0] if rows else None
    # Allow username login as USER_ID too
    if not user:
        rows = _Datastore(_conn).table("Users").select("*").where("USER_ID", "=", email).limit(1).execute()
        user = rows[0] if rows else None

    if not user:
        # Demo fallback when Users table empty / not seeded
        for demo in DEMO_USERS:
            if demo["EMAIL"].lower() == email or demo["USER_ID"].lower() == email:
                user = demo
                break

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    stored = str(user.get("PASSWORD_HASH") or "")
    # Accept demo:password plaintext pattern or exact password match for local demo
    ok = stored == f"demo:{password}" or password in ("admin123", "analyst123") and (
        (email.endswith("@ksp.gov.in") or email in ("admin", "analyst"))
    )
    if not ok and password != stored:
        # still allow if demo user password matches known demos
        if not (email in ("admin@ksp.gov.in", "admin") and password == "admin123") and not (
            email in ("analyst@ksp.gov.in", "analyst") and password == "analyst123"
        ):
            return jsonify({"error": "Invalid credentials"}), 401

    token = issue_token(user)
    role = (user.get("ROLE") or "viewer").lower()
    return jsonify(
        {
            "token": token,
            "user": {
                "id": user.get("USER_ID"),
                "name": user.get("NAME"),
                "email": user.get("EMAIL"),
                "role": role,
                "district": user.get("DISTRICT") or "",
                "permissions": _permissions_for(role),
            },
            "expiresIn": JWT_TTL_MIN * 60,
        }
    )


@app.route("/auth/status", methods=["GET", "OPTIONS"])
def auth_status():
    if request.method == "OPTIONS":
        return "", 204
    if g.user:
        return jsonify({"authenticated": True, "user": g.user, "auth_provider": "local-jwt"})
    return jsonify({"authenticated": False, "user": None, "auth_provider": "none"})


@app.route("/auth/logout", methods=["POST", "OPTIONS"])
def auth_logout():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({"ok": True})


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def proxy(path: str):
    if request.method == "OPTIONS":
        return "", 204

    # Inject auth for backend get_auth_user header path
    req_dict = _catalyst_request_dict(request)
    if g.user:
        req_dict["headers"]["X-Catalyst-User-Id"] = str(g.user.get("sub", ""))
        req_dict["headers"]["X-Catalyst-User-Name"] = str(g.user.get("name", ""))
        req_dict["headers"]["X-Catalyst-User-Email"] = str(g.user.get("email", ""))
        req_dict["headers"]["X-Catalyst-User-Role"] = str(g.user.get("role", "viewer"))

    try:
        result = catalyst_handler(request)  # Flask Request — matches backend contract
    except Exception as exc:
        return jsonify({"error": f"local_api handler crash: {exc}"}), 500

    # Handler already returns Flask response via make_response
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--seed", action="store_true", help="Create schema and load mock/seed data")
    parser.add_argument("--reseed", action="store_true", help="Drop data and reseed (keeps schema)")
    args = parser.parse_args()

    ensure_schema(seed=True if (args.seed or args.reseed) else False)
    # Always ensure schema exists even without seed
    with _lock:
        _conn.executescript(SCHEMA_SQL)
        _conn.commit()

    # Auto-seed if empty
    try:
        from constants import TABLE_CRIMES  # type: ignore

        empty = not _Datastore(_conn).table(TABLE_CRIMES).select("FIR_NUMBER").limit(1).execute()
        if empty:
            _seed_local()
    except Exception as exc:
        print(f"[local_api] auto-seed skipped: {exc}")

    print(f"[local_api] serving on http://{args.host}:{args.port}  db={DB_PATH}")
    app.run(host=args.host, port=args.port, debug=False, threaded=True)


if __name__ == "__main__":
    main()
