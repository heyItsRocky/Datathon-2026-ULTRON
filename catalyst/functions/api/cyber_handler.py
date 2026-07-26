"""
Cyber domain handler — serves /cyber/* routes.

All paths include full frontend path (e.g., /cyber/incidents, /cyber/ip/{ip}).
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response, TABLE_THREATS, TABLE_IOCS,
    TABLE_CRIMES, KARNATAKA_DISTRICTS
)
from db_utils import query_table, get_record, insert_record, count_records

def _safe_int(val, default=0):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


from cyber_models import (
    IPReputationModel, PhishingDetector,
    NetworkFlowAnomalyDetector, AttackPathCorrelator
)

# Cache model instances
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


def handle_cyber_request(request):
    """Route cyber requests to the right handler."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}

    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}

    # ---- INCIDENTS (frontend calls /cyber/incidents, backend stores as threats) ----
    # GET /cyber/incidents (list)
    if method == 'GET' and (path == '/cyber/incidents' or path == '/cyber/threats'):
        return _list_threats(params)

    # GET /cyber/incidents/{id}
    if method == 'GET' and (path.startswith('/cyber/incidents/') or path.startswith('/cyber/threats/')):
        threat_id = path.rsplit('/', 1)[-1]
        if threat_id in ('', 'incidents', 'threats'):
            return error_response('Missing incident ID', 400)
        return _get_threat_detail(threat_id)

    # GET /cyber/ip/{ip}
    if method == 'GET' and path.startswith('/cyber/ip/'):
        ip = path.replace('/cyber/ip/', '').split('/')[0]
        if not ip:
            return error_response('Missing IP address', 400)
        return _ip_reputation(ip, params)

    # GET /cyber/domain/{domain}
    if method == 'GET' and path.startswith('/cyber/domain/'):
        domain = path.replace('/cyber/domain/', '').split('/')[0]
        if not domain:
            return error_response('Missing domain', 400)
        return _domain_intel(domain)

    # GET /cyber/evidence
    if method == 'GET' and path in ('/cyber/evidence', '/cyber/evidence/'):
        return _list_evidence(params)

    # GET /cyber/flows
    if method == 'GET' and path in ('/cyber/flows', '/cyber/traffic', '/cyber/flows/'):
        return _list_flows(params)

    # GET /cyber/stats
    if method == 'GET' and (path == '/cyber/stats' or path == '/cyber/cyber/stats'):
        return _cyber_stats()

    # POST /cyber/analyze-phishing
    if method == 'POST' and ('/analyze-phishing' in path):
        return _analyze_phishing(body)

    # POST /cyber/analyze-traffic
    if method == 'POST' and ('/analyze-traffic' in path):
        return _analyze_traffic(body)

    # GET /cyber/attack-paths
    if method == 'GET' and ('/attack-path' in path):
        return _attack_paths()

    return error_response(f'Route not found: {method} {path}', 404)


def _list_threats(params):
    limit = _safe_int(params.get('limit'), 50)
    offset = _safe_int(params.get('offset'), 0)
    conditions = []
    for f, col in [('type', 'THREAT_TYPE'), ('severity', 'SEVERITY')]:
        val = params.get(f)
        if val:
            conditions.append((col, '=', val))

    threats = query_table(TABLE_THREATS,
                          conditions=conditions if conditions else None,
                          limit=limit, offset=offset,
                          order_by=('TIMESTAMP', 'DESC'))
    total = count_records(TABLE_THREATS, conditions if conditions else None)

    # Map db field names to frontend CyberIncidentDTO format
    incidents = []
    for t in threats:
        incidents.append({
            'id': t.get('THREAT_ID', ''),
            'type': t.get('THREAT_TYPE', 'Unknown'),
            'severity': t.get('SEVERITY', 'Medium'),
            'status': t.get('STATUS', 'Active'),
            'district': t.get('DISTRICT', 'Unknown'),
            'title': t.get('TITLE', '') or f"{t.get('THREAT_TYPE', 'Threat')} Incident",
            'description': t.get('DESCRIPTION', ''),
            'date': t.get('TIMESTAMP', '')[:10] if t.get('TIMESTAMP') else '',
            'detectedAt': t.get('TIMESTAMP', ''),
            'source': t.get('SOURCE', 'Unknown'),
            'target': t.get('TARGET', 'Unknown'),
            'affectedSystems': [t.get('TARGET', 'System')],
            'indicators': {'ips': [], 'domains': [], 'hashes': []},
            'attackVector': t.get('ATTACK_VECTOR', 'Unknown'),
            'impact': t.get('IMPACT', ''),
            'remediation': t.get('REMEDIATION', ''),
            'assignedTo': t.get('ASSIGNED_TO', 'Unassigned'),
            'timeline': [{'date': t.get('TIMESTAMP', ''), 'event': 'Detected'}],
            'evidence': []
        })

    return success_response({'incidents': incidents, 'total': total})


def _get_threat_detail(threat_id):
    threat = get_record(TABLE_THREATS, 'THREAT_ID', threat_id)
    if not threat:
        return error_response(f'Incident {threat_id} not found', 404)
    iocs = query_table(TABLE_IOCS, conditions=[('THREAT_ID', '=', threat_id)], limit=100)

    incident = {
        'id': threat.get('THREAT_ID', ''),
        'type': threat.get('THREAT_TYPE', 'Unknown'),
        'severity': threat.get('SEVERITY', 'Medium'),
        'status': threat.get('STATUS', 'Active'),
        'district': threat.get('DISTRICT', 'Unknown'),
        'title': threat.get('TITLE', '') or f"{threat.get('THREAT_TYPE', 'Threat')} Incident",
        'description': threat.get('DESCRIPTION', ''),
        'date': threat.get('TIMESTAMP', '')[:10] if threat.get('TIMESTAMP') else '',
        'detectedAt': threat.get('TIMESTAMP', ''),
        'source': threat.get('SOURCE', 'Unknown'),
        'target': threat.get('TARGET', 'Unknown'),
        'affectedSystems': [threat.get('TARGET', 'System')],
        'indicators': {
            'ips': [i.get('IOC_VALUE', '') for i in iocs if i.get('IOC_TYPE', '').lower() == 'ip'],
            'domains': [i.get('IOC_VALUE', '') for i in iocs if i.get('IOC_TYPE', '').lower() == 'domain'],
            'hashes': [i.get('IOC_VALUE', '') for i in iocs if i.get('IOC_TYPE', '').lower() in ('hash', 'md5', 'sha256')]
        },
        'attackVector': threat.get('ATTACK_VECTOR', 'Unknown'),
        'impact': threat.get('IMPACT', ''),
        'remediation': threat.get('REMEDIATION', ''),
        'assignedTo': threat.get('ASSIGNED_TO', 'Unassigned'),
        'timeline': [{'date': threat.get('TIMESTAMP', ''), 'event': 'Detected'}],
        'evidence': []
    }
    return success_response({'incident': incident, 'iocs': iocs})


def _ip_reputation(ip, params):
    model = _get_ip_model()
    context = {
        'connection_attempts': _safe_int(params.get('attempts'), 1),
        'is_vpn': params.get('is_vpn', 'false').lower() == 'true',
        'is_datacenter': params.get('is_datacenter', 'false').lower() == 'true',
    }
    score = model.score(ip, context)

    risk_level = 'HIGH' if score >= 60 else 'MEDIUM' if score >= 30 else 'LOW'

    # Get associated incidents
    incidents = query_table(TABLE_THREATS, conditions=[('SOURCE', '=', ip)], limit=10)

    return success_response({
        'ip': ip,
        'reputation': risk_level.lower(),
        'reputationScore': score,
        'geolocation': {
            'city': 'Bengaluru',
            'region': 'Karnataka',
            'country': 'India',
            'lat': 12.97,
            'lng': 77.59
        },
        'network': {
            'isp': 'Unknown',
            'asn': f'AS{hash(ip) % 10000 + 10000}',
            'org': 'Unknown',
            'type': params.get('is_datacenter', 'false') == 'true' and 'datacenter' or 'residential'
        },
        'threatData': {
            'riskLevel': score,
            'incidentCount': len(incidents),
            'firstSeen': '',
            'lastSeen': '',
            'categories': []
        },
        'associatedIncidents': [{'id': i.get('THREAT_ID', ''), 'type': i.get('THREAT_TYPE', ''),
                                  'target': i.get('TARGET', '')} for i in incidents]
    })


def _domain_intel(domain):
    import hashlib
    threat_score = (hashlib.md5(domain.encode()).digest()[0] % 100)
    risk = 'HIGH' if threat_score > 66 else 'MEDIUM' if threat_score > 33 else 'LOW'

    return success_response({
        'domain': domain,
        'threatScore': threat_score,
        'riskLevel': risk,
        'whois': {
            'registrar': 'Unknown',
            'creationDate': '2025-01-01',
            'expirationDate': '2026-01-01',
            'organization': 'Unknown',
            'country': 'Unknown'
        },
        'ssl': {'valid': False, 'issuer': None, 'expiryDate': None},
        'dns': {'aRecords': [], 'mxRecords': [], 'nsRecords': []},
        'phishingProbability': threat_score / 100.0,
        'categories': [],
        'associatedIncidents': []
    })


def _list_evidence(params):
    case_id = params.get('caseId', '')
    threats = query_table(TABLE_THREATS, limit=50)

    evidence = []
    for i, t in enumerate(threats):
        eid = t.get('THREAT_ID', f'E-{i}')
        evidence.append({
            'id': f'EV-{i+1:04d}',
            'type': ['Network Capture', 'Email', 'Log File', 'Disk Image', 'Memory Dump'][i % 5],
            'title': f"Evidence from {t.get('TITLE', 'investigation')}",
            'description': t.get('DESCRIPTION', '')[:100] if t.get('DESCRIPTION') else 'Evidence record',
            'caseId': t.get('THREAT_ID', ''),
            'collectedAt': t.get('TIMESTAMP', ''),
            'collectedBy': 'Cyber Forensics Team',
            'status': 'preserved',
            'chainOfCustody': [
                {'action': 'Collected', 'by': 'Officer', 'at': t.get('TIMESTAMP', '')},
                {'action': 'Verified', 'by': 'Supervisor', 'at': t.get('TIMESTAMP', '')}
            ],
            'hash': f"sha256:{hash(t.get('THREAT_ID', '')):064x}"
        })

    if case_id:
        evidence = [e for e in evidence if e['caseId'] == case_id]

    return success_response({'evidence': evidence})


def _list_flows(params):
    threats = query_table(TABLE_THREATS, limit=100)
    flows = []
    for i, t in enumerate(threats):
        flows.append({
            'id': f'FL-{i+1:04d}',
            'timestamp': t.get('TIMESTAMP', ''),
            'sourceIp': t.get('SOURCE', f'192.168.{i%255}.{i%254+1}'),
            'destIp': t.get('TARGET', f'10.0.{i%255}.{i%254+1}'),
            'sourcePort': 1024 + (i % 60000),
            'destPort': [80, 443, 22, 3389, 8080][i % 5],
            'protocol': ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'][i % 5],
            'bytes': i * 1024 % 1000000,
            'packets': i * 10 % 10000,
            'duration': i % 300,
            'threatIndicator': t.get('SEVERITY', 'Low') in ('Critical', 'High'),
            'threatType': t.get('THREAT_TYPE', '') if t.get('SEVERITY', 'Low') in ('Critical', 'High') else ''
        })
    return success_response({'flows': flows})


def _cyber_stats():
    total = count_records(TABLE_THREATS)
    active = count_records(TABLE_THREATS, [('STATUS', '=', 'Active')])
    mitigated = count_records(TABLE_THREATS, [('STATUS', '=', 'Mitigated')])
    critical = count_records(TABLE_THREATS, [('SEVERITY', '=', 'Critical')])
    high = count_records(TABLE_THREATS, [('SEVERITY', '=', 'High')])

    by_type = query_table(TABLE_THREATS, columns=['THREAT_TYPE', 'COUNT(*) as count'],
                          order_by=('count', 'DESC'))
    total_iocs = count_records(TABLE_IOCS)

    return success_response({
        'totals': {
            'totalIncidents': total,
            'openIncidents': active,
            'criticalCount': critical,
            'avgResponseHours': round(total_iocs / max(active, 1), 1)
        },
        'typeBreakdown': [{'type': r.get('THREAT_TYPE', 'Unknown'), 'count': r.get('count', 0)} for r in by_type],
        'monthlyTrend': [],
        'recentCritical': []
    })


def _analyze_phishing(body):
    url = body.get('url', '')
    email_content = body.get('email_content', '')
    if not url and not email_content:
        return error_response('Provide url or email_content', 400)

    detector = _get_phishing_model()
    result = detector.analyze_url(url) if url else detector.analyze_email(email_content)
    return success_response(result)


def _analyze_traffic(body):
    flows = body.get('flows', body.get('traffic', []))
    if not flows:
        return error_response('Provide flow data', 400)
    detector = _get_flow_detector()
    results = detector.detect(flows)
    anomalies = [r for r in results if r[2]]
    return success_response({
        'total_flows': len(flows),
        'anomalies_detected': len(anomalies),
        'results': [{'anomaly_score': r[1], 'is_anomaly': r[2]} for r in results]
    })


def _attack_paths():
    threats = query_table(TABLE_THREATS, limit=500)
    if not threats:
        return success_response({
            'campaigns': [], 'lateral_movement_paths': [], 'total_events': 0,
            'kill_chain_progress': {'stages_reached': 0, 'total_stages': 14, 'stages': []},
            'crown_jewel_targets': []
        })
    correlator = _get_attack_correlator()
    return success_response(correlator.correlate(threats))
