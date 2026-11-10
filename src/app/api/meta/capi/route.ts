import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

// Standard SHA-256 hasher for Meta CAPI privacy matching
async function sha256(str: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(str.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventName,
      eventId,
      eventSourceUrl,
      userData = {},
      customData = {},
      testEventCode: explicitTestCode,
    } = body;

    if (!eventName) {
      return NextResponse.json({ success: false, error: "Missing eventName" }, { status: 400 });
    }

    const effectiveEventId = eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const eventTime = Math.floor(Date.now() / 1000);

    // 1. Fetch Meta Pixel and Token credentials from integrations_config
    let pixelId = "";
    let metaToken = "";
    let testEventCode = explicitTestCode || "";
    let isMetaActive = false;

    try {
      const rows = await executeD1Query<any>(
        "SELECT config_data, is_active FROM integrations_config WHERE provider = 'meta'"
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        pixelId = parsed.pixelId || "";
        metaToken = parsed.token || "";
        testEventCode = testEventCode || parsed.testEventCode || "";
        isMetaActive = Boolean(rows[0].is_active);
      }
    } catch {}

    // Fallback to environment variables if present
    pixelId = pixelId || process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
    metaToken = metaToken || process.env.META_ACCESS_TOKEN || "";

    // 2. Format & Hash User Data for Privacy Compliance
    const formattedUserData: any = {};
    if (userData.email) {
      formattedUserData.em = [await sha256(userData.email)];
    }
    if (userData.phone) {
      const cleanPhone = userData.phone.replace(/\D/g, "");
      formattedUserData.ph = [await sha256(cleanPhone)];
    }
    if (userData.firstName) {
      formattedUserData.fn = [await sha256(userData.firstName)];
    }
    if (userData.lastName) {
      formattedUserData.ln = [await sha256(userData.lastName)];
    }
    if (userData.city) {
      formattedUserData.ct = [await sha256(userData.city)];
    }
    if (userData.postalCode) {
      formattedUserData.zp = [await sha256(userData.postalCode)];
    }

    // Capture Client IP and User-Agent from headers
    const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    if (clientIp) formattedUserData.client_ip_address = clientIp.split(",")[0].trim();
    const userAgent = req.headers.get("user-agent");
    if (userAgent) formattedUserData.client_user_agent = userAgent;

    const baseUrl = process.env.STORE_BASE_URL || "https://vittaldigital.com";

    // 3. Prepare Meta CAPI Payload
    const serverEventPayload: any = {
      event_name: eventName,
      event_time: eventTime,
      event_id: effectiveEventId,
      event_source_url: eventSourceUrl || baseUrl,
      action_source: "website",
      user_data: formattedUserData,
      custom_data: {
        currency: customData.currency || "INR",
        value: Number(customData.value || 0),
        content_name: customData.contentName,
        content_ids: customData.contentIds || [],
        content_type: customData.contentType || "product",
        num_items: Number(customData.numItems || 1),
        order_id: customData.orderId,
      },
    };

    let capiResponseStatus = "logged_only";
    let metaApiResult: any = null;

    // 4. Dispatch to Meta Marketing API if Token and Pixel ID are configured
    if (pixelId && metaToken && isMetaActive) {
      try {
        const url = new URL(`https://graph.facebook.com/v21.0/${pixelId}/events`);
        url.searchParams.set("access_token", metaToken);

        const capiBody: any = {
          data: [serverEventPayload],
        };
        if (testEventCode) {
          capiBody.test_event_code = testEventCode;
        }

        const fbRes = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(capiBody),
        });

        metaApiResult = await fbRes.json();
        capiResponseStatus = fbRes.ok ? "dispatched" : "dispatch_error";
      } catch (postErr: any) {
        console.warn("Meta CAPI dispatch error:", postErr);
        capiResponseStatus = "network_error";
      }
    }

    // 5. Log in meta_events_log table
    try {
      const logId = `capi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await executeD1Query(
        "INSERT INTO meta_events_log (id, event_name, event_id, event_source, payload, status, created_at) VALUES (?, ?, ?, 'server_capi', ?, ?, CURRENT_TIMESTAMP)",
        [
          logId,
          eventName,
          effectiveEventId,
          JSON.stringify({
            customData,
            hasHashedPhone: Boolean(formattedUserData.ph),
            hasHashedEmail: Boolean(formattedUserData.em),
            metaApiResult,
          }),
          capiResponseStatus === "dispatched" ? "success" : capiResponseStatus,
        ]
      );
    } catch (logErr) {
      console.warn("Meta events log write error:", logErr);
    }

    return NextResponse.json({
      success: true,
      eventId: effectiveEventId,
      status: capiResponseStatus,
      pixelId,
      metaApiResult,
    });
  } catch (err: any) {
    console.error("Meta CAPI handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET endpoint to fetch recent event stream logs for Admin Diagnostic Monitor
export async function GET(req: NextRequest) {
  try {
    const rows = await executeD1Query<any>(
      "SELECT * FROM meta_events_log ORDER BY created_at DESC LIMIT 30"
    );
    return NextResponse.json({ success: true, events: rows || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

