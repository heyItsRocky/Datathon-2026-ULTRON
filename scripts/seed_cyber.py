#!/usr/bin/env python3
"""
ULTRON — Synthetic Cyber Threat Data Generator
Generates realistic cybersecurity threat data for Catalyst Data Store seeding.

Usage:
    python seed_cyber.py                     # Generate all, print JSON
    python seed_cyber.py --threats 200       # Generate 200 threats
    python seed_cyber.py --output threats.json  # Save to file
"""

import json
import random
import uuid
from datetime import datetime, timedelta

# ===== Configuration =====
NUM_THREATS = 200
NUM_IOCS = 500

# ===== Data Pools =====

THREAT_TYPES = [
    "Phishing", "Malware", "Ransomware", "DDoS", "Data Breach",
    "SQL Injection", "Social Engineering", "Man-in-the-Middle",
    "Zero-Day Exploit", "Credential Stuffing", "DNS Spoofing",
    "IoT Botnet", "Advanced Persistent Threat", "Web Application Attack",
    "Insider Threat", "Supply Chain Attack"
]

SEVERITIES = ["Critical", "High", "Medium", "Low"]
SEVERITY_WEIGHTS = [15, 30, 40, 15]

THREAT_STATUSES = ["Active", "Mitigated", "Investigating", "False Positive"]

MITRE_TACTICS = [
    "Initial Access", "Execution", "Persistence", "Privilege Escalation",
    "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
    "Collection", "Command and Control", "Exfiltration", "Impact"
]

MITRE_TECHNIQUES = {
    "Phishing": ["T1566", "T1566.001", "T1566.002", "T1566.003"],
    "Malware": ["T1204", "T1204.002", "T1059", "T1059.001"],
    "Ransomware": ["T1486", "T1485", "T1490"],
    "DDoS": ["T1498", "T1499", "T1499.004"],
    "Data Breach": ["T1530", "T1213", "T1213.002"],
    "SQL Injection": ["T1190", "T1190.001"],
    "Social Engineering": ["T1598", "T1598.001"],
    "Man-in-the-Middle": ["T1557", "T1557.001"],
    "Zero-Day Exploit": ["T1204", "T1190"],
    "Credential Stuffing": ["T1110", "T1110.001", "T1110.003"],
    "DNS Spoofing": ["T1557", "T1557.002"],
    "IoT Botnet": ["T1213", "T1498"],
    "Advanced Persistent Threat": ["T1583", "T1583.001", "T1584", "T1584.001"],
    "Web Application Attack": ["T1190", "T1505", "T1505.003"],
    "Insider Threat": ["T1557", "T1567"],
    "Supply Chain Attack": ["T1195", "T1195.001", "T1195.002"]
}

ATTACK_VECTORS = {
    "Phishing": ["Email", "SMS", "Social Media", "Messaging App"],
    "Malware": ["Email Attachment", "Drive-by Download", "USB", "Software Bundle"],
    "Ransomware": ["Email", "RDP", "Software Vulnerability", "Drive-by Download"],
    "DDoS": ["Botnet", "Amplification", "Application Layer"],
    "Data Breach": ["Exposed API", "Weak Credentials", "Insider", "Third-party"],
    "SQL Injection": ["Web Form", "URL Parameter", "API Endpoint"],
    "Social Engineering": ["Phone Call", "Email", "In Person", "SMS"],
    "Man-in-the-Middle": ["WiFi Spoofing", "DNS Poisoning", "ARP Spoofing"],
    "Zero-Day Exploit": ["Network Service", "Browser", "Application"],
    "Credential Stuffing": ["Login Portal", "API", "VPN"],
    "DNS Spoofing": ["DNS Cache", "DNS Server"],
    "IoT Botnet": ["Default Credentials", "Telnet", "SSH"],
    "Advanced Persistent Threat": ["Multiple Vectors", "Spear Phishing", "Watering Hole"],
    "Web Application Attack": ["XSS", "CSRF", "SSRF", "File Upload"],
    "Insider Threat": ["Authorized Access", "Privilege Abuse", "Data Theft"],
    "Supply Chain Attack": ["Compromised Library", "Malicious Update", "Third-party Vendor"]
}

IOC_TYPES = ["IP", "Domain", "Hash", "URL", "Email", "Registry Key"]

MALICIOUS_URLS = [
    "http://malicious-site.tk/login",
    "http://phishing-portal.ml/verify",
    "https://secure-banking.xyz/account",
    "http://free-offers.club/win",
    "https://account-verify.work/check",
    "http://download-free.ga/setup",
    "https://update-software.cf/patch",
    "http://tracking-id.club/click",
    "https://reset-password.top/change",
    "http://secure-login.gq/auth"
]

MALICIOUS_DOMAINS = [
    "malicious-site.tk", "phishing-portal.ml", "secure-banking.xyz",
    "free-offers.club", "account-verify.work", "download-free.ga",
    "update-software.cf", "tracking-id.club", "reset-password.top",
    "secure-login.gq", "badhost.top", "evil-server.work",
    "phish-bait.xyz", "malware-dist.tk", "ransom-c2.ml"
]

MALICIOUS_EMAILS = [
    "admin@malicious-site.tk", "verify@phishing-portal.ml", "support@secure-banking.xyz",
    "winner@free-offers.club", "alert@account-verify.work", "no-reply@malware-dist.tk",
    "security@phish-bait.xyz", "info@evil-server.work"
]

TARGET_SYSTEMS = [
    "Web Application", "Email Server", "Database Server", "Active Directory",
    "File Server", "DNS Server", "ERP System", "CRM Portal",
    "Banking Portal", "Government Portal", "Cloud Storage", "Internal Network",
    "VPN Gateway", "Firewall", "Load Balancer", "IoT Device"
]

DETECTION_METHODS = [
    "IDS/IPS Alert", "SIEM Correlation", "Endpoint Detection", "Network Traffic Analysis",
    "User Report", "Log Analysis", "Threat Intelligence Feed", "Anomaly Detection",
    "Honeypot Alert", "Dark Web Monitoring", "Vulnerability Scan", "Penetration Test"
]

DISTRICTS = [
    "Bengaluru Urban", "Mysuru", "Belagavi", "Dharwad", "Dakshina Kannada",
    "Kalaburagi", "Shivamogga", "Tumakuru", "Ballari", "Udupi"
]

DEPARTMENTS = [
    "IT Infrastructure", "Finance", "Administration", "Operations",
    "Human Resources", "Legal", "Communications", "Research"
]

TECHNIQUE_DESCRIPTIONS = {
    "T1566": "Spearphishing attachment - targeted email with malicious attachment",
    "T1566.001": "Spearphishing attachment with Office document macro",
    "T1204": "User executed malicious file",
    "T1486": "Data encrypted for impact - ransomware",
    "T1190": "Exploit public-facing application",
    "T1110": "Brute force credential access",
    "T1498": "Network Denial of Service",
    "T1557": "Man-in-the-Middle attack on network",
    "T1213": "Data from information repositories",
    "T1598": "Phishing for information gathering",
    "T1530": "Data from cloud storage object"
}

DESCRIPTIONS = [
    "Suspicious network traffic detected from external IP targeting internal web server.",
    "User reported receiving a phishing email requesting credential verification.",
    "Multiple failed login attempts detected from unusual geographic location.",
    "Endpoint protection flagged a malicious file downloaded from the internet.",
    "DNS query patterns suggest possible data exfiltration to known C2 server.",
    "Unusual outbound traffic detected during non-business hours.",
    "Port scan activity detected from external IP across multiple internal hosts.",
    "SIEM correlation alerted on possible ransomware behavioral indicators.",
    "Dark web monitoring identified stolen credentials belonging to organization.",
    "Vulnerability scan revealed critical unpatched service on public-facing server.",
    "Honeypot system detected reconnaissance activity from unknown threat actor.",
    "User reported unusual system behavior consistent with malware infection."
]


def random_threat_type():
    return random.choice(THREAT_TYPES)


def random_severity():
    return random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS, k=1)[0]


def random_date(start_year=2025, end_year=2026):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 7, 1)
    delta = end - start
    random_days = random.randint(0, delta.days)
    hours = random.randint(0, 23)
    minutes = random.randint(0, 59)
    return (start + timedelta(days=random_days, hours=hours, minutes=minutes)).strftime('%Y-%m-%dT%H:%M:%S+05:30')


def generate_threat(threat_id):
    """Generate a single threat record."""
    threat_type = random_threat_type()
    severity = random_severity()
    date = random_date()
    
    # Get MITRE technique for this threat type
    techniques = MITRE_TECHNIQUES.get(threat_type, ["T1204"])
    technique = random.choice(techniques)
    
    # Map technique to tactic
    tactic = random.choice(MITRE_TACTICS)
    
    # Get attack vector
    vector = random.choice(ATTACK_VECTORS.get(threat_type, ["Unknown"]))
    
    # Generate random IP
    src_ip = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"
    
    description = random.choice(DESCRIPTIONS)
    
    return {
        "THREAT_ID": threat_id,
        "THREAT_TYPE": threat_type,
        "SEVERITY": severity,
        "SOURCE_IP": src_ip,
        "TARGET_SYSTEM": random.choice(TARGET_SYSTEMS),
        "TIMESTAMP": date,
        "STATUS": random.choice(THREAT_STATUSES),
        "DESCRIPTION": description,
        "IOCs": json.dumps([]),  # Populated in separate IOC table
        "ATTACK_VECTOR": vector,
        "MITRE_TACTIC": tactic,
        "MITRE_TECHNIQUE": f"{technique} - {TECHNIQUE_DESCRIPTIONS.get(technique, 'General technique')}",
        "DETECTED_BY": random.choice(DETECTION_METHODS),
        "DISTRICT": random.choice(DISTRICTS),
        "DEPARTMENT": random.choice(DEPARTMENTS)
    }


def generate_ioc(ioc_id, threat_ids):
    """Generate a single IOC record linked to a threat."""
    ioc_type = random.choice(IOC_TYPES)
    
    if ioc_type == "IP":
        value = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"
    elif ioc_type == "Domain":
        value = random.choice(MALICIOUS_DOMAINS)
    elif ioc_type == "Hash":
        value = random.choice([
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "5d41402abc4b2a76b9719d911017c592",  # MD5
            "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"  # SHA1
        ]) + f"{random.randint(0, 999999):06d}"
    elif ioc_type == "URL":
        value = random.choice(MALICIOUS_URLS)
    elif ioc_type == "Email":
        value = random.choice(MALICIOUS_EMAILS)
    else:
        value = f"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Malicious_{random.randint(1000, 9999)}"
    
    # Create confidence score
    confidence = random.randint(40, 100)
    
    return {
        "IOC_ID": ioc_id,
        "THREAT_ID": random.choice(threat_ids),
        "IOC_TYPE": ioc_type,
        "IOC_VALUE": value,
        "CONFIDENCE": confidence,
        "FIRST_SEEN": random_date(2025, 2026),
        "LAST_SEEN": random_date(2025, 2026),
        "TAGS": json.dumps([random.choice(["phishing", "malware", "c2", "scanner", "botnet", "ransomware", "apt"])])
    }


def generate_all():
    """Generate all cyber threat data."""
    print("Generating synthetic cyber threat data for KSP Datathon 2026 — ULTRON")
    print("=" * 60)
    
    # Generate threats
    threats = []
    threat_ids = []
    for i in range(NUM_THREATS):
        tid = f"THREAT-{random.randint(100000, 999999)}"
        threat_ids.append(tid)
        threats.append(generate_threat(tid))
    print(f"✅ Generated {len(threats)} threat records")
    
    # Generate IOCs
    iocs = []
    for i in range(NUM_IOCS):
        iid = f"IOC-{random.randint(1000000, 9999999)}"
        iocs.append(generate_ioc(iid, threat_ids))
    print(f"✅ Generated {len(iocs)} IOC records")
    
    return {
        "threats": threats,
        "iocs": iocs,
        "summary": {
            "total_threats": len(threats),
            "total_iocs": len(iocs),
            "by_type": {tt: sum(1 for t in threats if t["THREAT_TYPE"] == tt) for tt in THREAT_TYPES},
            "by_severity": {s: sum(1 for t in threats if t["SEVERITY"] == s) for s in SEVERITIES},
            "critical_count": sum(1 for t in threats if t["SEVERITY"] == "Critical"),
            "active_count": sum(1 for t in threats if t["STATUS"] == "Active")
        }
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate synthetic cyber threat data')
    parser.add_argument('--threats', type=int, default=200, help='Number of threat records')
    parser.add_argument('--iocs', type=int, default=500, help='Number of IOC records')
    parser.add_argument('--output', type=str, help='Output file (default: stdout)')
    
    args = parser.parse_args()
    
    global NUM_THREATS, NUM_IOCS
    if args.threats:
        NUM_THREATS = args.threats
    if args.iocs:
        NUM_IOCS = args.iocs
    
    data = generate_all()
    
    output = json.dumps(data, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"\n✅ Saved to {args.output}")
    else:
        print("\n" + "=" * 60)
        print("SUMMARY")
        s = data["summary"]
        print(f"Threats: {s['total_threats']}, IOCs: {s['total_iocs']}")
        print(f"Critical: {s['critical_count']}, Active: {s['active_count']}")
        print("\nFull JSON data below:\n")
        print(output)


if __name__ == "__main__":
    main()
