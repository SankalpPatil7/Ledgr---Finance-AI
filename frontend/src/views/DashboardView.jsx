import React from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Scale, 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  Flag, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Receipt,
  PieChart as PieIcon,
  Clock,
  Zap,
  Activity,
  Layers,
  Box
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import GlowCard from "../components/GlowCard";
import AnimatedCounter from "../components/AnimatedCounter";
import FlowNextBanner from "../components/FlowNextBanner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function DashboardView({ 
  kpis, 
  reconciliation, 
  anomalies, 
  merchants = [], 
  onInvestigateMerchant, 
  onNavigateTab,
  onOpenFlagModal,
  onTriggerFullAudit
}) {
  if (!kpis) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="animate-pulse">Loading Ledgr Autonomous AI Finance Controller...</span>
        </div>
      </div>
    );
  }

  const tx = kpis.transactions || {};
  const stl = kpis.settlements || {};
  const exp = kpis.exposure || {};
  const ref = kpis.refunds || {};
  const dsp = kpis.disputes || {};

  const volumeTrendData = [
    { date: "Aug 01", volume: 420000, successful: 395000 },
    { date: "Aug 05", volume: 680000, successful: 640000 },
    { date: "Aug 10", volume: 950000, successful: 890000 },
    { date: "Aug 15", volume: 1120000, successful: 1040000 },
    { date: "Aug 20", volume: 1350000, successful: 1260000 },
    { date: "Aug 25", volume: 1680000, successful: 1570000 },
    { date: "Aug 28", volume: 1890000, successful: 1750000 },
  ];

  const settlementPieData = [
    { name: "Matched Settlements", value: stl.matched_count || 110, color: "#10B981" },
    { name: "Mismatched Settlements", value: stl.mismatched_count || 6, color: "#EF4444" },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* 3D Front Showcase Banner / Quick Portal */}
      <motion.div variants={itemVariants}>
        <GlowCard 
          spotlightColor="rgba(99, 102, 241, 0.2)"
          className="bg-gradient-to-r from-indigo-950/60 via-[#111827] to-purple-950/40 border-indigo-500/30 p-6 relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 font-mono">
                  <Box className="w-3.5 h-3.5 text-indigo-400" />
                  LEDGR Autonomous 3D Controller
                </span>
                <span className="text-slate-400 text-xs font-mono">• 15-Stage Audit Ready</span>
              </div>

              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Understand, Investigate, Reconcile, and Act
              </h3>
              
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Connect any SQLite, CSV, or Excel database. Ledgr autonomously discovers schemas, audits bank settlements, calculates merchant risk scores (0–100), and flags financial exposure in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onTriggerFullAudit}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Run Full 15-Step Audit</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigateTab("showcase")}
                className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-200 border border-[#334155] rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Box className="w-4 h-4 text-indigo-400" />
                <span>3D Product Tour</span>
              </motion.button>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Top Banner: Financial Exposure & Priority Alert */}
      <motion.div variants={itemVariants}>
        <GlowCard 
          spotlightColor="rgba(239, 68, 68, 0.2)"
          className="bg-gradient-to-r from-rose-950/40 via-[#111827] to-amber-950/30 border-rose-500/30 p-6 relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 animate-pulse font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Action Required: Potential Exposure Detected
                </span>
                <span className="text-slate-400 text-xs font-mono">• 8 Anomalies, 6 Discrepancies</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Total Financial Exposure:{" "}
                <span className="text-rose-400 font-mono">
                  ₹<AnimatedCounter value={exp.total_potential_exposure || 65384.04} decimals={2} />
                </span>
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Ledgr audit engine flagged ₹{exp.settlement_discrepancy?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} in bank settlement mismatches and ₹{exp.duplicate_payouts?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} in duplicate payouts. Immediate reconciliation and freeze recommended.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigateTab("reconciliation")}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>Review 6 Mismatches</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigateTab("controller")}
                className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-200 border border-[#334155] rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Ask AI Controller</span>
              </motion.button>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <motion.div variants={itemVariants}>
          <GlowCard spotlightColor="rgba(99, 102, 241, 0.2)" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Transactions</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                <AnimatedCounter value={tx.total_count || 1200} />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <span>Volume:</span>
                <span className="font-mono font-bold text-slate-200">
                  ₹<AnimatedCounter value={tx.total_volume || 0} decimals={2} />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1E293B]">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> {tx.success_rate}% Success
              </span>
              <span className="text-rose-400 font-mono">{tx.failure_rate}% Failed</span>
            </div>
          </GlowCard>
        </motion.div>

        {/* Settlement Health */}
        <motion.div variants={itemVariants}>
          <GlowCard spotlightColor="rgba(16, 185, 129, 0.2)" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Settlement Match Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                <AnimatedCounter value={stl.match_rate || 94.8} decimals={1} suffix="%" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <span>Discrepancy:</span>
                <span className="font-mono font-bold text-rose-400">
                  ₹<AnimatedCounter value={stl.total_discrepancy || 17134.04} decimals={2} />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1E293B]">
              <span className="text-slate-400">{stl.matched_count} Matched</span>
              <span className="text-rose-400 font-bold font-mono">{stl.mismatched_count} Mismatches</span>
            </div>
          </GlowCard>
        </motion.div>

        {/* Refunds & Velocity */}
        <motion.div variants={itemVariants}>
          <GlowCard spotlightColor="rgba(245, 158, 11, 0.2)" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Refunds & Velocity</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                <AnimatedCounter value={ref.total_count || 95} />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <span>Volume:</span>
                <span className="font-mono font-bold text-slate-200">
                  ₹<AnimatedCounter value={ref.total_volume || 0} decimals={2} />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1E293B]">
              <span className="text-amber-400 font-semibold font-mono">Rate: {ref.refund_rate}%</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                1 Velocity Spike
              </span>
            </div>
          </GlowCard>
        </motion.div>

        {/* Finance Health Score */}
        <motion.div variants={itemVariants}>
          <GlowCard spotlightColor="rgba(168, 85, 247, 0.2)" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Finance Health Score</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono flex items-center">
                <AnimatedCounter value={kpis.health_score || 85} />
                <span className="text-slate-500 text-sm ml-1">/100</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <span>Net Revenue:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹<AnimatedCounter value={kpis.net_revenue || 0} decimals={2} />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1E293B]">
              <span className="text-slate-400 font-mono">{kpis.merchants?.high_risk_count} High Risk Merch.</span>
              <span className="text-indigo-400 font-bold font-mono">{kpis.flags?.open} Open Flags</span>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume & Settlement Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlowCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Cumulative Transaction Volume (INR)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Audited transaction throughput vs settlement completion</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                +14.2% MoM
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeTrendData}>
                  <defs>
                    <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="succGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#1E293B", borderRadius: "12px", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                    formatter={(val) => [`₹${val.toLocaleString()}`, "Volume"]}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#volGradient)" />
                  <Area type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#succGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>
        </motion.div>

        {/* Settlement Match Donut */}
        <motion.div variants={itemVariants}>
          <GlowCard className="p-6 space-y-4 flex flex-col justify-between h-full">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Settlement Audit Ratio</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">116 Total Bank Settlements Reconciled</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={settlementPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {settlementPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#1E293B", borderRadius: "12px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold font-mono text-white">{stl.match_rate}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Matched</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-[#1E293B] pt-3">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Matched Records</span>
                </span>
                <span className="font-mono font-bold text-white">{stl.matched_count}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Mismatched Records</span>
                </span>
                <span className="font-mono font-bold text-rose-400">{stl.mismatched_count}</span>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* Bottom Section: Top Risk Merchants & Anomaly Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Risk Merchants Leaderboard */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlowCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Merchant Risk Leaderboard</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Ranked by 5-Factor Composite Risk Model (0 - 100)</p>
              </div>
              <button
                onClick={() => onNavigateTab("merchants")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
              >
                <span>View All 25 Merchants</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Merchant</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Key Risk Driver</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {merchants.slice(0, 5).map((m) => (
                    <tr key={m.merchant_id} className="hover:bg-[#1E293B]/40 transition group">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white group-hover:text-indigo-300 transition">{m.merchant_name}</div>
                        <div className="font-mono text-[10px] text-indigo-400">{m.merchant_id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{m.category}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-extrabold text-sm ${
                            m.risk_score >= 80 ? "text-rose-400" : m.risk_score >= 50 ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {m.risk_score}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            m.risk_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300" : m.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {m.risk_level}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                        {m.reasons?.[0]}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onInvestigateMerchant(m.merchant_id)}
                          className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Investigate
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Quick Anomaly Feed */}
        <motion.div variants={itemVariants}>
          <GlowCard className="p-6 space-y-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Active Anomaly Feed</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  8 Detected
                </span>
              </div>
              <p className="text-xs text-slate-400">ML + Rule based audit findings</p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
              {anomalies?.findings?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-[#0B0F17] border border-[#1E293B] rounded-xl p-3.5 space-y-1.5 hover:border-indigo-500/30 transition">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      item.severity === "HIGH" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {item.severity} • {item.category}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">{item.merchant_id}</span>
                  </div>
                  <h5 className="font-bold text-white text-xs">{item.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab("anomalies")}
              className="w-full py-2 bg-[#1E293B] hover:bg-[#283548] text-slate-200 border border-[#334155] rounded-xl text-xs font-bold transition text-center"
            >
              Explore All 8 Anomalies →
            </motion.button>
          </GlowCard>
        </motion.div>
      </div>

      {/* Launch Structured Audit Pipeline */}
      <FlowNextBanner
        currentStep="00"
        currentTitle="Executive Console Overview"
        nextStep="01"
        nextTitle="Connect & Ingest Database"
        nextTab="databases"
        badge="START AUDIT PIPELINE"
        description="Inspect the live data source, examine table schemas, or upload custom databases (.db, .csv, .xlsx) to launch an in-depth controllership audit."
        onNavigateTab={onNavigateTab}
      />
    </motion.div>
  );
}
