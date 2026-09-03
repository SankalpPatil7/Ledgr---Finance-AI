from datetime import datetime
from typing import Dict, Any, List
import pandas as pd
from app.database import db_manager
from app.services.finance_engine import finance_engine
from app.services.reconciliation_engine import reconciliation_engine
from app.services.anomaly_detector import anomaly_detector
from app.services.merchant_risk_engine import merchant_risk_engine

class ReportGenerator:
    @staticmethod
    def generate_finance_health_report() -> Dict[str, Any]:
        """
        Generates a comprehensive audit report.
        If the active database contains Ledgr financial tables, generates a full financial health report.
        If the active database is a generic non-financial schema, generates a complete data intelligence profile.
        """
        generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        active_db = db_manager.active_db_name
        schema = db_manager.get_schema_summary()
        tables = set(schema.get("tables", {}).keys())

        # Check if Ledgr-compatible financial schema
        is_ledgr_financial = bool({"transactions", "settlements"}.intersection(tables))

        if is_ledgr_financial:
            return ReportGenerator._generate_financial_report(active_db, generated_at)
        else:
            return ReportGenerator._generate_generic_report(active_db, schema, generated_at)

    @staticmethod
    def _generate_financial_report(active_db: str, generated_at: str) -> Dict[str, Any]:
        kpis = finance_engine.get_dashboard_kpis()
        recon = reconciliation_engine.reconcile_settlements()
        anomalies = anomaly_detector.detect_all_anomalies()
        merchants = merchant_risk_engine.get_all_merchant_risks()
        
        high_risk_merchants = [m for m in merchants if m.get("risk_level") in ["CRITICAL", "HIGH"]]
        
        recommendations = []
        if anomalies.get("duplicate_payouts_count", 0) > 0:
            recommendations.append({
                "priority": "P1 - CRITICAL",
                "title": "Investigate & Claw Back Duplicate Payouts",
                "detail": f"{anomalies.get('duplicate_payouts_count')} duplicate settlement payout(s) detected. Total exposure ₹{kpis.get('exposure', {}).get('duplicate_payouts', 0):,.2f}. Place an immediate hold.",
                "action_type": "FLAG_PAYOUT"
            })
            
        if recon.get("mismatched_count", 0) > 0:
            recommendations.append({
                "priority": "P1 - HIGH",
                "title": "Reconcile Bank Settlement Discrepancies",
                "detail": f"{recon.get('mismatched_count')} settlement discrepancies totaling ₹{recon.get('total_discrepancy', 0):,.2f} identified across {recon.get('affected_merchants_count', 0)} merchants.",
                "action_type": "RECONCILE_BANK"
            })
            
        if anomalies.get("refund_spikes_count", 0) > 0:
            recommendations.append({
                "priority": "P2 - MEDIUM",
                "title": "Audit Merchant Refund Spikes",
                "detail": f"{anomalies.get('refund_spikes_count')} merchant(s) breached the 3-day refund velocity threshold (>8 refunds).",
                "action_type": "AUDIT_REFUNDS"
            })
            
        if high_risk_merchants:
            top_m = high_risk_merchants[0]
            recommendations.append({
                "priority": "P2 - HIGH",
                "title": f"Review High-Risk Merchant: {top_m.get('merchant_name')}",
                "detail": f"Merchant {top_m.get('merchant_name')} ({top_m.get('merchant_id')}) scored {top_m.get('risk_score')}/100.",
                "action_type": "MERCHANT_REVIEW"
            })

        if not recommendations:
            recommendations.append({
                "priority": "P3 - NORMAL",
                "title": "Routine Audit & Reconciliation Verification",
                "detail": "Ledger transactions and settlement match rates are within expected tolerances.",
                "action_type": "MONITOR"
            })

        md_lines = [
            f"# LEDGR FINANCE HEALTH REPORT",
            f"**Generated:** {generated_at} | **Database:** `{active_db}` | **Health Score:** {kpis.get('health_score', 85)}/100\n",
            "---",
            "## 1. EXECUTIVE SUMMARY",
            f"- **Total Transactions:** {kpis.get('transactions', {}).get('total_count', 0):,} (Volume: ₹{kpis.get('transactions', {}).get('total_volume', 0):,.2f})",
            f"- **Success Rate:** {kpis.get('transactions', {}).get('success_rate', 0)}% | **Failure Rate:** {kpis.get('transactions', {}).get('failure_rate', 0)}%",
            f"- **Settlement Match Rate:** {kpis.get('settlements', {}).get('match_rate', 0)}% ({kpis.get('settlements', {}).get('matched_count', 0)}/{kpis.get('settlements', {}).get('total_count', 0)} matched)",
            f"- **Total Potential Financial Exposure:** **₹{kpis.get('exposure', {}).get('total_potential_exposure', 0):,.2f}**\n",
            "## 2. ANOMALIES & AUDIT FINDINGS",
            f"- **Duplicate Payouts:** {anomalies.get('duplicate_payouts_count', 0)}",
            f"- **Refund Spikes:** {anomalies.get('refund_spikes_count', 0)}",
            f"- **Statistical ML Outliers:** {anomalies.get('ml_outliers_count', 0)}\n",
            "## 3. SETTLEMENT RECONCILIATION",
            f"- **Mismatches Detected:** {recon.get('mismatched_count', 0)}",
            f"- **Total Discrepancy Amount:** ₹{recon.get('total_discrepancy', 0.0):,.2f}\n",
            "## 4. RECOMMENDED ACTIONS"
        ]
        for i, rec in enumerate(recommendations, 1):
            md_lines.append(f"{i}. **[{rec['priority']}] {rec['title']}**: {rec['detail']}")

        return {
            "title": "LEDGR Finance Health Report",
            "report_type": "FINANCIAL_HEALTH_AUDIT",
            "generated_at": generated_at,
            "database": active_db,
            "health_score": kpis.get("health_score", 85),
            "kpis": kpis,
            "reconciliation": recon,
            "anomalies": anomalies,
            "top_risk_merchants": merchants[:5],
            "recommendations": recommendations,
            "markdown": "\n".join(md_lines)
        }

    @staticmethod
    def _generate_generic_report(active_db: str, schema: Dict[str, Any], generated_at: str) -> Dict[str, Any]:
        tables_dict = schema.get("tables", {})
        total_tables = schema.get("total_tables", 0)
        total_rows = schema.get("total_rows", 0)

        # Dynamic profile of each table
        table_profiles = []
        conn = db_manager.get_connection(read_only=True)
        
        try:
            for tbl_name, tbl_info in tables_dict.items():
                col_names = [c["name"] for c in tbl_info.get("columns", [])]
                try:
                    df = pd.read_sql_query(f"SELECT * FROM \"{tbl_name}\" LIMIT 500;", conn)
                    null_counts = int(df.isnull().sum().sum())
                    dup_rows = int(df.duplicated().sum())
                    num_cols = df.select_dtypes(include=["number"]).columns.tolist()
                except Exception:
                    null_counts = 0
                    dup_rows = 0
                    num_cols = []

                table_profiles.append({
                    "table_name": tbl_name,
                    "row_count": tbl_info.get("row_count", 0),
                    "column_count": len(col_names),
                    "columns": col_names,
                    "numeric_columns": num_cols,
                    "null_count": null_counts,
                    "duplicate_rows": dup_rows
                })
        finally:
            conn.close()

        recommendations = [
            {
                "priority": "P2 - NOTICE",
                "title": "Specialized Financial Audits Not Applicable",
                "detail": "Settlement reconciliation and duplicate payout checks require compatible financial tables (e.g. settlements, refunds). Generic data analytics and SQL queries are fully operational.",
                "action_type": "SCHEMA_NOTICE"
            },
            {
                "priority": "P3 - ADVISORY",
                "title": "Dynamic Schema Discovery Complete",
                "detail": f"Successfully mapped {total_tables} tables with {total_rows:,} records. You can query any table or column using natural language in the AI Controller.",
                "action_type": "SCHEMA_MAPPED"
            }
        ]

        md_lines = [
            f"# LEDGR DATABASE INTELLIGENCE & AUDIT REPORT",
            f"**Generated:** {generated_at} | **Database:** `{active_db}` | **Schema Type:** Generic Relational Schema\n",
            "---",
            "## 1. SCHEMA OVERVIEW",
            f"- **Total Tables:** {total_tables}",
            f"- **Total Records:** {total_rows:,}",
            f"- **Financial Features Status:** Settlement reconciliation is not available because the uploaded database does not contain compatible settlement/merchant data.\n",
            "## 2. TABLE PROFILES & RECORD DISTRIBUTION"
        ]

        for p in table_profiles:
            md_lines.append(f"- **`{p['table_name']}`**: {p['row_count']:,} rows, {p['column_count']} columns ({', '.join(p['columns'][:6])}{'...' if len(p['columns']) > 6 else ''}) | Nulls: {p['null_count']} | Duplicate Sample Rows: {p['duplicate_rows']}")

        md_lines.append("\n## 3. AUDIT RECOMMENDATIONS")
        for i, rec in enumerate(recommendations, 1):
            md_lines.append(f"{i}. **[{rec['priority']}] {rec['title']}**: {rec['detail']}")

        return {
            "title": "LEDGR Database Intelligence Report",
            "report_type": "GENERIC_DATABASE_PROFILE",
            "generated_at": generated_at,
            "database": active_db,
            "health_score": 90,
            "total_tables": total_tables,
            "total_records": total_rows,
            "table_profiles": table_profiles,
            "reconciliation": {
                "supported": False,
                "reason": "Settlement reconciliation is not available because the uploaded database does not contain compatible settlement data."
            },
            "anomalies": {
                "supported": False,
                "reason": "Anomaly detection requires compatible transaction/settlement data."
            },
            "recommendations": recommendations,
            "markdown": "\n".join(md_lines)
        }

report_generator = ReportGenerator()

def generate_report(conn=None):
    return report_generator.generate_finance_health_report()
