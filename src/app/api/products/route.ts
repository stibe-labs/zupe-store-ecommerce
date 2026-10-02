import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

let serverProductsCache: Product[] = [...DEFAULT_PRODUCTS];

export async function GET() {
  try {
    const d1Results = await executeD1Query<Product>("SELECT * FROM products ORDER BY created_at DESC;");
    if (d1Results && Array.isArray(d1Results) && d1Results.length > 0) {
      const formatted = d1Results.map((p: any) => ({
        ...p,
        images:
          typeof p.images === "string"
            ? (() => {
                try {
                  return JSON.parse(p.images);
                } catch {
                  return [];
                }
              })()
            : p.images || [],
      }));
      return NextResponse.json({ success: true, source: "cloudflare-d1", products: formatted });
    }
  } catch (err) {
    console.warn("D1 products query error, serving catalog fallback:", err);
  }
  return NextResponse.json({
    success: true,
    source: "zupe-catalog",
    products: serverProductsCache.length > 0 ? serverProductsCache : DEFAULT_PRODUCTS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id, slug, name, subtitle, category, tagline, description,
      price, mrp, offer_price, stock_count, volume,
      poster_image, images, color, material, badge,
    } = body;

    const newProd: Product = {
      id: id || `prod-${Date.now()}`,
      slug: slug || `prod-${Date.now()}`,
      name,
      subtitle: subtitle || "",
      category,
      tagline: tagline || "",
      description: description || "",
      price: Number(offer_price) || Number(price) || Number(mrp) || 0,
      mrp: Number(mrp) || 0,
      offer_price: Number(offer_price) || 0,
      stock_count: Number(stock_count) || 0,
      volume: volume || "",
      poster_image: poster_image || "",
      images: Array.isArray(images) ? images : [],
      color: color || "",
      material: material || "",
      badge: badge || "",
      in_stock: Number(stock_count) > 0 ? 1 : 0,
      rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };

    try {
      await executeD1Query(
        `INSERT OR REPLACE INTO products (id, slug, name, subtitle, category, tagline, description, price, mrp, offer_price, stock_count, volume, poster_image, images, color, material, badge, in_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProd.id, newProd.slug, newProd.name, newProd.subtitle ?? null,
          newProd.category, newProd.tagline, newProd.description,
          newProd.price, newProd.mrp, newProd.offer_price, newProd.stock_count,
          newProd.volume, newProd.poster_image, JSON.stringify(newProd.images || []),
          newProd.color ?? null, newProd.material ?? null, newProd.badge ?? null,
          newProd.in_stock,
        ]
      );
    } catch (d1Err) {
      console.warn("Could not insert to D1:", d1Err);
    }

    const existingIndex = serverProductsCache.findIndex((p) => p.id === newProd.id);
    if (existingIndex >= 0) {
      serverProductsCache[existingIndex] = newProd;
    } else {
      serverProductsCache = [newProd, ...serverProductsCache];
    }

    return NextResponse.json({ success: true, product: newProd });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    try {
      await executeD1Query("DELETE FROM products WHERE id = ?", [id]);
    } catch (d1Err) {
      console.warn("Could not delete from D1:", d1Err);
    }

    serverProductsCache = serverProductsCache.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, message: `Product ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
