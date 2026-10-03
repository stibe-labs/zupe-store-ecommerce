// Zupe Store ERP Data Store & Business Logic Layer
import { executeD1Query } from "@/lib/d1";

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  available_rto_balance: number;
  total_credits_added: number;
  total_credits_used: number;
  pending_credits: number;
  created_at?: string;
}

export interface RTOLedgerEntry {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  type: "RTO Credit" | "Credit Used";
  amount: number;
  running_balance: number;
  status: "Credited" | "Pending" | "Partially Used" | "Used";
  used_against_order_id?: string | null;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface ExpenseRecord {
  id: string;
  category: "Meta Ads" | "Product cost" | "Shiprocket/shipping" | "RTO charges" | "Software/subscriptions" | "Other";
  amount: number;
  date: string;
  vendor?: string;
  reference_no?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface RemittanceRecord {
  id: string;
  crn_id: string;
  courier: string;
  total_cod_collected: number;
  courier_charges_deducted: number;
  net_remitted_amount: number;
  remittance_date: string;
  bank_utr?: string;
  status: "Pending" | "Remitted" | "Disputed";
  orders_count: number;
  created_at?: string;
}

export interface ERPOrder {
  id: string;
  shopify_order_id: string;
  customer_name: string;
  customer_phone?: string;
  guest_email?: string;
  total_amount: number;
  product_cost: number;
  shipping_cost: number;
  rto_shipping_charge: number;
  ad_spend_attributed: number;
  net_profit: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: string;
  shiprocket_awb?: string;
  courier_partner?: string;
  delivery_status: "Processing" | "In Transit" | "Out for Delivery" | "Delivered" | "NDR" | "RTO Initiated" | "RTO In Transit" | "RTO Delivered";
  ndr_status: string;
  rto_status: string;
  remittance_status: "Pending" | "Remitted" | "Settled" | "N/A";
  supplier_id?: string;
  created_at: string;
  items?: { product_name: string; quantity: number; unit_price: number }[];
}

// In-Memory Baseline Fallbacks matching reference Image 3
let inMemorySuppliers: Supplier[] = [
  { id: "sup-a", name: "Supplier A", code: "SUP-A", contact_person: "Rajesh Sharma", phone: "+91 98765 43210", available_rto_balance: 3200, total_credits_added: 11500, total_credits_used: 8300, pending_credits: 0 },
  { id: "sup-b", name: "Supplier B", code: "SUP-B", contact_person: "Amit Patel", phone: "+91 98220 12345", available_rto_balance: 2150, total_credits_added: 6800, total_credits_used: 4650, pending_credits: 0 },
  { id: "sup-c", name: "Supplier C", code: "SUP-C", contact_person: "Pooja Verma", phone: "+91 97111 88899", available_rto_balance: 1000, total_credits_added: 3900, total_credits_used: 2900, pending_credits: 0 },
  { id: "sup-d", name: "Supplier D", code: "SUP-D", contact_person: "Sanjay Gupta", phone: "+91 98450 77766", available_rto_balance: 1150, total_credits_added: 3200, total_credits_used: 2050, pending_credits: 2800 },
];

let inMemoryLedger: RTOLedgerEntry[] = [
  { id: "rto-1", supplier_id: "sup-a", supplier_name: "Supplier A", order_id: "#1058", product_name: "LED Night Lamp", type: "RTO Credit", amount: 500, running_balance: 7500, status: "Credited", used_against_order_id: null, date: "10 Oct 2026", notes: "Customer refused delivery at doorstep. Restocked by supplier." },
  { id: "rto-2", supplier_id: "sup-b", supplier_name: "Supplier B", order_id: "#1042", product_name: "Mini Printer", type: "Credit Used", amount: -300, running_balance: 7000, status: "Used", used_against_order_id: "#1075", date: "08 Oct 2026", notes: "Applied against PO #1075 inventory purchase" },
  { id: "rto-3", supplier_id: "sup-a", supplier_name: "Supplier A", order_id: "#1036", product_name: "Portable Iron", type: "RTO Credit", amount: 800, running_balance: 7300, status: "Credited", used_against_order_id: null, date: "05 Oct 2026", notes: "Customer address incomplete. Item returned to supplier." },
  { id: "rto-4", supplier_id: "sup-c", supplier_name: "Supplier C", order_id: "#1019", product_name: "Nebulizer", type: "RTO Credit", amount: 650, running_balance: 6500, status: "Partially Used", used_against_order_id: "#1050 (₹400)", date: "02 Oct 2026", notes: "Customer cancelled during transit. ₹400 used against #1050." },
  { id: "rto-5", supplier_id: "sup-b", supplier_name: "Supplier B", order_id: "#1015", product_name: "Car Perfume", type: "Credit Used", amount: -700, running_balance: 5850, status: "Used", used_against_order_id: "#1068", date: "28 Sep 2026", notes: "Applied against PO #1068 inventory purchase" },
  { id: "rto-6", supplier_id: "sup-d", supplier_name: "Supplier D", order_id: "#1008", product_name: "Washer Machine", type: "RTO Credit", amount: 1200, running_balance: 6550, status: "Pending", used_against_order_id: null, date: "25 Sep 2026", notes: "RTO parcel delivered to supplier warehouse. Pending credit memo validation." },
  { id: "rto-7", supplier_id: "sup-a", supplier_name: "Supplier A", order_id: "#0995", product_name: "Popcorn Maker", type: "RTO Credit", amount: 950, running_balance: 5350, status: "Credited", used_against_order_id: null, date: "20 Sep 2026", notes: "Customer unavailable after 3 delivery attempts. Credited by supplier." },
  { id: "rto-8", supplier_id: "sup-c", supplier_name: "Supplier C", order_id: "#0987", product_name: "Heating Pad", type: "Credit Used", amount: -500, running_balance: 4400, status: "Used", used_against_order_id: "#1020", date: "18 Sep 2026", notes: "Applied against PO #1020 inventory purchase" },
];

let inMemoryExpenses: ExpenseRecord[] = [
  { id: "exp-1", category: "Meta Ads", amount: 4500, date: "2026-10-01", vendor: "Meta Platforms", reference_no: "INV-META-9821", notes: "Aura Lamp & Steamer Advantage+ Campaign" },
  { id: "exp-2", category: "Shiprocket/shipping", amount: 3250, date: "2026-10-02", vendor: "Shiprocket Logistics", reference_no: "SR-RECHARGE-441", notes: "Wallet recharge for forward & reverse freight" },
  { id: "exp-3", category: "Software/subscriptions", amount: 1999, date: "2026-10-02", vendor: "Shopify", reference_no: "SHPFY-OCT-26", notes: "Shopify Basic Plan & App Subscriptions" },
  { id: "exp-4", category: "RTO charges", amount: 1420, date: "2026-09-30", vendor: "Shiprocket", reference_no: "SR-RTO-INV-99", notes: "Reverse shipping charges on 8 returned packages" },
  { id: "exp-5", category: "Other", amount: 2500, date: "2026-09-28", vendor: "PackSafe Solutions", reference_no: "INV-BOX-321", notes: "Custom corrugated shipping boxes & bubble mailers" },
];

let inMemoryRemittances: RemittanceRecord[] = [
  { id: "rem-1", crn_id: "CRN-SR-20261001-842", courier: "Shiprocket (Delhivery + Bluedart)", total_cod_collected: 18450, courier_charges_deducted: 2150, net_remitted_amount: 16300, remittance_date: "2026-10-01", bank_utr: "HDFC0001234987654", status: "Remitted", orders_count: 14 },
  { id: "rem-2", crn_id: "CRN-SR-20260925-719", courier: "Shiprocket (Xpressbees)", total_cod_collected: 12800, courier_charges_deducted: 1640, net_remitted_amount: 11160, remittance_date: "2026-09-25", bank_utr: "ICIC0009876543210", status: "Remitted", orders_count: 9 },
  { id: "rem-3", crn_id: "CRN-SR-20261003-904", courier: "Shiprocket (Shadowfax)", total_cod_collected: 9600, courier_charges_deducted: 1120, net_remitted_amount: 8480, remittance_date: "2026-10-03", bank_utr: "Pending UTR", status: "Pending", orders_count: 7 },
];

let inMemoryERPOrders: ERPOrder[] = [
  {
    id: "ord_1058",
    shopify_order_id: "#1058",
    customer_name: "Rahul Mishra",
    customer_phone: "+91 98112 34567",
    guest_email: "rahul.m@gmail.com",
    total_amount: 1099,
    product_cost: 500,
    shipping_cost: 85,
    rto_shipping_charge: 65,
    ad_spend_attributed: 180,
    net_profit: -150,
    status: "Returned",
    payment_method: "COD",
    payment_status: "Pending",
    shipping_address: "Flat 402, Sunshine Heights, Andheri West, Mumbai, 400058",
    shiprocket_awb: "SR-AWB-9871101",
    courier_partner: "Delhivery",
    delivery_status: "RTO Delivered",
    ndr_status: "Customer Unavailable",
    rto_status: "Supplier Credited",
    remittance_status: "N/A",
    supplier_id: "sup-a",
    created_at: "2026-10-01 10:14:00",
    items: [{ product_name: "Dynamic Water Ripple Night Light", quantity: 1, unit_price: 1099 }],
  },
  {
    id: "ord_1057",
    shopify_order_id: "#1057",
    customer_name: "Sneha Kapoor",
    customer_phone: "+91 98223 45678",
    guest_email: "sneha.k@outlook.com",
    total_amount: 1499,
    product_cost: 600,
    shipping_cost: 95,
    rto_shipping_charge: 0,
    ad_spend_attributed: 220,
    net_profit: 584,
    status: "Delivered",
    payment_method: "Prepaid",
    payment_status: "Completed",
    shipping_address: "House 12B, Sector 14, Gurugram, Haryana, 122001",
    shiprocket_awb: "SR-AWB-9871102",
    courier_partner: "Bluedart",
    delivery_status: "Delivered",
    ndr_status: "None",
    rto_status: "None",
    remittance_status: "Settled",
    supplier_id: "sup-b",
    created_at: "2026-10-01 11:30:00",
    items: [{ product_name: "Mini Portable Steam Iron", quantity: 1, unit_price: 1499 }],
  },
  {
    id: "ord_1056",
    shopify_order_id: "#1056",
    customer_name: "Amit Bansal",
    customer_phone: "+91 98450 11223",
    guest_email: "amit.b@yahoo.com",
    total_amount: 899,
    product_cost: 350,
    shipping_cost: 75,
    rto_shipping_charge: 0,
    ad_spend_attributed: 140,
    net_profit: 334,
    status: "Delivered",
    payment_method: "COD",
    payment_status: "Completed",
    shipping_address: "304, Green Glen Layout, Bellandur, Bengaluru, Karnataka, 560103",
    shiprocket_awb: "SR-AWB-9871103",
    courier_partner: "Shadowfax",
    delivery_status: "Delivered",
    ndr_status: "None",
    rto_status: "None",
    remittance_status: "Remitted",
    supplier_id: "sup-c",
    created_at: "2026-10-01 13:45:00",
    items: [{ product_name: "Portable Menstrual Heating Pad", quantity: 1, unit_price: 899 }],
  },
  {
    id: "ord_1055",
    shopify_order_id: "#1055",
    customer_name: "Vikram Singh",
    customer_phone: "+91 99100 88776",
    guest_email: "vikram.s@gmail.com",
    total_amount: 1299,
    product_cost: 520,
    shipping_cost: 85,
    rto_shipping_charge: 0,
    ad_spend_attributed: 190,
    net_profit: 504,
    status: "In Transit",
    payment_method: "COD",
    payment_status: "Pending",
    shipping_address: "Plot 88, Anna Nagar West, Chennai, Tamil Nadu, 600040",
    shiprocket_awb: "SR-AWB-9871104",
    courier_partner: "Xpressbees",
    delivery_status: "In Transit",
    ndr_status: "None",
    rto_status: "None",
    remittance_status: "Pending",
    supplier_id: "sup-d",
    created_at: "2026-10-02 09:15:00",
    items: [{ product_name: "Wireless Mesh Nebulizer", quantity: 1, unit_price: 1299 }],
  },
  {
    id: "ord_1054",
    shopify_order_id: "#1054",
    customer_name: "Pooja Nair",
    customer_phone: "+91 98470 55443",
    guest_email: "pooja.n@gmail.com",
    total_amount: 699,
    product_cost: 280,
    shipping_cost: 70,
    rto_shipping_charge: 0,
    ad_spend_attributed: 110,
    net_profit: 239,
    status: "Shipped",
    payment_method: "Prepaid",
    payment_status: "Completed",
    shipping_address: "TC 25/110, Vazhuthacaud, Thiruvananthapuram, Kerala, 695014",
    shiprocket_awb: "SR-AWB-9871105",
    courier_partner: "Delhivery",
    delivery_status: "Out for Delivery",
    ndr_status: "None",
    rto_status: "None",
    remittance_status: "Settled",
    supplier_id: "sup-a",
    created_at: "2026-10-02 11:00:00",
    items: [{ product_name: "Helicopter Solar Car Perfume", quantity: 1, unit_price: 699 }],
  },
  {
    id: "ord_1053",
    shopify_order_id: "#1053",
    customer_name: "Karan Dave",
    customer_phone: "+91 97230 66554",
    guest_email: "karan.d@gmail.com",
    total_amount: 1799,
    product_cost: 750,
    shipping_cost: 110,
    rto_shipping_charge: 0,
    ad_spend_attributed: 260,
    net_profit: 679,
    status: "Processing",
    payment_method: "COD",
    payment_status: "Pending",
    shipping_address: "A-51, Satellite Road, Ahmedabad, Gujarat, 380015",
    shiprocket_awb: "SR-AWB-9871106",
    courier_partner: "Delhivery",
    delivery_status: "NDR",
    ndr_status: "Doorstep Customer Refused",
    rto_status: "None",
    remittance_status: "Pending",
    supplier_id: "sup-b",
    created_at: "2026-10-02 14:20:00",
    items: [{ product_name: "Foldable Mini Washing Machine", quantity: 1, unit_price: 1799 }],
  },
  {
    id: "ord_1052",
    shopify_order_id: "#1052",
    customer_name: "Rohit Verma",
    customer_phone: "+91 98880 33221",
    guest_email: "rohit.v@gmail.com",
    total_amount: 999,
    product_cost: 400,
    shipping_cost: 80,
    rto_shipping_charge: 60,
    ad_spend_attributed: 150,
    net_profit: -140,
    status: "Returned",
    payment_method: "COD",
    payment_status: "Pending",
    shipping_address: "Sco 45, Sector 35-C, Chandigarh, 160022",
    shiprocket_awb: "SR-AWB-9871107",
    courier_partner: "Bluedart",
    delivery_status: "RTO Delivered",
    ndr_status: "Address Untraceable",
    rto_status: "Supplier Credited",
    remittance_status: "N/A",
    supplier_id: "sup-c",
    created_at: "2026-09-29 16:30:00",
    items: [{ product_name: "Pocket Thermal Mini Bluetooth Printer", quantity: 1, unit_price: 999 }],
  },
  {
    id: "ord_1051",
    shopify_order_id: "#1051",
    customer_name: "Ananya Pandey",
    customer_phone: "+91 99200 44332",
    guest_email: "ananya.p@gmail.com",
    total_amount: 1199,
    product_cost: 480,
    shipping_cost: 85,
    rto_shipping_charge: 0,
    ad_spend_attributed: 170,
    net_profit: 464,
    status: "Delivered",
    payment_method: "Prepaid",
    payment_status: "Completed",
    shipping_address: "B-102, Kothrud, Pune, Maharashtra, 411038",
    shiprocket_awb: "SR-AWB-9871108",
    courier_partner: "Delhivery",
    delivery_status: "Delivered",
    ndr_status: "None",
    rto_status: "None",
    remittance_status: "Settled",
    supplier_id: "sup-a",
    created_at: "2026-09-30 12:10:00",
    items: [{ product_name: "Hot Air Popcorn Maker Machine", quantity: 1, unit_price: 1199 }],
  },
];

// ==========================================
// 1. SUPPLIERS DATA SERVICES
// ==========================================
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const rows = await executeD1Query<Supplier>(
      "SELECT * FROM suppliers ORDER BY available_rto_balance DESC"
    );
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("D1 getSuppliers fallback:", err);
  }
  return inMemorySuppliers;
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const rows = await executeD1Query<Supplier>(
      "SELECT * FROM suppliers WHERE id = ?",
      [id]
    );
    if (rows && rows.length > 0) return rows[0];
  } catch (err) {
    console.warn("D1 getSupplierById fallback:", err);
  }
  return inMemorySuppliers.find((s) => s.id === id) || null;
}

// ==========================================
// 2. RTO REFUND BALANCE & LEDGER SERVICES
// ==========================================
export async function getRTOLedger(
  supplierId?: string,
  status?: string,
  search?: string
): Promise<RTOLedgerEntry[]> {
  try {
    let sql = `
      SELECT l.*, s.name as supplier_name 
      FROM rto_credit_ledger l 
      LEFT JOIN suppliers s ON l.supplier_id = s.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (supplierId && supplierId !== "all") {
      sql += " AND l.supplier_id = ?";
      params.push(supplierId);
    }
    if (status && status !== "all") {
      sql += " AND l.status = ?";
      params.push(status);
    }
    if (search && search.trim()) {
      sql += " AND (l.order_id LIKE ? OR l.product_name LIKE ? OR s.name LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    sql += " ORDER BY l.created_at DESC, l.id DESC";

    const rows = await executeD1Query<RTOLedgerEntry>(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("D1 getRTOLedger fallback:", err);
  }

  // Fallback filtering on memory store
  let res = [...inMemoryLedger];
  if (supplierId && supplierId !== "all") {
    res = res.filter((item) => item.supplier_id === supplierId);
  }
  if (status && status !== "all") {
    res = res.filter((item) => item.status === status);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    res = res.filter(
      (item) =>
        item.order_id.toLowerCase().includes(s) ||
        item.product_name.toLowerCase().includes(s) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(s))
    );
  }
  return res;
}

export async function addRTOCredit(payload: {
  supplier_id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  amount: number;
  date: string;
  status: "Credited" | "Pending";
  notes?: string;
}): Promise<RTOLedgerEntry> {
  const supplier = await getSupplierById(payload.supplier_id);
  const currentBal = supplier ? Number(supplier.available_rto_balance) : 0;
  const newBal = payload.status === "Credited" ? currentBal + Number(payload.amount) : currentBal;

  const newEntry: RTOLedgerEntry = {
    id: `rto-${Date.now()}`,
    supplier_id: payload.supplier_id,
    supplier_name: supplier?.name || "Supplier",
    order_id: payload.order_id,
    product_id: payload.product_id || "",
    product_name: payload.product_name,
    type: "RTO Credit",
    amount: Number(payload.amount),
    running_balance: newBal,
    status: payload.status,
    used_against_order_id: null,
    date: payload.date,
    notes: payload.notes || "RTO Product Credit from supplier",
    created_at: new Date().toISOString(),
  };

  // 1. Update in-memory
  inMemoryLedger.unshift(newEntry);
  const supMem = inMemorySuppliers.find((s) => s.id === payload.supplier_id);
  if (supMem) {
    if (payload.status === "Credited") {
      supMem.available_rto_balance += Number(payload.amount);
      supMem.total_credits_added += Number(payload.amount);
    } else {
      supMem.pending_credits += Number(payload.amount);
    }
  }

  // 2. Persist to D1
  try {
    await executeD1Query(
      `INSERT INTO rto_credit_ledger (id, supplier_id, order_id, product_id, product_name, type, amount, running_balance, status, used_against_order_id, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEntry.id,
        newEntry.supplier_id,
        newEntry.order_id,
        newEntry.product_id,
        newEntry.product_name,
        newEntry.type,
        newEntry.amount,
        newEntry.running_balance,
        newEntry.status,
        newEntry.used_against_order_id,
        newEntry.date,
        newEntry.notes,
      ]
    );

    if (payload.status === "Credited") {
      await executeD1Query(
        `UPDATE suppliers 
         SET available_rto_balance = available_rto_balance + ?, 
             total_credits_added = total_credits_added + ? 
         WHERE id = ?`,
        [newEntry.amount, newEntry.amount, newEntry.supplier_id]
      );
    } else {
      await executeD1Query(
        `UPDATE suppliers 
         SET pending_credits = pending_credits + ? 
         WHERE id = ?`,
        [newEntry.amount, newEntry.supplier_id]
      );
    }
  } catch (err) {
    console.warn("D1 addRTOCredit error:", err);
  }

  return newEntry;
}

export async function useRTOCredit(payload: {
  supplier_id: string;
  order_id: string;
  product_name: string;
  amount_to_use: number;
  used_against_order_id: string;
  date: string;
  notes?: string;
}): Promise<{ success: boolean; entry?: RTOLedgerEntry; message?: string }> {
  const supplier = await getSupplierById(payload.supplier_id);
  const currentBal = supplier ? Number(supplier.available_rto_balance) : 0;

  if (currentBal < payload.amount_to_use) {
    return {
      success: false,
      message: `Insufficient RTO balance. Available for ${supplier?.name || "this supplier"}: ₹${currentBal}`,
    };
  }

  const newBal = currentBal - Number(payload.amount_to_use);

  const newEntry: RTOLedgerEntry = {
    id: `rto-${Date.now()}`,
    supplier_id: payload.supplier_id,
    supplier_name: supplier?.name || "Supplier",
    order_id: payload.order_id,
    product_name: payload.product_name,
    type: "Credit Used",
    amount: -Number(payload.amount_to_use),
    running_balance: newBal,
    status: "Used",
    used_against_order_id: payload.used_against_order_id,
    date: payload.date,
    notes: payload.notes || `Applied against order ${payload.used_against_order_id}`,
    created_at: new Date().toISOString(),
  };

  // Update in-memory
  inMemoryLedger.unshift(newEntry);
  const supMem = inMemorySuppliers.find((s) => s.id === payload.supplier_id);
  if (supMem) {
    supMem.available_rto_balance = newBal;
    supMem.total_credits_used += Number(payload.amount_to_use);
  }

  // Persist to D1
  try {
    await executeD1Query(
      `INSERT INTO rto_credit_ledger (id, supplier_id, order_id, product_name, type, amount, running_balance, status, used_against_order_id, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEntry.id,
        newEntry.supplier_id,
        newEntry.order_id,
        newEntry.product_name,
        newEntry.type,
        newEntry.amount,
        newEntry.running_balance,
        newEntry.status,
        newEntry.used_against_order_id,
        newEntry.date,
        newEntry.notes,
      ]
    );

    await executeD1Query(
      `UPDATE suppliers 
       SET available_rto_balance = available_rto_balance - ?, 
           total_credits_used = total_credits_used + ? 
       WHERE id = ?`,
      [payload.amount_to_use, payload.amount_to_use, newEntry.supplier_id]
    );
  } catch (err) {
    console.warn("D1 useRTOCredit error:", err);
  }

  return { success: true, entry: newEntry };
}

// ==========================================
// 3. EXPENSES SERVICES
// ==========================================
export async function getExpenses(category?: string): Promise<ExpenseRecord[]> {
  try {
    let sql = "SELECT * FROM expenses WHERE 1=1";
    const params: any[] = [];
    if (category && category !== "all") {
      sql += " AND category = ?";
      params.push(category);
    }
    sql += " ORDER BY date DESC, created_at DESC";
    const rows = await executeD1Query<ExpenseRecord>(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("D1 getExpenses fallback:", err);
  }

  if (category && category !== "all") {
    return inMemoryExpenses.filter((e) => e.category === category);
  }
  return inMemoryExpenses;
}

export async function addExpense(payload: {
  category: ExpenseRecord["category"];
  amount: number;
  date: string;
  vendor?: string;
  reference_no?: string;
  notes?: string;
}): Promise<ExpenseRecord> {
  const newExp: ExpenseRecord = {
    id: `exp-${Date.now()}`,
    category: payload.category,
    amount: Number(payload.amount),
    date: payload.date,
    vendor: payload.vendor || "",
    reference_no: payload.reference_no || "",
    notes: payload.notes || "",
    created_by: "Admin",
    created_at: new Date().toISOString(),
  };

  inMemoryExpenses.unshift(newExp);

  try {
    await executeD1Query(
      `INSERT INTO expenses (id, category, amount, date, vendor, reference_no, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newExp.id,
        newExp.category,
        newExp.amount,
        newExp.date,
        newExp.vendor,
        newExp.reference_no,
        newExp.notes,
        newExp.created_by,
      ]
    );
  } catch (err) {
    console.warn("D1 addExpense error:", err);
  }

  return newExp;
}

// ==========================================
// 4. REMITTANCES & COD SETTLEMENT SERVICES
// ==========================================
export async function getRemittances(): Promise<RemittanceRecord[]> {
  try {
    const rows = await executeD1Query<RemittanceRecord>(
      "SELECT * FROM remittances ORDER BY remittance_date DESC"
    );
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("D1 getRemittances fallback:", err);
  }
  return inMemoryRemittances;
}

export async function addRemittance(payload: {
  crn_id: string;
  courier: string;
  total_cod_collected: number;
  courier_charges_deducted: number;
  remittance_date: string;
  bank_utr?: string;
  status: "Pending" | "Remitted";
  orders_count: number;
}): Promise<RemittanceRecord> {
  const net = Number(payload.total_cod_collected) - Number(payload.courier_charges_deducted);
  const newRem: RemittanceRecord = {
    id: `rem-${Date.now()}`,
    crn_id: payload.crn_id,
    courier: payload.courier,
    total_cod_collected: Number(payload.total_cod_collected),
    courier_charges_deducted: Number(payload.courier_charges_deducted),
    net_remitted_amount: net,
    remittance_date: payload.remittance_date,
    bank_utr: payload.bank_utr || "Pending UTR",
    status: payload.status,
    orders_count: Number(payload.orders_count),
    created_at: new Date().toISOString(),
  };

  inMemoryRemittances.unshift(newRem);

  try {
    await executeD1Query(
      `INSERT INTO remittances (id, crn_id, courier, total_cod_collected, courier_charges_deducted, net_remitted_amount, remittance_date, bank_utr, status, orders_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newRem.id,
        newRem.crn_id,
        newRem.courier,
        newRem.total_cod_collected,
        newRem.courier_charges_deducted,
        newRem.net_remitted_amount,
        newRem.remittance_date,
        newRem.bank_utr,
        newRem.status,
        newRem.orders_count,
      ]
    );
  } catch (err) {
    console.warn("D1 addRemittance error:", err);
  }

  return newRem;
}

// ==========================================
// 5. ORDERS & 360 TRACKING SERVICES
// ==========================================
export async function getERPOrders(filters?: {
  delivery_status?: string;
  payment_method?: string;
  search?: string;
}): Promise<ERPOrder[]> {
  try {
    let sql = "SELECT * FROM orders WHERE 1=1";
    const params: any[] = [];

    if (filters?.delivery_status && filters.delivery_status !== "all") {
      sql += " AND delivery_status = ?";
      params.push(filters.delivery_status);
    }
    if (filters?.payment_method && filters.payment_method !== "all") {
      sql += " AND payment_method = ?";
      params.push(filters.payment_method);
    }
    if (filters?.search && filters.search.trim()) {
      sql += " AND (shopify_order_id LIKE ? OR customer_name LIKE ? OR shiprocket_awb LIKE ?)";
      const term = `%${filters.search.trim()}%`;
      params.push(term, term, term);
    }
    sql += " ORDER BY created_at DESC";

    const rows = await executeD1Query<ERPOrder>(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("D1 getERPOrders fallback:", err);
  }

  let res = [...inMemoryERPOrders];
  if (filters?.delivery_status && filters.delivery_status !== "all") {
    res = res.filter((o) => o.delivery_status === filters.delivery_status);
  }
  if (filters?.payment_method && filters.payment_method !== "all") {
    res = res.filter((o) => o.payment_method === filters.payment_method);
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase();
    res = res.filter(
      (o) =>
        o.shopify_order_id.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        (o.shiprocket_awb && o.shiprocket_awb.toLowerCase().includes(s))
    );
  }
  return res;
}

// ==========================================
// 6. EXECUTIVE DASHBOARD KPI ENGINE
// ==========================================
export async function getDashboardKPIs() {
  const orders = await getERPOrders();
  const expenses = await getExpenses();
  const suppliers = await getSuppliers();

  const totalOrders = orders.length;
  const confirmedOrders = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Returned").length;
  const shippedOrders = orders.filter((o) => o.delivery_status === "In Transit" || o.delivery_status === "Out for Delivery").length;
  const deliveredOrders = orders.filter((o) => o.delivery_status === "Delivered").length;
  const ndrOrders = orders.filter((o) => o.delivery_status === "NDR").length;
  const rtoOrders = orders.filter((o) => o.delivery_status === "RTO Delivered" || o.delivery_status === "RTO Initiated" || o.delivery_status === "RTO In Transit").length;

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const productCosts = orders.reduce((sum, o) => sum + (Number(o.product_cost) || 0), 0);
  const shippingCosts = orders.reduce((sum, o) => sum + (Number(o.shipping_cost) || 0), 0);
  const rtoCharges = orders.reduce((sum, o) => sum + (Number(o.rto_shipping_charge) || 0), 0);
  const adSpend = expenses.filter((e) => e.category === "Meta Ads").reduce((sum, e) => sum + Number(e.amount), 0);
  const otherExpenses = expenses.filter((e) => e.category !== "Meta Ads").reduce((sum, e) => sum + Number(e.amount), 0);

  const grossProfit = totalSales - productCosts;
  const netProfit = grossProfit - shippingCosts - rtoCharges - adSpend - otherExpenses;
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
  const rtoPercentage = totalOrders > 0 ? (rtoOrders / totalOrders) * 100 : 0;

  // Pending COD calculation: orders where payment_method = COD, delivered or in-transit, but remittance_status = Pending
  const pendingCODRemittance = orders
    .filter((o) => o.payment_method === "COD" && o.remittance_status === "Pending")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Supplier RTO Balance total
  const totalRTOBalance = suppliers.reduce((sum, s) => sum + Number(s.available_rto_balance), 0);

  return {
    totalOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    ndrOrders,
    rtoOrders,
    totalSales,
    productCosts,
    shippingCosts,
    rtoCharges,
    adSpend,
    otherExpenses,
    grossProfit,
    netProfit,
    profitMargin: Number(profitMargin.toFixed(1)),
    rtoPercentage: Number(rtoPercentage.toFixed(1)),
    pendingCODRemittance,
    totalRTOBalance,
  };
}
