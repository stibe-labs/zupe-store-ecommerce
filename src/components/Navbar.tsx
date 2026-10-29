"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { totalItems, openCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY <= 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsVisible(true);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push("/signin?redirect=/account");
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (isHomePage) {
      const el = document.getElementById(id);
      if (el) {
        if (typeof window !== "undefined" && window.__lenis) {
          window.__lenis.scrollTo(el, { offset: 0, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        !isHomePage
          ? "bg-[#5b1420] border-b-2 border-stone-900 shadow-md py-3 sm:py-3.5"
          : isScrolled
          ? "bg-[#681b28]/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/10 py-2.5"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <Link
          href="/"
          className="inline-flex items-center group py-1"
          aria-label="Turkiye Jam Homepage"
        >
          <div className="relative h-11 sm:h-13 w-28 sm:w-36 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform drop-shadow-md">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Center: Navigation Links (About, Shop, Origin, FAQ, Reviews) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-white font-medium text-sm lg:text-base">
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, "about")}
            className="hover:text-[#fed000] transition-colors py-1 font-semibold"
          >
            About
          </a>
          <a
            href="#shop"
            onClick={(e) => scrollToSection(e, "shop")}
            className="hover:text-[#fed000] transition-colors py-1 font-semibold"
          >
            Shop
          </a>
          <a
            href="#origin"
            onClick={(e) => scrollToSection(e, "origin")}
            className="hover:text-[#fed000] transition-colors py-1 font-semibold"
          >
            Origin
          </a>
          <a
            href="#faq"
            onClick={(e) => scrollToSection(e, "faq")}
            className="hover:text-[#fed000] transition-colors py-1 font-semibold"
          >
            FAQ
          </a>
          <a
            href="#reviews"
            onClick={(e) => scrollToSection(e, "reviews")}
            className="hover:text-[#fed000] transition-colors py-1 font-semibold"
          >
            Reviews
          </a>
        </nav>

        {/* Right Side: Order Now yellow pill + Cart + Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href="#shop"
            onClick={(e) => scrollToSection(e, "shop")}
            className="btn-shimmer px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#fed000] hover:bg-[#e6bc00] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center cursor-pointer"
          >
            Order now
          </a>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#fed000] text-black text-[10px] font-black flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          <button
            onClick={handleAccountClick}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="User Account"
          >
            <User className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
}
