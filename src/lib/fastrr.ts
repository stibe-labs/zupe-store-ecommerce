import crypto from "crypto";

export const FASTRR_CONFIG = {
  apiKey: process.env.SHIPROCKET_CHECKOUT_API_KEY || "SJDGjm63QEW11sat",
  apiSecret: process.env.SHIPROCKET_CHECKOUT_API_SECRET || "8rXNirBwWVrkDOwrNHFs9nLccBKIrC98",
  baseUrl: "https://checkout-api.shiprocket.com",
};

export const TJ_CATALOG_PRODUCTS = [
  {
    id: 1002,
    variant_id: 2002,
    sku: "TJ-PACK-2",
    slug: "turkiye-jam-2-sachet",
    title: "Turkiye Jam (2 Sachet Pack)",
    subtitle: "The easy first order",
    price: 899.0,
    mrp: 1499.0,
    image: "https://turkiyejam.com/tj/turkiye-jam-2-strips.png",
    quantity: 2,
    weight: 0.05,
  },
  {
    id: 1003,
    variant_id: 2003,
    sku: "TJ-PACK-3",
    slug: "turkiye-jam-3-sachet",
    title: "Turkiye Jam (3 Sachet Pack)",
    subtitle: "Single-serve sachets",
    price: 1099.0,
    mrp: 1899.0,
    image: "https://turkiyejam.com/tj/turkiye-jam-3-strips.png",
    quantity: 3,
    weight: 0.075,
  },
  {
    id: 1004,
    variant_id: 2004,
    sku: "TJ-PACK-4",
    slug: "turkiye-jam-4-sachet",
    title: "Turkiye Jam (4 Sachet Pack)",
    subtitle: "Single-serve sachets",
    price: 1399.0,
    mrp: 2399.0,
    image: "https://turkiyejam.com/tj/turkiye-jam-4-strips.png",
    quantity: 4,
    weight: 0.1,
  },
  {
    id: 1006,
    variant_id: 2006,
    sku: "TJ-PACK-6",
    slug: "turkiye-jam-6-sachet",
    title: "Turkiye Jam (6 Sachet Pack)",
    subtitle: "Single-serve sachets",
    price: 1899.0,
    mrp: 3200.0,
    image: "https://turkiyejam.com/tj/turkiye-jam-6-strips.png",
    quantity: 6,
    weight: 0.15,
  },
  {
    id: 1012,
    variant_id: 2012,
    sku: "TJ-PACK-12",
    slug: "turkiye-jam-12-sachet",
    title: "Turkiye Jam (12 Sachet Pack)",
    subtitle: "Single-serve sachets",
    price: 3399.0,
    mrp: 5999.0,
    image: "https://turkiyejam.com/tj/turkiye-jam-12-strips.png",
    quantity: 12,
    weight: 0.3,
  },
  {
    id: 1024,
    variant_id: 2024,
    sku: "TJ-PACK-24",
    slug: "turkiye-jam-24-sachet",
    title: "Turkiye Jam (24 Sachet Pack)",
    subtitle: "Single-serve sachets",
    price: 5999.0,
    mrp: 10999.0,
    image: "https://turkiyejam.com/tj/turkiye-jam-24-strips.png",
    quantity: 24,
    weight: 0.6,
  },
];

export function computeHmacSha256(payload: string, secret: string = FASTRR_CONFIG.apiSecret): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64");
}

export function formatProductForShiprocket(p: (typeof TJ_CATALOG_PRODUCTS)[0]) {
  return {
    id: p.id,
    title: p.title,
    body_html: `<p>${p.title} - ${p.subtitle}. 100% Authentic Turkish Epimedium Jam.</p>`,
    vendor: "Turkiye Jam",
    product_type: "Vitality & Wellness",
    created_at: "2026-01-01T00:00:00Z",
    handle: p.slug,
    updated_at: "2026-01-01T00:00:00Z",
    tags: "wellness, herbal, jam, sachets",
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
          "Pack Size": `${p.quantity} Sachets`,
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
        name: "Pack Size",
        values: [`${p.quantity} Sachets`],
      },
    ],
  };
}
