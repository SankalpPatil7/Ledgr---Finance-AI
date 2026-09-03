import pandas as pd
from typing import Dict, Any
from app.database import db_manager
from app.services.reconciliation_engine import reconciliation_engine
from app.services.anomaly_detector import anomaly_detector
from app.services.merchant_risk_engine import merchant_risk_engine

class FinanceEngine:
    @staticmethod
    def get_dashboard_kpis() -> Dict[str, Any]:
        """Calculates all key financial metrics, rates, and risk exposures."""
        conn = db_manager.get_connection(read_only=True)
        try:
            # 1. Transactions metrics
            try:
                tx_df = pd.read_sql_query("SELECT * FROM transactions;", conn)
            except Exception:
                tx_df = pd.DataFrame()

            total_tx = len(tx_df)
            if total_tx > 0:
                total_tx_val = float(tx_df["amount"].sum())
                avg_tx_val = float(tx_df["amount"].mean())
                median_tx_val = float(tx_df["amount"].median())
                
                success_tx = len(tx_df[tx_df["status"] == "success"])
                failed_tx = len(tx_df[tx_df["status"] == "failed"])
                pending_tx = len(tx_df[tx_df["status"] == "pending"])
                
                success_rate = round((success_tx / total_tx) * 100, 2)
                fail_rate = round((failed_tx / total_tx) * 100, 2)
                
                # Payment method distribution
                pm_counts = tx_df["payment_method"].value_counts().to_dict()
                pm_dist = [{"method": k, "count": int(v), "percentage": round(v / total_tx * 100, 1)} for k, v in pm_counts.items()]
            else:
                total_tx_val = avg_tx_val = median_tx_val = success_rate = fail_rate = 0.0
                success_tx = failed_tx = pending_tx = 0
                pm_dist = []

            # 2. Refunds metrics
            try:
                ref_df = pd.read_sql_query("SELECT * FROM refunds;", conn)
                total_ref_count = len(ref_df)
                total_ref_val = float(ref_df["refund_amount"].sum())
                refund_rate = round((total_ref_val / total_tx_val * 100), 2) if total_tx_val > 0 else 0.0
            except Exception:
                total_ref_count = 0
                total_ref_val = refund_rate = 0.0

            # 3. Disputes metrics
            try:
                dsp_df = pd.read_sql_query("SELECT * FROM disputes;", conn)
                total_dsp_count = len(dsp_df)
                total_dsp_val = float(dsp_df["dispute_amount"].sum())
                dispute_rate = round((total_dsp_count / total_tx * 100), 2) if total_tx > 0 else 0.0
            except Exception:
                total_dsp_count = 0
                total_dsp_val = dispute_rate = 0.0

            # 4. Payout Fees
            try:
                fee_df = pd.read_sql_query("SELECT * FROM payout_fees;", conn)
                total_fee_count = len(fee_df)
                total_fee_val = float(fee_df["fee_amount"].sum())
            except Exception:
                total_fee_count = 0
                total_fee_val = 0.0

            # 5. Settlement & Reconciliation
            recon = reconciliation_engine.reconcile_settlements()
            total_settlements = recon.get("total_settlements", 0)
            settlement_mismatches = recon.get("mismatched_count", 0)
            settlement_match_rate = recon.get("match_rate", 100.0)
            settlement_discrepancy = recon.get("total_discrepancy", 0.0)

            # 6. Duplicate payouts exposure
            anomalies = anomaly_detector.detect_all_anomalies()
            dup_payouts = anomaly_detector.detect_duplicate_payouts()
            dup_payout_exposure = sum([d.get("settlement_amount", 0) * (d.get("occurrence_count", 2) - 1) for d in dup_payouts])

            # Total Potential Financial Exposure
            total_financial_exposure = round(settlement_discrepancy + dup_payout_exposure, 2)

            # 7. Flags
            try:
                flag_df = pd.read_sql_query("SELECT * FROM flags;", conn)
                total_flags = len(flag_df)
                open_flags = len(flag_df[flag_df["status"] == "OPEN"])
                investigating_flags = len(flag_df[flag_df["status"] == "INVESTIGATING"])
                resolved_flags = len(flag_df[flag_df["status"] == "RESOLVED"])
            except Exception:
                total_flags = open_flags = investigating_flags = resolved_flags = 0

            # 8. Merchants risk summary
            merchant_risks = merchant_risk_engine.get_all_merchant_risks()
            high_risk_merchants = sum(1 for m in merchant_risks if m["risk_score"] >= 60)
            medium_risk_merchants = sum(1 for m in merchant_risks if 30 <= m["risk_score"] < 60)
            low_risk_merchants = sum(1 for m in merchant_risks if m["risk_score"] < 30)

            # 9. Net Revenue
            net_revenue = round(total_tx_val - total_ref_val - total_fee_val, 2)
            
            # Overall Financial Health Score (0-100)
            # Starts at 100, deducted by settlement mismatches, high refund rate, high dispute rate, open flags
            health_score = 100
            if settlement_match_rate < 95:
                health_score -= (95 - settlement_match_rate) * 2
            if refund_rate > 3.0:
                health_score -= min(20, (refund_rate - 3.0) * 3)
            if dispute_rate > 1.5:
                health_score -= min(15, (dispute_rate - 1.5) * 5)
            if high_risk_merchants > 0:
                health_score -= min(15, high_risk_merchants * 5)
            health_score = max(0, min(100, int(round(health_score))))

            return {
                "health_score": health_score,
                "transactions": {
                    "total_count": total_tx,
                    "total_volume": round(total_tx_val, 2),
                    "avg_amount": round(avg_tx_val, 2),
                    "median_amount": round(median_tx_val, 2),
                    "success_count": success_tx,
                    "failed_count": failed_tx,
                    "pending_count": pending_tx,
                    "success_rate": success_rate,
                    "failure_rate": fail_rate,
                    "payment_methods": pm_dist
                },
                "settlements": {
                    "total_count": total_settlements,
                    "matched_count": recon.get("matched_count", 0),
                    "mismatched_count": settlement_mismatches,
                    "match_rate": settlement_match_rate,
                    "total_discrepancy": settlement_discrepancy,
                    "largest_discrepancy": recon.get("largest_discrepancy", 0.0)
                },
                "refunds": {
                    "total_count": total_ref_count,
                    "total_volume": round(total_ref_val, 2),
                    "refund_rate": refund_rate
                },
                "disputes": {
                    "total_count": total_dsp_count,
                    "total_volume": round(total_dsp_val, 2),
                    "dispute_rate": dispute_rate
                },
                "fees": {
                    "total_count": total_fee_count,
                    "total_amount": round(total_fee_val, 2)
                },
                "exposure": {
                    "settlement_discrepancy": settlement_discrepancy,
                    "duplicate_payouts": dup_payout_exposure,
                    "total_potential_exposure": total_financial_exposure
                },
                "flags": {
                    "total": total_flags,
                    "open": open_flags,
                    "investigating": investigating_flags,
                    "resolved": resolved_flags
                },
                "merchants": {
                    "total_count": len(merchant_risks),
                    "high_risk_count": high_risk_merchants,
                    "medium_risk_count": medium_risk_merchants,
                    "low_risk_count": low_risk_merchants
                },
                "net_revenue": net_revenue
            }
        finally:
            conn.close()

    @staticmethod
    def simulate_what_if(refund_increase_pct: float = 0.0, dispute_increase_pct: float = 0.0, settlement_recovery_pct: float = 0.0) -> Dict[str, Any]:
        kpis = FinanceEngine.get_dashboard_kpis()
        tx = kpis["transactions"]
        ref = kpis["refunds"]
        dsp = kpis["disputes"]
        exp = kpis["exposure"]
        
        current_rev = kpis["net_revenue"]
        current_ref_vol = ref["total_volume"]
        current_dsp_vol = dsp["total_volume"]
        current_exp = exp["total_potential_exposure"]
        
        simulated_ref_vol = current_ref_vol * (1 + refund_increase_pct / 100.0)
        simulated_dsp_vol = current_dsp_vol * (1 + dispute_increase_pct / 100.0)
        recovered_exp = exp["settlement_discrepancy"] * (settlement_recovery_pct / 100.0)
        
        ref_impact = simulated_ref_vol - current_ref_vol
        projected_rev = current_rev - ref_impact + recovered_exp
        remaining_exposure = max(0.0, current_exp - recovered_exp)
        
        return {
            "current_net_revenue": current_rev,
            "projected_net_revenue": round(projected_rev, 2),
            "revenue_difference": round(projected_rev - current_rev, 2),
            "original_exposure": current_exp,
            "remaining_exposure": round(remaining_exposure, 2),
            "recovered_amount": round(recovered_exp, 2),
            "explanation": f"If refunds change by {refund_increase_pct}% and {settlement_recovery_pct}% of settlement discrepancies are recovered, projected net revenue becomes ₹{projected_rev:,.2f} with ₹{remaining_exposure:,.2f} remaining exposure."
        }

finance_engine = FinanceEngine()

def calculate_financial_kpis(conn=None):
    return finance_engine.get_dashboard_kpis()

def simulate_what_if(conn=None, refund_increase_pct=0.0, dispute_increase_pct=0.0, settlement_recovery_pct=0.0):
    return finance_engine.simulate_what_if(refund_increase_pct, dispute_increase_pct, settlement_recovery_pct)
