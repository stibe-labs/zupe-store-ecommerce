import { NextRequest, NextResponse } from "next/server";
import { getERPOrders, getExpenses, getSuppliers, getRTOLedger } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const [orders, expenses, suppliers, ledger] = await Promise.all([
      getERPOrders(),
      getExpenses(),
      getSuppliers(),
      getRTOLedger(),
    ]);

    // =========================================================
    // HELPER: Determine order fulfillment status
    // =========================================================
    const isOrderDelivered = (ord: any) => ord.delivery_status === "Delivered";
    const isOrderRTO = (ord: any) =>
      ord.delivery_status === "RTO Delivered" ||
      ord.delivery_status === "RTO Initiated" ||
      ord.delivery_status === "RTO In Transit" ||
      ord.status === "Returned";
    const isOrderCancelled = (ord: any) => ord.status === "Cancelled";
    const isOrderDispatched = (ord: any) => !isOrderCancelled(ord); // All non-cancelled orders were shipped

    // Helper to format date into "Month Year" (e.g., "October 2026")
    const getPeriodKey = (dateStr?: string) => {
      if (!dateStr) return "October 2026";
      const d = new Date(dateStr.replace(" ", "T"));
      if (isNaN(d.getTime())) return "October 2026";
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    // =========================================================
    // 1. MONTHLY P&L (Owner's Correct Formula)
    //
    // Revenue = Delivered orders' selling price ONLY
    // COGS = Delivered orders' product cost ONLY (RTO cost recovered via supplier credit)
    // Shipping = ALL dispatched orders (including those that become RTO)
    // RTO Charges = Additional reverse freight surcharge
    // =========================================================
    const monthlyMap = new Map<
      string,
      {
        period: string;
        grossSales: number;
        cogs: number;
        shipping: number;
        rtoCharges: number;
        adSpend: number;
        other: number;
        netProfit: number;
        margin: string;
        // Extended fields for owner's dashboard
        totalOrders: number;
        deliveredOrders: number;
        rtoOrders: number;
        totalProductInvoice: number;
        newSupplierCredit: number;
      }
    >();

    // Aggregate orders into months using owner's formula
    for (const ord of orders) {
      const period = getPeriodKey(ord.created_at);
      if (!monthlyMap.has(period)) {
        monthlyMap.set(period, {
          period,
          grossSales: 0,
          cogs: 0,
          shipping: 0,
          rtoCharges: 0,
          adSpend: 0,
          other: 0,
          netProfit: 0,
          margin: "0.0%",
          totalOrders: 0,
          deliveredOrders: 0,
          rtoOrders: 0,
          totalProductInvoice: 0,
          newSupplierCredit: 0,
        });
      }
      const p = monthlyMap.get(period)!;

      p.totalOrders += 1;

      // Revenue: ONLY count delivered orders (RTO orders earned ₹0)
      if (isOrderDelivered(ord)) {
        p.grossSales += Number(ord.total_amount) || 0;
        p.deliveredOrders += 1;
      }

      // COGS: ONLY deduct product cost for delivered orders
      // RTO product cost is recovered via supplier credit, not a loss
      if (isOrderDelivered(ord)) {
        p.cogs += Number(ord.product_cost) || 0;
      }

      // Track total product invoice (all orders paid to supplier upfront)
      p.totalProductInvoice += Number(ord.product_cost) || 0;

      // Track RTO supplier credit earned
      if (isOrderRTO(ord)) {
        p.rtoOrders += 1;
        p.newSupplierCredit += Number(ord.product_cost) || 0;
      }

      // Shipping: ALL dispatched orders pay forward shipping
      if (isOrderDispatched(ord)) {
        p.shipping += Number(ord.shipping_cost) || 0;
      }

      // RTO reverse freight: additional charge on RTO orders
      p.rtoCharges += Number(ord.rto_shipping_charge) || 0;
    }

    // Allocate expenses into months
    for (const exp of expenses) {
      const period = getPeriodKey(exp.date);
      if (!monthlyMap.has(period)) {
        monthlyMap.set(period, {
          period,
          grossSales: 0,
          cogs: 0,
          shipping: 0,
          rtoCharges: 0,
          adSpend: 0,
          other: 0,
          netProfit: 0,
          margin: "0.0%",
          totalOrders: 0,
          deliveredOrders: 0,
          rtoOrders: 0,
          totalProductInvoice: 0,
          newSupplierCredit: 0,
        });
      }
      const p = monthlyMap.get(period)!;
      if (exp.category === "Meta Ads") {
        p.adSpend += Number(exp.amount) || 0;
      } else {
        p.other += Number(exp.amount) || 0;
      }
    }

    // Finalize P&L rows with owner's formula
    const plData = Array.from(monthlyMap.values()).map((row) => {
      // Net Profit = Delivered Revenue - Delivered COGS - ALL Shipping - RTO Charges - Ad Spend - Overheads
      const net = row.grossSales - row.cogs - row.shipping - row.rtoCharges - row.adSpend - row.other;
      const margin = row.grossSales > 0 ? ((net / row.grossSales) * 100).toFixed(1) + "%" : "0.0%";
      return {
        ...row,
        netProfit: net,
        margin,
      };
    });

    // =========================================================
    // 2. PRODUCT-WISE PROFITABILITY (Using Actual COGS)
    // =========================================================
    const productStats = new Map<
      string,
      {
        name: string;
        sku: string;
        orders: number;
        deliveredOrders: number;
        revenue: number;
        cogs: number;
        shipping: number;
        netProfit: number;
        rtoCount: number;
        rtoRate: string;
        supplierCreditEarned: number;
      }
    >();

    for (const ord of orders) {
      const delivered = isOrderDelivered(ord);
      const rto = isOrderRTO(ord);
      const dispatched = isOrderDispatched(ord);

      const items =
        ord.items && ord.items.length > 0
          ? ord.items
          : [{ product_name: "Store Product", quantity: 1, unit_price: ord.total_amount }];

      // Calculate order total for proportional shipping allocation
      const orderTotal = items.reduce(
        (sum: number, it: any) => sum + (Number(it.unit_price) || 0) * (it.quantity || 1),
        0
      );
      const orderShipping = Number(ord.shipping_cost) || 0;
      const orderRTOCharge = Number(ord.rto_shipping_charge) || 0;
      const orderProductCost = Number(ord.product_cost) || 0;

      for (const it of items) {
        const pName = it.product_name || "General Product";
        const key = pName.toLowerCase().trim();
        const qty = it.quantity || 1;
        const itemRev = (Number(it.unit_price) || 0) * qty;

        if (!productStats.has(key)) {
          const skuCode = `ZUPE-${key.substring(0, 4).toUpperCase()}-01`;
          productStats.set(key, {
            name: pName,
            sku: skuCode,
            orders: 0,
            deliveredOrders: 0,
            revenue: 0,
            cogs: 0,
            shipping: 0,
            netProfit: 0,
            rtoCount: 0,
            rtoRate: "0.0%",
            supplierCreditEarned: 0,
          });
        }

        const stat = productStats.get(key)!;
        stat.orders += qty;

        // Proportional allocation of shared order-level costs to each item
        const revenueShare = orderTotal > 0 ? itemRev / orderTotal : 1 / items.length;
        const itemCostShare = Math.round(orderProductCost * revenueShare);
        const itemShippingShare = Math.round(orderShipping * revenueShare);
        const itemRTOChargeShare = Math.round(orderRTOCharge * revenueShare);

        // Revenue & COGS: Only for delivered orders
        if (delivered) {
          stat.deliveredOrders += qty;
          stat.revenue += itemRev;
          stat.cogs += itemCostShare;
          stat.netProfit += itemRev - itemCostShare - itemShippingShare;
        } else if (rto) {
          // RTO: Loss = forward shipping + reverse freight (product cost recovered via credit)
          stat.netProfit -= (itemShippingShare + itemRTOChargeShare);
          stat.supplierCreditEarned += itemCostShare;
        }

        // Shipping is paid for ALL dispatched orders
        if (dispatched) {
          stat.shipping += itemShippingShare;
        }

        if (rto) {
          stat.rtoCount += 1;
        }
      }
    }

    const productData = Array.from(productStats.values()).map((p) => ({
      ...p,
      rtoRate: p.orders > 0 ? ((p.rtoCount / p.orders) * 100).toFixed(1) + "%" : "0.0%",
    }));

    // =========================================================
    // 3. RTO DIAGNOSTICS & COURIER ANALYSIS
    // =========================================================
    const rtoOrders = orders.filter(
      (o) =>
        o.delivery_status === "RTO Delivered" ||
        o.delivery_status === "RTO Initiated" ||
        o.status === "Returned"
    );

    // Reason frequency
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
    const reasonPercent = rtoOrders.length > 0 ? Math.round((topReasonCount / rtoOrders.length) * 100) : 50;

    // Best delivering partner
    const courierDelivered: Record<string, { total: number; delivered: number }> = {};
    for (const ord of orders) {
      const c = ord.courier_partner || "Delhivery";
      if (!courierDelivered[c]) courierDelivered[c] = { total: 0, delivered: 0 };
      courierDelivered[c].total += 1;
      if (ord.delivery_status === "Delivered") {
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

    // Recovery rate from Supplier Credit data
    const totalCreditsAdded = suppliers.reduce((sum, s) => sum + Number(s.total_credits_added || 0), 0);
    const totalRTOProductValue = rtoOrders.reduce((sum, o) => sum + Number(o.product_cost || 0), 0);
    const recoveryRate = totalRTOProductValue > 0 ? Math.min(100, Math.round((totalCreditsAdded / totalRTOProductValue) * 100)) : 95;

    const courierBreakdown = Object.entries(courierDelivered).map(([courier, data]) => {
      const rtoCount = orders.filter(
        (o) =>
          (o.courier_partner || "Delhivery") === courier &&
          (o.delivery_status === "RTO Delivered" || o.delivery_status === "RTO Initiated" || o.status === "Returned")
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

    // =========================================================
    // 4. SUMMARY KPIs (Owner's Correct Method)
    // =========================================================
    const deliveredOrders = orders.filter(isOrderDelivered);
    const dispatchedOrders = orders.filter(isOrderDispatched);

    // Revenue = Delivered orders only
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    // COGS = Delivered orders' product cost only
    const totalDeliveredCOGS = deliveredOrders.reduce((sum, o) => sum + (Number(o.product_cost) || 0), 0);
    // Shipping = ALL dispatched orders
    const totalShipping = dispatchedOrders.reduce((sum, o) => sum + (Number(o.shipping_cost) || 0), 0);
    // RTO reverse freight charges
    const totalRTOCharges = orders.reduce((sum, o) => sum + (Number(o.rto_shipping_charge) || 0), 0);

    // Expenses
    const metaExpenses = expenses.filter((e) => e.category === "Meta Ads");
    const otherExpenses = expenses.filter((e) => e.category !== "Meta Ads");
    const totalAdSpend = metaExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalOtherExpenses = otherExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Net Profit = Delivered Revenue - Delivered COGS - ALL Shipping - RTO Charges - Ads - Overheads
    const totalNetProfit = totalRevenue - totalDeliveredCOGS - totalShipping - totalRTOCharges - totalAdSpend - totalOtherExpenses;
    const avgMargin = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) + "%" : "0.0%";

    // ROAS & CPA
    const overallROAS = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) + "x" : (totalRevenue > 0 ? "Organic" : "0.00x");
    const avgCPA = orders.length > 0 && totalAdSpend > 0 ? Math.round(totalAdSpend / orders.length) : 0;

    // =========================================================
    // 5. CASH FLOW CALCULATION (Owner's Requirement)
    //
    // Cash Inflow = Actual money received (Prepaid settled + COD remitted)
    // Cash Outflow = Total product invoice + ALL shipping + RTO charges + Ads + Overheads
    // Net Cash Flow = Cash Inflow - Cash Outflow
    // =========================================================
    
    // Cash Inflow: Only money actually received
    const prepaidSettled = deliveredOrders
      .filter((o) => o.payment_method !== "COD" && (o.payment_status === "Completed" || o.payment_status === "Settled"))
      .reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    const codRemitted = deliveredOrders
      .filter((o) => o.payment_method === "COD" && (o.remittance_status === "Remitted" || o.remittance_status === "Settled"))
      .reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    const codPendingRemittance = deliveredOrders
      .filter((o) => o.payment_method === "COD" && o.remittance_status === "Pending")
      .reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    const totalCashInflow = prepaidSettled + codRemitted;

    // Cash Outflow: ALL money paid out
    // Product invoice = ALL orders (you pay supplier for all products upfront, including RTO ones)
    const totalProductInvoice = orders.reduce((s, o) => s + (Number(o.product_cost) || 0), 0);
    const totalShippingPaid = totalShipping;
    const totalRTOChargesPaid = totalRTOCharges;
    const totalCashOutflow = totalProductInvoice + totalShippingPaid + totalRTOChargesPaid + totalAdSpend + totalOtherExpenses;

    const netCashFlow = totalCashInflow - totalCashOutflow;

    // =========================================================
    // 6. SUPPLIER CREDIT CALCULATION (Owner's Requirement)
    //
    // Ending Credit = Opening Credit + New Eligible RTO Credit - Credit Used
    // =========================================================
    const totalCreditsUsed = suppliers.reduce((sum, s) => sum + Number(s.total_credits_used || 0), 0);
    const availableBalance = suppliers.reduce((sum, s) => sum + Number(s.available_rto_balance || 0), 0);
    const pendingCredits = suppliers.reduce((sum, s) => sum + Number(s.pending_credits || 0), 0);
    
    // New RTO credit earned = product cost of RTO orders (supplier gives credit for returned items)
    const newRTOCreditEarned = rtoOrders.reduce((sum, o) => sum + (Number(o.product_cost) || 0), 0);

    const supplierCredit = {
      totalCreditsAdded,
      totalCreditsUsed,
      availableBalance,
      pendingCredits,
      newRTOCreditEarned,
    };

    // =========================================================
    // 7. ORDER-WISE UNIT ECONOMICS (Owner's Correct Method)
    // =========================================================
    const orderWiseData = orders.map((ord) => {
      const sellingPrice = Number(ord.total_amount) || 0;
      const cogs = Number(ord.product_cost) || 0;
      const shipping = Number(ord.shipping_cost) || 0;
      const rtoShipping = Number(ord.rto_shipping_charge) || 0;
      const adSpend = Number(ord.ad_spend_attributed) || 0;

      const delivered = isOrderDelivered(ord);
      const rto = isOrderRTO(ord);
      const cancelled = isOrderCancelled(ord);

      let netProfit = 0;
      if (delivered) {
        // Delivered: Revenue - COGS - Shipping - Ad Spend
        netProfit = sellingPrice - cogs - shipping - adSpend;
      } else if (rto) {
        // RTO: Loss = Forward shipping + Reverse freight + Ad spend (product cost recovered via credit)
        netProfit = 0 - shipping - rtoShipping - adSpend;
      } else if (cancelled) {
        // Cancelled before dispatch: No cost incurred
        netProfit = 0;
      } else {
        // In Transit / Processing: Tentative profit (delivery pending)
        netProfit = sellingPrice - cogs - shipping - adSpend;
      }

      const margin = sellingPrice > 0 ? ((netProfit / sellingPrice) * 100).toFixed(1) + "%" : "0.0%";

      return {
        id: ord.id,
        orderId: ord.shopify_order_id || ord.id,
        date: ord.created_at ? ord.created_at.split(" ")[0] : "2026-10-14",
        customer: ord.customer_name,
        customerPhone: ord.customer_phone || "-",
        product: ord.items?.[0]?.product_name || "Store Item",
        quantity: ord.items?.[0]?.quantity || 1,
        paymentMethod: ord.payment_method || "COD",
        sellingPrice,
        cogs,
        shipping,
        rtoShipping,
        adSpend,
        netProfit,
        margin,
        deliveryStatus: ord.delivery_status || "Processing",
        status: ord.status,
      };
    });

    // =========================================================
    // 8. AD SPEND & ROAS REPORT
    // =========================================================
    const adMap = new Map<string, { date: string; spend: number; notes: string }>();
    for (const exp of metaExpenses) {
      const d = exp.date ? exp.date.split(" ")[0] : "2026-10-01";
      if (!adMap.has(d)) {
        adMap.set(d, { date: d, spend: 0, notes: exp.notes || "Meta Ads Campaign" });
      }
      const curr = adMap.get(d)!;
      curr.spend += Number(exp.amount) || 0;
      if (exp.notes && !curr.notes.includes(exp.notes)) {
        curr.notes += `, ${exp.notes}`;
      }
    }

    const allDates = new Set<string>();
    adMap.forEach((_, d) => allDates.add(d));
    orders.forEach((o) => {
      if (o.created_at) allDates.add(o.created_at.split(" ")[0]);
    });

    const adSpendData = Array.from(allDates)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => {
        const spend = adMap.get(dateStr)?.spend || 0;
        const campaign = adMap.get(dateStr)?.notes || "Advantage+ Shopping";

        const dateOrders = orders.filter((o) => (o.created_at || "").startsWith(dateStr));
        const ordersCount = dateOrders.length;
        const dateDelivered = dateOrders.filter(isOrderDelivered);
        // Use delivered revenue for ROAS (owner's preference)
        const grossRev = dateOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const deliveredRev = dateDelivered.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

        const roas = spend > 0 ? (deliveredRev / spend).toFixed(2) + "x" : grossRev > 0 ? "Organic" : "0.00x";
        const cpa = ordersCount > 0 && spend > 0 ? Math.round(spend / ordersCount) : 0;
        const orderNetProfits = dateOrders.reduce((sum, o) => sum + (Number(o.net_profit) || 0), 0);

        return {
          date: dateStr,
          campaign,
          spend,
          ordersCount,
          deliveredCount: dateDelivered.length,
          revenue: grossRev,
          deliveredRevenue: deliveredRev,
          roas,
          cpa,
          netProfit: orderNetProfits - (ordersCount === 0 ? spend : 0),
        };
      })
      .filter((r) => r.spend > 0 || r.ordersCount > 0);

    // =========================================================
    // 9. ASSEMBLE FINAL RESPONSE
    // =========================================================
    const summaryKPIs = {
      // Profit Calculation
      totalRevenue,
      totalDeliveredCOGS,
      totalNetProfit,
      totalOrdersCount: orders.length,
      deliveredOrdersCount: deliveredOrders.length,
      avgMargin,
      totalRTOOrders: rtoOrders.length,
      totalAdSpend,
      overallROAS,
      avgCPA,
      totalShipping,
      totalRTOCharges,
      totalOtherExpenses,
      // Cash Flow
      cashInflow: totalCashInflow,
      cashOutflow: totalCashOutflow,
      netCashFlow,
      prepaidSettled,
      codRemitted,
      codPendingRemittance,
      totalProductInvoice,
      // Supplier Credit
      supplierCredit,
    };

    const rtoDiagnostics = {
      topReason,
      topReasonPercent: `${reasonPercent}%`,
      bestCourier: `${bestCourier} Priority`,
      bestCourierRate: `${bestCourierRate > 0 ? bestCourierRate.toFixed(1) : "91.5"}%`,
      recoveryRate: `${recoveryRate}%`,
      courierBreakdown,
      reasonsList,
    };

    return NextResponse.json({
      success: true,
      summaryKPIs,
      plData,
      productData,
      rtoDiagnostics,
      orderWiseData,
      adSpendData,
      rawOrders: orders,
      rawExpenses: expenses,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
