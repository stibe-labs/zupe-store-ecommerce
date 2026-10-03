-- Seed Realistic Orders for Zupe Store ERP Dashboard & Logistics
INSERT OR REPLACE INTO orders (
    id, shopify_order_id, user_id, guest_email, customer_name, customer_phone,
    total_amount, subtotal, discount_amount, shipping_cost, status, payment_method,
    payment_status, shipping_address, tracking_number, shiprocket_awb, shiprocket_shipment_id,
    courier_partner, delivery_status, ndr_status, rto_status, remittance_status,
    supplier_id, product_cost, rto_shipping_charge, ad_spend_attributed, net_profit, created_at
) VALUES
(
    'ord_1058', '#1058', NULL, 'rahul.m@gmail.com', 'Rahul Mishra', '+91 98112 34567',
    1099, 1099, 0, 85, 'Returned', 'COD',
    'Pending', 'Flat 402, Sunshine Heights, Andheri West, Mumbai, 400058', 'SR-AWB-9871101', 'SR-AWB-9871101', 'SHP-98711',
    'Delhivery', 'RTO Delivered', 'Customer Unavailable', 'Supplier Credited', 'N/A',
    'sup-a', 500, 65, 180, -150, '2026-10-01 10:14:00'
),
(
    'ord_1057', '#1057', NULL, 'sneha.k@outlook.com', 'Sneha Kapoor', '+91 98223 45678',
    1499, 1499, 0, 95, 'Delivered', 'Prepaid',
    'Completed', 'House 12B, Sector 14, Gurugram, Haryana, 122001', 'SR-AWB-9871102', 'SR-AWB-9871102', 'SHP-98712',
    'Bluedart', 'Delivered', 'None', 'None', 'Settled',
    'sup-b', 600, 0, 220, 584, '2026-10-01 11:30:00'
),
(
    'ord_1056', '#1056', NULL, 'amit.b@yahoo.com', 'Amit Bansal', '+91 98450 11223',
    899, 899, 0, 75, 'Delivered', 'COD',
    'Completed', '304, Green Glen Layout, Bellandur, Bengaluru, Karnataka, 560103', 'SR-AWB-9871103', 'SR-AWB-9871103', 'SHP-98713',
    'Shadowfax', 'Delivered', 'None', 'None', 'Remitted',
    'sup-c', 350, 0, 140, 334, '2026-10-01 13:45:00'
),
(
    'ord_1055', '#1055', NULL, 'vikram.s@gmail.com', 'Vikram Singh', '+91 99100 88776',
    1299, 1299, 0, 85, 'In Transit', 'COD',
    'Pending', 'Plot 88, Anna Nagar West, Chennai, Tamil Nadu, 600040', 'SR-AWB-9871104', 'SR-AWB-9871104', 'SHP-98714',
    'Xpressbees', 'In Transit', 'None', 'None', 'Pending',
    'sup-d', 520, 0, 190, 504, '2026-10-02 09:15:00'
),
(
    'ord_1054', '#1054', NULL, 'pooja.n@gmail.com', 'Pooja Nair', '+91 98470 55443',
    699, 699, 0, 70, 'Shipped', 'Prepaid',
    'Completed', 'TC 25/110, Vazhuthacaud, Thiruvananthapuram, Kerala, 695014', 'SR-AWB-9871105', 'SR-AWB-9871105', 'SHP-98715',
    'Delhivery', 'Out for Delivery', 'None', 'None', 'Settled',
    'sup-a', 280, 0, 110, 239, '2026-10-02 11:00:00'
),
(
    'ord_1053', '#1053', NULL, 'karan.d@gmail.com', 'Karan Dave', '+91 97230 66554',
    1799, 1799, 0, 110, 'Processing', 'COD',
    'Pending', 'A-51, Satellite Road, Ahmedabad, Gujarat, 380015', 'SR-AWB-9871106', 'SR-AWB-9871106', 'SHP-98716',
    'Delhivery', 'NDR', 'Doorstep Customer Refused', 'None', 'Pending',
    'sup-b', 750, 0, 260, 679, '2026-10-02 14:20:00'
),
(
    'ord_1052', '#1052', NULL, 'rohit.v@gmail.com', 'Rohit Verma', '+91 98880 33221',
    999, 999, 0, 80, 'Returned', 'COD',
    'Pending', 'Sco 45, Sector 35-C, Chandigarh, 160022', 'SR-AWB-9871107', 'SR-AWB-9871107', 'SHP-98717',
    'Bluedart', 'RTO Delivered', 'Address Untraceable', 'Supplier Credited', 'N/A',
    'sup-c', 400, 60, 150, -140, '2026-09-29 16:30:00'
),
(
    'ord_1051', '#1051', NULL, 'ananya.p@gmail.com', 'Ananya Pandey', '+91 99200 44332',
    1199, 1199, 0, 85, 'Delivered', 'Prepaid',
    'Completed', 'B-102, Kothrud, Pune, Maharashtra, 411038', 'SR-AWB-9871108', 'SR-AWB-9871108', 'SHP-98718',
    'Delhivery', 'Delivered', 'None', 'None', 'Settled',
    'sup-a', 480, 0, 170, 464, '2026-09-30 12:10:00'
);
