import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

let serverProductsCache: Product[] = [...DEFAULT_PRODUCTS];

function parseJsonSafe<T>(val: any, fallback: T): T {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "object") return val as T;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function formatDbProduct(p: any): Product {
  const defaultFound = DEFAULT_PRODUCTS.find((dp) => dp.id === p.id || dp.slug === p.slug);

  const parsedImages = parseJsonSafe(p.images, defaultFound?.images || []);
  const parsedColors = parseJsonSafe(p.colors, defaultFound?.colors || []);
  const parsedFeatures = parseJsonSafe(p.features, defaultFound?.features || undefined);
  const parsedSpecs = parseJsonSafe(p.specifications, defaultFound?.specifications || undefined);
  const parsedBox = parseJsonSafe(p.whats_in_box, defaultFound?.whats_in_box || undefined);

  const priceNum = Number(p.price);
  const mrpNum = Number(p.mrp ?? p.price);
  const costNum = Number(p.cost_price ?? defaultFound?.cost_price ?? Math.round(priceNum * 0.42));

  return {
    ...(defaultFound || {}),
    ...p,
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle ?? defaultFound?.subtitle ?? "",
    category: p.category,
    tagline: p.tagline ?? defaultFound?.tagline ?? "",
    description: p.description ?? defaultFound?.description ?? "",
    price: priceNum,
    mrp: mrpNum,
    offer_price: Number(p.offer_price ?? priceNum),
    cost_price: costNum,
    stock_count: Number(p.stock_count ?? 0),
    volume: p.volume ?? defaultFound?.volume ?? "",
    poster_image: p.poster_image || defaultFound?.poster_image || "",
    images: Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : (defaultFound?.images || []),
    color: p.color ?? defaultFound?.color ?? "",
    colors: Array.isArray(parsedColors) && parsedColors.length > 0 ? parsedColors : (defaultFound?.colors || []),
    material: p.material ?? defaultFound?.material ?? "",
    badge: p.badge ?? defaultFound?.badge ?? "",
    in_stock: Number(p.in_stock ?? 1),
    rating: Number(p.rating ?? defaultFound?.rating ?? 4.8),
    review_count: Number(p.review_count ?? defaultFound?.review_count ?? 120),
    sold_count: p.sold_count ?? defaultFound?.sold_count ?? "1,250+ verified orders",
    features: parsedFeatures,
    specifications: parsedSpecs,
    whats_in_box: parsedBox,
    created_at: p.created_at || defaultFound?.created_at || new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    // Single product query by ID or Slug
    if (id || slug) {
      const query = id
        ? "SELECT * FROM products WHERE id = ? LIMIT 1;"
        : "SELECT * FROM products WHERE slug = ? LIMIT 1;";
      const param = id || slug;

      const d1Results = await executeD1Query<Product>(query, [param]);
      if (d1Results && d1Results.length > 0) {
        const formatted = formatDbProduct(d1Results[0]);
        return NextResponse.json(
          { success: true, product: formatted, source: "d1" },
          { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
        );
      }

      // In-memory fallback
      const found =
        serverProductsCache.find((p) => p.id === param || p.slug === param) ||
        DEFAULT_PRODUCTS.find((p) => p.id === param || p.slug === param);
      if (found) {
        return NextResponse.json(
          { success: true, product: found, source: "cache" },
          { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
        );
      }

      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Full catalog query
    const d1Results = await executeD1Query<Product>("SELECT * FROM products ORDER BY created_at DESC;");
    if (d1Results && Array.isArray(d1Results) && d1Results.length > 0) {
      const formatted = d1Results.map((p: any) => formatDbProduct(p));

      // Sync memory cache
      serverProductsCache = formatted;

      return NextResponse.json(
        { success: true, source: "cloudflare-d1", products: formatted },
        { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
      );
    }
  } catch (err) {
    console.warn("D1 products query error, serving catalog fallback:", err);
  }

  return NextResponse.json(
    {
      success: true,
      source: "zupe-catalog",
      products: serverProductsCache.length > 0 ? serverProductsCache : DEFAULT_PRODUCTS,
    },
    { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      slug,
      name,
      subtitle,
      category,
      tagline,
      description,
      price,
      mrp,
      offer_price,
      cost_price,
      stock_count,
      volume,
      poster_image,
      images,
      color,
      colors,
      material,
      badge,
      in_stock,
      rating,
      review_count,
      sold_count,
      features,
      specifications,
      whats_in_box,
    } = body;

    // Find existing product in D1 first, then cache or defaults
    let existingProd: any = null;
    if (id || slug) {
      const searchKey = id || slug;
      try {
        const d1Rows = await executeD1Query<Product>(
          "SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1;",
          [searchKey, searchKey]
        );
        if (d1Rows && d1Rows.length > 0) {
          existingProd = formatDbProduct(d1Rows[0]);
        }
      } catch (e) {
        // fallback
      }
      if (!existingProd) {
        existingProd =
          serverProductsCache.find((p) => p.id === searchKey || p.slug === searchKey) ||
          DEFAULT_PRODUCTS.find((p) => p.id === searchKey || p.slug === searchKey) ||
          null;
      }
    }

    const priceNum =
      price !== undefined
        ? Number(price)
        : offer_price !== undefined
        ? Number(offer_price)
        : existingProd
        ? existingProd.price
        : 599;

    const mrpNum = mrp !== undefined ? Number(mrp) : existingProd?.mrp || priceNum;

    const costNum =
      cost_price !== undefined
        ? Number(cost_price)
        : existingProd?.cost_price !== undefined
        ? Number(existingProd.cost_price)
        : Math.round(priceNum * 0.42);

    const stockNum =
      stock_count !== undefined ? Number(stock_count) : existingProd?.stock_count ?? 50;

    const inStockNum =
      in_stock !== undefined
        ? Number(in_stock)
        : stockNum > 0
        ? 1
        : 0;

    const prodId = id || existingProd?.id || `prod-${Date.now()}`;
    const prodSlug =
      slug ||
      existingProd?.slug ||
      (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `prod-${Date.now()}`);

    const newProd: Product = {
      ...(existingProd || {}),
      id: prodId,
      slug: prodSlug,
      name: name !== undefined ? name : existingProd?.name || "Product",
      subtitle: subtitle !== undefined ? subtitle : existingProd?.subtitle || "",
      category: category !== undefined ? category : existingProd?.category || "Gadgets",
      tagline: tagline !== undefined ? tagline : existingProd?.tagline || "",
      description: description !== undefined ? description : existingProd?.description || "",
      price: priceNum,
      mrp: mrpNum,
      offer_price: priceNum,
      cost_price: costNum,
      stock_count: stockNum,
      volume: volume !== undefined ? volume : existingProd?.volume || "",
      poster_image:
        poster_image ||
        existingProd?.poster_image ||
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop",
      images:
        images !== undefined
          ? Array.isArray(images)
            ? images
            : [images]
          : existingProd?.images || [],
      color: color !== undefined ? color : existingProd?.color || "",
      colors:
        colors !== undefined
          ? Array.isArray(colors)
            ? colors
            : [colors]
          : existingProd?.colors || [],
      material: material !== undefined ? material : existingProd?.material || "",
      badge: badge !== undefined ? badge : existingProd?.badge || "",
      in_stock: inStockNum,
      rating: rating !== undefined ? Number(rating) : existingProd?.rating || 4.8,
      review_count: review_count !== undefined ? Number(review_count) : existingProd?.review_count || 120,
      sold_count: sold_count !== undefined ? sold_count : existingProd?.sold_count || "1,250+ verified orders",
      features: features !== undefined ? features : existingProd?.features || undefined,
      specifications: specifications !== undefined ? specifications : existingProd?.specifications || undefined,
      whats_in_box: whats_in_box !== undefined ? whats_in_box : existingProd?.whats_in_box || undefined,
      created_at: existingProd?.created_at || new Date().toISOString(),
    };

    // Update or Insert in Cloudflare D1
    try {
      const existingRows = await executeD1Query(
        "SELECT id FROM products WHERE id = ? OR slug = ? LIMIT 1;",
        [newProd.id, newProd.slug]
      );

      const imagesJson = JSON.stringify(newProd.images || []);
      const colorsJson = JSON.stringify(newProd.colors || []);
      const featuresJson = newProd.features ? JSON.stringify(newProd.features) : null;
      const specsJson = newProd.specifications ? JSON.stringify(newProd.specifications) : null;
      const boxJson = newProd.whats_in_box ? JSON.stringify(newProd.whats_in_box) : null;

      if (existingRows && existingRows.length > 0) {
        await executeD1Query(
          `UPDATE products 
           SET slug = ?, name = ?, subtitle = ?, category = ?, tagline = ?, description = ?,
               price = ?, mrp = ?, offer_price = ?, cost_price = ?, stock_count = ?, volume = ?,
               poster_image = ?, images = ?, color = ?, colors = ?, material = ?, badge = ?,
               in_stock = ?, rating = ?, review_count = ?, sold_count = ?, features = ?,
               specifications = ?, whats_in_box = ?
           WHERE id = ?;`,
          [
            newProd.slug,
            newProd.name,
            newProd.subtitle ?? null,
            newProd.category,
            newProd.tagline ?? null,
            newProd.description ?? null,
            newProd.price,
            newProd.mrp,
            newProd.offer_price,
            newProd.cost_price,
            newProd.stock_count,
            newProd.volume ?? null,
            newProd.poster_image,
            imagesJson,
            newProd.color ?? null,
            colorsJson,
            newProd.material ?? null,
            newProd.badge ?? null,
            newProd.in_stock,
            newProd.rating,
            newProd.review_count,
            newProd.sold_count,
            featuresJson,
            specsJson,
            boxJson,
            existingRows[0].id,
          ]
        );
      } else {
        await executeD1Query(
          `INSERT INTO products (
             id, slug, name, subtitle, category, tagline, description,
             price, mrp, offer_price, cost_price, stock_count, volume,
             poster_image, images, color, colors, material, badge,
             in_stock, rating, review_count, sold_count, features,
             specifications, whats_in_box
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            newProd.id,
            newProd.slug,
            newProd.name,
            newProd.subtitle ?? null,
            newProd.category,
            newProd.tagline ?? null,
            newProd.description ?? null,
            newProd.price,
            newProd.mrp,
            newProd.offer_price,
            newProd.cost_price,
            newProd.stock_count,
            newProd.volume ?? null,
            newProd.poster_image,
            imagesJson,
            newProd.color ?? null,
            colorsJson,
            newProd.material ?? null,
            newProd.badge ?? null,
            newProd.in_stock,
            newProd.rating,
            newProd.review_count,
            newProd.sold_count,
            featuresJson,
            specsJson,
            boxJson,
          ]
        );
      }
    } catch (d1Err) {
      console.warn("Could not save to D1:", d1Err);
    }

    // Immediately update in-memory cache for ultra-fast synced responses
    const existingIndex = serverProductsCache.findIndex((p) => p.id === newProd.id || p.slug === newProd.slug);
    if (existingIndex >= 0) {
      serverProductsCache[existingIndex] = newProd;
    } else {
      serverProductsCache = [newProd, ...serverProductsCache];
    }

    return NextResponse.json(
      { success: true, product: newProd },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    try {
      await executeD1Query("DELETE FROM products WHERE id = ? OR slug = ?;", [id, id]);
    } catch (d1Err) {
      console.warn("Could not delete from D1:", d1Err);
    }

    serverProductsCache = serverProductsCache.filter((p) => p.id !== id && p.slug !== id);
    return NextResponse.json(
      { success: true, message: `Product ${id} deleted` },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
