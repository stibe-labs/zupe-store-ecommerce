import { sendMetaCloudApiMessage } from "@/lib/whatsappStore";

export const ADMIN_PHONE_NUMBER = "7356765036";
export const ADMIN_WHATSAPP_RECIPIENT = "917356765036";

export interface AdminOrderAlertData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: string;
  items?: Array<{ name: string; quantity: number; price?: number }>;
  shippingAddress?: string;
  city?: string;
  postalCode?: string;
  advancePaid?: number;
  balanceDue?: number;
}

export interface AdminInboundMessageAlertData {
  customerName?: string;
  customerPhone: string;
  content: string;
  messageType?: string;
}

export interface AdminMetaLeadAlertData {
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  source?: string;
  notes?: string;
}

export interface AdminPaymentAlertData {
  amount: number;
  orderId?: string;
  invoiceNumber?: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  bankReference?: string;
  paymentType?: "COD Advance (₹49)" | "Full Online Prepaid" | "Custom Payment Link" | "Prepaid Switch";
  totalOrderAmount?: number;
  balanceDue?: number;
}

/**
 * Format Indian currency with commas
 */
function formatRupees(amount: number): string {
  return Number(amount || 0).toLocaleString("en-IN");
}

/**
 * Formats time in Indian Standard Time (IST)
 */
function getIstTimeString(): string {
  try {
    return new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return new Date().toLocaleTimeString();
  }
}

/**
 * 1. Send Alert to Admin on New Customer Order Placed / Paid
 */
export async function notifyAdminNewOrder(
  data: AdminOrderAlertData
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = (data.customerPhone || "").replace(/\D/g, "").slice(-10);
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : data.customerPhone || "Not provided";
    const customerName = data.customerName?.trim() || "Customer";

    const itemsSummary = (data.items && data.items.length > 0)
      ? data.items.map((it) => `• ${it.name} × ${it.quantity}${it.price ? ` (₹${formatRupees(it.price * it.quantity)})` : ""}`).join("\n")
      : "Turkiye Jam Package";

    const addressParts = [data.shippingAddress, data.city, data.postalCode].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "Address in order details";

    const isCod = (data.paymentMethod || "").toLowerCase().includes("cash on delivery") || (data.paymentMethod || "").toLowerCase() === "cod";
    const paymentLabel = isCod ? "Cash on Delivery (COD)" : "Online Prepaid (UPI / Cards)";

    let paymentBreakdown = `💰 *Total Amount:* ₹${formatRupees(data.totalAmount)} (${paymentLabel})`;
    if (isCod && typeof data.advancePaid === "number" && data.advancePaid > 0) {
      paymentBreakdown += `\n   ↳ Advance Paid: ₹${formatRupees(data.advancePaid)} | Due at Doorstep: ₹${formatRupees(data.balanceDue || (data.totalAmount - data.advancePaid))}`;
    }

    const messageText = `🔔 *NEW ORDER RECEIVED!* 🍯

📦 *Order ID:* #${data.orderId}
👤 *Customer:* ${customerName}
📞 *Phone:* ${displayPhone}
${paymentBreakdown}

🛍️ *Order Items:*
${itemsSummary}

📍 *Delivery Address:*
${fullAddress}

⏰ *Time:* ${getIstTimeString()} IST

👉 *Manage in ERP:*
https://turkiyejam.com/admin/orders?search=${encodeURIComponent(data.orderId)}

💬 *Customer WhatsApp Chat:*
https://turkiyejam.com/admin/whatsapp?phone=${cleanPhone}`;

    const res = await sendMetaCloudApiMessage(ADMIN_WHATSAPP_RECIPIENT, messageText);
    if (!res.success) {
      console.warn("⚠️ Failed to deliver new order admin alert:", res.error);
    }
    return res;
  } catch (err: any) {
    console.error("notifyAdminNewOrder error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Alert to Admin on Inbound Customer WhatsApp Message / Enquiry
 */
export async function notifyAdminIncomingWhatsAppMessage(
  data: AdminInboundMessageAlertData
): Promise<{ success: boolean; error?: string }> {
  try {
    const rawDigits = (data.customerPhone || "").replace(/\D/g, "");
    const cleanPhone = rawDigits.slice(-10);

    // Prevent loop: Never alert the admin if the admin himself is the sender
    if (rawDigits.endsWith(ADMIN_PHONE_NUMBER) || cleanPhone === ADMIN_PHONE_NUMBER) {
      return { success: true };
    }

    const customerName = data.customerName?.trim() || "Customer";
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : data.customerPhone;
    const content = (data.content || "").trim();

    const messageText = `💬 *NEW WHATSAPP CUSTOMER MESSAGE!* 🌿

👤 *From:* ${customerName}
📞 *Phone:* ${displayPhone}
🕒 *Time:* ${getIstTimeString()} IST
📌 *Type:* ${data.messageType || "Text"}

📩 *Customer Message:*
"${content || "(Empty or media attachment)"}"

👉 *Reply on WhatsApp Desk:*
https://turkiyejam.com/admin/whatsapp?phone=${cleanPhone}`;

    const res = await sendMetaCloudApiMessage(ADMIN_WHATSAPP_RECIPIENT, messageText);
    if (!res.success) {
      console.warn("⚠️ Failed to deliver WhatsApp inbound alert to admin:", res.error);
    }
    return res;
  } catch (err: any) {
    console.error("notifyAdminIncomingWhatsAppMessage error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Send Alert to Admin on New Meta / Facebook Ad Lead Form Enquiry
 */
export async function notifyAdminMetaLead(
  data: AdminMetaLeadAlertData
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = (data.customerPhone || "").replace(/\D/g, "").slice(-10);
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : data.customerPhone || "Not provided";

    const messageText = `🎯 *NEW META AD LEAD / ENQUIRY!* ⚡

👤 *Name:* ${data.customerName || "Meta Lead"}
📞 *Phone:* ${displayPhone}
📧 *Email:* ${data.customerEmail || "Not provided"}
🏷️ *Source:* Instagram / Facebook Ad Form
🕒 *Time:* ${getIstTimeString()} IST

${data.notes ? `📝 *Notes:* ${data.notes.slice(0, 150)}\n\n` : ""}👉 *Open CRM Desk:*
https://turkiyejam.com/admin/crm`;

    const res = await sendMetaCloudApiMessage(ADMIN_WHATSAPP_RECIPIENT, messageText);
    if (!res.success) {
      console.warn("⚠️ Failed to deliver Meta lead admin alert:", res.error);
    }
    return res;
  } catch (err: any) {
    console.error("notifyAdminMetaLead error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Send Alert to Admin on Successful Payment Received (Cashfree / Settler / Razorpay / UPI)
 */
export async function notifyAdminPaymentReceived(
  data: AdminPaymentAlertData
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = (data.customerPhone || "").replace(/\D/g, "").slice(-10);
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : data.customerPhone || "Not provided";
    const customerName = data.customerName?.trim() || "Customer";
    const reference = data.orderId ? `#${data.orderId}` : (data.invoiceNumber ? `#${data.invoiceNumber}` : "Direct Payment");
    const pType = data.paymentType || (data.amount === 49 ? "COD Advance (₹49)" : "Full Online Prepaid");

    let breakdownNote = "";
    if (data.totalOrderAmount && data.totalOrderAmount > data.amount) {
      breakdownNote = `\n📦 *Total Order Value:* ₹${formatRupees(data.totalOrderAmount)}${data.balanceDue ? ` | Doorstep Due: ₹${formatRupees(data.balanceDue)}` : ""}`;
    }

    const messageText = `💰 *PAYMENT RECEIVED!* 💵✨

✅ *Status:* SUCCESSFUL
💵 *Amount Received:* ₹${formatRupees(data.amount)}
🏷️ *Payment Type:* ${pType}
📦 *Order / Invoice:* ${reference}
👤 *Paid By:* ${customerName}
📞 *Phone:* ${displayPhone}
💳 *Payment Mode:* ${data.paymentMethod || "UPI / Cards"}
🏦 *Transaction / Bank Ref:* ${data.bankReference || "Verified by Banking Rails"}
🕒 *Time:* ${getIstTimeString()} IST${breakdownNote}

👉 *View in Admin Payments:*
https://turkiyejam.com/admin/payments

👉 *Open Customer WhatsApp Chat:*
https://turkiyejam.com/admin/whatsapp?phone=${cleanPhone}`;

    const res = await sendMetaCloudApiMessage(ADMIN_WHATSAPP_RECIPIENT, messageText);
    if (!res.success) {
      console.warn("⚠️ Failed to deliver payment admin alert:", res.error);
    }
    return res;
  } catch (err: any) {
    console.error("notifyAdminPaymentReceived error:", err);
    return { success: false, error: err.message };
  }
}


