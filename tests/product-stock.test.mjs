import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAuthoritativeStock } from "../src/lib/stockResolution.ts";

describe("Authoritative Product Stock Resolution", () => {
  it("never clamps restocked D1 inventory downward against a stale 0 memory override", () => {
    const res = resolveAuthoritativeStock({
      d1Stock: 50,
      d1InStock: 1,
      memOverride: { stock_count: 0, in_stock: 0 },
      defaultStock: 20,
      defaultInStock: 1,
    });
    assert.deepEqual(res, { stock_count: 50, in_stock: 1 });
  });

  it("forces in_stock to 0 whenever D1 stock_count is 0", () => {
    const res = resolveAuthoritativeStock({
      d1Stock: 0,
      d1InStock: 1,
      memOverride: { stock_count: 30, in_stock: 1 },
    });
    assert.deepEqual(res, { stock_count: 0, in_stock: 0 });
  });

  it("respects explicit admin Out-of-Stock toggle even when D1 stock_count > 0", () => {
    const res = resolveAuthoritativeStock({
      d1Stock: 25,
      d1InStock: 0,
      memOverride: { stock_count: 25, in_stock: 1 },
    });
    assert.deepEqual(res, { stock_count: 25, in_stock: 0 });
  });

  it("falls back to memory override only when D1 is unavailable (d1Stock === null)", () => {
    const res = resolveAuthoritativeStock({
      d1Stock: null,
      d1InStock: null,
      memOverride: { stock_count: 12, in_stock: 1 },
      defaultStock: 50,
      defaultInStock: 1,
    });
    assert.deepEqual(res, { stock_count: 12, in_stock: 1 });
  });

  it("clamps negative or fractional D1 values safely to non-negative integers", () => {
    assert.deepEqual(
      resolveAuthoritativeStock({ d1Stock: -5, d1InStock: 1, memOverride: null }),
      { stock_count: 0, in_stock: 0 }
    );
    assert.deepEqual(
      resolveAuthoritativeStock({ d1Stock: 14.9, d1InStock: 1, memOverride: null }),
      { stock_count: 14, in_stock: 1 }
    );
  });
});
