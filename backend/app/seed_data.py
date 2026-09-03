import sqlite3
import os
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "ledgr.db")

def seed_database():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Create tables
    cursor.execute("""
    CREATE TABLE merchants (
        merchant_id TEXT PRIMARY KEY,
        merchant_name TEXT NOT NULL,
        category TEXT NOT NULL,
        signup_date TEXT NOT NULL,
        risk_tier TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE transactions (
        transaction_id TEXT PRIMARY KEY,
        merchant_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        status TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE settlements (
        settlement_id TEXT PRIMARY KEY,
        merchant_id TEXT NOT NULL,
        settlement_amount REAL NOT NULL,
        bank_reported_amount REAL NOT NULL,
        settlement_date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE refunds (
        refund_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        merchant_id TEXT NOT NULL,
        refund_amount REAL NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE disputes (
        dispute_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        merchant_id TEXT NOT NULL,
        dispute_amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE payout_fees (
        fee_id TEXT PRIMARY KEY,
        merchant_id TEXT NOT NULL,
        fee_amount REAL NOT NULL,
        fee_type TEXT NOT NULL,
        charged_on TEXT NOT NULL,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE flags (
        flag_id TEXT PRIMARY KEY,
        transaction_id TEXT,
        settlement_id TEXT,
        flag_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN'
    );
    """)

    cursor.execute("""
    CREATE TABLE audit_logs (
        log_id TEXT PRIMARY KEY,
        user_or_agent TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 2. Seed 25 Merchants
    random.seed(42)
    merchants_data = [
        ("Mf586d65", "Apex Retail & Gadgets", "Electronics", "2024-03-15", "HIGH"),
        ("M64b5510b", "Bharat Supermart", "Grocery & Retail", "2024-01-10", "HIGH"),
        ("Md894409a", "CloudNine SaaS Labs", "SaaS & Software", "2024-05-20", "MEDIUM"),
        ("Mdf28a606", "Horizon Travel Hub", "Travel & Hospitality", "2023-11-02", "MEDIUM"),
        ("M7a10bc33", "Nexus Digital Pay", "Financial Services", "2024-02-18", "HIGH"),
        ("M89cd412a", "Zenith Fashion Studio", "Fashion & Apparel", "2024-06-01", "MEDIUM"),
        ("M10a2f441", "Urban Trendz Apparel", "Fashion & Apparel", "2023-09-12", "LOW"),
        ("M21b3e552", "Pixel Pulse Gaming", "Gaming & Digital", "2024-04-11", "LOW"),
        ("M32c4d663", "QuickBite Express", "Food & Beverage", "2024-07-05", "LOW"),
        ("M43d5c774", "Aura Luxury Jewels", "Jewelry & Luxury", "2023-08-25", "LOW"),
        ("M54e6b885", "BlueStar Logistics", "Logistics", "2024-02-01", "LOW"),
        ("M65f7a996", "Nova Health Pharma", "Healthcare", "2024-03-30", "LOW"),
        ("M76a8b007", "Starlight Media Streaming", "Entertainment", "2024-01-20", "LOW"),
        ("M87b9c118", "EcoHarvest Organics", "Grocery & Retail", "2024-05-15", "LOW"),
        ("M98c0d229", "PrimeStay Hospitality", "Travel & Hospitality", "2023-12-14", "LOW"),
        ("M09d1e330", "Velocity Auto Spares", "Automotive", "2024-04-02", "LOW"),
        ("M11e2f441", "SwiftCart Logistics", "E-Commerce", "2024-06-18", "LOW"),
        ("M22f3a552", "InnoWave Education", "EdTech", "2023-10-09", "LOW"),
        ("M33a4b663", "PeakFitness Gear", "Sports & Fitness", "2024-02-28", "LOW"),
        ("M44b5c774", "GreenNest Furnishings", "Home & Furniture", "2024-05-08", "LOW"),
        ("M55c6d885", "CyberByte Solutions", "IT Services", "2023-11-22", "LOW"),
        ("M66d7e996", "AeroJet Booking Services", "Travel & Hospitality", "2024-03-05", "LOW"),
        ("M77e8f007", "Solaria Energy Tech", "Utilities & Energy", "2024-01-15", "LOW"),
        ("M88f9a118", "Gourmet Garden Bistro", "Food & Beverage", "2024-06-25", "LOW"),
        ("M99a0b229", "Vanguard Security Systems", "Security & Hardware", "2024-04-20", "LOW"),
    ]
    cursor.executemany("INSERT INTO merchants VALUES (?, ?, ?, ?, ?)", merchants_data)
    merchant_ids = [m[0] for m in merchants_data]

    # 3. Seed 1,200 Transactions
    payment_methods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"]
    tx_records = []
    base_date = datetime(2026, 8, 1, 0, 0, 0)

    # Specific transactions for refund spike merchant Mf586d65
    spike_tx_ids = []
    for i in range(15):
        tx_id = f"TX_SPIKE_{i+1:03d}"
        spike_tx_ids.append(tx_id)
        tx_time = (base_date + timedelta(days=9, hours=random.randint(1, 20), minutes=random.randint(0, 59))).strftime("%Y-%m-%d %H:%M:%S")
        amt = round(random.uniform(2500, 18000), 2)
        tx_records.append((tx_id, "Mf586d65", amt, "INR", "success", "UPI", tx_time))

    # Remaining 1185 transactions
    for i in range(len(tx_records), 1200):
        tx_id = f"TX{i+10001:06d}"
        m_id = random.choice(merchant_ids)
        # 92% success, 6% failed, 2% pending
        status_rand = random.random()
        status = "success" if status_rand < 0.92 else ("failed" if status_rand < 0.98 else "pending")
        method = random.choice(payment_methods)
        
        # Realistic amounts distribution
        if random.random() < 0.85:
            amount = round(random.uniform(250, 9500), 2)
        elif random.random() < 0.97:
            amount = round(random.uniform(9500, 45000), 2)
        else:
            amount = round(random.uniform(45000, 148000), 2)
            
        day_offset = random.randint(0, 28)
        hour_offset = random.randint(0, 23)
        min_offset = random.randint(0, 59)
        tx_time = (datetime(2026, 8, 1) + timedelta(days=day_offset, hours=hour_offset, minutes=min_offset)).strftime("%Y-%m-%d %H:%M:%S")
        tx_records.append((tx_id, m_id, amount, "INR", status, method, tx_time))

    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?)", tx_records)

    # 4. Seed 116 Settlements
    # 6 explicit mismatches
    # Sec7d07df: Diff 1958.34 -> 132969.52 vs 131011.18
    # S03eb0108: Diff 1440.73 -> 85420.00 vs 83979.27
    # S92233d91: Diff 2864.26 -> 94500.00 vs 91635.74
    # S86ae4cb7: Diff 3711.55 -> 112800.00 vs 109088.45
    # S726e5f81: Diff 4316.56 -> 145112.52 vs 140795.96
    # S4f01e518: Diff 2842.60 -> 76300.00 vs 73457.40
    # Duplicate payout: M64b5510b -> 48250.00 on 2026-08-06 (2 settlements)
    # Total settlements = 116
    settlements_data = [
        ("Sec7d07df", "Mf586d65", 132969.52, 131011.18, "2026-08-14", "mismatch"),
        ("S03eb0108", "Md894409a", 85420.00, 83979.27, "2026-08-16", "mismatch"),
        ("S92233d91", "Mdf28a606", 94500.00, 91635.74, "2026-08-18", "mismatch"),
        ("S86ae4cb7", "Mf586d65", 112800.00, 109088.45, "2026-08-20", "mismatch"),
        ("S726e5f81", "M7a10bc33", 145112.52, 140795.96, "2026-08-22", "mismatch"),
        ("S4f01e518", "M89cd412a", 76300.00, 73457.40, "2026-08-25", "mismatch"),
        # Duplicate payout
        ("S64b_dup1", "M64b5510b", 48250.00, 48250.00, "2026-08-06", "completed"),
        ("S64b_dup2", "M64b5510b", 48250.00, 48250.00, "2026-08-06", "completed"),
        # Statistical outlier
        ("S_outlier1", "M7a10bc33", 143431.37, 143431.37, "2026-08-11", "completed"),
    ]

    # Generate remaining 107 settlements (to make total 116)
    for idx in range(len(settlements_data), 116):
        s_id = f"SETL_{idx+101:05d}"
        m_id = random.choice(merchant_ids)
        amt = round(random.uniform(15000, 92000), 2)
        s_date = (datetime(2026, 8, 1) + timedelta(days=random.randint(1, 28))).strftime("%Y-%m-%d")
        settlements_data.append((s_id, m_id, amt, amt, s_date, "completed"))

    cursor.executemany("INSERT INTO settlements VALUES (?, ?, ?, ?, ?, ?)", settlements_data)

    # 5. Seed 95 Refunds
    # 15 refunds for Mf586d65 within 3 days (2026-08-10 to 2026-08-12)
    refunds_data = []
    for i in range(15):
        r_id = f"REF_SPK_{i+1:03d}"
        tx_id = spike_tx_ids[i]
        r_amt = round(random.uniform(2200, 17500), 2)
        r_date = (datetime(2026, 8, 10) + timedelta(days=random.randint(0, 2), hours=random.randint(1, 22))).strftime("%Y-%m-%d %H:%M:%S")
        reason = random.choice(["Refund Spike - High Volume Request", "Customer Return", "Defective Merchandise", "Unauthorized Charge"])
        refunds_data.append((r_id, tx_id, "Mf586d65", r_amt, reason, r_date))

    # Remaining 80 refunds
    eligible_tx = [t for t in tx_records if t[4] == "success" and t[1] != "Mf586d65"]
    for idx in range(len(refunds_data), 95):
        r_id = f"REF_{idx+1001:05d}"
        sampled_tx = random.choice(eligible_tx)
        r_amt = round(min(sampled_tx[2], random.uniform(100, sampled_tx[2])), 2)
        r_date = (datetime.strptime(sampled_tx[6], "%Y-%m-%d %H:%M:%S") + timedelta(days=random.randint(1, 4))).strftime("%Y-%m-%d %H:%M:%S")
        reason = random.choice(["Customer Return", "Order Cancelled", "Duplicate Charge", "Product Dissatisfaction"])
        refunds_data.append((r_id, sampled_tx[0], sampled_tx[1], r_amt, reason, r_date))

    cursor.executemany("INSERT INTO refunds VALUES (?, ?, ?, ?, ?, ?)", refunds_data)

    # 6. Seed 25 Disputes
    disputes_data = []
    # 6 disputes for high risk merchant Mf586d65
    for i in range(6):
        d_id = f"DSP_MF_{i+1:02d}"
        tx_id = spike_tx_ids[i]
        d_amt = round(random.uniform(5000, 15000), 2)
        d_status = random.choice(["OPEN", "UNDER_REVIEW"])
        d_date = (datetime(2026, 8, 13) + timedelta(days=random.randint(0, 5))).strftime("%Y-%m-%d %H:%M:%S")
        disputes_data.append((d_id, tx_id, "Mf586d65", d_amt, d_status, d_date))

    # Remaining 19 disputes
    for idx in range(len(disputes_data), 25):
        d_id = f"DSP_{idx+101:04d}"
        sampled_tx = random.choice(eligible_tx)
        d_amt = round(sampled_tx[2], 2)
        d_status = random.choice(["OPEN", "UNDER_REVIEW", "RESOLVED_WON", "RESOLVED_LOST"])
        d_date = (datetime.strptime(sampled_tx[6], "%Y-%m-%d %H:%M:%S") + timedelta(days=random.randint(2, 6))).strftime("%Y-%m-%d %H:%M:%S")
        disputes_data.append((d_id, sampled_tx[0], sampled_tx[1], d_amt, d_status, d_date))

    cursor.executemany("INSERT INTO disputes VALUES (?, ?, ?, ?, ?, ?)", disputes_data)

    # 7. Seed 183 Payout Fees
    payout_fees_data = []
    fee_types = ["MDR_FEE", "PAYOUT_PROCESSING", "CROSS_BORDER_FEE", "DISPUTE_PROCESSING_FEE"]
    for i in range(183):
        f_id = f"FEE_{i+1001:05d}"
        m_id = random.choice(merchant_ids)
        f_amt = round(random.uniform(45.0, 1250.0), 2)
        f_type = random.choice(fee_types)
        f_date = (datetime(2026, 8, 1) + timedelta(days=random.randint(0, 28))).strftime("%Y-%m-%d")
        payout_fees_data.append((f_id, m_id, f_amt, f_type, f_date))

    cursor.executemany("INSERT INTO payout_fees VALUES (?, ?, ?, ?, ?)", payout_fees_data)

    # 8. Seed 3 Initial Flags
    flags_data = [
        ("FLG12345678", None, "S64b_dup2", "duplicate_payout", "Duplicate payout detected for merchant M64b5510b on 2026-08-06 (Amount: ₹48,250.00)", "HIGH", "2026-08-07 09:30:00", "OPEN"),
        ("FLG12345679", None, "Sec7d07df", "settlement_mismatch", "Bank reported settlement difference ₹1,958.34 for merchant Mf586d65", "HIGH", "2026-08-15 11:20:00", "INVESTIGATING"),
        ("FLG12345680", None, None, "refund_spike", "15 refunds detected within 3-day window for merchant Mf586d65", "MEDIUM", "2026-08-13 14:45:00", "OPEN"),
    ]
    cursor.executemany("INSERT INTO flags VALUES (?, ?, ?, ?, ?, ?, ?, ?)", flags_data)

    # 9. Seed Audit Logs
    audit_data = [
        ("LOG001", "AI Controller", "ANOMALY_DETECTED", "SETTLEMENT", "S64b_dup2", "IsolationForest and duplicate payout detector identified duplicate settlement of ₹48,250", "2026-08-07 09:28:00"),
        ("LOG002", "AI Controller", "CREATE_FLAG", "FLAG", "FLG12345678", "Auto-created high severity flag for duplicate payout", "2026-08-07 09:30:00"),
        ("LOG003", "Finance Auditor", "RECONCILE_SETTLEMENTS", "RECONCILIATION", "Sec7d07df", "Audited settlement discrepancy of ₹1,958.34 and assigned for investigation", "2026-08-15 11:20:00")
    ]
    cursor.executemany("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?)", audit_data)

    conn.commit()
    conn.close()
    print(f"Database successfully created and seeded at {DB_PATH}")

if __name__ == "__main__":
    seed_database()
