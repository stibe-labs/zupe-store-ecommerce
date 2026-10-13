import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { getMemoryStockOverride } from "@/lib/inventoryService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || searchParams.get("id") || searchParams.get("slug") || "";

    const requestedKeys = idsParam
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    // If no keys specified, return empty or full stock map
    const d1Rows = await executeD1Query<any>("SELECT id, slug, name, in_stock, stock_count FROM products;");
    const d1Map = new Map<string, any>();
    if (d1Rows && Array.isArray(d1Rows)) {
      for (const row of d1Rows) {
        if (row.id) d1Map.set(String(row.id).toLowerCase().trim(), row);
        if (row.slug) d1Map.set(String(row.slug).toLowerCase().trim(), row);
      }
    }

    const stockResult: Record<
      string,
      {
        id: string;
        slug: string;
        name: string;
        in_stock: number;
        stock_count: number;
        is_available: boolean;
      }
    > = {};

    const outOfStockIds: string[] = [];

    const keysToProcess = requestedKeys.length > 0 ? requestedKeys : Array.from(d1Map.keys());

    for (const key of keysToProcess) {
      const d1Prod = d1Map.get(key);
      const defaultProd = DEFAULT_PRODUCTS.find(
        (p) => p.id.toLowerCase() === key || p.slug.toLowerCase() === key
      );

      const memOverride =
        getMemoryStockOverride(key) ||
        (d1Prod?.slug ? getMemoryStockOverride(d1Prod.slug) : null) ||
        (d1Prod?.id ? getMemoryStockOverride(d1Prod.id) : null);

      let inStock = 1;
      let stockCount = 50;
      const id = d1Prod?.id || defaultProd?.id || key;
      const slug = d1Prod?.slug || defaultProd?.slug || key;
      const name = d1Prod?.name || defaultProd?.name || key;

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

      const isAvailable = inStock === 1 && stockCount > 0;
      if (!isAvailable) {
        if (!outOfStockIds.includes(key)) outOfStockIds.push(key);
        if (id && !outOfStockIds.includes(id)) outOfStockIds.push(id);
      }

      const itemData = {
        id,
        slug,
        name,
        in_stock: inStock,
        stock_count: stockCount,
        is_available: isAvailable,
      };

      stockResult[key] = itemData;
      if (id) stockResult[id.toLowerCase()] = itemData;
      if (slug) stockResult[slug.toLowerCase()] = itemData;
    }

    return NextResponse.json(
      {
        success: true,
        stock: stockResult,
        anyOutOfStock: outOfStockIds.length > 0,
        outOfStockIds,
        timestamp: Date.now(),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items || [];
    const ids = body.ids || items.map((it: any) => it.product_id || it.id || "");
    const idsParam = (ids as string[]).filter(Boolean).join(",");

    const nextUrl = new URL(req.url);
    nextUrl.searchParams.set("ids", idsParam);

    return GET(new NextRequest(nextUrl, { headers: req.headers }));
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
