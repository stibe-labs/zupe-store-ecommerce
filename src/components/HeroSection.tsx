"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden mesh-gradient">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#6C5CE7]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B6B]/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00D2D3]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6C5CE7]/8 rounded-full border border-[#6C5CE7]/15 mb-6">
                <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
                <span className="text-xs font-mono font-semibold text-[#6C5CE7] tracking-wide uppercase">
                  New Collection 2026
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.05] text-[#2D3436]"
            >
              Curated for{" "}
              <span className="gradient-text">Modern</span>
              <br />
              Living
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#636E72] max-w-lg leading-relaxed"
            >
              Discover thoughtfully designed decor, accessories, and everyday 
              essentials that transform your space into something extraordinary.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#6C5CE7] text-white font-semibold rounded-2xl hover:bg-[#4834D4] hover:shadow-xl hover:shadow-[#6C5CE7]/25 transition-all duration-300 btn-press"
              >
                Shop Collection
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/products?category=Decor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2D3436] font-semibold rounded-2xl border border-gray-200 hover:border-[#6C5CE7]/30 hover:shadow-lg transition-all duration-300"
              >
                Explore Decor
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              {[
                { icon: Truck, label: "Free Shipping 1499+" },
                { icon: ShieldCheck, label: "Secure Payments" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-xs text-[#636E72]">
                  <badge.icon className="w-4 h-4 text-[#6C5CE7]" />
                  <span className="font-medium">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Top Left - Large */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
                className="col-span-1 row-span-2 rounded-3xl overflow-hidden shadow-2xl shadow-[#6C5CE7]/10 relative group"
              >
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop"
                  alt="Modern decor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-sm font-semibold">Home Decor</span>
                </div>
              </motion.div>

              {/* Top Right */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl overflow-hidden shadow-xl shadow-[#FF6B6B]/10 aspect-square relative group"
              >
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop"
                  alt="Lifestyle products"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-sm font-semibold">Lifestyle</span>
                </div>
              </motion.div>

              {/* Bottom Right */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl overflow-hidden shadow-xl shadow-[#00D2D3]/10 aspect-square relative group"
              >
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop"
                  alt="Modern accessories"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-sm font-semibold">Accessories</span>
                </div>
              </motion.div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2D3436]">12,000+</p>
                  <p className="text-xs text-[#636E72]">Happy Customers</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
