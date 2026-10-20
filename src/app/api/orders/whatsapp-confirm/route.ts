import { NextRequest, NextResponse } from "next/server";
import { confirmWhatsAppOrder, getStorefrontOrderById, getOrderByToken } from "@/lib/orderStore";
import { getOrderById } from "@/lib/erpStore";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsappOrderConfirmation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const orderId = searchParams.get("orderId") || "";

    if (!token && !orderId) {
      return NextResponse.redirect(new URL("/orders?error=missing_credentials", req.url));
    }

    // 1. Verify and confirm the order
    const result = await confirmWhatsAppOrder(token, orderId);

    if (result.alreadyUsed) {
      return NextResponse.redirect(
        new URL(`/orders?notice=already_processed&orderId=${encodeURIComponent(orderId)}`, req.url)
      );
    }

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/orders?error=verification_failed&orderId=${encodeURIComponent(orderId)}`, req.url)
      );
    }

    // 2. Fetch order details to send the authoritative tailored confirmation message (COD vs Prepaid)
    try {
      const ord =
        result.order ||
        getStorefrontOrderById(orderId) ||
        getOrderByToken(token) ||
        (await getOrderById(orderId));

      if (ord) {
        const isCod =
          (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
          (ord.payment_method || "").toUpperCase() === "COD";

        let rawItems: any[] = [];
        if (Array.isArray(ord.items)) rawItems = ord.items;
        else if (typeof ord.items === "string") {
          try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
        }

        await sendOrderConfirmationWhatsApp({
          customerName: ord.customer_name || "Valued Customer",
          customerPhone: ord.customer_phone || "",
          orderId: (ord as any).shopify_order_id || ord.id,
          totalAmount: Number(ord.total_amount) || 0,
          paymentMethod: isCod ? "cod" : "prepaid",
          items: rawItems.map((it: any) => ({
            name: it.product_name || it.name || "Purchased Product",
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_price || it.price || 0),
          })),
        }).catch((err) => console.warn("WhatsApp post-confirmation dispatch error:", err));
      }
    } catch (msgErr) {
      console.warn("Post-confirm WhatsApp dispatch error:", msgErr);
    }

    // 3. Redirect customer to My Orders page with celebratory confirmed state
    return NextResponse.redirect(
      new URL(`/orders?confirmed=${encodeURIComponent(orderId)}`, req.url)
    );
  } catch (err: any) {
    console.error("WhatsApp confirm route error:", err);
    return NextResponse.redirect(new URL("/orders?error=internal_error", req.url));
  }
}
