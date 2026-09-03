import re
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import httpx

from app.config import settings
from app.database import db_manager
from app.security import validate_readonly_sql
from app.services.reconciliation_engine import reconciliation_engine
from app.services.anomaly_detector import anomaly_detector
from app.services.merchant_risk_engine import merchant_risk_engine
from app.services.finance_engine import finance_engine
from app.services.report_generator import report_generator
from app.services.audit_service import audit_service
from app.services.schema_intelligence import analyze_schema_intelligence

class AIController:
    def __init__(self):
        self.available_tools = [
            "run_sql",
            "get_schema_description",
            "get_database_status",
            "detect_anomalies",
            "reconcile_settlements",
            "investigate_merchant",
            "get_merchant_risks",
            "get_financial_kpis",
            "flag_record",
            "generate_health_report",
            "simulate_what_if"
        ]

    def call_nvidia(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.1, 
        max_tokens: int = 800
    ) -> Dict[str, Any]:
        """
        Single centralized helper for all NVIDIA API requests.
        Enforces timeout (30s), limited retries (max 3 with exponential backoff on 429/503),
        and returns clean structured errors without exposing secrets or stack traces.
        """
        api_key = settings.get_api_key()
        if not api_key:
            return {
                "success": False,
                "error": {
                    "type": "AI_CONFIGURATION_ERROR",
                    "message": "NVIDIA API key is not configured. Add NVIDIA_API_KEY to backend/.env."
                }
            }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.get_model(),
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        url = f"{settings.get_base_url()}/chat/completions"
        max_attempts = min(settings.max_retries, 3)

        for attempt in range(1, max_attempts + 1):
            try:
                with httpx.Client(timeout=settings.request_timeout) as client:
                    resp = client.post(url, headers=headers, json=payload)

                    if resp.status_code == 200:
                        data = resp.json()
                        raw_content = data["choices"][0]["message"]["content"].strip()
                        return {
                            "success": True,
                            "content": raw_content,
                            "data": data
                        }

                    elif resp.status_code in [401, 403]:
                        return {
                            "success": False,
                            "error": {
                                "type": "AUTH_ERROR",
                                "message": "NVIDIA API authentication failed. Check NVIDIA_API_KEY in backend/.env."
                            }
                        }

                    elif resp.status_code == 429:
                        if attempt < max_attempts:
                            time.sleep(1.0 * (2 ** (attempt - 1)))
                            continue
                        return {
                            "success": False,
                            "error": {
                                "type": "RATE_LIMIT_ERROR",
                                "message": "NVIDIA API rate limit reached. Please try again shortly."
                            }
                        }

                    elif resp.status_code == 503:
                        if attempt < max_attempts:
                            time.sleep(1.0 * (2 ** (attempt - 1)))
                            continue
                        return {
                            "success": False,
                            "error": {
                                "type": "AI_SERVICE_ERROR",
                                "message": "NVIDIA AI service is temporarily unavailable. Please try again."
                            }
                        }

                    elif resp.status_code in [500, 502]:
                        if attempt < max_attempts:
                            time.sleep(1.0 * (2 ** (attempt - 1)))
                            continue
                        return {
                            "success": False,
                            "error": {
                                "type": "AI_SERVICE_ERROR",
                                "message": "NVIDIA AI service is temporarily unavailable. Please try again."
                            }
                        }

                    else:
                        return {
                            "success": False,
                            "error": {
                                "type": "AI_SERVICE_ERROR",
                                "message": f"NVIDIA API returned HTTP {resp.status_code}."
                            }
                        }

            except httpx.TimeoutException:
                if attempt < max_attempts:
                    time.sleep(1.0 * (2 ** (attempt - 1)))
                    continue
                return {
                    "success": False,
                    "error": {
                        "type": "TIMEOUT_ERROR",
                        "message": "AI service request timed out. Please try again."
                    }
                }

            except httpx.RequestError:
                if attempt < max_attempts:
                    time.sleep(1.0 * (2 ** (attempt - 1)))
                    continue
                return {
                    "success": False,
                    "error": {
                        "type": "CONNECTION_ERROR",
                        "message": "Unable to connect to NVIDIA AI service. Please check network connection."
                    }
                }

            except Exception:
                if attempt == max_attempts:
                    return {
                        "success": False,
                        "error": {
                            "type": "AI_SERVICE_ERROR",
                            "message": "An unexpected error occurred while communicating with the AI service."
                        }
                    }

        return {
            "success": False,
            "error": {
                "type": "AI_SERVICE_ERROR",
                "message": "NVIDIA AI service is temporarily unavailable."
            }
        }

    def ask(self, question: str) -> Dict[str, Any]:
        trace = []
        start_time = datetime.now()
        
        trace.append({
            "step": 1,
            "stage": "CONTROLLER_STARTED",
            "message": f"AI Controller initialized for database: '{db_manager.active_db_name}'.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        # Explicit check for API key per Issue 4 (no silent fallback)
        if not settings.get_api_key():
            trace.append({
                "step": 2,
                "stage": "AI_CONFIG_ERROR",
                "message": "NVIDIA API key is not configured in backend/.env.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })
            return {
                "success": False,
                "error": {
                    "type": "AI_CONFIGURATION_ERROR",
                    "message": "NVIDIA API key is not configured. Add NVIDIA_API_KEY to backend/.env."
                },
                "trace": trace,
                "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
            }

        trace.append({
            "step": 2,
            "stage": "AI_ROUTING",
            "message": f"Routing to NVIDIA Cloud Engine ({settings.get_model()}) with active schema grounding.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        return self._ask_nvidia(question, trace, start_time)

    def _ask_nvidia(self, question: str, trace: list, start_time: datetime) -> Dict[str, Any]:
        schema_summary = db_manager.get_schema_summary()
        tables_dict = schema_summary.get("tables", {})
        
        schema_text = ""
        for t_name, t_info in tables_dict.items():
            cols = [f"{c['name']} ({c.get('type', 'TEXT')})" for c in t_info.get("columns", [])]
            schema_text += f"- Table `{t_name}` ({t_info.get('row_count', 0)} rows): {', '.join(cols)}\n"

        has_settlements = "settlements" in tables_dict
        has_merchants = "merchants" in tables_dict
        has_refunds = "refunds" in tables_dict

        system_prompt = f"""You are LEDGR Autonomous AI Finance & Data Controller.
Your goal is to accurately answer user questions using the active SQLite database.

ACTIVE DATABASE: {schema_summary.get('database', 'active.db')}
SCHEMA STRUCTURE:
{schema_text}

INSTRUCTIONS:
1. To query data, output JSON: {{"action": "run_sql", "sql": "SELECT ... FROM ... LIMIT 50"}}
2. If asking for anomalies/fraud: {{"action": "detect_anomalies"}}
3. If asking for reconciliation: {{"action": "reconcile_settlements"}}
4. If asking for merchant investigation: {{"action": "investigate_merchant", "merchant_id": "..."}}
5. If asking to flag a transaction: {{"action": "flag_transaction", "transaction_id": "...", "reason": "..."}}
6. If full executive report: {{"action": "generate_health_report"}}
7. Otherwise output: {{"action": "direct_answer", "answer": "..."}}

IMPORTANT: Generate only READ-ONLY SELECT queries. Output ONLY the JSON object without markdown fences."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]

        nv_resp = self.call_nvidia(messages, temperature=0.1, max_tokens=800)

        if not nv_resp.get("success"):
            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_FAILURE",
                "message": nv_resp.get("error", {}).get("message", "AI service request failed."),
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })
            return {
                "success": False,
                "error": nv_resp.get("error", {
                    "type": "AI_SERVICE_ERROR",
                    "message": "AI service request failed."
                }),
                "question": question,
                "trace": trace,
                "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
            }

        raw_content = nv_resp.get("content", "").strip()
        clean_json = re.sub(r"^```(json)?|```$", "", raw_content, flags=re.MULTILINE).strip()
        
        try:
            parsed = json.loads(clean_json)
        except Exception:
            parsed = {"action": "direct_answer", "answer": raw_content}

        action = parsed.get("action", "direct_answer")

        if action == "run_sql":
            sql_query = parsed.get("sql", "")
            selected_tool = "run_sql"
            tool_input = {"query": sql_query}
            
            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_SELECTED",
                "message": f"Selected tool 'run_sql' with query: `{sql_query}`",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })

            is_safe, sec_reason = validate_readonly_sql(sql_query)
            if not is_safe:
                trace.append({
                    "step": len(trace) + 1,
                    "stage": "TOOL_FAILURE",
                    "message": f"Security violation: {sec_reason}",
                    "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
                })
                return {
                    "success": False,
                    "error": {
                        "type": "SECURITY_VIOLATION",
                        "message": sec_reason
                    },
                    "question": question,
                    "selected_tool": "run_sql",
                    "tool_input": tool_input,
                    "trace": trace,
                    "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
                }

            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_RUNNING",
                "message": f"Executing query against `{db_manager.active_db_name}`.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })

            try:
                sql_result = db_manager.execute_read_sql(sql_query)
            except Exception as sql_err:
                fix_messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question},
                    {"role": "assistant", "content": clean_json},
                    {"role": "user", "content": f'SQL failed with error: {str(sql_err)}. Return corrected JSON: {{"action": "run_sql", "sql": "..."}}'}
                ]
                fix_resp = self.call_nvidia(fix_messages, temperature=0.1, max_tokens=400)
                if fix_resp.get("success"):
                    fix_clean = re.sub(r"^```(json)?|```$", "", fix_resp.get("content", ""), flags=re.MULTILINE).strip()
                    try:
                        fix_parsed = json.loads(fix_clean)
                        sql_query = fix_parsed.get("sql", sql_query)
                        sql_result = db_manager.execute_read_sql(sql_query)
                    except Exception as e2:
                        trace.append({
                            "step": len(trace) + 1,
                            "stage": "TOOL_FAILURE",
                            "message": f"SQL execution error: {str(e2)}",
                            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
                        })
                        return {
                            "success": False,
                            "error": {"type": "SQL_ERROR", "message": str(e2)},
                            "question": question,
                            "trace": trace,
                            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
                        }
                else:
                    trace.append({
                        "step": len(trace) + 1,
                        "stage": "TOOL_FAILURE",
                        "message": f"SQL execution error: {str(sql_err)}",
                        "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
                    })
                    return {
                        "success": False,
                        "error": {"type": "SQL_ERROR", "message": str(sql_err)},
                        "question": question,
                        "trace": trace,
                        "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
                    }

            row_count = sql_result.get("row_count", 0)
            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_SUCCESS",
                "message": f"Query returned {row_count} rows from database.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })

            summary_messages = [
                {"role": "system", "content": "You are LEDGR Autonomous Finance Controller. Summarize the query results concisely in markdown."},
                {"role": "user", "content": f"User question: {question}\nExecuted SQL: {sql_query}\nResult rows: {json.dumps(sql_result.get('rows', [])[:10])}\nTotal records: {row_count}"}
            ]
            sum_resp = self.call_nvidia(summary_messages, temperature=0.2, max_tokens=500)
            if sum_resp.get("success"):
                summary_text = sum_resp.get("content", "").strip()
            else:
                summary_text = f"Query executed successfully against `{db_manager.active_db_name}` and returned {row_count} records."

            trace.append({
                "step": len(trace) + 1,
                "stage": "CONTROLLER_COMPLETED",
                "message": "AI controller synthesized final response.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })

            return {
                "success": True,
                "question": question,
                "ai_engine": f"NVIDIA Cloud ({settings.get_model()})",
                "selected_tool": "run_sql",
                "tool_input": {"query": sql_query},
                "tool_result": sql_result,
                "data_table": sql_result,
                "answer": summary_text,
                "trace": trace,
                "suggested_actions": ["Export Results", "Inspect Schema", "Ask Follow-Up Query"],
                "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
            }

        elif action == "detect_anomalies" and (has_settlements or has_refunds):
            return self._execute_tool_anomalies(question, trace, start_time, f"NVIDIA Cloud ({settings.get_model()})")
        elif action == "reconcile_settlements" and has_settlements:
            return self._execute_tool_reconciliation(question, trace, start_time, f"NVIDIA Cloud ({settings.get_model()})")
        elif action == "investigate_merchant" and has_merchants:
            return self._execute_tool_investigation(question, parsed.get("merchant_id", "Mf586d65"), trace, start_time, f"NVIDIA Cloud ({settings.get_model()})")
        elif action == "flag_transaction":
            return self._execute_tool_flag(question, parsed.get("transaction_id", ""), parsed.get("reason", "Flagged by AI"), trace, start_time, f"NVIDIA Cloud ({settings.get_model()})")
        elif action == "generate_health_report":
            return self._execute_tool_report(question, trace, start_time, f"NVIDIA Cloud ({settings.get_model()})")
        elif action == "direct_answer":
            trace.append({
                "step": len(trace) + 1,
                "stage": "CONTROLLER_COMPLETED",
                "message": "AI controller responded directly.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })
            return {
                "success": True,
                "question": question,
                "ai_engine": f"NVIDIA Cloud ({settings.get_model()})",
                "selected_tool": "get_schema_description",
                "tool_input": {},
                "answer": parsed.get("answer", raw_content),
                "trace": trace,
                "suggested_actions": ["Ask specific query", "View Schema", "Run Full Audit"],
                "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
            }

        return {
            "success": True,
            "question": question,
            "ai_engine": f"NVIDIA Cloud ({settings.get_model()})",
            "selected_tool": "get_schema_description",
            "tool_input": {},
            "answer": raw_content,
            "trace": trace,
            "suggested_actions": ["Ask specific query", "View Schema", "Run Full Audit"],
            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
        }

    def _ask_local(self, question: str, trace: list, start_time: datetime) -> Dict[str, Any]:
        q_lower = question.strip().lower()
        selected_tool = None
        tool_input = None
        tool_result = None
        answer_text = ""
        suggested_actions = []
        data_table = None

        if any(w in q_lower for w in ["database status", "which database", "active database", "database tables"]):
            selected_tool = "get_database_status"
            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_SELECTION",
                "message": "Selected tool get_database_status to introspect database state.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })
            schema = db_manager.get_schema_summary()
            tool_result = schema
            table_list = ", ".join(list(schema["tables"].keys()))
            answer_text = f"Active Database: **{schema['database']}**\n- Total Tables: **{schema['total_tables']}** ({table_list})\n- Total Records: **{schema['total_rows']:,}**"
            suggested_actions = ["Inspect Schema", "Check Data Quality", "Run Full Audit"]

        elif any(w in q_lower for w in ["schema", "columns in", "table structure"]):
            selected_tool = "get_schema_description"
            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_SELECTION",
                "message": "Selected tool get_schema_description to introspect table columns.",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })
            schema = db_manager.get_schema_summary()
            tool_result = schema
            answer_text = f"The active database **{schema['database']}** has **{schema['total_tables']}** tables:\n\n"
            for t_name, t_info in schema["tables"].items():
                col_names = [c["name"] for c in t_info["columns"]]
                answer_text += f"- **`{t_name}`** ({t_info['row_count']} rows): {', '.join(col_names[:6])}{'...' if len(col_names)>6 else ''}\n"
            suggested_actions = ["Explore Transactions", "View Data Quality", "Run SQL Query"]

        elif any(w in q_lower for w in ["duplicate payout", "fraud", "anomaly", "anomalies", "suspicious", "spike"]):
            return self._execute_tool_anomalies(question, trace, start_time, "Local AI Core")

        elif any(w in q_lower for w in ["reconcil", "mismatch", "settlement difference", "bank reported"]):
            return self._execute_tool_reconciliation(question, trace, start_time, "Local AI Core")

        elif "investigate" in q_lower or ("merchant" in q_lower and any(char.isdigit() for char in question)):
            m_match = re.search(r"M[a-f0-9]{7,8}|M[a-zA-Z0-9_]+", question, re.IGNORECASE)
            m_id = m_match.group(0) if m_match else "Mf586d65"
            return self._execute_tool_investigation(question, m_id, trace, start_time, "Local AI Core")

        elif any(w in q_lower for w in ["risk", "exposure", "kpi", "financial health", "revenue", "loss", "biggest problems"]):
            return self._execute_tool_kpis(question, trace, start_time, "Local AI Core")

        elif any(w in q_lower for w in ["report", "executive audit", "generate report", "health report"]):
            return self._execute_tool_report(question, trace, start_time, "Local AI Core")

        else:
            selected_tool = "run_sql"
            sql_query = self._generate_local_sql(question)
            tool_input = {"query": sql_query}
            
            trace.append({
                "step": len(trace) + 1,
                "stage": "TOOL_SELECTION",
                "message": f"Selected tool 'run_sql' with query: `{sql_query}`",
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
            })

            is_safe, sec_reason = validate_readonly_sql(sql_query)
            if not is_safe:
                return {
                    "success": False,
                    "question": question,
                    "ai_engine": "Local AI Core",
                    "selected_tool": "run_sql",
                    "tool_input": tool_input,
                    "answer": f"Security violation: {sec_reason}",
                    "trace": trace,
                    "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
                }

            try:
                sql_res = db_manager.execute_read_sql(sql_query)
                tool_result = sql_res
                data_table = sql_res
                row_count = sql_res.get("row_count", 0)

                trace.append({
                    "step": len(trace) + 1,
                    "stage": "TOOL_EXECUTION",
                    "message": f"Query executed successfully against `{db_manager.active_db_name}` ({row_count} rows returned).",
                    "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
                })

                if row_count == 1 and len(sql_res["columns"]) == 1:
                    val = list(sql_res["rows"][0].values())[0]
                    val_str = f"₹{val:,.2f}" if isinstance(val, (int, float)) and val > 100 else f"{val:,}" if isinstance(val, int) else str(val)
                    answer_text = f"The query against **{db_manager.active_db_name}** returned: **{val_str}**."
                else:
                    answer_text = f"Found **{row_count:,}** records in `{db_manager.active_db_name}` matching your criteria."
                
                suggested_actions = ["Export Table to CSV", "Ask Follow-Up Query", "Flag Anomalies"]
                
                trace.append({
                    "step": len(trace) + 1,
                    "stage": "SYNTHESIS",
                    "message": "Synthesized structured explanation grounded in verified database records.",
                    "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
                })
            except Exception as e:
                answer_text = f"Query execution failed: {str(e)}"

        execution_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)

        return {
            "success": True,
            "question": question,
            "ai_engine": "Local AI Core",
            "selected_tool": selected_tool,
            "tool_input": tool_input,
            "tool_result": tool_result,
            "data_table": data_table,
            "answer": answer_text,
            "suggested_actions": suggested_actions,
            "trace": trace,
            "execution_time_ms": execution_time_ms
        }

    def _execute_tool_anomalies(self, question: str, trace: list, start_time: datetime, engine_name: str) -> Dict[str, Any]:
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_SELECTION",
            "message": "Selected tool 'detect_anomalies' (Hybrid ML + Rule Engine).",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        findings_data = anomaly_detector.detect_all_anomalies()
        findings = findings_data.get("findings", [])
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_EXECUTION",
            "message": f"Executed hybrid anomaly detection. Found {len(findings)} anomalies ({findings_data.get('duplicate_payouts_count', 0)} duplicates, {findings_data.get('refund_spikes_count', 0)} spikes, {findings_data.get('ml_outliers_count', 0)} ML outliers).",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        
        answer_text = f"### Anomaly & Fraud Audit Results\nFound **{len(findings)}** anomalous records in `{db_manager.active_db_name}`:\n\n"
        for f in findings[:5]:
            answer_text += f"- **[{f['severity']}] {f['title']}**: {f['explanation']}\n"
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "SYNTHESIS",
            "message": "Synthesized risk findings with recommended mitigation protocols.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        return {
            "success": True,
            "question": question,
            "ai_engine": engine_name,
            "selected_tool": "detect_anomalies",
            "tool_input": {},
            "tool_result": findings_data,
            "answer": answer_text,
            "suggested_actions": ["Freeze Duplicate Payouts", "Audit Top Risk Merchant", "Create Investigation Flag"],
            "trace": trace,
            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
        }

    def _execute_tool_reconciliation(self, question: str, trace: list, start_time: datetime, engine_name: str) -> Dict[str, Any]:
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_SELECTION",
            "message": "Selected tool 'reconcile_settlements' to audit bank reported vs internal settlement amounts.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        recon = reconciliation_engine.reconcile()
        mismatches = recon.get("mismatches", [])
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_EXECUTION",
            "message": f"Reconciled {recon.get('total_settlements', 0)} settlements. Found {recon.get('mismatched_count', 0)} mismatches totaling ₹{recon.get('total_discrepancy', 0):,.2f}.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        
        answer_text = f"### Settlement Reconciliation Summary\n"
        answer_text += f"- **Match Rate**: {recon.get('match_rate', 0)}% ({recon.get('matched_count', 0)} matched / {recon.get('total_settlements', 0)} total)\n"
        answer_text += f"- **Discrepancies**: **{recon.get('mismatched_count', 0)}** mismatches totaling **₹{recon.get('total_discrepancy', 0):,.2f}**\n\n"
        for m in mismatches[:4]:
            diff_val = m.get("discrepancy_amount") if m.get("discrepancy_amount") is not None else m.get("difference", 0.0)
            answer_text += f"- `{m.get('settlement_id')}` ({m.get('merchant_name', 'Merchant')}): Internal ₹{m.get('settlement_amount', 0):,.2f} vs Bank ₹{m.get('bank_reported_amount', 0):,.2f} (Diff: **₹{diff_val:,.2f}**)\n"
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "SYNTHESIS",
            "message": "Calculated total exposure and generated clawback recommendations.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        return {
            "success": True,
            "question": question,
            "ai_engine": engine_name,
            "selected_tool": "reconcile_settlements",
            "tool_input": {},
            "tool_result": recon,
            "answer": answer_text,
            "suggested_actions": ["Flag All Mismatches", "Initiate Bank Clawback", "Export Reconciliation Sheet"],
            "trace": trace,
            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
        }

    def _execute_tool_investigation(self, question: str, merchant_id: str, trace: list, start_time: datetime, engine_name: str) -> Dict[str, Any]:
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_SELECTION",
            "message": f"Selected tool 'investigate_merchant' for entity '{merchant_id}'.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        inv = merchant_risk_engine.investigate_merchant(merchant_id)
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_EXECUTION",
            "message": f"Compiled dossier for {inv.get('merchant_name', merchant_id)}: Risk Score {inv.get('risk_score', 0)}/100 ({inv.get('risk_level', 'UNKNOWN')}).",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        
        answer_text = f"### Investigation Dossier: {inv.get('merchant_name', merchant_id)} (`{merchant_id}`)\n"
        answer_text += f"- **Risk Assessment**: **{inv.get('risk_score', 0)}/100** ({inv.get('risk_level', 'UNKNOWN')})\n"
        answer_text += f"- **Total Volume**: ₹{inv.get('metrics', {}).get('total_volume', 0):,.2f} across {inv.get('metrics', {}).get('transaction_count', 0)} txs\n"
        answer_text += f"- **Refund Volume**: ₹{inv.get('metrics', {}).get('refund_volume', 0):,.2f} ({inv.get('metrics', {}).get('refund_rate', 0)}% rate)\n"
        answer_text += f"- **Dispute Volume**: ₹{inv.get('metrics', {}).get('dispute_volume', 0):,.2f} ({inv.get('metrics', {}).get('dispute_rate', 0)}% rate)\n\n"
        for r in inv.get("reasons", []):
            answer_text += f"- {r}\n"

        trace.append({
            "step": len(trace) + 1,
            "stage": "SYNTHESIS",
            "message": "Formulated risk containment directives and remediation actions.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        return {
            "success": True,
            "question": question,
            "ai_engine": engine_name,
            "selected_tool": "investigate_merchant",
            "tool_input": {"merchant_id": merchant_id},
            "tool_result": inv,
            "answer": answer_text,
            "suggested_actions": ["Place Merchant on Hold", "Open Investigation Case", "Adjust Risk Thresholds"],
            "trace": trace,
            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
        }

    def _execute_tool_kpis(self, question: str, trace: list, start_time: datetime, engine_name: str) -> Dict[str, Any]:
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_SELECTION",
            "message": "Selected tool 'get_financial_kpis' to evaluate overall system health and financial risk.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        kpis = finance_engine.get_dashboard_kpis()
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_EXECUTION",
            "message": f"Evaluated ledger: Financial Health Score {kpis.get('health_score', 0)}/100, Total Exposure: ₹{kpis.get('exposure', {}).get('total_potential_exposure', 0):,.2f}.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        
        answer_text = f"### Financial Health & Risk Overview\n"
        answer_text += f"- **Overall Health Score**: **{kpis.get('health_score', 0)}/100**\n"
        answer_text += f"- **Net Revenue**: **₹{kpis.get('net_revenue', 0):,.2f}**\n"
        answer_text += f"- **Total Potential Exposure**: **₹{kpis.get('exposure', {}).get('total_potential_exposure', 0):,.2f}** (Discrepancies: ₹{kpis.get('exposure', {}).get('settlement_discrepancy', 0):,.2f} | Duplicate Payouts: ₹{kpis.get('exposure', {}).get('duplicate_payouts', 0):,.2f})\n"
        answer_text += f"- **High Risk Merchants**: **{kpis.get('merchants', {}).get('high_risk_count', 0)}** active entities requiring review.\n"

        trace.append({
            "step": len(trace) + 1,
            "stage": "SYNTHESIS",
            "message": "Formulated executive recommendations for financial controller.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        return {
            "success": True,
            "question": question,
            "ai_engine": engine_name,
            "selected_tool": "get_financial_kpis",
            "tool_input": {},
            "tool_result": kpis,
            "answer": answer_text,
            "suggested_actions": ["Run Settlement Reconciliation", "Review Top Risk Merchants", "Generate Full Executive Report"],
            "trace": trace,
            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
        }

    def _execute_tool_report(self, question: str, trace: list, start_time: datetime, engine_name: str) -> Dict[str, Any]:
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_SELECTION",
            "message": "Selected tool 'generate_health_report' to synthesize comprehensive multi-domain audit.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        rep = report_generator.generate_health_report()
        
        trace.append({
            "step": len(trace) + 1,
            "stage": "TOOL_EXECUTION",
            "message": f"Generated executive audit report with {len(rep.get('recommendations', []))} prioritized action directives.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })
        
        answer_text = f"### Executive Audit Report Generated\n"
        answer_text += f"**Database**: `{rep.get('database', db_manager.active_db_name)}` | **Health Score**: **{rep.get('health_score', 0)}/100**\n\n"
        for rec in rep.get("recommendations", [])[:4]:
            answer_text += f"- **[{rec.get('priority', 'HIGH')}] {rec.get('title', '')}**: {rec.get('detail', '')}\n"

        trace.append({
            "step": len(trace) + 1,
            "stage": "SYNTHESIS",
            "message": "Report rendered and ready for multi-format export.",
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        })

        return {
            "success": True,
            "question": question,
            "ai_engine": engine_name,
            "selected_tool": "generate_health_report",
            "tool_input": {},
            "tool_result": rep,
            "answer": answer_text,
            "suggested_actions": ["Download PDF Report", "Download Excel (.xlsx)", "View Full Report View"],
            "trace": trace,
            "execution_time_ms": int((datetime.now() - start_time).total_seconds() * 1000)
        }

    def _generate_local_sql(self, question: str) -> str:
        q = question.lower()
        schema = db_manager.get_schema_summary()
        tables_dict = schema.get("tables", {})
        tables = list(tables_dict.keys())
        
        if not tables:
            return "SELECT 1;"

        # Find best matching table
        target_table = tables[0]
        for t in tables:
            t_clean = t.lower()
            if t_clean in q or (len(t_clean) > 3 and t_clean[:-1] in q):
                target_table = t
                break

        # Check column names in the selected table
        col_names = [c["name"] for c in tables_dict.get(target_table, {}).get("columns", [])]
        amt_col = next((c for c in col_names if any(w in c.lower() for w in ["amount", "price", "total", "val", "cost", "sum", "balance"])), None)

        if any(w in q for w in ["how many", "count", "number of", "total rows"]):
            return f"SELECT count(*) as total_count FROM \"{target_table}\";"
        elif any(w in q for w in ["largest", "highest", "top", "max"]) and amt_col:
            return f"SELECT * FROM \"{target_table}\" ORDER BY \"{amt_col}\" DESC LIMIT 10;"
        elif any(w in q for w in ["sum", "total volume", "revenue"]) and amt_col:
            return f"SELECT sum(\"{amt_col}\") as total_sum FROM \"{target_table}\";"
        elif "failed" in q and any("status" in c.lower() for c in col_names):
            status_col = next(c for c in col_names if "status" in c.lower())
            return f"SELECT * FROM \"{target_table}\" WHERE LOWER(\"{status_col}\") LIKE '%fail%' LIMIT 25;"
        else:
            return f"SELECT * FROM \"{target_table}\" LIMIT 10;"

ai_controller = AIController()

def query_ai_controller(query: str, conn=None) -> Dict[str, Any]:
    return ai_controller.ask(query)
