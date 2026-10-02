import { executeD1Query } from "@/lib/d1";

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

  try {
    await executeD1Query(
      `INSERT INTO orders (id, user_id, total_amount, discount_amount, payment_method, payment_status, order_status, shipping_address, customer_email, customer_phone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.user_id || null,
        order.total_amount,
        order.discount_amount || 0,
        order.payment_method,
        order.payment_status,
        order.order_status,
        `${order.shipping_address}, ${order.city} ${order.postal_code}`,
        order.customer_email,
        order.customer_phone || null,
        order.created_at,
      ]
    );
  } catch (err) {
    console.warn("D1 createOrder warning:", err);
  }

  return order;
}

export function getOrders(userEmail?: string): OrderRecord[] {
  if (!userEmail) return inMemoryOrders;
  const normalized = userEmail.toLowerCase().trim();
  return inMemoryOrders.filter((o) => o.customer_email.toLowerCase() === normalized);
}

export function updateOrderStatus(orderId: string, status: OrderRecord["order_status"]): boolean {
  const ord = inMemoryOrders.find((o) => o.id === orderId);
  if (ord) {
    ord.order_status = status;
    return true;
  }
  return false;
}
