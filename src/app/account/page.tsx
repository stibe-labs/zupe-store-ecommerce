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
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { UserAddress } from "@/lib/addressStore";
import { deduplicateAddresses } from "@/lib/addressUtils";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUserProfile } = useAuth();
  const { totalWishlistItems } = useWishlist();
  const { totalItems, openCart } = useCart();

  // Delivery Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressNotice, setAddressNotice] = useState<string | null>(null);

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

  // Strict Super Admin Verification State
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const isCandidate =
      user?.role === "admin" &&
      (user?.email?.toLowerCase().trim() === "admin@vittaldigital.com" ||
        user?.email?.toLowerCase().trim() === "admin@zupestore.com");

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

  const getCacheKey = (email: string) => `zp_user_addresses_${email.toLowerCase().trim()}`;

  const loadAddresses = async () => {
    if (!user?.email) return;

    try {
      const cached = localStorage.getItem(getCacheKey(user.email));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deduplicated = deduplicateAddresses<UserAddress>(parsed);
          setAddresses(deduplicated);
          try {
            localStorage.setItem(getCacheKey(user.email), JSON.stringify(deduplicated));
          } catch (e) {}
        }
      }
    } catch (e) {}

    setLoadingAddresses(true);

    try {
      const res = await fetch(
        `/api/user/addresses?email=${encodeURIComponent(user.email || "")}&userId=${encodeURIComponent(user.id || "")}&phone=${encodeURIComponent(user.phone || "")}`
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.addresses)) {
        if (data.addresses.length > 0) {
          const deduplicated = deduplicateAddresses<UserAddress>(data.addresses);
          setAddresses(deduplicated);
          try {
            localStorage.setItem(getCacheKey(user.email), JSON.stringify(deduplicated));
          } catch (e) {}
        } else {
          try {
            const cached = localStorage.getItem(getCacheKey(user.email));
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const deduplicated = deduplicateAddresses<UserAddress>(parsed);
                setAddresses(deduplicated);
                fetch("/api/user/addresses", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(deduplicated[0]),
                });
              }
            }
          } catch (e) {}
        }

        if (!user.phone && data.addresses.length > 0) {
          const withPhone = data.addresses.find((a: UserAddress) => a.phone && a.phone.trim().length > 0);
          if (withPhone) {
            updateUserProfile({ phone: withPhone.phone });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadAddresses();
    }
  }, [user?.email, user?.id]);

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
    setAddressPhone(addr.phone || "");
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state || "");
    setPostalCode(addr.postal_code);
    setTag(addr.tag || "Home");
    setIsDefault(!!addr.is_default);
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!recipientName.trim()) {
      setAddressError("Please enter recipient name.");
      return;
    }
    if (!street.trim()) {
      setAddressError("Please enter street address.");
      return;
    }
    if (!city.trim()) {
      setAddressError("Please enter city.");
      return;
    }
    if (!postalCode.trim() || postalCode.replace(/\D/g, "").length < 6) {
      setAddressError("Please enter a valid 6-digit postal PIN code.");
      return;
    }

    setAddressSaving(true);
    setAddressError("");

    const newAddressData = {
      id: editingAddressId || undefined,
      user_id: user.id,
      email: user.email,
      recipient_name: recipientName.trim(),
      phone: addressPhone.trim() || user.phone || "",
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postal_code: postalCode.trim(),
      country: "India",
      tag,
      is_default: isDefault,
    };

    try {
      const res = await fetch("/api/user/addresses", {
        method: editingAddressId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddressData),
      });

      const data = await res.json();

      if (data.success && data.address) {
        let updated: UserAddress[];
        if (editingAddressId) {
          updated = addresses.map((a) => (a.id === editingAddressId ? data.address : a));
        } else {
          updated = [data.address, ...addresses];
        }

        if (isDefault) {
          updated = updated.map((a) => ({
            ...a,
            is_default: a.id === data.address.id,
          }));
        }

        const deduplicated = deduplicateAddresses<UserAddress>(updated);
        setAddresses(deduplicated);
        try {
          localStorage.setItem(getCacheKey(user.email), JSON.stringify(deduplicated));
        } catch (e) {}

        setIsAddressModalOpen(false);
        setAddressNotice(editingAddressId ? "Address updated successfully" : "New address saved successfully");
        setTimeout(() => setAddressNotice(null), 3000);
      } else {
        setAddressError(data.error || "Failed to save address.");
      }
    } catch (err: any) {
      setAddressError("Network error. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user?.email) return;
    if (!confirm("Are you sure you want to delete this delivery address?")) return;

    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    try {
      localStorage.setItem(getCacheKey(user.email), JSON.stringify(filtered));
    } catch (e) {}

    try {
      await fetch(`/api/user/addresses?id=${encodeURIComponent(id)}&email=${encodeURIComponent(user.email)}`, {
        method: "DELETE",
      });
      setAddressNotice("Address deleted");
      setTimeout(() => setAddressNotice(null), 3000);
    } catch (err) {
      console.warn("Failed to delete address:", err);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user?.email) return;

    const updated = addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }));
    setAddresses(updated);
    try {
      localStorage.setItem(getCacheKey(user.email), JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch("/api/user/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email: user.email, action: "set_default" }),
      });
    } catch (err) {
      console.warn("Failed to set default address:", err);
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
      <div className="min-h-screen bg-[#FAFCF6] text-neutral-900 flex flex-col justify-between font-mograph">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#95CF42] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FAFCF6] text-neutral-900 flex flex-col justify-between font-mograph">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 pb-24 text-center">
          <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-950 mb-2 font-movault uppercase tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed font-normal">
              View your orders, manage saved delivery addresses, and track shipments in real-time.
            </p>
            <div className="space-y-3">
              <Link
                href="/signin?redirect=/account"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black font-extrabold text-sm shadow-sm transition-colors uppercase font-movault tracking-wider"
              >
                Sign In
              </Link>
              <Link
                href="/signin?mode=signup&redirect=/account"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-white border border-neutral-300 text-neutral-800 font-bold text-sm hover:bg-neutral-50 transition-colors shadow-xs"
              >
                Create New Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#FAFCF6] text-neutral-900 flex flex-col justify-between pb-24 sm:pb-0 font-mograph">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        {/* Profile Header Banner in Luxury Vittal Lifestyle Theme */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#111111] via-[#1a1c17] to-[#111111] text-white p-5 sm:p-7 shadow-xl border border-neutral-800 mb-6 sm:mb-8">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#95CF42]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#E2F5B4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#95CF42] text-black font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0 font-movault">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide truncate uppercase font-movault">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4FBE8] text-[#3D6318] text-[10px] font-bold tracking-wide uppercase border border-[#95CF42]/40">
                    <ShieldCheck className="w-3 h-3 text-[#6B9E3A]" />
                    Verified
                  </span>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#95CF42]/20 text-[#95CF42] text-[10px] font-bold tracking-wide uppercase border border-[#95CF42]/40">
                      <Shield className="w-3 h-3 text-[#95CF42]" />
                      Super Admin
                    </span>
                  )}
                </div>

                {user.phone ? (
                  <p className="text-xs sm:text-sm text-neutral-300 flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                    <span className="font-semibold text-white">{user.phone}</span>
                    <span className="text-[10px] text-[#3D6318] font-bold bg-[#F4FBE8] px-1.5 py-0.5 rounded border border-[#95CF42]/40">
                      WhatsApp Verified
                    </span>
                  </p>
                ) : user.email ? (
                  <p className="text-xs sm:text-sm text-neutral-300 flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#95CF42] shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                ) : null}

                {user.email && !siteConfig.isSyntheticEmail(user.email) && (
                  <p className="text-xs text-neutral-400 flex items-center gap-2 truncate mt-0.5">
                    <Mail className="w-3 h-3 text-[#95CF42]/80 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                )}

                {/* Profile Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleOpenProfileModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-[#95CF42]" />
                    <span>Edit Profile Details</span>
                  </button>

                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#95CF42]/20 hover:bg-[#95CF42]/30 text-[#95CF42] text-xs font-bold border border-[#95CF42]/40 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-3 h-3" />
                      <span>Admin Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-xs font-black text-black transition-colors shadow-xs font-movault uppercase tracking-wider"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Toast Notice */}
        {addressNotice && (
          <div className="mb-6 p-4 rounded-xl bg-[#F4FBE8] border border-[#95CF42]/50 text-[#3D6318] text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0" />
            <span>{addressNotice}</span>
          </div>
        )}

        {/* Core Navigation Cards: 2 cols on mobile, 4 cols on desktop in 1 row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* 1. My Orders */}
          <Link
            href="/orders"
            className="group bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-[#95CF42] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-[#6B9E3A] transition-colors flex items-center gap-0.5">
                <span>View</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-tight">
                My Orders
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                Status, returns &amp; invoices
              </p>
            </div>
          </Link>

          {/* 2. Order Tracking */}
          <Link
            href="/order-tracking"
            className="group bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-[#95CF42] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4FBE8] text-[#3D6318] text-[10px] font-bold border border-[#95CF42]/40 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#95CF42] animate-pulse" />
                Live
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-tight">
                Order Tracking
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                Live courier milestone updates
              </p>
            </div>
          </Link>

          {/* 3. My Wishlist */}
          <Link
            href="/wishlist"
            className="group bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-[#95CF42] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              {totalWishlistItems > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#F4FBE8] text-[#3D6318] text-[10px] font-bold border border-[#95CF42]/40 leading-none">
                  {totalWishlistItems} saved
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-[#6B9E3A] transition-colors flex items-center gap-0.5">
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-tight">
                My Wishlist
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                Saved items &amp; price drops
              </p>
            </div>
          </Link>

          {/* 4. Shopping Bag */}
          <button
            type="button"
            onClick={openCart}
            className="group text-left bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-[#95CF42] transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold border border-neutral-200 leading-none">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-tight">
                Shopping Bag
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                Express 1-click checkout cart
              </p>
            </div>
          </button>
        </div>

        {/* ─── Delivery Addresses Management Section ─── */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-950 flex items-center gap-2">
                    <span>Delivery Addresses</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4FBE8] text-[#3D6318] text-[10px] font-bold border border-[#95CF42]/30">
                      1-Click Checkout Synced
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                    Saved addresses automatically fill your checkout form for faster purchasing.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-black shadow-xs transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center font-movault uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Address Cards List */}
          <div className="pt-5">
            {loadingAddresses ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-[#6B9E3A] animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-[#FAFCF6] border border-dashed border-neutral-300">
                <div className="w-12 h-12 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">No Delivery Addresses Saved Yet</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4 leading-relaxed font-normal">
                  Add your home or office address now, or when you complete your next order at checkout it will be automatically synced here.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-black shadow-xs transition-colors cursor-pointer font-movault uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
                      addr.is_default
                        ? "bg-[#F8FBEF] border-[#95CF42] shadow-xs ring-1 ring-[#95CF42]/30"
                        : "bg-white border-neutral-200 hover:border-neutral-300 shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Address Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-900">{addr.recipient_name}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {addr.tag === "Work" ? (
                              <Building className="w-2.5 h-2.5" />
                            ) : (
                              <Home className="w-2.5 h-2.5" />
                            )}
                            {addr.tag || "Home"}
                          </span>
                        </div>

                        {addr.is_default ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#95CF42] text-black text-[10px] font-black uppercase font-movault tracking-wider">
                            <Star className="w-2.5 h-2.5 fill-black text-black" />
                            Default
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] font-semibold text-[#3D6318] hover:text-[#6B9E3A] hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      {/* Phone */}
                      {addr.phone && (
                        <p className="text-xs text-neutral-700 flex items-center gap-1.5 mb-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{addr.phone}</span>
                        </p>
                      )}

                      {/* Full Street Address */}
                      <p className="text-xs text-neutral-600 leading-relaxed mb-3 font-normal">
                        {addr.street}
                        <br />
                        <span className="font-semibold text-neutral-900">
                          {addr.city}
                          {addr.state ? `, ${addr.state}` : ""} - {addr.postal_code}
                        </span>
                        <br />
                        <span className="text-neutral-400">{addr.country || "India"}</span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#3D6318] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#6B9E3A]" />
                        <span>Ready for checkout</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#6B9E3A]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Support Banner in Vittal Lifestyle Theme */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111111] via-[#1a1c17] to-[#111111] text-white p-5 sm:p-6 shadow-md border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#95CF42] mb-1">
              <Sparkles className="w-4 h-4 text-[#95CF42]" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-movault">
                24/7 Dedicated Support
              </span>
            </div>
            <h4 className="text-base font-bold text-white font-movault uppercase tracking-wide">
              Need help with an order or address change?
            </h4>
            <p className="text-xs text-neutral-300 mt-1 max-w-md font-normal">
              Our support concierge is standing by to assist with deliveries, returns, or order modifications.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20need%20help%20with%20my%20order%20or%20account`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold transition-colors whitespace-nowrap shadow-xs cursor-pointer font-mograph"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:+919600048000"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors whitespace-nowrap border border-white/20 cursor-pointer font-mograph"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </main>

      {/* ─── Modal 1: Add / Edit Delivery Address ─── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-mograph">
          <div data-lenis-prevent className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-7 border border-neutral-200 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors border border-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30 flex items-center justify-center shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold font-movault uppercase tracking-tight text-neutral-950">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                  This address will be available for fast 1-click checkout.
                </p>
              </div>
            </div>

            {addressError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Street Address / House No. / Area *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat / House No., Apartment, Street, Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="6-digit PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Address Tag Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Address Type
                </label>
                <div className="flex items-center gap-3">
                  {(["Home", "Work", "Other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        tag === t
                          ? "bg-[#95CF42] text-black border-[#95CF42] font-bold shadow-xs"
                          : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
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
                  className="w-4 h-4 rounded text-[#95CF42] focus:ring-[#95CF42] border-neutral-300 cursor-pointer accent-[#95CF42]"
                />
                <span className="text-xs font-medium text-neutral-700">
                  Make this my default delivery address
                </span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer border border-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-black transition-all shadow-md shadow-[#95CF42]/20 cursor-pointer disabled:opacity-50 font-movault uppercase tracking-wider"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-mograph">
          <div data-lenis-prevent className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-7 border border-neutral-200 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors border border-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30 flex items-center justify-center shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold font-movault uppercase tracking-tight text-neutral-950">
                  Update Profile Details
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                  Manage your name and phone number for delivery updates.
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#F4FBE8] border border-[#95CF42]/40 text-[#3D6318] text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-[#6B9E3A]" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#95CF42] focus:border-transparent transition-all"
                />
                <p className="text-[11px] text-neutral-500 mt-1 font-normal">
                  Used for order tracking SMS, courier OTP, and delivery coordination.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-xs font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-neutral-500 mt-1 font-normal">
                  Email is locked to your verified account credentials.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer border border-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving || profileSuccess}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-black transition-all shadow-md shadow-[#95CF42]/20 cursor-pointer disabled:opacity-50 font-movault uppercase tracking-wider"
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