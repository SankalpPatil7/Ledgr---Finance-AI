import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AnimatedBackground from "./components/AnimatedBackground";
import AuditFlowBar from "./components/AuditFlowBar";
import CommandPaletteModal from "./components/CommandPaletteModal";
import TraceModal from "./components/TraceModal";
import InvestigationModal from "./components/InvestigationModal";
import FlagModal from "./components/FlagModal";
import ReportModal from "./components/ReportModal";
import FullAuditModal from "./components/FullAuditModal";

import DashboardView from "./views/DashboardView";
import AIControllerView from "./views/AIControllerView";
import Showcase3DView from "./views/Showcase3DView";
import ReconciliationView from "./views/ReconciliationView";
import AnomaliesView from "./views/AnomaliesView";
import MerchantsView from "./views/MerchantsView";
import TransactionsView from "./views/TransactionsView";
import FlagsView from "./views/FlagsView";
import WhatIfView from "./views/WhatIfView";
import ReportsView from "./views/ReportsView";
import DatabasesView from "./views/DatabasesView";
import DataQualityView from "./views/DataQualityView";
import AlertsCasesView from "./views/AlertsCasesView";
import DbCompareView from "./views/DbCompareView";

import { 
  getKpis, 
  getReconciliation, 
  getAnomalies, 
  getMerchants, 
  getMerchantInvestigation, 
  generateReport, 
  runFullAudit,
  getHealth 
} from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("showcase"); // Default 3D Showcase Front
  const [activeDb, setActiveDb] = useState("ledgr.db");
  const [healthScore, setHealthScore] = useState(85);
  const [exposureAmount, setExposureAmount] = useState(65384.04);

  const [kpis, setKpis] = useState(null);
  const [reconciliation, setReconciliation] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Command Palette & Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [currentTrace, setCurrentTrace] = useState([]);
  const [traceQuestion, setTraceQuestion] = useState("");
  const [traceTime, setTraceTime] = useState(0);
  const [traceTool, setTraceTool] = useState("");

  const [investigationModalOpen, setInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState(null);

  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagInitialData, setFlagInitialData] = useState({});

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [fullAuditModalOpen, setFullAuditModalOpen] = useState(false);
  const [fullAuditData, setFullAuditData] = useState(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [activeDb]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [healthData, kpisData, reconData, anomaliesData, merchantsData] = await Promise.all([
        getHealth(),
        getKpis(),
        getReconciliation(),
        getAnomalies(),
        getMerchants()
      ]);

      setActiveDb(healthData.database || healthData.active_database || "ledgr.db");
      setKpis(kpisData);
      setHealthScore(kpisData?.health_score ?? 85);
      setExposureAmount(kpisData?.exposure?.total_potential_exposure ?? 65384.04);
      setReconciliation(reconData);
      setAnomalies(anomaliesData);
      setMerchants(merchantsData || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTrace = (trace, question, time, tool) => {
    setCurrentTrace(trace || []);
    setTraceQuestion(question || "");
    setTraceTime(time || 0);
    setTraceTool(tool || "run_sql");
    setTraceModalOpen(true);
  };

  const handleInvestigateMerchant = async (merchantId) => {
    try {
      const data = await getMerchantInvestigation(merchantId);
      setInvestigationData(data);
      setInvestigationModalOpen(true);
    } catch (err) {
      alert("Failed to fetch merchant investigation: " + err.message);
    }
  };

  const handleOpenFlagWithContext = (initialData = {}) => {
    setFlagInitialData(initialData);
    setFlagModalOpen(true);
  };

  const handleTriggerFullAudit = async () => {
    try {
      const auditResult = await runFullAudit();
      setFullAuditData(auditResult);
      setFullAuditModalOpen(true);
    } catch (err) {
      alert("Failed to execute autonomous full audit: " + err.message);
    }
  };

  const handleDatabaseChanged = (newDb) => {
    setActiveDb(newDb);
    loadAllData();
  };

  return (
    <div className="flex bg-[var(--bg-main)] min-h-screen text-slate-100 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Luxury Ambient Lighting & Organic Stipple Texture */}
      <AnimatedBackground />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDb={activeDb}
        healthScore={healthScore}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative z-10">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          activeDb={activeDb}
          exposureAmount={exposureAmount}
          onOpenFlagModal={() => handleOpenFlagWithContext({})}
          onTriggerFullAudit={handleTriggerFullAudit}
          onRefreshData={loadAllData}
          onDatabaseChanged={handleDatabaseChanged}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Autonomous Audit Flow Bar Pipeline */}
        <AuditFlowBar
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          activeDb={activeDb}
          kpis={kpis}
          reconciliation={reconciliation}
          anomalies={anomalies}
          merchants={merchants}
          onTriggerFullAudit={handleTriggerFullAudit}
        />

        {/* View Routing with Smooth Fluid Transitions */}
        <main className="p-6 sm:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === "showcase" && (
                <Showcase3DView
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "dashboard" && (
                <DashboardView
                  kpis={kpis}
                  reconciliation={reconciliation}
                  anomalies={anomalies}
                  merchants={merchants}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onNavigateTab={setActiveTab}
                  onOpenFlagModal={() => handleOpenFlagWithContext({})}
                  onTriggerFullAudit={handleTriggerFullAudit}
                />
              )}

              {activeTab === "controller" && (
                <AIControllerView
                  onOpenTrace={handleOpenTrace}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onOpenFlagWithContext={handleOpenFlagWithContext}
                  onNavigateTab={setActiveTab}
                  onOpenFlagModal={() => handleOpenFlagWithContext({})}
                />
              )}

              {activeTab === "dataquality" && (
                <DataQualityView
                  activeDb={activeDb}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "alerts_cases" && (
                <AlertsCasesView
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onOpenFlagWithContext={handleOpenFlagWithContext}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "reconciliation" && (
                <ReconciliationView
                  reconciliation={reconciliation}
                  onOpenFlagWithContext={handleOpenFlagWithContext}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "anomalies" && (
                <AnomaliesView
                  anomalies={anomalies}
                  onOpenFlagWithContext={handleOpenFlagWithContext}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "merchants" && (
                <MerchantsView
                  merchants={merchants}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "transactions" && (
                <TransactionsView
                  onOpenFlagWithContext={handleOpenFlagWithContext}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "flags" && (
                <FlagsView
                  onOpenNewFlag={() => handleOpenFlagWithContext({})}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "compare" && (
                <DbCompareView
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "whatif" && (
                <WhatIfView
                  kpis={kpis}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "reports" && (
                <ReportsView
                  onOpenFlagWithContext={handleOpenFlagWithContext}
                  onInvestigateMerchant={handleInvestigateMerchant}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "databases" && (
                <DatabasesView
                  activeDb={activeDb}
                  onDatabaseChanged={handleDatabaseChanged}
                  onNavigateTab={setActiveTab}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette Spotlight Search Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onTriggerFullAudit={handleTriggerFullAudit}
        onOpenFlagModal={() => handleOpenFlagWithContext({})}
        onInvestigateMerchant={handleInvestigateMerchant}
      />

      {/* Global Forensic Modals */}
      <TraceModal
        isOpen={traceModalOpen}
        onClose={() => setTraceModalOpen(false)}
        trace={currentTrace}
        question={traceQuestion}
        executionTime={traceTime}
        toolName={traceTool}
      />

      <InvestigationModal
        isOpen={investigationModalOpen}
        onClose={() => setInvestigationModalOpen(false)}
        data={investigationData}
        onOpenFlagWithContext={handleOpenFlagWithContext}
      />

      <FlagModal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSuccess={() => loadAllData()}
        initialData={flagInitialData}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportData={reportData}
      />

      <FullAuditModal
        isOpen={fullAuditModalOpen}
        onClose={() => setFullAuditModalOpen(false)}
        auditData={fullAuditData}
        onNavigateTab={setActiveTab}
        onInvestigateMerchant={handleInvestigateMerchant}
      />
    </div>
  );
}
