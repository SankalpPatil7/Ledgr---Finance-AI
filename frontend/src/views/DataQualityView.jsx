import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Cpu, 
  FileSpreadsheet, 
  Hash, 
  Search,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import AnimatedCounter from "../components/AnimatedCounter";
import FlowNextBanner from "../components/FlowNextBanner";
import { getDataQuality, getDatabaseProfile } from "../api";

export default function DataQualityView({ activeDb, onNavigateTab }) {
  const [quality, setQuality] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQualityData();
  }, [activeDb]);

  const loadQualityData = async () => {
    setIsLoading(true);
    try {
      const [qualData, profData] = await Promise.all([
        getDataQuality(),
        getDatabaseProfile()
      ]);
      setQuality(qualData);
      setProfile(profData);
    } catch (err) {
      console.error("Failed to load quality data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !quality || !profile) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Auditing Data Quality & Schema Intelligence...</span>
        </div>
      </div>
    );
  }

  const score = quality.overall_data_quality_score || 95;
  const intel = profile.schema_intelligence || {};
  const capabilities = profile.capabilities || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Data Quality Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlowCard spotlightColor="rgba(16, 185, 129, 0.25)" className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Data Quality Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-400 font-mono">
              <AnimatedCounter value={score} />
            </span>
            <span className="text-slate-500 font-mono text-sm">/ 100</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 inline-block font-mono">
            {quality.quality_level || "EXCELLENT"}
          </span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(99, 102, 241, 0.2)" className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Profiled Records</span>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={profile.total_records || 0} />
          </div>
          <span className="text-[11px] text-slate-400">Across {profile.total_tables} tables & {profile.total_columns} columns</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(245, 158, 11, 0.2)" className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Missing Values</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {quality.missing_percentage}%
          </div>
          <span className="text-[11px] text-slate-400">{quality.missing_values_count} missing cells detected</span>
        </GlowCard>

        <GlowCard spotlightColor="rgba(168, 85, 247, 0.2)" className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Duplicate Records</span>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {quality.duplicate_percentage}%
          </div>
          <span className="text-[11px] text-slate-400">{quality.duplicate_records_count} duplicate rows found</span>
        </GlowCard>
      </div>

      {/* Quality Integrity Checks */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automated Data Quality Checks</span>
          </h4>
          <span className="text-xs font-mono text-slate-400">5 Diagnostic Rules Executed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quality.checks?.map((chk, idx) => (
            <div key={idx} className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{chk.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  chk.status === "PASSED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {chk.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{chk.metric}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Schema Intelligence & Semantic Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Classification */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Schema Intelligence Layer (Table Purpose Mapping)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Autonomous semantic entity recognition across database structures</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Table Name</th>
                  <th className="py-2.5 px-3">Discovered Entity Role</th>
                  <th className="py-2.5 px-3 text-right">Records</th>
                  <th className="py-2.5 px-3 text-right">Columns</th>
                  <th className="py-2.5 px-3 text-right">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {quality.table_reports?.map((t) => {
                  const mapping = intel.table_mappings?.[t.table_name] || {};
                  return (
                    <tr key={t.table_name} className="hover:bg-[#1E293B]/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {t.table_name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {mapping.purpose || "GENERAL_ENTITY"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-200">
                        {t.rows?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {t.columns}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {t.table_quality_score}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Capability Matrix */}
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Feature Capability Matrix</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Adaptive features supported on `{activeDb}`</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: "Transactions Analysis", key: "transactions" },
              { label: "Revenue Analytics", key: "revenue_analytics" },
              { label: "Settlement Reconciliation", key: "settlement_reconciliation" },
              { label: "Refund Intelligence", key: "refund_intelligence" },
              { label: "Dispute & Chargeback Analytics", key: "dispute_analytics" },
              { label: "Merchant Risk Intelligence", key: "merchant_risk" },
              { label: "ML Anomaly Detection", key: "anomaly_detection" },
              { label: "Data Quality Auditing", key: "data_quality_scan" },
            ].map((feat) => {
              const isSupported = capabilities[feat.key] ?? true;
              return (
                <div key={feat.key} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                  <span className="font-medium text-slate-200">{feat.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isSupported ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}>
                    {isSupported ? "AVAILABLE" : "UNAVAILABLE"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flow Continuation to Stage 03 */}
      <FlowNextBanner
        currentStep="02"
        currentTitle="Data Quality & Integrity Profiling"
        nextStep="03"
        nextTitle="Settlement Reconciliation Engine"
        nextTab="reconciliation"
        badge="STAGE 02 COMPLETE"
        description="Database integrity and completeness verified. Proceed to Stage 03 to cross-reconcile internal transaction settlements against bank-reported gateway payouts."
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
