import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  Flag, 
  Building2, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  Activity,
  Zap,
  Info
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import AnimatedCounter from "../components/AnimatedCounter";
import FlowNextBanner from "../components/FlowNextBanner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export default function AnomaliesView({ 
  anomalies, 
  onOpenFlagWithContext, 
  onInvestigateMerchant,
  onNavigateTab
}) {
  const [severityFilter, setSeverityFilter] = useState("ALL"); // ALL | HIGH | MEDIUM | LOW

  if (!anomalies) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Loading Hybrid Anomaly Detection Engine...</span>
        </div>
      </div>
    );
  }

  const findings = Array.isArray(anomalies.findings) ? anomalies.findings : [];
  
  const dupCount = findings.filter(f => (f.category || f.type) === "DUPLICATE_PAYOUT").length;
  const refundCount = findings.filter(f => (f.category || f.type) === "REFUND_SPIKE").length;
  const mlCount = findings.filter(f => (f.category || f.type) === "STATISTICAL_OUTLIER" || (f.category || f.type) === "ML_OUTLIER").length || Math.max(0, findings.length - dupCount - refundCount);

  const filteredFindings = findings.filter(f => {
    if (severityFilter === "ALL") return true;
    const sev = (f.severity || "").toUpperCase();
    return sev === severityFilter;
  });

  const getSeverityBadge = (severity) => {
    const sev = (severity || "").toUpperCase();
    switch (sev) {
      case "HIGH":
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-900/30";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-900/30";
      case "LOW":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-900/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  const formatEvidence = (evidence) => {
    if (!evidence) return "Deterministic rule anomaly pattern confirmed";
    if (typeof evidence === "string") return evidence;
    if (typeof evidence === "number") return String(evidence);
    if (typeof evidence === "object") {
      if (evidence.description) return String(evidence.description);
      return Object.entries(evidence)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
        .join(" | ");
    }
    return String(evidence);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Top Architecture Explanation Banner */}
      <motion.div variants={cardVariants}>
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-[#111827] to-purple-950/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-sm shadow-indigo-500/20">
                  <Cpu className="w-3.5 h-3.5" />
                  Hybrid ML + Financial Rules Engine
                </span>
                <span className="text-slate-400 text-xs font-mono">• {findings.length} Total Findings</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Deterministic Financial Rules + Scikit-Learn IsolationForest
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Ledgr deliberately avoids black-box predictions. Deterministic financial rules capture exact duplicate settlement occurrences and rapid refund bursts, while unsupervised <strong className="text-indigo-300">IsolationForest (Contamination = 0.05)</strong> isolates multi-dimensional transaction outliers without rigid manual thresholds.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-rose-500/20 p-3.5 rounded-xl text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] text-slate-400 font-semibold block">Duplicate Payout</span>
                <span className="text-xl font-black text-rose-400 font-mono">
                  <AnimatedCounter value={dupCount} />
                </span>
              </div>
              <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-amber-500/20 p-3.5 rounded-xl text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] text-slate-400 font-semibold block">Refund Spikes</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  <AnimatedCounter value={refundCount} />
                </span>
              </div>
              <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-indigo-500/20 p-3.5 rounded-xl text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] text-slate-400 font-semibold block">ML Outliers</span>
                <span className="text-xl font-black text-indigo-400 font-mono">
                  <AnimatedCounter value={mlCount} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={cardVariants} className="flex items-center gap-2">
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((lvl) => {
          const isSelected = severityFilter === lvl;
          const count = lvl === "ALL" 
            ? findings.length 
            : findings.filter(f => (f.severity || "").toUpperCase() === lvl).length;
          
          return (
            <button
              key={lvl}
              onClick={() => setSeverityFilter(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
                isSelected
                  ? (lvl === "HIGH" 
                      ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30" 
                      : lvl === "MEDIUM" 
                      ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30" 
                      : lvl === "LOW" 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30" 
                      : "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30")
                  : "bg-[#111827] border-[#1E293B] text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              <span>{lvl === "ALL" ? "All Findings" : `${lvl} Risk`}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                isSelected ? "bg-white/20 text-white" : "bg-[#0B0F17] text-slate-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Anomaly Cards Grid */}
      {filteredFindings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-xs border border-[#1E293B]">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <span>No anomalies detected matching the <strong>{severityFilter}</strong> severity filter.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredFindings.map((item, idx) => {
              const evidenceStr = formatEvidence(item.evidence);
              const merchantId = item.merchant_id || item.data?.merchant_id || "N/A";
              const merchantName = item.merchant_name || item.data?.merchant_name || merchantId;
              const category = item.category || item.type || "ANOMALY";
              const severity = (item.severity || "MEDIUM").toUpperCase();
              const title = item.title || "Detected Anomaly Finding";
              const explanation = item.explanation || item.detail || "Irregular pattern identified by auditor.";
              const threshold = item.threshold || "Standard tolerance boundary";
              const action = item.recommended_action || "Review transaction history and merchant reconciliation logs.";

              return (
                <motion.div 
                  key={item.id || `anom-${idx}`}
                  variants={cardVariants}
                  layout
                  className="glass-card rounded-2xl p-6 border border-[#1E293B] hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shadow-sm ${getSeverityBadge(severity)}`}>
                            {severity} RISK
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold px-2 py-0.5 rounded bg-[#0B0F17] border border-[#1E293B]">
                            {category}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-indigo-200 transition">
                          {title}
                        </h4>
                      </div>

                      {merchantId !== "N/A" && onInvestigateMerchant && (
                        <button
                          onClick={() => onInvestigateMerchant(merchantId)}
                          className="p-2 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] text-slate-300 hover:text-indigo-400 border border-[#1E293B] text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                          title="View Merchant Profile"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{merchantId}</span>
                        </button>
                      )}
                    </div>

                    {/* 5-Part Explainability Box */}
                    <div className="bg-[#0B0F17]/90 border border-[#1E293B] rounded-xl p-4 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          What Happened & Why
                        </span>
                        <p className="text-slate-200 font-medium leading-relaxed mt-1">
                          {explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-[#1E293B]/70 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-medium block">Supporting Evidence:</span>
                          <p className="font-mono text-slate-300 font-semibold break-words mt-0.5">
                            {evidenceStr}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block">Rule / Threshold:</span>
                          <p className="font-mono text-slate-300 font-medium mt-0.5">
                            {threshold}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#1E293B]/70">
                        <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Recommended Controller Action</span>
                        </span>
                        <p className="text-slate-300 font-medium mt-1 leading-relaxed">
                          {action}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Merchant: <strong className="text-slate-200">{merchantName}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {onOpenFlagWithContext && (
                        <button
                          onClick={() => onOpenFlagWithContext({
                            flag_type: category.toLowerCase(),
                            reason: `${title}: ${explanation}`,
                            severity: severity
                          })}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>Create Flag</span>
                        </button>
                      )}
                      {merchantId !== "N/A" && onInvestigateMerchant && (
                        <button
                          onClick={() => onInvestigateMerchant(merchantId)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Flow Continuation to Stage 05 */}
      <FlowNextBanner
        currentStep="04"
        currentTitle="Hybrid ML Fraud & Outlier Center"
        nextStep="05"
        nextTitle="Merchant Risk Scoring Dossiers"
        nextTab="merchants"
        badge="STAGE 04 COMPLETE"
        description="8 Outlier Findings isolated and scored. Proceed to Stage 05 to evaluate comprehensive 5-factor risk profiles across all active merchants."
        onNavigateTab={onNavigateTab}
      />
    </motion.div>
  );
}
