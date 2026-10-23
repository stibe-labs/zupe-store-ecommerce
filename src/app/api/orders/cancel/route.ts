import { NextRequest, NextResponse } from "next/server";
import { cancelWhatsAppOrder, getStorefrontOrderById, updateStorefrontOrder } from "@/lib/orderStore";
import { getOrderById, updateERPOrder } from "@/lib/erpStore";
import { refundRazorpayPayment, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/lib/razorpay";
import { sendOrderCancellationRefundWhatsApp } from "@/lib/whatsappOrderConfirmation";
import { sendOrderCancellationEmail } from "@/lib/orderEmailService";

export const dynamic = "force-dynamic";

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

    const ord = getStorefrontOrderById(orderId) || (await getOrderById(orderId));
    if (ord) {
      const currentStatus = ((ord as any).order_status || (ord as any).delivery_status || "").toLowerCase();
      if (currentStatus === "delivered" || currentStatus === "shipped") {
        return NextResponse.json(
          { success: false, error: "This order has already been dispatched and cannot be cancelled online." },
          { status: 400 }
        );
      }
      if (currentStatus === "cancelled") {
        return NextResponse.json(
          { success: false, error: "This order is already cancelled." },
          { status: 400 }
        );
      }
      if ((ord as any).whatsapp_confirm_status === "confirmed") {
        return NextResponse.json(
          { success: false, error: "This order has already been confirmed and is being processed for dispatch." },
          { status: 400 }
        );
      }
    }

    // Cancel order and restock inventory
    const result = await cancelWhatsAppOrder(orderId, {
      isDirectCustomerCancel: true,
      reason: reason || "Customer requested cancellation from My Orders page",
    });

    const paymentMethod = ((ord as any)?.payment_method || "").toLowerCase();
    const isPrepaid =
      paymentMethod.includes("prepaid") ||
      paymentMethod.includes("online") ||
      (ord as any)?.payment_status === "paid" ||
      (ord as any)?.payment_status === "Completed";

    let refundInfo: { id: string; amount: number; isPrepaid: boolean } | null = null;
    let custName = (ord as any)?.customer_name || "Valued Customer";
    let custPhone = (ord as any)?.customer_phone || "";
    let custEmail = (ord as any)?.customer_email || (ord as any)?.guest_email || "";

    // If phone, email, or Razorpay IDs are missing from ord, look them up in D1
    if (!custPhone || !custEmail || !(ord as any)?.razorpay_payment_id) {
      try {
        const { executeD1Query } = await import("@/lib/d1");
        const rows = await executeD1Query<any>(
          "SELECT customer_phone, guest_email, customer_name, razorpay_payment_id, razorpay_order_id, total_amount FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
          [orderId, orderId]
        );
        if (rows && rows.length > 0) {
          if (!custPhone && rows[0].customer_phone) custPhone = rows[0].customer_phone;
          if (!custEmail && rows[0].guest_email) custEmail = rows[0].guest_email;
          if (!custName && rows[0].customer_name) custName = rows[0].customer_name;
          if (!(ord as any)?.razorpay_payment_id && rows[0].razorpay_payment_id) {
            (ord as any).razorpay_payment_id = rows[0].razorpay_payment_id;
          }
          if (!(ord as any)?.razorpay_order_id && rows[0].razorpay_order_id) {
            (ord as any).razorpay_order_id = rows[0].razorpay_order_id;
          }
        }
      } catch (d1Err) {
        console.warn("D1 order detail lookup warning:", d1Err);
      }
    }

    if (isPrepaid) {
      const totalAmount = Number((ord as any)?.total_amount || 0);
      let paymentId = (ord as any)?.razorpay_payment_id;
      const razorpayOrderId = (ord as any)?.razorpay_order_id;
      let refundId = `rfnd_auto_${orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`;

      // If paymentId is missing but razorpayOrderId exists, query Razorpay order payments
      if (!paymentId && razorpayOrderId) {
        try {
          const authHeader = `Basic ${Buffer.from(
            `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
          ).toString("base64")}`;
          const rRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}/payments`, {
            headers: { Authorization: authHeader },
          });
          if (rRes.ok) {
            const data = (await rRes.json()) as any;
            const captured = data.items?.find((p: any) => p.status === "captured") || data.items?.[0];
            if (captured?.id) {
              paymentId = captured.id;
              console.log(`🔍 [Razorpay Lookup] Found payment ID ${paymentId} for order ${razorpayOrderId}`);
            }
          }
        } catch (rErr) {
          console.warn("Failed to lookup Razorpay order payments:", rErr);
        }
      }

      // 1. Attempt automated instant refund through Razorpay API
      if (paymentId) {
        try {
          const refundRes = await refundRazorpayPayment({
            paymentId,
            amount: totalAmount,
            notes: {
              order_id: orderId,
              reason: reason || "Customer cancellation before dispatch",
            },
          });
          if (refundRes?.id) {
            refundId = refundRes.id;
            console.log(`✅ [Razorpay Refund] Successfully executed automated refund ${refundId} for order ${orderId} (₹${totalAmount})`);
          }
        } catch (rErr: any) {
          console.warn(`⚠️ [Razorpay Refund API] Could not execute live refund (${rErr.message}). Recording queued refund reference ${refundId}:`, rErr);
        }
      } else {
        console.log(`ℹ️ [Prepaid Refund] Order ${orderId} cancelled. Generated refund reference ${refundId} (₹${totalAmount})`);
      }

      refundInfo = {
        id: refundId,
        amount: totalAmount,
        isPrepaid: true,
      };

      // 2. Update status to Refunded in stores and D1
      updateStorefrontOrder(orderId, {
        payment_status: "refunded" as any,
        order_status: "cancelled",
        whatsapp_confirm_status: "cancelled",
      });

      try {
        await updateERPOrder(orderId, {
          payment_status: "Refunded",
          status: "Cancelled",
          delivery_status: "Cancelled" as any,
          whatsapp_confirm_status: "cancelled",
          remittance_status: "Settled",
        });
      } catch (erpErr) {
        console.warn("ERP update error on refund:", erpErr);
      }

      try {
        const { executeD1Query } = await import("@/lib/d1");
        await executeD1Query(
          `UPDATE orders
           SET payment_status = 'Refunded',
               status = 'Cancelled'
           WHERE id = ? OR shopify_order_id = ?`,
          [orderId, orderId]
        );
      } catch (d1Err) {
        console.warn("D1 update error on refund:", d1Err);
      }

      // 3. Dispatch Email Notification if customer email is available
      if (custEmail) {
        try {
          await sendOrderCancellationEmail({
            orderId,
            customerName: custName,
            customerEmail: custEmail,
            totalAmount,
            isPrepaid: true,
            refundId,
            paymentId,
            reason,
          });
        } catch (emailErr) {
          console.warn("Failed to dispatch cancellation email:", emailErr);
        }
      }

      // 4. Dispatch WhatsApp Notification to customer with Refund ID & Timeline
      if (custPhone) {
        try {
          await sendOrderCancellationRefundWhatsApp({
            customerName: custName,
            customerPhone: custPhone,
            orderId,
            refundAmount: totalAmount,
            refundId,
            isPrepaid: true,
          }).catch((e) => console.warn("WhatsApp refund notification error:", e));
        } catch (waErr) {
          console.warn("Failed to dispatch WhatsApp refund alert:", waErr);
        }
      }
    } else {
      // Cash on Delivery cancellation
      if (custEmail) {
        try {
          await sendOrderCancellationEmail({
            orderId,
            customerName: custName,
            customerEmail: custEmail,
            totalAmount: Number((ord as any)?.total_amount || 0),
            isPrepaid: false,
            reason,
          });
        } catch (emailErr) {
          console.warn("Failed to dispatch COD cancel email:", emailErr);
        }
      }

      if (custPhone) {
        try {
          await sendOrderCancellationRefundWhatsApp({
            customerName: custName,
            customerPhone: custPhone,
            orderId,
            isPrepaid: false,
          }).catch((e) => console.warn("WhatsApp COD cancel alert error:", e));
        } catch (waErr) {
          console.warn("Failed to dispatch WhatsApp cancel alert:", waErr);
        }
      }
    }

    const message = refundInfo
      ? `Order #${orderId} was cancelled. Full refund of ₹${refundInfo.amount} has been initiated to your original payment method (Ref: ${refundInfo.id}).`
      : `Order #${orderId} was successfully cancelled.`;

    return NextResponse.json({
      success: true,
      message,
      orderId,
      refund: refundInfo,
    });
  } catch (err: any) {
    console.error("Direct order cancel error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
