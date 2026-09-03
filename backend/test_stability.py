import sys
import os
import time
from unittest.mock import patch, MagicMock
import httpx

sys.stdout.reconfigure(encoding="utf-8")

print("=== CHECK 2: Health Check ===")
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
r = client.get("/api/health")
print("Health status:", r.status_code, r.json())
assert r.status_code == 200
assert r.json()["status"] == "ok"

print("\n=== CHECK 3: Database run_sql ===")
import tools
sql_res = tools.run_sql("SELECT COUNT(*) AS transaction_count FROM transactions;")
print("run_sql result:", sql_res)
assert sql_res["success"] is True
assert sql_res["rows"][0]["transaction_count"] == 1200

print("\n=== CHECK 4: Anomaly Detection ===")
anom_res = tools.detect_anomalies()
print("detect_anomalies count:", anom_res["total_anomalies"])
assert anom_res["success"] is True
assert anom_res["total_anomalies"] > 0

print("\n=== CHECK 5: Settlement Reconciliation ===")
recon_res = tools.reconcile_settlements()
print("reconcile_settlements match_rate:", recon_res["match_rate"])
assert recon_res["success"] is True
assert recon_res["match_rate"] > 0

print("\n=== CHECK 6 & 7: Missing Key Handling in agent.ask ===")
from agent import ask
from app.config import settings

# Test when key is missing/empty
with patch.object(settings, "get_api_key", return_value=""):
    r_no_key = ask("How many transactions are in the database?")
    print("Missing key response:", r_no_key)
    assert r_no_key["success"] is False
    assert r_no_key["error"]["type"] == "AI_CONFIGURATION_ERROR"
    assert "NVIDIA API key is not configured" in r_no_key["error"]["message"]

print("\n=== CHECK 6 & 8: NVIDIA Simulated Call with Retry & Error Handling ===")
from app.services.ai_controller import ai_controller

# Test successful NVIDIA response parsing and execution
mock_200_resp = MagicMock()
mock_200_resp.status_code = 200
mock_200_resp.json.return_value = {
    "choices": [{"message": {"content": "{\"action\": \"run_sql\", \"sql\": \"SELECT COUNT(*) AS transaction_count FROM transactions;\"}"}}]
}

with patch("httpx.Client.post", return_value=mock_200_resp), patch.object(settings, "get_api_key", return_value="test_key"):
    r_ai = ask("How many transactions are in the database?")
    print("AI Answer success:", r_ai["success"])
    print("Selected Tool:", r_ai.get("selected_tool"))
    print("Answer text:", r_ai.get("answer"))
    assert r_ai["success"] is True
    assert r_ai["selected_tool"] == "run_sql"
    assert r_ai["data_table"]["rows"][0]["transaction_count"] == 1200

# Test 401 Auth Error
mock_401_resp = MagicMock()
mock_401_resp.status_code = 401
with patch("httpx.Client.post", return_value=mock_401_resp), patch.object(settings, "get_api_key", return_value="bad_key"):
    r_auth_err = ask("How many transactions?")
    print("Auth error response:", r_auth_err)
    assert r_auth_err["success"] is False
    assert r_auth_err["error"]["type"] == "AUTH_ERROR"

# Test 429 Rate Limit with 3 retries
call_count = 0
def mock_429_post(*args, **kwargs):
    global call_count
    call_count += 1
    m = MagicMock()
    m.status_code = 429
    return m

call_count = 0
with patch("httpx.Client.post", side_effect=mock_429_post), patch.object(settings, "get_api_key", return_value="test_key"), patch("time.sleep", return_value=None):
    r_429 = ask("How many transactions?")
    print("429 Rate Limit response:", r_429)
    print("Attempts made:", call_count)
    assert call_count == 3
    assert r_429["success"] is False
    assert r_429["error"]["type"] == "RATE_LIMIT_ERROR"

# Test 503 Service Unavailable with 3 retries
call_count = 0
def mock_503_post(*args, **kwargs):
    global call_count
    call_count += 1
    m = MagicMock()
    m.status_code = 503
    return m

call_count = 0
with patch("httpx.Client.post", side_effect=mock_503_post), patch.object(settings, "get_api_key", return_value="test_key"), patch("time.sleep", return_value=None):
    r_503 = ask("How many transactions?")
    print("503 Service Unavailable response:", r_503)
    print("Attempts made:", call_count)
    assert call_count == 3
    assert r_503["success"] is False
    assert r_503["error"]["type"] == "AI_SERVICE_ERROR"

# Test Timeout
call_count = 0
def mock_timeout_post(*args, **kwargs):
    global call_count
    call_count += 1
    raise httpx.TimeoutException("Connection timed out")

call_count = 0
with patch("httpx.Client.post", side_effect=mock_timeout_post), patch.object(settings, "get_api_key", return_value="test_key"), patch("time.sleep", return_value=None):
    r_timeout = ask("How many transactions?")
    print("Timeout response:", r_timeout)
    print("Attempts made:", call_count)
    assert call_count == 3
    assert r_timeout["success"] is False
    assert r_timeout["error"]["type"] == "TIMEOUT_ERROR"

print("\n=== CHECK 9: Security & Git Verification ===")
gitignore_path = os.path.abspath(os.path.join(".", "..", ".gitignore"))
if os.path.exists(gitignore_path):
    with open(gitignore_path, "r") as f:
        git_content = f.read()
    print(".gitignore has .env:", ".env" in git_content)
    assert ".env" in git_content

print("\n>>> ALL 9 STABILITY CHECKS PASSED PERFECTLY! <<<")
