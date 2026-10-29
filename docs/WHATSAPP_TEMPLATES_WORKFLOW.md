# Zupe Store — WhatsApp Templates & Automated Customer Lifecycle Guide

**Audience:** Zupe Store Administrators, Operations Team & Developers  
**Module:** Customer Communication & Automated WhatsApp Notifications  
**Provider:** Meta WhatsApp Business Cloud API (Graph API v21.0)  
**Registered Phone Number:** `+91 97781 37954` (Verified Name: *Zupe Store*, Quality Rating: **GREEN**)  
**Production Domain:** `https://zupestore.in`  
**Version:** 3.0 (All 11 Templates Active & Verified)

---

## 📌 Executive Overview

Zupe Store utilizes Meta's official WhatsApp Business Cloud API to deliver automated transactional updates, order verifications, payment confirmations, shipment tracking, abandoned cart recoveries, and customer reviews.

Because all 11 message templates are officially **Approved & Active** in Meta Business Manager under the **Utility**, **Marketing**, and **Authentication** categories, they bypass the 24-hour customer service window limitation and deliver unconditionally to any Indian mobile number.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATED WHATSAPP CUSTOMER LIFECYCLE                           │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ 1. Sign In / Checkout ]
          │
          ▼
   zupe_login_otp ───────────────► Customer receives instant 6-digit OTP
          │
 [ 2. Order Placed ]
          │
          ▼
   zupe_order_verify ────────────► [ ✅ Confirm Order ] or [ ❌ Cancel Order ]
          │
   ┌──────┴──────────────────────────────────────┐
   │                                             │
 (COD Confirmed)                         (Prepaid Captured)
   │                                             │
   ▼                                             ▼
zupe_cod_switch_prepaid                zupe_payment_successful
(Instant ₹30 OFF Offer)                (Payment Confirmed & Receipt)
   │                                             │
   └──────────────────────┬──────────────────────┘
                          │
 [ 3. Courier Dispatched via Shiprocket ]
                          │
                          ▼
                   zupe_order_shipped
             (Live AWB & Tracking Link)
                          │
 [ 4. Out For Delivery ]  │  [ 5. Delivery Failed (NDR) ]
           │              │              │
           ▼              │              ▼
   zupe_out_for_delivery  │     zupe_delivery_attempt_failed
   (Doorstep Cash Alert)  │     (Address Update / Reschedule)
           │              │
           └───────┬──────┘
                   │
 [ 6. Package Delivered ]
                   │
                   ▼
       zupe_order_delivered_feedback
 (Auto-scrolls & Opens 5-Star Review Popup)
```

---

## 📊 Master Template Summary Table

| # | Template Name | Category | Trigger Event | Trigger Timing | Interactive Buttons |
|---|---|---|---|---|---|
| **1** | `zupe_order_verify` | Utility | Customer places order at checkout | Immediate | `[ ✅ Confirm Order ]`<br>`[ ❌ Cancel Order ]` |
| **2** | `zupe_cod_switch_prepaid` | Marketing | Customer confirms COD order | Immediate after confirmation | `[ Pay Now & Save Rs 30 ]`<br>`[ Track Order ]` |
| **3** | `zupe_payment_successful` | Utility | Razorpay payment captured | Immediate upon payment | `[ 📦 View Order ]` |
| **4** | `zupe_abandoned_cart` | Marketing | Customer leaves checkout/cart | 15–30 mins after exit | `[ 🛒 Complete Your Order ]` |
| **5** | `zupe_order_shipped` | Utility | AWB assigned / In Transit | Immediate via Shiprocket webhook | `[ 🔎 Track Shipment ]` |
| **6** | `zupe_out_for_delivery` | Utility | Courier driver out for delivery | Immediate via Shiprocket webhook | `[ 🛵 Live Track ]` |
| **7** | `zupe_delivery_attempt_failed` | Utility | Courier delivery failed / NDR | Immediate via Shiprocket webhook | Text Prompt / Reschedule |
| **8** | `zupe_order_delivered_feedback` | Utility | Order marked "Delivered" | Immediate via Shiprocket webhook | `[ ⭐ Leave a Review ]` |
| **9** | `zupe_order_cancelled` | Utility | Order cancelled by customer/admin | Immediate upon cancellation | `[ 🛍️ Browse Store ]` |
| **10** | `zupe_refund_update` | Utility | Refund initiated or completed | Immediate upon refund trigger | `[ 🔎 View Order Status ]` |
| **11** | `zupe_login_otp` | Authentication | Phone login / OTP requested | Instant (60s security cooldown) | `[ Copy Code ]` |

---

## 📝 Detailed Specification for All 11 Templates

---

### 1. Order Placed — Confirmation / Cancellation Request
* **Template Name:** `zupe_order_verify`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Instantly when an order is created on the storefront (`/checkout`). Works as a unified template for both COD and Prepaid orders.
* **Exact Body Text in Meta:**
```text
Hi {{1}}! 👋🏻

😊Thank you for ordering from ZupeStore🛒

⁉️Please confirm your order📦

📦 Order ID: {{2}}
🛍️ Product: {{3}}
💰 Amount Payable: ₹{{4}}
💰 Amount Paid: ₹{{5}}

📣Please confirm whether you would like to proceed with your order.💬

Thank you,❤️
Team ZupeStore
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Display Order ID (e.g. `#1054`)
  * `{{3}}`: Primary Product Name (e.g. `Mini Portable Steam Iron`)
  * `{{4}}`: Amount Payable at Delivery (`668` for COD, `0` for prepaid)
  * `{{5}}`: Amount Paid Online (`10` for COD advance, `678` for prepaid)
* **Buttons (Type: Visit Website):**
  1. **Button 1 (`index: 0`):** `✅ Confirm Order`  
     * URL Type: Dynamic  
     * Destination: `https://zupestore.in/api/orders/whatsapp-confirm?token={{1}}`  
     * Behavior: Verifies the secure token in Cloudflare D1, marks the order as **Confirmed**, and automatically triggers the COD switch discount or confirmation.
  2. **Button 2 (`index: 1`):** `❌ Cancel Order`  
     * URL Type: Dynamic  
     * Destination: `https://zupestore.in/orders?cancelPrompt={{1}}`  
     * Behavior: Opens the customer's order page with a cancellation confirmation modal.

---

### 2. COD Order — Switch to Prepaid Discount Offer (Save ₹30)
* **Template Name:** `zupe_cod_switch_prepaid` *(Fallback alias: `zupe_order_cod_v2`)*
* **Category:** `Marketing` | **Language:** `English (en)`
* **When It Triggers:** Automatically sent the instant a COD customer clicks `[ ✅ Confirm Order ]` from WhatsApp or when confirmed manually by admin.
* **Exact Body Text in Meta:**
```text
Hi {{1}}! 👋Your Cash on Delivery order is confirmed.

⚡ Special Offer on your ZupeStore Order! 🎁

Switch your Cash on Delivery order to Prepaid now and get an instant FLAT ₹30 OFF! 💰

📦 Order ID: #{{2}}
💵 Original COD Due: ₹{{3}}
🔥 Discounted Prepaid Price: ₹{{4}}

Pay now to enjoy contactless express delivery and instant savings! 🚀

Team ZupeStore
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Clean Order ID (e.g. `1054`)
  * `{{3}}`: Original COD Doorstep Balance (e.g. `668`)
  * `{{4}}`: Discounted Online Price with ₹30 OFF (e.g. `638`)
* **Buttons (Type: Visit Website):**
  1. **Button 1 (`index: 0`):** `Pay Now & Save Rs 30`  
     * URL Type: Dynamic  
     * Destination: `https://zupestore.in/checkout?method=prepaid&switch=cod&orderId={{1}}`  
     * Behavior: Opens checkout in switch mode, applies the flat ₹30 discount to the order, and launches Razorpay UPI/Cards payment.
  2. **Button 2 (`index: 1`):** `Track Order`  
     * URL Type: Dynamic  
     * Destination: `https://zupestore.in/order-tracking?query={{1}}`  
     * Behavior: Opens live order status tracking.

---

### 3. Payment Successful
* **Template Name:** `zupe_payment_successful`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Triggered immediately when Razorpay verifies payment signature or dispatches the `payment.captured` / `order.paid` webhook.
* **Exact Body Text in Meta:**
```text
🎉 Payment Successful!
Hi {{1}}! 🧡 Your payment is confirmed.
📦 Order ID: #{{2}}
💰 Paid: ₹{{3}}
Sit back and relax! Your order updates are on the way. 🚀
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Clean Order ID (e.g. `1054`)
  * `{{3}}`: Amount Paid (e.g. `469`)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `📦 View Order`  
    * URL Type: Dynamic  
    * Destination: `https://zupestore.in/orders?query={{1}}`

---

### 4. Abandoned Cart Recovery
* **Template Name:** `zupe_abandoned_cart`
* **Category:** `Marketing` | **Language:** `English (en)`
* **When It Triggers:** Dispatched by the automated background cron (`/api/cron/abandoned-checkouts`) 15 to 30 minutes after a customer enters checkout or adds items to cart but leaves before completing payment.
* **Exact Body Text in Meta:**
```text
👀 Something Caught Your Eye?

Hi {{1}}! Your favourite find is waiting for you in your cart. 🛍️🧡

🎁 {{2}}

Complete your order now with free shipping before it sells out! ⚡
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: First Abandoned Product Name (e.g. `Mini Portable Steam Iron`)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `🛒 Complete Your Order`  
    * URL Type: Dynamic  
    * Destination: `https://zupestore.in/checkout?recover={{1}}`  
    * Behavior: Restores the exact abandoned items, pre-fills the customer's shipping address and contact details, and presents 1-click checkout.

---

### 5. Order Shipped — Courier & Tracking Details
* **Template Name:** `zupe_order_shipped`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Dispatched automatically when Shiprocket generates an AWB or when the package status changes to **In Transit / Shipped**.
* **Exact Body Text in Meta:**
```text
Hi {{1}}!

🥳Congratulations! Your ZupeStore order is on its way...✅

📦 Order ID: {{2}}
🚚 Courier: {{3}}
🔎 Tracking ID: {{4}}

ℹ️Track your shipment here:
{{5}}

•Please keep your phone available for delivery updates.⚠️

😊Thank you for shopping with ZupeStore❤️
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Order ID (e.g. `#1054`)
  * `{{3}}`: Courier Name (e.g. `BlueDart Express` / `Delhivery`)
  * `{{4}}`: AWB Tracking Code (e.g. `1425893021`)
  * `{{5}}`: Live Tracking URL (`https://zupestore.in/order-tracking?awb=1425893021`)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `🔎 Track Shipment`  
    * URL Type: Dynamic  
    * Destination: `https://zupestore.in/order-tracking?awb={{1}}`

---

### 6. Order Out for Delivery (OFD)
* **Template Name:** `zupe_out_for_delivery`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Dispatched automatically via Shiprocket webhook when the courier delivery driver begins their delivery route (status `OFD` / `13`).
* **Exact Body Text in Meta:**
```text
Hi {{1}}! 👋

*Your order is out for delivery!*🛵📦

🧾 Order ID: #{{2}}
💰 Amount to Pay: ₹{{3}}

Please ensure someone is available to receive your package.

💵 COD orders: Keep the payable amount ready.

Enjoy your new find! 🧡
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Clean Order ID (e.g. `1054`)
  * `{{3}}`: Balance Due at Doorstep (`₹668` for COD, `₹0` for prepaid)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `🛵 Live Track`  
    * URL Type: Dynamic  
    * Destination: `https://zupestore.in/order-tracking?query={{1}}`

---

### 7. Delivery Attempt Failed (NDR)
* **Template Name:** `zupe_delivery_attempt_failed`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Dispatched automatically via Shiprocket webhook when a delivery attempt fails (NDR status `19` - customer unavailable, phone switched off, incorrect address, etc.).
* **Exact Body Text in Meta:**
```text
Hi {{1}}! 👋

⚠️ Delivery Attempt Failed‼️

We couldn’t deliver your ZupeStore order. 📦

🧾 Order ID: #{{2}}
🛍️ Product: {{3}}

We’d like to help you receive your package.

ℹ️Please reply to let us know if you need assistance with your delivery address or another delivery attempt💬

We’re here to help! 🧡

Team ZupeStore🛒
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Clean Order ID (e.g. `1054`)
  * `{{3}}`: Primary Product Name (e.g. `Mini Portable Steam Iron`)
* **Customer Action:** Prompts customer to reply with address clarifications or preferred delivery re-attempt slot.

---

### 8. Order Delivered — Customer Feedback & Review
* **Template Name:** `zupe_order_delivered_feedback`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Dispatched automatically via Shiprocket webhook or admin panel when the package is successfully handed over (status `Delivered`).
* **Exact Body Text in Meta:**
```text
Hi {{1}}! 👋
😊Thank you for shopping with ZupeStore! 🧡
🙌🏻We’d love to hear about your experience with {{2}}. 🛍️

⭐ How was your purchase?
💬 What did you like about it?

Tap the button below to share your feedback. Your feedback helps us serve you better. ✨
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Purchased Product Name (e.g. `Mini Portable Steam Iron`)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `⭐ Leave a Review`  
    * URL Type: Dynamic  
    * Destination: `https://zupestore.in/products/{{1}}`  
    * Sample Parameter: `mini-portable-steam-iron#reviews`  
    * **Engineered Behavior:** Opens the purchased product page, smoothly scrolls straight down to the `#reviews` section, and **automatically opens the 5-star rating popup modal** so the customer can submit photos and feedback in seconds.

---

### 9. Order Cancelled
* **Template Name:** `zupe_order_cancelled`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Sent immediately when an order is cancelled online by the customer from `/orders` or by an administrator in `/admin/orders`.
* **Exact Body Text in Meta:**
```text
👋 Hi {{1}},

♨️Your order has been cancelled successfully. 📝

📦 Order ID: #{{2}}
🛍️ Product: {{3}}
💰 Order Amount: ₹{{4}}

{{5}}

❗️If you cancelled by mistake or need any help, feel free to contact us. 💬
+91 97441 22853

😊Thank you for considering ZupeStore! 🧡

🥰Team ZupeStore ✨
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Clean Order ID (e.g. `1054`)
  * `{{3}}`: Product Name (e.g. `Mini Portable Steam Iron`)
  * `{{4}}`: Order Total (e.g. `678`)
  * `{{5}}`: Refund Details (*"If prepaid, your refund has been initiated to your original payment method."* or *"Cash on Delivery cancelled. No amount due."*)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `🛍️ Browse Store`  
    * URL Type: Static  
    * Destination: `https://zupestore.in/products`

---

### 10. Refund Status Update
* **Template Name:** `zupe_refund_update`
* **Category:** `Utility` | **Language:** `English (en)`
* **When It Triggers:** Sent when an administrator initiates an instant or manual refund via Razorpay in the Admin Panel (`/admin/orders` or `/admin/payments`).
* **Exact Body Text in Meta:**
```text
Hi {{1}}! 👋

ℹ️Here’s an update on your ZupeStore refund. 💰

🧾 Order ID: #{{2}}
💵 Refund Amount: ₹{{3}}
📌 Status: {{4}}

We’ll share further updates when available.✅

Thank you for your patience! 🧡

Team ZupeStore
```
* **Variables:**
  * `{{1}}`: Customer First Name (e.g. `Rahul`)
  * `{{2}}`: Clean Order ID (e.g. `1054`)
  * `{{3}}`: Refund Amount (e.g. `678`)
  * `{{4}}`: Current Status (e.g. `Refunded to original payment method (Processed)`)
* **Button (Type: Visit Website):**
  * **Button 1 (`index: 0`):** `🔎 View Order Status`  
    * URL Type: Dynamic  
    * Destination: `https://zupestore.in/orders?query={{1}}`

---

### 11. Customer Login OTP
* **Template Name:** `zupe_login_otp`
* **Category:** `Authentication` | **Language:** `English (en)`
* **When It Triggers:** Dispatched instantly when a user enters their mobile number on the login page (`/signin` or checkout OTP modal).
* **Exact Body Text in Meta:**
```text
{{1}} is your verification code. For your security, do not share this code.
```
* **Variables:**
  * `{{1}}`: 6-digit numeric OTP (e.g. `582910`)
* **Button (Type: Copy Code):**
  * **Button 1 (`index: 0`):** `Copy Code`  
    * Copies the OTP to clipboard with 1 tap.

---

## 🛠️ Code Architecture & Webhook Handlers

| Feature / Lifecycle Stage | Source Code Location | Webhook / Endpoint |
|---|---|---|
| **Core WhatsApp Dispatcher** | `src/lib/whatsappOrderConfirmation.ts` | Dispatches official templates + direct fallback |
| **Authentication & OTP** | `src/lib/whatsappOtp.ts` | `/api/auth/whatsapp/send-otp`, `/api/auth/whatsapp/verify-otp` |
| **Order Confirmation / Verify** | `src/app/api/orders/whatsapp-confirm/route.ts` | Receives button clicks from `zupe_order_verify` |
| **COD Switch to Prepaid API** | `src/app/api/orders/switch-to-prepaid/route.ts` | Calculates ₹30 discount & generates Razorpay order |
| **Razorpay Payment Capture** | `src/app/api/razorpay/verify-payment/route.ts` | Webhook listener for `payment.captured` & `order.paid` |
| **Shiprocket Delivery Webhooks** | `src/lib/shiprocketService.ts` | `/api/webhooks/shiprocket` (Shipped, OFD, NDR, Delivered) |
| **Abandoned Cart Recovery Cron** | `src/lib/abandonedCartService.ts` | `/api/cron/abandoned-checkouts` |
| **Order Cancellation Handler** | `src/app/api/orders/cancel/route.ts` | Manages stock restock, refund calculation & WhatsApp alerts |
| **Product Review Auto-Opener** | `src/components/ProductReviewsSection.tsx` | Smooth scroll to `#reviews` and triggers rating modal |

---

## 💡 Important Rules & Best Practices

1. **Meta Delivery Window Rule:**  
   Standard free-form text messages can only be delivered if the customer has sent a message to the business within the previous **24 hours**. Because Zupe Store utilizes approved **Utility** and **Marketing** templates, messages are guaranteed delivery at any time, even weeks after the order was placed.
2. **Self-Message Block in Meta:**  
   Meta's API will reject messages sent from a WhatsApp Business Account to its own registered number (`+91 97781 37954`). All end-to-end testing must be performed using an external customer mobile number.
3. **Dynamic URL Parameter Rule:**  
   Meta strictly mandates that dynamic variables in website buttons must be at the very end of the URL string (e.g. `https://zupestore.in/orders?query={{1}}`). The backend automatically parses and passes values formatted for clean browser resolution.
4. **Diagnostic Tool:**  
   To test any phone number against the live Meta API at any time, visit:
   ```text
   https://zupestore.in/api/whatsapp-test?phone=919876543210
   ```
