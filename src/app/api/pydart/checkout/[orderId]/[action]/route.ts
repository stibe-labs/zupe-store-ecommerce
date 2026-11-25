import { NextRequest, NextResponse } from "next/server";
import { getPyDartPayConfig, isPyDartRailEnabled, type PyDartPaymentRail } from "@/lib/pydartPay";

export const dynamic = "force-dynamic";

const ORDER_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;
const ACTION_TO_RAIL: Record<string, PyDartPaymentRail> = {
  "upi-session": "upi",
  "netbanking-session": "netbanking",
  "bank-transfer-session": "van",
};

/**
 * Same-origin proxy for PyDart Pay public checkout rail sessions
 * (`upi-session`, `netbanking-session`, `bank-transfer-session`),
 * enforcing Turkiye Jam's active payment rail allowlist (`TURKIYE_JAM_ENABLED_PYDART_RAILS`).
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string; action: string }> }
) {
  const { orderId, action } = await context.params;
  const requiredRail = ACTION_TO_RAIL[action];
  if (!ORDER_ID_RE.test(orderId) || !requiredRail) {
    return NextResponse.json(
      { status: "ERROR", error: { code: "ERR_INVALID_REQUEST", message: "Invalid checkout action." } },
      { status: 400 }
    );
  }

  if (!isPyDartRailEnabled(requiredRail)) {
    return NextResponse.json(
      {
        status: "ERROR",
        error: {
          code: "ERR_PAYMENT_METHOD_DISABLED",
          message: "Only UPI payments are currently enabled for this store.",
        },
      },
      { status: 403 }
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
