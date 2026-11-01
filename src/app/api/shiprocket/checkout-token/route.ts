import { NextRequest, NextResponse } from "next/server";
import { FASTRR_CONFIG, TJ_CATALOG_PRODUCTS, computeHmacSha256 } from "@/lib/fastrr";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items = [], redirectUrl } = body;

    // Map cart items to Shiprocket Fastrr items with catalog_data
    const formattedItems = (items || []).map((cartItem: any) => {
      // Find matching catalog product
      const catalogMatch =
        TJ_CATALOG_PRODUCTS.find(
          (p) =>
            p.slug === cartItem.id ||
            p.sku === cartItem.id ||
            cartItem.id?.includes(p.slug) ||
            cartItem.name?.toLowerCase().includes(p.subtitle?.toLowerCase())
        ) || TJ_CATALOG_PRODUCTS[1]; // fallback to 3 sachet

      return {
        variant_id: String(catalogMatch.variant_id),
        quantity: Math.max(1, Number(cartItem.quantity || 1)),
        catalog_data: {
          price: Number(cartItem.price || catalogMatch.price),
          name: cartItem.name || catalogMatch.title,
          image_url: cartItem.poster_image || catalogMatch.image,
        },
      };
    });

    if (formattedItems.length === 0) {
      formattedItems.push({
        variant_id: String(TJ_CATALOG_PRODUCTS[1].variant_id),
        quantity: 1,
        catalog_data: {
          price: TJ_CATALOG_PRODUCTS[1].price,
          name: TJ_CATALOG_PRODUCTS[1].title,
          image_url: TJ_CATALOG_PRODUCTS[1].image,
        },
      });
    }

    const payload = {
      cart_data: {
        items: formattedItems,
        custom_attributes: {
          store: "turkiyejam",
        },
        mobile_app: false,
      },
      redirect_url: redirectUrl || "https://turkiyejam.com/order-tracking",
      timestamp: new Date().toISOString(),
    };

    const rawPayload = JSON.stringify(payload);
    const hmac = computeHmacSha256(rawPayload, FASTRR_CONFIG.apiSecret);

    const res = await fetch(`${FASTRR_CONFIG.baseUrl}/api/v1/access-token/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": FASTRR_CONFIG.apiKey,
        "X-Api-HMAC-SHA256": hmac,
      },
      body: rawPayload,
    });

    const data = (await res.json()) as any;

    if (!res.ok || !data.ok) {
      console.warn("[Fastrr Checkout Token] Error response:", res.status, data);
      return NextResponse.json(
        {
          success: false,
          error: data?.error?.message || "Failed to generate Shiprocket checkout token",
          status: res.status,
          details: data,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.result?.token,
      orderId: data.result?.data?.order_id,
      expiresAt: data.result?.expires_at,
    });
  } catch (err: any) {
    console.error("[Fastrr Checkout Token] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
