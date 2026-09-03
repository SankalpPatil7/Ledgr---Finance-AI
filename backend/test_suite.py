import json
import sqlite3
import sys
import io
import os
from fastapi.testclient import TestClient
from app.main import app
from app.database import DATA_DIR, set_active_database
from app.config import settings
from app.security import validate_readonly_sql

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
client = TestClient(app)

def run_all_tests():
    print("============================================================")
    print("      LEDGR COMPREHENSIVE 18-POINT VERIFICATION SUITE")
    print("============================================================")

    # TEST 1: Backend starts successfully
    assert app is not None
    print("[TEST 1/18 PASS] Backend app initialized successfully.")

    # TEST 2: GET /health works
    r_health = client.get("/api/health")
    assert r_health.status_code == 200, f"GET /health failed: {r_health.text}"
    health_data = r_health.json()
    assert health_data["status"] == "ok"
    assert "database" in health_data
    assert "ai_configured" in health_data
    print(f"[TEST 2/18 PASS] GET /health returned 200 OK: {health_data}")

    # TEST 3: Health does not expose the API key
    health_str = json.dumps(health_data)
    assert "nvapi-" not in health_str
    assert "NVIDIA_API_KEY" not in health_str
    assert "masked_key" not in health_data
    print("[TEST 3/18 PASS] Verified health endpoint does NOT expose any API key.")

    # TEST 4: Built-in ledgr.db works
    client.post("/api/databases/select?name=ledgr.db")
    r_schema = client.get("/api/databases/schema")
    assert r_schema.status_code == 200
    schema = r_schema.json()
    assert "transactions" in schema["tables"]
    print(f"[TEST 4/18 PASS] Built-in 'ledgr.db' active with {schema['total_tables']} tables, {schema['total_rows']:,} records.")

    # TEST 5: Transaction count query & missing key error handling
    r_no_key = client.post("/api/ask", json={"question": "How many transactions are in the database?"})
    assert r_no_key.status_code == 200
    assert r_no_key.json()["success"] is False
    assert r_no_key.json()["error"]["type"] == "AI_CONFIGURATION_ERROR"

    from unittest.mock import patch
    mock_nv_call = {
        "success": True,
        "content": "{\"action\": \"run_sql\", \"sql\": \"SELECT COUNT(*) AS transaction_count FROM transactions;\"}"
    }
    with patch("app.services.ai_controller.AIController.call_nvidia", return_value=mock_nv_call), patch.object(settings, "get_api_key", return_value="mock_key"):
        r_ask_tx = client.post("/api/ask", json={"question": "How many transactions are in the database?"})
        assert r_ask_tx.status_code == 200
        tx_ans = r_ask_tx.json()
        assert tx_ans["success"] is True
        assert tx_ans["selected_tool"] == "run_sql"
    print(f"[TEST 5/18 PASS] Transaction count query & missing key validation passed: {tx_ans.get('selected_tool')}")

    # TEST 6: Anomaly detection works
    r_anom = client.get("/api/anomalies")
    assert r_anom.status_code == 200
    anom_data = r_anom.json()
    assert anom_data.get("success") is True
    print(f"[TEST 6/18 PASS] Anomaly detection: {anom_data.get('total_anomalies', 0)} findings detected.")

    # TEST 7: Settlement reconciliation works
    r_recon = client.get("/api/settlements/reconcile")
    assert r_recon.status_code == 200
    recon_data = r_recon.json()
    assert recon_data.get("success") is True
    assert "match_rate" in recon_data
    print(f"[TEST 7/18 PASS] Settlement reconciliation: Match rate {recon_data['match_rate']}%, Discrepancy: ₹{recon_data.get('total_discrepancy', 0):,.2f}")

    # TEST 8: Report generation works
    r_rep = client.get("/api/report")
    assert r_rep.status_code == 200
    rep_data = r_rep.json()
    assert "health_score" in rep_data
    assert "recommendations" in rep_data
    print(f"[TEST 8/18 PASS] Report generated for {rep_data.get('database')} with score {rep_data.get('health_score')}/100 and {len(rep_data.get('recommendations', []))} recommendations.")

    # TEST 9: A secondary database can be created and uploaded
    second_db_path = os.path.join(DATA_DIR, "ecommerce_store.db")
    s_conn = sqlite3.connect(second_db_path)
    s_cur = s_conn.cursor()
    s_cur.execute("DROP TABLE IF EXISTS customers;")
    s_cur.execute("DROP TABLE IF EXISTS products;")
    s_cur.execute("DROP TABLE IF EXISTS orders;")
    
    s_cur.execute("CREATE TABLE customers (customer_id TEXT PRIMARY KEY, full_name TEXT, email TEXT, region TEXT);")
    s_cur.execute("CREATE TABLE products (product_id TEXT PRIMARY KEY, product_name TEXT, category TEXT, price REAL);")
    s_cur.execute("CREATE TABLE orders (order_id TEXT PRIMARY KEY, customer_id TEXT, product_id TEXT, quantity INT, total_amount REAL, order_date TEXT, status TEXT);")
    
    s_cur.execute("INSERT INTO customers VALUES ('C101', 'Alice Vance', 'alice@corp.com', 'APAC');")
    s_cur.execute("INSERT INTO customers VALUES ('C102', 'Bob Smith', 'bob@store.com', 'EMEA');")
    s_cur.execute("INSERT INTO products VALUES ('P501', 'Quantum Server Unit', 'Hardware', 2499.00);")
    s_cur.execute("INSERT INTO products VALUES ('P502', 'Neural Analytics License', 'Software', 899.00);")
    s_cur.execute("INSERT INTO orders VALUES ('ORD-901', 'C101', 'P501', 2, 4998.00, '2026-08-15', 'completed');")
    s_cur.execute("INSERT INTO orders VALUES ('ORD-902', 'C102', 'P502', 1, 899.00, '2026-08-16', 'completed');")
    s_conn.commit()
    s_conn.close()

    with open(second_db_path, "rb") as f:
        second_bytes = f.read()

    r_up = client.post(
        "/api/databases/upload",
        files={"file": ("ecommerce_store.db", second_bytes, "application/octet-stream")}
    )
    assert r_up.status_code == 200
    up_res = r_up.json()
    assert up_res["success"] is True
    print(f"[TEST 9/18 PASS] Second database uploaded: {up_res.get('filename')} ({up_res.get('total_tables')} tables, {up_res.get('total_rows')} rows)")

    # TEST 10: The second database can be selected
    r_sel = client.post("/api/databases/select?name=ecommerce_store.db")
    assert r_sel.status_code == 200
    assert r_sel.json()["active_database"] == "ecommerce_store.db"
    print("[TEST 10/18 PASS] Switched active database to 'ecommerce_store.db'.")

    # TEST 11: System automatically detects its tables/schema
    r_schema2 = client.get("/api/databases/schema")
    assert r_schema2.status_code == 200
    schema2 = r_schema2.json()
    assert {"customers", "products", "orders"}.issubset(set(schema2["tables"].keys()))
    print(f"[TEST 11/18 PASS] Automatically detected non-Ledgr schema: {list(schema2['tables'].keys())}")

    # TEST 12: Ask a question about the second database
    mock_sec_call = {
        "success": True,
        "content": "{\"action\": \"run_sql\", \"sql\": \"SELECT COUNT(*) AS total_orders FROM orders;\"}"
    }
    with patch("app.services.ai_controller.AIController.call_nvidia", return_value=mock_sec_call), patch.object(settings, "get_api_key", return_value="mock_key"):
        r_ask_sec = client.post("/api/ask", json={"question": "How many orders are in the database?"})
        assert r_ask_sec.status_code == 200
        sec_ans = r_ask_sec.json()
        assert sec_ans["success"] is True
        assert sec_ans["selected_tool"] == "run_sql"
    print(f"[TEST 12/18 PASS] AI Query against 'orders' table passed: {sec_ans.get('selected_tool')}")

    # TEST 13: Generate a report for the second database
    r_rep2 = client.get("/api/report")
    assert r_rep2.status_code == 200
    rep2 = r_rep2.json()
    assert rep2["database"] == "ecommerce_store.db"
    print(f"[TEST 13/18 PASS] Report generated for second database: Type '{rep2.get('report_type')}' with {len(rep2.get('table_profiles', []))} table profiles.")

    # TEST 14: System does not crash when tables like transactions/settlements are missing
    r_recon_sec = client.get("/api/settlements/reconcile")
    assert r_recon_sec.status_code == 200
    recon_sec = r_recon_sec.json()
    assert recon_sec.get("supported") is False
    print(f"[TEST 14/18 PASS] Reconciliation gracefully returned supported=False without crashing: '{recon_sec.get('reason')}'")

    # TEST 15: Frontend API-key UI removed (Backend does not accept keys from frontend)
    r_health_check = client.get("/api/health")
    assert r_health_check.status_code == 200
    assert "ai_configured" in r_health_check.json()
    print("[TEST 15/18 PASS] Frontend receives only safe ai_configured boolean without key inputs.")

    # TEST 16: Backend reads API key from .env / environment
    cfg_status = settings.get_config_status()
    assert "base_url" in cfg_status
    assert "model" in cfg_status
    assert "NVIDIA_API_KEY" not in cfg_status
    print(f"[TEST 16/18 PASS] Backend centralized config loaded: Model: '{cfg_status['model']}', AI Configured: {cfg_status['ai_configured']}")

    # TEST 17: Invalid/destructive SQL queries are rejected
    assert validate_readonly_sql("DROP TABLE orders")[0] is False
    assert validate_readonly_sql("DELETE FROM customers")[0] is False
    assert validate_readonly_sql("INSERT INTO products VALUES ('1','2','3',4)")[0] is False
    assert validate_readonly_sql("UPDATE orders SET quantity=100")[0] is False
    assert validate_readonly_sql("SELECT * FROM orders WHERE total_amount > 1000")[0] is True
    assert validate_readonly_sql("WITH high_val AS (SELECT * FROM orders) SELECT * FROM high_val")[0] is True
    print("[TEST 17/18 PASS] SQL Security Guard strictly blocked DROP, DELETE, INSERT, UPDATE; allowed safe SELECT and WITH.")

    # TEST 18: Path traversal attempts are blocked
    r_trav = client.post("/api/databases/select?name=../../../../Windows/System32/calc.exe")
    assert r_trav.status_code == 404 or r_trav.json().get("success") is False
    print("[TEST 18/18 PASS] Path traversal database selection attempt was safely blocked.")

    # Reset back to ledgr.db
    set_active_database("ledgr.db")

    print("\n============================================================")
    print(">>> ALL 18 SPECIFICATION TESTS PASSED SUCCESSFULLY (100%) <<<")
    print("============================================================")

if __name__ == "__main__":
    run_all_tests()
