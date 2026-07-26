"""
ULTRON — Conversational AI Chat API
Catalyst Python Function for LLM-powered natural language queries and RAG.

Routes:
  POST /api/chat/query       — Natural language query → ZCQL → LLM response
  POST /api/chat/rag-query   — RAG query on knowledge base documents
  POST /api/chat/translate   — Translate query text (multi-language)
"""

import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))

from constants import (
    success_response, error_response,
    TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS,
    TABLE_THREATS, TABLE_DISTRICTS
)
from db_utils import query_table, get_record

# QuickML connection — uses Catalyst Cloud Scale connections
# In production, these come from catalyst-config.json environment variables
QUICKML_ENDPOINT = os.environ.get('QUICKML_ENDPOINT', '')
LLM_DEPLOYMENT_ID = os.environ.get('LLM_DEPLOYMENT_ID', '')
KB_DOCUMENT_ID = os.environ.get('KB_DOCUMENT_ID', '')
CONNECTION_ID = os.environ.get('CONNECTION_ID', '')


def handler(request, context):
    """Main entry point for Chat API."""
    method = request.get('method', 'GET').upper()
    path = request.get('path', '/')
    params = request.get('query_params', {}) or {}
    
    try:
        body = json.loads(request.get('body', '{}')) if request.get('body') else {}
    except (json.JSONDecodeError, TypeError):
        body = {}
    
    if method == 'OPTIONS':
        return success_response(None)
    
    # POST /chat/query
    if method == 'POST' and path in ('/api/chat/query', '/chat/query'):
        query_text = body.get('query', '').strip()
        language = body.get('language', 'en')
        conversation_history = body.get('history', [])
        
        if not query_text:
            return error_response('Query text is required', 400)
        
        result = _handle_llm_query(query_text, language, conversation_history)
        return success_response(result)
    
    # POST /chat/rag-query
    if method == 'POST' and path in ('/api/chat/rag-query', '/chat/rag-query'):
        query_text = body.get('query', '').strip()
        document_id = body.get('document_id', KB_DOCUMENT_ID)
        
        if not query_text:
            return error_response('Query text is required', 400)
        
        result = _handle_rag_query(query_text, document_id)
        return success_response(result)
    
    # POST /chat/translate
    if method == 'POST' and path in ('/api/chat/translate', '/chat/translate'):
        text = body.get('text', '').strip()
        target_lang = body.get('target_language', 'en')
        
        if not text:
            return error_response('Text to translate is required', 400)
        
        result = _handle_translation(text, target_lang)
        return success_response(result)
    
    return error_response(f'Route not found: {method} {path}', 404)


def _handle_llm_query(query_text, language='en', history=None):
    """
    Process natural language query against crime database.
    
    Flow:
    1. Parse intent from natural language
    2. Query Data Store using ZCQL
    3. Send query + results to LLM for natural language answer
    4. Return response with citations
    """
    if history is None:
        history = []
    
    # Step 1: Identify query intent
    intent = _classify_query_intent(query_text)
    
    # Step 2: Execute against Data Store
    db_results = _execute_intent(intent, query_text)
    
    # Step 3: Build LLM prompt with context
    llm_response = _call_llm_with_context(query_text, db_results, intent, language)
    
    # Step 4: Format response
    return {
        'query': query_text,
        'intent': intent.get('type', 'unknown'),
        'translated_intent': intent.get('description', ''),
        'data_summary': db_results.get('summary', ''),
        'data_count': db_results.get('count', 0),
        'response': llm_response,
        'language': language,
        'confidence': intent.get('confidence', 0.5),
        'citations': db_results.get('citations', [])
    }


def _handle_rag_query(query_text, document_id=None):
    """
    Perform RAG query on knowledge base documents.
    
    Uses Catalyst QuickML RAG endpoint with uploaded knowledge base.
    """
    # This uses the Catalyst QuickML REST API
    # In production, make an HTTP request to the QuickML RAG endpoint
    # using the Cloud Scale connection for authentication
    
    return {
        'query': query_text,
        'response': f'[RAG response for: "{query_text}"]',  # Placeholder
        'sources': [{'document_id': document_id, 'relevance': 'high'}],
        'model': 'GLM-4.7-RAG'
    }


def _handle_translation(text, target_language):
    """
    Translate text using Catalyst NLP models.
    Supports: English, Hindi, Kannada
    """
    # Catalyst provides text translation models as API endpoints
    # In production, make HTTP request to the translation model
    
    return {
        'original_text': text,
        'translated_text': f'[{target_language} translation of: {text}]',  # Placeholder
        'target_language': target_language,
        'model': 'catalyst-translation-v1'
    }


def _classify_query_intent(query):
    """
    Classify the intent of a natural language query about crime data.
    
    Supported intents:
    - crime_count: "How many burglaries in Bengaluru?"
    - crime_listing: "Show me recent cybercrime cases"
    - criminal_search: "Find criminals involved in drug trafficking"
    - trend_query: "What's the trend for theft over the last 6 months?"
    - hotspot_query: "Where are the crime hotspots in Mysuru?"
    - network_query: "Who is connected to this criminal?"
    - comparison: "Compare crime rates between districts"
    - stats: "Show overall crime statistics"
    - general: Fallback for general questions
    """
    query_lower = query.lower()
    
    # Count/intent patterns
    if any(w in query_lower for w in ['how many', 'count', 'number of', 'total']):
        # Extract crime type and location
        crime_type = _extract_crime_type(query_text)
        location = _extract_location(query_text)
        return {
            'type': 'crime_count',
            'description': f'Count {crime_type or "all"} crimes in {location or "all districts"}',
            'crime_type': crime_type,
            'location': location,
            'confidence': 0.85
        }
    
    elif any(w in query_lower for w in ['show me', 'list', 'find', 'get me', 'display']):
        crime_type = _extract_crime_type(query_text)
        location = _extract_location(query_text)
        return {
            'type': 'crime_listing',
            'description': f'List {crime_type or "all"} crimes in {location or "all districts"}',
            'crime_type': crime_type,
            'location': location,
            'confidence': 0.8
        }
    
    elif any(w in query_lower for w in ['trend', 'over time', 'monthly', 'increase', 'decrease', 'pattern']):
        return {
            'type': 'trend_query',
            'description': 'Analyze crime trends over time',
            'crime_type': _extract_crime_type(query_text),
            'location': _extract_location(query_text),
            'confidence': 0.85
        }
    
    elif any(w in query_lower for w in ['hotspot', 'zone', 'area', 'where', 'map', 'cluster']):
        return {
            'type': 'hotspot_query',
            'description': 'Identify crime hotspots and high-risk zones',
            'location': _extract_location(query_text),
            'confidence': 0.8
        }
    
    elif any(w in query_lower for w in ['criminal', 'suspect', 'person', 'who', 'accused']):
        return {
            'type': 'criminal_search',
            'description': 'Search for criminals matching criteria',
            'search_term': query_text,
            'confidence': 0.75
        }
    
    elif any(w in query_lower for w in ['compare', 'versus', 'vs', 'difference', 'which district']):
        return {
            'type': 'comparison',
            'description': 'Compare crime metrics across districts',
            'confidence': 0.7
        }
    
    elif any(w in query_lower for w in ['statistics', 'stats', 'summary', 'overview', 'dashboard']):
        return {
            'type': 'stats',
            'description': 'Provide overall crime statistics',
            'confidence': 0.9
        }
    
    elif any(w in query_lower for w in ['network', 'connection', 'linked', 'related', 'gang', 'group']):
        return {
            'type': 'network_query',
            'description': 'Analyze criminal network connections',
            'confidence': 0.8
        }
    
    return {
        'type': 'general',
        'description': 'General question about crime data',
        'confidence': 0.5
    }


def _execute_intent(intent, query_text):
    """Execute the identified intent against Catalyst Data Store."""
    intent_type = intent.get('type', 'general')
    
    if intent_type == 'crime_count':
        condition = []
        if intent.get('crime_type'):
            condition.append(('CRIME_TYPE', '=', intent['crime_type']))
        if intent.get('location'):
            condition.append(('DISTRICT', '=', intent['location']))
        
        total = 0
        from db_utils import count_records
        try:
            total = count_records(TABLE_CRIMES, condition if condition else None)
        except Exception:
            total = 0
        
        return {
            'summary': f"Found {total} records matching your query.",
            'count': total,
            'citations': []
        }
    
    elif intent_type in ('crime_listing', 'criminal_search'):
        conditions = []
        if intent.get('crime_type'):
            conditions.append(('CRIME_TYPE', '=', intent['crime_type']))
        if intent.get('location'):
            conditions.append(('DISTRICT', '=', intent['location']))
        
        try:
            results = query_table(
                TABLE_CRIMES if intent_type == 'crime_listing' else TABLE_CRIMINALS,
                conditions=conditions if conditions else None,
                limit=20
            )
            return {
                'summary': f"Found {len(results)} records.",
                'count': len(results),
                'citations': [r.get('FIR_NUMBER', '') for r in results[:5]] if intent_type == 'crime_listing' else [],
                'sample_data': results[:3]
            }
        except Exception:
            return {'summary': 'Unable to query database.', 'count': 0, 'citations': []}
    
    elif intent_type == 'stats':
        try:
            from db_utils import get_crime_stats
            stats = get_crime_stats()
            return {
                'summary': f"Total cases: {stats.get('total_cases', 0)}. "
                          f"Violent: {stats.get('violent_crimes', 0)}. "
                          f"Clearance rate: {stats.get('clearance_rate', 0)}%.",
                'count': stats.get('total_cases', 0),
                'citations': []
            }
        except Exception:
            return {'summary': 'Unable to compute statistics.', 'count': 0, 'citations': []}
    
    else:
        return {'summary': f"Processing your query about: {intent.get('description', query_text)}", 'count': 0, 'citations': []}


def _call_llm_with_context(query, db_results, intent, language):
    """
    Call Catalyst LLM with query + database context for natural language response.
    
    In production, this makes an authenticated request to the QuickML LLM endpoint.
    
    The LLM is prompted with:
    - System prompt defining the assistant as a police crime data analyst
    - The user's original query
    - Database results context
    - Language preference (English/Kannada)
    """
    # Build the context for LLM
    system_prompt = """You are ULTRON AI, an advanced crime data analysis assistant for the Karnataka State Police.
    You help investigators and policymakers understand crime patterns, trends, and statistics.
    Answer based on the provided crime database information. Be concise, factual, and cite data sources when possible.
    If the information is not available in the database, say so honestly."""
    
    context = f"""
    Database Query Results:
    - Intent: {intent.get('description', 'General query')}
    - Records Found: {db_results.get('count', 0)}
    - Summary: {db_results.get('summary', 'No data available')}
    
    User Query: {query}
    """
    
    # In production, this would be an HTTP POST to:
    # {QUICKML_ENDPOINT}/api/v1/quickml/{LLM_DEPLOYMENT_ID}/chat
    # with OAuth token from the Catalyst connection
    
    # For now, generate a contextual response
    return _generate_contextual_response(query, db_results, intent, language)


def _generate_contextual_response(query, db_results, intent, language):
    """Generate a contextual response based on database results."""
    count = db_results.get('count', 0)
    summary = db_results.get('summary', '')
    
    intent_type = intent.get('type', 'general')
    
    if count == 0:
        base = f"I searched the crime database but didn't find any records matching your query. "
        if intent.get('crime_type') or intent.get('location'):
            filters = []
            if intent.get('crime_type'):
                filters.append(f"crime type '{intent['crime_type']}'")
            if intent.get('location'):
                filters.append(f"location '{intent['location']}'")
            base += f"Try broadening your search by removing the {' and '.join(filters)} filter."
        return base
    
    if intent_type == 'crime_count':
        response = f"📊 Based on the crime database, {summary}"
        if intent.get('crime_type'):
            response += f" There are {count} {intent['crime_type']} cases"
            if intent.get('location'):
                response += f" in {intent['location']}"
            response += " in the records."
        return response
    
    if intent_type == 'stats':
        return f"📈 Here's your crime statistics overview: {summary}"
    
    if intent_type == 'trend_query':
        return f"📉 Based on available data, {summary} The trend analysis requires examining data over time periods."
    
    if intent_type == 'hotspot_query':
        return f"📍 {summary} Crime hotspot analysis identifies clusters where crimes are concentrated. Check the Analytics dashboard for detailed hotspot maps."
    
    return f"ℹ️ {summary}"


def _extract_crime_type(query):
    """Extract crime type from query text."""
    crime_types = [
        'theft', 'burglary', 'robbery', 'assault', 'homicide', 'murder',
        'cybercrime', 'cyber', 'fraud', 'drug trafficking', 'drug',
        'human trafficking', 'kidnapping', 'vehicle theft', 'extortion',
        'money laundering', 'arson', 'domestic violence', 'dowry',
        'rape', 'sexual assault', 'chain snatching', 'dacoity'
    ]
    query_lower = query.lower()
    for ct in crime_types:
        if ct in query_lower:
            # Map back to canonical crime type
            mapping = {
                'murder': 'Homicide', 'homicide': 'Homicide',
                'theft': 'Theft', 'burglary': 'Burglary',
                'robbery': 'Robbery', 'assault': 'Assault',
                'cybercrime': 'Cybercrime', 'cyber': 'Cybercrime',
                'fraud': 'Fraud', 'drug': 'Drug Trafficking',
                'drug trafficking': 'Drug Trafficking',
                'kidnapping': 'Kidnapping', 'arson': 'Arson',
                'extortion': 'Extortion'
            }
            return mapping.get(ct, ct.title())
    return None


def _extract_location(query):
    """Extract district/location from query text."""
    districts = [
        'bengaluru', 'bangalore', 'mysuru', 'mysore', 'belagavi', 'belgaum',
        'hubli', 'dharwad', 'mangaluru', 'mangalore', 'udupi', 'shivamogga',
        'tumakuru', 'tumkur', 'kolara', 'kolar', 'ballari', 'bellary',
        'vijayapura', 'bijapur', 'kalaburagi', 'gulbarga', 'hassan',
        'dakshina kannada', 'dakshina kannada', 'uttara kannada'
    ]
    query_lower = query.lower()
    for d in districts:
        if d in query_lower:
            mapping = {
                'bangalore': 'Bengaluru Urban', 'bengaluru': 'Bengaluru Urban',
                'mysore': 'Mysuru', 'belgaum': 'Belagavi',
                'mangalore': 'Dakshina Kannada', 'mangaluru': 'Dakshina Kannada',
                'tumkur': 'Tumakuru', 'bellary': 'Ballari',
                'bijapur': 'Vijayapura', 'gulbarga': 'Kalaburagi',
                'shimoga': 'Shivamogga', 'kolar': 'Kolar'
            }
            return mapping.get(d, d.title())
    return None
