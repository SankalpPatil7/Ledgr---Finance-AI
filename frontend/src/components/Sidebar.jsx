import React from "react";
import { 
  LayoutDashboard, 
  Bot, 
  Box,
  Scale, 
  AlertTriangle, 
  Building2, 
  Receipt, 
  Flag, 
  Sliders, 
  FileText, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  GitCompare, 
  Layers, 
  Cpu, 
  Sparkles,
  ChevronRight,
  Search
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeDb,
  healthScore,
  onOpenCommandPalette,
  mobileMenuOpen,
  onMobileClose,
}) {
  const navSections = [
    {
      title: "SHOWCASE & OVERVIEW",
      items: [
        { id: "showcase", label: "3D Product Tour", icon: Box, badge: "3D FRONT", badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
        { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard, badge: null },
      ]
    },
    {
      title: "AUDIT FLOW PIPELINE",
      items: [
        { id: "databases", label: "Connect & Ingest", icon: Database, step: "01", badge: "SOURCE" },
        { id: "dataquality", label: "Data Quality & Profiling", icon: Layers, step: "02", badge: "HEALTH" },
        { id: "reconciliation", label: "Settlement Reconciler", icon: Scale, step: "03", badge: "PAYOUTS" },
        { id: "anomalies", label: "ML Fraud & Outliers", icon: AlertTriangle, step: "04", badge: "ML-CORE" },
        { id: "merchants", label: "Merchant Risk Dossiers", icon: Building2, step: "05", badge: "RISK" },
        { id: "controller", label: "AI Finance Controller", icon: Bot, step: "06", badge: "NVIDIA" },
        { id: "reports", label: "Certified Audit Report", icon: FileText, step: "07", badge: "EXPORT" },
      ]
    },
    {
      title: "LEDGER & DEEP TOOLS",
      items: [
        { id: "transactions", label: "Transaction Ledger", icon: Receipt, badge: null },
        { id: "whatif", label: "What-If Simulator", icon: Sliders, badge: "STRESS" },
        { id: "compare", label: "Compare Databases", icon: GitCompare, badge: "DELTA" },
        { id: "alerts_cases", label: "Risk Alerts & Cases", icon: ShieldAlert, badge: "LIVE" },
        { id: "flags", label: "Auditor Flags & Ledger", icon: Flag, badge: null },
      ]
    }
  ];

  return (
    <aside
        className={`ledgr-sidebar w-64 bg-[var(--bg-surface)]/80 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between h-screen sticky top-0 select-none z-30 shadow-2xl ${
          mobileMenuOpen ? "mobile-sidebar-open" : ""
        }`}
      >
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 flex items-center justify-center shadow-lg shadow-blue-950/40 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5 font-mono">
                LEDGR
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                  AUTONOMOUS
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Finance Controller & Auditor</p>
            </div>
          </div>
        </div>

        {/* Quick Search & Command Palette Trigger */}
        {onOpenCommandPalette && (
          <div className="px-3 pt-3">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-slate-400 hover:text-white transition group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium">Spotlight Search</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[9px]">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onMobileClose?.();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                      isActive
                        ? "bg-white/[0.09] text-white font-bold border border-white/[0.12] shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Active Accent Dot */}
                    {isActive && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3B82F6]" />
                    )}

                    <div className="flex items-center gap-2.5 pl-1.5 min-w-0">
                      {item.step ? (
                        <span className={`text-[10px] font-mono font-bold shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`}>
                          {item.step}
                        </span>
                      ) : null}
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        isActive ? "bg-blue-500/20 text-blue-300 border border-blue-400/40" : (item.badgeColor || "bg-white/[0.04] text-slate-400 border border-white/[0.06]")
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* System Telemetry Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-[var(--bg-surface-elevated)]/60 backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_#3B82F6]" />
            <span className="text-slate-300 font-medium">Controller Active</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">{activeDb || "ledgr.db"}</span>
        </div>

        <div className="bg-black/30 rounded-xl p-2.5 border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Health Score</span>
            <span className="text-xs font-black text-white font-mono">{healthScore || 85}/100</span>
          </div>
          <div className="w-16 bg-white/[0.08] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
              style={{ width: `${healthScore || 85}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
