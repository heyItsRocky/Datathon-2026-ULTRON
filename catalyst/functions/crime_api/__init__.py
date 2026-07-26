"""
ULTRON — Crime Track API
Catalyst Python Function for crime data CRUD, stats, network analysis, MO matching.

Routes:
  GET    /api/crime/cases            — List cases (paginated)
  GET    /api/crime/cases/{id}       — Case detail
  POST   /api/crime/cases            — Create new case
  GET    /api/crime/criminals        — List criminals
  GET    /api/crime/criminals/{id}   — Criminal profile + links
  GET    /api/crime/network/{id}     — Criminal network graph (BFS)
  GET    /api/crime/stats            — Aggregate statistics
  GET    /api/crime/trends           — Time-series trends
  GET    /api/crime/hotspots         — DBSCAN hotspot clusters
  GET    /api/crime/mo-similar/{id}  — MO pattern matching
"""

import json
import sys
import os

# Add common utilities to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response,
    TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS, TABLE_DISTRICTS,
    CRIME_TYPES, CRIME_STATUS, KARNATAKA_DISTRICTS
)
from db_utils import (
    query_table, get_record, insert_record, update_record, delete_record,
    count_records, get_crime_stats, get_trends, get_hotspots,
    get_criminal_network, get_mo_similar
)


def _safe_int(value, default):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _safe_float(value, default):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def handler(request, context):
    """
    Main entry point for the Crime API Catalyst Function.
    
    Args:
        request: dict with method, path, query_params, body, headers
        context: dict with project_id, org_id, etc.
    
    Returns:
        dict with statusCode, body, headers
    """
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}
    
    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}
    
    # Handle CORS preflight
    if method == 'OPTIONS':
        return success_response(None)
    
    # ---- Route Matching ----
    
    # GET /cases (list)
    if method == 'GET' and path in ('/api/crime/cases', '/cases'):
        limit = _safe_int(params.get('limit'), 50)
        offset = _safe_int(params.get('offset'), 0)
        crime_type = params.get('crime_type')
        district = params.get('district')
        status = params.get('status')
        
        conditions = []
        if crime_type:
            conditions.append(('CRIME_TYPE', '=', crime_type))
        if district:
            conditions.append(('DISTRICT', '=', district))
        if status:
            conditions.append(('STATUS', '=', status))
        
        cases = query_table(
            TABLE_CRIMES,
            conditions=conditions if conditions else None,
            limit=limit,
            offset=offset,
            order_by=('CREATED_AT', 'DESC') if not conditions else None
        )
        
        total = count_records(TABLE_CRIMES, conditions if conditions else None)
        
        return success_response({
            'cases': cases,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    
    # GET /cases/{id} (detail)
    if method == 'GET' and (path.startswith('/api/crime/cases/') or path.startswith('/cases/')):
        case_id = path.rsplit('/', 1)[-1]
        case = get_record(TABLE_CRIMES, 'FIR_NUMBER', case_id)
        if not case:
            return error_response(f'Case {case_id} not found', 404)
        
        # Get linked criminals
        links = query_table(
            TABLE_CRIME_LINKS,
            conditions=[('FIR_NUMBER', '=', case_id)],
            limit=50
        )
        
        return success_response({'case': case, 'linked_criminals': links})
    
    # POST /cases (create)
    if method == 'POST' and path in ('/api/crime/cases', '/cases'):
        required = ['FIR_NUMBER', 'CRIME_TYPE', 'DISTRICT', 'DESCRIPTION']
        missing = [f for f in required if f not in body]
        if missing:
            return error_response(f'Missing required fields: {", ".join(missing)}')
        
        result = insert_record(TABLE_CRIMES, body)
        return success_response({'created': True, 'record': result}, 201)
    
    # GET /criminals (list)
    if method == 'GET' and path in ('/api/crime/criminals', '/criminals'):
        limit = _safe_int(params.get('limit'), 50)
        offset = _safe_int(params.get('offset'), 0)
        
        criminals = query_table(
            TABLE_CRIMINALS,
            limit=limit,
            offset=offset
        )
        total = count_records(TABLE_CRIMINALS)
        
        return success_response({
            'criminals': criminals,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    
    # GET /criminals/{id} (detail)
    if method == 'GET' and (path.startswith('/api/crime/criminals/') or path.startswith('/criminals/')):
        criminal_id = path.rsplit('/', 1)[-1]
        criminal = get_record(TABLE_CRIMINALS, 'CRIMINAL_ID', criminal_id)
        if not criminal:
            return error_response(f'Criminal {criminal_id} not found', 404)
        
        # Get linked cases
        links = query_table(
            TABLE_CRIME_LINKS,
            conditions=[('CRIMINAL_ID', '=', criminal_id)],
            limit=50
        )
        
        return success_response({'criminal': criminal, 'linked_cases': links})
    
    # GET /network/{id} (criminal network graph)
    if method == 'GET' and (path.startswith('/api/crime/network/') or path.startswith('/network/')):
        criminal_id = path.rsplit('/', 1)[-1]
        network = get_criminal_network(criminal_id)
        if not network:
            return error_response(f'Criminal {criminal_id} not found', 404)
        return success_response(network)
    
    # GET /stats
    if method == 'GET' and path in ('/api/crime/stats', '/stats'):
        stats = get_crime_stats()
        return success_response(stats)
    
    # GET /trends
    if method == 'GET' and path in ('/api/crime/trends', '/trends'):
        months = _safe_int(params.get('months'), 12)
        trends = get_trends(months=months)
        return success_response({'trends': trends, 'months': months})
    
    # GET /hotspots
    if method == 'GET' and path in ('/api/crime/hotspots', '/hotspots'):
        eps = _safe_float(params.get('eps'), 0.5)
        min_samples = _safe_int(params.get('min_samples'), 5)
        hotspots = get_hotspots(eps=eps, min_samples=min_samples)
        return success_response({'hotspots': hotspots, 'count': len(hotspots)})
    
    # GET /mo-similar/{id}
    if method == 'GET' and (path.startswith('/api/crime/mo-similar/') or path.startswith('/mo-similar/')):
        case_id = path.rsplit('/', 1)[-1]
        top_k = _safe_int(params.get('top_k'), 10)
        results = get_mo_similar(case_id, top_k=top_k)
        return success_response({'results': results})
    
    # 404 for unmatched routes
    return error_response(f'Route not found: {method} {path}', 404)
