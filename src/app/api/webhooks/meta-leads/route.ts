import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "turkiyejam_meta_secret_2026";

// Meta Webhook Verification (Challenge Handshake)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && (token === VERIFY_TOKEN || token === "turkiyejam_wa_secret_2026")) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden: Invalid verify token" }, { status: 403 });
}

// Meta Instant Form Lead Ingestion Webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify Meta entry structure
    if (body.object === "page" && Array.isArray(body.entry)) {
      // 1. Fetch active Meta Access Token from integrations_config
      let metaToken = process.env.META_ACCESS_TOKEN || "";
      try {
        const rows = await executeD1Query<any>(
          "SELECT config_data FROM integrations_config WHERE provider = 'meta'"
        );
        if (rows && rows.length > 0 && rows[0].config_data) {
          const parsed = JSON.parse(rows[0].config_data);
          metaToken = parsed.token || metaToken;
        }
      } catch {}

      for (const entry of body.entry) {
        if (!Array.isArray(entry.changes)) continue;

        for (const change of entry.changes) {
          if (change.field === "leadgen" && change.value?.leadgen_id) {
            const leadgenId = change.value.leadgen_id;
            const formId = change.value.form_id || "";
            const adId = change.value.ad_id || "";

            let customerName = "Meta Lead";
            let customerPhone = "";
            let customerEmail = "";
            let userAnswers: Record<string, string> = {};

            // Fetch actual lead details from Meta Graph API
            if (metaToken) {
              try {
                const graphRes = await fetch(
                  `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${encodeURIComponent(metaToken)}`
                );
                const leadData = await graphRes.json();

                if (leadData && Array.isArray(leadData.field_data)) {
                  for (const field of leadData.field_data) {
                    const fName = (field.name || "").toLowerCase();
                    const val = Array.isArray(field.values) ? field.values[0] : field.values;
                    if (fName.includes("name")) customerName = val;
                    else if (fName.includes("phone")) customerPhone = val;
                    else if (fName.includes("email")) customerEmail = val;
                    else userAnswers[field.name] = val;
                  }
                }
              } catch (graphErr) {
                console.warn("Failed to fetch leadgen from Meta Graph API:", graphErr);
              }
            }

            if (!customerPhone) {
              customerPhone = `meta_${leadgenId}`;
            }

            const cleanPhone = customerPhone.replace(/\D/g, "");
            const leadId = `lead_meta_${leadgenId}`;
            const tags = JSON.stringify(["meta_ads", "instant_form", formId ? `form_${formId}` : ""].filter(Boolean));
            const notes = `Meta Instant Form Lead. Ad ID: ${adId || "N/A"}. Extra: ${JSON.stringify(userAnswers)}`;

            await executeD1Query(
              `INSERT INTO crm_leads (
                id, name, phone, email, source, status, temperature, potential_value, tags, notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, 'meta_ads', 'new', 'hot', 899, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                phone = excluded.phone,
                email = excluded.email,
                notes = excluded.notes,
                updated_at = CURRENT_TIMESTAMP`,
              [leadId, customerName, cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`, customerEmail, tags, notes]
            );

            // Real-time WhatsApp Notification to Admin (+91 7356765036)
            try {
              const { notifyAdminMetaLead } = await import("@/lib/adminNotification");
              await notifyAdminMetaLead({
                customerName,
                customerPhone: cleanPhone,
                customerEmail,
                source: "Meta Instant Form",
                notes,
              });
            } catch (notifErr) {
              console.warn("Failed to dispatch Meta lead admin WhatsApp alert:", notifErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Meta lead received" });
  } catch (err: any) {
    console.error("Meta leads webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

