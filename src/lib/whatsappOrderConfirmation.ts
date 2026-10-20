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
const TEMPLATE_LANG = "en";

export interface OrderConfirmationParams {
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: "cod" | "prepaid";
  items: Array<{ name: string; quantity: number; price: number }>;
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

  // 1. Try approved template (works for ALL customers at any time)
  const templateSent = await sendViaTemplate(
    apiUrl, token, digits, paymentMethod,
    firstName, orderId, totalAmount, discountedAmount
  );

  if (templateSent) {
    console.log("[WA Order Confirm] Template sent to", digits);
    return;
  }

  // 2. Fallback: direct text (works within 24h window only)
  console.warn("[WA Order Confirm] Template failed, using text fallback...");

  const itemLines = items
    .slice(0, 3)
    .map(function(it) { return "  - " + it.name + " x" + it.quantity; })
    .join("\n");
  const moreItems = items.length > 3 ? "\n  - ...and " + (items.length - 3) + " more" : "";
  const trackUrl = STORE_BASE_URL + "/order-tracking?query=" + encodeURIComponent(orderId);
  const payNowUrl = STORE_BASE_URL + "/checkout?method=prepaid&switch=cod";

  let message: string;
  if (paymentMethod === "cod") {
    message = "Order Confirmed - Zupe Store!\n\n" +
      "Hi " + firstName + "! Your order has been placed.\n\n" +
      "Order ID: " + orderId + "\n" +
      "Items:\n" + itemLines + moreItems + "\n\n" +
      "Order Total: Rs " + totalAmount.toLocaleString("en-IN") + " (Cash on Delivery)\n" +
      "Estimated Delivery: 3-6 Business Days\n\n" +
      "Switch to Prepaid & Save Rs 30!\n" +
      "Pay online now - pay only Rs " + discountedAmount.toLocaleString("en-IN") + " instead.\n\n" +
      "Pay Now & Save Rs 30:\n" + payNowUrl + "\n\n" +
      "Track Your Order:\n" + trackUrl + "\n\n" +
      "Thank you for shopping with Zupe Store!";
  } else {
    message = "Payment Successful - Zupe Store!\n\n" +
      "Hi " + firstName + "! Your order is confirmed.\n\n" +
      "Order ID: " + orderId + "\n" +
      "Items:\n" + itemLines + moreItems + "\n\n" +
      "Amount Paid: Rs " + totalAmount.toLocaleString("en-IN") + "\n" +
      "Delivery: 3-6 Business Days\n\n" +
      "Track Your Order:\n" + trackUrl + "\n\n" +
      "Thank you for shopping with Zupe Store!";
  }

  await sendWhatsAppTextMessage(apiUrl, token, digits, message);
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
