import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName = "Customer",
      customerPhone = "",
      customerEmail = "support@turkiyejam.com",
      title = "Turkiye Jam Herbal Paste",
      itemAmount = 899,
      deliveryCharge = 49,
      totalAmount,
      shippingAddress = "",
      redirectUrl = "https://turkiyejam.com/orders",
    } = body;

    const resolvedAmount = typeof totalAmount === "number" && totalAmount > 0
      ? totalAmount
      : (Number(itemAmount) || 0) + (Number(deliveryCharge) || 0);

    const cleanPhone = customerPhone.replace(/\D/g, "").slice(-10) || "9876543210";

    // 1. Create invoice on Settler platform (settler.pydart.com)
    const settlerRes = await fetch("https://settler.pydart.com/api/v1/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk_live_stibe_prod_7793",
      },
      body: JSON.stringify({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || "support@turkiyejam.com",
        title: `${title.trim()}${deliveryCharge > 0 ? ` + Delivery (₹${deliveryCharge})` : ""}`,
        amountRupees: resolvedAmount,
        redirectUrl,
      }),
    });

    const settlerData: any = await settlerRes.json();
    if (!settlerRes.ok || !settlerData.success || !settlerData.invoice) {
      return NextResponse.json(
        {
          success: false,
          error: settlerData.error || "Failed to create invoice on Settler gateway",
        },
        { status: 500 }
      );
    }

    const invoice = settlerData.invoice;
    const invoiceId = invoice.id;
    const payUrl = `https://settler.pydart.com/pay/${invoiceId}`;

    // 2. Pre-warm Cashfree gateway session so the customer enters directly without lag
    try {
      await fetch("https://settler.pydart.com/api/v1/orders/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          redirectUrl,
        }),
      });
    } catch (initErr) {
      console.warn("Settler order pre-initiation failed (invoice still valid):", initErr);
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      payUrl,
      amountRupees: resolvedAmount,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      shippingAddress: shippingAddress.trim(),
    });
  } catch (err: any) {
    console.error("Payment link creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
