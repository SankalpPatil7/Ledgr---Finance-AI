import React, { useState, useEffect } from "react";
import { 
  Flag, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search, 
  RefreshCw,
  Cpu,
  User,
  History
} from "lucide-react";
import { getFlags, updateFlagStatus, getAuditLogs } from "../api";

export default function FlagsView({ onOpenNewFlag }) {
  const [flags, setFlags] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("flags"); // 'flags' | 'audit'
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [flagsData, logsData] = await Promise.all([getFlags(), getAuditLogs(100)]);
      setFlags(flagsData || []);
      setAuditLogs(logsData || []);
    } catch (err) {
      console.error("Failed to load flags/audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (flagId, newStatus) => {
    try {
      await updateFlagStatus(flagId, newStatus);
      setFlags(prev => prev.map(f => f.flag_id === flagId ? { ...f, status: newStatus } : f));
      // Refresh audit logs to show update
      const updatedLogs = await getAuditLogs(100);
      setAuditLogs(updatedLogs);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const filteredFlags = flags.filter(f => {
    if (statusFilter === "ALL") return true;
    return f.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "INVESTIGATING":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "RESOLVED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "FALSE_POSITIVE":
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
      default:
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-400" />
            <span>Financial Flags & Governance Audit Ledger</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Track and resolve flagged discrepancies, duplicate payouts, and inspect immutable system audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewFlag}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Create Flag</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-slate-300 border border-[#334155] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-tab switcher: Flags vs Audit Logs */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("flags")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === "flags"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-[#111827] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Active Financial Flags ({flags.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === "audit"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-[#111827] text-slate-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>System Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {activeSubTab === "flags" && (
          <div className="flex items-center gap-2">
            {["ALL", "OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  statusFilter === st
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeSubTab === "flags" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlags.map((flag) => (
            <div 
              key={flag.flag_id}
              className="glass-card rounded-2xl p-5 border border-[#1E293B] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 text-xs">{flag.flag_id}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(flag.status)}`}>
                    {flag.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {flag.flag_type?.replace('_', ' ')} • {flag.severity}
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed mt-1">
                    {flag.reason}
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono bg-[#0B0F17] p-2.5 rounded-lg border border-[#1E293B]">
                  {flag.settlement_id && <div>Settlement: <strong className="text-slate-200">{flag.settlement_id}</strong></div>}
                  {flag.transaction_id && <div>Transaction: <strong className="text-slate-200">{flag.transaction_id}</strong></div>}
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Created: {flag.created_at}</span>
                  </div>
                </div>
              </div>

              {/* Status Updater Select */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">Change Status:</span>
                <select
                  value={flag.status}
                  onChange={(e) => handleStatusChange(flag.flag_id, e.target.value)}
                  className="bg-[#0B0F17] border border-[#1E293B] rounded-lg px-2.5 py-1 text-xs text-slate-300 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="glass-card rounded-2xl overflow-hidden border border-[#1E293B] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-slate-400 font-mono">
                  <th className="py-3.5 px-4">Log ID</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Audit Details</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {auditLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-[11px]">
                      {log.log_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        {log.user_or_agent?.includes("AI") ? (
                          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{log.user_or_agent}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-300 font-bold">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0B0F17] text-slate-300">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {log.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
