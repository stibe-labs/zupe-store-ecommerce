"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  DollarSign,
  Plus,
  Filter,
  Download,
  Calendar,
  Tag,
  Receipt,
  FileText,
  X,
  TrendingDown,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { ExpenseRecord } from "@/lib/erpStore";

export default function AdminExpensesPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<ExpenseRecord["category"]>("Meta Ads");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Expense Confirmation Modal
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const url = new URL("/api/admin/expenses", window.location.origin);
      if (categoryFilter !== "all") url.searchParams.set("category", categoryFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setTotalExpense(data.totalExpense || 0);
        setCategoryTotals(data.categoryTotals || {});
      }
    } catch (err) {
      console.warn("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (showAddModal || Boolean(expenseToDelete)) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showAddModal, expenseToDelete]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          date,
          vendor: vendor.trim(),
          reference_no: referenceNo.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setAmount("");
        setVendor("");
        setReferenceNo("");
        setNotes("");
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/expenses?id=${encodeURIComponent(expenseToDelete.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setExpenseToDelete(null);
        fetchExpenses();
      }
    } catch (err) {
      console.error("Failed to delete expense:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Category", "Amount (INR)", "Vendor", "Reference / Invoice #", "Notes"];
    const rows = filteredExpenses.map((e) => [
      `"${e.date}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.vendor || ""}"`,
      `"${e.reference_no || ""}"`,
      `"${e.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zupe_expenses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredExpenses = expenses.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.vendor && e.vendor.toLowerCase().includes(q)) ||
      (e.reference_no && e.reference_no.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      e.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={() => fetchExpenses(true)}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Operating Expenses & Ad Spend
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7A00] border border-orange-200">
                  Total: ₹{totalExpense.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Record and audit Meta Ads, courier fees, subscriptions, and overhead costs with live P&L impact.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchExpenses(true)}
                disabled={isRefreshing || loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Category Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { cat: "Meta Ads", color: "text-purple-600", bg: "bg-purple-50" },
              { cat: "Shiprocket/shipping", color: "text-[#FF7A00]", bg: "bg-orange-50" },
              { cat: "Product cost", color: "text-emerald-600", bg: "bg-emerald-50" },
              { cat: "RTO charges", color: "text-rose-600", bg: "bg-rose-50" },
              { cat: "Software/subscriptions", color: "text-amber-600", bg: "bg-amber-50" },
              { cat: "Other", color: "text-slate-600", bg: "bg-slate-100" },
            ].map((item) => (
              <div
                key={item.cat}
                onClick={() => setCategoryFilter(categoryFilter === item.cat ? "all" : item.cat)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  categoryFilter === item.cat
                    ? "border-[#FF7A00] bg-white ring-2 ring-[#FF7A00]/20 shadow-md"
                    : "border-slate-200/90 bg-white hover:border-slate-300 shadow-sm"
                }`}
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  {item.cat}
                </span>
                <p className={`text-lg sm:text-xl font-bold mt-1 ${item.color}`}>
                  ₹{(categoryTotals[item.cat] || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {categoryFilter === item.cat ? "Active Filter (click to reset)" : "Click to filter"}
                </span>
              </div>
            ))}
          </div>

          {/* Search Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-1.5" />
            <input
              type="text"
              placeholder="Search expenses by vendor, invoice reference, notes, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Amount (₹)</th>
                    <th className="py-3.5 px-4">Vendor / Payee</th>
                    <th className="py-3.5 px-4">Invoice / Ref #</th>
                    <th className="py-3.5 px-4">Notes</th>
                    <th className="py-3.5 px-4">Logged By</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <RefreshCw className="w-6 h-6 text-[#FF7A00] animate-spin mx-auto mb-2" />
                        <span className="text-slate-500 font-medium">Loading expense records...</span>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No expenses match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-mono">
                          {exp.date}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ₹{exp.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {exp.vendor || "-"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#FF7A00] whitespace-nowrap">
                          {exp.reference_no || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {exp.notes || "-"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                          {exp.created_by || "Admin"}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            title="Delete this expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Record Business Expense
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                >
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Shiprocket/shipping">Shiprocket/shipping</option>
                  <option value="Product cost">Product cost</option>
                  <option value="RTO charges">RTO charges</option>
                  <option value="Software/subscriptions">Software/subscriptions</option>
                  <option value="Other">Other expenses</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vendor / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="Meta Platforms"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Invoice / Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="INV-12345"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="Details of campaign or inventory batch"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FF7A00] text-white rounded-xl hover:bg-[#E66E00] font-semibold shadow-sm shadow-orange-500/25 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Delete Expense Record?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this expense of{" "}
                <span className="font-bold text-slate-800">
                  ₹{expenseToDelete.amount.toLocaleString("en-IN")}
                </span>{" "}
                ({expenseToDelete.category})? This will update P&L reports immediately.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
                disabled={deleting}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
