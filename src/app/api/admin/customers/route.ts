import { NextRequest, NextResponse } from "next/server";
import { getERPOrders, ERPOrder } from "@/lib/erpStore";
import { executeD1Query } from "@/lib/d1";

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  shipping_address: string;
  ordersCount: number;
  totalSpend: number;
  rtoCount: number;
  rtoRate: number;
  lastOrderDate: string;
  recentOrders: {
    id: string;
    shopify_order_id: string;
    total_amount: number;
    delivery_status: string;
    created_at: string;
  }[];
}

export async function GET(req: NextRequest) {
  try {
    const orders = await getERPOrders();

    // Also fetch registered users if D1 is active
    let registeredUsers: any[] = [];
    try {
      const uRows = await executeD1Query("SELECT * FROM users");
      if (uRows && Array.isArray(uRows)) {
        registeredUsers = uRows;
      }
    } catch (err) {
      console.warn("D1 users query warning:", err);
    }

    // Map customers by normalized email or phone
    const customerMap = new Map<string, CustomerProfile>();

    for (const ord of orders) {
      const key = (ord.guest_email || ord.customer_phone || ord.customer_name).toLowerCase().trim();
      if (!key) continue;

      let profile = customerMap.get(key);
      const isRTO =
        ord.delivery_status === "RTO Delivered" ||
        ord.delivery_status === "RTO Initiated" ||
        ord.status === "Returned";

      // Attempt to extract city from address
      let city = "India";
      if (ord.shipping_address) {
        const parts = ord.shipping_address.split(",");
        if (parts.length >= 2) {
          city = parts.slice(-3, -1).join(", ").trim() || parts[parts.length - 1].trim();
        } else {
          city = ord.shipping_address.trim();
        }
      }

      if (!profile) {
        profile = {
          id: `cust_${key.replace(/[^a-z0-9]/g, "")}`,
          name: ord.customer_name,
          email: ord.guest_email || "",
          phone: ord.customer_phone || "",
          city: city,
          shipping_address: ord.shipping_address || "",
          ordersCount: 0,
          totalSpend: 0,
          rtoCount: 0,
          rtoRate: 0,
          lastOrderDate: ord.created_at,
          recentOrders: [],
        };
        customerMap.set(key, profile);
      }

      profile.ordersCount += 1;
      profile.totalSpend += Number(ord.total_amount) || 0;
      if (isRTO) {
        profile.rtoCount += 1;
      }

      if (profile.recentOrders.length < 5) {
        profile.recentOrders.push({
          id: ord.id,
          shopify_order_id: ord.shopify_order_id,
          total_amount: Number(ord.total_amount) || 0,
          delivery_status: ord.delivery_status,
          created_at: ord.created_at,
        });
      }

      if (ord.created_at && (!profile.lastOrderDate || ord.created_at > profile.lastOrderDate)) {
        profile.lastOrderDate = ord.created_at;
      }
    }

    // Include registered users who haven't ordered yet
    for (const u of registeredUsers) {
      const key = (u.email || u.phone || u.name || "").toLowerCase().trim();
      if (key && !customerMap.has(key)) {
        customerMap.set(key, {
          id: u.id || `cust_${key.replace(/[^a-z0-9]/g, "")}`,
          name: u.name || "Customer",
          email: u.email || "",
          phone: u.phone || "",
          city: "Registered User",
          shipping_address: "",
          ordersCount: 0,
          totalSpend: 0,
          rtoCount: 0,
          rtoRate: 0,
          lastOrderDate: u.created_at || "New",
          recentOrders: [],
        });
      }
    }

    const customers = Array.from(customerMap.values()).map((c) => ({
      ...c,
      rtoRate: c.ordersCount > 0 ? Math.round((c.rtoCount / c.ordersCount) * 100) : 0,
    }));

    // Sort by total spend descending
    customers.sort((a, b) => b.totalSpend - a.totalSpend);

    // Compute top metrics
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter((c) => c.ordersCount > 1).length;
    const repeatRate =
      totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : "0.0";
    const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgLtv = totalCustomers > 0 ? Math.round(totalSpendAll / totalCustomers) : 0;
    const cleanCustomers = customers.filter((c) => c.rtoCount === 0).length;
    const rtoRiskCustomers = customers.filter((c) => c.rtoRate > 25).length;

    return NextResponse.json({
      success: true,
      customers,
      metrics: {
        totalCustomers,
        repeatCustomers,
        repeatRate: Number(repeatRate),
        avgLtv,
        cleanCustomers,
        rtoRiskCustomers,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
