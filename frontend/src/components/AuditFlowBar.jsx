import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Database, 
  Layers, 
  Scale, 
  AlertTriangle, 
  Building2, 
  Bot, 
  FileText, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function AuditFlowBar({
  activeTab,
  onNavigateTab,
  activeDb,
  kpis,
  reconciliation,
  anomalies,
  merchants,
  onTriggerFullAudit
}) {
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const stages = [
    {
      id: "databases",
      step: "01",
      name: "Connect & Ingest",
      icon: Database,
      badge: activeDb || "ledgr.db",
      badgeStatus: "verified",
      tooltip: "Universal DB ingestion with automated schema mapping and SQLite connection."
    },
    {
      id: "dataquality",
      step: "02",
      name: "Schema & Quality",
      icon: Layers,
      badge: "98.4% Quality",
      badgeStatus: "verified",
      tooltip: "Automated completeness audit, null-value diagnostics, and duplicate row detection."
    },
    {
      id: "reconciliation",
      step: "03",
      name: "Reconcile Payouts",
      icon: Scale,
      badge: reconciliation?.match_rate ? `${reconciliation.match_rate}% Match` : "₹17.1k Gap",
      badgeStatus: "warning",
      tooltip: "Internal transactions vs bank reported settlement audits with discrepancy quantification."
    },
    {
      id: "anomalies",
      step: "04",
      name: "ML Fraud & Outliers",
      icon: AlertTriangle,
      badge: anomalies?.findings?.length ? `${anomalies.findings.length} Outliers` : "8 Findings",
      badgeStatus: "danger",
      tooltip: "Scikit-Learn IsolationForest statistical outlier detection combined with velocity rules."
    },
    {
      id: "merchants",
      step: "05",
      name: "Merchant Risk",
      icon: Building2,
      badge: merchants?.length ? `${merchants.length} Profiles` : "5 Monitored",
      badgeStatus: "neutral",
      tooltip: "5-factor composite risk scoring evaluating dispute volumes, refund spikes, and failure rates."
    },
    {
      id: "controller",
      step: "06",
      name: "AI Forensics",
      icon: Bot,
      badge: "LLaMA 3.3",
      badgeStatus: "ai",
      tooltip: "NVIDIA NIM natural-language query grounding, schema-aware SQL generation, and trace inspection."
    },
    {
      id: "reports",
      step: "07",
      name: "Certified Report",
      icon: FileText,
      badge: "Executive PDF",
      badgeStatus: "verified",
      tooltip: "Instant one-click executive audit report generation, what-if stress tests, and CSV/XLSX exports."
    }
  ];

  // Guided Tour Autoplay effect
  useEffect(() => {
    let timer;
    if (isTourPlaying) {
      timer = setInterval(() => {
        setTourStep((prev) => {
          const next = (prev + 1) % stages.length;
          onNavigateTab(stages[next].id);
          return next;
        });
      }, 4200);
    }
    return () => clearInterval(timer);
  }, [isTourPlaying, stages.length, onNavigateTab]);

  const toggleTour = () => {
    if (!isTourPlaying) {
      // Start tour from current stage or 0
      const currIdx = stages.findIndex(s => s.id === activeTab);
      const startIdx = currIdx >= 0 ? currIdx : 0;
      setTourStep(startIdx);
      onNavigateTab(stages[startIdx].id);
      setIsTourPlaying(true);
    } else {
      setIsTourPlaying(false);
    }
  };

  const getBadgeStyle = (status, isActive) => {
    if (isActive) return "bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]";
    switch (status) {
      case "danger":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "warning":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "ai":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "verified":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      default:
        return "bg-white/[0.06] text-slate-300 border-white/10";
    }
  };

  return (
    <div className="w-full bg-[var(--bg-surface)]/90 border-b border-white/[0.08] backdrop-blur-2xl shadow-lg relative z-10 transition-all duration-300">
      {/* Top Bar with Stage Header and Controls */}
      <div className="px-8 py-2.5 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase">
              AUTONOMOUS AUDIT PIPELINE
            </span>
          </div>
          <span className="text-white/20 font-mono text-xs">•</span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Stage-by-stage financial controllership workflow
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTour}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isTourPlaying 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse" 
                : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30"
            }`}
          >
            {isTourPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Flow Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-blue-400" />
                <span>Play Guided Tour</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 transition"
            title={isExpanded ? "Collapse Pipeline" : "Expand Pipeline"}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Pipeline Stages */}
      {isExpanded && (
        <div className="px-6 py-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center min-w-max gap-1">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeTab === stage.id;
              const isPast = stages.findIndex(s => s.id === activeTab) > idx;

              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => {
                      if (isTourPlaying) setIsTourPlaying(false);
                      onNavigateTab(stage.id);
                    }}
                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left ${
                      isActive 
                        ? "bg-white/[0.1] border border-blue-400/40 shadow-lg shadow-blue-950/20" 
                        : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06]"
                    }`}
                  >
                    {/* Stage Number & Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive 
                        ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/40" 
                        : isPast
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-white/[0.05] text-slate-400 group-hover:text-white"
                    }`}>
                      {isPast ? <CheckCircle2 className="w-4 h-4 text-blue-400" /> : <Icon className="w-4 h-4" />}
                    </div>

                    {/* Stage Info */}
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold ${isActive ? "text-blue-400" : "text-slate-400"}`}>
                          {stage.step}
                        </span>
                        <span className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                          {stage.name}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block ${getBadgeStyle(stage.badgeStatus, isActive)}`}>
                          {stage.badge}
                        </span>
                      </div>
                    </div>

                    {/* Active Underline Pill */}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" />
                    )}
                  </button>

                  {/* Connecting Chevron */}
                  {idx < stages.length - 1 && (
                    <ChevronRight className={`w-4 h-4 shrink-0 mx-0.5 ${
                      isPast ? "text-blue-400/60" : "text-slate-400/40"
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
