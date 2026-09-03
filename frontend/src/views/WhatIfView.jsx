import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { simulateWhatIf } from "../api";

export default function WhatIfView({ kpis }) {
  const [refundChange, setRefundChange] = useState(10);
  const [disputeChange, setDisputeChange] = useState(-5);
  const [recoveryPct, setRecoveryPct] = useState(50);
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    runSim();
  }, [refundChange, disputeChange, recoveryPct]);

  const runSim = async () => {
    setIsSimulating(true);
    try {
      const data = await simulateWhatIf({
        refund_pct_change: parseFloat(refundChange),
        dispute_pct_change: parseFloat(disputeChange),
        settlement_recovery_pct: parseFloat(recoveryPct),
      });
      setSimResult(data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetDefaults = () => {
    setRefundChange(0);
    setDisputeChange(0);
    setRecoveryPct(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Financial What-If Scenario Simulator</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Simulate the bottom-line financial impact of refund spikes, chargeback surges, and settlement mismatch clawbacks.
          </p>
        </div>

        <button
          onClick={resetDefaults}
          className="px-3.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Baseline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] space-y-6">
          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            Simulation Parameters
          </h4>

          {/* 1. Refund Shift Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Merchant Refund Volume Shift</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                refundChange > 0 ? "bg-rose-500/20 text-rose-300" : refundChange < 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-[#0B0F17] text-slate-400"
              }`}>
                {refundChange > 0 ? `+${refundChange}%` : `${refundChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={refundChange}
              onChange={(e) => setRefundChange(Number(e.target.value))}
              className="w-full h-2 bg-[#0B0F17] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50%</span>
              <span>Baseline (0%)</span>
              <span>+100%</span>
            </div>
          </div>

          {/* 2. Dispute Shift Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Dispute / Chargeback Shift</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                disputeChange > 0 ? "bg-rose-500/20 text-rose-300" : disputeChange < 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-[#0B0F17] text-slate-400"
              }`}>
                {disputeChange > 0 ? `+${disputeChange}%` : `${disputeChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={disputeChange}
              onChange={(e) => setDisputeChange(Number(e.target.value))}
              className="w-full h-2 bg-[#0B0F17] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50%</span>
              <span>Baseline (0%)</span>
              <span>+100%</span>
            </div>
          </div>

          {/* 3. Settlement Discrepancy Recovery Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Settlement Mismatch Recovery</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300">
                {recoveryPct}% Recovered
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={recoveryPct}
              onChange={(e) => setRecoveryPct(Number(e.target.value))}
              className="w-full h-2 bg-[#0B0F17] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (No Clawback)</span>
              <span>50%</span>
              <span>100% (Full Recovery)</span>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-[#1E293B] space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Simulated Financial Outcome</span>
              </h4>
              {isSimulating && <span className="text-[10px] text-indigo-400 font-mono animate-pulse">Calculating...</span>}
            </div>

            {/* Metric Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Net Revenue Card */}
              <div className="bg-[#0B0F17] border border-[#1E293B] rounded-xl p-4 space-y-2">
                <span className="text-[11px] text-slate-400 font-medium">Simulated Net Revenue</span>
                <div className="text-2xl font-black text-white font-mono">
                  ₹{simResult?.simulation?.simulated_net_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span>Net Impact:</span>
                  <span className={`font-bold flex items-center ${
                    (simResult?.simulation?.net_revenue_impact || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {(simResult?.simulation?.net_revenue_impact || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 inline mr-0.5" />}
                    {(simResult?.simulation?.net_revenue_impact || 0) >= 0 ? `+₹${simResult?.simulation?.net_revenue_impact?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `-₹${Math.abs(simResult?.simulation?.net_revenue_impact || 0)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>

              {/* Remaining Exposure Card */}
              <div className="bg-[#0B0F17] border border-[#1E293B] rounded-xl p-4 space-y-2">
                <span className="text-[11px] text-slate-400 font-medium">Remaining Risk Exposure</span>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  ₹{simResult?.simulation?.simulated_total_exposure?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span>Recovered Gap:</span>
                  <span className="text-emerald-400 font-bold">
                    +₹{simResult?.simulation?.recovered_settlement_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase tracking-wider">
                Financial Analysis & Strategic Insight
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {simResult?.explanation}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-4 border-t border-[#1E293B] flex items-center justify-between">
            <span>Baseline Net Revenue: ₹{simResult?.baseline?.net_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span>Baseline Exposure: ₹{simResult?.baseline?.total_exposure?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
