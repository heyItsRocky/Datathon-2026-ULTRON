"""
ULTRON — Cyber Threat Track API
Catalyst Python Function for cyber threat intel, IOC management, ML analysis.

Routes:
  GET    /api/cyber/threats           — List threats
  GET    /api/cyber/threats/{id}      — Threat detail
  GET    /api/cyber/iocs              — List IOCs
  GET    /api/cyber/ip-reputation/{ip}— IP reputation score
  POST   /api/cyber/analyze-phishing  — Analyze email/URL for phishing
  POST   /api/cyber/analyze-traffic   — Analyze network flow anomaly
  GET    /api/cyber/attack-paths/{id} — Attack path correlation
  GET    /api/cyber/stats             — Cyber dashboard stats
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response,
    TABLE_THREATS, TABLE_IOCS, TABLE_CRIMES,
    CYBER_THREAT_TYPES, MITRE_TACTICS, IOC_TYPES,
    THREAT_SEVERITY, KARNATAKA_DISTRICTS
)
from db_utils import query_table, get_record, insert_record, count_records
from cyber_models import IPReputationModel, PhishingDetector, NetworkFlowAnomalyDetector, AttackPathCorrelator


def _safe_int(value, default):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

# Initialize ML models (lazy-loaded)
_ip_model = None
_phishing_model = None
_flow_detector = None
_attack_correlator = None


def _get_ip_model():
    global _ip_model
    if _ip_model is None:
        _ip_model = IPReputationModel()
    return _ip_model


def _get_phishing_model():
    global _phishing_model
    if _phishing_model is None:
        _phishing_model = PhishingDetector()
    return _phishing_model


def _get_flow_detector():
    global _flow_detector
    if _flow_detector is None:
        _flow_detector = NetworkFlowAnomalyDetector()
    return _flow_detector


def _get_attack_correlator():
    global _attack_correlator
    if _attack_correlator is None:
        _attack_correlator = AttackPathCorrelator()
    return _attack_correlator


def handler(request, context):
    """Main entry point for Cyber API."""
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
    
    # GET /threats (list)
    if method == 'GET' and path in ('/api/cyber/threats', '/threats'):
        limit = _safe_int(params.get('limit'), 50)
        offset = _safe_int(params.get('offset'), 0)
        threat_type = params.get('type')
        severity = params.get('severity')
        
        conditions = []
        if threat_type:
            conditions.append(('THREAT_TYPE', '=', threat_type))
        if severity:
            conditions.append(('SEVERITY', '=', severity))
        
        threats = query_table(
            TABLE_THREATS,
            conditions=conditions if conditions else None,
            limit=limit,
            offset=offset,
            order_by=('TIMESTAMP', 'DESC')
        )
        total = count_records(TABLE_THREATS, conditions if conditions else None)
        
        return success_response({
            'threats': threats,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    
    # GET /threats/{id} (detail)
    if method == 'GET' and (path.startswith('/api/cyber/threats/') or path.startswith('/threats/')):
        threat_id = path.rsplit('/', 1)[-1]
        if threat_id in ('', 'threats'):
            return error_response('Missing threat ID', 400)
        threat = get_record(TABLE_THREATS, 'THREAT_ID', threat_id)
        if not threat:
            return error_response(f'Threat {threat_id} not found', 404)
        
        # Get linked IOCs
        iocs = query_table(TABLE_IOCS, conditions=[('THREAT_ID', '=', threat_id)], limit=100)
        
        return success_response({'threat': threat, 'iocs': iocs})
    
    # GET /iocs (list)
    if method == 'GET' and path in ('/api/cyber/iocs', '/iocs'):
        limit = _safe_int(params.get('limit'), 100)
        offset = _safe_int(params.get('offset'), 0)
        ioc_type = params.get('type')
        
        conditions = []
        if ioc_type:
            conditions.append(('IOC_TYPE', '=', ioc_type))
        
        iocs = query_table(TABLE_IOCS, conditions=conditions if conditions else None, limit=limit, offset=offset)
        total = count_records(TABLE_IOCS, conditions if conditions else None)
        
        return success_response({'iocs': iocs, 'total': total})
    
    # GET /ip-reputation/{ip}
    if method == 'GET' and (path.startswith('/api/cyber/ip-reputation/') or path.startswith('/ip-reputation/')):
        ip = path.rsplit('/', 1)[-1]
        if ip in ('', 'ip-reputation'):
            return error_response('Missing IP address', 400)
        
        model = _get_ip_model()
        context = {
            'connection_attempts': _safe_int(params.get('attempts'), 1),
            'is_vpn': params.get('is_vpn', 'false').lower() == 'true',
            'is_datacenter': params.get('is_datacenter', 'false').lower() == 'true',
        }
        score = model.score(ip, context)
        
        risk_level = 'HIGH' if score >= 60 else 'MEDIUM' if score >= 30 else 'LOW'
        
        return success_response({
            'ip': ip,
            'reputation_score': score,
            'risk_level': risk_level
        })
    
    # POST /analyze-phishing
    if method == 'POST' and path in ('/api/cyber/analyze-phishing', '/analyze-phishing'):
        url = body.get('url', '')
        email_content = body.get('email_content', '')
        
        if not url and not email_content:
            return error_response('Provide url or email_content for analysis', 400)
        
        detector = _get_phishing_model()
        
        if url:
            result = detector.analyze_url(url)
        else:
            result = detector.analyze_email(email_content)
        
        return success_response(result)
    
    # POST /analyze-traffic
    if method == 'POST' and path in ('/api/cyber/analyze-traffic', '/analyze-traffic'):
        flows = body.get('flows', body.get('traffic', []))
        if not flows:
            return error_response('Provide traffic flow data for analysis', 400)
        
        detector = _get_flow_detector()
        results = detector.detect(flows)
        
        anomalies = [r for r in results if r[2]]
        
        return success_response({
            'total_flows': len(flows),
            'anomalies_detected': len(anomalies),
            'results': [
                {
                    'anomaly_score': r[1],
                    'is_anomaly': r[2]
                }
                for r in results
            ]
        })
    
    # GET /attack-paths (correlate from stored threats)
    if method == 'GET' and ('/attack-path' in path):
        threats = query_table(TABLE_THREATS, limit=500)
        
        if not threats:
            return success_response({
                'campaigns': [],
                'lateral_movement_paths': [],
                'kill_chain_progress': {'stages_reached': 0, 'total_stages': 14, 'stages': []},
                'crown_jewel_targets': [],
                'total_events': 0
            })
        
        correlator = _get_attack_correlator()
        analysis = correlator.correlate(threats)
        
        return success_response(analysis)
    
    # GET /stats (cyber dashboard stats)
    if method == 'GET' and path in ('/api/cyber/stats', '/cyber/stats'):
        total_threats = count_records(TABLE_THREATS)
        
        active_threats = count_records(TABLE_THREATS, [('STATUS', '=', 'Active')])
        mitigated = count_records(TABLE_THREATS, [('STATUS', '=', 'Mitigated')])
        
        critical = count_records(TABLE_THREATS, [('SEVERITY', '=', 'Critical')])
        high = count_records(TABLE_THREATS, [('SEVERITY', '=', 'High')])
        
        by_type = query_table(
            TABLE_THREATS,
            columns=['THREAT_TYPE', 'COUNT(*) as count'],
            order_by=('count', 'DESC')
        )
        
        total_iocs = count_records(TABLE_IOCS)
        
        return success_response({
            'total_threats': total_threats,
            'active_threats': active_threats,
            'mitigated_threats': mitigated,
            'critical_threats': critical,
            'high_threats': high,
            'by_type': by_type,
            'total_iocs': total_iocs
        })
    
    return error_response(f'Route not found: {method} {path}', 404)
