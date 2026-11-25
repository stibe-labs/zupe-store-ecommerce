import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ENABLED_CARD_NETWORKS,
  detectCardNetwork,
  extractPyDartOrderIdFromUrl,
  formatBankDisplayName,
  formatCardExpiryDisplay,
  formatCardNumberDisplay,
  isValidLuhn,
  parseCardExpiry,
  validateCardInput,
} from "../src/lib/cardUtils.ts";

test("detectCardNetwork detects RuPay, Visa, Mastercard, and Amex accurately", () => {
  assert.equal(detectCardNetwork("6070931100000001"), "rupay");
  assert.equal(detectCardNetwork("4111111111111111"), "visa");
  assert.equal(detectCardNetwork("5105105105105100"), "mastercard");
  assert.equal(detectCardNetwork("378282246310005"), "amex");
});

test("validateCardInput blocks disabled networks and expired cards", () => {
  const ref = new Date("2026-11-25T00:00:00Z");
  const amex = validateCardInput({
    number: "3782 8224 6310 005",
    expiry: "12 / 29",
    cvv: "1234",
    name: "Tishnu",
    enabledNetworks: DEFAULT_ENABLED_CARD_NETWORKS,
    referenceDate: ref,
  });
  assert.equal(amex.valid, false);

  const expired = parseCardExpiry("10 / 26", ref);
  assert.equal(expired.valid, false);
  assert.equal(isValidLuhn("4111111111111111"), true);
  assert.equal(formatCardNumberDisplay("4111111111111111"), "4111 1111 1111 1111");
  assert.equal(formatCardExpiryDisplay("1229"), "12 / 29");
});

test("extractPyDartOrderIdFromUrl handles both pydart.com and turkiyejam.com URLs", () => {
  assert.equal(
    extractPyDartOrderIdFromUrl("https://pydart.com/pay/ord_5aa8f57e0c3cb111ec"),
    "ord_5aa8f57e0c3cb111ec"
  );
  assert.equal(
    extractPyDartOrderIdFromUrl("https://turkiyejam.com/pay/ord_5aa8f57e0c3cb111ec?foo=1"),
    "ord_5aa8f57e0c3cb111ec"
  );
  assert.equal(extractPyDartOrderIdFromUrl("/pay/ord_123456"), "ord_123456");
});

test("formatBankDisplayName cleans verbose suffixes cleanly", () => {
  assert.equal(formatBankDisplayName("Bank of Baroda - Retail Banking"), "Bank of Baroda");
  assert.equal(
    formatBankDisplayName("PNB (Erstwhile-Oriental Bank of Commerce)"),
    "PNB (Oriental Bank of Commerce)"
  );
});
