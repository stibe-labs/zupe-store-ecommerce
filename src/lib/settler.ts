/**
 * Settler Payment Gateway Integration for Vittal Lifestyle
 * Platform: https://settler.pydart.com / https://settler-gateway.stibelabs.workers.dev
 * Handles invoice generation, Cashfree order initiation, dynamic UPI QR generation, and real-time bank verification.
 */

export const SETTLER_BASE_URL =
  process.env.SETTLER_BASE_URL || "https://settler.pydart.com";

export const SETTLER_FALLBACK_URL =
  "https://settler-gateway.stibelabs.workers.dev";

// Approved Retail merchant with 0% platform fee
export const SETTLER_DEFAULT_TENANT =
  process.env.SETTLER_TENANT_ID || "client_turkiyejam";

export interface CreateSettlerInvoiceParams {
  tenantId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  title: string;
  amountRupees: number;
}

export interface SettlerInvoiceResponse {
  success: boolean;
  invoice: {
    id: string;
    invoiceNumber: string;
    tenantId: string;
    tenantName: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    title: string;
    amountRupees: number;
    amountPaise: number;
    dueDate: string;
    payUrl: string;
  };
  error?: string;
}

export interface SettlerOrderInitiateResponse {
  success: boolean;
  paymentOrderId: string;
  cashfreeOrderId: string;
  paymentSessionId: string;
  alreadyPaid?: boolean;
  error?: string;
}

export interface SettlerOrderVerifyResponse {
  paid: boolean;
  status: string;
  receiptNumber?: string;
  bankReference?: string;
  settlement?: any;
  error?: string;
}

/**
 * 1. Create Invoice on Settler
 */
export async function createSettlerInvoice(
  params: CreateSettlerInvoiceParams
): Promise<SettlerInvoiceResponse> {
  const url = `${SETTLER_BASE_URL}/api/v1/invoices/create`;
  const tenantId = params.tenantId || SETTLER_DEFAULT_TENANT;

  const payload = {
    tenantId,
    customerName: params.customerName,
    customerEmail: params.customerEmail || "support@vittallifestyle.com",
    customerPhone: params.customerPhone.replace(/\D/g, "").slice(-10),
    title: params.title || "Order Checkout - Vittal Lifestyle",
    amountRupees: Number(params.amountRupees),
  };

  try {
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Fallback to secondary gateway domain if needed
      const fallbackUrl = `${SETTLER_FALLBACK_URL}/api/v1/invoices/create`;
      res = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("[Settler] Create Invoice Error:", err);
    throw new Error(err.message || "Failed to reach Settler gateway");
  }
}

/**
 * 2. Initiate Cashfree Order via Settler
 */
export async function initiateSettlerOrder(
  invoiceId: string
): Promise<SettlerOrderInitiateResponse> {
  const url = `${SETTLER_BASE_URL}/api/v1/orders/initiate`;

  try {
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });

    if (!res.ok) {
      const fallbackUrl = `${SETTLER_FALLBACK_URL}/api/v1/orders/initiate`;
      res = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("[Settler] Initiate Order Error:", err);
    throw new Error(err.message || "Failed to initiate payment session");
  }
}

/**
 * 3. Verify Payment Status via Settler
 */
export async function verifySettlerOrder(
  orderId: string
): Promise<SettlerOrderVerifyResponse> {
  const url = `${SETTLER_BASE_URL}/api/v1/orders/verify`;

  try {
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      const fallbackUrl = `${SETTLER_FALLBACK_URL}/api/v1/orders/verify`;
      res = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("[Settler] Verify Order Error:", err);
    return { paid: false, status: "ERROR", error: err.message };
  }
}

/**
 * 4. Generate NPCI-compliant UPI URI
 * Enables instant 1-tap mobile payment and zero-dependency dynamic QR generation
 */
export function generateSettlerUpiString(
  cashfreeOrderId: string,
  amountRupees: number,
  payeeName: string = "Settler"
): string {
  const vpa = "cashfree@icici";
  const name = encodeURIComponent(payeeName);
  const amount = Number(amountRupees).toFixed(2);
  const note = encodeURIComponent(cashfreeOrderId);

  return `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
}
