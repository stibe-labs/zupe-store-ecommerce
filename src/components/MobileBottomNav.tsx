"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Store, Heart, User } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalWishlistItems } = useWishlist();
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  // Route guard: hide on admin, brand studio, checkout, cart, and PDP (which have dedicated sticky bars)
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/cart") ||
    pathname?.startsWith("/brand") ||
    pathname?.startsWith("/products/")
  ) {
    return null;
  }

  const isHome = pathname === "/";
  const isShop = pathname === "/products" || pathname === "/shop";
  const isBag = pathname === "/cart";
  const isWishlist = pathname === "/wishlist";
  const isAccount =
    pathname === "/account" ||
    pathname === "/signin" ||
    pathname === "/login";

  const items = [
    {
      key: "home",
      label: "Home",
      active: isHome,
      icon: Home,
      badge: 0,
      onClick: () => {
        if (isHome) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          router.push("/");
        }
      },
    },
    {
      key: "shop",
      label: "Shop",
      active: isShop,
      icon: Store,
      badge: 0,
      onClick: () => router.push("/products"),
    },
    {
      key: "bag",
      label: "Bag",
      active: isBag,
      icon: ShoppingBag,
      badge: totalItems,
      onClick: () => router.push("/cart"),
    },
    {
      key: "wishlist",
      label: "Saved",
      active: isWishlist,
      icon: Heart,
      badge: totalWishlistItems,
      onClick: () => router.push("/wishlist"),
    },
    {
      key: "account",
      label: "Account",
      active: isAccount,
      icon: User,
      badge: 0,
      onClick: () => {
        if (isAuthenticated) {
          router.push("/account");
        } else {
          router.push("/signin?redirect=/account");
        }
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
      className="md:hidden fixed left-3.5 right-3.5 max-w-[380px] mx-auto z-40 bg-white/95 backdrop-blur-xl border border-neutral-200/85 rounded-full py-1.5 px-2 shadow-[0_12px_32px_rgba(9,17,14,0.14)] select-none font-mograph"
    >
      <div className="grid grid-cols-5 items-center w-full">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              aria-label={item.badge > 0 ? `${item.label} (${item.badge})` : item.label}
              className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
                item.active
                  ? "bg-[#E6F4EF] text-[#0B5D44]"
                  : "text-neutral-600 hover:text-[#0C1412]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-[19px] h-[19px] ${
                    item.active ? "stroke-[2.3]" : "stroke-[1.9]"
                  }`}
                />
                {item.badge > 0 && (
                  <span
                    key={item.badge}
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#0B5D44] text-white text-[9px] font-extrabold tabular-nums flex items-center justify-center ring-2 ring-white animate-[vl80-badge-pop_240ms_cubic-bezier(0.34,1.56,0.64,1)]"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9.5px] leading-none mt-1 tracking-tight ${
                  item.active ? "font-bold text-[#074230]" : "font-medium text-neutral-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
