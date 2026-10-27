import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { getProductReviewStatsMap, getProductReviewStats } from "@/lib/reviewStore";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getMemoryStockOverride, setMemoryStockOverride } from "@/lib/inventoryService";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminSessionToken(token);
  return session.valid;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function formatDbProduct(p: any, reviewStatsMap?: Map<string, { count: number; rating: number }>): Product {
  const defaultFound = DEFAULT_PRODUCTS.find((dp) => dp.id === p.id || dp.slug === p.slug);

  const parsedImages = parseJsonSafe(p.images, defaultFound?.images || []);
  const parsedColors = parseJsonSafe(p.colors, defaultFound?.colors || []);
  const parsedOverviewBlocks = parseJsonSafe(p.overview_blocks, defaultFound?.overview_blocks || undefined);
  const parsedFeatures = parseJsonSafe(p.features, defaultFound?.features || undefined);
  const parsedSpecs = parseJsonSafe(p.specifications, defaultFound?.specifications || undefined);
  const parsedBox = parseJsonSafe(p.whats_in_box, defaultFound?.whats_in_box || undefined);
  const parsedTiers = parseJsonSafe(p.bundle_tiers, defaultFound?.bundle_tiers || undefined);
  const parsedHowToUse = parseJsonSafe(p.how_to_use, defaultFound?.how_to_use || undefined);
  const parsedVideoIds = parseJsonSafe(p.video_ids, defaultFound?.video_ids || undefined);

  const priceNum = Number(p.price);
  const mrpNum = Number(p.mrp ?? p.price);
  const costNum = Number(p.cost_price ?? defaultFound?.cost_price ?? Math.round(priceNum * 0.42));

  // Determine real synced review stats
  const pid = String(p.id || "").toLowerCase().trim();
  const pslug = String(p.slug || "").toLowerCase().trim();
  const stats = reviewStatsMap?.get(pslug) || reviewStatsMap?.get(pid);

  let realRating = 5.0;
  let realReviewCount = 0;

  if (stats && stats.count > 0) {
    realRating = stats.rating;
    realReviewCount = stats.count;
  } else if (p.rating !== undefined && Number(p.rating) > 0 && p.review_count !== undefined && Number(p.review_count) > 0) {
    // If statsMap had nothing but product row explicitly has existing data
    realRating = Number(p.rating);
    realReviewCount = Number(p.review_count);
  }

  const stockOverride = getMemoryStockOverride(p.id || "") || getMemoryStockOverride(p.slug || "");
  const d1Stock = p.stock_count !== undefined && p.stock_count !== null ? Number(p.stock_count) : null;
  const baseStock = d1Stock !== null ? d1Stock : Number(defaultFound?.stock_count ?? 50);
  const finalStock = stockOverride !== null && d1Stock !== null
    ? Math.min(d1Stock, stockOverride.stock_count)
    : (stockOverride ? stockOverride.stock_count : baseStock);

  const d1InStock = p.in_stock !== undefined && p.in_stock !== null ? Number(p.in_stock) : null;
  let finalInStock = 1;
  if (finalStock <= 0) {
    finalInStock = 0;
  } else if (stockOverride !== null && stockOverride.in_stock === 0) {
    finalInStock = 0;
  } else if (d1InStock !== null && d1InStock === 0) {
    finalInStock = 0;
  } else if (d1InStock !== null) {
    finalInStock = d1InStock;
  } else if (stockOverride !== null) {
    finalInStock = stockOverride.in_stock;
  } else if (defaultFound?.in_stock !== undefined) {
    finalInStock = Number(defaultFound.in_stock);
  }

  const isIronProduct = p.id === "mini-portable-steam-iron" || p.slug?.includes("iron");
  const posterImg = p.poster_image?.trim() || defaultFound?.poster_image?.trim() || "";

  const cleanParsedImages = Array.isArray(parsedImages)
    ? parsedImages.filter((img: string) => {
        if (!isIronProduct && typeof img === "string" && (img.includes("steam-iron") || img.includes("/products/iron/"))) {
          return false;
        }
        return Boolean(img);
      })
    : [];

  const finalImages =
    posterImg
      ? [posterImg, ...cleanParsedImages.filter((img: string) => img !== posterImg)]
      : cleanParsedImages.length > 0
      ? cleanParsedImages
      : (defaultFound?.images || []);

  const cleanParsedColors = Array.isArray(parsedColors)
    ? parsedColors.map((c: any) => {
        if (!isIronProduct && c && typeof c === "object") {
          const cImages = Array.isArray(c.images)
            ? c.images.filter((img: string) => typeof img === "string" && !img.includes("steam-iron") && !img.includes("/products/iron/"))
            : [];
          return {
            ...c,
            images: cImages.length > 0 ? cImages : (posterImg ? [posterImg] : []),
          };
        }
        return c;
      })
    : [];

  const hasColorsVal =
    p.has_colors !== undefined && p.has_colors !== null
      ? Boolean(Number(p.has_colors))
      : defaultFound?.has_colors !== undefined
      ? Boolean(defaultFound.has_colors)
      : Array.isArray(cleanParsedColors) && cleanParsedColors.length > 0;

  const finalColors = cleanParsedColors.length > 0 ? cleanParsedColors : (defaultFound?.colors || []);

    return {
      ...(defaultFound || {}),
      ...p,
      id: p.id,
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle ?? defaultFound?.subtitle ?? "",
      category: p.category,
      subcategory: p.subcategory ?? defaultFound?.subcategory ?? "",
      tagline: p.tagline ?? defaultFound?.tagline ?? "",
      description: p.description ?? defaultFound?.description ?? "",
      price: priceNum,
      mrp: mrpNum,
      offer_price: Number(p.offer_price ?? priceNum),
      cost_price: costNum,
      stock_count: finalStock,
      volume: p.volume ?? defaultFound?.volume ?? "",
      poster_image: posterImg,
      images: finalImages,
      has_colors: hasColorsVal,
      color: hasColorsVal ? (p.color ?? defaultFound?.color ?? "") : "",
      colors: finalColors,
      material: p.material ?? defaultFound?.material ?? "",
      badge: p.badge ?? defaultFound?.badge ?? "",
      in_stock: finalInStock,
    rating: realRating,
    review_count: realReviewCount,
    sold_count: p.sold_count ?? defaultFound?.sold_count ?? "1,250+ verified orders",
    overview_blocks: Array.isArray(parsedOverviewBlocks) ? parsedOverviewBlocks : undefined,
    features: parsedFeatures,
    specifications: parsedSpecs,
    whats_in_box: parsedBox,
    bundle_tiers: parsedTiers,
    how_to_use: parsedHowToUse,
    video_ids: Array.isArray(parsedVideoIds) ? parsedVideoIds : undefined,
    created_at: p.created_at || defaultFound?.created_at || new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    // Fetch live review stats map for perfect synchronization
    const reviewStatsMap = await getProductReviewStatsMap();

    // Single product query by ID or Slug
    if (id || slug) {
      const rawInput = (id || slug || "").trim();
      const lowerInput = rawInput.toLowerCase();
      const hyphenInput = lowerInput.replace(/[\s_]+/g, "-");
      const spaceInput = lowerInput.replace(/[-_ ]+/g, " ");

      const query = `
        SELECT * FROM products 
        WHERE id = ? OR slug = ? 
           OR id = ? OR slug = ? 
           OR id = ? OR slug = ?
           OR REPLACE(slug, '-', ' ') = ? 
           OR REPLACE(id, '-', ' ') = ?
           OR REPLACE(slug, ' ', '-') = ?
           OR REPLACE(id, ' ', '-') = ?
        LIMIT 1;
      `;

      const d1Results = await executeD1Query<Product>(query, [
        rawInput,
        rawInput,
        hyphenInput,
        hyphenInput,
        spaceInput,
        spaceInput,
        spaceInput,
        spaceInput,
        hyphenInput,
        hyphenInput,
      ]);

      if (d1Results && d1Results.length > 0) {
        const formatted = formatDbProduct(d1Results[0], reviewStatsMap);
        return NextResponse.json(
          { success: true, product: formatted, source: "d1" },
          { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" } }
        );
      }

      // In-memory fallback with flexible matching
      const targetKeys = [lowerInput, hyphenInput, spaceInput].filter(Boolean);
      const matchesTarget = (p: any) => {
        if (!p) return false;
        const pid = String(p.id || "").toLowerCase().trim();
        const pslug = String(p.slug || "").toLowerCase().trim();
        const pclean = pslug.replace(/[-_ ]+/g, " ") || pid.replace(/[-_ ]+/g, " ");
        const pname = String(p.name || "").toLowerCase().trim();

        return targetKeys.some(
          (t) =>
            pid === t ||
            pslug === t ||
            pclean === t ||
            pname === t ||
            (t.length > 3 && (pclean.includes(t) || t.includes(pclean) || pname.includes(t)))
        );
      };

      const found =
        serverProductsCache.find(matchesTarget) ||
        DEFAULT_PRODUCTS.find(matchesTarget);

      if (found) {
        const formatted = formatDbProduct(found, reviewStatsMap);
        return NextResponse.json(
          { success: true, product: formatted, source: "cache" },
          { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" } }
        );
      }

      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Full catalog query
    const d1Results = await executeD1Query<Product>("SELECT * FROM products ORDER BY created_at DESC;");
    if (d1Results && Array.isArray(d1Results) && d1Results.length > 0) {
      const formatted = d1Results.map((p: any) => formatDbProduct(p, reviewStatsMap));

      // Sync memory cache
      serverProductsCache = formatted;

      return NextResponse.json(
        { success: true, source: "cloudflare-d1", products: formatted },
        { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" } }
      );
    }
  } catch (err) {
    console.warn("D1 products query error, serving catalog fallback:", err);
  }

  const reviewStatsMap = await getProductReviewStatsMap();
  const rawList = serverProductsCache.length > 0 ? serverProductsCache : DEFAULT_PRODUCTS;
  const synchronizedList = rawList.map((p) => formatDbProduct(p, reviewStatsMap));

  return NextResponse.json(
    {
      success: true,
      source: "zupe-catalog",
      products: synchronizedList,
    },
    { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required to create or modify products." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      id,
      slug,
      name,
      subtitle,
      category,
      subcategory,
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
      has_colors,
      colors,
      overview_blocks,
      material,
      badge,
      in_stock,
      rating,
      review_count,
      sold_count,
      features,
      specifications,
      whats_in_box,
      bundle_tiers,
      how_to_use,
      video_ids,
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

    const isIron = prodId === "mini-portable-steam-iron" || prodSlug?.includes("iron");
    const rawPoster =
      poster_image ||
      existingProd?.poster_image ||
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";

    const rawImagesList = images !== undefined
      ? (Array.isArray(images) ? images : [images])
      : existingProd?.images || [];

    const cleanRawImages = rawImagesList.filter((img: string) => {
      if (!isIron && typeof img === "string" && (img.includes("steam-iron") || img.includes("/products/iron/"))) {
        return false;
      }
      return Boolean(img);
    });

    const finalRawImages =
      rawPoster
        ? [rawPoster, ...cleanRawImages.filter((img: string) => img !== rawPoster)]
        : cleanRawImages.length > 0
        ? cleanRawImages
        : [];

    const rawColorsList = colors !== undefined
      ? (Array.isArray(colors) ? colors : [colors])
      : existingProd?.colors || [];

    const cleanRawColors = rawColorsList.map((c: any) => {
      if (!isIron && c && typeof c === "object") {
        const cImgs = Array.isArray(c.images)
          ? c.images.filter((img: string) => typeof img === "string" && !img.includes("steam-iron") && !img.includes("/products/iron/"))
          : [];
        return {
          ...c,
          images: cImgs.length > 0 ? cImgs : (rawPoster ? [rawPoster] : []),
        };
      }
      return c;
    });

    const hasColorsVal =
      has_colors !== undefined
        ? Boolean(has_colors)
        : existingProd?.has_colors !== undefined
        ? Boolean(existingProd.has_colors)
        : Array.isArray(colors) && colors.length > 0 && !(colors.length === 1 && colors[0].name?.toLowerCase() === "standard");

    const newProd: Product = {
      ...(existingProd || {}),
      id: prodId,
      slug: prodSlug,
      name: name !== undefined ? name : existingProd?.name || "Product",
      subtitle: subtitle !== undefined ? subtitle : existingProd?.subtitle || "",
      category: category !== undefined ? category : existingProd?.category || "Gadgets",
      subcategory: subcategory !== undefined ? subcategory : existingProd?.subcategory || "",
      tagline: tagline !== undefined ? tagline : existingProd?.tagline || "",
      description: description !== undefined ? description : existingProd?.description || "",
      price: priceNum,
      mrp: mrpNum,
      offer_price: priceNum,
      cost_price: costNum,
      stock_count: stockNum,
      volume: volume !== undefined ? volume : existingProd?.volume || "",
      poster_image: rawPoster,
      images: finalRawImages,
      has_colors: hasColorsVal,
      color: hasColorsVal ? (color !== undefined ? color : existingProd?.color || "") : (color || existingProd?.color || ""),
      colors: cleanRawColors.length > 0 ? cleanRawColors : (existingProd?.colors || []),
      overview_blocks: overview_blocks !== undefined ? overview_blocks : existingProd?.overview_blocks || undefined,
      material: material !== undefined ? material : existingProd?.material || "",
      badge: badge !== undefined ? badge : existingProd?.badge || "",
      in_stock: inStockNum,
      rating: 5.0,
      review_count: 0,
      sold_count: sold_count !== undefined ? sold_count : existingProd?.sold_count || "1,250+ verified orders",
      features: features !== undefined ? features : existingProd?.features || undefined,
      specifications: specifications !== undefined ? specifications : existingProd?.specifications || undefined,
      whats_in_box: whats_in_box !== undefined ? whats_in_box : existingProd?.whats_in_box || undefined,
      bundle_tiers: bundle_tiers !== undefined ? bundle_tiers : existingProd?.bundle_tiers || undefined,
      how_to_use: how_to_use !== undefined ? how_to_use : existingProd?.how_to_use || undefined,
      video_ids: video_ids !== undefined ? video_ids : existingProd?.video_ids || undefined,
      created_at: existingProd?.created_at || new Date().toISOString(),
    };

    // Calculate real dynamic review stats from reviewStore
    try {
      const realStats = await getProductReviewStats(newProd.slug || newProd.id);
      if (realStats && realStats.count > 0) {
        newProd.rating = realStats.rating;
        newProd.review_count = realStats.count;
      }
    } catch {}

    // Update or Insert in Cloudflare D1
    try {
      const existingRows = await executeD1Query(
        "SELECT id FROM products WHERE id = ? OR slug = ? LIMIT 1;",
        [newProd.id, newProd.slug]
      );

      const imagesJson = JSON.stringify(newProd.images || []);
      const colorsJson = JSON.stringify(newProd.colors || []);
      const overviewBlocksJson = newProd.overview_blocks ? JSON.stringify(newProd.overview_blocks) : null;
      const featuresJson = newProd.features ? JSON.stringify(newProd.features) : null;
      const specsJson = newProd.specifications ? JSON.stringify(newProd.specifications) : null;
      const boxJson = newProd.whats_in_box ? JSON.stringify(newProd.whats_in_box) : null;
      const tiersJson = newProd.bundle_tiers ? JSON.stringify(newProd.bundle_tiers) : null;
      const howToUseJson = newProd.how_to_use ? JSON.stringify(newProd.how_to_use) : null;
      const videoIdsJson = newProd.video_ids ? JSON.stringify(newProd.video_ids) : null;

      const runSaveQueries = async () => {
        if (existingRows && existingRows.length > 0) {
          await executeD1Query(
            `UPDATE products 
             SET slug = ?, name = ?, subtitle = ?, category = ?, subcategory = ?, tagline = ?, description = ?,
                 price = ?, mrp = ?, offer_price = ?, cost_price = ?, stock_count = ?, volume = ?,
                 poster_image = ?, images = ?, color = ?, colors = ?, has_colors = ?, overview_blocks = ?, material = ?, badge = ?,
                 in_stock = ?, rating = ?, review_count = ?, sold_count = ?, features = ?,
                 specifications = ?, whats_in_box = ?, bundle_tiers = ?, how_to_use = ?, video_ids = ?
             WHERE id = ?;`,
            [
              newProd.slug,
              newProd.name,
              newProd.subtitle ?? null,
              newProd.category,
              newProd.subcategory ?? null,
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
              newProd.has_colors ? 1 : 0,
              overviewBlocksJson,
              newProd.material ?? null,
              newProd.badge ?? null,
              newProd.in_stock,
              newProd.rating,
              newProd.review_count,
              newProd.sold_count,
              featuresJson,
              specsJson,
              boxJson,
              tiersJson,
              howToUseJson,
              videoIdsJson,
              existingRows[0].id,
            ]
          );
        } else {
          await executeD1Query(
            `INSERT INTO products (
               id, slug, name, subtitle, category, subcategory, tagline, description,
               price, mrp, offer_price, cost_price, stock_count, volume,
               poster_image, images, color, colors, has_colors, overview_blocks, material, badge,
               in_stock, rating, review_count, sold_count, features,
               specifications, whats_in_box, bundle_tiers, how_to_use, video_ids
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              newProd.id,
              newProd.slug,
              newProd.name,
              newProd.subtitle ?? null,
              newProd.category,
              newProd.subcategory ?? null,
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
              newProd.has_colors ? 1 : 0,
              overviewBlocksJson,
              newProd.material ?? null,
              newProd.badge ?? null,
              newProd.in_stock,
              newProd.rating,
              newProd.review_count,
              newProd.sold_count,
              featuresJson,
              specsJson,
              boxJson,
              tiersJson,
              howToUseJson,
              videoIdsJson,
            ]
          );
        }
      };

      try {
        await runSaveQueries();
      } catch (initialErr: any) {
        const errMsg = String(initialErr?.message || "").toLowerCase();
        let migrated = false;
        if (errMsg.includes("video_ids")) {
          try {
            await executeD1Query("ALTER TABLE products ADD COLUMN video_ids TEXT;");
            migrated = true;
          } catch (migErr) {
            console.warn("Could not add video_ids column:", migErr);
          }
        }
        if (errMsg.includes("how_to_use")) {
          try {
            await executeD1Query("ALTER TABLE products ADD COLUMN how_to_use TEXT;");
            migrated = true;
          } catch (migErr) {
            console.warn("Could not add how_to_use column:", migErr);
          }
        }

        if (migrated) {
          try {
            await runSaveQueries();
          } catch (retryErr) {
            console.warn("Retry after adding missing column(s) failed:", retryErr);
          }
        } else {
          throw initialErr;
        }
      }
    } catch (d1Err) {
      console.error("Could not save to D1:", d1Err);
    }

    // Synchronize memory stock overrides immediately
    setMemoryStockOverride(newProd.id, newProd.stock_count, newProd.in_stock);
    if (newProd.slug) {
      setMemoryStockOverride(newProd.slug, newProd.stock_count, newProd.in_stock);
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
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
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
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required to delete products." },
        { status: 401 }
      );
    }

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
