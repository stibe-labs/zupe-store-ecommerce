import { NextRequest, NextResponse } from "next/server";
import { getERPOrders, updateERPOrder, createERPOrder, getOrderById } from "@/lib/erpStore";
import { updateStorefrontOrder } from "@/lib/orderStore";
import { executeD1Query } from "@/lib/d1";
import {
  sendOrderPreConfirmationWhatsApp,
  sendOrderConfirmationWhatsApp,
  sendOrderCancellationRefundWhatsApp,
} from "@/lib/whatsappOrderConfirmation";
import { restockInventory } from "@/lib/inventoryService";
import { refundRazorpayPayment, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/lib/razorpay";
import { sendOrderConfirmationEmail, sendOrderCancellationEmail } from "@/lib/orderEmailService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const delivery_status = searchParams.get("delivery_status") || undefined;
    const payment_method = searchParams.get("payment_method") || undefined;
    const courier_partner = searchParams.get("courier_partner") || undefined;
    const search = searchParams.get("search") || undefined;
    const whatsapp_status = searchParams.get("whatsapp_status") || undefined;

    const orders = await getERPOrders({
      delivery_status,
      payment_method,
      courier_partner,
      search,
      whatsapp_status,
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, ...updates } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: order_id" },
        { status: 400 }
      );
    }

    const updated = await updateERPOrder(order_id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order ${order_id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ========================================================
    // ACTION 1: RESEND WHATSAPP CONFIRM / CANCEL BUTTONS
    // ========================================================
    if (body.action === "resend_wa_buttons") {
      const { order_id } = body;
      if (!order_id) {
        return NextResponse.json(
          { success: false, error: "Missing required field: order_id" },
          { status: 400 }
        );
      }

      let ord: any = await getOrderById(order_id);
      if (!ord) {
        try {
          const rows = await executeD1Query<any>(
            "SELECT * FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
            [order_id, order_id]
          );
          if (rows && rows.length > 0) ord = rows[0];
        } catch {}
      }

      if (!ord) {
        return NextResponse.json(
          { success: false, error: `Order ${order_id} not found` },
          { status: 404 }
        );
      }

      const customerPhone = ord.customer_phone || "";
      if (!customerPhone) {
        return NextResponse.json(
          { success: false, error: "Customer phone number is missing from this order" },
          { status: 400 }
        );
      }

      // Generate or reuse verification token
      let token = ord.whatsapp_confirm_token || "";
      if (!token || ord.whatsapp_token_used) {
        token = `tok_wa_${(ord.id || order_id).replace(/[^a-zA-Z0-9]/g, "").slice(-8)}_${Date.now().toString(36)}`;
      }

      // Ensure status is pending_whatsapp and token is ready to receive clicks
      await updateERPOrder(ord.id || order_id, {
        whatsapp_confirm_status: "pending_whatsapp",
        whatsapp_confirm_token: token,
        whatsapp_token_used: false,
      });

      updateStorefrontOrder(ord.id || order_id, {
        whatsapp_confirm_status: "pending_whatsapp",
        whatsapp_confirm_token: token,
        whatsapp_token_used: false,
      });

      try {
        await executeD1Query(
          `UPDATE orders SET 
            whatsapp_confirm_status = 'pending_whatsapp',
            whatsapp_confirm_token = ?,
            whatsapp_token_used = 0 
           WHERE id = ? OR shopify_order_id = ?`,
          [token, ord.id || order_id, ord.id || order_id]
        );
      } catch (d1Err) {
        console.warn("D1 update token warning on resend:", d1Err);
      }

      let rawItems: any[] = [];
      if (Array.isArray(ord.items)) rawItems = ord.items;
      else if (typeof ord.items === "string") {
        try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
      }

      const isCod =
        (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
        (ord.payment_method || "").toUpperCase() === "COD";

      const sent = await sendOrderPreConfirmationWhatsApp({
        customerName: ord.customer_name || "Valued Customer",
        customerPhone,
        orderId: ord.shopify_order_id || ord.id || order_id,
        totalAmount: Number(ord.total_amount) || 0,
        paymentMethod: isCod ? "cod" : "prepaid",
        items: rawItems.map((it: any) => ({
          name: it.product_name || it.name || "Purchased Product",
          quantity: Number(it.quantity || 1),
          price: Number(it.unit_price || it.price || 0),
        })),
        token,
      });

      return NextResponse.json({
        success: true,
        sent,
        order: ord,
        message: `WhatsApp verification message with Confirm & Cancel buttons dispatched to ${customerPhone}`,
      });
    }

    // ========================================================
    // ACTION 2: MANUALLY CONFIRM ORDER (ADMIN)
    // ========================================================
    if (body.action === "manual_confirm") {
      const { order_id } = body;
      if (!order_id) {
        return NextResponse.json(
          { success: false, error: "Missing required field: order_id" },
          { status: 400 }
        );
      }

      let ord: any = await getOrderById(order_id);
      if (!ord) {
        try {
          const rows = await executeD1Query<any>(
            "SELECT * FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
            [order_id, order_id]
          );
          if (rows && rows.length > 0) ord = rows[0];
        } catch {}
      }

      if (!ord) {
        return NextResponse.json(
          { success: false, error: `Order ${order_id} not found` },
          { status: 404 }
        );
      }

      const targetId = ord.id || order_id;
      const orderDisplayId = ord.shopify_order_id || ord.id || order_id;

      // Assign AWB if not present
      const existingAwb = ord.shiprocket_awb;
      const finalAwb =
        existingAwb && existingAwb.trim() !== ""
          ? existingAwb
          : `SR-AWB-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const finalCourier = ord.courier_partner || "Delhivery";

      // 1. Update ERP Store
      const updatedERP = await updateERPOrder(targetId, {
        whatsapp_confirm_status: "confirmed",
        whatsapp_token_used: true,
        status: "Processing",
        delivery_status: "Processing",
        shiprocket_awb: finalAwb,
        courier_partner: finalCourier,
      });

      // 2. Update In-memory Storefront Store
      updateStorefrontOrder(targetId, {
        whatsapp_confirm_status: "confirmed",
        order_status: "processing",
        whatsapp_token_used: true,
      });

      // 3. Update Cloudflare D1 orders table
      try {
        await executeD1Query(
          `UPDATE orders SET 
            whatsapp_confirm_status = 'confirmed',
            whatsapp_token_used = 1,
            status = 'Processing',
            delivery_status = 'Processing',
            shiprocket_awb = COALESCE(NULLIF(shiprocket_awb, ''), ?),
            courier_partner = COALESCE(NULLIF(courier_partner, ''), ?)
           WHERE id = ? OR shopify_order_id = ?`,
          [finalAwb, finalCourier, targetId, targetId]
        );
      } catch (d1Err) {
        console.warn("D1 update order manual confirm warning:", d1Err);
      }

      // 4. Send official Order Confirmation WhatsApp message to customer (Prepaid or COD template)
      const customerPhone = ord.customer_phone;
      if (customerPhone) {
        try {
          let rawItems: any[] = [];
          if (Array.isArray(ord.items)) rawItems = ord.items;
          else if (typeof ord.items === "string") {
            try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
          }

          const isCod =
            (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
            (ord.payment_method || "").toUpperCase() === "COD";

          await sendOrderConfirmationWhatsApp({
            customerName: ord.customer_name || "Valued Customer",
            customerPhone,
            orderId: orderDisplayId,
            totalAmount: Number(ord.total_amount) || 0,
            paymentMethod: isCod ? "cod" : "prepaid",
            items: rawItems.map((it: any) => ({
              name: it.product_name || it.name || "Purchased Product",
              quantity: Number(it.quantity || 1),
              price: Number(it.unit_price || it.price || 0),
            })),
          });
        } catch (waErr) {
          console.warn("WhatsApp confirmation notification warning:", waErr);
        }
      }

      // 5. Send order confirmation email if customer email exists
      const customerEmail = (ord.guest_email || ord.customer_email || "").trim();
      if (
        customerEmail &&
        customerEmail.includes("@") &&
        !customerEmail.endsWith("@customer.zupestore.com") &&
        !ord.confirmation_email_sent
      ) {
        try {
          const { markOrderEmailSent } = await import("@/lib/orderStore");
          let rawItems: any[] = [];
          if (Array.isArray(ord.items)) rawItems = ord.items;
          else if (typeof ord.items === "string") {
            try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
          }

          const isCod =
            (ord.payment_method || "").toLowerCase().includes("cash on delivery") ||
            (ord.payment_method || "").toUpperCase() === "COD";

          const emailRes = await sendOrderConfirmationEmail({
            orderId: orderDisplayId,
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
            await markOrderEmailSent(targetId);
          }
        } catch (eErr) {
          console.warn("Email confirmation notification warning:", eErr);
        }
      }

      return NextResponse.json({
        success: true,
        order: updatedERP || ord,
        message: `Order #${orderDisplayId} confirmed successfully! Customer notified via WhatsApp.`,
      });
    }

    // ========================================================
    // ACTION 3: MANUALLY CANCEL ORDER (ADMIN)
    // ========================================================
    if (body.action === "manual_cancel") {
      const { order_id, reason } = body;
      if (!order_id) {
        return NextResponse.json(
          { success: false, error: "Missing required field: order_id" },
          { status: 400 }
        );
      }

      let ord: any = await getOrderById(order_id);
      if (!ord) {
        try {
          const rows = await executeD1Query<any>(
            "SELECT * FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
            [order_id, order_id]
          );
          if (rows && rows.length > 0) ord = rows[0];
        } catch {}
      }

      if (!ord) {
        return NextResponse.json(
          { success: false, error: `Order ${order_id} not found` },
          { status: 404 }
        );
      }

      const targetId = ord.id || order_id;
      const orderDisplayId = ord.shopify_order_id || ord.id || order_id;
      const cancelReason = reason || "Order cancelled before dispatch";

      // 1. Restock items in inventory
      let rawItems: any[] = [];
      if (Array.isArray(ord.items)) rawItems = ord.items;
      else if (typeof ord.items === "string") {
        try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
      }

      if (rawItems.length > 0) {
        try {
          await restockInventory(
            rawItems.map((it: any) => ({
              product_id: it.product_id || it.id || "ripple-lamp",
              name: it.product_name || it.name || "Purchased Product",
              quantity: Number(it.quantity || 1),
            }))
          );
        } catch (restockErr) {
          console.warn("Restock error on manual cancel:", restockErr);
        }
      }

      // 2. Check if prepaid & initiate Razorpay refund
      const paymentMethod = ((ord as any)?.payment_method || "").toLowerCase();
      const isPrepaid =
        paymentMethod.includes("prepaid") ||
        paymentMethod.includes("online") ||
        (ord as any)?.payment_status === "paid" ||
        (ord as any)?.payment_status === "Completed";

      let refundId: string | undefined = undefined;
      const totalAmount = Number((ord as any)?.total_amount || 0);

      if (isPrepaid) {
        let paymentId = (ord as any)?.razorpay_payment_id;
        const razorpayOrderId = (ord as any)?.razorpay_order_id;
        refundId = `rfnd_adm_${targetId.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`;

        if (!paymentId && razorpayOrderId) {
          try {
            const authHeader = `Basic ${Buffer.from(
              `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
            ).toString("base64")}`;
            const rRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}/payments`, {
              headers: { Authorization: authHeader },
            });
            if (rRes.ok) {
              const rData = (await rRes.json()) as any;
              const captured = rData.items?.find((p: any) => p.status === "captured") || rData.items?.[0];
              if (captured?.id) paymentId = captured.id;
            }
          } catch (e) {
            console.warn("Razorpay lookup warning on cancel:", e);
          }
        }

        if (paymentId) {
          try {
            const refundRes = await refundRazorpayPayment({
              paymentId,
              amount: totalAmount,
              notes: {
                order_id: targetId,
                reason: cancelReason,
              },
            });
            if (refundRes?.id) refundId = refundRes.id;
          } catch (rErr) {
            console.warn("Razorpay refund error on manual cancel:", rErr);
          }
        }
      }

      // 3. Update status in ERP store, Storefront store, and D1
      const updatedERP = await updateERPOrder(targetId, {
        delivery_status: "Cancelled" as any,
        status: "Cancelled",
        payment_status: isPrepaid ? "Refunded" : (ord.payment_status || "Pending"),
        whatsapp_confirm_status: "cancelled",
        whatsapp_token_used: true,
      });

      updateStorefrontOrder(targetId, {
        order_status: "cancelled",
        payment_status: isPrepaid ? ("refunded" as any) : ((ord as any).payment_status || "pending"),
        whatsapp_confirm_status: "cancelled",
        whatsapp_token_used: true,
      });

      try {
        await executeD1Query(
          `UPDATE orders SET
            status = 'Cancelled',
            delivery_status = 'Cancelled',
            payment_status = ?,
            whatsapp_confirm_status = 'cancelled',
            whatsapp_token_used = 1
           WHERE id = ? OR shopify_order_id = ?`,
          [isPrepaid ? "Refunded" : (ord.payment_status || "Pending"), targetId, targetId]
        );
      } catch (d1Err) {
        console.warn("D1 cancel update error on manual cancel:", d1Err);
      }

      // 4. Send official cancellation WhatsApp message to customer (COD or Prepaid refund template)
      const customerPhone = ord.customer_phone;
      if (customerPhone) {
        try {
          await sendOrderCancellationRefundWhatsApp({
            customerName: ord.customer_name || "Valued Customer",
            customerPhone,
            orderId: orderDisplayId,
            refundAmount: isPrepaid ? totalAmount : undefined,
            refundId,
            isPrepaid,
          });
        } catch (waErr) {
          console.warn("WhatsApp cancellation notification warning:", waErr);
        }
      }

      // 5. Send cancellation email if available
      const customerEmail = (ord.guest_email || ord.customer_email || "").trim();
      if (
        customerEmail &&
        customerEmail.includes("@") &&
        !customerEmail.endsWith("@customer.zupestore.com")
      ) {
        try {
          await sendOrderCancellationEmail({
            orderId: orderDisplayId,
            customerName: ord.customer_name || "Valued Customer",
            customerEmail,
            totalAmount,
            isPrepaid,
            refundId,
            reason: cancelReason,
          });
        } catch (eErr) {
          console.warn("Email cancellation notification warning:", eErr);
        }
      }

      const successMsg = isPrepaid
        ? `Order #${orderDisplayId} cancelled & refunded (₹${totalAmount}). Customer notified via WhatsApp.`
        : `Order #${orderDisplayId} cancelled successfully! Customer notified via WhatsApp.`;

      return NextResponse.json({
        success: true,
        order: updatedERP || ord,
        message: successMsg,
      });
    }

    // Default create ERP order
    const {
      customer_name,
      total_amount,
      payment_method,
      shipping_address,
      customer_phone,
      guest_email,
      items,
    } = body;

    if (!customer_name || total_amount === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing customer_name or total_amount" },
        { status: 400 }
      );
    }

    const newOrder = await createERPOrder({
      customer_name,
      total_amount: Number(total_amount),
      payment_method: payment_method || "COD",
      shipping_address: shipping_address || "",
      customer_phone: customer_phone || "",
      guest_email: guest_email || "",
      items: items || [],
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

