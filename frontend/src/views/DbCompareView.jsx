import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  GitCompare, 
  Database, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import { getDatabases, compareDatabases } from "../api";

export default function DbCompareView() {
  const [databases, setDatabases] = useState([]);
  const [dbA, setDbA] = useState("ledgr.db");
  const [dbB, setDbB] = useState("ledgr.db");
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDbs();
  }, []);

  const loadDbs = async () => {
    try {
      const data = await getDatabases();
      setDatabases(data.databases || []);
      if (data.databases?.length >= 2) {
        setDbA(data.databases[0].name);
        setDbB(data.databases[1].name);
      } else if (data.databases?.length === 1) {
        setDbA(data.databases[0].name);
        setDbB(data.databases[0].name);
      }
    } catch (err) {
      console.error("Failed to load databases:", err);
    }
  };

  const handleCompare = async () => {
    setIsLoading(true);
    try {
      const res = await compareDatabases(dbA, dbB);
      setComparison(res);
    } catch (err) {
      alert("Failed to compare databases: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Selector Box */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>Database Comparison & Trend Delta Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Compare financial metrics, volumes, and risks across two database snapshots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Baseline Database (A)</label>
            <select
              value={dbA}
              onChange={(e) => setDbA(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {databases.map(d => (
                <option key={d.name} value={d.name}>{d.name} ({d.size_kb} KB)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Comparison Database (B)</label>
            <select
              value={dbB}
              onChange={(e) => setDbB(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {databases.map(d => (
                <option key={d.name} value={d.name}>{d.name} ({d.size_kb} KB)</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCompare}
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Comparing..." : "Compare Snapshots"}</span>
          </motion.button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-2xl text-xs text-slate-200">
            <span className="font-bold text-indigo-300">Analysis Summary:</span> {comparison.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.metrics?.map((m, idx) => (
              <GlowCard key={idx} className="p-5 space-y-3">
                <span className="text-xs font-semibold text-slate-400">{m.metric}</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Baseline ({comparison.database_a})</span>
                    <span className="text-base font-bold text-slate-300 font-mono">{m.db_a}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Comparison ({comparison.database_b})</span>
                    <span className="text-base font-bold text-white font-mono">{m.db_b}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Delta Shift:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    m.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {m.change_pct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{m.change_pct >= 0 ? `+${m.change_pct}%` : `${m.change_pct}%`}</span>
                  </span>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
