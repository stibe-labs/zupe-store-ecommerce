import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { executeD1Query } from "@/lib/d1";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { VALID_BRAND_LOGO_IDS } from "@/data/brandLogos";

export const runtime = "nodejs";

// Edge in-memory rate limit bucket (10 submissions per 15 min per client IP)
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 10;
const rateStore = new Map<string, { count: number; resetAt: number }>();

let tableInitialized = false;

async function ensureSelectionsTable(): Promise<void> {
  if (tableInitialized) return;
  await executeD1Query(`
    CREATE TABLE IF NOT EXISTS brand_logo_selections (
      id TEXT PRIMARY KEY,
      reference_id TEXT NOT NULL UNIQUE,
      client_name TEXT NOT NULL,
      client_contact TEXT DEFAULT '',
      favorite_id TEXT DEFAULT '',
      selected_ids TEXT NOT NULL,
      palette_mode TEXT DEFAULT 'curated',
      notes TEXT DEFAULT '',
      ip_hash TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);
  await executeD1Query(`
    CREATE INDEX IF NOT EXISTS idx_brand_logo_selections_created
    ON brand_logo_selections (created_at DESC)
  `);
  tableInitialized = true;
}

function sanitizeText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Direct non-browser or same-origin server calls
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    return (
      host === "vittallifestyle.com" ||
      host === "www.vittallifestyle.com" ||
      host === "admin.vittallifestyle.com" ||
      host.endsWith(".workers.dev") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

async function hashIp(ip: string): Promise<string> {
  const enc = new TextEncoder().encode(`vl-brand-salt:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count += 1;
  return true;
}

/**
 * POST /api/brand/selections
 * Saves a client's logo shortlist, top favorite, palette preference, and feedback notes to D1.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { success: false, error: "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    const rawIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const ipHash = await hashIp(rawIp);

    if (!checkRateLimit(ipHash)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many submissions in a short period. Please wait a few minutes and try again.",
        },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const clientName = sanitizeText(body.clientName, 80);
    if (clientName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const clientContact = sanitizeText(body.clientContact, 120);
    const notes = sanitizeText(body.notes, 1000);
    const paletteMode = sanitizeText(body.paletteMode, 60) || "curated";

    if (!Array.isArray(body.selectedIds)) {
      return NextResponse.json(
        { success: false, error: "Please select at least 1 logo concept." },
        { status: 400 }
      );
    }

    const dedupedValidIds = Array.from(
      new Set(
        body.selectedIds
          .map((v) => String(v).trim())
          .filter((id) => VALID_BRAND_LOGO_IDS.has(id))
      )
    ).slice(0, 15);

    if (dedupedValidIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least 1 valid logo concept (#01–#80)." },
        { status: 400 }
      );
    }

    const rawFav = sanitizeText(body.favoriteId, 10);
    const favoriteId =
      rawFav && dedupedValidIds.includes(rawFav) ? rawFav : dedupedValidIds[0];

    const id = crypto.randomUUID();
    const randomBytes = new Uint8Array(3);
    crypto.getRandomValues(randomBytes);
    const refSuffix = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const referenceId = `VL-BRAND-${refSuffix}`;
    const createdAt = new Date().toISOString();

    await ensureSelectionsTable();
    const res = await executeD1Query(
      `INSERT INTO brand_logo_selections (
        id, reference_id, client_name, client_contact,
        favorite_id, selected_ids, palette_mode, notes, ip_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        referenceId,
        clientName,
        clientContact,
        favoriteId,
        JSON.stringify(dedupedValidIds),
        paletteMode,
        notes,
        ipHash,
        createdAt,
      ]
    );

    if (res === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not save selection right now. Please use the WhatsApp or Copy Link button to share your picks directly.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        referenceId,
        favoriteId,
        selectedIds: dedupedValidIds,
        createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/brand/selections error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected error while saving selection." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/brand/selections
 * Admin-only endpoint returning submitted client logo selections from D1.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const auth = await verifyAdminSessionToken(token);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureSelectionsTable();
    const rows = await executeD1Query<{
      id: string;
      reference_id: string;
      client_name: string;
      client_contact: string;
      favorite_id: string;
      selected_ids: string;
      palette_mode: string;
      notes: string;
      created_at: string;
    }>(
      `SELECT id, reference_id, client_name, client_contact, favorite_id,
              selected_ids, palette_mode, notes, created_at
       FROM brand_logo_selections
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const selections = (rows || []).map((r) => {
      let parsedIds: string[] = [];
      try {
        parsedIds = JSON.parse(r.selected_ids);
      } catch {
        parsedIds = [];
      }
      return {
        id: r.id,
        referenceId: r.reference_id,
        clientName: r.client_name,
        clientContact: r.client_contact,
        favoriteId: r.favorite_id,
        selectedIds: parsedIds,
        paletteMode: r.palette_mode,
        notes: r.notes,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({ success: true, count: selections.length, selections });
  } catch (err) {
    console.error("GET /api/brand/selections error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load selections." },
      { status: 500 }
    );
  }
}
