import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Clock, Code, ShieldCheck, Cpu, Database, Sparkles } from "lucide-react";

export default function TraceModal({ isOpen, onClose, trace = [], question, executionTime, toolName }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F17]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  AI Controller Execution Trace
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {executionTime}ms
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-lg">
                  Query: "{question}"
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Step-by-Step Timeline */}
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Operational Timeline ({trace.length} Steps)</span>
              <span className="text-indigo-400 font-mono">Tool: {toolName || "run_sql"}</span>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E293B]">
              {trace.map((item, idx) => {
                const isLast = idx === trace.length - 1;
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="relative group"
                  >
                    {/* Step bullet */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isLast 
                        ? "bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/40" 
                        : "bg-[#1E293B] text-indigo-400 border border-indigo-500/40"
                    }`}>
                      {item.step}
                    </div>

                    <div className="bg-[#0B0F17]/80 border border-[#1E293B] rounded-xl p-3.5 space-y-1.5 hover:border-indigo-500/40 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 inline-block">
                          {item.stage}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#1E293B] bg-[#0B0F17] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All execution steps audited & verified read-only</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
            >
              Close Trace
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
