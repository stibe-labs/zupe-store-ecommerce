import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { getERPOrders, ERPOrder } from "@/lib/erpStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ERPAlertItem {
  id: string;
  type: "order" | "whatsapp" | "ndr" | "rto" | "stock" | "cart";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  href: string;
  badge: string;
  iconType: "ShoppingBag" | "Clock" | "AlertTriangle" | "RotateCcw" | "Package" | "ShoppingCart";
  iconColor: string;
  priority: "high" | "medium" | "normal";
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const t = new Date(dateStr.replace(" ", "T")).getTime();
    if (isNaN(t)) return "Recent";
    const diffSec = Math.floor((Date.now() - t) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    const days = Math.floor(diffSec / 86400);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch {
    return "Recent";
  }
}

export async function GET(req: NextRequest) {
  try {
    const alerts: ERPAlertItem[] = [];

    // 1. Fetch live orders from ERP Store / D1
    const orders: ERPOrder[] = await getERPOrders();

    for (const ord of orders) {
      const orderDate = ord.created_at || "";
      const timestamp = orderDate ? new Date(orderDate.replace(" ", "T")).getTime() : Date.now();
      const orderIdShort = ord.id?.startsWith("ord_") ? ord.id.substring(0, 18) : ord.id;
      const custName = ord.customer_name || "Customer";
      const amountStr = `₹${(Number(ord.total_amount) || 0).toLocaleString("en-IN")}`;

      // A. NDR Exception Alert (High Priority)
      const isNDR =
        ord.delivery_status === "NDR" ||
        ord.status === "NDR" ||
        (ord.ndr_status && ord.ndr_status !== "None" && ord.ndr_status !== "-");

      if (isNDR) {
        alerts.push({
          id: `ndr-${ord.id}`,
          type: "ndr",
          title: `NDR Exception: #${orderIdShort}`,
          description: `${custName} (${ord.customer_phone || "No phone"}) • Courier non-delivery action required`,
          time: formatRelativeTime(orderDate),
          timestamp,
          href: `/admin/shipments?search=${encodeURIComponent(ord.id)}`,
          badge: "NDR Action",
          iconType: "AlertTriangle",
          iconColor: "bg-rose-100 text-rose-700",
          priority: "high",
        });
        continue;
      }

      // B. RTO In Transit Alert
      const isRTO =
        ord.delivery_status?.toLowerCase().includes("rto") ||
        ord.status?.toLowerCase().includes("rto") ||
        (ord.rto_status && ord.rto_status !== "None" && ord.rto_status !== "-");

      if (isRTO) {
        alerts.push({
          id: `rto-${ord.id}`,
          type: "rto",
          title: `RTO Returning: #${orderIdShort}`,
          description: `${custName} • ${amountStr} returning to inventory/warehouse`,
          time: formatRelativeTime(orderDate),
          timestamp,
          href: `/admin/rto-refund-balance`,
          badge: "RTO",
          iconType: "RotateCcw",
          iconColor: "bg-orange-100 text-orange-700",
          priority: "high",
        });
        continue;
      }

      // C. Awaiting WhatsApp Confirmation
      if (ord.whatsapp_confirm_status === "pending_whatsapp") {
        alerts.push({
          id: `wa-${ord.id}`,
          type: "whatsapp",
          title: `Awaiting WhatsApp: #${orderIdShort}`,
          description: `${custName} (${amountStr}) • Customer confirmation pending on WhatsApp`,
          time: formatRelativeTime(orderDate),
          timestamp,
          href: `/admin/orders?whatsapp_status=pending_whatsapp`,
          badge: "WhatsApp",
          iconType: "Clock",
          iconColor: "bg-amber-100 text-amber-700",
          priority: "high",
        });
        continue;
      }

      // D. Processing / Ready to Pack
      if (
        ord.status === "Processing" ||
        ord.delivery_status === "Processing" ||
        ord.status === "Pending"
      ) {
        alerts.push({
          id: `order-${ord.id}`,
          type: "order",
          title: `New Order: #${orderIdShort}`,
          description: `${custName} • ${amountStr} via ${ord.payment_method || "COD"} • Ready to pack & ship`,
          time: formatRelativeTime(orderDate),
          timestamp,
          href: `/admin/orders?search=${encodeURIComponent(ord.id)}`,
          badge: "Ready to Pack",
          iconType: "ShoppingBag",
          iconColor: "bg-emerald-100 text-emerald-700",
          priority: "medium",
        });
      }
    }

    // 2. Fetch recent abandoned checkouts (last 48-72h)
    try {
      const abnRows = await executeD1Query<{
        id: string;
        customer_name?: string;
        customer_phone: string;
        total_amount: number;
        created_at: string;
        status: string;
      }>(
        `SELECT id, customer_name, customer_phone, total_amount, created_at, status 
         FROM abandoned_checkouts 
         WHERE status = 'abandoned' 
         ORDER BY created_at DESC 
         LIMIT 4;`
      );

      if (abnRows && abnRows.length > 0) {
        for (const abn of abnRows) {
          const abnDate = abn.created_at || "";
          const timestamp = abnDate ? new Date(abnDate.replace(" ", "T")).getTime() : Date.now();
          const amountStr = `₹${(Number(abn.total_amount) || 0).toLocaleString("en-IN")}`;
          const custName = abn.customer_name || "Customer";

          alerts.push({
            id: `abn-${abn.id}`,
            type: "cart",
            title: `Abandoned Cart: ${amountStr}`,
            description: `${custName} (${abn.customer_phone}) left items in cart`,
            time: formatRelativeTime(abnDate),
            timestamp,
            href: `/admin/abandoned-carts`,
            badge: "Recovery",
            iconType: "ShoppingCart",
            iconColor: "bg-blue-100 text-blue-700",
            priority: "normal",
          });
        }
      }
    } catch (e) {
      console.warn("Could not fetch abandoned carts for alerts:", e);
    }

    // 3. Fetch low stock or out of stock products
    try {
      const stockRows = await executeD1Query<{
        id: string;
        name: string;
        stock_count: number;
        in_stock: number;
      }>(
        `SELECT id, name, stock_count, in_stock 
         FROM products 
         WHERE stock_count <= 5 OR in_stock = 0 
         ORDER BY stock_count ASC 
         LIMIT 3;`
      );

      if (stockRows && stockRows.length > 0) {
        for (const prod of stockRows) {
          const isOut = prod.in_stock === 0 || prod.stock_count <= 0;
          alerts.push({
            id: `stock-${prod.id}`,
            type: "stock",
            title: isOut ? `Out of Stock: ${prod.name}` : `Low Stock: ${prod.name}`,
            description: isOut
              ? `0 units left. Product is marked out of stock.`
              : `Only ${prod.stock_count} units left in stock. Reorder soon.`,
            time: "Inventory",
            timestamp: Date.now() - 3600000,
            href: `/admin/products?search=${encodeURIComponent(prod.name)}`,
            badge: isOut ? "Out of Stock" : "Low Stock",
            iconType: "Package",
            iconColor: isOut ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700",
            priority: isOut ? "high" : "medium",
          });
        }
      }
    } catch (e) {
      console.warn("Could not fetch stock alerts:", e);
    }

    // Sort alerts by priority (high > medium > normal) and then newest first
    const priorityWeight: Record<string, number> = { high: 3, medium: 2, normal: 1 };
    alerts.sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      return b.timestamp - a.timestamp;
    });

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      highPriorityCount: alerts.filter((a) => a.priority === "high").length,
    });
  } catch (err: any) {
    console.error("Error in /api/admin/alerts:", err);
    return NextResponse.json(
      { success: false, error: err.message, alerts: [], count: 0 },
      { status: 500 }
    );
  }
}
