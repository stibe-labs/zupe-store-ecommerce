/**
 * Unified Meta WhatsApp Cloud API Inbound Payload Parser & Media URL Security Validator.
 *
 * Converts every Meta Cloud API v21.0 webhook message type into a normalized,
 * structured payload for D1 persistence and rich Admin WhatsApp Desk rendering.
 */

export type WhatsAppRichMessageType =
  | "text"
  | "image"
  | "video"
  | "voice"
  | "document"
  | "sticker"
  | "location"
  | "contacts"
  | "order"
  | "interactive"
  | "reaction"
  | "unsupported"
  | "system"
  | "order_card"
  | "tracking_card"
  | "product_card"
  | "template";

export interface WhatsAppLocationData {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  url?: string;
  mapsUrl: string;
}

export interface WhatsAppContactCard {
  formattedName: string;
  company?: string;
  title?: string;
  phones: Array<{ phone: string; type?: string; waId?: string }>;
  emails: Array<{ email: string; type?: string }>;
  urls?: string[];
  addresses?: string[];
}

export interface WhatsAppCatalogOrderData {
  catalogId?: string;
  text?: string;
  currency: string;
  totalAmount: number;
  items: Array<{
    productRetailerId: string;
    quantity: number;
    itemPrice: number;
    currency: string;
  }>;
}

export interface WhatsAppAdReferralData {
  sourceType?: string;
  sourceId?: string;
  sourceUrl?: string;
  headline?: string;
  body?: string;
  mediaType?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface WhatsAppInteractiveData {
  subtype: "button_reply" | "list_reply" | "nfm_reply" | "button" | "unknown";
  id?: string;
  title?: string;
  description?: string;
  flowFields?: Array<{ key: string; value: string }>;
}

export interface WhatsAppUnsupportedData {
  code?: number | string;
  title?: string;
  message?: string;
  details?: string;
  rawType?: string;
  rawKeys?: string[];
}

export interface WhatsAppMessageMetadata {
  mediaId?: string;
  mimeType?: string;
  filename?: string;
  sha256?: string;
  animated?: boolean;
  isVoiceNote?: boolean;
  location?: WhatsAppLocationData;
  contacts?: WhatsAppContactCard[];
  catalogOrder?: WhatsAppCatalogOrderData;
  referral?: WhatsAppAdReferralData;
  interactive?: WhatsAppInteractiveData;
  reaction?: {
    targetWaMessageId: string;
    emoji: string;
  };
  unsupported?: WhatsAppUnsupportedData;
  forwarded?: boolean;
  frequentlyForwarded?: boolean;
  quotedWaMessageId?: string;
  referredProduct?: {
    catalogId?: string;
    productRetailerId?: string;
  };
  replyTo?: {
    id: string;
    sender: string;
    snippet: string;
  };
  orderData?: {
    orderId: string;
    totalAmount: number;
    itemsSummary: string;
    status: string;
    paymentMethod: string;
    shippingAddress?: string;
    awb?: string;
    courier?: string;
  };
  productData?: {
    name: string;
    price: number;
    mrp?: number;
    image: string;
    badge?: string;
    description: string;
  };
  rawSummary?: string;
}

export interface ParsedInboundWhatsAppMessage {
  waMessageId?: string;
  from: string;
  profileName?: string;
  sender: "customer" | "system";
  type: WhatsAppRichMessageType;
  content: string;
  mediaUrl?: string;
  mediaCaption?: string;
  metadata?: WhatsAppMessageMetadata;
  timestampIso?: string;
}

const META_MEDIA_ID_REGEX = /^\d{5,35}$/;

const ALLOWED_META_MEDIA_HOST_PATTERNS: RegExp[] = [
  /^lookaside\.fbsbx\.com$/i,
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.fbsbx\.com$/i,
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.fbcdn\.net$/i,
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.whatsapp\.net$/i,
];

const AUTH_ELIGIBLE_META_HOSTS: RegExp[] = [
  /^graph\.facebook\.com$/i,
  /^lookaside\.fbsbx\.com$/i,
];

/**
 * Validates that a Meta WhatsApp media ID is strictly numeric.
 */
export function isValidMetaMediaId(mediaId: string | null | undefined): mediaId is string {
  return typeof mediaId === "string" && META_MEDIA_ID_REGEX.test(mediaId.trim());
}

/**
 * Validates that a direct media URL is HTTPS and points strictly to a known Meta CDN host.
 * Prevents SSRF and credential exfiltration.
 */
export function isAllowedMetaMediaUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    return ALLOWED_META_MEDIA_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname));
  } catch {
    return false;
  }
}

/**
 * Determines whether the WhatsApp Bearer token may safely be attached to a request host.
 */
export function shouldAttachMetaBearerToken(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    return AUTH_ELIGIBLE_META_HOSTS.some((pattern) => pattern.test(parsed.hostname));
  } catch {
    return false;
  }
}

/**
 * Sanitizes external links (e.g. ad referral URLs or location links) to http/https only.
 */
export function sanitizeExternalUrl(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return undefined;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sanitizes a filename for safe use in Content-Disposition headers.
 */
export function sanitizeDownloadFilename(rawName: string | null | undefined, fallback = "whatsapp-attachment"): string {
  const cleaned = String(rawName || "")
    .replace(/[\r\n"\\/\0]/g, "_")
    .replace(/[^\w.\- ()]/g, "_")
    .trim();
  if (!cleaned || cleaned === "." || cleaned === "..") return fallback;
  return cleaned.slice(0, 120);
}

function buildMediaProxyUrl(mediaId?: string): string | undefined {
  if (!isValidMetaMediaId(mediaId)) return undefined;
  return `/api/admin/whatsapp/media?mediaId=${encodeURIComponent(mediaId.trim())}`;
}

function normalizeContacts(rawContacts: any[]): WhatsAppContactCard[] {
  return rawContacts
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const nameObj = c.name || {};
      const formattedName =
        nameObj.formatted_name ||
        [nameObj.first_name, nameObj.middle_name, nameObj.last_name].filter(Boolean).join(" ").trim() ||
        c.org?.company ||
        "Shared Contact";

      const phones = Array.isArray(c.phones)
        ? c.phones
            .filter((p: any) => p && (p.phone || p.wa_id))
            .map((p: any) => ({
              phone: String(p.phone || p.wa_id).trim(),
              type: p.type ? String(p.type) : undefined,
              waId: p.wa_id ? String(p.wa_id) : undefined,
            }))
        : [];

      const emails = Array.isArray(c.emails)
        ? c.emails
            .filter((e: any) => e && e.email)
            .map((e: any) => ({
              email: String(e.email).trim(),
              type: e.type ? String(e.type) : undefined,
            }))
        : [];

      const urls = Array.isArray(c.urls)
        ? c.urls.map((u: any) => sanitizeExternalUrl(u?.url)).filter((u: string | undefined): u is string => Boolean(u))
        : undefined;

      const addresses = Array.isArray(c.addresses)
        ? c.addresses
            .map((a: any) =>
              [a?.street, a?.city, a?.state, a?.zip, a?.country].filter(Boolean).join(", ").trim()
            )
            .filter(Boolean)
        : undefined;

      return {
        formattedName,
        company: c.org?.company ? String(c.org.company) : undefined,
        title: c.org?.title ? String(c.org.title) : undefined,
        phones,
        emails,
        urls: urls && urls.length > 0 ? urls : undefined,
        addresses: addresses && addresses.length > 0 ? addresses : undefined,
      };
    });
}

function parseReferral(raw: any): WhatsAppAdReferralData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const referral: WhatsAppAdReferralData = {
    sourceType: raw.source_type ? String(raw.source_type) : undefined,
    sourceId: raw.source_id ? String(raw.source_id) : undefined,
    sourceUrl: sanitizeExternalUrl(raw.source_url),
    headline: raw.headline ? String(raw.headline).trim() : undefined,
    body: raw.body ? String(raw.body).trim() : undefined,
    mediaType: raw.media_type ? String(raw.media_type) : undefined,
    imageUrl: sanitizeExternalUrl(raw.image_url),
    videoUrl: sanitizeExternalUrl(raw.video_url),
    thumbnailUrl: sanitizeExternalUrl(raw.thumbnail_url),
  };

  if (
    !referral.headline &&
    !referral.body &&
    !referral.sourceUrl &&
    !referral.imageUrl &&
    !referral.videoUrl
  ) {
    return undefined;
  }
  return referral;
}

function parseFlowResponseFields(responseJson: unknown): Array<{ key: string; value: string }> {
  if (typeof responseJson !== "string" || !responseJson.trim()) return [];
  try {
    const parsed = JSON.parse(responseJson);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.entries(parsed)
      .filter(([k]) => k !== "flow_token")
      .slice(0, 20)
      .map(([k, v]) => ({
        key: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
        value: typeof v === "string" ? v : JSON.stringify(v),
      }));
  } catch {
    return [];
  }
}

function extractProfileName(from: string, valueContacts?: any[]): string | undefined {
  if (!Array.isArray(valueContacts) || !from) return undefined;
  const normFrom = from.replace(/\D/g, "");
  const matched = valueContacts.find((c) => {
    const waId = String(c?.wa_id || "").replace(/\D/g, "");
    return waId && (waId === normFrom || (normFrom.length >= 10 && waId.endsWith(normFrom.slice(-10))));
  });
  const name = matched?.profile?.name;
  return typeof name === "string" && name.trim().length > 0 ? name.trim() : undefined;
}

/**
 * Parses a single inbound Meta WhatsApp Cloud API message object.
 */
export function parseMetaInboundMessage(
  msg: any,
  valueContacts?: any[]
): ParsedInboundWhatsAppMessage | null {
  if (!msg || typeof msg !== "object" || !msg.from) return null;

  const from = String(msg.from);
  const waMessageId = typeof msg.id === "string" ? msg.id : undefined;
  const profileName = extractProfileName(from, valueContacts);
  const timestampSec = Number(msg.timestamp);
  const timestampIso =
    Number.isFinite(timestampSec) && timestampSec > 0
      ? new Date(timestampSec * 1000).toISOString()
      : undefined;

  const metadata: WhatsAppMessageMetadata = {};

  // Cross-cutting context: quote, forwarded, referred product
  if (msg.context && typeof msg.context === "object") {
    if (typeof msg.context.id === "string" && msg.context.id.trim()) {
      metadata.quotedWaMessageId = msg.context.id.trim();
    }
    if (msg.context.forwarded) metadata.forwarded = true;
    if (msg.context.frequently_forwarded) {
      metadata.forwarded = true;
      metadata.frequentlyForwarded = true;
    }
    if (msg.context.referred_product && typeof msg.context.referred_product === "object") {
      metadata.referredProduct = {
        catalogId: msg.context.referred_product.catalog_id
          ? String(msg.context.referred_product.catalog_id)
          : undefined,
        productRetailerId: msg.context.referred_product.product_retailer_id
          ? String(msg.context.referred_product.product_retailer_id)
          : undefined,
      };
    }
  }

  // Cross-cutting Click-to-WhatsApp Meta Ad referral
  const referral = parseReferral(msg.referral);
  if (referral) {
    metadata.referral = referral;
  }

  let effectiveType = String(msg.type || "").toLowerCase();

  // Defensive check: if Meta marked type="unsupported" or omitted type, inspect whether
  // a known content payload is actually attached on the message object.
  if (!effectiveType || effectiveType === "unsupported") {
    if (msg.text?.body) effectiveType = "text";
    else if (msg.image?.id) effectiveType = "image";
    else if (msg.video?.id) effectiveType = "video";
    else if (msg.audio?.id || msg.voice?.id) effectiveType = "audio";
    else if (msg.document?.id) effectiveType = "document";
    else if (msg.sticker?.id) effectiveType = "sticker";
    else if (msg.location && typeof msg.location.latitude === "number") effectiveType = "location";
    else if (Array.isArray(msg.contacts) && msg.contacts.length > 0) effectiveType = "contacts";
    else if (msg.order?.product_items) effectiveType = "order";
    else if (msg.reaction?.message_id) effectiveType = "reaction";
    else if (msg.interactive) effectiveType = "interactive";
    else if (msg.button) effectiveType = "button";
  }

  let type: WhatsAppRichMessageType = "text";
  let sender: "customer" | "system" = "customer";
  let content = "";
  let mediaUrl: string | undefined;
  let mediaCaption: string | undefined;

  switch (effectiveType) {
    case "text": {
      type = "text";
      content = String(msg.text?.body || "").trim() || "(Empty message)";
      break;
    }

    case "image": {
      type = "image";
      const img = msg.image || {};
      const caption = typeof img.caption === "string" ? img.caption.trim() : "";
      mediaUrl = buildMediaProxyUrl(img.id);
      mediaCaption = caption || undefined;
      content = caption || "📷 Photo";
      metadata.mediaId = img.id ? String(img.id) : undefined;
      metadata.mimeType = img.mime_type ? String(img.mime_type) : undefined;
      metadata.sha256 = img.sha256 ? String(img.sha256) : undefined;
      break;
    }

    case "video": {
      type = "video";
      const vid = msg.video || {};
      const caption = typeof vid.caption === "string" ? vid.caption.trim() : "";
      mediaUrl = buildMediaProxyUrl(vid.id);
      mediaCaption = caption || undefined;
      content = caption || "🎥 Video";
      metadata.mediaId = vid.id ? String(vid.id) : undefined;
      metadata.mimeType = vid.mime_type ? String(vid.mime_type) : undefined;
      metadata.sha256 = vid.sha256 ? String(vid.sha256) : undefined;
      break;
    }

    case "audio":
    case "voice": {
      type = "voice";
      const aud = msg.audio || msg.voice || {};
      const isVoice = aud.voice === true || effectiveType === "voice";
      mediaUrl = buildMediaProxyUrl(aud.id);
      content = isVoice ? "🎤 Voice note" : "🎵 Audio message";
      metadata.mediaId = aud.id ? String(aud.id) : undefined;
      metadata.mimeType = aud.mime_type ? String(aud.mime_type) : undefined;
      metadata.sha256 = aud.sha256 ? String(aud.sha256) : undefined;
      metadata.isVoiceNote = isVoice;
      break;
    }

    case "document": {
      type = "document";
      const doc = msg.document || {};
      const filename = typeof doc.filename === "string" && doc.filename.trim() ? doc.filename.trim() : undefined;
      const caption = typeof doc.caption === "string" && doc.caption.trim() ? doc.caption.trim() : undefined;
      mediaUrl = buildMediaProxyUrl(doc.id);
      mediaCaption = caption;
      content = filename || caption || "Document";
      metadata.mediaId = doc.id ? String(doc.id) : undefined;
      metadata.mimeType = doc.mime_type ? String(doc.mime_type) : undefined;
      metadata.filename = filename;
      metadata.sha256 = doc.sha256 ? String(doc.sha256) : undefined;
      break;
    }

    case "sticker": {
      type = "sticker";
      const stk = msg.sticker || {};
      mediaUrl = buildMediaProxyUrl(stk.id);
      content = stk.animated ? "🎨 Animated sticker" : "🎨 Sticker";
      metadata.mediaId = stk.id ? String(stk.id) : undefined;
      metadata.mimeType = stk.mime_type ? String(stk.mime_type) : "image/webp";
      metadata.animated = Boolean(stk.animated);
      metadata.sha256 = stk.sha256 ? String(stk.sha256) : undefined;
      break;
    }

    case "location": {
      type = "location";
      const loc = msg.location || {};
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
      const mapsUrl = hasCoords
        ? `https://maps.google.com/?q=${lat},${lng}`
        : sanitizeExternalUrl(loc.url) || "https://maps.google.com";
      const name = typeof loc.name === "string" && loc.name.trim() ? loc.name.trim() : undefined;
      const address = typeof loc.address === "string" && loc.address.trim() ? loc.address.trim() : undefined;
      const url = sanitizeExternalUrl(loc.url);

      metadata.location = {
        latitude: hasCoords ? lat : 0,
        longitude: hasCoords ? lng : 0,
        name,
        address,
        url,
        mapsUrl,
      };
      const label = [name, address].filter(Boolean).join(" — ") || (hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Shared Location");
      content = `📍 ${label}`;
      break;
    }

    case "contacts": {
      type = "contacts";
      const cards = normalizeContacts(Array.isArray(msg.contacts) ? msg.contacts : []);
      metadata.contacts = cards;
      if (cards.length === 1) {
        const c = cards[0];
        const phoneStr = c.phones[0]?.phone ? ` (${c.phones[0].phone})` : "";
        content = `👤 Contact: ${c.formattedName}${phoneStr}`;
      } else if (cards.length > 1) {
        content = `👥 ${cards.length} Shared Contacts: ${cards.map((c) => c.formattedName).join(", ")}`;
      } else {
        content = "👤 Shared Contact";
      }
      break;
    }

    case "reaction": {
      type = "reaction";
      const reactionObj = msg.reaction || {};
      const emoji = typeof reactionObj.emoji === "string" ? reactionObj.emoji : "";
      const targetWaMessageId = typeof reactionObj.message_id === "string" ? reactionObj.message_id : "";
      metadata.reaction = {
        targetWaMessageId,
        emoji,
      };
      content = emoji ? `${emoji} Reacted to a message` : "Removed reaction";
      break;
    }

    case "interactive": {
      type = "interactive";
      const inter = msg.interactive || {};
      const sub = String(inter.type || "").toLowerCase();
      if (sub === "button_reply" && inter.button_reply) {
        const title = String(inter.button_reply.title || inter.button_reply.id || "Button reply").trim();
        metadata.interactive = {
          subtype: "button_reply",
          id: inter.button_reply.id ? String(inter.button_reply.id) : undefined,
          title,
        };
        content = title;
      } else if (sub === "list_reply" && inter.list_reply) {
        const title = String(inter.list_reply.title || inter.list_reply.id || "List selection").trim();
        const description = inter.list_reply.description ? String(inter.list_reply.description).trim() : undefined;
        metadata.interactive = {
          subtype: "list_reply",
          id: inter.list_reply.id ? String(inter.list_reply.id) : undefined,
          title,
          description,
        };
        content = description ? `${title} — ${description}` : title;
      } else if (sub === "nfm_reply" && inter.nfm_reply) {
        const fields = parseFlowResponseFields(inter.nfm_reply.response_json);
        const title = String(inter.nfm_reply.body || inter.nfm_reply.name || "WhatsApp Flow Submitted").trim();
        metadata.interactive = {
          subtype: "nfm_reply",
          title,
          flowFields: fields,
        };
        content =
          fields.length > 0
            ? `${title}: ${fields.map((f) => `${f.key}: ${f.value}`).join(" • ")}`
            : title;
      } else {
        metadata.interactive = {
          subtype: "unknown",
          title: "Interactive response",
        };
        content = "Interactive response";
      }
      break;
    }

    case "button": {
      type = "interactive";
      const btn = msg.button || {};
      const title = String(btn.text || btn.payload || "Button clicked").trim();
      metadata.interactive = {
        subtype: "button",
        title,
        id: btn.payload ? String(btn.payload) : undefined,
      };
      content = title;
      break;
    }

    case "order": {
      type = "order";
      const ord = msg.order || {};
      const rawItems = Array.isArray(ord.product_items) ? ord.product_items : [];
      const items = rawItems.map((it: any) => ({
        productRetailerId: String(it.product_retailer_id || "Item"),
        quantity: Number(it.quantity || 1),
        itemPrice: Number(it.item_price || 0),
        currency: String(it.currency || "INR"),
      }));
      const currency = items[0]?.currency || "INR";
      const totalAmount = items.reduce((sum: number, it: { quantity: number; itemPrice: number }) => sum + it.quantity * it.itemPrice, 0);
      const note = typeof ord.text === "string" && ord.text.trim() ? ord.text.trim() : undefined;

      metadata.catalogOrder = {
        catalogId: ord.catalog_id ? String(ord.catalog_id) : undefined,
        text: note,
        currency,
        totalAmount,
        items,
      };
      const itemCount = items.reduce((sum: number, it: { quantity: number }) => sum + it.quantity, 0);
      content = `🛒 WhatsApp Catalog Cart (${itemCount} ${itemCount === 1 ? "item" : "items"} • ${currency} ${totalAmount.toLocaleString("en-IN")})${note ? ` — ${note}` : ""}`;
      break;
    }

    case "system": {
      type = "system";
      sender = "system";
      content = String(msg.system?.body || "Customer WhatsApp account updated").trim();
      break;
    }

    case "request_welcome": {
      type = "system";
      sender = "system";
      content = "Customer opened a new chat session";
      break;
    }

    case "unsupported": {
      type = "unsupported";
      const firstErr = Array.isArray(msg.errors) && msg.errors.length > 0 ? msg.errors[0] : undefined;
      const knownEnvelopeKeys = new Set(["from", "id", "timestamp", "type", "errors", "context", "referral"]);
      const extraKeys = Object.keys(msg).filter((k) => !knownEnvelopeKeys.has(k));

      const errDetails =
        firstErr?.error_data?.details ||
        firstErr?.message ||
        firstErr?.title ||
        undefined;

      metadata.unsupported = {
        code: firstErr?.code,
        title: firstErr?.title ? String(firstErr.title) : "Unsupported on WhatsApp Cloud API",
        message: firstErr?.message ? String(firstErr.message) : undefined,
        details: errDetails ? String(errDetails) : undefined,
        rawType: "unsupported",
        rawKeys: extraKeys.length > 0 ? extraKeys : undefined,
      };

      content = firstErr?.code
        ? `WhatsApp Cloud API restricted message (Error ${firstErr.code}${firstErr.title ? `: ${firstErr.title}` : ""})`
        : "WhatsApp Cloud API restricted format (e.g. View-Once media, Poll, Live Location, or Deleted message)";
      break;
    }

    default: {
      // Unknown / future Meta message type: try to extract any media ID or readable fields
      const rawPayload = msg[effectiveType];
      if (rawPayload && typeof rawPayload === "object" && isValidMetaMediaId(rawPayload.id)) {
        type = "document";
        mediaUrl = buildMediaProxyUrl(rawPayload.id);
        metadata.mediaId = String(rawPayload.id);
        metadata.mimeType = rawPayload.mime_type ? String(rawPayload.mime_type) : undefined;
        metadata.filename = rawPayload.filename ? String(rawPayload.filename) : `${effectiveType}-attachment`;
        mediaCaption = rawPayload.caption ? String(rawPayload.caption) : undefined;
        content = metadata.filename;
      } else {
        type = "unsupported";
        const snippet =
          (rawPayload && typeof rawPayload === "object"
            ? rawPayload.body || rawPayload.text || rawPayload.caption || rawPayload.title
            : undefined) ||
          (msg.text?.body ? String(msg.text.body) : undefined);

        metadata.unsupported = {
          title: `Unhandled WhatsApp format (${effectiveType || "unknown"})`,
          details: snippet ? String(snippet) : undefined,
          rawType: effectiveType || "unknown",
        };
        if (rawPayload && typeof rawPayload === "object") {
          metadata.rawSummary = JSON.stringify(rawPayload).slice(0, 400);
        }
        content = snippet
          ? String(snippet)
          : `WhatsApp message type "${effectiveType || "unknown"}"`;
      }
      break;
    }
  }

  const hasMetadata = Object.keys(metadata).length > 0;

  return {
    waMessageId,
    from,
    profileName,
    sender,
    type,
    content,
    mediaUrl,
    mediaCaption,
    metadata: hasMetadata ? metadata : undefined,
    timestampIso,
  };
}
