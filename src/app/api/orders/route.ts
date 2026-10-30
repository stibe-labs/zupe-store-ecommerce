import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders, updateOrderStatus, OrderRecord, OrderItem } from "@/lib/orderStore";
import { getERPOrders } from "@/lib/erpStore";
import { getAuthenticatedUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedEmail = searchParams.get("email")?.toLowerCase().trim();
    const requestedPhone = searchParams.get("phone")?.replace(/\D/g, "");

    // Authenticate caller (Admin or Customer)
    const auth = await getAuthenticatedUser(req);

    let targetEmail: string | undefined = requestedEmail || undefined;
    let targetPhone: string | undefined = requestedPhone || undefined;
    let targetUserId: string | undefined;

    if (auth.isAdmin) {
      // Admin can view all orders or filter by specific email/phone
      targetEmail = requestedEmail || undefined;
      targetPhone = requestedPhone || undefined;
    } else if (auth.authenticated && auth.user) {
      // Authenticated customer can view their own orders
      targetEmail = auth.user.email || requestedEmail || undefined;
      targetPhone = (auth.user.phone ? auth.user.phone.replace(/\D/g, "") : "") || requestedPhone || undefined;
      targetUserId = auth.user.id;
    } else {
      // Unauthenticated caller must provide an email or phone (e.g. guest order lookup)
      if (!requestedEmail && !requestedPhone) {
        return NextResponse.json(
          { success: false, error: "Authentication or phone/email required to view order history" },
          { status: 401 }
        );
      }
      targetEmail = requestedEmail;
      targetPhone = requestedPhone;
    }

    const storefrontOrders = getOrders(targetEmail, targetPhone, targetUserId);

    let combinedOrders = [...storefrontOrders];

    try {
      const erpOrders = await getERPOrders();

      const matchedErp = erpOrders.filter((o) => {
        if (!targetEmail && !targetPhone && !targetUserId) return true;
        const oEmail = (o.guest_email || (o as any).customer_email || "").toLowerCase().trim();
        const oPhone = (o.customer_phone || "").replace(/\D/g, "");
        const oUserId = (o as any).user_id;

        if (targetUserId && oUserId && oUserId === targetUserId) return true;
        if (targetEmail && oEmail && oEmail === targetEmail) return true;
        if (targetPhone && oPhone) {
          const searchLast10 = targetPhone.slice(-10);
          const orderLast10 = oPhone.slice(-10);
          if (searchLast10 && orderLast10 && searchLast10 === orderLast10) return true;
        }
        return false;
      });

      const erpIds = new Set(matchedErp.map((o) => o.id));

      const mappedErp: OrderRecord[] = matchedErp.map((o) => {
        let rawItems = o.items;
        if (typeof rawItems === "string") {
          try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
        }
        if (!Array.isArray(rawItems)) rawItems = [];

        let items: OrderItem[] = rawItems.map((it: any) => ({
          product_id: it.product_id || it.id || "ripple-lamp",
          name: it.product_name || it.name || "Purchased Product",
          price: Number(it.unit_price || it.price || o.total_amount),
          quantity: Number(it.quantity || 1),
          image: it.image || it.poster_image || "/products/ripple-lamp.jpg",
          bundle_tier: it.bundle_tier,
          bundle_savings: it.bundle_savings,
          bundle_total: it.bundle_total,
          offer_label: it.offer_label,
          original_price: it.original_price,
        }));

        if (items.length === 0) {
          items = [
            {
              product_id: "ripple-lamp",
              name: "Dynamic Water Ripple Night Light",
              price: o.total_amount || 749,
              quantity: 1,
              image: "/products/ripple-lamp.jpg",
            },
          ];
        }

        const isDelivered =
          (o.delivery_status || "").toLowerCase() === "delivered" ||
          (o.status || "").toLowerCase() === "delivered";
        const isShipped =
          ["in transit", "out for delivery", "shipped"].includes((o.delivery_status || "").toLowerCase()) ||
          (o.status || "").toLowerCase() === "shipped";

        const isPaid =
          o.payment_status === "Completed" ||
          o.payment_status === "Settled" ||
          o.payment_status === "paid" ||
          o.payment_method === "Prepaid";

        const isCod =
          !isPaid &&
          ((o.payment_method || "").toLowerCase().includes("cash on delivery") ||
           (o.payment_method || "").toUpperCase() === "COD");

        const productSubtotal = items.reduce(
          (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
          0
        );

        let finalTotal = Number(o.total_amount) || 0;
        if (isCod) {
          // Cash on Delivery orders show product amount + 49 as shown in checkout order summary
          if (productSubtotal > 0 && finalTotal <= productSubtotal) {
            finalTotal = productSubtotal + 49;
          } else if (finalTotal <= 0 && productSubtotal > 0) {
            finalTotal = productSubtotal + 49;
          }
        }

        return {
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.guest_email || "",
          customer_phone: o.customer_phone,
          total_amount: finalTotal,
          discount_amount: (o as any).discount_amount || 0,
          shipping_address: o.shipping_address,
          city: "",
          postal_code: "",
          payment_method: o.payment_method || (isPaid ? "Prepaid" : "Cash on Delivery"),
          payment_status: (() => {
            const rawStatus = (o.payment_status || "").toLowerCase();
            if (rawStatus === "refunded") return "refunded";
            if (rawStatus.includes("reject")) return "refund_rejected";
            if (rawStatus.includes("refund_pending") || rawStatus === "refund pending" || (rawStatus.includes("pending") && ((o.delivery_status || "").toLowerCase() === "cancelled" || (o.status || "").toLowerCase() === "cancelled"))) {
              return "refund_pending";
            }
            return isPaid ? "paid" : "pending";
          })(),
          order_status: (o.delivery_status === "Cancelled" || o.status === "Cancelled" || (o.whatsapp_confirm_status || "").toLowerCase() === "cancelled")
            ? "cancelled"
            : isDelivered
            ? "delivered"
            : isShipped
            ? "shipped"
            : "processing",
          whatsapp_confirm_status: (o.whatsapp_confirm_status as any) || "pending_whatsapp",
          items,
          created_at: o.created_at,
        };
      });

      const memoryRemaining = storefrontOrders
        .filter((so) => !erpIds.has(so.id))
        .map((so) => {
          const isPaid =
            so.payment_status === "paid" ||
            (so.payment_method && so.payment_method.toLowerCase().includes("prepaid"));
          const isCod =
            !isPaid &&
            ((so.payment_method || "").toLowerCase().includes("cash on delivery") ||
             (so.payment_method || "").toUpperCase() === "COD");
          const pSubtotal = (so.items || []).reduce(
            (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
            0
          );
          let finalTotal = Number(so.total_amount) || 0;
          if (isCod && pSubtotal > 0 && finalTotal <= pSubtotal) {
            finalTotal = pSubtotal + 49;
          }
          return {
            ...so,
            total_amount: finalTotal,
            payment_status: (so.payment_status as any) === "refunded" ? ("refunded" as const) : isPaid ? ("paid" as const) : ("pending" as const),
          };
        });

      combinedOrders = [...mappedErp, ...memoryRemaining];
    } catch (e) {
      console.warn("Failed to merge ERP orders in /api/orders GET:", e);
    }

    combinedOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, orders: combinedOrders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      postal_code,
      total_amount,
      discount_amount,
      payment_method,
      items,
      user_id,
    } = body;

    if (!customer_name || !shipping_address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order information" },
        { status: 400 }
      );
    }

    // 1. Authoritative Stock Verification: strictly block out-of-stock purchases
    const { validateOrderStock } = await import("@/lib/inventoryService");
    const stockValidation = await validateOrderStock(items);
    if (!stockValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: stockValidation.error || "One or more items in your cart are currently out of stock.",
          outOfStockItems: stockValidation.outOfStockItems,
        },
        { status: 400 }
      );
    }

    const cleanPhone = (customer_phone || "").replace(/\D/g, "");
    const effectiveUserId = user_id || (cleanPhone ? `guest_${cleanPhone}` : `guest_${Date.now()}`);

    // Auto-provision guest user in D1 if not existing
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(
        `INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
        [effectiveUserId, customer_name, customer_email ? customer_email.trim() : null, "guest_verified_checkout", customer_phone || null]
      );
    } catch (guestErr) {
      // Non-fatal
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const confirmToken = `tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const isCod =
      (payment_method || "").toLowerCase().includes("cash on delivery") ||
      (payment_method || "").toLowerCase() === "cod";

    const newOrder: OrderRecord = {
      id: orderId,
      user_id: effectiveUserId,
      customer_name,
      customer_email: customer_email ? customer_email.trim() : "",
      customer_phone: customer_phone || "",
      shipping_address,
      city: city || "",
      postal_code: postal_code || "",
      total_amount: Number(total_amount),
      discount_amount: Number(discount_amount || 0),
      payment_method: payment_method || (isCod ? "Cash on Delivery" : "Prepaid"),
      payment_status: isCod ? "pending" : "paid",
      order_status: "processing",
      whatsapp_confirm_status: "pending_whatsapp",
      whatsapp_confirm_token: confirmToken,
      whatsapp_token_used: false,
      items,
      created_at: new Date().toISOString(),
    };

    await createOrder(newOrder);

    // Automatically sync delivery address and phone to customer profile
    try {
      const { syncAddressFromOrder } = await import("@/lib/addressStore");
      await syncAddressFromOrder({
        customer_name,
        customer_email: customer_email ? customer_email.trim() : "",
        customer_phone,
        shipping_address,
        city,
        postal_code,
        user_id: effectiveUserId,
      });
    } catch (syncErr) {
      console.warn("Auto-sync address from order failed:", syncErr);
    }

    // Mark any existing abandoned checkouts for this customer phone as recovered
    try {
      const { executeD1Query } = await import("@/lib/d1");
      const normDigits = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      await executeD1Query(
        `UPDATE abandoned_checkouts
         SET status = 'recovered', recovered_order_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE (customer_phone = ? OR customer_phone = ?) AND status = 'abandoned'`,
        [orderId, normDigits, cleanPhone]
      );
    } catch (recErr) {
      console.warn("Error marking abandoned checkout as recovered:", recErr);
    }

    // Send WhatsApp interactive pre-confirmation (Confirm/Cancel buttons)
    try {
      const { sendOrderPreConfirmationWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
      const waSent = await sendOrderPreConfirmationWhatsApp({
        customerName: customer_name,
        customerPhone: customer_phone || "",
        orderId: (newOrder as any).shopify_order_id || orderId,
        totalAmount: Number(total_amount),
        paymentMethod: isCod ? "cod" : "prepaid",
        token: confirmToken,
        items: (items || []).map((it: any) => ({
          name: it.name,
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0),
        })),
      });
      console.log(`[Orders Route] WhatsApp pre-confirmation dispatched for ${orderId}: ${waSent}`);
    } catch (waErr) {
      console.warn("Failed to dispatch WA order pre-confirmation:", waErr);
    }

    // Automated Order Confirmation Email (Dispatched ONLY if customer provided optional email at checkout)
    const normEmail = (customer_email || "").trim();
    if (normEmail && normEmail.includes("@") && !normEmail.endsWith("@customer.zupestore.com")) {
      try {
        const { sendOrderConfirmationEmail } = await import("@/lib/orderEmailService");
        const { markOrderEmailSent } = await import("@/lib/orderStore");
        const emailRes = await sendOrderConfirmationEmail({
          orderId,
          customerName: customer_name,
          customerEmail: normEmail,
          customerPhone: customer_phone || "",
          shippingAddress: shipping_address || "",
          city: city || "",
          postalCode: postal_code || "",
          totalAmount: Number(total_amount),
          discountAmount: Number(discount_amount || 0),
          paymentMethod: payment_method || (isCod ? "Cash on Delivery" : "Prepaid"),
          paymentStatus: isCod ? "pending" : "paid",
          items: items || [],
          createdAt: newOrder.created_at,
        });
        if (emailRes.success && !emailRes.skipped) {
          await markOrderEmailSent(orderId);
        }
      } catch (emailErr) {
        console.warn("[Orders Route] Failed to send order confirmation email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, order: newOrder });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required to update order status." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { order_id, order_status } = body;

    if (!order_id || !order_status) {
      return NextResponse.json({ success: false, error: "Missing order_id or order_status" }, { status: 400 });
    }

    const updated = await updateOrderStatus(order_id, order_status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
