"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, ExternalLink, ShieldCheck, Download, AlertCircle, RefreshCw } from "lucide-react";
import { ERPOrder } from "@/lib/erpStore";

function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const format999 = (n: number): string => {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str;
  };

  const integerPart = Math.floor(num);
  let result = "";

  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const remainder = integerPart % 1000;

  if (crore > 0) result += format999(crore) + "Crore ";
  if (lakh > 0) result += format999(lakh) + "Lakh ";
  if (thousand > 0) result += format999(thousand) + "Thousand ";
  if (remainder > 0) result += format999(remainder);

  return (result.trim() + " Rupees Only").replace(/\s+/g, " ");
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const query =
    searchParams.get("query") ||
    searchParams.get("orderId") ||
    searchParams.get("order_id") ||
    searchParams.get("oid") ||
    searchParams.get("id") ||
    searchParams.get("awb") ||
    "";

  const [order, setOrder] = useState<ERPOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setError("Please provide an Order ID or Tracking Number in the URL (e.g. ?query=1059).");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}&t=${Date.now()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrder(data.orders[0]);
        } else {
          setError(data.error || `No order found matching "${query}".`);
        }
      } catch (err: any) {
        setError("Unable to load invoice at this moment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [query]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <RefreshCw className="w-8 h-8 text-[#780016] animate-spin mb-3" />
        <p className="text-sm font-semibold">Generating Tax Invoice & Bill...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Invoice Not Found</h2>
          <p className="text-xs text-slate-600 mb-6">{error || "Could not retrieve order details."}</p>
          <div className="space-y-2">
            <Link
              href="/order-tracking"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#780016] text-white rounded-xl text-xs font-bold hover:bg-[#600012] transition"
            >
              <span>Go to Order Tracking</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
            >
              <span>Return to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDisplayId = order.shopify_order_id || order.id;
  const cleanOrderId = orderDisplayId.replace(/^#/, "");
  const invoiceNumber = `INV-TJ-${cleanOrderId}`;
  const rawDate = order.created_at ? new Date(order.created_at.replace(" ", "T")) : new Date();
  const invoiceDate = !isNaN(rawDate.getTime())
    ? rawDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const isCod =
    (order.payment_method || "").toLowerCase().includes("cod") ||
    (order.payment_method || "").toLowerCase().includes("cash on delivery");
  const isPaid =
    (order.payment_status || "").toLowerCase() === "paid" ||
    (order.payment_status || "").toLowerCase() === "completed";

  const totalAmount = Number(order.total_amount) || 0;
  const isPartialCod = Boolean(order.is_cod_partial || Number(order.advance_paid) > 0);
  const advancePaid = Number(order.advance_paid) || (isPartialCod ? 49 : 0);
  const balanceDue = order.balance_due !== undefined && order.balance_due !== null
    ? Number(order.balance_due)
    : (isCod ? Math.max(0, totalAmount - advancePaid) : 0);

  const safeItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ product_name: "Turkiye Jam Herbal Epimedium Paste (3 Sachet Pack)", quantity: 1, unit_price: totalAmount, total_price: totalAmount }];

  const itemsSubtotal = safeItems.reduce((acc, it: any) => {
    const qty = Number(it.quantity || it.units || 1);
    const price = Number(it.unit_price ?? it.price ?? it.selling_price) || Math.round(totalAmount / qty);
    return acc + (price * qty);
  }, 0);

  const shippingCharges = Math.max(0, totalAmount - itemsSubtotal);
  const rawAwb = (order.shiprocket_awb || (order as any).tracking_number || "").trim();
  const hasRealAwb = Boolean(
    rawAwb &&
    !rawAwb.startsWith("SR-AWB-") &&
    !rawAwb.startsWith("TEMP-") &&
    !rawAwb.toUpperCase().includes("PENDING")
  );
  const courier = order.courier_partner || "Express Courier Logistics";
  const awbDisplay = hasRealAwb ? rawAwb : `Pending Courier Handover (${orderDisplayId})`;

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-4 print:bg-white print:p-0 print:m-0 font-sans">
      {/* Top Action Ribbon - Hidden during print */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/order-tracking?query=${encodeURIComponent(cleanOrderId)}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-xl transition shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Live Tracking</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#780016] hover:bg-[#600012] px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Tax Invoice Document Container */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 print:shadow-none print:border-none print:p-6 print:max-w-full text-slate-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#780016]">
                TURKIYE JAM
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Original Turkish Formula
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-sm leading-relaxed">
              Premium 100% Herbal Epimedium Paste & Natural Dietary Vitality. Authentic Import.
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
              FSSAI Reg. Certified | Customer Care: +91 62381 65935
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Email: support@turkiyejam.com | Web: turkiyejam.com
            </p>
          </div>

          <div className="sm:text-right">
            <span className="inline-block bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-3 py-1 rounded">
              TAX INVOICE / CASH MEMO
            </span>
            <div className="mt-3 space-y-0.5 text-xs">
              <p className="text-slate-500">
                Invoice No: <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
              </p>
              <p className="text-slate-500">
                Invoice Date: <span className="font-semibold text-slate-900">{invoiceDate}</span>
              </p>
              <p className="text-slate-500">
                Order ID: <span className="font-mono font-bold text-slate-900">{orderDisplayId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Shipment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1.5">
              Billed To & Shipped To
            </h4>
            <p className="font-bold text-slate-900 text-sm">{order.customer_name || "Valued Customer"}</p>
            <p className="text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
              {order.shipping_address || "Shipping Address Provided at Checkout"}
            </p>
            {order.customer_phone && (
              <p className="text-slate-700 mt-1 font-mono">
                Phone: <span className="font-semibold">{order.customer_phone}</span>
              </p>
            )}
            {order.guest_email && !order.guest_email.includes("synthetic") && (
              <p className="text-slate-700 font-mono">Email: {order.guest_email}</p>
            )}
          </div>

          <div className="sm:border-l sm:border-slate-100 sm:pl-6">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1.5">
              Fulfillment & Payment
            </h4>
            <div className="space-y-1.5">
              <p className="text-slate-600">
                Payment Mode:{" "}
                <span className="font-semibold text-slate-900">
                  {isCod ? (advancePaid > 0 ? "Cash on Delivery (Advance Paid)" : "Cash on Delivery (COD)") : "Prepaid Online (UPI / Netbanking)"}
                </span>
              </p>
              <p className="text-slate-600">
                Payment Status:{" "}
                <span className={`font-semibold ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
                  {isPaid ? "Paid in Full" : isCod ? `Payable on Delivery (Rs ${balanceDue.toLocaleString("en-IN")})` : "Pending"}
                </span>
              </p>
              <p className="text-slate-600">
                Carrier Partner: <span className="font-semibold text-slate-900">{courier}</span>
              </p>
              <p className="text-slate-600">
                Consignment / AWB:{" "}
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                  {awbDisplay}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6 border-b border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 px-2">Item Description</th>
                <th className="py-2 px-2 text-center">HSN</th>
                <th className="py-2 px-2 text-center">Qty</th>
                <th className="py-2 px-2 text-right">Unit Price</th>
                <th className="py-2 pl-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeItems.map((it: any, idx: number) => {
                const name = it.product_name || it.name || "Turkiye Jam Herbal Epimedium Paste";
                const qty = Number(it.quantity || it.units || 1);
                const unitPrice =
                  Number(it.unit_price ?? it.price ?? it.selling_price) || Math.round(totalAmount / qty);
                const lineTotal = Number(it.total_price) || unitPrice * qty;

                return (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-3 pr-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">{name}</p>
                      <p className="text-[10px] text-slate-500">
                        100% Herbal Vitality Blend • Discreet Plain Box Packaging
                      </p>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-500">2106 90 99</td>
                    <td className="py-3 px-2 text-center font-bold">{qty}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{unitPrice.toLocaleString("en-IN")}</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-slate-900">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Amount in Words */}
        <div className="py-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">
              Invoice Amount in Words
            </h4>
            <p className="font-serif italic font-bold text-slate-800 text-sm leading-relaxed">
              {numberToIndianWords(totalAmount)}
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">Tax Notice & Disclaimer:</span>
              Prices listed are inclusive of all applicable GST taxes under Composition / E-commerce provisions.
              Keep this invoice for warranty and order verification.
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold text-slate-900">
                ₹{itemsSubtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping & Logistics (Discreet)</span>
              <span className="font-semibold text-emerald-700">
                {shippingCharges === 0 ? "FREE" : `₹${shippingCharges.toLocaleString("en-IN")}`}
              </span>
            </div>

            {isCod && advancePaid > 0 && (
              <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                <span>Online Advance Paid (via Cashfree)</span>
                <span className="font-mono font-bold">-₹{advancePaid.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Grand Total</span>
              <span className="text-lg font-mono font-black text-slate-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {isCod && !isPaid && (
              <div className="pt-1.5 flex justify-between items-baseline text-[#780016]">
                <span className="text-xs font-bold">Balance Payable on Delivery</span>
                <span className="text-base font-mono font-black">
                  ₹{balanceDue.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer & Signature Stamp */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div className="text-center sm:text-left leading-relaxed">
            <p className="font-semibold text-slate-700">Thank you for your trust in Turkiye Jam!</p>
            <p>For support, dosage guidelines, or returns, WhatsApp: +91 62381 65935</p>
            <p className="text-[10px] text-slate-400 mt-1">
              * This is a computer-generated tax invoice. No physical signature is required.
            </p>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 min-w-[160px]">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              For Turkiye Jam Retail
            </p>
            <div className="my-2 py-1 px-3 border border-dashed border-amber-600/50 bg-amber-50/50 rounded inline-block text-[10px] font-mono text-[#780016] font-bold">
              ✓ DIGITALLY VERIFIED
            </div>
            <p className="text-[10px] text-slate-400">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#780016] animate-spin" />
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}

