-- Seed CRM leads from existing abandoned checkouts
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
    CASE WHEN total_amount >= 1500 THEN 'hot' WHEN total_amount >= 900 THEN 'warm' ELSE 'cold' END,
    total_amount,
    '["abandoned_cart", "high_intent"]',
    'Customer abandoned at checkout; recovery token available: ' || recovery_token,
    created_at,
    updated_at
FROM abandoned_checkouts;

-- Additional prospective leads from customer chats & inquiries
INSERT OR IGNORE INTO crm_leads (
    id, name, phone, email, source, status, temperature, potential_value, tags, notes, created_at
) VALUES 
('lead_wa_7356765036', 'Alliance Tedros', '+91 73567 65036', 'alliance@stibe.in', 'whatsapp', 'converted', 'hot', 948, '["vip", "repeat_buyer"]', 'VIP buyer, prefers COD with online advance.', '2026-11-06 09:30:00'),
('lead_inq_9846644646', 'Fameesh K', '+91 98466 44646', 'fameesh@gmail.com', 'storefront', 'interested', 'hot', 1399, '["4_pack_interest", "kerala"]', 'Inquired about dosage and delivery speed to Malappuram.', '2026-11-05 14:15:00'),
('lead_inq_9198765432', 'Rahul Sharma', '+91 91987 65432', 'rahul.s@outlook.com', 'whatsapp', 'contacted', 'warm', 1899, '["bulk_inquiry", "delhi"]', 'Sent special ₹100 discount coupon code. Follow-up scheduled.', '2026-11-05 11:20:00'),
('lead_inq_9745123456', 'Mohammed Anas', '+91 97451 23456', 'anas.m@yahoo.com', 'ad_campaign', 'new', 'warm', 899, '["meta_ads", "2_pack"]', 'Clicked Instagram ad for 2-sachet trial. Reached checkout.', '2026-11-06 13:40:00');

-- Seed Meta Ad Spend & Campaign Insights for November 2026
INSERT OR IGNORE INTO meta_ad_spend (
    id, date, campaign_id, campaign_name, adset_name, spend, impressions, clicks, cpc, ctr, purchases, purchase_value, roas, synced_from
) VALUES
('meta_spend_nov_06_c1', '2026-11-06', 'camp_238510928374', 'TJ - Top of Funnel - Men Energy & Vitality', 'Advantage+ Audience - Age 25-50 Pan-India', 450.00, 3120, 142, 3.17, 4.55, 2, 1847.00, 4.10, 'meta_api'),
('meta_spend_nov_06_c2', '2026-11-06', 'camp_238510928375', 'TJ - Retargeting - Cart Dropoffs & Engaged', 'Custom Audience - 180d Site Visitors', 220.00, 1450, 89, 2.47, 6.14, 1, 948.00, 4.31, 'meta_api'),
('meta_spend_nov_05_c1', '2026-11-05', 'camp_238510928374', 'TJ - Top of Funnel - Men Energy & Vitality', 'Advantage+ Audience - Age 25-50 Pan-India', 650.00, 4890, 198, 3.28, 4.05, 3, 2797.00, 4.30, 'meta_api'),
('meta_spend_nov_05_c2', '2026-11-05', 'camp_238510928375', 'TJ - Retargeting - Cart Dropoffs & Engaged', 'Custom Audience - 180d Site Visitors', 280.00, 1820, 112, 2.50, 6.15, 1, 1399.00, 5.00, 'meta_api'),
('meta_spend_nov_04_c1', '2026-11-04', 'camp_238510928374', 'TJ - Top of Funnel - Men Energy & Vitality', 'Advantage+ Audience - Age 25-50 Pan-India', 550.00, 3950, 165, 3.33, 4.18, 2, 1798.00, 3.27, 'meta_api');

-- Seed matching ERP expenses so P&L and Profit Calculator reflect ad spend
INSERT OR IGNORE INTO expenses (
    id, category, amount, date, vendor, reference_no, notes, created_at
) VALUES
('exp_meta_20261106', 'Meta Ads', 670.00, '2026-11-06', 'Meta Platforms Ireland', 'INV-META-2026-1106', 'Daily ad spend: TOFU & Cart Retargeting campaigns', '2026-11-06 14:00:00'),
('exp_meta_20261105', 'Meta Ads', 930.00, '2026-11-05', 'Meta Platforms Ireland', 'INV-META-2026-1105', 'Daily ad spend: TOFU & Retargeting campaigns', '2026-11-05 23:59:00'),
('exp_meta_20261104', 'Meta Ads', 550.00, '2026-11-04', 'Meta Platforms Ireland', 'INV-META-2026-1104', 'Daily ad spend: TOFU launch campaign', '2026-11-04 23:59:00');

-- Configure default Meta integration in integrations_config
INSERT OR REPLACE INTO integrations_config (
    provider, config_data, is_active, last_synced_at, updated_at
) VALUES (
    'meta',
    '{"accountId":"act_109283746552","token":"EAAK10928374live","pixelId":"982736451029384","testEventCode":"TEST84920","autoSync":true,"isActive":true,"lastSyncedAt":"2026-11-06T11:15:00.000Z"}',
    1,
    '2026-11-06 11:15:00',
    CURRENT_TIMESTAMP
);

-- Seed initial Meta Pixel & CAPI event logs
INSERT OR IGNORE INTO meta_events_log (
    id, event_name, event_id, event_source, payload, status, created_at
) VALUES
('evt_seed_01', 'PageView', 'evt_pv_1793959800', 'browser_pixel', '{"url":"https://turkiyejam.com/","title":"Turkiye Jam | 100% Authentic Herbal Paste"}', 'success', '2026-11-06 10:10:00'),
('evt_seed_02', 'ViewContent', 'evt_vc_1793959820', 'browser_pixel', '{"content_ids":["turkiye-jam-pack-2"],"content_type":"product","value":899,"currency":"INR"}', 'success', '2026-11-06 10:10:20'),
('evt_seed_03', 'AddToCart', 'evt_atc_1793959830', 'browser_pixel', '{"content_ids":["turkiye-jam-pack-2"],"value":899,"currency":"INR"}', 'success', '2026-11-06 10:10:30'),
('evt_seed_04', 'InitiateCheckout', 'evt_ic_1793959840', 'browser_pixel', '{"num_items":1,"value":899,"currency":"INR"}', 'success', '2026-11-06 10:10:40'),
('evt_seed_05', 'Purchase', 'evt_pur_1793959852', 'server_capi', '{"order_id":"#1181","value":948,"currency":"INR","advance_paid":49,"balance_due":899,"payment_method":"COD"}', 'success', '2026-11-06 10:10:52');

