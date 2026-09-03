import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowRight, 
  Bot, 
  Layers, 
  Scale, 
  AlertTriangle, 
  Building2, 
  FileText, 
  LayoutDashboard, 
  Box, 
  Sliders, 
  Receipt, 
  Flag, 
  ShieldAlert, 
  GitCompare, 
  Database, 
  Zap, 
  CornerDownLeft,
  X
} from "lucide-react";

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerFullAudit,
  onOpenFlagModal,
  onInvestigateMerchant
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    {
      id: "flow-databases",
      category: "Audit Flow Pipeline",
      title: "01. Universal Ingestion & Database Introspection",
      desc: "Connect SQLite, CSV, or XLSX files with automatic schema mapping",
      icon: Database,
      badge: "STEP 01",
      action: () => onNavigateTab("databases")
    },
    {
      id: "flow-quality",
      category: "Audit Flow Pipeline",
      title: "02. Data Quality and Completeness Profiling",
      desc: "Run 0-100 diagnostic health checks and duplicate row scans",
      icon: Layers,
      badge: "STEP 02",
      action: () => onNavigateTab("dataquality")
    },
    {
      id: "flow-reconciliation",
      category: "Audit Flow Pipeline",
      title: "03. Settlement Reconciliation Engine",
      desc: "Audit bank payouts vs ledger records and calculate exposure gap",
      icon: Scale,
      badge: "STEP 03",
      action: () => onNavigateTab("reconciliation")
    },
    {
      id: "flow-anomalies",
      category: "Audit Flow Pipeline",
      title: "04. Hybrid ML Fraud and Outlier Center",
      desc: "Run IsolationForest ML outlier detection and duplicate charge rules",
      icon: AlertTriangle,
      badge: "STEP 04",
      action: () => onNavigateTab("anomalies")
    },
    {
      id: "flow-merchants",
      category: "Audit Flow Pipeline",
      title: "05. Merchant Risk Scoring Dossiers",
      desc: "Review 5-factor composite risk models and merchant telemetry",
      icon: Building2,
      badge: "STEP 05",
      action: () => onNavigateTab("merchants")
    },
    {
      id: "flow-controller",
      category: "Audit Flow Pipeline",
      title: "06. AI Natural Language Controller",
      desc: "Query financial data with NVIDIA LLaMA 3.3 and inspect SQL traces",
      icon: Bot,
      badge: "STEP 06",
      action: () => onNavigateTab("controller")
    },
    {
      id: "flow-reports",
      category: "Audit Flow Pipeline",
      title: "07. Financial Health Reports and PDF Export",
      desc: "Generate certified executive audit reports with 1-click PDF/Excel export",
      icon: FileText,
      badge: "STEP 07",
      action: () => onNavigateTab("reports")
    },

    {
      id: "nav-showcase",
      category: "Executive Consoles",
      title: "3D Product Showcase Tour",
      desc: "Interactive Spline 3D canvas and coverflow carousel portal",
      icon: Box,
      badge: "3D FRONT",
      action: () => onNavigateTab("showcase")
    },
    {
      id: "nav-dashboard",
      category: "Executive Consoles",
      title: "Executive Finance Dashboard",
      desc: "High-level KPI console, revenue charts, and active health score",
      icon: LayoutDashboard,
      badge: "CONSOLE",
      action: () => onNavigateTab("dashboard")
    },
    {
      id: "nav-whatif",
      category: "Executive Consoles",
      title: "What-If Scenario Stress Testing",
      desc: "Simulate fee changes, refund volume shifts, and clawback recovery",
      icon: Sliders,
      badge: "SIMULATOR",
      action: () => onNavigateTab("whatif")
    },
    {
      id: "nav-transactions",
      category: "Executive Consoles",
      title: "Transaction Ledger Telemetry",
      desc: "Search, filter, and inspect granular settlement ledger records",
      icon: Receipt,
      badge: "RECORDS",
      action: () => onNavigateTab("transactions")
    },
    {
      id: "nav-compare",
      category: "Executive Consoles",
      title: "Database Snapshot Delta Comparison",
      desc: "Cross-examine two databases side-by-side for schema drift",
      icon: GitCompare,
      badge: "DELTA",
      action: () => onNavigateTab("compare")
    },
    {
      id: "nav-alerts",
      category: "Executive Consoles",
      title: "Risk Alerts and Formal Cases",
      desc: "Review open investigations and trigger formal audit triage",
      icon: ShieldAlert,
      badge: "ALERTS",
      action: () => onNavigateTab("alerts_cases")
    },
    {
      id: "nav-flags",
      category: "Executive Consoles",
      title: "Auditor Flags and Immutable Audit Trail",
      desc: "View and resolve auditor investigation flags and tamper-evident logs",
      icon: Flag,
      badge: "FLAGS",
      action: () => onNavigateTab("flags")
    },

    {
      id: "act-fullaudit",
      category: "Quick Actions",
      title: "⚡ Run Autonomous 15-Stage Full Audit",
      desc: "Trigger full self-executing pipeline across all 15 audit stages",
      icon: Zap,
      badge: "AUTONOMOUS",
      action: () => onTriggerFullAudit()
    },
    {
      id: "act-highrisk",
      category: "Quick Actions",
      title: "🔍 Investigate Highest Risk Merchant (MERCH-004)",
      desc: "Open deep forensic dossier for Apex Retail Ltd (Risk Score: 78.4)",
      icon: Building2,
      badge: "FORENSICS",
      action: () => onInvestigateMerchant("MERCH-004")
    },
    {
      id: "act-newflag",
      category: "Quick Actions",
      title: "🚩 Create New Auditor Investigation Flag",
      desc: "Flag a transaction, merchant, or discrepancy with notes and severity",
      icon: Flag,
      badge: "NEW CASE",
      action: () => onOpenFlagModal()
    }
  ];

  const filteredCommands = commands.filter(cmd => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.desc.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.badge.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-2xl bg-[#0F1420]/95 border border-white/[0.14] shadow-2xl overflow-hidden backdrop-blur-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
            <Search className="w-5 h-5 text-blue-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command, tool, or search query... (e.g. 'reconcile', 'audit', 'fraud')"
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
            />
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No matching tools or commands found for "{query}".
              </div>
            ) : (
              filteredCommands.map((cmd, index) => {
                const isSelected = index === selectedIndex;
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-150 ${
                      isSelected 
                        ? "bg-white/[0.1] text-white shadow-sm border border-white/[0.12]" 
                        : "text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "bg-white/[0.05] text-slate-400"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-tight truncate">
                            {cmd.title}
                          </span>
                          {cmd.badge && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 border border-white/10 shrink-0">
                              {cmd.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                          {cmd.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 shrink-0 pl-3">
                      {isSelected && (
                        <span className="text-[10px] font-mono flex items-center gap-1 text-blue-400">
                          <span>Select</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 bg-white/[0.03] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↓</kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↵</kbd>
                <span>execute</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">esc</kbd>
                <span>close</span>
              </span>
            </div>
            <div className="text-blue-400/80 font-bold">
              LEDGR SPOTLIGHT HUD
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
