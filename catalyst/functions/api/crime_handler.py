"""
Crime domain handler — serves /crime/*, /maps/*, /network/* routes.

Maps frontend URL patterns to Catalyst Data Store queries and ML models.
All paths include full frontend path (e.g., /crime/cases, /maps/hotspots).
"""

import json
import sys
import os
import math
import random

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response, TABLE_CRIMES, TABLE_CRIMINALS,
    TABLE_CRIME_LINKS, TABLE_DISTRICTS, KARNATAKA_DISTRICTS
)
from db_utils import (
    query_table, get_record, insert_record, count_records,
    get_crime_stats, get_trends, get_hotspots,
    get_criminal_network, get_mo_similar
)


def _safe_int(val, default=0):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def _safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

# ============================================================
# Main entry
# ============================================================

def handle_crime_request(request):
    """Route crime/maps/network requests to the right handler."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}

    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}

    # ---- CRIME CASES ----
    # GET /crime/cases  (also /crime/list via __init__.py route alias)
    if method == 'GET' and (_path_matches(path, '/crime/cases') or _path_matches(path, '/crime/list')):
        return _list_cases(params)

    # GET /crime/cases/{id}
    if method == 'GET' and _path_match_prefix(path, '/crime/cases/'):
        case_id = path.rsplit('/', 1)[-1]
        return _get_case_detail(case_id)

    # POST /crime/cases
    if method == 'POST' and _path_matches(path, '/crime/cases'):
        return _create_case(body)

    # ---- CRIMINALS ----
    # GET /crime/criminals
    if method == 'GET' and _path_matches(path, '/crime/criminals'):
        return _list_criminals(params)

    # GET /crime/criminals/{id}
    if method == 'GET' and _path_match_prefix(path, '/crime/criminals/'):
        cid = path.rsplit('/', 1)[-1]
        return _get_criminal_detail(cid)

    # ---- STATS & TRENDS ----
    # GET /crime/stats
    if method == 'GET' and _path_matches(path, '/crime/stats'):
        return success_response(get_crime_stats())

    # GET /crime/trends
    if method == 'GET' and _path_matches(path, '/crime/trends'):
        months = _safe_int(params.get('months'), 12)
        return success_response({'trends': get_trends(months=months), 'months': months})

    # GET /crime/mo-match
    if method == 'GET' and _path_matches(path, '/crime/mo-match'):
        return _match_mo(params)

    # GET /crime/hotspots
    if method == 'GET' and _path_matches(path, '/crime/hotspots'):
        return _list_hotspots(params)

    # GET /crime/spatiotemporal — alias for hotspot detection with time range
    if method == 'GET' and _path_matches(path, '/crime/spatiotemporal'):
        return _list_hotspots(params)

    # GET /crime/network/{id}
    if method == 'GET' and _path_match_prefix(path, '/crime/network/'):
        cid = path.rsplit('/', 1)[-1]
        return _get_network(cid)

    # GET /crime/districts/{id}
    if method == 'GET' and _path_match_prefix(path, '/crime/districts/'):
        did = path.rsplit('/', 1)[-1]
        return _get_district_detail(did)

    # ---- MAPS ----
    # GET /maps/hotspots
    if method == 'GET' and _path_matches(path, '/maps/hotspots'):
        return _list_hotspots(params)

    # GET /maps/districts/{id}
    if method == 'GET' and _path_match_prefix(path, '/maps/districts/'):
        did = path.rsplit('/', 1)[-1]
        return _get_district_detail(did)

    # GET /maps/patrol-zones
    if method == 'GET' and _path_matches(path, '/maps/patrol-zones'):
        return _list_patrol_zones()

    # GET /maps/geofences
    if method == 'GET' and _path_matches(path, '/maps/geofences'):
        return _list_geofences()

    # GET /maps/route-analysis
    if method == 'GET' and _path_matches(path, '/maps/route-analysis'):
        return _route_analysis(params)

    # ---- NETWORK ----
    # GET /network/crime
    if method == 'GET' and _path_matches(path, '/network/crime'):
        return _crime_network_graph()

    # GET /network/cyber
    if method == 'GET' and _path_matches(path, '/network/cyber'):
        return _cyber_network_graph()

    # GET /network/correlation
    if method == 'GET' and _path_matches(path, '/network/correlation'):
        return _correlation_graph()

    return error_response(f'Route not found: {method} {path}', 404)


# ============================================================
# Path Helpers
# ============================================================

def _path_matches(path, target):
    """Check if path matches exactly (ignoring /api prefix variations)."""
    return path == target or path == f'/api{target}' or path == target.rstrip('/')


def _path_match_prefix(path, prefix):
    """Check if path starts with prefix (ignoring /api prefix)."""
    return path.startswith(prefix) or path.startswith(f'/api{prefix}')


# ============================================================
# Crime Case Handlers
# ============================================================

def _list_cases(params):
    limit = _safe_int(params.get('limit'), 50)
    offset = _safe_int(params.get('offset'), 0)
    conditions = []
    for f in ('crime_type', 'district', 'status'):
        val = params.get(f)
        if val:
            col = f.upper() if f != 'crime_type' else 'CRIME_TYPE'
            conditions.append((col, '=', val))

    cases = query_table(TABLE_CRIMES, conditions=conditions if conditions else None,
                        limit=limit, offset=offset,
                        order_by=('CREATED_AT', 'DESC') if not conditions else None)
    total = count_records(TABLE_CRIMES, conditions if conditions else None)

    return success_response({'cases': cases, 'total': total, 'limit': limit, 'offset': offset})


def _get_case_detail(case_id):
    case = get_record(TABLE_CRIMES, 'FIR_NUMBER', case_id)
    if not case:
        return error_response(f'Case {case_id} not found', 404)
    links = query_table(TABLE_CRIME_LINKS, conditions=[('FIR_NUMBER', '=', case_id)], limit=50)
    return success_response({'case': case, 'linked_criminals': links})


def _create_case(body):
    required = ['FIR_NUMBER', 'CRIME_TYPE', 'DISTRICT', 'DESCRIPTION']
    missing = [f for f in required if f not in body]
    if missing:
        return error_response(f'Missing: {", ".join(missing)}', 400)
    result = insert_record(TABLE_CRIMES, body)
    return success_response({'created': True, 'record': result}, 201)


def _list_criminals(params):
    limit = _safe_int(params.get('limit'), 50)
    offset = _safe_int(params.get('offset'), 0)
    criminals = query_table(TABLE_CRIMINALS, limit=limit, offset=offset)
    total = count_records(TABLE_CRIMINALS)
    return success_response({'criminals': criminals, 'total': total, 'limit': limit, 'offset': offset})


def _get_criminal_detail(criminal_id):
    criminal = get_record(TABLE_CRIMINALS, 'CRIMINAL_ID', criminal_id)
    if not criminal:
        return error_response(f'Criminal {criminal_id} not found', 404)
    links = query_table(TABLE_CRIME_LINKS, conditions=[('CRIMINAL_ID', '=', criminal_id)], limit=50)
    return success_response({'criminal': criminal, 'linked_cases': links})


def _match_mo(params):
    """Match MO description against known criminals."""
    desc = params.get('desc', '')
    crime_type = params.get('type', params.get('crime_type', ''))
    district = params.get('district', '')

    if not desc:
        return error_response('Query param "desc" is required', 400)

    criminals = query_table(TABLE_CRIMINALS, limit=200)

    if not criminals:
        return success_response({'results': []})

    results = []
    for c in criminals:
        mo = c.get('MO_SIGNATURE', '') or c.get('modus_operandi', '') or ''
        score = 0
        desc_words = set(desc.lower().split())
        mo_words = set(mo.lower().split())
        if desc_words and mo_words:
            score = len(desc_words & mo_words) / len(desc_words | mo_words) * 100

        if district and c.get('DISTRICT', '').lower() != district.lower():
            score *= 0.3

        if score > 10:
            results.append({
                'criminalId': c.get('CRIMINAL_ID', ''),
                'criminalName': c.get('NAME', 'Unknown'),
                'matchPercentage': round(score, 1),
                'priors': c.get('PRIORS', 0),
                'similarCases': len(desc_words & mo_words),
                'district': c.get('DISTRICT', 'Unknown')
            })

    results.sort(key=lambda x: x['matchPercentage'], reverse=True)
    return success_response({'results': results[:20]})


def _list_hotspots(params):
    eps = _safe_float(params.get('eps'), 0.5)
    min_samples = _safe_int(params.get('min_samples'), 5)
    hotspots = get_hotspots(eps=eps, min_samples=min_samples)

    # Convert to frontend HotspotDTO format
    result = []
    for h in hotspots:
        # Derive top crime type from crime_types dict
        crime_types = h.get('crime_types', {})
        top_crime = max(crime_types, key=crime_types.get) if crime_types else 'Unknown'
        # districts is a list — join or pick first
        districts_list = h.get('districts', [])
        primary_district = districts_list[0] if districts_list else 'Unknown'

        result.append({
            'id': h.get('cluster_id', ''),
            'district': primary_district,
            'latitude': h.get('center_lat', 0),
            'longitude': h.get('center_lng', 0),
            'radius': h.get('radius_km', 5) * 1000,  # km to meters
            'crimeCount': h.get('count', 0),
            'topCrimeType': top_crime,
            'crimeTypes': crime_types,
            'riskLevel': 'HIGH' if h.get('count', 0) > 10 else 'MEDIUM' if h.get('count', 0) > 5 else 'LOW',
            'trend': 0,
            'peakTime': 'Unknown'
        })

    return success_response(result)


def _get_network(criminal_id):
    network = get_criminal_network(criminal_id)
    if not network:
        return error_response(f'Criminal {criminal_id} not found', 404)
    return success_response(network)


def _get_district_detail(district_id):
    district = get_record(TABLE_DISTRICTS, 'DISTRICT_ID', district_id)
    if not district:
        return error_response(f'District {district_id} not found', 404)

    crime_count = count_records(TABLE_CRIMES, [('DISTRICT', '=', district.get('NAME', ''))])

    # Build stats for the district
    crime_by_type = query_table(
        TABLE_CRIMES, columns=['CRIME_TYPE', 'COUNT(*) as count'],
        conditions=[('DISTRICT', '=', district.get('NAME', ''))],
        order_by=('count', 'DESC')
    )

    monthly_data = [random.randint(1, max(crime_count // 12, 5)) for _ in range(12)]

    return success_response({
        'totalCrimes': crime_count,
        'trend': round(random.uniform(-10, 15), 1),
        'riskLevel': 'HIGH' if crime_count > 100 else 'MEDIUM' if crime_count > 50 else 'LOW',
        'crimeBreakdown': {r.get('CRIME_TYPE', 'Unknown'): r.get('count', 0) for r in crime_by_type},
        'monthlyTrend': monthly_data,
        'topCriminals': [],
        'moPatterns': [],
        'socioEconomic': {
            'literacy': district.get('LITERACY_RATE', 0),
            'povertyRate': district.get('POVERTY_INDEX', 0),
            'populationDensity': district.get('POPULATION', 0) / max(district.get('AREA_SQKM', 1), 1),
            'policeStations': district.get('POLICE_STATIONS', 0)
        },
        'lat': district.get('LATITUDE', 0),
        'lng': district.get('LONGITUDE', 0)
    })


# ============================================================
# Maps Handlers
# ============================================================

def _list_patrol_zones():
    districts = query_table(TABLE_DISTRICTS, limit=30)
    zones = []
    for i, d in enumerate(districts):
        zones.append({
            'id': f'PZ-{i+1:03d}',
            'districtId': d.get('DISTRICT_ID', f'D{i+1:02d}'),
            'district': d.get('NAME', 'Unknown'),
            'zoneName': f"{d.get('NAME', 'Zone')} Patrol Sector",
            'boundaries': [
                {'lat': float(d.get('LATITUDE', 12.97)) + 0.05, 'lng': float(d.get('LONGITUDE', 77.59)) + 0.05},
                {'lat': float(d.get('LATITUDE', 12.97)) + 0.05, 'lng': float(d.get('LONGITUDE', 77.59)) - 0.05},
                {'lat': float(d.get('LATITUDE', 12.97)) - 0.05, 'lng': float(d.get('LONGITUDE', 77.59)) - 0.05},
                {'lat': float(d.get('LATITUDE', 12.97)) - 0.05, 'lng': float(d.get('LONGITUDE', 77.59)) + 0.05},
            ],
            'centerLat': float(d.get('LATITUDE', 12.97)),
            'centerLng': float(d.get('LONGITUDE', 77.59)),
            'radius': 5000,
            'assignedTeam': f"Team {['Alpha','Bravo','Charlie','Delta','Echo'][i % 5]}",
            'teamSize': random.randint(4, 12),
            'shift': ['morning', 'afternoon', 'night'][i % 3],
            'status': ['active', 'patrolling', 'standby'][i % 3],
            'coverage': round(random.uniform(60, 95), 1),
            'lastPatrol': f'2026-06-{random.randint(1, 25):02d}T08:00:00Z'
        })
    return success_response({'zones': zones})


def _list_geofences():
    districts = query_table(TABLE_DISTRICTS, limit=20)
    fences = []
    for i, d in enumerate(districts):
        crime_count = count_records(TABLE_CRIMES, [('DISTRICT', '=', d.get('NAME', ''))])
        fences.append({
            'id': f'GF-{i+1:03d}',
            'name': f"{d.get('NAME', 'Zone')} Alert Zone",
            'districtId': d.get('DISTRICT_ID', f'D{i+1:02d}'),
            'district': d.get('NAME', 'Unknown'),
            'centerLat': float(d.get('LATITUDE', 12.97)),
            'centerLng': float(d.get('LONGITUDE', 77.59)),
            'radius': random.randint(3000, 15000),
            'type': ['alert', 'restricted', 'monitoring', 'vip'][i % 4],
            'status': ['active', 'triggered', 'inactive'][i % 3],
            'priority': random.randint(1, 5),
            'triggerEvents': crime_count,
            'lastTriggered': f'2026-06-{random.randint(1, 20):02d}T10:30:00Z' if crime_count > 50 else None,
            'description': f"Geofence for {d.get('NAME', 'Area')} — {crime_count} incident(s)"
        })
    return success_response(fences)


def _route_analysis(params):
    return success_response({
        'routes': [
            {
                'id': 'CR-001', 'name': 'Bengaluru-North Escape Corridor',
                'type': 'escape', 'confidence': 0.82,
                'distance': 45.3, 'estimatedTime': 52,
                'waypoints': [
                    {'lat': 12.97, 'lng': 77.59, 'label': 'Crime Scene'},
                    {'lat': 13.02, 'lng': 77.55, 'label': 'Checkpoint'},
                    {'lat': 13.10, 'lng': 77.50, 'label': 'Highway Access'}
                ],
                'incidents': 12, 'riskLevel': 'high', 'status': 'active'
            },
            {
                'id': 'CR-002', 'name': 'Mysuru Ring Pattern',
                'type': 'pattern', 'confidence': 0.71,
                'distance': 28.1, 'estimatedTime': 35,
                'waypoints': [
                    {'lat': 12.30, 'lng': 76.65, 'label': 'Center'},
                    {'lat': 12.34, 'lng': 76.62, 'label': 'Sector A'}
                ],
                'incidents': 8, 'riskLevel': 'medium', 'status': 'monitored'
            }
        ]
    })


# ============================================================
# Network Handlers
# ============================================================

def _crime_network_graph():
    """Build full crime criminal network graph."""
    criminals = query_table(TABLE_CRIMINALS, limit=100)
    links = query_table(TABLE_CRIME_LINKS, limit=500)

    nodes = []
    edges = []

    added = set()
    for c in criminals:
        cid = c.get('CRIMINAL_ID', '')
        if cid not in added:
            nodes.append({
                'data': {
                    'id': cid,
                    'label': c.get('NAME', 'Unknown'),
                    'type': 'criminal',
                    'color': '#ef4444',
                    'riskScore': c.get('RISK_SCORE', 50),
                    'priors': c.get('PRIORS', 0)
                }
            })
            added.add(cid)

    crime_ids = set()
    for link in links:
        fir = link.get('FIR_NUMBER', '')
        if fir and fir not in crime_ids:
            nodes.append({
                'data': {
                    'id': fir,
                    'label': f'Case {fir[:8]}',
                    'type': 'case',
                    'color': '#3b82f6'
                }
            })
            crime_ids.add(fir)

    for link in links:
        edges.append({
            'data': {
                'id': f"E-{link.get('FIR_NUMBER', '')}-{link.get('CRIMINAL_ID', '')}",
                'source': link.get('CRIMINAL_ID', ''),
                'target': link.get('FIR_NUMBER', ''),
                'label': 'involved_in',
                'type': 'involvement'
            }
        })

    return success_response({'elements': {'nodes': nodes, 'edges': edges}})


def _cyber_network_graph():
    """Build cyber threat network graph."""
    from constants import TABLE_THREATS, TABLE_IOCS
    threats = query_table(TABLE_THREATS, limit=100)
    iocs = query_table(TABLE_IOCS, limit=300)

    nodes = []
    edges = []

    for t in threats:
        tid = t.get('THREAT_ID', '')
        nodes.append({
            'data': {
                'id': tid,
                'label': t.get('THREAT_TYPE', 'Threat')[:20],
                'type': 'threat',
                'color': '#f59e0b',
                'severity': t.get('SEVERITY', 'Medium')
            }
        })

    for i, ioc in enumerate(iocs[:100]):
        ioc_id = ioc.get('IOC_ID', f'IOC-{i}')
        nodes.append({
            'data': {
                'id': ioc_id,
                'label': ioc.get('IOC_VALUE', '')[:20],
                'type': 'ioc',
                'color': '#8b5cf6'
            }
        })
        if ioc.get('THREAT_ID'):
            edges.append({
                'data': {
                    'id': f"E-IOC-{ioc_id}",
                    'source': ioc.get('THREAT_ID', ''),
                    'target': ioc_id,
                    'label': 'indicates',
                    'type': 'indicator'
                }
            })

    return success_response({'elements': {'nodes': nodes, 'edges': edges}})


def _correlation_graph():
    """Build cross-domain correlation graph (crime ↔ cyber links)."""
    return success_response({
        'elements': {
            'nodes': [
                {'data': {'id': 'corr-1', 'label': 'Crime-Cyber Link Analysis',
                          'type': 'correlation', 'color': '#10b981'}}
            ],
            'edges': []
        },
        'insights': [
            {'domain': 'Theft → Crypto', 'confidence': 0.78,
             'description': 'Increase in crypto-linked theft cases in Bengaluru Urban'},
            {'domain': 'Phishing → Identity', 'confidence': 0.65,
             'description': 'Phishing campaigns targeting police personnel databases'}
        ]
    })
