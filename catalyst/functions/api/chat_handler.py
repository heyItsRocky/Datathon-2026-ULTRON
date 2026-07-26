"""
Chat/LLM domain handler — serves /chat/* routes for conversational AI.
Contains intent classification, DB query execution, and LLM prompt building.
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import success_response, error_response, TABLE_CRIMES, TABLE_CRIMINALS
from db_utils import query_table, count_records, get_crime_stats

QUICKML_ENDPOINT = os.environ.get('QUICKML_ENDPOINT', '')
LLM_DEPLOYMENT_ID = os.environ.get('LLM_DEPLOYMENT_ID', '')
KB_DOCUMENT_ID = os.environ.get('KB_DOCUMENT_ID', '')


def handle_chat_request(request):
    """Route chat/LLM requests."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}

    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}

    # POST /chat/query — natural language crime DB query
    if method == 'POST' and '/chat/query' in path:
        query_text = body.get('query', '').strip()
        language = body.get('language', 'en')
        history = body.get('history', [])

        if not query_text:
            return error_response('Query text is required', 400)

        intent = _classify_query_intent(query_text)
        db_results = _execute_intent(intent, query_text)
        llm_response = _call_llm_with_context(query_text, db_results, intent, language)

        return success_response({
            'query': query_text,
            'intent': intent.get('type', 'unknown'),
            'translated_intent': intent.get('description', ''),
            'data_summary': db_results.get('summary', ''),
            'data_count': db_results.get('count', 0),
            'response': llm_response,
            'language': language,
            'confidence': intent.get('confidence', 0.5),
            'citations': db_results.get('citations', [])
        })

    # POST /chat/rag-query — knowledge base document query
    if method == 'POST' and '/chat/rag-query' in path:
        query_text = body.get('query', '').strip()
        document_id = body.get('document_id', KB_DOCUMENT_ID)

        if not query_text:
            return error_response('Query text is required', 400)

        result = _handle_rag_query(query_text, document_id)
        return success_response(result)

    # POST /chat/translate — multi-language translation
    if method == 'POST' and '/chat/translate' in path:
        text = body.get('text', '').strip()
        target_lang = body.get('target_language', 'en')

        if not text:
            return error_response('Text to translate is required', 400)

        result = _handle_translation(text, target_lang)
        return success_response(result)

    return error_response(f'Route not found: {method} {path}', 404)


# ============================================================
# Intent Classification
# ============================================================

def _classify_query_intent(query):
    """Classify natural language query intent."""
    q = query.lower()

    if any(w in q for w in ['how many', 'count', 'number of', 'total']):
        return {
            'type': 'crime_count', 'description': 'Count crimes matching criteria',
            'crime_type': _extract_crime_type(query), 'location': _extract_location(query),
            'confidence': 0.85
        }
    elif any(w in q for w in ['show me', 'list', 'find', 'get me', 'display']):
        return {
            'type': 'crime_listing', 'description': 'List crimes matching criteria',
            'crime_type': _extract_crime_type(query), 'location': _extract_location(query),
            'confidence': 0.8
        }
    elif any(w in q for w in ['trend', 'over time', 'monthly', 'increase', 'decrease', 'pattern']):
        return {
            'type': 'trend_query', 'description': 'Analyze crime trends',
            'crime_type': _extract_crime_type(query), 'location': _extract_location(query),
            'confidence': 0.85
        }
    elif any(w in q for w in ['hotspot', 'zone', 'area', 'where', 'map', 'cluster']):
        return {
            'type': 'hotspot_query', 'description': 'Identify crime hotspots',
            'location': _extract_location(query), 'confidence': 0.8
        }
    elif any(w in q for w in ['criminal', 'suspect', 'person', 'who', 'accused']):
        return {
            'type': 'criminal_search', 'description': 'Search for criminals',
            'search_term': query, 'confidence': 0.75
        }
    elif any(w in q for w in ['compare', 'versus', 'vs', 'difference', 'which district']):
        return {
            'type': 'comparison', 'description': 'Compare crime across districts',
            'confidence': 0.7
        }
    elif any(w in q for w in ['statistics', 'stats', 'summary', 'overview', 'dashboard']):
        return {
            'type': 'stats', 'description': 'Provide crime statistics overview',
            'confidence': 0.9
        }
    elif any(w in q for w in ['network', 'connection', 'linked', 'related', 'gang', 'group']):
        return {
            'type': 'network_query', 'description': 'Analyze criminal networks',
            'confidence': 0.8
        }

    return {'type': 'general', 'description': 'General question', 'confidence': 0.5}


def _execute_intent(intent, query_text):
    """Execute query intent against Catalyst Data Store."""
    intent_type = intent.get('type', 'general')

    if intent_type == 'crime_count':
        cond = []
        if intent.get('crime_type'):
            cond.append(('CRIME_TYPE', '=', intent['crime_type']))
        if intent.get('location'):
            cond.append(('DISTRICT', '=', intent['location']))
        try:
            total = count_records(TABLE_CRIMES, cond if cond else None)
            return {'summary': f'Found {total} records matching your query.', 'count': total, 'citations': []}
        except Exception as e:
            return {'summary': 'Query failed: ' + str(e), 'count': 0, 'citations': []}

    elif intent_type in ('crime_listing', 'criminal_search'):
        cond = []
        if intent.get('crime_type'):
            cond.append(('CRIME_TYPE', '=', intent['crime_type']))
        if intent.get('location'):
            cond.append(('DISTRICT', '=', intent['location']))
        try:
            table = TABLE_CRIMES if intent_type == 'crime_listing' else TABLE_CRIMINALS
            results = query_table(table, conditions=cond if cond else None, limit=20)
            return {'summary': f'Found {len(results)} records.', 'count': len(results),
                    'citations': [r.get('FIR_NUMBER', '') for r in results[:5]], 'sample_data': results[:3]}
        except Exception as e:
            return {'summary': 'Query failed', 'count': 0, 'citations': []}

    elif intent_type == 'stats':
        try:
            stats = get_crime_stats()
            s = f"Total cases: {stats.get('total_cases', 0)}. Violent: {stats.get('violent_crimes', 0)}. Clearance rate: {stats.get('clearance_rate', 0)}%."
            return {'summary': s, 'count': stats.get('total_cases', 0), 'citations': []}
        except Exception as e:
            return {'summary': 'Unable to compute statistics', 'count': 0, 'citations': []}

    else:
        return {'summary': f"Processing: {intent.get('description', query_text)}", 'count': 0, 'citations': []}


def _call_llm_with_context(query, db_results, intent, language):
    """Generate contextual LLM response based on database results."""
    count = db_results.get('count', 0)
    summary = db_results.get('summary', '')
    intent_type = intent.get('type', 'general')

    if count == 0:
        msg = "I searched the crime database but didn't find any records matching your query. "
        if intent.get('crime_type') or intent.get('location'):
            filters = []
            if intent.get('crime_type'): filters.append(f"crime type '{intent['crime_type']}'")
            if intent.get('location'): filters.append(f"location '{intent['location']}'")
            msg += f"Try removing the {' and '.join(filters)} filter."
        return msg

    if intent_type == 'crime_count':
        resp = f"Based on the crime database, {summary}"
        if intent.get('crime_type'):
            resp += f" There are {count} {intent['crime_type']} cases"
            if intent.get('location'): resp += f" in {intent['location']}"
        return resp

    if intent_type == 'stats':
        return f"Here's your crime statistics overview: {summary}"
    if intent_type == 'trend_query':
        return f"Based on available data, {summary} Trend analysis requires examining data over time periods."
    if intent_type == 'hotspot_query':
        return f"{summary} Check the Analytics dashboard for detailed hotspot maps."
    return summary


def _handle_rag_query(query_text, document_id=None):
    """Placeholder for RAG query — in production calls QuickML RAG endpoint."""
    return {
        'query': query_text,
        'response': f'[RAG response for: "{query_text}"]',
        'sources': [{'document_id': document_id, 'relevance': 'high'}],
        'model': 'GLM-4.7-RAG'
    }


def _handle_translation(text, target_language):
    """Placeholder for translation — in production calls Catalyst NLP endpoint."""
    return {
        'original_text': text,
        'translated_text': f'[{target_language} translation of: {text[:50]}...]',
        'target_language': target_language,
        'model': 'catalyst-translation-v1'
    }


def _extract_crime_type(query):
    """Extract crime type from natural language query."""
    crime_types = {'murder': 'Homicide', 'homicide': 'Homicide', 'theft': 'Theft',
        'burglary': 'Burglary', 'robbery': 'Robbery', 'assault': 'Assault',
        'cybercrime': 'Cybercrime', 'cyber': 'Cybercrime', 'fraud': 'Fraud',
        'drug': 'Drug Trafficking', 'drug trafficking': 'Drug Trafficking',
        'kidnapping': 'Kidnapping', 'arson': 'Arson', 'extortion': 'Extortion'}
    q = query.lower()
    for key, val in sorted(crime_types.items(), key=lambda x: -len(x[0])):
        if key in q:
            return val
    return None


def _extract_location(query):
    """Extract district/location from natural language query."""
    districts = {'bangalore': 'Bengaluru Urban', 'bengaluru': 'Bengaluru Urban',
        'mysore': 'Mysuru', 'belgaum': 'Belagavi', 'mangalore': 'Dakshina Kannada',
        'mangaluru': 'Dakshina Kannada', 'tumkur': 'Tumakuru', 'bellary': 'Ballari',
        'bijapur': 'Vijayapura', 'gulbarga': 'Kalaburagi', 'shimoga': 'Shivamogga'}
    q = query.lower()
    for key, val in districts.items():
        if key in q:
            return val
    return None
