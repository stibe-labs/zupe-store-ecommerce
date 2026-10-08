// In-Memory & Cloudflare D1 Store for Shoppable Product Videos
import { executeD1Query } from "./d1";

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
let tableInitialized = false;

export async function ensureVideoTable(): Promise<void> {
  if (tableInitialized) return;
  tableInitialized = true;

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
    try {
      await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_videos_product ON product_videos(product_id);`);
    } catch {}
  } catch (err) {
    console.warn("Could not ensure product_videos table in D1:", err);
  }
}

/**
 * Get all videos from D1 or in-memory fallback
 */
export async function getAllVideos(): Promise<ProductVideo[]> {
  try {
    await ensureVideoTable();
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_videos ORDER BY created_at DESC`
    );

    if (rows && rows.length > 0) {
      const dbVideos: ProductVideo[] = rows.map((r) => ({
        id: String(r.id),
        productId: String(r.product_id),
        title: String(r.title),
        videoUrl: String(r.video_url),
        posterUrl: r.poster_url || "",
        viewsText: r.views_text || "24.5k",
        badge: r.badge || "NEW",
        active: r.active === 1 || r.active === true || r.active === "1",
        createdAt: r.created_at || new Date().toISOString(),
      }));

      // Merge memory videos not in DB
      const dbIds = new Set(dbVideos.map((v) => v.id));
      const extras = inMemoryVideos.filter((v) => !dbIds.has(v.id));
      return [...dbVideos, ...extras];
    }
  } catch (err) {
    console.warn("Error loading videos from D1:", err);
  }

  return inMemoryVideos;
}

/**
 * Get active videos matching a product ID or slug (plus 'all' videos)
 */
export async function getVideosByProduct(productId: string): Promise<ProductVideo[]> {
  const normId = (productId || "").trim().toLowerCase();
  const all = await getAllVideos();

  // Filter active videos
  const activeVideos = all.filter((v) => v.active !== false);

  // 1. Strict match on product id / slug or 'all'
  const matching = activeVideos.filter((v) => {
    const vPid = (v.productId || "").toLowerCase().trim();
    return (
      vPid === "all" ||
      vPid === normId ||
      normId.includes(vPid) ||
      vPid.includes(normId)
    );
  });

  if (matching.length > 0) {
    return matching;
  }

  // 2. Fallback: if no specific video attached to this product, show top active videos
  return activeVideos.slice(0, 4);
}

/**
 * Add a new video to store
 */
export async function addVideo(
  video: Omit<ProductVideo, "id" | "createdAt"> & { id?: string }
): Promise<ProductVideo> {
  const newId = video.id || `vid-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullVideo: ProductVideo = {
    id: newId,
    productId: (video.productId || "all").trim(),
    title: video.title.trim(),
    videoUrl: video.videoUrl.trim(),
    posterUrl: video.posterUrl?.trim() || "",
    viewsText: video.viewsText?.trim() || "15.4k",
    badge: video.badge?.trim() || "NEW",
    active: video.active !== false,
    createdAt: now,
  };

  inMemoryVideos.unshift(fullVideo);

  try {
    await ensureVideoTable();
    await executeD1Query(
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
  const index = inMemoryVideos.findIndex((v) => v.id === id);
  if (index >= 0) {
    inMemoryVideos[index] = { ...inMemoryVideos[index], ...updates };
  }

  try {
    await ensureVideoTable();
    const sets: string[] = [];
    const params: any[] = [];

    if (updates.productId !== undefined) {
      sets.push("product_id = ?");
      params.push(updates.productId);
    }
    if (updates.title !== undefined) {
      sets.push("title = ?");
      params.push(updates.title);
    }
    if (updates.videoUrl !== undefined) {
      sets.push("video_url = ?");
      params.push(updates.videoUrl);
    }
    if (updates.posterUrl !== undefined) {
      sets.push("poster_url = ?");
      params.push(updates.posterUrl);
    }
    if (updates.viewsText !== undefined) {
      sets.push("views_text = ?");
      params.push(updates.viewsText);
    }
    if (updates.badge !== undefined) {
      sets.push("badge = ?");
      params.push(updates.badge);
    }
    if (updates.active !== undefined) {
      sets.push("active = ?");
      params.push(updates.active ? 1 : 0);
    }

    if (sets.length > 0) {
      params.push(id);
      await executeD1Query(
        `UPDATE product_videos SET ${sets.join(", ")} WHERE id = ?`,
        params
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
    await ensureVideoTable();
    await executeD1Query(`DELETE FROM product_videos WHERE id = ?`, [id]);
    return true;
  } catch (err) {
    console.warn("Could not delete video from D1:", err);
    return true;
  }
}
