-- CRM and Meta Marketing Schema Migration for Turkiye Jam

-- 1. Unified CRM Leads Table
CREATE TABLE IF NOT EXISTS crm_leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT DEFAULT 'abandoned_checkout', -- 'abandoned_checkout' | 'whatsapp' | 'storefront' | 'manual'
    status TEXT DEFAULT 'new', -- 'new' | 'contacted' | 'interested' | 'converted' | 'lost'
    temperature TEXT DEFAULT 'warm', -- 'hot' | 'warm' | 'cold'
    potential_value REAL DEFAULT 0,
    tags TEXT DEFAULT '[]', -- JSON string array
    notes TEXT,
    converted_order_id TEXT,
    last_contacted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Meta Ad Spend & Campaign Performance
CREATE TABLE IF NOT EXISTS meta_ad_spend (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL, -- YYYY-MM-DD
    campaign_id TEXT,
    campaign_name TEXT NOT NULL,
    adset_name TEXT,
    spend REAL NOT NULL DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cpc REAL DEFAULT 0,
    ctr REAL DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    purchase_value REAL DEFAULT 0,
    roas REAL DEFAULT 0,
    synced_from TEXT DEFAULT 'meta_api', -- 'meta_api' | 'manual'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Staff Notes & Follow-ups
CREATE TABLE IF NOT EXISTS crm_customer_notes (
    id TEXT PRIMARY KEY,
    customer_identifier TEXT NOT NULL, -- phone or email
    author TEXT DEFAULT 'Admin',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Meta Pixel & CAPI Event Log
CREATE TABLE IF NOT EXISTS meta_events_log (
    id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_source TEXT NOT NULL, -- 'browser_pixel' | 'server_capi'
    payload TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

