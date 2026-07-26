"""
ULTRON API — Unified Catalyst Function
Flask Request adapter + route dispatcher.
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from flask import make_response
from constants import success_response, error_response, ALL_TABLES
from crime_handler import handle_crime_request
from cyber_handler import handle_cyber_request
from analytics_handler import handle_analytics_request
from chat_handler import handle_chat_request
from admin_handler import handle_admin_request


def _normalize_path(path):
    """Strip Catalyst gateway prefixes from request path."""
    for prefix in ('/server/api', '/server/', '/api'):
        if path.startswith(prefix):
            rest = path[len(prefix):]
            return rest if rest else '/'
    return path


def _catchall_handler(request):
    """Catches any unmatched route — logs the path for debugging."""
    raw = request.get('path', '/')
    method = request.get('method', 'GET')
    return error_response(
        f'CATCHALL: method={method} raw_path={repr(raw)} path_bytes={[hex(b) for b in raw.encode("utf-8")]}',
        404,
    )


def _debug_handler(request):
    """Return path diagnostics with route matching debug info.

    Optional query param: ?probe=<path> — test a path against routes
    without sending that actual request.
    """
    raw = request.get('path', '/')
    norm = _normalize_path(raw)
    probe_path = request.get('query_params', {}).get('probe')

    route_debug = []
    for prefix, fn in ROUTES:
        entry = {"prefix": prefix, "handler": fn.__name__}
        if probe_path is not None:
            entry["probe_matches"] = probe_path.startswith(prefix)
        else:
            entry["matches"] = norm.startswith(prefix)
        route_debug.append(entry)

    result = {
        "raw_path": raw,
        "normalized_path": norm,
        "method": request.get('method', 'GET'),
        "routes": route_debug,
        "path_bytes": [hex(b) for b in norm.encode('utf-8')[:50]],
        "path_len": len(norm),
        "path_repr": repr(norm),
    }
    if probe_path is not None:
        result["probe_path"] = probe_path
        result["probe_path_bytes"] = [hex(b) for b in probe_path.encode('utf-8')[:50]]
        result["probe_path_len"] = len(probe_path)
        result["probe_path_repr"] = repr(probe_path)

    return success_response(result)


def _debug_tables_handler(request):
    """Probe Data Store tables and report which exist."""
    try:
        import zcatalyst_sdk
        app = zcatalyst_sdk.initialize()
        zcql = app.zcql()
        results = {}
        for t in ALL_TABLES:
            try:
                res = zcql.execute_query(f"SELECT TOP 1 * FROM {t}")
                results[t] = {"exists": True, "sample": bool(res)}
            except Exception as e:
                err = str(e)[:150]
                results[t] = {"exists": False, "error": err}
        return success_response({"table_probe": results, "total": len(ALL_TABLES)})
    except Exception as e:
        return error_response(f"Table probe failed: {e}", 500)


# Route table: path prefix → handler function
ROUTES = [
    ('/debug/tables',   _debug_tables_handler),
    ('/debug',          _debug_handler),
    ('/admin/',         handle_admin_request),
    ('/auth/',          handle_admin_request),
    ('/chat/',          handle_chat_request),
    ('/crime/red-zones',     handle_analytics_request),
    ('/crime/spatiotemporal', handle_crime_request),
    ('/crime/list',          handle_crime_request),
    ('/crime/',              handle_crime_request),
    ('/cyber/',              handle_cyber_request),
    ('/dashboard/',          handle_analytics_request),
    ('/intel/',              handle_analytics_request),
    ('/analysis/',           handle_analytics_request),
    ('/maps/red-zones',      handle_analytics_request),
    ('/maps/predictive-zones', handle_analytics_request),
    ('/maps/',               handle_crime_request),
    ('/network/',            handle_crime_request),
    ('*',                    _catchall_handler),
]


def _flask_to_dict(request):
    """Convert Flask Request → dict for domain handlers."""
    body_data = request.get_json(silent=True)
    body_str = json.dumps(body_data) if body_data is not None else (request.get_data(as_text=True) or '{}')
    return {
        'method': request.method,
        'path': _normalize_path(request.path),
        'query_params': request.args.to_dict(),
        'body': body_str,
        'headers': dict(request.headers),
    }


def handler(request):
    """Catalyst Advanced IO entry point."""
    req_dict = _flask_to_dict(request)
    method = req_dict['method']
    path = req_dict['path']

    print(f"[ULTRON] method={method} raw_path={repr(request.path)} normalized_path={repr(path)}")

    if method == 'OPTIONS':
        return _wrap(success_response(None))

    for prefix, handler_fn in ROUTES:
        if prefix == '*':
            return _wrap(handler_fn(req_dict))
        if path.startswith(prefix):
            return _wrap(handler_fn(req_dict))

    return _wrap(error_response(f'Route not found: {method} {path}', 404))


def _wrap(resp):
    """Convert handler dict → Flask Response."""
    if hasattr(resp, 'status_code'):
        return resp
    body = resp.get('body', '{}')
    status = resp.get('statusCode', 200)
    headers = resp.get('headers', {})
    return make_response(body, status, headers)
