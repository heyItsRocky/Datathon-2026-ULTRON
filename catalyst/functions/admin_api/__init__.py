"""
ULTRON — Admin API
Catalyst Python Function for system administration, health checks, user management, data ingestion.

Routes:
  GET  /api/admin/health    — System health status
  GET  /api/admin/users     — List users
  POST /api/admin/ingest    — Data ingestion endpoint
  GET  /api/admin/audit     — Audit log
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response,
    TABLE_USERS, TABLE_AUDIT, TABLE_CRIMES, TABLE_THREATS
)
from db_utils import query_table, get_record, insert_record, count_records


def _safe_int(val, default=0):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def handler(request, context):
    """Main entry point for Admin API."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}
    
    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}
    
    if method == 'OPTIONS':
        return success_response(None)
    
    # GET /health
    if method == 'GET' and path in ('/api/admin/health', '/health'):
        status = _check_health()
        return success_response(status)
    
    # GET /users
    if method == 'GET' and path in ('/api/admin/users', '/users'):
        limit = _safe_int(params.get('limit'), 100)
        offset = _safe_int(params.get('offset'), 0)
        users = query_table(TABLE_USERS, limit=limit, offset=offset)
        total = count_records(TABLE_USERS)
        return success_response({'users': users, 'total': total})
    
    # POST /ingest
    if method == 'POST' and path in ('/api/admin/ingest', '/ingest'):
        data_type = body.get('type', '')
        records = body.get('records', [])
        
        if not data_type or not records:
            return error_response('Provide type (crimes/threats/criminals) and records array', 400)
        
        table_map = {
            'crimes': TABLE_CRIMES,
            'threats': TABLE_THREATS,
            'criminals': 'Criminals'
        }
        
        table_name = table_map.get(data_type)
        if not table_name:
            return error_response(f'Unknown data type: {data_type}. Use: crimes, threats, criminals', 400)
        
        inserted = 0
        errors = []
        for record in records:
            try:
                insert_record(table_name, record)
                inserted += 1
            except Exception as e:
                errors.append(str(e))
        
        # Audit log
        _log_audit('system', f'INGEST:{data_type}', f'{inserted} records', context)
        
        return success_response({
            'type': data_type,
            'inserted': inserted,
            'failed': len(errors),
            'errors': errors[:5]
        })
    
    # GET /audit
    if method == 'GET' and path in ('/api/admin/audit', '/audit'):
        limit = _safe_int(params.get('limit'), 100)
        offset = _safe_int(params.get('offset'), 0)
        logs = query_table(TABLE_AUDIT, limit=limit, offset=offset, order_by=('TIMESTAMP', 'DESC'))
        total = count_records(TABLE_AUDIT)
        return success_response({'logs': logs, 'total': total})
    
    return error_response(f'Route not found: {method} {path}', 404)


def _check_health():
    """Check all system components."""
    status = {'overall': 'healthy', 'services': {}}
    
    # Data Store connectivity
    try:
        crime_count = count_records(TABLE_CRIMES)
        status['services']['data_store'] = {
            'status': 'healthy',
            'crime_records': crime_count
        }
    except Exception as e:
        status['services']['data_store'] = {'status': 'error', 'message': str(e)}
        status['overall'] = 'degraded'
    
    # Check threat table
    try:
        threat_count = count_records(TABLE_THREATS)
        status['services']['cyber_store'] = {
            'status': 'healthy',
            'threat_records': threat_count
        }
    except Exception as e:
        status['services']['cyber_store'] = {'status': 'error', 'message': str(e)}
        status['overall'] = 'degraded'
    
    # Version info
    status['version'] = '1.0.0'
    status['project'] = 'ULTRON — KSP Datathon 2026'
    status['python_version'] = sys.version
    
    return status


def _log_audit(user_id, action, details, context=None):
    """Log an audit entry."""
    try:
        from datetime import datetime
        insert_record(TABLE_AUDIT, {
            'LOG_ID': f'AUDIT-{datetime.now().timestamp()}',
            'USER_ID': user_id,
            'ACTION': action,
            'RESOURCE_TYPE': 'system',
            'RESOURCE_ID': 'admin',
            'TIMESTAMP': datetime.now().isoformat(),
            'DETAILS': json.dumps({'details': details})
        })
    except Exception:
        pass  # Audit logging should not break the main flow
