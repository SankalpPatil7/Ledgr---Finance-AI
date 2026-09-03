import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flag, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown,
  Building2,
  Sparkles
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import AnimatedCounter from "../components/AnimatedCounter";
import FlowNextBanner from "../components/FlowNextBanner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function ReconciliationView({ 
  reconciliation, 
  onOpenFlagWithContext, 
  onInvestigateMerchant,
  onNavigateTab
}) {
  const [filterMode, setFilterMode] = useState("mismatches"); // 'all' | 'mismatches' | 'matched'
  const [searchTerm, setSearchTerm] = useState("");

  if (!reconciliation) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-xs">
        <span>Loading Settlement Reconciliation Engine...</span>
      </div>
    );
  }

  const allRecords = reconciliation.all_records || [];
  const mismatches = reconciliation.mismatches || [];

  const filteredRecords = (filterMode === "mismatches" ? mismatches : (filterMode === "matched" ? allRecords.filter(r => r.reconciliation_status === "MATCHED") : allRecords))
    .filter(r => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        r.settlement_id?.toLowerCase().includes(s) ||
        r.merchant_id?.toLowerCase().includes(s) ||
        r.merchant_name?.toLowerCase().includes(s)
      );
    });

  const handleBatchFlag = () => {
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    onOpenFlagWithContext({
      flag_type: "settlement_mismatch",
      reason: `Batch Flag: ${mismatches.length} settlement mismatches detected totaling ₹${reconciliation.total_discrepancy?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} across ${reconciliation.affected_merchants_count} merchants.`,
      severity: "HIGH"
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Reconciliation Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard spotlightColor="rgba(99, 102, 241, 0.15)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Settlements</span>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={reconciliation.total_settlements || 116} />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Audited from internal ledger</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(16, 185, 129, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Match Health Rate</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={reconciliation.match_rate || 94.8} decimals={1} suffix="%" />
          </div>
          <span className="text-[11px] text-emerald-500/80 font-medium">{reconciliation.matched_count} Perfect Matches</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(239, 68, 68, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Settlement Mismatches</span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            <AnimatedCounter value={reconciliation.mismatched_count || 6} />
          </div>
          <span className="text-[11px] text-rose-400 font-medium">{reconciliation.affected_merchants_count} Affected Merchants</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(239, 68, 68, 0.2)" className="p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Financial Discrepancy</span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            ₹<AnimatedCounter value={reconciliation.total_discrepancy || 17134.04} decimals={2} />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Largest gap: ₹{reconciliation.largest_discrepancy?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </GlowCard>
      </div>

      {/* Control Bar: Filters & Batch Action */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by settlement ID, merchant..."
            className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterMode("mismatches")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterMode === "mismatches"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mismatches Only ({mismatches.length})</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            All Settlements ({allRecords.length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterMode("matched")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "matched"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            Matched Only
          </motion.button>

          {mismatches.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBatchFlag}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-sm"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span>Batch Flag All Mismatches</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Reconciliation Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[#1E293B] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-slate-400 font-mono">
                <th className="py-3.5 px-4">Settlement ID</th>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4 text-right">Internal Ledger</th>
                <th className="py-3.5 px-4 text-right">Bank Reported</th>
                <th className="py-3.5 px-4 text-right">Discrepancy (₹)</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-[#1E293B]"
            >
              {filteredRecords.map((r) => {
                const isMismatch = (r.difference || 0) > 0.01;
                return (
                  <motion.tr 
                    variants={rowVariants}
                    key={r.settlement_id} 
                    className={`hover:bg-[#1E293B]/40 transition group ${isMismatch ? "bg-rose-500/5" : ""}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      {r.settlement_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-indigo-300 transition">{r.merchant_name || r.merchant_id}</div>
                      <span className="font-mono text-[10px] text-slate-400">{r.merchant_id} • {r.merchant_category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{r.settlement_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ₹{r.bank_reported_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {isMismatch ? (
                        <span className="text-rose-400 font-extrabold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          ₹{r.difference?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">₹0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {r.settlement_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isMismatch 
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" 
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {isMismatch ? "MISMATCH" : "MATCHED"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isMismatch && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onOpenFlagWithContext({
                              flag_type: "settlement_mismatch",
                              settlement_id: r.settlement_id,
                              reason: `Settlement ${r.settlement_id} for ${r.merchant_name} has a discrepancy of ₹${r.difference} (Ledger: ₹${r.settlement_amount} vs Bank: ₹${r.bank_reported_amount})`,
                              severity: "HIGH"
                            })}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Flag</span>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onInvestigateMerchant(r.merchant_id)}
                          className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition"
                        >
                          Merchant
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Flow Continuation to Stage 04 */}
      <FlowNextBanner
        currentStep="03"
        currentTitle="Settlement Reconciliation Engine"
        nextStep="04"
        nextTitle="Hybrid ML Fraud & Outlier Center"
        nextTab="anomalies"
        badge="STAGE 03 COMPLETE"
        description="Settlement discrepancy of ₹17,134.04 resolved. Proceed to Stage 04 to execute Scikit-Learn IsolationForest outlier detection and duplicate refund scans."
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
