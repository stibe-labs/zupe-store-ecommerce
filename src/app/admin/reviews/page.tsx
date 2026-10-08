"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Star,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  Loader2,
  Eye,
  RefreshCw,
  ShoppingBag,
  Layers,
  Sparkles,
  Check,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ImageIcon,
  Video,
  Play,
  Edit,
} from "lucide-react";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { ProductReview } from "@/lib/reviewStore";
import { ProductVideo } from "@/lib/videoStore";

// Robust client-side CSV Parser supporting quoted fields, escaped commas & line breaks
function parseCSV(text: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentLine += '"';
      i++; // skip escaped quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length < 2) return [];

  // Parse header
  const parseRow = (line: string): string[] => {
    const row: string[] = [];
    let field = "";
    let inside = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      const nc = line[j + 1];
      if (c === '"' && inside && nc === '"') {
        field += '"';
        j++;
      } else if (c === '"') {
        inside = !inside;
      } else if (c === "," && !inside) {
        row.push(field.trim());
        field = "";
      } else {
        field += c;
      }
    }
    row.push(field.trim());
    return row;
  };

  const rawHeaders = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  const data: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, idx) => {
      rowObj[header] = values[idx] || "";
    });
    data.push(rowObj);
  }

  return data;
}

export default function AdminReviewsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productsList, setProductsList] = useState(DEFAULT_PRODUCTS);

  // Filters
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("all");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Manual Review Form State
  const [manualForm, setManualForm] = useState({
    productId: DEFAULT_PRODUCTS[0]?.slug || "dynamic-water-ripple-night-light",
    userName: "",
    rating: 5,
    title: "",
    comment: "",
    source: "amazon",
    images: "",
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  // CSV Importer State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [defaultImportProduct, setDefaultImportProduct] = useState("auto");
  const [defaultImportSource, setDefaultImportSource] = useState("amazon");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab Switcher: "reviews" vs "videos"
  const [activeTab, setActiveTab] = useState<"reviews" | "videos">("reviews");

  // Video Reels Management State
  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ProductVideo | null>(null);
  const [deleteConfirmVideoId, setDeleteConfirmVideoId] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [videoFilterProduct, setVideoFilterProduct] = useState("all");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [previewModalVideo, setPreviewModalVideo] = useState<ProductVideo | null>(null);

  const [videoForm, setVideoForm] = useState({
    id: "",
    productId: "all",
    title: "",
    videoUrl: "",
    posterUrl: "",
    viewsText: "24.5k",
    badge: "NEW",
    active: true,
  });
  const [submittingVideo, setSubmittingVideo] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalReviews: 0,
    avgRating: "5.0",
    bySource: { storefront: 0, amazon: 0, flipkart: 0, meesho: 0, imported: 0 },
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // Fetch reviews & videos & catalog
  const fetchReviews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch(`/api/admin/videos?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.warn("Failed to fetch videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchReviews(), fetchVideos()]);
  };

  useEffect(() => {
    refreshAll();

    // Fetch dynamic products if available
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      id: "",
      productId: productsList[0]?.slug || "all",
      title: "",
      videoUrl: "",
      posterUrl: "",
      viewsText: "24.5k",
      badge: "NEW",
      active: true,
    });
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v: ProductVideo) => {
    setEditingVideo(v);
    setVideoForm({
      id: v.id,
      productId: v.productId || "all",
      title: v.title,
      videoUrl: v.videoUrl,
      posterUrl: v.posterUrl || "",
      viewsText: v.viewsText || "24.5k",
      badge: v.badge || "NEW",
      active: v.active !== false,
    });
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.videoUrl) return;
    setSubmittingVideo(true);

    try {
      const isEdit = Boolean(editingVideo && editingVideo.id);
      const payload = isEdit
        ? { action: "update", ...videoForm }
        : videoForm;

      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchVideos();
        setVideoModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving video:", err);
    } finally {
      setSubmittingVideo(false);
    }
  };

  const handleDeleteVideo = async (vidId: string) => {
    setDeletingVideo(true);
    try {
      const res = await fetch(`/api/admin/videos?id=${encodeURIComponent(vidId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v.id !== vidId));
        setDeleteConfirmVideoId(null);
      }
    } catch (err) {
      console.error("Error deleting video:", err);
    } finally {
      setDeletingVideo(false);
    }
  };

  const handleToggleVideoActive = async (vid: ProductVideo) => {
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: vid.id,
          active: !vid.active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === vid.id ? { ...v, active: !v.active } : v))
        );
      }
    } catch (err) {
      console.warn("Failed to toggle video active status:", err);
    }
  };

  // Video file upload reader
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setVideoForm((prev) => ({ ...prev, videoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Poster photo upload reader
  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setVideoForm((prev) => ({ ...prev, posterUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedProductFilter !== "all") {
        const pSlug = (r.productId || "").toLowerCase();
        if (pSlug !== selectedProductFilter.toLowerCase() && !pSlug.includes(selectedProductFilter.toLowerCase())) {
          return false;
        }
      }
      if (selectedSourceFilter !== "all") {
        const src = (r.source || "storefront").toLowerCase();
        if (src !== selectedSourceFilter.toLowerCase()) return false;
      }
      if (selectedRatingFilter !== "all") {
        if (r.rating !== Number(selectedRatingFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (r.userName || "").toLowerCase().includes(q);
        const matchesComment = (r.comment || "").toLowerCase().includes(q);
        const matchesTitle = (r.title || "").toLowerCase().includes(q);
        const matchesProduct = (r.productId || "").toLowerCase().includes(q);
        if (!matchesName && !matchesComment && !matchesTitle && !matchesProduct) return false;
      }
      return true;
    });
  }, [reviews, selectedProductFilter, selectedSourceFilter, selectedRatingFilter, searchQuery]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (videoFilterProduct !== "all") {
        const vPid = (v.productId || "").toLowerCase();
        const targetPid = videoFilterProduct.toLowerCase();
        if (vPid !== targetPid && vPid !== "all") return false;
      }
      if (videoSearchQuery.trim()) {
        const q = videoSearchQuery.toLowerCase().trim();
        const matchesTitle = (v.title || "").toLowerCase().includes(q);
        const matchesProduct = (v.productId || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesProduct) return false;
      }
      return true;
    });
  }, [videos, videoFilterProduct, videoSearchQuery]);

  // Product helper lookup
  const getProductInfo = (prodSlug: string) => {
    const norm = (prodSlug || "").toLowerCase();
    const found = productsList.find(
      (p) =>
        p.slug?.toLowerCase() === norm ||
        p.id?.toLowerCase() === norm ||
        norm.includes(p.slug?.toLowerCase() || "") ||
        norm.includes(p.id?.toLowerCase() || "")
    );
    return {
      name: found?.name || prodSlug || "Unknown Product",
      image: found?.poster_image || found?.images?.[0] || "/products/ripple/ripple-amber.jpg",
      slug: found?.slug || prodSlug,
    };
  };

  // Delete review
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Sample CSV generator & downloader
  const handleDownloadSampleCSV = () => {
    const csvRows = [
      ["product_slug", "rating", "user_name", "title", "comment", "created_at", "images", "source"],
      [
        "portable-menstrual-heating-pad",
        "5",
        "Pooja Sharma",
        "Absolute life saver during periods",
        "Relieved cramping within 10 minutes. 3 heat modes and gentle vibration are wonderful. Premium velvety fabric.",
        "2026-02-14",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
        "Amazon",
      ],
      [
        "portable-menstrual-heating-pad",
        "5",
        "Anjali Menon",
        "Very effective and portable",
        "Battery lasts almost 3 hours on medium heat. Highly recommended for all working women.",
        "2026-02-01",
        "",
        "Flipkart",
      ],
      [
        "dynamic-water-ripple-night-light",
        "5",
        "Rohit Verma",
        "Mesmerizing ceiling visual",
        "The rotating water ripple effect looks incredible at night in our bedroom. Solid wood base feels heavy.",
        "2026-01-28",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600",
        "Amazon",
      ],
      [
        "tf20-multipurpose-powerbank-with-airpods",
        "5",
        "Vikram Patel",
        "Super convenient 2-in-1 gadget",
        "Charges phone while earbuds are charging. Great bass and LED percentage display.",
        "2026-02-05",
        "",
        "Flipkart",
      ],
      [
        "mini-steam-iron",
        "4",
        "Kavita Rao",
        "Heats up very fast",
        "Handy for traveling and quick wrinkle removal on cotton and linen shirts.",
        "2026-01-18",
        "",
        "Amazon",
      ],
      [
        "car-fragrance-helicopter",
        "5",
        "Arjun Nair",
        "Solar rotor spins beautifully",
        "Looks great on dashboard. Whenever sunlight hits it starts rotating smoothly.",
        "2026-02-10",
        "",
        "Flipkart",
      ],
    ];

    const csvContent = csvRows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = String(cell).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "zupe-reviews-sample-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File change handler for CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        // Normalize rows mapping standard & Shopify Judge.me / Loox formats
        const mapped = rows.map((r) => {
          const productSlug =
            r.productslug ||
            r.product_slug ||
            r.productid ||
            r.product_id ||
            r.producthandle ||
            r.product_handle ||
            r.handle ||
            r.product ||
            "";

          const rating = Number(r.rating || r.score || r.stars || r.star_rating) || 5;

          const userName =
            r.username ||
            r.user_name ||
            r.reviewername ||
            r.reviewer_name ||
            r.name ||
            r.nickname ||
            r.author ||
            "Verified Customer";

          const title = r.title || r.reviewtitle || r.review_title || r.headline || r.subject || "";

          const comment =
            r.comment ||
            r.review ||
            r.review_text ||
            r.reviewtext ||
            r.body ||
            r.review_body ||
            r.reviewbody ||
            r.content ||
            r.description ||
            "";

          const createdAt = r.createdat || r.created_at || r.reviewdate || r.review_date || r.date || "";

          const images = r.images || r.photos || r.pictureurls || r.picture_urls || r.imgurl || r.img_url || "";

          const source = r.source || r.platform || r.channel || defaultImportSource || "import";

          return {
            productSlug,
            rating,
            userName,
            title,
            comment,
            createdAt,
            images,
            source,
            isValid: Boolean(comment.trim() && (productSlug.trim() || defaultImportProduct !== "auto")),
          };
        });

        setParsedRows(mapped);
      } catch (parseErr) {
        console.error("Failed to parse CSV file:", parseErr);
        setImportResult({ success: false, message: "Could not parse CSV file. Please verify file formatting." });
      }
    };
    reader.readAsText(file);
  };

  // Submit bulk CSV import
  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setImportResult(null);

    const validRows = parsedRows.filter((r) => r.isValid || defaultImportProduct !== "auto");

    const payload = validRows.map((r) => ({
      productId: defaultImportProduct !== "auto" ? defaultImportProduct : r.productSlug,
      userName: r.userName,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      createdAt: r.createdAt || new Date().toISOString(),
      images: r.images,
      source: r.source || defaultImportSource,
      verifiedPurchase: true,
    }));

    try {
      const res = await fetch("/api/admin/reviews/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews: payload,
          defaultProductId: defaultImportProduct !== "auto" ? defaultImportProduct : undefined,
          defaultSource: defaultImportSource,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult({
          success: true,
          message: `Success! ${data.inserted} reviews imported successfully.`,
        });
        fetchReviews();
        setTimeout(() => {
          setImportModalOpen(false);
          setCsvFile(null);
          setParsedRows([]);
        }, 1500);
      } else {
        setImportResult({ success: false, message: data.error || "Import failed. Please try again." });
      }
    } catch (err: any) {
      setImportResult({ success: false, message: err.message || "Failed to communicate with import endpoint." });
    } finally {
      setIsImporting(false);
    }
  };

  // Submit manual review
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.comment.trim()) return;

    setSubmittingManual(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: manualForm.productId,
          userName: manualForm.userName || "Verified Customer",
          rating: Number(manualForm.rating) || 5,
          title: manualForm.title,
          comment: manualForm.comment,
          source: manualForm.source,
          images: manualForm.images ? [manualForm.images] : [],
          verifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchReviews();
        setManualModalOpen(false);
        setManualForm({
          productId: DEFAULT_PRODUCTS[0]?.slug || "dynamic-water-ripple-night-light",
          userName: "",
          rating: 5,
          title: "",
          comment: "",
          source: "amazon",
          images: "",
        });
      }
    } catch (err) {
      console.error("Manual review add failed:", err);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Render Source Badge helper
  const renderSourceBadge = (source?: string) => {
    const src = (source || "storefront").toLowerCase();
    switch (src) {
      case "amazon":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Amazon India
          </span>
        );
      case "flipkart":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Flipkart
          </span>
        );
      case "meesho":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-fuchsia-500/10 text-fuchsia-700 border border-fuchsia-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
            Meesho
          </span>
        );
      case "judge.me":
      case "loox":
      case "shopify":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Shopify Import
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Storefront Buyer
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={refreshAll}
          isRefreshing={isRefreshing || loadingVideos}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Title & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-[#FA521C]">
                  <Sparkles className="w-5 h-5 fill-current" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Social Proof Hub
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage verified customer ratings, CSV imports, and shoppable 9:16 product videos & reels.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {activeTab === "reviews" ? (
                <>
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    title="Download CSV Template with sample Amazon & Flipkart reviews"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sample CSV</span>
                  </button>

                  <button
                    onClick={() => setManualModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FA521C]" />
                    <span>Add Review</span>
                  </button>

                  <button
                    onClick={() => {
                      setImportModalOpen(true);
                      setImportResult(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-orange-500/25 active:scale-[0.98] cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Reviews (CSV)</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenAddVideo}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-orange-500/25 active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Attach New Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Social Proof Segment Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#FA521C] text-white shadow-sm shadow-orange-500/25"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>1. Customer Reviews ({reviews.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "videos"
                  ? "bg-[#FA521C] text-white shadow-sm shadow-orange-500/25"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>2. Shoppable Product Videos & Reels ({videos.length})</span>
            </button>
          </div>

          {/* ========================================================
              TAB 1: CUSTOMER REVIEWS
             ======================================================== */}
          {activeTab === "reviews" && (
            <div className="space-y-6">

          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Reviews
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {reviews.length}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Live
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Across all active catalog products
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Average Rating
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl sm:text-3xl font-bold text-amber-500 tracking-tight flex items-center gap-1.5">
                  <span>{metrics.avgRating}</span>
                  <Star className="w-6 h-6 fill-current" />
                </p>
                <span className="text-[11px] font-bold text-slate-500">
                  {reviews.filter((r) => r.rating === 5).length} 5-Star
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Based on verified shopper feedback
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Amazon / Flipkart Imports
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight">
                  {reviews.filter((r) => ["amazon", "flipkart", "meesho"].includes((r.source || "").toLowerCase())).length}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  External E-Com
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Social proof imported via CSV
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Storefront Verified Orders
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
                  {reviews.filter((r) => !r.source || r.source === "storefront").length}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Direct Orders
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Submitted by genuine customers
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews by customer name, comments, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Product selector */}
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FA521C]"
              >
                <option value="all">All Products ({productsList.length})</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.slug || p.id}>
                    {p.name.length > 28 ? p.name.slice(0, 28) + "..." : p.name}
                  </option>
                ))}
              </select>

              {/* Source filter */}
              <select
                value={selectedSourceFilter}
                onChange={(e) => setSelectedSourceFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FA521C]"
              >
                <option value="all">All Sources</option>
                <option value="storefront">Zupe Storefront</option>
                <option value="amazon">Amazon India</option>
                <option value="flipkart">Flipkart</option>
                <option value="meesho">Meesho</option>
                <option value="import">Other Import</option>
              </select>

              {/* Rating filter */}
              <select
                value={selectedRatingFilter}
                onChange={(e) => setSelectedRatingFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FA521C]"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Review Entries ({filteredReviews.length})
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Sorted by most recent
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#FA521C]" />
                <span className="text-xs font-semibold text-slate-500">Loading reviews database...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-20 px-4 text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FA521C] flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No reviews found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  No reviews match your current filter. Import reviews from Amazon/Flipkart via CSV or clear search filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedProductFilter("all");
                    setSelectedSourceFilter("all");
                    setSelectedRatingFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Reviewer</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Review & Comment</th>
                      <th className="py-3.5 px-4">Source</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReviews.map((rev) => {
                      const prodInfo = getProductInfo(rev.productId);
                      return (
                        <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Product */}
                          <td className="py-3 px-4 max-w-[220px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200/60">
                                <Image
                                  src={prodInfo.image}
                                  alt={prodInfo.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate" title={prodInfo.name}>
                                  {prodInfo.name}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono truncate block">
                                  {rev.productId}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Reviewer */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-bold text-slate-900">{rev.userName}</p>
                            {rev.orderId ? (
                              <span className="text-[10px] text-emerald-600 font-mono block">
                                Order: {rev.orderId}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {rev.userEmail || "Verified Buyer"}
                              </span>
                            )}
                          </td>

                          {/* Rating */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating ? "fill-current text-amber-400" : "text-slate-200"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-[11px] font-bold text-slate-700">
                                {rev.rating}.0
                              </span>
                            </div>
                          </td>

                          {/* Comment & Photos */}
                          <td className="py-3 px-4 max-w-[340px]">
                            {rev.title && (
                              <p className="font-bold text-slate-800 text-xs mb-0.5 truncate">
                                {rev.title}
                              </p>
                            )}
                            <p className="text-slate-600 line-clamp-2 leading-relaxed">
                              {rev.comment}
                            </p>
                            {rev.images && rev.images.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2">
                                {rev.images.slice(0, 3).map((img, idx) => (
                                  <a
                                    key={idx}
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200 block"
                                  >
                                    <Image src={img} alt="review pic" fill className="object-cover" unoptimized />
                                  </a>
                                ))}
                                {rev.images.length > 3 && (
                                  <span className="text-[10px] font-bold text-slate-400">
                                    +{rev.images.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Source */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderSourceBadge(rev.source)}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/products/${prodInfo.slug}#reviews`}
                                target="_blank"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="View on storefront"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => setDeleteConfirmId(rev.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

          {/* ========================================================
              TAB 2: SHOPPABLE PRODUCT VIDEOS & REELS MANAGEMENT
             ======================================================== */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              {/* Video KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Videos Attached
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      {videos.length}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <Video className="w-3 h-3" /> Reels
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Product unboxings & demos
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Active on Storefront
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
                      {videos.filter((v) => v.active !== false).length}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Visible to shoppers
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Estimated Impressions
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 tracking-tight">
                      {videos.reduce((sum, v) => {
                        const num = parseFloat((v.viewsText || "0").replace(/[^0-9.]/g, "") || "0");
                        return sum + ((v.viewsText || "").includes("k") ? Math.round(num * 1000) : Math.round(num));
                      }, 0).toLocaleString("en-IN")}+
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      <Eye className="w-3 h-3" /> Views
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Total video views
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Products Covered
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight">
                      {new Set(videos.map((v) => v.productId)).size}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Linked
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Catalog pages with reels
                  </span>
                </div>
              </div>

              {/* Video Filters & Search */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {/* Search */}
                  <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search video title or product..."
                      value={videoSearchQuery}
                      onChange={(e) => setVideoSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                    />
                  </div>

                  {/* Filter by Product */}
                  <select
                    value={videoFilterProduct}
                    onChange={(e) => setVideoFilterProduct(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                  >
                    <option value="all">All Products (Storewide)</option>
                    {productsList.map((p) => (
                      <option key={p.id || p.slug} value={p.slug || p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Showing {filteredVideos.length} of {videos.length} reels
                  </span>
                  <button
                    onClick={handleOpenAddVideo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Video</span>
                  </button>
                </div>
              </div>

              {/* Video Grid Cards */}
              {filteredVideos.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FA521C] mx-auto flex items-center justify-center mb-3">
                    <Video className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No shoppable videos found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Attach customer unboxing videos or product reels to boost conversion rates and social proof.
                  </p>
                  <button
                    onClick={handleOpenAddVideo}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Attach First Video</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredVideos.map((vid) => {
                    const prod = getProductInfo(vid.productId);
                    const poster =
                      vid.posterUrl ||
                      prod?.image ||
                      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800";

                    return (
                      <div
                        key={vid.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        {/* 9:16 Video Thumbnail Container */}
                        <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                          <img
                            src={poster}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            {vid.badge && (
                              <span className="bg-[#FF3B30] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                {vid.badge}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Eye className="w-3 h-3 text-rose-400" />
                              <span>{vid.viewsText || "24.5k"}</span>
                            </span>
                          </div>

                          {/* Center Play Button to Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewModalVideo(vid)}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform"
                            title="Preview Video"
                          >
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xs border border-white/30 text-white flex items-center justify-center group-hover:bg-[#FA521C] transition-colors shadow-lg">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </button>

                          {/* Bottom Title on Thumbnail */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white">
                            <p className="text-xs font-bold line-clamp-2 leading-snug drop-shadow-sm">
                              {vid.title}
                            </p>
                          </div>
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-3.5 space-y-2.5">
                          {/* Attached Product Tag */}
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
                                <img
                                  src={prod?.image || poster}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-800 truncate">
                                {prod?.name || (vid.productId === "all" ? "All Products" : vid.productId)}
                              </span>
                            </div>
                            {prod?.slug && (
                              <Link
                                href={`/products/${prod.slug}`}
                                target="_blank"
                                className="text-slate-400 hover:text-[#FA521C] shrink-0"
                                title="View live on store"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>

                          {/* Footer Action Controls: Active Toggle + Edit + Delete */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleToggleVideoActive(vid)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                                vid.active !== false
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${vid.active !== false ? "bg-emerald-500" : "bg-slate-400"}`} />
                              <span>{vid.active !== false ? "Active" : "Draft"}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditVideo(vid)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit video"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmVideoId(vid.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: BULK CSV / EXCEL IMPORTER
         ======================================================== */}
      {importModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setImportModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-scaleIn max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImportModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FA521C] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bulk Import Product Reviews
                </h3>
                <p className="text-xs text-slate-500">
                  Upload CSV spreadsheet from Amazon, Flipkart, or Shopify (Judge.me / Loox format).
                </p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-4 my-4">
              {/* Target Product Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign to Product
                  </label>
                  <select
                    value={defaultImportProduct}
                    onChange={(e) => setDefaultImportProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  >
                    <option value="auto">Auto-detect from CSV 'product_slug'</option>
                    {productsList.map((p) => (
                      <option key={p.id} value={p.slug || p.id}>
                        {p.name.slice(0, 32)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Source Platform
                  </label>
                  <select
                    value={defaultImportSource}
                    onChange={(e) => setDefaultImportSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  >
                    <option value="amazon">Amazon India</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="meesho">Meesho</option>
                    <option value="judge.me">Shopify (Judge.me)</option>
                    <option value="loox">Shopify (Loox)</option>
                    <option value="storefront">Zupe Storefront</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#FA521C] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 text-slate-500 mx-auto flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5 text-[#FA521C]" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {csvFile ? csvFile.name : "Click to browse or drag and drop CSV file here"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports standard CSV, Judge.me CSV, or Loox CSV export
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSampleCSV();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FA521C] hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    Download Sample CSV Template
                  </button>
                </div>
              </div>

              {/* Live Preview Table */}
              {parsedRows.length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      File Preview: {parsedRows.length} rows found
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {parsedRows.filter((r) => r.isValid || defaultImportProduct !== "auto").length} Valid
                      </span>
                      {parsedRows.filter((r) => !r.isValid && defaultImportProduct === "auto").length > 0 && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          {parsedRows.filter((r) => !r.isValid && defaultImportProduct === "auto").length} Missing Product Slug
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">Product</th>
                          <th className="p-2">User</th>
                          <th className="p-2">Rating</th>
                          <th className="p-2">Comment</th>
                          <th className="p-2">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-2 font-mono text-[10px] max-w-[120px] truncate text-slate-600">
                              {defaultImportProduct !== "auto" ? defaultImportProduct : r.productSlug || "Missing"}
                            </td>
                            <td className="p-2 font-bold text-slate-800 whitespace-nowrap">{r.userName}</td>
                            <td className="p-2 whitespace-nowrap font-bold text-amber-500">
                              {r.rating}★
                            </td>
                            <td className="p-2 max-w-[180px] truncate text-slate-600">{r.comment}</td>
                            <td className="p-2 whitespace-nowrap text-slate-500">{r.source || defaultImportSource}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 10 && (
                    <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                      Showing first 10 of {parsedRows.length} reviews
                    </p>
                  )}
                </div>
              )}

              {/* Result banner */}
              {importResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    importResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {importResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{importResult.message}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={isImporting || parsedRows.length === 0}
                className="px-5 py-2 rounded-xl bg-[#FA521C] hover:bg-[#D4380D] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing into Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Import ({parsedRows.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MANUAL REVIEW ADDITION
         ======================================================== */}
      {manualModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setManualModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setManualModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add Verified Review
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add an individual customer or imported review manually.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Product</label>
                <select
                  value={manualForm.productId}
                  onChange={(e) => setManualForm({ ...manualForm, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-[#FA521C]"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.slug || p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh K."
                    value={manualForm.userName}
                    onChange={(e) => setManualForm({ ...manualForm, userName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Platform Source</label>
                  <select
                    value={manualForm.source}
                    onChange={(e) => setManualForm({ ...manualForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  >
                    <option value="amazon">Amazon India</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="storefront">Storefront Buyer</option>
                    <option value="meesho">Meesho</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, rating: s })}
                      className={`p-2 rounded-xl flex items-center gap-1 font-bold border transition-all cursor-pointer ${
                        manualForm.rating === s
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{s}</span>
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline / Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Awesome quality and fast shipping"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Comment</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write the detailed review experience..."
                  value={manualForm.comment}
                  onChange={(e) => setManualForm({ ...manualForm, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images-amazon.com/..."
                  value={manualForm.images}
                  onChange={(e) => setManualForm({ ...manualForm, images: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-[#FA521C] hover:bg-[#D4380D] text-white font-bold transition-all shadow-sm shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingManual ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DELETE CONFIRMATION
         ======================================================== */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-scaleIn text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this review?</h3>
            <p className="text-xs text-slate-500 mt-1">
              This will permanently remove the review from both the admin dashboard and product storefront page.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL: ADD / EDIT SHOPPABLE VIDEO
         ======================================================== */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-scaleIn max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FA521C] flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVideo ? "Edit Shoppable Video" : "Attach New Shoppable Video"}
                </h3>
                <p className="text-xs text-slate-500">
                  Attach an unboxing or demo reel to a specific product or storewide.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Product Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attached Product *
                </label>
                <select
                  value={videoForm.productId}
                  onChange={(e) => setVideoForm({ ...videoForm, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#FA521C]"
                >
                  <option value="all">⭐ All Products (Storewide Reel)</option>
                  {productsList.map((p) => (
                    <option key={p.id || p.slug} value={p.slug || p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  This video will appear on this product's page between recommendations and reviews.
                </p>
              </div>

              {/* Video Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Video Title / Hook *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Heat Modes & Gentle Vibration Test"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              {/* Video Source (URL + File Upload) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Video URL or Upload File *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://.../video.mp4 (or CDN / Cloudflare Stream)"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Poster Thumbnail (URL + File Upload) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thumbnail Poster Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://.../poster.jpg (leave blank to auto-use product image)"
                    value={videoForm.posterUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, posterUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Views & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Views Display Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 29.7k"
                    value={videoForm.viewsText}
                    onChange={(e) => setVideoForm({ ...videoForm, viewsText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, TRENDING, VIRAL"
                    value={videoForm.badge}
                    onChange={(e) => setVideoForm({ ...videoForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">
                    {videoForm.active ? "Active & Visible on Store" : "Draft (Hidden)"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {videoForm.active ? "Appears in customer video reels" : "Saved in admin only"}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={videoForm.active}
                  onClick={() => setVideoForm({ ...videoForm, active: !videoForm.active })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    videoForm.active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      videoForm.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVideo}
                  className="px-5 py-2 rounded-xl bg-[#FA521C] hover:bg-[#D4380D] text-white font-bold transition-all shadow-sm shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingVideo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingVideo ? "Update Video" : "Attach Video"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LIVE VIDEO PREVIEW PLAYER
         ======================================================== */}
      {previewModalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewModalVideo(null)}
        >
          <div
            className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <video
              src={previewModalVideo.videoUrl}
              poster={previewModalVideo.posterUrl}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DELETE VIDEO CONFIRMATION
         ======================================================== */}
      {deleteConfirmVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setDeleteConfirmVideoId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-scaleIn text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this video?</h3>
            <p className="text-xs text-slate-500 mt-1">
              This will permanently detach and remove this reel from both admin and the storefront.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmVideoId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVideo(deleteConfirmVideoId)}
                disabled={deletingVideo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {deletingVideo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
