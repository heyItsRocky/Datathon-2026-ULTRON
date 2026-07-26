"""
ULTRON — Cyber Threat ML Models
ML models for cybersecurity threat detection, analysis, and correlation.
"""

import re
import numpy as np
from datetime import datetime
from collections import defaultdict


# ============================================================
# Model 5: IP Reputation Scoring
# ============================================================

class IPReputationModel:
    """
    Calculate IP reputation score (0 = benign, 100 = malicious).
    
    Factors:
    - Known bad IP feeds
    - Geographic anomaly
    - Historical threat association
    - WHOIS age
    - Reverse DNS anomalies
    - Connection patterns
    """
    
    def __init__(self):
        self.known_bad_ips = set()  # Would load from threat intel feeds
        self.reputation_cache = {}
    
    def score(self, ip_address, context=None):
        """Calculate reputation score for an IP."""
        score = 0.0
        
        # Check if in known bad IP list
        if ip_address in self.known_bad_ips:
            score += 40
        
        # Check for private/reserved ranges
        if self._is_private_ip(ip_address):
            score += 10  # Not inherently bad, but note it
        
        # Geographic anomaly check (if context provided)
        if context:
            expected_country = context.get('expected_country', 'IN')
            actual_country = context.get('actual_country', 'IN')
            if actual_country and actual_country != expected_country:
                score += 20
        
        # Pattern-based heuristics
        score += self._check_suspicious_patterns(ip_address, context)
        
        # Normalize to 0-100
        return min(max(score, 0), 100)
    
    def _is_private_ip(self, ip):
        """Check if IP is in private/reserved ranges."""
        try:
            parts = [int(p) for p in ip.split('.')]
            if parts[0] == 10: return True
            if parts[0] == 172 and 16 <= parts[1] <= 31: return True
            if parts[0] == 192 and parts[1] == 168: return True
            if parts[0] == 127: return True
            return False
        except (ValueError, IndexError):
            return False
    
    def _check_suspicious_patterns(self, ip, context=None):
        """Check for suspicious IP patterns."""
        score = 0
        
        if not context:
            return score
        
        # Check for known TOR exit nodes
        if context.get('is_tor_exit', False):
            score += 25
        
        # Check for known VPN/Proxy
        if context.get('is_vpn', False):
            score += 15
        
        # Check for datacenter IP (unusual for normal users)
        if context.get('is_datacenter', False):
            score += 10
        
        # Rapid reconnection attempts
        attempts = context.get('connection_attempts', 1)
        if attempts > 100:
            score += 20
        elif attempts > 50:
            score += 10
        
        # Port scanning behavior
        if context.get('port_scanning', False):
            score += 15
        
        return score


# ============================================================
# Model 6: Phishing Detection
# ============================================================

class PhishingDetector:
    """
    Detect phishing attempts in emails, URLs, and messages.
    
    Features:
    - URL structure analysis
    - Domain age and reputation
    - Content analysis (spelling, urgency, threats)
    - Sender authentication (SPF, DKIM, DMARC)
    - Visual similarity (homograph attacks)
    """
    
    def __init__(self):
        from sklearn.linear_model import SGDClassifier
        self.model = SGDClassifier(loss='log_loss', random_state=42)
        self.trained = False
    
    def train(self, samples):
        """Train phishing classifier on labeled samples."""
        if len(samples) < 20:
            self.trained = False
            return
        
        X = np.array([self._extract_features(s) for s in samples])
        y = np.array([1 if s.get('is_phishing', False) else 0 for s in samples])
        
        self.model.fit(X, y)
        self.trained = True
    
    def analyze_url(self, url):
        """Analyze a URL for phishing indicators."""
        score = 0.0
        indicators = []
        
        # Check for IP address instead of domain
        if re.match(r'https?://\d+\.\d+\.\d+\.\d+', url):
            score += 20
            indicators.append('IP address used instead of domain name')
        
        # Check for excessive subdomains
        domain = self._extract_domain(url)
        if domain and domain.count('.') > 3:
            score += 10
            indicators.append(f'Excessive subdomains: {domain}')
        
        # Check for suspicious TLDs
        suspicious_tlds = {'.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work'}
        for tld in suspicious_tlds:
            if domain and domain.endswith(tld):
                score += 25
                indicators.append(f'Suspicious TLD: {tld}')
        
        # Check for URL shorteners
        shorteners = {'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'tiny.cc', 'shorturl.at'}
        if domain in shorteners:
            score += 15
            indicators.append('URL shortener used')
        
        # Check for homograph characters (look-alike Unicode)
        if self._has_homograph_chars(url):
            score += 30
            indicators.append('Homograph attack characters detected')
        
        # Check for excessive special characters
        special_count = len(re.findall(r'[@\-_~!$&\'()*+,;=]', url))
        if special_count > 5:
            score += 10
            indicators.append(f'Excessive special characters ({special_count})')
        
        # Check for @ symbol in URL (user info field)
        if '@' in url.split('/')[2] if '/' in url else '@' in url:
            score += 25
            indicators.append('User info field (@) in URL')
        
        risk_level = 'HIGH' if score >= 50 else 'MEDIUM' if score >= 25 else 'LOW'
        
        return {
            'url': url,
            'phishing_score': min(round(score, 1), 100),
            'risk_level': risk_level,
            'indicators': indicators,
            'domain': domain,
            'domain_age_days': None  # Would require WHOIS lookup
        }
    
    def analyze_email(self, email_content):
        """Analyze email content for phishing indicators."""
        score = 0.0
        indicators = []
        
        content_lower = email_content.lower()
        
        # Urgency/threat language
        urgency_patterns = [
            r'urgent action required', r'account.*suspended', r'verify.*immediately',
            r'click.*link.*verify', r'password.*expired', r'security.*alert',
            r'limited.*access', r'update.*payment', r'suspicious.*activity',
            r'sign.*in.*verify', r'within 24 hours', r'failure to respond'
        ]
        for pattern in urgency_patterns:
            if re.search(pattern, content_lower):
                score += 10
                indicators.append(f'Urgency pattern: "{pattern}"')
        
        # Check for generic greetings
        if re.search(r'\bdear (customer|user|member|client|account)\b', content_lower):
            score += 5
            indicators.append('Generic greeting instead of personal name')
        
        # Check for multiple embedded URLs
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', email_content)
        if len(urls) > 3:
            score += 5
            indicators.append(f'Multiple embedded URLs ({len(urls)})')
        
        # Check for mismatched display URLs
        for url in urls:
            display_match = re.search(r'<a[^>]*>(.*?)</a>', email_content)
            if display_match:
                display_text = display_match.group(1)
                actual_domain = self._extract_domain(url)
                display_domain = self._extract_domain(display_text)
                if actual_domain and display_domain and actual_domain != display_domain:
                    score += 20
                    indicators.append(f'URL mismatch: shows {display_domain} but links to {actual_domain}')
        
        # Spelling and grammar (simplified)
        if self._has_poor_grammar(content_lower):
            score += 5
            indicators.append('Poor spelling/grammar')
        
        risk_level = 'HIGH' if score >= 50 else 'MEDIUM' if score >= 25 else 'LOW'
        
        return {
            'phishing_score': min(round(score, 1), 100),
            'risk_level': risk_level,
            'indicators': indicators,
            'urls_found': urls
        }
    
    def _extract_features(self, sample):
        """Extract feature vector from a sample."""
        url = sample.get('url', '')
        content = sample.get('content', '')
        
        features = [
            len(url) / 200.0,
            float(self._extract_domain(url) is not None),
            url.count('.') / 10.0,
            len(re.findall(r'[^a-zA-Z0-9/:.?=&]', url)) / 20.0,
            1.0 if re.match(r'https?://\d+\.\d+\.\d+\.\d+', url) else 0.0,
            len(content) / 2000.0,
            len(re.findall(r'https?://', content)) / 10.0,
            1.0 if re.search(r'urgent|immediately|verify|suspended', content.lower()) else 0.0,
            1.0 if '@' in url else 0.0,
            url.count('//') / 3.0
        ]
        return features
    
    def _extract_domain(self, url):
        """Extract domain from URL."""
        match = re.match(r'https?://([^/?#:]+)', url)
        if match:
            return match.group(1)
        match = re.match(r'(www\.[^/?#:]+)', url)
        if match:
            return match.group(1)
        return None
    
    def _has_homograph_chars(self, text):
        """Check for homograph attack characters."""
        homograph_ranges = [
            (0x0400, 0x04FF),  # Cyrillic
            (0x0370, 0x03FF),  # Greek
            (0x1F00, 0x1FFF),  # Greek Extended
        ]
        for char in text:
            code = ord(char)
            for start, end in homograph_ranges:
                if start <= code <= end:
                    return True
        return False
    
    def _has_poor_grammar(self, text):
        """Simplified grammar quality check."""
        indicators = ['grat', 'recieved', 'recieve', 'acount', 'maintainance',
                     'immediatly', 'neccessary', 'occured', 'occurence']
        for word in indicators:
            if word in text:
                return True
        return False


# ============================================================
# Model 7: Network Flow Anomaly Detection
# ============================================================

class NetworkFlowAnomalyDetector:
    """
    Detect anomalous network traffic patterns using Isolation Forest.
    
    Features:
    - Packets per second, bytes per second
    - Protocol distribution
    - Connection duration
    - Port diversity
    - Destination entropy
    - Time-of-day patterns
    """
    
    def __init__(self):
        from sklearn.ensemble import IsolationForest
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.trained = False
    
    def train(self, flow_data):
        """Train on baseline network flow data."""
        if len(flow_data) < 20:
            self.trained = False
            return
        
        X = np.array([self._extract_flow_features(f) for f in flow_data])
        self.model.fit(X)
        self.trained = True
    
    def detect(self, flow_records):
        """
        Detect anomalous flows.
        
        Returns:
            List of (record, anomaly_score, is_anomaly) sorted by score
        """
        if not flow_records:
            return []
        
        X = np.array([self._extract_flow_features(f) for f in flow_records])
        
        if self.trained:
            predictions = self.model.predict(X)
            scores = self.model.score_samples(X)
        else:
            # Fallback heuristic
            return self._heuristic_detection(flow_records)
        
        results = []
        for i, rec in enumerate(flow_records):
            is_anomaly = predictions[i] == -1
            normalized_score = 1.0 - (scores[i] - scores.min()) / (scores.max() - scores.min() + 0.001)
            results.append((rec, round(float(normalized_score), 4), bool(is_anomaly)))
        
        return sorted(results, key=lambda x: x[1], reverse=True)
    
    def _extract_flow_features(self, flow):
        """Extract numerical features from a flow record."""
        return [
            float(flow.get('packets_per_sec', 0)) / 10000.0,
            float(flow.get('bytes_per_sec', 0)) / 1000000.0,
            float(flow.get('duration_sec', 0)) / 3600.0,
            float(flow.get('port_count', 1)) / 100.0,
            float(flow.get('unique_destinations', 1)) / 50.0,
            1.0 if flow.get('is_encrypted', True) else 0.0,
            float(flow.get('hour_of_day', 12)) / 24.0,
            float(flow.get('syn_ratio', 0.5)),
            float(flow.get('small_packet_ratio', 0.1)),
            float(flow.get('tcp_ratio', 0.7))
        ]
    
    def _heuristic_detection(self, flow_records):
        """Fallback heuristic detection."""
        results = []
        for rec in flow_records:
            score = 0.0
            
            # High packet rate
            pps = float(rec.get('packets_per_sec', 0))
            if pps > 5000:
                score += 30
            elif pps > 1000:
                score += 15
            
            # High connection rate
            conn_rate = float(rec.get('connections_per_sec', 0))
            if conn_rate > 100:
                score += 25
            elif conn_rate > 50:
                score += 10
            
            # Unusual ports
            if rec.get('unusual_ports', False):
                score += 20
            
            # High SYN ratio (SYN flood)
            syn_ratio = float(rec.get('syn_ratio', 0))
            if syn_ratio > 0.9:
                score += 20
            
            # Low data-to-packet ratio
            small_pkt = float(rec.get('small_packet_ratio', 0))
            if small_pkt > 0.8:
                score += 15
            
            is_anomaly = score >= 30
            results.append((rec, round(min(score, 100) / 100.0, 4), is_anomaly))
        
        return sorted(results, key=lambda x: x[1], reverse=True)


# ============================================================
# Model 8: Attack Path Correlation (Graph-based)
# ============================================================

class AttackPathCorrelator:
    """
    Correlate attack paths and kill chain progression using graph analysis.
    
    Maps observed events to MITRE ATT&CK framework and identifies:
    - Attack campaign grouping
    - TTP (Tactics, Techniques, Procedures) correlation
    - Lateral movement paths
    - Privilege escalation sequences
    - Data exfiltration paths
    """
    
    def __init__(self):
        # MITRE ATT&CK kill chain order
        self.kill_chain = [
            'Reconnaissance', 'Resource Development', 'Initial Access',
            'Execution', 'Persistence', 'Privilege Escalation',
            'Defense Evasion', 'Credential Access', 'Discovery',
            'Lateral Movement', 'Collection', 'Command and Control',
            'Exfiltration', 'Impact'
        ]
        
        # Attack graph (nodes = hosts, edges = attack steps)
        self.graph = defaultdict(list)
    
    def correlate(self, threat_events):
        """
        Correlate threat events into attack paths.
        
        Args:
            threat_events: List of threat event dicts with source_ip,
                         target_ip, technique, timestamp, etc.
        
        Returns:
            Attack path analysis with graphs and kill chain progression
        """
        # Build attack graph
        for event in threat_events:
            src = event.get('source_ip', 'unknown')
            dst = event.get('target_ip', 'unknown')
            technique = event.get('mitre_technique', 'Unknown')
            tactic = event.get('mitre_tactic', 'Unknown')
            timestamp = event.get('timestamp', '')
            
            self.graph[src].append({
                'target': dst,
                'technique': technique,
                'tactic': tactic,
                'timestamp': timestamp,
                'severity': event.get('severity', 'Medium')
            })
        
        # Find attack campaigns (time-bounded event clusters)
        campaigns = self._find_campaigns(threat_events)
        
        # Analyze lateral movement paths
        lateral_paths = self._find_lateral_movement()
        
        # Determine kill chain progression
        kill_chain_progress = self._analyze_kill_chain(threat_events)
        
        # Identify crown jewel targets (most connected nodes)
        crown_jewels = self._find_crown_jewels()
        
        return {
            'campaigns': campaigns,
            'lateral_movement_paths': lateral_paths,
            'kill_chain_progress': kill_chain_progress,
            'crown_jewel_targets': crown_jewels,
            'graph_nodes': self._get_graph_summary(),
            'total_events': len(threat_events),
            'unique_sources': len(set(e.get('source_ip') for e in threat_events)),
            'unique_targets': len(set(e.get('target_ip') for e in threat_events))
        }
    
    def _find_campaigns(self, events, time_window_minutes=60):
        """Group events into attack campaigns by time proximity."""
        if not events:
            return []
        
        # Sort by timestamp
        sorted_events = sorted(events, key=lambda e: e.get('timestamp', ''))
        
        campaigns = []
        current = []
        for event in sorted_events:
            if not current:
                current.append(event)
                continue
            
            try:
                current_time = datetime.fromisoformat(event.get('timestamp', '').replace('Z', '+00:00'))
                last_time = datetime.fromisoformat(current[-1].get('timestamp', '').replace('Z', '+00:00'))
                diff_minutes = (current_time - last_time).total_seconds() / 60
            except (ValueError, TypeError):
                diff_minutes = time_window_minutes + 1
            
            if diff_minutes <= time_window_minutes:
                current.append(event)
            else:
                if len(current) >= 2:
                    campaigns.append(self._summarize_campaign(current))
                current = [event]
        
        if len(current) >= 2:
            campaigns.append(self._summarize_campaign(current))
        
        return campaigns
    
    def _summarize_campaign(self, events):
        """Summarize a group of related events."""
        techniques = set()
        sources = set()
        targets = set()
        
        for e in events:
            techniques.add(e.get('mitre_technique', 'Unknown'))
            sources.add(e.get('source_ip', 'unknown'))
            targets.add(e.get('target_ip', 'unknown'))
        
        return {
            'event_count': len(events),
            'duration_minutes': self._calc_duration_minutes(events),
            'unique_techniques': list(techniques),
            'source_ips': list(sources),
            'target_ips': list(targets),
            'primary_tactic': self._find_primary_tactic(events),
            'severity': self._calc_campaign_severity(events)
        }
    
    def _find_lateral_movement(self):
        """Find lateral movement paths in the attack graph."""
        paths = []
        
        for src, edges in self.graph.items():
            for edge in edges:
                dst = edge['target']
                if dst in self.graph:
                    # This node also attacked others — potential pivot
                    for next_edge in self.graph[dst]:
                        paths.append({
                            'path': f"{src} → {dst} → {next_edge['target']}",
                            'hop1_technique': edge['technique'],
                            'hop2_technique': next_edge['technique'],
                            'depth': 2
                        })
        
        return sorted(paths, key=lambda x: x['depth'], reverse=True)[:10]
    
    def _analyze_kill_chain(self, events):
        """Map observed tactics to kill chain stages."""
        observed_tactics = set(e.get('mitre_tactic', '') for e in events)
        
        progress = []
        for stage in self.kill_chain:
            if stage in observed_tactics:
                techniques = list(set(
                    e.get('mitre_technique', '')
                    for e in events
                    if e.get('mitre_tactic') == stage
                ))
                progress.append({
                    'stage': stage,
                    'reached': True,
                    'techniques_observed': techniques,
                    'event_count': sum(1 for e in events if e.get('mitre_tactic') == stage)
                })
            else:
                progress.append({'stage': stage, 'reached': False})
        
        # Count stages reached
        stages_reached = sum(1 for p in progress if p['reached'])
        completion = round((stages_reached / len(self.kill_chain)) * 100, 1)
        
        return {
            'stages': progress,
            'stages_reached': stages_reached,
            'total_stages': len(self.kill_chain),
            'completion_percentage': completion,
            'current_stage': self._find_current_stage(progress)
        }
    
    def _find_crown_jewels(self):
        """Find most targeted/connected assets."""
        target_counts = defaultdict(int)
        for src, edges in self.graph.items():
            for edge in edges:
                target_counts[edge['target']] += 1
        
        return [
            {'target_ip': ip, 'attack_count': count}
            for ip, count in sorted(target_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
    
    def _get_graph_summary(self):
        return {
            'unique_source_ips': len(self.graph),
            'unique_target_ips': len(set(
                e['target'] for edges in self.graph.values() for e in edges
            )),
            'total_edges': sum(len(edges) for edges in self.graph.values())
        }
    
    def _calc_duration_minutes(self, events):
        try:
            times = []
            for e in events:
                ts = e.get('timestamp', '')
                if ts:
                    times.append(datetime.fromisoformat(ts.replace('Z', '+00:00')))
            if times:
                return round((max(times) - min(times)).total_seconds() / 60, 1)
        except (ValueError, TypeError):
            pass
        return 0
    
    def _find_primary_tactic(self, events):
        tactics = defaultdict(int)
        for e in events:
            tactics[e.get('mitre_tactic', 'Unknown')] += 1
        return max(tactics, key=tactics.get) if tactics else 'Unknown'
    
    def _calc_campaign_severity(self, events):
        severities = {'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1}
        avg = sum(severities.get(e.get('severity', 'Medium'), 2) for e in events) / len(events)
        if avg >= 3.5: return 'Critical'
        if avg >= 2.5: return 'High'
        if avg >= 1.5: return 'Medium'
        return 'Low'
    
    def _find_current_stage(self, progress):
        for stage in reversed(progress):
            if stage['reached']:
                return stage['stage']
        return 'None'
