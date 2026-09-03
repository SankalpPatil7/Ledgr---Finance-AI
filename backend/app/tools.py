"""
LEDGR - Core Analytical & Auditing Python Tools Interface
Provides direct Python API for:
- tools.run_sql(query, ...)
- tools.detect_anomalies(...)
- tools.reconcile_settlements(...)
- tools.flag_transaction(transaction_id, reason, ...)
"""
import uuid
import datetime
from typing import Dict, Any, Optional, List

from app.database import db_manager, get_db_connection
from app.security import validate_readonly_sql
from app.services.anomaly_detector import anomaly_detector
from app.services.reconciliation_engine import reconciliation_engine
from app.services.audit_service import log_audit_event

def run_sql(query: str, db_name: Optional[str] = None, max_rows: int = 200) -> Dict[str, Any]:
    """
    Executes a safe read-only SQL query against the active or specified database.
    Rejects destructive queries and enforces result limiting.
    """
    is_safe, sec_reason = validate_readonly_sql(query)
    if not is_safe:
        return {
            "success": False,
            "error": f"Security violation: {sec_reason}",
            "rows": [],
            "row_count": 0
        }
    
    try:
        res = db_manager.execute_read_sql(query, db_name=db_name, max_rows=max_rows)
        return {
            "success": True,
            "query": query,
            "columns": res.get("columns", []),
            "rows": res.get("rows", []),
            "row_count": res.get("row_count", 0),
            "truncated": res.get("truncated", False)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "rows": [],
            "row_count": 0
        }

def detect_anomalies() -> Dict[str, Any]:
    """Runs hybrid anomaly detection (Duplicate payouts, refund spikes, ML outliers)."""
    return anomaly_detector.detect_all_anomalies()

def reconcile_settlements() -> Dict[str, Any]:
    """Runs settlement reconciliation auditing internal vs bank amounts."""
    return reconciliation_engine.reconcile_settlements()

def flag_transaction(
    transaction_id: str, 
    reason: str, 
    severity: str = "HIGH", 
    flag_type: str = "SUSPICIOUS_TRANSACTION",
    settlement_id: Optional[str] = None
) -> Dict[str, Any]:
    """Records an intentional investigation flag on a transaction or settlement."""
    flag_id = f"FLG{uuid.uuid4().hex[:8].upper()}"
    created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        conn = db_manager.get_connection(read_only=False)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS flags (
                flag_id TEXT PRIMARY KEY,
                transaction_id TEXT,
                settlement_id TEXT,
                flag_type TEXT,
                reason TEXT,
                severity TEXT,
                created_at TEXT,
                status TEXT
            );
        """)
        cursor.execute("""
            INSERT INTO flags (flag_id, transaction_id, settlement_id, flag_type, reason, severity, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')
        """, (flag_id, transaction_id, settlement_id, flag_type, reason, severity, created_at))
        conn.commit()
        conn.close()

        log_audit_event(
            action="FLAG_CREATED",
            actor="SYSTEM_AGENT",
            entity_id=flag_id,
            entity_type="FLAG",
            details=f"Flagged entity {transaction_id or settlement_id}: {reason}"
        )

        return {
            "success": True,
            "flag_id": flag_id,
            "transaction_id": transaction_id,
            "settlement_id": settlement_id,
            "status": "OPEN",
            "reason": reason,
            "created_at": created_at
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
