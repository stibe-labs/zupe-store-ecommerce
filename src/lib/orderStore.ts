import { executeD1Query } from "@/lib/d1";
import { createERPOrder, updateERPOrder, getERPOrders, getOrderById } from "@/lib/erpStore";
import { decrementInventory, restockInventory } from "@/lib/inventoryService";

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status: "processing" | "shipped" | "delivered" | "cancelled";
  whatsapp_confirm_status?: "pending_whatsapp" | "confirmed" | "cancelled";
  whatsapp_confirm_token?: string;
  whatsapp_token_used?: boolean;
  items: OrderItem[];
  created_at: string;
}

// Memory fallback store for orders
let inMemoryOrders: OrderRecord[] = [
  {
    id: "ord_zupe_1001",
    customer_name: "Demo Customer",
    customer_email: "demo@zupestore.com",
    customer_phone: "+1 555-0199",
    shipping_address: "742 Evergreen Terrace",
    city: "Springfield",
    postal_code: "97477",
    total_amount: 149.0,
    discount_amount: 0,
    payment_method: "Credit Card",
    payment_status: "paid",
    order_status: "delivered",
    items: [
      {
        product_id: "prod-1",
        name: "Aura Minimalist Ambient Lamp",
        price: 149.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
      },
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

let schemaUpdated = false;
async function ensureOrderSchema(): Promise<void> {
  if (schemaUpdated) return;
  schemaUpdated = true;
  try {
    await executeD1Query(`ALTER TABLE orders ADD COLUMN whatsapp_confirm_status TEXT DEFAULT 'pending_whatsapp'`).catch(() => {});
    await executeD1Query(`ALTER TABLE orders ADD COLUMN whatsapp_confirm_token TEXT`).catch(() => {});
    await executeD1Query(`ALTER TABLE orders ADD COLUMN whatsapp_token_used INTEGER DEFAULT 0`).catch(() => {});
  } catch (err) {
    // Non-fatal if columns already exist or D1 offline
  }
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  await ensureOrderSchema();
  inMemoryOrders = [order, ...inMemoryOrders];

  // 1. Synchronize to ERP Engine immediately so it appears on Admin Dashboard & Orders
  try {
    await createERPOrder({
      id: order.id,
      customer_name: order.customer_name,
      guest_email: order.customer_email,
      customer_phone: order.customer_phone || "+91 98000 00000",
      total_amount: order.total_amount,
      shipping_address: `${order.shipping_address}, ${order.city} ${order.postal_code}`,
      payment_method: order.payment_method === "Credit Card" ? "Prepaid" : order.payment_method,
      payment_status: order.payment_status === "paid" ? "Completed" : "Pending",
      status: "Processing",
      delivery_status: "Processing",
      whatsapp_confirm_status: order.whatsapp_confirm_status || "pending_whatsapp",
      whatsapp_confirm_token: order.whatsapp_confirm_token || "",
      whatsapp_token_used: order.whatsapp_token_used || false,
      items: order.items.map((it) => ({
        product_name: it.name,
        quantity: it.quantity,
        unit_price: it.price,
        product_id: it.product_id,
        image: it.image,
      })),
      created_at: order.created_at,
    });
  } catch (err) {
    console.warn("Failed to sync storefront order to ERP:", err);
  }

  // 2. Persist/update user_id and verification tokens in D1 if available
  try {
    await executeD1Query(
      `UPDATE orders 
       SET user_id = ?, 
           whatsapp_confirm_status = ?, 
           whatsapp_confirm_token = ?, 
           whatsapp_token_used = ?
       WHERE id = ?`,
      [
        order.user_id || null,
        order.whatsapp_confirm_status || "pending_whatsapp",
        order.whatsapp_confirm_token || null,
        order.whatsapp_token_used ? 1 : 0,
        order.id,
      ]
    );
  } catch (err) {
    console.warn("D1 createOrder token update warning:", err);
  }

  // (Note: Inventory decrement is cleanly handled once inside createERPOrder)

  return order;
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

export function getStorefrontOrderById(orderId: string): OrderRecord | null {
  const norm = (orderId || "").trim().toLowerCase();
  return inMemoryOrders.find((o) => o.id.toLowerCase() === norm) || null;
}

export function getOrderByToken(token: string): OrderRecord | null {
  if (!token) return null;
  return inMemoryOrders.find((o) => o.whatsapp_confirm_token === token) || null;
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
    const erpOrd = await getOrderById(normId);
    if (erpOrd) {
      if (erpOrd.whatsapp_token_used || erpOrd.whatsapp_confirm_status === "confirmed") {
        return {
          success: true,
          alreadyUsed: true,
          message: "Order was already confirmed previously.",
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

  try {
    await updateERPOrder(normId, {
      whatsapp_confirm_status: "confirmed",
      whatsapp_token_used: true,
      status: "Processing",
    });
  } catch (e) {
    console.warn("ERP update on WhatsApp confirm error:", e);
  }

  // Retrieve full order record (from memory or D1) so downstream confirmation messages have full details
  const finalOrd = ord || (await getOrderById(normId));

  return {
    success: true,
    message: "Order confirmed successfully!",
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
