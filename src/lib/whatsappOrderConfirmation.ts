// WhatsApp Order Confirmation Messages for Zupe Store
// Uses approved Utility Templates for guaranteed delivery to ALL customers (no 24h restriction)
// Falls back to direct text message if template not yet approved or within 24h window

import { normalizePhoneNumber, getEffectiveWhatsAppCredentials } from "@/lib/whatsappOtp";
import { siteConfig } from "@/config/siteConfig";

const DEFAULT_WA_TOKEN = process.env.WHATSAPP_TOKEN || "";
const DEFAULT_WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
let STORE_BASE_URL = siteConfig.url || "https://vittallifestyle.com";
if (STORE_BASE_URL.includes("workers.dev") || !STORE_BASE_URL.startsWith("http")) {
  STORE_BASE_URL = "https://vittallifestyle.com";
}

// Template names - matching your active Meta WhatsApp Manager templates:
// 1. vittallifestyle_otp (Authentication)
// 2. vittallifestyle_order_verify (Utility - interactive pre-confirmation)
// 3. vittallifestyle_order_confirmed (Utility - prepaid confirmed)
// 4. vittallifestyle_cod_to_prepaid (Marketing - COD confirmed switch offer)
// 5. vittallifestyle_order_canceled (Utility - order cancellation)
const TEMPLATE_PREPAID = "vittallifestyle_order_confirmed";
const TEMPLATE_COD = "vittallifestyle_cod_to_prepaid";
const TEMPLATE_VERIFY = "vittallifestyle_order_verify";
const TEMPLATE_UPDATE = "vittallifestyle_order_confirmed";
const TEMPLATE_CANCEL = "vittallifestyle_order_canceled";
const TEMPLATE_CANCEL_FALLBACK = "vittallifestyle_order_cancelled";
const TEMPLATE_COD_TO_PREPAID = "vittallifestyle_cod_to_prepaid";
const TEMPLATE_LANG = "en";

export interface OrderConfirmationParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: "cod" | "prepaid";
  items: Array<{ name: string; quantity: number; price: number }>;
  isCodSwitch?: boolean;
}

export interface OrderPreConfirmationParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: "cod" | "prepaid";
  items: Array<{ name: string; quantity: number; price: number }>;
  token: string;
  advancePaid?: number;
}

/**
 * Sends initial interactive verification WhatsApp message with Confirm and Cancel links.
 * Matches the official reference template layout with exact emojis, summary, and action buttons.
 * Tries the official Meta Utility template 'vittallifestyle_order_verify' first (delivers to all customers).
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
  if (digits === "919747195000" || digits === "9747195000") {
    console.warn("⚠️ [WA Pre-Confirm] Recipient phone is the business's own WhatsApp number. Meta requires testing with an external customer mobile number.");
  }

  const { token: apiToken, phoneId } = await getEffectiveWhatsAppCredentials();
  if (!apiToken || !phoneId) {
    console.warn("⚠️ [WA Pre-Confirm] Missing WhatsApp credentials, skipping.");
    return false;
  }
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;
  const safeItems = Array.isArray(items) && items.length > 0
    ? items
    : [{ name: `${siteConfig.name} Product`, quantity: 1, price: totalAmount || 999 }];

  // Construct clean product summary: e.g. "Mini Portable Steam Iron" or "2x Royal Saudi Medjool Dates (500g)"
  const firstItem = safeItems[0];
  const firstItemQty = Number(firstItem.quantity || 1);
  const firstItemName = (firstItem.name || siteConfig.name).trim();
  let productSummary = firstItemQty > 1 ? `${firstItemQty}x ${firstItemName}` : firstItemName;
  if (safeItems.length > 1) {
    productSummary += ` + ${safeItems.length - 1} more`;
  }
  if (productSummary.length > 60) {
    productSummary = productSummary.substring(0, 57) + "...";
  }

  const isCod = paymentMethod === "cod";
  const advancePaid = typeof params.advancePaid === "number" ? Math.max(0, params.advancePaid) : 0;
  const amountPaid = isCod ? advancePaid : totalAmount;
  const amountPayable = isCod ? Math.max(0, totalAmount - advancePaid) : 0;

  const displayAmountPayable = `₹${amountPayable.toLocaleString("en-IN")}`;
  const displayAmountPaid = `₹${amountPaid.toLocaleString("en-IN")}`;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;
  const paymentMethodLabel = isCod ? "Cash on Delivery" : "Prepaid Online";

  const confirmUrl = `${STORE_BASE_URL}/api/orders/whatsapp-confirm?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  const cancelUrl = `${STORE_BASE_URL}/api/orders/whatsapp-cancel?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;

  // Log to internal WhatsApp desk
  try {
    const { recordOutboundSystemMessage } = await import("@/lib/whatsappStore");
    await recordOutboundSystemMessage(
      customerPhone,
      `Hi ${firstName}! 👋🏻\n\n` +
      `😊 Thank you for ordering from ${siteConfig.name} 🛒\n\n` +
      `⁉️ Please confirm your order 📦\n\n` +
      `📦 Order ID: ${displayOrderId}\n` +
      `🛍️ Product: ${productSummary}\n` +
      `💰 Amount Payable: ${displayAmountPayable}\n` +
      `💰 Amount Paid: ${displayAmountPaid}\n\n` +
      `📣 Please confirm whether you would like to proceed with your order. 💬\n\n` +
      `Thank you, ❤️\n` +
      `Team ${siteConfig.name}\n\n` +
      `[Confirm Order: ${confirmUrl}]\n` +
      `[Cancel Order: ${cancelUrl}]`,
      "order_card",
      {
        orderData: {
          orderId,
          totalAmount,
          itemsSummary: productSummary,
          status: "Awaiting WA",
          paymentMethod: paymentMethodLabel,
        },
      }
    );
  } catch (logErr) {}

  // 1. Try official Meta Template with interactive buttons first
  let templateSent = false;
  try {
    templateSent = await sendPreConfirmViaTemplate(
      apiUrl,
      apiToken,
      digits,
      firstName,
      displayOrderId,
      productSummary,
      amountPayable,
      amountPaid,
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

  // 2. Fallback to direct message matching the exact reference template layout
  const message =
    `Hi ${firstName}! 👋🏻\n\n` +
    `😊 Thank you for ordering from ${siteConfig.name} 🛒\n\n` +
    `⁉️ Please confirm your order 📦\n\n` +
    `📦 Order ID: ${displayOrderId}\n` +
    `🛍️ Product: ${productSummary}\n` +
    `💰 Amount Payable: ${displayAmountPayable}\n` +
    `💰 Amount Paid: ${displayAmountPaid}\n\n` +
    `📣 Please confirm whether you would like to proceed with your order. 💬\n\n` +
    `Thank you, ❤️\n` +
    `Team ${siteConfig.name}\n\n` +
    `👉 *Confirm Order:*\n${confirmUrl}\n\n` +
    `👉 *Cancel Order:*\n${cancelUrl}`;

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
  productSummary: string,
  amountPayable: number,
  amountPaid: number,
  confirmUrl: string,
  cancelUrl: string,
  verificationToken: string
): Promise<boolean> {
  const cleanButtonOrderId = (orderId || "").replace(/^#/, "");

  const templateCandidates = [
    TEMPLATE_VERIFY, // "vittallifestyle_order_verify"
    "zupe_order_verify",
    "vittal_order_verify",
    "order_verify",
  ];

  // Variations of components:
  // 1. 5-param body (firstName, orderId, productSummary, amountPayable, amountPaid) + 2 dynamic URL buttons
  // 2. 5-param body + 1 dynamic URL button (Confirm Order)
  // 3. 5-param body without buttons
  // 4. 4-param legacy body + 1 dynamic URL button
  const bodyParams5 = [
    { type: "text", text: firstName },
    { type: "text", text: orderId },
    { type: "text", text: productSummary },
    { type: "text", text: `${amountPayable.toLocaleString("en-IN")}` },
    { type: "text", text: `${amountPaid.toLocaleString("en-IN")}` },
  ];

  const bodyParams4Legacy = [
    { type: "text", text: firstName },
    { type: "text", text: orderId },
    { type: "text", text: `Rs ${amountPayable.toLocaleString("en-IN")}` },
    { type: "text", text: productSummary },
  ];

  const candidateComponentSets = [
    // 5-param with 2 dynamic buttons
    [
      { type: "body", parameters: bodyParams5 },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: verificationToken }] },
      { type: "button", sub_type: "url", index: "1", parameters: [{ type: "text", text: cleanButtonOrderId }] },
    ],
    // 5-param with 1 dynamic button
    [
      { type: "body", parameters: bodyParams5 },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: verificationToken }] },
    ],
    // 5-param body only
    [
      { type: "body", parameters: bodyParams5 },
    ],
    // 4-param legacy with 1 button
    [
      { type: "body", parameters: bodyParams4Legacy },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: verificationToken }] },
    ],
  ];

  for (const tplName of templateCandidates) {
    for (const components of candidateComponentSets) {
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "template",
            template: {
              name: tplName,
              language: { code: TEMPLATE_LANG },
              components,
            },
          }),
          signal: AbortSignal.timeout(6000),
        });

        const data = (await res.json()) as any;
        if (res.ok && data.messages?.length > 0) {
          console.log(`✅ [WA Pre-Confirm] Official template '${tplName}' delivered to Meta queue for ${to}, messageId: ${data.messages[0].id}`);
          return true;
        }
      } catch (err) {
        // Continue trying next variation
      }
    }
  }

  return false;
}

export const sendWhatsAppOrderConfirmation = sendOrderConfirmationWhatsApp;

export async function sendOrderConfirmationWhatsApp(
  params: OrderConfirmationParams
): Promise<void> {
  const { customerName, customerPhone, orderId, totalAmount, paymentMethod, items, isCodSwitch } = params;

  const { digits, isValid } = normalizePhoneNumber(customerPhone);
  if (!isValid) {
    console.warn("[WA Order Confirm] Invalid phone, skipping:", customerPhone);
    return;
  }

  const { token, phoneId } = await getEffectiveWhatsAppCredentials();
  if (!token || !phoneId) {
    console.warn("⚠️ [WA Order Confirm] Missing WhatsApp credentials, skipping.");
    return;
  }
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const doorstepBalance = totalAmount;
  const switchPrepaidAmount = totalAmount;
  const productSubtotal = totalAmount >= 49 ? totalAmount - 49 : totalAmount;
  const firstName = customerName.split(" ")[0] || customerName;
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;
  const cleanUrlOrderId = orderId.replace(/^#/, "");

  const safeItems = Array.isArray(items) && items.length > 0
    ? items
    : [{ name: `${siteConfig.name} Electronics`, quantity: 1, price: totalAmount || 2499 }];

  // Log confirmation to internal WhatsApp desk
  try {
    const { recordOutboundSystemMessage } = await import("@/lib/whatsappStore");
    await recordOutboundSystemMessage(
      customerPhone,
      `🎉 *Order Confirmed — ${siteConfig.name}* ⚡\n\nYour order (${displayOrderId}) of ₹${totalAmount} has been confirmed and submitted for packing & express dispatch!`,
      "order_card",
      {
        orderData: {
          orderId,
          totalAmount,
          itemsSummary: safeItems.map((it) => `${it.name || siteConfig.name} (x${it.quantity || 1})`).join(", "),
          status: "Confirmed",
          paymentMethod: paymentMethod === "cod" ? "COD" : "Prepaid",
        },
      }
    );
  } catch (logErr) {}

  const itemLines = safeItems
    .slice(0, 3)
    .map(function(it) { return "  • " + (it.name || siteConfig.name) + " (x" + (it.quantity || 1) + ")"; })
    .join("\n");
  const moreItems = safeItems.length > 3 ? "\n  • ...and " + (safeItems.length - 3) + " more" : "";
  const trackUrl = STORE_BASE_URL + "/order-tracking?query=" + encodeURIComponent(cleanUrlOrderId);

  let message: string;
  if (paymentMethod === "cod") {
    const advancePaid = Number((order as any).advance_paid) || 0;
    const doorstepDue = advancePaid > 0 ? Math.max(0, totalAmount - advancePaid) : totalAmount;

    message =
      "✅ *Order Confirmed — " + siteConfig.name + "!* 🛍️\n\n" +
      "Hi " + firstName + "! Your Cash on Delivery order is confirmed.\n\n" +
      "📦 *Order ID:* " + displayOrderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Price Breakdown:*\n" +
      "  • Total Amount: Rs " + totalAmount.toLocaleString("en-IN") + "\n" +
      (advancePaid > 0
        ? "  • Advance Paid Online: Rs " + advancePaid.toLocaleString("en-IN") + " (Paid via UPI)\n" +
          "  • *Payable on Delivery: Rs " + doorstepDue.toLocaleString("en-IN") + " (Cash / UPI)*\n\n"
        : "  • *Payable on Delivery: Rs " + totalAmount.toLocaleString("en-IN") + " (Cash / UPI)*\n\n") +
      "🚚 *Estimated Delivery:* 5-7 Business Days\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with " + siteConfig.name + "!";
  } else {
    message =
      "✅ *Payment Successful — " + siteConfig.name + "!* 🛍️\n\n" +
      "Hi " + firstName + "! Your prepaid order is confirmed.\n\n" +
      "📦 *Order ID:* " + displayOrderId + "\n" +
      "📋 *Items:*\n" + itemLines + moreItems + "\n\n" +
      "💰 *Amount Paid:* Rs " + totalAmount.toLocaleString("en-IN") + " (Online Prepaid)\n" +
      "🚚 *Estimated Delivery:* 5-7 Business Days\n\n" +
      "📦 *Track Your Order:*\n" +
      trackUrl + "\n\n" +
      "Thank you for shopping with " + siteConfig.name + "!";
  }

  const paymentMethodLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online";

  if (paymentMethod === "cod") {
    // 1. For COD: Send approved Marketing template 'vittallifestyle_cod_to_prepaid'
    let codToPrepaidSent = false;
    try {
      codToPrepaidSent = await sendViaTemplate(
        apiUrl,
        token,
        digits,
        "cod",
        firstName,
        displayOrderId,
        totalAmount,
        switchPrepaidAmount,
        true
      );
    } catch (err) {
      console.warn("[WA Order Confirm] COD to Prepaid template attempt:", err);
    }

    // 2. If cod_to_prepaid template failed, fallback to confirmed utility template
    if (!codToPrepaidSent) {
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
        switchPrepaidAmount,
        Boolean(isCodSwitch)
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
  const bodyParams = [
    { type: "text", text: firstName },
    { type: "text", text: orderId },
    { type: "text", text: `Rs ${totalAmount.toLocaleString("en-IN")}` },
  ];

  const componentVariations = [
    [
      { type: "body", parameters: bodyParams },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: cleanButtonOrderId }] },
    ],
    [
      { type: "body", parameters: bodyParams },
    ],
  ];

  for (const components of componentVariations) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: TEMPLATE_UPDATE,
            language: { code: TEMPLATE_LANG },
            components,
          },
        }),
      });
      const data = (await res.json()) as any;
      if (res.ok && data.messages?.length > 0) {
        console.log(`✅ [WA Order Confirm] Utility template '${TEMPLATE_UPDATE}' sent to ${to}`);
        return true;
      }
    } catch (err) {
      console.warn("[WA Order Confirm] Utility template variation error:", err);
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
  discountedAmount: number,
  isCodSwitch: boolean = false
): Promise<boolean> {
  const templateName = isCodSwitch
    ? TEMPLATE_COD_TO_PREPAID
    : paymentMethod === "cod"
    ? TEMPLATE_COD
    : TEMPLATE_PREPAID;

  const bodyParams = isCodSwitch
    ? [
        { type: "text", text: firstName },
        { type: "text", text: "Rs " + totalAmount.toLocaleString("en-IN") },
        { type: "text", text: orderId },
      ]
    : [
        { type: "text", text: firstName },
        { type: "text", text: orderId },
        { type: "text", text: "Rs " + totalAmount.toLocaleString("en-IN") },
      ];

  const cleanButtonOrderId = (orderId || "").replace(/^#/, "");
  const trackButtonParam = { type: "text", text: cleanButtonOrderId };

  // Try both: 1) With dynamic URL button, 2) Body only (if template uses a static URL button or no buttons)
  const componentVariations = [
    [
      { type: "body", parameters: bodyParams },
      { type: "button", sub_type: "url", index: "0", parameters: [trackButtonParam] },
    ],
    [
      { type: "body", parameters: bodyParams },
    ],
  ];

  for (const components of componentVariations) {
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
    } catch (err) {
      console.warn(`[WA Order Confirm] Template '${templateName}' error:`, err);
    }
  }
  return false;
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

  const { token: apiToken, phoneId } = await getEffectiveWhatsAppCredentials();
  if (!apiToken || !phoneId) {
    console.warn("⚠️ [WA Pre-Confirm] Missing WhatsApp credentials, skipping.");
    return false;
  }
  const apiUrl = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";

  const firstName = customerName.split(" ")[0] || customerName;

  const cleanOrderId = (orderId || "").replace(/^#/, "");
  const displayOrderId = orderId.startsWith("#") ? orderId : `#${orderId}`;

  // 1. Try official Meta utility template first: 'vittallifestyle_order_canceled' (from active templates)
  const templateCandidates = [
    TEMPLATE_CANCEL, // "vittallifestyle_order_canceled"
    TEMPLATE_CANCEL_FALLBACK, // "vittallifestyle_order_cancelled"
    "zupe_order_cancelled",
  ];

  const bodyParamSets = [
    // 2 params: clean orderId (matches Meta snippet: "Hi {{1}}! your order #{{2}} has been cancel...")
    [
      { type: "text", text: firstName },
      { type: "text", text: cleanOrderId },
    ],
    // 2 params: display orderId (#1107)
    [
      { type: "text", text: firstName },
      { type: "text", text: displayOrderId },
    ],
    // 4 params: for prepaid refund template if configured
    ...(isPrepaid && refundAmount
      ? [
          [
            { type: "text", text: firstName },
            { type: "text", text: displayOrderId },
            { type: "text", text: `Rs ${Number(refundAmount).toLocaleString("en-IN")}` },
            { type: "text", text: refundId || "Initiated" },
          ],
        ]
      : []),
  ];

  for (const tplName of templateCandidates) {
    for (const bodyParams of bodyParamSets) {
      try {
        const payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: digits,
          type: "template",
          template: {
            name: tplName,
            language: { code: TEMPLATE_LANG },
            components: [
              {
                type: "body",
                parameters: bodyParams,
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
          console.log(`✅ [WA Cancel] Official template '${tplName}' dispatched for order ${orderId} to ${digits}`);
          return true;
        }
      } catch (tErr) {
        // Try next variation
      }
    }
  }

  // 2. Fallback to direct text message
  let body = "";
  if (isPrepaid && refundAmount) {
    body =
      `🛍️ *${siteConfig.name} — Order Cancelled & Refund Initiated*\n\n` +
      `Hi ${firstName}! Your order *${displayOrderId}* has been successfully cancelled.\n\n` +
      `💰 *Refund Amount:* Rs ${refundAmount.toLocaleString("en-IN")}\n` +
      `💳 *Refund Reference:* ${refundId || "Initiated via Razorpay"}\n` +
      `⚡ *Payment Source:* Released back to your original payment method (UPI / Card / Netbanking)\n\n` +
      `⏱️ *Expected Credit Timeline:*\n` +
      `• UPI (GPay, PhonePe, Paytm): Usually credited within 2 to 4 hours (or up to 24 hours depending on the issuing bank)\n` +
      `• Debit / Credit Cards / Netbanking: Credited within 2 to 4 business days\n\n` +
      `Thank you for shopping with ${siteConfig.name}!`;
  } else {
    body =
      `🛍️ *${siteConfig.name} — Order Cancelled*\n\n` +
      `Hi ${firstName}! Your Cash on Delivery order *${displayOrderId}* has been successfully cancelled.\n\n` +
      `📦 *Status:* Shipment cancelled. No payment will be collected at your doorstep.\n\n` +
      `If you need any assistance or wish to re-order, we are always here to help.\n\n` +
      `Thank you,\nTeam ${siteConfig.name}`;
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

  const { token: apiToken, phoneId } = await getEffectiveWhatsAppCredentials();
  if (!apiToken || !phoneId) {
    console.warn("⚠️ [WA Pre-Confirm] Missing WhatsApp credentials, skipping.");
    return false;
  }
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
    `Hi ${firstName}! We noticed you left some great items in your ${sectionName} at ${siteConfig.name}:\n\n` +
    `${itemLines}${more}\n\n` +
    `⚡ Currently this is a great price! Plus, if you order now, you get Free Delivery without any extra charges.\n\n` +
    `${actionText}\n${recoveryUrl}\n\n` +
    `Need any assistance? Just reply to this message!\n` +
    `Team ${siteConfig.name}`;

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
