"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "Decor",
    description: "Elevate every corner",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop",
    href: "/products?category=Decor",
    accent: "#6C5CE7",
    span: "col-span-2 row-span-2",
  },
  {
    title: "Accessories",
    description: "Functional beauty",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop",
    href: "/products?category=Accessories",
    accent: "#FF6B6B",
    span: "col-span-1",
  },
  {
    title: "Essentials",
    description: "Smart everyday picks",
    image: "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?q=80&w=600&auto=format&fit=crop",
    href: "/products?category=Essentials",
    accent: "#00D2D3",
    span: "col-span-1",
  },
  {
    title: "Modern Living",
    description: "Design-forward home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
    href: "/products?category=Modern+Living",
    accent: "#FFEAA7",
    span: "col-span-1",
  },
  {
    title: "Lifestyle",
    description: "Curated for you",
    image: "https://images.unsplash.com/photo-1602607616907-e8faad94e2e1?q=80&w=600&auto=format&fit=crop",
    href: "/products?category=Lifestyle",
    accent: "#A29BFE",
    span: "col-span-1",
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#2D3436] mb-4">
            Shop by Category
          </h2>
          <p className="text-base text-[#636E72] max-w-xl mx-auto">
            Browse our carefully organized collections
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[200px] lg:auto-rows-[220px]">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`${cat.span} relative rounded-3xl overflow-hidden group cursor-pointer`}
            >
              <Link href={cat.href} className="block w-full h-full">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500" />
                
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <h3 className="text-white font-display font-bold text-xl lg:text-2xl mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-white/70 text-sm">{cat.description}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 group-hover:border-white/60 group-hover:bg-white/20 transition-all duration-300"
                  >
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
