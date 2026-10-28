# Zupe Store — Business Intelligence & Financial Calculation Guide
**Audience:** Zupe Store Administrator / Store Owners & Management  
**System Module:** `/admin/reports` (Business Intelligence & Executive Analytics)  
**Version:** 3.0 (Owner Business Model & Live Live ERP Sync)

---

## 📌 Executive Overview & Core Business Model

The **Business Intelligence & Reports** dashboard in the Zupe Store Admin Panel is engineered to provide complete financial transparency for Indian D2C dropshipping operations. The system maintains strict separation between **three distinct financial pillars**:

1. **Profit Calculation (Accrual P&L):** How much real operational bottom-line profit your business generated from fulfilled sales.
2. **Cash Flow Calculation (Bank Movement):** How much physical cash entered vs. left your bank account.
3. **Supplier Credit Logic (Inventory Asset):** The value of wholesale credits owed by suppliers for returned (RTO) products to offset against future wholesale inventory orders.

---

## 📅 Date Range Filtering System

The reports dashboard includes an instant, dynamic date range filter toolbar located immediately below the main header:

| Filter Option | Range Calculated | Primary Use Case |
|---|---|---|
| **Today** | Current calendar day (`YYYY-MM-DD` 00:00 to 23:59) | Monitor intraday order velocity, daily ad spend, and live profitability. |
| **This Week** | Rolling 7-day window (Today minus 6 days through Today) | Detect weekly volume trends and optimize weekend advertising budgets. |
| **Monthly** | First day of current month through the last day of the month | Standard accounting period reconciliation for monthly P&L reporting. |
| **Custom Range** | User-selected **From Date** and **To Date** pickers | Quarterly reviews, festival season audits (e.g. Diwali sale), or specific marketing campaign runs. |

> **Dynamic Recalculation:** Changing the date filter immediately recalculates the top Executive KPI Cards and filters data across **all 6 report sections simultaneously**.

---

## 1. Monthly Profit & Loss Statement (P&L)

### 🎯 Purpose
Calculates true bottom-line profitability. In accordance with the store owner's business rules:
- **Revenue and COGS are counted ONLY for delivered orders.**
- RTO (Returned) orders earned ₹0 revenue, and their wholesale cost is credited back 100% by the supplier—so the product cost is not an operational loss.
- Forward shipping is charged on **ALL dispatched shipments** (couriers charge freight regardless of delivery outcome).
- Reverse freight is charged as an additional **RTO surcharge**.

### 📐 Calculation Formulas

$$\text{Net Profit} = \text{Delivered Sales Revenue} - \text{Delivered Product Cost} - \text{ALL Forward Shipping} - \text{RTO Reverse Charges} - \text{Ad Spend} - \text{Overheads}$$

$$\text{Net Margin \%} = \left(\frac{\text{Net Profit}}{\text{Delivered Sales Revenue}}\right) \times 100$$

### 🔍 Field Breakdown
1. **Delivered Sales Revenue:**
   - **Source:** Orders Database (`total_amount`).
   - **Rule:** Sum of selling prices for **successfully delivered orders only**. RTO, cancelled, and pending orders are excluded from revenue.
2. **Delivered Product Cost (COGS):**
   - **Source:** Product Wholesale Cost (`product_cost`).
   - **Rule:** Wholesale sourcing cost for **delivered orders only**. RTO items are credited back by the supplier and added to your Supplier Credit Balance.
3. **Forward Shipping Cost:**
   - **Source:** Courier Logistics Ledger (`shipping_cost`).
   - **Rule:** Outbound courier freight paid on **ALL dispatched orders** (courier delivers attempt for all packages).
4. **RTO Reverse Logistics Charges:**
   - **Source:** Reverse Freight Billing (`rto_shipping_charge`).
   - **Rule:** Reverse freight surcharge levied when an undelivered parcel is returned to warehouse.
5. **Ad Spend:**
   - **Source:** Expenses Module (`category: "Meta Ads"`).
   - **Rule:** Total digital ad spend on Meta Advantage+ campaigns during the period.
6. **Operating Overheads:**
   - **Source:** Expenses Module (`category != "Meta Ads"`).
   - **Rule:** Packaging boxes, Shopify subscriptions, domain/hosting, and administrative operational expenses.

### 💡 Owner's Benchmark Walkthrough (10-Order Model)
- **Total Orders Dispatched:** 10
- **Delivered Orders:** 7 (70%)
- **RTO Orders:** 3 (30%)
- **Selling Price:** ₹800 per unit
- **Wholesale Cost:** ₹500 per unit
- **Forward Shipping:** ₹130 per dispatched order
- **RTO Charge:** ₹50 per returned order

$$\text{Delivered Revenue} = 7 \times ₹800 = \mathbf{₹5,600}$$
$$\text{Delivered Product Cost} = 7 \times ₹500 = \mathbf{₹3,500}$$
$$\text{Forward Shipping Paid} = 10 \times ₹130 = \mathbf{₹1,300}$$
$$\text{RTO Charges Paid} = 3 \times ₹50 = \mathbf{₹150}$$
$$\text{Net Profit (before Ads/Overheads)} = ₹5,600 - ₹3,500 - ₹1,300 - ₹150 = \mathbf{+₹650}$$

> **⚠️ Critical Anti-Double-Counting Rule:**  
> The system must **never** deduct the full product invoice (10 orders × ₹500 = ₹5,000) from P&L profit and then also deduct delivered product cost. That would double-count product expenses and drastically understate true profit.

---

## 2. Cash Flow & Supplier Credit Logic

### 🎯 Purpose
Tracks actual cash movement in and out of the business bank account and audits wholesale supplier credit balances.

### 📐 Cash Flow Formulas

$$\text{Actual Cash Inflow} = \text{Prepaid Settled Cash} + \text{Delivered COD Remitted}$$

$$\text{Actual Cash Outflow} = \text{Total Product Invoices Paid} + \text{Forward Shipping} + \text{RTO Charges} + \text{Ad Spend} + \text{Overheads}$$

$$\text{Net Cash Flow} = \text{Actual Cash Inflow} - \text{Actual Cash Outflow}$$

$$\text{Ending Supplier Credit Balance} = \text{Opening Balance} + \text{New Eligible RTO Credit} - \text{Credit Used Against POs}$$

### 🔍 Cash Flow vs. Profit: The Timing Difference
In dropshipping, **Net Cash Flow is often lower or negative compared to Net Profit**:

In the owner's 10-order example:
- **Cash Inflow:** ₹5,600 (collected from 7 delivered customers)
- **Cash Outflow:** ₹5,000 (paid supplier upfront for all 10 products) + ₹1,300 (shipping) + ₹150 (RTO fee) = **₹6,450**
- **Net Cash Flow:** $₹5,600 - ₹6,450 = \mathbf{-₹850}$
- **Net Profit:** $\mathbf{+₹650}$

> **Why the variance?**  
> You are profitable (+₹650), but temporarily cash-negative (−₹850) because ₹1,500 was paid to the supplier for the 3 returned packages. That ₹1,500 is not lost—it is held as **Available Supplier Credit** to deduct from your next wholesale inventory purchase!

### 🛡️ Supplier Credit Rules
1. **Wholesale Purchasing Asset:** Suppliers do not wire cash refunds back to your bank account for RTO items. Instead, they record a 100% credit memo on your account.
2. **Auto-Logging:** When an order transitions to `RTO Delivered` in the ERP, the system automatically logs a Credit transaction in the RTO Credit Ledger and increases the supplier's `available_rto_balance`.
3. **Credit Application:** When placing a new inventory purchase order, you can apply your available credit balance, reducing the cash required from your bank.

---

## 3. Order-Wise Unit Economics

### 🎯 Purpose
Drills down into individual orders as standalone micro-transactions to reveal exactly how fulfillment outcomes (Delivered vs. RTO vs. Cancelled) affect order-level profit.

### 📐 Fulfillment Scenarios

#### Scenario A: Delivered Order (Successful Sale)
When an order is successfully handed to the customer and paid for:
$$\text{Net Profit} = \text{Selling Price} - \text{Product Cost} - \text{Forward Shipping} - \text{Attributed Ad Spend}$$

*Example:*
- Selling Price: ₹800
- Product COGS: ₹500
- Forward Shipping: ₹130
- Attributed Ad Spend: ₹50
- **Net Profit:** $800 - 500 - 130 - 50 = \mathbf{+₹120}$

#### Scenario B: RTO Order (Doorstep Rejection / Non-Delivery)
When a customer rejects a Cash on Delivery (COD) parcel or is unreachable:
- Customer pays ₹0 (Delivered Revenue = ₹0).
- Product wholesale cost is credited back 100% by the supplier (product cost is recovered).
- Store pays forward shipping, reverse RTO surcharge, and attributed ad spend.

$$\text{Net Profit} = 0 - \text{Forward Shipping} - \text{Reverse RTO Freight} - \text{Attributed Ad Spend} \quad (\text{Direct Loss})$$

*Example:*
- Forward Shipping: ₹130
- Reverse RTO Freight: ₹50
- Attributed Ad Spend: ₹50
- **Net Profit:** $0 - 130 - 50 - 50 = \mathbf{-₹230}$ (Direct Out-of-Pocket Loss)

#### Scenario C: Cancelled Order (Before Dispatch)
$$\text{Net Profit} = \mathbf{₹0}$$
No courier or supplier charges are incurred.

### 📐 Attributed Ad Spend (CPA Allocation)
$$\text{Attributed Ad Spend per Order} = \frac{\text{Total Ad Spend on Order Date}}{\text{Total Orders Placed on that Date}}$$

---

## 4. Ad Spend & ROAS (Return On Ad Spend)

### 🎯 Purpose
Audits the direct financial efficiency of digital advertising campaigns to ensure your marketing budget delivers realized bottom-line profit rather than unprofitable gross volume.

### 📐 Key Formulas

$$\text{Placed ROAS} = \frac{\text{Total Placed Sales Value}}{\text{Meta Ad Spend}}$$

$$\text{Delivered ROAS} = \frac{\text{Delivered Sales Revenue}}{\text{Meta Ad Spend}}$$

$$\text{CPA (Cost Per Acquisition)} = \frac{\text{Meta Ad Spend}}{\text{Total Orders Count}}$$

$$\text{Realized Net Profit from Ads} = \text{Delivered Revenue} - \text{Delivered COGS} - \text{Shipping} - \text{Ad Spend}$$

### 🔍 Placed Gross Revenue vs. Delivered Revenue
- **Placed Gross Sales:** The initial value of all orders generated by ads before courier delivery attempts.
- **Delivered Revenue:** Cash collected from orders that passed doorstep verification and were delivered.
> **Admin Rule of Thumb:** In Indian D2C e-commerce, never scale ad campaigns based solely on Placed ROAS. Always track **Delivered ROAS** to ensure COD orders are converting to bank remittances.

---

## 5. Product Margins & Unit Economics

### 🎯 Purpose
Analyzes which products generate the largest share of store profit using actual supplier sourcing costs and proportional shipping allocations.

### 📐 Formulas

$$\text{Product Net Profit} = \text{Delivered Revenue} - \text{Delivered Supplier Cost} - \text{Forward Shipping Allocation} - \text{RTO Surcharges}$$

$$\text{SKU Doorstep RTO Rate \%} = \left(\frac{\text{RTO Orders for this SKU}}{\text{Total Orders for this SKU}}\right) \times 100$$

### 🚦 Actionable RTO Thresholds
- **🟢 Below 10%:** Optimal. Low returns, strong product satisfaction.
- **🟡 10% - 20%:** Acceptable for Indian COD-heavy segments; monitor address quality.
- **🔴 Above 20%:** High Risk. Reverse logistics fees will erode product profit margins.
  - *Recommended Action:* Enable automated WhatsApp/call confirmation before dispatching COD orders for this SKU, or offer a ₹50-₹100 discount for Prepaid orders.

---

## 6. RTO Diagnostics & Courier Logistics

### 🎯 Purpose
Audits 3PL shipping carriers (Delhivery, Bluedart, Shadowfax, Xpressbees) to optimize delivery success rates and safeguard supplier credit recoveries.

### 📐 Formulas

$$\text{Delivery Success Rate \%} = \left(\frac{\text{Delivered Shipments}}{\text{Total Dispatched Shipments}}\right) \times 100$$

$$\text{Return Reason Share \%} = \left(\frac{\text{Count of Specific Reason}}{\text{Total RTO Incidents}}\right) \times 100$$

$$\text{RTO Credit Recovery Rate \%} = \left(\frac{\text{Approved Supplier RTO Credits}}{\text{Total Wholesale Value of Returned Parcels}}\right) \times 100$$

---

## 📋 Master Comparison Table: Owner 10-Order Model

| Metric | Owner 10-Order Example | Formula / Source | Note |
|---|---|---|---|
| **Total Dispatched Orders** | 10 | All non-cancelled orders | All shipped via courier |
| **Delivered Orders** | 7 (70%) | Successful doorstep deliveries | Realized sales |
| **RTO Orders** | 3 (30%) | Customer refusals / NDR | Returned to supplier |
| **Delivered Sales Revenue** | **₹5,600** | 7 × ₹800 selling price | Counts DELIVERED only |
| **Supplier Product Invoices** | ₹5,000 | 10 × ₹500 wholesale cost | Paid upfront to supplier |
| **Delivered Product Cost (COGS)** | ₹3,500 | 7 × ₹500 delivered COGS | Deducted from P&L profit |
| **Forward Shipping Cost** | ₹1,300 | 10 × ₹130 courier freight | Paid on ALL 10 orders |
| **RTO Reverse Charges** | ₹150 | 3 × ₹50 reverse fee | Courier return surcharges |
| **Cumulative Net Profit** | **₹650** | ₹5,600 − ₹3,500 − ₹1,300 − ₹150 | Operating bottom line |
| **Actual Cash Inflow** | **₹5,600** | Prepaid settled + COD remitted | Real money received |
| **Actual Cash Outflow** | **₹6,450** | ₹5,000 product + ₹1,300 shipping + ₹150 RTO | Real money disbursed |
| **Net Cash Flow** | **−₹850** | Cash Inflow − Cash Outflow | Negative due to upfront stock |
| **Supplier Credit Earned** | **₹1,500** | 3 × ₹500 wholesale cost | 100% credited for future POs |
| **Ending Supplier Credit Balance** | **₹1,500** | Available discount on next purchase | Preserves working capital |

---

*Document compiled for Zupe Store Live Production ERP & Business Intelligence.*
