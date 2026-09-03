import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Flag, ShieldAlert, CheckCircle2 } from "lucide-react";
import { createFlag } from "../api";

export default function FlagModal({ isOpen, onClose, onSuccess, initialData = {} }) {
  if (!isOpen) return null;

  const [flagType, setFlagType] = useState(initialData.flag_type || "settlement_mismatch");
  const [severity, setSeverity] = useState(initialData.severity || "HIGH");
  const [reason, setReason] = useState(initialData.reason || "");
  const [transactionId, setTransactionId] = useState(initialData.transaction_id || "");
  const [settlementId, setSettlementId] = useState(initialData.settlement_id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      if (initialData.flag_type) setFlagType(initialData.flag_type);
      if (initialData.severity) setSeverity(initialData.severity);
      if (initialData.reason) setReason(initialData.reason);
      if (initialData.transaction_id) setTransactionId(initialData.transaction_id);
      if (initialData.settlement_id) setSettlementId(initialData.settlement_id);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please specify a reason or evidence description.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await createFlag({
        flag_type: flagType,
        severity: severity,
        reason: reason.trim(),
        transaction_id: transactionId.trim() || null,
        settlement_id: settlementId.trim() || null,
      });

      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      setError("Failed to create flag: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F17]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create Financial Flag</h3>
                <p className="text-xs text-slate-400">Record an auditable risk item for finance investigation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Flag Category</label>
              <select
                value={flagType}
                onChange={(e) => setFlagType(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="settlement_mismatch">Settlement Mismatch (Reconciliation)</option>
                <option value="duplicate_payout">Duplicate Payout Anomaly</option>
                <option value="refund_spike">Refund Velocity Spike</option>
                <option value="merchant_risk">High-Risk Merchant Exposure</option>
                <option value="statistical_outlier">ML Statistical Outlier</option>
                <option value="compliance_audit">Manual Compliance Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Severity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["HIGH", "MEDIUM", "LOW"].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      severity === lvl
                        ? (lvl === "HIGH" ? "bg-rose-500/20 text-rose-300 border-rose-500/50" : lvl === "MEDIUM" ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50")
                        : "bg-[#0B0F17] text-slate-400 border-[#1E293B] hover:border-slate-600"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason & Evidence Details</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Bank reported amount differs by ₹1,958.34 from internal ledger records..."
                className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Settlement ID (Optional)</label>
                <input
                  type="text"
                  value={settlementId}
                  onChange={(e) => setSettlementId(e.target.value)}
                  placeholder="e.g. Sec7d07df"
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TX10001"
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-300 rounded-lg text-xs font-bold transition"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Recording..." : "Record Flag"}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
