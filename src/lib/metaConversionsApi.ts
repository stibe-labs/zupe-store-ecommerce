import { META_PIXEL_ID } from "./metaPixel";

/**
 * Universal SHA-256 hashing compliant with Meta Conversions API requirements
 * (Cloudflare Workers + Node.js runtime compatible)
 */
async function sha256(str: string): Promise<string> {
  const clean = str.trim().toLowerCase();
  if (!clean) return "";

  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(clean);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    const nodeCrypto = await import("crypto");
    return nodeCrypto.createHash("sha256").update(clean).digest("hex");
  } catch (err) {
    console.warn("[Meta CAPI] Error hashing user data:", err);
    return "";
  }
}

/**
 * Format Indian phone number for Meta CAPI (country code 91 + 10 digits)
 */
function normalizePhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

/**
 * Check if the server-side event originates from a permitted customer URL.
 * Strictly blocks admin.zupestore.in, preview workers.dev, and /admin routes.
 */
function isServerTrackingAllowed(sourceUrl?: string): boolean {
  if (!sourceUrl) return true;
  const lower = sourceUrl.toLowerCase();
  if (lower.includes("admin.zupestore.in") || lower.includes("workers.dev") || lower.includes("/admin")) {
    return false;
  }
  return true;
}

/**
 * Helper to fetch active Meta CAPI credentials
 */
async function getMetaCredentials() {
  let pixelId = process.env.META_PIXEL_ID || META_PIXEL_ID;
  let token =
    process.env.META_ACCESS_TOKEN ||
    process.env.META_CONVERSIONS_API_TOKEN ||
    process.env.FACEBOOK_CONVERSIONS_API_TOKEN;

  if (!token) {
    try {
      const { getSettings } = await import("./erpStore");
      const settings = await getSettings();
      if (settings.meta?.token && !settings.meta.token.startsWith("EAAK10928374...")) {
        token = settings.meta.token;
      }
      if (settings.meta?.pixelId) {
        pixelId = settings.meta.pixelId;
      }
    } catch {
      // fallback
    }
  }

  return { pixelId, token };
}

export interface MetaServerPurchaseOrder {
  orderId: string;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: Array<{
    id?: string;
    product_id?: string;
    name?: string;
    price?: number;
    unit_price?: number;
    quantity?: number;
  }>;
  sourceUrl?: string;
  testEventCode?: string;
}

/**
 * Dispatches a Purchase event to Meta Conversions API (Server-Side)
 * With SHA-256 hashed customer email and phone and matching event_id for deduplication.
 */
export async function sendMetaConversionsPurchase(order: MetaServerPurchaseOrder) {
  try {
    if (!isServerTrackingAllowed(order.sourceUrl)) {
      console.log(`[Meta CAPI] Skipping Purchase event from admin/test source: ${order.sourceUrl}`);
      return { success: true, skipped: true, reason: "ADMIN_OR_TEST_DOMAIN" };
    }

    const { pixelId, token } = await getMetaCredentials();

    if (!token) {
      // Token not set in environment yet. Log once and gracefully continue without error.
      console.log(
        `[Meta CAPI] Purchase event prepared for Order #${order.orderId} (₹${order.totalAmount}). ` +
        `To stream live to Meta Conversions API, set META_ACCESS_TOKEN in Cloudflare Worker environment variables or Admin Settings.`
      );
      return { success: true, skipped: true, reason: "NO_ACCESS_TOKEN" };
    }

    const cleanEmail = (order.customerEmail || "").trim();
    const cleanPhone = normalizePhone(order.customerPhone || "");

    const [hashedEmail, hashedPhone] = await Promise.all([
      cleanEmail && !cleanEmail.endsWith("@customer.zupestore.com")
        ? sha256(cleanEmail)
        : Promise.resolve(""),
      cleanPhone ? sha256(cleanPhone) : Promise.resolve(""),
    ]);

    const formattedContents = (order.items || []).map((it) => ({
      id: String(it.id || it.product_id || "zupe_product"),
      quantity: Math.max(1, Number(it.quantity) || 1),
      item_price: Number(it.price || it.unit_price) || 0,
    }));

    const testCode = order.testEventCode || process.env.META_TEST_EVENT_CODE;

    const eventPayload: Record<string, any> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: String(order.orderId), // Matches client-side eventID for perfect deduplication
          event_source_url: order.sourceUrl || "https://zupestore.in/checkout",
          action_source: "website",
          user_data: {
            ...(hashedEmail ? { em: [hashedEmail] } : {}),
            ...(hashedPhone ? { ph: [hashedPhone] } : {}),
          },
          custom_data: {
            currency: "INR",
            value: Number(order.totalAmount) || 0,
            content_type: "product",
            contents: formattedContents,
            num_items: formattedContents.reduce((sum, c) => sum + c.quantity, 0),
          },
        },
      ],
      ...(testCode ? { test_event_code: testCode } : {}),
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });

    const data = await res.json();
    if (res.ok && data?.events_received) {
      console.log(`[Meta CAPI] Purchase event sent successfully for Order #${order.orderId}`);
      return { success: true, data };
    } else {
      console.warn(`[Meta CAPI] Failed to send Purchase event for Order #${order.orderId}:`, data);
      return { success: false, error: data };
    }
  } catch (err: any) {
    console.warn("[Meta CAPI] Exception during Conversions API dispatch:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches an InitiateCheckout event to Meta Conversions API (Server-Side)
 */
export async function sendMetaConversionsInitiateCheckout(payload: {
  eventId?: string;
  totalAmount: number;
  customerEmail?: string;
  customerPhone?: string;
  items?: Array<{ id?: string; product_id?: string; price?: number; quantity?: number }>;
  sourceUrl?: string;
  testEventCode?: string;
}) {
  try {
    if (!isServerTrackingAllowed(payload.sourceUrl)) return { success: true, skipped: true };

    const { pixelId, token } = await getMetaCredentials();
    if (!token) return { success: true, skipped: true, reason: "NO_ACCESS_TOKEN" };

    const cleanEmail = (payload.customerEmail || "").trim();
    const cleanPhone = normalizePhone(payload.customerPhone || "");

    const [hashedEmail, hashedPhone] = await Promise.all([
      cleanEmail && !cleanEmail.endsWith("@customer.zupestore.com") ? sha256(cleanEmail) : Promise.resolve(""),
      cleanPhone ? sha256(cleanPhone) : Promise.resolve(""),
    ]);

    const formattedContents = (payload.items || []).map((it) => ({
      id: String(it.id || it.product_id || "zupe_product"),
      quantity: Math.max(1, Number(it.quantity) || 1),
      item_price: Number(it.price) || 0,
    }));

    const eventPayload: Record<string, any> = {
      data: [
        {
          event_name: "InitiateCheckout",
          event_time: Math.floor(Date.now() / 1000),
          event_id: payload.eventId || `ic_${Date.now()}`,
          event_source_url: payload.sourceUrl || "https://zupestore.in/checkout",
          action_source: "website",
          user_data: {
            ...(hashedEmail ? { em: [hashedEmail] } : {}),
            ...(hashedPhone ? { ph: [hashedPhone] } : {}),
          },
          custom_data: {
            currency: "INR",
            value: Number(payload.totalAmount) || 0,
            content_type: "product",
            contents: formattedContents,
            num_items: formattedContents.reduce((sum, c) => sum + c.quantity, 0),
          },
        },
      ],
      ...(payload.testEventCode ? { test_event_code: payload.testEventCode } : {}),
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches an AddToCart event to Meta Conversions API (Server-Side)
 */
export async function sendMetaConversionsAddToCart(payload: {
  eventId?: string;
  productId: string;
  productName?: string;
  price: number;
  quantity?: number;
  customerEmail?: string;
  customerPhone?: string;
  sourceUrl?: string;
  testEventCode?: string;
}) {
  try {
    if (!isServerTrackingAllowed(payload.sourceUrl)) return { success: true, skipped: true };

    const { pixelId, token } = await getMetaCredentials();
    if (!token) return { success: true, skipped: true, reason: "NO_ACCESS_TOKEN" };

    const cleanEmail = (payload.customerEmail || "").trim();
    const cleanPhone = normalizePhone(payload.customerPhone || "");

    const [hashedEmail, hashedPhone] = await Promise.all([
      cleanEmail && !cleanEmail.endsWith("@customer.zupestore.com") ? sha256(cleanEmail) : Promise.resolve(""),
      cleanPhone ? sha256(cleanPhone) : Promise.resolve(""),
    ]);

    const qty = Math.max(1, Number(payload.quantity) || 1);
    const unitPrice = Number(payload.price) || 0;

    const eventPayload: Record<string, any> = {
      data: [
        {
          event_name: "AddToCart",
          event_time: Math.floor(Date.now() / 1000),
          event_id: payload.eventId || `atc_${Date.now()}`,
          event_source_url: payload.sourceUrl || "https://zupestore.in/products",
          action_source: "website",
          user_data: {
            ...(hashedEmail ? { em: [hashedEmail] } : {}),
            ...(hashedPhone ? { ph: [hashedPhone] } : {}),
          },
          custom_data: {
            currency: "INR",
            value: unitPrice * qty,
            content_type: "product",
            contents: [
              {
                id: String(payload.productId),
                quantity: qty,
                item_price: unitPrice,
              },
            ],
            num_items: qty,
          },
        },
      ],
      ...(payload.testEventCode ? { test_event_code: payload.testEventCode } : {}),
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
