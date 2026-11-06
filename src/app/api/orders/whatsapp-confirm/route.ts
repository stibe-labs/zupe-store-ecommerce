import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { confirmWhatsAppOrder, getStorefrontOrderById, getOrderByToken } from "@/lib/orderStore";
import { getOrderById } from "@/lib/erpStore";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsappOrderConfirmation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    if (host.includes("workers.dev")) {
      const canonicalUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://turkiyejam.com");
      return NextResponse.redirect(canonicalUrl, 301);
    }
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

    // 3. Dispatch the official order confirmation WhatsApp message (only if freshly confirmed, not duplicate)
    if (ord && ord.customer_phone && !result.alreadyUsed) {
      try {
        const isCod =
          (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
          (ord.payment_method || "").toUpperCase() === "COD";

        let rawItems: any[] = [];
        if (Array.isArray(ord.items)) rawItems = ord.items;
        else if (typeof ord.items === "string") {
          try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
        }

        if (rawItems.length === 0 && (ord.id || resolvedOrderId)) {
          try {
            const { executeD1Query } = await import("@/lib/d1");
            const oiRows = await executeD1Query<any>(
              `SELECT * FROM order_items WHERE order_id = ?`,
              [ord.id || resolvedOrderId]
            );
            if (oiRows && oiRows.length > 0) {
              rawItems = oiRows.map((it: any) => ({
                name: it.product_name || "Turkiye Jam",
                product_name: it.product_name || "Turkiye Jam",
                quantity: Number(it.quantity || 1),
                unit_price: Number(it.unit_price || it.total_price || 0),
                price: Number(it.unit_price || it.total_price || 0),
              }));
            }
          } catch (oiErr) {
            console.warn("Failed to fetch order_items in whatsapp-confirm route:", oiErr);
          }
        }

        if (rawItems.length === 0) {
          rawItems = [{
            name: "Turkiye Jam (3 Sachet Pack)",
            product_name: "Turkiye Jam (3 Sachet Pack)",
            quantity: 1,
            unit_price: Number(ord.total_amount) || 1099,
            price: Number(ord.total_amount) || 1099,
          }];
        }

        const displayOrderId = ord.shopify_order_id || (ord as any).shopify_order_id || ord.id || resolvedOrderId;

        await sendOrderConfirmationWhatsApp({
          customerName: ord.customer_name || "Valued Customer",
          customerPhone: ord.customer_phone || "",
          orderId: displayOrderId,
          totalAmount: Number(ord.total_amount) || 0,
          paymentMethod: isCod ? "cod" : "prepaid",
          items: rawItems.map((it: any) => ({
            name: it.product_name || it.name || "Turkiye Jam",
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_price || it.price || 0),
          })),
        });
      } catch (notifyErr) {
        console.warn("Failed to dispatch WhatsApp order confirmation on verify:", notifyErr);
      }

      // 3b. Dispatch Order Confirmation Email if optional email was provided and not yet sent
      const customerEmail = (ord.guest_email || ord.customer_email || "").trim();
      if (
        customerEmail &&
        !siteConfig.isSyntheticEmail(customerEmail) &&
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

    // 3. Render clean, luxury in-place confirmation screen matching landing page design system
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Order Confirmed — Turkiye Jam</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #fbf7ee;
      background-image: url("data:image/svg+xml,%3Csvg width='48' height='64' viewBox='0 0 48 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='24,6 28,18 24,30 20,18' fill='%23ebdcc7' opacity='0.75'/%3E%3Cpolygon points='0,38 4,50 0,62 -4,50' fill='%23ebdcc7' opacity='0.75'/%3E%3Cpolygon points='48,38 52,50 48,62 44,50' fill='%23ebdcc7' opacity='0.75'/%3E%3C/svg%3E");
      color: #1a1a1a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px);
      border: 1px solid #ebdcc7;
      border-radius: 28px;
      max-width: 460px;
      width: 100%;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 20px 45px -10px rgba(80, 20, 30, 0.08), 0 4px 12px rgba(0,0,0,0.03);
      animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes popIn {
      from { transform: scale(0.94); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .logo-container {
      margin-bottom: 24px;
    }
    .logo-container img {
      height: 38px;
      width: auto;
      object-fit: contain;
    }
    .icon-ring {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #731a26, #48121f);
      border: 2px solid #fed000;
      color: #fed000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 38px;
      box-shadow: 0 10px 25px rgba(115, 26, 38, 0.25);
    }
    .badge-gold {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fed000;
      color: #000000;
      border: 1px solid #e5be00;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
      box-shadow: 0 2px 6px rgba(254, 208, 0, 0.25);
    }
    .order-id {
      display: inline-block;
      background: #fbf7ee;
      color: #731a26;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 10px;
      border: 1px solid #ebdcc7;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 800;
      color: #1a1a1a;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      line-height: 1.25;
    }
    p.desc {
      font-size: 13px;
      color: #57534e;
      line-height: 1.6;
      margin-bottom: 22px;
    }
    .discreet-box {
      background: #fbf7ee;
      border: 1px solid #ebdcc7;
      border-radius: 16px;
      padding: 14px 16px;
      text-align: left;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .discreet-box svg {
      flex-shrink: 0;
      margin-top: 2px;
    }
    .discreet-title {
      font-size: 11px;
      font-weight: 800;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .discreet-pill {
      background: #b9e5e9;
      color: #1a1a1a;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
    }
    .discreet-text {
      font-size: 11px;
      color: #78716c;
      line-height: 1.45;
    }
    .btn-track {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #731a26;
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
      text-decoration: none;
      padding: 15px;
      border-radius: 16px;
      margin-bottom: 12px;
      box-shadow: 0 8px 20px rgba(115, 26, 38, 0.22);
      transition: all 0.2s;
    }
    .btn-track:hover {
      background: #5b1420;
      transform: translateY(-1px);
    }
    .btn-wa {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      background: #ffffff;
      color: #25D366;
      border: 1px solid #e7e5e4;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      padding: 12px;
      border-radius: 14px;
      transition: background 0.15s;
    }
    .btn-wa:hover {
      background: #fbf7ee;
    }
    .footer-note {
      font-size: 11px;
      color: #a8a29e;
      margin-top: 18px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <img src="/turkiye-jam-logo.svg" alt="Turkiye Jam" onerror="this.style.display='none'">
    </div>

    <div class="icon-ring">✓</div>

    <div class="badge-gold">
      <span>★</span> Verified via WhatsApp
    </div>

    <div class="order-id">ORDER #${resolvedOrderId || "CONFIRMED"}</div>

    <h1>Order Confirmed & Packing!</h1>

    <p class="desc">
      Thank you for confirming! Your order has been marked as verified in our fulfillment system. Our logistics team is now preparing your parcel for prompt dispatch.
    </p>

    <div class="discreet-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#731a26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <div>
        <div class="discreet-title">
          <span>100% Discreet Packaging</span>
          <span class="discreet-pill">UNBRANDED BOX</span>
        </div>
        <div class="discreet-text">
          Shipped in plain heavy-duty carton with zero external wellness references. Total privacy guaranteed.
        </div>
      </div>
    </div>

    <a class="btn-track" href="/order-tracking?query=${encodeURIComponent(resolvedOrderId)}">
      <span>Track Order Live ➔</span>
    </a>

    <a class="btn-wa" href="https://wa.me/916238165935">
      <span>💬 Return to WhatsApp Chat</span>
    </a>

    <div class="footer-note">
      © 2026 Turkiye Jam — Authentic Ottoman Epimedium Herbal Macun
    </div>
  </div>
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
