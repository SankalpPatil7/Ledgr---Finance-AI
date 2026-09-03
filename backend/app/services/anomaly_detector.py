import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List
from app.database import db_manager

class AnomalyDetector:
    def detect_all_anomalies(self) -> Dict[str, Any]:
        """
        Executes hybrid anomaly detection:
        1. Duplicate payout checks (Rule-based)
        2. Refund spike checks (Rule-based)
        3. Statistical outliers via IsolationForest (ML-based)
        Gracefully handles non-financial schemas.
        """
        schema = db_manager.get_schema_summary()
        tables = set(schema.get("tables", {}).keys())

        has_settlements = "settlements" in tables
        has_refunds = "refunds" in tables

        if not has_settlements and not has_refunds:
            return {
                "success": True,
                "supported": False,
                "reason": "Compatible settlement/refund data was not found in the active database schema.",
                "total_anomalies": 0,
                "severity_summary": {"HIGH": 0, "MEDIUM": 0, "LOW": 0},
                "findings": [],
                "duplicate_payouts_count": 0,
                "refund_spikes_count": 0,
                "ml_outliers_count": 0
            }

        duplicate_payouts = self.detect_duplicate_payouts()
        refund_spikes = self.detect_refund_spikes()
        ml_outliers = self.detect_ml_outliers()
        
        all_findings = []
        
        # Format Duplicate Payouts
        for item in duplicate_payouts:
            all_findings.append({
                "id": f"ANO_DUP_{item.get('merchant_id')}_{item.get('settlement_date')}",
                "type": "DUPLICATE_PAYOUT",
                "category": "DUPLICATE_PAYOUT",
                "severity": "HIGH",
                "merchant_id": item.get("merchant_id"),
                "merchant_name": item.get("merchant_name") or item.get("merchant_id", "Unknown"),
                "title": f"Duplicate Payout: ₹{item.get('settlement_amount', 0):,.2f}",
                "detail": f"Merchant {item.get('merchant_name', item.get('merchant_id'))} received {item.get('occurrence_count')} identical settlement payouts of ₹{item.get('settlement_amount', 0):,.2f} on {item.get('settlement_date')}.",
                "explanation": f"Merchant {item.get('merchant_name', item.get('merchant_id'))} received {item.get('occurrence_count')} identical settlement payouts of ₹{item.get('settlement_amount', 0):,.2f} on {item.get('settlement_date')}.",
                "evidence": {
                    "settlement_ids": item.get("settlement_ids"),
                    "settlement_amount": item.get("settlement_amount"),
                    "settlement_date": item.get("settlement_date"),
                    "occurrence_count": item.get("occurrence_count"),
                    "description": f"{item.get('occurrence_count')} occurrences on {item.get('settlement_date')}"
                },
                "threshold": "1 settlement per amount/merchant/day",
                "recommended_action": "Freeze duplicate payout settlement ID and initiate clawback investigation.",
                "data": item
            })
            
        # Format Refund Spikes
        for item in refund_spikes:
            all_findings.append({
                "id": f"ANO_SPK_{item.get('merchant_id')}",
                "type": "REFUND_SPIKE",
                "category": "REFUND_SPIKE",
                "severity": "MEDIUM",
                "merchant_id": item.get("merchant_id"),
                "merchant_name": item.get("merchant_name") or item.get("merchant_id", "Unknown"),
                "title": f"Refund Spike: {item.get('refund_count')} refunds in 3-day window",
                "detail": f"Merchant {item.get('merchant_name', item.get('merchant_id'))} generated {item.get('refund_count')} refunds totalling ₹{item.get('total_refund_amount', 0):,.2f} between {item.get('window_start')} and {item.get('window_end')}.",
                "explanation": f"Merchant {item.get('merchant_name', item.get('merchant_id'))} generated {item.get('refund_count')} refunds totalling ₹{item.get('total_refund_amount', 0):,.2f} between {item.get('window_start')} and {item.get('window_end')}.",
                "evidence": {
                    "refund_count": item.get("refund_count"),
                    "total_refund_amount": item.get("total_refund_amount"),
                    "window_start": item.get("window_start"),
                    "window_end": item.get("window_end"),
                    "description": f"{item.get('refund_count')} refunds in 3-day window (Total: ₹{item.get('total_refund_amount', 0):,.2f})"
                },
                "threshold": "> 8 refunds within any 3-day window",
                "recommended_action": "Audit merchant refund reasons, check for merchant product defects or coordinated return fraud.",
                "data": item
            })
            
        # Format ML Statistical Outliers
        for item in ml_outliers:
            all_findings.append({
                "id": f"ANO_ML_{item.get('settlement_id')}",
                "type": "STATISTICAL_OUTLIER",
                "category": "STATISTICAL_OUTLIER",
                "severity": "LOW" if item.get("anomaly_score", 0) > -0.15 else "MEDIUM",
                "merchant_id": item.get("merchant_id"),
                "merchant_name": item.get("merchant_name") or item.get("merchant_id", "Unknown"),
                "title": f"ML Outlier: Unusual Settlement ₹{item.get('settlement_amount', 0):,.2f}",
                "detail": f"IsolationForest algorithm identified settlement {item.get('settlement_id')} (₹{item.get('settlement_amount', 0):,.2f}) as a statistical deviation from the baseline distribution.",
                "explanation": f"IsolationForest algorithm identified settlement {item.get('settlement_id')} (₹{item.get('settlement_amount', 0):,.2f}) as a statistical deviation from the baseline distribution.",
                "evidence": {
                    "settlement_id": item.get("settlement_id"),
                    "settlement_amount": item.get("settlement_amount"),
                    "settlement_date": item.get("settlement_date"),
                    "anomaly_score": round(float(item.get("anomaly_score", 0)), 4),
                    "description": f"Amount ₹{item.get('settlement_amount', 0):,.2f} (Anomaly Score: {item.get('anomaly_score', 0):.4f})"
                },
                "threshold": "IsolationForest Contamination = 0.05",
                "recommended_action": "Verify underlying invoice transactions and merchant volume justification.",
                "data": item
            })

        high_count = sum(1 for f in all_findings if f["severity"] == "HIGH")
        med_count = sum(1 for f in all_findings if f["severity"] == "MEDIUM")
        low_count = sum(1 for f in all_findings if f["severity"] == "LOW")

        return {
            "success": True,
            "supported": True,
            "total_anomalies": len(all_findings),
            "severity_summary": {
                "HIGH": high_count,
                "MEDIUM": med_count,
                "LOW": low_count
            },
            "findings": all_findings,
            "duplicate_payouts_count": len(duplicate_payouts),
            "refund_spikes_count": len(refund_spikes),
            "ml_outliers_count": len(ml_outliers)
        }

    def detect_duplicate_payouts(self) -> List[Dict[str, Any]]:
        try:
            conn = db_manager.get_connection(read_only=True)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settlements';")
            if not cursor.fetchone():
                conn.close()
                return []

            cursor.execute("PRAGMA table_info(settlements);")
            cols = {r[1] for r in cursor.fetchall()}
            if not {"settlement_amount", "settlement_date"}.issubset(cols):
                conn.close()
                return []

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='merchants';")
            has_merchants = bool(cursor.fetchone())

            if has_merchants:
                query = """
                SELECT 
                    s.merchant_id,
                    m.merchant_name,
                    s.settlement_amount,
                    s.settlement_date,
                    COUNT(*) AS occurrence_count,
                    GROUP_CONCAT(s.settlement_id, ', ') AS settlement_ids
                FROM settlements s
                LEFT JOIN merchants m ON s.merchant_id = m.merchant_id
                GROUP BY s.merchant_id, s.settlement_amount, s.settlement_date
                HAVING COUNT(*) > 1;
                """
            else:
                query = """
                SELECT 
                    merchant_id,
                    merchant_id AS merchant_name,
                    settlement_amount,
                    settlement_date,
                    COUNT(*) AS occurrence_count,
                    GROUP_CONCAT(settlement_id, ', ') AS settlement_ids
                FROM settlements
                GROUP BY merchant_id, settlement_amount, settlement_date
                HAVING COUNT(*) > 1;
                """
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df.to_dict(orient="records")
        except Exception:
            return []

    def detect_refund_spikes(self) -> List[Dict[str, Any]]:
        try:
            conn = db_manager.get_connection(read_only=True)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='refunds';")
            if not cursor.fetchone():
                conn.close()
                return []

            cursor.execute("PRAGMA table_info(refunds);")
            cols = {r[1] for r in cursor.fetchall()}
            if not {"refund_amount", "created_at"}.issubset(cols):
                conn.close()
                return []

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='merchants';")
            has_merchants = bool(cursor.fetchone())

            if has_merchants:
                query = """
                SELECT 
                    r.refund_id,
                    r.merchant_id,
                    m.merchant_name,
                    r.refund_amount,
                    r.created_at
                FROM refunds r
                LEFT JOIN merchants m ON r.merchant_id = m.merchant_id
                ORDER BY r.merchant_id, r.created_at;
                """
            else:
                query = """
                SELECT 
                    refund_id,
                    merchant_id,
                    merchant_id AS merchant_name,
                    refund_amount,
                    created_at
                FROM refunds
                ORDER BY merchant_id, created_at;
                """
            df = pd.read_sql_query(query, conn)
            conn.close()
            if df.empty:
                return []

            df["created_at_dt"] = pd.to_datetime(df["created_at"], errors="coerce")
            df = df.dropna(subset=["created_at_dt"])
            spikes = []

            for merchant_id, group in df.groupby("merchant_id"):
                group = group.sort_values("created_at_dt").reset_index(drop=True)
                n = len(group)
                if n < 8:
                    continue

                for i in range(n):
                    start_time = group.loc[i, "created_at_dt"]
                    end_time = start_time + pd.Timedelta(days=3)
                    
                    window_df = group[(group["created_at_dt"] >= start_time) & (group["created_at_dt"] <= end_time)]
                    if len(window_df) >= 8:
                        spikes.append({
                            "merchant_id": merchant_id,
                            "merchant_name": group.loc[0, "merchant_name"],
                            "refund_count": int(len(window_df)),
                            "total_refund_amount": round(float(window_df["refund_amount"].sum()), 2),
                            "window_start": start_time.strftime("%Y-%m-%d"),
                            "window_end": end_time.strftime("%Y-%m-%d")
                        })
                        break
            return spikes
        except Exception:
            return []

    def detect_ml_outliers(self) -> List[Dict[str, Any]]:
        try:
            conn = db_manager.get_connection(read_only=True)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settlements';")
            if not cursor.fetchone():
                conn.close()
                return []

            cursor.execute("PRAGMA table_info(settlements);")
            cols = {r[1] for r in cursor.fetchall()}
            if not {"settlement_amount"}.issubset(cols):
                conn.close()
                return []

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='merchants';")
            has_merchants = bool(cursor.fetchone())

            if has_merchants:
                query = """
                SELECT 
                    s.settlement_id,
                    s.merchant_id,
                    m.merchant_name,
                    s.settlement_amount,
                    s.settlement_date
                FROM settlements s
                LEFT JOIN merchants m ON s.merchant_id = m.merchant_id;
                """
            else:
                query = """
                SELECT 
                    settlement_id,
                    merchant_id,
                    merchant_id AS merchant_name,
                    settlement_amount,
                    settlement_date
                FROM settlements;
                """
            df = pd.read_sql_query(query, conn)
            conn.close()

            df = df.dropna(subset=["settlement_amount"])
            if len(df) < 10:
                return []

            X = df[["settlement_amount"]].values
            
            # IsolationForest model
            clf = IsolationForest(contamination=0.05, random_state=42)
            preds = clf.fit_predict(X)
            scores = clf.decision_function(X)

            df["is_outlier"] = preds
            df["anomaly_score"] = scores

            outliers_df = df[df["is_outlier"] == -1].sort_values("settlement_amount", ascending=False)
            return outliers_df.to_dict(orient="records")
        except Exception:
            return []

anomaly_detector = AnomalyDetector()
