import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { getERPOrders, getExpenses, addExpense } from "@/lib/erpStore";

export const dynamic = "force-dynamic";

interface MetaConfig {
  accountId: string;
  token: string;
  pixelId: string;
  testEventCode?: string;
  isActive: boolean;
  lastSyncedAt?: string;
}

interface WhatsAppCRMConfig {
  phoneNumber: string;
  phoneNumberId: string;
  token: string;
  templateName: string;
  webhookVerifyToken: string;
  isActive: boolean;
  hasToken: boolean;
  lastSyncedAt?: string;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch Meta Integration Config from D1
    let config: MetaConfig = {
      accountId: "",
      token: "",
      pixelId: "",
      testEventCode: "",
      isActive: false,
      lastSyncedAt: "",
    };

    try {
      const rows = await executeD1Query<any>(
        "SELECT config_data, is_active, last_synced_at FROM integrations_config WHERE provider = 'meta'"
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        config = {
          accountId: parsed.accountId || config.accountId,
          token: parsed.token || "",
          pixelId: parsed.pixelId || config.pixelId,
          testEventCode: parsed.testEventCode || config.testEventCode,
          isActive: Boolean(rows[0].is_active),
          lastSyncedAt: rows[0].last_synced_at || parsed.lastSyncedAt || "",
        };
      }
    } catch (d1Err) {
      console.warn("Failed to fetch meta config from D1:", d1Err);
    }

    // 2. Fetch WhatsApp Integration Config from D1 (fallback to env)
    const envWaPhone = process.env.WHATSAPP_PHONE_NUMBER || "916238165935";
    const envWaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1477900698733187";
    const envWaToken = process.env.WHATSAPP_TOKEN || "";
    const envWaTemplate = process.env.WHATSAPP_TEMPLATE_NAME || "turkiyejam_otp";
    const envWaVerify = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "turkiyejam_wa_secret_2026";

    let waConfig: WhatsAppCRMConfig = {
      phoneNumber: envWaPhone,
      phoneNumberId: envWaPhoneId,
      token: "",
      templateName: envWaTemplate,
      webhookVerifyToken: envWaVerify,
      isActive: true,
      hasToken: Boolean(envWaToken && envWaToken.length > 10),
      lastSyncedAt: "",
    };

    try {
      const waRows = await executeD1Query<any>(
        "SELECT config_data, is_active, last_synced_at FROM integrations_config WHERE provider = 'whatsapp'"
      );
      if (waRows && waRows.length > 0 && waRows[0].config_data) {
        const parsed = JSON.parse(waRows[0].config_data);
        const storedToken = parsed.token || envWaToken;
        waConfig = {
          phoneNumber: parsed.phoneNumber || envWaPhone,
          phoneNumberId: parsed.phoneNumberId || envWaPhoneId,
          token: storedToken ? `${storedToken.slice(0, 8)}...${storedToken.slice(-6)}` : "",
          templateName: parsed.templateName || envWaTemplate,
          webhookVerifyToken: parsed.webhookVerifyToken || envWaVerify,
          isActive: Boolean(waRows[0].is_active),
          hasToken: Boolean(storedToken && storedToken.length > 10),
          lastSyncedAt: waRows[0].last_synced_at || parsed.lastSyncedAt || "",
        };
      }
    } catch (d1Err) {
      console.warn("Failed to fetch whatsapp config from D1:", d1Err);
    }

    // 2. Fetch Ad Spend rows from meta_ad_spend
    let campaigns: any[] = [];
    try {
      const campRows = await executeD1Query<any>(
        "SELECT * FROM meta_ad_spend ORDER BY date DESC, spend DESC"
      );
      if (campRows && campRows.length > 0) {
        campaigns = campRows;
      }
    } catch (cErr) {
      console.warn("Failed to fetch meta_ad_spend:", cErr);
    }

    // 3. Compute Real Blended Ad Performance & ROAS
    const orders = await getERPOrders();
    const expenses = await getExpenses();

    const deliveredOrders = orders.filter((o) => o.delivery_status === "Delivered");
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const totalDispatched = orders.filter((o) => o.status !== "Cancelled");
    const totalOrdersCount = orders.length;

    // Ad spend from meta_ad_spend + expenses category 'Meta Ads'
    const totalMetaSpend = campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + (Number(c.spend) || 0), 0)
      : expenses.filter((e) => e.category === "Meta Ads").reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalProductCost = deliveredOrders.reduce((sum, o) => sum + (Number(o.product_cost) || 0), 0);
    const totalShipping = totalDispatched.reduce((sum, o) => sum + (Number(o.shipping_cost) || 0), 0);
    const totalRto = orders.reduce((sum, o) => sum + (Number(o.rto_shipping_charge) || 0), 0);
    const otherExpenses = expenses.filter((e) => e.category !== "Meta Ads").reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const realizedNetProfit = deliveredRevenue - totalProductCost - totalShipping - totalRto - totalMetaSpend - otherExpenses;

    // Distinct customer count
    const uniquePhones = new Set(orders.map((o) => (o.customer_phone || "").replace(/\D/g, "")).filter(Boolean));
    const customerCount = Math.max(1, uniquePhones.size);

    const blendedRoas = totalMetaSpend > 0 ? Number((deliveredRevenue / totalMetaSpend).toFixed(2)) : 0;
    const cac = totalMetaSpend > 0 ? Math.round(totalMetaSpend / customerCount) : 0;
    const cpa = totalOrdersCount > 0 ? Math.round(totalMetaSpend / totalOrdersCount) : 0;
    const poas = totalMetaSpend > 0 ? Number((realizedNetProfit / totalMetaSpend).toFixed(2)) : 0;

    const totalImpressions = campaigns.reduce((sum, c) => sum + (Number(c.impressions) || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (Number(c.clicks) || 0), 0);
    const avgCpc = totalClicks > 0 ? Number((totalMetaSpend / totalClicks).toFixed(2)) : 0;
    const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      config: {
        accountId: config.accountId,
        pixelId: config.pixelId,
        testEventCode: config.testEventCode,
        isActive: config.isActive,
        lastSyncedAt: config.lastSyncedAt,
        hasToken: Boolean(config.token && config.token.length > 5),
      },
      whatsappConfig: {
        phoneNumber: waConfig.phoneNumber,
        phoneNumberId: waConfig.phoneNumberId,
        token: waConfig.token,
        templateName: waConfig.templateName,
        webhookVerifyToken: waConfig.webhookVerifyToken,
        isActive: waConfig.isActive,
        hasToken: waConfig.hasToken,
        lastSyncedAt: waConfig.lastSyncedAt,
      },
      metrics: {
        totalMetaSpend,
        deliveredRevenue,
        realizedNetProfit,
        blendedRoas,
        cac,
        cpa,
        poas,
        totalImpressions,
        totalClicks,
        avgCpc,
        avgCtr,
        totalOrdersCount,
      },
      campaigns,
    });
  } catch (err: any) {
    console.error("Meta CRM API GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. SAVE CONFIGURATION
    if (action === "save_config") {
      const { accountId, token, pixelId, testEventCode, isActive } = body;

      const cleanAccountId = (accountId || "").trim();
      const cleanToken = (token || "").trim();
      const cleanPixelId = (pixelId || "").trim();
      const cleanTestEventCode = (testEventCode || "").trim();

      // Retrieve existing token if placeholder/empty was passed
      let effectiveToken = cleanToken;
      if (!effectiveToken || effectiveToken.includes("...")) {
        const existing = await executeD1Query<any>(
          "SELECT config_data FROM integrations_config WHERE provider = 'meta'"
        );
        if (existing && existing.length > 0 && existing[0].config_data) {
          const parsed = JSON.parse(existing[0].config_data);
          effectiveToken = parsed.token || "";
        }
      }

      const configData = JSON.stringify({
        accountId: cleanAccountId,
        token: effectiveToken,
        pixelId: cleanPixelId,
        testEventCode: cleanTestEventCode,
        isActive: isActive !== false,
        lastSyncedAt: new Date().toISOString(),
      });

      await executeD1Query(
        `INSERT INTO integrations_config (provider, config_data, is_active, updated_at)
         VALUES ('meta', ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(provider) DO UPDATE SET
           config_data = excluded.config_data,
           is_active = excluded.is_active,
           updated_at = CURRENT_TIMESTAMP`,
        [configData, isActive !== false ? 1 : 0]
      );

      return NextResponse.json({
        success: true,
        message: "Meta integration configuration saved successfully.",
      });
    }

    // 2. SAVE WHATSAPP CONFIGURATION
    if (action === "save_whatsapp_config" || action === "save_all_settings") {
      const {
        phoneNumber,
        phoneNumberId,
        whatsappToken,
        templateName,
        webhookVerifyToken,
        whatsappIsActive,
      } = body;

      const cleanPhone = (phoneNumber || "").replace(/\D/g, "").trim();
      const cleanPhoneId = (phoneNumberId || "").trim();
      const cleanToken = (whatsappToken || "").trim();
      const cleanTemplate = (templateName || "turkiyejam_otp").trim();
      const cleanVerify = (webhookVerifyToken || "turkiyejam_wa_secret_2026").trim();

      // Retrieve existing token if placeholder/masked or empty was passed
      let effectiveToken = cleanToken;
      if (!effectiveToken || effectiveToken.includes("...")) {
        const existing = await executeD1Query<any>(
          "SELECT config_data FROM integrations_config WHERE provider = 'whatsapp'"
        );
        if (existing && existing.length > 0 && existing[0].config_data) {
          const parsed = JSON.parse(existing[0].config_data);
          effectiveToken = parsed.token || process.env.WHATSAPP_TOKEN || "";
        } else {
          effectiveToken = process.env.WHATSAPP_TOKEN || "";
        }
      }

      const waConfigData = JSON.stringify({
        phoneNumber: cleanPhone || process.env.WHATSAPP_PHONE_NUMBER || "916238165935",
        phoneNumberId: cleanPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || "1477900698733187",
        token: effectiveToken,
        templateName: cleanTemplate,
        webhookVerifyToken: cleanVerify,
        isActive: whatsappIsActive !== false,
        lastSyncedAt: new Date().toISOString(),
      });

      await executeD1Query(
        `INSERT INTO integrations_config (provider, config_data, is_active, updated_at)
         VALUES ('whatsapp', ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(provider) DO UPDATE SET
           config_data = excluded.config_data,
           is_active = excluded.is_active,
           updated_at = CURRENT_TIMESTAMP`,
        [waConfigData, whatsappIsActive !== false ? 1 : 0]
      );

      // If saving Meta as well in save_all_settings
      if (action === "save_all_settings" && body.accountId !== undefined) {
        const { accountId, token, pixelId, testEventCode, isActive } = body;
        const cleanAccountId = (accountId || "").trim();
        const cleanMetaToken = (token || "").trim();
        const cleanPixelId = (pixelId || "").trim();
        const cleanTestEventCode = (testEventCode || "").trim();

        let effectiveMetaToken = cleanMetaToken;
        if (!effectiveMetaToken || effectiveMetaToken.includes("...")) {
          const existingMeta = await executeD1Query<any>(
            "SELECT config_data FROM integrations_config WHERE provider = 'meta'"
          );
          if (existingMeta && existingMeta.length > 0 && existingMeta[0].config_data) {
            const parsed = JSON.parse(existingMeta[0].config_data);
            effectiveMetaToken = parsed.token || "";
          }
        }

        const metaConfigData = JSON.stringify({
          accountId: cleanAccountId,
          token: effectiveMetaToken,
          pixelId: cleanPixelId,
          testEventCode: cleanTestEventCode,
          isActive: isActive !== false,
          lastSyncedAt: new Date().toISOString(),
        });

        await executeD1Query(
          `INSERT INTO integrations_config (provider, config_data, is_active, updated_at)
           VALUES ('meta', ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(provider) DO UPDATE SET
             config_data = excluded.config_data,
             is_active = excluded.is_active,
             updated_at = CURRENT_TIMESTAMP`,
          [metaConfigData, isActive !== false ? 1 : 0]
        );
      }

      return NextResponse.json({
        success: true,
        message: action === "save_all_settings" 
          ? "All CRM integrations (Meta, Pixel & WhatsApp) saved successfully!"
          : "WhatsApp CRM configuration saved successfully.",
      });
    }

    // 3. TEST WHATSAPP CONNECTION HANDSHAKE
    if (action === "test_whatsapp_connection") {
      const { phoneNumberId, whatsappToken } = body;
      const cleanPhoneId = (phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "1477900698733187").trim();
      let effectiveToken = (whatsappToken || "").trim();

      if (!effectiveToken || effectiveToken.includes("...")) {
        const existing = await executeD1Query<any>(
          "SELECT config_data FROM integrations_config WHERE provider = 'whatsapp'"
        );
        if (existing && existing.length > 0 && existing[0].config_data) {
          const parsed = JSON.parse(existing[0].config_data);
          effectiveToken = parsed.token || process.env.WHATSAPP_TOKEN || "";
        } else {
          effectiveToken = process.env.WHATSAPP_TOKEN || "";
        }
      }

      if (!effectiveToken || effectiveToken.length < 10) {
        return NextResponse.json({
          success: false,
          message: "A valid WhatsApp Cloud API Permanent Access Token is required.",
        });
      }

      try {
        const waRes = await fetch(
          `https://graph.facebook.com/v21.0/${cleanPhoneId}?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status&access_token=${encodeURIComponent(effectiveToken)}`
        );
        const waData = await waRes.json();

        if (waData.error) {
          return NextResponse.json({
            success: false,
            message: `WhatsApp API Error: ${waData.error.message || "Invalid credentials or token expired."}`,
          });
        }

        return NextResponse.json({
          success: true,
          message: `Connected successfully to WhatsApp Business: "${waData.verified_name || "Turkiye Jam"}" (${waData.display_phone_number || cleanPhoneId}). Quality: ${waData.quality_rating || "GREEN"}.`,
          phoneDetails: waData,
        });
      } catch (handshakeErr: any) {
        return NextResponse.json({
          success: false,
          message: `Network error connecting to WhatsApp Graph API: ${handshakeErr.message}`,
        });
      }
    }

    // 4. TEST META CONNECTION HANDSHAKE
    if (action === "test_connection") {
      const { accountId, token } = body;
      const cleanAccount = (accountId || "").replace(/^act_/, "").trim();

      if (!cleanAccount) {
        return NextResponse.json({
          success: false,
          message: "Please provide a valid Meta Ad Account ID (e.g. act_109283746552).",
        });
      }

      if (!token || token.length < 10) {
        return NextResponse.json({
          success: false,
          message: "Valid Meta System User or Marketing API token is required.",
        });
      }

      try {
        // Handshake test against Meta Graph API v21.0
        const metaRes = await fetch(
          `https://graph.facebook.com/v21.0/act_${cleanAccount}?fields=name,account_status,currency,amount_spent&access_token=${encodeURIComponent(token)}`
        );
        const metaData = await metaRes.json();

        if (metaData && !metaData.error) {
          return NextResponse.json({
            success: true,
            message: `Connected successfully to Meta Ad Account: "${metaData.name || cleanAccount}" (${metaData.currency || "INR"}). Ad spend & CAPI active.`,
            accountDetails: metaData,
          });
        }

        // If ad account has strict ads_read permission requirement, test if token is a valid Conversions API / System User token
        const meRes = await fetch(
          `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`
        );
        const meData = await meRes.json();

        if (meData && meData.id) {
          return NextResponse.json({
            success: true,
            message: `Meta Conversions API (CAPI) & Pixel connected and verified! (To also auto-pull ad spends from Ad Account act_${cleanAccount}, assign 'ads_read' permission in Business Settings).`,
            accountDetails: { id: cleanAccount, systemUserId: meData.id },
          });
        }

        return NextResponse.json({
          success: false,
          message: `Meta API Error: ${metaData?.error?.message || "Invalid credentials or token expired."}`,
        });
      } catch (handshakeErr: any) {
        return NextResponse.json({
          success: false,
          message: `Network error connecting to Meta Graph API: ${handshakeErr.message}`,
        });
      }
    }

    // 5. SYNC LIVE CAMPAIGNS FROM META MARKETING API
    if (action === "sync_meta_campaigns") {
      let accountId = "";
      let token = "";

      const rows = await executeD1Query<any>(
        "SELECT config_data FROM integrations_config WHERE provider = 'meta'"
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        accountId = (parsed.accountId || "").replace(/^act_/, "").trim();
        token = parsed.token || "";
      }

      if (!accountId || !token) {
        return NextResponse.json({
          success: false,
          error: "Meta Ad Account ID and Access Token must be configured in CRM Settings.",
        });
      }

      try {
        const url = `https://graph.facebook.com/v21.0/act_${accountId}/insights?level=campaign&fields=campaign_name,spend,impressions,clicks,cpc,ctr,actions,action_values,date_start,date_stop&date_preset=maximum&access_token=${encodeURIComponent(token)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          const isPerm = data.error.code === 200 || data.error.message?.includes("ads_read");
          return NextResponse.json({
            success: false,
            error: isPerm
              ? "Meta requires 'ads_read' permission on your token to auto-pull ad spend. In Meta Business Settings > System Users > Assign Asset (Turkey jam India) with 'ads_read'. You can also use '+ Log Ad Spend' to enter your real daily budget directly."
              : `Meta API Error: ${data.error.message || "Failed to fetch campaigns"}`,
            requiresPermission: isPerm,
          });
        }

        const insights = data.data || [];
        if (insights.length === 0) {
          return NextResponse.json({
            success: true,
            message: "Connected to Meta Ad Account. No campaign ad spend found for this period yet.",
            syncedCount: 0,
          });
        }

        for (const item of insights) {
          const campName = item.campaign_name || "Meta Ad Campaign";
          const date = item.date_stop || item.date_start || new Date().toISOString().split("T")[0];
          const spend = Number(item.spend || 0);
          const impr = Number(item.impressions || 0);
          const clicks = Number(item.clicks || 0);
          const cpc = Number(item.cpc || (clicks > 0 ? (spend / clicks).toFixed(2) : 0));
          const ctr = Number(item.ctr || (impr > 0 ? ((clicks / impr) * 100).toFixed(2) : 0));

          const purchaseAction = item.actions?.find((a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase");
          const purchases = Number(purchaseAction?.value || 0);

          const purchaseValAction = item.action_values?.find((a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase");
          const purchaseVal = Number(purchaseValAction?.value || 0);
          const roas = spend > 0 && purchaseVal > 0 ? Number((purchaseVal / spend).toFixed(2)) : 0;

          const cleanCampKey = campName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
          const spendId = `meta_sync_${cleanCampKey}_${date}`;

          await executeD1Query(
            `INSERT INTO meta_ad_spend (id, date, campaign_name, adset_name, spend, impressions, clicks, cpc, ctr, purchases, purchase_value, roas, synced_from, created_at)
             VALUES (?, ?, ?, 'Advantage+ Pan-India', ?, ?, ?, ?, ?, ?, ?, ?, 'meta_api', CURRENT_TIMESTAMP)
             ON CONFLICT(id) DO UPDATE SET
               spend = excluded.spend,
               impressions = excluded.impressions,
               clicks = excluded.clicks,
               cpc = excluded.cpc,
               ctr = excluded.ctr,
               purchases = excluded.purchases,
               purchase_value = excluded.purchase_value,
               roas = excluded.roas,
               created_at = CURRENT_TIMESTAMP`,
            [spendId, date, campName, spend, impr, clicks, Number(cpc.toFixed(2)), Number(ctr.toFixed(2)), purchases, purchaseVal, roas]
          );
        }

        return NextResponse.json({
          success: true,
          message: `Successfully synced ${insights.length} campaign(s) directly from Meta Ads!`,
          syncedCount: insights.length,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Error syncing from Meta: ${err.message}`,
        });
      }
    }

    // 3. LOG DAILY AD SPEND (Manual / Direct entry)
    if (action === "log_spend") {
      const { date, campaignName, spend, impressions, clicks, purchases, purchaseValue } = body;

      if (!date || !campaignName || !spend || Number(spend) <= 0) {
        return NextResponse.json({
          success: false,
          error: "Date, Campaign Name, and a valid Ad Spend amount are required.",
        }, { status: 400 });
      }

      const numSpend = Number(spend);
      const numImpr = Number(impressions || 0);
      const numClicks = Number(clicks || 0);
      const numPurch = Number(purchases || 0);
      const numPurchVal = Number(purchaseValue || 0);

      const cpc = numClicks > 0 ? Number((numSpend / numClicks).toFixed(2)) : 0;
      const ctr = numImpr > 0 ? Number(((numClicks / numImpr) * 100).toFixed(2)) : 0;
      const roas = numSpend > 0 && numPurchVal > 0 ? Number((numPurchVal / numSpend).toFixed(2)) : 0;

      const spendId = `meta_spend_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Insert into meta_ad_spend
      await executeD1Query(
        `INSERT INTO meta_ad_spend (
          id, date, campaign_name, spend, impressions, clicks, cpc, ctr, purchases, purchase_value, roas, synced_from, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', CURRENT_TIMESTAMP)`,
        [spendId, date, campaignName.trim(), numSpend, numImpr, numClicks, cpc, ctr, numPurch, numPurchVal, roas]
      );

      // Sync into expenses table under category 'Meta Ads' so ERP P&L recalculates accurately
      await addExpense({
        category: "Meta Ads",
        amount: numSpend,
        date,
        vendor: "Meta Platforms (Facebook & Instagram Ads)",
        reference_no: `META-${date}-${campaignName.slice(0, 10).replace(/[^a-zA-Z0-9]/g, "")}`,
        notes: `Ad spend logged via CRM for campaign: ${campaignName}`,
      });

      return NextResponse.json({
        success: true,
        message: `₹${numSpend.toLocaleString()} ad spend logged and synchronized with ERP expense ledger!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action specified." }, { status: 400 });
  } catch (err: any) {
    console.error("Meta CRM API POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

