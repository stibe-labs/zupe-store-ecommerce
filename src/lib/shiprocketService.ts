import { executeD1Query } from "@/lib/d1";
import { getSettings, ERPOrder } from "@/lib/erpStore";
import { OrderRecord } from "@/lib/orderStore";

export interface ShiprocketAWBResult {
  success: boolean;
  awb?: string;
  courier?: string;
  shipmentId?: string | number;
  delivery_status?: string;
  isSimulated?: boolean;
  message?: string;
  error?: string;
}

export interface LiveTrackingCheckpoint {
  date: string;
  status: string;
  activity: string;
  location: string;
}

export interface ShiprocketLiveTrackingResult {
  success: boolean;
  awb: string;
  courier_name?: string;
  current_status?: string;
  delivery_status?: ERPOrder["delivery_status"];
  edd?: string;
  activities: LiveTrackingCheckpoint[];
  isSimulated?: boolean;
  error?: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Resolves active Shiprocket JWT token dynamically.
 * If token is missing, expired, or invalid, auto-logs in using email & password
 * and caches the new token to ensure 100% uninterrupted automation.
 */
export async function getShiprocketToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const settings = await getSettings();
    const config = settings.shiprocket || ({} as any);

    const email = (process.env.SHIPROCKET_EMAIL || config.email || "").trim();
    const password = (process.env.SHIPROCKET_PASSWORD || config.password || "").trim();
    const directToken = (process.env.SHIPROCKET_TOKEN || config.token || "").trim();

    // 1. If Email + Password provided, auto-login to obtain fresh JWT token (valid for 10 days)
    if (email && password && email.includes("@")) {
      try {
        const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(8000),
        });

        if (loginRes.ok) {
          const loginData = (await loginRes.json()) as any;
          if (loginData?.token) {
            cachedToken = loginData.token;
            // Cache in memory for 9 days (Shiprocket JWT is valid 10 days)
            tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;

            // Auto-persist new token to integrations_config in D1
            try {
              const { saveSettings } = await import("@/lib/erpStore");
              await saveSettings({
                shiprocket: {
                  ...config,
                  email,
                  token: cachedToken,
                  lastSyncedAt: new Date().toISOString(),
                },
              });
            } catch (saveErr) {
              // Non-fatal
            }
            return cachedToken;
          }
        } else {
          console.warn("[Shiprocket Auth] Login failed with status:", loginRes.status);
        }
      } catch (authErr) {
        console.warn("[Shiprocket Auth] Auto-login error:", authErr);
      }
    }

    // 2. Fallback to direct token if valid and not a placeholder
    if (
      directToken &&
      !directToken.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") &&
      !directToken.startsWith("sr_test_") &&
      directToken.length > 30
    ) {
      cachedToken = directToken;
      tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (err) {
    console.warn("[Shiprocket Auth] Token resolution error:", err);
  }

  return null;
}

/**
 * Tests Shiprocket credentials live against the official Shiprocket API
 */
export async function testShiprocketConnection(credentials?: {
  email?: string;
  password?: string;
  token?: string;
}): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const email = credentials?.email?.trim();
    const password = credentials?.password?.trim();
    const token = credentials?.token?.trim();

    if (email && password) {
      const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(8000),
      });

      if (loginRes.ok) {
        const loginData = (await loginRes.json()) as any;
        if (loginData?.token) {
          cachedToken = loginData.token;
          tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
          return {
            success: true,
            message: `Shiprocket API authenticated successfully for ${email}. Auto-renewal active.`,
            token: loginData.token,
          };
        }
      }
      const errText = await loginRes.text();
      return {
        success: false,
        message: `Shiprocket authentication failed (${loginRes.status}): ${errText || "Invalid credentials"}`,
      };
    }

    if (token && token.length > 30) {
      const checkRes = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      });
      if (checkRes.ok) {
        return {
          success: true,
          message: "Shiprocket direct JWT token validated successfully.",
          token,
        };
      }
      return {
        success: false,
        message: `Shiprocket token rejected by carrier API (Status ${checkRes.status}).`,
      };
    }

    return {
      success: false,
      message: "Please enter Shiprocket account Email & Password or an API Token.",
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Shiprocket connection error: ${e.message}`,
    };
  }
}

/**
 * Pushes order to Shiprocket as 'NEW' so it appears on the Shiprocket dashboard with the "Ship Now" button.
 * The order remains in 'Processing' status without fake AWBs or forced 'In Transit'.
 * When the store Admin clicks "Ship Now" in Shiprocket, they select their preferred courier (DTDC, Delhivery, Bluedart, etc.).
 */
export async function dispatchShiprocketOrder(
  order: ERPOrder | OrderRecord,
  options?: { preferredCourier?: string; assignAwb?: boolean }
): Promise<ShiprocketAWBResult> {
  try {
    const settings = await getSettings();
    const config = settings.shiprocket || ({} as any);

    const token = await getShiprocketToken();
    const pickupLocation =
      (config?.pickup_location && config.pickup_location !== "Primary")
        ? config.pickup_location
        : process.env.SHIPROCKET_PICKUP_LOCATION || "jv ecom";

    const isMock = !token;

    const rawPhone = (order as any).customer_phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10) || "9876543210";
    const recipientName = (order as any).customer_name || "Valued Customer";
    const shippingAddress = (order as any).shipping_address || "Customer Address";
    const city = (order as any).city || "Bengaluru";
    const rawPostal = ((order as any).postal_code || "").toString().replace(/\D/g, "");
    const postalCode = rawPostal.length === 6 ? rawPostal : "560001";
    const isCod = ((order as any).payment_method || "").toLowerCase().includes("cod") ||
                  ((order as any).payment_method || "").toLowerCase().includes("cash on delivery");

    // 1. If Sandbox or Test Mode without live token
    if (isMock) {
      return {
        success: true,
        delivery_status: "Processing",
        isSimulated: true,
        message: "Order placed and awaiting fulfillment. Shiprocket API credentials not configured.",
      };
    }

    // 2. Live Shiprocket API ad-hoc order creation
    try {
      const createOrderUrl = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc";
      const advancePaid = Number((order as any).advance_paid) || (Boolean((order as any).is_cod_partial) ? 10 : 0);
      const isCodPartial = Boolean((order as any).is_cod_partial || advancePaid > 0);
      const codCollectableAmount = (order as any).balance_due !== undefined
        ? Number((order as any).balance_due)
        : (isCodPartial ? Math.max(0, Number(order.total_amount) - (advancePaid || 10)) : Number(order.total_amount));

      const effectiveShiprocketTotal = isCod ? codCollectableAmount : Number(order.total_amount);

      const orderItems = (order.items || []).map((it: any) => {
        const qty = Number(it.quantity || 1);
        const itemTot = Number(it.bundle_total || (Number(it.unit_price || it.price || 499) * qty));
        const effectiveUnit = Math.round(itemTot / Math.max(1, qty));
        return {
          name: it.product_name || it.name || "Purchased Product",
          sku: it.product_id || "SKU-ZUPE",
          units: qty,
          selling_price: effectiveUnit,
        };
      });

      // Align items sum with order total so Shiprocket line calculation matches to the rupee
      const sumItems = orderItems.reduce((acc: number, it: any) => acc + (it.units * it.selling_price), 0);
      const diff = Number(order.total_amount) - sumItems;
      if (diff !== 0 && orderItems.length > 0) {
        orderItems[0].selling_price += Math.round(diff / orderItems[0].units);
      }

      const orderRes = await fetch(createOrderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: order.id,
          order_date: new Date().toISOString().split("T")[0],
          pickup_location: pickupLocation,
          billing_customer_name: recipientName,
          billing_last_name: "",
          billing_address: shippingAddress,
          billing_city: city,
          billing_pincode: postalCode,
          billing_state: (order as any).state || "Karnataka",
          billing_country: "India",
          billing_email: (order as any).customer_email || (order as any).guest_email || "customer@zupestore.in",
          billing_phone: cleanPhone,
          shipping_is_billing: true,
          order_items: orderItems.length > 0 ? orderItems : [{ name: "Product", sku: "SKU-ZUPE", units: 1, selling_price: order.total_amount || 499 }],
          payment_method: isCod ? "COD" : "Prepaid",
          sub_total: effectiveShiprocketTotal,
          length: 15,
          breadth: 10,
          height: 8,
          weight: 0.45,
        }),
        signal: AbortSignal.timeout(10000),
      });

      const orderData = (await orderRes.json()) as any;
      const shipmentId = orderData.shipment_id || orderData.order_id;

      // Only assign AWB immediately if explicitly requested by Admin action
      if (options?.assignAwb && shipmentId) {
        const awbUrl = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb";
        const awbRes = await fetch(awbUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipment_id: shipmentId,
            ...(options.preferredCourier ? { courier_partner_id: options.preferredCourier } : {}),
          }),
          signal: AbortSignal.timeout(10000),
        });

        const awbData = (await awbRes.json()) as any;
        const awbCode = awbData?.response?.data?.awb_code;
        const courierName = awbData?.response?.data?.courier_name;

        if (awbCode) {
          await executeD1Query(
            `UPDATE orders 
             SET shiprocket_awb = ?,
                 tracking_number = ?,
                 courier_partner = ?,
                 delivery_status = 'Processing',
                 status = 'Processing'
             WHERE id = ? OR shopify_order_id = ?;`,
            [awbCode, awbCode, courierName || "", order.id, (order as any).shopify_order_id || order.id]
          );

          (order as any).shiprocket_awb = awbCode;
          (order as any).tracking_number = awbCode;
          (order as any).courier_partner = courierName;

          return {
            success: true,
            awb: awbCode,
            courier: courierName,
            shipmentId,
            delivery_status: "Processing",
            isSimulated: false,
            message: `Live AWB ${awbCode} generated via ${courierName}. Ready for dispatch.`,
          };
        }
      }

      // Default: Order is created in Shiprocket, sitting in dashboard with "Ship Now" button
      return {
        success: true,
        shipmentId,
        delivery_status: "Processing",
        isSimulated: false,
        message: "Order created in Shiprocket. Waiting for courier selection & dispatch via 'Ship Now'.",
      };
    } catch (apiErr: any) {
      console.warn("[Shiprocket Live API] Order creation notice:", apiErr.message || apiErr);
      return {
        success: false,
        delivery_status: "Processing",
        error: apiErr.message || "Failed to push order to Shiprocket",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      delivery_status: "Processing",
      error: err.message || "Failed to dispatch order to Shiprocket",
    };
  }
}

/**
 * Backward compatibility alias for generateShiprocketAWB
 */
export async function generateShiprocketAWB(
  order: ERPOrder | OrderRecord,
  options?: { preferredCourier?: string; assignAwb?: boolean }
): Promise<ShiprocketAWBResult> {
  return dispatchShiprocketOrder(order, { ...options, assignAwb: true });
}

/**
 * Queries Shiprocket API by order ID to check if Admin has clicked "Ship Now"
 * and assigned a courier & AWB. Synchronizes live state back to Cloudflare D1.
 */
export async function syncShiprocketOrderById(orderId: string): Promise<{
  success: boolean;
  awb?: string;
  courier?: string;
  status?: string;
  delivery_status?: string;
  message: string;
}> {
  if (!orderId || !orderId.trim()) {
    return { success: false, message: "Missing order ID" };
  }

  const cleanId = orderId.trim();
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, message: "Shiprocket API not connected" };
  }

  try {
    const searchUrl = `https://apiv2.shiprocket.in/v1/external/orders?order_id=${encodeURIComponent(cleanId)}`;
    const res = await fetch(searchUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { success: false, message: `Shiprocket API returned status ${res.status}` };
    }

    const data = (await res.json()) as any;
    const orderList = data?.data;
    if (!Array.isArray(orderList) || orderList.length === 0) {
      return { success: false, message: `Order ${cleanId} not found in Shiprocket` };
    }

    const srOrder = orderList[0];
    const shipment = srOrder?.shipments?.[0] || srOrder?.shipments || {};
    const awbCode = (shipment?.awb || srOrder?.awb_code || "").toString().trim();
    const courierName = (shipment?.courier_name || shipment?.courier || srOrder?.courier_name || "").toString().trim();
    const rawStatus = (shipment?.current_status || srOrder?.status || "").toString().trim();
    const statusCode = shipment?.current_status_id || srOrder?.status_code;

    const mapped = mapShiprocketStatus(rawStatus, statusCode);

    if (awbCode && !awbCode.startsWith("SR-AWB-")) {
      try {
        await executeD1Query(
          `UPDATE orders
           SET shiprocket_awb = ?,
               tracking_number = ?,
               courier_partner = ?,
               delivery_status = ?,
               status = ?
           WHERE id = ? OR shopify_order_id = ?;`,
          [awbCode, awbCode, courierName, mapped.deliveryStatus, mapped.orderStatus, cleanId, cleanId]
        );
      } catch (dbErr) {
        console.warn("Could not sync Shiprocket order to D1:", dbErr);
      }

      try {
        const { updateERPOrder } = await import("@/lib/erpStore");
        await updateERPOrder(cleanId, {
          shiprocket_awb: awbCode,
          courier_partner: courierName,
          delivery_status: mapped.deliveryStatus,
          status: mapped.orderStatus,
        });
      } catch (erpErr) {
        // Non-fatal
      }

      return {
        success: true,
        awb: awbCode,
        courier: courierName,
        status: rawStatus,
        delivery_status: mapped.deliveryStatus,
        message: `Synced with Shiprocket: Courier ${courierName}, AWB ${awbCode}, Status ${mapped.deliveryStatus}`,
      };
    }

    return {
      success: true,
      status: rawStatus || "NEW",
      delivery_status: mapped.deliveryStatus,
      message: `Order in Shiprocket is ${rawStatus || "NEW"} (waiting for Ship Now courier selection).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to sync order from Shiprocket",
    };
  }
}

/**
 * Real-time Live Tracking from Shiprocket API
 * Fetches actual carrier checkpoints, expected delivery date, and synchronizes status to D1.
 */
export async function getShiprocketLiveTracking(awb: string): Promise<ShiprocketLiveTrackingResult> {
  if (!awb || awb.trim() === "" || awb.startsWith("SR-AWB-")) {
    return { success: false, awb: "", activities: [] };
  }

  const cleanAwb = awb.trim();
  const token = await getShiprocketToken();

  // If live token is available and this is a real carrier AWB, query Shiprocket carrier tracking API
  if (token) {
    try {
      const trackRes = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${cleanAwb}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (trackRes.ok) {
        const trackData = (await trackRes.json()) as any;
        const tracking = trackData?.tracking_data;
        if (tracking && tracking.track_status === 1) {
          const shipmentTrack = tracking.shipment_track?.[0] || {};
          const activities: LiveTrackingCheckpoint[] = (tracking.shipment_track_activities || []).map((act: any) => ({
            date: act.date || "",
            status: act.status || act.activity || "In Transit",
            activity: act.activity || act.status || "Package scanned in transit",
            location: act.location || "Logistics Hub",
          }));

          const courierName = shipmentTrack.courier_name || tracking.courier_name || "";
          const currentStatusRaw = shipmentTrack.current_status || tracking.current_status || "In Transit";
          const statusId = tracking.shipment_status;
          const mapped = mapShiprocketStatus(currentStatusRaw, statusId);

          // Real-time synchronization to Cloudflare D1
          try {
            await executeD1Query(
              `UPDATE orders
               SET delivery_status = ?,
                   status = ?,
                   courier_partner = COALESCE(NULLIF(?, ''), courier_partner)
               WHERE shiprocket_awb = ? OR tracking_number = ?;`,
              [mapped.deliveryStatus, mapped.orderStatus, courierName, cleanAwb, cleanAwb]
            );
          } catch (dbErr) {
            console.warn("Could not auto-sync live tracking to D1:", dbErr);
          }

          return {
            success: true,
            awb: cleanAwb,
            courier_name: courierName,
            current_status: currentStatusRaw,
            delivery_status: mapped.deliveryStatus,
            edd: shipmentTrack.edd || undefined,
            activities,
            isSimulated: false,
          };
        }
      }
    } catch (trackErr: any) {
      console.warn("Live Shiprocket track error:", trackErr);
    }
  }

  // If carrier tracking data is not yet available, return clean honest empty activities without overriding current order status
  return {
    success: false,
    awb: cleanAwb,
    courier_name: "",
    current_status: "",
    delivery_status: undefined,
    activities: [],
    isSimulated: false,
  };
}

/**
 * Normalizes Shiprocket status strings and status codes to ERP delivery statuses
 */
export function mapShiprocketStatus(statusRaw?: string, statusId?: number | string): {
  deliveryStatus: ERPOrder["delivery_status"];
  orderStatus: string;
  isRTO: boolean;
  isDelivered: boolean;
  isNDR: boolean;
} {
  const norm = (statusRaw || "").trim().toUpperCase();
  const idNum = Number(statusId);

  // 1. RTO Delivered / RTO Acknowledged
  if (
    idNum === 9 ||
    norm.includes("RTO DELIVERED") ||
    norm.includes("RTO RECEIVED") ||
    norm.includes("RTO ACKNOWLEDGED") ||
    norm.includes("RETURNED TO ORIGIN") ||
    norm === "RTO COMPLETED"
  ) {
    return {
      deliveryStatus: "RTO Delivered",
      orderStatus: "Returned",
      isRTO: true,
      isDelivered: false,
      isNDR: false,
    };
  }

  // 2. RTO Initiated / RTO In Transit
  if (
    idNum === 8 ||
    norm.includes("RTO INITIATED") ||
    norm.includes("RTO IN TRANSIT") ||
    norm.includes("RTO OFD") ||
    norm.includes("RTO")
  ) {
    return {
      deliveryStatus: "RTO In Transit",
      orderStatus: "RTO",
      isRTO: false,
      isDelivered: false,
      isNDR: false,
    };
  }

  // 3. Delivered
  if (
    idNum === 7 ||
    norm === "DELIVERED" ||
    norm.includes("SUCCESSFULLY DELIVERED")
  ) {
    return {
      deliveryStatus: "Delivered",
      orderStatus: "Delivered",
      isRTO: false,
      isDelivered: true,
      isNDR: false,
    };
  }

  // 4. Out for Delivery
  if (
    idNum === 13 ||
    norm.includes("OUT FOR DELIVERY") ||
    norm.includes("OFD")
  ) {
    return {
      deliveryStatus: "Out for Delivery",
      orderStatus: "In Transit",
      isRTO: false,
      isDelivered: false,
      isNDR: false,
    };
  }

  // 5. NDR / Undelivered / Failed Delivery Attempt
  if (
    idNum === 19 ||
    norm.includes("UNDELIVERED") ||
    norm.includes("NDR") ||
    norm.includes("DELIVERY FAILED") ||
    norm.includes("CUSTOMER REFUSED") ||
    norm.includes("UNAVAILABLE")
  ) {
    return {
      deliveryStatus: "NDR",
      orderStatus: "Processing",
      isRTO: false,
      isDelivered: false,
      isNDR: true,
    };
  }

  // 6. In Transit / Shipped / Picked Up
  if (
    idNum === 15 ||
    idNum === 16 ||
    idNum === 17 ||
    idNum === 18 ||
    idNum === 22 ||
    norm.includes("IN TRANSIT") ||
    norm.includes("SHIPPED") ||
    norm.includes("PICKED UP") ||
    norm.includes("REACHED AT DESTINATION")
  ) {
    return {
      deliveryStatus: "In Transit",
      orderStatus: "In Transit",
      isRTO: false,
      isDelivered: false,
      isNDR: false,
    };
  }

  // Default fallback
  return {
    deliveryStatus: "Processing",
    orderStatus: "Processing",
    isRTO: false,
    isDelivered: false,
    isNDR: false,
  };
}

export interface ShiprocketWebhookResult {
  success: boolean;
  orderId?: string;
  shopifyOrderId?: string;
  awb?: string;
  previousStatus?: string;
  updatedStatus?: string;
  rtoCreditTriggered?: boolean;
  rtoCreditAmount?: number;
  message: string;
}

/**
 * Ingests live Shiprocket Webhook payload, updates order delivery lifecycle,
 * and automatically issues double-entry RTO Supplier Credit if returned.
 */
export async function processShiprocketWebhook(payload: any): Promise<ShiprocketWebhookResult> {
  const awb = (payload.awb || payload.awb_code || "").toString().trim();
  const rawOrderId = (payload.order_id || payload.channel_order_id || "").toString().trim();
  const shipmentId = payload.shipment_id;
  const statusRaw = payload.current_status || payload.shipment_status || payload.status || "";
  const statusId = payload.current_status_id || payload.shipment_status_id;
  const courierName = payload.courier_name || payload.carrier_name;
  const ndrReason = payload.ndr_remarks || payload.ndr_status || payload.failure_reason || (payload.scans?.[0]?.activity || "Non-delivery scan reported");

  if (!awb && !rawOrderId && !shipmentId) {
    return {
      success: false,
      message: "Webhook payload missing AWB, order ID, or shipment ID",
    };
  }

  // Find target order
  const { getERPOrders, updateERPOrder, addRTOCredit } = await import("@/lib/erpStore");
  const allOrders = await getERPOrders();

  let targetOrder = allOrders.find(
    (o) =>
      (awb && o.shiprocket_awb && o.shiprocket_awb.toLowerCase() === awb.toLowerCase()) ||
      (rawOrderId && o.id.toLowerCase() === rawOrderId.toLowerCase()) ||
      (rawOrderId && o.shopify_order_id.toLowerCase() === rawOrderId.toLowerCase()) ||
      (rawOrderId && o.shopify_order_id.replace(/\D/g, "") === rawOrderId.replace(/\D/g, ""))
  );

  // If not found in memory, query D1 directly
  if (!targetOrder && (awb || rawOrderId)) {
    try {
      const d1Res = await executeD1Query<ERPOrder>(
        `SELECT * FROM orders 
         WHERE shiprocket_awb = ? 
            OR id = ? 
            OR shopify_order_id = ? 
            OR shopify_order_id = ? 
         LIMIT 1`,
        [awb, rawOrderId, rawOrderId, rawOrderId.startsWith("#") ? rawOrderId : `#${rawOrderId}`]
      );
      if (d1Res && d1Res.length > 0) {
        targetOrder = d1Res[0];
      }
    } catch (e) {
      console.warn("D1 query error in processShiprocketWebhook:", e);
    }
  }

  if (!targetOrder) {
    return {
      success: false,
      awb,
      message: `No matching order found in ERP for AWB: ${awb || rawOrderId}`,
    };
  }

  const previousStatus = targetOrder.delivery_status;
  const mapped = mapShiprocketStatus(statusRaw, statusId);
  const updates: Partial<ERPOrder> = {
    delivery_status: mapped.deliveryStatus,
    status: mapped.orderStatus,
  };

  if (courierName) {
    updates.courier_partner = courierName;
  }
  if (awb && !targetOrder.shiprocket_awb) {
    updates.shiprocket_awb = awb;
  }

  // Handle NDR
  if (mapped.isNDR) {
    updates.ndr_status = ndrReason;
    if (previousStatus !== "NDR" && targetOrder.customer_phone) {
      try {
        const { sendDeliveryAttemptFailedWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        const firstItem = targetOrder.items?.[0];
        sendDeliveryAttemptFailedWhatsApp({
          customerName: targetOrder.customer_name,
          customerPhone: targetOrder.customer_phone,
          orderId: targetOrder.shopify_order_id || targetOrder.id,
          productName: firstItem?.product_name || "Your Order Item",
        }).catch((e) => console.warn("[Shiprocket] WhatsApp NDR error:", e));
      } catch (e) {}
    }
  } else if (mapped.isDelivered) {
    updates.ndr_status = "Resolved (Delivered)";
    // If COD, set remittance status to Pending
    if (targetOrder.payment_method === "COD" && targetOrder.remittance_status !== "Remitted") {
      updates.remittance_status = "Pending";
    }
    // Automatically send WhatsApp customer review request
    if (previousStatus !== "Delivered" && targetOrder.customer_phone) {
      try {
        const { sendOrderDeliveredFeedbackWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        const firstItem = targetOrder.items?.[0];
        const productName = firstItem?.product_name || "Your Purchased Item";
        const productIdOrSlug = firstItem?.product_id || (firstItem as any)?.slug || "mini-portable-steam-iron";
        sendOrderDeliveredFeedbackWhatsApp({
          customerName: targetOrder.customer_name,
          customerPhone: targetOrder.customer_phone,
          productName,
          productIdOrSlug,
        }).catch((e) => console.warn("[Shiprocket] WhatsApp delivered feedback error:", e));
      } catch (e) {
        console.warn("[Shiprocket] Error loading WhatsApp feedback module:", e);
      }
    }
  } else if (mapped.deliveryStatus === "Out for Delivery") {
    if (previousStatus !== "Out for Delivery" && targetOrder.customer_phone) {
      try {
        const { sendOutForDeliveryWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        const isCod = (targetOrder.payment_method || "").toUpperCase() === "COD";
        const advancePaid = Number((targetOrder as any).advance_paid) || (isCod ? 10 : 0);
        const amountToPay = isCod ? Math.max(0, targetOrder.total_amount - advancePaid) : 0;
        sendOutForDeliveryWhatsApp({
          customerName: targetOrder.customer_name,
          customerPhone: targetOrder.customer_phone,
          orderId: targetOrder.shopify_order_id || targetOrder.id,
          amountToPay,
        }).catch((e) => console.warn("[Shiprocket] WhatsApp OFD error:", e));
      } catch (e) {}
    }
  } else if (mapped.deliveryStatus === "In Transit") {
    if (previousStatus !== "In Transit" && (previousStatus as string) !== "Shipped" && targetOrder.customer_phone) {
      try {
        const { sendOrderShippedWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        sendOrderShippedWhatsApp({
          customerName: targetOrder.customer_name,
          customerPhone: targetOrder.customer_phone,
          orderId: targetOrder.shopify_order_id || targetOrder.id,
          courierName: courierName || targetOrder.courier_partner || "Express Courier",
          trackingId: awb || targetOrder.shiprocket_awb || "1425893021",
        }).catch((e) => console.warn("[Shiprocket] WhatsApp Shipped error:", e));
      } catch (e) {}
    }
  }

  let rtoCreditTriggered = false;
  let rtoCreditAmount = 0;

  // Handle RTO Delivered & Supplier Credit Trigger
  if (mapped.isRTO) {
    updates.rto_status = "Returned to Supplier";

    // Check if supplier credit was ALREADY issued for this order (prevent duplicate credit)
    const alreadyCredited =
      targetOrder.rto_status === "Supplier Credited" ||
      targetOrder.rto_status?.includes("Credited");

    if (!alreadyCredited) {
      // Amount to credit back is the unit Product Cost (COGS)
      const creditAmount =
        targetOrder.product_cost && targetOrder.product_cost > 0
          ? targetOrder.product_cost
          : Math.round(targetOrder.total_amount * 0.42);

      const supplierId = targetOrder.supplier_id || "sup-a";
      const productName =
        targetOrder.items?.[0]?.product_name || "Returned Dropship Product";

      try {
        await addRTOCredit({
          supplier_id: supplierId,
          order_id: targetOrder.shopify_order_id || targetOrder.id,
          product_name: productName,
          amount: creditAmount,
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: "Credited",
          notes: `Shiprocket Webhook confirmed package return to supplier. Credited ₹${creditAmount} to supplier balance.`,
        });

        rtoCreditTriggered = true;
        rtoCreditAmount = creditAmount;
        updates.rto_status = "Supplier Credited";

        // Recalculate net profit on RTO:
        // Net profit = 0 (revenue lost) - forward freight - RTO charge - ad spend + supplier credit
        const shipCost = targetOrder.shipping_cost || 75;
        const rtoCharge = targetOrder.rto_shipping_charge || 65;
        const adSpend = targetOrder.ad_spend_attributed || 0;
        updates.net_profit = 0 - shipCost - rtoCharge - adSpend + creditAmount;
      } catch (creditErr) {
        console.warn("Failed to automatically add RTO credit:", creditErr);
      }
    }
  }

  // Persist order updates
  await updateERPOrder(targetOrder.id, updates);

  return {
    success: true,
    orderId: targetOrder.id,
    shopifyOrderId: targetOrder.shopify_order_id,
    awb: targetOrder.shiprocket_awb || awb,
    previousStatus,
    updatedStatus: mapped.deliveryStatus,
    rtoCreditTriggered,
    rtoCreditAmount,
    message: `Updated order ${targetOrder.shopify_order_id} from ${previousStatus} to ${mapped.deliveryStatus}.${
      rtoCreditTriggered ? ` Automatically credited ₹${rtoCreditAmount} to supplier.` : ""
    }`,
  };
}

/**
 * Batch synchronizes active in-transit shipments using Shiprocket Live API or Simulation
 */
export async function syncShiprocketTrackingForActiveOrders(): Promise<{
  success: boolean;
  checkedCount: number;
  updatedCount: number;
  rtoCreditsTriggered: number;
  message: string;
  details: any[];
}> {
  const { getERPOrders } = await import("@/lib/erpStore");
  const orders = await getERPOrders();

  // Use the authoritative token resolver (auto-logins with email+password if needed)
  const token = await getShiprocketToken();
  const isMock = !token;

  let updatedCount = 0;
  let rtoCreditsTriggered = 0;
  const details: any[] = [];

  // 1. Check orders awaiting AWB assignment to see if Admin clicked "Ship Now" on Shiprocket
  const unassignedOrders = orders.filter(
    (o) =>
      (!o.shiprocket_awb || o.shiprocket_awb.startsWith("SR-AWB-")) &&
      o.delivery_status !== "Delivered" &&
      o.delivery_status !== "Cancelled" &&
      o.delivery_status !== "RTO Delivered"
  );

  for (const ord of unassignedOrders) {
    if (!isMock) {
      const syncRes = await syncShiprocketOrderById(ord.id);
      if (syncRes.success && syncRes.awb) {
        updatedCount++;
        details.push(syncRes);
      }
    }
  }

  // 2. Filter orders that have an AWB and are not yet in final terminal state
  const activeOrders = orders.filter(
    (o) =>
      Boolean(o.shiprocket_awb) &&
      !o.shiprocket_awb.startsWith("SR-AWB-") &&
      o.delivery_status !== "Delivered" &&
      o.delivery_status !== "RTO Delivered"
  );

  for (const ord of activeOrders) {
    if (!ord.shiprocket_awb) continue;

    if (!isMock) {
      // Live Shiprocket Tracking API
      try {
        const trackUrl = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${ord.shiprocket_awb}`;
        const res = await fetch(trackUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const trackData = await res.json();
          const trackInfo = trackData?.tracking_data?.shipment_track?.[0] || trackData?.tracking_data;
          if (trackInfo?.current_status) {
            const webhookPayload = {
              awb: ord.shiprocket_awb,
              order_id: ord.id,
              current_status: trackInfo.current_status,
              current_status_id: trackInfo.current_status_id,
              courier_name: trackInfo.courier_name || ord.courier_partner,
              ndr_remarks: trackInfo.ndr_status,
            };
            const result = await processShiprocketWebhook(webhookPayload);
            if (result.success) {
              updatedCount++;
              if (result.rtoCreditTriggered) rtoCreditsTriggered++;
              details.push(result);
            }
          }
        }
      } catch (err: any) {
        console.warn(`Live track error for AWB ${ord.shiprocket_awb}:`, err.message);
      }
    } else {
      // Simulated natural progression for development / demo
      // Orders in 'Processing' -> 'In Transit', 'In Transit' -> 'Out for Delivery' or 'Delivered'
      let nextStatus = ord.delivery_status;
      if (ord.delivery_status === "Processing") {
        nextStatus = "In Transit";
      } else if (ord.delivery_status === "In Transit") {
        // Deterministically progress based on order number
        const num = Number(ord.shopify_order_id.replace(/\D/g, "") || 0);
        if (num % 5 === 0) {
          nextStatus = "NDR";
        } else if (num % 7 === 0) {
          nextStatus = "RTO Delivered";
        } else {
          nextStatus = "Out for Delivery";
        }
      } else if (ord.delivery_status === "Out for Delivery") {
        nextStatus = "Delivered";
      }

      if (nextStatus !== ord.delivery_status) {
        const simPayload = {
          awb: ord.shiprocket_awb,
          order_id: ord.id,
          current_status: nextStatus,
          ndr_remarks: nextStatus === "NDR" ? "Customer phone unanswered at delivery" : undefined,
        };
        const result = await processShiprocketWebhook(simPayload);
        if (result.success) {
          updatedCount++;
          if (result.rtoCreditTriggered) rtoCreditsTriggered++;
          details.push(result);
        }
      }
    }
  }

  return {
    success: true,
    checkedCount: activeOrders.length,
    updatedCount,
    rtoCreditsTriggered,
    message: `Shiprocket sync check finished. ${activeOrders.length} active shipments checked, ${updatedCount} updated.${
      rtoCreditsTriggered > 0 ? ` ${rtoCreditsTriggered} RTO supplier credits created.` : ""
    }`,
    details,
  };
}

