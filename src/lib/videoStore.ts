// In-Memory & Cloudflare D1 Store for Shoppable Product Videos
import { executeD1Query } from "./d1";
import { uploadBase64Media } from "./r2";

export interface ProductVideo {
  id: string;
  productId: string; // product id, slug, or 'all'
  title: string;
  videoUrl: string;
  posterUrl?: string;
  viewsText: string; // e.g. "29.7k"
  badge?: string; // e.g. "NEW", "TRENDING"
  productName?: string;
  productPrice?: number;
  productMrp?: number;
  productSlug?: string;
  productImage?: string;
  active: boolean;
  featuredOnHome?: boolean;
  createdAt: string;
}

// Default seed videos including live creator sample assets
const DEFAULT_VIDEOS: ProductVideo[] = [
  {
    id: "creator-vid-02",
    productId: "ripple-lamp",
    title: "Dynamic Water Ripple Night Light (Flower Demo)",
    videoUrl: "/videos/creator-flower.mp4",
    posterUrl: "/products/ripple/ripple-amber.jpg",
    viewsText: "42.1k",
    badge: "TRENDING",
    productName: "Dynamic Water Ripple Night Light",
    productPrice: 650,
    productMrp: 1099,
    productSlug: "dynamic-water-ripple-night-light",
    productImage: "/products/ripple/ripple-amber.jpg",
    active: true,
    createdAt: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "creator-vid-03",
    productId: "portable-menstrual-heating-pad",
    title: "Portable Heating Pad Experience (Bear Demo)",
    videoUrl: "/videos/creator-bear.mp4",
    posterUrl: "/products/heating-pad/pad-pink-1.jpg",
    viewsText: "31.5k",
    badge: "HOT",
    productName: "Portable Menstrual Heating Pad",
    productPrice: 799,
    productMrp: 1149,
    productSlug: "portable-menstrual-heating-pad",
    productImage: "/products/heating-pad.jpg",
    active: true,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "creator-vid-04",
    productId: "mini-portable-steam-iron",
    title: "Handheld Steam Iron Unboxing & Test (Sintel Demo)",
    videoUrl: "/videos/creator-sintel.mp4",
    posterUrl: "/products/iron/iron-teal-1.jpg",
    viewsText: "19.8k",
    badge: "NEW",
    productName: "Mini Portable Steam Iron",
    productPrice: 599,
    productMrp: 1199,
    productSlug: "mini-portable-steam-iron",
    productImage: "/products/steam-iron.jpg",
    active: true,
    createdAt: "2026-02-28T09:00:00.000Z",
  },
  {
    id: "creator-vid-05",
    productId: "portable-mini-foldable-washer-spin-dryer",
    title: "Compact Washer Delicate Clothes Demo (Bunny Demo)",
    videoUrl: "/videos/creator-bunny.mp4",
    posterUrl: "/products/washer/washer-purple-1.jpg",
    viewsText: "37.2k",
    badge: "MUST HAVE",
    productName: "Portable Mini Foldable Washer & Spin Dryer",
    productPrice: 1299,
    productMrp: 1949,
    productSlug: "portable-mini-foldable-washer-spin-dryer",
    productImage: "/products/foldable-washer.jpg",
    active: true,
    createdAt: "2026-02-15T15:30:00.000Z",
  },
  {
    id: "vid-mv0gb5xf-to4r",
    productId: "watch",
    title: "Titan Minimalist Watch Hands-on",
    videoUrl: "https://pub-abec22fbfdb8446490341e69eabe6a1c.r2.dev/videos/1791519244046-VID_20260913_013314_447-9d231d.mp4",
    posterUrl: "",
    viewsText: "28.4k",
    badge: "POPULAR",
    productName: "Titan Minimalist Analog Watch",
    productPrice: 1799,
    productMrp: 2999,
    productSlug: "watch",
    productImage: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw429f4592/images/Titan/Catalog/10011NM01_1.jpg?sw=600&sh=600",
    active: true,
    createdAt: "2026-03-08T12:00:00.000Z",
  },
  {
    id: "vid-watch-01",
    productId: "watch",
    title: "Titan Minimalist Analog Watch Details",
    videoUrl: "https://pub-abec22fbfdb8446490341e69eabe6a1c.r2.dev/videos/1791519244046-VID_20260913_013314_447-9d231d.mp4",
    posterUrl: "",
    viewsText: "24.5k",
    badge: "NEW",
    productName: "watch",
    productPrice: 1799,
    productMrp: 3499,
    productSlug: "watch",
    productImage: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw429f4592/images/Titan/Catalog/10011NM01_1.jpg?sw=600&sh=600",
    active: true,
    createdAt: "2026-03-08T12:00:00.000Z",
  },
  {
    id: "vid-heating-pad-01",
    productId: "portable-menstrual-heating-pad",
    title: "Instant Relief & 3 Heat Modes Demo",
    videoUrl: "/videos/creator-bear.mp4",
    posterUrl: "",
    viewsText: "29.7k",
    badge: "NEW",
    productName: "Portable Menstrual Heating Pad",
    productPrice: 799,
    productMrp: 1149,
    productSlug: "portable-menstrual-heating-pad",
    productImage: "/products/heating-pad/heating-pad-main.jpg",
    active: true,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "vid-heating-pad-02",
    productId: "portable-menstrual-heating-pad",
    title: "How to wear & gentle vibration mode",
    videoUrl: "/videos/creator-bear.mp4",
    posterUrl: "",
    viewsText: "18.4k",
    badge: "TRENDING",
    productName: "Portable Menstrual Heating Pad",
    productPrice: 799,
    productMrp: 1149,
    productSlug: "portable-menstrual-heating-pad",
    productImage: "/products/heating-pad/heating-pad-main.jpg",
    active: true,
    createdAt: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "vid-mist-fan-01",
    productId: "portable-mist-cooling-fan",
    title: "Ice Cold Mist Air in 5 Seconds!",
    videoUrl: "/videos/creator-sintel.mp4",
    posterUrl: "",
    viewsText: "34.1k",
    badge: "NEW",
    productName: "Portable Mist Cooling Fan",
    productPrice: 899,
    productMrp: 1499,
    productSlug: "portable-mist-cooling-fan",
    productImage: "/products/mist-fan/mist-fan-main.jpg",
    active: true,
    createdAt: "2026-02-28T09:00:00.000Z",
  },
  {
    id: "vid-ripple-lamp-01",
    productId: "ripple-lamp",
    title: "Ocean Wave Visual Effect in Bedroom",
    videoUrl: "/videos/creator-flower.mp4",
    posterUrl: "",
    viewsText: "42.8k",
    badge: "POPULAR",
    productName: "Rotating Water Ripple Lamp",
    productPrice: 1299,
    productMrp: 2499,
    productSlug: "rotating-water-ripple-lamp",
    productImage: "/products/ripple/ripple-amber.jpg",
    active: true,
    createdAt: "2026-02-15T15:30:00.000Z",
  },
];

let inMemoryVideos: ProductVideo[] = [...DEFAULT_VIDEOS];
let cachedHomeVideoIds: string[] | null = null;
let homeVideoIdsCacheTime = 0;

export async function getHomePageVideoIds(): Promise<string[]> {
  const now = Date.now();
  if (cachedHomeVideoIds && now - homeVideoIdsCacheTime < 15000) {
    return cachedHomeVideoIds;
  }

  // Get active existing video IDs in DB first so we never return deleted phantom IDs
  let existingIdSet: Set<string> | null = null;
  try {
    const existingRows = await executeD1Query<{ id: string }>(
      "SELECT id FROM product_videos WHERE active != 0"
    );
    if (existingRows && existingRows.length > 0) {
      existingIdSet = new Set(existingRows.map((r) => r.id));
    }
  } catch {}

  try {
    const rows = await executeD1Query<{ provider: string; config_data: string }>(
      "SELECT config_data FROM integrations_config WHERE provider = ?",
      ["homepage_video_ids"]
    );
    if (rows && rows.length > 0 && rows[0].config_data) {
      const parsed = JSON.parse(rows[0].config_data);
      let ids: string[] = [];
      if (Array.isArray(parsed)) {
        ids = parsed;
      } else if (parsed && Array.isArray(parsed.videoIds)) {
        ids = parsed.videoIds;
      }
      if (existingIdSet && existingIdSet.size > 0) {
        ids = ids.filter((id) => existingIdSet!.has(id));
      }
      cachedHomeVideoIds = ids;
      homeVideoIdsCacheTime = now;
      return ids;
    }
  } catch (err) {
    console.warn("Error fetching homepage_video_ids from D1:", err);
  }

  // If DB has videos, return existing ones rather than stale defaultIds
  if (existingIdSet && existingIdSet.size > 0) {
    const fallbackIds = Array.from(existingIdSet);
    cachedHomeVideoIds = fallbackIds;
    homeVideoIdsCacheTime = now;
    return fallbackIds;
  }

  // Default home page featured video IDs
  const defaultIds = [
    "creator-vid-02",
    "creator-vid-03",
    "creator-vid-04",
    "creator-vid-05",
    "vid-mv0gb5xf-to4r",
    "vid-watch-01",
  ];
  cachedHomeVideoIds = defaultIds;
  homeVideoIdsCacheTime = now;
  return defaultIds;
}

export async function saveHomePageVideoIds(videoIds: string[]): Promise<string[]> {
  const cleanIds = Array.from(
    new Set(videoIds.map((id) => String(id).trim()).filter(Boolean))
  );

  cachedHomeVideoIds = cleanIds;
  homeVideoIdsCacheTime = Date.now();

  try {
    const jsonStr = JSON.stringify({ videoIds: cleanIds });
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["homepage_video_ids", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist homepage_video_ids to D1:", err);
  }

  return cleanIds;
}

export async function ensureVideoTable(): Promise<void> {
  try {
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS product_videos (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        poster_url TEXT,
        views_text TEXT DEFAULT '24.5k',
        badge TEXT DEFAULT 'NEW',
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.warn("Could not ensure product_videos table in D1:", err);
  }
}

/**
 * Get all videos from D1 or in-memory fallback
 */
export async function getAllVideos(): Promise<ProductVideo[]> {
  const homeVideoIds = await getHomePageVideoIds();
  const homeSet = new Set(homeVideoIds);

  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_videos ORDER BY created_at DESC`
    );

    if (rows && rows.length > 0) {
      const dbVideos: ProductVideo[] = rows.map((r) => {
        const id = String(r.id);
        return {
          id,
          productId: String(r.product_id),
          title: String(r.title),
          videoUrl: String(r.video_url),
          posterUrl: r.posterUrl || r.poster_url || "",
          viewsText: r.viewsText || r.views_text || "24.5k",
          badge: r.badge || "NEW",
          active: r.active === 0 || r.active === "0" || r.active === false ? false : true,
          featuredOnHome: homeSet.has(id),
          createdAt: r.created_at || new Date().toISOString(),
        };
      });

      return dbVideos;
    }
  } catch (err: any) {
    console.warn("Error loading videos from D1:", err);
    if (err?.message?.includes("no such table")) {
      await ensureVideoTable();
    }
  }

  return inMemoryVideos.map((v) => ({
    ...v,
    featuredOnHome: homeSet.has(v.id),
  }));
}

/**
 * Get active videos matching a product ID or slug, or matching a specific list of selected video_ids.
 * Only returns videos assigned to this specific product.
 */
export async function getVideosByProduct(
  productId: string | string[],
  explicitVideoIds?: string[]
): Promise<ProductVideo[]> {
  const all = await getAllVideos();
  const activeVideos = all.filter((v) => v.active !== false);

  // If explicit video IDs are assigned to the product, return only those in specified order
  if (Array.isArray(explicitVideoIds)) {
    if (explicitVideoIds.length === 0) return [];
    const videoMap = new Map<string, ProductVideo>();
    activeVideos.forEach((v) => videoMap.set(v.id, v));
    const selected: ProductVideo[] = [];
    explicitVideoIds.forEach((id) => {
      const v = videoMap.get(id);
      if (v) selected.push(v);
    });
    return selected;
  }

  const rawKeys = Array.isArray(productId) ? productId : [productId];
  const normalizedKeys = rawKeys
    .map((k) => String(k || "").trim().toLowerCase())
    .filter(Boolean);

  if (normalizedKeys.length === 0) return [];

  const cleanKeys = normalizedKeys.map((k) => k.replace(/[-_ ]+/g, " ").trim());

  // Return videos specifically attached to this product or any of its aliases
  return activeVideos.filter((v) => {
    const vPid = (v.productId || "").toLowerCase().trim();
    if (!vPid || vPid === "none" || vPid === "all") return false;
    const vPidClean = vPid.replace(/[-_ ]+/g, " ").trim();

    return normalizedKeys.some((normId, idx) => {
      const normClean = cleanKeys[idx];
      return (
        vPid === normId ||
        vPidClean === normClean ||
        normId.includes(vPid) ||
        vPid.includes(normId) ||
        normClean.includes(vPidClean) ||
        vPidClean.includes(normClean) ||
        (normClean.length > 3 &&
          vPidClean.split(" ").some((w) => w.length > 3 && normClean.includes(w)))
      );
    });
  });
}

/**
 * Add a new video to store
 */
export async function addVideo(
  video: Omit<ProductVideo, "id" | "createdAt"> & { id?: string }
): Promise<ProductVideo> {
  const newId = video.id || `vid-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Safety: auto-upload base64 to R2 if submitted
  let cleanVideoUrl = video.videoUrl.trim();
  let cleanPosterUrl = video.posterUrl?.trim() || "";

  if (cleanVideoUrl.startsWith("data:")) {
    try {
      cleanVideoUrl = await uploadBase64Media(cleanVideoUrl, "videos");
    } catch (e) {
      console.warn("Failed to auto-upload base64 videoUrl:", e);
    }
  }

  if (cleanPosterUrl.startsWith("data:")) {
    try {
      cleanPosterUrl = await uploadBase64Media(cleanPosterUrl, "images");
    } catch (e) {
      console.warn("Failed to auto-upload base64 posterUrl:", e);
    }
  }

  const fullVideo: ProductVideo = {
    id: newId,
    productId: (video.productId || "none").trim(),
    title: video.title.trim(),
    videoUrl: cleanVideoUrl,
    posterUrl: cleanPosterUrl,
    viewsText: video.viewsText?.trim() || "15.4k",
    badge: video.badge?.trim() || "NEW",
    active: video.active !== false,
    createdAt: now,
  };

  inMemoryVideos.unshift(fullVideo);

  await ensureVideoTable();

  try {
    const res = await executeD1Query(
      `INSERT INTO product_videos (id, product_id, title, video_url, poster_url, views_text, badge, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullVideo.id,
        fullVideo.productId,
        fullVideo.title,
        fullVideo.videoUrl,
        fullVideo.posterUrl || "",
        fullVideo.viewsText,
        fullVideo.badge,
        fullVideo.active ? 1 : 0,
        fullVideo.createdAt,
      ]
    );
    if (!res) {
      console.warn("D1 query returned null when inserting video:", fullVideo.id);
    }
  } catch (err) {
    console.warn("Could not save video to D1:", err);
  }

  return fullVideo;
}

/**
 * Update an existing video
 */
export async function updateVideo(
  id: string,
  updates: Partial<ProductVideo>
): Promise<ProductVideo | null> {
  let cleanVideoUrl = updates.videoUrl !== undefined ? updates.videoUrl.trim() : undefined;
  let cleanPosterUrl = updates.posterUrl !== undefined ? updates.posterUrl.trim() : undefined;

  if (cleanVideoUrl && cleanVideoUrl.startsWith("data:")) {
    try {
      cleanVideoUrl = await uploadBase64Media(cleanVideoUrl, "videos");
    } catch (e) {
      console.warn("Failed to auto-upload base64 videoUrl in update:", e);
    }
  }

  if (cleanPosterUrl && cleanPosterUrl.startsWith("data:")) {
    try {
      cleanPosterUrl = await uploadBase64Media(cleanPosterUrl, "images");
    } catch (e) {
      console.warn("Failed to auto-upload base64 posterUrl in update:", e);
    }
  }

  const sanitizedUpdates: Partial<ProductVideo> = { ...updates };
  if (cleanVideoUrl !== undefined) sanitizedUpdates.videoUrl = cleanVideoUrl;
  if (cleanPosterUrl !== undefined) sanitizedUpdates.posterUrl = cleanPosterUrl;

  const index = inMemoryVideos.findIndex((v) => v.id === id);
  if (index >= 0) {
    inMemoryVideos[index] = { ...inMemoryVideos[index], ...sanitizedUpdates };
  }

  await ensureVideoTable();

  try {
    // Check if the record already exists in D1
    const existing = await executeD1Query<any>(
      `SELECT id FROM product_videos WHERE id = ? LIMIT 1`,
      [id]
    );

    if (existing && existing.length > 0) {
      // Row exists: perform UPDATE
      const sets: string[] = [];
      const params: any[] = [];

      if (sanitizedUpdates.productId !== undefined) {
        sets.push("product_id = ?");
        params.push(sanitizedUpdates.productId);
      }
      if (sanitizedUpdates.title !== undefined) {
        sets.push("title = ?");
        params.push(sanitizedUpdates.title);
      }
      if (sanitizedUpdates.videoUrl !== undefined) {
        sets.push("video_url = ?");
        params.push(sanitizedUpdates.videoUrl);
      }
      if (sanitizedUpdates.posterUrl !== undefined) {
        sets.push("poster_url = ?");
        params.push(sanitizedUpdates.posterUrl);
      }
      if (sanitizedUpdates.viewsText !== undefined) {
        sets.push("views_text = ?");
        params.push(sanitizedUpdates.viewsText);
      }
      if (sanitizedUpdates.badge !== undefined) {
        sets.push("badge = ?");
        params.push(sanitizedUpdates.badge);
      }
      if (sanitizedUpdates.active !== undefined) {
        sets.push("active = ?");
        params.push(sanitizedUpdates.active ? 1 : 0);
      }

      if (sets.length > 0) {
        params.push(id);
        await executeD1Query(
          `UPDATE product_videos SET ${sets.join(", ")} WHERE id = ?`,
          params
        );
      }
    } else {
      // Row did not exist in D1 (e.g. was a seed video that hadn't been persisted yet)
      const current = inMemoryVideos.find((v) => v.id === id) || DEFAULT_VIDEOS.find((v) => v.id === id);
      const toInsert: ProductVideo = {
        id,
        productId: sanitizedUpdates.productId ?? current?.productId ?? "none",
        title: sanitizedUpdates.title ?? current?.title ?? "Untitled Video",
        videoUrl: sanitizedUpdates.videoUrl ?? current?.videoUrl ?? "",
        posterUrl: sanitizedUpdates.posterUrl ?? current?.posterUrl ?? "",
        viewsText: sanitizedUpdates.viewsText ?? current?.viewsText ?? "24.5k",
        badge: sanitizedUpdates.badge ?? current?.badge ?? "NEW",
        active: sanitizedUpdates.active !== undefined ? sanitizedUpdates.active : (current?.active !== false),
        createdAt: new Date().toISOString(),
      };

      await executeD1Query(
        `INSERT INTO product_videos (id, product_id, title, video_url, poster_url, views_text, badge, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          toInsert.id,
          toInsert.productId,
          toInsert.title,
          toInsert.videoUrl,
          toInsert.posterUrl || "",
          toInsert.viewsText,
          toInsert.badge,
          toInsert.active ? 1 : 0,
          toInsert.createdAt,
        ]
      );
    }
  } catch (err) {
    console.warn("Could not update video in D1:", err);
  }

  const all = await getAllVideos();
  return all.find((v) => v.id === id) || (index >= 0 ? inMemoryVideos[index] : null);
}

/**
 * Delete a video by ID
 */
export async function deleteVideo(id: string): Promise<boolean> {
  inMemoryVideos = inMemoryVideos.filter((v) => v.id !== id);
  cachedHomeVideoIds = null;
  homeVideoIdsCacheTime = 0;

  try {
    // 1. Delete from product_videos table
    await executeD1Query(`DELETE FROM product_videos WHERE id = ?`, [id]);

    // 2. Remove from homepage_video_ids in integrations_config
    try {
      const cfgRows = await executeD1Query<{ config_data: string }>(
        "SELECT config_data FROM integrations_config WHERE provider = 'homepage_video_ids'"
      );
      if (cfgRows && cfgRows.length > 0 && cfgRows[0].config_data) {
        const parsed = JSON.parse(cfgRows[0].config_data);
        const rawIds: string[] = Array.isArray(parsed) ? parsed : (parsed?.videoIds || []);
        const filtered = rawIds.filter((vId) => vId !== id);
        await executeD1Query(
          "UPDATE integrations_config SET config_data = ?, updated_at = datetime('now') WHERE provider = 'homepage_video_ids'",
          [JSON.stringify({ videoIds: filtered })]
        );
      }
    } catch (e) {
      console.warn("Could not clean up homepage_video_ids on video delete:", e);
    }

    // 3. Remove from products.video_ids for all products
    try {
      const prodRows = await executeD1Query<{ id: string; video_ids: string }>(
        "SELECT id, video_ids FROM products WHERE video_ids IS NOT NULL AND video_ids != ''"
      );
      for (const prod of prodRows) {
        if (prod.video_ids && prod.video_ids.includes(id)) {
          try {
            const parsed = JSON.parse(prod.video_ids);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter((vId) => vId !== id);
              await executeD1Query(
                "UPDATE products SET video_ids = ?, updated_at = datetime('now') WHERE id = ?",
                [cleaned.length > 0 ? JSON.stringify(cleaned) : null, prod.id]
              );
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Could not clean up product video_ids on video delete:", e);
    }

    return true;
  } catch (err) {
    console.warn("Could not delete video from D1:", err);
    return true;
  }
}
