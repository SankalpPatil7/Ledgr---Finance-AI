import React from "react";
import { motion } from "framer-motion";
import { 
  Bot, 
  Scale, 
  AlertTriangle, 
  Building2, 
  Sliders, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Database, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Box, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  FileText 
} from "lucide-react";
import { SplineScene } from "../components/ui/splite";
import { CoverFlowCarousel, defaultAuditPipelineItems } from "../components/ui/3-d-coverflow-carousel";
import GlowCard from "../components/GlowCard";

export default function Showcase3DView({ onNavigateTab }) {
  const showcaseTools = [
    {
      id: "databases",
      title: "Universal Ingestion",
      badge: "STAGE 01",
      desc: "Autonomous connection & introspective schema parsing across SQLite, Postgres, CSV, and XLSX formats.",
      icon: Database,
      color: "from-emerald-500 to-teal-600",
      accent: "#10B981",
    },
    {
      id: "dataquality",
      title: "Data Quality & Profiling",
      badge: "STAGE 02",
      desc: "Autonomous completeness scans, duplicate row detection, temporal consistency, and semantic entity mapping.",
      icon: Layers,
      color: "from-teal-500 to-emerald-600",
      accent: "#14B8A6",
    },
    {
      id: "reconciliation",
      title: "Settlement Reconciler",
      badge: "STAGE 03",
      desc: "Audit bank-reported payouts against internal ledger numbers. Calculates exact discrepancies and exposure in real-time.",
      icon: Scale,
      color: "from-purple-500 to-indigo-600",
      accent: "#8B5CF6",
    },
    {
      id: "anomalies",
      title: "Hybrid ML Fraud Center",
      badge: "STAGE 04",
      desc: "Combines machine learning statistical outlier scoring with deterministic duplicate payouts and refund velocity spikes.",
      icon: AlertTriangle,
      color: "from-amber-500 to-rose-600",
      accent: "#F59E0B",
    },
    {
      id: "merchants",
      title: "Merchant Risk Dossiers",
      badge: "STAGE 05",
      desc: "Autonomous 0-100 composite risk scoring evaluating dispute volumes, refund rates, failure velocity, and settlement mismatch history.",
      icon: Building2,
      color: "from-rose-500 to-orange-600",
      accent: "#F43F5E",
    },
    {
      id: "controller",
      title: "NVIDIA AI Controller",
      badge: "STAGE 06",
      desc: "Ask complex natural-language questions. The controller parses intent, generates verified SQL, and self-corrects.",
      icon: Bot,
      color: "from-cyan-500 to-indigo-600",
      accent: "#06B6D4",
    },
    {
      id: "reports",
      title: "Certified Audit Reports",
      badge: "STAGE 07",
      desc: "Produces executive-ready financial health certifications with verified health scores and one-click PDF/Excel export.",
      icon: FileText,
      color: "from-emerald-500 to-cyan-600",
      accent: "#10B981",
    },
    {
      id: "whatif",
      title: "What-If Simulator",
      badge: "STRESS TEST",
      desc: "Simulate revenue elasticity, fee adjustments, dispute shifts, and settlement clawback recovery targets.",
      icon: Sliders,
      color: "from-indigo-500 to-cyan-600",
      accent: "#6366F1",
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Hero 3D Section */}
      <div className="relative w-full rounded-3xl overflow-hidden glass-card border border-white/[0.08] p-8 sm:p-12 shadow-2xl bg-gradient-to-br from-white/[0.03] to-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>NEXT-GEN AI FINANCE CONTROLLER</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Autonomous Intelligence for Any Database.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-mono">
              LEDGR autonomously discovers database schemas, audits settlements, calculates merchant risk scores (0–100), isolates financial fraud via IsolationForest ML, and executes full 15-stage audits in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab("controller")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950/40 transition flex items-center gap-2 hover:scale-[1.02]"
              >
                <Bot className="w-4 h-4" />
                <span>Launch AI Controller</span>
              </button>
              <button
                onClick={() => onNavigateTab("dashboard")}
                className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Spline 3D Scene View */}
          <div className="w-full h-80 sm:h-96 relative flex items-center justify-center">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* 2. 3D Coverflow Carousel Section — Autonomous Audit Pipeline */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest">
            INTERACTIVE SYSTEM SHOWCASE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Core Autonomous Audit Capabilities
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Swipe or use arrow keys to explore each engine. Click any card or button to launch.
          </p>
        </div>

        {/* 3D Coverflow Carousel with Autonomous Audit Pipeline items & rich images */}
        <CoverFlowCarousel 
          items={defaultAuditPipelineItems}
          sectionLabel="AUTONOMOUS AUDIT PIPELINE • 7-STAGE INTELLIGENCE SUITE"
          autoplay={true}
          autoplayDelay={4500}
          onSelectTool={(id) => onNavigateTab(id)}
          onCtaClick={(item) => {
            const target = item.tabTarget || item.id || "dashboard";
            onNavigateTab(target);
          }}
        />
      </div>

      {/* 3. Grid of Core Engines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>All Specialized Engines</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">8 Controllers Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {showcaseTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <GlowCard 
                key={tool.id} 
                spotlightColor={`${tool.accent}33`}
                className="p-5 space-y-3 flex flex-col justify-between cursor-pointer"
                onClick={() => onNavigateTab(tool.id)}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {tool.badge}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-white">{tool.title}</h4>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-3">{tool.desc}</p>
                </div>

                <div className="pt-2.5 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono font-bold text-blue-400 group-hover:text-blue-300 transition">
                  <span>Launch Engine</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
