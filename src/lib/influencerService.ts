import { executeD1Query } from "@/lib/d1";

export interface InfluencerRecord {
  id: string;
  name: string;
  insta_id: string;
  notes?: string;
  product_cost: number;
  commission_type: "none" | "percent" | "fixed";
  commission_value: number;
  active: number | boolean;
  created_at: string;
}

export interface InfluencerLinkRecord {
  id: string;
  influencer_id: string;
  name: string;
  code: string;
  destination: string; // 'home' or product ID / slug
  created_at: string;
}

export interface InfluencerClickRecord {
  id: string;
  link_id: string;
  influencer_id: string;
  ip?: string;
  user_agent?: string;
  clicked_at: string;
}

export interface InfluencerOrderRecord {
  id: string;
  order_id: string;
  link_id: string;
  influencer_id: string;
  order_total: number;
  commission_amount: number;
  created_at: string;
}

export interface InfluencerPaymentRecord {
  id: string;
  influencer_id: string;
  amount: number;
  notes?: string;
  paid_on: string;
  created_at: string;
}

export interface InfluencerLinkStats {
  id: string;
  name: string;
  code: string;
  destination: string;
  clicks: number;
  orders: number;
  conversion_rate: number;
  revenue: number;
  commission: number;
}

export interface InfluencerAggregatedStats extends InfluencerRecord {
  clicks: number;
  orders: number;
  conversion_rate: number;
  revenue: number;
  commission_earned: number;
  total_paid: number;
  pending_amount: number;
  spend: number;
  return_multiplier: number | null;
  return_text: string;
  return_color: "high" | "medium" | "low"; // high: 3x+, medium: 1x-3x, low: <1x
  status: "pending" | "paid" | "no_commission";
  last_paid_amount?: number;
  last_paid_on?: string;
  is_top_performer?: boolean;
  links: InfluencerLinkStats[];
}

// In-memory fallback stores for high availability
let memoryInfluencers: InfluencerRecord[] = [];
let memoryLinks: InfluencerLinkRecord[] = [];
let memoryClicks: InfluencerClickRecord[] = [];
let memoryOrders: InfluencerOrderRecord[] = [];
let memoryPayments: InfluencerPaymentRecord[] = [];

let schemaEnsured = false;
export async function ensureInfluencerSchema(): Promise<void> {
  if (schemaEnsured) return;
  schemaEnsured = true;

  try {
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS influencers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        insta_id TEXT NOT NULL,
        notes TEXT,
        product_cost REAL DEFAULT 0,
        commission_type TEXT DEFAULT 'none',
        commission_value REAL DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencers_active ON influencers(active);`).catch(() => {});
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencers_insta ON influencers(insta_id);`).catch(() => {});

    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS influencer_links (
        id TEXT PRIMARY KEY,
        influencer_id TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        destination TEXT DEFAULT 'home',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_links_code ON influencer_links(code);`).catch(() => {});
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_links_influencer ON influencer_links(influencer_id);`).catch(() => {});

    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS influencer_clicks (
        id TEXT PRIMARY KEY,
        link_id TEXT NOT NULL,
        influencer_id TEXT NOT NULL,
        ip TEXT,
        user_agent TEXT,
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_clicks_time ON influencer_clicks(clicked_at);`).catch(() => {});
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_clicks_link ON influencer_clicks(link_id);`).catch(() => {});

    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS influencer_orders (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        link_id TEXT NOT NULL,
        influencer_id TEXT NOT NULL,
        order_total REAL NOT NULL,
        commission_amount REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_orders_time ON influencer_orders(created_at);`).catch(() => {});
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_orders_influencer ON influencer_orders(influencer_id);`).catch(() => {});

    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS influencer_payments (
        id TEXT PRIMARY KEY,
        influencer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        notes TEXT,
        paid_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_influencer_payments_influencer ON influencer_payments(influencer_id);`).catch(() => {});
  } catch (err) {
    console.warn("ensureInfluencerSchema non-fatal notice:", err);
  }
}

/**
 * Sanitizes and generates a unique short code for an influencer link.
 */
export async function generateUniqueShortCode(base: string): Promise<string> {
  await ensureInfluencerSchema();

  let clean = base
    .toLowerCase()
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!clean) clean = "partner";

  let candidate = clean;
  let counter = 1;

  while (true) {
    let exists = false;
    try {
      const rows = await executeD1Query<{ id: string }>(
        `SELECT id FROM influencer_links WHERE LOWER(code) = LOWER(?) LIMIT 1`,
        [candidate]
      );
      if (rows && rows.length > 0) exists = true;
    } catch {
      // Memory check fallback
      if (memoryLinks.some((l) => l.code.toLowerCase() === candidate.toLowerCase())) {
        exists = true;
      }
    }

    if (!exists) return candidate;

    counter++;
    candidate = `${clean}-${counter}`;
  }
}

/**
 * Creates a new influencer profile with an initial link.
 */
export async function createInfluencer(params: {
  name: string;
  insta_id: string;
  notes?: string;
  product_cost?: number;
  commission_type?: "none" | "percent" | "fixed";
  commission_value?: number;
  link_name?: string;
  destination?: string;
  custom_code?: string;
}): Promise<{ influencer: InfluencerRecord; link: InfluencerLinkRecord }> {
  await ensureInfluencerSchema();

  const influencerId = `inf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const commissionType = params.commission_type || "none";
  const commissionVal = commissionType === "none" ? 0 : Number(params.commission_value || 0);
  const productCost = Number(params.product_cost || 0);

  const cleanInsta = params.insta_id.trim().replace(/^@+/, "");

  const influencer: InfluencerRecord = {
    id: influencerId,
    name: params.name.trim(),
    insta_id: cleanInsta,
    notes: params.notes?.trim() || "",
    product_cost: productCost,
    commission_type: commissionType,
    commission_value: commissionVal,
    active: 1,
    created_at: now,
  };

  // Generate unique code for initial link
  const codeBase = params.custom_code || cleanInsta || params.name;
  const shortCode = await generateUniqueShortCode(codeBase);

  const linkId = `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const link: InfluencerLinkRecord = {
    id: linkId,
    influencer_id: influencerId,
    name: (params.link_name || "Default link").trim(),
    code: shortCode,
    destination: params.destination?.trim() || "home",
    created_at: now,
  };

  // Save in memory fallback
  memoryInfluencers.unshift(influencer);
  memoryLinks.unshift(link);

  // Persist to D1
  try {
    await executeD1Query(
      `INSERT INTO influencers (id, name, insta_id, notes, product_cost, commission_type, commission_value, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        influencer.id,
        influencer.name,
        influencer.insta_id,
        influencer.notes,
        influencer.product_cost,
        influencer.commission_type,
        influencer.commission_value,
        1,
        influencer.created_at,
      ]
    );

    await executeD1Query(
      `INSERT INTO influencer_links (id, influencer_id, name, code, destination, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [link.id, link.influencer_id, link.name, link.code, link.destination, link.created_at]
    );
  } catch (err) {
    console.error("Failed to persist new influencer to D1:", err);
  }

  return { influencer, link };
}

/**
 * Adds an additional tracking link for an existing influencer.
 */
export async function addInfluencerLink(params: {
  influencer_id: string;
  name: string;
  destination?: string;
  custom_code?: string;
}): Promise<InfluencerLinkRecord> {
  await ensureInfluencerSchema();

  const linkId = `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Find influencer to derive base slug if custom not provided
  let baseSlug = params.custom_code || params.name;
  try {
    const infRows = await executeD1Query<InfluencerRecord>(
      `SELECT * FROM influencers WHERE id = ? LIMIT 1`,
      [params.influencer_id]
    );
    if (infRows && infRows.length > 0 && !params.custom_code) {
      baseSlug = `${infRows[0].insta_id}-${params.name}`;
    }
  } catch {}

  const shortCode = await generateUniqueShortCode(baseSlug);

  const link: InfluencerLinkRecord = {
    id: linkId,
    influencer_id: params.influencer_id,
    name: params.name.trim(),
    code: shortCode,
    destination: params.destination?.trim() || "home",
    created_at: now,
  };

  memoryLinks.unshift(link);

  try {
    await executeD1Query(
      `INSERT INTO influencer_links (id, influencer_id, name, code, destination, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [link.id, link.influencer_id, link.name, link.code, link.destination, link.created_at]
    );
  } catch (err) {
    console.error("Failed to save influencer link to D1:", err);
  }

  return link;
}

/**
 * Updates an influencer profile (name, insta_id, notes, product_cost, commission, active status).
 */
export async function updateInfluencer(
  influencerId: string,
  updates: Partial<InfluencerRecord>
): Promise<InfluencerRecord | null> {
  await ensureInfluencerSchema();

  // Update memory
  const memIdx = memoryInfluencers.findIndex((i) => i.id === influencerId);
  if (memIdx >= 0) {
    memoryInfluencers[memIdx] = { ...memoryInfluencers[memIdx], ...updates };
  }

  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name.trim());
    }
    if (updates.insta_id !== undefined) {
      fields.push("insta_id = ?");
      values.push(updates.insta_id.trim().replace(/^@+/, ""));
    }
    if (updates.notes !== undefined) {
      fields.push("notes = ?");
      values.push(updates.notes.trim());
    }
    if (updates.product_cost !== undefined) {
      fields.push("product_cost = ?");
      values.push(Number(updates.product_cost));
    }
    if (updates.commission_type !== undefined) {
      fields.push("commission_type = ?");
      values.push(updates.commission_type);
    }
    if (updates.commission_value !== undefined) {
      fields.push("commission_value = ?");
      values.push(Number(updates.commission_value));
    }
    if (updates.active !== undefined) {
      fields.push("active = ?");
      values.push(updates.active ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(influencerId);
      await executeD1Query(
        `UPDATE influencers SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }

    const rows = await executeD1Query<InfluencerRecord>(
      `SELECT * FROM influencers WHERE id = ? LIMIT 1`,
      [influencerId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("Failed to update influencer in D1:", err);
    return memIdx >= 0 ? memoryInfluencers[memIdx] : null;
  }
}

/**
 * Records a payout when the owner clicks "Mark Paid".
 */
export async function recordInfluencerPayment(
  influencerId: string,
  amount: number,
  notes?: string
): Promise<InfluencerPaymentRecord> {
  await ensureInfluencerSchema();

  const paymentId = `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const payment: InfluencerPaymentRecord = {
    id: paymentId,
    influencer_id: influencerId,
    amount: Number(amount),
    notes: notes?.trim() || "",
    paid_on: now,
    created_at: now,
  };

  memoryPayments.unshift(payment);

  try {
    await executeD1Query(
      `INSERT INTO influencer_payments (id, influencer_id, amount, notes, paid_on, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [payment.id, payment.influencer_id, payment.amount, payment.notes, payment.paid_on, payment.created_at]
    );
  } catch (err) {
    console.error("Failed to record influencer payment in D1:", err);
  }

  return payment;
}

/**
 * Resolves an affiliate code and checks whether the parent influencer is active.
 */
export async function resolveAffiliateCode(code: string): Promise<{
  link: InfluencerLinkRecord;
  influencer: InfluencerRecord;
} | null> {
  await ensureInfluencerSchema();
  const cleanCode = code.trim().toLowerCase();

  try {
    const rows = await executeD1Query<any>(
      `SELECT l.id as link_id, l.influencer_id, l.name as link_name, l.code, l.destination, l.created_at as link_created_at,
              i.id, i.name, i.insta_id, i.notes, i.product_cost, i.commission_type, i.commission_value, i.active, i.created_at
       FROM influencer_links l
       JOIN influencers i ON l.influencer_id = i.id
       WHERE LOWER(l.code) = ?
       LIMIT 1`,
      [cleanCode]
    );

    if (rows && rows.length > 0) {
      const r = rows[0];
      const link: InfluencerLinkRecord = {
        id: r.link_id,
        influencer_id: r.influencer_id,
        name: r.link_name,
        code: r.code,
        destination: r.destination,
        created_at: r.link_created_at,
      };
      const influencer: InfluencerRecord = {
        id: r.id,
        name: r.name,
        insta_id: r.insta_id,
        notes: r.notes,
        product_cost: Number(r.product_cost || 0),
        commission_type: r.commission_type,
        commission_value: Number(r.commission_value || 0),
        active: Number(r.active) === 1,
        created_at: r.created_at,
      };
      return { link, influencer };
    }
  } catch (err) {
    console.warn("D1 resolveAffiliateCode error, falling back to memory:", err);
  }

  // Memory fallback
  const memLink = memoryLinks.find((l) => l.code.toLowerCase() === cleanCode);
  if (memLink) {
    const memInf = memoryInfluencers.find((i) => i.id === memLink.influencer_id);
    if (memInf) {
      return { link: memLink, influencer: memInf };
    }
  }

  return null;
}

/**
 * Records a click event (invoked when /r/[code] is visited).
 */
export async function recordInfluencerClick(
  linkId: string,
  influencerId: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await ensureInfluencerSchema();
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const click: InfluencerClickRecord = {
    id: clickId,
    link_id: linkId,
    influencer_id: influencerId,
    ip,
    user_agent: userAgent,
    clicked_at: now,
  };
  memoryClicks.push(click);

  try {
    await executeD1Query(
      `INSERT INTO influencer_clicks (id, link_id, influencer_id, ip, user_agent, clicked_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [click.id, click.link_id, click.influencer_id, click.ip || null, click.user_agent || null, click.clicked_at]
    );
  } catch (err) {
    console.warn("Failed to log influencer click to D1:", err);
  }
}

/**
 * Attaches attribution to an order and calculates commission snapshot.
 */
export async function recordInfluencerOrderAttribution(
  orderId: string,
  orderTotal: number,
  affiliateCode: string
): Promise<InfluencerOrderRecord | null> {
  await ensureInfluencerSchema();

  const resolved = await resolveAffiliateCode(affiliateCode);
  if (!resolved) return null;

  const { link, influencer } = resolved;

  // Active check: If influencer is turned OFF, no order or commission is credited
  if (!influencer.active) {
    return null;
  }

  let commissionAmount = 0;
  if (influencer.commission_type === "percent") {
    commissionAmount = Math.round(((orderTotal * influencer.commission_value) / 100) * 100) / 100;
  } else if (influencer.commission_type === "fixed") {
    commissionAmount = Number(influencer.commission_value);
  }

  const orderRecId = `inf_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const record: InfluencerOrderRecord = {
    id: orderRecId,
    order_id: orderId,
    link_id: link.id,
    influencer_id: influencer.id,
    order_total: Number(orderTotal),
    commission_amount: commissionAmount,
    created_at: now,
  };

  memoryOrders.push(record);

  try {
    await executeD1Query(
      `INSERT INTO influencer_orders (id, order_id, link_id, influencer_id, order_total, commission_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.order_id, record.link_id, record.influencer_id, record.order_total, record.commission_amount, record.created_at]
    );
  } catch (err) {
    console.error("Failed to persist influencer order attribution to D1:", err);
  }

  return record;
}

/**
 * Helper to compute date range window for filtering
 */
export function getDateRange(
  timeframe: "today" | "yesterday" | "7d" | "30d" | "all" | "custom",
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (timeframe === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (timeframe === "yesterday") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(now);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);
    return { start, end: yesterdayEnd };
  }

  if (timeframe === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (timeframe === "30d" || (timeframe as any) === "1month") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (timeframe === "custom" && customStart) {
    const start = new Date(customStart);
    const customEndDate = customEnd ? new Date(customEnd) : new Date();
    customEndDate.setHours(23, 59, 59, 999);
    return { start, end: customEndDate };
  }

  // "all"
  const start = new Date("2020-01-01T00:00:00Z");
  return { start, end };
}

/**
 * Computes all aggregated influencer metrics based on the specified timeframe.
 */
export async function getInfluencersWithStats(
  timeframe: "today" | "yesterday" | "7d" | "30d" | "all" | "custom" = "7d",
  customStart?: string,
  customEnd?: string
): Promise<InfluencerAggregatedStats[]> {
  await ensureInfluencerSchema();

  const { start, end } = getDateRange(timeframe, customStart, customEnd);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  // 1. Fetch raw datasets from D1 (or fallback to memory)
  let influencers: InfluencerRecord[] = [];
  let links: InfluencerLinkRecord[] = [];
  let clicks: InfluencerClickRecord[] = [];
  let orders: InfluencerOrderRecord[] = [];
  let payments: InfluencerPaymentRecord[] = [];

  try {
    const infRes = await executeD1Query<InfluencerRecord>(`SELECT * FROM influencers ORDER BY created_at DESC`);
    if (infRes && infRes.length > 0) influencers = infRes;

    const linkRes = await executeD1Query<InfluencerLinkRecord>(`SELECT * FROM influencer_links ORDER BY created_at ASC`);
    if (linkRes && linkRes.length > 0) links = linkRes;

    const clickRes = await executeD1Query<InfluencerClickRecord>(
      `SELECT * FROM influencer_clicks WHERE clicked_at >= ? AND clicked_at <= ?`,
      [startIso, endIso]
    );
    if (clickRes) clicks = clickRes;

    const orderRes = await executeD1Query<InfluencerOrderRecord>(`SELECT * FROM influencer_orders`);
    if (orderRes) orders = orderRes;

    const pmtRes = await executeD1Query<InfluencerPaymentRecord>(`SELECT * FROM influencer_payments ORDER BY paid_on DESC`);
    if (pmtRes) payments = pmtRes;
  } catch (err) {
    console.warn("D1 query error in getInfluencersWithStats, merging with memory:", err);
  }

  // Merge with memory to prevent data loss in hybrid setups
  const allInfMap = new Map<string, InfluencerRecord>();
  for (const inf of [...influencers, ...memoryInfluencers]) allInfMap.set(inf.id, inf);
  const combinedInfluencers = Array.from(allInfMap.values());

  const allLinksMap = new Map<string, InfluencerLinkRecord>();
  for (const l of [...links, ...memoryLinks]) allLinksMap.set(l.id, l);
  const combinedLinks = Array.from(allLinksMap.values());

  // Deduplicate by ID to prevent double counting between D1 and memory
  const allClicksMap = new Map<string, InfluencerClickRecord>();
  for (const c of [...clicks, ...memoryClicks]) {
    if (c.clicked_at >= startIso && c.clicked_at <= endIso) {
      allClicksMap.set(c.id, c);
    }
  }
  const allClicks = Array.from(allClicksMap.values());

  const allOrdersMap = new Map<string, InfluencerOrderRecord>();
  for (const o of [...orders, ...memoryOrders]) {
    allOrdersMap.set(o.id, o);
  }
  const allOrders = Array.from(allOrdersMap.values());

  const allPaymentsMap = new Map<string, InfluencerPaymentRecord>();
  for (const p of [...payments, ...memoryPayments]) {
    allPaymentsMap.set(p.id, p);
  }
  const allPayments = Array.from(allPaymentsMap.values());

  // 2. Aggregate per influencer
  const results: InfluencerAggregatedStats[] = combinedInfluencers.map((inf) => {
    const infLinks = combinedLinks.filter((l) => l.influencer_id === inf.id);
    const infLinkIds = new Set(infLinks.map((l) => l.id));

    // Clicks in filtered window
    const periodClicks = allClicks.filter((c) => c.influencer_id === inf.id || infLinkIds.has(c.link_id));
    const clicksCount = periodClicks.length;

    // Orders in filtered window
    const periodOrders = allOrders.filter(
      (o) => (o.influencer_id === inf.id || infLinkIds.has(o.link_id)) && o.created_at >= startIso && o.created_at <= endIso
    );
    const ordersCount = periodOrders.length;

    // Financials in filtered window
    const revenue = periodOrders.reduce((acc, o) => acc + Number(o.order_total || 0), 0);
    const commissionEarned = periodOrders.reduce((acc, o) => acc + Number(o.commission_amount || 0), 0);

    // All-time commission & payments (Pending is all-time)
    const allTimeOrders = allOrders.filter((o) => o.influencer_id === inf.id || infLinkIds.has(o.link_id));
    const allTimeCommission = allTimeOrders.reduce((acc, o) => acc + Number(o.commission_amount || 0), 0);

    const infPayments = allPayments.filter((p) => p.influencer_id === inf.id);
    const totalPaid = infPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const pendingAmount = Math.max(0, Math.round((allTimeCommission - totalPaid) * 100) / 100);

    // Spend & Return calculations
    // Spend = Free Product Cost + Commission Earned in selected dates
    const freeProductCost = Number(inf.product_cost || 0);
    const spend = freeProductCost + commissionEarned;

    let returnMultiplier: number | null = null;
    let returnText = "—";
    let returnColor: "high" | "medium" | "low" = "medium";

    if (spend > 0) {
      returnMultiplier = Math.round((revenue / spend) * 10) / 10;
      returnText = `${returnMultiplier.toFixed(1)}x`;
      if (returnMultiplier >= 3.0) returnColor = "high"; // 🟢 3x or more
      else if (returnMultiplier >= 1.0) returnColor = "medium"; // 🟡 1x-3x
      else returnColor = "low"; // 🔴 below 1x
    } else if (revenue > 0) {
      returnText = "∞";
      returnColor = "high";
    }

    // Status: 'pending', 'paid', or 'no_commission'
    let status: "pending" | "paid" | "no_commission" = "no_commission";
    if (inf.commission_type !== "none") {
      status = pendingAmount > 0 ? "pending" : "paid";
    }

    // Last paid info
    let lastPaidAmount: number | undefined;
    let lastPaidOn: string | undefined;
    if (infPayments.length > 0) {
      infPayments.sort((a, b) => new Date(b.paid_on).getTime() - new Date(a.paid_on).getTime());
      lastPaidAmount = infPayments[0].amount;
      lastPaidOn = infPayments[0].paid_on;
    }

    // Per-link breakdown
    const linkStats: InfluencerLinkStats[] = infLinks.map((link) => {
      const lClicks = periodClicks.filter((c) => c.link_id === link.id).length;
      const lOrders = periodOrders.filter((o) => o.link_id === link.id);
      const lRevenue = lOrders.reduce((sum, o) => sum + Number(o.order_total || 0), 0);
      const lCommission = lOrders.reduce((sum, o) => sum + Number(o.commission_amount || 0), 0);
      const lConv = lClicks > 0 ? Math.round((lOrders.length / lClicks) * 1000) / 10 : 0;

      return {
        id: link.id,
        name: link.name,
        code: link.code,
        destination: link.destination,
        clicks: lClicks,
        orders: lOrders.length,
        conversion_rate: lConv,
        revenue: lRevenue,
        commission: lCommission,
      };
    });

    const conversionRate = clicksCount > 0 ? Math.round((ordersCount / clicksCount) * 1000) / 10 : 0;

    return {
      ...inf,
      active: Number(inf.active) === 1 || inf.active === true,
      clicks: clicksCount,
      orders: ordersCount,
      conversion_rate: conversionRate,
      revenue: Math.round(revenue * 100) / 100,
      commission_earned: Math.round(commissionEarned * 100) / 100,
      total_paid: Math.round(totalPaid * 100) / 100,
      pending_amount: pendingAmount,
      spend: Math.round(spend * 100) / 100,
      return_multiplier: returnMultiplier,
      return_text: returnText,
      return_color: returnColor,
      status,
      last_paid_amount: lastPaidAmount,
      last_paid_on: lastPaidOn,
      links: linkStats,
    };
  });

  // Assign 🏆 Top Performer badge (highest orders in the selected dates, minimum 1 order)
  let maxOrders = 0;
  for (const r of results) {
    if (r.orders > maxOrders) maxOrders = r.orders;
  }
  if (maxOrders > 0) {
    for (const r of results) {
      if (r.orders === maxOrders) {
        r.is_top_performer = true;
      }
    }
  }

  // Default sorting: Orders high -> low
  results.sort((a, b) => b.orders - a.orders);

  return results;
}
