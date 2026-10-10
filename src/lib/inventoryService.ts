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

export function setMemoryStockOverride(idOrSlug: string, stock: number) {
  if (!idOrSlug) return;
  const norm = idOrSlug.toLowerCase().trim();
  const safeStock = Math.max(0, stock);
  const in_stock = safeStock > 0 ? 1 : 0;
  memoryStockOverrides.set(norm, { stock_count: safeStock, in_stock });
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
