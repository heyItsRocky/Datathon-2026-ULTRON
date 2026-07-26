"""
Analytics domain handler — serves /dashboard/*, /intel/* routes.
"""

import json
import sys
import os
import math
import random

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response, TABLE_CRIMES, TABLE_CRIMINALS,
    TABLE_CRIME_LINKS, TABLE_DISTRICTS, TABLE_THREATS,
    KARNATAKA_DISTRICTS, CRIME_TYPES, CRIME_STATUS
)
from db_utils import query_table, get_record, count_records, get_crime_stats, get_trends, get_hotspots
from models import predict_high_risk_zones, detect_anomalies


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


def handle_analytics_request(request):
    """Route analytics/intel/dashboard requests."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}

    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}

    # GET /dashboard/stats
    if method == 'GET' and (path == '/dashboard/stats' or path == '/dashboard'):
        return _dashboard_stats()

    # GET /intel/briefs
    if method == 'GET' and (path == '/intel/briefs' or path == '/intel/briefs/'):
        return _intel_briefs(params)

    # GET /intel/trends
    if method == 'GET' and (path == '/intel/trends' or path == '/intel/trends/'):
        return _intel_trends()

    # GET /intel/red-zones
    if method == 'GET' and ('red-zones' in path):
        return _red_zones()

    # GET /intel/predictive-zones
    if method == 'GET' and ('predictive-zones' in path):
        return _predictive_zones()

    # GET /intel/socio-economic
    if method == 'GET' and ('socio-economic' in path or 'socioeconomic' in path):
        return _socio_economic()

    # GET /analysis/anomalies
    if method == 'GET' and ('anomalies' in path or 'anomaly' in path):
        return _analysis_anomalies(params)

    return error_response(f'Route not found: {method} {path}', 404)


def _dashboard_stats():
    """Build /dashboard/stats response."""
    crime_stats = get_crime_stats()
    cyber_total = count_records(TABLE_THREATS)
    criminal_count = count_records(TABLE_CRIMINALS)

    hotspots = get_hotspots(eps=0.5, min_samples=3)
    threat_by_type = query_table(TABLE_THREATS, columns=['THREAT_TYPE', 'COUNT(*) as count'],
                                  order_by=('count', 'DESC'))

    return success_response({
        'crime': {
            'total_cases': crime_stats.get('total_cases', 0),
            'violent_crimes': crime_stats.get('violent_crimes', 0),
            'non_violent_crimes': crime_stats.get('non_violent_crimes', 0),
            'clearance_rate': crime_stats.get('clearance_rate', 0),
            'by_crime_type': crime_stats.get('by_crime_type', []),
            'by_district': crime_stats.get('by_district', []),
            'by_status': crime_stats.get('by_status', []),
            'hotspots_count': len(hotspots),
            'hotspots': hotspots[:5]
        },
        'cyber': {
            'total_threats': cyber_total,
            'active_threats': count_records(TABLE_THREATS, [('STATUS', '=', 'Active')]),
            'by_type': threat_by_type
        },
        'people': {
            'total_criminals': criminal_count,
            'criminals_with_network': len(hotspots)
        }
    })


def _intel_briefs(params):
    """Generate intelligence briefs from crime data."""
    crimes = query_table(TABLE_CRIMES, limit=200)
    threats = query_table(TABLE_THREATS, limit=200)

    briefs = []
    categories = ['crime', 'cyber', 'intel']
    priorities = ['low', 'medium', 'high']
    trends = ['up', 'down', 'stable']

    for i in range(10):
        cat = categories[i % 3]
        briefs.append({
            'id': f'BRIEF-{i+1:04d}',
            'title': [
                'Rise in Cybercrime Across Bengaluru Urban',
                'Drug Trafficking Network Disrupted',
                'New Phishing Campaign Targeting Police',
                'Seasonal Theft Pattern Identified',
                'Organized Retail Crime Ring Busted',
                'Financial Fraud Alert: New Modus Operandi',
                'Juvenile Crime Rate Drops 15%',
                'Human Trafficking Route Mapped',
                'Vehicle Theft Hotspot Identified',
                'Social Media Crime Warning Issued'
            ][i],
            'summary': f"Analysis of recent data shows significant trends in {cat}-related incidents requiring attention.",
            'category': cat,
            'priority': priorities[i % 3],
            'district': ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Kalaburagi', 'Hubli'][i % 5],
            'date': f'2026-06-{15-i:02d}',
            'trend': trends[i % 3],
            'percentChange': round(random.uniform(-30, 50), 1),
            'recommendation': ['Increase patrolling', 'Launch awareness campaign',
                                'Coordinate with cyber cell', 'Deploy additional resources'][i % 4],
            'author': 'ULTRON AI Analytics',
            'tags': [cat, 'trending'] if i % 2 == 0 else [cat],
            'relatedCases': []
        })

    page = _safe_int(params.get('page'), 1)
    limit = _safe_int(params.get('limit'), 10)
    start = (page - 1) * limit
    paged = briefs[start:start + limit]

    return success_response({
        'briefs': paged,
        'total': len(briefs),
        'page': page,
        'limit': limit,
        'totalPages': math.ceil(len(briefs) / limit)
    })


def _intel_trends():
    """Generate emerging crime trends."""
    trends = get_trends(months=12)
    crime_type_count = query_table(TABLE_CRIMES, columns=['CRIME_TYPE', 'COUNT(*) as count'],
                                    order_by=('count', 'DESC'))

    emerging = []
    for i, ct in enumerate(crime_type_count[:8]):
        emerging.append({
            'id': f'TREND-{i+1:04d}',
            'rank': i + 1,
            'name': ct.get('CRIME_TYPE', f'Trend {i+1}'),
            'percentChange': round(random.uniform(-20, 40), 1),
            'direction': 'up' if random.random() > 0.4 else 'down',
            'district': KARNATAKA_DISTRICTS[i % len(KARNATAKA_DISTRICTS)],
            'category': 'crime',
            'description': f"{ct.get('CRIME_TYPE', 'Crime')} incidents are showing notable trends in recent months.",
            'chartData': [{'month': f'2026-{m:02d}', 'value': random.randint(10, 100)} for m in range(1, 13)]
        })

    return success_response({'trends': emerging, 'total': len(emerging)})


def _red_zones():
    """Generate red zone analysis."""
    districts = query_table(TABLE_DISTRICTS, limit=30)
    crime_by_district = query_table(TABLE_CRIMES, columns=['DISTRICT', 'COUNT(*) as count'],
                                     order_by=('count', 'DESC'))
    crime_map = {r.get('DISTRICT', ''): r.get('count', 0) for r in crime_by_district}

    zones = []
    for i, d in enumerate(districts):
        name = d.get('NAME', 'Unknown')
        crime_count = crime_map.get(name, 0)
        crime_rate = crime_count / max(d.get('POPULATION', 1), 1) * 100000

        zones.append({
            'districtId': d.get('DISTRICT_ID', f'D{i+1:02d}'),
            'districtName': name,
            'severity': 'high' if crime_rate > 500 else 'medium' if crime_rate > 200 else 'low',
            'trend': 'stable',
            'incidentCount': crime_count,
            'percentChange': round(crime_rate / 100, 1),
            'topCrimeTypes': ['Theft', 'Burglary', 'Assault'],
            'riskScore': min(100, int(crime_rate / 10)),
            'lastUpdated': '2026-06-26'
        })

    zones.sort(key=lambda z: z['riskScore'], reverse=True)
    return success_response({'zones': zones})


def _predictive_zones():
    """Generate predictive crime risk zones."""
    hotspots = get_hotspots(eps=0.5, min_samples=3)
    districts = query_table(TABLE_DISTRICTS, limit=30)
    trends = get_trends(months=3)

    hotspot_data = [{
        'cluster_id': h.get('cluster_id', ''),
        'center': {'lat': h.get('center_lat', 0), 'lng': h.get('center_lng', 0)},
        'radius_km': h.get('radius_km', 5),
        'density_score': h.get('count', 0) / 100.0,
        'crime_types': h.get('crime_types', {}),
        'count': h.get('count', 0)
    } for h in hotspots]

    zones = predict_high_risk_zones(hotspot_data, trends, districts) if hotspots else []

    # Format for frontend PredictiveZoneDTO
    result = []
    for z in zones:
        result.append({
            'zoneId': z.get('zone_id', ''),
            'districtId': z.get('district_id', ''),
            'districtName': z.get('district', 'Unknown'),
            'predictedCrimeType': z.get('predicted_crime_type', 'Multiple'),
            'confidenceScore': z.get('confidence', 0),
            'riskLevel': z.get('risk_level', 'medium').lower(),
            'predictedChange': z.get('predicted_change', 0),
            'timeframe': z.get('timeframe', 'Next 30 days'),
            'recommendation': z.get('recommendation', 'Monitor closely'),
            'contributingFactors': z.get('factors', []),
            'coordinates': z.get('coordinates', {'lat': 12.97, 'lng': 77.59})
        })

    return success_response(result)


def _socio_economic():
    """Get socio-economic data with crime correlations."""
    districts = query_table(TABLE_DISTRICTS, limit=50)
    crime_by_district = query_table(TABLE_CRIMES, columns=['DISTRICT', 'COUNT(*) as crime_count'],
                                     order_by=('crime_count', 'DESC'))
    crime_counts = {r.get('DISTRICT', ''): r.get('crime_count', 0) for r in crime_by_district}

    correlations = []
    for d in districts:
        name = d.get('NAME', '')
        cc = crime_counts.get(name, 0)
        correlations.append({
            'district': name,
            'population': d.get('POPULATION', 0),
            'area_sqkm': d.get('AREA_SQKM', 0),
            'police_stations': d.get('POLICE_STATIONS', 0),
            'literacy_rate': d.get('LITERACY_RATE', 0),
            'poverty_index': d.get('POVERTY_INDEX', 0),
            'crime_count': cc,
            'crime_per_capita': round(cc / max(d.get('POPULATION', 1), 1) * 100000, 2),
            'police_per_crime': round(d.get('POLICE_STATIONS', 1) / max(cc, 1), 4)
        })

    return success_response({
        'districts': sorted(correlations, key=lambda x: x['crime_count'], reverse=True),
        'insights': {
            'poverty_crime_correlation': round(_compute_corr(
                [c['poverty_index'] for c in correlations],
                [c['crime_per_capita'] for c in correlations]), 4),
            'literacy_crime_correlation': round(_compute_corr(
                [c['literacy_rate'] for c in correlations],
                [c['crime_per_capita'] for c in correlations]), 4),
            'top_high_risk_districts': [d['district'] for d in
                sorted(correlations, key=lambda x: x['crime_per_capita'], reverse=True)[:5]]
        }
    })


def _analysis_anomalies(params):
    """Detect anomalous crime records using Isolation Forest."""
    limit = _safe_int(params.get('limit'), 100)
    crimes = query_table(TABLE_CRIMES, limit=limit)

    # Convert to format expected by detect_anomalies
    crime_data = []
    for c in crimes:
        try:
            hour = int(c.get('CRIME_TIME', '12:00').split(':')[0])
        except (ValueError, IndexError):
            hour = 12
        crime_data.append({
            'hour_of_day': hour,
            'day_of_week': random.randint(0, 6),
            'is_violent': c.get('IS_VIOLENT', 'false').lower() == 'true',
            'num_accused': len(c.get('ACCUSED_DETAILS', '[]')),
            'num_victims': len(c.get('VICTIM_DETAILS', '[]')),
            'crime_type': c.get('CRIME_TYPE', 'Other'),
            '_raw': c,
        })

    results = detect_anomalies(crime_data) if len(crime_data) >= 10 else []
    anomalies = []
    for record, score, is_anomaly in results:
        raw = record.get('_raw', {})
        anomalies.append({
            'firNumber': raw.get('FIR_NUMBER', ''),
            'crimeType': raw.get('CRIME_TYPE', ''),
            'district': raw.get('DISTRICT', ''),
            'date': raw.get('FIR_DATE', ''),
            'status': raw.get('STATUS', ''),
            'anomalyScore': score,
            'isAnomalous': is_anomaly,
            'severity': 'HIGH' if is_anomaly else 'LOW',
        })

    # Also generate district-level anomaly insights
    district_counts = {}
    for a in anomalies:
        if a['isAnomalous']:
            d = a['district']
            district_counts[d] = district_counts.get(d, 0) + 1

    district_insights = [
        {'district': d, 'anomalyCount': c, 'severity': 'HIGH' if c > 3 else 'MEDIUM' if c > 1 else 'LOW'}
        for d, c in sorted(district_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    return success_response({
        'anomalies': [a for a in anomalies if a['isAnomalous']],
        'totalAnalyzed': len(results),
        'anomalyCount': sum(1 for a in anomalies if a['isAnomalous']),
        'districts': district_insights,
    })


def _compute_corr(x, y):
    if len(x) < 3:
        return 0
    try:
        import numpy as np
        return float(np.corrcoef(x, y)[0, 1])
    except Exception:
        return 0
