/**
 * Cashfree Payment Gateway Client for Turkiye Jam
 * Handles Payment Gateway (Collection), Orders, and Verification
 * 100% compatible with Node.js, Next.js, and Cloudflare Workers (OpenNext).
 */

const APP_ID =
  process.env.CASHFREE_APP_ID || "";

const SECRET_KEY =
  process.env.CASHFREE_SECRET_KEY || "";

const PG_BASE_URL =
  process.env.CASHFREE_API_URL || "https://api.cashfree.com/pg";

export interface CreateCashfreeOrderParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
  notifyUrl?: string;
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
  const cleanPhone = params.customerPhone.replace(/\D/g, "").slice(-10);

  const payload = {
    order_id: params.orderId,
    order_amount: Math.round(params.amount * 100) / 100,
    order_currency: "INR",
    customer_details: {
      customer_id: `cust_${cleanPhone || "guest"}`,
      customer_name: params.customerName || "Customer",
      customer_email: params.customerEmail || "support@turkiyejam.com",
      customer_phone: cleanPhone || "9876543210",
    },
    order_meta: {
      return_url:
        params.returnUrl ||
        `https://turkiyejam.com/checkout?cf_order_id={order_id}`,
      notify_url:
        params.notifyUrl ||
        `https://turkiyejam.com/api/webhooks/cashfree`,
      payment_methods: "cc,dc,upi,nb,app",
    },
  };

  const res = await fetch(`${PG_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "x-client-id": APP_ID,
      "x-client-secret": SECRET_KEY,
      "x-api-version": "2023-08-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Cashfree Order Error: ${res.status}`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * 2. Fetch Cashfree Order Details
 */
export async function fetchCashfreeOrder(orderId: string): Promise<any> {
  const res = await fetch(`${PG_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      "x-client-id": APP_ID,
      "x-client-secret": SECRET_KEY,
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
 * 3. Fetch Payments under Order
 */
export async function fetchCashfreeOrderPayments(orderId: string): Promise<any[]> {
  const res = await fetch(
    `${PG_BASE_URL}/orders/${encodeURIComponent(orderId)}/payments`,
    {
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    return [];
  }

  return Array.isArray(data) ? data : [];
}

/**
 * 4. Verify Cashfree Payment
 */
export async function verifyCashfreePayment(orderId: string): Promise<{
  paid: boolean;
  orderStatus: string;
  paymentId?: string;
  paymentMethod?: string;
  amount?: number;
}> {
  try {
    const order = await fetchCashfreeOrder(orderId);
    if (!order) {
      return { paid: false, orderStatus: "UNKNOWN" };
    }

    const isPaid = order.order_status === "PAID";
    let paymentId: string | undefined = undefined;
    let paymentMethod: string | undefined = undefined;

    if (isPaid) {
      try {
        const payments = await fetchCashfreeOrderPayments(orderId);
        const successful = payments.find((p: any) => p.payment_status === "SUCCESS");
        if (successful) {
          paymentId = String(successful.cf_payment_id || successful.bank_reference || "");
          paymentMethod = successful.payment_group || "Online";
        }
      } catch (pErr) {
        // Non-fatal
      }
    }

    return {
      paid: isPaid,
      orderStatus: order.order_status,
      paymentId: paymentId || `cf_${order.order_id}`,
      paymentMethod,
      amount: order.order_amount,
    };
  } catch (err: any) {
    console.error("verifyCashfreePayment error:", err);
    return { paid: false, orderStatus: "ERROR" };
  }
}

