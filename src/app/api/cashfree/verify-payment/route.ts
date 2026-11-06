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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId" },
        { status: 400 }
      );
    }

    // 1. Verify directly against Cashfree Production API
    const verification = await verifyCashfreePayment(orderId);

    if (!verification.paid) {
      return NextResponse.json({
        success: false,
        paid: false,
        orderStatus: verification.orderStatus,
        message: "Payment is not yet confirmed by Cashfree",
      });
    }

    const paymentId = verification.paymentId || `cf_${orderId}`;

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

    // 3. Update in ERP Store (handles memory + D1 update)
    await updateERPOrder(orderId, {
      payment_method: "Prepaid",
      payment_status: "Completed",
      whatsapp_confirm_status: "confirmed",
      delivery_status: "Processing",
      status: "Processing",
      remittance_status: "Settled",
    });

    // 4. Update in D1 orders table
    try {
      await executeD1Query(
        `UPDATE orders
         SET payment_method = 'Prepaid',
             payment_status = 'Completed',
             whatsapp_confirm_status = 'confirmed',
             whatsapp_token_used = 1,
             delivery_status = 'Processing',
             status = 'Processing',
             remittance_status = 'Settled'
         WHERE id = ? OR shopify_order_id = ?`,
        [orderId, orderId]
      );
    } catch (d1Err) {
      console.warn("D1 update order after Cashfree payment warning:", d1Err);
    }

    // 5. Update local storefront store
    try {
      updateStorefrontOrder(orderId, {
        payment_method: "Prepaid",
        payment_status: "paid",
        order_status: "processing",
        whatsapp_confirm_status: "confirmed",
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

    // 6. Dispatch Official WhatsApp Confirmation (Prepaid Template)
    if (custPhone) {
      try {
        await sendOrderConfirmationWhatsApp({
          customerName: custName,
          customerPhone: custPhone,
          orderId: order?.shopify_order_id || orderId,
          totalAmount: Number(order?.total_amount || verification.amount || 0),
          paymentMethod: "prepaid",
          items: rawItems.map((it: any) => ({
            name: it.product_name || it.name || "Turkiye Jam",
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_price || it.price || 0),
          })),
        });
      } catch (waErr) {
        console.warn("Cashfree WhatsApp confirmation dispatch error:", waErr);
      }
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
          totalAmount: Number(order?.total_amount || verification.amount || 0),
          discountAmount: Number(order?.discount_amount || 0),
          paymentMethod: "Online Payment (Cashfree)",
          paymentStatus: "paid",
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
      amount: verification.amount,
      message: "Cashfree payment verified and order confirmed successfully",
    });
  } catch (err: any) {
    console.error("Cashfree verify-payment error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify Cashfree payment" },
      { status: 500 }
    );
  }
}

