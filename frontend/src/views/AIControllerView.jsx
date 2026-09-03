import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Code, 
  Database,
  ArrowRight,
  Download,
  Flag
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askAIController } from "../api";
import GlowCard from "../components/GlowCard";
import FlowNextBanner from "../components/FlowNextBanner";

export default function AIControllerView({ onOpenFlagModal, onNavigateTab }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const sampleQuestions = [
    "How many transactions are in the database?",
    "Find duplicate payouts.",
    "Show all settlement mismatches.",
    "Which merchants have unusually high refunds?",
    "What are the biggest financial risks in the database?",
    "Give me an executive health report."
  ];

  const handleAsk = async (qText) => {
    const q = qText || question;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await askAIController(q);
      setResponse(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to query AI controller.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="cyber-panel hud-corners rounded-3xl p-6 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Autonomous AI Finance Controller & Auditor
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                SELF-CORRECTING SQL
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Powered by NVIDIA NIM Cloud Inference / High-Precision Local Core with live multi-step execution tracing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-[#090E1D] px-3.5 py-2 rounded-xl border border-[#1E293B]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Read-Only SQL Security Guards Active</span>
        </div>
      </div>

      {/* Input Box & Query Interface */}
      <div className="cyber-card rounded-2xl p-4 border border-cyan-500/30 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold px-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>ENTER NATURAL LANGUAGE PROMPT OR FINANCIAL DIRECTIVE</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="e.g. Find duplicate payouts, show settlement mismatches, or identify top risk merchants..."
            className="flex-1 bg-[#090E1D] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none transition shadow-inner"
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Auditing...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Run Query</span>
                <Send className="w-3.5 h-3.5" />
              </span>
            )}
          </motion.button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-slate-500">Quick Audits:</span>
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(sq);
                handleAsk(sq);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#090E1D] hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-[#1E293B] hover:border-cyan-500/30 transition"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Answer Card */}
          <GlowCard className="p-6 space-y-4" spotlightColor="rgba(6, 182, 212, 0.25)">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {response.ai_engine || "LEDGR AI Core"} Response
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{response.execution_time_ms}ms</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#090E1D] border border-[#1E293B] text-slate-300">
                  Tool: {response.selected_tool}
                </span>
              </div>
            </div>

            {/* Markdown Answer */}
            <div className="prose prose-invert prose-cyan max-w-none text-xs leading-relaxed font-mono">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </div>

            {/* Suggested Follow-Up Actions */}
            {response.suggested_actions && response.suggested_actions.length > 0 && (
              <div className="pt-3 border-t border-[#1E293B] flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">Recommended Next Steps:</span>
                {response.suggested_actions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (act.toLowerCase().includes("flag")) {
                        onOpenFlagModal();
                      } else {
                        setQuestion(act);
                        handleAsk(act);
                      }
                    }}
                    className="text-[11px] font-mono px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1.5"
                  >
                    <span>{act}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </GlowCard>

          {/* Execution Trace Stepper */}
          {response.trace && response.trace.length > 0 && (
            <div className="cyber-panel rounded-2xl p-6 border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Multi-Step Autonomous Execution Trace</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {response.trace.length} Sequential Decision Stages
                </span>
              </div>

              <div className="space-y-2">
                {response.trace.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#090E1D] border border-[#1E293B] flex items-start gap-3 text-xs font-mono"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {step.step || idx + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400 text-[11px]">{step.stage}</span>
                        <span className="text-[10px] text-slate-500">{step.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data Table if SQL executed */}
          {response.data_table && response.data_table.rows && response.data_table.rows.length > 0 && (
            <div className="cyber-panel rounded-2xl p-6 border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold text-white">
                    Raw Database Query Output ({response.data_table.row_count} records)
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#090E1D] text-slate-400 border-b border-[#1E293B]">
                    <tr>
                      {response.data_table.columns.map((col, idx) => (
                        <th key={idx} className="p-2.5 font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] bg-[#060B18]">
                    {response.data_table.rows.slice(0, 15).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#090E1D] transition">
                        {response.data_table.columns.map((col, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-slate-300">
                            {typeof row[col] === "number" ? row[col].toLocaleString() : String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Flow Continuation to Stage 07 */}
      <FlowNextBanner
        currentStep="06"
        currentTitle="AI Natural Language Forensics"
        nextStep="07"
        nextTitle="Certified Financial Health Report"
        nextTab="reports"
        badge="STAGE 06 COMPLETE"
        description="Autonomous query grounding and SQL investigations completed. Proceed to Stage 07 to generate the formal Executive Audit Certificate and export PDF/Excel packages."
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
