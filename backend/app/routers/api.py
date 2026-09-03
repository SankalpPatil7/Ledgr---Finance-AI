from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json

from app.database import (
    get_db_connection, 
    list_available_databases, 
    set_active_database, 
    get_active_database_name, 
    save_uploaded_database, 
    inspect_database_schema
)
from app.services.ai_controller import query_ai_controller
from app.services.finance_engine import calculate_financial_kpis, simulate_what_if
from app.services.reconciliation_engine import reconcile_settlements
from app.services.merchant_risk_engine import score_all_merchants, get_merchant_deep_dive
from app.services.audit_service import list_audit_logs, log_audit_event
from app.services.schema_intelligence import analyze_schema_intelligence
from app.services.universal_analytics import generate_database_profile, get_universal_table_statistics
from app.services.data_quality_engine import run_data_quality_audit
from app.services.advanced_anomaly_engine import run_advanced_anomaly_audit
from app.services.case_service import create_case, list_cases, update_case_status, get_central_alerts
from app.services.db_comparator import compare_two_databases
from app.services.full_audit_engine import execute_full_audit_pipeline
from app.services.universal_report_generator import (
    generate_universal_executive_report, 
    export_report_to_excel, 
    export_report_to_pdf
)
from app.services.data_connectors import test_remote_database_connection

router = APIRouter()

# --- Request Models ---
class QuestionRequest(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None
    include_trace: bool = True

class FlagCreateRequest(BaseModel):
    flag_type: str
    severity: str = "HIGH"
    reason: str
    transaction_id: Optional[str] = None
    settlement_id: Optional[str] = None
    dispute_id: Optional[str] = None

class FlagStatusUpdateRequest(BaseModel):
    status: str

class WhatIfRequest(BaseModel):
    refund_increase_pct: Optional[float] = 0.0
    refund_pct_change: Optional[float] = 0.0
    dispute_increase_pct: Optional[float] = 0.0
    dispute_pct_change: Optional[float] = 0.0
    settlement_recovery_pct: Optional[float] = 0.0

class CaseCreateRequest(BaseModel):
    title: str
    merchant_id: Optional[str] = None
    transaction_id: Optional[str] = None
    settlement_id: Optional[str] = None
    anomaly_id: Optional[str] = None
    severity: str = "HIGH"
    evidence_summary: Optional[str] = None
    investigator_notes: Optional[str] = None

class CaseUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None

class RemoteDbConnectRequest(BaseModel):
    db_type: str
    connection_string: str

class DbCompareRequest(BaseModel):
    database_a: str
    database_b: str

# --- Safe AI Configuration Status ---
@router.get("/settings/ai-config")
def get_ai_config():
    from app.config import settings
    return {
        "ai_configured": settings.is_nvidia_configured(),
        "provider": "NVIDIA NIM Cloud" if settings.is_nvidia_configured() else "Local AI Core",
        "model": settings.get_model()
    }


# --- Health & DB Management ---
@router.get("/health")
def health_check():
    from app.config import settings
    active_db = get_active_database_name()
    status = "ok"
    table_count = 0
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        table_count = cursor.fetchone()[0]
        conn.close()
    except Exception:
        status = "degraded"

    return {
        "status": status,
        "database": active_db,
        "ai_configured": settings.is_nvidia_configured(),
        "service": "LEDGR Autonomous AI Finance Controller & Auditor",
        "tables_count": table_count
    }

@router.get("/databases")
def get_databases():
    return {"databases": list_available_databases(), "active_database": get_active_database_name()}

@router.post("/databases/select")
def switch_database(name: str):
    success = set_active_database(name)
    if not success:
        raise HTTPException(status_code=404, detail=f"Database '{name}' not found.")
    log_audit_event(
        action="DATABASE_SELECTED",
        actor="USER",
        database=name,
        details=f"Switched active database to {name}"
    )
    return {"success": True, "active_database": name}

@router.post("/databases/upload")
async def upload_database(file: UploadFile = File(...)):
    contents = await file.read()
    res = save_uploaded_database(file.filename, contents)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    log_audit_event(
        action="DATABASE_UPLOADED",
        actor="USER",
        database=res.get("filename"),
        details=f"Uploaded and ingested {file.filename}"
    )
    return res

@router.post("/databases/connect-remote")
def connect_remote_db(req: RemoteDbConnectRequest):
    return test_remote_database_connection(req.db_type, req.connection_string)

@router.get("/databases/schema")
def get_schema(db_name: Optional[str] = None):
    return inspect_database_schema(db_name)

@router.post("/databases/compare")
def compare_databases_endpoint(req: DbCompareRequest):
    conn_a = get_db_connection(req.database_a)
    conn_b = get_db_connection(req.database_b)
    res = compare_two_databases(conn_a, req.database_a, conn_b, req.database_b)
    conn_a.close()
    conn_b.close()
    return res


# --- Schema Intelligence & Profiling ---
@router.get("/schema/intelligence")
def get_schema_intelligence():
    conn = get_db_connection()
    res = analyze_schema_intelligence(conn)
    conn.close()
    return res

@router.get("/database/profile")
def get_db_profile():
    conn = get_db_connection()
    active_db = get_active_database_name()
    res = generate_database_profile(conn, active_db)
    conn.close()
    return res

@router.get("/database/table-stats/{table_name}")
def get_table_stats(table_name: str):
    conn = get_db_connection()
    res = get_universal_table_statistics(conn, table_name)
    conn.close()
    return res

@router.get("/data-quality")
def get_data_quality():
    conn = get_db_connection()
    res = run_data_quality_audit(conn)
    conn.close()
    return res


# --- Core Analytics & KPIs ---
@router.get("/kpis")
def get_kpis():
    conn = get_db_connection()
    kpis = calculate_financial_kpis(conn)
    conn.close()
    return kpis

@router.get("/settlements/reconcile")
def get_reconciliation():
    conn = get_db_connection()
    recon = reconcile_settlements(conn)
    conn.close()
    return recon

@router.get("/anomalies")
def get_anomalies():
    from app.services.anomaly_detector import anomaly_detector
    return anomaly_detector.detect_all_anomalies()

@router.get("/anomalies/advanced")
def get_advanced_anomalies():
    conn = get_db_connection()
    res = run_advanced_anomaly_audit(conn)
    conn.close()
    return res

@router.get("/merchants")
def get_merchants():
    conn = get_db_connection()
    merchants = score_all_merchants(conn)
    conn.close()
    return merchants

@router.get("/merchants/{merchant_id}/investigate")
@router.get("/merchants/{merchant_id}/investigation")
def investigate_merchant(merchant_id: str):
    conn = get_db_connection()
    res = get_merchant_deep_dive(conn, merchant_id)
    conn.close()
    return res


# --- Alerts & Case Management ---
@router.get("/alerts")
def get_alerts_endpoint():
    conn = get_db_connection()
    alerts = get_central_alerts(conn)
    conn.close()
    return {"alerts": alerts, "total_alerts": len(alerts)}

@router.get("/cases")
def list_cases_endpoint():
    conn = get_db_connection()
    cases = list_cases(conn)
    conn.close()
    return cases

@router.post("/cases")
def create_case_endpoint(req: CaseCreateRequest):
    conn = get_db_connection()
    res = create_case(conn, req.dict())
    log_audit_event(
        action="INVESTIGATION_CASE_OPENED",
        actor="USER",
        database=get_active_database_name(),
        entity_id=res.get("case_id"),
        entity_type="CASE",
        details=f"Created case: {req.title}"
    )
    conn.close()
    return res

@router.patch("/cases/{case_id}")
def update_case_endpoint(case_id: str, req: CaseUpdateRequest):
    conn = get_db_connection()
    res = update_case_status(conn, case_id, req.status, req.notes)
    log_audit_event(
        action="CASE_STATUS_UPDATED",
        actor="USER",
        database=get_active_database_name(),
        entity_id=case_id,
        entity_type="CASE",
        details=f"Updated status to {req.status}"
    )
    conn.close()
    return res


# --- AI Controller ---
@router.post("/ask")
def ask_ai_controller(req: QuestionRequest):
    conn = get_db_connection()
    q = req.query or req.question or ""
    response = query_ai_controller(q, conn)
    conn.close()
    return response


# --- One-Click Full Audit & Reports ---
@router.post("/audit/full")
def run_full_audit():
    conn = get_db_connection()
    res = execute_full_audit_pipeline(conn, get_active_database_name())
    conn.close()
    return res

@router.get("/report")
@router.post("/report")
def get_executive_report():
    conn = get_db_connection()
    report = generate_universal_executive_report(conn, get_active_database_name())
    conn.close()
    return report

@router.get("/report/export/{export_format}")
def export_report_endpoint(export_format: str):
    conn = get_db_connection()
    report = generate_universal_executive_report(conn, get_active_database_name())
    conn.close()
    
    fmt = export_format.lower()
    if fmt == "excel" or fmt == "xlsx":
        content = export_report_to_excel(report)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=LEDGR_Audit_Report.xlsx"}
        )
    elif fmt == "pdf":
        content = export_report_to_pdf(report)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=LEDGR_Audit_Report.pdf"}
        )
    elif fmt == "json":
        return Response(
            content=json.dumps(report, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=LEDGR_Audit_Report.json"}
        )
    elif fmt == "csv":
        # CSV of recommendations
        df = pd.DataFrame(report.get("recommendations", []))
        csv_bytes = df.to_csv(index=False).encode('utf-8')
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=LEDGR_Recommendations.csv"}
        )
    elif fmt in ["md", "markdown"]:
        return Response(
            content=report.get("markdown", ""),
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=LEDGR_Audit_Report.md"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid export format. Choose from pdf, excel, csv, json, or md.")


# --- Transactions, Flags, What-If & Logs ---
@router.get("/transactions")
def get_transactions(
    page: int = 1, 
    limit: int = 50, 
    merchant_id: Optional[str] = None, 
    status: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clauses = []
    params = []
    if merchant_id:
        where_clauses.append("merchant_id = ?")
        params.append(merchant_id)
    if status:
        where_clauses.append("status = ?")
        params.append(status)
        
    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    
    count_query = f"SELECT count(*) FROM transactions {where_sql}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()[0]
    
    offset = (page - 1) * limit
    data_query = f"SELECT * FROM transactions {where_sql} ORDER BY created_at DESC LIMIT ? OFFSET ?"
    cursor.execute(data_query, params + [limit, offset])
    
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    tx_list = [dict(zip(columns, row)) for row in rows]
    conn.close()
    
    return {
        "page": page,
        "limit": limit,
        "total_records": total_count,
        "total_pages": (total_count + limit - 1) // limit,
        "transactions": tx_list
    }

@router.get("/flags")
def get_flags():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM flags ORDER BY created_at DESC")
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    flags = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return flags

@router.post("/flags")
def create_flag(req: FlagCreateRequest):
    import uuid, datetime
    flag_id = "FLG" + uuid.uuid4().hex[:8].upper()
    created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO flags (flag_id, transaction_id, settlement_id, flag_type, reason, severity, created_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')
    """, (flag_id, req.transaction_id, req.settlement_id, req.flag_type, req.reason, req.severity, created_at))
    conn.commit()
    
    log_audit_event(
        action="FLAG_CREATED",
        actor="USER",
        database=get_active_database_name(),
        entity_id=flag_id,
        entity_type="FLAG",
        details=f"Created {req.severity} flag: {req.reason}"
    )
    conn.close()
    return {"success": True, "flag_id": flag_id}

@router.patch("/flags/{flag_id}")
@router.patch("/flags/{flag_id}/status")
def update_flag_status(flag_id: str, req: FlagStatusUpdateRequest):
    valid_statuses = ["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE flags SET status = ? WHERE flag_id = ?", (req.status, flag_id))
    conn.commit()
    
    log_audit_event(
        action="FLAG_STATUS_UPDATED",
        actor="USER",
        database=get_active_database_name(),
        entity_id=flag_id,
        entity_type="FLAG",
        details=f"Updated status of {flag_id} to {req.status}"
    )
    conn.close()
    return {"success": True, "flag_id": flag_id, "status": req.status}

@router.get("/audit-logs")
def get_audit_logs(limit: int = 100):
    return list_audit_logs(limit)

@router.post("/what-if")
def simulate_what_if_endpoint(req: WhatIfRequest):
    conn = get_db_connection()
    ref_change = req.refund_increase_pct or req.refund_pct_change or 0.0
    dsp_change = req.dispute_increase_pct or req.dispute_pct_change or 0.0
    stl_rec = req.settlement_recovery_pct or 0.0
    result = simulate_what_if(
        conn, 
        ref_change, 
        dsp_change, 
        stl_rec
    )
    conn.close()
    return result
    conn.close()
    return result
