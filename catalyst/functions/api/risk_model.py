"""
ULTRON — Recidivism & Risk Scoring Model
Combined risk assessment using Random Forest + heuristic scoring.
"""

from models import RecidivismRiskModel


class CombinedRiskScorer:
    """
    Unified risk scoring that combines:
    - Recidivism risk (ML)
    - Crime severity score
    - Network influence score
    - Geographic threat score
    """
    
    def __init__(self):
        self.recidivism_model = RecidivismRiskModel()
        self.criminal_cache = {}
    
    def score_criminal(self, criminal, case_history=None):
        """Calculate comprehensive risk score for a criminal."""
        # Recidivism risk
        recidivism = self.recidivism_model.predict(criminal)
        
        # Severity score based on crime type
        severity = self._crime_severity(criminal.get('primary_crime_type', ''))
        
        # Network influence
        network_score = self._network_influence(criminal.get('network_density', 0))
        
        # Geographic threat
        geo_score = self._geo_threat(criminal)
        
        # Composite
        composite = (
            recidivism * 0.3 +
            severity * 0.25 +
            network_score * 0.25 +
            geo_score * 0.2
        )
        
        return {
            'criminal_id': criminal.get('CRIMINAL_ID', ''),
            'name': criminal.get('NAME', 'Unknown'),
            'overall_risk_score': round(composite, 1),
            'risk_level': 'CRITICAL' if composite >= 75 else 'HIGH' if composite >= 50 else 'MEDIUM' if composite >= 25 else 'LOW',
            'components': {
                'recidivism_risk': round(recidivism, 1),
                'crime_severity': round(severity, 1),
                'network_influence': round(network_score, 1),
                'geographic_threat': round(geo_score, 1)
            },
            'recommended_action': self._recommend_action(composite, criminal)
        }
    
    def batch_score(self, criminals):
        """Score multiple criminals."""
        return [self.score_criminal(c) for c in criminals]
    
    def _crime_severity(self, crime_type):
        return {
            'Homicide': 90, 'Kidnapping': 85, 'Human Trafficking': 85,
            'Assault': 70, 'Robbery': 65, 'Arson': 60,
            'Drug Trafficking': 60, 'Cybercrime': 55, 'Extortion': 50,
            'Burglary': 40, 'Fraud': 35, 'Theft': 25, 'Domestic Violence': 45
        }.get(crime_type, 30)
    
    def _network_influence(self, density):
        return min(float(density) * 100, 100)
    
    def _geo_threat(self, criminal):
        # Simplified — would use district crime rate data
        return 30.0
    
    def _recommend_action(self, score, criminal):
        if score >= 75:
            return "Immediate intervention required. Consider preventive detention and intensified surveillance."
        elif score >= 50:
            return "Enhanced monitoring. Regular check-ins and restricted movement recommended."
        elif score >= 25:
            return "Standard monitoring. Periodic status checks."
        return "Low priority. Routine observation only."
