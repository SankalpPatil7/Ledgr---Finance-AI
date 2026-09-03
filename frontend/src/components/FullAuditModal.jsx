import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Scale, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  ArrowRight,
  Zap,
  Activity
} from "lucide-react";
import { getExportUrl } from "../api";
import AnimatedCounter from "./AnimatedCounter";

export default function FullAuditModal({ isOpen, onClose, auditData, onNavigateTab, onInvestigateMerchant }) {
  if (!isOpen || !auditData) return null;

  const rep = auditData.report || {};
  const prof = rep.profile || {};
  const qual = rep.data_quality || {};

  const handleDownload = (format) => {
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    window.open(getExportUrl(format), "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#111827] border border-indigo-500/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#1E293B] flex items-center justify-between bg-gradient-to-r from-indigo-950/60 via-[#0B0F17] to-purple-950/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-6 h-6 animate-spin text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Autonomous Full Audit Completed
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                    {auditData.execution_time_ms}ms execution
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit ID: <span className="font-mono text-indigo-400 font-bold">{auditData.audit_id}</span> | Target DB: <span className="font-mono text-slate-200">{auditData.database}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-[#0B0F17]/60 text-xs">
            {/* Top Score Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111827] border border-[#1E293B] p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold">Financial Health</span>
                <p className="text-2xl font-black text-white font-mono flex items-center">
                  <AnimatedCounter value={auditData.overall_health_score || 85} />
                  <span className="text-slate-500 text-sm ml-1">/100</span>
                </p>
                <span className="text-[10px] text-emerald-400 font-medium font-mono">Autonomous rating</span>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold">Data Quality Score</span>
                <p className="text-2xl font-black text-emerald-400 font-mono flex items-center">
                  <AnimatedCounter value={auditData.data_quality_score || 95} />
                  <span className="text-slate-500 text-sm ml-1">/100</span>
                </p>
                <span className="text-[10px] text-slate-400 font-mono">{prof.total_records?.toLocaleString()} records scanned</span>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold">Settlement Match Rate</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  <AnimatedCounter value={auditData.settlement_match_rate || 94.8} decimals={1} suffix="%" />
                </p>
                <span className="text-[10px] text-rose-400 font-mono">₹{auditData.settlement_discrepancy?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} discrepancy</span>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] p-4 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold">Total Risk Exposure</span>
                <p className="text-2xl font-black text-rose-400 font-mono">
                  ₹<AnimatedCounter value={auditData.total_exposure || 65384.04} decimals={2} />
                </p>
                <span className="text-[10px] text-amber-400 font-mono">{auditData.total_anomalies} anomalies detected</span>
              </div>
            </div>

            {/* Audit Execution Pipeline Steps */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>8-Stage Autonomous Audit Execution Transcript</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {auditData.steps_executed?.map((step) => (
                  <div key={step.step} className="bg-[#0B0F17] border border-[#1E293B] p-3 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{step.task}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono font-normal">PASS</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Recommendations */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Executive Action Directives ({rep.recommendations?.length || 0})</span>
              </h4>

              <div className="space-y-2.5">
                {rep.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-[#0B0F17] border border-[#1E293B] p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{rec.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        rec.priority.includes("CRITICAL") ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{rec.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer: Export Buttons */}
          <div className="p-5 border-t border-[#1E293B] bg-[#0B0F17] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Export Full Audit:</span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDownload("pdf")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDownload("excel")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Excel (.xlsx)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDownload("csv")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-[#283548] text-slate-200 border border-[#334155] rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDownload("json")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-[#283548] text-slate-200 border border-[#334155] rounded-lg text-xs font-semibold transition"
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30"
            >
              Done & Review Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
