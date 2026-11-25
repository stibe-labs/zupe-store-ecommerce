import { NextRequest, NextResponse } from "next/server";
import { getPyDartPayConfig, isPyDartRailEnabled } from "@/lib/pydartPay";

export const dynamic = "force-dynamic";

const ORDER_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;

/**
 * Same-origin proxy for PyDart Pay public checkout status & verification (`GET` & `POST`).
 * Strictly allowlists orderId format and never accepts or processes raw card PAN/CVV.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  if (!ORDER_ID_RE.test(orderId)) {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_INVALID_ORDER_ID", message: "Invalid order ID." } },
      { status: 400 }
    );
  }

  const { baseUrl } = await getPyDartPayConfig();
  const incomingUrl = new URL(req.url);
  const forwardParams = new URLSearchParams();
  if (incomingUrl.searchParams.get("sync") === "1") forwardParams.set("sync", "1");
  if (incomingUrl.searchParams.get("full") === "1") forwardParams.set("full", "1");

  const qs = forwardParams.toString();
  const upstreamUrl = `${baseUrl}/api/v1/checkout/${encodeURIComponent(orderId)}${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const text = await res.text();
    if (res.ok && incomingUrl.searchParams.get("full") === "1") {
      try {
        const parsed = JSON.parse(text) as {
          status?: string;
          data?: {
            order?: Record<string, unknown>;
            netbanking_banks?: unknown;
            card_networks?: unknown;
            smart_collect_enabled?: unknown;
          };
        };
        if (parsed?.data) {
          if (!isPyDartRailEnabled("netbanking")) {
            delete parsed.data.netbanking_banks;
          }
          if (!isPyDartRailEnabled("card")) {
            delete parsed.data.card_networks;
            if (parsed.data.order) {
              parsed.data.order.razorpay_key_id = null;
              parsed.data.order.razorpay_account_id = null;
            }
          }
          if (!isPyDartRailEnabled("van")) {
            parsed.data.smart_collect_enabled = false;
          }
          return NextResponse.json(parsed, {
            status: res.status,
            headers: { "Cache-Control": "no-store" },
          });
        }
      } catch {
        // Fall through to raw upstream response
      }
    }
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "ERROR",
        error: { code: "ERR_UPSTREAM_TIMEOUT", message: "Payment server timed out. Please retry." },
      },
      { status: 504 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  if (!ORDER_ID_RE.test(orderId)) {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_INVALID_ORDER_ID", message: "Invalid order ID." } },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_INVALID_JSON", message: "Invalid JSON." } },
      { status: 400 }
    );
  }

  // Strictly allow only Razorpay callback verification or sandbox simulation payloads (never raw card fields)
  const sanitizedPayload: Record<string, unknown> = {
    mode: typeof body.mode === "string" ? body.mode : "",
  };
  if (body.mode === "razorpay_callback") {
    sanitizedPayload.razorpay_payment_id = String(body.razorpay_payment_id ?? "");
    sanitizedPayload.razorpay_order_id = String(body.razorpay_order_id ?? "");
    sanitizedPayload.razorpay_signature = String(body.razorpay_signature ?? "");
  } else if (body.mode === "sandbox_simulate") {
    sanitizedPayload.outcome = String(body.outcome ?? "success");
    sanitizedPayload.method = String(body.method ?? "upi");
  } else {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_UNSUPPORTED_MODE", message: "Unsupported mode." } },
      { status: 400 }
    );
  }

  const { baseUrl } = await getPyDartPayConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/checkout/${encodeURIComponent(orderId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedPayload),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "ERROR",
        error: { code: "ERR_UPSTREAM_TIMEOUT", message: "Payment verification timed out." },
      },
      { status: 504 }
    );
  }
}
