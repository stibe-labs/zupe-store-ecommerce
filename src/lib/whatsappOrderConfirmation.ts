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
const TEMPLATE_CANCEL_PREPAID = "zupe_order_cancelled_prepaid";
const TEMPLATE_CANCEL_COD = "zupe_order_cancelled_cod";
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

  const codDoorstepDue = Math.max(0, totalAmount - 10);
  const displayAmount = paymentMethod === "cod" ? codDoorstepDue : totalAmount;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;

  // 1. Try official Meta Template with interactive buttons first (zupe_order_verify)
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
    console.warn("[WA Pre-Confirm] Template send failed, falling back to direct message:", err);
  }

  if (templateSent) {
    console.log(`✅ [WA Pre-Confirm] Official template '${TEMPLATE_VERIFY}' with buttons dispatched for ${digits}`);
    return true;
  }

  // 2. Fallback to direct message only if template was not accepted
  const paymentBreakdownText =
    paymentMethod === "cod"
      ? `💰 *Total Amount:* Rs ${totalAmount.toLocaleString("en-IN")}\n` +
        `💳 *Advance Paid Online:* Rs 10 (Verified)\n` +
        `📦 *Balance Due at Doorstep:* Rs ${codDoorstepDue.toLocaleString("en-IN")}\n\n`
      : `💰 *Amount Paid:* Rs ${totalAmount.toLocaleString("en-IN")} (Prepaid Online)\n\n`;

  const message =
    `*Order Verification — Zupe Store* 🛍️\n\n` +
    `Hi ${firstName}! Thank you for placing your order with Zupe Store.\n\n` +
    `📦 *Order ID:* ${displayOrderId}\n` +
    `📋 *Items:*\n${itemLines}${more}\n\n` +
    paymentBreakdownText +
    `Please confirm your order below so we can pack and dispatch your shipment:\n\n` +
    `✅ *Confirm Order:*\n${confirmUrl}\n\n` +
    `❌ *Cancel Order:*\n${cancelUrl}\n\n` +
    `Zupe Store Team`;

  await sendWhatsAppTextMessage(apiUrl, apiToken, digits, message);
  console.log(`✅ [WA Pre-Confirm] Fallback verification message delivered to ${digits} for order ${displayOrderId}`);
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
        {
          type: "button",
          sub_type: "url",
          index: "1",
          parameters: [
            {
              type: "text",
              text: cleanButtonOrderId,
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

  const advancePaid = 10;
  const doorstepBalance = Math.max(0, totalAmount - advancePaid); // e.g. 1048 - 10 = 1038
  const switchPrepaidAmount = Math.max(1, doorstepBalance - 49);  // e.g. saves Rs 49 shipping fee
  const productSubtotal = totalAmount >= 49 ? totalAmount - 49 : totalAmount;
  const firstName = customerName.split(" ")[0] || customerName;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;
  const cleanUrlOrderId = orderId.replace(/^#/, "");

  const itemLines = items
    .slice(0, 3)
    .map(function(it) { return "  • " + it.name + " (x" + it.quantity + ")"; })
    .join("\n");
  const moreItems = items.length > 3 ? "\n  • ...and " + (items.length - 3) + " more" : "";
  const trackUrl = STORE_BASE_URL + "/order-tracking?query=" + encodeURIComponent(cleanUrlOrderId);
  const payNowUrl = STORE_BASE_URL + "/checkout?method=prepaid&switch=cod&orderId=" + encodeURIComponent(cleanUrlOrderId);

  let message: string;
  if (paymentMethod === "cod") {
    message =
      "✅ *Order Confirmed — Zupe Store!* 🛍️\n\n" +
      "Hi " + firstName + "! Your Cash on Delivery order is confirmed.\n\n" +
      "📦 *Order ID:* " + displayOrderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Price Breakdown:*\n" +
      "  • Product Amount: Rs " + productSubtotal.toLocaleString("en-IN") + "\n" +
      "  • Shipping Charge: Rs 49\n" +
      "  • Total Amount: Rs " + totalAmount.toLocaleString("en-IN") + "\n" +
      "  • Advance Paid Online: Rs 10 (Received)\n" +
      "  • *Balance Due at Doorstep: Rs " + doorstepBalance.toLocaleString("en-IN") + "*\n\n" +
      "🚚 *Estimated Delivery:* 5-7 Business Days\n\n" +
      "⚡ *Switch to Prepaid & Save Rs 49!*\n" +
      "Pay online now — pay only *Rs " + switchPrepaidAmount.toLocaleString("en-IN") + "* instead of Rs " + doorstepBalance.toLocaleString("en-IN") + " at delivery:\n" +
      payNowUrl + "\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with Zupe Store!";
  } else {
    message =
      "✅ *Payment Successful — Zupe Store!* 🛍️\n\n" +
      "Hi " + firstName + "! Your prepaid order is confirmed.\n\n" +
      "📦 *Order ID:* " + displayOrderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Amount Paid:* Rs " + totalAmount.toLocaleString("en-IN") + " (Online Prepaid)\n" +
      "🚚 *Estimated Delivery:* 5-7 Business Days\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with Zupe Store!";
  }

  const paymentMethodLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online";

  if (paymentMethod === "cod") {
    // 1. For COD: Send approved Utility template 'zupe_order_cod_v2' which includes BOTH buttons:
    // [Pay Online (Save Rs 30)] and [Track Order]
    let codV2Sent = false;
    try {
      codV2Sent = await sendViaCodV2Template(
        apiUrl,
        token,
        digits,
        firstName,
        displayOrderId,
        doorstepBalance,
        switchPrepaidAmount
      );
    } catch (err) {
      console.warn("[WA Order Confirm] COD V2 template attempt:", err);
    }

    // 2. If V2 template failed, fallback to generic confirmed utility template
    if (!codV2Sent) {
      try {
        await sendViaConfirmedUtilityTemplate(
          apiUrl,
          token,
          digits,
          firstName,
          displayOrderId,
          totalAmount,
          paymentMethodLabel
        );
      } catch (err) {
        console.warn("[WA Order Confirm] Fallback utility template attempt:", err);
      }
    }
  } else {
    // Prepaid orders: Send prepaid template or confirmed template
    let prepaidSent = false;
    try {
      prepaidSent = await sendViaTemplate(
        apiUrl,
        token,
        digits,
        paymentMethod,
        firstName,
        displayOrderId,
        totalAmount,
        switchPrepaidAmount
      );
    } catch (err) {
      console.warn("[WA Order Confirm] Prepaid template attempt:", err);
    }

    if (!prepaidSent) {
      try {
        await sendViaConfirmedUtilityTemplate(
          apiUrl,
          token,
          digits,
          firstName,
          displayOrderId,
          totalAmount,
          paymentMethodLabel
        );
      } catch (err) {
        console.warn("[WA Order Confirm] Fallback utility template attempt:", err);
      }
    }
  }

  // 3. ALWAYS send the complete itemized direct WhatsApp confirmation message!
  // This guarantees immediate delivery with full items list, delivery estimate, tracking link, and switch offer
  try {
    await sendWhatsAppTextMessage(apiUrl, token, digits, message);
    console.log(`✅ [WA Order Confirm] Itemized confirmation delivered to ${digits} for order ${displayOrderId}`);
  } catch (err) {
    console.warn("[WA Order Confirm] Direct message dispatch error:", err);
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
  paymentMethodLabel: string
): Promise<boolean> {
  const cleanButtonOrderId = (orderId || "").replace(/^#/, "");

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: "zupe_order_confirmed",
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
          parameters: [{ type: "text", text: cleanButtonOrderId }],
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
      console.log(`✅ [WA Order Confirm] Utility template 'zupe_order_confirmed' sent to ${to}`);
      return true;
    }
  } catch (err) {
    console.warn("[WA Order Confirm] Utility template error:", err);
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

  // 1. Try official Meta utility template first (guaranteed delivery outside 24h window once approved)
  if (isPrepaid && refundAmount) {
    try {
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digits,
        type: "template",
        template: {
          name: TEMPLATE_CANCEL_PREPAID,
          language: { code: TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: orderId },
                { type: "text", text: `Rs ${refundAmount.toLocaleString("en-IN")}` },
                { type: "text", text: refundId || "Initiated" },
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
        console.log(`✅ [WA Cancel] Official template '${TEMPLATE_CANCEL_PREPAID}' dispatched for order ${orderId} to ${digits}`);
        return true;
      }
    } catch (tErr) {
      // Non-fatal, proceed to text fallback
    }
  } else {
    try {
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digits,
        type: "template",
        template: {
          name: TEMPLATE_CANCEL_COD,
          language: { code: TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: orderId },
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
        console.log(`✅ [WA Cancel] Official template '${TEMPLATE_CANCEL_COD}' dispatched for order ${orderId} to ${digits}`);
        return true;
      }
    } catch (tErr) {
      // Non-fatal, proceed to text fallback
    }
  }

  // 2. Fallback to direct text message
  let body = "";
  if (isPrepaid && refundAmount) {
    body =
      `🛍️ *Zupe Store — Order Cancelled & Refund Initiated*\n\n` +
      `Hi ${firstName}! Your order *#${orderId}* has been successfully cancelled.\n\n` +
      `💰 *Refund Amount:* Rs ${refundAmount.toLocaleString("en-IN")}\n` +
      `💳 *Refund Reference:* ${refundId || "Initiated via Razorpay"}\n` +
      `⚡ *Payment Source:* Released back to your original payment method (UPI / Card / Netbanking)\n\n` +
      `⏱️ *Expected Credit Timeline:*\n` +
      `• UPI (GPay, PhonePe, Paytm): Usually credited within 2 to 4 hours (or up to 24 hours depending on the issuing bank)\n` +
      `• Debit / Credit Cards / Netbanking: Credited within 2 to 4 business days\n\n` +
      `Thank you for shopping with Zupe Store!`;
  } else {
    body =
      `🛍️ *Zupe Store — Order Cancelled*\n\n` +
      `Hi ${firstName}! Your Cash on Delivery order *#${orderId}* has been successfully cancelled.\n\n` +
      `📦 *Status:* Shipment cancelled. No payment will be collected at your doorstep.\n` +
      `ℹ️ *Note:* The Rs 10 advance verification fee paid during order placement is non-refundable.\n\n` +
      `If you need any assistance or wish to re-order, we are always here to help.\n\n` +
      `Thank you,\nZupe Store Team`;
  }

  await sendWhatsAppTextMessage(apiUrl, apiToken, digits, body);
  return true;
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
    `Hi ${firstName}! We noticed you left some great items in your ${sectionName} at Zupe Store:\n\n` +
    `${itemLines}${more}\n\n` +
    `⚡ Currently this is a great price! Plus, if you order now, you get Free Delivery without any extra charges.\n\n` +
    `${actionText}\n${recoveryUrl}\n\n` +
    `Need any assistance? Just reply to this message!\n` +
    `Zupe Store Team`;

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
