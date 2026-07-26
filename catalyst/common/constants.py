"""
ULTRON — Catalyst Common Constants
Table names, status enums, and shared configuration values.
"""

import os

# ===== Data Store Table Names (Existing 8 flat tables) =====
TABLE_CRIMES = "Crimes"
TABLE_CRIMINALS = "Criminals"
TABLE_CRIME_LINKS = "CrimeCriminalLinks"
TABLE_DISTRICTS = "Districts"
TABLE_THREATS = "CyberThreats"
TABLE_IOCS = "CyberIndicators"
TABLE_USERS = "Users"
TABLE_AUDIT = "AuditLogs"

# ===== Data Store Table Names (New 26 normalized tables) =====
TABLE_STATE = "State"
TABLE_DISTRICT = "District"
TABLE_UNIT_TYPE = "UnitType"
TABLE_UNIT = "Unit"
TABLE_RANK = "Rank"
TABLE_DESIGNATION = "Designation"
TABLE_EMPLOYEE = "Employee"
TABLE_CASE_CATEGORY = "CaseCategory"
TABLE_GRAVITY_OFFENCE = "GravityOffence"
TABLE_CASE_STATUS_MASTER = "CaseStatusMaster"
TABLE_COURT = "Court"
TABLE_CRIME_HEAD = "CrimeHead"
TABLE_CRIME_SUBHEAD = "CrimeSubHead"
TABLE_ACT = "Act"
TABLE_SECTION = "Section"
TABLE_CASE_MASTER = "CaseMaster"
TABLE_COMPLAINANT = "ComplainantDetails"
TABLE_VICTIM = "Victim"
TABLE_ACCUSED = "Accused"
TABLE_ARREST_SURRENDER = "ArrestSurrender"
TABLE_ACT_SECTION_ASSOC = "ActSectionAssociation"
TABLE_CHARGESHEET = "ChargesheetDetails"
TABLE_CASTE = "CasteMaster"
TABLE_RELIGION = "ReligionMaster"
TABLE_OCCUPATION = "OccupationMaster"
TABLE_CRIME_HEAD_ACT_SECTION = "CrimeHeadActSection"

# All 34 tables for seeding
ALL_TABLES = [
    TABLE_STATE, TABLE_DISTRICT, TABLE_UNIT_TYPE, TABLE_UNIT,
    TABLE_RANK, TABLE_DESIGNATION, TABLE_EMPLOYEE,
    TABLE_CASE_CATEGORY, TABLE_GRAVITY_OFFENCE, TABLE_CASE_STATUS_MASTER,
    TABLE_COURT, TABLE_CRIME_HEAD, TABLE_CRIME_SUBHEAD,
    TABLE_ACT, TABLE_SECTION, TABLE_CASE_MASTER,
    TABLE_COMPLAINANT, TABLE_VICTIM, TABLE_ACCUSED,
    TABLE_ARREST_SURRENDER, TABLE_ACT_SECTION_ASSOC, TABLE_CHARGESHEET,
    TABLE_CASTE, TABLE_RELIGION, TABLE_OCCUPATION, TABLE_CRIME_HEAD_ACT_SECTION,
    # Existing flat tables (for ML backward compat)
    TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS, TABLE_DISTRICTS,
    TABLE_THREATS, TABLE_IOCS, TABLE_USERS, TABLE_AUDIT,
]

# ===== Crime Types =====
CRIME_TYPES = [
    "Theft", "Burglary", "Robbery", "Assault", "Homicide",
    "Cybercrime", "Fraud", "Drug Trafficking", "Human Trafficking",
    "Domestic Violence", "Kidnapping", "Vehicle Theft",
    "Extortion", "Money Laundering", "Arson"
]

# ===== Cyber Threat Types =====
CYBER_THREAT_TYPES = [
    "Phishing", "Malware", "Ransomware", "DDoS", "Data Breach",
    "SQL Injection", "Social Engineering", "Man-in-the-Middle",
    "Zero-Day Exploit", "Credential Stuffing", "DNS Spoofing",
    "IoT Botnet", "Advanced Persistent Threat"
]

# ===== Crime Status =====
CRIME_STATUS = [
    "Under Investigation",
    "Charge Sheet Filed",
    "Under Trial",
    "Convicted",
    "Closed",
    "Cold Case"
]

# ===== Threat Severity =====
THREAT_SEVERITY = ["Critical", "High", "Medium", "Low"]

# ===== Threat Status =====
THREAT_STATUS = ["Active", "Mitigated", "Investigating", "False Positive"]

# ===== MITRE ATT&CK Tactics (Cyber) =====
MITRE_TACTICS = [
    "Initial Access", "Execution", "Persistence", "Privilege Escalation",
    "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
    "Collection", "Command and Control", "Exfiltration", "Impact"
]

# ===== IOC Types =====
IOC_TYPES = ["IP", "Domain", "Hash", "URL", "Email", "Registry Key"]

# ===== User Roles =====
USER_ROLES = ["admin", "investigator", "viewer"]

# ===== Criminal Status =====
CRIMINAL_STATUS = ["Active", "Incarcerated", "Parole", "Deceased", "Unknown"]

# ===== Risk Levels =====
RISK_LEVELS = ["Low", "Medium", "High", "Critical"]

# ===== Karnataka Districts =====
KARNATAKA_DISTRICTS = [
    "Belagavi", "Ballari", "Vijayapura", "Kalaburagi", "Bidar",
    "Raichur", "Koppal", "Gadag", "Dharwad", "Haveri",
    "Uttara Kannada", "Shivamogga", "Chikkamagaluru", "Dakshina Kannada",
    "Udupi", "Kodagu", "Mysuru", "Mandya", "Ramanagara",
    "Chamarajanagar", "Tumakuru", "Chitradurga", "Davangere",
    "Bengaluru Urban", "Bengaluru Rural", "Kolar", "Chikkaballapura",
    "Yadgir", "Hassan", "Bagalkote"
]

# ===== Case Categories =====
CASE_CATEGORIES = ["FIR", "UDR", "PAR", "Zero FIR"]

# ===== Gravity Offences =====
GRAVITY_OFFENCES = ["Heinous", "Non-Heinous", "Serious"]

# ===== Case Statuses (master) =====
CASE_STATUSES = ["Under Investigation", "Charge Sheeted", "Closed", "Pending Trial", "Acquitted"]

# ===== Unit Types =====
UNIT_TYPES = [
    ("Police Station", "District", 3),
    ("Circle Office", "District", 2),
    ("SP Office", "District", 1),
    ("Commissioner Office", "City", 0),
]

# ===== Police Ranks =====
RANKS = [
    ("Constable", 8), ("Head Constable", 7), ("ASI", 6),
    ("SI", 5), ("Inspector", 4), ("DSP", 3), ("SP", 2), ("DGP", 1),
]

# ===== Designations =====
DESIGNATIONS = [
    ("Investigating Officer", 1), ("SHO", 2), ("SP", 3),
    ("Commissioner", 4), ("DGP", 5),
]

# ===== Crime Heads =====
CRIME_HEADS = [
    "Crimes Against Body", "Crimes Against Property", "Crimes Against Women",
    "Crimes Against Children", "Cyber Crimes", "Economic Offences",
    "Crimes Against State", "Other Crimes",
]

CRIME_SUBHEADS = {
    "Crimes Against Body": ["Murder", "Attempt to Murder", "Grievous Hurt", "Assault"],
    "Crimes Against Property": ["Robbery", "Burglary", "Theft", "Vehicle Theft", "Extortion"],
    "Crimes Against Women": ["Rape", "Sexual Harassment", "Dowry Death", "Domestic Violence"],
    "Crimes Against Children": ["Child Labour", "Child Marriage", "Kidnapping", "POCSO"],
    "Cyber Crimes": ["Phishing", "Identity Theft", "Online Fraud", "Cyber Stalking"],
    "Economic Offences": ["Money Laundering", "Tax Evasion", "Bank Fraud", "Counterfeiting"],
    "Crimes Against State": ["Sedition", "Terrorism", "Espionage"],
    "Other Crimes": ["Drug Trafficking", "Human Trafficking", "Arson", "Poaching"],
}

# ===== Legal Acts =====
ACTS = {
    "IPC": "Indian Penal Code, 1860",
    "BNS": "Bharatiya Nyaya Sanhita, 2023",
    "CrPC": "Code of Criminal Procedure, 1973",
    "NDPS": "Narcotic Drugs and Psychotropic Substances Act, 1985",
    "IT Act": "Information Technology Act, 2000",
    "POCSO": "Protection of Children from Sexual Offences Act, 2012",
    "DW Act": "Dowry Prohibition Act, 1961",
}

SECTIONS = {
    "IPC": ["302", "307", "323", "324", "326", "376", "392", "394", "395", "397",
            "420", "436", "452", "454", "457", "498A", "504", "506", "509", "511"],
    "BNS": ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110"],
    "NDPS": ["8", "15", "18", "20", "21", "22", "23", "25", "27", "28"],
    "IT Act": ["43", "66", "66B", "66C", "66D", "66E", "66F", "67", "67A", "67B"],
    "POCSO": ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    "DW Act": ["2", "3", "4", "5", "6"],
}

# ===== Occupations =====
OCCUPATIONS = [
    "Farmer", "Government Employee", "Private Employee", "Business Owner",
    "Student", "Teacher", "Doctor", "Lawyer", "Engineer",
    "Housewife", "Retired", "Unemployed", "Daily Wage Worker",
    "Shopkeeper", "Driver",
]

# ===== Religions =====
RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"]

# ===== Castes =====
CASTES = [
    "Brahmins", "Vokkaliga", "Lingayat", "Kuruba", "SC", "ST",
    "Jain", "Kodava", "Bunt", "Mogaveera", "Billava", "Gowda",
    "Reddy", "Naik", "Maratha",
]

# ===== Catalyst Auth Helper =====
def get_auth_user(request=None, context=None):
    """Extract authenticated user from Catalyst context or request headers.

    Catalyst API Gateway injects auth info into the request at the gateway level.
    For development/testing, falls back to MOCK_MODE or request headers.
    """
    # ponytail: Catalyst auth is gateway-level; this is a thin reader.
    # Full RBAC integration: check user_details from Catalyst context object.
    mock = os.environ.get('MOCK_MODE', 'true').lower() == 'true'

    if mock:
        return {
            'user_id': 'U001',
            'name': 'Admin User',
            'email': 'admin@ksp.gov.in',
            'role': 'admin',
            'auth_provider': 'mock'
        }

    # Try Catalyst context user_details
    if context is not None and hasattr(context, 'user_details') and context.user_details:
        ud = context.user_details
        return {
            'user_id': ud.get('user_id', ''),
            'name': ud.get('first_name', '') + ' ' + ud.get('last_name', ''),
            'email': ud.get('email_id', ''),
            'role': ud.get('role', 'viewer'),
            'auth_provider': 'catalyst'
        }

    # Fallback to request headers (API Gateway injects X-Catalyst-* headers)
    if request:
        headers = request.get('headers', {}) or {}
        user_id = headers.get('X-Catalyst-User-Id', '')
        if user_id:
            return {
                'user_id': user_id,
                'name': headers.get('X-Catalyst-User-Name', 'Unknown'),
                'email': headers.get('X-Catalyst-User-Email', ''),
                'role': headers.get('X-Catalyst-User-Role', 'viewer'),
                'auth_provider': 'gateway'
            }

    return {
        'user_id': '',
        'name': 'Anonymous',
        'email': '',
        'role': 'viewer',
        'auth_provider': 'none'
    }


def require_role(required_role):
    """Decorator-like helper: checks if user has required role.

    Usage: user = get_auth_user(request, context); err = require_role('admin')(user)
    Returns error response dict if unauthorized, None if allowed.
    """
    def check(user):
        role_hierarchy = {'viewer': 0, 'investigator': 1, 'admin': 2}
        user_level = role_hierarchy.get(user.get('role', 'viewer'), 0)
        required_level = role_hierarchy.get(required_role, 0)
        if user_level < required_level:
            return error_response(
                f'Unauthorized: requires {required_role} role (user has {user.get("role", "none")})', 403
            )
        return None
    return check


# ===== API Response Helpers =====
def success_response(data, status=200):
    """Standard success response."""
    return {
        "statusCode": status,
        "body": __serialize(data),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
        }
    }

def error_response(message, status=400):
    """Standard error response."""
    return {
        "statusCode": status,
        "body": __serialize({"error": message}),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }

def __serialize(obj):
    """JSON serialization helper."""
    import json
    return json.dumps(obj, default=str)
