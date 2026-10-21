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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abandoned_phone ON abandoned_checkouts(customer_phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_token ON abandoned_checkouts(recovery_token);
CREATE INDEX IF NOT EXISTS idx_abandoned_status ON abandoned_checkouts(status);
