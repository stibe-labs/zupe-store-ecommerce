import { executeD1Query } from "@/lib/d1";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export interface StockChangeItem {
  product_id?: string;
  name?: string;
  quantity?: number;
}

// In-memory stock tracker across runtime instances
const memoryStockOverrides = new Map<string, { stock_count: number; in_stock: number }>();

export function getMemoryStockOverride(
  idOrSlug: string
): { stock_count: number; in_stock: number } | null {
  if (!idOrSlug) return null;
  const norm = idOrSlug.toLowerCase().trim();
  return memoryStockOverrides.get(norm) || null;
}

export function setMemoryStockOverride(idOrSlug: string, stock: number, inStock?: number) {
  if (!idOrSlug) return;
  const norm = idOrSlug.toLowerCase().trim();
  const safeStock = Math.max(0, stock);
  const finalInStock = inStock !== undefined ? (Number(inStock) === 1 ? 1 : 0) : (safeStock > 0 ? 1 : 0);
  memoryStockOverrides.set(norm, { stock_count: safeStock, in_stock: finalInStock });
}

export interface OrderStockValidationResult {
  valid: boolean;
  outOfStockItems: Array<{
    product_id: string;
    name: string;
    requested_quantity: number;
    available_stock: number;
    in_stock: number;
    reason: string;
  }>;
  error?: string;
}

/**
 * Validate that all requested items are actively in stock.
 * Checks D1 database, memory cache overrides, and default catalog.
 */
export async function validateOrderStock(
  items: Array<{ product_id?: string; id?: string; name?: string; quantity?: number }>
): Promise<OrderStockValidationResult> {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, outOfStockItems: [], error: "No order items provided for stock verification." };
  }

  const outOfStockItems: OrderStockValidationResult["outOfStockItems"] = [];

  // Query D1 products table for fresh active catalog
  const d1ProductsMap = new Map<string, any>();
  try {
    const d1Rows = await executeD1Query<any>("SELECT id, slug, name, in_stock, stock_count FROM products;");
    if (d1Rows && Array.isArray(d1Rows)) {
      for (const row of d1Rows) {
        if (row.id) d1ProductsMap.set(String(row.id).toLowerCase().trim(), row);
        if (row.slug) d1ProductsMap.set(String(row.slug).toLowerCase().trim(), row);
      }
    }
  } catch (err) {
    console.warn("Failed to query D1 in validateOrderStock:", err);
  }

  for (const it of items) {
    const rawId = (it.product_id || (it as any).id || "").toLowerCase().trim();
    const rawName = (it.name || "").toLowerCase().trim();
    const qty = Math.max(1, Number(it.quantity || 1));

    // 1. Look up in D1
    const d1Prod = d1ProductsMap.get(rawId);

    // 2. Look up in memory override
    const memOverride =
      getMemoryStockOverride(rawId) ||
      (d1Prod?.slug ? getMemoryStockOverride(d1Prod.slug) : null) ||
      (d1Prod?.id ? getMemoryStockOverride(d1Prod.id) : null);

    // 3. Look up in DEFAULT_PRODUCTS
    const defaultProd = DEFAULT_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === rawId ||
        p.slug.toLowerCase() === rawId ||
        (rawName && p.name.toLowerCase().includes(rawName)) ||
        (rawName && rawName.includes(p.name.toLowerCase()))
    );

    const displayName = it.name || d1Prod?.name || defaultProd?.name || rawId || "Product";

    // Determine authoritative in_stock and stock_count
    let inStock = 1;
    let stockCount = 50;

    if (d1Prod) {
      inStock = d1Prod.in_stock !== undefined && d1Prod.in_stock !== null ? Number(d1Prod.in_stock) : 1;
      stockCount = d1Prod.stock_count !== undefined && d1Prod.stock_count !== null ? Number(d1Prod.stock_count) : 50;
    } else if (defaultProd) {
      inStock = defaultProd.in_stock !== undefined ? Number(defaultProd.in_stock) : 1;
      stockCount = Number(defaultProd.stock_count ?? 50);
    }

    if (memOverride) {
      if (memOverride.in_stock === 0) inStock = 0;
      stockCount = Math.min(stockCount, memOverride.stock_count);
    }

    // Check if item is out of stock or insufficient quantity
    if (inStock === 0) {
      outOfStockItems.push({
        product_id: it.product_id || (it as any).id || rawId,
        name: displayName,
        requested_quantity: qty,
        available_stock: 0,
        in_stock: 0,
        reason: "Marked Out of Stock",
      });
    } else if (stockCount <= 0) {
      outOfStockItems.push({
        product_id: it.product_id || (it as any).id || rawId,
        name: displayName,
        requested_quantity: qty,
        available_stock: 0,
        in_stock: 0,
        reason: "Stock depleted (0 available)",
      });
    } else if (qty > stockCount) {
      outOfStockItems.push({
        product_id: it.product_id || (it as any).id || rawId,
        name: displayName,
        requested_quantity: qty,
        available_stock: stockCount,
        in_stock: inStock,
        reason: `Only ${stockCount} left in stock (requested ${qty})`,
      });
    }
  }

  if (outOfStockItems.length > 0) {
    const names = outOfStockItems.map((o) => `"${o.name}"`).join(", ");
    return {
      valid: false,
      outOfStockItems,
      error: `Sorry, ${names} is currently out of stock and cannot be purchased. Please remove it from your cart to proceed.`,
    };
  }

  return { valid: true, outOfStockItems: [] };
}

/**
 * Decrement inventory across D1 database and in-memory caches
 */
export async function decrementInventory(items: StockChangeItem[]): Promise<void> {
  if (!items || !Array.isArray(items) || items.length === 0) return;

  for (const it of items) {
    const qty = Math.max(1, Number(it.quantity || 1));
    const targetId = (it.product_id || "").toLowerCase().trim();
    const targetName = (it.name || "").toLowerCase().trim();

    // 1. Identify matched product in DEFAULT_PRODUCTS
    const matchedProduct = DEFAULT_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === targetId ||
        p.slug.toLowerCase() === targetId ||
        (targetName && p.name.toLowerCase().includes(targetName)) ||
        (targetName && targetName.includes(p.name.toLowerCase()))
    );

    if (matchedProduct) {
      const pId = matchedProduct.id.toLowerCase();
      const pSlug = matchedProduct.slug.toLowerCase();

      const currentStock = memoryStockOverrides.has(pId)
        ? memoryStockOverrides.get(pId)!.stock_count
        : Number(matchedProduct.stock_count ?? 50);

      const newStock = Math.max(0, currentStock - qty);
      const newInStock = newStock > 0 ? 1 : 0;

      matchedProduct.stock_count = newStock;
      matchedProduct.in_stock = newInStock;

      memoryStockOverrides.set(pId, { stock_count: newStock, in_stock: newInStock });
      memoryStockOverrides.set(pSlug, { stock_count: newStock, in_stock: newInStock });
    }

    // 2. Execute atomic SQL update on Cloudflare D1 products table
    try {
      const searchKey = matchedProduct?.id || it.product_id || "";
      const searchSlug = matchedProduct?.slug || "";
      if (searchKey || searchSlug) {
        await executeD1Query(
          `UPDATE products 
           SET stock_count = MAX(0, stock_count - ?),
               in_stock = CASE WHEN (stock_count - ?) <= 0 THEN 0 ELSE 1 END
           WHERE id = ? OR slug = ?;`,
          [qty, qty, searchKey, searchSlug || searchKey]
        );
      }
    } catch (err) {
      console.warn(`[Inventory] D1 stock decrement warning for ${targetId}:`, err);
    }
  }
}

/**
 * Restock inventory when an order is cancelled or marked RTO Returned
 */
export async function restockInventory(items: StockChangeItem[]): Promise<void> {
  if (!items || !Array.isArray(items) || items.length === 0) return;

  for (const it of items) {
    const qty = Math.max(1, Number(it.quantity || 1));
    const targetId = (it.product_id || "").toLowerCase().trim();
    const targetName = (it.name || "").toLowerCase().trim();

    // 1. Restore in-memory state
    const matchedProduct = DEFAULT_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === targetId ||
        p.slug.toLowerCase() === targetId ||
        (targetName && p.name.toLowerCase().includes(targetName)) ||
        (targetName && targetName.includes(p.name.toLowerCase()))
    );

    if (matchedProduct) {
      const pId = matchedProduct.id.toLowerCase();
      const pSlug = matchedProduct.slug.toLowerCase();

      const currentStock = memoryStockOverrides.has(pId)
        ? memoryStockOverrides.get(pId)!.stock_count
        : Number(matchedProduct.stock_count ?? 50);

      const newStock = currentStock + qty;
      matchedProduct.stock_count = newStock;
      matchedProduct.in_stock = 1;

      memoryStockOverrides.set(pId, { stock_count: newStock, in_stock: 1 });
      memoryStockOverrides.set(pSlug, { stock_count: newStock, in_stock: 1 });
    }

    // 2. Restore in Cloudflare D1 database
    try {
      const searchKey = matchedProduct?.id || it.product_id || "";
      const searchSlug = matchedProduct?.slug || "";
      if (searchKey || searchSlug) {
        await executeD1Query(
          `UPDATE products 
           SET stock_count = stock_count + ?,
               in_stock = 1
           WHERE id = ? OR slug = ?;`,
          [qty, searchKey, searchSlug || searchKey]
        );
      }
    } catch (err) {
      console.warn(`[Inventory] D1 restock warning for ${targetId}:`, err);
    }
  }
}
