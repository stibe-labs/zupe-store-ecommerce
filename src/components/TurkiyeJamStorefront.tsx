"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  AlertTriangle,
  RotateCcw,
  Star,
  ChevronDown,
  ShoppingBag,
  CreditCard,
  Heart,
  ChevronRight,
  Flame,
  Gift,
  Check,
  Copy,
  Info,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { TURKIYE_JAM_VARIANTS, TurkiyeJamVariant, DEFAULT_PRODUCTS } from "@/data/zupeProducts";

const PRODUCT_IMAGES = [
  {
    src: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    title: "240g Glass Jar + Box + Strips",
    label: "Full Setup",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
    title: "Packet Box with Strips",
    label: "14 Strips Box",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    title: "Original Sachet Strips",
    label: "Sachet Strips",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
    title: "Handheld Sachet Strips & Packaging",
    label: "Pocket Sachets",
  },
];

const FAQS = [
  {
    q: "എന്താണ് തുർക്കി ജാം (Themra Epimedium Macun)?",
    a: "തുർക്കിയിൽ നൂറ്റാണ്ടുകളായി പരമ്പരാഗതമായി ഉപയോഗിച്ചു വരുന്ന പ്രകൃതിദത്ത സസ്യച്ചേരുവകൾ (Epimedium, Royal Jelly, Ginseng, ശുദ്ധമായ പൂന്തേൻ മുതലായവ) അടങ്ങിയ ലോകപ്രശസ്തമായ ഹെർബൽ പേസ്റ്റാണ് തുർക്കി ജാം (Themra Epimedyumlu Bitkisel Karışımlı Macun).",
  },
  {
    q: "ഇത് സ്ത്രീകളിലും പുരുഷന്മാരിലും എങ്ങനെയാണ് പ്രവർത്തിക്കുന്നത്?",
    a: "പുരുഷന്മാരിൽ ഇത് രക്തയോട്ടം ത്വരിതപ്പെടുത്തി ദീർഘനേരത്തെ സ്റ്റാമിനയും സമയക്കൂടുതലും നൽകുന്നു. കുറഞ്ഞ സമയത്തിൽ വീണ്ടും ചെയ്യാനുള്ള കരുത്തും നൽകുന്നു. സ്ത്രീകളിൽ സ്വാഭാവിക ലൈംഗിക താല്പര്യവും രതിമൂർച്ഛാ സുഖവും വർദ്ധിപ്പിക്കുന്നു.",
  },
  {
    q: "ഒരു തവണ കഴിച്ചാൽ എത്ര സമയം ഇതിന്റെ ഫലം നിൽക്കും?",
    a: "ഒരു സ്ട്രിപ്പ് അല്ലെങ്കിൽ ഒരു ചെറിയ സ്പൂൺ കഴിച്ചാൽ 24 മുതൽ 48 മണിക്കൂർ വരെ ഇതിന്റെ ഉണർവ്വും സ്റ്റാമിനയും ശരീരത്തിൽ അനുഭവപ്പെടും.",
  },
  {
    q: "ബാലൻസ് സ്ട്രിപ്പ് റീഫണ്ട് ഗ്യാരണ്ടി എങ്ങനെ ലഭിക്കും?",
    a: "സ്ട്രിപ്പ് പാക്കുകൾ വാങ്ങി ഉപയോഗിച്ച് നിങ്ങൾക്ക് തൃപ്തികരമായ ഫലം ലഭിച്ചില്ലെങ്കിൽ, ബാക്കിയുള്ള ഉപയോഗിക്കാത്ത സ്ട്രിപ്പുകൾ ഞങ്ങളുടെ വിലാസത്തിലേക്ക് അയച്ചു തരിക. ബാക്കി സ്ട്രിപ്പുകളുടെ തുക പൂർണ്ണമായും നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് റീഫണ്ട് ചെയ്യുന്നതായിരിക്കും.",
  },
  {
    q: "പാക്കിങ് രഹസ്യമായിരിക്കുമോ (Discreet Packaging)?",
    a: "തീർച്ചയായും! 100% സാധാരണ കാർഡ്ബോർഡ് ബോക്സിലാണ് പാക്ക് ചെയ്യുന്നത്. പാക്കറ്റിന് മുകളിൽ പ്രൊഡക്റ്റിന്റെ പേരോ വിവരങ്ങളോ ഉണ്ടായിരിക്കില്ല. തികച്ചും സ്വകാര്യമായിരിക്കും.",
  },
  {
    q: "കേരളത്തിൽ എത്ര ദിവസം കൊണ്ട് ഡെലിവറി ലഭിക്കും?",
    a: "ഓർഡർ നൽകി 24 മണിക്കൂറിനകം കേരളത്തിലെ വെയർഹൗസിൽ നിന്ന് ഡിസ്പാച്ച് ചെയ്യും. Prepaid ഓർഡറുകൾക്ക് 1–2 ദിവസത്തിനകവും, COD ഓർഡറുകൾക്ക് 3–7 ദിവസത്തിനകവും നിങ്ങളുടെ കൈകളിൽ എത്തും.",
  },
];

export function TurkiyeJamStorefront() {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const defaultProduct = DEFAULT_PRODUCTS[0];

  const [selectedVariant, setSelectedVariant] = useState<TurkiyeJamVariant>(TURKIYE_JAM_VARIANTS[0]);
  const [activeImage, setActiveImage] = useState<string>(PRODUCT_IMAGES[0].src);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"cod" | "prepaid">("prepaid");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedAddressTemplate, setCopiedAddressTemplate] = useState<boolean>(false);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // Show sticky bar on scroll past hero
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectVariant = (variant: TurkiyeJamVariant) => {
    setSelectedVariant(variant);
    setActiveImage(variant.image);
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: `turkiye-jam-${selectedVariant.id}`,
        name: `തുർക്കി ജാം (${selectedVariant.name})`,
        category: "Vitality & Wellness",
        price: selectedVariant.price,
        original_price: selectedVariant.mrp,
        mrp: selectedVariant.mrp,
        poster_image: selectedVariant.image,
        color: selectedVariant.name,
      },
      1
    );
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: `turkiye-jam-${selectedVariant.id}`,
        name: `തുർക്കി ജാം (${selectedVariant.name})`,
        category: "Vitality & Wellness",
        price: selectedVariant.price,
        original_price: selectedVariant.mrp,
        mrp: selectedVariant.mrp,
        poster_image: selectedVariant.image,
        color: selectedVariant.name,
      },
      1
    );
    openCart();
  };

  const buildWhatsAppOrderUrl = () => {
    const text = `Hi, I want to order Turkiye Jam:
Package: ${selectedVariant.name} (₹${selectedVariant.price})
Delivery Mode: ${selectedPaymentMode === "cod" ? "Cash on Delivery (₹190 Extra)" : "Prepaid (₹60 Extra)"}

Name: 
Address: 
District: 
Pincode: 
Landmark: 
Mobile Number: `;
    return `https://wa.me/919744122853?text=${encodeURIComponent(text)}`;
  };

  const copyAddressTemplate = () => {
    const template = `Name: 
Address: 
District: 
Pincode: 
Landmark: 
Mobile Number: 
Package: ${selectedVariant.name}`;
    navigator.clipboard.writeText(template);
    setCopiedAddressTemplate(true);
    setTimeout(() => setCopiedAddressTemplate(false), 2500);
  };

  return (
    <div className="w-full bg-[#FAF7F2] text-[#1A1A1A]">
      {/* 1. HERO SECTION & ORDER STUDIO */}
      <section className="relative pt-6 pb-14 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Flash Sale Banner Header */}
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#780016] via-[#9e1b32] to-[#780016] text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-400 text-red-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Flame className="w-3.5 h-3.5" /> പരിമിതകാല ഓഫർ
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-200">
              ⚡ 100% ഒറിജിനൽ തുർക്കി ജാം • കേരളത്തിൽ 1 ദിവസം കൊണ്ട് ഡെലിവറി!
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>ഇന്ന് ബുക്ക് ചെയ്താൽ സൗജന്യ സമ്മാനങ്ങൾ &amp; അതിവേഗ ഡിസ്പാച്ച്</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Product Photo Gallery */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
            {/* Main Active Image Showcase */}
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden bg-white border border-rose-200/60 shadow-xl group">
              <Image
                src={activeImage}
                alt="Turkiye Jam - Themra Epimedium Macun"
                fill
                priority
                className="object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Badges on top of image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#780016] text-white text-xs font-black shadow-md">
                  🇹🇷 100% Made in Turkey
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-gray-950 text-[11px] font-extrabold shadow-sm">
                  ★ 4.9 Rating (1,480+ Reviews)
                </span>
              </div>

              {/* Discreet packaging badge */}
              <div className="absolute bottom-4 right-4 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
                  📦 100% Discreet Packaging
                </span>
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {PRODUCT_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.src)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${
                    activeImage === img.src
                      ? "border-[#780016] ring-2 ring-[#780016]/30 shadow-md scale-102"
                      : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>

            {/* Quick Guarantees Below Gallery */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
              <div className="p-3 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <div className="w-8 h-8 mx-auto rounded-full bg-rose-100 text-[#780016] flex items-center justify-center font-bold text-sm mb-1.5">
                  🇹🇷
                </div>
                <h5 className="text-xs font-bold text-gray-900 leading-tight">100% Original</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">Themra Turkey</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <div className="w-8 h-8 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                  <Truck className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-gray-900 leading-tight">1-Day Express</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">Kerala Delivery</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-gray-900 leading-tight">100% Refund</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">On Unused Strips</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information & 6-Variant Offer Selector */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#780016] text-xs font-black uppercase tracking-wider">
                  Themra Bitkisel Turkey
                </span>
                <span className="text-xs text-gray-500">|</span>
                <span className="text-xs font-bold text-emerald-700">✓ In Stock &amp; Ready to Ship</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                തുർക്കി ജാം (Themra Epimedyumlu Macun)
              </h1>
              <p className="text-sm sm:text-base font-bold text-[#780016] mt-1.5">
                സ്ത്രീകൾക്കും പുരുഷന്മാർക്കും ഉപയോഗിക്കാവുന്ന അത്ഭുത പ്രകൃതിദത്ത ഉൽപ്പന്നം
              </p>

              {/* Ratings summary */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900">4.9 / 5</span>
                <span className="text-xs text-gray-500">• 1,480+ കസ്റ്റമർ റിവ്യൂകൾ</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  4,200+ Sold
                </span>
              </div>
            </div>

            {/* 6 OFFER PACKAGES SELECTOR */}
            <div id="offers" className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#780016]" />
                  <span>🔻 ഓഫർ പാക്കേജുകൾ (Select Your Offer) 🔻</span>
                </h3>
                <span className="text-xs font-bold text-[#780016]">ആകെ 6 ഓപ്ഷനുകൾ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TURKIYE_JAM_VARIANTS.map((variant) => {
                  const isSelected = selectedVariant.id === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleSelectVariant(variant)}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#780016] bg-gradient-to-br from-rose-50/90 to-amber-50/50 shadow-md ring-2 ring-[#780016]/20 scale-[1.01]"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Badge if available */}
                      {variant.badge && (
                        <div className="absolute -top-2.5 right-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs ${
                              variant.popular ? "bg-[#780016]" : "bg-amber-600"
                            }`}
                          >
                            {variant.badge}
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Radio + Variant Title */}
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#780016]" : "border-gray-300"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#780016]" />}
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                              {variant.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                              {variant.malayalamTitle}
                            </p>
                          </div>
                        </div>

                        {/* Free bonus highlight */}
                        {variant.freeBonus && (
                          <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            🎁 {variant.freeBonus}
                          </div>
                        )}
                      </div>

                      {/* Pricing block */}
                      <div className="mt-3 pt-2 border-t border-rose-100/80 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg sm:text-xl font-black text-[#780016]">
                            ₹{variant.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{variant.mrp.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                          Save ₹{variant.savings}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DELIVERY SPEED & CHARGES CARD */}
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>🚚 ഡെലിവറി നിരക്കുകൾ &amp; സമയം (Delivery Rates)</span>
                <span className="text-[11px] text-gray-500">All Kerala &amp; India</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Prepaid Option */}
                <div
                  onClick={() => setSelectedPaymentMode("prepaid")}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPaymentMode === "prepaid"
                      ? "border-emerald-600 bg-emerald-50/70 shadow-xs"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">🔴 Prepaid (Online)</span>
                    <span className="text-xs font-black text-emerald-700">₹60 Extra</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                    ⚡ 1–2 Days Superfast Delivery
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">UPI, GPay, PhonePe, Cards</p>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setSelectedPaymentMode("cod")}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPaymentMode === "cod"
                      ? "border-[#780016] bg-rose-50/70 shadow-xs"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">🔴 Cash on Delivery</span>
                    <span className="text-xs font-black text-[#780016]">₹190 Extra</span>
                  </div>
                  <p className="text-[11px] text-[#780016] font-semibold mt-1">
                    📦 3–7 Days Delivery Time
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Pay remaining at doorstep</p>
                </div>
              </div>
            </div>

            {/* CALL TO ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-2xl bg-[#780016] hover:bg-[#52000f] text-white font-black text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>BUY NOW (ഓർഡർ ചെയ്യുക)</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ADD TO CART</span>
                </button>
              </div>

              {/* Direct WhatsApp Order CTA */}
              <a
                href={buildWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp വഴി നേരിട്ട് ഓർഡർ ചെയ്യുക (Instant WhatsApp Order)</span>
              </a>
            </div>

            {/* Selected Summary Pill */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-center justify-between">
              <div>
                <span className="font-bold">തിരഞ്ഞെടുത്ത പാക്കേജ്: </span>
                <span>{selectedVariant.name}</span>
              </div>
              <span className="font-extrabold text-[#780016] text-sm">
                ₹{selectedVariant.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION (ഗുണങ്ങൾ - പുരുഷൻമാരിലും സ്ത്രീകളിലും) */}
      <section id="benefits" className="py-16 px-4 sm:px-6 bg-white border-y border-rose-100">
        <div className="max-w-[1200px] mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-[#780016] text-xs font-black uppercase tracking-wider">
              100% Proven Natural Vitality
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
              തുർക്കി ജാമിന്റെ അത്ഭുത ഗുണങ്ങൾ
            </h2>
            <p className="text-sm sm:text-base font-semibold text-gray-600">
              സ്ത്രീകൾക്കും പുരുഷന്മാർക്കും ഒരുപോലെ ഉപയോഗിക്കാവുന്ന പ്രകൃതിദത്ത അമൃത്
            </p>
          </div>

          {/* 2 Columns: Men & Women */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CARD 1: FOR MEN */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1a0508] to-[#36000c] text-white shadow-xl space-y-6 relative overflow-hidden border border-rose-900/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center font-black text-xl shadow-md">
                    👨
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">പുരുഷൻമാരിൽ (For Men)</h3>
                    <p className="text-xs text-amber-300 font-bold">ശക്തിയും സ്റ്റാമിനയും സമയക്കൂടുതലും</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/10">
                  Top Result
                </span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>ശക്തിയും സമയക്കൂടുതലും (Extended Timing &amp; Stamina)</span>
                  </div>
                  <p className="text-xs text-gray-300 pl-7 leading-relaxed">
                    ലൈംഗിക വേളയിൽ അസാധാരണ ഊർജ്ജവും നിയന്ത്രണവും നൽകി ദീർഘനേരം ആസ്വദിക്കാൻ പ്രാപ്തമാക്കുന്നു.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>ഒരേ സമയം കൂടുതൽ തവണ ചെയ്യാൻ കഴിയുന്നു (Quick Recovery)</span>
                  </div>
                  <p className="text-xs text-gray-300 pl-7 leading-relaxed">
                    ഒരൊറ്റ റൗണ്ട് കഴിഞ്ഞുള്ള തളർച്ച മാറ്റി വേഗത്തിൽ ഊർജ്ജം വീണ്ടെടുത്ത് വീണ്ടും തുടരാൻ സഹായിക്കുന്നു.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>കരുത്തുറ്റ ഉദ്ധാരണവും ആത്മവിശ്വാസവും</span>
                  </div>
                  <p className="text-xs text-gray-300 pl-7 leading-relaxed">
                    സ്വാഭാവിക രക്തചംക്രമണം വർദ്ധിപ്പിച്ച് പുരുഷാവയവത്തിന് പൂർണ്ണ ദൃഢതയും കരുത്തും നൽകുന്നു.
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: FOR WOMEN */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FAF0F2] to-[#FCE7EC] text-gray-900 shadow-xl space-y-6 relative overflow-hidden border border-rose-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#780016] text-white flex items-center justify-center font-black text-xl shadow-md">
                    👩
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#780016]">സ്ത്രീകളിൽ (For Women)</h3>
                    <p className="text-xs text-rose-800 font-bold">ആഗ്രഹവും ആനന്ദവും വർദ്ധിപ്പിക്കുന്നു</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-200/60 text-[#780016] border border-rose-300/40">
                  Natural Boost
                </span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-[#780016] font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#780016] shrink-0" />
                    <span>ലൈംഗിക ആഗ്രഹം വർദ്ധിപ്പിക്കുന്നു (Boosts Libido &amp; Desire)</span>
                  </div>
                  <p className="text-xs text-gray-700 pl-7 leading-relaxed">
                    സ്ത്രീകളിലെ താല്പര്യക്കുറവ് മാറ്റി സ്വാഭാവിക ലൈംഗിക താല്പര്യവും മാനസിക സന്തോഷവും ഉണർത്തുന്നു.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-[#780016] font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#780016] shrink-0" />
                    <span>ലൈംഗിക സുഖവും ആനന്ദവും (Enhanced Pleasure &amp; Climax)</span>
                  </div>
                  <p className="text-xs text-gray-700 pl-7 leading-relaxed">
                    സംവേദനക്ഷമത കൂട്ടി രതിമൂർച്ഛ വേഗത്തിലും അത്യധികം ആനന്ദകരമായും എത്തിക്കാൻ സഹായിക്കുന്നു.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-[#780016] font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#780016] shrink-0" />
                    <span>ശാരീരിക ക്ഷീണം അകറ്റി ഉന്മേഷം നൽകുന്നു</span>
                  </div>
                  <p className="text-xs text-gray-700 pl-7 leading-relaxed">
                    ദിവസേനയുള്ള സ്ട്രെസ്സും തളർച്ചയും മാറ്റി പങ്കാളിയോടൊപ്പം സുഖകരമായ നിമിഷങ്ങൾ ആസ്വദിക്കാൻ മനസ്സിനെ പ്രാപ്തമാക്കുന്നു.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW TO USE SECTION (ഉപയോഗം - ജാം എങ്ങനെ കഴിക്കാം) */}
      <section id="how-to-use" className="py-16 px-4 sm:px-6 max-w-[1200px] mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            Step by Step Guide
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
            ജാം എങ്ങനെ കഴിക്കാം? (ഉപയോഗം)
          </h2>
          <p className="text-sm sm:text-base font-semibold text-gray-600">
            ശരിയായ ഫലം ലഭിക്കാൻ താഴെ പറയുന്ന 5 കാര്യങ്ങൾ കൃത്യമായി പാലിക്കുക 👇
          </p>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#780016] text-white flex items-center justify-center font-black text-base mb-3 shadow-xs">
                1
              </div>
              <h4 className="text-sm font-black text-gray-900 leading-snug">
                1 മണിക്കൂർ മുമ്പ് ഭക്ഷണം കഴിക്കുക
              </h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                ലൈംഗിക ബന്ധത്തിന് ഒരു മണിക്കൂർ മുമ്പ് സാധാരണ ഭക്ഷണം കഴിക്കുക.
              </p>
            </div>
            <div className="text-[11px] font-bold text-rose-700 bg-rose-50 p-2 rounded-lg mt-2">
              ഭക്ഷണം പ്രധാനം!
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#780016] text-white flex items-center justify-center font-black text-base mb-3 shadow-xs">
                2
              </div>
              <h4 className="text-sm font-black text-gray-900 leading-snug">
                10 മിനിറ്റ് കഴിഞ്ഞ് ജാം കഴിക്കുക
              </h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                ഭക്ഷണം കഴിഞ്ഞ് 10 മിനിറ്റ് കഴിഞ്ഞ് 1 ചെറിയ സ്പൂൺ അല്ലെങ്കിൽ 1 സ്ട്രിപ്പ് കഴിക്കുക.
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
              1 സ്പൂൺ / 1 സ്ട്രിപ്പ്
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#780016] text-white flex items-center justify-center font-black text-base mb-3 shadow-xs">
                3
              </div>
              <h4 className="text-sm font-black text-gray-900 leading-snug">
                കുപ്പിയെങ്കിൽ നന്നായി ഇളക്കുക
              </h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                ബോട്ടിൽ ആണെങ്കിൽ ജാം കഴിക്കുന്നതിന് മുമ്പ് സ്പൂൺ വെച്ച് നന്നായി ഇളക്കാൻ മറക്കരുത്.
              </p>
            </div>
            <div className="text-[11px] font-bold text-purple-800 bg-purple-50 p-2 rounded-lg mt-2">
              Stir Well (if bottle)
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#780016] text-white flex items-center justify-center font-black text-base mb-3 shadow-xs">
                4
              </div>
              <h4 className="text-sm font-black text-gray-900 leading-snug">
                1 ഗ്ലാസ് ചെറുചൂടുള്ള പാൽ കുടിക്കുക
              </h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                കഴിയുമെങ്കിൽ ജാം കഴിച്ച് 15 മിനിറ്റ് കഴിഞ്ഞ് ഒരു ഗ്ലാസ് പാൽ കുടിക്കുക.
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg mt-2">
              ഫലം ഇരട്ടിയാകും!
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-base mb-3 shadow-xs">
                5
              </div>
              <h4 className="text-sm font-black text-gray-900 leading-snug">
                ശീതളപാനീയങ്ങൾ കുടിക്കരുത്
              </h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                ജാമിന് മുകളിലോ ശേഷമോ ഒരു തരത്തിലുള്ള തണുത്ത പാനീയങ്ങളോ സോഡയോ കുടിക്കരുത്.
              </p>
            </div>
            <div className="text-[11px] font-bold text-red-700 bg-red-50 p-2 rounded-lg mt-2">
              No Cold Drinks
            </div>
          </div>
        </div>

        {/* MEDICAL PRECAUTIONS ALERT BOX */}
        <div className="p-5 sm:p-6 rounded-3xl bg-red-50 border-2 border-red-200 space-y-3">
          <div className="flex items-center gap-3 text-red-800">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <h4 className="text-base sm:text-lg font-black tracking-tight">
              പ്രത്യേകം ശ്രദ്ധിക്കുക (Important Medical Precautions)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-red-950 font-medium">
            <div className="p-3.5 rounded-xl bg-white/80 border border-red-200/60 flex items-start gap-2.5">
              <span className="text-base font-bold text-red-600 leading-none">❌</span>
              <span>
                <strong>ഇത് വെറും വയറ്റിൽ കഴിക്കരുത്.</strong> സാധാരണ ഭക്ഷണം കഴിച്ച ശേഷം മാത്രം ഉപയോഗിക്കുക.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-red-200/60 flex items-start gap-2.5">
              <span className="text-base font-bold text-red-600 leading-none">❌</span>
              <span>
                <strong>നിങ്ങൾക്ക് ഇതിനകം ഹൃദയസംബന്ധമായ പ്രശ്നങ്ങളോ ബിപി പ്രശ്നങ്ങളോ ഉണ്ടെങ്കിൽ</strong> ജാം അല്ലെങ്കിൽ മറ്റ് അനുബന്ധ ഉൽപ്പന്നങ്ങൾ ഉപയോഗിക്കരുത്.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 100% UNUSED STRIP REFUND GUARANTEE & DISCREET PACKAGING */}
      <section id="guarantee" className="py-16 px-4 sm:px-6 bg-gradient-to-r from-[#1a0508] via-[#36000c] to-[#1a0508] text-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Card 1: Refund Guarantee */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center font-black text-2xl shadow-lg">
              🛡️
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              ബാലൻസ് സ്ട്രിപ്പ് റീഫണ്ട് ഗ്യാരണ്ടി!
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed font-medium">
              സ്ട്രിപ്പ് ആണെങ്കിൽ ഉപയോഗിച്ച് നിങ്ങൾക്ക് തൃപ്തികരമായ റിസൾട്ട് ഇല്ലെങ്കിൽ ബാലൻസ് വരുന്ന സ്ട്രിപ്പുകൾ നിങ്ങൾക്ക് ഞങ്ങൾക്ക് തിരിച്ച് അയക്കാം.
            </p>
            <div className="p-4 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold">
              ✅ ബാലൻസ് സ്ട്രിപ്പിന്റെ കൃത്യമായ തുക നിങ്ങളുടെ ബാങ്ക് / UPI അക്കൗണ്ടിലേക്ക് റീഫണ്ട് ചെയ്യുന്നതായിരിക്കും!
            </div>
          </div>

          {/* Card 2: Discreet Packaging */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
              📦
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              100% രഹസ്യവും സുരക്ഷിതവുമായ പാക്കിങ്
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed font-medium">
              നിങ്ങളുടെ സ്വകാര്യതയ്ക്ക് ഞങ്ങൾ അതീവ പ്രാധാന്യം നൽകുന്നു. തികച്ചും പ്ലെയിൻ കാർഡ്ബോർഡ് ബോക്സിൽ പാക്ക് ചെയ്ത് യാതൊരു പ്രൊഡക്റ്റ് വിവരങ്ങളും പുറത്ത് കാണിക്കാതെയാണ് ഡെലിവറി നടത്തുന്നത്.
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-bold">
              🔒 പൂർണ്ണ സ്വകാര്യത • ആർക്കും ഉള്ളടക്കം തിരിച്ചറിയാൻ കഴിയില്ല
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK SEND-ADDRESS WHATSAPP TEMPLATE */}
      <section className="py-14 px-4 sm:px-6 max-w-[1000px] mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/30 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
              Easy 1-Click Order
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-gray-950">
              ഫോം പൂരിപ്പിക്കാൻ മടിയാണോ? അഡ്രസ്സ് വാട്സ്ആപ്പിൽ അയക്കൂ!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              താഴെയുള്ള വിവരങ്ങൾ പൂരിപ്പിച്ച് ഒറ്റ ക്ലിക്കിൽ വാട്സ്ആപ്പ് വഴി ഓർഡർ ഉറപ്പാക്കാം.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-xs sm:text-sm text-gray-800 space-y-1 relative">
            <button
              onClick={copyAddressTemplate}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-sans font-bold hover:bg-gray-100 flex items-center gap-1.5 shadow-2xs"
            >
              {copiedAddressTemplate ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Format</span>
                </>
              )}
            </button>

            <p className="text-gray-400 font-sans text-xs mb-2"># For order - Please Send Address:</p>
            <p>Name: ______________________</p>
            <p>Address: ___________________</p>
            <p>District: __________________</p>
            <p>Pincode: ___________________</p>
            <p>Land Mark: _________________</p>
            <p>Mob No: ____________________</p>
            <p className="text-[#780016] font-bold mt-2">
              Selected: {selectedVariant.name} (₹{selectedVariant.price})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={buildWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="w-5 h-5" />
              <span>വാട്സ്ആപ്പിൽ അഡ്രസ്സ് അയച്ച് ഓർഡർ ചെയ്യുക</span>
            </a>

            <button
              onClick={handleBuyNow}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#780016] hover:bg-[#52000f] text-white font-black text-sm sm:text-base shadow-md transition-all cursor-pointer"
            >
              വെബ്സൈറ്റിൽ ഓർഡർ ചെയ്യുക →
            </button>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section id="reviews" className="py-16 px-4 sm:px-6 bg-white border-t border-rose-100">
        <div className="max-w-[1200px] mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-[#780016] text-xs font-black uppercase tracking-wider">
              Customer Feedback
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-950">
              ഉപഭോക്താക്കളുടെ അഭിപ്രായങ്ങൾ (Customer Reviews)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">
              കേരളത്തിൽ നിന്നുള്ള നൂറുകണക്കിന് സംതൃപ്തരായ ഉപഭോക്താക്കളുടെ യഥാർത്ഥ അനുഭവങ്ങൾ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {defaultProduct.reviews_data?.list.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-rose-100 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-rose-200/60 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black text-gray-900">{rev.author}</h5>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-16 px-4 sm:px-6 max-w-[900px] mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
            സംശയങ്ങളും ഉത്തരങ്ങളും (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            തുർക്കി ജാമിനെക്കുറിച്ച് ആളുകൾ സ്ഥിരമായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-rose-100 bg-white overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 hover:text-[#780016] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOpen ? "rotate-180 text-[#780016]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 pt-1 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-rose-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FLOATING STICKY BUY BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-rose-200 shadow-2xl"
          >
            <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
              {/* Product Info Left */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-rose-200 hidden sm:block shrink-0 bg-white">
                  <Image
                    src={selectedVariant.image}
                    alt={selectedVariant.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-1">
                    തുർക്കി ജാം • {selectedVariant.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-[#780016]">
                      ₹{selectedVariant.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{selectedVariant.mrp.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Save ₹{selectedVariant.savings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-2.5">
                <a
                  href={buildWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={handleBuyNow}
                  className="py-3 px-5 sm:px-7 rounded-xl bg-[#780016] hover:bg-[#52000f] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  BUY NOW (ഓർഡർ ചെയ്യുക) →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
