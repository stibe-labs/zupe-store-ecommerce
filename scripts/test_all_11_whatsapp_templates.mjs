import fetch from "node-fetch";

const WA_TOKEN =
  process.env.WHATSAPP_TOKEN ||
  "EAAY6t7MlMOIBSgAfMGRZAJsIudRT1lMXiZARDnHSvqKZAr5ZArjs6htxGbGBlnE1ZCAOvQiOM069AgyzkuZB4UAtMveTfv6gu3Ik2A3nbQDaRIkWB7yuZACwVNS2eDELePKcOJRRnjE3Nx2m728wvYld1VZCMN05fulca3ZA5COTRZB82a9AZAfsAFyrS2XP41f6dRVygZDZD";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1434769426379176";
const TARGET_PHONE = "918089732385"; // Recipient: 8089732385

async function main() {
  console.log("=================================================================");
  console.log("    ZUPE STORE — VERIFY & TEST ALL 11 WHATSAPP TEMPLATES");
  console.log("    Recipient: +" + TARGET_PHONE);
  console.log("    Phone ID:  " + WA_PHONE_ID);
  console.log("=================================================================\n");

  // Step 1: Verify Phone Number & Get WABA ID
  console.log("▶ Step 1: Checking WhatsApp Business Account & Phone ID...");
  const phoneRes = await fetch(
    `https://graph.facebook.com/v21.0/${WA_PHONE_ID}?fields=id,display_phone_number,verified_name,quality_rating`,
    {
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
    }
  );
  const phoneData = await phoneRes.json();
  if (!phoneRes.ok) {
    console.error("❌ Failed to query phone info:", phoneData);
    process.exit(1);
  }
  console.log("   Phone Number:", phoneData.display_phone_number);
  console.log("   Verified Name:", phoneData.verified_name);
  console.log("   Quality Rating:", phoneData.quality_rating);
  const wabaId = phoneData.whatsapp_business_account?.id;
  console.log("   WABA ID:", wabaId || "Not directly linked");

  // Step 2: Fetch all templates from Meta
  let metaTemplates = [];
  if (wabaId) {
    console.log("\n▶ Step 2: Fetching Approved Templates from Meta Business Manager...");
    const tplRes = await fetch(
      `https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`,
      {
        headers: { Authorization: `Bearer ${WA_TOKEN}` },
      }
    );
    const tplData = await tplRes.json();
    if (tplRes.ok && tplData.data) {
      metaTemplates = tplData.data;
      console.log(`   Found ${metaTemplates.length} total templates in Meta Business Manager:\n`);
      for (const t of metaTemplates) {
        console.log(
          `   • ${t.name.padEnd(32)} | Status: ${t.status.padEnd(10)} | Category: ${t.category.padEnd(14)} | Lang: ${t.language}`
        );
      }
    } else {
      console.warn("   ⚠️ Could not list templates:", tplData?.error?.message || tplData);
    }
  }

  // Step 3: Test each of the 11 templates
  console.log("\n▶ Step 3: Dispatching All 11 Templates to +" + TARGET_PHONE + "...\n");

  const results = [];

  // 1. zupe_order_verify
  await testTemplate({
    num: 1,
    name: "zupe_order_verify",
    desc: "Order Placed — Confirmation / Cancellation Request",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_order_verify",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "#1054" },
              { type: "text", text: "Mini Portable Steam Iron" },
              { type: "text", text: "668" },
              { type: "text", text: "10" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "tok_test_sample_token" }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "1",
            parameters: [{ type: "text", text: "1054" }],
          },
        ],
      },
    },
    results,
  });

  // 2. zupe_cod_switch_prepaid
  await testTemplate({
    num: 2,
    name: "zupe_cod_switch_prepaid",
    desc: "COD Order — Switch to Prepaid Discount Offer (Save ₹30)",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_cod_switch_prepaid",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "1054" },
              { type: "text", text: "668" },
              { type: "text", text: "638" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "1054" }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "1",
            parameters: [{ type: "text", text: "1054" }],
          },
        ],
      },
    },
    results,
  });

  // 3. zupe_payment_successful
  await testTemplate({
    num: 3,
    name: "zupe_payment_successful",
    desc: "Prepaid Order — Payment Confirmed & Receipt",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_payment_successful",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "1054" },
              { type: "text", text: "469" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "1054" }],
          },
        ],
      },
    },
    results,
  });

  // 4. zupe_abandoned_cart
  await testTemplate({
    num: 4,
    name: "zupe_abandoned_cart",
    desc: "Abandoned Cart Recovery",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_abandoned_cart",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "Mini Portable Steam Iron" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "cart_rec_tok_123" }],
          },
        ],
      },
    },
    results,
  });

  // 5. zupe_order_shipped
  await testTemplate({
    num: 5,
    name: "zupe_order_shipped",
    desc: "Order Shipped — Courier & Tracking Details",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_order_shipped",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "#1054" },
              { type: "text", text: "BlueDart Express" },
              { type: "text", text: "1425893021" },
              { type: "text", text: "https://zupestore.in/order-tracking?awb=1425893021" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "1425893021" }],
          },
        ],
      },
    },
    results,
  });

  // 6. zupe_out_for_delivery
  await testTemplate({
    num: 6,
    name: "zupe_out_for_delivery",
    desc: "Order Out for Delivery (OFD)",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_out_for_delivery",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "1054" },
              { type: "text", text: "668" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "1054" }],
          },
        ],
      },
    },
    results,
  });

  // 7. zupe_delivery_attempt_failed
  await testTemplate({
    num: 7,
    name: "zupe_delivery_attempt_failed",
    desc: "Delivery Attempt Failed (NDR Customer Prompt)",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_delivery_attempt_failed",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "1054" },
              { type: "text", text: "Mini Portable Steam Iron" },
            ],
          },
        ],
      },
    },
    results,
  });

  // 8. zupe_order_delivered_feedback
  await testTemplate({
    num: 8,
    name: "zupe_order_delivered_feedback",
    desc: "Order Delivered — Customer Feedback & Review",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_order_delivered_feedback",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "Mini Portable Steam Iron" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "mini-portable-steam-iron#reviews" }],
          },
        ],
      },
    },
    results,
  });

  // 9. zupe_order_cancelled
  await testTemplate({
    num: 9,
    name: "zupe_order_cancelled",
    desc: "Order Cancelled Notification",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_order_cancelled",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "1054" },
              { type: "text", text: "Mini Portable Steam Iron" },
              { type: "text", text: "678" },
              {
                type: "text",
                text: "If prepaid, your refund has been initiated to your original payment method.",
              },
            ],
          },
        ],
      },
    },
    results,
  });

  // 10. zupe_refund_update
  await testTemplate({
    num: 10,
    name: "zupe_refund_update",
    desc: "Refund Status Update",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_refund_update",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Rahul" },
              { type: "text", text: "1054" },
              { type: "text", text: "678" },
              { type: "text", text: "Refunded to original payment method (Processed)" },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "1054" }],
          },
        ],
      },
    },
    results,
  });

  // 11. zupe_login_otp
  await testTemplate({
    num: 11,
    name: "zupe_login_otp",
    desc: "Customer Login Authentication OTP",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "zupe_login_otp",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: "582910" }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "582910" }],
          },
        ],
      },
    },
    // If auth template uses copy_code button, fallback handler will automatically try:
    authFallback: {
      name: "zupe_login_otp",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: "582910" }],
        },
        {
          type: "button",
          sub_type: "copy_code",
          index: "0",
          parameters: [{ type: "coupon_code", coupon_code: "582910" }],
        },
      ],
    },
    results,
  });

  // Summary Table
  console.log("\n=================================================================");
  console.log("                  FINAL TEST RESULTS SUMMARY                     ");
  console.log("=================================================================");
  let passedCount = 0;
  for (const r of results) {
    const icon = r.success ? "✅ PASS" : "❌ FAIL";
    if (r.success) passedCount++;
    console.log(
      `${icon.padEnd(8)} | #${String(r.num).padStart(2)} ${r.name.padEnd(30)} | ID: ${
        r.messageId ? r.messageId.slice(0, 24) + "..." : "NONE"
      }`
    );
    if (!r.success) {
      console.log(`         Error: ${r.error}`);
    }
  }
  console.log("=================================================================");
  console.log(`Total: ${passedCount} / ${results.length} templates delivered successfully!`);
  console.log("=================================================================\n");
}

async function testTemplate({ num, name, desc, payload, authFallback, results }) {
  const apiUrl = `https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`;
  process.stdout.write(`[${String(num).padStart(2)}/11] Sending '${name}' (${desc})... `);

  try {
    let res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data = await res.json();

    // If failed and authFallback provided (e.g. For zupe_login_otp copy_code vs url button)
    if (!res.ok && authFallback) {
      const retryPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: TARGET_PHONE,
        type: "template",
        template: authFallback,
      };
      const resRetry = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(retryPayload),
      });
      const dataRetry = await resRetry.json();
      if (resRetry.ok && dataRetry.messages?.length > 0) {
        res = resRetry;
        data = dataRetry;
      }
    }

    if (res.ok && data.messages?.length > 0) {
      const msgId = data.messages[0].id;
      console.log(`✅ SUCCESS! (Message ID: ${msgId})`);
      results.push({ num, name, success: true, messageId: msgId, response: data });
    } else {
      const errMsg = data?.error?.message || JSON.stringify(data);
      console.log(`❌ FAILED! ${errMsg}`);
      results.push({ num, name, success: false, error: errMsg, response: data });
    }
  } catch (err) {
    console.log(`❌ ERROR! ${err.message}`);
    results.push({ num, name, success: false, error: err.message });
  }

  // Small 500ms delay between dispatches so Meta API rate limiter stays smooth
  await new Promise((r) => setTimeout(r, 600));
}

main().catch(console.error);
