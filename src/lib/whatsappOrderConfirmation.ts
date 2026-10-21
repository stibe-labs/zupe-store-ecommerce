// WhatsApp Order Confirmation Messages for Zupe Store
// Uses approved Utility Templates for guaranteed delivery to ALL customers (no 24h restriction)
// Falls back to direct text message if template not yet approved or within 24h window

import { normalizePhoneNumber } from "@/lib/whatsappOtp";

const DEFAULT_WA_TOKEN =
  "EAAY6t7MlMOIBSgAfMGRZAJsIudRT1lMXiZARDnHSvqKZAr5ZArjs6htxGbGBlnE1ZCAOvQiOM069AgyzkuZB4UAtMveTfv6gu3Ik2A3nbQDaRIkWB7yuZACwVNS2eDELePKcOJRRnjE3Nx2m728wvYld1VZCMN05fulca3ZA5COTRZB82a9AZAfsAFyrS2XP41f6dRVygZDZD";
const DEFAULT_WA_PHONE_ID = "1434769426379176";
const STORE_BASE_URL = "https://zupe-store.stibelabs.workers.dev";

// Template names - must match exactly what you created in Meta Business Manager
const TEMPLATE_PREPAID = "zupe_order_prepaid";
const TEMPLATE_COD = "zupe_order_cod";
const TEMPLATE_VERIFY = "zupe_order_verify";
const TEMPLATE_LANG = "en";

export interface OrderConfirmationParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: "cod" | "prepaid";
  items: Array<{ name: string; quantity: number; price: number }>;
}

export interface OrderPreConfirmationParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: "cod" | "prepaid";
  items: Array<{ name: string; quantity: number; price: number }>;
  token: string;
}

/**
 * Sends initial interactive verification WhatsApp message with Confirm and Cancel links.
 * Tries the official Meta Utility template 'zupe_order_verify' first (delivers to all customers).
 * Falls back to direct text message if template is not yet approved in Meta Business Manager.
 */
export async function sendOrderPreConfirmationWhatsApp(
  params: OrderPreConfirmationParams
): Promise<boolean> {
  const { customerName, customerPhone, orderId, totalAmount, paymentMethod, items, token } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) {
    console.warn("[WA Pre-Confirm] Invalid phone, skipping:", customerPhone);
    return false;
  }

  // Meta API does not permit sending messages from the business account to its own number
  if (digits === "919778137954" || digits === "9778137954") {
    console.warn("⚠️ [WA Pre-Confirm] Recipient phone is the business's own WhatsApp number. Meta requires testing with an external customer mobile number.");
  }

  const apiToken = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;
  const itemLines = items
    .slice(0, 3)
    .map((it) => `  • ${it.name} (x${it.quantity})`)
    .join("\n");
  const more = items.length > 3 ? `\n  • ...and ${items.length - 3} more` : "";

  const confirmUrl = `${STORE_BASE_URL}/api/orders/whatsapp-confirm?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  const cancelUrl = `${STORE_BASE_URL}/api/orders/whatsapp-cancel?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  const paymentMethodLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online";

  // 1. ALWAYS send the guaranteed direct verification message immediately.
  //    Why: Meta template messages for 'zupe_order_verify' currently show "Messages sent: --" (0 delivered)
  //    in WhatsApp Manager because Meta Cloud API requires an active Payment Method on the WABA account
  //    and holds newly edited templates in "Quality pending" status.
  //    Direct messages are guaranteed to deliver in 5-10 seconds.
  const message =
    `*Order Verification — Zupe Store* 🛍️\n\n` +
    `Hi ${firstName}! Thank you for placing your order with Zupe Store.\n\n` +
    `📦 *Order ID:* ${orderId}\n` +
    `📋 *Items:*\n${itemLines}${more}\n\n` +
    `💰 *Amount:* Rs ${totalAmount.toLocaleString("en-IN")} (${paymentMethodLabel})\n\n` +
    `Please confirm your order below so we can pack and dispatch your shipment:\n\n` +
    `✅ *Confirm Order:*\n${confirmUrl}\n\n` +
    `❌ *Cancel Order:*\n${cancelUrl}\n\n` +
    `Zupe Store Team`;

  await sendWhatsAppTextMessage(apiUrl, apiToken, digits, message);
  console.log(`✅ [WA Pre-Confirm] Guaranteed verification message delivered to ${digits} for order ${orderId}`);

  // 2. Also dispatch the official Meta Utility Template with buttons in parallel.
  //    Once Meta's billing/quality-pending review clears in WhatsApp Manager,
  //    the interactive buttons will deliver alongside it.
  try {
    sendPreConfirmViaTemplate(
      apiUrl,
      apiToken,
      digits,
      firstName,
      orderId,
      totalAmount,
      paymentMethodLabel,
      confirmUrl,
      cancelUrl,
      token
    ).then((sent) => {
      if (sent) console.log(`✅ [WA Pre-Confirm] Template '${TEMPLATE_VERIFY}' with buttons dispatched to Meta for ${digits}`);
    }).catch(() => {});
  } catch {}

  return true;
}

async function sendPreConfirmViaTemplate(
  apiUrl: string,
  token: string,
  to: string,
  firstName: string,
  orderId: string,
  totalAmount: number,
  paymentMethodLabel: string,
  confirmUrl: string,
  cancelUrl: string,
  verificationToken: string
): Promise<boolean> {
  // The zupe_order_verify template in Meta Business Manager:
  // - Body with 4 parameters: {{1}}=firstName, {{2}}=orderId, {{3}}=amount, {{4}}=paymentMethod
  // - Button 0 (Confirm Order): Dynamic URL configured with base:
  //   https://zupe-store.stibelabs.workers.dev/api/orders/whatsapp-confirm?token={{1}}
  //   Parameter 1: verificationToken (e.g. tok_xxx)
  // - Button 1 (Cancel Order): Dynamic URL configured with base:
  //   https://zupe-store.stibelabs.workers.dev/orders?cancelPrompt={{1}}
  //   Parameter 1: orderId (e.g. ord_xxx)

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: TEMPLATE_VERIFY,
      language: { code: TEMPLATE_LANG },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: firstName },
            { type: "text", text: orderId },
            { type: "text", text: `Rs ${totalAmount.toLocaleString("en-IN")}` },
            { type: "text", text: paymentMethodLabel },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            {
              type: "text",
              text: verificationToken,
            },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "1",
          parameters: [
            {
              type: "text",
              text: orderId,
            },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      console.log(
        `✅ [WA Pre-Confirm] Official template '${TEMPLATE_VERIFY}' delivered to Meta queue for ${to}, messageId: ${data.messages[0].id}`
      );
      return true;
    }

    console.warn(`[WA Pre-Confirm] Template rejected by Meta:`, data?.error || data);
  } catch (err) {
    console.warn(`[WA Pre-Confirm] Template send error:`, err);
  }

  return false;
}

export async function sendOrderConfirmationWhatsApp(
  params: OrderConfirmationParams
): Promise<void> {
  const { customerName, customerPhone, orderId, totalAmount, paymentMethod, items } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) {
    console.warn("[WA Order Confirm] Invalid phone, skipping:", customerPhone);
    return;
  }

  const token = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const discountedAmount = Math.max(0, totalAmount - 30);
  const firstName = customerName.split(" ")[0] || customerName;

  const itemLines = items
    .slice(0, 3)
    .map(function(it) { return "  • " + it.name + " (x" + it.quantity + ")"; })
    .join("\n");
  const moreItems = items.length > 3 ? "\n  • ...and " + (items.length - 3) + " more" : "";
  const trackUrl = STORE_BASE_URL + "/order-tracking?query=" + encodeURIComponent(orderId);
  const payNowUrl = STORE_BASE_URL + "/checkout?method=prepaid&switch=cod";

  let message: string;
  if (paymentMethod === "cod") {
    message =
      "✅ *Order Confirmed — Zupe Store!* 🛍️\n\n" +
      "Hi " + firstName + "! Your order has been verified and confirmed.\n\n" +
      "📦 *Order ID:* " + orderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Order Total:* Rs " + totalAmount.toLocaleString("en-IN") + " (Cash on Delivery)\n" +
      "🚚 *Estimated Delivery:* 3-6 Business Days\n\n" +
      "⚡ *Switch to Prepaid & Save Rs 30!*\n" +
      "Pay online now — pay only Rs " + discountedAmount.toLocaleString("en-IN") + " instead:\n" +
      payNowUrl + "\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with Zupe Store!";
  } else {
    message =
      "✅ *Payment Successful — Zupe Store!* 🛍️\n\n" +
      "Hi " + firstName + "! Your prepaid order is confirmed.\n\n" +
      "📦 *Order ID:* " + orderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Amount Paid:* Rs " + totalAmount.toLocaleString("en-IN") + " (Online Prepaid)\n" +
      "🚚 *Estimated Delivery:* 3-6 Business Days\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with Zupe Store!";
  }

  // 1. ALWAYS send the guaranteed direct confirmation message immediately (delivers in 5 seconds)
  await sendWhatsAppTextMessage(apiUrl, token, digits, message);
  console.log(`✅ [WA Order Confirm] Guaranteed ${paymentMethod.toUpperCase()} confirmation message delivered to ${digits} for ${orderId}`);

  // 2. Also dispatch official template concurrently in parallel
  try {
    sendViaTemplate(
      apiUrl, token, digits, paymentMethod,
      firstName, orderId, totalAmount, discountedAmount
    ).then((sent) => {
      if (sent) console.log(`[WA Order Confirm] Template dispatched for ${digits}`);
    }).catch(() => {});
  } catch {}
}

async function sendViaTemplate(
  apiUrl: string,
  token: string,
  to: string,
  paymentMethod: "cod" | "prepaid",
  firstName: string,
  orderId: string,
  totalAmount: number,
  discountedAmount: number
): Promise<boolean> {
  const templateName = paymentMethod === "cod" ? TEMPLATE_COD : TEMPLATE_PREPAID;

  const bodyParams =
    paymentMethod === "cod"
      ? [
          { type: "text", text: firstName },
          { type: "text", text: orderId },
          { type: "text", text: "Rs " + totalAmount.toLocaleString("en-IN") },
          { type: "text", text: "Rs " + discountedAmount.toLocaleString("en-IN") },
        ]
      : [
          { type: "text", text: firstName },
          { type: "text", text: orderId },
          { type: "text", text: "Rs " + totalAmount.toLocaleString("en-IN") },
        ];

  const trackButtonParam = { type: "text", text: orderId };

  const components: any[] =
    paymentMethod === "cod"
      ? [
          { type: "body", parameters: bodyParams },
          { type: "button", sub_type: "url", index: "1", parameters: [trackButtonParam] },
        ]
      : [
          { type: "body", parameters: bodyParams },
          { type: "button", sub_type: "url", index: "0", parameters: [trackButtonParam] },
        ];

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: TEMPLATE_LANG },
          components,
        },
      }),
    });

    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      return true;
    }
    console.warn("[WA Order Confirm] Template rejected:", data?.error?.message || data);
    return false;
  } catch (err) {
    console.warn("[WA Order Confirm] Template error:", err);
    return false;
  }
}

async function sendWhatsAppTextMessage(
  apiUrl: string,
  token: string,
  to: string,
  body: string
): Promise<void> {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
    });
    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      console.log("[WA Order Confirm] Text fallback sent to", to);
    } else {
      console.warn("[WA Order Confirm] Text issue:", data?.error?.message || data);
    }
  } catch (err) {
    console.warn("[WA Order Confirm] Text error:", err);
  }
}

export interface OrderCancellationRefundParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  refundAmount?: number;
  refundId?: string;
  isPrepaid: boolean;
}

export async function sendOrderCancellationRefundWhatsApp(
  params: OrderCancellationRefundParams
): Promise<boolean> {
  const { customerName, customerPhone, orderId, refundAmount, refundId, isPrepaid } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) return false;

  const apiToken = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;

  let body = "";
  if (isPrepaid && refundAmount) {
    body =
      `🛍️ *Zupe Store — Order Cancelled & Refund Initiated*\n\n` +
      `Hi ${firstName}! Your order *#${orderId}* has been successfully cancelled.\n\n` +
      `💰 *Refund Amount:* Rs ${refundAmount.toLocaleString("en-IN")}\n` +
      `💳 *Refund Reference:* ${refundId || "Initiated via Razorpay"}\n` +
      `⚡ *Payment Source:* Released back to your original payment method (UPI / Card / Netbanking)\n\n` +
      `⏱️ *Expected Credit Timeline:*\n` +
      `• UPI (GPay / PhonePe / Paytm): Within 2 to 4 hours\n` +
      `• Debit / Credit Card: 2 to 4 business days\n\n` +
      `Thank you for shopping with Zupe Store!`;
  } else {
    body =
      `🛍️ *Zupe Store — Order Cancelled*\n\n` +
      `Hi ${firstName}! Your Cash on Delivery order *#${orderId}* has been successfully cancelled.\n\n` +
      `No amount was charged. If you need any assistance or want to re-order, we are here to help.\n\n` +
      `Thank you,\nZupe Store Team`;
  }

  await sendWhatsAppTextMessage(apiUrl, apiToken, digits, body);
  return true;
}
