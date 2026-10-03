-- ==========================================================
-- Zupe Store ERP Seed Data for Cloudflare D1
-- ==========================================================

-- 1. Suppliers
INSERT OR REPLACE INTO suppliers (id, name, code, contact_person, email, phone, address, available_rto_balance, total_credits_added, total_credits_used, pending_credits)
VALUES 
('sup-a', 'Supplier A (Decor Craft)', 'SUP-A', 'Rajesh Sharma', 'rajesh@decorcraft.in', '+91 98765 43210', 'Surat, Gujarat', 3200, 11500, 8300, 0),
('sup-b', 'Supplier B (Gadget Tech)', 'SUP-B', 'Amit Patel', 'amit@gadgettech.in', '+91 98220 12345', 'Ahmedabad, Gujarat', 2150, 6800, 4650, 0),
('sup-c', 'Supplier C (Wellness Hub)', 'SUP-C', 'Pooja Verma', 'pooja@wellnesshub.in', '+91 97111 88899', 'Bengaluru, Karnataka', 1000, 3900, 2900, 0),
('sup-d', 'Supplier D (Lifestyle Pro)', 'SUP-D', 'Sanjay Gupta', 'sanjay@lifestylepro.in', '+91 98450 77766', 'Delhi NCR', 1150, 3200, 2050, 2800);

-- 2. RTO Credit Ledger (matching the exact reference entries in Image 3)
INSERT OR REPLACE INTO rto_credit_ledger (id, supplier_id, order_id, product_id, product_name, type, amount, running_balance, status, used_against_order_id, date, notes)
VALUES
('rto-1', 'sup-a', '#1058', 'water-ripple-lamp', 'LED Night Lamp', 'RTO Credit', 500, 7500, 'Credited', NULL, '10 Oct 2026', 'Customer refused delivery at doorstep. Restocked by supplier.'),
('rto-2', 'sup-b', '#1042', 'thermal-printer', 'Mini Printer', 'Credit Used', -300, 7000, 'Used', '#1075', '08 Oct 2026', 'Applied against PO #1075 inventory purchase'),
('rto-3', 'sup-a', '#1036', 'mini-portable-steam-iron', 'Portable Iron', 'RTO Credit', 800, 7300, 'Credited', NULL, '05 Oct 2026', 'Customer address incomplete. Item returned to supplier.'),
('rto-4', 'sup-c', '#1019', 'mesh-nebulizer', 'Nebulizer', 'RTO Credit', 650, 6500, 'Partially Used', '#1050 (₹400)', '02 Oct 2026', 'Customer cancelled during transit. ₹400 used against #1050.'),
('rto-5', 'sup-b', '#1015', 'helicopter-perfume', 'Car Perfume', 'Credit Used', -700, 5850, 'Used', '#1068', '28 Sep 2026', 'Applied against PO #1068 inventory purchase'),
('rto-6', 'sup-d', '#1008', 'foldable-washer', 'Washer Machine', 'RTO Credit', 1200, 6550, 'Pending', NULL, '25 Sep 2026', 'RTO parcel delivered to supplier warehouse. Pending credit memo validation.'),
('rto-7', 'sup-a', '#0995', 'popcorn-maker', 'Popcorn Maker', 'RTO Credit', 950, 5350, 'Credited', NULL, '20 Sep 2026', 'Customer unavailable after 3 delivery attempts. Credited by supplier.'),
('rto-8', 'sup-c', '#0987', 'menstrual-heating-pad', 'Heating Pad', 'Credit Used', -500, 4400, 'Used', '#1020', '18 Sep 2026', 'Applied against PO #1020 inventory purchase');

-- 3. Initial Expenses
INSERT OR REPLACE INTO expenses (id, category, amount, date, vendor, reference_no, notes, created_by)
VALUES
('exp-1', 'Meta Ads', 4500, '2026-10-01', 'Meta Platforms', 'INV-META-9821', 'Aura Lamp & Steamer Advantage+ Campaign', 'Admin'),
('exp-2', 'Shiprocket/shipping', 3250, '2026-10-02', 'Shiprocket Logistics', 'SR-RECHARGE-441', 'Wallet recharge for forward & reverse freight', 'Admin'),
('exp-3', 'Software/subscriptions', 1999, '2026-10-02', 'Shopify', 'SHPFY-OCT-26', 'Shopify Basic Plan & App Subscriptions', 'Admin'),
('exp-4', 'RTO charges', 1420, '2026-09-30', 'Shiprocket', 'SR-RTO-INV-99', 'Reverse shipping charges on 8 returned packages', 'Admin'),
('exp-5', 'Other', 2500, '2026-09-28', 'PackSafe Solutions', 'INV-BOX-321', 'Custom corrugated shipping boxes & bubble mailers', 'Admin');

-- 4. Initial COD Remittances
INSERT OR REPLACE INTO remittances (id, crn_id, courier, total_cod_collected, courier_charges_deducted, net_remitted_amount, remittance_date, bank_utr, status, orders_count)
VALUES
('rem-1', 'CRN-SR-20261001-842', 'Shiprocket (Delhivery + Bluedart)', 18450, 2150, 16300, '2026-10-01', 'HDFC0001234987654', 'Remitted', 14),
('rem-2', 'CRN-SR-20260925-719', 'Shiprocket (Xpressbees)', 12800, 1640, 11160, '2026-09-25', 'ICIC0009876543210', 'Remitted', 9),
('rem-3', 'CRN-SR-20261003-904', 'Shiprocket (Shadowfax)', 9600, 1120, 8480, '2026-10-03', 'Pending UTR', 'Pending', 7);
