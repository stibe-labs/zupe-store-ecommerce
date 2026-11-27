-- ==========================================================
-- Zupe Store E-Commerce Database Schema for Cloudflare D1
-- ==========================================================

-- 1. Users & Accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT DEFAULT '',
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 2. Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    tagline TEXT,
    description TEXT,
    price REAL NOT NULL,
    mrp REAL,
    offer_price REAL,
    stock_count INTEGER DEFAULT 0,
    volume TEXT,
    poster_image TEXT,
    images TEXT,
    color TEXT,
    colors TEXT,
    has_colors INTEGER DEFAULT 0,
    overview_blocks TEXT,
    material TEXT,
    badge TEXT,
    cost_price REAL DEFAULT 0,
    features TEXT,
    specifications TEXT,
    whats_in_box TEXT,
    sold_count TEXT,
    bundle_tiers TEXT,
    how_to_use TEXT,
    comparison_table TEXT,
    video_ids TEXT,
    in_stock INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.9,
    review_count INTEGER DEFAULT 0,
    supplier_id TEXT,
    supplier_name TEXT,
    categories TEXT,
    subcategories TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Shipping Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    guest_email TEXT,
    total_amount REAL NOT NULL,
    subtotal REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    shipping_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Processing',
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Completed',
    shipping_address TEXT NOT NULL,
    tracking_number TEXT,
    whatsapp_confirm_status TEXT DEFAULT 'pending_whatsapp',
    whatsapp_confirm_token TEXT,
    whatsapp_token_used INTEGER DEFAULT 0,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 5. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    poster_image TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- 6. User Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- 7. User Cart Items (synced for logged-in users)
CREATE TABLE IF NOT EXISTS user_carts (
    user_id TEXT PRIMARY KEY,
    cart_data TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    subtitle TEXT,
    category TEXT,
    price REAL NOT NULL,
    mrp REAL,
    quantity INTEGER NOT NULL,
    poster_image TEXT,
    volume TEXT,
    color TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- 8. Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT DEFAULT 'PERCENTAGE',
    discount_value REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_discount_amount REAL,
    expires_at TIMESTAMP,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Abandoned Checkouts
CREATE TABLE IF NOT EXISTS abandoned_checkouts (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    shipping_address TEXT,
    city TEXT,
    postal_code TEXT,
    recovery_token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'abandoned',
    recovered_order_id TEXT,
    whatsapp_sent_count INTEGER DEFAULT 0,
    last_whatsapp_sent_at TIMESTAMP,
    source TEXT DEFAULT 'checkout',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_abandoned_phone ON abandoned_checkouts(customer_phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_token ON abandoned_checkouts(recovery_token);
CREATE INDEX IF NOT EXISTS idx_abandoned_status ON abandoned_checkouts(status);

-- ==========================================================
-- 10. Influencers & Affiliate Tracking
-- ==========================================================

CREATE TABLE IF NOT EXISTS influencers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    insta_id TEXT NOT NULL,
    notes TEXT,
    product_cost REAL DEFAULT 0,
    commission_type TEXT DEFAULT 'none', -- 'none' | 'percent' | 'fixed'
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
    destination TEXT DEFAULT 'home', -- 'home' or product ID/slug
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


