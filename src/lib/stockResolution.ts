/**
 * Pure authoritative stock & availability resolution helper.
 *
 * When Cloudflare D1 returns a product row, D1 is always the single source of truth
 * (never clamped downward by stale per-isolate in-memory overrides).
 * Memory overrides and static catalog defaults are only used as offline fallbacks.
 */
export function resolveAuthoritativeStock(params: {
  d1Stock: number | null;
  d1InStock: number | null;
  memOverride: { stock_count: number; in_stock: number } | null;
  defaultStock?: number;
  defaultInStock?: number;
}): { stock_count: number; in_stock: number } {
  const { d1Stock, d1InStock, memOverride, defaultStock = 50, defaultInStock = 1 } = params;

  const normalizedD1Stock =
    d1Stock !== null && Number.isFinite(d1Stock) ? Math.max(0, Math.floor(d1Stock)) : null;

  const finalStock =
    normalizedD1Stock !== null
      ? normalizedD1Stock
      : memOverride !== null
      ? Math.max(0, Math.floor(memOverride.stock_count))
      : Math.max(0, Math.floor(defaultStock));

  let finalInStock = 1;
  if (finalStock <= 0) {
    finalInStock = 0;
  } else if (d1InStock !== null && Number.isFinite(d1InStock)) {
    finalInStock = Number(d1InStock) === 1 ? 1 : 0;
  } else if (memOverride !== null) {
    finalInStock = memOverride.in_stock === 1 ? 1 : 0;
  } else {
    finalInStock = Number(defaultInStock) === 1 ? 1 : 0;
  }

  return { stock_count: finalStock, in_stock: finalInStock };
}
