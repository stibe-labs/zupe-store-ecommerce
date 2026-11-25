import { NextRequest, NextResponse } from "next/server";
import { getPyDartPayConfig } from "@/lib/pydartPay";

export const dynamic = "force-dynamic";

const ORDER_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;

/**
 * Same-origin Bank/3DS return callback proxy for Turkiye Jam (`GET` & `POST`).
 * Ensures `razorpay.js` sends a 100% `https://turkiyejam.com` callback_url so zero
 * third-party domain (`pydart.com`) appears in Razorpay's website risk checks.
 */
async function forwardCallback(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
): Promise<Response> {
  const { orderId } = await context.params;
  if (!ORDER_ID_RE.test(orderId)) {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_INVALID_ORDER_ID", message: "Invalid order ID." } },
      { status: 400 }
    );
  }

  const { baseUrl } = await getPyDartPayConfig();
  const incomingUrl = new URL(req.url);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://turkiyejam.com").replace(/\/+$/, "");
  const siteOrigin = new URL(siteUrl).origin;

  const forwardParams = new URLSearchParams(incomingUrl.searchParams);
  if (!forwardParams.has("mode")) {
    forwardParams.set("mode", "popup");
  }
  forwardParams.set("return_origin", siteOrigin);

  const upstreamUrl = `${baseUrl}/api/v1/checkout/${encodeURIComponent(
    orderId
  )}/callback?${forwardParams.toString()}`;

  const rawBody = req.method === "POST" ? await req.text().catch(() => "") : undefined;
  const contentType = req.headers.get("content-type") || "application/x-www-form-urlencoded";

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: req.method === "POST" ? { "Content-Type": contentType } : undefined,
      body: rawBody,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (upstreamRes.status >= 300 && upstreamRes.status < 400) {
      const loc = upstreamRes.headers.get("location");
      if (loc) {
        try {
          const parsedLoc = new URL(loc, siteOrigin);
          if (parsedLoc.origin === siteOrigin) {
            return NextResponse.redirect(parsedLoc.toString(), {
              status: 303,
              headers: { "Cache-Control": "no-store" },
            });
          }
        } catch {
          // Fall back to safe same-origin pay page
        }
      }
      return NextResponse.redirect(`${siteOrigin}/pay/${encodeURIComponent(orderId)}`, {
        status: 303,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const resType = upstreamRes.headers.get("content-type") || "text/html; charset=utf-8";
    const text = await upstreamRes.text();
    return new Response(text, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": resType,
        "Cache-Control": "no-store",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.redirect(`${siteOrigin}/pay/${encodeURIComponent(orderId)}`, {
      status: 303,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  return forwardCallback(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  return forwardCallback(req, context);
}
