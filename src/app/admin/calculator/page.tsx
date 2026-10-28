"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Calculator,
  Wallet,
  TrendingUp,
  RotateCcw,
  Truck,
  DollarSign,
  Layers,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Plus,
  Trash2,
  Copy,
  Check,
  Info,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  Coins,
  AlertTriangle,
  Building2,
  Package,
  X,
  Share2,
} from "lucide-react";

interface BatchEntry {
  id: string;
  date: string;
  supplier: string;
  note: string;
  orders: number;
  rto: number;
  delivered: number;
  sellingPrice: number;
  productCost: number;
  opening: number;
  creditUsed: number;
  newCredit: number;
  ending: number;
  netProfit: number;
  netCashFlow: number;
}

interface SupplierRecord {
  name: string;
  opening: number;
  batches: BatchEntry[];
}

interface StoredDB {
  suppliers: Record<string, SupplierRecord>;
  selected: string;
}

export default function ProfitCalculatorPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form Inputs
  const [orders, setOrders] = useState<number>(10);
  const [rto, setRto] = useState<number>(3);
  const [sell, setSell] = useState<number>(800);
  const [cost, setCost] = useState<number>(500);
  const [ship, setShip] = useState<number>(130);
  const [rtoFee, setRtoFee] = useState<number>(50);
  const [ads, setAds] = useState<number>(0);
  const [other, setOther] = useState<number>(0);
  const [opening, setOpening] = useState<number>(0);
  const [creditPct, setCreditPct] = useState<number>(100);
  const [batchNote, setBatchNote] = useState<string>("");

  // Store Products Catalog for Quick Fill
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Modals & Feedback
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showSetOpeningModal, setShowSetOpeningModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [openingBalanceInput, setOpeningBalanceInput] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Supplier Database (synced to localStorage)
  const [db, setDb] = useState<StoredDB>({
    suppliers: {
      "Default Supplier": { opening: 0, batches: [] },
    },
    selected: "Default Supplier",
  });

  // Load from localStorage & fetch live suppliers/products on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zupeSupplierLedgerV2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.suppliers && Object.keys(parsed.suppliers).length > 0) {
          setDb(parsed);
          const sel = parsed.selected || Object.keys(parsed.suppliers)[0];
          setOpening(parsed.suppliers[sel]?.opening || 0);
        }
      }
    } catch (e) {
      console.warn("Could not read local supplier ledger:", e);
    }

    // Fetch live suppliers from Zupe Store ERP
    fetch("/api/admin/suppliers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
          setDb((prev) => {
            const nextSuppliers = { ...prev.suppliers };
            data.suppliers.forEach((s: any) => {
              if (!nextSuppliers[s.name]) {
                nextSuppliers[s.name] = {
                  opening: Number(s.available_rto_balance) || 0,
                  batches: [],
                };
              }
            });
            return { ...prev, suppliers: nextSuppliers };
          });
        }
      })
      .catch(() => {});

    // Fetch store products for quick auto-fill
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setStoreProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Save to localStorage whenever db changes
  const persistDB = (newDb: StoredDB) => {
    setDb(newDb);
    try {
      localStorage.setItem("zupeSupplierLedgerV2", JSON.stringify(newDb));
    } catch (e) {
      console.warn("Could not persist supplier ledger:", e);
    }
  };

  // Change selected supplier
  const handleSelectSupplier = (name: string) => {
    const updated: StoredDB = { ...db, selected: name };
    const supp = updated.suppliers[name] || { opening: 0, batches: [] };
    persistDB(updated);
    setOpening(supp.opening || 0);
  };

  // Quick Preset Scenarios
  const applyPreset = (preset: "standard" | "scale" | "high_rto" | "prepaid" | "reset") => {
    if (preset === "standard") {
      setOrders(10);
      setRto(3);
      setSell(800);
      setCost(500);
      setShip(130);
      setRtoFee(50);
      setAds(0);
      setOther(0);
      setCreditPct(100);
      setBatchNote("Reference Standard 10-Order Model");
    } else if (preset === "scale") {
      setOrders(50);
      setRto(11);
      setSell(899);
      setCost(420);
      setShip(130);
      setRtoFee(50);
      setAds(4500);
      setOther(600);
      setCreditPct(100);
      setBatchNote("Scale Campaign Batch");
    } else if (preset === "high_rto") {
      setOrders(20);
      setRto(8); // 40% RTO
      setSell(799);
      setCost(480);
      setShip(140);
      setRtoFee(55);
      setAds(1500);
      setOther(200);
      setCreditPct(100);
      setBatchNote("High RTO COD Stress Test");
    } else if (preset === "prepaid") {
      setOrders(30);
      setRto(2); // ~6.6% RTO
      setSell(799);
      setCost(440);
      setShip(115);
      setRtoFee(40);
      setAds(1800);
      setOther(150);
      setCreditPct(100);
      setBatchNote("Prepaid Direct Campaign");
    } else {
      setOrders(10);
      setRto(3);
      setSell(800);
      setCost(500);
      setShip(130);
      setRtoFee(50);
      setAds(0);
      setOther(0);
      setOpening(db.suppliers[db.selected]?.opening || 0);
      setCreditPct(100);
      setBatchNote("");
      setSelectedProductId("");
    }
  };

  // Quick Fill from Store Product
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = storeProducts.find((p) => String(p.id) === String(productId));
    if (prod) {
      setBatchNote(prod.name || prod.title || "");
      if (prod.price) setSell(Number(prod.price));
      if (prod.cost_price) {
        setCost(Number(prod.cost_price));
      } else if (prod.price) {
        setCost(Math.round(Number(prod.price) * 0.55));
      }
    }
  };

  // ==========================================
  // REAL-TIME MATHEMATICAL ENGINE
  // ==========================================
  const calculations = useMemo(() => {
    const o = Math.max(0, Math.floor(Number(orders) || 0));
    const r = Math.max(0, Math.min(o, Math.floor(Number(rto) || 0)));
    const d = o - r;
    const sellingPrice = Math.max(0, Number(sell) || 0);
    const unitCost = Math.max(0, Number(cost) || 0);
    const shipCost = Math.max(0, Number(ship) || 0);
    const rtoFeeCharge = Math.max(0, Number(rtoFee) || 0);
    const adSpend = Math.max(0, Number(ads) || 0);
    const otherCost = Math.max(0, Number(other) || 0);
    const openingCredit = Math.max(0, Number(opening) || 0);
    const pct = Math.max(0, Math.min(100, Number(creditPct) || 0)) / 100;

    // 1. Delivered Revenue (Delivered only)
    const revenue = d * sellingPrice;

    // 2. Full Product Invoice (All shipped orders)
    const productInvoice = o * unitCost;

    // 3. Opening Supplier Credit Applied
    const creditUsed = Math.min(openingCredit, productInvoice);

    // 4. Supplier Cash Paid (Invoice minus credit applied)
    const supplierCash = productInvoice - creditUsed;

    // 5. Logistics (Forward on all dispatched + reverse on RTO)
    const shipping = o * shipCost;
    const rtoCost = r * rtoFeeCharge;
    const totalLogistics = shipping + rtoCost;

    // 6. Supplier Credit from RTO (100% of product cost of returned items)
    const newCredit = r * unitCost * pct;
    const endingCredit = Math.max(0, openingCredit - creditUsed) + newCredit;

    // 7. Overheads & Ads
    const totalOtherCost = adSpend + otherCost;

    // 8. Total Cash Outflow (Supplier cash payment + Shipping + RTO + Ads + Overheads)
    const totalCashOutflow = supplierCash + shipping + rtoCost + totalOtherCost;

    // 9. Realized Operating Net Profit
    // Net Profit = Delivered Revenue - Delivered COGS - All Forward Shipping - RTO Reverse Charges - Ads - Overheads
    const deliveredCOGS = d * unitCost;
    const netProfit = revenue - deliveredCOGS - shipping - rtoCost - totalOtherCost;

    // 10. Actual Cash Inflow & Net Cash Flow
    const cashInflow = revenue;
    const netCashFlow = cashInflow - totalCashOutflow;

    // 11. Rates
    const deliveryRate = o > 0 ? ((d / o) * 100).toFixed(1) : "0.0";
    const rtoRate = o > 0 ? ((r / o) * 100).toFixed(1) : "0.0";
    const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : "0.0";

    return {
      o,
      r,
      d,
      revenue,
      productInvoice,
      deliveredCOGS,
      creditUsed,
      supplierCash,
      shipping,
      rtoCost,
      totalLogistics,
      newCredit,
      endingCredit,
      totalOtherCost,
      totalCashOutflow,
      netProfit,
      cashInflow,
      netCashFlow,
      deliveryRate,
      rtoRate,
      profitMargin,
    };
  }, [orders, rto, sell, cost, ship, rtoFee, ads, other, opening, creditPct]);

  // Save Batch to Supplier Ledger
  const handleSaveBatch = () => {
    const activeSupplier = db.selected || "Default Supplier";
    const supp = db.suppliers[activeSupplier] || { opening: 0, batches: [] };

    const newBatch: BatchEntry = {
      id: "batch-" + Date.now(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      supplier: activeSupplier,
      note: batchNote.trim() || "Batch of " + calculations.o + " orders",
      orders: calculations.o,
      rto: calculations.r,
      delivered: calculations.d,
      sellingPrice: Number(sell),
      productCost: Number(cost),
      opening: Number(opening),
      creditUsed: calculations.creditUsed,
      newCredit: calculations.newCredit,
      ending: calculations.endingCredit,
      netProfit: calculations.netProfit,
      netCashFlow: calculations.netCashFlow,
    };

    const updatedSuppliers = {
      ...db.suppliers,
      [activeSupplier]: {
        ...supp,
        opening: calculations.endingCredit,
        batches: [...(supp.batches || []), newBatch],
      },
    };

    const nextDb = { ...db, suppliers: updatedSuppliers };
    persistDB(nextDb);
    setOpening(calculations.endingCredit);

    setSaveSuccessMsg(
      `Batch saved! ${activeSupplier}'s available credit is now updated to ₹${Math.round(
        calculations.endingCredit
      ).toLocaleString("en-IN")}.`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4500);
  };

  // Add New Supplier
  const handleAddSupplier = () => {
    const name = newSupplierName.trim();
    if (!name) return;
    if (db.suppliers[name]) {
      alert("A supplier with this name already exists.");
      return;
    }

    const nextDb: StoredDB = {
      ...db,
      suppliers: {
        ...db.suppliers,
        [name]: { opening: 0, batches: [] },
      },
      selected: name,
    };

    persistDB(nextDb);
    setOpening(0);
    setNewSupplierName("");
    setShowAddSupplierModal(false);
  };

  // Set Opening Balance for Selected Supplier
  const handleSetOpeningBalance = () => {
    const activeSupplier = db.selected;
    const supp = db.suppliers[activeSupplier] || { opening: 0, batches: [] };
    const val = Math.max(0, Number(openingBalanceInput) || 0);

    const nextDb: StoredDB = {
      ...db,
      suppliers: {
        ...db.suppliers,
        [activeSupplier]: {
          ...supp,
          opening: val,
        },
      },
    };

    persistDB(nextDb);
    setOpening(val);
    setShowSetOpeningModal(false);
  };

  // Delete Batch
  const handleDeleteBatch = (batchId: string) => {
    if (!confirm("Are you sure you want to remove this batch from history?")) return;
    const activeSupplier = db.selected;
    const supp = db.suppliers[activeSupplier];
    if (!supp) return;

    const nextBatches = supp.batches.filter((b) => b.id !== batchId);
    const nextDb: StoredDB = {
      ...db,
      suppliers: {
        ...db.suppliers,
        [activeSupplier]: {
          ...supp,
          batches: nextBatches,
        },
      },
    };
    persistDB(nextDb);
  };

  // Clear Saved History
  const handleClearHistory = () => {
    if (!confirm("Clear all saved supplier history on this device? This cannot be undone.")) return;
    const nextDb: StoredDB = {
      suppliers: {
        [db.selected || "Default Supplier"]: { opening: 0, batches: [] },
      },
      selected: db.selected || "Default Supplier",
    };
    persistDB(nextDb);
    setOpening(0);
  };

  // Export CSV
  const handleExportCSV = () => {
    const lines = [
      [
        "Date",
        "Supplier",
        "Product / Batch Note",
        "Total Orders",
        "Delivered",
        "RTO",
        "Opening Credit (INR)",
        "Credit Used (INR)",
        "New RTO Credit (INR)",
        "Ending Credit (INR)",
        "Net Profit (INR)",
        "Net Cash Flow (INR)",
      ],
    ];

    Object.values(db.suppliers).forEach((s) => {
      (s.batches || []).forEach((b) => {
        lines.push([
          b.date,
          b.supplier,
          b.note,
          String(b.orders),
          String(b.delivered),
          String(b.rto),
          String(b.opening),
          String(b.creditUsed),
          String(b.newCredit),
          String(b.ending),
          String(b.netProfit),
          String(b.netCashFlow),
        ]);
      });
    });

    const csv = lines
      .map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `zupestore-profit-calculator-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const text = `📊 ZUPESTORE PROFIT & CASH FLOW STUDIO
Batch: ${batchNote || "Reference Batch"} (${calculations.o} Orders • ${calculations.d} Delivered • ${calculations.r} RTO)
--------------------------------------
• Delivered Sales Revenue: ₹${calculations.revenue.toLocaleString("en-IN")}
• Delivered Product Cost:  ₹${calculations.deliveredCOGS.toLocaleString("en-IN")}
• Forward Shipping:        ₹${calculations.shipping.toLocaleString("en-IN")}
• RTO Reverse Charges:     ₹${calculations.rtoCost.toLocaleString("en-IN")}
• Ads & Other Expenses:    ₹${calculations.totalOtherCost.toLocaleString("en-IN")}
--------------------------------------
✅ REALIZED NET PROFIT:    ₹${calculations.netProfit.toLocaleString("en-IN")} (${calculations.profitMargin}% Margin)
💰 ACTUAL CASH INFLOW:     ₹${calculations.cashInflow.toLocaleString("en-IN")}
💸 ACTUAL CASH OUTFLOW:    ₹${calculations.totalCashOutflow.toLocaleString("en-IN")}
📉 NET CASH FLOW:          ₹${calculations.netCashFlow.toLocaleString("en-IN")}
🛡️ ENDING SUPPLIER CREDIT: ₹${calculations.endingCredit.toLocaleString("en-IN")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Active supplier history
  const activeSupplierRecord = db.suppliers[db.selected] || { opening: 0, batches: [] };
  const lifetimeCreditUsed = activeSupplierRecord.batches.reduce((sum, b) => sum + b.creditUsed, 0);
  const lifetimeCreditEarned = activeSupplierRecord.batches.reduce((sum, b) => sum + b.newCredit, 0);

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto space-y-6">
          {/* Studio Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#132238] to-[#1c2d47] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#FF7A00]/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                    ZUPESTORE
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#FF7A00]/20 text-orange-300 border border-[#FF7A00]/40 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                    Realized Accounting Engine
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  Profit & Cash Flow Studio
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Know your true bottom-line profit, bank cash movement, and wholesale supplier credit — batch by batch with instant recalculation.
                </p>
              </div>

              {/* Quick Scenario Preset Pills */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Scenarios
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => applyPreset("standard")}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-medium text-white transition-all"
                  >
                    10-Order Model (₹650)
                  </button>
                  <button
                    onClick={() => applyPreset("scale")}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-medium text-white transition-all"
                  >
                    50-Order Scale
                  </button>
                  <button
                    onClick={() => applyPreset("high_rto")}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-medium text-white transition-all"
                  >
                    40% RTO Stress Test
                  </button>
                  <button
                    onClick={() => applyPreset("prepaid")}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-medium text-white transition-all"
                  >
                    Prepaid Push
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Guidance Notice */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-amber-900">How to use this studio:</p>
                <p className="text-amber-800/90 mt-0.5">
                  Enter your batch parameters below. The calculator automatically separates <strong>realized delivered profit</strong> from <strong>physical cash outflow</strong>, computes supplier RTO credit (100%), and logs supplier balances on this device.
                </p>
              </div>
            </div>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Summary"}</span>
            </button>
          </div>

          {/* Save Success Banner */}
          {saveSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* MAIN 2-COLUMN STUDIO LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: 📦 Batch Details (Inputs Card) - 6 Cols */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#FF7A00]" />
                    <span>Batch Parameters</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tweak the values below. All profits and cash flows update live.
                  </p>
                </div>

                {storeProducts.length > 0 && (
                  <div className="w-full sm:w-auto">
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full sm:w-auto max-w-full text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-[#FF7A00] border border-orange-200 rounded-xl px-3 py-2 sm:py-1.5 focus:outline-none cursor-pointer truncate"
                    >
                      <option value="">+ Fill from Store SKU</option>
                      {storeProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.title} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION 1: Orders & Pricing */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  1. Orders & Pricing
                </span>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Shipped Orders
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={orders}
                      onChange={(e) => setOrders(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Dispatched by courier
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      RTO (Returned)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={orders}
                      value={rto}
                      onChange={(e) =>
                        setRto(Math.min(orders, Math.max(0, parseInt(e.target.value) || 0)))
                      }
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-rose-600 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Doorstep refusals
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sell}
                      onChange={(e) => setSell(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Checkout price
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Sourcing Cost (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cost}
                      onChange={(e) => setCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Wholesale cost / unit
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Shipping & Other Expenses */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  2. Logistics & Operating Expenses
                </span>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Forward Ship / Order (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ship}
                      onChange={(e) => setShip(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Total: ₹{calculations.shipping.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      RTO Reverse Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rtoFee}
                      onChange={(e) => setRtoFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Total: ₹{calculations.rtoCost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Meta Ad Spend (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ads}
                      onChange={(e) => setAds(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-purple-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Campaign ad budget
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Other Expenses (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={other}
                      onChange={(e) => setOther(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Packaging, gateways
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Supplier Credit Configuration */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    3. Supplier Credit Logic
                  </span>
                  <button
                    onClick={() => setShowAddSupplierModal(true)}
                    className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Supplier</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Select Supplier
                    </label>
                    <select
                      value={db.selected}
                      onChange={(e) => handleSelectSupplier(e.target.value)}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all cursor-pointer truncate"
                    >
                      {Object.keys(db.suppliers).map((name) => (
                        <option key={name} value={name}>
                          {name} (Credit: ₹{Math.round(db.suppliers[name]?.opening || 0).toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Opening Credit (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={opening}
                      onChange={(e) => setOpening(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-indigo-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Available to deduct
                    </span>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      RTO Credit (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={creditPct}
                      onChange={(e) =>
                        setCreditPct(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                      }
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
                      Return credit rate
                    </span>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                      Batch Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mini Portable Air Cooler (Batch #4)"
                      value={batchNote}
                      onChange={(e) => setBatchNote(e.target.value)}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  💡 <strong>Automatic Credit Application:</strong> The calculator assumes the full product invoice is due upfront, applies available opening credit automatically (up to the total invoice), and adds new eligible RTO credit to your balance.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={handleSaveBatch}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 active:scale-98"
                >
                  <Coins className="w-4 h-4" />
                  <span>Save Batch to Supplier Ledger</span>
                </button>

                <button
                  onClick={() => applyPreset("reset")}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
                >
                  Reset Inputs
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: 📊 Live Results & Financial Breakdown - 6 Cols */}
            <div className="lg:col-span-6 space-y-6">
              {/* Results Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>Live Results</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Recalculates instantly on every parameter update.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                    {calculations.deliveryRate}% Delivered
                  </span>
                </div>

                {/* 6 Key Metric Tiles: 2 Cards per row on Mobile & Desktop */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {/* Metric 1: NET PROFIT (Featured Banner - spans full 2 columns) */}
                  <div
                    className={`col-span-2 p-4 sm:p-5 rounded-2xl border transition-all ${
                      calculations.netProfit >= 0
                        ? "bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border-orange-200/90 shadow-sm"
                        : "bg-rose-50/60 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Realized Net Profit
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          calculations.netProfit >= 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {calculations.profitMargin}% Margin
                      </span>
                    </div>
                    <p
                      className={`text-2xl sm:text-4xl font-black tracking-tight mt-1.5 sm:mt-2 ${
                        calculations.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {calculations.netProfit >= 0 ? "+" : ""}₹
                      {Math.round(calculations.netProfit).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-1">
                      Delivered revenue − Delivered COGS − Dispatched shipping − RTO − Overheads
                    </p>
                  </div>

                  {/* Metric 2: NET CASH FLOW */}
                  <div className="col-span-1 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                      Net Cash Flow
                    </span>
                    <p
                      className={`text-lg sm:text-2xl font-black mt-1 ${
                        calculations.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {calculations.netCashFlow >= 0 ? "+" : ""}₹
                      {Math.round(calculations.netCashFlow).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                      Inflow minus outflow
                    </p>
                  </div>

                  {/* Metric 3: CASH INFLOW */}
                  <div className="col-span-1 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                      Cash Inflow
                    </span>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                      ₹{Math.round(calculations.cashInflow).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                      From {calculations.d} delivered orders
                    </p>
                  </div>

                  {/* Metric 4: CASH OUTFLOW */}
                  <div className="col-span-1 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                      Cash Outflow
                    </span>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                      ₹{Math.round(calculations.totalCashOutflow).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                      Supplier + logistics + ads
                    </p>
                  </div>

                  {/* Metric 5: ENDING SUPPLIER CREDIT */}
                  <div className="col-span-1 p-3 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-900 block truncate">
                      Ending Credit
                    </span>
                    <p className="text-lg sm:text-2xl font-black text-indigo-700 mt-1">
                      ₹{Math.round(calculations.endingCredit).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-indigo-800/80 mt-0.5 truncate">
                      Asset for next PO
                    </p>
                  </div>
                </div>

                {/* Itemized Calculation Breakdown Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between items-center p-3 bg-slate-50/80 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    <span>Component Breakdown</span>
                    <span>Amount (INR)</span>
                  </div>

                  <div className="flex justify-between items-center p-3 text-slate-600">
                    <span>Sales Revenue (Delivered only: {calculations.d} × ₹{sell})</span>
                    <span className="font-bold text-slate-900">
                      ₹{calculations.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 text-slate-600">
                    <span>Product Cost for all Shipped Orders ({calculations.o} × ₹{cost})</span>
                    <span className="font-bold text-slate-900">
                      ₹{calculations.productInvoice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 text-indigo-700 bg-indigo-50/30">
                    <span>Opening Supplier Credit Applied</span>
                    <span className="font-bold">
                      −₹{calculations.creditUsed.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 text-slate-600">
                    <span>Forward Shipping ({calculations.o} dispatched × ₹{ship})</span>
                    <span className="font-bold text-slate-900">
                      ₹{calculations.shipping.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 text-rose-700 bg-rose-50/20">
                    <span>RTO Reverse Surcharges ({calculations.r} returns × ₹{rtoFee})</span>
                    <span className="font-bold">
                      ₹{calculations.rtoCost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {calculations.totalOtherCost > 0 && (
                    <div className="flex justify-between items-center p-3 text-slate-600">
                      <span>Meta Ads & Operating Overheads</span>
                      <span className="font-bold text-slate-900">
                        ₹{calculations.totalOtherCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-slate-50/90 font-bold text-slate-900">
                    <span>Supplier Cash Payment (Invoice − Credit Applied)</span>
                    <span className="text-sm">
                      ₹{calculations.supplierCash.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-900 text-white font-bold">
                    <span>Total Physical Cash Outflow</span>
                    <span className="text-sm text-orange-400">
                      ₹{calculations.totalCashOutflow.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Ledger (CSV)</span>
                  </button>

                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share Breakdown</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: 🏦 Supplier Credit Tracker & Saved Batches */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span>Supplier Credit Tracker</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Saved on this device & ERP sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Track multiple purchase batches for <strong>{db.selected}</strong> and audit how wholesale credits are earned and deducted over time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOpeningBalanceInput(activeSupplierRecord.opening || 0);
                    setShowSetOpeningModal(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all"
                >
                  Set Opening Balance
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* Supplier Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Opening Credit
                </span>
                <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  ₹{Math.round(activeSupplierRecord.opening || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{db.selected}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Lifetime Credit Used
                </span>
                <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  ₹{Math.round(lifetimeCreditUsed).toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Applied against POs</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  New RTO Credit Earned
                </span>
                <p className="text-lg sm:text-xl font-bold text-emerald-700 mt-1">
                  ₹{Math.round(lifetimeCreditEarned).toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] text-emerald-600 mt-0.5 block">100% Sourcing Cost</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-orange-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-900 block">
                  Current Available Credit
                </span>
                <p className="text-lg sm:text-xl font-black text-[#FF7A00] mt-1">
                  ₹{Math.round(activeSupplierRecord.opening || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] text-orange-800/80 mt-0.5 block">Deductible on next PO</span>
              </div>
            </div>

            {/* Batch History Table */}
            <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Supplier / Batch Note</th>
                      <th className="py-3.5 px-4 text-center">Orders (Del / RTO)</th>
                      <th className="py-3.5 px-4 text-right">Opening</th>
                      <th className="py-3.5 px-4 text-right">Credit Used</th>
                      <th className="py-3.5 px-4 text-right">New RTO Credit</th>
                      <th className="py-3.5 px-4 text-right">Ending Credit</th>
                      <th className="py-3.5 px-4 text-right">Net Profit</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeSupplierRecord.batches.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-400">
                          <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold">No saved batches for {db.selected} yet.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Configure a batch above and click "Save Batch to Supplier Ledger".
                          </p>
                        </td>
                      </tr>
                    ) : (
                      activeSupplierRecord.batches
                        .slice()
                        .reverse()
                        .map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {b.date}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{b.supplier}</span>
                              <span className="text-[11px] text-slate-400">{b.note}</span>
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className="font-bold text-slate-800">{b.orders}</span>
                              <span className="text-slate-400 text-[11px] block">
                                {b.delivered} Del • {b.rto} RTO
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                              ₹{b.opening.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-indigo-700 whitespace-nowrap">
                              ₹{b.creditUsed.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold whitespace-nowrap">
                              +₹{b.newCredit.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-900 font-bold whitespace-nowrap">
                              ₹{b.ending.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <span
                                className={`font-bold ${
                                  b.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {b.netProfit >= 0 ? "+" : ""}₹{b.netProfit.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteBatch(b.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: ADD NEW SUPPLIER */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF7A00]" />
                <span>Add New Supplier</span>
              </h3>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier / Vendor Name
              </label>
              <input
                type="text"
                placeholder="e.g. ABC Wholesale Trading Co."
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold"
              >
                Create Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SET OPENING BALANCE */}
      {showSetOpeningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                <span>Set Opening Balance: {db.selected}</span>
              </h3>
              <button
                onClick={() => setShowSetOpeningModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Available Credit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={openingBalanceInput}
                onChange={(e) => setOpeningBalanceInput(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the existing wholesale credit memo already held with this supplier.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSetOpeningModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSetOpeningBalance}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Update Opening Credit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
