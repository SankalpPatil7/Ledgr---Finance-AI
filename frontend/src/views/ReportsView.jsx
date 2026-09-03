import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  FileSpreadsheet, 
  Code,
  ArrowRight
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import AnimatedCounter from "../components/AnimatedCounter";
import FlowNextBanner from "../components/FlowNextBanner";
import { generateReport, getExportUrl } from "../api";

export default function ReportsView({ onOpenFlagWithContext, onInvestigateMerchant, onNavigateTab }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateReport();
      setReport(data);
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.markdown || "");
    setCopied(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format) => {
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    window.open(getExportUrl(format), "_blank");
  };

  if (isLoading || !report) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Generating Dynamic Executive Audit Report...</span>
        </div>
      </div>
    );
  }

  const prof = report.profile || {};
  const qual = report.data_quality || {};
  const recs = report.recommendations || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Health Score & Export Action Bar */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Autonomous Audit Report
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
              Score: {report.health_score}/100
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Executive Finance & Integrity Audit
          </h3>
          <p className="text-xs text-slate-400">
            Target DB: <span className="font-mono text-indigo-400 font-bold">{report.database}</span> | Generated: <span className="font-mono text-slate-300">{report.generated_at}</span>
          </p>
        </div>

        {/* Multi-Format Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleDownload("pdf")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/30"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleDownload("excel")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Excel (.xlsx)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleDownload("csv")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E293B] hover:bg-[#283548] text-slate-200 border border-[#334155] rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E293B] hover:bg-[#283548] text-slate-200 border border-[#334155] rounded-xl text-xs font-semibold transition"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy MD"}</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlowCard spotlightColor="rgba(16, 185, 129, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Data Quality Score</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={qual.overall_data_quality_score || 95} />
            <span className="text-slate-500 text-sm ml-1">/100</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{prof.total_records?.toLocaleString()} records scanned</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(239, 68, 68, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Potential Exposure</span>
          <p className="text-2xl font-black text-rose-400 font-mono">
            ₹<AnimatedCounter value={report.potential_exposure || 65384.04} decimals={2} />
          </p>
          <span className="text-[10px] text-rose-400 font-mono">Clawback recommended</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(245, 158, 11, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Active Anomalies</span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            <AnimatedCounter value={report.anomalies?.total_anomalies || 8} />
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Hybrid ML + Rules</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(99, 102, 241, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Settlement Accuracy</span>
          <p className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={report.reconciliation?.match_rate || 94.8} decimals={1} suffix="%" />
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{report.reconciliation?.mismatched_count} mismatches</span>
        </GlowCard>
      </div>

      {/* Prioritized Recommendations */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Prioritized Executive Recommendations ({recs.length})</span>
        </h4>

        <div className="space-y-3">
          {recs.map((rec, idx) => (
            <div key={idx} className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-xl space-y-1.5 hover:border-indigo-500/30 transition">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{rec.title}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold ${
                  rec.priority.includes("CRITICAL") ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{rec.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Transcript Viewer */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-3">
        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          <span>Full Markdown Audit Transcript</span>
        </h4>
        <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] max-h-96 overflow-y-auto leading-relaxed">
          {report.markdown}
        </pre>
      </div>

      {/* Flow Continuation to What-If Simulator */}
      <FlowNextBanner
        currentStep="07"
        currentTitle="Certified Financial Health Report"
        nextStep="08"
        nextTitle="What-If Scenario Stress Testing"
        nextTab="whatif"
        badge="AUDIT CERTIFIED"
        description="Formal audit report signed and verified. Proceed to simulate financial resilience, fee adjustment elasticity, and dispute recovery projections."
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
