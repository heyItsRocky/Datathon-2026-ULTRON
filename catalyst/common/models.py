"""
ULTRON — Crime Tracking ML Models
ML models for crime analytics, risk prediction, and pattern detection.
"""

import json
import math
import numpy as np
from datetime import datetime


# ============================================================
# Model 1: Crime Hotspot Detection (DBSCAN)
# ============================================================

def detect_hotspots(crime_data, eps_km=5, min_samples=3):
    """
    Detect crime hotspots using DBSCAN clustering.
    
    Args:
        crime_data: List of dicts with 'latitude', 'longitude', 'crime_type', 'fir_date'
        eps_km: Maximum distance between points in same cluster (km)
        min_samples: Minimum points to form a cluster
    
    Returns:
        List of hotspot clusters with center, radius, density metrics
    """
    from sklearn.cluster import DBSCAN
    
    coords = []
    valid_records = []
    
    for r in crime_data:
        lat = r.get('latitude')
        lng = r.get('longitude')
        if lat is not None and lng is not None:
            try:
                coords.append([float(lat), float(lng)])
                valid_records.append(r)
            except (ValueError, TypeError):
                continue
    
    if len(coords) < min_samples:
        return []
    
    # Convert km to approximate degrees
    eps_deg = eps_km / 111.0
    
    X = np.array(coords)
    clustering = DBSCAN(eps=eps_deg, min_samples=min_samples).fit(X)
    labels = clustering.labels_
    
    # Build clusters
    clusters = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue
        key = int(label)
        if key not in clusters:
            clusters[key] = {
                'cluster_id': f'hotspot_{key}',
                'latitudes': [],
                'longitudes': [],
                'crimes': [],
                'types': {},
                'dates': []
            }
        clusters[key]['latitudes'].append(coords[i][0])
        clusters[key]['longitudes'].append(coords[i][1])
        clusters[key]['crimes'].append(valid_records[i])
        
        ct = valid_records[i].get('crime_type', 'Unknown')
        clusters[key]['types'][ct] = clusters[key]['types'].get(ct, 0) + 1
        clusters[key]['dates'].append(valid_records[i].get('fir_date', ''))
    
    # Format results
    results = []
    for cid, data in clusters.items():
        center_lat = sum(data['latitudes']) / len(data['latitudes'])
        center_lng = sum(data['longitudes']) / len(data['longitudes'])
        
        results.append({
            'cluster_id': data['cluster_id'],
            'center': {'lat': round(center_lat, 6), 'lng': round(center_lng, 6)},
            'radius_km': _estimate_radius_km(data['latitudes'], data['longitudes']),
            'crime_count': len(data['crimes']),
            'crime_types': dict(sorted(data['types'].items(), key=lambda x: x[1], reverse=True)),
            'density_score': round(len(data['crimes']) / max(float(_estimate_radius_km(
                data['latitudes'], data['longitudes']) + 0.1), 1.0), 2),
            'severity': _calculate_hotspot_severity(data['types']),
            'trend': _calculate_trend(data['dates'])
        })
    
    return sorted(results, key=lambda x: x['density_score'], reverse=True)


# ============================================================
# Model 2: Recidivism Risk Prediction (Random Forest)
# ============================================================

class RecidivismRiskModel:
    """
    Predicts criminal re-offense risk using Random Forest.
    
    Features:
    - Age, prior convictions count, crime type severity
    - Time since last offense, conviction rate
    - Socio-economic factors (district poverty, literacy)
    - Criminal network density
    """
    
    def __init__(self):
        self.model = None
        self.feature_names = [
            'age', 'prior_convictions', 'crime_severity_score',
            'months_since_last_offense', 'network_density',
            'district_crime_rate', 'repeat_offender_flag',
            'violent_crime_flag', 'multi_jurisdiction_flag'
        ]
    
    def train(self, criminal_data):
        """Train the Random Forest model on historical data."""
        from sklearn.ensemble import RandomForestClassifier
        
        if len(criminal_data) < 50:
            # Not enough data — return mock calibrated model
            self.model = 'calibrated'
            return
        
        X = []
        y = []
        for c in criminal_data:
            features = self._extract_features(c)
            X.append(features)
            y.append(1 if c.get('recidivated', False) else 0)
        
        self.model = RandomForestClassifier(
            n_estimators=100, max_depth=10,
            random_state=42, class_weight='balanced'
        )
        self.model.fit(np.array(X), np.array(y))
    
    def predict(self, criminal):
        """Predict recidivism risk score (0-100)."""
        features = self._extract_features(criminal)
        X = np.array([features])
        
        if isinstance(self.model, str) and self.model == 'calibrated':
            # Calibrated heuristic when model isn't trained
            return self._heuristic_score(criminal)
        
        if self.model:
            proba = self.model.predict_proba(X)[0]
            risk_positive = proba[1] if len(proba) > 1 else proba[0]
            return round(float(risk_positive) * 100, 1)
        
        return self._heuristic_score(criminal)
    
    def _extract_features(self, c):
        """Extract numeric feature vector from criminal record."""
        return [
            float(c.get('age', 30)) / 80.0,                          # age (normalized)
            min(float(c.get('prior_convictions', 0)) / 20.0, 1.0),   # prior convictions
            float(c.get('crime_severity_score', 5)) / 10.0,          # severity
            1.0 - min(float(c.get('months_since_last', 60)) / 120.0, 1.0),  # recency
            float(c.get('network_density', 0.1)),                    # network density
            float(c.get('district_crime_rate', 0.1)),                # local crime rate
            1.0 if c.get('repeat_offender', False) else 0.0,         # repeat flag
            1.0 if c.get('violent_crime', False) else 0.0,           # violent flag
            1.0 if c.get('multi_jurisdiction', False) else 0.0       # multi-jurisdiction
        ]
    
    def _heuristic_score(self, c):
        """Heuristic risk score when no trained model available."""
        score = 0.0
        
        # Age factor (younger = higher risk)
        age = float(c.get('age', 30))
        if age < 25:
            score += 30
        elif age < 35:
            score += 20
        elif age > 50:
            score -= 10
        
        # Prior convictions
        priors = float(c.get('prior_convictions', 0))
        score += min(priors * 5, 25)
        
        # Crime type severity
        severity_map = {'Homicide': 20, 'Assault': 15, 'Robbery': 15,
                       'Burglary': 10, 'Theft': 5, 'Fraud': 8}
        score += severity_map.get(c.get('crime_type', ''), 5)
        
        # Recency
        months = float(c.get('months_since_last_offense', 60))
        if months < 12:
            score += 20
        elif months < 36:
            score += 10
        
        # Network density
        score += min(float(c.get('network_density', 0)) * 10, 10)
        
        return min(max(score, 0), 100)


# ============================================================
# Model 3: Anomaly Detection (Isolation Forest)
# ============================================================

def detect_anomalies(crime_data, contamination=0.05):
    """
    Detect anomalous crime records using Isolation Forest.
    
    Args:
        crime_data: List of crime record dicts
        contamination: Expected proportion of outliers
    
    Returns:
        List of (record, anomaly_score) sorted by most anomalous
    """
    from sklearn.ensemble import IsolationForest
    
    if len(crime_data) < 10:
        return [(r, 0.5) for r in crime_data]
    
    feature_vectors = []
    for r in crime_data:
        vec = [
            float(r.get('hour_of_day', 12)) / 24.0,
            float(r.get('day_of_week', 0)) / 7.0,
            1.0 if r.get('is_violent', False) else 0.0,
            float(r.get('num_accused', 1)) / 10.0,
            float(r.get('num_victims', 1)) / 10.0,
            _crime_type_risk(r.get('crime_type', '')) / 10.0
        ]
        feature_vectors.append(vec)
    
    X = np.array(feature_vectors)
    model = IsolationForest(contamination=contamination, random_state=42)
    scores = model.fit_predict(X)
    anomaly_scores = model.score_samples(X)
    
    results = []
    for i, r in enumerate(crime_data):
        is_anomaly = scores[i] == -1
        normalized_score = 1.0 - (anomaly_scores[i] - anomaly_scores.min()) / \
                          (anomaly_scores.max() - anomaly_scores.min())
        results.append((r, round(float(normalized_score), 4), bool(is_anomaly)))
    
    return sorted(results, key=lambda x: x[1], reverse=True)


# ============================================================
# Model 4: MO Pattern Matching (Jaccard Similarity)
# ============================================================

def match_modus_operandi(target_mo, candidate_mos, threshold=0.15):
    """
    Find similar Modus Operandi using Jaccard similarity on word sets.
    
    Args:
        target_mo: Target MO description string
        candidate_mos: List of (id, mo_string) tuples
        threshold: Minimum similarity to include
    
    Returns:
        List of (id, similarity_score) sorted by similarity
    """
    target_words = set(str(target_mo).lower().split())
    if not target_words:
        return []
    
    results = []
    for cid, mo in candidate_mos:
        candidate_words = set(str(mo).lower().split())
        if not candidate_words:
            continue
        
        intersection = len(target_words & candidate_words)
        union = len(target_words | candidate_words)
        similarity = intersection / union if union > 0 else 0
        
        if similarity >= threshold:
            results.append((cid, round(similarity, 4)))
    
    return sorted(results, key=lambda x: x[1], reverse=True)


# ============================================================
# Predictive Crime Zone Identification
# ============================================================

def predict_high_risk_zones(hotspots, temporal_patterns, district_data):
    """
    Predict high-risk crime zones using hotspot + temporal + demographic data.
    
    Args:
        hotspots: Current hotspot clusters from DBSCAN
        temporal_patterns: Historical time-series patterns
        district_data: Socio-economic district data
    
    Returns:
        List of predicted risk zones with scores
    """
    risk_zones = []
    
    for hotspot in hotspots:
        center = hotspot['center']
        district = _find_district(center, district_data)
        
        # Base score from hotspot density
        base_risk = hotspot['density_score']
        
        # Temporal adjustment (time of day/day of week)
        temporal_factor = _temporal_risk_factor(temporal_patterns, hotspot['crime_types'])
        
        # Socio-economic adjustment
        socio_factor = _socio_risk_factor(district)
        
        # Composite risk score
        composite = base_risk * 0.4 + temporal_factor * 0.3 + socio_factor * 0.3
        
        risk_zones.append({
            'zone_id': hotspot['cluster_id'],
            'center': center,
            'radius_km': hotspot['radius_km'],
            'risk_score': round(min(composite * 10, 100), 1),
            'risk_level': 'HIGH' if composite > 7 else 'MEDIUM' if composite > 4 else 'LOW',
            'primary_crime_types': list(hotspot['crime_types'].keys())[:3],
            'contributing_factors': {
                'density_score': round(base_risk, 1),
                'temporal_score': round(temporal_factor, 1),
                'socio_economic_score': round(socio_factor, 1)
            },
            'recommended_patrol_hours': _recommend_hours(temporal_patterns, hotspot['crime_types'])
        })
    
    return sorted(risk_zones, key=lambda x: x['risk_score'], reverse=True)


# ============================================================
# Internal Helpers
# ============================================================

def _estimate_radius_km(lats, lngs):
    """Estimate cluster radius in km."""
    if len(lats) < 2:
        return 0.1
    lat_range = (max(lats) - min(lats)) * 111.0
    lng_range = (max(lngs) - min(lngs)) * 111.0 * \
                math.cos(math.radians(sum(lats) / len(lats)))
    return round(max(lat_range, lng_range) / 2, 2)


def _calculate_hotspot_severity(crime_types):
    """Calculate severity score from crime type distribution."""
    weights = {
        'Homicide': 10, 'Assault': 8, 'Robbery': 7,
        'Kidnapping': 8, 'Cybercrime': 6, 'Burglary': 5,
        'Theft': 3, 'Fraud': 4, 'Drug Trafficking': 7
    }
    total = sum(crime_types.values())
    if total == 0:
        return 'LOW'
    
    weighted = sum(weights.get(ct, 5) * count for ct, count in crime_types.items())
    avg = weighted / total
    
    if avg >= 7:
        return 'HIGH'
    elif avg >= 4:
        return 'MEDIUM'
    return 'LOW'


def _calculate_trend(dates):
    """Calculate crime trend from dates."""
    valid_dates = [d for d in dates if d]
    if len(valid_dates) < 2:
        return 'STABLE'
    
    try:
        parsed = [datetime.strptime(d[:10], '%Y-%m-%d') for d in valid_dates if len(d) >= 10]
        if len(parsed) < 2:
            return 'STABLE'
        
        mid = len(parsed) // 2
        first_half = len([d for d in parsed if d <= parsed[mid]])
        second_half = len([d for d in parsed if d > parsed[mid]])
        
        if second_half > first_half * 1.2:
            return 'RISING'
        elif second_half < first_half * 0.8:
            return 'DECLINING'
        return 'STABLE'
    except (ValueError, IndexError):
        return 'STABLE'


def _crime_type_risk(crime_type):
    """Map crime type to risk score 1-10."""
    return {
        'Homicide': 10, 'Kidnapping': 9, 'Assault': 8,
        'Robbery': 7, 'Human Trafficking': 9, 'Cybercrime': 6,
        'Burglary': 5, 'Theft': 3, 'Fraud': 4, 'Arson': 7,
        'Drug Trafficking': 8, 'Extortion': 6, 'Domestic Violence': 7
    }.get(crime_type, 5)


def _find_district(center, district_data):
    """Find which district a point belongs to (simplified)."""
    # In production, use geospatial lookup
    # For now, return first matching or nearest
    return district_data[0] if district_data else {}


def _temporal_risk_factor(temporal_patterns, crime_types):
    """Calculate temporal risk factor."""
    # Higher risk during evening/night for most crimes
    if not temporal_patterns:
        return 0.5
    
    # Get dominant crime type
    primary = max(crime_types.items(), key=lambda x: x[1])[0] if crime_types else ''
    night_crimes = ['Burglary', 'Assault', 'Robbery', 'Homicide']
    
    if primary in night_crimes:
        return 0.7
    return 0.5


def _socio_risk_factor(district):
    """Calculate socio-economic risk factor."""
    if not district:
        return 0.5
    
    poverty = float(district.get('poverty_index', 30))
    literacy = float(district.get('literacy_rate', 75))
    population = float(district.get('population', 1000000))
    
    poverty_factor = min(poverty / 100, 1.0)
    literacy_factor = 1.0 - min(literacy / 100, 1.0)
    density_factor = min(population / 5000000, 1.0)
    
    return (poverty_factor * 0.4 + literacy_factor * 0.3 + density_factor * 0.3)


def _recommend_hours(temporal_patterns, crime_types):
    """Recommend patrol hours based on patterns."""
    primary = max(crime_types.items(), key=lambda x: x[1])[0] if crime_types else ''
    
    night_time = ['Burglary', 'Robbery', 'Assault']
    if primary in night_time:
        return ['22:00-02:00', '02:00-06:00']
    elif primary == 'Theft':
        return ['10:00-14:00', '14:00-18:00']
    else:
        return ['18:00-22:00', '06:00-10:00']
