"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { OrderRecord } from "@/lib/orderStore";

export default function OrdersPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
        const res = await fetch(`/api/orders${query}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: OrderRecord["order_status"]) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case "processing":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#FA521C]">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900">
              My Orders
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track packages, check shipping updates, and review past purchases
            </p>
          </div>

          {!isAuthenticated && (
            <Link
              href="/signin?redirect=/orders&notice=Please sign in to view and track your orders"
              className="text-xs font-semibold text-[#FA521C] hover:underline"
            >
              Sign In for full account sync
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="max-w-md mx-auto py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-display text-gray-900 mb-2">
              No orders placed yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              When you place an order, its details and shipment tracking will appear here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FA521C] text-white text-xs font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Order Reference</span>
                    <span className="font-mono text-sm font-bold text-gray-900">{ord.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date Placed</span>
                    <span className="text-xs text-gray-700">
                      {new Date(ord.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Amount</span>
                    <span className="text-sm font-bold text-[#FA521C]">
                      ₹{ord.total_amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(ord.order_status)}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {it.image && (
                        <div className="relative w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          <Image src={it.image} alt={it.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {it.quantity} × ₹{it.price.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        ₹{(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping address footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-2">
                  <span>Ship to: {ord.shipping_address}, {ord.city}</span>
                  <span>Payment: {ord.payment_method}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
