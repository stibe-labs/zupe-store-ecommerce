// Promo Codes & Coupons Data Layer (Cloudflare D1 + In-Memory Fallback)
import { executeD1Query } from "@/lib/d1";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: "PERCENTAGE" | "FLAT";
  discount_value: number; // e.g., 10 for 10%, or 50 for ₹50
  min_order_amount: number; // e.g. 0 or 499
  max_discount_amount?: number | null; // e.g., max ₹100 for percentage
  expires_at?: string | null; // ISO datetime string or null
  usage_limit?: number | null; // max total redemptions
  usage_count: number;
  is_active: boolean;
  applicable_type: "ALL" | "SPECIFIC";
  applicable_products: string[]; // product IDs or slugs
  created_at: string;
  updated_at: string;
}

export interface ValidationItem {
  id: string;
  price: number;
  quantity: number;
  name?: string;
}

export interface ValidationResult {
  valid: boolean;
  discount: number;
  code?: string;
  description?: string;
  message?: string;
  error?: string;
  coupon?: Coupon;
}

// Initial baseline coupons
export const SEED_COUPONS: Coupon[] = [
  {
    id: "promo_zupe10",
    code: "ZUPE10",
    description: "Flat 10% OFF on all store products (up to ₹100)",
    discount_type: "PERCENTAGE",
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: 100,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ahead
    usage_limit: 500,
    usage_count: 24,
    is_active: true,
    applicable_type: "ALL",
    applicable_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "promo_save50",
    code: "SAVE50",
    description: "Flat ₹50 OFF on orders above ₹399",
    discount_type: "FLAT",
    discount_value: 50,
    min_order_amount: 399,
    max_discount_amount: null,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    usage_limit: 300,
    usage_count: 58,
    is_active: true,
    applicable_type: "ALL",
    applicable_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "promo_welcome10",
    code: "WELCOME10",
    description: "New customer special: 10% OFF your entire purchase",
    discount_type: "PERCENTAGE",
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: 150,
    expires_at: null, // Never expires
    usage_limit: 1000,
    usage_count: 112,
    is_active: true,
    applicable_type: "ALL",
    applicable_products: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "promo_heatingpad20",
    code: "HEAT20",
    description: "Special 20% OFF on Portable Menstrual Heating Pad",
    discount_type: "PERCENTAGE",
    discount_value: 20,
    min_order_amount: 0,
    max_discount_amount: 250,
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    usage_limit: 200,
    usage_count: 31,
    is_active: true,
    applicable_type: "SPECIFIC",
    applicable_products: ["portable-menstrual-heating-pad", "menstrual-heating-pad"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let inMemoryCoupons: Coupon[] = [...SEED_COUPONS];
let tableInitialized = false;

export async function ensureCouponsTable(): Promise<void> {
  if (tableInitialized) return;
  try {
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        discount_type TEXT DEFAULT 'PERCENTAGE',
        discount_value REAL NOT NULL,
        min_order_amount REAL DEFAULT 0,
        max_discount_amount REAL,
        expires_at TIMESTAMP,
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        applicable_type TEXT DEFAULT 'ALL',
        applicable_products TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist if table was created previously with older schema
    try {
      await executeD1Query(`ALTER TABLE coupons ADD COLUMN applicable_type TEXT DEFAULT 'ALL';`);
    } catch {}
    try {
      await executeD1Query(`ALTER TABLE coupons ADD COLUMN applicable_products TEXT DEFAULT '[]';`);
    } catch {}
    try {
      await executeD1Query(`ALTER TABLE coupons ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    } catch {}

    tableInitialized = true;
  } catch (err) {
    console.warn("Could not ensure coupons table in D1:", err);
  }
}

function parseDbCoupon(row: any): Coupon {
  let products: string[] = [];
  if (row.applicable_products) {
    try {
      products = typeof row.applicable_products === "string" ? JSON.parse(row.applicable_products) : row.applicable_products;
    } catch {
      products = [];
    }
  }

  return {
    id: String(row.id),
    code: String(row.code).trim().toUpperCase(),
    description: row.description || "",
    discount_type: row.discount_type === "FLAT" ? "FLAT" : "PERCENTAGE",
    discount_value: Number(row.discount_value) || 0,
    min_order_amount: Number(row.min_order_amount) || 0,
    max_discount_amount: row.max_discount_amount !== null && row.max_discount_amount !== undefined ? Number(row.max_discount_amount) : null,
    expires_at: row.expires_at || null,
    usage_limit: row.usage_limit !== null && row.usage_limit !== undefined ? Number(row.usage_limit) : null,
    usage_count: Number(row.usage_count) || 0,
    is_active: row.is_active === 1 || row.is_active === true,
    applicable_type: row.applicable_type === "SPECIFIC" ? "SPECIFIC" : "ALL",
    applicable_products: Array.isArray(products) ? products : [],
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export async function getAllCoupons(): Promise<Coupon[]> {
  await ensureCouponsTable();

  try {
    const rows = await executeD1Query<any>(`SELECT * FROM coupons ORDER BY created_at DESC`);
    if (rows && rows.length > 0) {
      const dbCoupons = rows.map(parseDbCoupon);
      // Synchronize in-memory store
      inMemoryCoupons = dbCoupons;
      return dbCoupons;
    } else {
      // Seed default coupons into D1 if table is completely empty
      for (const sc of SEED_COUPONS) {
        try {
          await executeD1Query(
            `INSERT OR IGNORE INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, expires_at, usage_limit, usage_count, is_active, applicable_type, applicable_products, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sc.id,
              sc.code,
              sc.description,
              sc.discount_type,
              sc.discount_value,
              sc.min_order_amount,
              sc.max_discount_amount ?? null,
              sc.expires_at ?? null,
              sc.usage_limit ?? null,
              sc.usage_count,
              sc.is_active ? 1 : 0,
              sc.applicable_type,
              JSON.stringify(sc.applicable_products),
              sc.created_at,
              sc.updated_at,
            ]
          );
        } catch {}
      }
      return [...inMemoryCoupons];
    }
  } catch (err) {
    console.warn("Failed to fetch coupons from D1, using memory store:", err);
    return [...inMemoryCoupons];
  }
}

export async function getCouponByCode(rawCode: string): Promise<Coupon | null> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return null;

  await ensureCouponsTable();

  try {
    const rows = await executeD1Query<any>(`SELECT * FROM coupons WHERE UPPER(code) = ? LIMIT 1`, [code]);
    if (rows && rows.length > 0) {
      return parseDbCoupon(rows[0]);
    }
  } catch (err) {
    console.warn("Failed to query coupon by code from D1:", err);
  }

  // Memory fallback
  const mem = inMemoryCoupons.find((c) => c.code.toUpperCase() === code);
  return mem ? { ...mem } : null;
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  discount_type: "PERCENTAGE" | "FLAT";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  expires_at?: string | null;
  usage_limit?: number | null;
  is_active?: boolean;
  applicable_type?: "ALL" | "SPECIFIC";
  applicable_products?: string[];
}): Promise<Coupon> {
  const code = data.code.trim().toUpperCase();
  if (!code) {
    throw new Error("Promo code is required");
  }

  const existing = await getCouponByCode(code);
  if (existing) {
    throw new Error(`Promo code "${code}" already exists.`);
  }

  const newCoupon: Coupon = {
    id: `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code,
    description: data.description?.trim() || "",
    discount_type: data.discount_type === "FLAT" ? "FLAT" : "PERCENTAGE",
    discount_value: Number(data.discount_value) || 0,
    min_order_amount: Number(data.min_order_amount) || 0,
    max_discount_amount: data.max_discount_amount !== undefined && data.max_discount_amount !== null ? Number(data.max_discount_amount) : null,
    expires_at: data.expires_at || null,
    usage_limit: data.usage_limit !== undefined && data.usage_limit !== null ? Number(data.usage_limit) : null,
    usage_count: 0,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    applicable_type: data.applicable_type === "SPECIFIC" ? "SPECIFIC" : "ALL",
    applicable_products: Array.isArray(data.applicable_products) ? data.applicable_products : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Update Memory
  inMemoryCoupons = [newCoupon, ...inMemoryCoupons];

  // 2. Persist to D1
  await ensureCouponsTable();
  try {
    await executeD1Query(
      `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, expires_at, usage_limit, usage_count, is_active, applicable_type, applicable_products, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCoupon.id,
        newCoupon.code,
        newCoupon.description,
        newCoupon.discount_type,
        newCoupon.discount_value,
        newCoupon.min_order_amount,
        newCoupon.max_discount_amount ?? null,
        newCoupon.expires_at ?? null,
        newCoupon.usage_limit ?? null,
        newCoupon.usage_count,
        newCoupon.is_active ? 1 : 0,
        newCoupon.applicable_type,
        JSON.stringify(newCoupon.applicable_products),
        newCoupon.created_at,
        newCoupon.updated_at,
      ]
    );
  } catch (err) {
    console.warn("Failed to persist new coupon to D1:", err);
  }

  return newCoupon;
}

export async function updateCoupon(
  id: string,
  updates: Partial<Omit<Coupon, "id" | "created_at">>
): Promise<Coupon | null> {
  await ensureCouponsTable();

  // Find existing
  const all = await getAllCoupons();
  const existing = all.find((c) => c.id === id);
  if (!existing) return null;

  const updated: Coupon = {
    ...existing,
    ...updates,
    code: updates.code ? updates.code.trim().toUpperCase() : existing.code,
    updated_at: new Date().toISOString(),
  };

  // Update in memory
  inMemoryCoupons = inMemoryCoupons.map((c) => (c.id === id ? updated : c));

  // Update in D1
  try {
    await executeD1Query(
      `UPDATE coupons SET
        code = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        max_discount_amount = ?,
        expires_at = ?,
        usage_limit = ?,
        is_active = ?,
        applicable_type = ?,
        applicable_products = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        updated.code,
        updated.description,
        updated.discount_type,
        updated.discount_value,
        updated.min_order_amount,
        updated.max_discount_amount ?? null,
        updated.expires_at ?? null,
        updated.usage_limit ?? null,
        updated.is_active ? 1 : 0,
        updated.applicable_type,
        JSON.stringify(updated.applicable_products),
        updated.updated_at,
        id,
      ]
    );
  } catch (err) {
    console.warn("Failed to update coupon in D1:", err);
  }

  return updated;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  await ensureCouponsTable();

  inMemoryCoupons = inMemoryCoupons.filter((c) => c.id !== id);

  try {
    await executeD1Query(`DELETE FROM coupons WHERE id = ?`, [id]);
    return true;
  } catch (err) {
    console.warn("Failed to delete coupon in D1:", err);
    return false;
  }
}

export async function toggleCouponActive(id: string, isActive: boolean): Promise<boolean> {
  return (await updateCoupon(id, { is_active: isActive })) !== null;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const norm = (code || "").trim().toUpperCase();
  if (!norm) return;

  const target = inMemoryCoupons.find((c) => c.code === norm);
  if (target) {
    target.usage_count = (target.usage_count || 0) + 1;
  }

  try {
    await executeD1Query(
      `UPDATE coupons SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP WHERE UPPER(code) = ?`,
      [norm]
    );
  } catch (err) {
    console.warn("Failed to increment coupon usage count in D1:", err);
  }
}

/**
 * Validates a promo code for a given cart and subtotal
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  items: ValidationItem[] = []
): Promise<ValidationResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) {
    return { valid: false, discount: 0, error: "Please enter a valid promo code." };
  }

  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      error: `Promo code "${code}" is invalid or does not exist.`,
    };
  }

  // 1. Active Check
  if (!coupon.is_active) {
    return {
      valid: false,
      discount: 0,
      error: `Promo code "${coupon.code}" is currently disabled or inactive.`,
    };
  }

  // 2. Expiration Check
  if (coupon.expires_at) {
    const expiryTime = new Date(coupon.expires_at).getTime();
    const now = Date.now();
    if (!isNaN(expiryTime) && now > expiryTime) {
      const formattedDate = new Date(coupon.expires_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return {
        valid: false,
        discount: 0,
        error: `Promo code "${coupon.code}" has expired on ${formattedDate}.`,
      };
    }
  }

  // 3. Usage Limit Check
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.usage_limit > 0) {
    if (coupon.usage_count >= coupon.usage_limit) {
      return {
        valid: false,
        discount: 0,
        error: `Promo code "${coupon.code}" has reached its maximum redemption limit.`,
      };
    }
  }

  // 4. Minimum Order Amount Check
  if (coupon.min_order_amount > 0 && subtotal < coupon.min_order_amount) {
    const diff = coupon.min_order_amount - subtotal;
    return {
      valid: false,
      discount: 0,
      error: `Minimum order value of ₹${coupon.min_order_amount} required to use "${coupon.code}". Add ₹${diff} more to apply!`,
    };
  }

  // 5. Product Applicability Check
  let eligibleSubtotal = subtotal;

  if (coupon.applicable_type === "SPECIFIC") {
    const targetProducts = coupon.applicable_products.map((p) => p.toLowerCase().trim());
    if (targetProducts.length > 0) {
      // Find matching items in cart
      const matchingItems = items.filter((it) => {
        const idLower = (it.id || "").toLowerCase().trim();
        const nameLower = (it.name || "").toLowerCase().trim();
        return targetProducts.some(
          (tp) => idLower === tp || idLower.includes(tp) || tp.includes(idLower) || nameLower.includes(tp)
        );
      });

      if (matchingItems.length === 0) {
        return {
          valid: false,
          discount: 0,
          error: `This promo code is only valid for selected promotional products not currently in your cart.`,
        };
      }

      // Calculate subtotal of eligible items only
      eligibleSubtotal = matchingItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    }
  }

  // 6. Calculate Discount
  let discount = 0;
  if (coupon.discount_type === "PERCENTAGE") {
    discount = Math.round((eligibleSubtotal * coupon.discount_value) / 100);
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else {
    // FLAT
    discount = Math.min(eligibleSubtotal, coupon.discount_value);
  }

  if (discount <= 0) {
    return {
      valid: false,
      discount: 0,
      error: `Could not apply discount for this order.`,
    };
  }

  return {
    valid: true,
    discount,
    code: coupon.code,
    description: coupon.description,
    coupon,
    message: `🎉 Code ${coupon.code} applied! ₹${discount} discount added.`,
  };
}
