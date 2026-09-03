import pandas as pd
from typing import Dict, Any, List
from app.database import db_manager

class ReconciliationEngine:
    @staticmethod
    def reconcile_settlements() -> Dict[str, Any]:
        """
        Compares internal settlement amounts against bank reported amounts.
        Returns reconciliation KPIs, mismatched items, and affected merchants.
        Gracefully handles generic non-settlement databases.
        """
        try:
            conn = db_manager.get_connection(read_only=True)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settlements';")
            if not cursor.fetchone():
                conn.close()
                return {
                    "success": True,
                    "supported": False,
                    "reason": "Settlement reconciliation requires compatible settlement data.",
                    "total_settlements": 0,
                    "matched_count": 0,
                    "mismatched_count": 0,
                    "match_rate": 0.0,
                    "total_discrepancy": 0.0,
                    "largest_discrepancy": 0.0,
                    "affected_merchants_count": 0,
                    "affected_merchants": [],
                    "mismatches": [],
                    "all_records": []
                }

            cursor.execute("PRAGMA table_info(settlements);")
            cols = {r[1] for r in cursor.fetchall()}
            if not {"settlement_amount", "bank_reported_amount"}.issubset(cols):
                conn.close()
                return {
                    "success": True,
                    "supported": False,
                    "reason": "Settlement reconciliation requires compatible settlement data.",
                    "total_settlements": 0,
                    "matched_count": 0,
                    "mismatched_count": 0,
                    "match_rate": 0.0,
                    "total_discrepancy": 0.0,
                    "largest_discrepancy": 0.0,
                    "affected_merchants_count": 0,
                    "affected_merchants": [],
                    "mismatches": [],
                    "all_records": []
                }

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='merchants';")
            has_merchants = bool(cursor.fetchone())

            if has_merchants:
                query = """
                SELECT 
                    s.settlement_id,
                    s.merchant_id,
                    m.merchant_name,
                    m.category AS merchant_category,
                    s.settlement_amount,
                    s.bank_reported_amount,
                    ROUND(ABS(s.settlement_amount - s.bank_reported_amount), 2) AS difference,
                    s.settlement_date,
                    s.status,
                    CASE 
                        WHEN ROUND(ABS(s.settlement_amount - s.bank_reported_amount), 2) > 0.01 THEN 'MISMATCH'
                        ELSE 'MATCH'
                    END AS match_status
                FROM settlements s
                LEFT JOIN merchants m ON s.merchant_id = m.merchant_id;
                """
            else:
                query = """
                SELECT 
                    settlement_id,
                    merchant_id,
                    merchant_id AS merchant_name,
                    'General' AS merchant_category,
                    settlement_amount,
                    bank_reported_amount,
                    ROUND(ABS(settlement_amount - bank_reported_amount), 2) AS difference,
                    settlement_date,
                    status,
                    CASE 
                        WHEN ROUND(ABS(settlement_amount - bank_reported_amount), 2) > 0.01 THEN 'MISMATCH'
                        ELSE 'MATCH'
                    END AS match_status
                FROM settlements;
                """
            df = pd.read_sql_query(query, conn)
            conn.close()

            total_settlements = len(df)
            if total_settlements == 0:
                return {
                    "success": True,
                    "supported": True,
                    "total_settlements": 0,
                    "matched_count": 0,
                    "mismatched_count": 0,
                    "match_rate": 100.0,
                    "total_discrepancy": 0.0,
                    "largest_discrepancy": 0.0,
                    "affected_merchants_count": 0,
                    "affected_merchants": [],
                    "mismatches": [],
                    "all_records": []
                }

            mismatches_df = df[df["match_status"] == "MISMATCH"].copy()
            matched_count = total_settlements - len(mismatches_df)
            mismatched_count = len(mismatches_df)
            match_rate = round((matched_count / total_settlements) * 100, 2)
            total_discrepancy = round(float(mismatches_df["difference"].sum()), 2) if not mismatches_df.empty else 0.0
            largest_discrepancy = round(float(mismatches_df["difference"].max()), 2) if not mismatches_df.empty else 0.0

            affected_merchants = []
            if not mismatches_df.empty:
                m_group = mismatches_df.groupby(["merchant_id", "merchant_name"]).agg(
                    mismatch_count=("difference", "count"),
                    total_discrepancy=("difference", "sum")
                ).reset_index()
                affected_merchants = m_group.to_dict(orient="records")

            return {
                "success": True,
                "supported": True,
                "total_settlements": total_settlements,
                "matched_count": matched_count,
                "mismatched_count": mismatched_count,
                "match_rate": match_rate,
                "total_discrepancy": total_discrepancy,
                "largest_discrepancy": largest_discrepancy,
                "affected_merchants_count": len(affected_merchants),
                "affected_merchants": affected_merchants,
                "mismatches": mismatches_df.to_dict(orient="records"),
                "all_records": df.head(100).to_dict(orient="records")
            }
        except Exception as e:
            return {
                "success": False,
                "supported": False,
                "error": str(e),
                "total_settlements": 0,
                "matched_count": 0,
                "mismatched_count": 0,
                "match_rate": 0.0,
                "total_discrepancy": 0.0,
                "largest_discrepancy": 0.0,
                "affected_merchants_count": 0,
                "affected_merchants": [],
                "mismatches": [],
                "all_records": []
            }

ReconciliationEngine.reconcile = staticmethod(ReconciliationEngine.reconcile_settlements)
reconciliation_engine = ReconciliationEngine()

def reconcile_settlements(conn=None):
    return reconciliation_engine.reconcile_settlements()
