import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory media cache to avoid repeated requests to Meta Graph API
const mediaCache = new Map<string, { buffer: ArrayBuffer; mimeType: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId") || searchParams.get("id");
    const directUrl = searchParams.get("url");

    if (!mediaId && !directUrl) {
      return NextResponse.json({ success: false, error: "Missing mediaId or url parameter" }, { status: 400 });
    }

    const token = process.env.WHATSAPP_TOKEN || "";

    const cacheKey = mediaId || directUrl!;

    // Check cache first
    const cached = mediaCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(cached.buffer, {
        status: 200,
        headers: {
          "Content-Type": cached.mimeType,
          "Content-Length": String(cached.buffer.byteLength),
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    let downloadUrl = directUrl;
    let mimeType = "audio/ogg";

    // 1. If mediaId is provided, query Meta Graph API for download URL & mimeType
    if (mediaId) {
      const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!metaRes.ok) {
        const errorData = await metaRes.json().catch(() => ({}));
        console.warn(`[WhatsApp Media Proxy] Failed to fetch media metadata for ${mediaId}:`, errorData);
        return NextResponse.json(
          {
            success: false,
            error:
              errorData.error?.message ||
              "Media not found or expired on Meta servers (WhatsApp media expires after 30 days)",
          },
          { status: metaRes.status === 404 ? 404 : 502 }
        );
      }

      const metaData = await metaRes.json();
      downloadUrl = metaData.url;
      mimeType = metaData.mime_type || mimeType;
    }

    if (!downloadUrl) {
      return NextResponse.json({ success: false, error: "No download URL available" }, { status: 404 });
    }

    // 2. Fetch the binary payload from lookaside.fbsbx.com with Bearer token
    const fileRes = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "VittalDigital-WhatsAppDesk/1.0",
      },
    });

    if (!fileRes.ok) {
      console.warn(`[WhatsApp Media Proxy] Failed to download media binary from ${downloadUrl}:`, fileRes.status);
      return NextResponse.json(
        { success: false, error: "Failed to download media binary from Meta storage" },
        { status: fileRes.status }
      );
    }

    const arrayBuffer = await fileRes.arrayBuffer();

    // Cache the downloaded media (limit cache size to 50 items)
    if (mediaCache.size > 50) {
      const oldestKey = mediaCache.keys().next().value;
      if (oldestKey) mediaCache.delete(oldestKey);
    }
    mediaCache.set(cacheKey, {
      buffer: arrayBuffer,
      mimeType,
      timestamp: Date.now(),
    });

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(arrayBuffer.byteLength),
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.error("[WhatsApp Media Proxy] Internal error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

