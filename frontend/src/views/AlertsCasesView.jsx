import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Bell, 
  FolderLock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Sparkles,
  Flag,
  ArrowRight
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import AnimatedCounter from "../components/AnimatedCounter";
import { getAlerts, getCases, createCase, updateCaseStatus } from "../api";

export default function AlertsCasesView({ onInvestigateMerchant, onOpenFlagWithContext }) {
  const [activeTab, setActiveTab] = useState("alerts"); // 'alerts' | 'cases'
  const [alerts, setAlerts] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [alertData, caseData] = await Promise.all([
        getAlerts(),
        getCases()
      ]);
      setAlerts(alertData.alerts || []);
      setCases(caseData || []);
    } catch (err) {
      console.error("Failed to load alerts/cases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCase = async (caseId, newStatus) => {
    try {
      await updateCaseStatus(caseId, newStatus);
      if (newStatus === "RESOLVED") {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
      loadData();
    } catch (err) {
      alert("Failed to update case: " + err.message);
    }
  };

  const handleConvertAlertToCase = async (alert) => {
    try {
      await createCase({
        title: alert.title,
        merchant_id: alert.merchant_id,
        settlement_id: alert.settlement_id,
        severity: alert.severity,
        evidence_summary: alert.description,
        investigator_notes: `Promoted from ${alert.severity} alert on ${alert.timestamp}`
      });
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      setActiveTab("cases");
      loadData();
    } catch (err) {
      alert("Failed to create case: " + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlowCard spotlightColor="rgba(239, 68, 68, 0.25)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Active Risk Alerts</span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            <AnimatedCounter value={alerts.length} />
          </div>
          <span className="text-[11px] text-slate-400">{alerts.filter(a => a.severity === "CRITICAL").length} Critical severity</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(99, 102, 241, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Investigation Cases</span>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={cases.length} />
          </div>
          <span className="text-[11px] text-indigo-400">{cases.filter(c => c.status === "OPEN" || c.status === "INVESTIGATING").length} Active in progress</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(16, 185, 129, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Resolved Cases</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={cases.filter(c => c.status === "RESOLVED").length} />
          </div>
          <span className="text-[11px] text-slate-400">Audit trail preserved</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(168, 85, 247, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Auditor Status</span>
          <div className="text-2xl font-black text-indigo-300 font-mono flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>Autonomous</span>
          </div>
          <span className="text-[11px] text-slate-400">Continuous background scan</span>
        </GlowCard>
      </div>

      {/* Control Bar: Subtabs */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "alerts"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Central Alerts ({alerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cases")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "cases"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Investigation Cases ({cases.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts or cases..."
            className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Alerts View */}
      {activeTab === "alerts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts
            .filter(a => !searchTerm || a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || a.description?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((alert) => (
              <motion.div
                key={alert.alert_id}
                whileHover={{ y: -3 }}
                className="bg-[#111827] border border-[#1E293B] hover:border-rose-500/40 p-5 rounded-2xl space-y-3 shadow-xl transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      alert.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {alert.severity} • {alert.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                  </div>

                  <h4 className="font-extrabold text-white text-xs leading-snug">{alert.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{alert.description}</p>
                </div>

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                  {alert.merchant_id && (
                    <button
                      onClick={() => onInvestigateMerchant(alert.merchant_id)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition"
                    >
                      Dossier ({alert.merchant_id})
                    </button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleConvertAlertToCase(alert)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <span>Open Case</span>
                    <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* Cases View */}
      {activeTab === "cases" && (
        <div className="space-y-3">
          {cases.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-xs">
              <FolderLock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No active investigation cases. Open a case directly from an alert above!</span>
            </div>
          ) : (
            cases
              .filter(c => !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.case_id?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((c) => (
                <div key={c.case_id} className="bg-[#111827] border border-[#1E293B] p-5 rounded-2xl space-y-3 shadow-lg hover:border-indigo-500/30 transition">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {c.case_id}
                      </span>
                      <h4 className="font-extrabold text-white text-xs">{c.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        c.severity === "HIGH" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {c.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono mr-1">Status:</span>
                      {["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateCase(c.case_id, st)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold border transition ${
                            c.status === st
                              ? (st === "RESOLVED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-indigo-600 text-white border-indigo-600")
                              : "bg-[#0B0F17] text-slate-400 border-[#1E293B] hover:border-slate-500"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300">{c.evidence_summary}</p>
                  
                  {c.investigator_notes && (
                    <div className="text-[11px] text-slate-400 bg-[#0B0F17] p-2.5 rounded-xl border border-[#1E293B] font-mono">
                      Notes: {c.investigator_notes}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
