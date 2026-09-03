"""
LEDGR - Database Comparison Engine
Compares metrics between two database snapshots and calculates financial deltas.
"""
from typing import Dict, Any, List
import sqlite3
import pandas as pd
from app.services.universal_analytics import generate_database_profile
from app.services.finance_engine import calculate_financial_kpis

def compare_two_databases(conn_a: sqlite3.Connection, name_a: str, conn_b: sqlite3.Connection, name_b: str) -> Dict[str, Any]:
    prof_a = generate_database_profile(conn_a, name_a)
    prof_b = generate_database_profile(conn_b, name_b)
    
    kpis_a = calculate_financial_kpis(conn_a)
    kpis_b = calculate_financial_kpis(conn_b)
    
    def calc_delta(val_a, val_b):
        if val_a == 0:
            return 0.0
        return round(((val_b - val_a) / val_a) * 100, 2)

    vol_a = kpis_a.get("transactions", {}).get("total_volume", 0)
    vol_b = kpis_b.get("transactions", {}).get("total_volume", 0)
    
    tx_count_a = kpis_a.get("transactions", {}).get("total_count", 0)
    tx_count_b = kpis_b.get("transactions", {}).get("total_count", 0)

    ref_vol_a = kpis_a.get("refunds", {}).get("total_volume", 0)
    ref_vol_b = kpis_b.get("refunds", {}).get("total_volume", 0)

    exp_a = kpis_a.get("exposure", {}).get("total_potential_exposure", 0)
    exp_b = kpis_b.get("exposure", {}).get("total_potential_exposure", 0)

    score_a = kpis_a.get("health_score", 85)
    score_b = kpis_b.get("health_score", 85)

    comparison_metrics = [
        {
            "metric": "Total Transaction Volume",
            "db_a": f"₹{vol_a:,.2f}",
            "db_b": f"₹{vol_b:,.2f}",
            "change_pct": calc_delta(vol_a, vol_b),
            "status": "POSITIVE" if vol_b >= vol_a else "NEGATIVE"
        },
        {
            "metric": "Total Transactions Count",
            "db_a": str(tx_count_a),
            "db_b": str(tx_count_b),
            "change_pct": calc_delta(tx_count_a, tx_count_b),
            "status": "POSITIVE" if tx_count_b >= tx_count_a else "NEGATIVE"
        },
        {
            "metric": "Refund Volume",
            "db_a": f"₹{ref_vol_a:,.2f}",
            "db_b": f"₹{ref_vol_b:,.2f}",
            "change_pct": calc_delta(ref_vol_a, ref_vol_b),
            "status": "NEGATIVE" if ref_vol_b > ref_vol_a else "POSITIVE"
        },
        {
            "metric": "Potential Financial Exposure",
            "db_a": f"₹{exp_a:,.2f}",
            "db_b": f"₹{exp_b:,.2f}",
            "change_pct": calc_delta(exp_a, exp_b),
            "status": "NEGATIVE" if exp_b > exp_a else "POSITIVE"
        },
        {
            "metric": "Financial Health Score",
            "db_a": f"{score_a}/100",
            "db_b": f"{score_b}/100",
            "change_pct": calc_delta(score_a, score_b),
            "status": "POSITIVE" if score_b >= score_a else "NEGATIVE"
        }
    ]

    return {
        "database_a": name_a,
        "database_b": name_b,
        "metrics": comparison_metrics,
        "summary": f"Comparing '{name_a}' against '{name_b}'. Transaction volume shifted by {calc_delta(vol_a, vol_b)}%, exposure changed by {calc_delta(exp_a, exp_b)}%."
    }
