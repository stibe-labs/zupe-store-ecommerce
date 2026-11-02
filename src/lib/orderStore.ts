import { executeD1Query } from "@/lib/d1";
import { createERPOrder, updateERPOrder, getERPOrders, getOrderById } from "@/lib/erpStore";
import { decrementInventory, restockInventory } from "@/lib/inventoryService";

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit_price?: number;
  original_price?: number;
  bundle_tier?: number;
  bundle_savings?: number;
  bundle_total?: number;
  offer_label?: string;
}

export interface OrderRecord {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  total_amount: number;
  discount_amount?: number;
  promo_code?: string;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status: "processing" | "shipped" | "delivered" | "cancelled";
  whatsapp_confirm_status?: "pending_whatsapp" | "confirmed" | "cancelled";
  whatsapp_confirm_token?: string;
  whatsapp_token_used?: boolean;
  confirmation_email_sent?: boolean;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  items: OrderItem[];
  created_at: string;
}

// Memory fallback store for orders
let inMemoryOrders: OrderRecord[] = [];

let schemaUpdated = false;
async function ensureOrderSchema(): Promise<void> {
  if (schemaUpdated) return;
  schemaUpdated = true;
  try {
    await executeD1Query(`ALTER TABLE orders ADD COLUMN whatsapp_confirm_status TEXT DEFAULT 'pending_whatsapp'`).catch(() => {});
    await executeD1Query(`ALTER TABLE orders ADD COLUMN whatsapp_confirm_token TEXT`).catch(() => {});
    await executeD1Query(`ALTER TABLE orders ADD COLUMN whatsapp_token_used INTEGER DEFAULT 0`).catch(() => {});
    await executeD1Query(`ALTER TABLE orders ADD COLUMN confirmation_email_sent INTEGER DEFAULT 0`).catch(() => {});
  } catch (err) {
    // Non-fatal if columns already exist or D1 offline
  }
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  await ensureOrderSchema();
  inMemoryOrders = [order, ...inMemoryOrders];

  // 1. Synchronize to ERP Engine immediately so it appears on Admin Dashboard & Orders
  try {
    const erpOrder = await createERPOrder({
      id: order.id,
      customer_name: order.customer_name,
      guest_email: order.customer_email,
      customer_phone: order.customer_phone || "+91 98000 00000",
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      promo_code: order.promo_code,
      shipping_address: `${order.shipping_address}, ${order.city} ${order.postal_code}`,
      payment_method: order.payment_method === "Credit Card" ? "Prepaid" : order.payment_method,
      payment_status: order.payment_status === "paid" ? "Completed" : "Pending",
      status: order.order_status === "shipped" ? "In Transit" : "Processing",
      delivery_status: order.order_status === "shipped" ? "In Transit" : "Processing",
      whatsapp_confirm_status: order.whatsapp_confirm_status || "pending_whatsapp",
      whatsapp_confirm_token: order.whatsapp_confirm_token || "",
      whatsapp_token_used: order.whatsapp_token_used || false,
      confirmation_email_sent: order.confirmation_email_sent || false,
      razorpay_payment_id: (order as any).razorpay_payment_id || null,
      razorpay_order_id: (order as any).razorpay_order_id || null,
      items: order.items.map((it: any) => ({
        product_name: it.name || it.product_name,
        quantity: it.quantity,
        unit_price: it.price || it.unit_price,
        product_id: it.product_id,
        image: it.image,
        original_price: it.original_price,
        bundle_tier: it.bundle_tier,
        bundle_savings: it.bundle_savings,
        bundle_total: it.bundle_total,
        offer_label: it.offer_label,
      })),
      created_at: order.created_at,
    });
    if (erpOrder && erpOrder.shopify_order_id) {
      (order as any).shopify_order_id = erpOrder.shopify_order_id;
    }
  } catch (err) {
    console.warn("Failed to sync storefront order to ERP:", err);
  }

  // 2. Persist/update user_id, verification tokens, and Razorpay IDs in D1 if available
  try {
    await executeD1Query(
      `UPDATE orders 
       SET user_id = ?, 
           whatsapp_confirm_status = ?, 
           whatsapp_confirm_token = ?, 
           whatsapp_token_used = ?,
           confirmation_email_sent = ?,
           razorpay_payment_id = COALESCE(?, razorpay_payment_id),
           razorpay_order_id = COALESCE(?, razorpay_order_id)
       WHERE id = ?`,
      [
        order.user_id || null,
        order.whatsapp_confirm_status || "pending_whatsapp",
        order.whatsapp_confirm_token || null,
        order.whatsapp_token_used ? 1 : 0,
        order.confirmation_email_sent ? 1 : 0,
        (order as any).razorpay_payment_id || null,
        (order as any).razorpay_order_id || null,
        order.id,
      ]
    );
  } catch (err) {
    console.warn("D1 createOrder token update warning:", err);
  }

  // (Note: Inventory decrement is cleanly handled once inside createERPOrder)

  return order;
}

/**
 * Marks that the order confirmation email has been dispatched for this order.
 */
export async function markOrderEmailSent(orderId: string): Promise<void> {
  const ord = inMemoryOrders.find((o) => o.id === orderId);
  if (ord) ord.confirmation_email_sent = true;

  try {
    await executeD1Query(
      "UPDATE orders SET confirmation_email_sent = 1 WHERE id = ? OR shopify_order_id = ?",
      [orderId, orderId]
    );
  } catch (err) {
    console.warn("D1 markOrderEmailSent warning:", err);
  }
}

export function getOrders(userEmail?: string, userPhone?: string, userId?: string): OrderRecord[] {
  if (!userEmail && !userPhone && !userId) return inMemoryOrders;
  const normEmail = (userEmail || "").toLowerCase().trim();
  const normPhone = (userPhone || "").replace(/\D/g, "");
  const last10Phone = normPhone.slice(-10);

  return inMemoryOrders.filter((o) => {
    if (userId && o.user_id === userId) return true;
    if (normEmail && o.customer_email.toLowerCase().trim() === normEmail) return true;
    if (last10Phone) {
      const oPhoneLast10 = (o.customer_phone || "").replace(/\D/g, "").slice(-10);
      if (oPhoneLast10 && oPhoneLast10 === last10Phone) return true;
    }
    return false;
  });
}

export async function getOrdersAsync(
  userEmail?: string,
  userPhone?: string,
  userId?: string
): Promise<OrderRecord[]> {
  const memOrders = getOrders(userEmail, userPhone, userId);

  try {
    const { executeD1Query } = await import("@/lib/d1");
    let query = `
      SELECT o.*,
        u.name as u_name, u.phone as u_phone,
        (SELECT json_group_array(json_object(
          'product_id', oi.product_id,
          'name', oi.product_name,
          'price', oi.unit_price,
          'quantity', oi.quantity,
          'image', oi.poster_image
        )) FROM order_items oi WHERE oi.order_id = o.id) AS items_json
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (userId) {
      conditions.push("o.user_id = ?");
      params.push(userId);
    }
    if (userEmail) {
      conditions.push("(LOWER(o.guest_email) = ? OR LOWER(u.email) = ?)");
      params.push(userEmail.toLowerCase().trim(), userEmail.toLowerCase().trim());
    }
    if (userPhone) {
      const cleanPhone = userPhone.replace(/\D/g, "").slice(-10);
      if (cleanPhone) {
        conditions.push("(u.phone LIKE ? OR o.shipping_address LIKE ?)");
        params.push(`%${cleanPhone}%`, `%${cleanPhone}%`);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" OR ")}`;
    }
    query += " ORDER BY o.created_at DESC";

    const rows = await executeD1Query<any>(query, params);
    if (rows && rows.length > 0) {
      const d1Orders: OrderRecord[] = rows.map((r) => {
        let items: OrderItem[] = [];
        try {
          items = JSON.parse(r.items_json || "[]");
        } catch (_) {}

        return {
          id: r.id,
          user_id: r.user_id,
          customer_name: r.u_name || "Valued Customer",
          customer_email: r.guest_email || "",
          customer_phone: r.u_phone || "",
          items,
          total_amount: Number(r.total_amount),
          subtotal: Number(r.subtotal || r.total_amount),
          discount_amount: Number(r.discount_amount || 0),
          shipping_cost: Number(r.shipping_cost || 0),
          order_status: (r.status || "processing").toLowerCase() as any,
          payment_method: r.payment_method || "COD",
          payment_status: (r.payment_status || "Pending").toLowerCase() as any,
          shipping_address: r.shipping_address || "",
          city: "",
          postal_code: "",
          country: "India",
          created_at: r.created_at || new Date().toISOString(),
          tracking_number: r.tracking_number,
        };
      });

      const seen = new Set(memOrders.map((o) => o.id));
      const combined = [...memOrders];
      for (const d1 of d1Orders) {
        if (!seen.has(d1.id)) {
          seen.add(d1.id);
          combined.push(d1);
        }
      }
      return combined;
    }
  } catch (err) {
    console.warn("getOrdersAsync D1 error:", err);
  }

  return memOrders;
}

export function getStorefrontOrderById(orderId: string): OrderRecord | null {
  const norm = (orderId || "").trim().toLowerCase();
  return inMemoryOrders.find((o) => o.id.toLowerCase() === norm) || null;
}

export async function getOrderByToken(token: string): Promise<OrderRecord | any | null> {
  const normToken = (token || "").trim();
  if (!normToken) return null;
  const mem = inMemoryOrders.find((o) => o.whatsapp_confirm_token === normToken);
  if (mem) return mem;

  try {
    const rows = await executeD1Query<any>(
      "SELECT * FROM orders WHERE whatsapp_confirm_token = ? LIMIT 1",
      [normToken]
    );
    if (rows && rows.length > 0) {
      const row = rows[0];
      let items = row.items;
      if (typeof items === "string") {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      let itemsList = Array.isArray(items) ? items : [];
      if (itemsList.length === 0 && row.id) {
        try {
          const oiRows = await executeD1Query<any>(
            "SELECT * FROM order_items WHERE order_id = ?",
            [row.id]
          );
          if (oiRows && oiRows.length > 0) {
            itemsList = oiRows.map((it: any) => ({
              product_id: it.product_id,
              name: it.product_name || "Turkiye Jam",
              product_name: it.product_name || "Turkiye Jam",
              quantity: Number(it.quantity || 1),
              unit_price: Number(it.unit_price || it.total_price || 0),
              price: Number(it.unit_price || it.total_price || 0),
              total_price: Number(it.total_price || 0),
              image: it.poster_image || "",
            }));
          }
        } catch (oiErr) {
          console.warn("Failed to load order_items in getOrderByToken:", oiErr);
        }
      }
      return { ...row, items: itemsList };
    }
  } catch (e) {
    console.warn("D1 getOrderByToken error:", e);
  }
  return null;
}

export function updateStorefrontOrder(orderId: string, updates: Partial<OrderRecord>): void {
  const ord = inMemoryOrders.find((o) => o.id === orderId);
  if (ord) {
    Object.assign(ord, updates);
  }
}

export async function updateOrderStatus(orderId: string, status: OrderRecord["order_status"]): Promise<boolean> {
  const ord = inMemoryOrders.find((o) => o.id === orderId);
  if (ord) {
    ord.order_status = status;
  }

  // Restock items if order is cancelled
  if (status === "cancelled" && ord?.items) {
    try {
      await restockInventory(
        ord.items.map((it) => ({
          product_id: it.product_id,
          name: it.name,
          quantity: it.quantity,
        }))
      );
    } catch (restockErr) {
      console.warn("Failed to restock inventory in updateOrderStatus:", restockErr);
    }
  }

  // Also sync status update to ERP & D1
  try {
    const erpDeliveryStatus =
      status === "delivered"
        ? "Delivered"
        : status === "shipped"
        ? "In Transit"
        : status === "cancelled"
        ? "Cancelled"
        : "Processing";

    await updateERPOrder(orderId, {
      delivery_status: erpDeliveryStatus as any,
      status: status === "delivered" ? "Delivered" : status === "cancelled" ? "Cancelled" : "Processing",
    });
  } catch (err) {
    console.warn("Error updating ERP order status:", err);
  }

  return true;
}

/**
 * Confirms an order via WhatsApp interactive confirmation link.
 * Prevents multiple clicks via one-time token security.
 */
export async function confirmWhatsAppOrder(token: string, orderId: string): Promise<{
  success: boolean;
  message: string;
  order?: OrderRecord;
  alreadyUsed?: boolean;
}> {
  let normId = (orderId || "").trim();
  const normToken = (token || "").trim();

  // If orderId is not provided, look it up in memory or D1 using the verification token
  if (!normId && normToken) {
    const memOrd = inMemoryOrders.find((o) => o.whatsapp_confirm_token === normToken);
    if (memOrd) {
      normId = memOrd.id;
    } else {
      try {
        const rows = await executeD1Query<any>(
          "SELECT id FROM orders WHERE whatsapp_confirm_token = ? LIMIT 1",
          [normToken]
        );
        if (rows && rows.length > 0 && rows[0]?.id) {
          normId = rows[0].id;
        }
      } catch (e) {
        console.warn("D1 query error in confirmWhatsAppOrder:", e);
      }
    }
  }

  const ord = inMemoryOrders.find(
    (o) => (normId && o.id === normId) || (normToken && o.whatsapp_confirm_token === normToken)
  );

  let erpOrd: any = null;
  // If token was already marked used or order confirmed in memory
  if (ord) {
    if (ord.whatsapp_token_used || ord.whatsapp_confirm_status === "confirmed") {
      return {
        success: true,
        alreadyUsed: true,
        message: "Order was already confirmed previously.",
        order: ord,
      };
    }

    if (ord.whatsapp_confirm_status === "cancelled") {
      return {
        success: false,
        alreadyUsed: true,
        message: "This order was cancelled and cannot be confirmed.",
        order: ord,
      };
    }

    ord.whatsapp_confirm_status = "confirmed";
    ord.whatsapp_token_used = true;
    ord.order_status = "processing";
  } else {
    // Check in ERP store / D1
    erpOrd = await getOrderById(normId);
    if (erpOrd) {
      if (erpOrd.whatsapp_token_used || erpOrd.whatsapp_confirm_status === "confirmed") {
        return {
          success: true,
          alreadyUsed: true,
          message: "Order was already confirmed previously.",
          order: erpOrd as any,
        };
      }
      if (erpOrd.whatsapp_confirm_status === "cancelled") {
        return {
          success: false,
          alreadyUsed: true,
          message: "This order was cancelled and cannot be confirmed.",
        };
      }
    }
  }

  const targetOrder: any = ord || erpOrd || (await getOrderById(normId));

  // WhatsApp confirmation ONLY confirms customer acceptance.
  // It does NOT dispatch the order or assign a courier/AWB until the merchant packs and books shipping.
  if (ord) {
    ord.whatsapp_confirm_status = "confirmed";
    ord.whatsapp_token_used = true;
    ord.order_status = ord.order_status === "shipped" || ord.order_status === "delivered" ? ord.order_status : "processing";
  }

  try {
    const existingDelivery = targetOrder?.delivery_status || "Processing";
    await updateERPOrder(normId, {
      whatsapp_confirm_status: "confirmed",
      whatsapp_token_used: true,
      status: existingDelivery === "Delivered" ? "Delivered" : existingDelivery === "In Transit" ? "In Transit" : "Processing",
      delivery_status: existingDelivery,
    });
  } catch (e) {
    console.warn("ERP update on WhatsApp confirm error:", e);
  }

  // Retrieve full order record (from memory or D1) so downstream confirmation messages have full details
  const finalOrd = ord || (await getOrderById(normId));

  return {
    success: true,
    message: "Order confirmed by customer on WhatsApp. Ready for packing and dispatch.",
    order: (finalOrd as any) || undefined,
  };
}

/**
 * Cancels an order via WhatsApp cancellation link or direct customer cancellation.
 * Prevents multiple clicks via token check, and automatically restocks inventory.
 */
export async function cancelWhatsAppOrder(
  tokenOrOrderId: string,
  opts?: { isDirectCustomerCancel?: boolean; reason?: string }
): Promise<{
  success: boolean;
  message: string;
  order?: OrderRecord;
  alreadyUsed?: boolean;
}> {
  const norm = (tokenOrOrderId || "").trim();
  const ord = inMemoryOrders.find(
    (o) => o.id === norm || o.whatsapp_confirm_token === norm
  );

  if (ord) {
    if (!opts?.isDirectCustomerCancel && (ord.whatsapp_token_used || ord.whatsapp_confirm_status === "cancelled")) {
      return {
        success: true,
        alreadyUsed: true,
        message: "This request has already been processed.",
        order: ord,
      };
    }

    ord.whatsapp_confirm_status = "cancelled";
    ord.whatsapp_token_used = true;
    ord.order_status = "cancelled";

    // Restock inventory
    if (ord.items && ord.items.length > 0) {
      try {
        await restockInventory(
          ord.items.map((it) => ({
            product_id: it.product_id,
            name: it.name,
            quantity: it.quantity,
          }))
        );
      } catch (restockErr) {
        console.warn("Restock error on WhatsApp cancel:", restockErr);
      }
    }
  } else {
    const erpOrd = await getOrderById(norm);
    if (erpOrd && !opts?.isDirectCustomerCancel && (erpOrd.whatsapp_token_used || erpOrd.whatsapp_confirm_status === "cancelled")) {
      return {
        success: true,
        alreadyUsed: true,
        message: "This request has already been processed.",
      };
    }
  }

  const targetId = ord?.id || norm;
  try {
    await updateERPOrder(targetId, {
      delivery_status: "Cancelled" as any,
      status: "Cancelled",
      whatsapp_confirm_status: "cancelled",
      whatsapp_token_used: true,
    });
  } catch (e) {
    console.warn("ERP cancel update error:", e);
  }

  return {
    success: true,
    message: "Order cancelled successfully.",
    order: ord,
  };
}
