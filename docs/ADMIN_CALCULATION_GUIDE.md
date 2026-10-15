# Zupe Store — Admin Financial & Operations Calculation Guide

This document explains the mathematical formulas, underlying database tables, and business logic used to calculate every metric and card across the **Zupe Store Dropship ERP Admin Dashboard**.

---

## 1. Executive Summary: Core Financial Equation

The system follows double-entry dropshipping accounting:

```
┌────────────────────────────────────────────────────────┐
│                   TOTAL SALES REVENUE                  │  ₹33,512
└───────────────────────────┬────────────────────────────┘
                            │  Minus Product Cost (COGS)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      GROSS PROFIT                      │  ₹19,538
└───────────────────────────┬────────────────────────────┘
                            │  Minus Forward Courier Freight   (₹2,260)
                            │  Minus Reverse RTO Freight       (₹125)
                            │  Minus Meta Ads Ad Spend         (₹4,500)
                            │  Minus Overhead Operating Costs  (₹9,169)
                            ▼
┌────────────────────────────────────────────────────────┐
│               TRUE CUMULATIVE NET PROFIT               │  ₹3,484
│               (Realized Net Margin: 10.4%)             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Page-by-Page Metric Calculations

### A. Business Intelligence & Reports (`/admin/reports`)

| Card / Metric | Displayed Value | Mathematical Formula | Underlying Database Tables & Fields |
| :--- | :--- | :--- | :--- |
| **Total Gross Revenue** | **₹33,512** | $\sum \text{orders.total\_amount}$ | `orders.total_amount`<br>Includes all Shopify & online checkout orders. |
| **Cumulative Net Profit** | **₹3,484** | $\text{Gross Revenue} - \text{COGS} - \text{Shipping} - \text{RTO} - \text{Ads} - \text{Overhead}$ | • `orders.total_amount`<br>• `orders.product_cost`<br>• `orders.shipping_cost`<br>• `orders.rto_shipping_charge`<br>• `expenses.amount` |
| **Net Profit Margin** | **10.4%** | $\frac{\text{Cumulative Net Profit}}{\text{Total Gross Revenue}} \times 100$ | $\frac{₹3,484}{₹33,512} \times 100 = \mathbf{10.4\%}$ |
| **Meta Ads ROAS** | **7.45x** | $\frac{\text{Total Gross Revenue}}{\text{Meta Ads Spend}}$ | $\frac{₹33,512}{₹4,500} = \mathbf{7.45x}$<br>Attributed from `expenses` where `category = 'Meta Ads'`. |
| **Orders Audited** | **29 orders** (3 RTO) | $\text{COUNT(orders)}$ & $\text{COUNT(RTO)}$ | Count of all orders (29) and count where delivery status is `RTO Delivered` or `RTO Initiated` (3). |

#### Monthly P&L Breakdown Table:
1. **October 2026**:
   - Gross Sales: **₹31,314**
   - COGS: **₹13,094**
   - Forward Shipping: **₹2,095**
   - RTO Reverse Charges: **₹65**
   - Meta Ad Spend: **₹4,500**
   - Overhead Expenses: **₹5,249**
   - **Net Profit**: $31,314 - 13,094 - 2,095 - 65 - 4,500 - 5,249 = \mathbf{₹6,311}$ (**20.2% margin**)
2. **September 2026**:
   - Gross Sales: **₹2,198**
   - COGS: **₹880**
   - Shipping: **₹165**
   - RTO: **₹60**
   - Overheads: **₹3,920**
   - **Net Profit**: $2,198 - 880 - 165 - 60 - 3,920 = \mathbf{-₹2,827}$
3. **Cumulative Total**:
   - $\text{Total Net Profit} = ₹6,311 + (-₹2,827) = \mathbf{₹3,484}$ (Exact match).

---

### B. Executive Main Dashboard (`/admin`)

#### Order Pipeline Cards:
| Card | Number | Calculation Logic |
| :--- | :--- | :--- |
| **Total Orders** | **29** | Total orders recorded in ERP. |
| **Confirmed** | **26** | Orders where `status != 'Cancelled'` and `status != 'Returned'`. |
| **Shipped** | **2** | Orders where `delivery_status` is `In Transit` or `Out for Delivery`. |
| **Delivered** | **11** | Orders successfully delivered to customer doorstep ($11/29 = 37.9\%$). |
| **NDR Orders** | **1** | Shipments where courier reported Non-Delivery (e.g. customer unreachable). |
| **RTO Orders** | **3** | Orders marked as Return-To-Origin ($3/29 = 10.3\%$). |

#### Financial Cards:
| Card | Value | Calculation Formula & Explanation |
| :--- | :--- | :--- |
| **Total Sales Revenue** | **₹33,512** | Sum of selling price of all 29 orders. |
| **Gross Profit (Sales - COGS)** | **₹19,538** | $\text{Total Sales (₹33,512)} - \text{Product COGS (₹13,974)} = \mathbf{₹19,538}$.<br>Shows margin before ad-spend and shipping fees. |
| **True Net Profit** | **₹3,484** | Final retained earnings after subtracting logistics freight, reverse RTO fees, Meta ads, and operational expenses. |
| **Pending COD Remittance** | **₹7,794** | $\sum \text{orders.total\_amount}$ where `payment_method = 'COD'` and `remittance_status = 'Pending'`.<br>**What it means:** Cash collected by Delhivery/BlueDart couriers from customers that has not yet been deposited into your bank account. |

---

### C. RTO Refund Balance & Supplier Credit (`/admin/rto-refund-balance`)

This module tracks supplier refunds when customers return orders (RTO):

| Card | Value | Calculation Formula & Meaning |
| :--- | :--- | :--- |
| **Total RTO Credits Added** | **₹26,470** | $\sum \text{suppliers.total\_credits\_added}$.<br>Total monetary value of returned products refunded/credited by suppliers across 48 orders. |
| **Total Credits Used** | **₹18,150** | $\sum \text{suppliers.total\_credits\_used}$.<br>Amount of supplier credit deducted to pay for new inventory/purchase orders. |
| **Available RTO Balance** | **₹8,320** | $\text{Credits Added (₹26,470)} - \text{Credits Used (₹18,150)} = \mathbf{₹8,320}$.<br>**Real Asset:** Money currently sitting with suppliers that you can use to fulfill new orders without paying cash. |
| **Pending Supplier Credits** | **₹2,800** | Value of 6 returned packages currently in transit back to supplier warehouse awaiting supplier confirmation. |

---

### D. Customer Intelligence & LTV (`/admin/customers`)

| Card | Value | Calculation Formula |
| :--- | :--- | :--- |
| **Total Unique Customers** | **19** | $\text{COUNT(DISTINCT phone/email)}$ across all store checkouts. |
| **Repeat Buyer Rate** | **21.1%** | $\frac{\text{Customers with 2+ orders (4)}}{\text{Total Unique Customers (19)}} \times 100 = \mathbf{21.1\%}$. |
| **Average Customer LTV** | **₹1,764** | $\frac{\text{Total Spend of all customers (₹33,512)}}{\text{Total Unique Customers (19)}} = \mathbf{₹1,764}$. |
| **Doorstep Reliability** | **16 / 19** | 16 out of 19 customers have **0% RTO rate** (they accept all packages they order). |

---

## 3. Order-Level Unit Economics Formula

When auditing an individual order in the ERP (e.g. `#1067`):

$$\text{Net Order Profit} = \begin{cases} 
\text{Selling Price} - \text{COGS} - \text{Shipping} - \text{Ad Spend} & \text{if Delivered} \\
0 - \text{Forward Shipping} - \text{Reverse RTO Fee} - \text{Ad Spend} & \text{if RTO Returned} \\
0 & \text{if Cancelled before dispatch}
\end{cases}$$

> [!NOTE]
> If an order goes RTO, the customer does not pay (₹0 revenue), but you incur both **Forward Freight** (e.g. ₹75) and **Reverse Freight** (e.g. ₹65) plus the **Attributed Meta Ad Spend**. When the supplier refunds the product cost, it is credited to your **RTO Refund Balance**, preventing product loss.
