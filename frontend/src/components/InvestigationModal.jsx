import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  X, 
  ShieldAlert, 
  Building2, 
  Receipt, 
  AlertTriangle, 
  Scale, 
  Flag, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function InvestigationModal({ isOpen, onClose, data, onOpenFlagWithContext }) {
  if (!isOpen || !data) return null;

  const [activeTab, setActiveTab] = useState("overview");
  const p = data.profile || {};
  const metrics = p.metrics || {};
  const breakdown = p.risk_breakdown || {};

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

  const handleCreateFlag = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
    onOpenFlagWithContext({
      flag_type: "merchant_investigation",
      reason: `Merchant ${p.merchant_name} (${p.merchant_id}) flagged with risk score ${p.risk_score}/100: ${p.reasons?.[0]}`,
      severity: p.risk_level === "CRITICAL" ? "HIGH" : "MEDIUM"
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F17]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 text-xl font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-extrabold text-white">{p.merchant_name}</h3>
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {p.merchant_id}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadge(p.risk_level)}`}>
                    {p.risk_level} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Category: <span className="text-slate-200 font-medium">{p.category}</span> | Member since: <span className="text-slate-200 font-medium">{p.signup_date}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#1E293B] px-6 bg-[#0E1524] gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Risk Profile & AI Recommendation", icon: Sparkles },
              { id: "transactions", label: `Transactions (${data.recent_transactions?.length || 0})`, icon: Receipt },
              { id: "refunds", label: `Refunds (${data.refunds?.length || 0})`, icon: AlertTriangle },
              { id: "disputes", label: `Disputes (${data.disputes?.length || 0})`, icon: ShieldAlert },
              { id: "settlements", label: `Settlements (${data.settlements?.length || 0})`, icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Score & Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Composite Score Card */}
                  <div className="bg-[#0B0F17] border border-[#1E293B] rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <span className="text-xs text-slate-400 font-semibold mb-2">Composite Risk Score</span>
                    <div className="relative flex items-center justify-center">
                      <span className={`text-5xl font-black font-mono ${p.risk_score >= 60 ? "text-rose-400" : "text-amber-400"}`}>
                        {p.risk_score}
                      </span>
                      <span className="text-slate-500 text-sm ml-1 font-mono">/100</span>
                    </div>
                    <span className={`mt-3 text-[11px] px-3 py-0.5 rounded-full font-bold border ${getRiskBadge(p.risk_level)}`}>
                      {p.risk_level} SEVERITY
                    </span>
                  </div>

                  {/* 5-Factor Risk Breakdown */}
                  <div className="md:col-span-2 bg-[#0B0F17] border border-[#1E293B] rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">5-Factor Risk Component Breakdown</h4>
                    
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-300 font-medium mb-1">
                          <span>Refund Risk</span>
                          <span className="font-mono font-bold text-rose-400">{breakdown.refund_risk || 0} / 25</span>
                        </div>
                        <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((breakdown.refund_risk || 0) / 25) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-rose-500 h-full rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 font-medium mb-1">
                          <span>Dispute / Chargeback Risk</span>
                          <span className="font-mono font-bold text-amber-400">{breakdown.dispute_risk || 0} / 20</span>
                        </div>
                        <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((breakdown.dispute_risk || 0) / 20) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="bg-amber-500 h-full rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 font-medium mb-1">
                          <span>Settlement Mismatch Risk</span>
                          <span className="font-mono font-bold text-purple-400">{breakdown.settlement_risk || 0} / 30</span>
                        </div>
                        <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((breakdown.settlement_risk || 0) / 30) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="bg-purple-500 h-full rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 font-medium mb-1">
                          <span>Anomaly / Duplicate Risk</span>
                          <span className="font-mono font-bold text-indigo-400">{breakdown.anomaly_risk || 0} / 15</span>
                        </div>
                        <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((breakdown.anomaly_risk || 0) / 15) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="bg-indigo-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence & Findings */}
                <div className="bg-[#0B0F17] border border-[#1E293B] rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identified Risk Factors & Evidence</h4>
                  <ul className="space-y-2">
                    {p.reasons?.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Controller Recommendation */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span>AI Controller Action Directive</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {data.recommendation}
                  </p>
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCreateFlag}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Create Formal Investigation Flag</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                      <th className="py-2.5 px-3">TX ID</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {data.recent_transactions?.map((tx) => (
                      <tr key={tx.transaction_id} className="hover:bg-[#1E293B]/40">
                        <td className="py-2 px-3 font-mono text-indigo-300">{tx.transaction_id}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === "success" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">{tx.payment_method}</td>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{tx.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "refunds" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Refund ID</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {data.refunds?.map((ref) => (
                      <tr key={ref.refund_id} className="hover:bg-[#1E293B]/40">
                        <td className="py-2 px-3 font-mono text-amber-300">{ref.refund_id}</td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">₹{ref.refund_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-slate-200">{ref.reason}</td>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{ref.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "settlements" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Settlement ID</th>
                      <th className="py-2.5 px-3">Internal Amount</th>
                      <th className="py-2.5 px-3">Bank Amount</th>
                      <th className="py-2.5 px-3">Difference</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {data.settlements?.map((stl) => {
                      const hasMismatch = (stl.difference || 0) > 0.01;
                      return (
                        <tr key={stl.settlement_id} className={`hover:bg-[#1E293B]/40 ${hasMismatch ? "bg-rose-500/5" : ""}`}>
                          <td className="py-2 px-3 font-mono text-purple-300">{stl.settlement_id}</td>
                          <td className="py-2 px-3 font-mono font-bold text-white">₹{stl.settlement_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 font-mono text-slate-300">₹{stl.bank_reported_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 font-mono">
                            {hasMismatch ? (
                              <span className="text-rose-400 font-bold">₹{stl.difference?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            ) : (
                              <span className="text-emerald-400">₹0.00</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{stl.settlement_date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "disputes" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Dispute ID</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {data.disputes?.map((dsp) => (
                      <tr key={dsp.dispute_id} className="hover:bg-[#1E293B]/40">
                        <td className="py-2 px-3 font-mono text-rose-300">{dsp.dispute_id}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">₹{dsp.dispute_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                            {dsp.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{dsp.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1E293B] bg-[#0B0F17] flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-200 rounded-lg text-xs font-bold transition"
            >
              Close Dossier
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
