import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { createPyDartPaymentOrder, getPyDartPayConfig } from "@/lib/pydartPay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Defense-in-depth Admin authentication check
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(adminToken);
    if (!adminSession.valid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }

    const { apiKey } = await getPyDartPayConfig();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "PYDART_API_KEY is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      customerName = "Customer",
      customerPhone = "",
      customerEmail = "support@turkiyejam.com",
      title = "Turkiye Jam Herbal Paste",
      itemAmount = 899,
      deliveryCharge = 49,
      totalAmount,
      shippingAddress = "",
      redirectUrl = "https://turkiyejam.com/orders",
    } = body || {};

    const resolvedAmount =
      typeof totalAmount === "number" && totalAmount > 0
        ? Math.round(totalAmount)
        : Math.round((Number(itemAmount) || 0) + (Number(deliveryCharge) || 0));

    if (!Number.isFinite(resolvedAmount) || resolvedAmount < 2 || resolvedAmount > 500000) {
      return NextResponse.json(
        { success: false, error: "Total amount must be between ₹2 and ₹5,00,000" },
        { status: 400 }
      );
    }

    const cleanPhone = String(customerPhone || "").replace(/\D/g, "").slice(-10) || "9876543210";
    const merchantOrderId = `adm_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 6)}`;

    const pydartOrder = await createPyDartPaymentOrder({
      merchantOrderId,
      amountRupees: resolvedAmount,
      orderPurpose: `${String(title).trim()}${Number(deliveryCharge) > 0 ? ` + Delivery (₹${deliveryCharge})` : ""}`,
      customerName: String(customerName).trim() || "Customer",
      customerMobile: cleanPhone,
      customerEmail: String(customerEmail).trim() || "support@turkiyejam.com",
      redirectUrl: String(redirectUrl || "https://turkiyejam.com/orders"),
      orderTags: {
        source: "admin_payment_link",
        store: "turkiyejam",
      },
    });

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://turkiyejam.com").replace(/\/+$/, "");
    const firstPartyPayUrl = `${siteUrl}/pay/${encodeURIComponent(pydartOrder.pydartOrderId)}`;

    return NextResponse.json({
      success: true,
      invoiceId: pydartOrder.pydartOrderId,
      invoiceNumber: pydartOrder.shortCode || pydartOrder.pydartOrderId,
      payUrl: firstPartyPayUrl,
      shortLink: firstPartyPayUrl,
      pydartHostedUrl: pydartOrder.paymentLink,
      amountRupees: resolvedAmount,
      customerName: String(customerName).trim(),
      customerPhone: cleanPhone,
      shippingAddress: String(shippingAddress || "").trim(),
    });
  } catch (err: any) {
    console.error("PyDart Pay admin payment link creation error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
