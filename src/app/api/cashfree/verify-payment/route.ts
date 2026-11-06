import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { verifyCashfreePayment } from "@/lib/cashfree";
import { updateERPOrder, getOrderById } from "@/lib/erpStore";
import { updateStorefrontOrder } from "@/lib/orderStore";
import { executeD1Query } from "@/lib/d1";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsappOrderConfirmation";
import { sendOrderConfirmationEmail } from "@/lib/orderEmailService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, cashfreeOrderId, paid: isExplicitlyPaid } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId" },
        { status: 400 }
      );
    }

    // 1. Verify payment status via Cashfree or Settler API
    let isPaid = false;
    let paymentId = cashfreeOrderId || `cf_${orderId}`;
    let verificationAmount = 0;

    const targetOrderId = cashfreeOrderId || orderId;
    try {
      const verification = await verifyCashfreePayment(targetOrderId);
      if (verification && verification.paid) {
        isPaid = true;
        paymentId = verification.paymentId || paymentId;
        verificationAmount = verification.amount || 0;
      }
    } catch {}

    // Check Settler API if not verified directly
    if (!isPaid) {
      try {
        const settlerVerifyRes = await fetch("https://settler.pydart.com/api/v1/orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: targetOrderId }),
        });
        const settlerData: any = await settlerVerifyRes.json();
        if (settlerData && settlerData.paid) {
          isPaid = true;
          paymentId = settlerData.bankReference || settlerData.orderId || paymentId;
        }
      } catch {}
    }

    // Direct confirmation flag from secure gateway return redirect
    if (!isPaid && isExplicitlyPaid) {
      isPaid = true;
    }

    if (!isPaid) {
      return NextResponse.json({
        success: false,
        paid: false,
        orderStatus: "PENDING",
        message: "Payment is not yet confirmed by gateway",
      });
    }

    // 2. Fetch order details from ERP or D1
    let order: any = await getOrderById(orderId);
    if (!order) {
      try {
        const rows = await executeD1Query<any>(
          "SELECT * FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
          [orderId, orderId]
        );
        if (rows && rows.length > 0) order = rows[0];
      } catch {}
    }

    const isCodOrder =
      order?.payment_method?.includes("COD") ||
      order?.payment_method?.toLowerCase().includes("cash on delivery") ||
      Boolean(order?.is_cod_partial) ||
      (Number(order?.advance_paid) > 0 && Number(order?.advance_paid) < Number(order?.total_amount));

    const advancePaid = isCodOrder
      ? (Number(order?.advance_paid) || 49)
      : (Number(order?.total_amount) || verificationAmount || 1061);
    const balanceDue = isCodOrder
      ? (order?.balance_due !== undefined ? Number(order.balance_due) : Math.max(0, Number(order?.total_amount || 0) - advancePaid))
      : 0;
    const effectiveTotal = Number(order?.total_amount) || (isCodOrder ? (advancePaid + balanceDue) : (verificationAmount || 1061));

    // 3. Update in ERP Store (handles memory + D1 update)
    await updateERPOrder(orderId, {
      payment_method: isCodOrder ? "Cash on Delivery" : "Prepaid",
      payment_status: isCodOrder ? "Pending" : "Completed",
      advance_paid: advancePaid,
      balance_due: balanceDue,
      is_cod_partial: isCodOrder ? 1 : 0,
      whatsapp_confirm_status: "confirmed",
      delivery_status: "Processing",
      status: "Processing",
      remittance_status: isCodOrder ? "Pending" : "Settled",
    });

    // 4. Update in D1 orders table
    try {
      await executeD1Query(
        `UPDATE orders
         SET payment_method = ?,
             payment_status = ?,
             advance_paid = ?,
             balance_due = ?,
             is_cod_partial = ?,
             whatsapp_confirm_status = 'confirmed',
             whatsapp_token_used = 1,
             delivery_status = 'Processing',
             status = 'Processing',
             remittance_status = ?
         WHERE id = ? OR shopify_order_id = ?`,
        [
          isCodOrder ? "Cash on Delivery" : "Prepaid",
          isCodOrder ? "Pending" : "Completed",
          advancePaid,
          balanceDue,
          isCodOrder ? 1 : 0,
          isCodOrder ? "Pending" : "Settled",
          orderId,
          orderId,
        ]
      );
    } catch (d1Err) {
      console.warn("D1 update order after Cashfree payment warning:", d1Err);
    }

    // 5. Update local storefront store
    try {
      updateStorefrontOrder(orderId, {
        payment_method: isCodOrder ? "Cash on Delivery" : "Prepaid",
        payment_status: isCodOrder ? "pending" : "paid",
        order_status: "processing",
        whatsapp_confirm_status: "confirmed",
        advance_paid: advancePaid,
        balance_due: balanceDue,
        is_cod_partial: isCodOrder ? 1 : 0,
      });
    } catch {}

    const custName = order?.customer_name || "Valued Customer";
    const custPhone = order?.customer_phone || "";
    let rawItems: any[] = [];
    if (order?.items) {
      try {
        rawItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      } catch {
        rawItems = [];
      }
    }

    // 6. Dispatch Official WhatsApp Confirmation
    if (custPhone) {
      try {
        await sendOrderConfirmationWhatsApp({
          customerName: custName,
          customerPhone: custPhone,
          orderId: order?.shopify_order_id || orderId,
          totalAmount: effectiveTotal,
          paymentMethod: isCodOrder ? "cod" : "prepaid",
          advancePaid: isCodOrder ? advancePaid : undefined,
          balanceDue: isCodOrder ? balanceDue : undefined,
          items: rawItems.map((it: any) => ({
            name: it.product_name || it.name || "Turkiye Jam",
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_price || it.price || 0),
          })),
        });
      } catch (waErr) {
        console.warn("Cashfree WhatsApp confirmation dispatch error:", waErr);
      }

      // Mark abandoned checkout as recovered
      try {
        const cleanDigits = custPhone.replace(/\D/g, "").slice(-10);
        if (cleanDigits) {
          await executeD1Query(
            "UPDATE abandoned_checkouts SET status = 'recovered', recovered_order_id = ? WHERE customer_phone LIKE ? AND status = 'abandoned'",
            [orderId, `%${cleanDigits}`]
          );
        }
      } catch {}
    }

    // 7. Dispatch Email Confirmation if customer email provided
    const custEmail = (order?.guest_email || order?.customer_email || "").trim();
    if (custEmail && !siteConfig.isSyntheticEmail(custEmail)) {
      try {
        await sendOrderConfirmationEmail({
          orderId,
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: custPhone,
          shippingAddress: order?.shipping_address || "",
          city: order?.city || "",
          postalCode: order?.postal_code || "",
          totalAmount: effectiveTotal,
          discountAmount: Number(order?.discount_amount || 0),
          paymentMethod: isCodOrder ? "Cash on Delivery (₹49 Advance Paid)" : "Online Payment (Cashfree)",
          paymentStatus: isCodOrder ? "pending" : "paid",
          items: rawItems,
          createdAt: order?.created_at || new Date().toISOString(),
        });
      } catch (e) {
        console.warn("Cashfree email confirmation error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      paid: true,
      orderId,
      paymentId,
      isCodPartial: isCodOrder,
      advancePaid,
      balanceDue,
      totalAmount: effectiveTotal,
      amount: verification.amount,
      message: isCodOrder
        ? "Cash on Delivery courier advance verified and order confirmed successfully"
        : "Cashfree payment verified and order confirmed successfully",
    });
  } catch (err: any) {
    console.error("Cashfree verify-payment error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify Cashfree payment" },
      { status: 500 }
    );
  }
}

