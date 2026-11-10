import crypto from "crypto";

export const FASTRR_CONFIG = {
  apiKey: process.env.SHIPROCKET_CHECKOUT_API_KEY || "SJDGjm63QEW11sat",
  apiSecret: process.env.SHIPROCKET_CHECKOUT_API_SECRET || "8rXNirBwWVrkDOwrNHFs9nLccBKIrC98",
  baseUrl: "https://checkout-api.shiprocket.com",
};

export const VD_CATALOG_PRODUCTS = [
  {
    id: 1001,
    variant_id: 2001,
    sku: "VD-EARBUDS-ANC",
    slug: "wireless-earbuds",
    title: "Wireless Earbuds ANC",
    subtitle: "Hybrid ANC + 36h Playback + 1-Year Warranty",
    price: 2999.0,
    mrp: 3999.0,
    image: "https://vittaldigital.com/vittal/wireless-earbuds.png",
    quantity: 1,
    weight: 0.15,
  },
  {
    id: 1002,
    variant_id: 2002,
    sku: "VD-SPEAKER-BT",
    slug: "portable-bluetooth-speaker",
    title: "Portable Bluetooth Speaker",
    subtitle: "24W 360° Stereo Bass + IP67 Waterproof",
    price: 3999.0,
    mrp: 4999.0,
    image: "https://vittaldigital.com/vittal/portable-bluetooth-speaker.png",
    quantity: 1,
    weight: 0.55,
  },
  {
    id: 1003,
    variant_id: 2003,
    sku: "VD-WATCH-PRO",
    slug: "smart-watch-pro",
    title: "Smart Watch Pro",
    subtitle: "1.43\" AMOLED Display + BT Calling + Titanium Bezel",
    price: 5999.0,
    mrp: 7999.0,
    image: "https://vittaldigital.com/vittal/smart-watch-pro.png",
    quantity: 1,
    weight: 0.12,
  },
  {
    id: 1004,
    variant_id: 2004,
    sku: "VD-AIRPODS-PRO2",
    slug: "airpods-pro-2",
    title: "AirPods Pro (2nd Gen)",
    subtitle: "Active Noise Cancellation + MagSafe Case",
    price: 4999.0,
    mrp: 24900.0,
    image: "https://vittaldigital.com/products/airpods-pro-2.png",
    quantity: 1,
    weight: 0.18,
  },
  {
    id: 1005,
    variant_id: 2005,
    sku: "VD-WATCH-ULTRA2",
    slug: "apple-watch-ultra-2",
    title: "Apple Watch Ultra 2",
    subtitle: "49mm Titanium Case with Ocean Band",
    price: 7999.0,
    mrp: 89900.0,
    image: "https://vittaldigital.com/products/apple-watch-ultra-2.png",
    quantity: 1,
    weight: 0.22,
  },
  {
    id: 1006,
    variant_id: 2006,
    sku: "VD-SONY-XM5",
    slug: "sony-wh-1000xm5",
    title: "Sony WH-1000XM5 Wireless Headphones",
    subtitle: "Industry Leading Noise Canceling + 30h Battery",
    price: 8999.0,
    mrp: 29990.0,
    image: "https://vittaldigital.com/products/sony-wh-1000xm5.png",
    quantity: 1,
    weight: 0.45,
  },
];

// Backward-compatible alias for existing imports
export const TJ_CATALOG_PRODUCTS = VD_CATALOG_PRODUCTS;

export function computeHmacSha256(payload: string, secret: string = FASTRR_CONFIG.apiSecret): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64");
}

export function formatProductForShiprocket(p: (typeof VD_CATALOG_PRODUCTS)[0]) {
  return {
    id: p.id,
    title: p.title,
    body_html: `<p>${p.title} - ${p.subtitle}. 1-Year Pan-India Warranty.</p>`,
    vendor: "Vittal Digital",
    product_type: "Consumer Electronics & Smart Gadgets",
    created_at: "2026-01-01T00:00:00Z",
    handle: p.slug,
    updated_at: "2026-01-01T00:00:00Z",
    tags: "electronics, gadgets, headphones, smartwatch, speaker, accessories",
    status: "active",
    variants: [
      {
        id: p.variant_id,
        title: p.title,
        price: p.price.toFixed(2),
        compare_at_price: p.mrp.toFixed(2),
        sku: p.sku,
        quantity: 999,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        taxable: true,
        option_values: {
          "Model": p.title,
        },
        grams: Math.round(p.weight * 1000),
        image: {
          src: p.image,
        },
        weight: p.weight,
        weight_unit: "kg",
      },
    ],
    image: {
      src: p.image,
    },
    options: [
      {
        name: "Model",
        values: [p.title],
      },
    ],
  };
}

/**
 * Fetch full order details directly from Shiprocket Fastrr Checkout API
 */
export async function getFastrrOrderDetails(orderId: string): Promise<any | null> {
  try {
    const detailsBody = JSON.stringify({
      order_id: orderId,
      timestamp: new Date().toISOString(),
    });
    const hmac = computeHmacSha256(detailsBody);

    const res = await fetch(`${FASTRR_CONFIG.baseUrl}/api/v1/custom-platform-order/details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": FASTRR_CONFIG.apiKey,
        "X-Api-HMAC-SHA256": hmac,
      },
      body: detailsBody,
    });

    if (res.ok) {
      const data = await res.json();
      return data.result || data.data || data;
    }
    return null;
  } catch (e) {
    console.error("[Fastrr] getFastrrOrderDetails error:", e);
    return null;
  }
}

/**
 * Maps Fastrr checkout order payload to our standard ERPOrder schema
 */
export function fastrrOrderToERPOrder(res: any): any {
  const o = res.result || res;
  const sAddr = o.shipping_address || {};
  const customerName =
    [sAddr.first_name, sAddr.last_name].filter(Boolean).join(" ") ||
    o.customer_name ||
    "Customer";
  const addressStr = [
    sAddr.line1,
    sAddr.line2,
    sAddr.city,
    sAddr.state,
    sAddr.pincode,
    sAddr.country,
  ]
    .filter(Boolean)
    .join(", ");

  const rawItems = o.cart_data?.items || [];
  const items = rawItems.map((it: any) => ({
    id: it.variant_id || "2001",
    name: it.item_catalog_data?.name || it.name || "Vittal Digital Electronics Package",
    quantity: it.quantity || 1,
    price: it.price || it.item_catalog_data?.price || 0,
    image: it.item_catalog_data?.image_url || "/vittal/wireless-earbuds.png",
  }));

  const paymentMethod =
    (o.payment_type || "").toUpperCase().includes("COD") ||
    (o.payment_type || "").toUpperCase().includes("CASH")
      ? "COD"
      : "Prepaid";

  const total = Number(o.total_amount_payable || o.subtotal_price || 0);

  return {
    id: o.order_id || o.platform_order_id,
    shopify_order_id: o.fastrr_order_id
      ? `#VD-${o.fastrr_order_id.slice(-4)}`
      : `#VD-${(o.order_id || "").slice(-4)}`,
    customer_name: customerName,
    customer_phone: o.phone || sAddr.phone || "",
    guest_email: o.email || sAddr.email || "",
    total_amount: total,
    product_cost: Math.round(total * 0.42),
    shipping_cost: Number(o.shipping_charges || 0),
    rto_shipping_charge: 0,
    ad_spend_attributed: Math.round(total * 0.15),
    net_profit: Math.round(total * 0.43),
    status: "Processing",
    payment_method: paymentMethod,
    payment_status: paymentMethod === "COD" ? "Pending" : "Completed",
    shipping_address: addressStr || "India",
    shiprocket_awb: o.fastrr_order_id ? `SR-${o.fastrr_order_id}` : "",
    courier_partner: "Express Logistics",
    delivery_status: "Processing",
    created_at: o.order_created_date || new Date().toISOString(),
    items: items,
  };
}


