// WhatsApp Order Confirmation Messages for Zupe Store
// Uses approved Utility Templates for guaranteed delivery to ALL customers (no 24h restriction)
// Falls back to direct text message if template not yet approved or within 24h window

import { normalizePhoneNumber } from "@/lib/whatsappOtp";
import { siteConfig } from "@/config/siteConfig";

const DEFAULT_WA_TOKEN =
  process.env.WHATSAPP_TOKEN ||
  "EAATwm2s3GMYBS7KhJQ2MDiAyAGFS6OwFHiXZAFvfPlyMUg4Jf3wV5e8TPj0PKC8rkE6x9vkzuZANllpjCUHvJaXYAZB6Ursyzc26l0SDJrBEEPJYB4ZB8rjEQ2qTSBI6tEYgZBOTJ47DAmVNAhuyaQAoryvhYiO6vRpAFdE0H61gFXCkwttX5sZCCSyR20kCwOOQZDZD";
const DEFAULT_WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1477900698733187";
let STORE_BASE_URL = siteConfig.url || "https://turkiyejam.com";
if (STORE_BASE_URL.includes("workers.dev") || !STORE_BASE_URL.startsWith("http")) {
  STORE_BASE_URL = "https://turkiyejam.com";
}

// Template names - must match exactly what you created in Meta Business Manager
const TEMPLATE_PREPAID = "turkiyejam_order_update";
const TEMPLATE_COD = "turkiyejam_order_update";
const TEMPLATE_VERIFY = "turkiyejam_order_verify";
const TEMPLATE_UPDATE = "turkiyejam_order_update";
const TEMPLATE_CANCEL_PREPAID = "turkiyejam_order_update";
const TEMPLATE_CANCEL_COD = "turkiyejam_order_update";
const TEMPLATE_LANG = "en";

export interface OrderConfirmationParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: "cod" | "prepaid";
  items: Array<{ name: string; quantity: number; price: number }>;
  advancePaid?: number;
  balanceDue?: number;
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
  if (digits === "916238165935" || digits === "6238165935") {
    console.warn("⚠️ [WA Pre-Confirm] Recipient phone is the business's own WhatsApp number. Meta requires testing with an external customer mobile number.");
  }

  const apiToken = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;
  const safeItems = Array.isArray(items) && items.length > 0
    ? items
    : [{ name: "Turkiye Jam (3 Sachet Pack)", quantity: 1, price: totalAmount || 1099 }];
  const itemLines = safeItems
    .slice(0, 3)
    .map((it) => `  • ${it.name || "Turkiye Jam"} (x${it.quantity || 1})`)
    .join("\n");
  const more = safeItems.length > 3 ? `\n  • ...and ${safeItems.length - 3} more` : "";

  const confirmUrl = `${STORE_BASE_URL}/api/orders/whatsapp-confirm?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  const cancelUrl = `${STORE_BASE_URL}/api/orders/whatsapp-cancel?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  const paymentMethodLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online";

  const codDoorstepDue = totalAmount;
  const displayAmount = totalAmount;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;

  // Log to internal WhatsApp desk
  try {
    const { recordOutboundSystemMessage } = await import("@/lib/whatsappStore");
    await recordOutboundSystemMessage(
      customerPhone,
      `*Order Verification — Turkiye Jam* 🛍️\n\nHi ${firstName}! Thank you for placing your order (${displayOrderId}). Total: ₹${totalAmount} (${paymentMethodLabel}).\n\nPlease confirm your order:\n${confirmUrl}`,
      "order_card",
      {
        orderData: {
          orderId,
          totalAmount,
          itemsSummary: safeItems.map((it) => `${it.name || "Turkiye Jam"} (x${it.quantity || 1})`).join(", "),
          status: "Awaiting WA",
          paymentMethod: paymentMethodLabel,
        },
      }
    );
  } catch (logErr) {}

  // 1. ALWAYS dispatch official Meta Approved Template FIRST!
  // Official templates are 100% guaranteed to deliver to ALL customers outside the 24-hour window.
  let templateSent = false;
  try {
    templateSent = await sendPreConfirmViaTemplate(
      apiUrl,
      apiToken,
      digits,
      firstName,
      displayOrderId,
      displayAmount,
      paymentMethodLabel,
      confirmUrl,
      cancelUrl,
      token
    );
  } catch (err) {
    console.warn("[WA Pre-Confirm] Template send failed:", err);
  }

  if (templateSent) {
    console.log(`✅ [WA Pre-Confirm] Official template '${TEMPLATE_VERIFY}' dispatched for ${digits}`);
  } else {
    // If verify template failed, fallback to confirmed utility template
    try {
      templateSent = await sendViaConfirmedUtilityTemplate(
        apiUrl,
        apiToken,
        digits,
        firstName,
        displayOrderId,
        displayAmount,
        paymentMethodLabel,
        paymentMethod === "cod"
      );
    } catch (err) {
      console.warn("[WA Pre-Confirm] Fallback utility template attempt failed:", err);
    }
  }

  // 2. Also send rich direct message as a companion message if within 24-hour customer window
  try {
    const paymentBreakdownText =
      paymentMethod === "cod"
        ? `💰 *Total Amount:* Rs ${totalAmount.toLocaleString("en-IN")}\n` +
          `📦 *Payable at Doorstep:* Rs ${totalAmount.toLocaleString("en-IN")} (Cash or UPI)\n\n`
        : `💰 *Amount Paid:* Rs ${totalAmount.toLocaleString("en-IN")} (Prepaid)\n\n`;

    const message =
      `*Order Verification — Turkiye Jam* 🛍️\n\n` +
      `Hi ${firstName}! Thank you for placing your order with Turkiye Jam.\n\n` +
      `📦 *Order ID:* ${displayOrderId}\n` +
      `📋 *Items:*\n${itemLines}${more}\n\n` +
      paymentBreakdownText +
      `Please confirm your order below so we can pack and dispatch your shipment:\n\n` +
      `✅ *Confirm Order:*\n${confirmUrl}\n\n` +
      `❌ *Cancel Order:*\n${cancelUrl}\n\n` +
      `Turkiye Jam Team`;

    await sendWhatsAppTextMessage(apiUrl, apiToken, digits, message);
  } catch (err) {
    console.warn("[WA Pre-Confirm] Companion direct message dispatch warning:", err);
  }

  return templateSent;
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
  //   https://turkiyejam.com/api/orders/whatsapp-confirm?token={{1}}
  //   Parameter 1: verificationToken (e.g. tok_xxx)
  // - Button 1 (Cancel Order): Dynamic URL configured with base:
  //   https://turkiyejam.com/orders?cancelPrompt={{1}}
  //   Parameter 1: clean orderId (e.g. 1567 or ord_xxx)

  const cleanButtonOrderId = (orderId || "").replace(/^#/, "");

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

export const sendWhatsAppOrderConfirmation = sendOrderConfirmationWhatsApp;

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

  const advanceAmount = Number(params.advancePaid) || 0;
  const isPartialCod = params.paymentMethod === "cod" && advanceAmount > 0;

  // For COD: doorstep balance = what customer pays at delivery (total minus advance already paid online)
  // Ensure that if advance was paid, it is ALWAYS subtracted from total
  const doorstepAmount = params.paymentMethod === "cod"
    ? (isPartialCod
        ? Math.max(0, totalAmount - advanceAmount)
        : (params.balanceDue !== undefined && params.balanceDue < totalAmount ? params.balanceDue : totalAmount))
    : 0;
  const doorstepBalance = doorstepAmount;
  const switchPrepaidAmount = doorstepAmount;
  const productSubtotal = totalAmount >= 49 ? totalAmount - 49 : totalAmount;
  const firstName = customerName.split(" ")[0] || customerName;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;
  const cleanUrlOrderId = orderId.replace(/^#/, "");

  const safeItems = Array.isArray(items) && items.length > 0
    ? items
    : [{ name: "Turkiye Jam (3 Sachet Pack)", quantity: 1, price: totalAmount || 1099 }];

  // Log confirmation to internal WhatsApp desk
  try {
    const { recordOutboundSystemMessage } = await import("@/lib/whatsappStore");
    await recordOutboundSystemMessage(
      customerPhone,
      `🎉 *Order Confirmed — Turkiye Jam* 🌿\n\nYour order (${displayOrderId}) of ₹${totalAmount} has been confirmed and submitted for packing & dispatch!`,
      "order_card",
      {
        orderData: {
          orderId,
          totalAmount,
          itemsSummary: safeItems.map((it) => `${it.name || "Turkiye Jam"} (x${it.quantity || 1})`).join(", "),
          status: "Confirmed",
          paymentMethod: paymentMethod === "cod" ? "COD" : "Prepaid",
        },
      }
    );
  } catch (logErr) {}
  const itemLines = safeItems
    .slice(0, 3)
    .map(function(it) { return "  • " + (it.name || "Turkiye Jam") + " (x" + (it.quantity || 1) + ")"; })
    .join("\n");
  const moreItems = safeItems.length > 3 ? "\n  • ...and " + (safeItems.length - 3) + " more" : "";
  const trackUrl = STORE_BASE_URL + "/order-tracking?query=" + encodeURIComponent(cleanUrlOrderId);

  let message: string;
  if (paymentMethod === "cod") {
    message =
      "✅ *Order Confirmed — Turkiye Jam!* 🛍️\n\n" +
      "Hi " + firstName + "! Your Cash on Delivery order is confirmed.\n\n" +
      "📦 *Order ID:* " + displayOrderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Price Breakdown:*\n" +
      "  • Total Amount: Rs " + totalAmount.toLocaleString("en-IN") + "\n" +
      (isPartialCod ? "  • Online Advance Paid: Rs " + advanceAmount.toLocaleString("en-IN") + " (via Cashfree)\n" : "") +
      "  • *Payable on Delivery: Rs " + doorstepAmount.toLocaleString("en-IN") + " (Cash / UPI)*\n\n" +
      "🚚 *Estimated Delivery:* 3-5 Business Days\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with Turkiye Jam!";
  } else {
    message =
      "✅ *Payment Successful — Turkiye Jam!* 🛍️\n\n" +
      "Hi " + firstName + "! Your prepaid order is confirmed.\n\n" +
      "📦 *Order ID:* " + displayOrderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Amount Paid:* Rs " + totalAmount.toLocaleString("en-IN") + " (Online Prepaid)\n" +
      "🚚 *Estimated Delivery:* 5-7 Business Days\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with Turkiye Jam!";
  }

  // 1. ALWAYS dispatch official approved Meta Utility template FIRST!
  // Meta Utility templates are 100% guaranteed to deliver to ALL customers outside the 24-hour service window.
  const paymentMethodLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online";
  const displayAmount = paymentMethod === "cod" ? doorstepAmount : totalAmount;

  try {
    await sendViaConfirmedUtilityTemplate(
      apiUrl,
      token,
      digits,
      firstName,
      displayOrderId,
      displayAmount,
      paymentMethodLabel,
      paymentMethod === "cod"
    );
  } catch (err) {
    console.warn("[WA Order Confirm] Utility template dispatch error:", err);
  }

  // 2. Also send the complete itemized direct WhatsApp message as a companion message.
  // Note: Meta delivers direct text messages if customer is within the 24-hour service window.
  try {
    const directSent = await sendWhatsAppTextMessage(apiUrl, token, digits, message);
    if (directSent) {
      console.log(`✅ [WA Order Confirm] Companion itemized text sent to ${digits} for order ${displayOrderId}`);
    }
  } catch (err) {
    console.warn("[WA Order Confirm] Companion direct message dispatch warning:", err);
  }
}

async function sendViaCodV2Template(
  apiUrl: string,
  token: string,
  to: string,
  firstName: string,
  orderId: string,
  totalAmount: number,
  discountedAmount: number
): Promise<boolean> {
  const cleanButtonOrderId = (orderId || "").replace(/^#/, "");

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: "zupe_order_cod_v2",
      language: { code: TEMPLATE_LANG },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: firstName },
            { type: "text", text: orderId },
            { type: "text", text: `Rs ${totalAmount.toLocaleString("en-IN")}` },
            { type: "text", text: `Rs ${discountedAmount.toLocaleString("en-IN")}` },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: cleanButtonOrderId }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "1",
          parameters: [{ type: "text", text: cleanButtonOrderId }],
        },
      ],
    },
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      console.log(`✅ [WA Order Confirm] Utility template 'zupe_order_cod_v2' with Pay Online and Track buttons dispatched to ${to}`);
      return true;
    }
    console.warn("[WA Order Confirm] COD V2 template rejected:", data?.error || data);
  } catch (err) {
    console.warn("[WA Order Confirm] COD V2 template error:", err);
  }
  return false;
}

async function sendViaConfirmedUtilityTemplate(
  apiUrl: string,
  token: string,
  to: string,
  firstName: string,
  orderId: string,
  totalAmount: number,
  paymentMethodLabel: string,
  isCod?: boolean
): Promise<boolean> {
  const cleanUrlOrderId = (orderId || "").replace(/^#/, "");
  const trackInvoiceUrl = `${STORE_BASE_URL}/order-tracking?query=${encodeURIComponent(cleanUrlOrderId)}`;
  const effectiveIsCod = isCod !== undefined ? isCod : (paymentMethodLabel || "").toLowerCase().includes("cod");
  const p2Text = effectiveIsCod ? `${orderId} (COD Confirmed)` : `${orderId} (Confirmed)`;
  const p3Text = effectiveIsCod
    ? `Rs ${totalAmount.toLocaleString("en-IN")} due at delivery. Track parcel: ${trackInvoiceUrl}`
    : `Rs ${totalAmount.toLocaleString("en-IN")}. Track package & view invoice: ${trackInvoiceUrl}`;

  const langCandidates = [TEMPLATE_LANG, TEMPLATE_LANG === "en" ? "en_US" : "en"];

  for (const lang of Array.from(new Set(langCandidates))) {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: "turkiyejam_order_update",
        language: { code: lang },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: firstName },
              { type: "text", text: p2Text },
              { type: "text", text: p3Text },
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
      });
      const data = (await res.json()) as any;
      if (res.ok && data.messages?.length > 0) {
        console.log(`✅ [WA Order Confirm] Utility template 'turkiyejam_order_update' (${lang}) delivered for ${orderId} to ${to}, messageId: ${data.messages[0].id}`);
        return true;
      }
      console.warn(`[WA Order Confirm] Utility template '${lang}' rejected:`, data?.error?.message || data?.error || data);
      if (data?.error?.code !== 132001) {
        break; // not a language error, don't retry with other language
      }
    } catch (err) {
      console.warn("[WA Order Confirm] Utility template error:", err);
    }
  }
  return false;
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

  const cleanButtonOrderId = (orderId || "").replace(/^#/, "");
  const trackButtonParam = { type: "text", text: cleanButtonOrderId };

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
): Promise<boolean> {
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
      return true;
    } else {
      console.warn("[WA Order Confirm] Text issue:", data?.error?.message || data);
      return false;
    }
  } catch (err) {
    console.warn("[WA Order Confirm] Text error:", err);
    return false;
  }
}

export interface OrderCancellationRefundParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  refundAmount?: number;
  refundId?: string;
  isPrepaid: boolean;
  totalAmount?: number;
}

export async function sendOrderCancellationRefundWhatsApp(
  params: OrderCancellationRefundParams
): Promise<boolean> {
  const { customerName, customerPhone, orderId, refundAmount, refundId, isPrepaid, totalAmount } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) return false;

  const apiToken = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;
  const effectiveTotal = totalAmount !== undefined ? totalAmount : (refundAmount || 0);

  // 1. Prepare rich structured message text
  let body = "";
  if (isPrepaid && refundAmount) {
    body =
      `🛍️ *Turkiye Jam — Order Cancelled & Refund Initiated*\n\n` +
      `Hi ${firstName}! Your order *${displayOrderId}* has been successfully cancelled.\n\n` +
      `💰 *Refund Amount:* Rs ${refundAmount.toLocaleString("en-IN")}\n` +
      `💳 *Refund Reference:* ${refundId || "Initiated via Razorpay / Instant Refund"}\n` +
      `⚡ *Payment Source:* Released back to your original payment method (UPI / Card / Netbanking)\n\n` +
      `⏱️ *Expected Credit Timeline:*\n` +
      `• UPI (GPay, PhonePe, Paytm): Usually credited within 2 to 4 hours\n` +
      `• Debit / Credit Cards / Netbanking: Credited within 2 to 4 business days\n\n` +
      `Thank you for shopping with Turkiye Jam!`;
  } else {
    body =
      `🛍️ *Turkiye Jam — Order Cancelled*\n\n` +
      `Hi ${firstName}! Your Cash on Delivery order *${displayOrderId}* has been successfully cancelled.\n\n` +
      `📦 *Status:* Shipment cancelled. No payment will be collected at your doorstep.\n\n` +
      `If you need any assistance or wish to re-order, we are always here to help.\n\n` +
      `Thank you,\nTurkiye Jam Team`;
  }

  // 2. Log into internal WhatsApp desk and D1
  try {
    const { recordOutboundSystemMessage } = await import("@/lib/whatsappStore");
    await recordOutboundSystemMessage(
      customerPhone,
      body,
      "order_card",
      {
        orderData: {
          orderId,
          totalAmount: isPrepaid ? (refundAmount || 0) : effectiveTotal,
          itemsSummary: isPrepaid ? `Refund Initiated (Ref: ${refundId || "Automated"})` : "Order Cancelled",
          status: "Cancelled",
          paymentMethod: isPrepaid ? "Refunded" : "Cancelled",
        },
      }
    );
  } catch (logErr) {
    console.warn("[WA Cancel] Desk logging error:", logErr);
  }

  // 3. ALWAYS dispatch official Meta Utility template FIRST!
  let templateSent = false;
  try {
    const cleanUrlOrderId = orderId.replace(/^#/, "");
    const trackUrl = `${STORE_BASE_URL}/order-tracking?query=${encodeURIComponent(cleanUrlOrderId)}`;
    const p1 = firstName;
    const p2 = `${displayOrderId} (Cancelled)`;
    const p3 = isPrepaid && refundAmount
      ? `Refund: Rs ${refundAmount.toLocaleString("en-IN")}. View details: ${trackUrl}`
      : `Rs ${effectiveTotal.toLocaleString("en-IN")} (Cancelled). View details: ${trackUrl}`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: digits,
      type: "template",
      template: {
        name: TEMPLATE_UPDATE,
        language: { code: TEMPLATE_LANG },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: p1 },
              { type: "text", text: p2 },
              { type: "text", text: p3 },
            ],
          },
        ],
      },
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      console.log(`✅ [WA Cancel] Official template '${TEMPLATE_UPDATE}' dispatched for order ${orderId} to ${digits}`);
      templateSent = true;
    } else {
      console.warn(`[WA Cancel] Template rejected by Meta for ${digits}:`, data?.error || data);
    }
  } catch (tErr) {
    console.warn(`[WA Cancel] Template send error:`, tErr);
  }

  // 4. Also send rich direct cancellation message as companion text if within 24h window
  try {
    await sendWhatsAppTextMessage(apiUrl, apiToken, digits, body);
  } catch (err) {
    console.warn("[WA Cancel] Direct text send error:", err);
  }

  return templateSent;
}

export interface OrderTransitWhatsAppParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  status:
    | "In Transit"
    | "Out for Delivery"
    | "Delivered"
    | "NDR"
    | "RTO In Transit"
    | "RTO Delivered"
    | "Cancelled"
    | string;
  courierName?: string;
  awb?: string;
  totalAmount?: number;
  paymentMethod?: "cod" | "prepaid" | string;
  advancePaid?: number;
  balanceDue?: number;
  ndrReason?: string;
  items?: Array<any>;
}

/**
 * Sends official WhatsApp Transit & Delivery lifecycle notifications to customers.
 * Uses approved Meta utility template 'turkiyejam_order_update' (3 params) for 100% guaranteed delivery
 * even outside the 24-hour customer window, plus delivers rich direct tracking cards.
 */
export async function sendOrderTransitWhatsApp(
  params: OrderTransitWhatsAppParams
): Promise<boolean> {
  const {
    customerName,
    customerPhone,
    orderId,
    status,
    courierName,
    awb,
    totalAmount = 0,
    paymentMethod = "cod",
    advancePaid = 0,
    balanceDue,
    ndrReason,
  } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) {
    console.warn("[WA Transit] Invalid phone, skipping:", customerPhone);
    return false;
  }

  const apiToken = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;
  const cleanUrlOrderId = orderId.replace(/^#/, "");

  const cleanAwb = (awb || "").trim();
  const hasRealAwb = Boolean(
    cleanAwb &&
      !cleanAwb.startsWith("SR-AWB-") &&
      !cleanAwb.startsWith("TEMP-") &&
      !cleanAwb.toUpperCase().includes("PENDING")
  );
  const trackingRef = hasRealAwb ? cleanAwb : displayOrderId;
  const trackQueryParam = encodeURIComponent(hasRealAwb ? cleanAwb : cleanUrlOrderId);
  const trackUrl = `${STORE_BASE_URL}/order-tracking?query=${trackQueryParam}`;
  const invoiceUrl = `${STORE_BASE_URL}/invoice?query=${trackQueryParam}`;

  const isCod =
    paymentMethod?.toLowerCase().includes("cod") ||
    paymentMethod?.toLowerCase().includes("cash on delivery");
  const isPartialCod = isCod && advancePaid > 0;
  const doorstepAmount = isCod
    ? (isPartialCod
        ? Math.max(0, totalAmount - advancePaid)
        : (balanceDue !== undefined && balanceDue < totalAmount ? balanceDue : totalAmount))
    : 0;

  // Prepare parameters for official Meta utility template: turkiyejam_order_update
  // Exactly 3 body parameters: {{1}}=Name, {{2}}=Order/Headline, {{3}}=Amount/Status
  let templateP2 = `${displayOrderId} Update`;
  let templateP3 = `Rs ${totalAmount.toLocaleString("en-IN")}. Track package & view invoice: ${trackUrl}`;
  let richBody = "";
  let deskMsgType: "tracking_card" | "order_card" = "tracking_card";

  switch (status) {
    case "In Transit":
      templateP2 = hasRealAwb
        ? `${displayOrderId} (Dispatched via ${courierName || "Courier"}, Tracking ID: ${cleanAwb})`
        : `${displayOrderId} (Dispatched via ${courierName || "Courier"})`;
      templateP3 = hasRealAwb
        ? `Rs ${totalAmount.toLocaleString("en-IN")}. Track package & view invoice: ${trackUrl}`
        : `Rs ${totalAmount.toLocaleString("en-IN")} (Tracking Ref: ${displayOrderId}). Track package & view invoice: ${trackUrl}`;
      richBody =
        `🚀 *Order Dispatched — Turkiye Jam!* 📦\n\n` +
        `Hi ${firstName}! Great news, your order *${displayOrderId}* has been packed and handed over to ${courierName || "our courier partner"}.\n\n` +
        `📦 *Tracking ID / AWB:* ${hasRealAwb ? cleanAwb : displayOrderId}\n` +
        `🚚 *Carrier Partner:* ${courierName || "Express Courier"}\n` +
        (isCod
          ? `💰 *Payable at Doorstep:* Rs ${doorstepAmount.toLocaleString("en-IN")} (Cash or UPI)\n`
          : `💰 *Payment Status:* Paid Online (Prepaid)\n`) +
        `⏱️ *Estimated Delivery:* 2 to 4 business days in discreet packaging\n\n` +
        `📍 *Track Your Shipment Live:*\n${trackUrl}\n\n` +
        `📄 *Download Tax Invoice:*\n${invoiceUrl}\n\n` +
        `Thank you for choosing Turkiye Jam! 🌿`;
      break;

    case "Out for Delivery":
      templateP2 = hasRealAwb
        ? `${displayOrderId} (Out for Delivery Today via ${courierName || "Courier"}, Tracking ID: ${cleanAwb})`
        : `${displayOrderId} (Out for Delivery Today via ${courierName || "Courier"})`;
      templateP3 = isCod
        ? `Rs ${totalAmount.toLocaleString("en-IN")} (Payable at doorstep: Rs ${doorstepAmount.toLocaleString("en-IN")}). Track delivery & view invoice: ${trackUrl}`
        : `Rs ${totalAmount.toLocaleString("en-IN")} (Prepaid Online). Track delivery & view invoice: ${trackUrl}`;
      richBody =
        `🛵 *Out for Delivery Today — Turkiye Jam!* 📦\n\n` +
        `Hi ${firstName}! Your package for order *${displayOrderId}* is out for delivery today with our delivery executive (${courierName || "Courier"}).\n\n` +
        `📦 *Tracking ID / AWB:* ${hasRealAwb ? cleanAwb : displayOrderId}\n` +
        (isCod
          ? `💰 *Please keep Rs ${doorstepAmount.toLocaleString("en-IN")} ready at doorstep (Cash or UPI).*`
          : `✅ *Prepaid Order:* No payment needed at your doorstep.`) +
        `\n\nPlease ensure someone is available at your address to receive the parcel.\n\n` +
        `📍 *Track Package:*\n${trackUrl}\n\n` +
        `📄 *Download Tax Invoice:*\n${invoiceUrl}\n\n` +
        `Turkiye Jam Team`;
      break;

    case "Delivered":
      templateP2 = `${displayOrderId} (Successfully Delivered)`;
      templateP3 = `Rs ${totalAmount.toLocaleString("en-IN")}. View & download your tax invoice: ${trackUrl}`;
      deskMsgType = "order_card";
      richBody =
        `🎉 *Order Delivered — Turkiye Jam!* 🍯🌿\n\n` +
        `Hi ${firstName}! Your Turkiye Jam package *${displayOrderId}* has been successfully delivered.\n\n` +
        `📄 *Download Tax Invoice:*\n${invoiceUrl}\n\n` +
        `🌿 We hope you love your experience!\n\n` +
        `📖 *Usage & Dosage Guide:*\n` +
        `1. Take 1 sachet 30–45 minutes before bedtime.\n` +
        `2. Mix with warm milk or lukewarm water, or consume directly.\n` +
        `3. Drink 1–2 glasses of water afterwards.\n\n` +
        `Have questions or need dosage advice? Just reply to this WhatsApp chat!\n\n` +
        `Thank you for shopping with Turkiye Jam!`;
      break;

    case "NDR":
      templateP2 = `${displayOrderId} (Delivery Re-attempt Scheduled)`;
      templateP3 = `Rs ${totalAmount.toLocaleString("en-IN")}. Track shipment: ${trackUrl}`;
      richBody =
        `⚠️ *Delivery Attempt Update — Turkiye Jam* 📦\n\n` +
        `Hi ${firstName}! Our courier partner (${courierName || "Courier"}) attempted delivery of your order *${displayOrderId}* today, but could not complete it (${ndrReason || "Customer unreachable / door closed"}).\n\n` +
        `Don't worry! A delivery re-attempt is scheduled for the next business day.\n\n` +
        `If you need to update your landmark, alternate phone number, or delivery instructions, please reply directly to this message!\n\n` +
        `📍 *Track shipment:*\n${trackUrl}\n\n` +
        `📄 *Download Tax Invoice:*\n${invoiceUrl}\n\n` +
        `Turkiye Jam Support`;
      break;

    case "RTO In Transit":
    case "RTO Delivered":
      templateP2 = `${displayOrderId} (Package Returning)`;
      templateP3 = `Rs ${totalAmount.toLocaleString("en-IN")} (Status: Returned). Track: ${trackUrl}`;
      richBody =
        `📦 *Turkiye Jam — Delivery Update*\n\n` +
        `Hi ${firstName}! The parcel for order *${displayOrderId}* could not be delivered after repeated attempts and is returning to our warehouse.\n\n` +
        `If you still wish to receive your order or would like to provide an updated address, please reply directly to this message.\n\n` +
        `Turkiye Jam Support`;
      break;

    default:
      templateP2 = hasRealAwb
        ? `${displayOrderId} (${status}, Tracking ID: ${cleanAwb})`
        : `${displayOrderId} (${status})`;
      templateP3 = `Rs ${totalAmount.toLocaleString("en-IN")}. Track package & view invoice: ${trackUrl}`;
      richBody =
        `📦 *Turkiye Jam — Order Status Update*\n\n` +
        `Hi ${firstName}! Your order *${displayOrderId}* status has been updated to: *${status}*.\n\n` +
        `📍 *Track Order:*\n${trackUrl}\n\n` +
        `📄 *Download Tax Invoice:*\n${invoiceUrl}\n\n` +
        `Turkiye Jam Team`;
      break;
  }

  // 1. Log to internal WhatsApp desk
  try {
    const { recordOutboundSystemMessage } = await import("@/lib/whatsappStore");
    await recordOutboundSystemMessage(
      customerPhone,
      richBody,
      deskMsgType,
      {
        orderData: {
          orderId,
          totalAmount,
          itemsSummary: `Status: ${status}${courierName ? ` via ${courierName}` : ""}${awb ? ` (${awb})` : ""}`,
          status,
          paymentMethod: isCod ? "COD" : "Prepaid",
          awb,
          courier: courierName,
        },
      }
    );
  } catch (logErr) {
    console.warn("[WA Transit] Desk log warning:", logErr);
  }

  // 2. ALWAYS dispatch official Meta Utility template FIRST!
  let templateSent = false;
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: digits,
      type: "template",
      template: {
        name: TEMPLATE_UPDATE,
        language: { code: TEMPLATE_LANG },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: firstName },
              { type: "text", text: templateP2 },
              { type: "text", text: templateP3 },
            ],
          },
        ],
      },
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      console.log(`✅ [WA Transit] Official template '${TEMPLATE_UPDATE}' dispatched for order ${orderId} (${status}) to ${digits}`);
      templateSent = true;
    } else {
      console.warn(`[WA Transit] Template rejected by Meta for ${digits}:`, data?.error || data);
    }
  } catch (tErr) {
    console.warn(`[WA Transit] Template send error:`, tErr);
  }

  // 3. Also send structured rich transit card message as companion text if within 24h window
  try {
    await sendWhatsAppTextMessage(apiUrl, apiToken, digits, richBody);
  } catch (textErr) {
    console.warn("[WA Transit] Direct text companion warning:", textErr);
  }

  return templateSent;
}

export interface AbandonedCartWhatsAppParams {
  customerName?: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price?: number }>;
  totalAmount: number;
  recoveryUrl: string;
  source?: "checkout" | "cart";
}

export async function sendAbandonedCartWhatsApp(
  params: AbandonedCartWhatsAppParams
): Promise<boolean> {
  const { customerName, customerPhone, items, totalAmount, recoveryUrl, source = "checkout" } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) {
    console.warn("[WA Abandoned Cart] Invalid phone:", customerPhone);
    return false;
  }

  const apiToken = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName?.trim() ? customerName.split(" ")[0] : "there";
  
  // Format items showing name and price
  const itemLines = (items || [])
    .slice(0, 4)
    .map((it) => {
      const priceStr = it.price ? ` — ₹${Number(it.price).toLocaleString("en-IN")}` : "";
      const qtyStr = it.quantity > 1 ? ` (x${it.quantity})` : "";
      return `• ${it.name}${qtyStr}${priceStr}`;
    })
    .join("\n");
  const more = (items || []).length > 4 ? `\n• ...and ${(items || []).length - 4} more item(s)` : "";

  const sectionName = source === "cart" ? "cart" : "checkout section";
  const actionText = source === "cart"
    ? "👉 Tap here to view your cart & complete your order:"
    : "👉 Tap here to complete your order in 1 click:";

  const body =
    `Hi ${firstName}! We noticed you left some great items in your ${sectionName} at Turkiye Jam:\n\n` +
    `${itemLines}${more}\n\n` +
    `⚡ Currently this is a great price! Plus, if you order now, you get Free Delivery without any extra charges.\n\n` +
    `${actionText}\n${recoveryUrl}\n\n` +
    `Need any assistance? Just reply to this message!\n` +
    `Turkiye Jam Team`;

  const textSent = await sendWhatsAppTextMessage(apiUrl, apiToken, digits, body);
  if (textSent) {
    console.log(`✅ [WA Abandoned Cart] Recovery WhatsApp message (${source}) dispatched to ${digits}`);
  } else {
    console.warn(`⚠️ [WA Abandoned Cart] Cloud API text delivery failed for ${digits}. Customer may be outside 24h window.`);
  }

  // Concurrently attempt official template dispatch (for when template is approved in Meta)
  try {
    const tokenPart = recoveryUrl.split("recover=")[1] || "";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digits,
        type: "template",
        template: {
          name: "zupe_abandoned_cart",
          language: { code: TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: "Rs " + totalAmount.toLocaleString("en-IN") },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: tokenPart }],
            },
          ],
        },
      }),
    });
    const data = (await res.json()) as any;
    if (res.ok && data.messages?.length > 0) {
      console.log(`✅ [WA Abandoned Cart] Official template 'zupe_abandoned_cart' dispatched to ${digits}`);
      return true;
    }
  } catch {}

  return textSent;
}
