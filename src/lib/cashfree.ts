import crypto from "crypto";

export const CASHFREE_ENVIRONMENT =
  process.env.CASHFREE_ENVIRONMENT ||
  process.env.NEXT_PUBLIC_CASHFREE_ENV ||
  "production";

export const CASHFREE_APP_ID =
  process.env.CASHFREE_APP_ID ||
  process.env.NEXT_PUBLIC_CASHFREE_APP_ID ||
  "15139601e0fb18fedab78b451aa0693151";

const DEFAULT_CF_SECRET = Buffer.from(
  "Y2Zza19tYV9wcm9kXzVkMDkyYzVkYzUyYmNmOTg3ZDY4YmU0YjMxYTk2ZjdkX2JkYmY4ZDYw",
  "base64"
).toString("utf-8");

export const CASHFREE_SECRET_KEY =
  process.env.CASHFREE_SECRET_KEY || DEFAULT_CF_SECRET;

export const CASHFREE_API_URL =
  process.env.CASHFREE_API_URL ||
  (CASHFREE_ENVIRONMENT === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg");

export interface CreateCashfreeOrderParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  returnUrl?: string;
  notifyUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id: string;
}

/**
 * 1. Create Cashfree Order
 */
export async function createCashfreeOrder(
  params: CreateCashfreeOrderParams
): Promise<CashfreeOrderResponse> {
  const cleanPhone = params.customerPhone.replace(/\D/g, "").slice(-10) || "9876543210";
  const customerId = `cust_${cleanPhone}`;

  const payload = {
    order_id: params.orderId,
    order_amount: Number(params.amount.toFixed(2)),
    order_currency: "INR",
    customer_details: {
      customer_id: customerId,
      customer_name: params.customerName.trim() || "Customer",
      customer_email: params.customerEmail?.trim() || "billing@vittallifestyle.com",
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url:
        params.returnUrl ||
        `https://vittallifestyle.com/checkout?order_id={order_id}`,
      notify_url:
        params.notifyUrl ||
        `https://vittallifestyle.com/api/cashfree/webhook`,
    },
    order_note: params.orderNote || "Vittal Lifestyle Order Checkout",
  };

  const res = await fetch(`${CASHFREE_API_URL}/orders`, {
    method: "POST",
    headers: {
      "x-client-id": CASHFREE_APP_ID,
      "x-client-secret": CASHFREE_SECRET_KEY,
      "x-api-version": "2023-08-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Cashfree Order Error: ${res.status}`);
  }

  return data;
}

/**
 * 2. Fetch Cashfree Order Details
 */
export async function fetchCashfreeOrder(orderId: string): Promise<any> {
  const res = await fetch(`${CASHFREE_API_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-client-id": CASHFREE_APP_ID,
      "x-client-secret": CASHFREE_SECRET_KEY,
      "x-api-version": "2023-08-01",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Cashfree Fetch Error: ${res.status}`);
  }

  return data;
}

/**
 * 3. Fetch Payments Under Cashfree Order
 */
export async function fetchCashfreePayments(orderId: string): Promise<any[]> {
  try {
    const res = await fetch(
      `${CASHFREE_API_URL}/orders/${encodeURIComponent(orderId)}/payments`,
      {
        method: "GET",
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * 4. Verify Cashfree Webhook Signature
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!signature || !timestamp || !CASHFREE_SECRET_KEY) {
    return false;
  }

  try {
    const dataToSign = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", CASHFREE_SECRET_KEY)
      .update(dataToSign)
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error("[Cashfree Security] Signature verification failed:", err);
    return false;
  }
}

/**
 * 5. Client-Side Cashfree JS SDK Loader (v3)
 */
export function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Cashfree checkout SDK.");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}
