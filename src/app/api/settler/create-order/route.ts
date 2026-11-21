import { NextRequest, NextResponse } from "next/server";
import {
  createSettlerInvoice,
  initiateSettlerOrder,
  generateSettlerUpiString,
  SETTLER_BASE_URL,
} from "@/lib/settler";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, customerName, customerEmail, customerPhone, items, title } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount specified" },
        { status: 400 }
      );
    }

    const cleanPhone = (customerPhone || "").replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    // 1. Live stock verification before creating payment session
    if (items && Array.isArray(items) && items.length > 0) {
      const { validateOrderStock } = await import("@/lib/inventoryService");
      const stockValidation = await validateOrderStock(items);
      if (!stockValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error:
              stockValidation.error ||
              "One or more items in your cart are currently out of stock.",
            outOfStockItems: stockValidation.outOfStockItems,
          },
          { status: 400 }
        );
      }
    }

    const orderTitle =
      title ||
      `Order Checkout - Vittal Lifestyle (${cleanPhone})`;

    // 2. Create Invoice on Settler
    const invoiceRes = await createSettlerInvoice({
      customerName: customerName || "Vittal Shopper",
      customerEmail: customerEmail || "support@vittallifestyle.com",
      customerPhone: cleanPhone,
      title: orderTitle,
      amountRupees: amount,
    });

    const invoiceId = invoiceRes.invoice?.id;
    if (!invoiceRes.success || !invoiceId) {
      throw new Error(invoiceRes.error || "Failed to create Settler invoice");
    }

    // 3. Initiate Cashfree Order on Settler
    const orderRes = await initiateSettlerOrder(invoiceId);
    if (!orderRes.success || !orderRes.cashfreeOrderId) {
      throw new Error(orderRes.error || "Failed to initiate Settler payment order");
    }

    // 4. Generate Dynamic UPI QR & App Links
    const upiString = generateSettlerUpiString(
      orderRes.cashfreeOrderId,
      amount,
      "Vittal Lifestyle"
    );

    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 320,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    });

    const embedPayUrl = `${SETTLER_BASE_URL}/pay/${invoiceId}?embed=true`;

    return NextResponse.json({
      success: true,
      invoiceId,
      cashfreeOrderId: orderRes.cashfreeOrderId,
      paymentOrderId: orderRes.paymentOrderId,
      paymentSessionId: orderRes.paymentSessionId,
      payUrl: embedPayUrl,
      upiString,
      qrDataUrl,
      amount,
    });
  } catch (err: any) {
    console.error("Error in Settler create-order:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize payment with Settler Gateway",
      },
      { status: 500 }
    );
  }
}
