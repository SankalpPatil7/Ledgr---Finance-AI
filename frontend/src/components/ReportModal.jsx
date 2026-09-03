import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, FileText, Download, Printer, Copy, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

export default function ReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const [copied, setCopied] = React.useState(false);
  const k = reportData.kpis || {};
  const rec = reportData.reconciliation || {};
  const ano = reportData.anomalies || {};

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(reportData.markdown || "");
    setCopied(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([reportData.markdown || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LEDGR_Finance_Report_${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F17]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  LEDGR Finance Health Report
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    Score: {reportData.health_score}/100
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Generated at: <span className="font-mono text-slate-200">{reportData.generated_at}</span> | DB: <span className="font-mono text-indigo-400">{reportData.database}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-300 text-xs font-semibold transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy MD"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-300 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs leading-relaxed bg-[#0B0F17]">
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#111827] border border-[#1E293B] p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium">Audited Volume</span>
                <p className="text-base font-extrabold text-white font-mono mt-1">₹{k.transactions?.total_volume?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className="text-[10px] text-slate-500 font-mono">{k.transactions?.total_count} transactions</span>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium">Settlement Match Rate</span>
                <p className="text-base font-extrabold text-emerald-400 font-mono mt-1">{rec.match_rate}%</p>
                <span className="text-[10px] text-rose-400 font-mono">{rec.mismatched_count} mismatches detected</span>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium">Anomalies Detected</span>
                <p className="text-base font-extrabold text-amber-400 font-mono mt-1">{ano.total_anomalies}</p>
                <span className="text-[10px] text-slate-500 font-mono">{ano.duplicate_payouts_count} duplicate, {ano.refund_spikes_count} spike</span>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium">Total Risk Exposure</span>
                <p className="text-base font-extrabold text-rose-400 font-mono mt-1">₹{k.exposure?.total_potential_exposure?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className="text-[10px] text-rose-400 font-mono">Requires action</span>
              </div>
            </div>

            {/* Key Findings Section */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Prioritized Audit Recommendations</span>
              </h4>

              <div className="space-y-3">
                {reportData.recommendations?.map((recItem, idx) => (
                  <div key={idx} className="bg-[#0B0F17] border border-[#1E293B] p-3.5 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{recItem.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        recItem.priority.includes("CRITICAL") ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {recItem.priority}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{recItem.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Markdown Content Preview */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Full Audit Transcript</h4>
              <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap bg-[#0B0F17] p-4 rounded-lg border border-[#1E293B] max-h-64 overflow-y-auto">
                {reportData.markdown}
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1E293B] bg-[#0B0F17] flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
