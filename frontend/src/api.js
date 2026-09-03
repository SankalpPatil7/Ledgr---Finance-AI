import axios from "axios";

const API_BASE =
  typeof window !== "undefined" && window.location.port === "8000"
    ? "/api"
    : import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getHealth = async () => (await api.get("/health")).data;
export const getDatabases = async () => (await api.get("/databases")).data;
export const selectDatabase = async (name) => (await api.post(`/databases/select?name=${encodeURIComponent(name)}`)).data;
export const uploadDatabase = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return (await api.post("/databases/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })).data;
};
export const connectRemoteDatabase = async (db_type, connection_string) => (await api.post("/databases/connect-remote", { db_type, connection_string })).data;
export const compareDatabases = async (database_a, database_b) => (await api.post("/databases/compare", { database_a, database_b })).data;

export const getSchema = async (dbName) => (await api.get(`/databases/schema${dbName ? `?db_name=${dbName}` : ""}`)).data;
export const getSchemaIntelligence = async () => (await api.get("/schema/intelligence")).data;
export const getDatabaseProfile = async () => (await api.get("/database/profile")).data;
export const getDataQuality = async () => (await api.get("/data-quality")).data;
export const getTableStats = async (tableName) => (await api.get(`/database/table-stats/${tableName}`)).data;

export const getKpis = async () => (await api.get("/kpis")).data;
export const getReconciliation = async () => (await api.get("/settlements/reconcile")).data;
export const getAnomalies = async () => (await api.get("/anomalies")).data;
export const getAdvancedAnomalies = async () => (await api.get("/anomalies/advanced")).data;

export const getMerchants = async () => (await api.get("/merchants")).data;
export const getMerchantInvestigation = async (merchantId) => (await api.get(`/merchants/${merchantId}/investigate`)).data;

export const getAlerts = async () => (await api.get("/alerts")).data;
export const getCases = async () => (await api.get("/cases")).data;
export const createCase = async (caseData) => (await api.post("/cases", caseData)).data;
export const updateCaseStatus = async (caseId, status, notes) => (await api.patch(`/cases/${caseId}`, { status, notes })).data;

export const getTransactions = async (page = 1, limit = 50, merchantId, status) => {
  const params = { page, limit };
  if (merchantId) params.merchant_id = merchantId;
  if (status) params.status = status;
  return (await api.get("/transactions", { params })).data;
};

export const getFlags = async () => (await api.get("/flags")).data;
export const createFlag = async (flagData) => (await api.post("/flags", flagData)).data;
export const updateFlagStatus = async (flagId, status) => (await api.patch(`/flags/${flagId}/status`, { status })).data;

export const askController = async (query) => (await api.post("/ask", { question: query, query })).data;
export const askAIController = askController;
export const askAI = askController;
export const getAuditLogs = async (limit = 100) => (await api.get(`/audit-logs?limit=${limit}`)).data;

export const runWhatIf = async (refundPct, disputePct, settlementPct) => (await api.post("/what-if", {
  refund_increase_pct: refundPct,
  dispute_increase_pct: disputePct,
  settlement_recovery_pct: settlementPct,
})).data;

export const simulateWhatIf = runWhatIf;

export const runFullAudit = async () => (await api.post("/audit/full")).data;
export const generateReport = async () => (await api.get("/report")).data;

export const getExportUrl = (format) => `${API_BASE}/report/export/${format}`;

export default api;
