import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Sparkles, 
  Flag, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  Cpu,
  Terminal,
  Activity,
  Box,
  Search
} from "lucide-react";
import { getDatabases, selectDatabase } from "../api";
import api from "../api";

export default function Header({ 
  activeTab, 
  onOpenFlagModal, 
  onTriggerFullAudit, 
  onRefreshData,
  activeDb,
  onDatabaseChanged,
  onOpenCommandPalette,
  exposureAmount = 65384.04
}) {
  const [databases, setDatabases] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);

  useEffect(() => {
    loadDbs();
    loadAiConfig();
  }, [activeDb]);

  const loadDbs = async () => {
    try {
      const data = await getDatabases();
      setDatabases(data.databases || []);
    } catch (err) {
      console.error("Failed to load databases:", err);
    }
  };

  const loadAiConfig = async () => {
    try {
      const res = await api.get("/health");
      setAiConfig(res.data);
    } catch (err) {
      console.error("Failed to load health/AI status:", err);
    }
  };

  const handleSelect = async (dbName) => {
    if (dbName === activeDb) {
      setDropdownOpen(false);
      return;
    }
    try {
      await selectDatabase(dbName);
      if (onDatabaseChanged) onDatabaseChanged(dbName);
      setDropdownOpen(false);
    } catch (err) {
      alert("Failed to switch database: " + err.message);
    }
  };

  const tabTitles = {
    showcase: { title: "3D Product Tour & Experience", subtitle: "Real-time interactive 3D coverflow and visual portal" },
    dashboard: { title: "Executive Finance Console", subtitle: "Real-time ledger audit, settlement reconciliation, and risk matrix" },
    controller: { title: "AI Finance Controller & NVIDIA NIM", subtitle: "Autonomous natural-language auditor with schema grounding" },
    dataquality: { title: "Data Quality & Profiling Studio", subtitle: "Completeness diagnostics, duplicate detection, and schema intelligence" },
    alerts_cases: { title: "Risk Alerts & Audit Cases", subtitle: "Centralized threat triage and formal audit case investigations" },
    reconciliation: { title: "Settlement Reconciliation Engine", subtitle: "Internal ledger vs bank reported settlement discrepancy resolution" },
    anomalies: { title: "Hybrid Anomaly & Fraud Detector", subtitle: "Scikit-Learn IsolationForest combined with deterministic velocity rules" },
    merchants: { title: "Merchant Risk Dossiers", subtitle: "5-Factor composite risk scoring model, dispute rates, and volume analytics" },
    transactions: { title: "Transaction Ledger Telemetry", subtitle: "Real-time queryable records, status distributions, and payment flows" },
    flags: { title: "Investigation Flags & Cases", subtitle: "Actionable auditor flags and immutable system execution ledger" },
    compare: { title: "Database Snapshot Comparison", subtitle: "Multi-database schema & financial KPI delta comparison engine" },
    whatif: { title: "What-If Scenario Simulator", subtitle: "Revenue sensitivity stress testing against refund spikes and clawbacks" },
    reports: { title: "Financial Health Reports & Exports", subtitle: "Executive audits with one-click PDF, Excel (.xlsx), and CSV exports" },
    databases: { title: "Universal Ingestion & Multi-DB", subtitle: "Upload SQLite (.db), CSV, or Excel (.xlsx) with instant schema introspection" },
  };

  const currentTabInfo = tabTitles[activeTab] || { title: "LEDGR Autonomous Finance Controller", subtitle: "Financial intelligence and automated auditing" };

  return (
    <header className="h-20 bg-[var(--bg-surface)]/70 backdrop-blur-2xl border-b border-white/[0.08] px-8 flex items-center justify-between sticky top-0 z-20 shadow-xl">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6] animate-pulse" />
          <h2 className="text-base font-extrabold text-white tracking-tight">
            {currentTabInfo.title}
          </h2>
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5 ml-4.5">{currentTabInfo.subtitle}</p>
      </div>

      {/* Action Pills & Controls */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Spotlight Button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-slate-300 hover:text-white transition shadow-sm group"
            title="Open Command Palette (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-[11px] text-slate-300">Quick Jump</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] hidden sm:inline">⌘K</kbd>
          </button>
        )}

        {/* Live AI Engine Status Pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/[0.04] border border-white/[0.08] text-slate-200 shadow-sm"
          title="AI engine configuration loaded from backend/.env"
        >
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>{aiConfig?.ai_configured ? "NVIDIA AI: ACTIVE" : "AI ENGINE: READY"}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            {aiConfig?.ai_configured ? "CLOUD" : "CORE"}
          </span>
        </div>

        {/* Potential Exposure Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-300 text-xs font-mono font-semibold shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Exposure: ₹{exposureAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Database Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 hover:text-white transition shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="max-w-[120px] truncate font-mono text-[11px]">{activeDb || "ledgr.db"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-[#0F1420] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.06] mb-1">
                  Available Databases
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {databases.map((db) => (
                    <button
                      key={db.name}
                      onClick={() => handleSelect(db.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition ${
                        activeDb === db.name
                          ? "bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="truncate">{db.name}</span>
                      <span className="text-[10px] text-slate-500 font-sans">{db.size}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Log Flag Action Button */}
        {onOpenFlagModal && (
          <button
            onClick={onOpenFlagModal}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition shadow-sm"
            title="Create Audit Flag"
          >
            <Flag className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {/* Autonomous Full Audit Action Button */}
        {onTriggerFullAudit && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTriggerFullAudit}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-900/30 flex items-center gap-1.5 shimmer-badge"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Audit</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}
