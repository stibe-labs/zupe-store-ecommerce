/**
 * PyDart Pay Gateway Client & Webhook Verifier for Turkiye Jam
 * Routes live checkout through PyDart Pay (https://pydart.com) to Tishnu Thankappan's
 * verified Razorpay Partner Sub-Merchant (acc_U448dnHAqswn5q) with 100% white-label UI,
 * zero Razorpay popup, 5s AbortSignal timeouts, and constant-time HMAC-SHA256 webhooks.
 */

export interface PyDartPayConfig {
  baseUrl: string;
  apiKey: string;
  webhookSecret: string;
}

/**
 * Resolves a runtime environment variable from Cloudflare Workers bindings first,
 * then falls back to Node.js `process.env` (never logging or exposing raw secret values).
 */
export async function getRuntimeSecret(key: string): Promise<string> {
  const globalCf =
    (globalThis as Record<string, any>).__cf_env__ ||
    (globalThis as Record<string, any>).env;
  if (globalCf && typeof globalCf[key] === "string" && globalCf[key].trim().length > 0) {
    return globalCf[key].trim();
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as Record<string, unknown> | undefined;
    if (env && typeof env[key] === "string" && (env[key] as string).trim().length > 0) {
      return (env[key] as string).trim();
    }
  } catch {
    // Running outside OpenNext async context (e.g. local Next.js dev or unit test)
  }

  const procVal = process.env[key];
  if (typeof procVal === "string" && procVal.trim().length > 0) {
    return procVal.trim();
  }

  return "";
}

export async function getPyDartPayConfig(): Promise<PyDartPayConfig> {
  const [rawBaseUrl, apiKey, webhookSecret] = await Promise.all([
    getRuntimeSecret("PYDART_BASE_URL"),
    getRuntimeSecret("PYDART_API_KEY"),
    getRuntimeSecret("PYDART_WEBHOOK_SECRET"),
  ]);

  const baseUrl = (rawBaseUrl || "https://pydart.com").replace(/\/+$/, "");
  return { baseUrl, apiKey, webhookSecret };
}

export function normalizeIndianMobile(rawPhone?: string | null): string {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length >= 10) return `+91${digits.slice(-10)}`;
  return "+919876543210";
}

export interface CreatePyDartOrderParams {
  merchantOrderId: string;
  amountRupees: number;
  orderPurpose: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  redirectUrl: string;
  orderTags?: Record<string, string>;
}

export interface PyDartOrderCreated {
  pydartOrderId: string;
  shortCode: string;
  paymentLink: string;
  shortLink: string;
  upstreamProvider: string;
  upstreamOrderId: string;
}

/**
 * Provisions a live white-label payment order on PyDart Pay (`POST /api/v1/payment-orders`).
 */
export async function createPyDartPaymentOrder(
  params: CreatePyDartOrderParams
): Promise<PyDartOrderCreated> {
  const { baseUrl, apiKey } = await getPyDartPayConfig();
  if (!apiKey) {
    throw new Error("PYDART_API_KEY is not configured.");
  }

  const amountPaise = Math.round(Number(params.amountRupees) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise < 200) {
    throw new Error("PyDart Pay minimum order amount is ₹2.00 (200 paise).");
  }

  const cleanEmail = (params.customerEmail || "").trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ? cleanEmail
    : "support@turkiyejam.com";

  const payload = {
    amount_paise: amountPaise,
    currency: "INR",
    merchant_order_id: params.merchantOrderId.slice(0, 128),
    order_purpose: (params.orderPurpose || "Turkiye Jam Order").slice(0, 255),
    redirect_url: params.redirectUrl,
    notify_customer: false,
    send_receipt_to_customer: true,
    order_tags: params.orderTags || {},
    customer_details: {
      name: (params.customerName || "Customer").trim().slice(0, 120),
      mobile: normalizeIndianMobile(params.customerMobile),
      email: validEmail,
    },
  };

  const res = await fetch(`${baseUrl}/api/v1/payment-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "Idempotency-Key": params.merchantOrderId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });

  const json: any = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "SUCCESS" || !json?.order_id || !json?.payment_link) {
    const errMsg =
      json?.error?.message ||
      json?.message ||
      `PyDart Pay order creation failed (HTTP ${res.status})`;
    throw new Error(errMsg);
  }

  return {
    pydartOrderId: String(json.order_id),
    shortCode: String(json.data?.short_code || ""),
    paymentLink: String(json.payment_link),
    shortLink: String(json.data?.short_link || json.payment_link),
    upstreamProvider: String(json.data?.upstream_provider || "razorpay"),
    upstreamOrderId: String(json.data?.upstream_order_id || ""),
  };
}

export interface PyDartOrderVerification {
  paid: boolean;
  orderStatus: string;
  pydartOrderId: string;
  merchantOrderId: string;
  amountPaise: number;
  amountRupees: number;
  paymentId: string;
  paymentMethod: string;
  upstreamProvider: string;
  failureMessage?: string;
}

function mapPyDartOrderDataToVerification(data: any): PyDartOrderVerification {
  const rawStatus = String(data?.status || data?.order_status || "processing").toLowerCase();
  const isPaid = rawStatus === "paid" || rawStatus === "success";
  const amountPaise = Number(data?.amount_paise || 0);
  const amountRupees =
    amountPaise > 0
      ? Math.round(amountPaise) / 100
      : Number.parseFloat(String(data?.amount || "0")) || 0;

  const paymentId = String(
    data?.utr ||
      data?.receipt_number ||
      data?.upstream_order_id ||
      data?.order_id ||
      ""
  );

  return {
    paid: isPaid,
    orderStatus: isPaid ? "PAID" : rawStatus.toUpperCase(),
    pydartOrderId: String(data?.order_id || ""),
    merchantOrderId: String(data?.merchant_order_id || ""),
    amountPaise,
    amountRupees,
    paymentId,
    paymentMethod: String(data?.payment_method || "UPI / Online"),
    upstreamProvider: String(data?.upstream_provider || "razorpay"),
    failureMessage:
      rawStatus === "failed" || rawStatus === "expired"
        ? "Payment was not completed on PyDart Pay. Please retry or switch to COD."
        : undefined,
  };
}

/**
 * Authoritative S2S status verification against PyDart Pay (`GET /api/v1/payment-order/:orderId`).
 */
export async function verifyPyDartPaymentOrder(
  pydartOrderId: string
): Promise<PyDartOrderVerification | null> {
  const cleanId = pydartOrderId.trim();
  if (!cleanId) return null;

  const { baseUrl, apiKey } = await getPyDartPayConfig();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${baseUrl}/api/v1/payment-order/${encodeURIComponent(cleanId)}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;
    const json: any = await res.json().catch(() => null);
    if (json?.status !== "SUCCESS" || !json?.data) return null;
    return mapPyDartOrderDataToVerification(json.data);
  } catch {
    return null;
  }
}

/**
 * Looks up a PyDart Pay order by Turkiye Jam's `merchant_order_id` when the PyDart `order_id`
 * was not provided in the return URL query parameters.
 */
export async function verifyPyDartOrderByMerchantId(
  merchantOrderId: string
): Promise<PyDartOrderVerification | null> {
  const cleanRef = merchantOrderId.trim();
  if (!cleanRef) return null;

  const { baseUrl, apiKey } = await getPyDartPayConfig();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${baseUrl}/api/v1/payment-orders?search=${encodeURIComponent(cleanRef)}&limit=5`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;
    const json: any = await res.json().catch(() => null);
    const orders: any[] = Array.isArray(json?.data?.orders) ? json.data.orders : [];
    const exactMatch = orders.find((o) => String(o?.merchant_order_id || "") === cleanRef);
    if (!exactMatch?.order_id) return null;

    // Fetch single order endpoint so PyDart triggers live S2S reconciliation with Razorpay
    return (
      (await verifyPyDartPaymentOrder(String(exactMatch.order_id))) ||
      mapPyDartOrderDataToVerification(exactMatch)
    );
  } catch {
    return null;
  }
}

function timingSafeEqualUtf8(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/**
 * Verifies PyDart Pay outbound webhook signature (`x-pydart-signature: t=<unix>,v1=<hmac_sha256_hex>`)
 * using Web Crypto HMAC-SHA256 in constant time with a strict 300-second replay window.
 */
export async function verifyPyDartWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  options?: { secretOverride?: string; nowSecOverride?: number }
): Promise<boolean> {
  const webhookSecret =
    options?.secretOverride || (await getPyDartPayConfig()).webhookSecret;
  if (!webhookSecret || !signatureHeader) return false;

  let timestampStr = (timestampHeader || "").trim();
  let providedHex = "";

  for (const part of signatureHeader.split(",")) {
    const [rawK, ...rest] = part.trim().split("=");
    const k = rawK?.trim();
    const v = rest.join("=").trim();
    if (k === "t" && v) timestampStr = v;
    if (k === "v1" && v) providedHex = v.toLowerCase();
  }

  if (!timestampStr || !providedHex || !/^[0-9a-f]{64}$/.test(providedHex)) {
    return false;
  }

  const tsSec = Number(timestampStr);
  if (!Number.isFinite(tsSec) || tsSec <= 0) return false;

  const nowSec = options?.nowSecOverride ?? Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsSec) > 300) {
    return false;
  }

  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(`${timestampStr}.${rawBody}`)
  );
  const expectedHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqualUtf8(expectedHex, providedHex);
}
