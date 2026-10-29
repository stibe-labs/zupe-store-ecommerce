"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Box,
  Plus,
  Search,
  Tag,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Palette,
  Image as ImageIcon,
  Sparkles,
  ListPlus,
  Check,
  Star,
  Info,
  Upload,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Move,
  Truck,
  HelpCircle,
  Eye,
  Monitor,
  Smartphone,
  Video,
} from "lucide-react";
import {
  Product,
  ProductColorVariant,
  BuyMoreSaveMoreConfig,
  BuyMoreSaveMoreTier,
  ProductOverviewBlock,
  HowToUseStep,
  HowToUseConfig,
  HowToUseMediaType,
  HowToUseMediaFit,
  HowToUseSectionBg,
  HowToUseCardRadius,
  HowToUseCardBorder,
  HowToUseCardShadow,
} from "@/types/product";
import { DEFAULT_PRODUCTS, getSubcategoriesForCategory } from "@/data/zupeProducts";
import { HowToUseSection } from "@/components/HowToUseSection";
import { ProductVideo } from "@/lib/videoStore";

// Exact Category & Subcategory taxonomy from official catalog structure
const PRODUCT_CATEGORIES_DATA = [
  {
    main: "Tech & Gadgets",
    subcategories: [
      "Mobile & Charging",
      "Smart Tech & Audio",
      "Gaming",
      "Computer & Accessories",
    ],
  },
  {
    main: "Home Essentials",
    subcategories: [
      "Kitchen & Dining",
      "Cleaning & Organization",
      "Home Comfort & Utility",
    ],
  },
  {
    main: "Personal Care",
    subcategories: [
      "Grooming & Care",
      "Massage & Wellness",
      "Women's Care",
    ],
  },
  {
    main: "Auto Essentials",
    subcategories: [
      "Car Care",
      "Car Accessories",
    ],
  },
  {
    main: "Fitness & Wellness",
    subcategories: [
      "Fitness Accessories",
      "Recovery & Wellness",
    ],
  },
  {
    main: "Kids & Fun",
    subcategories: [
      "Toys & Games",
      "Fun & Entertainment",
    ],
  },
  {
    main: "Deals & Offers",
    subcategories: [
      "Curated sale products only",
    ],
  },
] as const;

const FORM_TABS_LIST = [
  "basic",
  "pricing",
  "media",
  "colors",
  "overview",
  "specs",
  "how_to_use",
  "action_videos",
] as const;

type FormTabKey = (typeof FORM_TABS_LIST)[number];

const DEFAULT_BUNDLE_TIERS: BuyMoreSaveMoreConfig = {
  enabled: true,
  headerTitle: "Buy More Save More",
  tiers: [
    { qty: 1, badge: "BEST PRICE", discountPercent: 0, tagText: "", enabled: true },
    { qty: 2, badge: "MOST POPULAR", discountPercent: 15, tagText: "Extra 15% OFF", enabled: true },
    { qty: 3, badge: "BEST DEAL", discountPercent: 25, tagText: "Extra 25% OFF", enabled: true },
  ],
};

export default function AdminProductsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const isFiltered =
    search.trim() !== "" || categoryFilter !== "all" || stockFilter !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
  };

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Lock body & html scroll completely when any modal is open
  useEffect(() => {
    if (showModal || deleteConfirmProduct) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [showModal, deleteConfirmProduct]);

  // Tab state in Edit/Add Modal
  const [activeTab, setActiveTab] = useState<FormTabKey>("basic");

  // Form states:
  // Tab 1: Basic
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Home Essentials");
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Tab 2: Pricing & Stock
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formStock, setFormStock] = useState("50");
  const [formInStock, setFormInStock] = useState(true);
  const [formBundleTiers, setFormBundleTiers] = useState<BuyMoreSaveMoreConfig>(DEFAULT_BUNDLE_TIERS);

  // Buy More Save More helpers
  const updateBundleTier = (idx: number, field: keyof BuyMoreSaveMoreTier, value: any) => {
    setFormBundleTiers((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === idx ? { ...t, [field]: value } : t)),
    }));
  };

  const addBundleTier = () => {
    setFormBundleTiers((prev) => {
      const currentTiers = prev.tiers || [];
      const lastTier = currentTiers[currentTiers.length - 1];
      const nextQty = (lastTier?.qty || currentTiers.length) + 1;
      const nextDiscount = Math.min(50, (lastTier?.discountPercent || 25) + 5);
      return {
        ...prev,
        tiers: [
          ...currentTiers,
          {
            qty: nextQty,
            badge: `BUY ${nextQty} VALUE`,
            discountPercent: nextDiscount,
            tagText: `Extra ${nextDiscount}% OFF`,
            enabled: true,
          },
        ],
      };
    });
  };

  const removeBundleTier = (idx: number) => {
    setFormBundleTiers((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== idx),
    }));
  };

  const resetDefaultBundleTiers = () => {
    setFormBundleTiers(JSON.parse(JSON.stringify(DEFAULT_BUNDLE_TIERS)));
  };

  // Tab 3: Colors & Multi-Angle Photos
  const [formColors, setFormColors] = useState<ProductColorVariant[]>([]);
  const [formHasColors, setFormHasColors] = useState<boolean>(true);

  // Tab 4: Media
  const [formImage, setFormImage] = useState("");
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState("");
  const [draggedGalleryIdx, setDraggedGalleryIdx] = useState<number | null>(null);
  const [dragOverGalleryIdx, setDragOverGalleryIdx] = useState<number | null>(null);
  const [draggedAngleKey, setDraggedAngleKey] = useState<string | null>(null);
  const [dragOverAngleKey, setDragOverAngleKey] = useState<string | null>(null);

  // Tab 5: Product Details & Overview (Dynamic Long-Form Visual Story Blocks)
  const [formOverviewBlocks, setFormOverviewBlocks] = useState<ProductOverviewBlock[]>([]);

  // Tab 6: Highlights ("Why You'll Love This ❤️")
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Tab 6: Specs & Box
  const [formVolume, setFormVolume] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formSpecs, setFormSpecs] = useState<{ key: string; val: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");
  const [formWhatsInBox, setFormWhatsInBox] = useState<string[]>([]);
  const [newBoxInput, setNewBoxInput] = useState("");

  // Tab 8: How to Use Configuration State
  const [formHowToUseEnabled, setFormHowToUseEnabled] = useState<boolean>(true);
  const [formHowToUseSectionBg, setFormHowToUseSectionBg] = useState<HowToUseSectionBg>("white");
  const [formHowToUseCardRadius, setFormHowToUseCardRadius] = useState<HowToUseCardRadius>("rounded-2xl");
  const [formHowToUseCardBorder, setFormHowToUseCardBorder] = useState<HowToUseCardBorder>("subtle");
  const [formHowToUseCardShadow, setFormHowToUseCardShadow] = useState<HowToUseCardShadow>("sm");
  const [formHowToUseSteps, setFormHowToUseSteps] = useState<HowToUseStep[]>([]);
  const [howToUsePreviewMode, setHowToUsePreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [mediaLibraryModalOpen, setMediaLibraryModalOpen] = useState<boolean>(false);
  const [mediaLibraryTargetStepId, setMediaLibraryTargetStepId] = useState<string | null>(null);
  const [emptyStepWarningModal, setEmptyStepWarningModal] = useState<{
    open: boolean;
    stepIndex: number;
    stepId: string;
  } | null>(null);

  // Tab 8: Action Videos (See It in Action)
  const [formVideoIds, setFormVideoIds] = useState<string[]>([]);
  const [availableVideos, setAvailableVideos] = useState<ProductVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [videoSearchTerm, setVideoSearchTerm] = useState<string>("");
  const [videoPreviewItem, setVideoPreviewItem] = useState<ProductVideo | null>(null);

  const fetchAvailableVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch(`/api/admin/videos?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          setAvailableVideos(data.videos);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch available videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Social Proof:
  const [formRating, setFormRating] = useState("4.8");
  const [formReviewCount, setFormReviewCount] = useState("120");
  const [formSoldCount, setFormSoldCount] = useState("1,250+ verified orders");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/products?_t=" + Date.now());
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleStockStatus = async (prod: Product) => {
    const newInStock = prod.in_stock === 1 ? 0 : 1;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, in_stock: newInStock } : p))
    );
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prod.id,
          in_stock: newInStock,
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
      } else {
        fetchProducts();
      }
    } catch (err) {
      fetchProducts();
    }
  };

  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchAvailableVideos();
    fetch("/api/content/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setDynamicCategories(data.categories.filter((c: any) => c.active !== false));
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic categories in admin products:", err));
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setActiveTab("basic");
    setFormName("");
    setFormSubtitle("");
    setFormSlug("");
    setFormCategory("Home & Living");
    setFormSubcategory("Home Comfort & Utility");
    setFormBadge("");
    setFormTagline("");
    setFormDescription("");

    setFormPrice("");
    setFormMrp("");
    setFormCost("");
    setFormStock("50");
    setFormInStock(true);
    setFormBundleTiers(JSON.parse(JSON.stringify(DEFAULT_BUNDLE_TIERS)));

    setFormHasColors(true);
    setFormColors([
      {
        name: "Standard",
        colorHex: "#3B82F6",
        image: "",
        images: [],
      },
    ]);

    setFormImage("");
    setFormGalleryImages([]);
    setNewGalleryInput("");
    setFormOverviewBlocks([]);

    setFormFeatures([
      "Premium Quality Build & Finish",
      "Fast & Intuitive Operation",
      "Ergonomic Compact Design",
      "Verified Authentic Zupe Original",
    ]);
    setNewFeatureInput("");

    setFormVolume("");
    setFormMaterial("");
    setFormSpecs([]);
    setNewSpecKey("");
    setNewSpecVal("");

    setFormWhatsInBox([
      "1 × Main Product Unit",
      "1 × Official User Manual & Operating Guide",
      "1 × Turkiye Jam Quality Verification & Warranty Seal",
    ]);
    setNewBoxInput("");

    setFormRating("4.8");
    setFormReviewCount("120");
    setFormSoldCount("1,250+ verified orders");

    setFormHowToUseEnabled(true);
    setFormHowToUseSectionBg("white");
    setFormHowToUseCardRadius("rounded-2xl");
    setFormHowToUseCardBorder("subtle");
    setFormHowToUseCardShadow("sm");
    setFormHowToUseSteps([
      {
        id: `step-1-${Date.now()}`,
        media_type: "image",
        media_url: "",
        media_fit: "contain",
        title: "",
        description: "",
      },
    ]);
    setEmptyStepWarningModal(null);
    setFormVideoIds([]);
    setVideoSearchTerm("");
    fetchAvailableVideos();

    setActionMessage(null);
    setShowModal(true);
  };

  const openEditModal = (prod: Product) => {
    const cost =
      prod.cost_price !== undefined ? prod.cost_price : Math.round(prod.price * 0.42);

    setEditingProduct(prod);
    setActiveTab("basic");

    setFormName(prod.name || "");
    setFormSubtitle(prod.subtitle || "");
    setFormSlug(prod.slug || "");
    setFormCategory(prod.category || "Home & Living");
    setFormSubcategory(prod.subcategory || "");
    setFormBadge(prod.badge || "");
    setFormTagline(prod.tagline || "");
    setFormDescription(prod.description || "");

    setFormPrice(String(prod.price || ""));
    setFormMrp(String(prod.mrp || prod.price || ""));
    setFormCost(String(cost));
    setFormStock(String(prod.stock_count || 0));
    setFormInStock(prod.in_stock === 1);
    if (prod.bundle_tiers && Array.isArray(prod.bundle_tiers.tiers) && prod.bundle_tiers.tiers.length > 0) {
      setFormBundleTiers({
        enabled: prod.bundle_tiers.enabled !== false,
        headerTitle: prod.bundle_tiers.headerTitle || "Buy More Save More",
        tiers: JSON.parse(JSON.stringify(prod.bundle_tiers.tiers)),
      });
    } else {
      setFormBundleTiers(JSON.parse(JSON.stringify(DEFAULT_BUNDLE_TIERS)));
    }

    // Deep clone colors and evaluate whether colors are active
    const hasColorsConfigured =
      prod.has_colors !== undefined
        ? Boolean(prod.has_colors)
        : Boolean(
            prod.colors &&
              Array.isArray(prod.colors) &&
              prod.colors.length > 0 &&
              !(
                prod.colors.length === 1 &&
                prod.colors[0].name.toLowerCase() === "standard" &&
                (!prod.colors[0].images || prod.colors[0].images.length <= 1)
              )
          );
    setFormHasColors(hasColorsConfigured);

    const isIron = prod.id === "mini-portable-steam-iron" || prod.slug?.includes("iron");
    const posterImg = prod.poster_image?.trim() || "";
    const cleanGalleryImages = (Array.isArray(prod.images) ? prod.images : []).filter((img) => {
      if (!isIron && typeof img === "string" && (img.includes("steam-iron") || img.includes("/products/iron/"))) {
        return false;
      }
      return Boolean(img);
    });

    setFormColors(
      prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0
        ? JSON.parse(JSON.stringify(prod.colors)).map((c: any) => {
            if (!isIron && c && typeof c === "object") {
              const cImgs = Array.isArray(c.images)
                ? c.images.filter((img: string) => typeof img === "string" && !img.includes("steam-iron") && !img.includes("/products/iron/"))
                : [];
              return {
                ...c,
                images: cImgs.length > 0 ? cImgs : (posterImg ? [posterImg] : []),
              };
            }
            return c;
          })
        : [
            {
              name: prod.color || "Standard",
              colorHex: "#3B82F6",
              image: posterImg || "",
              images: posterImg ? [posterImg] : [],
            },
          ]
    );

    setFormImage(posterImg);
    const initialGallery = cleanGalleryImages.filter((img) => img !== posterImg);
    if (posterImg) {
      initialGallery.unshift(posterImg);
    }
    setFormGalleryImages(initialGallery);
    setNewGalleryInput("");

    if (prod.overview_blocks && Array.isArray(prod.overview_blocks) && prod.overview_blocks.length > 0) {
      setFormOverviewBlocks(JSON.parse(JSON.stringify(prod.overview_blocks)));
    } else if (prod.description && prod.description.trim()) {
      setFormOverviewBlocks([
        {
          id: `block-${Date.now()}`,
          heading: prod.name ? `${prod.name} – Overview` : "Product Details & Overview",
          details: prod.description.trim(),
          media_url: posterImg || "",
        },
      ]);
    } else {
      setFormOverviewBlocks([]);
    }

    let initialFeatures: string[] = [];
    if (prod.features && Array.isArray(prod.features) && prod.features.length > 0) {
      initialFeatures = [...prod.features];
    } else {
      const idL = (prod.id || "").toLowerCase();
      const slugL = (prod.slug || "").toLowerCase();
      if (idL.includes("heating-pad") || slugL.includes("heating-pad")) {
        initialFeatures = [
          "3 Fast Heat Modes (45-65°C)",
          "4 Vibration Massage Modes",
          "Skin-Friendly Plush Velvet",
          "Wireless USB Rechargeable",
        ];
      } else if (idL.includes("ripple") || slugL.includes("ripple")) {
        initialFeatures = [
          "Dynamic Water Wave Ripple",
          "16 RGB Colors + Remote",
          "Ambient Bedside Lighting",
          "Touch & Wireless Control",
        ];
      } else if (idL.includes("iron") || slugL.includes("iron")) {
        initialFeatures = [
          "30s Rapid Heat-Up",
          "Dual Wet & Dry Ironing",
          "180° Foldable Travel Body",
          "Anti-Burn Ceramic Plate",
        ];
      } else if (idL.includes("helicopter") || slugL.includes("helicopter")) {
        initialFeatures = [
          "Solar Auto-Rotating Propeller",
          "360° All-Around Fragrance",
          "Natural Plant Essential Oils",
          "No Battery or Wire Needed",
        ];
      } else if (idL.includes("nebulizer") || slugL.includes("nebulizer")) {
        initialFeatures = [
          "Ultra-Fine <5µm Cool Mist",
          "Silent <25dB Quiet Operation",
          "Child & Adult Masks Included",
          "Dual Battery / USB Power",
        ];
      } else if (idL.includes("washing") || slugL.includes("washer")) {
        initialFeatures = [
          "Forward/Reverse Sonic Wash",
          "8L Capacity + Drain Basket",
          "Collapsible Foldable Body",
          "3 Smart Timer Programs",
        ];
      } else if (idL.includes("printer") || slugL.includes("printer")) {
        initialFeatures = [
          "Zero Ink Thermal Printing",
          "Instant Bluetooth Mobile App",
          "1000mAh Rechargeable Battery",
          "Prints Labels, Notes & Photos",
        ];
      } else {
        initialFeatures = [
          prod.tagline || "Premium Quality Build & Finish",
          prod.volume || "Fast & Intuitive Operation",
          "Ergonomic Compact Design",
          "Verified Authentic Zupe Original",
        ];
      }
    }
    setFormFeatures(initialFeatures);
    setNewFeatureInput("");

    setFormVolume(prod.volume || "");
    setFormMaterial(prod.material || "");
    setFormSpecs(
      prod.specifications && typeof prod.specifications === "object"
        ? Object.entries(prod.specifications).map(([key, val]) => ({
            key,
            val: String(val),
          }))
        : []
    );
    setNewSpecKey("");
    setNewSpecVal("");

    setFormWhatsInBox(
      prod.whats_in_box && Array.isArray(prod.whats_in_box)
        ? [...prod.whats_in_box]
        : []
    );
    setNewBoxInput("");

    setFormRating(String(prod.rating ?? 4.8));
    setFormReviewCount(String(prod.review_count ?? 120));
    setFormSoldCount(prod.sold_count || "1,250+ verified orders");

    if (prod.how_to_use) {
      setFormHowToUseEnabled(prod.how_to_use.enabled !== false);
      setFormHowToUseSectionBg(prod.how_to_use.section_bg || "white");
      setFormHowToUseCardRadius(prod.how_to_use.card_radius || "rounded-2xl");
      setFormHowToUseCardBorder(prod.how_to_use.card_border || "subtle");
      setFormHowToUseCardShadow(prod.how_to_use.card_shadow || "sm");
      setFormHowToUseSteps(
        Array.isArray(prod.how_to_use.steps)
          ? JSON.parse(JSON.stringify(prod.how_to_use.steps))
          : []
      );
    } else {
      setFormHowToUseEnabled(true);
      setFormHowToUseSectionBg("white");
      setFormHowToUseCardRadius("rounded-2xl");
      setFormHowToUseCardBorder("subtle");
      setFormHowToUseCardShadow("sm");
      setFormHowToUseSteps([]);
    }
    setEmptyStepWarningModal(null);
    if (prod.video_ids && Array.isArray(prod.video_ids)) {
      setFormVideoIds([...prod.video_ids]);
    } else {
      const normId = (prod.id || "").toLowerCase().trim();
      const normSlug = (prod.slug || "").toLowerCase().trim();
      const matched = availableVideos
        .filter((v) => {
          const vPid = (v.productId || "").toLowerCase().trim();
          return vPid && (vPid === normId || vPid === normSlug);
        })
        .map((v) => v.id);
      setFormVideoIds(matched);
    }
    setVideoSearchTerm("");
    fetchAvailableVideos();

    setActionMessage(null);
    setShowModal(true);
  };

  // Local File Upload Helper (converts to base64 Data URL or path)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSuccess(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Color Variant Manipulation Helpers
  const addColorVariant = () => {
    setFormColors((prev) => [
      ...prev,
      {
        name: `Color ${prev.length + 1}`,
        colorHex: "#10B981",
        image: formImage || "",
        images: formImage ? [formImage] : [],
      },
    ]);
  };

  // Tab 5: Overview Blocks manipulation helpers
  const addOverviewBlock = (mediaOnly = false) => {
    const newBlock: ProductOverviewBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      heading: mediaOnly ? "" : "",
      details: mediaOnly ? "" : "",
      media_url: "",
      media_caption: "",
    };
    setFormOverviewBlocks((prev) => [...prev, newBlock]);
  };

  const updateOverviewBlock = (id: string, field: keyof ProductOverviewBlock, val: string) => {
    setFormOverviewBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  const removeOverviewBlock = (id: string) => {
    setFormOverviewBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveOverviewBlock = (id: string, direction: "up" | "down") => {
    setFormOverviewBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  // Step-by-Step wizard navigation helpers
  const handleNextTab = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActionMessage(null);
    if (activeTab === "basic") {
      if (!formName.trim()) {
        setActionMessage({
          text: "Please enter a Product Name before proceeding to the next step.",
          type: "error",
        });
        return;
      }
      setActiveTab("pricing");
    } else if (activeTab === "pricing") {
      if (!formPrice.trim()) {
        setActionMessage({
          text: "Please enter a Selling Price before proceeding to the next step.",
          type: "error",
        });
        return;
      }
      setActiveTab("media");
    } else if (activeTab === "media") {
      setActiveTab("colors");
    } else if (activeTab === "colors") {
      setActiveTab("overview");
    } else if (activeTab === "overview") {
      setActiveTab("specs");
    } else if (activeTab === "specs") {
      setActiveTab("how_to_use");
    }

    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
  };

  // Tab 8: How to Use manipulation helpers
  const handleStepMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    stepId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType: HowToUseMediaType = "image";
    if (file.type.startsWith("video/")) {
      detectedType = "video";
    } else if (file.type === "image/gif") {
      detectedType = "gif";
    }
    updateHowToUseStep(stepId, "media_type", detectedType);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateHowToUseStep(stepId, "media_url", dataUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", detectedType === "video" ? "videos" : "images");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        updateHowToUseStep(stepId, "media_url", data.url);
      }
    } catch (err) {
      console.warn("Upload to R2 fallback to local dataURL:", err);
    }
    e.target.value = "";
  };

  const addHowToUseStep = () => {
    const newStep: HowToUseStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      media_type: "image",
      media_url: "",
      media_fit: "contain",
      title: "",
      description: "",
    };
    setFormHowToUseSteps((prev) => [...prev, newStep]);
  };

  const updateHowToUseStep = (id: string, field: keyof HowToUseStep, val: any) => {
    setFormHowToUseSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const removeHowToUseStep = (id: string) => {
    setFormHowToUseSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const moveHowToUseStep = (id: string, direction: "up" | "down") => {
    setFormHowToUseSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  const handlePrevTab = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActionMessage(null);
    const currentIndex = FORM_TABS_LIST.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(FORM_TABS_LIST[currentIndex - 1]);
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    }
  };

  const removeColorVariant = (idx: number) => {
    setFormColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateColorField = (idx: number, field: string, value: any) => {
    setFormColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addAnglePhotoToColor = (colorIdx: number, photoUrl: string) => {
    if (!photoUrl.trim()) return;
    setFormColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIdx) return c;
        const currentImgs = Array.isArray(c.images) ? c.images : [];
        return {
          ...c,
          images: [...currentImgs, photoUrl.trim()],
        };
      })
    );
  };

  const removeAnglePhotoFromColor = (colorIdx: number, photoIdx: number) => {
    setFormColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIdx) return c;
        const currentImgs = Array.isArray(c.images) ? c.images : [];
        return {
          ...c,
          images: currentImgs.filter((_, pi) => pi !== photoIdx),
        };
      })
    );
  };

  // Feature (Highlights / 4 Key Points) manipulation helpers - Fully editable
  const updateFeature = (idx: number, val: string) => {
    setFormFeatures((prev) => prev.map((f, i) => (i === idx ? val : f)));
  };

  const updateFeatureSlot = (slotIdx: number, val: string) => {
    setFormFeatures((prev) => {
      const copy = [...prev];
      while (copy.length <= slotIdx) {
        copy.push("");
      }
      copy[slotIdx] = val;
      return copy;
    });
  };

  const applyPresetPoints = (pts: string[]) => {
    setFormFeatures([...pts]);
    setActionMessage({
      type: "success",
      text: "4 Key Highlight Points preset loaded successfully!",
    });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const addFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormFeatures((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    setFormFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  // Specs manipulation helpers - Fully editable key and value
  const updateSpecKey = (idx: number, key: string) => {
    setFormSpecs((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, key } : s))
    );
  };

  const updateSpecVal = (idx: number, val: string) => {
    setFormSpecs((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, val } : s))
    );
  };

  const addSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setFormSpecs((prev) => [...prev, { key: newSpecKey.trim(), val: newSpecVal.trim() }]);
    setNewSpecKey("");
    setNewSpecVal("");
  };

  const removeSpec = (idx: number) => {
    setFormSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  // What's in the Box helpers - Fully editable
  const updateBoxItem = (idx: number, val: string) => {
    setFormWhatsInBox((prev) => prev.map((b, i) => (i === idx ? val : b)));
  };

  const addBoxItem = () => {
    if (!newBoxInput.trim()) return;
    setFormWhatsInBox((prev) => [...prev, newBoxInput.trim()]);
    setNewBoxInput("");
  };

  const removeBoxItem = (idx: number) => {
    setFormWhatsInBox((prev) => prev.filter((_, i) => i !== idx));
  };

  // Gallery image helpers
  const addGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    setFormGalleryImages((prev) => [...prev, newGalleryInput.trim()]);
    setNewGalleryInput("");
  };

  const removeGalleryImage = (idx: number) => {
    setFormGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const reorderGalleryImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setFormGalleryImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const reorderAnglePhoto = (colorIndex: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setFormColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIndex) return c;
        const currentImgs = Array.isArray(c.images) ? [...c.images] : [];
        const [moved] = currentImgs.splice(fromIndex, 1);
        currentImgs.splice(toIndex, 0, moved);
        return {
          ...c,
          images: currentImgs,
        };
      })
    );
  };

  const handleSaveProduct = async (
    e?: React.FormEvent | React.MouseEvent,
    skipEmptyStepWarning = false
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formName.trim()) {
      setActiveTab("basic");
      setActionMessage({ text: "Product Name is required", type: "error" });
      return;
    }
    if (!formPrice) {
      setActiveTab("pricing");
      setActionMessage({ text: "Selling Price is required", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setActionMessage(null);

    const priceNum = Number(formPrice) || 0;
    const mrpNum = Number(formMrp) || priceNum;
    const costNum = formCost ? Number(formCost) : Math.round(priceNum * 0.42);
    const stockNum = Number(formStock) || 0;

    const specsObj: Record<string, string> = {};
    formSpecs.forEach((s) => {
      if (s.key.trim()) {
        specsObj[s.key.trim()] = s.val.trim();
      }
    });

    const generatedSlug =
      (formSlug.trim()
        ? formSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        : "") ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const posterImg =
      formImage.trim() ||
      formColors[0]?.image ||
      formColors[0]?.images?.[0] ||
      "";

    const isIron =
      editingProduct?.id === "mini-portable-steam-iron" ||
      editingProduct?.slug?.includes("iron") ||
      generatedSlug.includes("iron");

    const cleanGallery = formGalleryImages.filter((img) => {
      if (!isIron && typeof img === "string" && (img.includes("steam-iron") || img.includes("/products/iron/"))) {
        return false;
      }
      return Boolean(img);
    });

    const galleryWithPoster =
      posterImg && !cleanGallery.includes(posterImg)
        ? [posterImg, ...cleanGallery]
        : cleanGallery;

    const finalImages =
      galleryWithPoster.length > 0
        ? galleryWithPoster
        : !formHasColors
        ? (posterImg ? [posterImg] : [])
        : formColors[0]?.images && formColors[0].images.length > 0
        ? formColors[0].images.filter((img: string) => (!isIron ? (!img.includes("steam-iron") && !img.includes("/products/iron/")) : true))
        : posterImg
        ? [posterImg]
        : [];

    const cleanColors = formColors.map((c: any) => {
      if (!isIron && c && typeof c === "object") {
        const cImgs = Array.isArray(c.images)
          ? c.images.filter((img: string) => typeof img === "string" && !img.includes("steam-iron") && !img.includes("/products/iron/"))
          : [];
        return {
          ...c,
          images: cImgs.length > 0 ? cImgs : (posterImg ? [posterImg] : []),
        };
      }
      return c;
    });

    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      slug: generatedSlug,
      name: formName.trim(),
      subtitle: formSubtitle.trim(),
      category: formCategory.trim(),
      subcategory: formSubcategory.trim(),
      badge: formBadge,
      tagline: formTagline.trim(),
      description: formDescription.trim(),
      price: priceNum,
      mrp: mrpNum,
      offer_price: priceNum,
      cost_price: costNum,
      stock_count: stockNum,
      in_stock: formInStock ? 1 : 0,
      poster_image: posterImg,
      images: finalImages,
      has_colors: formHasColors,
      color: formHasColors ? (formColors[0]?.name || "") : "",
      colors: cleanColors,
      overview_blocks: formOverviewBlocks.filter(
        (b) => b.heading?.trim() || b.details?.trim() || b.media_url?.trim()
      ),
      volume: formVolume.trim(),
      material: formMaterial.trim(),
      features: formFeatures.filter(Boolean),
      specifications: Object.keys(specsObj).length > 0 ? specsObj : undefined,
      whats_in_box: formWhatsInBox.filter(Boolean),
      bundle_tiers: formBundleTiers,
      how_to_use: {
        enabled: formHowToUseEnabled,
        section_bg: formHowToUseSectionBg,
        card_radius: formHowToUseCardRadius,
        card_border: formHowToUseCardBorder,
        card_shadow: formHowToUseCardShadow,
        steps: formHowToUseSteps,
      },
      video_ids: formVideoIds,
    };

    // Pre-publish empty-step warning (Specification §10)
    if (formHowToUseEnabled && formHowToUseSteps.length > 0 && !skipEmptyStepWarning) {
      const emptyIdx = formHowToUseSteps.findIndex(
        (s) => !s.media_url?.trim() && !s.title?.trim() && !s.description?.trim()
      );
      if (emptyIdx !== -1) {
        setEmptyStepWarningModal({
          open: true,
          stepIndex: emptyIdx + 1,
          stepId: formHowToUseSteps[emptyIdx].id,
        });
        return;
      }
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.product) {
        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) => (p.id === data.product.id ? data.product : p))
          );
        } else {
          setProducts((prev) => [data.product, ...prev]);
        }
        setActionMessage({
          text: `Product "${data.product.name}" successfully saved and synchronized to store!`,
          type: "success",
        });
        setTimeout(() => {
          setShowModal(false);
          setEditingProduct(null);
        }, 900);
      } else {
        setActionMessage({ text: data.error || "Save failed", type: "error" });
      }
    } catch (err: any) {
      setActionMessage({
        text: err.message || "Failed to save product",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(prodId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== prodId));
        setDeleteConfirmProduct(null);
      }
    } catch (err) {
      console.warn("Error deleting product:", err);
    }
  };

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Filtered products
  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (stockFilter === "in_stock" && p.in_stock !== 1) return false;
    if (stockFilter === "out_of_stock" && p.in_stock === 1) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.tagline && p.tagline.toLowerCase().includes(s)) ||
        (p.slug && p.slug.toLowerCase().includes(s))
      );
    }
    return true;
  });

  // KPI calculations
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock_count) || 0), 0);
  const totalCatalogValue = products.reduce(
    (sum, p) => sum + (Number(p.stock_count) || 0) * (Number(p.price) || 0),
    0
  );
  const totalCapitalInvested = products.reduce(
    (sum, p) =>
      sum +
      (Number(p.stock_count) || 0) *
        (p.cost_price !== undefined
          ? Number(p.cost_price)
          : Math.round(Number(p.price) * 0.42)),
    0
  );
  const avgMargin =
    totalCatalogValue > 0
      ? (
          ((totalCatalogValue - totalCapitalInvested) / totalCatalogValue) *
          100
        ).toFixed(1)
      : "58.0";

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={fetchProducts}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Products & Multi-Angle Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Edit all details of live products, create new entries, configure color variants with multiple angle photos, and manage pricing & stock.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-orange-500/25 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Catalog KPI Cards */}
          {/* Catalog KPI Cards: 2 per row on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Total Products
              </span>
              <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2 tracking-tight truncate">
                {totalProducts}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
                {totalUnits.toLocaleString("en-IN")} units in stock
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Retail Value
              </span>
              <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2 tracking-tight truncate">
                ₹{totalCatalogValue.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
                At selling prices
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Capital (COGS)
              </span>
              <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2 tracking-tight truncate">
                ₹{totalCapitalInvested.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
                Capital tied in stock
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Gross Margin
              </span>
              <p className="text-lg sm:text-3xl font-bold text-emerald-600 mt-1 sm:mt-2 tracking-tight truncate">
                {avgMargin}%
              </p>
              <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
                Active catalog avg
              </span>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, category, or slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] focus:outline-none"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!isFiltered}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isFiltered
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer shadow-xs"
                    : "bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60"
                }`}
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === "all"
                    ? "bg-[#FF7A00] text-white shadow-sm shadow-orange-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? "bg-[#FF7A00] text-white shadow-sm shadow-orange-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] sm:text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Product & Visuals</th>
                    <th className="py-3.5 px-4">Colors & Angles</th>
                    <th className="py-3.5 px-4">Price & MRP</th>
                    <th className="py-3.5 px-4">Supplier Cost</th>
                    <th className="py-3.5 px-4">Margin</th>
                    <th className="py-3.5 px-4">Stock Status (Toggle)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertTriangle className="w-7 h-7 text-slate-300" />
                          <p className="font-semibold text-slate-800 text-sm">
                            No products match your search or filter
                          </p>
                          <p className="text-xs text-slate-400">
                            Try changing category, stock status, or clearing the search query.
                          </p>
                          {isFiltered && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-xs transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Filters</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((prod) => {
                      const cost =
                        prod.cost_price !== undefined
                          ? prod.cost_price
                          : Math.round(prod.price * 0.42);
                      const marginAmount = prod.price - cost;
                      const marginPercent =
                        prod.price > 0 ? ((marginAmount / prod.price) * 100).toFixed(0) : "0";

                      const colorCount = prod.colors?.length || 0;
                      const totalPhotosCount =
                        prod.colors && prod.colors.length > 0
                          ? prod.colors.reduce((acc, c) => acc + (c.images?.length || 1), 0)
                          : prod.images?.length || 1;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Product & Visuals */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {prod.poster_image ? (
                                <img
                                  src={prod.poster_image}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                                  onError={(e) => {
                                    (e.target as any).src =
                                      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <ImageIcon className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                                    {prod.name}
                                  </span>
                                  {prod.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span className="font-medium text-slate-600">
                                    {prod.category}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-400 text-[10px]">
                                    /{prod.slug}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Colors & Angles */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {prod.has_colors !== false && prod.colors && prod.colors.length > 0 ? (
                                <>
                                  <div className="flex items-center -space-x-1.5">
                                    {prod.colors.slice(0, 4).map((c, i) => (
                                      <span
                                        key={i}
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-xs"
                                        style={{ backgroundColor: c.colorHex || "#CBD5E1" }}
                                        title={`${c.name} (${c.images?.length || 1} photos)`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-600 ml-1">
                                    {colorCount} colors
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ({totalPhotosCount} photos)
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No color variants</span>
                              )}
                            </div>
                          </td>

                          {/* Price & MRP */}
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>₹{prod.price.toLocaleString("en-IN")}</div>
                            {prod.mrp && prod.mrp > prod.price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                ₹{prod.mrp.toLocaleString("en-IN")}
                              </div>
                            )}
                          </td>

                          {/* Supplier Cost */}
                          <td className="py-3.5 px-4 font-medium text-amber-700">
                            ₹{cost.toLocaleString("en-IN")}
                          </td>

                          {/* Margin */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              +{marginPercent}% (₹{marginAmount})
                            </span>
                          </td>

                          {/* Modern Toggle Switch for Stock Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={prod.in_stock === 1}
                                onClick={() => toggleStockStatus(prod)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  prod.in_stock === 1 ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                                title={prod.in_stock === 1 ? "Click to set Out of Stock" : "Click to set In Stock"}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                    prod.in_stock === 1 ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-xs font-semibold ${
                                  prod.in_stock === 1 ? "text-emerald-700" : "text-slate-400"
                                }`}
                              >
                                {prod.in_stock === 1
                                  ? `In Stock (${prod.stock_count || 0})`
                                  : "Out of Stock"}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={`/products/${prod.slug || prod.id}`}
                                target="_blank"
                                rel="noreferrer"
                                title="View Live Product Page"
                                className="p-1.5 text-slate-400 hover:text-[#FF7A00] rounded-lg hover:bg-orange-50 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => openEditModal(prod)}
                                title="Edit All Product Details"
                                className="p-1.5 text-slate-400 hover:text-[#FF7A00] rounded-lg hover:bg-orange-50 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmProduct(prod)}
                                title="Delete Product"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================
          FULL EDIT & ADD PRODUCT MODAL (FIXED SCROLL & PINNED FOOTER)
         ======================================================== */}
      {showModal && (
        <div
          data-lenis-prevent="true"
          onWheel={(e) => {
            e.stopPropagation();
            if (modalScrollRef.current && !modalScrollRef.current.contains(e.target as Node)) {
              modalScrollRef.current.scrollTop += e.deltaY;
            }
          }}
          style={{ overscrollBehavior: "contain", touchAction: "none" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
        >
          <form
            data-lenis-prevent="true"
            onSubmit={(e) => {
              e.preventDefault();
              if (activeTab === "specs") {
                handleSaveProduct(e);
              }
            }}
            onKeyDown={(e) => {
              // Prevent Enter key in inputs from accidentally submitting the form
              if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                const target = e.target as HTMLInputElement;
                if (target.id?.startsWith("angle-input")) {
                  return;
                }
                e.preventDefault();
              }
            }}
            onWheel={(e) => {
              e.stopPropagation();
              if (modalScrollRef.current && !modalScrollRef.current.contains(e.target as Node)) {
                modalScrollRef.current.scrollTop += e.deltaY;
              }
            }}
            style={{ overscrollBehavior: "contain" }}
            className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] max-h-[850px] flex flex-col min-h-0 shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* 1. Modal Header (shrink-0) */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center font-bold shrink-0">
                  {editingProduct ? <Edit2 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {editingProduct ? `Edit: ${editingProduct.name}` : "Create New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    All details update live on the storefront and sync directly to Cloudflare D1.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={(e) => handleSaveProduct(e)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg transition-all shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{isSubmitting ? "Saving..." : "Save"}</span>
                  </button>
                )}
                {editingProduct && (
                  <a
                    href={`/products/${editingProduct.slug ? editingProduct.slug.toLowerCase().replace(/[\s_]+/g, "-") : editingProduct.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF7A00] bg-orange-50 hover:bg-orange-100 rounded-lg transition-all"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Tab Navigation (shrink-0) */}
            <div className="flex items-center gap-1 px-4 sm:px-5 border-b border-slate-200 bg-slate-50/40 overflow-x-auto text-xs font-bold shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "basic"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>1. Basic Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "pricing"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>2. Pricing & Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "media"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Poster & Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("colors")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "colors"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>4. Colors & Photos {formHasColors ? `(${formColors.length})` : "(Off)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>5. Details & Overview ({formOverviewBlocks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "specs"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>6. Specs & Box</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("how_to_use")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "how_to_use"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>7. How to Use {formHowToUseEnabled ? `(${formHowToUseSteps.length})` : "(Off)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("action_videos")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "action_videos"
                    ? "border-[#FF7A00] text-[#FF7A00]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>8. Action Videos ({formVideoIds.length})</span>
              </button>
            </div>

            {/* Action Feedback Message */}
            {actionMessage && (
              <div
                className={`mx-5 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 ${
                  actionMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {actionMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* 3. Fully Scrollable Body (flex-1 min-h-0 overflow-y-auto) */}
            <div
              ref={modalScrollRef}
              data-lenis-prevent="true"
              onWheel={(e) => {
                e.stopPropagation();
              }}
              style={{
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
              }}
              className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm"
            >
              {/* ========================================================
                  TAB 1: BASIC INFO
                 ======================================================== */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Portable Menstrual Heating Pad"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Subtitle (Shown below Title)
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="e.g. Cordless Waist Relief"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="e.g. portable-menstrual-heating-pad"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Leave blank to auto-generate from Product Name.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formCategory}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setFormCategory(newCat);
                          const subs = getSubcategoriesForCategory(newCat, dynamicCategories);
                          if (subs.length > 0) {
                            setFormSubcategory(subs[0]);
                          } else {
                            setFormSubcategory("");
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] cursor-pointer"
                      >
                        <option value="" disabled>
                          Select Category...
                        </option>
                        {dynamicCategories.length > 0 && (
                          <optgroup label="── Store Customizer Categories ──">
                            {dynamicCategories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {PRODUCT_CATEGORIES_DATA.map((group) => (
                          <option key={group.main} value={group.main}>
                            {group.main}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Subcategory
                      </label>
                      <select
                        value={formSubcategory}
                        onChange={(e) => setFormSubcategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] cursor-pointer"
                      >
                        <option value="">None / General</option>
                        {getSubcategoriesForCategory(formCategory, dynamicCategories).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Short Tagline
                    </label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. Soothing warmth & multi-frequency massage"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    />
                  </div>

                  {/* 4 Feature Points (Reviews ↔ Price 2x2 Grid) */}
                  <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-orange-100 text-[#FF7A00]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            4 Key Highlight Points (Between Reviews &amp; Price)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Displayed on storefront in a 2x2 grid (2 points per row) on both mobile &amp; desktop.
                          </span>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium mr-0.5">Presets:</span>
                        <button
                          type="button"
                          onClick={() =>
                            applyPresetPoints([
                              "Premium Quality Build & Finish",
                              "Fast 3-Second Operation",
                              "Ergonomic Compact Design",
                              "Verified Authentic Zupe Original",
                            ])
                          }
                          className="px-2 py-0.5 text-[10px] bg-orange-100/70 hover:bg-orange-100 text-[#FF7A00] font-bold rounded-lg transition-colors cursor-pointer"
                          title="Load Default 4 Points"
                        >
                          Defaults
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyPresetPoints([
                              "Dynamic Water Wave Ripple",
                              "16 RGB Colors + Remote",
                              "Ambient Bedside Lighting",
                              "Touch & Wireless Control",
                            ])
                          }
                          className="px-2 py-0.5 text-[10px] bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Load Ripple Lamp Points"
                        >
                          Ripple Lamp
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyPresetPoints([
                              "3 Fast Heat Modes (45-65°C)",
                              "4 Vibration Massage Modes",
                              "Skin-Friendly Plush Velvet",
                              "Wireless USB Rechargeable",
                            ])
                          }
                          className="px-2 py-0.5 text-[10px] bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Load Heating Pad Points"
                        >
                          Heating Pad
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyPresetPoints([
                              "30s Rapid Heat-Up",
                              "Dual Wet & Dry Ironing",
                              "180° Foldable Travel Body",
                              "Anti-Burn Ceramic Plate",
                            ])
                          }
                          className="px-2 py-0.5 text-[10px] bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Load Steam Iron Points"
                        >
                          Steam Iron
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {[0, 1, 2, 3].map((slotIdx) => (
                        <div key={slotIdx} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-600">
                              Point {slotIdx + 1} {slotIdx < 2 ? "(Row 1)" : "(Row 2)"}
                            </label>
                            {formFeatures[slotIdx] && (
                              <button
                                type="button"
                                onClick={() => updateFeatureSlot(slotIdx, "")}
                                className="text-[9px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#FF7A00]/20 focus-within:border-[#FF7A00] transition-all">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <input
                              type="text"
                              value={formFeatures[slotIdx] || ""}
                              onChange={(e) => updateFeatureSlot(slotIdx, e.target.value)}
                              placeholder={
                                slotIdx === 0
                                  ? "e.g. 3 Fast Heat Modes (45-65°C)"
                                  : slotIdx === 1
                                  ? "e.g. 4 Vibration Massage Modes"
                                  : slotIdx === 2
                                  ? "e.g. Skin-Friendly Plush Velvet"
                                  : "e.g. Wireless USB Rechargeable"
                              }
                              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none font-medium"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Overview Description (Product Details Accordion)
                    </label>
                    <textarea
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Provide full details about the product, materials, operations, and benefits..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: PRICING & STOCK (WITH MODERN TOGGLE SWITCH)
                 ======================================================== */}
              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Price Configuration & Profit Margins
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="799"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          MRP (₹) [Strikethrough Price]
                        </label>
                        <input
                          type="number"
                          value={formMrp}
                          onChange={(e) => setFormMrp(e.target.value)}
                          placeholder="1149"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Supplier Cost / COGS (₹)
                        </label>
                        <input
                          type="number"
                          value={formCost}
                          onChange={(e) => setFormCost(e.target.value)}
                          placeholder="280"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                      </div>
                    </div>

                    {formPrice && (
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs gap-2">
                        {formMrp && Number(formMrp) > Number(formPrice) && (
                          <div className="text-slate-600">
                            Customer Discount:{" "}
                            <span className="font-bold text-rose-600">
                              {Math.round(
                                ((Number(formMrp) - Number(formPrice)) / Number(formMrp)) * 100
                              )}
                              % OFF
                            </span>
                          </div>
                        )}
                        {formCost && (
                          <div className="text-slate-600">
                            Unit Profit:{" "}
                            <span className="font-bold text-emerald-600">
                              ₹{Number(formPrice) - Number(formCost)} (
                              {(
                                ((Number(formPrice) - Number(formCost)) / Number(formPrice)) *
                                100
                              ).toFixed(0)}
                              % margin)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Inventory Stock Units *
                      </label>
                      <input
                        type="number"
                        required
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        placeholder="92"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Displayed to customer as "In Stock (XX units available)".
                      </p>
                    </div>

                    {/* Modern Toggle Switch UI */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Storefront Availability Toggle
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">
                            {formInStock ? "In Stock (Active)" : "Out of Stock (Disabled)"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formInStock ? "Purchasable by customers" : "Cart buttons disabled"}
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={formInStock}
                          onClick={() => setFormInStock(!formInStock)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formInStock ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              formInStock ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================
                      BUY MORE SAVE MORE (TIERED QUANTITY BUNDLE DISCOUNTS)
                     ======================================================== */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-orange-100 text-[#FF7A00]">
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Buy More Save More Offers
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7A00] border border-orange-200">
                            Customizable Tiers
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Configure multi-unit quantity discounts shown right below the Buy Now button on this product&apos;s page.
                        </p>
                      </div>

                      {/* Master Enable/Disable Switch */}
                      <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">
                          {formBundleTiers.enabled ? "Bundle Offers Active" : "Offers Disabled"}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={formBundleTiers.enabled}
                          onClick={() =>
                            setFormBundleTiers((prev) => ({
                              ...prev,
                              enabled: !prev.enabled,
                            }))
                          }
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formBundleTiers.enabled ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              formBundleTiers.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {formBundleTiers.enabled && (
                      <div className="space-y-4">
                        {/* Section Heading & Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Storefront Section Heading
                            </label>
                            <input
                              type="text"
                              value={formBundleTiers.headerTitle || "Buy More Save More"}
                              onChange={(e) =>
                                setFormBundleTiers((prev) => ({
                                  ...prev,
                                  headerTitle: e.target.value,
                                }))
                              }
                              placeholder="Buy More Save More"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Title displayed above the bundle cards on the product page.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={resetDefaultBundleTiers}
                              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3 text-slate-500" />
                              <span>Reset Standard (1x, 2x, 3x)</span>
                            </button>
                            <button
                              type="button"
                              onClick={addBundleTier}
                              className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF7A00] hover:bg-[#E66E00] shadow-sm shadow-orange-500/20 transition-colors flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Tier</span>
                            </button>
                          </div>
                        </div>

                        {/* Tier Cards List */}
                        <div className="space-y-3">
                          {formBundleTiers.tiers.map((tier, idx) => {
                            const unitPriceNum = Number(formPrice) || 0;
                            const regTotal = unitPriceNum * (tier.qty || 1);
                            let customerTotal = regTotal;
                            let savings = 0;
                            const discPct = tier.discountPercent || 0;

                            if (tier.customPrice && tier.customPrice > 0) {
                              customerTotal = tier.customPrice;
                              savings = Math.max(0, regTotal - customerTotal);
                            } else if (discPct > 0) {
                              savings = Math.round(regTotal * (discPct / 100));
                              customerTotal = Math.max(0, regTotal - savings);
                            }

                            const effectivePerUnit = tier.qty > 0 ? Math.round(customerTotal / tier.qty) : 0;
                            const costPriceNum = Number(formCost) || 0;
                            const totalCost = costPriceNum * (tier.qty || 1);
                            const totalProfit = customerTotal - totalCost;

                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  tier.enabled !== false
                                    ? "bg-white border-slate-200/90 shadow-2xs"
                                    : "bg-slate-100/70 border-slate-200 opacity-60"
                                }`}
                              >
                                {/* Card Header */}
                                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                      Tier {idx + 1}: Buy {tier.qty} {tier.qty === 1 ? "Unit" : "Units"}
                                    </span>
                                    {tier.badge && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                                        {tier.badge}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                                      <input
                                        type="checkbox"
                                        checked={tier.enabled !== false}
                                        onChange={(e) =>
                                          updateBundleTier(idx, "enabled", e.target.checked)
                                        }
                                        className="rounded border-slate-300 text-[#FF7A00] focus:ring-[#FF7A00] w-3.5 h-3.5"
                                      />
                                      <span>Active</span>
                                    </label>
                                    {formBundleTiers.tiers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeBundleTier(idx)}
                                        title="Delete tier"
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Inputs Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                  {/* Quantity */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Quantity (Qty) *
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={tier.qty}
                                      onChange={(e) =>
                                        updateBundleTier(idx, "qty", Math.max(1, parseInt(e.target.value) || 1))
                                      }
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                                    />
                                  </div>

                                  {/* Badge Text */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Badge Label
                                    </label>
                                    <input
                                      type="text"
                                      value={tier.badge}
                                      onChange={(e) =>
                                        updateBundleTier(idx, "badge", e.target.value)
                                      }
                                      placeholder="e.g. BEST PRICE"
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                                    />
                                  </div>

                                  {/* Discount % */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Discount %
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={tier.discountPercent}
                                        onChange={(e) =>
                                          updateBundleTier(idx, "discountPercent", parseInt(e.target.value) || 0)
                                        }
                                        placeholder="15"
                                        className="w-full px-2.5 py-1.5 pr-6 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                                      />
                                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">
                                        %
                                      </span>
                                    </div>
                                  </div>

                                  {/* Custom Fixed Price Override */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Fixed Price (₹) <span className="text-slate-400 font-normal">opt</span>
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={tier.customPrice !== undefined ? tier.customPrice : ""}
                                      onChange={(e) =>
                                        updateBundleTier(
                                          idx,
                                          "customPrice",
                                          e.target.value ? parseFloat(e.target.value) : undefined
                                        )
                                      }
                                      placeholder="Overrides %"
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                                    />
                                  </div>

                                  {/* Promo Tag */}
                                  <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                      Promo Pill Tag
                                    </label>
                                    <input
                                      type="text"
                                      value={tier.tagText || ""}
                                      onChange={(e) =>
                                        updateBundleTier(idx, "tagText", e.target.value)
                                      }
                                      placeholder="Extra 15% OFF"
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                                    />
                                  </div>
                                </div>

                                {/* Live Real-Time Calculation for Admin */}
                                {unitPriceNum > 0 && (
                                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] gap-2 bg-slate-50/70 p-2 rounded-lg">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="text-slate-600">
                                        Cust. Total:{" "}
                                        <strong className="text-slate-900 font-extrabold text-xs">
                                          ₹{customerTotal.toLocaleString("en-IN")}
                                        </strong>
                                      </span>
                                      {savings > 0 && (
                                        <span className="text-slate-500">
                                          Regular:{" "}
                                          <span className="line-through">
                                            ₹{regTotal.toLocaleString("en-IN")}
                                          </span>
                                        </span>
                                      )}
                                      {savings > 0 && (
                                        <span className="text-emerald-700 font-bold">
                                          Save: ₹{savings.toLocaleString("en-IN")}
                                        </span>
                                      )}
                                      <span className="text-slate-500">
                                        Per Unit:{" "}
                                        <span className="font-semibold text-slate-700">
                                          ₹{effectivePerUnit.toLocaleString("en-IN")}
                                        </span>
                                      </span>
                                    </div>

                                    {costPriceNum > 0 && (
                                      <div className="text-amber-800 font-semibold">
                                        Profit: ₹{totalProfit.toLocaleString("en-IN")}{" "}
                                        <span className="text-slate-400">
                                          ({customerTotal > 0 ? Math.round((totalProfit / customerTotal) * 100) : 0}% margin)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 3: POSTER & GALLERY (WITH UPLOAD & PREVIEWS)
                 ======================================================== */}
              {activeTab === "media" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Primary Poster Image URL *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormImage(val);
                          const trimmed = val.trim();
                          if (trimmed && (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/"))) {
                            setFormGalleryImages((prev) => (prev.includes(trimmed) ? prev : [trimmed, ...prev]));
                          }
                        }}
                        onBlur={(e) => {
                          const trimmed = e.target.value.trim();
                          if (trimmed) {
                            setFormGalleryImages((prev) => (prev.includes(trimmed) ? prev : [trimmed, ...prev]));
                          }
                        }}
                        placeholder="https://... or click Upload File"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                      <label
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
                        title="Upload Image File"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (dataUrl) => {
                              setFormImage(dataUrl);
                              setFormGalleryImages((prev) => (prev.includes(dataUrl) ? prev : [dataUrl, ...prev]));
                            })
                          }
                        />
                      </label>
                    </div>

                    {formImage && (
                      <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={formImage}
                            alt="Poster Preview"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                            onError={(e) => {
                              (e.target as any).src =
                                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block">
                              Poster Image Preview
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              Primary photo displayed on catalog product cards and search results.
                            </span>
                            {formGalleryImages.includes(formImage.trim()) ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                                ✓ Automatically added to product gallery images
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = formImage.trim();
                                  if (trimmed) {
                                    setFormGalleryImages((prev) => [trimmed, ...prev.filter((x) => x !== trimmed)]);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF7A00] hover:underline mt-0.5 cursor-pointer"
                              >
                                + Add to gallery images
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        General Product Gallery Images ({formGalleryImages.length} images)
                      </label>
                      {formGalleryImages.length > 1 && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Move className="w-2.5 h-2.5" />
                          Click & slide to reorder photos
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">
                      Used when no color swatches are selected or as default photos. Click & drag/slide photos to change their sequence.
                    </p>

                    <div className="flex items-center gap-3 flex-wrap mb-3 p-2 bg-slate-50/80 rounded-2xl border border-slate-200 min-h-[88px]">
                      {formGalleryImages.length === 0 ? (
                        <p className="text-xs text-slate-400 italic px-2 py-3">
                          No gallery images added yet. Upload or paste a URL below.
                        </p>
                      ) : (
                        formGalleryImages.map((gImg, gIdx) => {
                          const isDragging = draggedGalleryIdx === gIdx;
                          const isDragOver = dragOverGalleryIdx === gIdx;

                          return (
                            <div
                              key={gIdx}
                              draggable
                              onDragStart={(e) => {
                                setDraggedGalleryIdx(gIdx);
                                e.dataTransfer.setData("text/plain", `${gIdx}`);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                if (dragOverGalleryIdx !== gIdx) setDragOverGalleryIdx(gIdx);
                              }}
                              onDragLeave={() => {
                                if (dragOverGalleryIdx === gIdx) setDragOverGalleryIdx(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedGalleryIdx !== null && draggedGalleryIdx !== gIdx) {
                                  reorderGalleryImage(draggedGalleryIdx, gIdx);
                                }
                                setDraggedGalleryIdx(null);
                                setDragOverGalleryIdx(null);
                              }}
                              onDragEnd={() => {
                                setDraggedGalleryIdx(null);
                                setDragOverGalleryIdx(null);
                              }}
                              className={`relative group w-20 h-20 rounded-xl overflow-visible border bg-white shrink-0 shadow-xs cursor-grab active:cursor-grabbing transition-all select-none ${
                                isDragging
                                  ? "opacity-30 scale-90 border-dashed border-[#FF7A00]"
                                  : isDragOver
                                  ? "ring-2 ring-[#FF7A00] ring-offset-2 scale-105 border-[#FF7A00]"
                                  : "border-slate-200 hover:border-[#FF7A00]/60 hover:shadow-md"
                              }`}
                              title="Click & drag to move order position"
                            >
                              {/* Inner Image Container */}
                              <div className="w-full h-full rounded-xl overflow-hidden relative">
                                <img
                                  src={gImg}
                                  alt={`Gallery ${gIdx + 1}`}
                                  className="w-full h-full object-cover pointer-events-none"
                                  onError={(e) => {
                                    (e.target as any).src =
                                      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                  }}
                                />

                                {/* Sequence Number Badge */}
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 text-[9px] font-bold text-white backdrop-blur-xs select-none">
                                  #{gIdx + 1}
                                </span>

                                {/* Drag Grip Indicator Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                  <GripVertical className="w-4 h-4 text-white drop-shadow-md" />
                                </div>

                                {/* Arrow Step Reorder Controls (Hover) */}
                                <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  {gIdx > 0 ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        reorderGalleryImage(gIdx, gIdx - 1);
                                      }}
                                      className="w-4 h-4 bg-black/80 hover:bg-[#FF7A00] text-white rounded flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                      title="Move earlier"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <span />
                                  )}

                                  {gIdx < formGalleryImages.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        reorderGalleryImage(gIdx, gIdx + 1);
                                      }}
                                      className="w-4 h-4 bg-black/80 hover:bg-[#FF7A00] text-white rounded flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                      title="Move later"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Small Individual Corner Remove Icon */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGalleryImage(gIdx);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-20 cursor-pointer"
                                title="Remove this photo"
                              >
                                <X className="w-3 h-3 stroke-[3]" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGalleryInput}
                        onChange={(e) => setNewGalleryInput(e.target.value)}
                        placeholder="Paste image URL (e.g. /products/washer/washer-green-1.jpg)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addGalleryImage();
                          }
                        }}
                      />
                      <label
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                        title="Upload Gallery Photo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (dataUrl) =>
                              setFormGalleryImages((prev) => [...prev, dataUrl])
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] rounded-xl text-xs font-semibold shrink-0 transition-colors"
                      >
                        + Add Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 4: COLORS & MULTI-ANGLE PHOTOS (WITH FILE UPLOAD & URL)
                 ======================================================== */}
              {activeTab === "colors" && (
                <div className="space-y-4">
                  {/* Master Enable/Disable Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        Product Color Options & Swatches
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enable if this product offers selectable color variants. Disable for single-style products with no color choices.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className={`text-xs font-bold ${formHasColors ? "text-emerald-700" : "text-slate-500"}`}>
                        {formHasColors ? "Color Options Enabled" : "Colors Disabled"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formHasColors}
                        onClick={() => {
                          setFormHasColors((prev) => {
                            const next = !prev;
                            if (next && formColors.length === 0) {
                              setFormColors([
                                {
                                  name: "Standard",
                                  colorHex: "#3B82F6",
                                  image: formImage || "",
                                  images: formImage ? [formImage] : [],
                                },
                              ]);
                            }
                            return next;
                          });
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formHasColors ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            formHasColors ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {!formHasColors ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                        <Palette className="w-6 h-6 text-slate-400" />
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-700">Color Options are Disabled</h5>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        This product is sold as a single style. No color selector, &ldquo;Color: Standard&rdquo; text, or swatch buttons will appear on the live storefront.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormHasColors(true);
                          if (formColors.length === 0) {
                            setFormColors([
                              {
                                name: "Standard",
                                colorHex: "#3B82F6",
                                image: formImage || "",
                                images: formImage ? [formImage] : [],
                              },
                            ]);
                          }
                        }}
                        className="mt-3.5 px-3.5 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        Enable Color Variants
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">
                            Each color variant has its own thumbnail swatch, color dot, and independent multi-angle photo gallery.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addColorVariant}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Color Variant</span>
                        </button>
                      </div>

                      {formColors.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                          <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">No color variants added yet.</p>
                          <button
                            type="button"
                            onClick={addColorVariant}
                            className="mt-3 px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg text-xs font-semibold shadow-sm shadow-orange-500/20"
                          >
                            Add First Color
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                      {formColors.map((colorItem, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 inline-block shadow-xs"
                                style={{ backgroundColor: colorItem.colorHex || "#ccc" }}
                              />
                              Color Variant #{cIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeColorVariant(cIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Color</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Color Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={colorItem.name}
                                onChange={(e) =>
                                  updateColorField(cIdx, "name", e.target.value)
                                }
                                placeholder="e.g. Soft Pink, Pearl White"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Swatch Hex Code
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={colorItem.colorHex || "#FF7A00"}
                                  onChange={(e) =>
                                    updateColorField(cIdx, "colorHex", e.target.value)
                                  }
                                  className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                />
                                <input
                                  type="text"
                                  value={colorItem.colorHex || ""}
                                  onChange={(e) =>
                                    updateColorField(cIdx, "colorHex", e.target.value)
                                  }
                                  placeholder="#F9A8D4"
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Swatch Thumbnail (URL or Upload)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={colorItem.image || ""}
                                  onChange={(e) =>
                                    updateColorField(cIdx, "image", e.target.value)
                                  }
                                  placeholder="/products/... or https://..."
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                                />
                                <label
                                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer transition-colors shrink-0"
                                  title="Upload Image File from Computer"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleFileUpload(e, (dataUrl) =>
                                        updateColorField(cIdx, "image", dataUrl)
                                      )
                                    }
                                  />
                                </label>
                                {colorItem.image && (
                                  <img
                                    src={colorItem.image}
                                    alt="Swatch"
                                    className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                                    onError={(e) => {
                                      (e.target as any).src =
                                        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Angle Photos for this Color */}
                          <div className="pt-2 border-t border-slate-200/80">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] font-bold text-slate-600">
                                Different Angle Photos for this Color ({colorItem.images?.length || 0} photos)
                              </label>
                              {(colorItem.images?.length || 0) > 1 && (
                                <span className="text-[9px] text-amber-600 font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                                  <Move className="w-2.5 h-2.5" />
                                  Drag to reorder
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap mb-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[68px]">
                              {colorItem.images?.map((angleImg, aIdx) => {
                                const angleKey = `${cIdx}-${aIdx}`;
                                const isDragging = draggedAngleKey === angleKey;
                                const isDragOver = dragOverAngleKey === angleKey;

                                return (
                                  <div
                                    key={aIdx}
                                    draggable
                                    onDragStart={(e) => {
                                      setDraggedAngleKey(angleKey);
                                      e.dataTransfer.setData("text/plain", `${aIdx}`);
                                      e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = "move";
                                      if (dragOverAngleKey !== angleKey) setDragOverAngleKey(angleKey);
                                    }}
                                    onDragLeave={() => {
                                      if (dragOverAngleKey === angleKey) setDragOverAngleKey(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedAngleKey && draggedAngleKey.startsWith(`${cIdx}-`)) {
                                        const fromAIdx = parseInt(draggedAngleKey.split("-")[1], 10);
                                        if (fromAIdx !== aIdx) {
                                          reorderAnglePhoto(cIdx, fromAIdx, aIdx);
                                        }
                                      }
                                      setDraggedAngleKey(null);
                                      setDragOverAngleKey(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedAngleKey(null);
                                      setDragOverAngleKey(null);
                                    }}
                                    className={`relative group w-16 h-16 rounded-xl overflow-visible border bg-white shrink-0 shadow-xs cursor-grab active:cursor-grabbing transition-all select-none ${
                                      isDragging
                                        ? "opacity-30 scale-90 border-dashed border-[#FF7A00]"
                                        : isDragOver
                                        ? "ring-2 ring-[#FF7A00] ring-offset-2 scale-105 border-[#FF7A00]"
                                        : "border-slate-200 hover:border-[#FF7A00]/60 hover:shadow-md"
                                    }`}
                                    title="Click & drag to reorder"
                                  >
                                    <div className="w-full h-full rounded-xl overflow-hidden relative">
                                      <img
                                        src={angleImg}
                                        alt={`Angle ${aIdx + 1}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                        onError={(e) => {
                                          (e.target as any).src =
                                            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                        }}
                                      />
                                      {/* Sequence Badge */}
                                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 text-[9px] font-bold text-white backdrop-blur-xs select-none">
                                        #{aIdx + 1}
                                      </span>

                                      {/* Hover Arrow Reorder Controls */}
                                      <div className="absolute inset-x-0.5 bottom-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        {aIdx > 0 ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              reorderAnglePhoto(cIdx, aIdx, aIdx - 1);
                                            }}
                                            className="w-3.5 h-3.5 bg-black/80 hover:bg-[#FF7A00] text-white rounded flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                            title="Move Left"
                                          >
                                            <ChevronLeft className="w-2.5 h-2.5" />
                                          </button>
                                        ) : (
                                          <span />
                                        )}
                                        {aIdx < (colorItem.images?.length || 0) - 1 && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              reorderAnglePhoto(cIdx, aIdx, aIdx + 1);
                                            }}
                                            className="w-3.5 h-3.5 bg-black/80 hover:bg-[#FF7A00] text-white rounded flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                            title="Move Right"
                                          >
                                            <ChevronRight className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Small Individual Corner Remove Icon */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeAnglePhotoFromColor(cIdx, aIdx);
                                      }}
                                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-20 cursor-pointer"
                                      title="Remove photo"
                                    >
                                      <X className="w-3 h-3 stroke-[3]" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Add Angle Photo input row */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                id={`angle-input-${cIdx}`}
                                placeholder="Paste image path / URL (e.g. /products/heating-pad/pad-pink-1.jpg)"
                                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const val = (e.target as HTMLInputElement).value;
                                    addAnglePhotoToColor(cIdx, val);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                              <label
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                                title="Upload Photo File"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(e, (dataUrl) =>
                                      addAnglePhotoToColor(cIdx, dataUrl)
                                    )
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(
                                    `angle-input-${cIdx}`
                                  ) as HTMLInputElement;
                                  if (el && el.value) {
                                    addAnglePhotoToColor(cIdx, el.value);
                                    el.value = "";
                                  }
                                }}
                                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] rounded-lg text-xs font-semibold transition-colors shrink-0"
                              >
                                + Add Angle Photo
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}



              {/* ========================================================
                  TAB 5: PRODUCT DETAILS & OVERVIEW (OPEN VISUAL STORY & GIF SHOWCASE)
                 ======================================================== */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {/* Master Header Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-orange-100 text-[#FF7A00]">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                          Product Details & Overview (Open Landing Story)
                        </h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7A00] border border-orange-200">
                          {formOverviewBlocks.length} {formOverviewBlocks.length === 1 ? "Section" : "Sections"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xl leading-relaxed">
                        Create an open, high-converting product showcase. Add customized headings, detailed text copy, and demonstration photos or animated GIFs. You can also add standalone photos or GIFs without any headings or text.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => addOverviewBlock(false)}
                        className="px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Story Section</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addOverviewBlock(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Add Photo / GIF</span>
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {formOverviewBlocks.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-3 border border-orange-100">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                        No Visual Story Sections Added Yet
                      </h5>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Engage shoppers with a long-form product presentation: customized headings, detailed product copy, and photos or animated GIFs in sequence.
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                        <button
                          type="button"
                          onClick={() => addOverviewBlock(false)}
                          className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add First Story Section</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => addOverviewBlock(true)}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          <span>Add Standalone Photo / GIF</span>
                        </button>
                        {formDescription.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormOverviewBlocks([
                                {
                                  id: `block-${Date.now()}`,
                                  heading: formName ? `${formName} – Overview` : "Product Overview",
                                  details: formDescription.trim(),
                                  media_url: formImage || "",
                                },
                              ]);
                            }}
                            className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] rounded-xl text-xs font-semibold transition-colors"
                          >
                            Convert Basic Description to Story
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formOverviewBlocks.map((block, idx) => (
                        <div
                          key={block.id || idx}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4"
                        >
                          {/* Card Top Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                Section #{idx + 1}
                              </span>
                              {block.heading && (
                                <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                                  — {block.heading}
                                </span>
                              )}
                              {!block.heading && !block.details && block.media_url && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                                  Photo / GIF Only
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Reorder Buttons */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveOverviewBlock(block.id, "up")}
                                title="Move section up"
                                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formOverviewBlocks.length - 1}
                                onClick={() => moveOverviewBlock(block.id, "down")}
                                title="Move section down"
                                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeOverviewBlock(block.id)}
                                title="Delete this section"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 1. Customized Heading (Optional) */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Customized Heading <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              value={block.heading || ""}
                              onChange={(e) =>
                                updateOverviewBlock(block.id, "heading", e.target.value)
                              }
                              placeholder="e.g. Double-Ended Spray Fan – Portable Mist Cooling Fan for Instant Refreshment"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Bold title displayed prominently above the description details for this section.
                            </p>
                          </div>

                          {/* 2. Details & Description (Optional) */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Details & Description <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                              rows={3}
                              value={block.details || ""}
                              onChange={(e) =>
                                updateOverviewBlock(block.id, "details", e.target.value)
                              }
                              placeholder="Beat the heat with this versatile spray fan... or bullet points like:&#10;• Mist + Fan Combo – Double cooling effect&#10;• Adjustable Spray – Control mist intensity"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] leading-relaxed"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Enter paragraphs or bullet points. Linebreaks and bullet points are preserved on the storefront.
                            </p>
                          </div>

                          {/* 3. Photo or Animated GIF Showcase (Optional) */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Photo or Animated GIF Showcase <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={block.media_url || ""}
                                onChange={(e) =>
                                  updateOverviewBlock(block.id, "media_url", e.target.value)
                                }
                                placeholder="Paste image or GIF URL (e.g. https://... or /products/fan.gif)"
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                              />
                              <label
                                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
                                title="Upload Photo or GIF File from Computer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept="image/*,video/*,.gif"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(e, (dataUrl) =>
                                      updateOverviewBlock(block.id, "media_url", dataUrl)
                                    )
                                  }
                                />
                              </label>
                            </div>

                            {/* Media Preview Thumbnail / Container */}
                            {block.media_url && (
                              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                                    <img
                                      src={block.media_url}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as any).src =
                                          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                                      <span className="text-xs font-bold text-slate-800">
                                        Photo / GIF Active
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                                      {block.media_url.substring(0, 60)}...
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => updateOverviewBlock(block.id, "media_url", "")}
                                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors font-medium shrink-0"
                                >
                                  Remove Media
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Buttons Row */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => addOverviewBlock(false)}
                          className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Another Story Section</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => addOverviewBlock(true)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>+ Add Additional Photo or GIF</span>
                        </button>
                      </div>

                      {/* Live Storefront Preview Card */}
                      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/20 border border-slate-200/90 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Live Storefront Story Preview
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            How customers will experience this on the product page
                          </span>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-5">
                          {formOverviewBlocks.map((block, idx) => (
                            <div key={idx} className="space-y-2.5">
                              {block.heading && (
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                  {block.heading}
                                </h3>
                              )}
                              {block.details && (
                                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                  {block.details}
                                </div>
                              )}
                              {block.media_url && (
                                <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50">
                                  <img
                                    src={block.media_url}
                                    alt={block.heading || "Section Media"}
                                    className="w-full max-h-72 object-contain mx-auto"
                                    onError={(e) => {
                                      (e.target as any).src =
                                        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  TAB 6: SPECS & BOX (FULLY EDITABLE & DELETABLE INDIVIDUAL ROWS)
                 ======================================================== */}
              {activeTab === "specs" && (
                <div className="space-y-6">
                  {/* General Specs */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2">
                      General Specifications & Material
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Size / Variant / Capacity
                        </label>
                        <input
                          type="text"
                          value={formVolume}
                          onChange={(e) => setFormVolume(e.target.value)}
                          placeholder="e.g. Adjustable Elastic Strap, 50ml Tank, 8L Capacity"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Material
                        </label>
                        <input
                          type="text"
                          value={formMaterial}
                          onChange={(e) => setFormMaterial(e.target.value)}
                          placeholder="e.g. Lycra + Plush Velvet, Ceramic + ABS"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Key-Value Specs - FULLY EDITABLE ROWS */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        Custom Technical Specifications ({formSpecs.length} specs)
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">
                      Rendered in the Specifications Accordion table on the product page. You can edit any spec name or value directly.
                    </p>

                    <div className="space-y-2 mb-3">
                      {formSpecs.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                        >
                          <input
                            type="text"
                            value={s.key}
                            onChange={(e) => updateSpecKey(idx, e.target.value)}
                            placeholder="Spec Name (e.g. Dimensions)"
                            className="w-1/3 px-2 py-1 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#FF7A00] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={s.val}
                            onChange={(e) => updateSpecVal(idx, e.target.value)}
                            placeholder="Spec Value (e.g. 12 cm × 12 cm × 13 cm)"
                            className="flex-1 px-2 py-1 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:border-[#FF7A00] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            title="Delete this spec row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Spec Row Form */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        + Add New Technical Specification Row
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Spec Name (e.g. Battery Capacity)"
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                        <input
                          type="text"
                          placeholder="Spec Value (e.g. 1800mAh Rechargeable)"
                          value={newSpecVal}
                          onChange={(e) => setNewSpecVal(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                        <button
                          type="button"
                          onClick={addSpec}
                          className="px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-orange-500/20 active:scale-[0.98]"
                        >
                          + Add Spec Row
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* What's in the Box - FULLY EDITABLE ROWS */}
                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                      What's in the Box Checklist ({formWhatsInBox.length} items)
                    </h4>
                    <p className="text-[10px] text-slate-400 mb-2">
                      Rendered in the What's in the Box accordion. Edit any item text directly.
                    </p>

                    <div className="space-y-2 mb-3">
                      {formWhatsInBox.map((boxItem, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                        >
                          <Check className="w-4 h-4 text-[#FF7A00] shrink-0" />
                          <input
                            type="text"
                            value={boxItem}
                            onChange={(e) => updateBoxItem(bIdx, e.target.value)}
                            placeholder="Edit box item..."
                            className="flex-1 px-2 py-1 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:border-[#FF7A00] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeBoxItem(bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            title="Delete this box item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newBoxInput}
                        onChange={(e) => setNewBoxInput(e.target.value)}
                        placeholder="e.g. 1 × USB-C Charging Cable"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addBoxItem();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addBoxItem}
                        className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-sm shadow-orange-500/20 active:scale-[0.98]"
                      >
                        + Add Box Item
                      </button>
                    </div>
                  </div>

                  {/* Real Reviews & Social Proof Auto-Sync Notice */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF7A00] flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Ratings & Reviews are Live & Auto-Synced
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Customer ratings and review counts are calculated dynamically from genuine orders and imported marketplace reviews (Amazon, Flipkart, etc.).
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/admin/reviews"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#FF7A00] text-xs font-bold text-slate-700 hover:text-[#FF7A00] shrink-0 transition-colors shadow-xs"
                      >
                        <span>Manage Reviews</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 8: HOW TO USE (STEP-BY-STEP REUSABLE BUILDER)
                 ======================================================== */}
              {activeTab === "how_to_use" && (
                <div className="space-y-6">
                  {/* 1. Header & Enable/Disable Toggle */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/60 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF7A00] text-white">
                          Customer-Facing Feature
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          &ldquo;How to Use&rdquo; Interactive Section
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Show a clean 3-card mobile carousel and 4-5 card desktop carousel walking customers step-by-step through using this product.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormHowToUseEnabled(!formHowToUseEnabled)}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formHowToUseEnabled ? "bg-[#FF7A00]" : "bg-slate-300"
                      }`}
                      role="switch"
                      aria-checked={formHowToUseEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formHowToUseEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2. Product-Level Section & Card Styling Options */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>Section & Card Styling (Product-Level)</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      {/* Section Background */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Section Background
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { id: "white", label: "Pure White (#FFF)", hex: "#FFFFFF" },
                            { id: "soft_gray", label: "Soft Gray (#F3F4F6)", hex: "#F3F4F6" },
                            { id: "light_orange", label: "Very Light Orange (#FFF3E8)", hex: "#FFF3E8" },
                          ].map((bg) => (
                            <button
                              key={bg.id}
                              type="button"
                              onClick={() => setFormHowToUseSectionBg(bg.id as HowToUseSectionBg)}
                              className={`w-full p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                                formHowToUseSectionBg === bg.id
                                  ? "border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]/20 font-bold text-slate-900"
                                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                                style={{ backgroundColor: bg.hex }}
                              />
                              <span className="truncate">{bg.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Corner Radius */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Card Corner Radius
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { id: "rounded-xl", label: "Standard (Rounded)" },
                            { id: "rounded-2xl", label: "Smooth (Recommended)" },
                            { id: "rounded-3xl", label: "Pill / Maximum" },
                          ].map((rad) => (
                            <button
                              key={rad.id}
                              type="button"
                              onClick={() => setFormHowToUseCardRadius(rad.id as HowToUseCardRadius)}
                              className={`w-full p-2 rounded-xl border text-left transition-all ${
                                formHowToUseCardRadius === rad.id
                                  ? "border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]/20 font-bold text-slate-900"
                                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              {rad.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Border */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Card Border Style
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { id: "subtle", label: "Subtle Gray Border" },
                            { id: "orange", label: "Restrained Orange Accent" },
                            { id: "none", label: "Borderless Clean" },
                          ].map((bor) => (
                            <button
                              key={bor.id}
                              type="button"
                              onClick={() => setFormHowToUseCardBorder(bor.id as HowToUseCardBorder)}
                              className={`w-full p-2 rounded-xl border text-left transition-all ${
                                formHowToUseCardBorder === bor.id
                                  ? "border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]/20 font-bold text-slate-900"
                                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              {bor.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Shadow */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Card Shadow Depth
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { id: "none", label: "Flat (No Shadow)" },
                            { id: "sm", label: "Subtle Depth (Default)" },
                            { id: "md", label: "Medium Shadow" },
                            { id: "lg", label: "Elevated Shadow" },
                          ].map((sha) => (
                            <button
                              key={sha.id}
                              type="button"
                              onClick={() => setFormHowToUseCardShadow(sha.id as HowToUseCardShadow)}
                              className={`w-full p-2 rounded-xl border text-left transition-all ${
                                formHowToUseCardShadow === sha.id
                                  ? "border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]/20 font-bold text-slate-900"
                                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              {sha.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Steps List Builder */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Configured Steps ({formHowToUseSteps.length})
                        </h4>
                        <p className="text-xs text-slate-500">
                          Step numbers are generated sequentially (STEP 01, STEP 02...). Media, title, and description are all optional.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addHowToUseStep}
                        className="px-3.5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Step</span>
                      </button>
                    </div>

                    {formHowToUseSteps.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <p className="text-xs font-medium text-slate-500">
                          No steps added yet. Click &ldquo;Add Step&rdquo; above to create the first step.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {formHowToUseSteps.map((step, idx) => {
                          const stepLabel = `STEP ${String(idx + 1).padStart(2, "0")}`;
                          const isFirst = idx === 0;
                          const isLast = idx === formHowToUseSteps.length - 1;

                          return (
                            <div
                              key={step.id || `step-item-${idx}`}
                              id={`step-card-${step.id}`}
                              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-slate-300"
                            >
                              {/* Step Top Bar */}
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 text-[#FF7A00] text-xs font-black tracking-wider">
                                    {stepLabel}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    {step.title ? `— ${step.title}` : "(No title set)"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveHowToUseStep(step.id, "up")}
                                    disabled={isFirst}
                                    title="Move step up"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveHowToUseStep(step.id, "down")}
                                    disabled={isLast}
                                    title="Move step down"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeHowToUseStep(step.id)}
                                    title="Delete step"
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors ml-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Step Inputs */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                                {/* Left: Media Configuration (5 cols) */}
                                <div className="md:col-span-5 space-y-2.5">
                                  {/* Media Type & Media Fit Selectors */}
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={step.media_type || "image"}
                                      onChange={(e) =>
                                        updateHowToUseStep(step.id, "media_type", e.target.value as HowToUseMediaType)
                                      }
                                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF7A00]"
                                    >
                                      <option value="image">Static Image</option>
                                      <option value="gif">Animated GIF</option>
                                      <option value="video">Short Video (&lt;10s)</option>
                                    </select>

                                    <select
                                      value={step.media_fit || "contain"}
                                      onChange={(e) =>
                                        updateHowToUseStep(step.id, "media_fit", e.target.value as HowToUseMediaFit)
                                      }
                                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF7A00]"
                                    >
                                      <option value="contain">Contain (Full view)</option>
                                      <option value="cover">Cover (Crop)</option>
                                    </select>
                                  </div>

                                  {/* Media Input Row */}
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={step.media_url || ""}
                                      onChange={(e) => updateHowToUseStep(step.id, "media_url", e.target.value)}
                                      placeholder="https://... or upload"
                                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#FF7A00]"
                                    />

                                    <label
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                                      title="Upload Image/Video"
                                    >
                                      <Upload className="w-3 h-3" />
                                      <span>Upload</span>
                                      <input
                                        type="file"
                                        accept="image/*,video/mp4,video/webm"
                                        className="hidden"
                                        onChange={(e) => handleStepMediaUpload(e, step.id)}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMediaLibraryTargetStepId(step.id);
                                        setMediaLibraryModalOpen(true);
                                      }}
                                      className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                                      title="Select from Media Library"
                                    >
                                      <ImageIcon className="w-3 h-3" />
                                      <span>Library</span>
                                    </button>
                                  </div>

                                  {/* Preview Thumbnail */}
                                  {step.media_url ? (
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#FFF3E8] border border-orange-200 shrink-0">
                                      {step.media_type === "video" || step.media_url.endsWith(".mp4") ? (
                                        <video
                                          src={step.media_url}
                                          muted
                                          loop
                                          playsInline
                                          className={`w-full h-full ${
                                            step.media_fit === "cover" ? "object-cover" : "object-contain p-1"
                                          }`}
                                        />
                                      ) : (
                                        <img
                                          src={step.media_url}
                                          alt={step.title || stepLabel}
                                          className={`w-full h-full ${
                                            step.media_fit === "cover" ? "object-cover" : "object-contain p-1"
                                          }`}
                                        />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => updateHowToUseStep(step.id, "media_url", "")}
                                        className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition-colors"
                                        title="Remove media"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="h-10 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400">
                                      No media assigned (optional)
                                    </div>
                                  )}
                                </div>

                                {/* Right: Title & Description (7 cols) */}
                                <div className="md:col-span-7 space-y-2.5">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      Step Title (Optional &bull; Max 1 line)
                                    </label>
                                    <input
                                      type="text"
                                      value={step.title || ""}
                                      onChange={(e) => updateHowToUseStep(step.id, "title", e.target.value)}
                                      placeholder="e.g. Plug & Power On"
                                      maxLength={60}
                                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FF7A00]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      Short Description (Optional &bull; Max 2 lines)
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={step.description || ""}
                                      onChange={(e) => updateHowToUseStep(step.id, "description", e.target.value)}
                                      placeholder="e.g. Connect the included USB cable to any 5V USB adapter, power bank, or laptop."
                                      maxLength={140}
                                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#FF7A00] resize-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4. Live Storefront Interactive Preview */}
                  {formHowToUseSteps.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#FF7A00]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Live Storefront Preview
                          </h4>
                        </div>

                        {/* Mobile vs Desktop Toggle */}
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setHowToUsePreviewMode("mobile")}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                              howToUsePreviewMode === "mobile"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Mobile (3 Cards)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHowToUsePreviewMode("desktop")}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                              howToUsePreviewMode === "desktop"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>Desktop (4-5 Cards)</span>
                          </button>
                        </div>
                      </div>

                      {/* Preview Container */}
                      <div className="bg-slate-100/70 p-3 sm:p-5 rounded-2xl flex justify-center overflow-hidden">
                        <div
                          className={`w-full transition-all duration-300 ${
                            howToUsePreviewMode === "mobile"
                              ? "max-w-[390px] bg-white rounded-3xl shadow-lg border border-slate-200/90 overflow-hidden"
                              : "max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                          }`}
                        >
                          {/* Simulated Phone Top Speaker pill in mobile preview */}
                          {howToUsePreviewMode === "mobile" && (
                            <div className="pt-2.5 pb-1 flex justify-center items-center bg-white border-b border-slate-100">
                              <div className="w-12 h-1 bg-slate-300 rounded-full" />
                            </div>
                          )}

                          <HowToUseSection
                            previewMode={howToUsePreviewMode}
                            isPreview={true}
                            config={{
                              enabled: true,
                              section_bg: formHowToUseSectionBg,
                              card_radius: formHowToUseCardRadius,
                              card_border: formHowToUseCardBorder,
                              card_shadow: formHowToUseCardShadow,
                              steps: formHowToUseSteps,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  TAB 8: ACTION VIDEOS (SEE IT IN ACTION)
                 ======================================================== */}
              {activeTab === "action_videos" && (
                <div className="space-y-6">
                  {/* 1. Header Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shadow-xs">
                          <Video className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          SEE IT IN ACTION Videos
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20">
                          {formVideoIds.length} Selected
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        Select which videos from your store&apos;s Social Proof library show in the &quot;SEE IT IN ACTION&quot; section on this product&apos;s page. Each product displays only its own selected videos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={fetchAvailableVideos}
                        disabled={loadingVideos}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
                        title="Refresh video list"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingVideos ? "animate-spin text-[#FF7A00]" : "text-slate-500"}`} />
                        <span>Refresh</span>
                      </button>

                      <a
                        href="/admin/reviews?tab=videos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Manage All Videos in Social Proof</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* 2. Filter & Bulk Selection Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={videoSearchTerm}
                        onChange={(e) => setVideoSearchTerm(e.target.value)}
                        placeholder="Search videos by title or badge..."
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                      />
                      {videoSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setVideoSearchTerm("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = availableVideos
                            .filter((v) => {
                              if (!videoSearchTerm.trim()) return true;
                              const q = videoSearchTerm.toLowerCase();
                              return (
                                v.title?.toLowerCase().includes(q) ||
                                v.badge?.toLowerCase().includes(q) ||
                                v.productId?.toLowerCase().includes(q)
                              );
                            })
                            .map((v) => v.id);
                          setFormVideoIds(Array.from(new Set([...formVideoIds, ...filtered])));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold transition-colors"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormVideoIds([])}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-slate-700 font-semibold transition-colors"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  {/* 3. Videos Grid */}
                  {loadingVideos ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={`vid-skel-${n}`}
                          className="aspect-[9/16] rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : availableVideos.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center mx-auto">
                        <Video className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-900 text-sm">No videos found in library</h5>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Videos are added and managed under Admin &gt; Social Proof &gt; Videos tab. Once you add videos there, they will automatically appear here so you can assign them to this product.
                        </p>
                      </div>
                      <a
                        href="/admin/reviews?tab=videos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Video in Social Proof</span>
                      </a>
                    </div>
                  ) : (
                    (() => {
                      const filtered = availableVideos.filter((v) => {
                        if (!videoSearchTerm.trim()) return true;
                        const q = videoSearchTerm.toLowerCase();
                        return (
                          v.title?.toLowerCase().includes(q) ||
                          v.badge?.toLowerCase().includes(q) ||
                          v.productId?.toLowerCase().includes(q)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <p className="text-xs font-semibold text-slate-600">
                              No videos match &quot;{videoSearchTerm}&quot;
                            </p>
                            <button
                              type="button"
                              onClick={() => setVideoSearchTerm("")}
                              className="text-xs font-bold text-[#FF7A00] hover:underline"
                            >
                              Clear search
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                          {filtered.map((v) => {
                            const isSelected = formVideoIds.includes(v.id);
                            const poster =
                              v.posterUrl ||
                              v.productImage ||
                              "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800";

                            return (
                              <div
                                key={v.id}
                                onClick={() => {
                                  setFormVideoIds((prev) =>
                                    prev.includes(v.id)
                                      ? prev.filter((id) => id !== v.id)
                                      : [...prev, v.id]
                                  );
                                }}
                                className={`group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer select-none border-2 transition-all duration-200 ${
                                  isSelected
                                    ? "border-[#FF7A00] ring-3 ring-[#FF7A00]/25 shadow-lg shadow-orange-500/15"
                                    : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                                }`}
                              >
                                {/* Background Image or Poster */}
                                <img
                                  src={poster}
                                  alt={v.title}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Top Gradient & Controls */}
                                <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
                                  {v.badge ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#FF7A00] text-white shadow-xs">
                                      {v.badge}
                                    </span>
                                  ) : (
                                    <span />
                                  )}

                                  {/* Selection Checkmark Bubble */}
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-[#FF7A00] text-white shadow-md scale-105"
                                        : "bg-black/40 backdrop-blur-xs border-2 border-white/80 group-hover:border-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>

                                {/* Preview Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVideoPreviewItem(v);
                                  }}
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Preview video"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Bottom Info Gradient */}
                                <div className="absolute inset-x-0 bottom-0 p-3 pt-8 bg-gradient-to-t from-black via-black/75 to-transparent z-10 text-white space-y-1">
                                  <p className="text-xs font-bold leading-tight line-clamp-2 drop-shadow-xs">
                                    {v.title}
                                  </p>
                                  <div className="flex items-center justify-between text-[10.5px] text-white/80 pt-0.5">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {v.viewsText || "24.5k"}
                                    </span>
                                    {isSelected ? (
                                      <span className="text-[10px] font-bold text-[#FF9E40] uppercase">
                                        Selected
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-white/60">Tap to select</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}

                  {/* 4. Helpful Guidance Note */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>How this works:</strong> Only the checked videos above will appear in the &quot;SEE IT IN ACTION&quot; section on this product&apos;s storefront page. If 0 videos are selected, the &quot;SEE IT IN ACTION&quot; section is automatically hidden on this product.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Pinned Sticky Footer (shrink-0) - ALWAYS VISIBLE! */}
            {/* 4. Pinned Sticky Footer (shrink-0) - Step Navigation & Create/Update */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/95 flex items-center justify-between shrink-0 gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                {activeTab !== "basic" && (
                  <button
                    type="button"
                    onClick={handlePrevTab}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] font-medium text-slate-500 hidden sm:flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">
                  Step {FORM_TABS_LIST.indexOf(activeTab) + 1} of {FORM_TABS_LIST.length}:
                </span>
                <span>
                  {activeTab === "basic" && "Basic Info"}
                  {activeTab === "pricing" && "Pricing & Stock"}
                  {activeTab === "media" && "Poster & Gallery"}
                  {activeTab === "colors" && "Colors & Multi-Angle Photos"}
                  {activeTab === "overview" && "Product Details & Overview"}
                  {activeTab === "specs" && "Specs & Box"}
                  {activeTab === "how_to_use" && "How to Use"}
                  {activeTab === "action_videos" && "Action Videos"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {editingProduct && activeTab !== "action_videos" && (
                  <button
                    key="btn-step-save-changes-early"
                    type="button"
                    onClick={(e) => handleSaveProduct(e)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-emerald-600/25 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}

                {activeTab !== "action_videos" ? (
                  <button
                    key={`btn-step-${activeTab}`}
                    type="button"
                    onClick={(e) => handleNextTab(e)}
                    className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-orange-500/25 flex items-center gap-2 active:scale-[0.98]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    key="btn-step-create-submit"
                    type="button"
                    onClick={(e) => handleSaveProduct(e)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-orange-500/25 flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving to Cloudflare D1...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {mediaLibraryModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Reusable Media Library</h3>
                <p className="text-xs text-slate-500">Pick any image or video previously uploaded to the store</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMediaLibraryModalOpen(false);
                  setMediaLibraryTargetStepId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from(
                new Set(
                  products
                    .flatMap((p) => [
                      p.poster_image,
                      ...(p.images || []),
                      ...(p.overview_blocks || []).map((b) => b.media_url),
                      ...(p.how_to_use?.steps || []).map((s) => s.media_url),
                    ])
                    .filter((url): url is string => Boolean(url && typeof url === "string" && url.trim().length > 0))
                )
              ).map((url, i) => (
                <button
                  key={`med-lib-${i}`}
                  type="button"
                  onClick={() => {
                    if (mediaLibraryTargetStepId) {
                      updateHowToUseStep(mediaLibraryTargetStepId, "media_url", url);
                    }
                    setMediaLibraryModalOpen(false);
                    setMediaLibraryTargetStepId(null);
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-[#FF7A00] hover:ring-2 hover:ring-[#FF7A00]/20 bg-slate-50 transition-all cursor-pointer"
                >
                  <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pre-Publish Empty Step Warning Modal (Specification §10) */}
      {emptyStepWarningModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">Empty Step Warning</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Step {String(emptyStepWarningModal.stepIndex).padStart(2, "0")} has no media, title, or description.
                  This step will appear empty on the product page. Do you still want to publish?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEmptyStepWarningModal(null);
                  setActiveTab("how_to_use");
                  const cardEl = document.getElementById(`step-card-${emptyStepWarningModal.stepId}`);
                  if (cardEl) {
                    cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                Review Step
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setEmptyStepWarningModal(null);
                  handleSaveProduct(e, true);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold transition-all shadow-xs"
              >
                Publish Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: "contain" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-800">
                  {deleteConfirmProduct.name}
                </span>{" "}
                from the store catalog?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteConfirmProduct.id)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Video Preview Modal */}
      {videoPreviewItem && (
        <div
          data-lenis-prevent="true"
          onClick={() => setVideoPreviewItem(null)}
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl border border-slate-700 flex flex-col cursor-default"
          >
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-white bg-slate-900">
              <span className="font-bold text-xs truncate max-w-[220px]">
                {videoPreviewItem.title}
              </span>
              <button
                type="button"
                onClick={() => setVideoPreviewItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-[9/16] bg-black flex items-center justify-center">
              <video
                src={videoPreviewItem.videoUrl}
                poster={videoPreviewItem.posterUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
