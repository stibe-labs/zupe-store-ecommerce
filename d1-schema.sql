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
    video_ids TEXT,
    in_stock INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.9,
    review_count INTEGER DEFAULT 0,
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
    shopify_order_id TEXT,
    user_id TEXT,
    guest_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    total_amount REAL NOT NULL,
    subtotal REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    shipping_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Processing',
    delivery_status TEXT DEFAULT 'Processing',
    courier_partner TEXT,
    shiprocket_awb TEXT,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Completed',
    shipping_address TEXT NOT NULL,
    tracking_number TEXT,
    items TEXT,
    ndr_status TEXT,
    rto_status TEXT,
    remittance_status TEXT,
    supplier_id TEXT,
    product_cost REAL,
    rto_shipping_charge REAL,
    ad_spend_attributed REAL,
    net_profit REAL,
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

-- 10. Vittal Digital Internal WhatsApp Desk
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id TEXT PRIMARY KEY,
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    order_id TEXT,
    order_status TEXT,
    order_total REAL,
    payment_method TEXT DEFAULT 'cod',
    shipping_address TEXT,
    avatar_url TEXT,
    unread_count INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    category TEXT DEFAULT 'orders',
    last_message_text TEXT,
    last_message_sender TEXT DEFAULT 'agent',
    last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_wa_conv_order ON whatsapp_conversations(order_id);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    content TEXT NOT NULL,
    media_url TEXT,
    media_caption TEXT,
    media_duration INTEGER,
    status TEXT DEFAULT 'sent',
    reactions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES whatsapp_conversations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);

-- 11. Vittal Digital Unified CRM & Meta Marketing Suite
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

CREATE TABLE IF NOT EXISTS crm_customer_notes (
    id TEXT PRIMARY KEY,
    customer_identifier TEXT NOT NULL, -- phone or email
    author TEXT DEFAULT 'Admin',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crm_notes_cust ON crm_customer_notes(customer_identifier);

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



