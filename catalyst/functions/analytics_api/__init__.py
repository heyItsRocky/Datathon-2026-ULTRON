"""
ULTRON — Analytics & ML API
Catalyst Python Function for all dashboards, ML models, and predictive analytics.

Routes:
  GET  /api/analytics/dashboard         — All dashboard KPIs (crime + cyber)
  GET  /api/analytics/anomalies         — Anomaly detection results
  GET  /api/analytics/predictive-zones  — Predicted crime risk zones
  GET  /api/analytics/geo-data          — Map-ready geo visualization data
  GET  /api/analytics/socio-economic    — Socio-economic crime correlations
  GET  /api/analytics/recidivism-risk   — Risk-scored criminal list
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response,
    TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS,
    TABLE_DISTRICTS, TABLE_THREATS, TABLE_IOCS,
    KARNATAKA_DISTRICTS
)
from db_utils import (
    query_table, get_record, count_records,
    get_crime_stats, get_trends, get_hotspots
)
from models import (
    detect_anomalies, predict_high_risk_zones
)
from risk_model import CombinedRiskScorer


def _safe_int(val, default=0):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def handler(request, context):
    """Main entry point for Analytics API."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}
    
    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}
    
    if method == 'OPTIONS':
        return success_response(None)
    
    # ---- Route Matching ----
    
    # GET /dashboard — Master dashboard
    if method == 'GET' and path in ('/api/analytics/dashboard', '/dashboard'):
        dashboard = _build_dashboard()
        return success_response(dashboard)
    
    # GET /anomalies
    if method == 'GET' and path in ('/api/analytics/anomalies', '/anomalies'):
        limit = _safe_int(params.get('limit'), 50)
        anomalies = _detect_anomalies(limit)
        return success_response(anomalies)
    
    # GET /predictive-zones
    if method == 'GET' and path in ('/api/analytics/predictive-zones', '/predictive-zones'):
        zones = _predict_zones()
        return success_response({'zones': zones, 'count': len(zones)})
    
    # GET /geo-data
    if method == 'GET' and path in ('/api/analytics/geo-data', '/geo-data'):
        geo = _get_geo_data()
        return success_response(geo)
    
    # GET /socio-economic
    if method == 'GET' and path in ('/api/analytics/socio-economic', '/socio-economic'):
        socio = _get_socio_economic()
        return success_response(socio)
    
    # GET /recidivism-risk
    if method == 'GET' and path in ('/api/analytics/recidivism-risk', '/recidivism-risk'):
        limit = _safe_int(params.get('limit'), 100)
        risks = _get_recidivism_risks(limit)
        return success_response({'criminals': risks, 'count': len(risks)})
    
    return error_response(f'Route not found: {method} {path}', 404)


# ============================================================
# Dashboard Builder
# ============================================================

def _build_dashboard():
    """Build comprehensive dashboard with all KPIs."""
    crime_stats = get_crime_stats()
    cyber_threat_count = count_records(TABLE_THREATS)
    cyber_active = count_records(TABLE_THREATS, [('STATUS', '=', 'Active')])
    criminal_count = count_records(TABLE_CRIMINALS)
    
    # Get some hotspot data for map preview
    hotspots = get_hotspots(eps=0.5, min_samples=3)
    
    # Cyber threat breakdown
    threat_by_type = query_table(
        TABLE_THREATS,
        columns=['THREAT_TYPE', 'COUNT(*) as count'],
        order_by=('count', 'DESC')
    )
    
    return {
        # Crime KPIs
        'crime': {
            'total_cases': crime_stats.get('total_cases', 0),
            'violent_crimes': crime_stats.get('violent_crimes', 0),
            'non_violent_crimes': crime_stats.get('non_violent_crimes', 0),
            'clearance_rate': crime_stats.get('clearance_rate', 0),
            'by_crime_type': crime_stats.get('by_crime_type', []),
            'by_district': crime_stats.get('by_district', []),
            'by_status': crime_stats.get('by_status', []),
            'hotspots_count': len(hotspots),
            'hotspots': hotspots[:5]  # Top 5 hotspots
        },
        # Cyber KPIs
        'cyber': {
            'total_threats': cyber_threat_count,
            'active_threats': cyber_active,
            'by_type': threat_by_type
        },
        # People KPIs
        'people': {
            'total_criminals': criminal_count,
            'criminals_with_network': len([h for h in hotspots if h.get('count', 0) > 0])
        }
    }


# ============================================================
# Anomaly Detection
# ============================================================

def _detect_anomalies(limit=50):
    """Detect anomalies in crime and threat data."""
    results = {'crime_anomalies': [], 'threat_anomalies': []}
    
    # Crime anomalies
    crime_records = query_table(
        TABLE_CRIMES,
        limit=limit * 2
    )
    
    if crime_records:
        # Build feature dicts for anomaly detection
        from datetime import datetime
        crime_features = []
        for r in crime_records:
            try:
                hour = 12
                date_str = r.get('FIR_DATE', '')
                if date_str and len(date_str) >= 10:
                    hour = datetime.strptime(date_str[:10], '%Y-%m-%d').hour
            except (ValueError, IndexError):
                hour = 12
            
            crime_features.append({
                'hour_of_day': hour,
                'day_of_week': 0,
                'is_violent': r.get('IS_VIOLENT', 'false').lower() == 'true',
                'num_accused': 1,
                'num_victims': 1,
                'crime_type': r.get('CRIME_TYPE', ''),
                'fir_number': r.get('FIR_NUMBER', '')
            })
        
        if crime_features:
            anomalies = detect_anomalies(crime_features, contamination=0.05)
            results['crime_anomalies'] = [
                {
                    'fir_number': a[0].get('fir_number', ''),
                    'anomaly_score': a[1],
                    'crime_type': a[0].get('crime_type', ''),
                    'reason': 'Unusual crime pattern detected'
                }
                for a in anomalies[:limit] if a[2]  # Only true anomalies
            ]
    
    # Threat anomalies (unusual threat volumes)
    threats = query_table(TABLE_THREATS, limit=limit * 2)
    if threats:
        from datetime import datetime
        threat_features = []
        for t in threats:
            try:
                ts = t.get('TIMESTAMP', '')
                hour = datetime.fromisoformat(ts.replace('Z', '+00:00')).hour if ts else 12
            except (ValueError, TypeError):
                hour = 12
            
            threat_features.append({
                'hour_of_day': hour,
                'packets_per_sec': 100,
                'bytes_per_sec': 1000,
                'duration_sec': 300,
                'port_count': 5,
                'unique_destinations': 3,
                'syn_ratio': 0.5,
                'small_packet_ratio': 0.3,
                'tcp_ratio': 0.7,
                'is_encrypted': True,
                'threat_id': t.get('THREAT_ID', '')
            })
        
        if threat_features:
            from cyber_models import NetworkFlowAnomalyDetector
            detector = NetworkFlowAnomalyDetector()
            anomalies = detector.detect(threat_features)
            results['threat_anomalies'] = [
                {
                    'threat_id': a[0].get('threat_id', ''),
                    'anomaly_score': a[1],
                    'reason': 'Unusual threat pattern detected'
                }
                for a in anomalies[:limit] if a[2]
            ]
    
    return results


# ============================================================
# Predictive Risk Zones
# ============================================================

def _predict_zones():
    """Generate predictive crime risk zones."""
    crime_stats = get_crime_stats()
    
    # Get districts for socio-economic context
    districts = query_table(TABLE_DISTRICTS, limit=50)
    
    # Get hotspot data
    hotspots = get_hotspots(eps=0.5, min_samples=3)
    
    if not hotspots:
        return []
    
    # Convert to model-compatible format
    hotspot_data = []
    for h in hotspots:
        lat = h.get('center_lat', 0)
        lng = h.get('center_lng', 0)
        hotspot_data.append({
            'cluster_id': h.get('cluster_id', ''),
            'center': {'lat': lat, 'lng': lng},
            'radius_km': h.get('radius_km', 5),
            'density_score': h.get('count', 0) / 100.0,
            'crime_types': h.get('crime_types', {}),
            'count': h.get('count', 0)
        })
    
    # Get temporal patterns from trends
    trends = get_trends(months=3)
    
    # Predict risk zones
    zones = predict_high_risk_zones(hotspot_data, trends, districts)
    
    return zones


# ============================================================
# Geo Data for Maps
# ============================================================

def _get_geo_data():
    """Get map-ready geo visualization data."""
    results = query_table(
        TABLE_CRIMES,
        columns=['FIR_NUMBER', 'CRIME_TYPE', 'DISTRICT', 'LATITUDE', 'LONGITUDE',
                 'FIR_DATE', 'STATUS', 'IS_VIOLENT'],
        conditions=[('LATITUDE', '!=', '')],
        limit=2000
    )
    
    # Clean and format
    geo_features = []
    for r in results:
        lat = r.get('LATITUDE')
        lng = r.get('LONGITUDE')
        if lat and lng:
            try:
                geo_features.append({
                    'id': r.get('FIR_NUMBER', ''),
                    'type': 'crime',
                    'crime_type': r.get('CRIME_TYPE', 'Unknown'),
                    'district': r.get('DISTRICT', ''),
                    'lat': float(lat),
                    'lng': float(lng),
                    'date': r.get('FIR_DATE', ''),
                    'status': r.get('STATUS', ''),
                    'is_violent': r.get('IS_VIOLENT', 'false').lower() == 'true'
                })
            except (ValueError, TypeError):
                continue
    
    # Also get hotspots
    hotspots = get_hotspots(eps=0.5, min_samples=3)
    hotspot_features = []
    for h in hotspots:
        hotspot_features.append({
            'id': h.get('cluster_id', ''),
            'type': 'hotspot',
            'lat': h.get('center_lat', 0),
            'lng': h.get('center_lng', 0),
            'radius_km': h.get('radius_km', 0),
            'crime_count': h.get('count', 0),
            'crime_types': list(h.get('crime_types', {}).keys()),
            'severity': h.get('severity', 'LOW')
        })
    
    return {
        'crime_locations': geo_features,
        'hotspots': hotspot_features,
        'total_features': len(geo_features) + len(hotspot_features)
    }


# ============================================================
# Socio-Economic Crime Correlations
# ============================================================

def _get_socio_economic():
    """Get socio-economic data correlated with crime rates."""
    districts = query_table(TABLE_DISTRICTS, limit=50)
    
    # Get crime counts per district
    crime_by_district = query_table(
        TABLE_CRIMES,
        columns=['DISTRICT', 'COUNT(*) as crime_count'],
        order_by=('crime_count', 'DESC')
    )
    
    crime_counts = {r.get('DISTRICT', ''): r.get('crime_count', 0) for r in crime_by_district}
    
    correlations = []
    for d in districts:
        name = d.get('NAME', '')
        crime_rate = crime_counts.get(name, 0)
        
        correlations.append({
            'district': name,
            'population': d.get('POPULATION', 0),
            'area_sqkm': d.get('AREA_SQKM', 0),
            'police_stations': d.get('POLICE_STATIONS', 0),
            'literacy_rate': d.get('LITERACY_RATE', 0),
            'poverty_index': d.get('POVERTY_INDEX', 0),
            'crime_count': crime_rate,
            'crime_per_capita': round(crime_rate / max(d.get('POPULATION', 1), 1) * 100000, 2),
            'police_per_crime': round(d.get('POLICE_STATIONS', 1) / max(crime_rate, 1), 4)
        })
    
    # Correlation insights
    poverty_correlation = _compute_correlation(
        [c.get('poverty_index', 0) for c in correlations],
        [c.get('crime_per_capita', 0) for c in correlations]
    )
    literacy_correlation = _compute_correlation(
        [c.get('literacy_rate', 0) for c in correlations],
        [c.get('crime_per_capita', 0) for c in correlations]
    )
    
    return {
        'districts': sorted(correlations, key=lambda x: x['crime_count'], reverse=True),
        'insights': {
            'poverty_crime_correlation': round(poverty_correlation, 4),
            'literacy_crime_correlation': round(literacy_correlation, 4),
            'top_high_risk_districts': [
                d['district'] for d in sorted(correlations, key=lambda x: x.get('crime_per_capita', 0), reverse=True)[:5]
            ],
            'analysis': _generate_socio_insights(correlations, poverty_correlation, literacy_correlation)
        }
    }


def _compute_correlation(x, y):
    """Compute Pearson correlation coefficient."""
    if len(x) < 3 or len(y) < 3:
        return 0
    import numpy as np
    try:
        return float(np.corrcoef(x, y)[0, 1])
    except Exception:
        return 0


def _generate_socio_insights(correlations, poverty_corr, literacy_corr):
    """Generate human-readable insights from socio-economic data."""
    high_crime = sorted(correlations, key=lambda x: x['crime_per_capita'], reverse=True)[:3]
    insights = []
    
    if poverty_corr > 0.3:
        insights.append(f"Strong positive correlation ({poverty_corr:.2f}) between poverty index and crime rate. "
                        f"Suggests socio-economic intervention could reduce crime.")
    elif poverty_corr < -0.3:
        insights.append(f"Negative poverty-crime correlation ({poverty_corr:.2f}) — areas with higher poverty have lower reported crime.")
    else:
        insights.append(f"Weak poverty-crime correlation ({poverty_corr:.2f}) — poverty alone does not explain crime patterns.")
    
    if literacy_corr < -0.3:
        insights.append(f"Negative literacy-crime correlation ({literacy_corr:.2f}) — higher literacy correlates with lower crime rates.")
    
    if high_crime:
        names = [h['district'] for h in high_crime]
        insights.append(f"Highest crime-per-capita districts: {', '.join(names)}. "
                        f"Recommend increased policing resources and community programs.")
    
    return insights


# ============================================================
# Recidivism Risk Scoring
# ============================================================

def _get_recidivism_risks(limit=100):
    """Score criminals for recidivism risk."""
    criminals = query_table(TABLE_CRIMINALS, limit=limit)
    
    if not criminals:
        return []
    
    scorer = CombinedRiskScorer()
    scored = scorer.batch_score(criminals)
    
    # Count by risk level
    risk_distribution = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
    for s in scored:
        level = s.get('risk_level', 'LOW')
        risk_distribution[level] = risk_distribution.get(level, 0) + 1
    
    return {
        'scored_criminals': sorted(scored, key=lambda x: x['overall_risk_score'], reverse=True),
        'risk_distribution': risk_distribution,
        'total_scored': len(scored),
        'high_risk_count': risk_distribution.get('CRITICAL', 0) + risk_distribution.get('HIGH', 0)
    }
