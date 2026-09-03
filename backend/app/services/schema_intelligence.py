"""
LEDGR - Schema Intelligence & Semantic Mapping Layer
Automatically discovers table and column purposes from any arbitrary database schema.
"""
from typing import Dict, Any, List, Optional
import sqlite3
import re

TABLE_KEYWORDS = {
    "TRANSACTION_ENTITY": ["transact", "payment", "charge", "order", "sale", "invoice", "checkout"],
    "SETTLEMENT_ENTITY": ["settle", "payout", "disburse", "bank_statement", "batch_payout"],
    "REFUND_ENTITY": ["refund", "return", "reversal", "credit_note"],
    "DISPUTE_ENTITY": ["dispute", "chargeback", "claim", "fraud_alert"],
    "MERCHANT_ENTITY": ["merchant", "vendor", "seller", "partner", "store", "business", "shop"],
    "CUSTOMER_ENTITY": ["customer", "client", "user", "buyer", "account"],
    "FEE_ENTITY": ["fee", "commission", "tax", "surcharge", "expense", "payout_fee"],
    "AUDIT_ENTITY": ["audit", "log", "history", "flag", "event", "trail"]
}

COLUMN_KEYWORDS = {
    "SEMANTIC_AMOUNT": ["amount", "value", "price", "total", "fee", "cost", "sum", "gross", "net", "diff", "balance", "val"],
    "SEMANTIC_TIMESTAMP": ["date", "time", "created_at", "updated_at", "timestamp", "settled_at", "paid_at", "dt"],
    "SEMANTIC_ENTITY_ID": ["id", "code", "ref", "key", "number", "num"],
    "SEMANTIC_STATUS": ["status", "state", "condition", "flag", "result", "outcome"],
    "SEMANTIC_NAME": ["name", "title", "label", "description", "desc"],
    "SEMANTIC_METHOD": ["method", "type", "channel", "mode", "gateway", "provider"]
}

def analyze_schema_intelligence(conn: sqlite3.Connection) -> Dict[str, Any]:
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    table_mappings = {}
    capabilities = {
        "transactions": False,
        "revenue_analytics": False,
        "settlement_reconciliation": False,
        "refund_intelligence": False,
        "dispute_analytics": False,
        "merchant_risk": False,
        "customer_analytics": False,
        "anomaly_detection": True,  # Generic ML always possible
        "data_quality_scan": True
    }
    
    table_summaries = []
    
    for tbl in tables:
        # Get column info
        cursor.execute(f"PRAGMA table_info({tbl})")
        col_info = cursor.fetchall()
        columns = [c[1] for c in col_info]
        
        # Get row count
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
            row_count = cursor.fetchone()[0]
        except Exception:
            row_count = 0
            
        # Classify Table Purpose
        tbl_lower = tbl.lower()
        table_purpose = "UNKNOWN_ENTITY"
        confidence = 0.5
        
        for purpose, kws in TABLE_KEYWORDS.items():
            if any(kw in tbl_lower for kw in kws):
                table_purpose = purpose
                confidence = 0.95
                break
                
        # Semantic Column Mapping
        col_mappings = {}
        for col in columns:
            col_lower = col.lower()
            col_purpose = "GENERAL_FIELD"
            for sem_type, kws in COLUMN_KEYWORDS.items():
                if any(kw in col_lower for kw in kws):
                    col_purpose = sem_type
                    break
            col_mappings[col] = col_purpose
            
        # Update Capabilities
        if table_purpose == "TRANSACTION_ENTITY":
            capabilities["transactions"] = True
            if any(p == "SEMANTIC_AMOUNT" for p in col_mappings.values()):
                capabilities["revenue_analytics"] = True
        elif table_purpose == "SETTLEMENT_ENTITY":
            capabilities["settlement_reconciliation"] = True
        elif table_purpose == "REFUND_ENTITY":
            capabilities["refund_intelligence"] = True
        elif table_purpose == "DISPUTE_ENTITY":
            capabilities["dispute_analytics"] = True
        elif table_purpose == "MERCHANT_ENTITY":
            capabilities["merchant_risk"] = True
        elif table_purpose == "CUSTOMER_ENTITY":
            capabilities["customer_analytics"] = True
            
        table_mappings[tbl] = {
            "table_name": tbl,
            "purpose": table_purpose,
            "confidence": confidence,
            "row_count": row_count,
            "column_count": len(columns),
            "column_semantics": col_mappings,
            "columns": columns
        }
        
        table_summaries.append({
            "table": tbl,
            "purpose": table_purpose,
            "rows": row_count,
            "columns": len(columns)
        })
        
    return {
        "total_tables": len(tables),
        "table_mappings": table_mappings,
        "table_summaries": table_summaries,
        "capabilities": capabilities,
        "summary_statement": f"Discovered {len(tables)} tables with {sum(t['row_count'] for t in table_mappings.values())} total records. Classified into {len(set(t['purpose'] for t in table_mappings.values()))} distinct semantic entity types."
    }
