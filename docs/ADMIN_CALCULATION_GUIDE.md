# Zupe Store — Business Intelligence & Financial Calculation Guide
**Audience:** Zupe Store Administrator / Store Owners & Management  
**System Module:** `/admin/reports` (Business Intelligence & Executive Analytics)  
**Version:** 2.0 (Live ERP & Attribution Sync)

---

## 📌 Executive Overview

The **Business Intelligence & Reports** dashboard in the Zupe Store Admin Panel is engineered to provide complete financial transparency for Indian D2C e-commerce operations. It tracks both top-line cash flow and true bottom-line profitability by accounting for:
- Sourcing Costs (COGS)
- Forward 3PL Logistics (Shiprocket, Delhivery, Bluedart, etc.)
- Doorstep Return to Origin (RTO) Reverse Freight
- Paid Digital Customer Acquisition (Meta Advantage+ Shopping Campaigns)
- General Operational Overheads
- Realized COD Cash Remittances & Supplier RTO Credit Recovery

---

## 📅 Date Range Filtering System

The reports dashboard includes an instant, dynamic date range filter toolbar located immediately below the main header:

| Filter Option | Range Calculated | Primary Use Case |
|---|---|---|
| **Today** | Current calendar day (`YYYY-MM-DD` 00:00 to 23:59) | Monitor intraday order velocity, daily ad spend, and live profitability. |
| **This Week** | Rolling 7-day window (Today minus 6 days through Today) | Detect weekly volume trends and optimize weekend advertising budgets. |
| **Monthly** | First day of current month through the last day of the month | Standard accounting period reconciliation for monthly P&L reporting. |
| **Custom Range** | User-selected **From Date** and **To Date** pickers | Quarterly reviews, festival season audits (e.g. Diwali sale), or specific marketing campaign runs. |

> **Dynamic Recalculation:** Changing the date filter immediately recalculates the top Executive KPI Cards and filters data across **all 5 report sections simultaneously**.

---

## 1. Monthly Profit & Loss Statement (P&L)

### 🎯 Purpose
Provides a macro-level overview of total store profitability by subtracting all direct and indirect expenses from total gross customer sales.

### 📐 Calculation Formulas

$$\text{Net Profit} = \text{Gross Sales} - \text{COGS} - \text{Forward Shipping} - \text{RTO Reverse Charges} - \text{Ad Spend} - \text{Overheads}$$

$$\text{Net Margin \%} = \left(\frac{\text{Net Profit}}{\text{Gross Sales}}\right) \times 100$$

### 🔍 Field Breakdown
1. **Gross Sales / Revenue:**
   - **Source:** Orders Database (`total_amount`).
   - **Definition:** The total monetary value of customer orders received (Prepaid + Cash on Delivery). Voided and cancelled orders are excluded.
2. **COGS (Cost of Goods Sold):**
   - **Source:** Product Wholesale Cost (`product_cost`).
   - **Definition:** The wholesale purchase price paid to suppliers for the items fulfilled in these orders.
3. **Forward Shipping Cost:**
   - **Source:** Courier Logistics Ledger (`shipping_cost`).
   - **Definition:** Outbound courier freight charged to deliver the package to the customer's delivery pin code.
4. **RTO Reverse Logistics Charges:**
   - **Source:** Reverse Freight Billing (`rto_shipping_charge`).
   - **Definition:** Surcharge levied by 3PL couriers when a package fails delivery after repeated attempts and is shipped back to the seller or supplier warehouse.
5. **Ad Spend:**
   - **Source:** Expenses Module (`category: "Meta Ads"`).
   - **Definition:** Total marketing budget spent on Meta (Facebook/Instagram) Ads or Google Ads during the specified period.
6. **Operating Overheads:**
   - **Source:** Expenses Module (`category != "Meta Ads"`).
   - **Definition:** Fixed and recurring operating expenses such as packaging materials (custom mailers, bubble pouches), Shopify app subscriptions, domain/hosting, and customer support.

### 💡 Example Calculation
- **Gross Sales:** ₹47,025
- **COGS:** ₹19,725
- **Forward Shipping:** ₹3,070
- **RTO Reverse Freight:** ₹65
- **Meta Ad Spend:** ₹4,500
- **Overheads:** ₹5,249
- **Calculation:**
  $$\text{Net Profit} = 47,025 - 19,725 - 3,070 - 65 - 4,500 - 5,249 = \mathbf{₹14,416}$$
- **Net Margin:**
  $$\text{Net Margin} = \left(\frac{14,416}{47,025}\right) \times 100 = \mathbf{30.7\%}$$

---

## 2. Order-Wise Unit Economics

### 🎯 Purpose
Drills down into individual orders as standalone micro-transactions to reveal exactly how fulfillment outcomes (Delivered vs. RTO vs. Cancelled) affect order-level profit.

### 📐 Fulfillment Scenarios

#### Scenario A: Delivered Order (Successful Sale)
When an order is successfully handed to the customer and paid for:
$$\text{Net Profit} = \text{Selling Price} - \text{COGS} - \text{Forward Shipping} - \text{Attributed Ad Spend}$$

*Example:*
- Selling Price: ₹1,299
- Product COGS: ₹520
- Forward Shipping: ₹85
- Attributed Ad Spend: ₹190
- **Net Profit:** $1,299 - 520 - 85 - 190 = \mathbf{+₹504}$ (38.8% margin)

#### Scenario B: RTO Order (Doorstep Rejection / Non-Delivery)
When a customer rejects a Cash on Delivery (COD) parcel or is unreachable after multiple attempts:
- Customer pays ₹0 (Gross Revenue = ₹0).
- The physical item is returned to supplier inventory, and the wholesale cost is credited back to your **RTO Supplier Credit Balance** (so product COGS is recovered).
- However, your store pays both forward shipping and reverse freight, plus the marketing cost spent to acquire the click.

$$\text{Net Profit} = 0 - \text{Forward Shipping} - \text{Reverse RTO Freight} - \text{Attributed Ad Spend} \quad (\text{Direct Loss})$$

*Example:*
- Forward Shipping: ₹85
- Reverse RTO Freight: ₹65
- Attributed Ad Spend: ₹180
- **Net Profit:** $0 - 85 - 65 - 180 = \mathbf{-₹330}$ (Direct Loss)

#### Scenario C: Cancelled Order (Before Dispatch)
$$\text{Net Profit} = \mathbf{₹0}$$
No courier or supplier charges are incurred.

### 📐 Attributed Ad Spend (CPA Allocation)
$$\text{Attributed Ad Spend per Order} = \frac{\text{Total Ad Spend on Order Date}}{\text{Total Orders Placed on that Date}}$$
*If ₹4,500 was spent on ads on Oct 1st and 30 orders were placed, each order carries ₹150 in marketing attribution.*

---

## 3. Ad Spend & ROAS (Return On Ad Spend)

### 🎯 Purpose
Audits the direct financial efficiency of digital paid advertising campaigns to ensure your marketing spend delivers real profit rather than unprofitable volume.

### 📐 Key Formulas

$$\text{ROAS (Return On Ad Spend)} = \frac{\text{Gross Revenue}}{\text{Ad Spend}}$$

$$\text{CPA (Cost Per Acquisition)} = \frac{\text{Ad Spend}}{\text{Total Orders Count}}$$

$$\text{Realized Net Profit from Ads} = \text{Delivered Revenue} - \text{Delivered COGS} - \text{Shipping} - \text{Ad Spend}$$

### 🔍 Placed Gross Revenue vs. Delivered Revenue
- **Gross Sales:** The initial value of all orders generated by ads.
- **Delivered Revenue:** Cash collected from orders that passed doorstep verification and were delivered.
> **Admin Rule of Thumb:** In Indian D2C e-commerce, never scale ad campaigns based solely on initial ROAS. Always track **Delivered ROAS** to ensure COD orders are converting to bank remittances.

### 📊 Benchmark Targets
- **ROAS > 4.0x:** Highly scalable and profitable.
- **ROAS 2.5x - 4.0x:** Healthy baseline covering COGS and shipping.
- **ROAS < 2.0x:** Danger zone; ad creatives, landing pages, or pricing need revision.

---

## 4. Product Margins & Unit Economics

### 🎯 Purpose
Analyzes which products generate the largest share of store profit and identifies products with high return rates that erode margins.

### 📐 Formulas

$$\text{Product Net Profit} = \text{Gross Revenue} - \text{Supplier COGS} - \text{Logistics Allocations}$$

$$\text{RTO Doorstep Failure Rate \%} = \left(\frac{\text{Number of RTO / Returned Orders}}{\text{Total Orders for this SKU}}\right) \times 100$$

### 🚦 Actionable RTO Thresholds
- **🟢 Below 8%:** Optimal. Low returns, strong customer satisfaction.
- **🟡 8% - 12%:** Acceptable for COD-heavy segments; monitor customer address quality.
- **🔴 Above 12%:** High Risk. Excessive RTO fees will drain profits.
  - *Recommended Action:* Enable automated WhatsApp/call confirmation before dispatching COD orders for this SKU, or offer a ₹50-₹100 discount for Prepaid orders.

---

## 5. RTO Diagnostics & Courier Logistics

### 🎯 Purpose
Audits 3PL shipping carriers (Delhivery, Bluedart, Shadowfax, Xpressbees) to optimize delivery success rates and safeguard supplier credit recoveries.

### 📐 Formulas

$$\text{Delivery Success Rate \%} = \left(\frac{\text{Delivered Shipments}}{\text{Total Dispatched Shipments}}\right) \times 100$$

$$\text{Return Reason Share \%} = \left(\frac{\text{Count of Specific Reason}}{\text{Total RTO Incidents}}\right) \times 100$$

$$\text{RTO Credit Recovery Rate \%} = \left(\frac{\text{Approved Supplier RTO Credits}}{\text{Total Value of Returned Parcels}}\right) \times 100$$

### 🛡️ Why the RTO Ledger Protects Your Profit
When a customer refuses a parcel at doorstep delivery, Zupe Store automatically logs the package into the **RTO Refund Balance** ledger. 
- The supplier restocks the product upon receiving the reverse package.
- The wholesale amount is credited to your store's **Supplier RTO Balance**.
- You can apply this balance as an instant discount on your next wholesale purchase order.
- **Result:** You never absorb the cost of unsold returned inventory.

---

## 📋 Summary Table for Admin Quick-Reference

| Metric | Short Formula | Ideal Target |
|---|---|---|
| **Net Profit** | `Sales - COGS - Shipping - RTO - Ads - Overheads` | > 20% of Gross Sales |
| **Net Margin** | `(Net Profit ÷ Gross Sales) × 100` | 20% - 35% |
| **Blended ROAS** | `Gross Revenue ÷ Meta Ad Spend` | > 3.5x |
| **CPA** | `Ad Spend ÷ Total Orders` | < 15% of AOV |
| **Courier Success Rate** | `(Delivered ÷ Dispatched) × 100` | > 85% |
| **SKU RTO Rate** | `(RTO Orders ÷ Total Product Orders) × 100` | < 10% |
| **RTO Recovery** | `(Approved Credits ÷ Return Value) × 100` | > 95% |

---

*Document compiled for Zupe Store Live Production ERP & Business Intelligence.*
