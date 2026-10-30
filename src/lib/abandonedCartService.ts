import { executeD1Query } from "@/lib/d1";
import { sendAbandonedCartWhatsApp } from "@/lib/whatsappOrderConfirmation";

/**
 * Checks for any abandoned carts that:
 * 1. Have status = 'abandoned' (still unpurchased)
 * 2. Have whatsapp_sent_count = 0 (strictly 1-time send per abandoned cart)
 * 3. Were created at least 1 hour ago (3600 seconds = 60 minutes)
 * 4. Have not completed a purchase in the meantime
 *
 * Sends the personalized WhatsApp recovery reminder and updates D1.
 */
export async function processOverdueAbandonedCarts(): Promise<number> {
  let dispatchedCount = 0;
  const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  const nowMs = Date.now();

  try {
    const overdue = await executeD1Query<any>(
      `SELECT * FROM abandoned_checkouts 
       WHERE status = 'abandoned' 
         AND (whatsapp_sent_count = 0 OR whatsapp_sent_count IS NULL)
         AND (strftime('%s', 'now') - strftime('%s', created_at)) >= 3600
       ORDER BY created_at ASC
       LIMIT 25`
    );

    if (overdue && overdue.length > 0) {
      for (const row of overdue) {
        // Double-check 1-hour elapsed time in JavaScript
        const createdAtMs = new Date(row.created_at).getTime();
        if (!isNaN(createdAtMs) && nowMs - createdAtMs < ONE_HOUR_MS) {
          continue; // Has not reached 1 full hour yet
        }

        const phoneDigits = (row.customer_phone || "").replace(/\D/g, "");

        // Verify if customer has already placed an order since creating this cart
        if (phoneDigits) {
          const recentOrders = await executeD1Query<any>(
            `SELECT id FROM orders 
             WHERE (shipping_address LIKE ? OR shipping_address LIKE ?)
             ORDER BY created_at DESC LIMIT 1`,
            [`%${phoneDigits}%`, `%${phoneDigits.slice(-10)}%`]
          );

          if (recentOrders && recentOrders.length > 0) {
            // Customer already purchased! Mark as recovered and skip sending reminder
            await executeD1Query(
              `UPDATE abandoned_checkouts 
               SET status = 'recovered', 
                   recovered_order_id = ?, 
                   updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`,
              [recentOrders[0].id, row.id]
            );
            continue;
          }
        }

        let items = row.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }

        const baseUrl =
          process.env.STORE_BASE_URL ||
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://zupestore.in";
        const recoveryUrl = `${baseUrl}/checkout?recover=${encodeURIComponent(
          row.recovery_token
        )}`;
        const source = (row.source === "checkout" ? "checkout" : "cart") as "checkout" | "cart";

        const sent = await sendAbandonedCartWhatsApp({
          customerName: row.customer_name || "",
          customerPhone: row.customer_phone,
          items: (items || []).map((it: any) => ({
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
          // Strictly mark whatsapp_sent_count = 1 so this cart is NEVER reminded again
          await executeD1Query(
            `UPDATE abandoned_checkouts 
             SET whatsapp_sent_count = 1, 
                 last_whatsapp_sent_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [row.id]
          );
          console.log(`[1h Abandoned Cart] Dispatched 1-time recovery reminder for ${row.customer_phone}`);
        }
      }
    }
  } catch (e) {
    console.warn("[1h Abandoned Cart Auto-Check] Error:", e);
  }
  return dispatchedCount;
}
