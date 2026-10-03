-- ==========================================================
-- Zupe Store ERP Database Schema for Cloudflare D1
-- ==========================================================

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    available_rto_balance REAL DEFAULT 0,
    total_credits_added REAL DEFAULT 0,
    total_credits_used REAL DEFAULT 0,
    pending_credits REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. RTO Supplier Credit Ledger
CREATE TABLE IF NOT EXISTS rto_credit_ledger (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'RTO Credit' | 'Credit Used'
    amount REAL NOT NULL,
    running_balance REAL NOT NULL,
    status TEXT NOT NULL, -- 'Credited' | 'Pending' | 'Partially Used' | 'Used'
    used_against_order_id TEXT,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
);

-- 3. Business Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'Meta Ads', 'Product cost', 'Shiprocket/shipping', 'RTO charges', 'Software/subscriptions', 'Other'
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    vendor TEXT,
    reference_no TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. COD Remittances & Courier Settlements
CREATE TABLE IF NOT EXISTS remittances (
    id TEXT PRIMARY KEY,
    crn_id TEXT UNIQUE NOT NULL,
    courier TEXT NOT NULL,
    total_cod_collected REAL NOT NULL,
    courier_charges_deducted REAL NOT NULL,
    net_remitted_amount REAL NOT NULL,
    remittance_date TEXT NOT NULL,
    bank_utr TEXT,
    status TEXT DEFAULT 'Remitted', -- 'Pending' | 'Remitted' | 'Disputed'
    orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ERP Integrations Configuration Store
CREATE TABLE IF NOT EXISTS integrations_config (
    provider TEXT PRIMARY KEY,
    config_data TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    last_synced_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add Enriched Columns to Orders Table (ignoring errors if already exist)
-- Handled programmatically or via safe ALTER queries
