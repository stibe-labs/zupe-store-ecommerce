import { executeD1Query } from "@/lib/d1";
import { createERPOrder, updateERPOrder, getERPOrders } from "@/lib/erpStore";
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
  payment_status: "pending" | "paid" | "failed";
  order_status: "processing" | "shipped" | "delivered" | "cancelled";
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

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
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

  // 2. Persist to D1 if available
  try {
    await executeD1Query(
      `INSERT INTO orders (id, user_id, total_amount, discount_amount, payment_method, payment_status, status, order_status, shipping_address, customer_email, customer_phone, items, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.user_id || null,
        order.total_amount,
        order.discount_amount || 0,
        order.payment_method,
        order.payment_status,
        order.order_status,
        order.order_status,
        `${order.shipping_address}, ${order.city} ${order.postal_code}`,
        order.customer_email,
        order.customer_phone || null,
        JSON.stringify(order.items || []),
        order.created_at,
      ]
    );
  } catch (err) {
    console.warn("D1 createOrder warning:", err);
  }

  // (Note: Inventory decrement is cleanly handled once inside createERPOrder)

  return order;
}

export function getOrders(userEmail?: string): OrderRecord[] {
  if (!userEmail) return inMemoryOrders;
  const normalized = userEmail.toLowerCase().trim();
  return inMemoryOrders.filter((o) => o.customer_email.toLowerCase() === normalized);
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
