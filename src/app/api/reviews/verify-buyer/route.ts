import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/orderStore";
import { getERPOrders } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = (searchParams.get("productId") || "").toLowerCase().trim();
    const email = (searchParams.get("email") || "").toLowerCase().trim();
    const phone = (searchParams.get("phone") || "").replace(/\D/g, "");
    const orderId = (searchParams.get("orderId") || "").trim();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID or slug is required" },
        { status: 400 }
      );
    }

    if (!email && !phone && !orderId) {
      return NextResponse.json({
        success: true,
        isVerified: false,
        message: "Please sign in or provide an Order ID / phone number to verify your purchase.",
      });
    }

    // Helper function to check if an items array includes the given product
    const matchesProduct = (items: any[]) => {
      if (!Array.isArray(items)) return false;
      return items.some((it) => {
        const itId = String(it.product_id || it.id || "").toLowerCase().trim();
        const itName = String(it.name || it.product_name || "").toLowerCase().trim();
        return (
          itId === productId ||
          productId.includes(itId) ||
          itId.includes(productId) ||
          (itName && productId.length > 3 && itName.includes(productId))
        );
      });
    };

    // 1. Check Storefront Orders
    const allStoreOrders = getOrders();

    // Check by Order ID first if provided
    if (orderId) {
      const match = allStoreOrders.find(
        (o) => o.id.toLowerCase() === orderId.toLowerCase()
      );
      if (match && matchesProduct(match.items)) {
        return NextResponse.json({
          success: true,
          isVerified: true,
          orderId: match.id,
          customerName: match.customer_name,
          customerEmail: match.customer_email,
        });
      }
    }

    // Check by email or phone
    const userStoreOrders = allStoreOrders.filter((o) => {
      const oEmail = (o.customer_email || "").toLowerCase().trim();
      const oPhone = (o.customer_phone || "").replace(/\D/g, "");
      return (
        (email && oEmail === email) ||
        (phone && oPhone.length >= 7 && (oPhone.includes(phone) || phone.includes(oPhone)))
      );
    });

    for (const o of userStoreOrders) {
      if (matchesProduct(o.items)) {
        return NextResponse.json({
          success: true,
          isVerified: true,
          orderId: o.id,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
        });
      }
    }

    // 2. Check ERP Orders
    try {
      const allErpOrders = await getERPOrders();

      if (orderId) {
        const matchErp = allErpOrders.find(
          (o) => o.id.toLowerCase() === orderId.toLowerCase()
        );
        if (matchErp) {
          let items = matchErp.items;
          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch {
              items = [];
            }
          }
          if (matchesProduct(items)) {
            return NextResponse.json({
              success: true,
              isVerified: true,
              orderId: matchErp.id,
              customerName: matchErp.customer_name,
              customerEmail: matchErp.guest_email,
            });
          }
        }
      }

      const userErpOrders = allErpOrders.filter((o) => {
        const oEmail = (o.guest_email || "").toLowerCase().trim();
        const oPhone = (o.customer_phone || "").replace(/\D/g, "");
        return (
          (email && oEmail === email) ||
          (phone && oPhone.length >= 7 && (oPhone.includes(phone) || phone.includes(oPhone)))
        );
      });

      for (const o of userErpOrders) {
        let items = o.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }
        if (matchesProduct(items)) {
          return NextResponse.json({
            success: true,
            isVerified: true,
            orderId: o.id,
            customerName: o.customer_name,
            customerEmail: o.guest_email,
          });
        }
      }
    } catch (erpErr) {
      console.warn("ERP verify buyer lookup error:", erpErr);
    }

    return NextResponse.json({
      success: true,
      isVerified: false,
      message: "No verified purchase found for this product with the given details.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
