import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getRuntimeSecret } from "@/lib/pydartPay";
import {
  isAllowedMetaMediaUrl,
  isValidMetaMediaId,
  sanitizeDownloadFilename,
  shouldAttachMetaBearerToken,
} from "@/lib/whatsappInboundParser";

export const dynamic = "force-dynamic";

// Bounded in-memory media cache to avoid repeated Meta Graph API round-trips
const mediaCache = new Map<string, { buffer: ArrayBuffer; mimeType: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours
const MAX_CACHE_ENTRIES = 40;
const MAX_CACHEABLE_BYTES = 8 * 1024 * 1024; // 8 MB per item

const FALLBACK_WA_TOKEN =
  "EAATwm2s3GMYBS7KhJQ2MDiAyAGFS6OwFHiXZAFvfPlyMUg4Jf3wV5e8TPj0PKC8rkE6x9vkzuZANllpjCUHvJaXYAZB6Ursyzc26l0SDJrBEEPJYB4ZB8rjEQ2qTSBI6tEYgZBOTJ47DAmVNAhuyaQAoryvhYiO6vRpAFdE0H61gFXCkwttX5sZCCSyR20kCwOOQZDZD";

function buildMediaResponse(
  req: NextRequest,
  buffer: ArrayBuffer,
  mimeType: string,
  download: boolean,
  filename?: string | null
): Response {
  const totalBytes = buffer.byteLength;
  const baseHeaders: Record<string, string> = {
    "Content-Type": mimeType || "application/octet-stream",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
  };

  if (download) {
    const safeName = sanitizeDownloadFilename(filename, "whatsapp-attachment");
    baseHeaders["Content-Disposition"] = `attachment; filename="${safeName}"`;
  }

  const rangeHeader = req.headers.get("range");
  if (rangeHeader && totalBytes > 0) {
    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (match) {
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : totalBytes - 1;

      if (!match[1] && match[2]) {
        // Suffix range: bytes=-500
        const suffixLength = parseInt(match[2], 10);
        start = Math.max(0, totalBytes - suffixLength);
        end = totalBytes - 1;
      }

      if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start >= totalBytes) {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalBytes}`,
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      end = Math.min(end, totalBytes - 1);
      if (end < start) end = totalBytes - 1;

      const slice = buffer.slice(start, end + 1);
      return new Response(slice, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${totalBytes}`,
          "Content-Length": String(slice.byteLength),
        },
      });
    }
  }

  return new Response(buffer, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(totalBytes),
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    // Defense-in-depth admin session verification (same-origin <img>/<video>/<audio> send cookies)
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }
    const session = await verifyAdminSessionToken(adminToken);
    if (!session.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired admin session token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId") || searchParams.get("id");
    const directUrl = searchParams.get("url");
    const download = searchParams.get("download") === "1" || searchParams.get("download") === "true";
    const filename = searchParams.get("filename");

    if (!mediaId && !directUrl) {
      return NextResponse.json(
        { success: false, error: "Missing mediaId or url parameter" },
        { status: 400 }
      );
    }

    if (mediaId && !isValidMetaMediaId(mediaId)) {
      return NextResponse.json(
        { success: false, error: "Invalid WhatsApp mediaId format" },
        { status: 400 }
      );
    }

    if (!mediaId && directUrl && !isAllowedMetaMediaUrl(directUrl)) {
      return NextResponse.json(
        { success: false, error: "Blocked: URL is not an allowed Meta media host" },
        { status: 400 }
      );
    }

    const token = (await getRuntimeSecret("WHATSAPP_TOKEN")) || FALLBACK_WA_TOKEN;
    const cacheKey = mediaId ? `id:${mediaId.trim()}` : `url:${directUrl!.trim()}`;

    // Serve from cache if fresh
    const cached = mediaCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return buildMediaResponse(req, cached.buffer, cached.mimeType, download, filename);
    }

    let downloadUrl = directUrl?.trim() || "";
    let mimeType = "";

    // 1. Resolve mediaId via Meta Graph API
    if (mediaId) {
      const metaUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(mediaId.trim())}`;
      const metaRes = await fetch(metaUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!metaRes.ok) {
        const errorData = await metaRes.json().catch(() => ({}));
        console.warn(`[WhatsApp Media Proxy] Failed to fetch metadata for ${mediaId}:`, errorData?.error?.code || metaRes.status);
        return NextResponse.json(
          {
            success: false,
            error:
              errorData?.error?.message ||
              "Media not found or expired on Meta servers (WhatsApp media expires after 30 days)",
          },
          { status: metaRes.status === 404 ? 404 : 502 }
        );
      }

      const metaData = await metaRes.json();
      downloadUrl = typeof metaData?.url === "string" ? metaData.url : "";
      mimeType = typeof metaData?.mime_type === "string" ? metaData.mime_type : "";
    }

    if (!downloadUrl || !isAllowedMetaMediaUrl(downloadUrl)) {
      return NextResponse.json(
        { success: false, error: "No valid Meta download URL available" },
        { status: 404 }
      );
    }

    // 2. Download binary from verified Meta host (attach Bearer token ONLY for auth-eligible Meta hosts)
    const downloadHeaders: Record<string, string> = {
      "User-Agent": "TurkiyeJam-WhatsAppDesk/2.0",
    };
    if (shouldAttachMetaBearerToken(downloadUrl)) {
      downloadHeaders["Authorization"] = `Bearer ${token}`;
    }

    const fileRes = await fetch(downloadUrl, {
      headers: downloadHeaders,
      signal: AbortSignal.timeout(15000),
    });

    if (!fileRes.ok) {
      console.warn(`[WhatsApp Media Proxy] Failed to download media binary:`, fileRes.status);
      return NextResponse.json(
        { success: false, error: "Failed to download media binary from Meta storage" },
        { status: fileRes.status === 404 ? 404 : 502 }
      );
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const resolvedMimeType =
      mimeType ||
      fileRes.headers.get("content-type")?.split(";")[0]?.trim() ||
      "application/octet-stream";

    // Cache small-to-medium binaries (skip > 8MB to protect edge memory budget)
    if (arrayBuffer.byteLength <= MAX_CACHEABLE_BYTES) {
      if (mediaCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = mediaCache.keys().next().value;
        if (oldestKey) mediaCache.delete(oldestKey);
      }
      mediaCache.set(cacheKey, {
        buffer: arrayBuffer,
        mimeType: resolvedMimeType,
        timestamp: Date.now(),
      });
    }

    return buildMediaResponse(req, arrayBuffer, resolvedMimeType, download, filename);
  } catch (err: any) {
    console.error("[WhatsApp Media Proxy] Internal error:", err?.message || err);
    return NextResponse.json({ success: false, error: "Failed to load media attachment" }, { status: 500 });
  }
}
