import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mailer";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export interface OrderItemEmailData {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  product_id?: string;
}

export interface SendOrderConfirmationEmailParams {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  city?: string;
  state?: string;
  postalCode?: string;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  shippingCost?: number;
  paymentMethod: string;
  paymentStatus?: string;
  items: OrderItemEmailData[];
  createdAt?: string;
  shiprocketAwb?: string;
  courierPartner?: string;
}

const STORE_BASE_URL =
  process.env.STORE_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://zupe-store.stibelabs.workers.dev";

function resolveImageUrl(img?: string): string {
  if (!img) return `${STORE_BASE_URL}/zupe-logo.webp`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${STORE_BASE_URL}${img}`;
  return `${STORE_BASE_URL}/${img}`;
}

function findProductUrl(productName?: string, productId?: string): string {
  if (productId) {
    const matchById = DEFAULT_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    if (matchById) return `${STORE_BASE_URL}/products/${matchById.slug || matchById.id}`;
  }
  if (productName) {
    const norm = productName.toLowerCase().trim();
    const matchByName = DEFAULT_PRODUCTS.find(
      (p) => p.name.toLowerCase().includes(norm) || norm.includes(p.name.toLowerCase())
    );
    if (matchByName) return `${STORE_BASE_URL}/products/${matchByName.slug || matchByName.id}`;
  }
  return `${STORE_BASE_URL}/products/${productId || ""}`;
}

function calculateEstimatedDelivery(dateStr?: string): { minDate: string; maxDate: string; label: string } {
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  const validDate = isNaN(baseDate.getTime()) ? new Date() : baseDate;

  // Standard Indian express ecommerce transit: 5 to 7 business days
  const minDays = 5;
  const maxDays = 7;
  const minDateObj = new Date(validDate.getTime() + minDays * 24 * 60 * 60 * 1000);
  const maxDateObj = new Date(validDate.getTime() + maxDays * 24 * 60 * 60 * 1000);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };

  const minFormatted = minDateObj.toLocaleDateString("en-IN", options);
  const maxFormatted = maxDateObj.toLocaleDateString("en-IN", options);

  return {
    minDate: minFormatted,
    maxDate: maxFormatted,
    label: `${minFormatted} – ${maxFormatted} (5–7 Business Days)`,
  };
}

/**
 * Sends an automated order confirmation email to the customer.
 *
 * NOTE: As per requirements, emails are ONLY dispatched if the customer entered
 * their optional email during the checkout process. If the email is empty or synthetic,
 * the email dispatch is skipped cleanly.
 */
export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationEmailParams
): Promise<{ success: boolean; skipped?: boolean; error?: string; message?: string }> {
  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    state,
    postalCode,
    totalAmount,
    subtotal,
    discountAmount = 0,
    shippingCost,
    paymentMethod,
    items = [],
    createdAt,
  } = params;

  // 1. Validate customer email: MUST be entered and NOT a synthetic placeholder
  const cleanEmail = (customerEmail || "").trim().toLowerCase();
  if (
    !cleanEmail ||
    !cleanEmail.includes("@") ||
    cleanEmail.endsWith("@customer.zupestore.com") ||
    cleanEmail.endsWith(".local")
  ) {
    console.log(
      `[Order Email Service] ℹ️ Skipping email dispatch for Order ${orderId}: Customer did not provide an optional email at checkout.`
    );
    return {
      success: true,
      skipped: true,
      message: "Optional email not provided by customer at checkout",
    };
  }

  const isCod =
    (paymentMethod || "").toLowerCase().includes("cash on delivery") ||
    (paymentMethod || "").toLowerCase() === "cod";

  const firstName = (customerName || "Customer").split(" ")[0] || "Customer";
  const estDelivery = calculateEstimatedDelivery(createdAt);
  const trackingUrl = `${STORE_BASE_URL}/order-tracking?query=${encodeURIComponent(orderId)}`;
  const payNowUrl = `${STORE_BASE_URL}/checkout?method=prepaid&switch=cod&orderId=${encodeURIComponent(orderId)}`;

  // Calculate items subtotal if not provided
  const itemsSubtotal =
    subtotal !== undefined
      ? subtotal
      : items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);

  const calculatedShipping =
    shippingCost !== undefined ? shippingCost : isCod ? 49 : 0;

  const fullAddress = [shippingAddress, city, state, postalCode]
    .filter(Boolean)
    .join(", ");

  const attachments: Array<{
    filename: string;
    path?: string;
    content?: any;
    cid: string;
    contentType?: string;
    contentDisposition?: string;
  }> = [];

  // Try attaching official text label logo inline
  let logoImgSrc = `${STORE_BASE_URL}/zupe-label.png`;
  try {
    const candidateLogoPaths = [
      path.join(process.cwd(), "public", "zupe-email-label.png"),
      path.join(process.cwd(), "public", "zupe-label.png"),
      path.join(process.cwd(), "public", "zupe-label.webp"),
    ];
    for (const p of candidateLogoPaths) {
      if (fs.existsSync(p)) {
        const ext = path.extname(p).toLowerCase().replace(".", "");
        attachments.push({
          filename: `zupe-label.${ext}`,
          path: p,
          cid: "zupe_text_label_logo",
          contentType: ext === "webp" ? "image/webp" : "image/png",
          contentDisposition: "inline",
        });
        logoImgSrc = "cid:zupe_text_label_logo";
        break;
      }
    }
  } catch (e) {}

  // 2. Build Item HTML rows with CID inline embedded images and product detail links
  const itemRows = await Promise.all(
    items.map(async (item, idx) => {
      let rawImage = item.image;
      if (!rawImage || rawImage === "/placeholder.jpg" || rawImage === "/placeholder.png") {
        const prod = DEFAULT_PRODUCTS.find(
          (p) =>
            (item.product_id && (p.id === item.product_id || p.slug === item.product_id)) ||
            (item.name &&
              (p.name.toLowerCase().includes(item.name.toLowerCase()) ||
                item.name.toLowerCase().includes(p.name.toLowerCase())))
        );
        if (prod) {
          rawImage = prod.poster_image || prod.images?.[0] || "/products/ripple/ripple-amber.jpg";
        }
      }

      let imgSrc = resolveImageUrl(rawImage);
      const cidKey = `prod_thumb_${idx}`;

      // A. Try resolving local file if available to embed inline (bypasses Google image proxy!)
      let attachedLocally = false;
      try {
        if (rawImage) {
          let cleanPath = rawImage.trim().split("?")[0].split("#")[0];
          if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
            if (cleanPath.startsWith(STORE_BASE_URL)) {
              cleanPath = cleanPath.replace(STORE_BASE_URL, "");
            }
          }
          if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);

          const candidatePath = path.join(process.cwd(), "public", cleanPath);
          if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
            const ext = path.extname(candidatePath).toLowerCase().replace(".", "");
            attachments.push({
              filename: `item-${idx}.${ext || "jpg"}`,
              path: candidatePath,
              cid: cidKey,
              contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
              contentDisposition: "inline",
            });
            imgSrc = `cid:${cidKey}`;
            attachedLocally = true;
          }
        }
      } catch (err) {}

      // B. If not attached locally and we have an absolute URL, fetch buffer to embed inline
      if (!attachedLocally && imgSrc.startsWith("http")) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(imgSrc, { signal: controller.signal });
          clearTimeout(timer);
          if (res.ok) {
            const ab = await res.arrayBuffer();
            const buf = Buffer.from(ab);
            if (buf.length > 0 && buf.length < 3 * 1024 * 1024) {
              const mime = res.headers.get("content-type") || "image/jpeg";
              attachments.push({
                filename: `item-${idx}.jpg`,
                content: buf,
                cid: cidKey,
                contentType: mime,
                contentDisposition: "inline",
              });
              imgSrc = `cid:${cidKey}`;
            }
          }
        } catch (fetchErr) {}
      }

      const itemProductUrl = findProductUrl(item.name, item.product_id);
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; width: 68px;">
            <a href="${itemProductUrl}" target="_blank" style="text-decoration: none; display: block;">
              <img src="${imgSrc}" alt="${item.name}" width="60" height="60" style="display: block; border-radius: 12px; object-fit: cover; border: 1px solid #eeeeee; background: #fafafa; max-width: 60px; max-height: 60px;" />
            </a>
          </td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top;">
            <a href="${itemProductUrl}" target="_blank" style="text-decoration: none; color: #111827;">
              <div style="font-size: 14px; font-weight: 600; color: #111827; line-height: 1.4;">
                ${item.name}
              </div>
            </a>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
              Qty: <strong style="color: #111827;">${item.quantity}</strong> × ₹${Number(item.price || 0).toLocaleString("en-IN")}
            </div>
            <div style="margin-top: 6px;">
              <a href="${itemProductUrl}" target="_blank" style="font-size: 12px; color: #FF7A00; text-decoration: none; font-weight: 700;">
                View Product Details →
              </a>
            </div>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; text-align: right; font-size: 14px; font-weight: 700; color: #111827; white-space: nowrap;">
            ₹${itemTotal.toLocaleString("en-IN")}
          </td>
        </tr>
      `;
    })
  );
  const itemRowsHtml = itemRows.join("");

  // 3. Switch to Prepaid COD Incentive Box
  const codIncentiveHtml = isCod
    ? `
      <div style="margin: 24px 0; background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); border: 1.5px dashed #FF7A00; border-radius: 16px; padding: 18px 20px; text-align: left;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; padding-right: 12px; width: 28px;">
              <span style="font-size: 22px;">⚡</span>
            </td>
            <td>
              <div style="font-size: 14px; font-weight: 700; color: #9A3412;">
                Save ₹30 Instantly by Switching to Prepaid!
              </div>
              <div style="font-size: 12px; color: #7C2D12; line-height: 1.5; margin-top: 4px;">
                Pay securely online now via UPI, Google Pay, PhonePe, or Cards. You will save ₹30 immediately and your package gets priority express courier dispatch.
              </div>
              <div style="margin-top: 12px;">
                <a href="${payNowUrl}" style="display: inline-block; background: #FF7A00; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">
                  Pay Online & Save ₹30 Now →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `
    : "";

  // 4. Construct complete premium HTML email
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed — Zupe Store</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-collapse: collapse; }
        a { color: #FF7A00; }
      </style>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f4f6f8;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        
        <!-- Header / Brand -->
        <tr>
          <td style="padding: 26px 32px 18px 32px; text-align: center; border-bottom: 1px solid #f3f4f6; background-color: #ffffff;">
            <a href="${STORE_BASE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="${logoImgSrc}" alt="Zupe Store" width="165" style="display: block; width: 165px; max-width: 165px; height: auto; margin: 0 auto; border: 0;" />
            </a>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-top: 8px; font-weight: 600;">
              Official Order Confirmation
            </div>
          </td>
        </tr>

        <!-- Hero Section -->
        <tr>
          <td style="padding: 32px 32px 24px 32px; text-align: center;">
            <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; ${
              isCod
                ? "background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;"
                : "background-color: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0;"
            }">
              ${isCod ? "✓ Order Confirmed • Cash on Delivery" : "✓ Payment Verified &amp; Order Confirmed"}
            </div>
            
            <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 16px 0 8px 0; letter-spacing: -0.3px;">
              Thank you for your order, ${firstName}!
            </h1>
            
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0; max-width: 480px; margin: 0 auto;">
              Your order <strong style="color: #111827;">#${orderId}</strong> has been received and confirmed. Our team is packaging your items for express courier dispatch.
            </p>
          </td>
        </tr>

        <!-- Order Snapshot Card -->
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px 20px;">
              <tr>
                <td style="padding: 6px 0; width: 50%; vertical-align: top;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px;">Order ID</div>
                  <div style="font-size: 14px; font-weight: 700; color: #111827; margin-top: 2px; font-family: monospace;">${orderId}</div>
                </td>
                <td style="padding: 6px 0; width: 50%; vertical-align: top;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px;">Payment Method</div>
                  <div style="font-size: 13px; font-weight: 700; color: ${isCod ? "#B45309" : "#047857"}; margin-top: 2px;">
                    ${isCod ? "Cash on Delivery" : "Prepaid (Online)"}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0 0 0; width: 50%; vertical-align: top;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px;">Estimated Delivery</div>
                  <div style="font-size: 13px; font-weight: 700; color: #FF7A00; margin-top: 2px;">
                    ${estDelivery.label}
                  </div>
                </td>
                <td style="padding: 10px 0 0 0; width: 50%; vertical-align: top;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px;">Dispatch Status</div>
                  <div style="font-size: 13px; font-weight: 700; color: #111827; margin-top: 2px;">
                    Processing for Dispatch
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- COD Incentive Banner if applicable -->
        ${
          codIncentiveHtml
            ? `<tr><td style="padding: 0 32px;">${codIncentiveHtml}</td></tr>`
            : ""
        }

        <!-- Items Table -->
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; padding-bottom: 8px; border-bottom: 2px solid #f3f4f6;">
              Ordered Items (${items.length})
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRowsHtml}
            </table>
          </td>
        </tr>

        <!-- Financial Breakdown & Address -->
        <tr>
          <td style="padding: 0 32px 28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- Delivery Address -->
                <td style="vertical-align: top; width: 52%; padding-right: 16px;">
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">
                    Delivery Address
                  </div>
                  <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                    ${customerName}
                  </div>
                  <div style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    ${fullAddress || "Address provided at checkout"}
                  </div>
                  ${
                    customerPhone
                      ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Phone: <strong style="color: #111827;">${customerPhone}</strong></div>`
                      : ""
                  }
                </td>

                <!-- Price Totals -->
                <td style="vertical-align: top; width: 48%; background-color: #fafafa; border-radius: 12px; padding: 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Subtotal:</td>
                      <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111827;">
                        ₹${itemsSubtotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    ${
                      discountAmount > 0
                        ? `
                        <tr>
                          <td style="padding: 4px 0; color: #059669;">Discount:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #059669;">
                            -₹${discountAmount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                        `
                        : ""
                    }
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Shipping:</td>
                      <td style="padding: 4px 0; text-align: right; font-weight: 600; color: ${
                        calculatedShipping === 0 ? "#059669" : "#111827"
                      };">
                        ${calculatedShipping === 0 ? "FREE" : `₹${calculatedShipping}`}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0 0 0; border-top: 1px solid #e5e7eb; font-weight: 800; font-size: 15px; color: #111827;">
                        Total:
                      </td>
                      <td style="padding: 10px 0 0 0; border-top: 1px solid #e5e7eb; text-align: right; font-weight: 900; font-size: 17px; color: #FF7A00;">
                        ₹${totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    ${
                      isCod
                        ? `
                        <tr>
                          <td style="padding: 4px 0; color: #059669; font-weight: 600;">Advance Paid:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #059669;">
                            ₹10 (Paid)
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0 0 0; border-top: 1px dashed #fdba74; color: #9a3412; font-weight: 700;">Balance at Doorstep:</td>
                          <td style="padding: 6px 0 0 0; border-top: 1px dashed #fdba74; text-align: right; font-weight: 800; color: #9a3412;">
                            ₹${Math.max(0, totalAmount - 10).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        `
                        : ""
                    }
                  </table>
                  ${
                    isCod
                      ? `<div style="font-size: 11px; color: #b45309; margin-top: 8px; text-align: right; font-weight: 600;">Due in cash/UPI upon delivery</div>`
                      : `<div style="font-size: 11px; color: #059669; margin-top: 8px; text-align: right; font-weight: 600;">✓ Paid in full online</div>`
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button: Track Your Order -->
        <tr>
          <td style="padding: 0 32px 32px 32px; text-align: center;">
            <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 12px; background: #FF7A00;">
                  <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px;">
                    TRACK YOUR ORDER LIVE →
                  </a>
                </td>
              </tr>
            </table>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 10px;">
              Or copy tracking link: <a href="${trackingUrl}" style="color: #6b7280; word-break: break-all;">${trackingUrl}</a>
            </div>
          </td>
        </tr>

        <!-- Support Info -->
        <tr>
          <td style="padding: 24px 32px; background-color: #F9FAFB; border-top: 1px solid #f3f4f6; text-align: center;">
            <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 4px;">
              Need help with this order?
            </div>
            <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
              Simply reply directly to this email at <a href="mailto:zupestoreonline@gmail.com" style="color: #FF7A00; text-decoration: none; font-weight: 600;">zupestoreonline@gmail.com</a>. Our support team is ready to assist you.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 32px; background-color: #111827; text-align: center; color: #9ca3af; font-size: 11px; line-height: 1.5;">
            <div style="color: #ffffff; font-weight: 700; margin-bottom: 4px;">
              Zupe Store
            </div>
            <div>
              100% Genuine Quality Products • Safe Packaging • Fast Delivery Across India
            </div>
            <div style="margin-top: 8px; color: #6b7280;">
              © ${new Date().getFullYear()} Zupe Store. Sent to ${cleanEmail}.
            </div>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;

  // 5. Build plain text fallback for spam scoring & text clients
  const textBody = `
Zupe Store — Order Confirmed!

Hi ${firstName},

Thank you for your order! Your order #${orderId} has been confirmed and is being processed for dispatch.

ORDER DETAILS:
Order ID: ${orderId}
Payment Method: ${paymentMethod} (${isCod ? "Cash on Delivery" : "Paid Online"})
Estimated Delivery: ${estDelivery.label}
Total Amount: ₹${totalAmount.toLocaleString("en-IN")}

ITEMS:
${items.map((it) => `- ${it.name} x ${it.quantity} (₹${(it.price * it.quantity).toLocaleString("en-IN")})`).join("\n")}

DELIVERY ADDRESS:
${customerName}
${fullAddress}
${customerPhone ? `Phone: ${customerPhone}` : ""}

TRACK YOUR ORDER:
${trackingUrl}
${isCod ? `\nSWITCH TO PREPAID & SAVE ₹30:\n${payNowUrl}\n` : ""}

Need assistance? Reply to this email at zupestoreonline@gmail.com.
  `.trim();

  // 6. Send the email using Zupe Store mailer with inline attachments
  try {
    const res = await sendEmail({
      to: cleanEmail,
      subject: `Order Confirmed: #${orderId} — Zupe Store`,
      html,
      text: textBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (res.success) {
      console.log(`[Order Email Service] ✅ Order confirmation email successfully sent to ${cleanEmail} for Order #${orderId}`);
      return { success: true, message: `Email sent to ${cleanEmail}` };
    } else {
      console.warn(`[Order Email Service] ⚠️ Email dispatch returned error for ${cleanEmail}:`, res.error);
      return { success: false, error: res.error };
    }
  } catch (err: any) {
    console.error(`[Order Email Service] ❌ Fatal error sending confirmation email to ${cleanEmail}:`, err);
    return { success: false, error: err.message };
  }
}

export interface SendOrderCancellationEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  isPrepaid: boolean;
  refundId?: string;
  paymentId?: string;
  reason?: string;
}

/**
 * Sends an official order cancellation and refund initiation email to the customer.
 */
export async function sendOrderCancellationEmail(
  params: SendOrderCancellationEmailParams
): Promise<{ success: boolean; skipped?: boolean; error?: string; message?: string }> {
  const { orderId, customerName, customerEmail, totalAmount, isPrepaid, refundId, paymentId, reason } = params;

  if (
    !customerEmail ||
    !customerEmail.includes("@") ||
    customerEmail.toLowerCase().includes("example.com") ||
    customerEmail.toLowerCase().includes("test@")
  ) {
    return { success: false, skipped: true, message: "No valid customer email" };
  }

  const cleanEmail = customerEmail.trim().toLowerCase();
  const firstName = (customerName || "Valued Customer").trim().split(" ")[0] || "there";

  const refundDetailsHtml = isPrepaid
    ? `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 15px; font-weight: 800; color: #065f46; margin-bottom: 8px;">
          ✓ Full Refund Initiated: ₹${totalAmount.toLocaleString("en-IN")}
        </div>
        <div style="font-size: 13px; color: #047857; line-height: 1.6;">
          Your refund of <strong>₹${totalAmount.toLocaleString("en-IN")}</strong> has been processed to your original payment method.
        </div>
        <table style="width: 100%; margin-top: 12px; font-size: 12px; border-top: 1px dashed #a7f3d0; padding-top: 12px;">
          ${
            refundId
              ? `<tr>
                  <td style="color: #047857; padding: 4px 0; font-weight: 600;">Refund Reference:</td>
                  <td style="color: #065f46; font-family: monospace; font-weight: 700; text-align: right;">${refundId}</td>
                </tr>`
              : ""
          }
          ${
            paymentId
              ? `<tr>
                  <td style="color: #047857; padding: 4px 0; font-weight: 600;">Payment ID:</td>
                  <td style="color: #065f46; font-family: monospace; font-weight: 700; text-align: right;">${paymentId}</td>
                </tr>`
              : ""
          }
        </table>
        <div style="margin-top: 14px; background: #ffffff; border: 1px solid #d1fae5; border-radius: 10px; padding: 12px; font-size: 12px; color: #065f46; line-height: 1.6;">
          <div style="font-weight: 800; color: #047857; margin-bottom: 4px;">⏱️ Expected Credit Timeline:</div>
          <div>• <strong>UPI (GPay, PhonePe, Paytm):</strong> Usually credited within <strong>2 to 4 hours</strong> (or up to 24 hours depending on the issuing bank).</div>
          <div style="margin-top: 3px;">• <strong>Debit / Credit Cards / Netbanking:</strong> Credited within <strong>2 to 4 business days</strong>.</div>
        </div>
      </div>
    `
    : `
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <div style="font-size: 15px; font-weight: 800; color: #92400e; margin-bottom: 6px;">
          Cash on Delivery Order Cancelled
        </div>
        <div style="font-size: 13px; color: #78350f; line-height: 1.6;">
          Your Cash on Delivery order has been successfully cancelled. Your shipment will not be dispatched and no payment will be collected at your doorstep.
        </div>
        <div style="margin-top: 12px; background: #ffffff; border: 1px solid #fef3c7; border-radius: 10px; padding: 12px; font-size: 12px; color: #92400e; line-height: 1.5;">
          <strong>ℹ️ Advance Fee Note:</strong> The <strong>₹10 advance verification fee</strong> paid during checkout covers anti-fraud address verification and carrier commitment, and is <strong>non-refundable</strong>.
        </div>
      </div>
    `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Order Cancelled — Zupe Store</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="padding: 28px 32px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); text-align: center;">
            <div style="font-size: 24px; font-weight: 900; color: #FF7A00; letter-spacing: -0.5px;">
              Zupe Store
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase;">
              Order Cancellation Notice
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px;">
            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #111827;">
              Hi ${firstName},
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
              As requested, your order <strong>#${orderId}</strong> has been cancelled.
              ${reason ? `<br><span style="color: #6b7280; font-size: 12px;">Reason: ${reason}</span>` : ""}
            </p>

            ${refundDetailsHtml}

            <div style="background-color: #f9fafb; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Order Reference:</td>
                  <td style="color: #111827; font-weight: 700; text-align: right;">${orderId}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Order Total:</td>
                  <td style="color: #111827; font-weight: 700; text-align: right;">₹${totalAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 4px 0;">Status:</td>
                  <td style="color: #dc2626; font-weight: 700; text-align: right;">Cancelled</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0 10px 0;">
              <a href="${STORE_BASE_URL}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #FF7A00; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 10px;">
                Continue Shopping on Zupe Store →
              </a>
            </div>
          </td>
        </tr>

        <!-- Support Info -->
        <tr>
          <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
            Need help or have questions? Contact us anytime at <a href="mailto:zupestoreonline@gmail.com" style="color: #FF7A00; text-decoration: none; font-weight: 600;">zupestoreonline@gmail.com</a>.
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 16px 32px; background-color: #111827; text-align: center; color: #9ca3af; font-size: 11px;">
            © ${new Date().getFullYear()} Zupe Store. Sent to ${cleanEmail}.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textBody = `
Zupe Store — Order #${orderId} Cancelled

Hi ${firstName},

Your order #${orderId} has been cancelled.

${
  isPrepaid
    ? `FULL REFUND INITIATED:
Refund Amount: ₹${totalAmount.toLocaleString("en-IN")}
${refundId ? `Refund Reference: ${refundId}\n` : ""}${paymentId ? `Payment ID: ${paymentId}\n` : ""}
EXPECTED CREDIT TIMELINE:
• UPI (GPay, PhonePe, Paytm): Usually credited within 2 to 4 hours (or up to 24 hours depending on the issuing bank).
• Debit / Credit Cards / Netbanking: Credited within 2 to 4 business days.`
    : `CASH ON DELIVERY ORDER CANCELLED:
Your Cash on Delivery order has been successfully cancelled. No doorstep payment will be collected.
Note: The ₹10 advance verification fee paid during checkout covers order verification and carrier reservation, and is non-refundable.`
}

If you need any assistance, reply to this email at zupestoreonline@gmail.com.

Zupe Store Team
${STORE_BASE_URL}
  `.trim();

  try {
    const res = await sendEmail({
      to: cleanEmail,
      subject: `Order #${orderId} Cancelled & Refund Initiated — Zupe Store`,
      html,
      text: textBody,
    });
    return res;
  } catch (err: any) {
    console.error(`[Order Email Service] Cancellation email error:`, err);
    return { success: false, error: err.message };
  }
}

