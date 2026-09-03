import React from "react";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function FlowNextBanner({
  currentStep = "01",
  currentTitle = "Database Ingestion",
  nextStep = "02",
  nextTitle = "Data Quality Profiling",
  nextTab = "dataquality",
  badge = "NEXT AUDIT STAGE",
  description = "Proceed to the next stage of the autonomous audit pipeline to verify data integrity.",
  onNavigateTab
}) {
  return (
    <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[var(--bg-surface-elevated)] to-indigo-950/30 border border-blue-500/25 shadow-xl relative overflow-hidden backdrop-blur-xl">
      {/* Ambient background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{badge}</span>
            <span className="text-white/30">•</span>
            <span>STAGE {nextStep}</span>
          </div>

          <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Continue Audit Flow:</span>
            <span className="text-blue-400">{nextTitle}</span>
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {description}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab(nextTab)}
          className="shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950/50 transition flex items-center gap-2 group hover:scale-[1.03]"
        >
          <span>Proceed to Stage {nextStep}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
