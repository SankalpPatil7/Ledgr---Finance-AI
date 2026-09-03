import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Database, 
  Upload, 
  CheckCircle2, 
  Layers, 
  Table, 
  FileSpreadsheet, 
  FileText, 
  Server, 
  Sparkles,
  Link,
  ShieldCheck,
  Zap
} from "lucide-react";
import GlowCard from "../components/GlowCard";
import FlowNextBanner from "../components/FlowNextBanner";
import { getDatabases, selectDatabase, uploadDatabase, getSchema, connectRemoteDatabase } from "../api";

export default function DatabasesView({ activeDb, onDatabaseChanged, onNavigateTab }) {
  const [databases, setDatabases] = useState([]);
  const [schema, setSchema] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Remote connection state
  const [remoteType, setRemoteType] = useState("PostgreSQL");
  const [remoteUri, setRemoteUri] = useState("");
  const [remoteTesting, setRemoteTesting] = useState(false);
  const [remoteResult, setRemoteResult] = useState(null);

  useEffect(() => {
    loadDbs();
    loadSchema(activeDb);
  }, [activeDb]);

  const loadDbs = async () => {
    try {
      const data = await getDatabases();
      setDatabases(data.databases || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSchema = async (dbName) => {
    try {
      const data = await getSchema(dbName);
      setSchema(data);
      if (data.tables && Object.keys(data.tables).length > 0) {
        setSelectedTable(Object.keys(data.tables)[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDb = async (name) => {
    try {
      await selectDatabase(name);
      onDatabaseChanged(name);
    } catch (err) {
      alert("Failed to switch database: " + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Ingesting & parsing database file...");

    try {
      const res = await uploadDatabase(file);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setUploadStatus(res.message || "File uploaded successfully!");
      loadDbs();
      onDatabaseChanged(res.filename);
    } catch (err) {
      setUploadStatus("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestRemote = async (e) => {
    e.preventDefault();
    setRemoteTesting(true);
    setRemoteResult(null);
    try {
      const res = await connectRemoteDatabase(remoteType, remoteUri);
      setRemoteResult(res);
      if (res.success) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      setRemoteResult({ success: false, message: err.message });
    } finally {
      setRemoteTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Available Databases & Universal Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active DBs List */}
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Available Financial Stores</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select active audit target</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">{databases.length} Available</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {databases.map((db) => (
              <div
                key={db.name}
                onClick={() => handleSelectDb(db.name)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  db.name === activeDb
                    ? "bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm"
                    : "bg-[#0B0F17] border-[#1E293B] hover:border-slate-600 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className={`w-4 h-4 ${db.name === activeDb ? "text-indigo-400" : "text-slate-500"}`} />
                  <div>
                    <div className="text-xs font-bold font-mono">{db.name}</div>
                    <span className="text-[10px] text-slate-400">{db.size_kb} KB</span>
                  </div>
                </div>
                {db.name === activeDb && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Universal Ingestion Dropzone */}
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Universal File Ingestion Dropzone</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Upload SQLite (.db), Excel (.xlsx), or CSV (.csv)</p>
          </div>

          <label className="border-2 border-dashed border-[#334155] hover:border-indigo-500/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#0B0F17]/60 group">
            <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition mb-2" />
            <span className="text-xs font-bold text-slate-200">Click or Drag & Drop File</span>
            <span className="text-[11px] text-slate-400 mt-1">Supports .db, .sqlite, .xlsx, .csv (Up to 100MB)</span>
            <input
              type="file"
              accept=".db,.sqlite,.sqlite3,.csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadStatus && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}
        </div>

        {/* Remote DB Connector */}
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Remote Database Connector</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">PostgreSQL & MySQL connection test</p>
          </div>

          <form onSubmit={handleTestRemote} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {["PostgreSQL", "MySQL"].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setRemoteType(t)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    remoteType === t ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0B0F17] text-slate-400 border-[#1E293B]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={remoteUri}
              onChange={(e) => setRemoteUri(e.target.value)}
              placeholder={`${remoteType.toLowerCase()}://user:pass@host:5432/finance_db`}
              className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={remoteTesting || !remoteUri.trim()}
              className="w-full py-2 bg-[#1E293B] hover:bg-[#283548] disabled:opacity-50 text-slate-200 border border-[#334155] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Link className="w-3.5 h-3.5 text-indigo-400" />
              <span>{remoteTesting ? "Testing..." : "Test Connection"}</span>
            </motion.button>

            {remoteResult && (
              <div className={`p-2.5 rounded-xl text-xs border ${
                remoteResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                {remoteResult.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Schema Columns Inspector */}
      {schema && schema.tables && (
        <div className="glass-card rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Live Schema & Column Introspection</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Database `{activeDb}` — {schema.total_tables || schema.table_count} Tables, {schema.total_records?.toLocaleString()} Total Records</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-lg">
              {Object.keys(schema.tables).map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => setSelectedTable(tbl)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition shrink-0 ${
                    selectedTable === tbl
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-[#0B0F17] text-slate-400 border border-[#1E293B] hover:text-white"
                  }`}
                >
                  {tbl} ({schema.tables[tbl].row_count})
                </button>
              ))}
            </div>
          </div>

          {selectedTable && schema.tables[selectedTable] && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-slate-400 font-mono">
                    <th className="py-2.5 px-4">Column Name</th>
                    <th className="py-2.5 px-4">Data Type</th>
                    <th className="py-2.5 px-4">Primary Key</th>
                    <th className="py-2.5 px-4">Nullable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {schema.tables[selectedTable].columns?.map((col) => (
                    <tr key={col.name} className="hover:bg-[#1E293B]/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-white">{col.name}</td>
                      <td className="py-2.5 px-4 font-mono text-indigo-300">{col.type || "TEXT"}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {col.pk ? <span className="text-emerald-400 font-bold">YES</span> : <span className="text-slate-500">NO</span>}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {col.notnull ? <span className="text-slate-500">NOT NULL</span> : <span className="text-slate-400">NULLABLE</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Flow Continuation to Stage 02 */}
      <FlowNextBanner
        currentStep="01"
        currentTitle="Database Ingestion"
        nextStep="02"
        nextTitle="Data Quality & Integrity Profiling"
        nextTab="dataquality"
        badge="STAGE 01 COMPLETE"
        description={`Database '${activeDb}' is verified and schema mapped. Proceed to run automated 0–100 completeness audits, null-value diagnostics, and duplicate row detection.`}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
