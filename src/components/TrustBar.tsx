"use client";

import React from "react";
import { Truck, ShieldCheck, Package, Headphones } from "lucide-react";

export function TrustBar() {
  const trustItems = [
    {
      icon: <Truck className="w-6 h-6 text-gray-900" />,
      title: "Free Shipping",
      desc: "On all orders",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-gray-900" />,
      title: "Cash on Delivery",
      desc: "Available across India",
    },
    {
      icon: <Package className="w-6 h-6 text-gray-900" />,
      title: "Easy Returns",
      desc: "7 days hassle free",
    },
    {
      icon: <Headphones className="w-6 h-6 text-gray-900" />,
      title: "Customer Support",
      desc: "+91 98765 43210",
    },
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {trustItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3.5 ${
                idx > 0 ? "pt-3 sm:pt-0 sm:pl-6" : ""
              }`}
            >
              <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 text-gray-900 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
