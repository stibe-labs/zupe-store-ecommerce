import { NextRequest, NextResponse } from "next/server";
import { cancelWhatsAppOrder, getStorefrontOrderById, updateStorefrontOrder } from "@/lib/orderStore";
import { getOrderById, updateERPOrder } from "@/lib/erpStore";
import {
  getRazorpayPaymentDetails,
  getRazorpayPaymentByOrderId,
  RazorpayPaymentInfo,
} from "@/lib/razorpay";
import { sendOrderCancellationEmail } from "@/lib/orderEmailService";

export const dynamic = "force-dynamic";

// Dedicated admin & billing desk WhatsApp number for refund processing
const REFUND_WHATSAPP_PHONE = "919744122853"; // +91 97441 22853

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400 }
      );
    }

    const ord: any = getStorefrontOrderById(orderId) || (await getOrderById(orderId));
    if (ord) {
      const currentDeliveryStatus = (ord.delivery_status || "").toLowerCase();
      const currentOrderStatus = (ord.order_status || ord.status || "").toLowerCase();

      // Only block cancellation if package is physically dispatched or delivered
      if (
        currentDeliveryStatus === "delivered" ||
        currentDeliveryStatus === "in transit" ||
        currentDeliveryStatus === "shipped" ||
        currentOrderStatus === "delivered" ||
        currentOrderStatus === "shipped"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "This order has already been dispatched with our courier partner and cannot be cancelled online.",
          },
          { status: 400 }
        );
      }

      if (currentOrderStatus === "cancelled" || currentDeliveryStatus === "cancelled") {
        return NextResponse.json(
          { success: false, error: "This order has already been cancelled." },
          { status: 400 }
        );
      }
    }

    // 1. Cancel order and restock inventory
    await cancelWhatsAppOrder(orderId, {
      isDirectCustomerCancel: true,
      reason: reason || "Customer requested cancellation from My Orders page",
    });

    let custName = (ord as any)?.customer_name || "Valued Customer";
    let custPhone = (ord as any)?.customer_phone || "";
    let custEmail = (ord as any)?.customer_email || (ord as any)?.guest_email || "";
    let razorpayPaymentId = (ord as any)?.razorpay_payment_id || "";
    let razorpayOrderId = (ord as any)?.razorpay_order_id || "";
    let totalAmount = Number((ord as any)?.total_amount || 0);
    let d1PaymentMethod = (ord as any)?.payment_method || "";
    let advancePaid = Number((ord as any)?.advance_paid || 0);
    const displayOrderId = (ord as any)?.shopify_order_id || (orderId.startsWith("#") ? orderId : `#${orderId}`);

    // If phone, email, or Razorpay IDs are missing, lookup D1 directly
    try {
      const { executeD1Query } = await import("@/lib/d1");
      const rows = await executeD1Query<any>(
        "SELECT customer_phone, guest_email, customer_name, razorpay_payment_id, razorpay_order_id, total_amount, payment_method, payment_status, items FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
        [orderId, orderId]
      );
      if (rows && rows.length > 0) {
        if (!custPhone && rows[0].customer_phone) custPhone = rows[0].customer_phone;
        if (!custEmail && rows[0].guest_email) custEmail = rows[0].guest_email;
        if ((!custName || custName === "Valued Customer") && rows[0].customer_name) custName = rows[0].customer_name;
        if (!razorpayPaymentId && rows[0].razorpay_payment_id) razorpayPaymentId = rows[0].razorpay_payment_id;
        if (!razorpayOrderId && rows[0].razorpay_order_id) razorpayOrderId = rows[0].razorpay_order_id;
        if (!totalAmount && rows[0].total_amount) totalAmount = Number(rows[0].total_amount);
        if (rows[0].payment_method) d1PaymentMethod = rows[0].payment_method;
      }
    } catch (d1Err) {
      console.warn("D1 order detail lookup warning:", d1Err);
    }

    // Determine payment type
    const paymentMethodLower = (d1PaymentMethod || (ord as any)?.payment_method || "").toLowerCase();
    const hasRazorpayRef = Boolean(razorpayPaymentId || razorpayOrderId);
    const isCodPartial =
      paymentMethodLower.includes("partial") ||
      Boolean((ord as any)?.is_cod_partial) ||
      advancePaid > 0 ||
      (hasRazorpayRef && (paymentMethodLower.includes("cod") || paymentMethodLower.includes("cash on delivery")));

    const isPrepaid =
      !isCodPartial &&
      (paymentMethodLower.includes("prepaid") ||
       paymentMethodLower.includes("online") ||
       (ord as any)?.payment_status === "paid" ||
       (ord as any)?.payment_status === "Completed");

    const isRefundEligible = isPrepaid || isCodPartial || hasRazorpayRef;

    // 2. Fetch Customer Payment Details from Razorpay (No automated refund call)
    let paymentInfo: RazorpayPaymentInfo | null = null;
    if (razorpayPaymentId) {
      paymentInfo = await getRazorpayPaymentDetails(razorpayPaymentId);
    }
    if (!paymentInfo && razorpayOrderId) {
      paymentInfo = await getRazorpayPaymentByOrderId(razorpayOrderId);
      if (paymentInfo?.id) razorpayPaymentId = paymentInfo.id;
    }

    // Calculate actual amount refundable to customer
    let amountToRefund = 0;
    if (isCodPartial) {
      amountToRefund = paymentInfo ? paymentInfo.amount : (advancePaid || 10);
    } else if (isPrepaid) {
      amountToRefund = paymentInfo ? paymentInfo.amount : totalAmount;
    } else if (paymentInfo) {
      amountToRefund = paymentInfo.amount;
    }

    const nextPaymentStatus = isRefundEligible ? "Refund Pending" : "Cancelled";
    const nextStorefrontStatus = isRefundEligible ? "refund_pending" : "cancelled";

    // 3. Update order state in ERP Store, Storefront Store, and D1
    updateStorefrontOrder(orderId, {
      payment_status: nextStorefrontStatus as any,
      order_status: "cancelled",
      whatsapp_confirm_status: "cancelled",
    });

    try {
      await updateERPOrder(orderId, {
        payment_status: nextPaymentStatus,
        status: "Cancelled",
        delivery_status: "Cancelled" as any,
        whatsapp_confirm_status: "cancelled",
      });
    } catch (erpErr) {
      console.warn("ERP update error on cancel:", erpErr);
    }

    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(
        `UPDATE orders
         SET status = 'Cancelled',
             delivery_status = 'Cancelled',
             payment_status = ?,
             whatsapp_confirm_status = 'cancelled'
         WHERE id = ? OR shopify_order_id = ?`,
        [nextPaymentStatus, orderId, orderId]
      );
    } catch (d1Err) {
      console.warn("D1 update error on cancel:", d1Err);
    }

    // 4. Format line items for WhatsApp & Email
    let rawItems: any[] = [];
    if (Array.isArray(ord?.items)) rawItems = ord.items;
    else if (typeof ord?.items === "string") {
      try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
    }
    const itemsSummary = rawItems.length > 0
      ? rawItems.map((it: any) => `${it.product_name || it.name || "Product"} (x${it.quantity || 1})`).join(", ")
      : "Purchased Items";

    // 5. Construct the WhatsApp Redirection Message for +91 97441 22853
    let paymentSection = "";
    if (isRefundEligible || paymentInfo || razorpayPaymentId) {
      const amountTitle = isCodPartial
        ? `Paid Amount: ₹${amountToRefund || 10} (COD Advance Confirmation Fee)`
        : `Paid Amount: ₹${amountToRefund || totalAmount}`;

      const methodFormatted = paymentInfo?.paymentSummary ||
        (isCodPartial
          ? `Cash on Delivery (₹${amountToRefund || 10} Advance via Online)`
          : "Prepaid (Online Payment)");

      paymentSection = [
        "💳 *Original Payment Information:*",
        `• Payment ID: ${razorpayPaymentId || paymentInfo?.id || "Verified at Checkout"}`,
        `• ${amountTitle}`,
        `• Payment Method: ${methodFormatted}`,
        paymentInfo?.vpa ? `• Customer UPI ID / VPA: ${paymentInfo.vpa}` : null,
        paymentInfo?.card?.last4 ? `• Card: ${paymentInfo.card.type || "Card"} ending in ${paymentInfo.card.last4} (${paymentInfo.card.network || ""})` : null,
        paymentInfo?.bank ? `• Bank: ${paymentInfo.bank}` : null,
        `• Status: Successful (Captured)`,
      ].filter(Boolean).join("\n");
    } else {
      paymentSection = [
        "💳 *Payment Mode:*",
        `• Method: ${(ord as any)?.payment_method || "Cash on Delivery"}`,
        `• Order Total: ₹${totalAmount}`,
        `• Advance Paid: ₹0 (No Online Payment Collected)`,
      ].join("\n");
    }

    const currentDateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const refundRequestNote = isRefundEligible
      ? `Please process the refund of ₹${amountToRefund} to my payment account. Thank you!`
      : `My order has been cancelled. Thank you!`;

    const whatsappMessage = [
      "Hello Zupe Store Support Team,",
      "",
      "I have canceled my order and would like to request my refund.",
      "",
      "📦 *Canceled Order Details:*",
      `• Order ID: ${displayOrderId} (${orderId})`,
      `• Customer Name: ${custName}`,
      `• Customer Phone: ${custPhone || "Registered Contact"}`,
      `• Items: ${itemsSummary}`,
      `• Total Amount: ₹${totalAmount}`,
      `• Canceled On: ${currentDateStr}`,
      "",
      paymentSection,
      "",
      refundRequestNote,
    ].join("\n");

    const whatsappRedirectUrl = `https://wa.me/${REFUND_WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

    // 5b. Send official WhatsApp cancellation template to customer
    if (custPhone) {
      try {
        const { sendOrderCancellationRefundWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        await sendOrderCancellationRefundWhatsApp({
          customerName: custName,
          customerPhone: custPhone,
          orderId: displayOrderId,
          productName: itemsSummary || "ZupeStore Item",
          totalAmount: isCodPartial ? amountToRefund : totalAmount,
          refundAmount: isRefundEligible ? (amountToRefund || totalAmount) : undefined,
          refundId: razorpayPaymentId || "Initiated",
          isPrepaid: isRefundEligible,
        });
      } catch (waErr) {
        console.warn("Cancellation WhatsApp dispatch warning:", waErr);
      }
    }

    // 6. Optional Email Notification
    if (custEmail && custEmail.includes("@") && !custEmail.endsWith("@customer.zupestore.com")) {
      try {
        await sendOrderCancellationEmail({
          orderId: displayOrderId,
          customerName: custName,
          customerEmail: custEmail,
          totalAmount: isCodPartial ? amountToRefund : totalAmount,
          isPrepaid: isRefundEligible,
          reason,
          paymentId: razorpayPaymentId,
        });
      } catch (emailErr) {
        console.warn("Cancellation email notification error:", emailErr);
      }
    }

    const responseMsg = isRefundEligible
      ? `Order #${displayOrderId} was cancelled. Connecting to our billing desk on WhatsApp (+91 97441 22853) with your payment details for instant refund processing.`
      : `Order #${displayOrderId} was cancelled successfully.`;

    return NextResponse.json({
      success: true,
      message: responseMsg,
      orderId,
      displayOrderId,
      whatsapp_redirect_url: whatsappRedirectUrl,
      whatsapp_message: whatsappMessage,
      payment_details: paymentInfo
        ? {
            id: paymentInfo.id,
            amount: paymentInfo.amount,
            method: paymentInfo.method,
            vpa: paymentInfo.vpa,
            bank: paymentInfo.bank,
            card: paymentInfo.card,
            paymentSummary: paymentInfo.paymentSummary,
          }
        : null,
      isPrepaid,
      isCodPartial,
      isRefundEligible,
      amountToRefund,
      upi_id: paymentInfo?.vpa || null,
    });
  } catch (err: any) {
    console.error("Direct order cancel error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
