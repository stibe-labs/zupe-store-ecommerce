import { executeD1Query } from "@/lib/d1";
import { sendAbandonedCartWhatsApp } from "@/lib/whatsappOrderConfirmation";

/**
 * Checks for any abandoned carts that:
 * 1. Have status = 'abandoned'
 * 2. Have whatsapp_sent_count = 0
 * 3. Were created at least 30 minutes ago (1800 seconds)
 *
 * Sends the personalized WhatsApp recovery reminder and updates D1.
 */
export async function processOverdueAbandonedCarts(): Promise<number> {
  let dispatchedCount = 0;
  try {
    const overdue = await executeD1Query<any>(
      `SELECT * FROM abandoned_checkouts 
       WHERE status = 'abandoned' 
         AND whatsapp_sent_count = 0 
         AND (strftime('%s', 'now') - strftime('%s', created_at)) >= 1800
       ORDER BY created_at ASC
       LIMIT 25`
    );

    if (overdue && overdue.length > 0) {
      for (const row of overdue) {
        let items = row.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }

        const recoveryUrl = `https://zupe-store.stibelabs.workers.dev/checkout?recover=${encodeURIComponent(
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
          await executeD1Query(
            `UPDATE abandoned_checkouts 
             SET whatsapp_sent_count = whatsapp_sent_count + 1, 
                 last_whatsapp_sent_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [row.id]
          );
        }
      }
    }
  } catch (e) {
    console.warn("[30m Abandoned Cart Auto-Check] Error:", e);
  }
  return dispatchedCount;
}
