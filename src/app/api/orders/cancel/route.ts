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

    // Validate genuine customer UPI handle (exclude Razorpay test/dummy VPAs like success@razorpay)
    const rawVpa = (paymentInfo?.vpa || "").trim();
    const isValidCustomerVpa =
      Boolean(rawVpa) &&
      rawVpa.includes("@") &&
      !rawVpa.toLowerCase().includes("razorpay") &&
      !rawVpa.toLowerCase().includes("test") &&
      !rawVpa.toLowerCase().includes("dummy") &&
      !rawVpa.toLowerCase().includes("mock");
    const genuineVpa = isValidCustomerVpa ? rawVpa : null;

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
      ? rawItems.map((it: any) => `${it.product_name || it.name || "Product"} × ${it.quantity || 1}`).join(", ")
      : "Zupe Store Selection";

    // 5. Construct the WhatsApp Redirection Message for +91 97441 22853
    function formatIndianMobile(raw: string): string {
      if (!raw) return "+91 80897 32385";
      const digits = raw.replace(/\D/g, "");
      if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      if (digits.length === 12 && digits.startsWith("91")) {
        const main = digits.slice(2);
        return `+91 ${main.slice(0, 5)} ${main.slice(5)}`;
      }
      return raw.startsWith("+") ? raw : `+${raw}`;
    }

    const now = new Date();
    const cancellationDate = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const cancellationTime = now.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).toUpperCase();

    let paymentDetailsLines: string[] = [];
    let confirmationLines: string[] = [];

    if (!isRefundEligible || (amountToRefund === 0 && !hasRazorpayRef)) {
      // Pure COD with no advance paid
      paymentDetailsLines = [
        "💳 PAYMENT & REFUND DETAILS",
        "━━━━━━━━━━━━━━━",
        "💵 Payment Method: Cash on Delivery (COD)",
        `💰 Order Amount: ₹${totalAmount.toLocaleString("en-IN")}`,
        "✅ Amount Paid: ₹0",
        "💸 Refund Amount: ₹0",
        "📌 Refund Status: No refund required, as no online payment was made.",
        "━━━━━━━━━━━━━━━",
      ];

      confirmationLines = [
        "📌 CANCELLATION CONFIRMATION",
        "",
        "✅ My order has been cancelled successfully.",
        "💳 No refund is applicable because I have not made any advance payment.",
      ];
    } else {
      // Online Payment (Prepaid or COD Advance Fee)
      const paidAmount = isCodPartial ? (amountToRefund || 10) : (amountToRefund || totalAmount);
      const isUpi = paymentInfo?.method === "upi" || Boolean(paymentInfo?.vpa);
      const isCard = paymentInfo?.method === "card" || Boolean(paymentInfo?.card?.last4);
      const isNetbanking = paymentInfo?.method === "netbanking" || Boolean(paymentInfo?.bank);
      const isWallet = paymentInfo?.method === "wallet" || Boolean(paymentInfo?.wallet);

      let methodLabel = "";
      if (isCodPartial) {
        methodLabel = `Cash on Delivery (COD) + ₹${paidAmount} Advance Paid Online`;
      } else if (isUpi) {
        methodLabel = "UPI Instant Payment";
      } else if (isCard) {
        const cardType = paymentInfo?.card?.type
          ? (paymentInfo.card.type.toLowerCase() === "credit" ? "Credit Card" : "Debit Card")
          : "Credit / Debit Card";
        const network = paymentInfo?.card?.network ? ` (${paymentInfo.card.network})` : "";
        methodLabel = `${cardType}${network}`;
      } else if (isNetbanking) {
        methodLabel = `Netbanking (${paymentInfo?.bank || "Bank Transfer"})`;
      } else if (isWallet) {
        methodLabel = `Wallet (${paymentInfo?.wallet || "E-Wallet"})`;
      } else {
        methodLabel = paymentInfo?.paymentSummary || "Prepaid (Online Payment)";
      }

      const refundStatusText = isCodPartial
        ? `Refund of ₹${amountToRefund.toLocaleString("en-IN")} advance confirmation fee requested to original payment source.`
        : `100% full refund requested to original payment source.`;

      paymentDetailsLines = [
        "💳 PAYMENT & REFUND DETAILS",
        "━━━━━━━━━━━━━━━",
        `💵 Payment Method: ${methodLabel}`,
        `💰 Order Amount: ₹${totalAmount.toLocaleString("en-IN")}`,
        `✅ Amount Paid: ₹${paidAmount.toLocaleString("en-IN")}${isCodPartial ? " (Advance Confirmation Fee)" : ""}`,
        `💸 Refund Amount: ₹${amountToRefund.toLocaleString("en-IN")}`,
        `📌 Refund Status: ${refundStatusText}`,
        `🆔 Payment ID: ${razorpayPaymentId || paymentInfo?.id || "Verified at Checkout"}`,
      ];

      let refundSourceDescriptor = "my original payment account";

      // If client paid via UPI, only mention UPI ID if it is a genuine customer UPI:
      if (genuineVpa) {
        paymentDetailsLines.push(`📱 UPI ID: ${genuineVpa}`);
        refundSourceDescriptor = `my UPI ID (${genuineVpa})`;
      } else if (isUpi) {
        paymentDetailsLines.push(`📱 Payment Mode: UPI Instant Payment`);
        refundSourceDescriptor = `my original payment account`;
      }

      // If client paid via Credit/Debit card, mention Card Details:
      if (paymentInfo?.card?.last4) {
        const cardType = paymentInfo?.card?.type
          ? (paymentInfo.card.type.toLowerCase() === "credit" ? "Credit Card" : "Debit Card")
          : "Card";
        const network = paymentInfo?.card?.network ? ` (${paymentInfo.card.network})` : "";
        paymentDetailsLines.push(`💳 Card Details: ${cardType} ending in ${paymentInfo.card.last4}${network}`);
        refundSourceDescriptor = `my ${cardType} ending in ${paymentInfo.card.last4}`;
      }

      if (paymentInfo?.bank) {
        paymentDetailsLines.push(`🏦 Bank: ${paymentInfo.bank}`);
        if (!paymentInfo?.vpa && !paymentInfo?.card?.last4) {
          refundSourceDescriptor = `my ${paymentInfo.bank} account`;
        }
      }

      if (paymentInfo?.wallet) {
        paymentDetailsLines.push(`👛 Wallet: ${paymentInfo.wallet}`);
      }

      paymentDetailsLines.push("━━━━━━━━━━━━━━━");

      confirmationLines = [
        "📌 CANCELLATION CONFIRMATION",
        "",
        "✅ My order has been cancelled successfully.",
        `💳 Please process the refund of ₹${amountToRefund.toLocaleString("en-IN")} directly to ${refundSourceDescriptor}.`,
      ];
    }

    const whatsappMessage = [
      "👋 Hello Zupe Store Support Team!",
      "",
      "❌ ORDER CANCELLATION REQUEST",
      "",
      "⚠️I have successfully cancelled my order and would like to confirm the cancellation details.",
      "",
      "📦 CANCELLED ORDER DETAILS",
      "━━━━━━━━━━━━━━━",
      `🆔 Order ID: ${displayOrderId}`,
      `👤 Customer Name: ${custName}`,
      `📱 Mobile Number: ${formatIndianMobile(custPhone)}`,
      `🛍️ Product: ${itemsSummary}`,
      `💰 Total Order Value: ₹${totalAmount.toLocaleString("en-IN")}`,
      `📅 Cancellation Date: ${cancellationDate}`,
      `⏰ Cancellation Time: ${cancellationTime}`,
      "━━━━━━━━━━━━━━━",
      "",
      ...paymentDetailsLines,
      "",
      ...confirmationLines,
      "",
      "🙏 Thank you for your support!",
      "",
      "🧡 Team Zupe Store",
      "✨ Smart Finds. Better Living.",
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
            vpa: genuineVpa,
            bank: paymentInfo.bank,
            card: paymentInfo.card,
            paymentSummary: paymentInfo.paymentSummary,
          }
        : null,
      isPrepaid,
      isCodPartial,
      isRefundEligible,
      amountToRefund,
      upi_id: genuineVpa,
    });
  } catch (err: any) {
    console.error("Direct order cancel error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
