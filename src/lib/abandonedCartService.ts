import { executeD1Query } from "@/lib/d1";
import { sendAbandonedCartWhatsApp } from "@/lib/whatsappOrderConfirmation";
import { siteConfig } from "@/config/siteConfig";

/**
 * Automatic Overdue Abandoned Cart Recovery Processor:
 *
 * Rules:
 * 1. Product added to cart (source = 'cart'):
 *    - Sends message after 1 hour (3600s) if the order has NOT been placed.
 * 2. Checkout page reached / exited (source = 'checkout'):
 *    - Sends message after 5 minutes (300s) if the order has NOT been placed.
 * 3. Order Check:
 *    - If the customer places an order within that time, the message is NOT sent
 *      and the session is marked as 'recovered'.
 */
export async function processOverdueAbandonedCarts(): Promise<number> {
  let dispatchedCount = 0;
  try {
    // Overdue query:
    // - source = 'cart' -> >= 3600 seconds (1 hour)
    // - source = 'checkout' (or default) -> >= 300 seconds (5 minutes)
    const overdue = await executeD1Query<any>(
      `SELECT * FROM abandoned_checkouts 
       WHERE status = 'abandoned' 
         AND whatsapp_sent_count = 0 
         AND (
           (source = 'cart' AND (strftime('%s', 'now') - strftime('%s', COALESCE(updated_at, created_at))) >= 3600)
           OR
           ((source = 'checkout' OR source IS NULL OR source = '') AND (strftime('%s', 'now') - strftime('%s', COALESCE(updated_at, created_at))) >= 300)
         )
       ORDER BY created_at ASC
       LIMIT 25`
    );

    if (overdue && overdue.length > 0) {
      for (const row of overdue) {
        const rawPhone = (row.customer_phone || "").replace(/\D/g, "");
        const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
        const phone91 = `91${phone10}`;

        // 1. Strict Order Verification: Check if an order has already been placed
        try {
          const existingOrders = await executeD1Query<any>(
            `SELECT id FROM orders 
             WHERE (customer_phone = ? OR customer_phone = ? OR customer_phone = ?) 
               AND status != 'Cancelled' 
             LIMIT 1`,
            [phone10, phone91, row.customer_phone]
          );

          if (existingOrders && existingOrders.length > 0) {
            // Customer already placed order! Mark as recovered and DO NOT send recovery message
            await executeD1Query(
              `UPDATE abandoned_checkouts 
               SET status = 'recovered', recovered_order_id = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`,
              [existingOrders[0].id, row.id]
            );
            continue;
          }
        } catch (checkErr) {
          console.warn("[Abandoned Cart Auto-Check] Order check warning:", checkErr);
        }

        // 2. Parse Items
        let items = row.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }

        if (!Array.isArray(items) || items.length === 0) {
          continue;
        }

        const recoveryUrl = siteConfig.getRecoveryUrl(row.recovery_token);
        const source = (row.source === "cart" ? "cart" : "checkout") as "checkout" | "cart";

        // 3. Dispatch WhatsApp Recovery Message
        const sent = await sendAbandonedCartWhatsApp({
          customerName: row.customer_name || "",
          customerPhone: row.customer_phone,
          items: items.map((it: any) => ({
            name: it.name || it.product_name || "Cart Product",
            quantity: Number(it.quantity || 1),
            price: Number(it.price || it.unit_price || 0),
          })),
          totalAmount: Number(row.total_amount) || 0,
          recoveryUrl,
          source,
        });

        if (sent) {
          dispatchedCount++;
          await executeD1Query(
            `UPDATE abandoned_checkouts 
             SET whatsapp_sent_count = whatsapp_sent_count + 1, 
                 last_whatsapp_sent_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [row.id]
          );
        }
      }
    }
  } catch (e) {
    console.warn("[Abandoned Cart Auto-Check] Error:", e);
  }
  return dispatchedCount;
}
