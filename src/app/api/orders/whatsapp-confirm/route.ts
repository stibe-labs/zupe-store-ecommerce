import { NextRequest, NextResponse } from "next/server";
import { confirmWhatsAppOrder, getStorefrontOrderById, getOrderByToken } from "@/lib/orderStore";
import { getOrderById } from "@/lib/erpStore";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsappOrderConfirmation";

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
          paymentMethod: isCod ? "cod" : "prepaid",
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

    const displayCardId = (ord?.shopify_order_id || (ord as any)?.shopify_order_id || resolvedOrderId || "CONFIRMED").replace(/^#/, "");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Order Confirmed — Zupe Store</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 28px;
      max-width: 440px;
      width: 100%;
      padding: 40px 28px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      animation: popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes popIn {
      from { transform: scale(0.92); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .icon-ring {
      width: 76px;
      height: 76px;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid #10b981;
      color: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 38px;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.25);
    }
    .order-id {
      display: inline-block;
      background: #0f172a;
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid #334155;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn-wa {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #25D366;
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      padding: 14px;
      border-radius: 16px;
      margin-bottom: 14px;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn-wa:hover { opacity: 0.92; transform: translateY(-1px); }
    .btn-orders {
      display: inline-block;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      padding: 6px;
      transition: color 0.15s;
    }
    .btn-orders:hover { color: #ffffff; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-ring">✓</div>
    <div class="order-id">ORDER #${displayCardId}</div>
    <h1>Order Confirmed!</h1>
    <div class="badge">
      <span>●</span> Verified & Confirmed via WhatsApp
    </div>
    <p>
      Thank you for confirming! Your order has been verified and updated in our system. Our fulfillment team is now preparing your parcel for prompt dispatch.
    </p>
    <a class="btn-wa" id="wa-btn" href="https://wa.me/919778137954?text=Hi%2C%20I%20have%20confirmed%20my%20order%20%23${displayCardId}">
      <span>💬 Return to WhatsApp</span>
    </a>
    <p id="countdown" style="font-size: 12px; color: #64748b; margin-bottom: 18px;">
      Returning to WhatsApp in <span id="sec">2</span>s...
    </p>
    <a class="btn-orders" href="/orders">
      View in My Orders →
    </a>
  </div>
  <script>
    var timeLeft = 2;
    var timer = setInterval(function() {
      timeLeft--;
      var secEl = document.getElementById("sec");
      if (secEl) secEl.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.location.href = "https://wa.me/919778137954?text=Hi%2C%20I%20have%20confirmed%20my%20order%20%23${displayCardId}";
      }
    }, 1000);
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("WhatsApp confirm route error:", err);
    return NextResponse.redirect(new URL("/orders?error=internal_error", req.url));
  }
}
