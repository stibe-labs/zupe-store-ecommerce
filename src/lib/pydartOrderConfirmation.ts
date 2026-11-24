import { siteConfig } from "@/config/siteConfig";
import { executeD1Query } from "@/lib/d1";
import { updateERPOrder } from "@/lib/erpStore";
import { updateStorefrontOrder } from "@/lib/orderStore";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsappOrderConfirmation";
import { sendOrderConfirmationEmail } from "@/lib/orderEmailService";

export interface ConfirmVerifiedOrderPaymentInput {
  order: any;
  effectiveOrderId: string;
  isCodOrder: boolean;
  orderTotal: number;
  verifiedAmountRupees: number;
  paymentId: string;
  gatewayLabel: "PyDart Pay" | "Cashfree";
}

export interface ConfirmVerifiedOrderPaymentResult {
  accepted: boolean;
  alreadyConfirmed: boolean;
  advancePaid: number;
  balanceDue: number;
  rawItems: any[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export function parseStoredItems(raw: unknown): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function claimPaymentReferenceOnce(params: {
  gatewayPaymentId: string;
  gateway: string;
  orderId: string;
  amountPaise: number;
}): Promise<{ accepted: boolean; alreadyClaimedForSameOrder: boolean }> {
  try {
    await executeD1Query(
      `CREATE TABLE IF NOT EXISTS verified_payments (
        gateway_payment_id TEXT PRIMARY KEY,
        gateway TEXT NOT NULL,
        order_id TEXT NOT NULL,
        amount_paise INTEGER NOT NULL,
        verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    );

    const existing = await executeD1Query<{ order_id: string }>(
      `SELECT order_id FROM verified_payments WHERE gateway_payment_id = ? LIMIT 1`,
      [params.gatewayPaymentId]
    );
    if (existing && existing.length > 0) {
      if (String(existing[0].order_id) === params.orderId) {
        return { accepted: true, alreadyClaimedForSameOrder: true };
      }
      return { accepted: false, alreadyClaimedForSameOrder: false };
    }

    await executeD1Query(
      `INSERT OR IGNORE INTO verified_payments (gateway_payment_id, gateway, order_id, amount_paise, verified_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        params.gatewayPaymentId,
        params.gateway,
        params.orderId,
        params.amountPaise,
        new Date().toISOString(),
      ]
    );
    return { accepted: true, alreadyClaimedForSameOrder: false };
  } catch {
    // Allow confirmation if D1 audit table is unavailable in local fallback mode
    return { accepted: true, alreadyClaimedForSameOrder: false };
  }
}

/**
 * Shared atomic, idempotent order confirmation pipeline used by both:
 *  1. Browser redirect verification (`/api/cashfree/verify-payment`)
 *  2. Asynchronous HMAC-signed PyDart Pay webhooks (`/api/webhooks/pydart`)
 */
export async function confirmVerifiedOrderPayment(
  input: ConfirmVerifiedOrderPaymentInput
): Promise<ConfirmVerifiedOrderPaymentResult> {
  const {
    order,
    effectiveOrderId,
    isCodOrder,
    orderTotal,
    verifiedAmountRupees,
    paymentId,
    gatewayLabel,
  } = input;

  const custName = order?.customer_name || "Valued Customer";
  const custPhone = order?.customer_phone || "";
  const custEmail = (order?.guest_email || order?.customer_email || "").trim();
  const rawItems = parseStoredItems(order?.items);

  const advancePaid = isCodOrder ? verifiedAmountRupees : orderTotal;
  const balanceDue = isCodOrder ? Math.max(0, orderTotal - advancePaid) : 0;

  const claim = await claimPaymentReferenceOnce({
    gatewayPaymentId: paymentId,
    gateway: gatewayLabel === "PyDart Pay" ? "pydart" : "cashfree",
    orderId: effectiveOrderId,
    amountPaise: Math.round(verifiedAmountRupees * 100),
  });

  if (!claim.accepted) {
    return {
      accepted: false,
      alreadyConfirmed: false,
      advancePaid,
      balanceDue,
      rawItems,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
    };
  }

  if (claim.alreadyClaimedForSameOrder) {
    return {
      accepted: true,
      alreadyConfirmed: true,
      advancePaid,
      balanceDue,
      rawItems,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
    };
  }

  await updateERPOrder(effectiveOrderId, {
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
         remittance_status = ?,
         razorpay_payment_id = ?
     WHERE id = ? OR shopify_order_id = ?`,
    [
      isCodOrder ? "Cash on Delivery" : "Prepaid",
      isCodOrder ? "Pending" : "Completed",
      advancePaid,
      balanceDue,
      isCodOrder ? 1 : 0,
      isCodOrder ? "Pending" : "Settled",
      paymentId,
      effectiveOrderId,
      effectiveOrderId,
    ]
  ).catch(() => null);

  try {
    updateStorefrontOrder(effectiveOrderId, {
      payment_method: isCodOrder ? "Cash on Delivery" : "Prepaid",
      payment_status: isCodOrder ? "pending" : "paid",
      order_status: "processing",
      whatsapp_confirm_status: "confirmed",
      advance_paid: advancePaid,
      balance_due: balanceDue,
      is_cod_partial: isCodOrder ? 1 : 0,
    });
  } catch {}

  const displayOrderId = order?.shopify_order_id || effectiveOrderId;

  await Promise.allSettled([
    (async () => {
      const targetUserId = String(order?.user_id || "").trim();
      if (!targetUserId) return;
      await executeD1Query(
        `INSERT OR REPLACE INTO user_carts (user_id, cart_data, updated_at) VALUES (?, '[]', ?)`,
        [targetUserId, new Date().toISOString()]
      );
    })(),
    (async () => {
      if (!custPhone) return;
      await sendOrderConfirmationWhatsApp({
        customerName: custName,
        customerPhone: custPhone,
        orderId: displayOrderId,
        totalAmount: orderTotal,
        paymentMethod: isCodOrder ? "cod" : "prepaid",
        advancePaid: isCodOrder ? advancePaid : undefined,
        balanceDue: isCodOrder ? balanceDue : undefined,
        items: rawItems.map((it: any) => ({
          name: it.product_name || it.name || "Turkiye Jam",
          quantity: Number(it.quantity || 1),
          price: Number(it.unit_price || it.price || 0),
        })),
      });
    })(),
    (async () => {
      if (!custPhone) return;
      const { notifyAdminNewOrder, notifyAdminPaymentReceived } = await import(
        "@/lib/adminNotification"
      );
      await Promise.allSettled([
        notifyAdminNewOrder({
          orderId: displayOrderId,
          customerName: custName,
          customerPhone: custPhone,
          totalAmount: orderTotal,
          paymentMethod: isCodOrder ? "Cash on Delivery" : "Online Prepaid",
          paymentStatus: "Paid",
          advancePaid: isCodOrder ? advancePaid : undefined,
          balanceDue: isCodOrder ? balanceDue : undefined,
          shippingAddress: order?.shipping_address || "",
          city: order?.city || "",
          postalCode: order?.postal_code || "",
          items: rawItems.map((it: any) => ({
            name: it.product_name || it.name || "Turkiye Jam",
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_price || it.price || 0),
          })),
        }),
        notifyAdminPaymentReceived({
          amount: verifiedAmountRupees,
          orderId: displayOrderId,
          customerName: custName,
          customerPhone: custPhone,
          paymentMethod: isCodOrder
            ? `${gatewayLabel} UPI (COD Advance)`
            : `${gatewayLabel} UPI / Online`,
          bankReference: paymentId,
          paymentType: isCodOrder
            ? "COD Advance (₹49)"
            : "Full Online Prepaid",
          totalOrderAmount: orderTotal,
          balanceDue,
        }),
      ]);
    })(),
    (async () => {
      const cleanDigits = custPhone.replace(/\D/g, "").slice(-10);
      if (!cleanDigits) return;
      await executeD1Query(
        `UPDATE abandoned_checkouts
         SET status = 'recovered', recovered_order_id = ?
         WHERE customer_phone LIKE ? AND status = 'abandoned'`,
        [effectiveOrderId, `%${cleanDigits}`]
      );
    })(),
    (async () => {
      if (!custEmail || siteConfig.isSyntheticEmail(custEmail)) return;
      await sendOrderConfirmationEmail({
        orderId: effectiveOrderId,
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: custPhone,
        shippingAddress: order?.shipping_address || "",
        city: order?.city || "",
        postalCode: order?.postal_code || "",
        totalAmount: orderTotal,
        discountAmount: Number(order?.discount_amount || 0),
        paymentMethod: isCodOrder
          ? `Cash on Delivery (₹${advancePaid} Advance Paid)`
          : `Online Payment (${gatewayLabel})`,
        paymentStatus: isCodOrder ? "pending" : "paid",
        items: rawItems,
        createdAt: order?.created_at || new Date().toISOString(),
      });
    })(),
  ]);

  return {
    accepted: true,
    alreadyConfirmed: false,
    advancePaid,
    balanceDue,
    rawItems,
    customerName: custName,
    customerPhone: custPhone,
    customerEmail: custEmail,
  };
}
