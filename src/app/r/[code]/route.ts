import { NextRequest, NextResponse } from "next/server";
import { resolveAffiliateCode, recordInfluencerClick } from "@/lib/influencerService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = (code || "").trim().toLowerCase();

    // Default destination
    let targetUrl = "/";
    let isAffiliateActive = false;

    // Resolve code in D1/memory
    const resolved = await resolveAffiliateCode(cleanCode);

    if (resolved) {
      const { link, influencer } = resolved;
      isAffiliateActive = Boolean(influencer.active);

      // Determine redirect destination
      const dest = (link.destination || "home").trim();
      if (!dest || dest.toLowerCase() === "home") {
        targetUrl = "/";
      } else if (dest.startsWith("/")) {
        targetUrl = dest;
      } else {
        targetUrl = `/products/${dest}`;
      }

      // If influencer is active, record click
      if (isAffiliateActive) {
        const ip =
          req.headers.get("cf-connecting-ip") ||
          req.headers.get("x-forwarded-for")?.split(",")[0] ||
          "";
        const userAgent = req.headers.get("user-agent") || "";
        // Record click non-blocking
        recordInfluencerClick(link.id, influencer.id, ip, userAgent).catch((err) => {
          console.warn("Click recording error in /r/[code]:", err);
        });
      }
    }

    // Prepare HTML response with instant JS redirect + meta refresh fallback
    // This sets localStorage in addition to the HTTP Set-Cookie header for 100% Instagram in-app browser reliability
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting to Zupe Store...</title>
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <script>
    try {
      ${
        isAffiliateActive
          ? `
      localStorage.setItem('zupe_aff_code', '${cleanCode}');
      localStorage.setItem('zupe_aff_time', '${Date.now()}');
      `
          : `
      // Influencer is inactive; do not set attribution
      `
      }
    } catch(e) {}
    window.location.replace('${targetUrl}');
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0b1120; color: #94a3b8;">
  <p>Loading Zupe Store...</p>
</body>
</html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });

    // Set 7-day cookie if active (7 days = 604800 seconds)
    if (isAffiliateActive) {
      response.cookies.set("zupe_aff_code", cleanCode, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
        httpOnly: false, // Accessible to client-side scripts if needed
      });
    }

    return response;
  } catch (err: any) {
    console.error("Error in /r/[code] handler:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
