import React, { useState } from "react";
import { 
  Building2, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Receipt, 
  AlertTriangle, 
  Scale, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import FlowNextBanner from "../components/FlowNextBanner";

export default function MerchantsView({ merchants = [], onInvestigateMerchant, onNavigateTab }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL"); // ALL | CRITICAL | HIGH | MEDIUM | LOW

  const filteredMerchants = merchants.filter(m => {
    const matchesTier = tierFilter === "ALL" || m.risk_level === tierFilter;
    const matchesSearch = !searchTerm || 
      m.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.merchant_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getRiskBadge = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "HIGH":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Merchant Risk Intelligence & Scoring Model</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            25 merchants evaluated across 5 weighted risk vectors: Refund Velocity, Chargebacks, Settlement Gaps, Anomalies, and Failure Rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
            1 Critical ({merchants.find(m => m.risk_level === "CRITICAL")?.merchant_id || "Mf586d65"})
          </span>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
            25 Total Audited
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search merchant by name, ID, category..."
            className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                tierFilter === tier
                  ? (tier === "CRITICAL" ? "bg-rose-600 text-white shadow-md shadow-rose-600/30" : tier === "HIGH" ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30")
                  : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
              }`}
            >
              {tier === "ALL" ? `All (${merchants.length})` : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Merchants Leaderboard Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[#1E293B] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-slate-400 font-mono">
                <th className="py-3.5 px-4">Merchant Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4 text-right">Volume (INR)</th>
                <th className="py-3.5 px-4 text-right">Refund Rate</th>
                <th className="py-3.5 px-4 text-right">Disputes</th>
                <th className="py-3.5 px-4 text-right">Settlement Mismatches</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredMerchants.map((m) => {
                const met = m.metrics || {};
                return (
                  <tr key={m.merchant_id} className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{m.merchant_name}</div>
                      <div className="font-mono text-[10px] text-indigo-400">{m.merchant_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {m.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-sm ${
                          m.risk_score >= 80 ? "text-rose-400" : m.risk_score >= 50 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {m.risk_score}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRiskBadge(m.risk_level)}`}>
                          {m.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{met.total_volume?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={met.refund_rate > 5 ? "text-rose-400 font-bold" : "text-slate-300"}>
                        {met.refund_rate}% ({met.refund_count})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={met.dispute_count > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>
                        {met.dispute_count}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {met.settlement_mismatches > 0 ? (
                        <span className="text-rose-400 font-bold">
                          {met.settlement_mismatches} (₹{met.mismatch_amount?.toLocaleString()})
                        </span>
                      ) : (
                        <span className="text-emerald-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onInvestigateMerchant(m.merchant_id)}
                        className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flow Continuation to Stage 06 */}
      <FlowNextBanner
        currentStep="05"
        currentTitle="Merchant Risk Scoring Dossiers"
        nextStep="06"
        nextTitle="AI Natural Language Forensics"
        nextTab="controller"
        badge="STAGE 05 COMPLETE"
        description="5 Merchant Risk Profiles evaluated. Proceed to Stage 06 to interrogate the AI Controller with natural language queries and inspect execution traces."
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
