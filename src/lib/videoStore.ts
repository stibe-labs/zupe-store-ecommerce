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
  createdAt: string;
}

// Default seed videos for instant demonstration
const DEFAULT_VIDEOS: ProductVideo[] = [
  {
    id: "vid-watch-01",
    productId: "watch",
    title: "Titan Minimalist Analog Watch Hands-on",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
    viewsText: "24.5k",
    badge: "NEW",
    productName: "watch",
    productPrice: 1999,
    productMrp: 3499,
    productSlug: "watch",
    productImage: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    active: true,
    createdAt: "2026-03-08T12:00:00.000Z",
  },
  {
    id: "vid-heating-pad-01",
    productId: "portable-menstrual-heating-pad",
    title: "Instant Relief & 3 Heat Modes Demo",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
    viewsText: "29.7k",
    badge: "NEW",
    productName: "Portable Menstrual Heating Pad",
    productPrice: 799,
    productMrp: 1149,
    productSlug: "portable-menstrual-heating-pad",
    productImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
    active: true,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "vid-heating-pad-02",
    productId: "portable-menstrual-heating-pad",
    title: "How to wear & gentle vibration mode",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    viewsText: "18.4k",
    badge: "TRENDING",
    productName: "Portable Menstrual Heating Pad",
    productPrice: 799,
    productMrp: 1149,
    productSlug: "portable-menstrual-heating-pad",
    productImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
    active: true,
    createdAt: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "vid-mist-fan-01",
    productId: "portable-mist-cooling-fan",
    title: "Ice Cold Mist Air in 5 Seconds!",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800",
    viewsText: "34.1k",
    badge: "NEW",
    productName: "Portable Mist Cooling Fan",
    productPrice: 899,
    productMrp: 1499,
    productSlug: "portable-mist-cooling-fan",
    productImage: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600",
    active: true,
    createdAt: "2026-02-28T09:00:00.000Z",
  },
  {
    id: "vid-ripple-lamp-01",
    productId: "ripple-lamp",
    title: "Ocean Wave Visual Effect in Bedroom",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    viewsText: "42.8k",
    badge: "POPULAR",
    productName: "Rotating Water Ripple Lamp",
    productPrice: 1299,
    productMrp: 2499,
    productSlug: "rotating-water-ripple-lamp",
    productImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
    active: true,
    createdAt: "2026-02-15T15:30:00.000Z",
  },
];

let inMemoryVideos: ProductVideo[] = [...DEFAULT_VIDEOS];

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
  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_videos ORDER BY created_at DESC`
    );

    if (rows && rows.length > 0) {
      const dbVideos: ProductVideo[] = rows.map((r) => ({
        id: String(r.id),
        productId: String(r.product_id),
        title: String(r.title),
        videoUrl: String(r.video_url),
        posterUrl: r.posterUrl || r.poster_url || "",
        viewsText: r.viewsText || r.views_text || "24.5k",
        badge: r.badge || "NEW",
        active: r.active === 0 || r.active === "0" || r.active === false ? false : true,
        createdAt: r.created_at || new Date().toISOString(),
      }));

      // Merge memory videos not in DB
      const dbIds = new Set(dbVideos.map((v) => v.id));
      const extras = inMemoryVideos.filter((v) => !dbIds.has(v.id));
      return [...dbVideos, ...extras];
    }
  } catch (err: any) {
    console.warn("Error loading videos from D1:", err);
    if (err?.message?.includes("no such table")) {
      await ensureVideoTable();
    }
  }

  return inMemoryVideos;
}

/**
 * Get active videos matching a product ID or slug (plus all other active store videos)
 * Ensures all active videos appear on every product while product-specific reels appear first.
 */
export async function getVideosByProduct(productId: string): Promise<ProductVideo[]> {
  const normId = (productId || "").trim().toLowerCase();
  const all = await getAllVideos();

  // Strictly filter for active & visible on store videos
  const activeVideos = all.filter((v) => v.active !== false);

  if (!normId) return activeVideos;

  const normClean = normId.replace(/[-_ ]+/g, " ").trim();

  // Prioritize videos specifically attached to this product first
  const matching = activeVideos.filter((v) => {
    const vPid = (v.productId || "").toLowerCase().trim();
    if (!vPid || vPid === "none" || vPid === "all") return false;
    const vPidClean = vPid.replace(/[-_ ]+/g, " ").trim();
    return (
      vPid === normId ||
      vPidClean === normClean ||
      normId.includes(vPid) ||
      vPid.includes(normId) ||
      normClean.includes(vPidClean) ||
      vPidClean.includes(normClean)
    );
  });

  // Then append all other active videos so the shopper sees all store videos
  const remaining = activeVideos.filter((v) => !matching.some((m) => m.id === v.id));

  return [...matching, ...remaining];
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

  try {
    await executeD1Query(`DELETE FROM product_videos WHERE id = ?`, [id]);
    return true;
  } catch (err) {
    console.warn("Could not delete video from D1:", err);
    return true;
  }
}
