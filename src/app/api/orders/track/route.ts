import { NextRequest, NextResponse } from "next/server";
import { getERPOrders, ERPOrder } from "@/lib/erpStore";
import { getOrders, OrderRecord } from "@/lib/orderStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (
      searchParams.get("query") ||
      searchParams.get("orderId") ||
      searchParams.get("order_id") ||
      searchParams.get("id") ||
      searchParams.get("awb") ||
      ""
    ).trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Please enter an Order ID, AWB Tracking Number, Phone, or Email." },
        { status: 400 }
      );
    }

    const qLower = query.toLowerCase();
    const cleanNoHash = qLower.replace(/^#/, "");
    const cleanNoOrd = cleanNoHash.replace(/^ord_/, "");
    const digitsOnly = query.replace(/\D/g, "");

    // 1. Check ERP Orders
    const erpOrders = await getERPOrders();

    const matchedErp = erpOrders.filter((o) => {
      const oId = (o.id || "").toLowerCase();
      const shopifyId = (o.shopify_order_id || "").toLowerCase();
      const shopifyClean = shopifyId.replace(/^#/, "");
      const oIdClean = oId.replace(/^ord_/, "");
      const awb = (o.shiprocket_awb || "").toLowerCase();
      const email = (o.guest_email || "").toLowerCase();
      const phoneDigits = (o.customer_phone || "").replace(/\D/g, "");

      if (oId === qLower || oIdClean === cleanNoOrd || oIdClean === cleanNoHash) return true;
      if (qLower.length >= 6 && (oId.includes(qLower) || oIdClean.includes(cleanNoOrd))) return true;
      if (shopifyId === qLower || shopifyClean === cleanNoHash || shopifyClean === cleanNoOrd) return true;
      if (awb && (awb === qLower || awb.includes(qLower) || (digitsOnly.length >= 5 && awb.includes(digitsOnly)))) return true;
      if (email && email === qLower) return true;
      if (digitsOnly.length >= 7 && phoneDigits.includes(digitsOnly)) return true;

      return false;
    });

    let liveTracking: any = null;

    if (matchedErp.length > 0) {
      const target = matchedErp[0];
      const awb = (target.shiprocket_awb || (target as any).tracking_number || "").trim();
      if (awb) {
        try {
          const { getShiprocketLiveTracking } = await import("@/lib/shiprocketService");
          liveTracking = await getShiprocketLiveTracking(awb);
          if (liveTracking?.success) {
            let hasChanged = false;
            const updates: Partial<ERPOrder> = {};
            if (liveTracking.delivery_status && liveTracking.delivery_status !== target.delivery_status) {
              target.delivery_status = liveTracking.delivery_status;
              updates.delivery_status = liveTracking.delivery_status;
              hasChanged = true;
            }
            if (liveTracking.courier_name && liveTracking.courier_name !== target.courier_partner) {
              target.courier_partner = liveTracking.courier_name;
              updates.courier_partner = liveTracking.courier_name;
              hasChanged = true;
            }
            if (hasChanged) {
              try {
                const { updateERPOrder } = await import("@/lib/erpStore");
                await updateERPOrder(target.id, updates);
              } catch (saveErr) {
                console.warn("Could not persist tracking update:", saveErr);
              }
            }
          }
        } catch (e) {
          console.warn("Live track fetch error:", e);
        }
      }

      return NextResponse.json(
        {
          success: true,
          source: "erp",
          order: target,
          orders: matchedErp,
          live_tracking: liveTracking,
          checked_at: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        }
      );
    }

    // 2. Check Storefront Orders Fallback
    const storefrontOrders = getOrders();
    const matchedStorefront = storefrontOrders.filter((o) => {
      const oId = (o.id || "").toLowerCase();
      const oIdClean = oId.replace(/^ord_/, "");
      const email = (o.customer_email || "").toLowerCase();
      const phoneDigits = (o.customer_phone || "").replace(/\D/g, "");

      if (oId === qLower || oIdClean === cleanNoOrd || oIdClean === cleanNoHash) return true;
      if (qLower.length >= 6 && (oId.includes(qLower) || oIdClean.includes(cleanNoOrd))) return true;
      if (email && email === qLower) return true;
      if (digitsOnly.length >= 7 && phoneDigits.includes(digitsOnly)) return true;

      return false;
    });

    if (matchedStorefront.length > 0) {
      // Map to consistent structure
      const mappedOrders: ERPOrder[] = matchedStorefront.map((so) => ({
        id: so.id,
        shopify_order_id: `#${so.id.slice(-4).toUpperCase()}`,
        customer_name: so.customer_name,
        customer_phone: so.customer_phone || "+91 98000 00000",
        guest_email: so.customer_email,
        total_amount: so.total_amount,
        product_cost: Math.round(so.total_amount * 0.45),
        shipping_cost: 80,
        rto_shipping_charge: 0,
        ad_spend_attributed: 120,
        net_profit: Math.round(so.total_amount * 0.35),
        status: so.order_status === "delivered" ? "Delivered" : so.order_status === "shipped" ? "In Transit" : "Processing",
        payment_method: so.payment_method === "Credit Card" ? "Prepaid" : so.payment_method,
        payment_status: so.payment_status === "paid" ? "Completed" : "Pending",
        shipping_address: `${so.shipping_address}, ${so.city} ${so.postal_code}`,
        shiprocket_awb: (so as any).shiprocket_awb || `SR-AWB-${Math.abs(so.id.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString().slice(0, 7)}`,
        courier_partner: (so as any).courier_partner || "Delhivery",
        delivery_status:
          so.order_status === "delivered"
            ? "Delivered"
            : so.order_status === "shipped"
            ? "In Transit"
            : "Processing",
        ndr_status: "None",
        rto_status: "None",
        remittance_status: so.payment_status === "paid" ? "Settled" : "Pending",
        created_at: so.created_at,
        items: so.items.map((it) => ({
          product_name: it.name,
          quantity: it.quantity,
          unit_price: it.price,
          product_id: it.product_id,
          image: it.image,
        })),
      }));

      const target = mappedOrders[0];
      const awb = (target.shiprocket_awb || (target as any).tracking_number || "").trim();
      if (awb) {
        try {
          const { getShiprocketLiveTracking } = await import("@/lib/shiprocketService");
          liveTracking = await getShiprocketLiveTracking(awb);
          if (liveTracking?.success) {
            if (liveTracking.delivery_status) target.delivery_status = liveTracking.delivery_status;
            if (liveTracking.courier_name) target.courier_partner = liveTracking.courier_name;
          }
        } catch (e) {
          console.warn("Live track fetch error on storefront order:", e);
        }
      }

      return NextResponse.json({
        success: true,
        source: "storefront",
        order: target,
        orders: mappedOrders,
        live_tracking: liveTracking,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `No order found matching "${query}". Please verify your Order ID (e.g. #TJ-1001), AWB, or 10-digit mobile number.`,
        suggestions: [
          "Check the order confirmation SMS or email sent at the time of purchase.",
          "Ensure you entered the 10-digit mobile number used during checkout.",
          "Newly placed orders may take up to 10-15 minutes to reflect in courier tracking systems.",
        ],
        support_whatsapp: `https://wa.me/916238165935?text=${encodeURIComponent(
          `Hi Turkiye Jam, I need help tracking my order with query "${query}".`
        )}`,
        support_phone: "+91 62381 65935",
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to look up tracking details" },
      { status: 500 }
    );
  }
}
