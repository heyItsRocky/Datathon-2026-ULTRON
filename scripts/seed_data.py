#!/usr/bin/env python3
"""
ULTRON — Synthetic Data Generator for All 34 Tables
Seeds 26 normalized tables + 8 flat tables (ML backward compat).
Run locally or deploy as a Catalyst Job Function.

Usage:
    python seed_data.py                           # Seed all tables
    python seed_data.py --cases 500               # 500 cases
    python seed_data.py --output crimes.json      # Save to file (no insert)
"""

import json
import os
import sys
import random
import uuid
from datetime import datetime, timedelta

# Add catalyst/common to path for constants import
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'catalyst', 'common'))

from constants import (
    ALL_TABLES, TABLE_STATE, TABLE_DISTRICT, TABLE_UNIT_TYPE, TABLE_UNIT,
    TABLE_RANK, TABLE_DESIGNATION, TABLE_EMPLOYEE,
    TABLE_CASE_CATEGORY, TABLE_GRAVITY_OFFENCE, TABLE_CASE_STATUS_MASTER,
    TABLE_COURT, TABLE_CRIME_HEAD, TABLE_CRIME_SUBHEAD,
    TABLE_ACT, TABLE_SECTION, TABLE_CASE_MASTER,
    TABLE_COMPLAINANT, TABLE_VICTIM, TABLE_ACCUSED,
    TABLE_ARREST_SURRENDER, TABLE_ACT_SECTION_ASSOC, TABLE_CHARGESHEET,
    TABLE_CASTE, TABLE_RELIGION, TABLE_OCCUPATION, TABLE_CRIME_HEAD_ACT_SECTION,
    TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS, TABLE_DISTRICTS,
    TABLE_THREATS, TABLE_IOCS, TABLE_USERS, TABLE_AUDIT,
    CRIME_TYPES, CRIME_STATUS, KARNATAKA_DISTRICTS,
    CASE_CATEGORIES, GRAVITY_OFFENCES, CASE_STATUSES,
    UNIT_TYPES, RANKS, DESIGNATIONS,
    CRIME_HEADS, CRIME_SUBHEADS,
    ACTS, SECTIONS, OCCUPATIONS, RELIGIONS, CASTES,
)

# ===== Configuration =====
NUM_CASES = 500
MOCK_MODE = False  # Set True to skip insert, just print JSON

# ===== Shared Data Pools =====
FIRST_NAMES_M = [
    "Rajesh", "Suresh", "Mahesh", "Ramesh", "Dinesh", "Ganesh",
    "Venkatesh", "Manoj", "Vijay", "Arun", "Kiran", "Ravi",
    "Sanjay", "Naveen", "Prakash", "Anil", "Sunil", "Deepak",
    "Pradeep", "Harish", "Amit", "Rahul", "Vikas", "Sachin",
]
FIRST_NAMES_F = [
    "Lakshmi", "Pooja", "Shweta", "Kavita", "Anita", "Sunita",
    "Divya", "Priya", "Nandini", "Geeta", "Asha", "Rekha",
    "Usha", "Meena", "Savitri", "Radha", "Neha", "Shalini",
]
LAST_NAMES = [
    "Patil", "Kumar", "Sharma", "Reddy", "Naik", "Hegde",
    "Shetty", "Rao", "Gowda", "Murthy", "Iyer", "Achar",
    "Bhat", "Joshi", "Desai", "Kulkarni", "Pillai", "Nair",
    "Menon", "Gupta", "Singh", "Verma", "Choudhary", "Saxena",
    "Fernandes", "DSouza", "Pinto", "Joseph", "Thomas", "George",
]
STATION_NAMES = [
    "Town", "City", "Rural", "Traffic", "Cyber Crime", "Women's",
    "Central", "North", "South", "East", "West", "Railway",
    "Airport", "Economic Offenses", "Narcotics",
]
WEAPONS = ["Knife", "Firearm", "Blunt Object", "Rope", "None", "Unknown", "Chemical"]
MO_TEMPLATES = [
    "Broke into premises through {entry} during {time} using {tool}",
    "Approached victim at {location} and used {method} to steal valuables",
    "Gained access through {entry} while occupants were {activity}",
    "Used {method} to distract victim and accomplice took belongings",
    "Forced entry through {entry} and ransacked premises for {items}",
]
MO_VALUES = {
    "entry": ["back door", "window", "roof", "main gate", "ventilation shaft"],
    "time": ["night", "early morning", "afternoon", "evening", "late night"],
    "tool": ["crowbar", "lock pick", "hammer", "drill", "wire cutter"],
    "location": ["ATM", "parking lot", "market", "residential area", "mall", "bus stop", "bank"],
    "method": ["pickpocketing", "snatching", "deception", "force", "trickery"],
    "activity": ["sleeping", "away on vacation", "working", "shopping", "celebrating"],
    "items": ["electronics", "jewelry", "cash", "documents", "vehicles", "mobile phones"],
}
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]


def random_date(start=2024, end=2026):
    s = datetime(start, 1, 1)
    e = datetime(end, 12, 1)
    return s + timedelta(days=random.randint(0, (e - s).days))


def random_person(gender=None):
    if gender is None:
        gender = random.choice(["M", "F"])
    first = random.choice(FIRST_NAMES_M if gender == "M" else FIRST_NAMES_F)
    return f"{first} {random.choice(LAST_NAMES)}"


def random_ps_name():
    return f"{random.choice(STATION_NAMES)} Police Station"


def generate_lookup_tables():
    """Generate all small lookup/master tables (no FK dependencies)."""
    data = {}

    # State
    data[TABLE_STATE] = [{"StateName": "Karnataka", "NationalityID": 1, "Active": 1}]

    # CaseCategory
    data[TABLE_CASE_CATEGORY] = [
        {"LookupValue": v} for v in CASE_CATEGORIES
    ]

    # GravityOffence
    data[TABLE_GRAVITY_OFFENCE] = [
        {"LookupValue": v} for v in GRAVITY_OFFENCES
    ]

    # CaseStatusMaster
    data[TABLE_CASE_STATUS_MASTER] = [
        {"CaseStatusName": v} for v in CASE_STATUSES
    ]

    # UnitType
    data[TABLE_UNIT_TYPE] = [
        {"UnitTypeName": name, "CityDistState": cds, "Hierarchy": h, "Active": 1}
        for name, cds, h in UNIT_TYPES
    ]

    # Rank
    data[TABLE_RANK] = [
        {"RankName": name, "Hierarchy": h, "Active": 1}
        for name, h in RANKS
    ]

    # Designation
    data[TABLE_DESIGNATION] = [
        {"DesignationName": name, "Active": 1, "SortOrder": s}
        for name, s in DESIGNATIONS
    ]

    # OccupationMaster
    data[TABLE_OCCUPATION] = [
        {"OccupationName": v} for v in OCCUPATIONS
    ]

    # ReligionMaster
    data[TABLE_RELIGION] = [
        {"ReligionName": v} for v in RELIGIONS
    ]

    # CasteMaster
    data[TABLE_CASTE] = [
        {"caste_master_name": v} for v in CASTES
    ]

    return data


def generate_geography():
    """Generate District, Unit, Court data."""
    data = {}
    districts = []
    units = []
    courts = []

    for i, name in enumerate(KARNATAKA_DISTRICTS, 1):
        districts.append({
            "DistrictID": i,
            "DistrictName": name,
            "StateID": 1,
            "Active": 1,
        })

        # 3 police stations per district
        for j in range(1, 4):
            unit_id = (i - 1) * 3 + j
            units.append({
                "UnitID": unit_id,
                "UnitName": f"{name} PS-{j}",
                "TypeID": 1,
                "ParentUnit": None,
                "StateID": 1,
                "DistrictID": i,
                "Active": 1,
            })

        # 1 court per district
        courts.append({
            "CourtID": i,
            "CourtName": f"{name} District Court",
            "DistrictID": i,
            "StateID": 1,
            "Active": 1,
        })

    data[TABLE_DISTRICT] = districts
    data[TABLE_UNIT] = units
    data[TABLE_COURT] = courts
    return data


def generate_crime_classification():
    """Generate CrimeHead, CrimeSubHead, Act, Section, CrimeHeadActSection."""
    data = {}
    crime_heads = []
    crime_subheads = []
    acts = []
    sections = []
    head_act_sections = []

    subhead_id = 0
    for hi, (head_name, subheads) in enumerate(CRIME_SUBHEADS.items(), 1):
        crime_heads.append({
            "CrimeHeadID": hi,
            "CrimeGroupName": head_name,
            "Active": 1,
        })
        for si, sh in enumerate(subheads, 1):
            subhead_id += 1
            crime_subheads.append({
                "CrimeSubHeadID": subhead_id,
                "CrimeHeadID": hi,
                "CrimeHeadName": sh,
                "SeqID": si,
            })

    act_idx = 0
    for code, desc in ACTS.items():
        act_idx += 1
        acts.append({
            "ActCode": code,
            "ActDescription": desc,
            "ShortName": code,
            "Active": 1,
        })
        for sc in SECTIONS.get(code, []):
            sections.append({
                "ActCode": code,
                "SectionCode": sc,
                "SectionDescription": f"Section {sc} of {code}",
                "Active": 1,
            })

    # Map first few crime heads to IPC sections
    ipc_sections = SECTIONS.get("IPC", [])[:8]
    for hi in range(1, min(len(crime_heads) + 1, 9)):
        for sc in ipc_sections[:3]:
            head_act_sections.append({
                "CrimeHeadID": hi,
                "ActCode": "IPC",
                "SectionCode": sc,
            })

    data[TABLE_CRIME_HEAD] = crime_heads
    data[TABLE_CRIME_SUBHEAD] = crime_subheads
    data[TABLE_ACT] = acts
    data[TABLE_SECTION] = sections
    data[TABLE_CRIME_HEAD_ACT_SECTION] = head_act_sections
    return data


def generate_employees():
    """Generate Employee records (3 per district + HQ)."""
    data = {}
    employees = []
    emp_id = 0

    for did in range(1, len(KARNATAKA_DISTRICTS) + 1):
        for _ in range(3):
            emp_id += 1
            gender = random.choice(["M", "M", "M", "F"])
            dob = random_date(1970, 2000)
            appt = random_date(2000, 2024)
            employees.append({
                "EmployeeID": emp_id,
                "DistrictID": did,
                "UnitID": (did - 1) * 3 + random.randint(1, 3),
                "RankID": random.randint(1, 8),
                "DesignationID": random.randint(1, 5),
                "KGID": f"KG{random.randint(100000, 999999)}",
                "FirstName": random_person(gender),
                "EmployeeDOB": dob.strftime("%Y-%m-%d"),
                "GenderID": 1 if gender == "M" else 2,
                "BloodGroupID": random.randint(1, 8),
                "PhysicallyChallenged": random.choice([0, 0, 0, 1]),
                "AppointmentDate": appt.strftime("%Y-%m-%d"),
            })

    data[TABLE_EMPLOYEE] = employees
    return data


def generate_cases(num_cases):
    """Generate CaseMaster + related tables (Complainant, Victim, Accused, Arrest, Chargesheet, ActSection)."""
    data = {
        TABLE_CASE_MASTER: [],
        TABLE_COMPLAINANT: [],
        TABLE_VICTIM: [],
        TABLE_ACCUSED: [],
        TABLE_ARREST_SURRENDER: [],
        TABLE_ACT_SECTION_ASSOC: [],
        TABLE_CHARGESHEET: [],
    }

    accused_id = 0
    arrest_id = 0
    cs_id = 0

    for i in range(num_cases):
        cm_id = i + 1
        district_id = random.randint(1, len(KARNATAKA_DISTRICTS))
        unit_id = (district_id - 1) * 3 + random.randint(1, 3)
        cat_id = random.choice([1, 1, 1, 3, 4])  # mostly FIR (1)
        cat_code = {1: "1", 3: "3", 4: "4", 8: "8"}[cat_id]
        year = random.choice([2024, 2025, 2026])
        crime_no = f"{cat_code}{district_id:04d}{unit_id:04d}{year}{i+1:05d}"
        case_no = f"{year}{i+1:05d}"
        reg_date = random_date(year, year)

        crime_head_id = random.randint(1, len(CRIME_SUBHEADS))
        subheads = CRIME_SUBHEADS[list(CRIME_SUBHEADS.keys())[crime_head_id - 1]]
        subhead_id = sum(len(v) for k, v in list(CRIME_SUBHEADS.items())[:crime_head_id - 1]) + random.randint(1, len(subheads))

        status_id = random.randint(1, 5)
        gravity_id = random.randint(1, 3)

        # Coordinates with clustering in Bengaluru
        if random.random() < 0.3:
            lat = round(random.uniform(12.8, 13.2), 7)
            lng = round(random.uniform(77.4, 77.8), 7)
        else:
            lat = round(random.uniform(11.5, 18.5), 7)
            lng = round(random.uniform(74.0, 78.5), 7)

        case = {
            "CaseMasterID": cm_id,
            "CrimeNo": crime_no,
            "CaseNo": case_no,
            "CrimeRegisteredDate": reg_date.strftime("%Y-%m-%d"),
            "PolicePersonID": random.randint(1, len(KARNATAKA_DISTRICTS) * 3),
            "PoliceStationID": unit_id,
            "CaseCategoryID": cat_id,
            "GravityOffenceID": gravity_id,
            "CrimeMajorHeadID": crime_head_id,
            "CrimeMinorHeadID": subhead_id,
            "CaseStatusID": status_id,
            "CourtID": district_id,
            "IncidentFromDate": reg_date.strftime("%Y-%m-%d"),
            "IncidentToDate": (reg_date + timedelta(days=random.randint(0, 7))).strftime("%Y-%m-%d"),
            "latitude": str(lat),
            "longitude": str(lng),
            "BriefFacts": f"Case of {list(CRIME_SUBHEADS.keys())[crime_head_id-1].lower()} reported at {KARNATAKA_DISTRICTS[district_id-1]}.",
        }
        data[TABLE_CASE_MASTER].append(case)

        # Complainant (1 per case)
        comp_gender = random.choice(["M", "F"])
        data[TABLE_COMPLAINANT].append({
            "ComplainantID": cm_id,
            "CaseMasterID": cm_id,
            "ComplainantName": random_person(comp_gender),
            "AgeYear": random.randint(18, 80),
            "OccupationID": random.randint(1, len(OCCUPATIONS)),
            "ReligionID": random.randint(1, len(RELIGIONS)),
            "CasteID": random.randint(1, len(CASTES)),
            "GenderID": 1 if comp_gender == "M" else 2,
        })

        # Victim (0-2 per case)
        for v in range(random.randint(0, 2)):
            v_gender = random.choice(["M", "F"])
            data[TABLE_VICTIM].append({
                "VictimMasterID": len(data[TABLE_VICTIM]) + 1,
                "CaseMasterID": cm_id,
                "VictimName": random_person(v_gender),
                "AgeYear": random.randint(5, 80),
                "GenderID": 1 if v_gender == "M" else 2,
                "VictimPolice": "0",
            })

        # Accused (0-3 per case)
        for a in range(random.randint(0, 3)):
            accused_id += 1
            a_gender = random.choice(["M", "M", "M", "F"])
            data[TABLE_ACCUSED].append({
                "AccusedMasterID": accused_id,
                "CaseMasterID": cm_id,
                "AccusedName": random_person(a_gender),
                "AgeYear": random.randint(18, 65),
                "GenderID": 1 if a_gender == "M" else 2,
                "PersonID": f"A{a + 1}",
            })

            # Arrest/Surrender for ~70% of accused
            if random.random() < 0.7:
                arrest_id += 1
                data[TABLE_ARREST_SURRENDER].append({
                    "ArrestSurrenderID": arrest_id,
                    "CaseMasterID": cm_id,
                    "ArrestSurrenderTypeID": random.choice([1, 1, 1, 2]),
                    "ArrestSurrenderDate": reg_date.strftime("%Y-%m-%d"),
                    "ArrestSurrenderStateId": 1,
                    "ArrestSurrenderDistrictId": district_id,
                    "PoliceStationID": unit_id,
                    "IOID": random.randint(1, len(KARNATAKA_DISTRICTS) * 3),
                    "CourtID": district_id,
                    "AccusedMasterID": accused_id,
                    "IsAccused": 1,
                    "IsComplainantAccused": 0,
                })

        # Act-Section associations (1-3 per case)
        ipc_sections = SECTIONS.get("IPC", [])[:5]
        for _ in range(random.randint(1, 3)):
            data[TABLE_ACT_SECTION_ASSOC].append({
                "CaseMasterID": cm_id,
                "ActID": "IPC",
                "SectionID": random.choice(ipc_sections),
                "ActOrderID": 1,
                "SectionOrderID": random.randint(1, 5),
            })

        # Chargesheet for ~60% of cases with status >= 2
        if status_id >= 2 and random.random() < 0.6:
            cs_id += 1
            cs_type = random.choice(["A", "A", "A", "B", "C"])
            data[TABLE_CHARGESHEET].append({
                "CSID": cs_id,
                "CaseMasterID": cm_id,
                "csdate": (reg_date + timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
                "cstype": cs_type,
                "PolicePersonID": random.randint(1, len(KARNATAKA_DISTRICTS) * 3),
            })

    return data


def generate_flat_tables(case_data):
    """Generate the 8 flat tables for ML backward compatibility."""
    data_crimes = []
    data_criminals = []
    data_links = []
    data_districts_flat = []

    # Flat Crimes table from CaseMaster data
    for case in case_data[TABLE_CASE_MASTER]:
        head_id = case["CrimeMajorHeadID"]
        head_names = list(CRIME_SUBHEADS.keys())
        crime_type = head_names[head_id - 1] if 1 <= head_id <= len(head_names) else "Other"
        severity = "true" if case["GravityOffenceID"] in [1, 3] else "false"
        district_name = KARNATAKA_DISTRICTS[random.randint(0, len(KARNATAKA_DISTRICTS) - 1)]

        data_crimes.append({
            "FIR_NUMBER": case["CrimeNo"],
            "CRIME_TYPE": crime_type,
            "DISTRICT": district_name,
            "FIR_DATE": case["CrimeRegisteredDate"],
            "STATUS": CASE_STATUSES[case["CaseStatusID"] - 1] if 1 <= case["CaseStatusID"] <= len(CASE_STATUSES) else "Under Investigation",
            "DESCRIPTION": case["BriefFacts"],
            "MODUS_OPERANDI": random.choice(MO_TEMPLATES).format(**{k: random.choice(v) for k, v in MO_VALUES.items()}),
            "LATITUDE": case["latitude"],
            "LONGITUDE": case["longitude"],
            "CRIME_TIME": f"{random.randint(0, 23):02d}:{random.randint(0, 59):02d}",
            "IS_VIOLENT": severity,
            "WEAPON_USED": random.choice(WEAPONS),
            "CREATED_AT": "2026-07-01T00:00:00Z",
        })

    # Flat Districts table
    for i, name in enumerate(KARNATAKA_DISTRICTS, 1):
        data_districts_flat.append({
            "DISTRICT_ID": name.upper().replace(" ", "_"),
            "NAME": name,
            "POPULATION": random.randint(500000, 10000000),
            "AREA_SQKM": random.randint(2000, 12000),
            "POLICE_STATIONS": random.randint(5, 60),
            "LITERACY_RATE": random.randint(55, 95),
            "POVERTY_INDEX": random.randint(5, 50),
        })

    # Flat Criminals table
    for i in range(200):
        cid = f"CR-{random.randint(100000, 999999)}"
        gender = random.choice(["M", "M", "M", "F", "F", "O"])
        data_criminals.append({
            "CRIMINAL_ID": cid,
            "NAME": random_person(gender),
            "GENDER": gender,
            "AGE": random.randint(18, 65),
            "DISTRICT": random.choice(KARNATAKA_DISTRICTS),
            "CRIME_TYPE": random.choice(CRIME_TYPES),
            "STATUS": random.choice(["Active", "Incarcerated", "Parole", "Deceased", "Unknown"]),
            "RISK_SCORE": random.randint(0, 100),
        })

    # Crime-Criminal links
    fir_numbers = [c["FIR_NUMBER"] for c in data_crimes]
    criminal_ids = [c["CRIMINAL_ID"] for c in data_criminals]
    for i in range(300):
        data_links.append({
            "LINK_ID": f"LINK-{random.randint(10000, 99999)}",
            "FIR_NUMBER": random.choice(fir_numbers),
            "CRIMINAL_ID": random.choice(criminal_ids),
            "ROLE": random.choice(["Primary Accused", "Accomplice", "Suspect", "Witness", "Mastermind"]),
            "RELATIONSHIP_STRENGTH": round(random.uniform(0.3, 1.0), 2),
        })

    return {
        TABLE_CRIMES: data_crimes,
        TABLE_CRIMINALS: data_criminals,
        TABLE_CRIME_LINKS: data_links,
        TABLE_DISTRICTS: data_districts_flat,
    }


def generate_cyber_data():
    """Generate CyberThreats and CyberIndicators."""
    threats = []
    iocs = []

    threat_types = [
        "Phishing", "Malware", "Ransomware", "DDoS", "Data Breach",
        "SQL Injection", "Social Engineering", "Credential Stuffing",
    ]
    severities = ["Critical", "High", "Medium", "Low"]
    statuses = ["Active", "Mitigated", "Investigating", "False Positive"]
    mitre_tactics = [
        "Initial Access", "Execution", "Persistence", "Privilege Escalation",
        "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
        "Command and Control", "Exfiltration", "Impact",
    ]
    ioc_types = ["IP", "Domain", "Hash", "URL", "Email"]

    for i in range(200):
        threat_id = f"THREAT-{i+1:04d}"
        threat_type = random.choice(threat_types)
        severity = random.choice(severities)
        status = random.choice(statuses)
        threats.append({
            "THREAT_ID": threat_id,
            "THREAT_TYPE": threat_type,
            "SEVERITY": severity,
            "SOURCE_IP": f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}",
            "DOMAIN": f"mal{random.randint(100, 999)}.com",
            "ATTACK_VECTOR": random.choice(["Email", "Web", "Network", "Physical", "Social"]),
            "MITRE_TECHNIQUE": random.choice(mitre_tactics),
            "DETECTION_DATE": random_date(2025, 2026).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "STATUS": status,
            "DESCRIPTION": f"{threat_type} attack detected - {severity} severity",
        })

        # 2-3 IOCs per threat
        for _ in range(random.randint(2, 3)):
            ioc_type = random.choice(ioc_types)
            if ioc_type == "IP":
                value = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"
            elif ioc_type == "Domain":
                value = f"{'malware' if random.random() > 0.5 else 'phishing'}{random.randint(100, 999)}.{random.choice(['com', 'net', 'org', 'xyz'])}"
            elif ioc_type == "Hash":
                value = uuid.uuid4().hex
            elif ioc_type == "URL":
                value = f"https://{random.choice(['evil', 'fake', 'phish'])}-{random.randint(100, 999)}.com/login"
            else:
                value = f"{random.choice(['admin', 'user', 'info', 'noreply'])}@{random.choice(['evil', 'spam', 'fake'])}.com"

            iocs.append({
                "IOC_ID": f"IOC-{len(iocs) + 1:05d}",
                "INDICATOR_TYPE": ioc_type,
                "VALUE": value,
                "THREAT_ID": threat_id,
                "CONFIDENCE": round(random.uniform(0.5, 1.0), 2),
                "FIRST_SEEN": random_date(2025, 2026).strftime("%Y-%m-%dT%H:%M:%SZ"),
            })

    users = []
    for i in range(1, 11):
        users.append({
            "USER_ID": f"USR-{i:04d}",
            "NAME": random_person(),
            "EMAIL": f"user{i}@ksp.gov.in",
            "ROLE": random.choice(["admin", "investigator", "viewer"]),
            "STATUS": "active",
        })

    audit = []
    for i in range(100):
        audit.append({
            "EVENT_ID": f"EVT-{i:05d}",
            "ACTION": random.choice(["LOGIN", "QUERY", "EXPORT", "UPDATE", "CREATE"]),
            "PERFORMED_BY": random.choice([u["NAME"] for u in users]),
            "TIMESTAMP": random_date(2026, 2026).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "DETAIL": f"User performed {random.choice(['data query', 'report export', 'case update', 'system config'])}",
        })

    return {
        TABLE_THREATS: threats,
        TABLE_IOCS: iocs,
        TABLE_USERS: users,
        TABLE_AUDIT: audit,
    }


def try_insert(table_name, rows):
    """Insert rows via ZCQL, with mock fallback."""
    if MOCK_MODE or not rows:
        if rows:
            print(f"  📄 {table_name}: {len(rows)} rows (mock)")
        return rows
    try:
        import zcatalyst_sdk
        app = zcatalyst_sdk.initialize()
        table = app.datastore().table(table_name)
        table.insert_rows(rows)
        print(f"  ✅ {table_name}: {len(rows)} rows")
    except Exception as e:
        print(f"  ❌ {table_name}: {str(e)[:80]}")
    return rows


def seed_all():
    """Generate and insert all table data in FK-safe order."""
    print("=" * 60)
    print("ULTRON — Seeding All 34 Tables")
    print("=" * 60)

    # Phase 1: Lookup tables (no FK dependencies)
    print("\n📋 Phase 1: Lookup Tables")
    lookup = generate_lookup_tables()
    for tname in [TABLE_STATE, TABLE_CASE_CATEGORY, TABLE_GRAVITY_OFFENCE,
                  TABLE_CASE_STATUS_MASTER, TABLE_UNIT_TYPE, TABLE_RANK,
                  TABLE_DESIGNATION, TABLE_OCCUPATION, TABLE_RELIGION, TABLE_CASTE]:
        try_insert(tname, lookup[tname])

    # Phase 2: Geography
    print("\n🌍 Phase 2: Geography")
    geo = generate_geography()
    for tname in [TABLE_DISTRICT, TABLE_UNIT, TABLE_COURT]:
        try_insert(tname, geo[tname])

    # Phase 3: Crime Classification
    print("\n📂 Phase 3: Crime Classification")
    cls = generate_crime_classification()
    for tname in [TABLE_CRIME_HEAD, TABLE_CRIME_SUBHEAD, TABLE_ACT, TABLE_SECTION, TABLE_CRIME_HEAD_ACT_SECTION]:
        try_insert(tname, cls[tname])

    # Phase 4: Employees
    print("\n👮 Phase 4: Employees")
    emp = generate_employees()
    try_insert(TABLE_EMPLOYEE, emp[TABLE_EMPLOYEE])

    # Phase 5: Cases
    print(f"\n📄 Phase 5: Cases ({NUM_CASES} cases)")
    cases = generate_cases(NUM_CASES)
    for tname in [TABLE_CASE_MASTER, TABLE_COMPLAINANT, TABLE_VICTIM, TABLE_ACCUSED,
                  TABLE_ARREST_SURRENDER, TABLE_ACT_SECTION_ASSOC, TABLE_CHARGESHEET]:
        try_insert(tname, cases[tname])

    # Phase 6: Flat tables (ML backward compat)
    print("\n🔄 Phase 6: Flat Tables (ML Compat)")
    flat = generate_flat_tables(cases)
    for tname in [TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS, TABLE_DISTRICTS]:
        try_insert(tname, flat[tname])

    # Phase 7: Cyber data
    print("\n🔒 Phase 7: Cyber Data")
    cyber = generate_cyber_data()
    for tname in [TABLE_THREATS, TABLE_IOCS, TABLE_USERS, TABLE_AUDIT]:
        try_insert(tname, cyber[tname])

    # Summary
    print("\n" + "=" * 60)
    print("✅ Seeding Complete")
    print(f"   Tables: 34 (26 normalized + 8 flat)")
    print(f"   Cases: {NUM_CASES}")
    print("=" * 60)

    return {
        "lookup": {k: len(v) for k, v in lookup.items()},
        "geography": {k: len(v) for k, v in geo.items()},
        "classification": {k: len(v) for k, v in cls.items()},
        "employees": {TABLE_EMPLOYEE: len(emp[TABLE_EMPLOYEE])},
        "cases": {k: len(v) for k, v in cases.items()},
        "flat": {k: len(v) for k, v in flat.items()},
        "cyber": {k: len(v) for k, v in cyber.items()},
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="ULTRON — Seed all 34 data store tables")
    parser.add_argument("--cases", type=int, default=500, help="Number of cases to generate")
    parser.add_argument("--output", type=str, help="Output JSON to file (no insert)")
    parser.add_argument("--mock", action="store_true", help="Mock mode — generate without inserting")
    args = parser.parse_args()

    global NUM_CASES, MOCK_MODE
    if args.cases:
        NUM_CASES = args.cases
    if args.mock or args.output:
        MOCK_MODE = True

    summary = seed_all()

    if args.output:
        with open(args.output, "w") as f:
            json.dump(summary, f, indent=2, default=str)
        print(f"\n💾 Summary saved to {args.output}")


if __name__ == "__main__":
    main()
