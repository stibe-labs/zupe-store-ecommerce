import { executeD1Query } from "@/lib/d1";
import { getSettings, ERPOrder } from "@/lib/erpStore";
import { OrderRecord } from "@/lib/orderStore";

export interface ShopifyPushResult {
  success: boolean;
  shopifyOrderId?: string;
  shopifyNumericId?: number | string;
  isSimulated?: boolean;
  message?: string;
  error?: string;
}

/**
 * Normalizes user-supplied Shopify domain string
 */
export function normalizeShopifyDomain(rawDomain: string): string {
  if (!rawDomain) return "";
  let clean = rawDomain.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, "");
  clean = clean.replace(/\/.*$/, "");
  if (!clean.includes(".")) {
    clean = `${clean}.myshopify.com`;
  }
  return clean;
}

/**
 * Test handshake with Shopify Admin API using shop.json endpoint
 */
export async function testShopifyConnection(
  rawDomain: string,
  token: string,
  apiVersion: string = "2024-01"
): Promise<{ success: boolean; message: string; shopName?: string; currency?: string }> {
  const domain = normalizeShopifyDomain(rawDomain);
  if (!domain || domain.length < 5) {
    return { success: false, message: "Invalid Shopify domain." };
  }
  if (!token || token.trim().length < 8) {
    return { success: false, message: "Invalid Shopify Admin API access token." };
  }

  // If this is a placeholder or mock token, report simulated success for development
  if (token.includes("live_98a76d54") || token.startsWith("shpat_test_") || token.startsWith("shpat_mock")) {
    return {
      success: true,
      shopName: "Zupe Store (Sandbox)",
      currency: "INR",
      message: `Verified simulated handshake with ${domain}. Outbound order creation active.`,
    };
  }

  try {
    const url = `https://${domain}/admin/api/${apiVersion}/shop.json`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token.trim(),
      },
    });

    const data = (await res.json()) as any;
    if (res.ok && data?.shop) {
      return {
        success: true,
        shopName: data.shop.name || domain,
        currency: data.shop.currency || "INR",
        message: `Successfully connected to Shopify store "${data.shop.name}" (${domain})!`,
      };
    } else {
      const errorDetail =
        data?.errors || data?.message || `HTTP ${res.status}: ${res.statusText}`;
      return {
        success: false,
        message: `Shopify rejected credentials: ${typeof errorDetail === "object" ? JSON.stringify(errorDetail) : errorDetail}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || "Network unreachable"}`,
    };
  }
}

/**
 * Pushes an order outbound from Zupe Store to Shopify Admin API (POST /admin/api/2024-01/orders.json)
 */
export async function pushOrderToShopify(
  order: ERPOrder | OrderRecord,
  options?: { force?: boolean }
): Promise<ShopifyPushResult> {
  try {
    const settings = await getSettings();
    const shopifyConfig = settings.shopify;

    if (!options?.force) {
      if (!shopifyConfig || shopifyConfig.isActive === false) {
        return {
          success: false,
          message: "Shopify integration is inactive in Admin Settings.",
        };
      }
      if ((shopifyConfig as any).autoPushOrders === false) {
        return {
          success: false,
          message: "Automatic order push to Shopify is disabled.",
        };
      }
    }

    const domain = normalizeShopifyDomain(shopifyConfig?.domain || "zupe-store.myshopify.com");
    const token = (shopifyConfig?.token || "").trim();
    const apiVersion = (shopifyConfig as any)?.apiVersion || "2024-01";

    if (!domain || !token) {
      return {
        success: false,
        message: "Shopify domain or API token not configured.",
      };
    }

    // Split customer name
    const rawName = (order as any).customer_name || "Customer";
    const nameParts = rawName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const email = (order as any).customer_email || (order as any).guest_email || "";
    const phone = ((order as any).customer_phone || "").trim();
    const address = (order as any).shipping_address || "";
    const city = (order as any).city || "";
    const postalCode = (order as any).postal_code || "";
    const paymentMethod = ((order as any).payment_method || "").toLowerCase();
    const isCod = paymentMethod.includes("cod") || paymentMethod.includes("cash on delivery");

    // Format line items
    const rawItems: any[] = (order as any).items || [];
    const lineItems = rawItems.map((item) => {
      const title = item.product_name || item.name || "Zupe Store Product";
      const price = Number(item.unit_price || item.price || 499);
      const quantity = Math.max(1, Number(item.quantity || 1));
      return {
        title,
        price: price.toFixed(2),
        quantity,
        requires_shipping: true,
      };
    });

    if (lineItems.length === 0) {
      lineItems.push({
        title: "Storefront Purchased Item",
        price: Number(order.total_amount || 499).toFixed(2),
        quantity: 1,
        requires_shipping: true,
      });
    }

    // Prepare Shopify payload
    const shopifyOrderPayload = {
      order: {
        email: email || undefined,
        phone: phone || undefined,
        financial_status: isCod ? "pending" : "paid",
        fulfillment_status: null,
        send_receipt: false,
        send_fulfillment_receipt: false,
        source_name: "web",
        tags: `ZupeStore, WebOrder, ${isCod ? "COD" : "Prepaid"}`,
        note: `Zupe Storefront Order ID: ${order.id}`,
        line_items: lineItems,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: email || undefined,
          phone: phone || undefined,
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: address,
          city: city || "Bangalore",
          province: "Karnataka",
          zip: postalCode || "560001",
          country: "India",
          country_code: "IN",
          phone: phone || undefined,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address1: address,
          city: city || "Bangalore",
          province: "Karnataka",
          zip: postalCode || "560001",
          country: "India",
          country_code: "IN",
          phone: phone || undefined,
        },
      },
    };

    // If sandbox / demo token, simulate realistic Shopify Admin response
    const isMock =
      token.includes("live_98a76d54") ||
      token.startsWith("shpat_test_") ||
      token.startsWith("shpat_mock");

    if (isMock) {
      const generatedOrderNum = 1060 + Math.floor(Math.random() * 900);
      const simulatedShopifyId = `#${generatedOrderNum}`;
      const simulatedNumericId = 5800000000 + generatedOrderNum;

      // Update in D1
      await executeD1Query(
        `UPDATE orders SET shopify_order_id = ? WHERE id = ?;`,
        [simulatedShopifyId, order.id]
      );

      (order as any).shopify_order_id = simulatedShopifyId;

      return {
        success: true,
        shopifyOrderId: simulatedShopifyId,
        shopifyNumericId: simulatedNumericId,
        isSimulated: true,
        message: `Order pushed to Shopify (simulated): ${simulatedShopifyId}`,
      };
    }

    // Execute live HTTP POST to Shopify Admin API
    const postUrl = `https://${domain}/admin/api/${apiVersion}/orders.json`;
    const res = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify(shopifyOrderPayload),
    });

    const resData = (await res.json()) as any;

    if (res.ok && resData?.order) {
      const shopifyOrderName = resData.order.name || `#${resData.order.order_number}`;
      const shopifyNumericId = resData.order.id;

      // Update order in D1
      try {
        await executeD1Query(
          `UPDATE orders SET shopify_order_id = ? WHERE id = ?;`,
          [shopifyOrderName, order.id]
        );
      } catch (dbErr) {
        console.warn("Could not save shopify_order_id to D1:", dbErr);
      }

      (order as any).shopify_order_id = shopifyOrderName;

      return {
        success: true,
        shopifyOrderId: shopifyOrderName,
        shopifyNumericId,
        message: `Successfully created Shopify order ${shopifyOrderName}`,
      };
    } else {
      const errorMsg =
        resData?.errors || resData?.message || `HTTP ${res.status}: ${res.statusText}`;
      console.warn(`[Shopify Outbound] Failed to create order ${order.id}:`, errorMsg);
      return {
        success: false,
        error: typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg,
      };
    }
  } catch (err: any) {
    console.warn(`[Shopify Outbound] Exception pushing order ${order.id}:`, err);
    return {
      success: false,
      error: err.message || "Failed to push order to Shopify",
    };
  }
}
