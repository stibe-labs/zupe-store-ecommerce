-- CRM and Meta Marketing Schema Migration for Vittal Digital

-- 1. Unified CRM Leads Table
CREATE TABLE IF NOT EXISTS crm_leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT DEFAULT 'abandoned_checkout', -- 'abandoned_checkout' | 'whatsapp' | 'storefront' | 'manual' | 'meta_ads'
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
CREATE INDEX IF NOT EXISTS idx_crm_leads_phone ON crm_leads(phone);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);

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
CREATE INDEX IF NOT EXISTS idx_meta_spend_date ON meta_ad_spend(date);
CREATE INDEX IF NOT EXISTS idx_meta_spend_camp ON meta_ad_spend(campaign_name);

-- 3. Customer Staff Notes & Follow-ups
CREATE TABLE IF NOT EXISTS crm_customer_notes (
    id TEXT PRIMARY KEY,
    customer_identifier TEXT NOT NULL, -- phone or email
    author TEXT DEFAULT 'Admin',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crm_notes_cust ON crm_customer_notes(customer_identifier);

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
CREATE INDEX IF NOT EXISTS idx_meta_events_name ON meta_events_log(event_name);
CREATE INDEX IF NOT EXISTS idx_meta_events_time ON meta_events_log(created_at);

-- 5. Default Meta Integration in integrations_config (if not exists)
INSERT OR IGNORE INTO integrations_config (
    provider, config_data, is_active, last_synced_at, updated_at
) VALUES (
    'meta',
    '{"accountId":"","token":"","pixelId":"","testEventCode":"","autoSync":true,"isActive":true,"lastSyncedAt":""}',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 6. Populate CRM leads from abandoned checkouts
INSERT OR IGNORE INTO crm_leads (
    id, name, phone, email, source, status, temperature, potential_value, tags, notes, created_at, updated_at
)
SELECT 
    'lead_' || substr(id, 5),
    COALESCE(customer_name, 'Prospective Customer'),
    customer_phone,
    customer_email,
    'abandoned_checkout',
    CASE WHEN status = 'recovered' THEN 'converted' ELSE 'new' END,
    CASE WHEN total_amount >= 3000 THEN 'hot' WHEN total_amount >= 1500 THEN 'warm' ELSE 'cold' END,
    total_amount,
    '["abandoned_cart", "high_intent"]',
    'Customer abandoned at checkout; recovery token available: ' || recovery_token,
    created_at,
    updated_at
FROM abandoned_checkouts;

