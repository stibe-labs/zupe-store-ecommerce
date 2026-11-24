import { NextRequest, NextResponse } from "next/server";
import { getPyDartPayConfig } from "@/lib/pydartPay";

export const dynamic = "force-dynamic";

const ORDER_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;
const ALLOWED_ACTIONS = new Set([
  "upi-session",
  "netbanking-session",
  "bank-transfer-session",
]);

/**
 * Same-origin proxy for PyDart Pay public checkout rail sessions
 * (`upi-session`, `netbanking-session`, `bank-transfer-session`).
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string; action: string }> }
) {
  const { orderId, action } = await context.params;
  if (!ORDER_ID_RE.test(orderId) || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_INVALID_REQUEST", message: "Invalid checkout action." } },
      { status: 400 }
    );
  }

  const { baseUrl } = await getPyDartPayConfig();
  const rawBody = await req.text().catch(() => "");

  try {
    const res = await fetch(
      `${baseUrl}/api/v1/checkout/${encodeURIComponent(orderId)}/${encodeURIComponent(action)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: rawBody || "{}",
        cache: "no-store",
        signal: AbortSignal.timeout(6500),
      }
    );
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
        error: {
          code: "ERR_UPSTREAM_TIMEOUT",
          message: "Could not reach bank gateway right now. Please retry.",
        },
      },
      { status: 504 }
    );
  }
}
