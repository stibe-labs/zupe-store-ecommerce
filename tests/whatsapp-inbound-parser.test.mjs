import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAllowedMetaMediaUrl,
  isValidMetaMediaId,
  parseMetaInboundMessage,
  sanitizeDownloadFilename,
  shouldAttachMetaBearerToken,
} from "../src/lib/whatsappInboundParser.ts";

const CONTACTS = [
  { wa_id: "918884410295", profile: { name: "Ijas Palakkad" } },
];

describe("WhatsApp Inbound Parser (Meta Cloud API v21.0)", () => {
  it("parses plain text with profile name, forwarded flag, and quoted context", () => {
    const res = parseMetaInboundMessage(
      {
        from: "918884410295",
        id: "wamid.text1",
        timestamp: "1795540000",
        type: "text",
        text: { body: "Hi, is 3 sachet pack available?" },
        context: {
          id: "wamid.prev0",
          forwarded: true,
          frequently_forwarded: true,
        },
      },
      CONTACTS
    );

    assert.ok(res);
    assert.equal(res.type, "text");
    assert.equal(res.profileName, "Ijas Palakkad");
    assert.equal(res.content, "Hi, is 3 sachet pack available?");
    assert.equal(res.metadata?.quotedWaMessageId, "wamid.prev0");
    assert.equal(res.metadata?.forwarded, true);
    assert.equal(res.metadata?.frequentlyForwarded, true);
  });

  it("parses image with caption and preserves mediaCaption separately", () => {
    const res = parseMetaInboundMessage(
      {
        from: "918884410295",
        id: "wamid.img1",
        type: "image",
        image: {
          id: "123456789012345",
          mime_type: "image/jpeg",
          caption: "Payment screenshot attached",
        },
      },
      CONTACTS
    );

    assert.ok(res);
    assert.equal(res.type, "image");
    assert.equal(res.mediaUrl, "/api/admin/whatsapp/media?mediaId=123456789012345");
    assert.equal(res.mediaCaption, "Payment screenshot attached");
    assert.equal(res.metadata?.mimeType, "image/jpeg");
  });

  it("parses video with caption", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.vid1",
      type: "video",
      video: {
        id: "987654321098765",
        mime_type: "video/mp4",
        caption: "Unboxing video",
      },
    });

    assert.ok(res);
    assert.equal(res.type, "video");
    assert.equal(res.mediaUrl, "/api/admin/whatsapp/media?mediaId=987654321098765");
    assert.equal(res.mediaCaption, "Unboxing video");
  });

  it("parses voice note and regular audio", () => {
    const voice = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.aud1",
      type: "audio",
      audio: { id: "5555555555555", mime_type: "audio/ogg; codecs=opus", voice: true },
    });
    assert.equal(voice?.type, "voice");
    assert.equal(voice?.content, "🎤 Voice note");
    assert.equal(voice?.metadata?.isVoiceNote, true);

    const audio = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.aud2",
      type: "audio",
      audio: { id: "5555555555556", mime_type: "audio/mpeg", voice: false },
    });
    assert.equal(audio?.type, "voice");
    assert.equal(audio?.content, "🎵 Audio message");
  });

  it("parses document with filename, mime type, and caption", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.doc1",
      type: "document",
      document: {
        id: "7777777777777",
        filename: "GST_Invoice_104.pdf",
        mime_type: "application/pdf",
        caption: "Please verify invoice",
      },
    });

    assert.ok(res);
    assert.equal(res.type, "document");
    assert.equal(res.content, "GST_Invoice_104.pdf");
    assert.equal(res.mediaCaption, "Please verify invoice");
    assert.equal(res.metadata?.filename, "GST_Invoice_104.pdf");
    assert.equal(res.metadata?.mimeType, "application/pdf");
  });

  it("parses static and animated stickers as type='sticker'", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.stk1",
      type: "sticker",
      sticker: { id: "4444444444444", mime_type: "image/webp", animated: true },
    });

    assert.ok(res);
    assert.equal(res.type, "sticker");
    assert.equal(res.metadata?.animated, true);
    assert.equal(res.mediaUrl, "/api/admin/whatsapp/media?mediaId=4444444444444");
  });

  it("parses location with coordinates, name, address, and Google Maps link", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.loc1",
      type: "location",
      location: {
        latitude: 10.7867,
        longitude: 76.6548,
        name: "Palakkad Town",
        address: "Thiruvegappura, Kerala 679304",
      },
    });

    assert.ok(res);
    assert.equal(res.type, "location");
    assert.equal(res.metadata?.location?.mapsUrl, "https://maps.google.com/?q=10.7867,76.6548");
    assert.equal(res.metadata?.location?.name, "Palakkad Town");
  });

  it("parses multiple shared contacts with org, phones, and emails", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.cnt1",
      type: "contacts",
      contacts: [
        {
          name: { formatted_name: "Arjun Menon" },
          org: { company: "Kochi Logistics", title: "Manager" },
          phones: [{ phone: "+91 98765 43210", type: "CELL" }],
          emails: [{ email: "arjun@example.com", type: "WORK" }],
        },
        {
          name: { first_name: "Neha" },
          phones: [{ phone: "+91 99999 11111" }],
        },
      ],
    });

    assert.ok(res);
    assert.equal(res.type, "contacts");
    assert.equal(res.metadata?.contacts?.length, 2);
    assert.equal(res.metadata?.contacts?.[0].company, "Kochi Logistics");
    assert.equal(res.metadata?.contacts?.[0].emails[0].email, "arjun@example.com");
  });

  it("parses reactions including removal", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.rx1",
      type: "reaction",
      reaction: { message_id: "wamid.target1", emoji: "❤️" },
    });

    assert.equal(res?.type, "reaction");
    assert.equal(res?.metadata?.reaction?.targetWaMessageId, "wamid.target1");
    assert.equal(res?.metadata?.reaction?.emoji, "❤️");
  });

  it("parses interactive list_reply, button_reply, and WhatsApp Flow nfm_reply", () => {
    const flow = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.flow1",
      type: "interactive",
      interactive: {
        type: "nfm_reply",
        nfm_reply: {
          name: "flow",
          body: "Order Details Submitted",
          response_json: JSON.stringify({
            flow_token: "secret_tok",
            pack_size: "3 Sachet Pack",
            pincode: "682001",
          }),
        },
      },
    });

    assert.equal(flow?.type, "interactive");
    assert.equal(flow?.metadata?.interactive?.subtype, "nfm_reply");
    assert.deepEqual(flow?.metadata?.interactive?.flowFields, [
      { key: "Pack Size", value: "3 Sachet Pack" },
      { key: "Pincode", value: "682001" },
    ]);
  });

  it("parses WhatsApp native catalog order and Meta Ad referral", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.ord1",
      type: "order",
      order: {
        catalog_id: "cat_001",
        text: "Deliver before Friday",
        product_items: [
          { product_retailer_id: "tj-3-sachet", quantity: 2, item_price: 1099, currency: "INR" },
        ],
      },
      referral: {
        source_type: "ad",
        headline: "Turkiye Jam — Authentic Anatolian Honey",
        body: "Free COD across Kerala",
        source_url: "https://fb.me/ad123",
      },
    });

    assert.equal(res?.type, "order");
    assert.equal(res?.metadata?.catalogOrder?.totalAmount, 2198);
    assert.equal(res?.metadata?.referral?.headline, "Turkiye Jam — Authentic Anatolian Honey");
    assert.equal(res?.metadata?.referral?.sourceUrl, "https://fb.me/ad123");
  });

  it("captures exact Meta error details on unsupported messages", () => {
    const res = parseMetaInboundMessage({
      from: "918884410295",
      id: "wamid.unsup1",
      type: "unsupported",
      errors: [
        {
          code: 131051,
          title: "Unsupported message type",
          message: "Message type is not currently supported",
          error_data: { details: "Message type is currently not supported." },
        },
      ],
    });

    assert.equal(res?.type, "unsupported");
    assert.equal(res?.metadata?.unsupported?.code, 131051);
    assert.equal(res?.metadata?.unsupported?.title, "Unsupported message type");
    assert.match(res?.content || "", /131051/);
  });

  it("enforces strict SSRF and Bearer-token allowlists on media proxy inputs", () => {
    assert.equal(isValidMetaMediaId("1234567890123"), true);
    assert.equal(isValidMetaMediaId("../etc/passwd"), false);
    assert.equal(isValidMetaMediaId("123"), false);

    assert.equal(isAllowedMetaMediaUrl("https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=123"), true);
    assert.equal(isAllowedMetaMediaUrl("https://scontent-bom1-1.xx.fbcdn.net/v/t1.jpg"), true);
    assert.equal(isAllowedMetaMediaUrl("https://media-bom1-1.cdn.whatsapp.net/v/t62.jpg"), true);
    assert.equal(isAllowedMetaMediaUrl("https://fbcdn.net.evil.com/steal"), false);
    assert.equal(isAllowedMetaMediaUrl("https://evil.example.com/steal-token"), false);
    assert.equal(isAllowedMetaMediaUrl("http://169.254.169.254/latest/meta-data/"), false);
    assert.equal(isAllowedMetaMediaUrl("https://user:pass@lookaside.fbsbx.com/x"), false);

    assert.equal(shouldAttachMetaBearerToken("https://lookaside.fbsbx.com/abc"), true);
    assert.equal(shouldAttachMetaBearerToken("https://graph.facebook.com/v21.0/123"), true);
    assert.equal(shouldAttachMetaBearerToken("https://scontent.fbcdn.net/abc"), false);

    assert.equal(sanitizeDownloadFilename("../../evil\r\n.pdf"), ".._.._evil__.pdf");
  });
});
