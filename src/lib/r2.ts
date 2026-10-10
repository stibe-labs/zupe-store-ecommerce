// Cloudflare R2 Media Storage Helper for Zupe Store
// Stores videos and images in Cloudflare R2 bucket 'stibe-media'

export const R2_PUBLIC_BASE_URL = "https://pub-abec22fbfdb8446490341e69eabe6a1c.r2.dev";

let cachedBucket: any = null;

export async function getR2Bucket(): Promise<any | null> {
  if (cachedBucket && typeof cachedBucket.put === "function") {
    return cachedBucket;
  }

  // 1. Direct worker bindings
  if ((globalThis as any).MEDIA_BUCKET && typeof (globalThis as any).MEDIA_BUCKET.put === "function") {
    cachedBucket = (globalThis as any).MEDIA_BUCKET;
    return cachedBucket;
  }
  if (
    (globalThis as any).__cf_env__?.MEDIA_BUCKET &&
    typeof (globalThis as any).__cf_env__.MEDIA_BUCKET.put === "function"
  ) {
    cachedBucket = (globalThis as any).__cf_env__.MEDIA_BUCKET;
    return cachedBucket;
  }
  if ((process.env as any).MEDIA_BUCKET && typeof (process.env as any).MEDIA_BUCKET.put === "function") {
    cachedBucket = (process.env as any).MEDIA_BUCKET;
    return cachedBucket;
  }

  // 2. OpenNext Cloudflare context
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as any;
    if (env?.MEDIA_BUCKET && typeof env.MEDIA_BUCKET.put === "function") {
      cachedBucket = env.MEDIA_BUCKET;
      return cachedBucket;
    }
  } catch {
    // OpenNext context not active
  }

  return null;
}

/**
 * Determine a clean file extension from MIME type or original file name
 */
function getExtension(originalName: string, mimeType: string): string {
  const mimeLower = (mimeType || "").toLowerCase();
  if (mimeLower.includes("video/mp4")) return "mp4";
  if (mimeLower.includes("video/webm")) return "webm";
  if (mimeLower.includes("video/quicktime") || mimeLower.includes("video/mov")) return "mov";
  if (mimeLower.includes("image/jpeg") || mimeLower.includes("image/jpg")) return "jpg";
  if (mimeLower.includes("image/png")) return "png";
  if (mimeLower.includes("image/webp")) return "webp";
  if (mimeLower.includes("image/gif")) return "gif";

  const parts = originalName.split(".");
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase();
    if (ext && ext.length <= 4) return ext;
  }

  return mimeLower.startsWith("image/") ? "jpg" : "mp4";
}

/**
 * Upload a binary buffer to Cloudflare R2 bucket (or local filesystem in dev)
 */
export async function uploadMedia(
  fileBuffer: Uint8Array | ArrayBuffer | Buffer,
  originalName: string,
  mimeType: string,
  folder: "videos" | "images" = "videos"
): Promise<string> {
  const ext = getExtension(originalName, mimeType);
  const cleanBase = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 30);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${Date.now()}-${cleanBase || "media"}-${randomSuffix}.${ext}`;

  // 1. Try Cloudflare Worker native R2 bucket binding
  const bucket = await getR2Bucket();
  if (bucket && typeof bucket.put === "function") {
    try {
      await bucket.put(key, fileBuffer, {
        httpMetadata: {
          contentType: mimeType || (folder === "videos" ? "video/mp4" : "image/jpeg"),
        },
      });
      return `${R2_PUBLIC_BASE_URL}/${key}`;
    } catch (err) {
      console.warn("Direct R2 bucket put failed, trying fallbacks:", err);
    }
  }

  // 2. Try Cloudflare REST API for R2 if account & token are present
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || "4eed09d0032a07881825f4e926cb997f";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && apiToken) {
    try {
      const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/stibe-media/objects/${encodeURIComponent(
        key
      )}`;
      const res = await fetch(r2Url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": mimeType || "application/octet-stream",
        },
        body: fileBuffer as any,
      });

      if (res.ok) {
        return `${R2_PUBLIC_BASE_URL}/${key}`;
      }
    } catch (err) {
      console.warn("Cloudflare R2 REST API upload failed:", err);
    }
  }

  // 3. Fallback for Node.js local development (writes to public/uploads)
  try {
    const fs = await import("fs");
    const path = await import("path");
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localFilePath = path.join(uploadsDir, path.basename(key));
    const buf = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer as ArrayBuffer);
    fs.writeFileSync(localFilePath, buf);
    return `/uploads/${folder}/${path.basename(key)}`;
  } catch {
    // If running in an edge environment without fs
  }

  // As a final fallback if upload couldn't persist
  throw new Error(
    "Could not upload file to Cloudflare R2 bucket 'stibe-media'. Check worker bindings or credentials."
  );
}

/**
 * Upload a Base64 data URL to R2 and return the CDN URL
 */
export async function uploadBase64Media(
  dataUrl: string,
  folder: "videos" | "images" = "videos"
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    return dataUrl; // Already a regular URL
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return dataUrl;
  }

  const mimeType = match[1];
  const base64Data = match[2];

  // Decode base64 in both Node and Worker environments
  let buffer: Uint8Array;
  if (typeof Buffer !== "undefined") {
    buffer = Buffer.from(base64Data, "base64");
  } else {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    buffer = bytes;
  }

  const originalName = `upload-${folder}`;
  return uploadMedia(buffer, originalName, mimeType, folder);
}
