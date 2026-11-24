import { NextRequest, NextResponse } from "next/server";
import { verifyPyDartWebhookSignature } from "@/lib/pydartPay";
import { confirmVerifiedOrderPayment } from "@/lib/pydartOrderConfirmation";
import { getOrderById } from "@/lib/erpStore";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    service: "Turkiye Jam PyDart Pay Webhook Listener",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!rawBody || !rawBody.trim()) {
      return NextResponse.json(
        { success: false, error: "Empty webhook payload" },
        { status: 400 }
      );
    }

    const sigHeader = req.headers.get("x-pydart-signature");
    const tsHeader = req.headers.get("x-pydart-timestamp");
    const eventHeader = (req.headers.get("x-pydart-event") || "").toLowerCase();

    const isValidSig = await verifyPyDartWebhookSignature(rawBody, sigHeader, tsHeader);
    if (!isValidSig) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired PyDart webhook signature" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON webhook body" },
        { status: 400 }
      );
    }

    const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const eventName = String(
      eventHeader || payload?.event || payload?.event_type || ""
    ).toLowerCase();
    const orderStatus = String(
      data?.order_status || data?.payment_status || data?.status || ""
    ).toLowerCase();

    const isPaidEvent =
      eventName === "payment-order.paid" ||
      eventName === "payment.captured" ||
      eventName === "order.paid" ||
      orderStatus === "success" ||
      orderStatus === "paid";

    if (!isPaidEvent) {
      return NextResponse.json({
        status: "OK",
        acknowledged: true,
        ignored: true,
        event: eventName || orderStatus,
      });
    }

    const merchantOrderId = String(data?.merchant_order_id || "").trim();
    const pydartOrderId = String(data?.order_id || "").trim();
    const paidAmountPaise = Number(data?.amount_paise || 0);
    const paidAmountRupees =
      paidAmountPaise > 0
        ? Math.round(paidAmountPaise) / 100
        : Number.parseFloat(String(data?.amount || "0")) || 0;
    const paymentId = String(
      data?.utr ||
        data?.upstream_payment_id ||
        data?.receipt_number ||
        pydartOrderId ||
        ""
    ).trim();

    if (!merchantOrderId && !pydartOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing order identifiers in webhook payload" },
        { status: 400 }
      );
    }

    let order: any = merchantOrderId ? await getOrderById(merchantOrderId) : null;
    if (!order) {
      const rows = await executeD1Query<any>(
        `SELECT id, shopify_order_id, razorpay_order_id, razorpay_payment_id, user_id, guest_email,
                customer_name, customer_phone, total_amount, discount_amount, advance_paid, balance_due,
                is_cod_partial, payment_method, payment_status, whatsapp_confirm_status,
                shipping_address, city, postal_code, items, created_at
         FROM orders
         WHERE id = ? OR (razorpay_order_id IS NOT NULL AND razorpay_order_id = ?)
         LIMIT 1`,
        [merchantOrderId || "__none__", pydartOrderId || "__none__"]
      );
      if (rows && rows.length > 0) {
        order = rows[0];
      }
    }

    if (!order) {
      return NextResponse.json({
        status: "OK",
        acknowledged: true,
        message: "Order not found in storefront database",
      });
    }

    const effectiveOrderId = String(order.id);
    const isCodOrder =
      Boolean(order.is_cod_partial) ||
      String(order.payment_method || "").toLowerCase().includes("cash on delivery") ||
      String(order.payment_method || "").toUpperCase() === "COD";

    let configuredCodFee = 49;
    try {
      const { getSettings } = await import("@/lib/erpStore");
      const st = await getSettings();
      if (st?.storeProfile?.codFee !== undefined) {
        configuredCodFee = Number(st.storeProfile.codFee) || 49;
      }
    } catch {}

    const orderTotal = Number(order.total_amount || 0);
    const expectedChargeRupees = isCodOrder ? configuredCodFee : orderTotal;

    if (
      !Number.isFinite(paidAmountRupees) ||
      paidAmountRupees + 0.01 < expectedChargeRupees
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook payment amount is below authoritative order payable amount",
        },
        { status: 400 }
      );
    }

    const confirmation = await confirmVerifiedOrderPayment({
      order,
      effectiveOrderId,
      isCodOrder,
      orderTotal,
      verifiedAmountRupees: paidAmountRupees,
      paymentId: paymentId || `pyd_${pydartOrderId || effectiveOrderId}`,
      gatewayLabel: "PyDart Pay",
    });

    if (!confirmation.accepted) {
      return NextResponse.json(
        { success: false, error: "Payment reference already bound to another order" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      status: "OK",
      confirmed: true,
      alreadyConfirmed: confirmation.alreadyConfirmed,
      orderId: effectiveOrderId,
    });
  } catch (err: any) {
    console.error("PyDart webhook processing error:", err);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
