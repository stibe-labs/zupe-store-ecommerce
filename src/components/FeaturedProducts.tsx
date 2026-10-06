"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, ArrowRight, Sparkles } from "lucide-react";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export function FeaturedProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const featured = DEFAULT_PRODUCTS.slice(0, 4);

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FA521C]/8 rounded-full border border-[#FA521C]/15 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FA521C]" />
            <span className="text-xs font-mono font-semibold text-[#FA521C] tracking-wide uppercase">
              Curated Picks
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#2D3436] mb-4">
            Featured Products
          </h2>
          <p className="text-base text-[#636E72] max-w-xl mx-auto">
            Handpicked essentials that blend form and function beautifully
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#FA521C]/8 transition-all duration-500 border border-gray-100"
            >
              {/* Badge */}
              {product.badge && (
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${
                  product.badge === "New" ? "bg-[#FA521C] text-white" :
                  product.badge === "Sale" ? "bg-[#FF6B6B] text-white" :
                  product.badge === "Trending" ? "bg-[#00D2D3] text-white" :
                  product.badge === "Limited" ? "bg-[#2D3436] text-white" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {product.badge}
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={() => {
                  if (!user) {
                    router.push(
                      `/signin?redirect=/&notice=${encodeURIComponent(
                        "Please sign in to save items to your wishlist"
                      )}`
                    );
                    return;
                  }
                  toggleWishlist(product);
                }}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isInWishlist(product.id)
                      ? "fill-[#FF6B6B] text-[#FF6B6B]"
                      : "text-[#636E72]"
                  }`}
                />
              </button>

              {/* Image */}
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <Image
                    src={product.poster_image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="p-5">
                <p className="text-xs font-mono text-[#FA521C] uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-display font-semibold text-[#2D3436] text-base mb-1 hover:text-[#FA521C] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-[#B2BEC3] mb-3 line-clamp-1">{product.tagline}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-[#FFEAA7] text-[#FFEAA7]" />
                  <span className="text-xs font-semibold text-[#2D3436]">{product.rating}</span>
                  <span className="text-xs text-[#B2BEC3]">({product.review_count})</span>
                </div>

                {/* Price & Cart */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#2D3436]">
                      ₹{product.offer_price.toLocaleString()}
                    </span>
                    {product.mrp > product.offer_price && (
                      <span className="text-xs text-[#B2BEC3] line-through ml-2">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push(
                          `/signin?redirect=/&notice=${encodeURIComponent(
                            "Please sign in to add items to your cart"
                          )}`
                        );
                        return;
                      }
                      const success = addToCart(product);
                      if (success) openCart();
                    }}
                    className="w-10 h-10 rounded-xl bg-[#FA521C] hover:bg-[#E0400B] flex items-center justify-center transition-colors btn-press shadow-md shadow-[#FA521C]/20"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#FA521C] text-[#FA521C] font-semibold rounded-2xl hover:bg-[#FA521C] hover:text-white transition-all duration-300"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
