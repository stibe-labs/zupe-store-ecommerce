"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  LayoutGrid,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Tag,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  DEFAULT_PRODUCTS,
  PRODUCT_CATEGORIES,
  getSubcategoriesForCategory,
  doesCategoryMatch,
  doesSubcategoryMatch,
} from "@/data/zupeProducts";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { getClientProducts, getClientShowcase } from "@/lib/productsClientCache";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { StoreCategory, DEFAULT_STORE_CATEGORIES } from "@/lib/storeContent";
import { renderIconOrCustom } from "@/components/CategoryPills";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();
  const initialCategory = searchParams.get("category") || "All";
  const initialSubcategory = searchParams.get("subcategory") || "All";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "";

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [categoryList, setCategoryList] = useState<string[]>([...PRODUCT_CATEGORIES]);
  const [dynamicCategories, setDynamicCategories] = useState<StoreCategory[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("zupe_store_categories_cache_v2");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return DEFAULT_STORE_CATEGORIES;
  });

  useEffect(() => {
    fetch("/api/content/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setDynamicCategories(data.categories);
          const names: string[] = data.categories
            .filter((c: any) => c.active !== false)
            .map((c: any) => String(c.name));
          setCategoryList(["All", ...Array.from(new Set<string>(names))]);
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic categories:", err));
  }, []);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showcaseCollections, setShowcaseCollections] = useState<{
    topPickzProductIds?: string[];
    newArrivalsProductIds?: string[];
    bestSellersProductIds?: string[];
    todayDealsProductIds?: string[];
  } | null>(null);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Close custom sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fetch updated catalog and showcase collections from deduplicated cache
  useEffect(() => {
    async function loadCatalogAndShowcase() {
      try {
        const [productsList, showcaseData] = await Promise.all([
          getClientProducts(),
          getClientShowcase(),
        ]);
        if (Array.isArray(productsList) && productsList.length > 0) {
          setProducts(productsList);
        }
        if (showcaseData) {
          setShowcaseCollections(showcaseData);
        }
      } catch (err) {
        console.warn("Could not fetch fresh products or showcase collections:", err);
      }
    }
    loadCatalogAndShowcase();
  }, []);

  // Synchronize state whenever URL query params change
  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat || "All");

    const sub = searchParams.get("subcategory");
    setSelectedSubcategory(sub || "All");

    const q = searchParams.get("search") || searchParams.get("q");
    setSearchQuery(q || "");

    const f = searchParams.get("filter");
    setActiveFilter(f || "");
  }, [searchParams]);

  const isAllCategories =
    !selectedCategory ||
    selectedCategory.toLowerCase() === "all" ||
    selectedCategory.toLowerCase() === "all categories";

  const currentCategoryObj = useMemo(() => {
    if (isAllCategories) return null;
    const lower = selectedCategory.trim().toLowerCase();
    return (
      dynamicCategories.find(
        (c) =>
          (c.name && c.name.toLowerCase() === lower) ||
          (c.slug && c.slug.toLowerCase() === lower)
      ) || null
    );
  }, [dynamicCategories, selectedCategory, isAllCategories]);

  const availableSubcategories = useMemo(() => {
    if (isAllCategories) return [];
    if (
      currentCategoryObj &&
      Array.isArray(currentCategoryObj.subcategories) &&
      currentCategoryObj.subcategories.length > 0
    ) {
      return currentCategoryObj.subcategories;
    }
    return getSubcategoriesForCategory(selectedCategory, dynamicCategories);
  }, [isAllCategories, currentCategoryObj, selectedCategory, dynamicCategories]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileFilterOpen]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];
    const filterLower = activeFilter.toLowerCase();

    return products
      .filter((product) => {
        // Active Filter (New Arrivals, Best Sellers, Offers / Deals)
        if (filterLower === "new") {
          const curatedNew = showcaseCollections?.newArrivalsProductIds;
          if (Array.isArray(curatedNew) && curatedNew.length > 0) {
            const matchesCurated =
              curatedNew.includes(product.id) ||
              curatedNew.includes(product.slug || "");
            if (!matchesCurated) return false;
          } else {
            const isMarkedNew =
              product.badge?.toLowerCase() === "new" ||
              (product as any).is_new === true;
            const isNewArrivalItem =
              [
                "mini-thermal-printer",
                "tf20-multipurpose-powerbank",
                "helicopter-car-perfume",
                "instant-water-heater-faucet",
                "mini-hot-air-popcorn-maker",
              ].includes(product.id) ||
              [
                "mini-thermal-printer",
                "tf20-multipurpose-powerbank",
                "helicopter-car-perfume",
                "instant-water-heater-faucet",
                "mini-hot-air-popcorn-maker",
              ].includes(product.slug || "");
            if (!isMarkedNew && !isNewArrivalItem) return false;
          }
        } else if (filterLower === "best") {
          const curatedBest = showcaseCollections?.bestSellersProductIds;
          if (Array.isArray(curatedBest) && curatedBest.length > 0) {
            const matchesCurated =
              curatedBest.includes(product.id) ||
              curatedBest.includes(product.slug || "");
            if (!matchesCurated) return false;
          } else {
            const isTrendingOrBest =
              product.badge?.toLowerCase() === "trending" ||
              product.badge?.toLowerCase() === "bestseller" ||
              (product.rating && product.rating >= 4.7) ||
              (product.review_count && product.review_count >= 200);
            if (!isTrendingOrBest) return false;
          }
        } else if (filterLower === "offers" || filterLower === "deals") {
          const curatedDeals = showcaseCollections?.todayDealsProductIds;
          if (Array.isArray(curatedDeals) && curatedDeals.length > 0) {
            const matchesCurated =
              curatedDeals.includes(product.id) ||
              curatedDeals.includes(product.slug || "");
            if (!matchesCurated) return false;
          } else {
            const isSale =
              product.badge?.toLowerCase() === "sale" ||
              (product.mrp && product.price && product.mrp > product.price) ||
              (product.mrp && product.offer_price && product.mrp > product.offer_price);
            if (!isSale) return false;
          }
        }

        // Category filter
        if (!doesCategoryMatch(product.category, selectedCategory, dynamicCategories)) {
          return false;
        }

        // Subcategory filter
        if (selectedSubcategory !== "All" && !doesSubcategoryMatch(product, selectedSubcategory)) {
          return false;
        }

        // Multi-keyword token search matching across name, tagline, description, category, and badge
        if (queryTokens.length > 0) {
          const searchable = `${product.name} ${product.tagline} ${product.description} ${product.category} ${product.badge || ""}`.toLowerCase();
          const matchesAllTokens = queryTokens.every((token) => searchable.includes(token));
          if (!matchesAllTokens) return false;
        }

        // Price filter
        if (product.price > maxPrice) return false;

        // In stock filter
        if (onlyInStock && product.stock_count <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);

        // Curated order preservation for showcase filters
        if (filterLower === "new" && showcaseCollections?.newArrivalsProductIds?.length) {
          const list = showcaseCollections.newArrivalsProductIds;
          const idxA = list.indexOf(a.id) !== -1 ? list.indexOf(a.id) : list.indexOf(a.slug || "");
          const idxB = list.indexOf(b.id) !== -1 ? list.indexOf(b.id) : list.indexOf(b.slug || "");
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        }
        if (filterLower === "best" && showcaseCollections?.bestSellersProductIds?.length) {
          const list = showcaseCollections.bestSellersProductIds;
          const idxA = list.indexOf(a.id) !== -1 ? list.indexOf(a.id) : list.indexOf(a.slug || "");
          const idxB = list.indexOf(b.id) !== -1 ? list.indexOf(b.id) : list.indexOf(b.slug || "");
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        }
        if ((filterLower === "deals" || filterLower === "offers") && showcaseCollections?.todayDealsProductIds?.length) {
          const list = showcaseCollections.todayDealsProductIds;
          const idxA = list.indexOf(a.id) !== -1 ? list.indexOf(a.id) : list.indexOf(a.slug || "");
          const idxB = list.indexOf(b.id) !== -1 ? list.indexOf(b.id) : list.indexOf(b.slug || "");
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        }

        return 0; // featured / default
      });
  }, [products, activeFilter, selectedCategory, selectedSubcategory, searchQuery, sortBy, maxPrice, onlyInStock, showcaseCollections]);

  const handleCategorySelect = (cat: string) => {
    const isTargetAll = !cat || cat.toLowerCase() === "all" || cat.toLowerCase() === "all categories";
    setSelectedCategory(isTargetAll ? "All" : cat);
    setSelectedSubcategory("All");
    const params = new URLSearchParams();
    if (!isTargetAll) params.set("category", cat);
    if (activeFilter) params.set("filter", activeFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const queryStr = params.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  };

  const handleSubcategorySelect = (subcat: string) => {
    setSelectedSubcategory(subcat);
    const params = new URLSearchParams();
    if (!isAllCategories) params.set("category", selectedCategory);
    if (subcat && subcat.toLowerCase() !== "all") params.set("subcategory", subcat);
    if (activeFilter) params.set("filter", activeFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const queryStr = params.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  };

  const handleClearActiveFilter = () => {
    setActiveFilter("");
    const params = new URLSearchParams();
    if (!isAllCategories) params.set("category", selectedCategory);
    if (selectedSubcategory && selectedSubcategory.toLowerCase() !== "all") {
      params.set("subcategory", selectedSubcategory);
    }
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const queryStr = params.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0)) {
      return;
    }
    const success = addToCart(product, 1);
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to add items to your cart & checkout 🛍️");
      return;
    }
    if (success) openCart();
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0)) {
      return;
    }
    addToCart(product, 1);
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to complete your purchase ⚡");
      return;
    }
    router.push("/checkout");
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_wishlist_action",
          JSON.stringify({ action: "wishlist", product })
        );
      } catch (e) {}
      openAuthModal("login", "Sign in required: Please log in to save items to your wishlist ❤️");
      return;
    }
    toggleWishlist(product);
  };

  const getBannerDetails = () => {
    const f = activeFilter.toLowerCase();
    if (f === "new") {
      return {
        badge: "Fresh Drops",
        icon: <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />,
        title: selectedCategory !== "All" ? `New Arrivals: ${selectedCategory}` : "New Arrivals",
        subtitle: "Be the first to explore our latest innovatively designed essentials",
        breadcrumb: "New Arrivals",
      };
    }
    if (f === "best") {
      return {
        badge: "Top Picks",
        icon: <Flame className="w-3.5 h-3.5 text-[#FF7A00]" />,
        title: selectedCategory !== "All" ? `Best Sellers: ${selectedCategory}` : "Best Sellers",
        subtitle: "Our most popular, top-rated products loved by thousands of customers",
        breadcrumb: "Best Sellers",
      };
    }
    if (f === "offers" || f === "deals") {
      return {
        badge: "Limited Time Deals",
        icon: <Tag className="w-3.5 h-3.5 text-[#FF7A00]" />,
        title: selectedCategory !== "All" ? `Special Deals: ${selectedCategory}` : "Special Offers & Deals",
        subtitle: "Save big on premium curated lifestyle products and daily essentials",
        breadcrumb: "Offers & Deals",
      };
    }
    if (selectedCategory !== "All") {
      return {
        badge: selectedCategory,
        icon: <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />,
        title: selectedSubcategory !== "All" ? selectedSubcategory : selectedCategory,
        subtitle:
          selectedSubcategory !== "All"
            ? `Explore ${selectedSubcategory} in ${selectedCategory}`
            : `Explore our handcrafted collection of ${selectedCategory}`,
        breadcrumb: selectedCategory,
        subBreadcrumb: selectedSubcategory !== "All" ? selectedSubcategory : null,
      };
    }
    return {
      badge: "Curated Catalog",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />,
      title: "Explore All Products",
      subtitle: `Showing ${filteredProducts.length} handcrafted, minimalist designs`,
      breadcrumb: null,
    };
  };

  const banner = getBannerDetails();

  const SORT_OPTIONS: {
    value: "featured" | "price-asc" | "price-desc" | "rating";
    label: string;
    desc: string;
    icon: React.ReactNode;
    iconBg: string;
    activeIconBg: string;
  }[] = [
    {
      value: "featured",
      label: "Featured",
      desc: "Curated collection & top picks",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />,
      iconBg: "bg-orange-50 text-[#FF7A00]",
      activeIconBg: "bg-[#FF7A00] text-white",
    },
    {
      value: "price-asc",
      label: "Price: Low to High",
      desc: "Budget-friendly first",
      icon: <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />,
      iconBg: "bg-emerald-50 text-emerald-600",
      activeIconBg: "bg-emerald-600 text-white",
    },
    {
      value: "price-desc",
      label: "Price: High to Low",
      desc: "Premium & luxury first",
      icon: <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />,
      iconBg: "bg-indigo-50 text-indigo-600",
      activeIconBg: "bg-indigo-600 text-white",
    },
    {
      value: "rating",
      label: "Highest Rated",
      desc: "Top customer reviews (4.5★+)",
      icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />,
      iconBg: "bg-amber-50 text-amber-500",
      activeIconBg: "bg-amber-500 text-white",
    },
  ];

  const currentSortOption = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between">
      <Navbar />

      {/* Header Banner */}
      <div className="pt-28 sm:pt-32 pb-6 bg-gradient-to-b from-[#fed000]/10 via-transparent to-transparent border-b border-stone-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-stone-600 mb-2 sm:mb-3">
            <Link href="/" className="hover:text-[#5b1420] transition-colors font-bold">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href="/products"
              onClick={() => {
                setActiveFilter("");
                setSelectedCategory("All");
              }}
              className="hover:text-[#5b1420] transition-colors font-bold"
            >
              Shop
            </Link>
            {banner.breadcrumb && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                {banner.subBreadcrumb ? (
                  <button
                    type="button"
                    onClick={() => handleSubcategorySelect("All")}
                    className="hover:text-[#5b1420] transition-colors font-bold cursor-pointer"
                  >
                    {banner.breadcrumb}
                  </button>
                ) : (
                  <span className="text-[#5b1420] font-black">{banner.breadcrumb}</span>
                )}
              </>
            )}
            {banner.subBreadcrumb && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#5b1420] font-black">{banner.subBreadcrumb}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#fed000] text-stone-900 border-2 border-stone-800 shadow-[0_2px_0_0_#2b2b2b] mb-2">
                {banner.icon}
                <span>{banner.badge}</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-tj-serif text-stone-900">
                {banner.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {banner.subtitle}
              </p>
            </div>

            {/* Search Input in Header */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border-2 border-stone-800 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#fed000] shadow-[0_3px_0_0_#2b2b2b] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-3 pb-8 sm:pt-4 sm:pb-10">
        {/* Active Filter Pill (if any) */}
        {(activeFilter || (!isAllCategories && selectedSubcategory !== "All")) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold text-gray-500">Filter applied:</span>
            {activeFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/25 shadow-sm">
                {activeFilter.toLowerCase() === "new" && "✨ New Arrivals"}
                {activeFilter.toLowerCase() === "best" && "🔥 Best Sellers"}
                {(activeFilter.toLowerCase() === "offers" || activeFilter.toLowerCase() === "deals") && "⚡ Special Offers"}
                {!["new", "best", "offers", "deals"].includes(activeFilter.toLowerCase()) && activeFilter}
                <button
                  onClick={handleClearActiveFilter}
                  className="p-0.5 hover:bg-[#FF7A00]/20 rounded-full transition-colors ml-1 cursor-pointer"
                  title="Clear filter"
                  aria-label="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {!isAllCategories && selectedSubcategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/25 shadow-sm">
                <span>{selectedSubcategory}</span>
                <button
                  onClick={() => handleSubcategorySelect("All")}
                  className="p-0.5 hover:bg-[#FF7A00]/20 rounded-full transition-colors ml-1 cursor-pointer"
                  title="Clear subcategory"
                  aria-label="Clear subcategory"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                handleClearActiveFilter();
                handleCategorySelect("All");
              }}
              className="text-xs text-gray-500 hover:text-[#FF7A00] font-semibold underline cursor-pointer ml-1"
            >
              Show all products
            </button>
          </div>
        )}

        {/* Category & Subcategory 3D Icon Selector */}
        <div className="mb-3.5 sm:mb-4.5">
          <div className="flex items-start gap-2.5 sm:gap-3.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
            {!isAllCategories ? (
              /* Inside an individual category: show subcategories */
              <>
                {/* 1. Quick Back / View All Categories Button */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect("All")}
                  className="flex flex-col items-center flex-shrink-0 group text-center min-w-[68px] sm:min-w-[80px] cursor-pointer"
                  title="View All Categories"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[20px] bg-white border border-gray-200/90 text-gray-600 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:border-[#FF7A00] group-hover:text-[#FF7A00] group-hover:shadow-sm mb-1.5 shadow-xs">
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-500 group-hover:text-[#FF7A00] transition-colors leading-tight">
                    All Categories
                  </span>
                </button>

                {/* 2. "All" (representing All of this Category) with Category's Icon & Selected Outline */}
                {(() => {
                  const isAllSelected = selectedSubcategory.toLowerCase() === "all" || !selectedSubcategory;
                  const catShape = currentCategoryObj?.iconShape === "square" ? "rounded-2xl sm:rounded-[20px]" : "rounded-full";
                  const bgColor = currentCategoryObj?.bgColor || "bg-[#EEF2FF]";
                  const iconColor = currentCategoryObj?.iconColor || "text-[#3B82F6]";

                  return (
                    <button
                      type="button"
                      onClick={() => handleSubcategorySelect("All")}
                      className="flex flex-col items-center flex-shrink-0 group text-center min-w-[72px] sm:min-w-[84px] cursor-pointer"
                    >
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 ${catShape} ${bgColor} ${iconColor} flex items-center justify-center transition-all duration-200 mb-1.5 overflow-hidden ${
                          isAllSelected
                            ? "border-2 border-[#FF7A00] shadow-md shadow-[#FF7A00]/20 scale-105"
                            : "border-2 border-transparent group-hover:scale-105 group-hover:shadow-sm"
                        }`}
                      >
                        {renderIconOrCustom({
                          iconName: currentCategoryObj?.icon,
                          customIcon: currentCategoryObj?.customIcon,
                          iconSize: currentCategoryObj?.iconSize || 85,
                          fallbackName: currentCategoryObj?.name || selectedCategory,
                        })}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs leading-tight transition-colors line-clamp-2 max-w-[82px] sm:max-w-[92px] ${
                          isAllSelected
                            ? "font-bold text-[#FF7A00]"
                            : "font-semibold text-gray-700 group-hover:text-[#FF7A00]"
                        }`}
                      >
                        All {currentCategoryObj?.name ? currentCategoryObj.name.split(" ")[0] : ""}
                      </span>
                    </button>
                  );
                })()}

                {/* 3. Subcategories with their respective icons & selected outline */}
                {availableSubcategories.map((subcat) => {
                  const isSubSelected = selectedSubcategory.toLowerCase() === subcat.toLowerCase();
                  const catShape = currentCategoryObj?.iconShape === "square" ? "rounded-2xl sm:rounded-[20px]" : "rounded-full";
                  const subIconName = currentCategoryObj?.subcategoryIcons?.[subcat];
                  const bgColor = currentCategoryObj?.bgColor || "bg-orange-50";
                  const iconColor = currentCategoryObj?.iconColor || "text-[#FF7A00]";

                  return (
                    <button
                      key={subcat}
                      type="button"
                      onClick={() => handleSubcategorySelect(subcat)}
                      className="flex flex-col items-center flex-shrink-0 group text-center min-w-[72px] sm:min-w-[84px] cursor-pointer"
                    >
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 ${catShape} ${bgColor} ${iconColor} flex items-center justify-center transition-all duration-200 mb-1.5 overflow-hidden ${
                          isSubSelected
                            ? "border-2 border-[#FF7A00] shadow-md shadow-[#FF7A00]/20 scale-105"
                            : "border-2 border-transparent group-hover:scale-105 group-hover:shadow-sm"
                        }`}
                      >
                        {renderIconOrCustom({
                          iconName: subIconName,
                          fallbackName: subcat,
                        })}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs leading-tight transition-colors line-clamp-2 max-w-[82px] sm:max-w-[92px] ${
                          isSubSelected
                            ? "font-bold text-[#FF7A00]"
                            : "font-semibold text-gray-700 group-hover:text-[#FF7A00]"
                        }`}
                      >
                        {subcat}
                      </span>
                    </button>
                  );
                })}
              </>
            ) : (
              /* All Products view: display home page style category cards */
              dynamicCategories
                .filter((c) => c.active !== false && c.showInPills !== false)
                .map((cat) => {
                  const isCatAll = cat.id === "all" || (cat.name && cat.name.toLowerCase() === "all categories");
                  const isCatSelected = isCatAll; // When on All Products view, "All Categories" is active
                  const catShape = cat.iconShape === "square" ? "rounded-2xl sm:rounded-[20px]" : "rounded-full";
                  const bgColor = cat.bgColor || (isCatAll ? "bg-[#EEF2FF]" : "bg-orange-50");
                  const iconColor = cat.iconColor || (isCatAll ? "text-[#3B82F6]" : "text-[#FF7A00]");

                  return (
                    <button
                      key={cat.id || cat.name}
                      type="button"
                      onClick={() => handleCategorySelect(isCatAll ? "All" : (cat.slug || cat.name))}
                      className="flex flex-col items-center flex-shrink-0 group text-center min-w-[72px] sm:min-w-[84px] cursor-pointer"
                    >
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 ${catShape} ${bgColor} ${iconColor} flex items-center justify-center transition-all duration-200 mb-1.5 overflow-hidden ${
                          isCatSelected
                            ? "border-2 border-[#FF7A00] shadow-md shadow-[#FF7A00]/20 scale-105"
                            : "border-2 border-transparent group-hover:scale-105 group-hover:shadow-sm"
                        }`}
                      >
                        {renderIconOrCustom({
                          iconName: cat.icon,
                          customIcon: cat.customIcon,
                          iconSize: cat.iconSize || 85,
                          fallbackName: cat.name,
                        })}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs leading-tight transition-colors line-clamp-2 max-w-[82px] sm:max-w-[92px] ${
                          isCatSelected
                            ? "font-bold text-[#FF7A00]"
                            : "font-semibold text-gray-700 group-hover:text-[#FF7A00]"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Controls Bar: Results Count, Sort & Mobile Filters */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 lg:mb-5">
          <div className="text-xs sm:text-sm font-semibold text-gray-500">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#2D3436] shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Filters</span>
            </button>

            {/* Custom Premium Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative ml-auto">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                aria-expanded={sortDropdownOpen}
                aria-haspopup="listbox"
                className={`flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                  sortDropdownOpen
                    ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/15 shadow-md text-[#111111]"
                    : "border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-orange-50 text-[#FF7A00]">
                  {currentSortOption.icon}
                </div>
                <span className="text-gray-400 font-normal hidden sm:inline">Sort:</span>
                <span className="font-bold text-gray-900">{currentSortOption.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-0.5 ${
                    sortDropdownOpen ? "rotate-180 text-[#FF7A00]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 p-1.5 z-50 origin-top-right backdrop-blur-sm"
                    role="listbox"
                  >
                    <div className="px-3 py-2 border-b border-gray-100/80 mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                        Sort Products By
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        {filteredProducts.length} items
                      </span>
                    </div>

                    <div className="space-y-1">
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#FF7A00]/10 text-gray-900 font-semibold"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? opt.activeIconBg : opt.iconBg
                              }`}
                            >
                              {opt.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? "text-[#FF7A00]" : "text-gray-900"}`}>
                                {opt.label}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {opt.desc}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#FF7A00] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#FF7A00]/40">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
              <div>
                <h3 className="font-display font-bold text-base text-[#2D3436] mb-3">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#636E72]">
                    <span>₹0</span>
                    <span className="text-[#FF7A00]">Up to ₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="6000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    aria-label="Filter by maximum price"
                    className="w-full accent-[#FF7A00] cursor-pointer"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="font-display font-bold text-base text-[#2D3436] mb-3">
                  Availability
                </h3>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00] accent-[#FF7A00]"
                  />
                  <span className="text-xs font-medium text-[#2D3436]">
                    In-Stock Items Only
                  </span>
                </label>
              </div>

              <hr className="border-gray-100" />

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF7A00]/10 to-[#FF7A45]/10 text-center">
                <p className="text-xs font-bold text-[#FF7A00] mb-1">Free Delivery</p>
                <p className="text-[11px] text-[#636E72]">
                  On all orders over ₹1,499 across all categories
                </p>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {searchQuery.trim() && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/70 border border-[#FF7A00]/25 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <Search className="w-4 h-4 text-[#FF7A00]" />
                  <span className="text-[#636E72]">Search results for:</span>
                  <span className="font-bold text-[#FF7A00]">&quot;{searchQuery}&quot;</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-semibold">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} found
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCategory !== "All" && (
                    <button
                      onClick={() => handleCategorySelect("All")}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline cursor-pointer"
                    >
                      Search in all categories
                    </button>
                  )}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-[#d43f10] bg-white px-3 py-1.5 rounded-xl border border-[#FF7A00]/30 shadow-sm transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear search</span>
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold font-display text-gray-900 mb-1">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your search query, price filter, or choose a different category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setActiveFilter("");
                    setSearchQuery("");
                    setMaxPrice(6000);
                    setOnlyInStock(false);
                    router.push("/products");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {filteredProducts.map((product) => {
                  const wishlisted = isInWishlist(product.id);
                  const discount =
                    product.mrp && product.price < product.mrp
                      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
                    >
                      <div>
                        {/* Image Frame */}
                        <Link
                          href={`/products/${product.slug || product.id}`}
                          className="relative block w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2 sm:mb-2.5"
                        >
                          <Image
                            src={product.poster_image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover object-bottom group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Discount Pill Badge */}
                          {discount > 0 && (
                            <span className="absolute top-2 left-2 bg-[#E53E3E] text-white text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                              -{discount}%
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => handleToggleWishlist(e, product)}
                            className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-xs transition-colors z-10 ${
                              wishlisted
                                ? "bg-rose-50 text-rose-500 shadow-xs"
                                : "bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white"
                            }`}
                            aria-label="Wishlist"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                wishlisted ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </Link>

                        {/* Category & Rating */}
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                          <span className="font-semibold uppercase tracking-wider text-[#FF7A00] truncate max-w-[65%]">
                            {product.category}
                          </span>
                          {product.rating && (
                            <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="font-bold text-[10px] sm:text-[11px] text-gray-600">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <Link
                          href={`/products/${product.slug || product.id}`}
                          className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF7A00] transition-colors leading-snug mb-1.5 min-h-[32px] sm:min-h-[36px]"
                        >
                          {product.name}
                        </Link>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1">
                          <span className="text-sm sm:text-base font-extrabold text-[#111111]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Save Discount Percentage (Matching reference image) */}
                        {discount > 0 ? (
                          <div className="text-[11px] sm:text-xs font-bold text-[#E53935] mb-2.5">
                            Save {discount}%
                          </div>
                        ) : (
                          <div className="h-4 mb-1" />
                        )}
                      </div>

                      {/* Dual Action Buttons or Out of Stock label */}
                      {product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0) ? (
                        <div className="mt-auto pt-1">
                          <div className="w-full py-2 px-2 rounded-xl bg-gray-100 text-gray-400 text-xs sm:text-[13px] font-extrabold text-center border border-gray-200 select-none uppercase tracking-wide">
                            Out of Stock
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto pt-1">
                          <button
                            type="button"
                            onClick={(e) => handleBuyNow(e, product)}
                            className="w-full py-2 px-1.5 sm:px-2 rounded-xl border border-gray-900 bg-white hover:bg-gray-900 hover:text-white active:scale-95 text-gray-900 text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center text-center cursor-pointer"
                          >
                            Buy now
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="w-full py-2 px-1.5 sm:px-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] active:scale-95 text-white text-xs sm:text-[13px] font-bold transition-all shadow-xs flex items-center justify-center text-center cursor-pointer"
                          >
                            Add to cart
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div data-lenis-prevent className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              data-lenis-prevent
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative ml-auto w-4/5 max-w-sm bg-white h-full z-10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto overscroll-contain"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#FF7A00]" />
                    <h3 className="font-display font-bold text-lg text-[#2D3436]">Filters</h3>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Filter */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-[#2D3436]">Price Range</h4>
                  <div className="flex justify-between text-xs font-semibold text-[#636E72]">
                    <span>₹0</span>
                    <span className="text-[#FF7A00]">Up to ₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="6000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#FF7A00] cursor-pointer"
                  />
                </div>

                {/* Availability */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-sm text-[#2D3436]">Availability</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF7A00] accent-[#FF7A00]"
                    />
                    <span className="text-xs font-medium text-[#2D3436]">In-Stock Items Only</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#FF7A00] text-white text-sm font-bold shadow-md shadow-[#FF7A00]/25 cursor-pointer"
                >
                  Apply Filters ({filteredProducts.length} items)
                </button>
                <button
                  onClick={() => {
                    setMaxPrice(6000);
                    setOnlyInStock(false);
                    setSelectedCategory("All");
                    setActiveFilter("");
                    setMobileFilterOpen(false);
                    router.push("/products");
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 font-semibold hover:text-gray-800 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
