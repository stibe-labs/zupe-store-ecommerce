"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  Truck,
  ShoppingBag,
  LogOut,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Building,
  Home,
  Star,
  Loader2,
  AlertCircle,
  Shield,
  LayoutDashboard,
  Eye,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { UserAddress } from "@/lib/addressStore";
import { deduplicateAddresses } from "@/lib/addressUtils";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUserProfile } = useAuth();
  const { totalWishlistItems, toggleWishlist, isInWishlist } = useWishlist();
  const { totalItems, openCart } = useCart();

  // Delivery Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressNotice, setAddressNotice] = useState<string | null>(null);
  const [showAddresses, setShowAddresses] = useState(false);

  // Recently Viewed Catalog State
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  // Add / Edit Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Edit Profile / Phone Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Strict Super Admin Verification State (only true for verified admin@zupestore.com)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load products for Recently Viewed carousel
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setRecentProducts(data.products.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  // Strictly verify Super Admin credentials & cryptographic session
  useEffect(() => {
    const isCandidate =
      user?.role === "admin" &&
      user?.email?.toLowerCase().trim() === "admin@zupestore.com";

    if (!isCandidate) {
      setIsSuperAdmin(false);
      return;
    }

    setIsSuperAdmin(true);

    let isMounted = true;
    fetch("/api/admin/auth/verify")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (!data?.isSuperAdmin) {
            setIsSuperAdmin(false);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.role]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin?redirect=/account&notice=Please sign in to access your account profile");
    }
  }, [isLoading, isAuthenticated, router]);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (isAddressModalOpen || isProfileModalOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAddressModalOpen, isProfileModalOpen]);

  // Key for local address cache
  const getCacheKey = (email: string) => `zp_user_addresses_${email.toLowerCase().trim()}`;

  // Load and auto-sync delivery addresses for this customer
  const loadAddresses = async () => {
    if (!user?.email) return;

    try {
      const cached = localStorage.getItem(getCacheKey(user.email));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(deduplicateAddresses<UserAddress>(parsed));
        }
      }
    } catch {}

    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.addresses)) {
          const uniqueServer = deduplicateAddresses<UserAddress>(data.addresses);
          setAddresses(uniqueServer);
          localStorage.setItem(getCacheKey(user.email), JSON.stringify(uniqueServer));
        }
      }
    } catch (err) {
      console.warn("Could not sync addresses from server:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadAddresses();
    }
  }, [isAuthenticated, user?.email]);

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setRecipientName(user?.name || "");
    setAddressPhone(user?.phone || "");
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setTag("Home");
    setIsDefault(addresses.length === 0);
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setRecipientName(addr.recipient_name);
    setAddressPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state || "");
    setPostalCode(addr.postal_code);
    setTag(addr.tag || "Home");
    setIsDefault(Boolean(addr.is_default));
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !addressPhone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      setAddressError("Please fill out all required fields.");
      return;
    }

    if (addressPhone.replace(/\D/g, "").length < 10) {
      setAddressError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setAddressSaving(true);
    setAddressError("");

    const payload = {
      recipient_name: recipientName.trim(),
      phone: addressPhone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postal_code: postalCode.trim(),
      country: "India",
      tag,
      is_default: isDefault,
    };

    try {
      const url = "/api/user/addresses";
      const method = editingAddressId ? "PUT" : "POST";
      const body = editingAddressId ? JSON.stringify({ id: editingAddressId, ...payload }) : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddressModalOpen(false);
        setAddressNotice(editingAddressId ? "Address updated successfully" : "New delivery address added");
        setTimeout(() => setAddressNotice(null), 3500);
        await loadAddresses();
      } else {
        setAddressError(data.error || "Failed to save address. Please try again.");
      }
    } catch {
      setAddressError("Network error. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;

    try {
      const res = await fetch(`/api/user/addresses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddressNotice("Address removed");
        setTimeout(() => setAddressNotice(null), 3000);
        await loadAddresses();
      }
    } catch (err) {
      console.warn("Error deleting address:", err);
    }
  };

  const handleOpenProfileModal = () => {
    setProfileName(user?.name || "");
    setProfilePhone(user?.phone || "");
    setProfileError("");
    setProfileSuccess(false);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }

    if (profilePhone.trim() && profilePhone.replace(/\D/g, "").length < 10) {
      setProfileError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");

    const result = await updateUserProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
    });

    setProfileSaving(false);

    if (result.success) {
      setProfileSuccess(true);
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setProfileSuccess(false);
      }, 1200);
    } else {
      setProfileError(result.error || "Failed to update profile.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#FF7A00]/20 border-t-[#FF7A00] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-6">
            View your orders, manage saved delivery addresses, and track shipments in real-time.
          </p>
          <div className="space-y-3">
            <Link
              href="/signin?redirect=/account"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#FF7A00] text-white font-bold text-sm shadow-md shadow-[#FF7A00]/20 hover:bg-[#E66E00] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signin?mode=signup&redirect=/account"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              Create New Account
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] flex flex-col justify-between pb-24 sm:pb-0">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-7 space-y-4">
        {/* ========================================================
            1. TOP PROFILE BANNER (DARK GRADIENT CARD)
           ======================================================== */}
        <div className="bg-gradient-to-b from-[#181C24] via-[#14171E] to-[#0E1015] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7A00]/12 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-4 mb-4">
            {/* Avatar squircle with initial */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#FF7A00] via-[#FF8C26] to-[#FFA742] text-white flex items-center justify-center font-display font-extrabold text-2xl sm:text-3xl shadow-lg shadow-[#FF7A00]/25 shrink-0">
              {initial}
            </div>

            {/* Profile Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white truncate">
                  {user.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF9E40] text-[10px] font-bold tracking-wide uppercase border border-[#FF7A00]/40">
                    <Shield className="w-3 h-3 text-[#FF7A00]" />
                    Admin
                  </span>
                )}
              </div>

              {/* Phone */}
              {user.phone ? (
                <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-2 font-medium mb-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                  <span>{user.phone}</span>
                </p>
              ) : null}

              {/* Email */}
              {user.email && !user.email.includes("@customer.zupestore.com") && !user.email.includes("example.com") && !user.email.startsWith("test@") ? (
                <p className="text-xs text-slate-400 flex items-center gap-2 truncate mb-2.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              ) : null}

              {/* Edit Profile Details pill button */}
              <button
                type="button"
                onClick={handleOpenProfileModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-colors shadow-xs"
              >
                <Edit2 className="w-3 h-3 text-[#FF7A00]" />
                <span>Edit Profile Details</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Sign Out + Admin Portal */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3 relative z-10">
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 hover:text-white transition-colors border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {isSuperAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF7A00]/20 hover:bg-[#FF7A00]/30 text-xs font-bold text-[#FF9E40] hover:text-white transition-colors border border-[#FF7A00]/40"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>
        </div>

        {/* Global Toast Notice */}
        {addressNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addressNotice}</span>
          </div>
        )}

        {/* ========================================================
            2. THE 5 NAVIGATION MENU ITEMS (SLEEK CARD ROWS)
           ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Row 1: My Orders */}
          <Link
            href="/orders"
            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50/90 text-[#FF7A00] border border-orange-100/60 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF7A00] transition-colors">
                My Orders
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Row 2: Order Tracking */}
          <Link
            href="/order-tracking"
            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50/90 text-[#FF7A00] border border-orange-100/60 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF7A00] transition-colors">
                Order Tracking
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Row 3: My Wishlist */}
          <Link
            href="/wishlist"
            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50/90 text-[#FF7A00] border border-orange-100/60 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF7A00] transition-colors">
                My Wishlist
              </span>
            </div>
            <div className="flex items-center gap-2">
              {totalWishlistItems > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                  {totalWishlistItems} saved
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          {/* Row 4: Delivery Addresses (Expandable) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAddresses((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50/90 text-[#FF7A00] border border-orange-100/60 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF7A00] transition-colors">
                  Delivery Addresses
                </span>
              </div>
              <div className="flex items-center gap-2">
                {addresses.length > 0 && (
                  <span className="text-xs text-slate-400 font-medium">
                    {addresses.length} saved
                  </span>
                )}
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${
                    showAddresses ? "rotate-90 text-[#FF7A00]" : ""
                  }`}
                />
              </div>
            </button>

            {/* Expandable Addresses Management Drawer */}
            {showAddresses && (
              <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>Saved Addresses ({addresses.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF7A00] text-white text-xs font-bold hover:bg-[#E66E00] shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="py-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#FF7A00] animate-spin" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6 px-3 rounded-xl bg-white border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">No delivery addresses saved yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                    >
                      + Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`rounded-xl p-3 bg-white border transition-all ${
                          addr.is_default
                            ? "border-[#FF7A00]/50 ring-1 ring-[#FF7A00]/20 shadow-xs"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{addr.recipient_name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                              {addr.tag || "Home"}
                            </span>
                            {addr.is_default && (
                              <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] text-[9px] font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                              aria-label="Edit address"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              aria-label="Delete address"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {addr.phone && (
                          <p className="text-[11px] text-slate-500 mb-0.5">{addr.phone}</p>
                        )}
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 5: Shopping Bag */}
          <button
            type="button"
            onClick={openCart}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50/90 text-[#FF7A00] border border-orange-100/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF7A00] transition-colors">
                Shopping Bag
              </span>
            </div>
            <div className="flex items-center gap-2">
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#FF7A00] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        </div>

        {/* ========================================================
            3. RECENTLY VIEWED SECTION
           ======================================================== */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Recently Viewed
              </h3>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold text-[#FF7A00] hover:text-[#E66E00] flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Horizontal Product Carousel */}
          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {recentProducts.slice(0, 4).map((prod) => {
              const imageSrc = prod.poster_image || prod.images?.[0] || "/zupe-logo.webp";
              const inWishlist = isInWishlist(prod.id);

              return (
                <div
                  key={prod.id}
                  className="w-[130px] sm:w-[145px] shrink-0 snap-start bg-slate-50/70 rounded-xl p-2 sm:p-2.5 border border-slate-100 flex flex-col justify-between group hover:border-orange-200 transition-colors"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-2">
                    <Image
                      src={imageSrc}
                      alt={prod.name || "Product"}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(prod);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-slate-600 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          inWishlist ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <Link href={`/products/${prod.id}`}>
                    <h4 className="text-[11px] sm:text-xs font-semibold text-slate-800 line-clamp-2 leading-tight mb-2 min-h-[28px] hover:text-[#FF7A00] transition-colors">
                      {prod.name}
                    </h4>
                  </Link>

                  <Link
                    href={`/products/${prod.id}`}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#FF7A00] hover:bg-[#E66E00] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Buy Now</span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* ========================================================
            4. 24/7 DEDICATED SUPPORT (DARK NAVY CARD)
           ======================================================== */}
        <div className="bg-[#0B1220] text-white rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF7A00]/12 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-[#FF7A00] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>24/7 DEDICATED SUPPORT</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
              Need help with an order or address change?
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 font-normal">
              Our support concierge is standing by to resolve courier deliveries, returns, or order modifications.
            </p>

            <div className="flex items-center gap-2.5">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20need%20help%20with%20my%20order%20or%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* Call Us Button */}
              <a
                href="tel:+919744122853"
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-white/10 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Modal 1: Add / Edit Delivery Address ─── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div data-lenis-prevent className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-gray-900">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-gray-500">
                  This address will be available for 1-click checkout.
                </p>
              </div>
            </div>

            {addressError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Street Address / House No. / Area *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat / House No., Apartment, Street, Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="6-digit PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>
              </div>

              {/* Address Tag Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Address Type
                </label>
                <div className="flex items-center gap-3">
                  {(["Home", "Work", "Other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        tag === t
                          ? "bg-[#FF7A00] text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {t === "Home" && <Home className="w-3.5 h-3.5" />}
                      {t === "Work" && <Building className="w-3.5 h-3.5" />}
                      {t === "Other" && <MapPin className="w-3.5 h-3.5" />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00] cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-700">
                  Make this my default delivery address
                </span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold shadow-md shadow-[#FF7A00]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {addressSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Address</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Edit Profile & Phone Number ─── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div data-lenis-prevent className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-gray-900">
                  Update Profile Details
                </h3>
                <p className="text-xs text-gray-500">
                  Manage your name and phone number for delivery updates.
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Used for order tracking SMS, courier OTP, and delivery coordination.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving || profileSuccess}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold shadow-md shadow-[#FF7A00]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
