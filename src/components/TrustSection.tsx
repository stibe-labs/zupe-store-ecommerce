"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, Sparkles, HeadphonesIcon, PackageCheck } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On orders above ₹1,499",
    accent: "#FF7A00",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "100% encrypted checkout",
    accent: "#00D2D3",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "7-day hassle-free returns",
    accent: "#FF6B6B",
  },
  {
    icon: PackageCheck,
    title: "Quality Assured",
    desc: "Handpicked premium products",
    accent: "#FFEAA7",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    desc: "We're always here to help",
    accent: "#FF7A45",
  },
  {
    icon: Sparkles,
    title: "Exclusive Drops",
    desc: "Limited edition collections",
    accent: "#FF6B6B",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-24 mesh-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#2D3436] mb-3">
            Why Choose Zupe?
          </h2>
          <p className="text-base text-[#636E72]">The Zupe promise, delivered with every order</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {TRUST_ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="glass-card rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 group"
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${item.accent}15` }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.accent }} />
              </div>
              <h3 className="font-display font-semibold text-base text-[#2D3436] mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-[#636E72]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
