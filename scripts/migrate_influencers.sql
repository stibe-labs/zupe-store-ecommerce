-- Influencer Affiliate Tables Migration
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
CREATE INDEX IF NOT EXISTS idx_influencers_active ON influencers(active);
CREATE INDEX IF NOT EXISTS idx_influencers_insta ON influencers(insta_id);

CREATE TABLE IF NOT EXISTS influencer_links (
    id TEXT PRIMARY KEY,
    influencer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    destination TEXT DEFAULT 'home',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_influencer_links_code ON influencer_links(code);
CREATE INDEX IF NOT EXISTS idx_influencer_links_influencer ON influencer_links(influencer_id);

CREATE TABLE IF NOT EXISTS influencer_clicks (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL,
    influencer_id TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES influencer_links(id) ON DELETE CASCADE,
    FOREIGN KEY(influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_influencer_clicks_time ON influencer_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_influencer_clicks_link ON influencer_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_influencer_clicks_influencer ON influencer_clicks(influencer_id);

CREATE TABLE IF NOT EXISTS influencer_orders (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    link_id TEXT NOT NULL,
    influencer_id TEXT NOT NULL,
    order_total REAL NOT NULL,
    commission_amount REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES influencer_links(id) ON DELETE CASCADE,
    FOREIGN KEY(influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_influencer_orders_time ON influencer_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_influencer_orders_influencer ON influencer_orders(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_orders_link ON influencer_orders(link_id);
CREATE INDEX IF NOT EXISTS idx_influencer_orders_order ON influencer_orders(order_id);

CREATE TABLE IF NOT EXISTS influencer_payments (
    id TEXT PRIMARY KEY,
    influencer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    notes TEXT,
    paid_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_influencer_payments_influencer ON influencer_payments(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_payments_time ON influencer_payments(paid_on);
