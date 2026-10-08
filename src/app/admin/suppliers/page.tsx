"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import Link from "next/link";
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Search,
  Edit2,
  X,
  RefreshCw,
  Building2,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { Supplier } from "@/lib/erpStore";

export default function AdminSuppliersPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form states for Add Supplier
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newInitialBalance, setNewInitialBalance] = useState("0");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states for Edit Supplier
  const [editContact, setEditContact] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const fetchSuppliers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/suppliers");
      const data = await res.json();
      if (data.success && Array.isArray(data.suppliers)) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.warn("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (showAddModal || showEditModal) {
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
  }, [showAddModal, showEditModal]);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    setFormSubmitting(true);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim(),
          contact_person: newContact.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim(),
          address: newAddress.trim(),
          initial_rto_balance: Number(newInitialBalance) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewName("");
        setNewCode("");
        setNewContact("");
        setNewPhone("");
        setNewEmail("");
        setNewAddress("");
        setNewInitialBalance("0");
        fetchSuppliers();
      }
    } catch (err) {
      console.error("Failed to add supplier:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setEditContact(sup.contact_person || "");
    setEditPhone(sup.phone || "");
    setEditEmail(sup.email || "");
    setEditAddress(sup.address || "");
    setShowEditModal(true);
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setFormSubmitting(true);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSupplier.id,
          contact_person: editContact.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          address: editAddress.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      }
    } catch (err) {
      console.error("Failed to update supplier:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
  });

  const totalAvailableBalance = suppliers.reduce((acc, s) => acc + (Number(s.available_rto_balance) || 0), 0);
  const totalCreditsClaimed = suppliers.reduce((acc, s) => acc + (Number(s.total_credits_added) || 0), 0);
  const totalCreditsUsed = suppliers.reduce((acc, s) => acc + (Number(s.total_credits_used) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Suppliers & Credit Balances
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FA521C] border border-orange-200">
                  {suppliers.length} Vendors Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Directory of product suppliers, procurement partners, and isolated RTO reimbursement balances.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchSuppliers(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FA521C]" : ""}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Supplier</span>
              </button>

              <Link
                href="/admin/rto-refund-balance"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Open RTO Ledger</span>
              </Link>
            </div>
          </div>

          {/* KPI Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Active Vendors
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FA521C] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {suppliers.length}
                </p>
                <span className="text-xs text-slate-500">Verified product suppliers</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Available RTO Balance
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-emerald-600">
                  ₹{totalAvailableBalance.toLocaleString("en-IN")}
                </p>
                <span className="text-xs text-emerald-600 font-medium">Ready to offset inventory POs</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cumulative Credits Added
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-purple-700">
                  ₹{totalCreditsClaimed.toLocaleString("en-IN")}
                </p>
                <span className="text-xs text-slate-500">Credited from doorstep return restocks</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-rose-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Credits Reconciled / Used
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  ₹{totalCreditsUsed.toLocaleString("en-IN")}
                </p>
                <span className="text-xs text-slate-500">Deducted against new invoice orders</span>
              </div>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-1.5" />
            <input
              type="text"
              placeholder="Search suppliers by name, code, contact person, or phone..."
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

          {/* Supplier Grid */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/90 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#FA521C] animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading supplier profiles & balances...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No suppliers found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No vendors matched your search. Click "Add Supplier" above to register a new supplier partner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                          {sup.code}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">
                          {sup.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sup.contact_person || "Contact Representative"}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Available Balance
                      </span>
                      <span className="text-xl font-black text-emerald-600">
                        ₹{(sup.available_rto_balance || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                      <span className="text-emerald-700 block text-[11px]">Total Credited</span>
                      <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                        ₹{(sup.total_credits_added || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100/60">
                      <span className="text-rose-700 block text-[11px]">Credits Used</span>
                      <span className="font-bold text-rose-900 text-sm mt-0.5 block">
                        ₹{(sup.total_credits_used || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/60">
                      <span className="text-amber-700 block text-[11px]">Pending Verify</span>
                      <span className="font-bold text-amber-900 text-sm mt-0.5 block">
                        ₹{(sup.pending_credits || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1 text-xs text-slate-500">
                    <div className="flex items-center gap-4 flex-wrap">
                      {sup.phone && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone}
                        </span>
                      )}
                      {sup.email && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {sup.email}
                        </span>
                      )}
                    </div>
                    {sup.address && (
                      <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {sup.address}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <Link
                      href={`/admin/rto-refund-balance?supplier_id=${sup.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FA521C] hover:text-[#D4380D] hover:underline"
                    >
                      <span>Open RTO Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FA521C]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Register New Supplier Partner
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Electronics"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supplier Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUP-E"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Deepak Kumar"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Opening RTO Balance (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warehouse / Business Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Plot 45, Okhla Phase 3, New Delhi"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#FA521C] text-white rounded-xl hover:bg-[#D4380D] font-semibold shadow-sm shadow-orange-500/25 disabled:opacity-60"
                >
                  {formSubmitting ? "Creating..." : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Supplier: {selectedSupplier.name} ({selectedSupplier.code})
                </h3>
                <p className="text-xs text-slate-500">Update contact representative and address details</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSupplier} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warehouse / Business Address
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#FA521C] text-white rounded-xl hover:bg-[#D4380D] font-semibold shadow-sm shadow-orange-500/25 disabled:opacity-60"
                >
                  {formSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
