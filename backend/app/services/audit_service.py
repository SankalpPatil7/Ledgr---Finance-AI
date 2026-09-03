import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database import db_manager

class AuditService:
    @staticmethod
    def log_action(user_or_agent: str, action: str, entity_type: str = "GENERAL", entity_id: Optional[str] = None, details: str = "") -> Dict[str, Any]:
        log_id = f"LOG_{uuid.uuid4().hex[:8].upper()}"
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        try:
            conn = db_manager.get_connection(read_only=False)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    log_id TEXT PRIMARY KEY,
                    user_or_agent TEXT,
                    action TEXT,
                    entity_type TEXT,
                    entity_id TEXT,
                    details TEXT,
                    created_at TEXT
                );
            """)
            cursor.execute(
                "INSERT INTO audit_logs (log_id, user_or_agent, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (log_id, user_or_agent, action, entity_type, entity_id, details, created_at)
            )
            conn.commit()
            conn.close()
        except Exception:
            pass

        return {
            "log_id": log_id,
            "user_or_agent": user_or_agent,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details,
            "created_at": created_at
        }

    @staticmethod
    def get_logs(limit: int = 100) -> List[Dict[str, Any]]:
        try:
            conn = db_manager.get_connection(read_only=True)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs';")
            if not cursor.fetchone():
                conn.close()
                return []
            cursor.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", (limit,))
            columns = [d[0] for d in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            conn.close()
            return rows
        except Exception:
            return []

audit_service = AuditService()

def list_audit_logs(limit: int = 100) -> List[Dict[str, Any]]:
    return audit_service.get_logs(limit)

def log_audit_event(action: str, actor: str = "USER", database: str = "ledgr.db", entity_id: Optional[str] = None, entity_type: str = "GENERAL", details: str = "", status: str = "SUCCESS", execution_time_ms: int = 0) -> Dict[str, Any]:
    return audit_service.log_action(user_or_agent=actor, action=action, entity_type=entity_type, entity_id=entity_id, details=details)
