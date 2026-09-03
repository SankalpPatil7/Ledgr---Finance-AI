# LEDGR — AI-Powered Finance & Data Controller

> *"Your Autonomous AI Finance Controller — Analyze, Reconcile, Detect, Act."*

LEDGR is an enterprise-grade AI finance controller, data intelligence engine, and automated audit platform. It connects to financial databases, spreadsheets (CSV/Excel), and generic database stores, introspects active schemas, identifies anomalies using Machine Learning (`IsolationForest`) and deterministic rules, reconciles bank settlement variances, scores merchant risks, executes safe read-only SQL, and produces executive-ready audit reports.

---

## 🌟 Key Capabilities

1. **Autonomous AI Finance Controller & Cloud Agent**:
   - Converts natural-language queries into verified read-only SQL executions, ML anomaly scans, settlement reconciliations, and merchant investigations.
   - Powered by NVIDIA NIM (`meta/llama-3.3-70b-instruct` / `nvidia/nemotron-3-ultra-550b-a55b`) when configured, with high-precision offline local controller fallback.
   - Generates transparent, step-by-step **Execution Traces** detailing intent classification, dynamic tool selection, parameter grounding, and synthesis.

2. **Automated Settlement Reconciliation Engine**:
   - Audits internal ledger settlement values against bank-reported statements.
   - Identifies exact financial discrepancies (e.g. 6 mismatches totaling **₹17,134.04** on `ledgr.db`).
   - One-click individual & batch flagging directly from the reconciliation inspector.
   - Gracefully handles non-settlement schemas with clear compatibility notices.

3. **Hybrid Anomaly Detection (ML + Financial Rules)**:
   - **Rule 1 (Duplicate Payouts)**: Catches duplicate payouts on the same date/merchant/amount (e.g. `M64b5510b` ₹48,250 on 2026-08-06).
   - **Rule 2 (Refund Velocity Spikes)**: Detects merchants with >8 refunds in a 3-day sliding window (e.g. `Mf586d65` with 15 refunds).
   - **Machine Learning (IsolationForest)**: Scikit-learn unsupervised outlier detector identifying distribution deviations.

4. **Universal Database & Schema Support**:
   - Ingests SQLite (`.db`, `.sqlite`), CSV (`.csv`), and Excel (`.xlsx`, `.xls`).
   - Dynamically analyzes arbitrary databases (e.g. `customers`, `orders`, `products`) without crashing or assuming hardcoded Ledgr tables.
   - Generates complete data quality profiling, null counts, duplicate detections, and dynamic SQL queries for any uploaded schema.

5. **Strict Security & Environment-Based Configuration**:
   - **Zero Frontend API Key Exposure**: All API keys are loaded securely from `backend/.env` via `python-dotenv`.
   - **SQL Security Guard**: Strictly restricts AI-generated SQL to read-only `SELECT` and `WITH ... SELECT` operations, blocking `DROP`, `DELETE`, `INSERT`, `UPDATE`, `ALTER`, etc.
   - **Path Traversal Protection**: Uploaded and selected database paths are sanitized and confined strictly to the backend `data/` directory.

---

## ⚙️ Backend Configuration (.env)

The API key and AI parameters are managed exclusively in `backend/.env`:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Copy the example environment file
cp .env.example .env

# 3. Add your NVIDIA API Key in backend/.env:
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.3-70b-instruct
NVIDIA_TIMEOUT=15.0
NVIDIA_MAX_RETRIES=3
```

*Note: If `NVIDIA_API_KEY` is omitted or empty, LEDGR runs seamlessly using its high-precision local analytical core.*

---

## 🚀 Quick Start

### 1. Launch Full Application (Backend + Frontend)
```bash
python run.py
```
- **Web Application**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Development Mode
```bash
cd frontend
npm run dev
```

### 3. Run Automated 18-Point Verification Test Suite
```bash
cd backend
python test_suite.py
```

---

## 🛡️ SQL Security & Safety Layer

AI-generated database queries are restricted to **Read-Only `SELECT`** statements:
- ❌ **Blocked**: `DROP`, `DELETE`, `INSERT`, `UPDATE`, `ALTER`, `CREATE`, `ATTACH`, `DETACH`, `TRUNCATE`, `EXEC`.
- ❌ **Blocked**: Multi-statement stacked SQL queries (semicolon chaining).
- ❌ **Blocked**: Path traversal attempts via `..` or absolute system paths.
- ✅ **Allowed**: Single validated `SELECT` / `WITH ... SELECT` queries.

---

## 📑 Core API Endpoints

- `GET /api/health` — Returns safe system status & database state (no API keys exposed)
- `POST /api/ask` — Natural-language query execution & trace generator
- `GET /api/kpis` — Real-time financial metrics, rates, and exposure
- `GET /api/settlements/reconcile` — Internal vs bank reconciliation audit
- `GET /api/anomalies` — Hybrid ML & rule-based findings
- `GET /api/merchants` — Merchant risk leaderboard
- `GET /api/merchants/{id}/investigate` — Merchant deep-dive dossier
- `GET /api/transactions` — Paginated and filterable transaction ledger
- `GET /api/flags` & `POST /api/flags` — Investigation flag management
- `GET /api/audit-logs` — Immutable audit log stream
- `GET /api/report` — Dynamic executive audit report
- `POST /api/databases/upload` — Safe database/spreadsheet ingestion (SQLite, CSV, Excel)
- `POST /api/databases/select` — Safe database switcher
