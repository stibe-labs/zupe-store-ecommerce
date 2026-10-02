"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "shipping">("details");
  const [addedNotice, setAddedNotice] = useState(false);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    // Look up in default products or API
    const found = DEFAULT_PRODUCTS.find(
      (p) => p.slug === idOrSlug || p.id === idOrSlug
    );
    if (found) {
      setProduct(found);
      setSelectedImage(found.poster_image);
    } else {
      // Fallback try API
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            const apiFound = data.products.find(
              (p: Product) => p.slug === idOrSlug || p.id === idOrSlug
            );
            if (apiFound) {
              setProduct(apiFound);
              setSelectedImage(apiFound.poster_image);
            }
          }
        })
        .catch(console.warn);
    }
  }, [idOrSlug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-[#6C5CE7]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The product you are looking for may have been moved or is currently unavailable.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#6C5CE7] text-white font-semibold text-sm shadow-md shadow-[#6C5CE7]/25"
          >
            Browse All Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discount =
    product.mrp && product.price < product.mrp
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  // Gallery images array
  const gallery = [
    product.poster_image,
    ...(product.images && product.images.length > 0 ? product.images : []),
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
    openCart();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  // Related products from same or other categories
  const relatedProducts = DEFAULT_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || Math.random() > 0.5)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436]">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="pt-24 pb-4 border-b border-gray-100 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-[#636E72]">
            <Link href="/" className="hover:text-[#6C5CE7] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/products" className="hover:text-[#6C5CE7] transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#6C5CE7] transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#2D3436] font-semibold truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#ECEFF1] overflow-hidden shadow-sm border border-gray-100">
              <Image
                src={selectedImage || product.poster_image}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#6C5CE7] text-white shadow-md">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#FF6B6B] text-white shadow-md">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
                  wishlisted
                    ? "bg-[#FF6B6B] text-white"
                    : "bg-white/80 text-gray-700 hover:bg-white hover:text-[#FF6B6B]"
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === img
                        ? "border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-start">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6C5CE7]/10 text-[#6C5CE7]">
                {product.category}
              </span>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#2D3436] leading-tight">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-sm text-[#6C5CE7] font-semibold">{product.subtitle}</p>
              )}

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">{product.rating || 4.9}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-[#636E72] font-medium underline cursor-pointer">
                  {product.review_count || 128} verified reviews
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                  <Check className="w-3.5 h-3.5" /> In Stock ({product.stock_count} units left)
                </span>
              </div>

              {/* Price Block */}
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#636E72] block">Special Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-display font-bold text-[#2D3436]">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-base text-gray-400 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {discount > 0 && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                    You save ₹{(product.mrp - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Tagline / Hook */}
              {product.tagline && (
                <p className="text-sm font-medium text-[#2D3436] italic border-l-2 border-[#6C5CE7] pl-3 py-0.5">
                  "{product.tagline}"
                </p>
              )}

              {/* Attributes (Color / Material / Size) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {product.color && (
                  <div className="p-3 rounded-2xl bg-white border border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Color</span>
                    <span className="text-xs font-semibold text-gray-800">{product.color}</span>
                  </div>
                )}
                {product.material && (
                  <div className="p-3 rounded-2xl bg-white border border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Material</span>
                    <span className="text-xs font-semibold text-gray-800">{product.material}</span>
                  </div>
                )}
                {product.volume && (
                  <div className="p-3 rounded-2xl bg-white border border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Dimensions</span>
                    <span className="text-xs font-semibold text-gray-800">{product.volume}</span>
                  </div>
                )}
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-700">Quantity:</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-[#2D3436]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#6C5CE7] hover:bg-[#5848d2] text-white font-semibold text-sm shadow-lg shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addedNotice ? "Added to Cart!" : "Add to Cart"}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#2D3436] hover:bg-black text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-white border border-gray-100/60">
                  <Truck className="w-5 h-5 mx-auto text-[#6C5CE7] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800 block">Fast Dispatch</span>
                  <span className="text-[10px] text-gray-500">Within 24 hours</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-gray-100/60">
                  <RotateCcw className="w-5 h-5 mx-auto text-[#6C5CE7] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800 block">Easy Returns</span>
                  <span className="text-[10px] text-gray-500">14-day window</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-gray-100/60">
                  <ShieldCheck className="w-5 h-5 mx-auto text-[#6C5CE7] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800 block">Authentic</span>
                  <span className="text-[10px] text-gray-500">100% Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section: Description, Specifications, Shipping */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <div className="flex border-b border-gray-200 gap-8 mb-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 text-sm sm:text-base font-bold transition-all relative ${
                activeTab === "details"
                  ? "text-[#6C5CE7]"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Description & Design
              {activeTab === "details" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 text-sm sm:text-base font-bold transition-all relative ${
                activeTab === "specs"
                  ? "text-[#6C5CE7]"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Product Details
              {activeTab === "specs" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 text-sm sm:text-base font-bold transition-all relative ${
                activeTab === "shipping"
                  ? "text-[#6C5CE7]"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Shipping & Care
              {activeTab === "shipping" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7] rounded-full" />
              )}
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm leading-relaxed text-sm text-[#636E72]">
            {activeTab === "details" && (
              <div className="space-y-4">
                <p className="text-base text-[#2D3436] font-medium leading-relaxed">
                  {product.description}
                </p>
                <p>
                  Every piece in the Zupe collection is developed with an obsessive focus on tactile quality, architectural harmony, and timeless geometry. Whether placed as a striking centerpiece or integrated into your daily workspace routine, it brings calm, order, and refined elegance to your environment.
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">SKU / Code:</span>
                  <span>{product.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">Primary Material:</span>
                  <span>{product.material || "Premium Handcrafted Compound"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">Finish / Color:</span>
                  <span>{product.color || "Matte Studio"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">Volume / Sizing:</span>
                  <span>{product.volume || "Standard Studio Fit"}</span>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-3">
                <p>
                  <strong className="text-gray-800">Dispatch & Delivery:</strong> Orders placed before 2:00 PM IST are processed same-day. Standard domestic shipping arrives in 3–5 business days. Free shipping applies to orders over ₹1,499.
                </p>
                <p>
                  <strong className="text-gray-800">14-Day Returns:</strong> If you are not completely satisfied with your purchase, return it in original packaging within 14 calendar days for a prompt refund or exchange.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wider block mb-1">
                  You May Also Like
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2D3436]">
                  Complete The Collection
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#6C5CE7] hover:underline flex items-center gap-1"
              >
                View Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.slug || rel.id}`}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={rel.poster_image}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#6C5CE7] uppercase">
                      {rel.category}
                    </span>
                    <h3 className="font-display font-bold text-sm text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors line-clamp-1 mt-0.5">
                      {rel.name}
                    </h3>
                    <p className="font-bold text-sm text-[#2D3436] mt-2">
                      ₹{rel.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
