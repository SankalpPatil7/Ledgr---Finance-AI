"""
LEDGR - Investigation Case Management & Alert Center Service
Manages formal audit cases (CASE-2026-XXXXX) and central risk alerts.
"""
from typing import Dict, Any, List, Optional
import sqlite3
import datetime
import uuid

def init_cases_table(conn: sqlite3.Connection):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS investigation_cases (
            case_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            merchant_id TEXT,
            transaction_id TEXT,
            settlement_id TEXT,
            anomaly_id TEXT,
            status TEXT DEFAULT 'OPEN',
            severity TEXT DEFAULT 'HIGH',
            assigned_investigator TEXT DEFAULT 'AI_FINANCE_CONTROLLER',
            evidence_summary TEXT,
            investigator_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

def create_case(conn: sqlite3.Connection, data: Dict[str, Any]) -> Dict[str, Any]:
    init_cases_table(conn)
    cursor = conn.cursor()
    
    case_num = str(uuid.uuid4().hex[:5]).upper()
    year = datetime.datetime.now().year
    case_id = f"CASE-{year}-{case_num}"
    
    cursor.execute("""
        INSERT INTO investigation_cases (
            case_id, title, merchant_id, transaction_id, settlement_id, 
            anomaly_id, status, severity, assigned_investigator, 
            evidence_summary, investigator_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        data.get("title", "Financial Audit Investigation Case"),
        data.get("merchant_id"),
        data.get("transaction_id"),
        data.get("settlement_id"),
        data.get("anomaly_id"),
        data.get("status", "OPEN"),
        data.get("severity", "HIGH"),
        data.get("assigned_investigator", "AI_FINANCE_CONTROLLER"),
        data.get("evidence_summary", ""),
        data.get("investigator_notes", "Case opened automatically by LEDGR Audit Engine.")
    ))
    conn.commit()
    
    return {
        "success": True,
        "case_id": case_id,
        "message": f"Investigation case {case_id} registered."
    }

def list_cases(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    init_cases_table(conn)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM investigation_cases ORDER BY created_at DESC")
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    return [dict(zip(columns, row)) for row in rows]

def update_case_status(conn: sqlite3.Connection, case_id: str, status: str, notes: Optional[str] = None) -> Dict[str, Any]:
    init_cases_table(conn)
    cursor = conn.cursor()
    if notes:
        cursor.execute("""
            UPDATE investigation_cases 
            SET status = ?, investigator_notes = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE case_id = ?
        """, (status, notes, case_id))
    else:
        cursor.execute("""
            UPDATE investigation_cases 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE case_id = ?
        """, (status, case_id))
    conn.commit()
    return {"success": True, "case_id": case_id, "status": status}

def get_central_alerts(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Synthesizes active alerts from settlement mismatches, duplicate payouts, and refund surges.
    """
    alerts = []
    
    # 1. Duplicate payout alert
    try:
        dup_query = """
            SELECT merchant_id, settlement_amount, settlement_date, COUNT(*) as cnt
            FROM settlements
            GROUP BY merchant_id, settlement_amount, settlement_date
            HAVING cnt > 1
        """
        cursor = conn.cursor()
        cursor.execute(dup_query)
        for row in cursor.fetchall():
            alerts.append({
                "alert_id": f"ALT-DUP-{row[0]}",
                "severity": "CRITICAL",
                "category": "DUPLICATE_PAYOUT",
                "title": f"Duplicate Settlement Disbursement Detected",
                "description": f"₹{row[1]:,.2f} disbursed {row[3]} times to merchant {row[0]} on {row[2]}.",
                "merchant_id": row[0],
                "status": "ACTIVE",
                "timestamp": str(row[2])
            })
    except Exception:
        pass
        
    # 2. Settlement Mismatch alerts
    try:
        mismatch_query = """
            SELECT settlement_id, merchant_id, settlement_amount, bank_reported_amount, 
                   ABS(settlement_amount - bank_reported_amount) as diff, settlement_date
            FROM settlements
            WHERE ABS(settlement_amount - bank_reported_amount) > 0.01
            ORDER BY diff DESC
        """
        cursor = conn.cursor()
        cursor.execute(mismatch_query)
        for row in cursor.fetchall():
            alerts.append({
                "alert_id": f"ALT-REC-{row[0]}",
                "severity": "HIGH" if row[4] > 2000 else "MEDIUM",
                "category": "SETTLEMENT_MISMATCH",
                "title": f"Settlement Discrepancy in {row[0]}",
                "description": f"Difference of ₹{row[4]:,.2f} between ledger (₹{row[2]:,.2f}) and bank (₹{row[3]:,.2f}).",
                "merchant_id": row[1],
                "settlement_id": row[0],
                "status": "ACTIVE",
                "timestamp": str(row[5])
            })
    except Exception:
        pass

    # 3. Refund Spike Alert
    try:
        ref_query = """
            SELECT merchant_id, COUNT(*) as cnt, SUM(refund_amount) as tot
            FROM refunds
            GROUP BY merchant_id
            HAVING cnt >= 8
        """
        cursor = conn.cursor()
        cursor.execute(ref_query)
        for row in cursor.fetchall():
            alerts.append({
                "alert_id": f"ALT-REF-{row[0]}",
                "severity": "HIGH",
                "category": "REFUND_SPIKE",
                "title": f"Unusual Refund Velocity Spike for {row[0]}",
                "description": f"{row[1]} customer refunds registered totaling ₹{row[2]:,.2f} in 3-day window.",
                "merchant_id": row[0],
                "status": "ACTIVE",
                "timestamp": "Recent 3 Days"
            })
    except Exception:
        pass

    return alerts
