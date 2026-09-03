import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight,
  CreditCard,
  Building2
} from "lucide-react";
import { getTransactions } from "../api";

export default function TransactionsView({ onOpenFlagWithContext, onInvestigateMerchant }) {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTx();
  }, [page, statusFilter, paymentMethodFilter]);

  const fetchTx = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions({
        page,
        limit: 50,
        status: statusFilter || undefined,
        payment_method: paymentMethodFilter || undefined,
        search: search || undefined
      });
      setTransactions(data.rows || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTx();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <span>Transaction Ledger & Payment Audit</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Browse and search {totalCount.toLocaleString()} audited transaction records across all merchant payment methods.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
            92% Success Baseline
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by TX ID or merchant name..."
              className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
            <option value="pending">Pending Only</option>
          </select>

          {/* Payment Method filter */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1); }}
            className="bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Wallet">Wallet</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[#1E293B] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0B0F17] text-slate-400 font-mono">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    Loading transaction records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      {tx.transaction_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{tx.merchant_name}</div>
                      <span className="font-mono text-[10px] text-slate-400">{tx.merchant_id} • {tx.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-[#0B0F17] font-mono text-[11px]">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        tx.status === "success" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                          : tx.status === "failed" 
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        {tx.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {tx.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenFlagWithContext({
                            flag_type: "suspicious_transaction",
                            transaction_id: tx.transaction_id,
                            reason: `Transaction ${tx.transaction_id} (₹${tx.amount}) flagged for manual review`,
                            severity: tx.amount > 50000 ? "HIGH" : "MEDIUM"
                          })}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Flag</span>
                        </button>
                        <button
                          onClick={() => onInvestigateMerchant(tx.merchant_id)}
                          className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#2D3B4F] text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition"
                        >
                          Merchant
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#0B0F17] border-t border-[#1E293B] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount.toLocaleString()} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#2D3B4F] disabled:opacity-40 text-slate-300 text-xs font-bold transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#2D3B4F] disabled:opacity-40 text-slate-300 text-xs font-bold transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
