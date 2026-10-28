"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  BarChart2,
  Download,
  Calendar,
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Layers,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  BookOpen,
  HelpCircle,
  X,
  ChevronRight,
  Info,
  Filter,
  Calculator,
  Wallet,
  Coins,
  Landmark,
  CreditCard,
} from "lucide-react";

interface PLRow {
  period: string;
  grossSales: number;
  cogs: number;
  shipping: number;
  rtoCharges: number;
  adSpend: number;
  other: number;
  netProfit: number;
  margin: string;
}

interface ProductProfitRow {
  name: string;
  sku: string;
  orders: number;
  revenue: number;
  cogs: number;
  netProfit: number;
  rtoCount: number;
  rtoRate: string;
}

interface OrderWiseRow {
  id: string;
  orderId: string;
  date: string;
  customer: string;
  customerPhone: string;
  product: string;
  quantity: number;
  paymentMethod: string;
  sellingPrice: number;
  cogs: number;
  shipping: number;
  rtoShipping: number;
  adSpend: number;
  netProfit: number;
  margin: string;
  deliveryStatus: string;
  status: string;
}

interface AdSpendRow {
  date: string;
  campaign: string;
  spend: number;
  ordersCount: number;
  deliveredCount: number;
  revenue: number;
  deliveredRevenue: number;
  roas: string;
  cpa: number;
  netProfit: number;
}

interface CourierStat {
  courier: string;
  total: number;
  delivered: number;
  rto: number;
  rate: string;
}

interface ReasonStat {
  reason: string;
  count: number;
  percentage: string;
}

interface RTODiagnostics {
  topReason: string;
  topReasonPercent: string;
  bestCourier: string;
  bestCourierRate: string;
  recoveryRate: string;
  courierBreakdown?: CourierStat[];
  reasonsList?: ReasonStat[];
}

interface SummaryKPIs {
  totalRevenue: number;
  totalDeliveredCOGS: number;
  totalNetProfit: number;
  totalOrdersCount: number;
  deliveredOrdersCount: number;
  avgMargin: string;
  totalRTOOrders: number;
  totalAdSpend?: number;
  totalShipping: number;
  totalRTOCharges: number;
  totalOtherExpenses: number;
  overallROAS?: string;
  avgCPA?: number;
  // Cash Flow
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  prepaidSettled: number;
  codRemitted: number;
  codPendingRemittance: number;
  totalProductInvoice: number;
  // Supplier Credit
  supplierCredit: {
    totalCreditsAdded: number;
    totalCreditsUsed: number;
    availableBalance: number;
    pendingCredits: number;
    newRTOCreditEarned: number;
  };
}

export default function AdminReportsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState<"pl" | "order_wise" | "ad_spend" | "product" | "rto" | "cash_flow">("pl");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Date Range Filter: "today" | "week" | "monthly" | "custom"
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "monthly" | "custom">("monthly");
  const [customStartDate, setCustomStartDate] = useState<string>("2026-10-01");
  const [customEndDate, setCustomEndDate] = useState<string>("2026-10-20");

  // Client Calculation Guide Modal
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTab, setGuideTab] = useState<"pl" | "order_wise" | "ad_spend" | "product" | "rto" | "cash_flow">("pl");

  // Server Supplier Credit Balances
  const [serverSupplierCredit, setServerSupplierCredit] = useState<{
    totalCreditsAdded: number;
    totalCreditsUsed: number;
    availableBalance: number;
    pendingCredits: number;
  }>({
    totalCreditsAdded: 0,
    totalCreditsUsed: 0,
    availableBalance: 0,
    pendingCredits: 0,
  });

  // Raw API Datasets
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [rawExpenses, setRawExpenses] = useState<any[]>([]);
  const [plData, setPlData] = useState<PLRow[]>([]);
  const [orderWiseData, setOrderWiseData] = useState<OrderWiseRow[]>([]);
  const [adSpendData, setAdSpendData] = useState<AdSpendRow[]>([]);
  const [productData, setProductData] = useState<ProductProfitRow[]>([]);
  const [rtoDiagnostics, setRtoDiagnostics] = useState<RTODiagnostics>({
    topReason: "Customer Refused at Doorstep",
    topReasonPercent: "54%",
    bestCourier: "Delhivery Priority",
    bestCourierRate: "92.4%",
    recoveryRate: "98.2%",
    courierBreakdown: [],
    reasonsList: [],
  });

  const fetchReports = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) {
        if (data.rawOrders) setRawOrders(data.rawOrders);
        if (data.rawExpenses) setRawExpenses(data.rawExpenses);
        if (data.summaryKPIs?.supplierCredit) {
          setServerSupplierCredit(data.summaryKPIs.supplierCredit);
        }
        setPlData(data.plData || []);
        setProductData(data.productData || []);
        setOrderWiseData(data.orderWiseData || []);
        setAdSpendData(data.adSpendData || []);
        if (data.rtoDiagnostics) {
          setRtoDiagnostics(data.rtoDiagnostics);
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Compute Active Date Boundaries
  const { activeStart, activeEnd, activePeriodLabel } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    if (timeFilter === "today") {
      return {
        activeStart: todayStr,
        activeEnd: todayStr,
        activePeriodLabel: `Today (${todayStr})`,
      };
    }

    if (timeFilter === "week") {
      const past7 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const past7Y = past7.getFullYear();
      const past7M = String(past7.getMonth() + 1).padStart(2, "0");
      const past7D = String(past7.getDate()).padStart(2, "0");
      const weekStartStr = `${past7Y}-${past7M}-${past7D}`;
      return {
        activeStart: weekStartStr,
        activeEnd: todayStr,
        activePeriodLabel: `This Week (${weekStartStr} to ${todayStr})`,
      };
    }

    if (timeFilter === "monthly") {
      const monthStartStr = `${y}-${m}-01`;
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      const monthEndStr = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
      const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return {
        activeStart: monthStartStr,
        activeEnd: monthEndStr,
        activePeriodLabel: `This Month (${monthName})`,
      };
    }

    // custom
    return {
      activeStart: customStartDate || "2026-10-01",
      activeEnd: customEndDate || todayStr,
      activePeriodLabel: `Custom Range (${customStartDate} to ${customEndDate})`,
    };
  }, [timeFilter, customStartDate, customEndDate]);

  // Robust date extractor & range checker
  const extractDateOnly = (dateStr?: string) => {
    if (!dateStr) return "";
    const clean = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      return clean.substring(0, 10);
    }
    const parsed = new Date(clean.replace(" ", "T"));
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return clean.split("T")[0].split(" ")[0];
  };

  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = extractDateOnly(dateStr);
    if (!d) return false;
    if (activeStart && d < activeStart) return false;
    if (activeEnd && d > activeEnd) return false;
    return true;
  };

  // Base list of orders used for calculations
  const effectiveOrdersList = rawOrders.length > 0 ? rawOrders : orderWiseData;

  // Filtered orders & expenses for the active period
  const filteredOrders = useMemo(() => {
    return effectiveOrdersList.filter((o) => isDateInRange(o.created_at || o.date));
  }, [effectiveOrdersList, activeStart, activeEnd]);

  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((e) => isDateInRange(e.date));
  }, [rawExpenses, activeStart, activeEnd]);

  // Status helpers
  const isDelivered = (o: any) => (o.delivery_status || o.deliveryStatus) === "Delivered";
  const isRTO = (o: any) =>
    (o.delivery_status || o.deliveryStatus)?.includes("RTO") || o.status === "Returned";
  const isCancelled = (o: any) => o.status === "Cancelled";
  const isDispatched = (o: any) => !isCancelled(o);

  // Dynamically Recomputed Executive KPI Cards for the active period
  // Using Owner's Correct Formula:
  //   Revenue = Delivered orders only
  //   COGS = Delivered orders' product cost only (RTO cost recovered via supplier credit)
  //   Shipping = ALL dispatched orders
  const summaryKPIs = useMemo<SummaryKPIs>(() => {
    const deliveredOrd = filteredOrders.filter(isDelivered);
    const rtoOrd = filteredOrders.filter(isRTO);
    const dispatchedOrd = filteredOrders.filter(isDispatched);

    // Revenue: ONLY delivered orders
    const totalRev = deliveredOrd.reduce((sum, o) => sum + (Number(o.total_amount || o.sellingPrice) || 0), 0);
    // COGS: ONLY delivered orders' product cost
    const totalDeliveredCOGS = deliveredOrd.reduce((sum, o) => sum + (Number(o.product_cost || o.cogs) || 0), 0);
    // Shipping: ALL dispatched orders (including RTO — you paid forward shipping for all)
    const totalShipping = dispatchedOrd.reduce((sum, o) => sum + (Number(o.shipping_cost || o.shipping) || 0), 0);
    // RTO reverse freight charges
    const totalRtoCharges = filteredOrders.reduce((sum, o) => sum + (Number(o.rto_shipping_charge || o.rtoShipping) || 0), 0);

    const metaExp = filteredExpenses.filter((e) => e.category === "Meta Ads");
    const otherExp = filteredExpenses.filter((e) => e.category !== "Meta Ads");
    const totalAdSpend = metaExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalOther = otherExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Net Profit = Delivered Revenue - Delivered COGS - ALL Shipping - RTO Charges - Ads - Overheads
    const netProfit = totalRev - totalDeliveredCOGS - totalShipping - totalRtoCharges - totalAdSpend - totalOther;
    const avgMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) + "%" : "0.0%";

    const rtoCount = rtoOrd.length;

    const overallROAS = totalAdSpend > 0 ? (totalRev / totalAdSpend).toFixed(2) + "x" : (totalRev > 0 ? "Organic" : "0.00x");
    const avgCPA = filteredOrders.length > 0 && totalAdSpend > 0 ? Math.round(totalAdSpend / filteredOrders.length) : 0;

    // Cash Flow Calculation
    // Cash Inflow: Only money actually received
    const prepaidSettled = deliveredOrd
      .filter((o) => (o.payment_method || o.paymentMethod) !== "COD" &&
        ((o.payment_status) === "Completed" || (o.payment_status) === "Settled"))
      .reduce((s, o) => s + (Number(o.total_amount || o.sellingPrice) || 0), 0);
    const codRemitted = deliveredOrd
      .filter((o) => (o.payment_method || o.paymentMethod) === "COD" &&
        ((o.remittance_status) === "Remitted" || (o.remittance_status) === "Settled"))
      .reduce((s, o) => s + (Number(o.total_amount || o.sellingPrice) || 0), 0);
    const codPendingRemittance = deliveredOrd
      .filter((o) => (o.payment_method || o.paymentMethod) === "COD" &&
        (o.remittance_status) === "Pending")
      .reduce((s, o) => s + (Number(o.total_amount || o.sellingPrice) || 0), 0);
    const totalCashInflow = prepaidSettled + codRemitted;

    // Cash Outflow: Money paid out (all product invoices + shipping + RTO + ads + overheads)
    const totalProductInvoice = filteredOrders.reduce((s, o) => s + (Number(o.product_cost || o.cogs) || 0), 0);
    const totalCashOutflow = totalProductInvoice + totalShipping + totalRtoCharges + totalAdSpend + totalOther;
    const netCashFlow = totalCashInflow - totalCashOutflow;

    // Supplier Credit from RTO orders in this period
    const newRTOCreditEarned = rtoOrd.reduce((sum, o) => sum + (Number(o.product_cost || o.cogs) || 0), 0);

    return {
      totalRevenue: totalRev,
      totalDeliveredCOGS,
      totalNetProfit: netProfit,
      totalOrdersCount: filteredOrders.length,
      deliveredOrdersCount: deliveredOrd.length,
      avgMargin,
      totalRTOOrders: rtoCount,
      totalAdSpend,
      totalShipping,
      totalRTOCharges: totalRtoCharges,
      totalOtherExpenses: totalOther,
      overallROAS,
      avgCPA,
      cashInflow: totalCashInflow,
      cashOutflow: totalCashOutflow,
      netCashFlow,
      prepaidSettled,
      codRemitted,
      codPendingRemittance,
      totalProductInvoice,
      supplierCredit: {
        totalCreditsAdded: serverSupplierCredit.totalCreditsAdded,
        totalCreditsUsed: serverSupplierCredit.totalCreditsUsed,
        availableBalance: serverSupplierCredit.availableBalance || Math.max(0, serverSupplierCredit.totalCreditsAdded - serverSupplierCredit.totalCreditsUsed),
        pendingCredits: serverSupplierCredit.pendingCredits,
        newRTOCreditEarned,
      },
    };
  }, [filteredOrders, filteredExpenses, serverSupplierCredit]);

  // Section 1: P&L Statement (includes active period summary row)
  // Uses owner's formula: Revenue & COGS = Delivered only, Shipping = ALL dispatched
  const displayPlData = useMemo(() => {
    const periodRow: PLRow = {
      period: `⚡ Active Period: ${activePeriodLabel}`,
      grossSales: summaryKPIs.totalRevenue,
      cogs: summaryKPIs.totalDeliveredCOGS,
      shipping: summaryKPIs.totalShipping,
      rtoCharges: summaryKPIs.totalRTOCharges,
      adSpend: summaryKPIs.totalAdSpend || 0,
      other: summaryKPIs.totalOtherExpenses,
      netProfit: summaryKPIs.totalNetProfit,
      margin: summaryKPIs.avgMargin,
    };

    if (timeFilter !== "monthly") {
      return [periodRow, ...plData];
    }
    return plData.length > 0 ? plData : [periodRow];
  }, [timeFilter, activePeriodLabel, summaryKPIs, plData]);

  // Section 2: Order-Wise Unit Economics
  const displayOrderWiseData = useMemo<OrderWiseRow[]>(() => {
    return filteredOrders.map((ord) => {
      const sellingPrice = Number(ord.total_amount ?? ord.sellingPrice) || 0;
      const cogs = Number(ord.product_cost ?? ord.cogs) || 0;
      const shipping = Number(ord.shipping_cost ?? ord.shipping) || 0;
      const rtoShipping = Number(ord.rto_shipping_charge ?? ord.rtoShipping) || 0;
      const adSpend = Number(ord.ad_spend_attributed ?? ord.adSpend) || 0;

      const dStatus = ord.delivery_status || ord.deliveryStatus || "Processing";
      const oStatus = ord.status || "Pending";

      const isRTO =
        dStatus === "RTO Delivered" ||
        dStatus === "RTO Initiated" ||
        dStatus === "RTO In Transit" ||
        oStatus === "Returned";
      const isDelivered = dStatus === "Delivered";
      const isCancelled = oStatus === "Cancelled";

      let netProfit = 0;
      if (isDelivered) {
        netProfit = sellingPrice - cogs - shipping - adSpend;
      } else if (isRTO) {
        netProfit = 0 - shipping - rtoShipping - adSpend;
      } else if (isCancelled) {
        netProfit = 0;
      } else {
        netProfit = sellingPrice - cogs - shipping - adSpend;
      }

      const margin = sellingPrice > 0 ? ((netProfit / sellingPrice) * 100).toFixed(1) + "%" : "0.0%";

      const dateStr = ord.created_at
        ? ord.created_at.split("T")[0].split(" ")[0]
        : ord.date || "2026-10-20";

      return {
        id: ord.id,
        orderId: ord.shopify_order_id || ord.orderId || ord.id,
        date: dateStr,
        customer: ord.customer_name || ord.customer || "Guest Customer",
        customerPhone: ord.customer_phone || ord.customerPhone || "-",
        product: ord.items?.[0]?.product_name || ord.product || "Store Product",
        quantity: ord.items?.[0]?.quantity || ord.quantity || 1,
        paymentMethod: ord.payment_method || ord.paymentMethod || "COD",
        sellingPrice,
        cogs,
        shipping,
        rtoShipping,
        adSpend,
        netProfit,
        margin,
        deliveryStatus: dStatus,
        status: oStatus,
      };
    });
  }, [filteredOrders]);

  const searchedOrderWiseData = useMemo(() => {
    if (!orderSearchQuery) return displayOrderWiseData;
    const q = orderSearchQuery.toLowerCase();
    return displayOrderWiseData.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.product.toLowerCase().includes(q) ||
        o.deliveryStatus.toLowerCase().includes(q)
    );
  }, [displayOrderWiseData, orderSearchQuery]);

  // Section 3: Ad Spend & ROAS
  const displayAdSpendData = useMemo<AdSpendRow[]>(() => {
    const metaExp = filteredExpenses.filter((e) => e.category === "Meta Ads");
    const adMap = new Map<string, { date: string; spend: number; notes: string }>();

    for (const exp of metaExp) {
      const d = exp.date ? exp.date.split(" ")[0] : "2026-10-01";
      if (!adMap.has(d)) {
        adMap.set(d, { date: d, spend: 0, notes: exp.notes || "Meta Advantage+ Shopping Campaign" });
      }
      const curr = adMap.get(d)!;
      curr.spend += Number(exp.amount) || 0;
      if (exp.notes && !curr.notes.includes(exp.notes)) {
        curr.notes += `, ${exp.notes}`;
      }
    }

    const allDates = new Set<string>();
    adMap.forEach((_, d) => allDates.add(d));
    filteredOrders.forEach((o) => {
      const d = (o.created_at || o.date || "").split("T")[0].split(" ")[0];
      if (d) allDates.add(d);
    });

    return Array.from(allDates)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => {
        const spend = adMap.get(dateStr)?.spend || 0;
        const campaign = adMap.get(dateStr)?.notes || "Advantage+ Shopping";

        const dateOrders = filteredOrders.filter((o) => (o.created_at || o.date || "").includes(dateStr));
        const ordersCount = dateOrders.length;
        const deliveredOrders = dateOrders.filter(
          (o) => (o.delivery_status || o.deliveryStatus) === "Delivered"
        );
        const grossRev = dateOrders.reduce(
          (sum, o) => sum + (Number(o.total_amount || o.sellingPrice) || 0),
          0
        );
        const deliveredRev = deliveredOrders.reduce(
          (sum, o) => sum + (Number(o.total_amount || o.sellingPrice) || 0),
          0
        );

        const roas = spend > 0 ? (grossRev / spend).toFixed(2) + "x" : grossRev > 0 ? "Organic" : "0.00x";
        const cpa = ordersCount > 0 && spend > 0 ? Math.round(spend / ordersCount) : 0;
        const orderNetProfits = dateOrders.reduce((sum, o) => sum + (Number(o.net_profit) || 0), 0);

        return {
          date: dateStr,
          campaign,
          spend,
          ordersCount,
          deliveredCount: deliveredOrders.length,
          revenue: grossRev,
          deliveredRevenue: deliveredRev,
          roas,
          cpa,
          netProfit: orderNetProfits - (ordersCount === 0 ? spend : 0),
        };
      })
      .filter((r) => r.spend > 0 || r.ordersCount > 0);
  }, [filteredOrders, filteredExpenses]);

  // Section 4: Product Margins (Using Actual COGS, Owner's Formula)
  // Revenue & COGS = Delivered orders only, Shipping allocated proportionally
  const displayProductData = useMemo<ProductProfitRow[]>(() => {
    const statsMap = new Map<string, ProductProfitRow>();

    for (const ord of filteredOrders) {
      const delivered = isDelivered(ord);
      const rto = isRTO(ord);
      const dispatched = isDispatched(ord);

      const items =
        ord.items && ord.items.length > 0
          ? ord.items
          : [{ product_name: ord.product || "Store Product", quantity: ord.quantity || 1, unit_price: ord.total_amount || ord.sellingPrice || 799 }];

      // Order-level costs for proportional allocation
      const orderProductCost = Number(ord.product_cost || ord.cogs) || 0;
      const orderShipping = Number(ord.shipping_cost || ord.shipping) || 0;
      const orderRTOCharge = Number(ord.rto_shipping_charge || ord.rtoShipping) || 0;
      const orderTotal = items.reduce(
        (sum: number, it: any) => sum + (Number(it.unit_price) || 0) * (it.quantity || 1),
        0
      );

      for (const it of items) {
        const pName = it.product_name || "General Product";
        const key = pName.toLowerCase().trim();
        const qty = it.quantity || 1;
        const itemRev = (Number(it.unit_price) || 0) * qty;

        if (!statsMap.has(key)) {
          const skuCode = `ZUPE-${key.substring(0, 4).toUpperCase()}-01`;
          statsMap.set(key, {
            name: pName,
            sku: skuCode,
            orders: 0,
            revenue: 0,
            cogs: 0,
            netProfit: 0,
            rtoCount: 0,
            rtoRate: "0.0%",
          });
        }

        const stat = statsMap.get(key)!;
        stat.orders += qty;

        // Proportional allocation of shared costs
        const revenueShare = orderTotal > 0 ? itemRev / orderTotal : 1 / items.length;
        const itemCostShare = Math.round(orderProductCost * revenueShare);
        const itemShippingShare = Math.round(orderShipping * revenueShare);
        const itemRTOChargeShare = Math.round(orderRTOCharge * revenueShare);

        // Revenue & COGS: Only for delivered orders
        if (delivered) {
          stat.revenue += itemRev;
          stat.cogs += itemCostShare;
          stat.netProfit += itemRev - itemCostShare - itemShippingShare;
        } else if (rto) {
          // RTO loss: forward shipping + reverse freight (product cost recovered via credit)
          stat.netProfit -= (itemShippingShare + itemRTOChargeShare);
        }

        if (rto) {
          stat.rtoCount += 1;
        }
      }
    }

    if (statsMap.size === 0 && productData.length > 0) {
      return productData;
    }

    return Array.from(statsMap.values()).map((p) => ({
      ...p,
      rtoRate: p.orders > 0 ? ((p.rtoCount / p.orders) * 100).toFixed(1) + "%" : "0.0%",
    }));
  }, [filteredOrders, productData]);

  // Section 5: RTO Diagnostics & Couriers
  const displayRtoDiagnostics = useMemo<RTODiagnostics>(() => {
    const rtoOrders = filteredOrders.filter(
      (o) =>
        (o.delivery_status || o.deliveryStatus)?.includes("RTO") ||
        o.status === "Returned"
    );

    const reasonsMap: Record<string, number> = {};
    for (const ord of rtoOrders) {
      const r = ord.ndr_status && ord.ndr_status !== "None" ? ord.ndr_status : "Customer Refused at Doorstep";
      reasonsMap[r] = (reasonsMap[r] || 0) + 1;
    }

    let topReason = "Customer Refused at Doorstep";
    let topReasonCount = 0;
    for (const [r, cnt] of Object.entries(reasonsMap)) {
      if (cnt > topReasonCount) {
        topReason = r;
        topReasonCount = cnt;
      }
    }
    const topReasonPercent = rtoOrders.length > 0 ? `${Math.round((topReasonCount / rtoOrders.length) * 100)}%` : "0%";

    const courierDelivered: Record<string, { total: number; delivered: number }> = {};
    for (const ord of filteredOrders) {
      const c = ord.courier_partner || ord.courierPartner || "Delhivery";
      if (!courierDelivered[c]) courierDelivered[c] = { total: 0, delivered: 0 };
      courierDelivered[c].total += 1;
      if ((ord.delivery_status || ord.deliveryStatus) === "Delivered") {
        courierDelivered[c].delivered += 1;
      }
    }

    let bestCourier = "Delhivery";
    let bestCourierRate = 0;
    for (const [c, data] of Object.entries(courierDelivered)) {
      const rate = data.total > 0 ? (data.delivered / data.total) * 100 : 0;
      if (rate >= bestCourierRate) {
        bestCourierRate = rate;
        bestCourier = c;
      }
    }

    const courierBreakdown = Object.entries(courierDelivered).map(([courier, data]) => {
      const rtoCount = filteredOrders.filter(
        (o) =>
          (o.courier_partner || "Delhivery") === courier &&
          ((o.delivery_status || o.deliveryStatus)?.includes("RTO") || o.status === "Returned")
      ).length;
      const rate = data.total > 0 ? ((data.delivered / data.total) * 100).toFixed(1) + "%" : "0.0%";
      return {
        courier,
        total: data.total,
        delivered: data.delivered,
        rto: rtoCount,
        rate,
      };
    });

    const reasonsList = Object.entries(reasonsMap).map(([reason, count]) => ({
      reason,
      count,
      percentage: rtoOrders.length > 0 ? `${Math.round((count / rtoOrders.length) * 100)}%` : "0%",
    }));

    return {
      topReason,
      topReasonPercent,
      bestCourier: `${bestCourier} Priority`,
      bestCourierRate: `${bestCourierRate > 0 ? bestCourierRate.toFixed(1) : "91.5"}%`,
      recoveryRate: rtoDiagnostics.recoveryRate || "98.2%",
      courierBreakdown: courierBreakdown.length > 0 ? courierBreakdown : rtoDiagnostics.courierBreakdown,
      reasonsList: reasonsList.length > 0 ? reasonsList : rtoDiagnostics.reasonsList,
    };
  }, [filteredOrders, rtoDiagnostics]);

  const handleExport = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (reportType === "pl") {
      headers = [
        "Period",
        "Gross Sales (INR)",
        "COGS (INR)",
        "Shipping Cost (INR)",
        "RTO Charges (INR)",
        "Ad Spend (INR)",
        "Overhead Expenses (INR)",
        "Net Profit (INR)",
        "Net Margin",
      ];
      rows = displayPlData.map((d) => [
        `"${d.period}"`,
        d.grossSales,
        d.cogs,
        d.shipping,
        d.rtoCharges,
        d.adSpend,
        d.other,
        d.netProfit,
        `"${d.margin}"`,
      ]);
    } else if (reportType === "order_wise") {
      headers = [
        "Order ID",
        "Date",
        "Customer Name",
        "Customer Phone",
        "Product",
        "Qty",
        "Payment Mode",
        "Selling Price (INR)",
        "Product Cost (INR)",
        "Shipping Cost (INR)",
        "Reverse RTO Freight (INR)",
        "Attributed Ad Spend (INR)",
        "Net Order Profit (INR)",
        "Net Margin",
        "Delivery Status",
        "Order Status",
      ];
      rows = searchedOrderWiseData.map((o) => [
        `"${o.orderId}"`,
        `"${o.date}"`,
        `"${o.customer.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${o.product.replace(/"/g, '""')}"`,
        o.quantity,
        `"${o.paymentMethod}"`,
        o.sellingPrice,
        o.cogs,
        o.shipping,
        o.rtoShipping,
        o.adSpend,
        o.netProfit,
        `"${o.margin}"`,
        `"${o.deliveryStatus}"`,
        `"${o.status}"`,
      ]);
    } else if (reportType === "ad_spend") {
      headers = [
        "Date",
        "Campaign Notes",
        "Meta Ad Spend (INR)",
        "Orders Placed",
        "Delivered Orders",
        "Gross Revenue (INR)",
        "Delivered Revenue (INR)",
        "ROAS",
        "CPA (INR)",
        "Realized Net Profit (INR)",
      ];
      rows = displayAdSpendData.map((a) => [
        `"${a.date}"`,
        `"${a.campaign.replace(/"/g, '""')}"`,
        a.spend,
        a.ordersCount,
        a.deliveredCount,
        a.revenue,
        a.deliveredRevenue,
        `"${a.roas}"`,
        a.cpa,
        a.netProfit,
      ]);
    } else if (reportType === "product") {
      headers = [
        "Product Name",
        "SKU",
        "Orders Sold",
        "Gross Revenue (INR)",
        "Supplier Cost (INR)",
        "Net Profit (INR)",
        "RTO Rate",
      ];
      rows = displayProductData.map((d) => [
        `"${d.name.replace(/"/g, '""')}"`,
        `"${d.sku}"`,
        d.orders,
        d.revenue,
        d.cogs,
        d.netProfit,
        `"${d.rtoRate}"`,
      ]);
    } else if (reportType === "cash_flow") {
      headers = ["Metric", "Amount (INR)", "Notes"];
      rows = [
        ["Delivered Sales Revenue", summaryKPIs.totalRevenue, "Delivered customer orders only"],
        ["Delivered COGS", summaryKPIs.totalDeliveredCOGS, "Product cost for delivered items only"],
        ["Total Shipping Paid", summaryKPIs.totalShipping, "Forward logistics for all dispatched orders"],
        ["RTO Surcharges Paid", summaryKPIs.totalRTOCharges, "Reverse logistics charges on returned orders"],
        ["Meta Ad Spend", summaryKPIs.totalAdSpend || 0, "Digital marketing expenditure"],
        ["Overhead Expenses", summaryKPIs.totalOtherExpenses, "Packaging, software & general overheads"],
        ["Cumulative Net Profit", summaryKPIs.totalNetProfit, "Delivered Rev - Delivered COGS - Shipping - RTO - Ads - Overheads"],
        ["Actual Cash Inflow", summaryKPIs.cashInflow, "Delivered COD remitted + Prepaid settled"],
        ["Prepaid Settled", summaryKPIs.prepaidSettled, "Online payments settled into bank"],
        ["COD Remitted", summaryKPIs.codRemitted, "Cash-on-delivery payouts received"],
        ["Pending COD Remittance", summaryKPIs.codPendingRemittance, "COD orders delivered awaiting courier payout"],
        ["Actual Cash Outflow", summaryKPIs.cashOutflow, "100% Product Invoices + Freight + RTO + Ads + Overheads"],
        ["Total Product Invoices Paid", summaryKPIs.totalProductInvoice, "Wholesale invoice paid to suppliers upfront"],
        ["Net Cash Flow", summaryKPIs.netCashFlow, "Cash Inflow minus Cash Outflow"],
        ["Supplier Credit Balance", summaryKPIs.supplierCredit.availableBalance, "Available credit balance to offset future purchases"],
        ["New RTO Credit Earned", summaryKPIs.supplierCredit.newRTOCreditEarned, "Credit earned from RTO products in active period"],
      ];
    } else {
      headers = ["Courier Partner", "Dispatches", "Delivered", "RTO Returns", "Delivery Rate"];
      rows = (displayRtoDiagnostics.courierBreakdown || []).map((c) => [
        `"${c.courier}"`,
        c.total,
        c.delivered,
        c.rto,
        `"${c.rate}"`,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `zupe_report_${reportType}_${timeFilter}_${activeStart}_to_${activeEnd}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Title & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Business Intelligence & Reports
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live BI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Financial P&L statements, order-wise unit economics, Meta Ads ROAS attribution, and return diagnostics.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => setShowGuideModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Calculation Guide</span>
              </button>

              <button
                onClick={() => fetchReports(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Sync Live"}</span>
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV ({reportType.replace("_", "-").toUpperCase()})</span>
              </button>
            </div>
          </div>

          {/* Date Filter Toolbar (Today / This Week / Monthly / Custom Range) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5 text-[#FF7A00]" />
                Date Filter:
              </span>
              {[
                { id: "today", label: "Today" },
                { id: "week", label: "This Week" },
                { id: "monthly", label: "Monthly" },
                { id: "custom", label: "Custom Range" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimeFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    timeFilter === f.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Custom Range Inputs or Active Period Indicator */}
            <div className="flex flex-wrap items-center gap-3">
              {timeFilter === "custom" && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                  <span className="text-slate-500 font-medium">From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                  />
                  <span className="text-slate-400 font-medium">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                  />
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-[#FF7A00] rounded-xl text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activePeriodLabel}</span>
                <span className="text-orange-400">•</span>
                <span className="text-slate-600 font-normal">
                  {filteredOrders.length} orders
                </span>
              </div>
            </div>
          </div>

          {/* KPI Executive Summary Strip (Tier 1: Profitability & Sourcing | Tier 2: Cash Flow & Supplier Credit) */}
          <div className="space-y-3">
            {/* Tier 1: Realized Profitability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Delivered Sales Revenue
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center font-bold">
                    ₹
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-900">
                    ₹{summaryKPIs.totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{summaryKPIs.deliveredOrdersCount} of {summaryKPIs.totalOrdersCount} delivered (Excludes RTO)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cumulative Net Profit
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-emerald-600">
                    ₹{summaryKPIs.totalNetProfit.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span>Net margin: <strong className="text-slate-800">{summaryKPIs.avgMargin}</strong> (All costs deducted)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Meta Ads ROAS
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-purple-700">
                    {summaryKPIs.overallROAS || "0.00x"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600 font-medium">
                    <span>Spend: ₹{(summaryKPIs.totalAdSpend || 0).toLocaleString("en-IN")} • CPA: ₹{summaryKPIs.avgCPA || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dispatched Orders
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-900">
                    {summaryKPIs.totalOrdersCount} <span className="text-sm font-semibold text-slate-500">orders</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-medium">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{summaryKPIs.totalRTOOrders} RTO recorded ({summaryKPIs.totalOrdersCount > 0 ? ((summaryKPIs.totalRTOOrders / summaryKPIs.totalOrdersCount) * 100).toFixed(0) : 0}% RTO rate)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 2: Cash Flow & Supplier Credit (Owner's Preference) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actual Cash Inflow
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-emerald-700">
                    ₹{summaryKPIs.cashInflow.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span>Prepaid ₹{summaryKPIs.prepaidSettled.toLocaleString("en-IN")} + COD ₹{summaryKPIs.codRemitted.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actual Cash Outflow
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-900">
                    ₹{summaryKPIs.cashOutflow.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
                    <span>Invoices ₹{summaryKPIs.totalProductInvoice.toLocaleString("en-IN")} + Freight & Ops</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Net Cash Flow
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    summaryKPIs.netCashFlow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className={`text-2xl font-black ${
                    summaryKPIs.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {summaryKPIs.netCashFlow >= 0 ? "+" : ""}₹{summaryKPIs.netCashFlow.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span>Inflow − Outflow (Pending COD: ₹{summaryKPIs.codPendingRemittance.toLocaleString("en-IN")})</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Supplier Credit Balance
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-indigo-700">
                    ₹{(summaryKPIs.supplierCredit.availableBalance || 0).toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>+₹{summaryKPIs.supplierCredit.newRTOCreditEarned.toLocaleString("en-IN")} new RTO credit in period</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "pl", label: "Monthly P&L", icon: FileSpreadsheet },
              { id: "cash_flow", label: "Cash Flow & Supplier Credit", icon: Wallet },
              { id: "order_wise", label: "Order-Wise Unit Economics", icon: Layers },
              { id: "ad_spend", label: "Ad Spend & ROAS", icon: TrendingUp },
              { id: "product", label: "Product Margins", icon: ShoppingBag },
              { id: "rto", label: "RTO & Couriers", icon: RotateCcw },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setReportType(t.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    reportType === t.id
                      ? "bg-[#FF7A00] text-white shadow-sm shadow-orange-500/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/90 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#FF7A00] animate-spin" />
              <p className="text-sm font-semibold text-slate-600">
                Aggregating real financial statements from database...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: P&L Statement */}
              {reportType === "pl" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          Monthly Profit & Loss Statement (P&L)
                        </h3>
                        <button
                          onClick={() => {
                            setGuideTab("pl");
                            setShowGuideModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How this is calculated</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Financial statement: Net sales minus COGS, forward shipping, reverse RTO freight, ad spend, and operational overheads.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto whitespace-nowrap">
                      {displayPlData.length} Periods Calculated
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-5">Accounting Period</th>
                          <th className="py-3.5 px-4 text-right">Gross Sales</th>
                          <th className="py-3.5 px-4 text-right">COGS</th>
                          <th className="py-3.5 px-4 text-right">Shipping</th>
                          <th className="py-3.5 px-4 text-right">RTO Charges</th>
                          <th className="py-3.5 px-4 text-right">Ad Spend</th>
                          <th className="py-3.5 px-4 text-right">Overhead</th>
                          <th className="py-3.5 px-4 text-right">Net Profit</th>
                          <th className="py-3.5 px-5 text-right">Net Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {displayPlData.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              No financial records found for this period.
                            </td>
                          </tr>
                        ) : (
                          displayPlData.map((row) => {
                            const isCurrentFilteredRow = row.period.startsWith("⚡");
                            return (
                              <tr
                                key={row.period}
                                className={`transition-colors ${
                                  isCurrentFilteredRow
                                    ? "bg-orange-50/60 font-semibold border-l-4 border-l-[#FF7A00]"
                                    : "hover:bg-slate-50/70"
                                }`}
                              >
                                <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Calendar className={`w-4 h-4 ${isCurrentFilteredRow ? "text-[#FF7A00]" : "text-slate-400"}`} />
                                    <span>{row.period}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                  ₹{row.grossSales.toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                  ₹{row.cogs.toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                  ₹{row.shipping.toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-4 text-rose-600 text-right whitespace-nowrap">
                                  ₹{row.rtoCharges.toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-4 text-purple-600 text-right whitespace-nowrap">
                                  ₹{row.adSpend.toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-4 text-slate-500 text-right whitespace-nowrap">
                                  ₹{row.other.toLocaleString("en-IN")}
                                </td>
                                <td className={`py-3.5 px-4 font-black text-right whitespace-nowrap ${
                                  row.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                                }`}>
                                  ₹{row.netProfit.toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                  <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                                    parseFloat(row.margin) >= 20
                                      ? "bg-emerald-50 text-emerald-700"
                                      : parseFloat(row.margin) > 0
                                      ? "bg-orange-50 text-[#FF7A00]"
                                      : "bg-rose-50 text-rose-700"
                                  }`}>
                                    {row.margin}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Cash Flow & Supplier Credit Ledger */}
              {reportType === "cash_flow" && (
                <div className="space-y-6">
                  {/* Top Header Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-[#FF7A00]" />
                          Cash Flow & Supplier Credit Ledger
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          Owner Business Model
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Track actual money moving in and out of your bank account, and reconcile wholesale RTO product credits held with suppliers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setGuideTab("cash_flow");
                          setShowGuideModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        <span>Owner Formula Breakdown</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Core Rules Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200 text-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
                        <ShoppingBag className="w-4 h-4 text-[#FF7A00]" />
                        <span>1. Profit: Delivered Sales Only</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Revenue and COGS are counted <strong>only for delivered orders</strong>. RTO orders earned ₹0 revenue and their product cost is credited back by the supplier, so product cost is not lost.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200 text-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-blue-900 text-xs sm:text-sm">
                        <Landmark className="w-4 h-4 text-blue-600" />
                        <span>2. Cash Flow: Actual Bank Flow</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Cash Inflow counts only <strong>actual money received</strong> (prepaid settled + COD remitted). Cash Outflow counts <strong>100% of upfront product invoices + shipping paid</strong>.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-4 rounded-2xl border border-purple-200 text-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-purple-900 text-xs sm:text-sm">
                        <Coins className="w-4 h-4 text-purple-600" />
                        <span>3. Supplier Credit: Future Asset</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        RTO product cost becomes an <strong>Available Supplier Credit</strong> that offsets future inventory invoices. It is a wholesale purchasing discount, not instant bank cash.
                      </p>
                    </div>
                  </div>

                  {/* Two-Column Statement: Cash Inflow vs Cash Outflow */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column 1: Cash Inflow */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">Actual Cash Inflow (Money In)</h4>
                              <p className="text-[11px] text-slate-500">Realized funds settled into your bank</p>
                            </div>
                          </div>
                          <span className="text-lg font-black text-emerald-700">
                            ₹{summaryKPIs.cashInflow.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="p-5 divide-y divide-slate-100 space-y-3">
                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Prepaid Customer Orders</p>
                              <p className="text-[11px] text-slate-400">Razorpay / UPI settled transactions</p>
                            </div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              ₹{summaryKPIs.prepaidSettled.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Delivered COD Remitted</p>
                              <p className="text-[11px] text-slate-400">Courier COD remittances received in bank account</p>
                            </div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              ₹{summaryKPIs.codRemitted.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3 bg-amber-50/60 -mx-5 px-5 py-3 border-y border-amber-100">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-amber-900 text-xs">Pending COD Remittances</p>
                                <p className="text-[11px] text-amber-700/80">Delivered packages awaiting courier weekly payout</p>
                              </div>
                            </div>
                            <span className="font-bold text-amber-800 text-xs sm:text-sm">
                              ₹{summaryKPIs.codPendingRemittance.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        Total Realized Inflow: <strong className="text-emerald-700 font-bold">₹{summaryKPIs.cashInflow.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    {/* Column 2: Cash Outflow */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="p-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                              <ArrowDownRight className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">Actual Cash Outflow (Money Out)</h4>
                              <p className="text-[11px] text-slate-500">Total money paid out across all operations</p>
                            </div>
                          </div>
                          <span className="text-lg font-black text-slate-900">
                            ₹{summaryKPIs.cashOutflow.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="p-5 divide-y divide-slate-100 space-y-3">
                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Supplier Product Invoices (100% Orders)</p>
                              <p className="text-[11px] text-slate-400">Paid to supplier for all {summaryKPIs.totalOrdersCount} dispatched items upfront</p>
                            </div>
                            <span className="font-bold text-rose-600 text-xs sm:text-sm">
                              -₹{summaryKPIs.totalProductInvoice.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Forward Shipping Charges</p>
                              <p className="text-[11px] text-slate-400">Paid to 3PL couriers for all dispatched shipments</p>
                            </div>
                            <span className="font-bold text-rose-600 text-xs sm:text-sm">
                              -₹{summaryKPIs.totalShipping.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Additional RTO Reverse Freight</p>
                              <p className="text-[11px] text-slate-400">Reverse courier surcharges for {summaryKPIs.totalRTOOrders} returned packages</p>
                            </div>
                            <span className="font-bold text-rose-600 text-xs sm:text-sm">
                              -₹{summaryKPIs.totalRTOCharges.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Meta Advantage+ Ad Spend</p>
                              <p className="text-[11px] text-slate-400">Paid marketing budget during active period</p>
                            </div>
                            <span className="font-bold text-rose-600 text-xs sm:text-sm">
                              -₹{(summaryKPIs.totalAdSpend || 0).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm">Operating Overheads & Software</p>
                              <p className="text-[11px] text-slate-400">Packaging, Shopify apps, domain & support expenses</p>
                            </div>
                            <span className="font-bold text-rose-600 text-xs sm:text-sm">
                              -₹{summaryKPIs.totalOtherExpenses.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        Total Cash Disbursed: <strong className="text-rose-700 font-bold">₹{summaryKPIs.cashOutflow.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Net Cash Position & Variance vs Profit Card */}
                  <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    summaryKPIs.netCashFlow >= 0 ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Net Cash Position</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          summaryKPIs.netCashFlow >= 0 ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
                        }`}>
                          {summaryKPIs.netCashFlow >= 0 ? "Positive Cash Flow" : "Cash Deficit (Inventory Buffer)"}
                        </span>
                      </div>
                      <p className={`text-3xl font-black ${
                        summaryKPIs.netCashFlow >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        {summaryKPIs.netCashFlow >= 0 ? "+" : ""}₹{summaryKPIs.netCashFlow.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        <strong>Why is Net Cash Flow different from Cumulative Net Profit (₹{summaryKPIs.totalNetProfit.toLocaleString("en-IN")})?</strong>
                        {" "}You paid upfront for all product items from the supplier (₹{summaryKPIs.totalProductInvoice.toLocaleString("en-IN")}), but only collected money on delivered orders. The ₹{summaryKPIs.supplierCredit.newRTOCreditEarned.toLocaleString("en-IN")} product cost for RTOs is protected as Supplier Credit for future purchase orders, while ₹{summaryKPIs.codPendingRemittance.toLocaleString("en-IN")} in COD remittances is pending courier settlement.
                      </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-2 min-w-[240px]">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Cumulative Net Profit:</span>
                        <span className="font-bold text-emerald-600">₹{summaryKPIs.totalNetProfit.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Net Cash Flow:</span>
                        <span className={`font-bold ${summaryKPIs.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {summaryKPIs.netCashFlow >= 0 ? "+" : ""}₹{summaryKPIs.netCashFlow.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Cash Flow Variance:</span>
                        <span className="font-bold text-slate-800">
                          {summaryKPIs.netCashFlow - summaryKPIs.totalNetProfit >= 0 ? "+" : ""}₹{(summaryKPIs.netCashFlow - summaryKPIs.totalNetProfit).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Credit Reconciliation Ledger */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <Coins className="w-5 h-5 text-indigo-600" />
                            Supplier Credit Balance Reconciliation
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Wholesale Asset
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Ending Supplier Credit = Opening Balance + New Eligible RTO Credit − Credit Applied Against New Orders
                        </p>
                      </div>

                      <a
                        href="/admin/suppliers"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors self-start sm:self-auto"
                      >
                        <span>Open Supplier RTO Ledger</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <p className="text-xs text-slate-500 font-medium">Available Credit Balance</p>
                        <p className="text-2xl font-black text-indigo-700 mt-1">
                          ₹{(summaryKPIs.supplierCredit.availableBalance || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Can be used as discount on next PO</p>
                      </div>

                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                        <p className="text-xs text-emerald-800 font-medium">+ New RTO Credit in Period</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1">
                          +₹{summaryKPIs.supplierCredit.newRTOCreditEarned.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-emerald-600/80 mt-1">From {summaryKPIs.totalRTOOrders} RTO packages returned</p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <p className="text-xs text-slate-500 font-medium">Historical Credits Used</p>
                        <p className="text-2xl font-black text-slate-700 mt-1">
                          ₹{summaryKPIs.supplierCredit.totalCreditsUsed.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Applied against wholesale inventory orders</p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <p className="text-xs text-slate-500 font-medium">Total Credits Earned (Lifetime)</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                          ₹{summaryKPIs.supplierCredit.totalCreditsAdded.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">100% RTO cost recovery rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner's 10-Order Reference Model vs Active Period Audit Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Owner Business Model: 10-Order Benchmark Comparison
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Side-by-side verification: Compare the store owner's reference example against current store performance.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 border border-orange-200 text-[#FF7A00] rounded-lg self-start sm:self-auto">
                        Automated Verification
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-5">Financial Metric</th>
                            <th className="py-3 px-5 text-center">Owner 10-Order Model</th>
                            <th className="py-3 px-5 text-center">Store Active Period</th>
                            <th className="py-3 px-5 text-right">Calculation Rule & Owner Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-3 px-5 font-semibold text-slate-900">Total Dispatched Orders</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">10 orders</td>
                            <td className="py-3 px-5 text-center font-bold text-[#FF7A00]">{summaryKPIs.totalOrdersCount} orders</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">All non-cancelled customer shipments</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-5 font-semibold text-slate-900">Delivered Orders</td>
                            <td className="py-3 px-5 text-center font-bold text-emerald-600">7 orders (70%)</td>
                            <td className="py-3 px-5 text-center font-bold text-emerald-600">{summaryKPIs.deliveredOrdersCount} orders ({summaryKPIs.totalOrdersCount > 0 ? ((summaryKPIs.deliveredOrdersCount / summaryKPIs.totalOrdersCount) * 100).toFixed(0) : 0}%)</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Delivered to customer doorstep</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-5 font-semibold text-slate-900">RTO Orders & Rate</td>
                            <td className="py-3 px-5 text-center font-bold text-rose-600">3 orders (30%)</td>
                            <td className="py-3 px-5 text-center font-bold text-rose-600">{summaryKPIs.totalRTOOrders} orders ({summaryKPIs.totalOrdersCount > 0 ? ((summaryKPIs.totalRTOOrders / summaryKPIs.totalOrdersCount) * 100).toFixed(0) : 0}%)</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Returned to seller / warehouse</td>
                          </tr>
                          <tr className="bg-orange-50/30">
                            <td className="py-3 px-5 font-bold text-slate-900">Delivered Sales Revenue</td>
                            <td className="py-3 px-5 text-center font-black text-slate-900">₹5,600 (7 × ₹800)</td>
                            <td className="py-3 px-5 text-center font-black text-[#FF7A00]">₹{summaryKPIs.totalRevenue.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-emerald-700 font-semibold">Counts ONLY delivered orders (RTO earned ₹0)</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-5 font-semibold text-slate-900">Supplier Product Invoice Paid</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹5,000 (10 × ₹500)</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹{summaryKPIs.totalProductInvoice.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Paid to supplier upfront for all 10 items</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="py-3 px-5 font-semibold text-slate-900">Delivered COGS in Profit</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹3,500 (7 × ₹500)</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹{summaryKPIs.totalDeliveredCOGS.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Only delivered items deducted from profit</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-5 font-semibold text-slate-900">Forward Shipping Cost</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹1,300 (10 × ₹130)</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹{summaryKPIs.totalShipping.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Paid for ALL dispatched orders (including RTO)</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-5 font-semibold text-slate-900">RTO Reverse Charges</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹150 (3 × ₹50)</td>
                            <td className="py-3 px-5 text-center font-bold text-slate-800">₹{summaryKPIs.totalRTOCharges.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Additional reverse freight surcharge</td>
                          </tr>
                          <tr className="bg-emerald-50/60 font-bold">
                            <td className="py-3.5 px-5 text-emerald-950 font-black">Cumulative Net Profit</td>
                            <td className="py-3.5 px-5 text-center text-emerald-700 font-black text-base">₹650</td>
                            <td className="py-3.5 px-5 text-center text-emerald-700 font-black text-base">₹{summaryKPIs.totalNetProfit.toLocaleString("en-IN")}</td>
                            <td className="py-3.5 px-5 text-right text-xs text-emerald-800">₹5,600 - ₹3,500 - ₹1,300 - ₹150 (before ads/overheads)</td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="py-3 px-5 font-semibold text-slate-900">Actual Cash Inflow</td>
                            <td className="py-3 px-5 text-center font-bold text-emerald-600">₹5,600</td>
                            <td className="py-3 px-5 text-center font-bold text-emerald-600">₹{summaryKPIs.cashInflow.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">Delivered COD remitted + Prepaid settled</td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="py-3 px-5 font-semibold text-slate-900">Actual Cash Outflow</td>
                            <td className="py-3 px-5 text-center font-bold text-rose-600">₹6,450</td>
                            <td className="py-3 px-5 text-center font-bold text-rose-600">₹{summaryKPIs.cashOutflow.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-slate-500">₹5,000 product + ₹1,300 shipping + ₹150 RTO</td>
                          </tr>
                          <tr className="bg-rose-50/60 font-bold">
                            <td className="py-3.5 px-5 text-rose-950 font-black">Net Cash Flow</td>
                            <td className="py-3.5 px-5 text-center text-rose-700 font-black text-base">-₹850</td>
                            <td className="py-3.5 px-5 text-center text-rose-700 font-black text-base">
                              {summaryKPIs.netCashFlow >= 0 ? "+" : ""}₹{summaryKPIs.netCashFlow.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-5 text-right text-xs text-rose-800">Cash Inflow minus Cash Outflow (₹5,600 − ₹6,450)</td>
                          </tr>
                          <tr className="bg-indigo-50/40">
                            <td className="py-3 px-5 font-bold text-indigo-950">Supplier Credit Earned</td>
                            <td className="py-3 px-5 text-center font-black text-indigo-700">₹1,500 (3 × ₹500)</td>
                            <td className="py-3 px-5 text-center font-black text-indigo-700">₹{summaryKPIs.supplierCredit.newRTOCreditEarned.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-5 text-right text-xs text-indigo-700 font-semibold">100% RTO product cost credited back for future POs</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Order-Wise Unit Economics */}
              {reportType === "order_wise" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          Order-Wise Unit Economics Audit
                        </h3>
                        <button
                          onClick={() => {
                            setGuideTab("order_wise");
                            setShowGuideModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How this is calculated</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Itemized breakdown per order: Selling price, COGS, forward shipping, reverse RTO freight, ad spend, and net order profit.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter orders, customer, SKU..."
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] w-60"
                        />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap">
                        {searchedOrderWiseData.length} of {effectiveOrdersList.length} Orders
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 sm:px-6">Order ID & Date</th>
                          <th className="py-3.5 px-4">Customer</th>
                          <th className="py-3.5 px-4">Product Details</th>
                          <th className="py-3.5 px-4 text-center">Payment</th>
                          <th className="py-3.5 px-4 text-right">Selling Price</th>
                          <th className="py-3.5 px-4 text-right">COGS</th>
                          <th className="py-3.5 px-4 text-right">Shipping</th>
                          <th className="py-3.5 px-4 text-right">RTO / Ad</th>
                          <th className="py-3.5 px-4 text-right">Net Profit</th>
                          <th className="py-3.5 px-4 text-right">Margin</th>
                          <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {searchedOrderWiseData.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="py-8 text-center text-slate-400">
                              No matching orders found in the selected date range ({activePeriodLabel}).
                            </td>
                          </tr>
                        ) : (
                          searchedOrderWiseData.map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                <span className="font-bold text-[#FF7A00] block">{ord.orderId}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{ord.date}</span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <p className="font-semibold text-slate-900">{ord.customer}</p>
                                <p className="text-[11px] text-slate-400">{ord.customerPhone}</p>
                              </td>
                              <td className="py-3.5 px-4 max-w-[200px] truncate">
                                <span className="font-medium text-slate-800">{ord.product}</span>
                                <span className="text-slate-400 text-xs block">Qty: {ord.quantity}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  ord.paymentMethod === "COD"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-sky-50 text-sky-700 border border-sky-200"
                                }`}>
                                  {ord.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                ₹{ord.sellingPrice.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                ₹{ord.cogs.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                ₹{ord.shipping.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className="text-rose-600 block text-xs">RTO: ₹{ord.rtoShipping}</span>
                                <span className="text-purple-600 block text-xs">Ad: ₹{ord.adSpend}</span>
                              </td>
                              <td className={`py-3.5 px-4 font-bold text-right whitespace-nowrap ${
                                ord.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                              }`}>
                                ₹{ord.netProfit.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                                  parseFloat(ord.margin) >= 20
                                    ? "bg-emerald-50 text-emerald-700"
                                    : parseFloat(ord.margin) > 0
                                    ? "bg-orange-50 text-[#FF7A00]"
                                    : "bg-rose-50 text-rose-700"
                                }`}>
                                  {ord.margin}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  ord.deliveryStatus === "Delivered"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : ord.deliveryStatus.includes("RTO")
                                    ? "bg-rose-100 text-rose-700"
                                    : ord.deliveryStatus === "NDR"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {ord.deliveryStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Ad Spend & ROAS Report */}
              {reportType === "ad_spend" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          Meta Ads & Paid Acquisition Performance (ROAS)
                        </h3>
                        <button
                          onClick={() => {
                            setGuideTab("ad_spend");
                            setShowGuideModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How this is calculated</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Daily ad spend correlation against realized sales, delivered revenue, return on ad spend (ROAS), and cost per acquisition (CPA).
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg self-start sm:self-auto whitespace-nowrap">
                      Overall ROAS: {summaryKPIs.overallROAS || "6.54x"}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-5">Date</th>
                          <th className="py-3.5 px-4">Campaign Target / Notes</th>
                          <th className="py-3.5 px-4 text-right">Ad Spend</th>
                          <th className="py-3.5 px-4 text-center">Orders</th>
                          <th className="py-3.5 px-4 text-center">Delivered</th>
                          <th className="py-3.5 px-4 text-right">Gross Sales</th>
                          <th className="py-3.5 px-4 text-right">Delivered Rev</th>
                          <th className="py-3.5 px-4 text-center">ROAS</th>
                          <th className="py-3.5 px-4 text-right">CPA</th>
                          <th className="py-3.5 px-5 text-right">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {displayAdSpendData.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-8 text-center text-slate-400">
                              No Meta Ads campaigns recorded for this period ({activePeriodLabel}). Enter ad expenses in the Expenses module.
                            </td>
                          </tr>
                        ) : (
                          displayAdSpendData.map((row) => (
                            <tr key={row.date} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {row.date}
                              </td>
                              <td className="py-3.5 px-4 max-w-[240px] truncate text-slate-700">
                                {row.campaign}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-purple-700 text-right whitespace-nowrap">
                                ₹{row.spend.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                                {row.ordersCount}
                              </td>
                              <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 whitespace-nowrap">
                                {row.deliveredCount}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                ₹{row.revenue.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-emerald-700 text-right whitespace-nowrap">
                                ₹{row.deliveredRevenue.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  row.roas.includes("x") && parseFloat(row.roas) >= 4
                                    ? "bg-emerald-100 text-emerald-800"
                                    : row.roas.includes("x") && parseFloat(row.roas) >= 2
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {row.roas}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap font-mono text-xs">
                                ₹{row.cpa}
                              </td>
                              <td className={`py-3.5 px-5 font-bold text-right whitespace-nowrap ${
                                row.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                              }`}>
                                ₹{row.netProfit.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Product Unit Economics */}
              {reportType === "product" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          Product Profitability & Unit Economics
                        </h3>
                        <button
                          onClick={() => {
                            setGuideTab("product");
                            setShowGuideModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How this is calculated</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Itemized gross revenue, supplier COGS, net contribution margin, and doorstep return rates for {activePeriodLabel}.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto whitespace-nowrap">
                      {displayProductData.length} Products Monitored
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-5">Product Name</th>
                          <th className="py-3.5 px-4">SKU</th>
                          <th className="py-3.5 px-4 text-center">Orders Sold</th>
                          <th className="py-3.5 px-4 text-right">Gross Revenue</th>
                          <th className="py-3.5 px-4 text-right">Supplier Cost (COGS)</th>
                          <th className="py-3.5 px-4 text-right">Est. Net Profit</th>
                          <th className="py-3.5 px-5 text-right">RTO Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {displayProductData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No product sales recorded in the selected period ({activePeriodLabel}).
                            </td>
                          </tr>
                        ) : (
                          displayProductData.map((p) => (
                            <tr key={p.sku} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                                {p.name}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                                {p.sku}
                              </td>
                              <td className="py-3.5 px-4 text-center text-slate-800 whitespace-nowrap font-bold">
                                {p.orders}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                ₹{p.revenue.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                ₹{p.cogs.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-emerald-600 text-right whitespace-nowrap">
                                ₹{p.netProfit.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    parseFloat(p.rtoRate) <= 5
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : parseFloat(p.rtoRate) <= 12
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {p.rtoRate}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: RTO Diagnostics & Couriers */}
              {reportType === "rto" && (
                <div className="space-y-6">
                  {/* Top Insight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Top Return Reason
                        </span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {displayRtoDiagnostics.topReason}
                      </p>
                      <p className="text-xs text-slate-500">
                        Accounts for {displayRtoDiagnostics.topReasonPercent} of all recorded COD return events in this period.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Highest Delivering Partner
                        </span>
                        <Truck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-lg font-bold text-emerald-700">
                        {displayRtoDiagnostics.bestCourier}
                      </p>
                      <p className="text-xs text-slate-500">
                        {displayRtoDiagnostics.bestCourierRate} delivery success rate across prepaid and COD routes.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          RTO Credit Recovery Rate
                        </span>
                        <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                      </div>
                      <p className="text-lg font-bold text-[#FF7A00]">
                        {displayRtoDiagnostics.recoveryRate}
                      </p>
                      <p className="text-xs text-slate-500">
                        Supplier balance credited back for failed parcels via RTO Ledger.
                      </p>
                    </div>
                  </div>

                  {/* Courier Partner Performance Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            Courier Logistics Delivery Performance
                          </h3>
                          <button
                            onClick={() => {
                              setGuideTab("rto");
                              setShowGuideModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>How this is calculated</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Live delivery conversion and failure rates by integrated 3PL partner for {activePeriodLabel}.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3.5 px-5">Courier Partner</th>
                            <th className="py-3.5 px-4 text-center">Total Dispatched</th>
                            <th className="py-3.5 px-4 text-center">Delivered</th>
                            <th className="py-3.5 px-4 text-center">RTO Returns</th>
                            <th className="py-3.5 px-4 text-center">Delivery Success Rate</th>
                            <th className="py-3.5 px-5 text-right">Route Health</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(displayRtoDiagnostics.courierBreakdown && displayRtoDiagnostics.courierBreakdown.length > 0) ? (
                            displayRtoDiagnostics.courierBreakdown.map((c) => {
                              const successRateNum = parseFloat(c.rate) || 0;
                              return (
                                <tr key={c.courier} className="hover:bg-slate-50/70">
                                  <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#FF7A00]" />
                                    <span>{c.courier}</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                    {c.total}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                                    {c.delivered}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                                    {c.rto}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            successRateNum >= 80 ? "bg-emerald-500" : successRateNum >= 60 ? "bg-amber-500" : "bg-rose-500"
                                          }`}
                                          style={{ width: `${Math.min(100, successRateNum)}%` }}
                                        />
                                      </div>
                                      <span className="font-bold text-slate-900">{c.rate}</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-5 text-right">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      successRateNum >= 80
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {successRateNum >= 80 ? "Optimal" : "Monitor NDR"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400">
                                No courier dispatches recorded in this period ({activePeriodLabel}).
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Return Reasons Distribution */}
                  {displayRtoDiagnostics.reasonsList && displayRtoDiagnostics.reasonsList.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm">
                        NDR & Doorstep Rejection Breakdown
                      </h4>
                      <div className="space-y-3">
                        {displayRtoDiagnostics.reasonsList.map((r) => (
                          <div key={r.reason} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{r.reason}</span>
                              <span className="text-slate-500">{r.count} instances ({r.percentage})</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded-full transition-all"
                                style={{ width: r.percentage }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* CLIENT CALCULATION GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-[#FF7A00] flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    BI & Financial Reports Calculation Guide
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Transparent formula breakdowns and unit economics guide for Zupe Store administrators.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Section Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold">
              {[
                { id: "pl", label: "1. Profit Calculation", icon: FileSpreadsheet },
                { id: "cash_flow", label: "2. Cash Flow & Credits", icon: Wallet },
                { id: "order_wise", label: "3. Unit Economics", icon: Layers },
                { id: "ad_spend", label: "4. Ad Spend & ROAS", icon: TrendingUp },
                { id: "product", label: "5. Product Margins", icon: ShoppingBag },
                { id: "rto", label: "6. RTO Diagnostics", icon: RotateCcw },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setGuideTab(tab.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                      guideTab === tab.id
                        ? "bg-[#FF7A00] text-white shadow-sm"
                        : "bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
              {/* SECTION 1: PROFIT CALCULATION */}
              {guideTab === "pl" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      1. Net Profit Calculation (Owner's Preference)
                    </h3>
                    <p className="text-slate-500">
                      Calculates the true bottom-line profitability of your dropshipping business. Revenue and COGS are counted <strong>only for delivered orders</strong>, while shipping is paid for all dispatches.
                    </p>
                  </div>

                  {/* Formula Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs sm:text-sm border-l-4 border-l-[#FF7A00] space-y-1 shadow-sm">
                    <p className="text-orange-400 font-bold uppercase tracking-wider text-[11px]">Primary Formula</p>
                    <p className="font-bold text-white">
                      Net Profit = Delivered Sales Revenue - Delivered Product Cost - ALL Forward Shipping - RTO Reverse Freight - Ad Spend - Overheads
                    </p>
                    <p className="text-slate-400 text-xs">
                      Net Margin % = (Net Profit ÷ Delivered Sales Revenue) × 100
                    </p>
                  </div>

                  {/* Metric Definitions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                      <p className="font-bold text-emerald-950">Delivered Sales Revenue</p>
                      <p className="text-xs text-emerald-800/90 mt-1">
                        Counts ONLY orders successfully delivered to the customer. RTO (Returned) orders earned ₹0 revenue and are completely excluded from gross sales.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                      <p className="font-bold text-emerald-950">Delivered COGS (Product Cost)</p>
                      <p className="text-xs text-emerald-800/90 mt-1">
                        Only product cost for delivered orders is deducted from profit. The wholesale cost of RTO items is <strong>credited back 100% by the supplier</strong> and added to your Supplier Credit Balance, so it is not an operational loss.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="font-bold text-slate-900">Forward Shipping Charges</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Forward courier freight charged on <strong>ALL dispatched orders</strong> (including those that end up as RTO, since the courier still shipped the package).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="font-bold text-slate-900">RTO Reverse Charges</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Additional reverse courier surcharge levied by 3PL logistics when a package fails doorstep delivery and is returned back.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="font-bold text-slate-900">Meta Ad Spend</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Total digital advertising budget spent on Meta Advantage+ Shopping campaigns for the active period.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="font-bold text-slate-900">Operating Overheads</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Packaging materials, software subscriptions (Shopify, domain, APIs), and general business administrative overheads.
                      </p>
                    </div>
                  </div>

                  {/* Concrete 10-Order Model Example */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                    <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                      <Info className="w-4 h-4 text-amber-600" />
                      Owner's Standard 10-Order Model Walkthrough:
                    </p>
                    <p className="text-xs leading-relaxed text-amber-900/90">
                      Assume 10 orders placed: <strong>7 Delivered</strong> and <strong>3 RTO</strong> (30% RTO rate).
                      Selling Price = ₹800, Product Cost = ₹500, Forward Shipping = ₹130, RTO Charge = ₹50.
                    </p>
                    <div className="mt-2.5 font-mono text-xs bg-white/80 p-3 rounded-xl border border-amber-200/70 space-y-1">
                      <p>Delivered Sales Revenue = 7 × ₹800 = <strong>₹5,600</strong></p>
                      <p>Delivered Product Cost = 7 × ₹500 = <strong>₹3,500</strong></p>
                      <p>Forward Shipping (All 10 Orders) = 10 × ₹130 = <strong>₹1,300</strong></p>
                      <p>RTO Reverse Charges (3 Orders) = 3 × ₹50 = <strong>₹150</strong></p>
                      <p className="pt-1 border-t border-amber-200 font-bold text-emerald-700">
                        Net Profit = ₹5,600 − ₹3,500 − ₹1,300 − ₹150 = ₹650 (before ads & overheads)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CASH FLOW & SUPPLIER CREDIT */}
              {guideTab === "cash_flow" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      2. Cash Flow & Supplier Credit Logic
                    </h3>
                    <p className="text-slate-500">
                      Separates operational accounting profit from physical bank cash movement and wholesale supplier credit balances.
                    </p>
                  </div>

                  {/* Formula Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs sm:text-sm border-l-4 border-l-blue-500 space-y-1 shadow-sm">
                    <p className="text-blue-400 font-bold uppercase tracking-wider text-[11px]">Cash Flow & Credit Formulas</p>
                    <p className="font-bold text-white">
                      Actual Cash Inflow = Delivered Prepaid Settled + Delivered COD Remitted
                    </p>
                    <p className="font-bold text-white">
                      Actual Cash Outflow = Total Product Invoice Paid (100% Orders) + Shipping + RTO + Ads + Overheads
                    </p>
                    <p className="font-bold text-emerald-400">
                      Net Cash Flow = Actual Cash Inflow − Actual Cash Outflow
                    </p>
                    <p className="text-indigo-300 text-xs pt-1 border-t border-slate-700">
                      Ending Supplier Credit = Opening Balance + New Eligible RTO Credit − Credit Applied Against New Orders
                    </p>
                  </div>

                  {/* Why Cash Flow != Profit Explanation */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-2">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-blue-600" />
                      Critical Distinction: Why Net Cash Flow is −₹850 while Net Profit is +₹650
                    </p>
                    <p className="text-xs leading-relaxed text-blue-900/90">
                      In the owner's 10-order example:
                    </p>
                    <div className="font-mono text-xs bg-white/80 p-3 rounded-xl border border-blue-200/70 space-y-1 text-slate-800">
                      <p>Cash Inflow (From 7 delivered customers) = 7 × ₹800 = <strong>₹5,600</strong></p>
                      <p>Cash Outflow: Paid supplier upfront for all 10 items (10 × ₹500 = ₹5,000) + Shipping (₹1,300) + RTO (₹150) = <strong>₹6,450</strong></p>
                      <p className="font-bold text-rose-600">Net Cash Flow = ₹5,600 − ₹6,450 = −₹850</p>
                    </div>
                    <p className="text-xs text-blue-900/80">
                      <strong>Takeaway:</strong> You are profitable (+₹650), but currently in a cash deficit (−₹850) because ₹1,500 was paid to the supplier for the 3 returned units. That ₹1,500 is not lost—it is credited to your <strong>Supplier Credit Balance</strong> to deduct from your next wholesale purchase order!
                    </p>
                  </div>

                  {/* Supplier Credit Rules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                      <p className="font-bold text-indigo-950">Supplier Credit is a Purchasing Asset</p>
                      <p className="text-xs text-indigo-900/80 mt-1">
                        Suppliers do not wire cash refunds back to your bank account for RTO items. Instead, they record a credit memo on your account, reducing the cash required for future wholesale inventory purchases.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                      <p className="font-bold text-indigo-950">No Double-Deduction Rule</p>
                      <p className="text-xs text-indigo-900/80 mt-1">
                        The system must never deduct the full product invoice (10 orders) from profit and then also deduct delivered product cost. P&L profit deducts only delivered units, while Cash Outflow tracks total upfront invoices.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: ORDER-WISE UNIT ECONOMICS */}
              {guideTab === "order_wise" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      2. Order-Wise Unit Economics
                    </h3>
                    <p className="text-slate-500">
                      Audits every individual customer order as an isolated mini-business to uncover exactly how much profit or loss each order produced.
                    </p>
                  </div>

                  {/* Scenarios */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <p className="font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Scenario A: Order is Delivered (Profitable)
                      </p>
                      <div className="mt-2 font-mono text-xs bg-white/80 p-2.5 rounded-xl border border-emerald-300">
                        Net Profit = Selling Price - Product COGS - Forward Shipping - Attributed Ad Spend
                      </div>
                      <p className="text-xs text-emerald-800 mt-2">
                        Customer pays the full price. Supplier cost, forward shipping, and ad spend are subtracted to arrive at positive net profit.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                      <p className="font-bold text-rose-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Scenario B: Order is RTO / Doorstep Rejected (Loss)
                      </p>
                      <div className="mt-2 font-mono text-xs bg-white/80 p-2.5 rounded-xl border border-rose-300">
                        Net Profit = 0 - Forward Shipping - Reverse RTO Freight - Attributed Ad Spend
                      </div>
                      <p className="text-xs text-rose-800 mt-2">
                        Customer did not pay (₹0 revenue). Supplier credits the product back into your RTO balance, but your business pays both forward freight, reverse return freight, and wasted ad spend.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        Attributed Ad Spend per Order
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Calculated by dividing the total ad budget on that order date by the number of orders placed (<span className="font-mono font-bold">Ad Spend ÷ Total Orders = CPA</span>).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: AD SPEND & ROAS */}
              {guideTab === "ad_spend" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      3. Ad Spend & ROAS (Return On Ad Spend)
                    </h3>
                    <p className="text-slate-500">
                      Measures marketing acquisition efficiency, true blended ROAS, and customer acquisition cost (CPA).
                    </p>
                  </div>

                  {/* Formula Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs sm:text-sm border-l-4 border-l-purple-500 space-y-2 shadow-sm">
                    <div>
                      <span className="text-purple-400 font-bold uppercase text-[11px]">ROAS Equation:</span>
                      <p className="font-bold text-white">ROAS = Gross Revenue ÷ Total Ad Spend</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-bold uppercase text-[11px]">CPA (Cost Per Acquisition):</span>
                      <p className="font-bold text-white">CPA = Total Ad Spend ÷ Total Orders Placed</p>
                    </div>
                  </div>

                  {/* Explanations */}
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="font-bold text-slate-900">Gross Sales vs Delivered Revenue</p>
                      <p className="text-xs text-slate-600 mt-1">
                        In Indian COD e-commerce, gross revenue includes all placed orders, but <strong>Delivered Revenue</strong> only counts orders that actually reached the customer's hands. Tracking both protects you from over-optimizing for fake or returning COD traffic.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="font-bold text-slate-900">ROAS Benchmark Interpretation</p>
                      <ul className="text-xs text-slate-600 mt-1.5 space-y-1 list-disc list-inside">
                        <li><strong className="text-emerald-700">Above 4.0x:</strong> Highly profitable campaign. Safe to scale daily ad budget.</li>
                        <li><strong className="text-purple-700">2.5x - 4.0x:</strong> Healthy performance covering standard COGS and logistics.</li>
                        <li><strong className="text-rose-700">Below 2.0x:</strong> Margins squeezed. Review creative fatigue, targeting, or product pricing.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: PRODUCT MARGINS */}
              {guideTab === "product" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      4. Product Margins & Contribution
                    </h3>
                    <p className="text-slate-500">
                      Evaluates SKU-level profitability, unit costs, and doorstep return vulnerability.
                    </p>
                  </div>

                  {/* Formula Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs sm:text-sm border-l-4 border-l-sky-500 space-y-2 shadow-sm">
                    <div>
                      <span className="text-sky-400 font-bold uppercase text-[11px]">RTO Doorstep Failure Rate:</span>
                      <p className="font-bold text-white">RTO Rate % = (RTO Orders ÷ Total Product Orders) × 100</p>
                    </div>
                    <div>
                      <span className="text-sky-400 font-bold uppercase text-[11px]">Product Net Profit:</span>
                      <p className="font-bold text-white">Net Profit = Total Product Revenue - Sourcing COGS - Allocated Logistics & Ads</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs leading-relaxed space-y-2">
                    <p className="font-bold text-sky-900">Why SKU RTO Rate matters to your profit:</p>
                    <p>
                      Products with an RTO rate above <strong>12%</strong> drain profit rapidly through repeat courier fees. When a product exceeds 12%, you should:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Enable mandatory phone confirmation for COD orders on that specific SKU.</li>
                      <li>Improve product unboxing expectations with accurate product photos and videos.</li>
                      <li>Incentivize Prepaid checkouts by offering a special discount.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* SECTION 5: RTO & COURIERS */}
              {guideTab === "rto" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      5. RTO Diagnostics & Courier Logistics
                    </h3>
                    <p className="text-slate-500">
                      Tracks 3PL logistics partner performance, delivery success conversions, Non-Delivery Reports (NDR), and supplier credit recovery.
                    </p>
                  </div>

                  {/* Formula Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs sm:text-sm border-l-4 border-l-amber-500 space-y-2 shadow-sm">
                    <div>
                      <span className="text-amber-400 font-bold uppercase text-[11px]">Courier Delivery Success Rate:</span>
                      <p className="font-bold text-white">Delivery Rate % = (Delivered Parcels ÷ Total Dispatches) × 100</p>
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold uppercase text-[11px]">RTO Recovery Rate:</span>
                      <p className="font-bold text-white">Recovery % = (Approved Supplier RTO Credits ÷ Total Returned Inventory Value) × 100</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="font-bold text-slate-900">Integrated RTO Ledger Recovery</p>
                      <p className="text-xs text-slate-600 mt-1">
                        When an order fails delivery, Zupe Store's RTO Ledger logs the parcel return back to the supplier. Once approved, the supplier issues an <strong>RTO Credit Balance</strong> which you apply against future wholesale inventory orders. A recovery rate above <strong>95%</strong> ensures you never lose money on unsold stock!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BookOpen className="w-4 h-4 text-[#FF7A00]" />
                <span>Full documentation also available in <strong>docs/ADMIN_CALCULATION_GUIDE.md</strong></span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm self-end sm:self-auto"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
