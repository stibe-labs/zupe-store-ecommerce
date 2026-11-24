import assert from "node:assert/strict";
import crypto from "node:crypto";

// Pure Web Crypto HMAC verifier matching src/lib/pydartPay.ts verifyPyDartWebhookSignature
async function verifyPyDartWebhookSignatureLocal(rawBody, signatureHeader, timestampHeader, secret, nowSec) {
  if (!secret || !signatureHeader) return false;
  let timestampStr = (timestampHeader || "").trim();
  let providedHex = "";
  for (const part of signatureHeader.split(",")) {
    const [rawK, ...rest] = part.trim().split("=");
    const k = rawK?.trim();
    const v = rest.join("=").trim();
    if (k === "t" && v) timestampStr = v;
    if (k === "v1" && v) providedHex = v.toLowerCase();
  }
  if (!timestampStr || !providedHex || !/^[0-9a-f]{64}$/.test(providedHex)) return false;
  const tsSec = Number(timestampStr);
  if (!Number.isFinite(tsSec) || tsSec <= 0) return false;
  if (Math.abs(nowSec - tsSec) > 300) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestampStr}.${rawBody}`));
  const expectedHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return crypto.timingSafeEqual(Buffer.from(expectedHex), Buffer.from(providedHex));
}

async function run() {
  const secret = "whsec_test_pydart_turkiyejam_0123456789abcdef";
  const nowSec = 1795540000;
  const payload = JSON.stringify({
    order_id: "ord_pydart_abc123",
    merchant_order_id: "ord_tj_1001",
    order_status: "success",
    amount_paise: 89900,
    utr: "632820093606",
  });

  const validSigHex = crypto
    .createHmac("sha256", secret)
    .update(`${nowSec}.${payload}`)
    .digest("hex");
  const validHeader = `t=${nowSec},v1=${validSigHex}`;

  // 1. Valid signature passes
  assert.equal(
    await verifyPyDartWebhookSignatureLocal(payload, validHeader, String(nowSec), secret, nowSec + 10),
    true,
    "Valid HMAC signature within 300s window must pass"
  );

  // 2. Tampered body fails
  const tampered = payload.replace("89900", "100");
  assert.equal(
    await verifyPyDartWebhookSignatureLocal(tampered, validHeader, String(nowSec), secret, nowSec + 10),
    false,
    "Tampered payload must fail HMAC verification"
  );

  // 3. Expired timestamp (> 300s) fails anti-replay guard
  assert.equal(
    await verifyPyDartWebhookSignatureLocal(payload, validHeader, String(nowSec), secret, nowSec + 301),
    false,
    "Timestamp older than 300s must fail replay check"
  );

  // 4. Missing/malformed signature fails
  assert.equal(
    await verifyPyDartWebhookSignatureLocal(payload, "t=123,v1=nothex", "123", secret, 123),
    false,
    "Malformed signature must fail"
  );

  console.log("PASS: All 4 PyDart Pay webhook HMAC & anti-replay assertions passed.");
}

run().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
