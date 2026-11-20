import { NextRequest, NextResponse } from "next/server";
import { getEffectiveWhatsAppCredentials } from "@/lib/whatsappOtp";

export const dynamic = "force-dynamic";

/**
 * WhatsApp Diagnostic Test Endpoint
 * 
 * Usage: GET /api/whatsapp-test?phone=919876543210
 * 
 * This sends a simple text message AND tries the OTP template to your phone
 * and returns the EXACT response from Meta's API so we can see what's wrong.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.replace(/\D/g, "") || "";

  if (!phone || phone.length < 10) {
    return NextResponse.json({
      error: "Please provide a valid phone number. Example: /api/whatsapp-test?phone=919876543210",
    }, { status: 400 });
  }

  // Normalize: if 10 digits, prepend 91 (India)
  const digits = phone.length === 10 ? `91${phone}` : phone;

  const { token: waToken, phoneId: waPhoneId, templateName, lang: configuredLang } = await getEffectiveWhatsAppCredentials();
  const apiUrl = `https://graph.facebook.com/v21.0/${waPhoneId}/messages`;

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    recipient: digits,
    phone_id_used: waPhoneId || "(EMPTY)",
    token_configured: Boolean(waToken && waToken.length > 10),
    token_preview: waToken ? `${waToken.substring(0, 15)}...${waToken.slice(-6)}` : "(EMPTY)",
    api_url: apiUrl,
    template_name: templateName,
    tests: {},
  };

  // ========== TEST 1: Simple text message ==========
  try {
    const textPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: digits,
      type: "text",
      text: {
        preview_url: false,
        body: "🧪 Turkiye Jam WhatsApp Test\n\nIf you received this message, WhatsApp messaging is working correctly!\n\nTimestamp: " + new Date().toISOString(),
      },
    };

    const textRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textPayload),
    });

    const textData = await textRes.json();
    results.tests.simple_text = {
      status: textRes.status,
      ok: textRes.ok,
      response: textData,
      payload_sent: textPayload,
    };
  } catch (err: any) {
    results.tests.simple_text = { error: err.message };
  }

  // ========== TEST 2: Check token validity (get phone number info) ==========
  try {
    const phoneInfoUrl = `https://graph.facebook.com/v21.0/${waPhoneId}`;
    const phoneInfoRes = await fetch(phoneInfoUrl, {
      headers: { Authorization: `Bearer ${waToken}` },
    });
    const phoneInfoData = await phoneInfoRes.json();
    results.tests.phone_number_info = {
      status: phoneInfoRes.status,
      ok: phoneInfoRes.ok,
      response: phoneInfoData,
    };
  } catch (err: any) {
    results.tests.phone_number_info = { error: err.message };
  }

  // ========== TEST 3: List message templates ==========
  try {
    // First get the WABA ID from the phone number
    const wabaUrl = `https://graph.facebook.com/v21.0/${waPhoneId}?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier`;
    const wabaRes = await fetch(wabaUrl, {
      headers: { Authorization: `Bearer ${waToken}` },
    });
    const wabaData = await wabaRes.json();
    results.tests.waba_info = {
      status: wabaRes.status,
      ok: wabaRes.ok,
      response: wabaData,
    };
  } catch (err: any) {
    results.tests.waba_info = { error: err.message };
  }

  // ========== TEST 4: Try vittallifestyle_otp template ==========
  try {
    const testOtp = "123456";
    const templatePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: digits,
      type: "template",
      template: {
        name: templateName,
        language: { code: configuredLang || "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: testOtp }],
          },
          {
            type: "button",
            sub_type: "copy_code",
            index: "0",
            parameters: [{ type: "coupon_code", coupon_code: testOtp }],
          },
        ],
      },
    };

    const tplRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templatePayload),
    });

    const tplData = await tplRes.json();
    results.tests.template_otp = {
      status: tplRes.status,
      ok: tplRes.ok,
      response: tplData,
      payload_sent: templatePayload,
    };
  } catch (err: any) {
    results.tests.template_otp = { error: err.message };
  }

  // ========== TEST 5: Try hello_world template (Meta's default, always exists) ==========
  try {
    const helloPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: digits,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" },
      },
    };

    const helloRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(helloPayload),
    });

    const helloData = await helloRes.json();
    results.tests.template_hello_world = {
      status: helloRes.status,
      ok: helloRes.ok,
      response: helloData,
      payload_sent: helloPayload,
    };
  } catch (err: any) {
    results.tests.template_hello_world = { error: err.message };
  }

  // ========== DIAGNOSIS ==========
  const diagnosis: string[] = [];

  // Check token
  if (results.tests.phone_number_info?.status === 401 || results.tests.phone_number_info?.response?.error) {
    diagnosis.push("❌ TOKEN PROBLEM: The WhatsApp token appears invalid or expired. You need to regenerate it from Meta Business Manager > WhatsApp > API Setup.");
  }

  // Check phone number info
  if (results.tests.phone_number_info?.ok) {
    diagnosis.push("✅ Token is valid and phone_id is accessible.");
  }

  // Check simple text
  if (results.tests.simple_text?.ok) {
    diagnosis.push("✅ Simple text message accepted by Meta API.");
  } else if (results.tests.simple_text?.response?.error?.code === 131030) {
    diagnosis.push("❌ RECIPIENT NOT IN 24H WINDOW: The recipient hasn't messaged your business number in the last 24 hours. Only template messages can be sent outside this window.");
  } else if (results.tests.simple_text?.response?.error) {
    diagnosis.push(`❌ Text message failed: ${results.tests.simple_text.response.error.message} (code: ${results.tests.simple_text.response.error.code})`);
  }

  // Check hello_world template
  if (results.tests.template_hello_world?.ok) {
    diagnosis.push("✅ hello_world template sent successfully.");
  } else if (results.tests.template_hello_world?.response?.error) {
    diagnosis.push(`❌ hello_world template failed: ${results.tests.template_hello_world.response.error.message}`);
  }

  // Check template_otp
  if (results.tests.template_otp?.ok) {
    diagnosis.push(`✅ ${templateName} template sent successfully.`);
  } else if (results.tests.template_otp?.response?.error?.code === 132001) {
    diagnosis.push(`❌ ${templateName} template DOES NOT EXIST or is not approved yet in Meta Business Manager.`);
  } else if (results.tests.template_otp?.response?.error) {
    diagnosis.push(`⚠️ ${templateName} template issue: ${results.tests.template_otp.response.error.message} (code: ${results.tests.template_otp.response.error.code})`);
  }

  // Self-send check
  if (digits === "919747195000" || digits === "9747195000") {
    diagnosis.push("⚠️ WARNING: You are trying to send a message TO THE SAME NUMBER as your WhatsApp Business Account. Meta does NOT allow a business to send messages to its own number. Use a DIFFERENT phone number for testing!");
  }

  results.diagnosis = diagnosis;

  return NextResponse.json(results, { status: 200 });
}
