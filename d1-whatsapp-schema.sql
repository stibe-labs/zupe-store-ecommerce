-- Zupe Store — WhatsApp Cloud API Database Schema
-- Dedicated schema for Meta WhatsApp Business Account (+91 97781 37954)
-- Supports customer conversations, automated template history, two-way messaging & real-time webhook sync

CREATE TABLE IF NOT EXISTS whatsapp_chats (
    id TEXT PRIMARY KEY,                       -- Normalized phone digits (e.g. '919778137954')
    phone TEXT UNIQUE NOT NULL,                -- E.164 phone string
    customer_name TEXT,                        -- Name from Meta profile or Zupe orders
    avatar_url TEXT,                           -- Contact photo or generated avatar
    last_message TEXT,                         -- Text preview of latest message
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of latest message
    unread_count INTEGER DEFAULT 0,            -- Number of unread messages from customer
    is_pinned INTEGER DEFAULT 0,               -- 1 if pinned to top, 0 otherwise
    is_archived INTEGER DEFAULT 0,             -- 1 if archived, 0 otherwise
    tags TEXT,                                 -- JSON array of tags: '["Customer", "COD"]'
    meta_user_id TEXT,                         -- Meta WABA contact wa_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,                       -- Meta message ID (wamid.HBg...) or generated UUID
    chat_id TEXT NOT NULL,                     -- Foreign key reference to whatsapp_chats(id)
    phone TEXT NOT NULL,                       -- Recipient or sender phone number
    sender TEXT NOT NULL,                      -- 'customer' | 'admin' | 'system' | 'bot'
    message_type TEXT DEFAULT 'text',          -- 'text' | 'image' | 'template' | 'interactive' | 'button' | 'document'
    content TEXT NOT NULL,                     -- Text body or template description
    template_name TEXT,                        -- Name of Meta approved template (if applicable)
    media_url TEXT,                            -- CDN URL of image/document
    buttons TEXT,                              -- JSON array of interactive buttons
    status TEXT DEFAULT 'delivered',           -- 'sent' | 'delivered' | 'read' | 'failed'
    meta_message_id TEXT,                      -- WAMID from Meta Cloud API
    raw_payload TEXT,                          -- Raw JSON payload from Meta webhook/API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_wa_chats_last_message ON whatsapp_chats(is_pinned DESC, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_chat_id ON whatsapp_messages(chat_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_meta_id ON whatsapp_messages(meta_message_id);
