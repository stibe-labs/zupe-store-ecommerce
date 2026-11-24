# ADR-0003: Integrate PyDart Pay White-Label Gateway for Tishnu Sub-Merchant (`acc_U448dnHAqswn5q`)

## Status
Accepted (2026-11-24)

## Context
Turkiye Jam (`zupe-store-ecommerce` on branch `turkiyejam.com`) previously routed checkout payments to a legacy Settler endpoint (`https://settler.pydart.com`) using a hardcoded bearer token and accepted a client-supplied `?paid=true` query flag during return verification. We need to route live storefront payments directly to Tishnu Thankappan's activated Razorpay Partner Sub-Merchant (`acc_U448dnHAqswn5q`, eligible for `₹5,00,000` / 90-day `0.00%` processing fee credits) via PyDart Pay's white-label checkout (`https://pydart.com/pay/<orderId>`) without exposing Razorpay's UI/UX, while preserving zero-change multi-PA switchover (Cashfree Easy Split / Paytm / PhonePe) after the promo window.

## Decision
1. **Provision Dedicated PyDart Tenant (`tnt_turkiyejam_tishnu`) on Live `pydart.com` (`pydart-pay-db`):**
   - Bound `sub_merchant_accounts` (`provider='razorpay'`, `provider_merchant_id='acc_U448dnHAqswn5q'`, `commission_bps=0`).
   - Issued a CSPRNG live API key (`sk_live_...`, SHA-256 hashed in `tenant_api_keys`) and AES-256-GCM encrypted `webhook_secret_cipher`.
   - Stored `PYDART_API_KEY` and `PYDART_WEBHOOK_SECRET` strictly in Cloudflare Worker Secrets (`wrangler secret put`) and git-ignored `.dev.vars` / `.env.local`.
2. **Add Dedicated PyDart Pay Client (`src/lib/pydartPay.ts`) & Idempotent Confirmation Pipeline (`src/lib/pydartOrderConfirmation.ts`):**
   - Order creation (`POST /api/cashfree/create-order`) calls `POST https://pydart.com/api/v1/payment-orders` with `Idempotency-Key`, 5s `AbortSignal.timeout(5000)`, and binds `pydartOrderId` onto the D1 `orders` row.
   - Browser return verification (`POST /api/cashfree/verify-payment`) removes the insecure `?paid=true` spoofing backdoor and verifies payments authoritatively via S2S `GET /api/v1/payment-order/:id` + exact `merchant_order_id` and amount matching.
   - Asynchronous webhook receiver (`POST /api/webhooks/pydart`) validates `x-pydart-signature: t=<unix>,v1=<hex>` using Web Crypto HMAC-SHA256 in constant time with a 300s anti-replay window.
   - Atomic `verified_payments` claim table prevents payment ID replay across orders and duplicate WhatsApp/email dispatches.

## Consequences
- **Zero Razorpay UI/UX:** Customers check out on `https://pydart.com/pay/<orderId>` (Turkiye Jam branded Dynamic QR + 1-tap UPI Intent paying `tishnuthankappa167699.rzp@rxaxis`).
- **RBI Non-Custodial Settlement (`₹0` Custody):** 100% of customer payments settle straight from Razorpay Escrow into Tishnu's verified bank account.
- **Zero-Code Multi-PA Failover:** After ₹5,00,000 or 90 days, switching `sub_merchant_accounts` priority on `pydart.com` to Cashfree Easy Split, Paytm PG, or PhonePe PG transitions Turkiye Jam silently to lifetime `0.00%` UPI with zero storefront changes.
