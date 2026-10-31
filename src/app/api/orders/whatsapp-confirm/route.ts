import { NextRequest, NextResponse } from "next/server";
import { confirmWhatsAppOrder, getStorefrontOrderById, getOrderByToken } from "@/lib/orderStore";
import { getOrderById } from "@/lib/erpStore";
import { sendOrderConfirmationWhatsApp, sendPrepaidOrderConfirmedWhatsApp } from "@/lib/whatsappOrderConfirmation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get("token") || "";
    const token = rawToken.startsWith("token=") ? rawToken.replace(/^token=/, "") : rawToken;
    const rawOrderId = searchParams.get("orderId") || "";
    const orderId = rawOrderId.startsWith("orderId=") ? rawOrderId.replace(/^orderId=/, "") : rawOrderId;

    if (!token && !orderId) {
      return NextResponse.redirect(new URL("/orders?error=missing_credentials", req.url));
    }

    // 1. Verify and confirm the order
    const result = await confirmWhatsAppOrder(token, orderId);

    // 2. Resolve order record from all available sources (result, D1 by ID, D1 by Token)
    let ord: any = result.order;
    const resolvedOrderId = orderId || ord?.id || "";

    if (!ord && resolvedOrderId) {
      ord = await getOrderById(resolvedOrderId);
    }
    if (!ord && token) {
      ord = await getOrderByToken(token);
    }

    // 3. Dispatch the official order confirmation WhatsApp message
    if (ord && ord.customer_phone) {
      try {
        const isCod =
          (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
          (ord.payment_method || "").toUpperCase() === "COD";

        // For prepaid orders the payment_successful template was already sent at checkout.
        // Send the dedicated prepaid-confirmed template instead (no duplicate).
        // For COD orders, send the COD switch-to-prepaid confirmation template.
        if (!isCod) {
          // PREPAID path — use zupe_order_confirmed_prepaid (or text fallback)
          const displayOrderId = ord.shopify_order_id || (ord as any).shopify_order_id || ord.id || resolvedOrderId;
          const waSent = await sendPrepaidOrderConfirmedWhatsApp({
            customerName: ord.customer_name || "Valued Customer",
            customerPhone: ord.customer_phone || "",
            orderId: displayOrderId,
            totalAmount: Number(ord.total_amount) || 0,
          });
          if (waSent) {
            try {
              const { executeD1Query } = await import("@/lib/d1");
              await executeD1Query(
                "UPDATE orders SET whatsapp_confirmation_sent = 1 WHERE id = ? OR shopify_order_id = ?",
                [ord.id || resolvedOrderId, displayOrderId]
              );
            } catch (d1Err) {
              console.warn("Failed to mark whatsapp_confirmation_sent in D1:", d1Err);
            }
          }
        } else {
          // COD path — existing behavior
          let rawItems: any[] = [];
          if (Array.isArray(ord.items)) rawItems = ord.items;
          else if (typeof ord.items === "string") {
            try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
          }

          const displayOrderId = ord.shopify_order_id || (ord as any).shopify_order_id || ord.id || resolvedOrderId;

          const waSent = await sendOrderConfirmationWhatsApp({
            customerName: ord.customer_name || "Valued Customer",
            customerPhone: ord.customer_phone || "",
            orderId: displayOrderId,
            totalAmount: Number(ord.total_amount) || 0,
            paymentMethod: "cod",
            trackingId: ord.tracking_number || ord.shiprocket_awb || (ord as any).tracking_number,
            courierPartner: ord.courier_partner || (ord as any).courier_partner,
            items: rawItems.map((it: any) => ({
              name: it.product_name || it.name || "Purchased Product",
              quantity: Number(it.quantity || 1),
              price: Number(it.unit_price || it.price || 0),
            })),
          });

          if (waSent) {
            try {
              const { executeD1Query } = await import("@/lib/d1");
              await executeD1Query(
                "UPDATE orders SET whatsapp_confirmation_sent = 1 WHERE id = ? OR shopify_order_id = ?",
                [ord.id || resolvedOrderId, displayOrderId]
              );
            } catch (d1Err) {
              console.warn("Failed to mark whatsapp_confirmation_sent in D1:", d1Err);
            }
          }
        }
      } catch (notifyErr) {
        console.warn("Failed to dispatch WhatsApp order confirmation on verify:", notifyErr);
      }

      // 3b. Dispatch Order Confirmation Email if optional email was provided and not yet sent
      const customerEmail = (ord.guest_email || ord.customer_email || "").trim();
      if (
        customerEmail &&
        customerEmail.includes("@") &&
        !customerEmail.endsWith("@customer.zupestore.com") &&
        !ord.confirmation_email_sent
      ) {
        try {
          const { sendOrderConfirmationEmail } = await import("@/lib/orderEmailService");
          const { markOrderEmailSent } = await import("@/lib/orderStore");
          const isCod =
            (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
            (ord.payment_method || "").toUpperCase() === "COD";

          let rawItems: any[] = [];
          if (Array.isArray(ord.items)) rawItems = ord.items;
          else if (typeof ord.items === "string") {
            try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
          }

          const displayOrderId = ord.shopify_order_id || (ord as any).shopify_order_id || ord.id || resolvedOrderId;

          const emailRes = await sendOrderConfirmationEmail({
            orderId: displayOrderId,
            customerName: ord.customer_name || "Valued Customer",
            customerEmail,
            customerPhone: ord.customer_phone,
            shippingAddress: ord.shipping_address || "",
            city: ord.city,
            postalCode: ord.postal_code,
            totalAmount: Number(ord.total_amount) || 0,
            paymentMethod: ord.payment_method || (isCod ? "Cash on Delivery" : "Prepaid"),
            paymentStatus: ord.payment_status || "pending",
            items: rawItems.map((it: any) => ({
              name: it.product_name || it.name || "Purchased Product",
              quantity: Number(it.quantity || 1),
              price: Number(it.unit_price || it.price || 0),
              image: it.image || it.poster_image,
            })),
            createdAt: ord.created_at,
          });
          if (emailRes.success && !emailRes.skipped) {
            await markOrderEmailSent(ord.id || resolvedOrderId);
          }
        } catch (emailErr) {
          console.warn("Failed to dispatch email confirmation on WA verify:", emailErr);
        }
      }
    }

    if (!result.success && !result.alreadyUsed) {
      return NextResponse.redirect(
        new URL(`/orders?error=verification_failed&orderId=${encodeURIComponent(orderId)}`, req.url)
      );
    }

    const targetOrderId = resolvedOrderId || (ord?.shopify_order_id || (ord as any)?.shopify_order_id || "").replace(/^#/, "");
    return NextResponse.redirect(
      new URL(`/orders?confirmed=${encodeURIComponent(targetOrderId)}`, req.url)
    );
  } catch (err: any) {
    console.error("WhatsApp confirm route error:", err);
    return NextResponse.redirect(new URL("/orders?error=internal_error", req.url));
  }
}
