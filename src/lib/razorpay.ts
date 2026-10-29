import crypto from "crypto";

export const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID ||
  "rzp_test_TtfV4hJwr48ruO";

export const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET ||
  "LxiqYWXJS4LUSoyqS89n90zz";

export interface CreateOrderParams {
  amount: number; // in INR rupees
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

/**
 * Creates a Razorpay Order using the official Razorpay REST API.
 * Uses native fetch with HTTP Basic Auth for 100% compatibility across
 * Node.js, Next.js, and Cloudflare Workers (OpenNext).
 */
export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}: CreateOrderParams): Promise<RazorpayOrderResponse> {
  const amountInPaise = Math.round(amount * 100);

  const authHeader = `Basic ${Buffer.from(
    `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
  ).toString("base64")}`;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.description || `Razorpay order creation failed with status ${response.status}`
    );
  }

  return data as RazorpayOrderResponse;
}

/**
 * Verifies Razorpay payment signature using HMAC SHA-256.
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes?: Record<string, string>;
  receipt?: string;
  status: string;
  speed_processed?: string;
  speed_requested?: string;
  created_at: number;
}

/**
 * Initiates an automated refund on Razorpay for a payment ID.
 * Returns the refund details including the unique refund ID (e.g. rfnd_xxx).
 */
export async function refundRazorpayPayment({
  paymentId,
  amount,
  notes = {},
}: {
  paymentId: string;
  amount?: number; // In Rupees; if not provided, full payment amount is refunded
  notes?: Record<string, string>;
}): Promise<RazorpayRefundResponse> {
  const authHeader = `Basic ${Buffer.from(
    `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
  ).toString("base64")}`;

  const bodyPayload: any = { notes };
  if (amount !== undefined && amount > 0) {
    bodyPayload.amount = Math.round(amount * 100); // Razorpay requires paise
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(bodyPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.description || `Razorpay refund failed with status ${response.status}`
    );
  }

  return data as RazorpayRefundResponse;
}

/**
 * Dynamically loads the Razorpay checkout.js script on client side.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-checkout-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentInfo {
  id: string;
  status: string;
  amount: number; // in Rupees
  currency: string;
  method: string; // 'upi' | 'card' | 'netbanking' | 'wallet'
  vpa?: string;
  bank?: string;
  wallet?: string;
  card?: {
    last4?: string;
    network?: string;
    type?: string;
    issuer?: string;
  };
  email?: string;
  contact?: string;
  paymentSummary: string;
  raw?: any;
}

/**
 * Fetches verified payment information directly from Razorpay for an executed payment ID.
 */
export async function getRazorpayPaymentDetails(paymentId: string): Promise<RazorpayPaymentInfo | null> {
  const cleanId = (paymentId || "").trim();
  if (!cleanId) return null;

  try {
    const authHeader = `Basic ${Buffer.from(
      `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
    ).toString("base64")}`;

    const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(cleanId)}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      console.warn(`Razorpay payment fetch failed with status ${res.status} for ${cleanId}`);
      return null;
    }

    const data = (await res.json()) as any;
    const method = (data.method || "").toLowerCase();
    let summary = data.method || "Online Payment";

    if (method === "upi") {
      summary = `UPI (VPA: ${data.vpa || "UPI App"})`;
    } else if (method === "card") {
      const cardType = data.card?.type ? `${data.card.type.toUpperCase()} Card` : "Card";
      const last4 = data.card?.last4 ? ` ending in ${data.card.last4}` : "";
      const network = data.card?.network ? ` (${data.card.network})` : "";
      summary = `${cardType}${last4}${network}`;
    } else if (method === "netbanking") {
      summary = `Netbanking (${data.bank || "Bank Transfer"})`;
    } else if (method === "wallet") {
      summary = `Wallet (${data.wallet || "E-Wallet"})`;
    }

    return {
      id: data.id,
      status: data.status,
      amount: (Number(data.amount) || 0) / 100,
      currency: data.currency || "INR",
      method: data.method,
      vpa: data.vpa || undefined,
      bank: data.bank || undefined,
      wallet: data.wallet || undefined,
      card: data.card
        ? {
            last4: data.card.last4,
            network: data.card.network,
            type: data.card.type,
            issuer: data.card.issuer,
          }
        : undefined,
      email: data.email || undefined,
      contact: data.contact || undefined,
      paymentSummary: summary,
      raw: data,
    };
  } catch (err) {
    console.warn(`Error fetching Razorpay payment details for ${cleanId}:`, err);
    return null;
  }
}

/**
 * Looks up the primary payment on a Razorpay Order ID.
 */
export async function getRazorpayPaymentByOrderId(razorpayOrderId: string): Promise<RazorpayPaymentInfo | null> {
  const cleanId = (razorpayOrderId || "").trim();
  if (!cleanId) return null;

  try {
    const authHeader = `Basic ${Buffer.from(
      `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
    ).toString("base64")}`;

    const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(cleanId)}/payments`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const items = data.items || [];
    const captured = items.find((p: any) => p.status === "captured") || items[0];

    if (captured?.id) {
      return getRazorpayPaymentDetails(captured.id);
    }
  } catch (err) {
    console.warn(`Error fetching payments for Razorpay order ${cleanId}:`, err);
  }

  return null;
}

