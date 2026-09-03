"""
LEDGR - Universal Analytics & Database Profiling Engine
Generates comprehensive database profiling and universal financial analytics for any schema.
"""
from typing import Dict, Any, List, Optional
import sqlite3
import pandas as pd
import numpy as np
from app.services.schema_intelligence import analyze_schema_intelligence
from app.services.data_quality_engine import run_data_quality_audit

def generate_database_profile(conn: sqlite3.Connection, db_name: str = "active_database") -> Dict[str, Any]:
    schema_intel = analyze_schema_intelligence(conn)
    data_quality = run_data_quality_audit(conn)
    
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    total_columns = 0
    numeric_columns = 0
    date_columns = 0
    earliest_date = None
    latest_date = None
    financial_tables = 0
    risk_tables = 0
    
    table_profiles = []
    
    for tbl in tables:
        try:
            df = pd.read_sql_query(f"SELECT * FROM {tbl}", conn)
        except Exception:
            continue
            
        total_columns += len(df.columns)
        
        # Count numeric columns
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        numeric_columns += len(num_cols)
        
        # Check date range across any date column
        for col in df.columns:
            col_l = col.lower()
            if any(k in col_l for k in ['date', 'created_at', 'timestamp', 'time']):
                date_columns += 1
                try:
                    dates = pd.to_datetime(df[col].dropna(), errors='coerce').dropna()
                    if len(dates) > 0:
                        min_d = dates.min().strftime('%b %Y')
                        max_d = dates.max().strftime('%b %Y')
                        if earliest_date is None or min_d < earliest_date:
                            earliest_date = min_d
                        if latest_date is None or max_d > latest_date:
                            latest_date = max_d
                except Exception:
                    pass
                    
        # Check financial table designation
        tbl_purpose = schema_intel.get("table_mappings", {}).get(tbl, {}).get("purpose", "")
        if tbl_purpose in ["TRANSACTION_ENTITY", "SETTLEMENT_ENTITY", "FEE_ENTITY"]:
            financial_tables += 1
        elif tbl_purpose in ["REFUND_ENTITY", "DISPUTE_ENTITY", "AUDIT_ENTITY"]:
            risk_tables += 1
            
        table_profiles.append({
            "table_name": tbl,
            "rows": len(df),
            "columns_count": len(df.columns),
            "numeric_columns_count": len(num_cols),
            "purpose": tbl_purpose
        })
        
    date_range_str = f"{earliest_date} - {latest_date}" if earliest_date and latest_date else "Current Operating Period"
    
    return {
        "database_name": db_name,
        "total_tables": len(tables),
        "total_records": data_quality.get("total_records_analyzed", 0),
        "total_columns": total_columns,
        "numeric_columns": numeric_columns,
        "date_columns": date_columns,
        "date_range": date_range_str,
        "financial_tables_count": financial_tables,
        "risk_tables_count": risk_tables,
        "data_quality_score": data_quality.get("overall_data_quality_score", 95),
        "capabilities": schema_intel.get("capabilities", {}),
        "table_profiles": table_profiles,
        "schema_intelligence": schema_intel,
        "data_quality_summary": data_quality
    }

def get_universal_table_statistics(conn: sqlite3.Connection, table_name: str) -> Dict[str, Any]:
    try:
        df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
    except Exception as e:
        return {"error": str(e)}
        
    numeric_stats = {}
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in num_cols:
        series = df[col].dropna()
        if len(series) > 0:
            numeric_stats[col] = {
                "count": int(series.count()),
                "sum": float(series.sum()),
                "mean": float(series.mean()),
                "std": float(series.std()) if len(series) > 1 else 0.0,
                "min": float(series.min()),
                "max": float(series.max()),
                "median": float(series.median()),
                "q25": float(series.quantile(0.25)),
                "q75": float(series.quantile(0.75))
            }
            
    categorical_stats = {}
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    for col in cat_cols[:4]:
        top_vals = df[col].value_counts().head(5).to_dict()
        categorical_stats[col] = {
            "unique_count": int(df[col].nunique()),
            "top_distributions": top_vals
        }
        
    return {
        "table_name": table_name,
        "total_rows": len(df),
        "numeric_statistics": numeric_stats,
        "categorical_statistics": categorical_stats
    }
