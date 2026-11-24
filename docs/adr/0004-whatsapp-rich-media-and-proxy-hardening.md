# ADR 0004: Unified WhatsApp Cloud API Rich-Content Capture & Media Proxy Hardening

- **Status:** Accepted
- **Date:** 2026-11-24
- **Context:** Turkiye Jam Admin WhatsApp Desk (`https://turkiyejam.com/admin/whatsapp`)

## Context & Problem Statement
Live customer messages on Turkiye Jam's Admin WhatsApp Desk exhibited three systemic issues:
1. **Incomplete & Drifting Webhook Parsing:** Two separate webhook routes (`/api/webhooks/whatsapp` and `/api/whatsapp-webhook`) duplicated parsing logic and dropped captions on inbound images/documents, lacked `<video>` playback, cropped transparent WebP stickers, discarded `contacts` details beyond the first phone, ignored `reaction`, catalog `order`, WhatsApp Flow `nfm_reply`, Meta Click-to-WhatsApp `referral` ads, `context` quotes/forwards, and sender `profile.name`, and persisted a misleading generic error blaming `"sticker, contact card, or live location"` whenever Meta delivered `type: "unsupported"`.
2. **Broken Document Downloads & Unpersisted Reactions:** `MessageBubble.tsx` hardcoded fake `"PDF Document • 142 KB"` metadata with an unwired download button, and `addMessageReaction()` never persisted reactions to D1.
3. **Media Proxy SSRF & Auth Gap:** `/api/admin/whatsapp/media` was exempted from admin authentication in `src/middleware.ts`, accepted arbitrary `?url=` parameters, and forwarded `Authorization: Bearer <WHATSAPP_TOKEN>` to arbitrary URLs while defaulting fallback `Content-Type` to `audio/ogg` without HTTP `Range` support.

## Decision
1. **Additive D1 Schema (`turkiyejam-db`):** Add nullable `metadata TEXT` and `wa_message_id TEXT` columns to `whatsapp_messages`, indexed by `idx_wa_messages_wamid` and `idx_wa_messages_conv_created` for O(log N) quote/reaction/dedup lookups.
2. **Single-Source Inbound Parser (`src/lib/whatsappInboundParser.ts` + `src/lib/whatsappWebhookHandler.ts`):** Both `/api/webhooks/whatsapp` and `/api/whatsapp-webhook` delegate to a unified parser handling every Meta Cloud API v21.0 inbound type (`text`, `image`, `video`, `audio`/`voice`, `document`, `sticker`, `location`, multi-entry `contacts`, `reaction`, `interactive` button/list/Flows, `button`, catalog `order`, `system`, `request_welcome`, `unsupported` with exact `errors[0]` diagnostics, plus cross-cutting `referral`, `context`, and `profile.name`).
3. **Hardened Authenticated Media Proxy (`/api/admin/whatsapp/media`):**
   - Remove middleware auth exemption and enforce signed `ADMIN_COOKIE_NAME` verification inside the route.
   - Validate `mediaId` strictly (`/^\d{5,35}$/`) and restrict `url` to HTTPS Meta CDN hosts (`lookaside.fbsbx.com`, `*.fbcdn.net`, `*.whatsapp.net`, `*.fbsbx.com`).
   - Attach `Authorization: Bearer` exclusively to `graph.facebook.com` and `lookaside.fbsbx.com` with `AbortSignal.timeout`.
   - Infer accurate `Content-Type`, support HTTP `Range` (`206 Partial Content`) for Safari/Chrome `<video>` & `<audio>` scrubbing, and support safe `?download=1&filename=...` attachments.
4. **Honest Cloud API Boundary in UI:** Render rich native cards for every supported type, and for Meta-restricted client formats where Meta never transmits binaries (View-Once media, Polls, Live Location streams, Events, Recalled messages), show Meta's exact error code/reason plus a 1-click **"Ask customer to resend"** button.

## Consequences
- Zero unauthenticated media exposure or SSRF/token exfiltration surface.
- Zero webhook drift between `/api/webhooks/whatsapp` and `/api/whatsapp-webhook`, with `wa_message_id` idempotency against Meta webhook retries.
- Existing 92 historical messages remain fully backward-compatible; future inbound customer media and Meta Ad referrals display richly with zero reload.
