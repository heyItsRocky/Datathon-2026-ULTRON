"""
ULTRON — Catalyst Data Store ZCQL Utilities
Helpers for querying Catalyst Data Store via ZCQL.
Uses zcatalyst_sdk (the current Catalyst Python SDK).
"""

import zcatalyst_sdk
import json
from constants import (
    TABLE_CRIMES, TABLE_CRIMINALS, TABLE_CRIME_LINKS,
    TABLE_DISTRICT, TABLE_UNIT, TABLE_COURT, TABLE_EMPLOYEE,
    TABLE_CASE_MASTER, TABLE_COMPLAINANT, TABLE_VICTIM, TABLE_ACCUSED,
    TABLE_CRIME_HEAD, TABLE_CRIME_SUBHEAD, TABLE_ACT, TABLE_SECTION,
    TABLE_CASE_CATEGORY, TABLE_GRAVITY_OFFENCE, TABLE_CASE_STATUS_MASTER,
    TABLE_STATE, TABLE_UNIT_TYPE, TABLE_RANK, TABLE_DESIGNATION,
    TABLE_ARREST_SURRENDER, TABLE_ACT_SECTION_ASSOC, TABLE_CHARGESHEET,
    TABLE_CASTE, TABLE_RELIGION, TABLE_OCCUPATION, TABLE_CRIME_HEAD_ACT_SECTION,
)

# Lazy SDK init — Catalyst headers are only available inside a request context
_app = None

def _get_app():
    global _app
    if _app is None:
        _app = zcatalyst_sdk.initialize()
    return _app

# ============================================================
# Generic CRUD Helpers
# ============================================================

def query_table(table_name, columns="*", conditions=None, limit=100, offset=0, order_by=None):
    """
    Execute a ZCQL SELECT query.

    Args:
        table_name: Name of the table
        columns: Column list or "*"
        conditions: List of (column, operator, value) tuples
        limit: Max results
        offset: Pagination offset
        order_by: (column, direction) tuple

    Returns:
        List of row dicts
    """
    try:
        cols = columns if isinstance(columns, str) else ", ".join(columns)
        query = f"SELECT {cols} FROM {table_name}"

        if conditions:
            where_parts = []
            for col, op, val in conditions:
                if isinstance(val, str):
                    # Escape single quotes in string values
                    val = val.replace("'", "''")
                    where_parts.append(f"{col} {op} '{val}'")
                else:
                    where_parts.append(f"{col} {op} {val}")
            query += " WHERE " + " AND ".join(where_parts)

        if order_by:
            col, direction = order_by
            query += f" ORDER BY {col} {direction}"

        query += f" LIMIT {limit}"
        if offset > 0:
            query += f" OFFSET {offset}"

        zcql = _get_app().zcql()
        result = zcql.execute_query(query)

        # SDK returns list of row dicts
        return result if result else []
    except Exception as e:
        raise Exception(f"ZCQL query error on {table_name}: {str(e)}")


def get_record(table_name, column, value):
    """Get a single record by column value."""
    results = query_table(table_name, conditions=[(column, "=", value)], limit=1)
    return results[0] if results else None


def insert_record(table_name, data):
    """Insert a record into a table."""
    try:
        datastore_service = _get_app().datastore()
        table_service = datastore_service.table(table_name)
        result = table_service.insert_row(data)
        return result
    except Exception as e:
        raise Exception(f"Insert error on {table_name}: {str(e)}")


def insert_records_bulk(table_name, rows):
    """Insert multiple rows into a table. Returns inserted rows."""
    results = []
    for row in rows:
        results.append(insert_record(table_name, row))
    return results


def update_record(table_name, data, column, value):
    """Update records where column = value using ZCQL."""
    try:
        set_parts = []
        for k, v in data.items():
            if isinstance(v, str):
                v = v.replace("'", "''")
                set_parts.append(f"{k} = '{v}'")
            else:
                set_parts.append(f"{k} = {v}")

        if isinstance(value, str):
            value = value.replace("'", "''")
            query = f"UPDATE {table_name} SET {', '.join(set_parts)} WHERE {column} = '{value}'"
        else:
            query = f"UPDATE {table_name} SET {', '.join(set_parts)} WHERE {column} = {value}"

        zcql = _get_app().zcql()
        result = zcql.execute_query(query)
        return result
    except Exception as e:
        raise Exception(f"Update error on {table_name}: {str(e)}")


def delete_record(table_name, column, value):
    """Delete records where column = value using ZCQL."""
    try:
        if isinstance(value, str):
            value = value.replace("'", "''")
            query = f"DELETE FROM {table_name} WHERE {column} = '{value}'"
        else:
            query = f"DELETE FROM {table_name} WHERE {column} = {value}"

        zcql = _get_app().zcql()
        result = zcql.execute_query(query)
        return result
    except Exception as e:
        raise Exception(f"Delete error on {table_name}: {str(e)}")


def count_records(table_name, conditions=None):
    """Count records in a table."""
    try:
        query = f"SELECT COUNT(*) as total FROM {table_name}"
        if conditions:
            where_parts = []
            for col, op, val in conditions:
                if isinstance(val, str):
                    val = val.replace("'", "''")
                    where_parts.append(f"{col} {op} '{val}'")
                else:
                    where_parts.append(f"{col} {op} {val}")
            query += " WHERE " + " AND ".join(where_parts)

        zcql = _get_app().zcql()
        result = zcql.execute_query(query)
        return result[0]["total"] if result else 0
    except Exception as e:
        raise Exception(f"Count error on {table_name}: {str(e)}")


# ============================================================
# Crime-Specific Queries
# ============================================================

def get_crime_stats():
    """
    Get aggregate crime statistics.
    """
    try:
        total = count_records(TABLE_CRIMES)

        by_type = query_table(
            TABLE_CRIMES,
            columns=["CRIME_TYPE", "COUNT(*) as count"],
            order_by=("count", "DESC")
        )

        by_district = query_table(
            TABLE_CRIMES,
            columns=["DISTRICT", "COUNT(*) as count"],
            order_by=("count", "DESC")
        )

        by_status = query_table(
            TABLE_CRIMES,
            columns=["STATUS", "COUNT(*) as count"]
        )

        violent_count = count_records(TABLE_CRIMES, [("IS_VIOLENT", "=", "true")])

        return {
            "total_cases": total,
            "violent_crimes": violent_count,
            "non_violent_crimes": total - violent_count,
            "by_crime_type": by_type,
            "by_district": by_district,
            "by_status": by_status,
            "clearance_rate": _calc_clearance_rate(by_status, total)
        }
    except Exception as e:
        raise Exception(f"Crime stats error: {str(e)}")


def get_trends(months=12):
    """Get monthly crime trends."""
    try:
        results = query_table(
            TABLE_CRIMES,
            columns=["FIR_DATE", "COUNT(*) as count", "CRIME_TYPE"],
            limit=2000
        )

        monthly = {}
        for r in results:
            month = r.get("FIR_DATE", "")[:7] if r.get("FIR_DATE") else "unknown"
            crime_type = r.get("CRIME_TYPE", "Other")
            if month not in monthly:
                monthly[month] = {"month": month, "total": 0, "by_type": {}}
            monthly[month]["total"] += 1
            monthly[month]["by_type"][crime_type] = monthly[month]["by_type"].get(crime_type, 0) + 1

        return sorted(monthly.values(), key=lambda x: x["month"])[-months:]
    except Exception as e:
        raise Exception(f"Trends error: {str(e)}")


def get_hotspots(eps=0.5, min_samples=5):
    """Get crime hotspots using DBSCAN clustering."""
    try:
        from sklearn.cluster import DBSCAN
        import numpy as np

        results = query_table(
            TABLE_CRIMES,
            columns=["FIR_NUMBER", "LATITUDE", "LONGITUDE", "CRIME_TYPE", "DISTRICT"],
            conditions=[("LATITUDE", "!=", "")],
            limit=5000
        )

        if len(results) < min_samples:
            return []

        coords = []
        valid = []
        for r in results:
            lat = _safe_float(r.get("LATITUDE"))
            lng = _safe_float(r.get("LONGITUDE"))
            if lat and lng:
                coords.append([lat, lng])
                valid.append(r)

        if len(coords) < min_samples:
            return []

        X = np.array(coords)
        clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(X)
        labels = clustering.labels_

        clusters = {}
        for i, label in enumerate(labels):
            key = int(label)
            if key == -1:
                continue
            if key not in clusters:
                clusters[key] = {
                    "cluster_id": f"hotspot_{key}",
                    "latitudes": [],
                    "longitudes": [],
                    "count": 0,
                    "crime_types": {},
                    "districts": set()
                }
            clusters[key]["latitudes"].append(coords[i][0])
            clusters[key]["longitudes"].append(coords[i][1])
            clusters[key]["count"] += 1
            ct = valid[i].get("CRIME_TYPE", "Unknown")
            clusters[key]["crime_types"][ct] = clusters[key]["crime_types"].get(ct, 0) + 1
            clusters[key]["districts"].add(valid[i].get("DISTRICT", "Unknown"))

        result = []
        for cid, data in clusters.items():
            result.append({
                "cluster_id": data["cluster_id"],
                "center_lat": sum(data["latitudes"]) / len(data["latitudes"]),
                "center_lng": sum(data["longitudes"]) / len(data["longitudes"]),
                "count": data["count"],
                "crime_types": data["crime_types"],
                "districts": list(data["districts"]),
                "radius_km": _estimate_radius(data["latitudes"], data["longitudes"])
            })

        return sorted(result, key=lambda x: x["count"], reverse=True)
    except Exception as e:
        raise Exception(f"Hotspot analysis error: {str(e)}")


def get_criminal_network(criminal_id, depth=2):
    """Build criminal network graph using BFS."""
    try:
        criminal = get_record(TABLE_CRIMINALS, "CRIMINAL_ID", criminal_id)
        if not criminal:
            return None

        nodes = {}
        edges = []
        visited_cases = set()
        visited_criminals = {criminal_id}

        def _add_criminal(c):
            cid = c.get("CRIMINAL_ID")
            if cid not in nodes:
                nodes[cid] = {
                    "id": cid,
                    "label": c.get("NAME", "Unknown"),
                    "type": "criminal",
                    "risk_score": c.get("RISK_SCORE", 0)
                }

        _add_criminal(criminal)

        links = query_table(
            TABLE_CRIME_LINKS,
            conditions=[("CRIMINAL_ID", "=", criminal_id)],
            limit=100
        )

        for link in links:
            fir_no = link.get("FIR_NUMBER")
            if fir_no and fir_no not in visited_cases:
                visited_cases.add(fir_no)
                case = get_record(TABLE_CRIMES, "FIR_NUMBER", fir_no)
                if case:
                    case_id = f"case_{fir_no}"
                    nodes[case_id] = {
                        "id": case_id,
                        "label": f"Case {fir_no[:8]}",
                        "type": "case",
                        "crime_type": case.get("CRIME_TYPE", "")
                    }
                    edges.append({
                        "source": criminal_id,
                        "target": case_id,
                        "label": link.get("ROLE", "connected"),
                        "strength": link.get("RELATIONSHIP_STRENGTH", 0.5)
                    })

                    if depth > 1:
                        other_links = query_table(
                            TABLE_CRIME_LINKS,
                            conditions=[("FIR_NUMBER", "=", fir_no)],
                            limit=50
                        )
                        for ol in other_links:
                            oc_id = ol.get("CRIMINAL_ID")
                            if oc_id and oc_id not in visited_criminals:
                                visited_criminals.add(oc_id)
                                oc = get_record(TABLE_CRIMINALS, "CRIMINAL_ID", oc_id)
                                if oc:
                                    _add_criminal(oc)
                                    edges.append({
                                        "source": oc_id,
                                        "target": case_id,
                                        "label": ol.get("ROLE", "connected"),
                                        "strength": ol.get("RELATIONSHIP_STRENGTH", 0.5)
                                    })

        return {
            "nodes": list(nodes.values()),
            "edges": edges,
            "central_criminal": {
                "id": criminal_id,
                "name": criminal.get("NAME"),
                "total_connections": len(edges)
            }
        }
    except Exception as e:
        raise Exception(f"Network analysis error: {str(e)}")


def get_mo_similar(case_id, top_k=10):
    """Find cases with similar Modus Operandi using Jaccard similarity."""
    try:
        source = get_record(TABLE_CRIMES, "FIR_NUMBER", case_id)
        if not source:
            return []

        source_mo = str(source.get("MODUS_OPERANDI", "")).lower()
        source_type = source.get("CRIME_TYPE", "")

        if not source_mo:
            return []

        candidates = query_table(
            TABLE_CRIMES,
            conditions=[("CRIME_TYPE", "=", source_type)],
            limit=1000
        )

        source_words = set(source_mo.split())
        similarities = []

        for c in candidates:
            if c.get("FIR_NUMBER") == case_id:
                continue
            target_mo = str(c.get("MODUS_OPERANDI", "")).lower()
            if not target_mo:
                continue
            target_words = set(target_mo.split())

            intersection = len(source_words & target_words)
            union = len(source_words | target_words)
            similarity = intersection / union if union > 0 else 0

            if similarity > 0.1:
                similarities.append({
                    "fir_number": c.get("FIR_NUMBER"),
                    "crime_type": c.get("CRIME_TYPE"),
                    "district": c.get("DISTRICT"),
                    "status": c.get("STATUS"),
                    "similarity_score": round(similarity, 4)
                })

        return sorted(similarities, key=lambda x: x["similarity_score"], reverse=True)[:top_k]
    except Exception as e:
        raise Exception(f"MO similarity error: {str(e)}")


# ============================================================
# Internal Helpers
# ============================================================

def _calc_clearance_rate(by_status, total):
    """Calculate clearance rate from status distribution."""
    if total == 0:
        return 0
    closed = sum(s.get("count", 0) for s in by_status
                 if s.get("STATUS") in ["Closed", "Convicted", "Charge Sheet Filed"])
    return round((closed / total) * 100, 1)


def _safe_float(val, default=None):
    """Safely convert to float."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _estimate_radius(lats, lngs):
    """Estimate cluster radius in km."""
    if len(lats) < 2:
        return 0
    import math
    lat_range = (max(lats) - min(lats)) * 111
    lng_range = (max(lngs) - min(lngs)) * 111 * math.cos(math.radians(sum(lats) / len(lats)))
    return round(max(lat_range, lng_range) / 2, 1)


# ============================================================
# New 26-Table Schema Helpers
# ============================================================

def get_districts_list():
    """Get all districts from the normalized District table."""
    return query_table(TABLE_DISTRICT, conditions=[("Active", "=", "1")], limit=100)


def get_units_by_district(district_id):
    """Get police stations for a district."""
    return query_table(TABLE_UNIT, conditions=[("DistrictID", "=", str(district_id))], limit=50)


def get_courts_by_district(district_id):
    """Get courts in a district."""
    return query_table(TABLE_COURT, conditions=[("DistrictID", "=", str(district_id))], limit=20)


def get_employees_by_unit(unit_id):
    """Get employees assigned to a unit."""
    return query_table(TABLE_EMPLOYEE, conditions=[("UnitID", "=", str(unit_id))], limit=50)


def get_crime_heads():
    """Get all crime heads."""
    return query_table(TABLE_CRIME_HEAD, conditions=[("Active", "=", "1")], limit=50)


def get_crime_subheads(head_id=None):
    """Get crime subheads, optionally filtered by head."""
    if head_id:
        return query_table(TABLE_CRIME_SUBHEAD, conditions=[("CrimeHeadID", "=", str(head_id))], limit=50)
    return query_table(TABLE_CRIME_SUBHEAD, limit=100)


def get_acts():
    """Get all legal acts."""
    return query_table(TABLE_ACT, conditions=[("Active", "=", "1")], limit=50)


def get_sections(act_code=None):
    """Get sections, optionally filtered by act."""
    if act_code:
        return query_table(TABLE_SECTION, conditions=[("ActCode", "=", act_code)], limit=100)
    return query_table(TABLE_SECTION, limit=200)


def get_case_master_list(limit=50, offset=0, district_id=None, status_id=None):
    """Get case master records with optional filters."""
    conditions = []
    if district_id:
        units = get_units_by_district(district_id)
        unit_ids = [str(u.get("UnitID", 0)) for u in units if u.get("UnitID")]
        # ponytail: ZCQL doesn't support IN with list; filter by first matching unit
        if unit_ids:
            conditions.append(("PoliceStationID", "=", unit_ids[0]))
    if status_id:
        conditions.append(("CaseStatusID", "=", str(status_id)))
    return query_table(TABLE_CASE_MASTER, conditions=conditions, limit=limit, offset=offset)


def insert_lookup_table(table_name, rows):
    """Insert multiple rows into a lookup table. Returns inserted rows."""
    return insert_records_bulk(table_name, rows)
