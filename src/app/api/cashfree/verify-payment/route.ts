import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreePayment } from "@/lib/cashfree";
import {
  verifyPyDartOrderByMerchantId,
  verifyPyDartPaymentOrder,
} from "@/lib/pydartPay";
import {
  confirmVerifiedOrderPayment,
  parseStoredItems,
} from "@/lib/pydartOrderConfirmation";
import { getOrderById } from "@/lib/erpStore";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId =
      url.searchParams.get("orderId") ||
      url.searchParams.get("order_id") ||
      url.searchParams.get("cf_order_id");
    const pydartOrderId =
      url.searchParams.get("pydart_order_id") ||
      url.searchParams.get("pydartOrderId") ||
      undefined;
    const cashfreeOrderId =
      url.searchParams.get("cf_order_id") ||
      url.searchParams.get("cashfreeOrderId") ||
      undefined;

    if (!orderId && !pydartOrderId && !cashfreeOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    return POST(
      new NextRequest(req.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId || cashfreeOrderId || pydartOrderId,
          pydartOrderId,
          cashfreeOrderId,
        }),
      })
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, cashfreeOrderId, pydartOrderId, invoiceId, settlerInvoiceId } = body || {};

    const primaryLookupId = String(orderId || cashfreeOrderId || "").trim();
    if (!primaryLookupId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId" },
        { status: 400 }
      );
    }

    // 1. Fetch EXACT order by ID (never fall back to arbitrary latest pending order)
    let order: any = await getOrderById(primaryLookupId);
    if (!order) {
      const rows = await executeD1Query<any>(
        `SELECT id, shopify_order_id, razorpay_order_id, razorpay_payment_id, user_id, guest_email,
                customer_name, customer_phone, total_amount, discount_amount, advance_paid, balance_due,
                is_cod_partial, payment_method, payment_status, whatsapp_confirm_status,
                shipping_address, city, postal_code, items, created_at
         FROM orders
         WHERE id = ? OR shopify_order_id = ? OR razorpay_order_id = ?
         LIMIT 1`,
        [primaryLookupId, primaryLookupId, primaryLookupId]
      );
      if (rows && rows.length > 0) {
        order = rows[0];
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
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

    if (!Number.isFinite(expectedChargeRupees) || expectedChargeRupees <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid stored order amount" },
        { status: 400 }
      );
    }

    // 2. Idempotent Fast-Path if webhook already confirmed this order before browser returned
    const storedPayStatus = String(order.payment_status || "").toLowerCase();
    const storedWaStatus = String(order.whatsapp_confirm_status || "").toLowerCase();
    const storedAdvance = Number(order.advance_paid || 0);
    const alreadyConfirmed =
      storedPayStatus === "completed" ||
      storedPayStatus === "paid" ||
      storedWaStatus === "confirmed" ||
      (isCodOrder && storedAdvance + 0.01 >= expectedChargeRupees);

    if (alreadyConfirmed) {
      const rawItems = parseStoredItems(order.items);
      const effectiveAdvance = isCodOrder ? storedAdvance || expectedChargeRupees : orderTotal;
      const effectiveBalance = isCodOrder ? Math.max(0, orderTotal - effectiveAdvance) : 0;

      return NextResponse.json({
        success: true,
        paid: true,
        orderStatus: "PAID",
        orderId: effectiveOrderId,
        shopifyOrderId: order.shopify_order_id || null,
        customerName: order.customer_name || "Valued Customer",
        customerPhone: order.customer_phone || "",
        items: rawItems,
        order: {
          id: effectiveOrderId,
          items: rawItems,
          shipping_address: order.shipping_address || "",
          city: order.city || "",
          postal_code: order.postal_code || "",
          customer_name: order.customer_name || "",
          customer_email: order.guest_email || order.customer_email || "",
        },
        paymentId: order.razorpay_payment_id || `pyd_${effectiveOrderId}`,
        isCodPartial: isCodOrder,
        advancePaid: effectiveAdvance,
        balanceDue: effectiveBalance,
        totalAmount: orderTotal,
        amount: effectiveAdvance,
        message: "Order payment already verified and confirmed.",
      });
    }

    // 3. Authoritative S2S Verification (never trusts client-supplied `paid: true` flags!)
    let isPaid = false;
    let gatewayLabel: "PyDart Pay" | "Cashfree" = "PyDart Pay";
    let verifiedAmountRupees = 0;
    let paymentId = "";
    let observedStatus = "PENDING";
    let observedFailureMessage: string | undefined;

    // 3a. Primary Verification: PyDart Pay S2S (`GET /api/v1/payment-order/:id`)
    const boundPyDartId = String(
      order.razorpay_order_id || pydartOrderId || settlerInvoiceId || invoiceId || ""
    ).trim();

    const pydartResult = boundPyDartId
      ? await verifyPyDartPaymentOrder(boundPyDartId)
      : await verifyPyDartOrderByMerchantId(effectiveOrderId);

    if (pydartResult) {
      const matchesOrder =
        pydartResult.merchantOrderId === effectiveOrderId ||
        (boundPyDartId && pydartResult.pydartOrderId === boundPyDartId);

      if (
        pydartResult.paid &&
        matchesOrder &&
        pydartResult.amountRupees + 0.01 >= expectedChargeRupees
      ) {
        isPaid = true;
        gatewayLabel = "PyDart Pay";
        verifiedAmountRupees = pydartResult.amountRupees;
        paymentId = pydartResult.paymentId || `pyd_${pydartResult.pydartOrderId || effectiveOrderId}`;
      } else {
        observedStatus = pydartResult.orderStatus || "PENDING";
        observedFailureMessage = pydartResult.failureMessage;
      }
    }

    // 3b. Fallback Verification: Direct Cashfree PG (for legacy orders created via Cashfree)
    if (!isPaid) {
      try {
        const cfResult = await verifyCashfreePayment(effectiveOrderId);
        if (cfResult && cfResult.paid && Number(cfResult.amount || 0) + 0.01 >= expectedChargeRupees) {
          isPaid = true;
          gatewayLabel = "Cashfree";
          verifiedAmountRupees = Number(cfResult.amount || expectedChargeRupees);
          paymentId = cfResult.paymentId || `cf_${effectiveOrderId}`;
        }
      } catch {
        // Cashfree check skipped when order belongs to PyDart Pay
      }
    }

    if (!isPaid || !paymentId) {
      return NextResponse.json({
        success: false,
        paid: false,
        orderStatus: observedStatus || "PENDING",
        failureMessage: observedFailureMessage,
        message:
          observedFailureMessage ||
          "Payment is not yet confirmed by PyDart Pay gateway",
      });
    }

    // 4. Atomic Idempotent Confirmation + Notifications
    const confirmation = await confirmVerifiedOrderPayment({
      order,
      effectiveOrderId,
      isCodOrder,
      orderTotal,
      verifiedAmountRupees,
      paymentId,
      gatewayLabel,
    });

    if (!confirmation.accepted) {
      return NextResponse.json(
        { success: false, error: "Duplicate or replayed payment reference rejected." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      paid: true,
      orderStatus: "PAID",
      orderId: effectiveOrderId,
      shopifyOrderId: order.shopify_order_id || null,
      customerName: confirmation.customerName,
      customerPhone: confirmation.customerPhone,
      items: confirmation.rawItems,
      order: {
        id: effectiveOrderId,
        items: confirmation.rawItems,
        shipping_address: order.shipping_address || "",
        city: order.city || "",
        postal_code: order.postal_code || "",
        customer_name: confirmation.customerName,
        customer_email: confirmation.customerEmail,
      },
      paymentId,
      isCodPartial: isCodOrder,
      advancePaid: confirmation.advancePaid,
      balanceDue: confirmation.balanceDue,
      totalAmount: orderTotal,
      amount: verifiedAmountRupees,
      message: isCodOrder
        ? "Cash on Delivery courier advance verified and order confirmed successfully"
        : "PyDart Pay payment verified and order confirmed successfully",
    });
  } catch (err: any) {
    console.error("Payment verify-payment error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
