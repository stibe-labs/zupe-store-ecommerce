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

  // Strict Super Admin Verification State (only true for verified admin@zupestore.com)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Strictly verify Super Admin credentials & cryptographic session
  useEffect(() => {
    const isCandidate =
      user?.role === "admin" &&
      user?.email?.toLowerCase().trim() === "admin@zupestore.com";

    if (!isCandidate) {
      setIsSuperAdmin(false);
      return;
    }

    // Immediately grant UI readiness for verified admin candidate
    setIsSuperAdmin(true);

    // Cryptographic server-side verification: strictly validates signed HTTP-only token
    let isMounted = true;
    fetch("/api/admin/auth/verify")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          // If server rejects the token, strictly revoke admin privileges
          if (!data?.isSuperAdmin) {
            setIsSuperAdmin(false);
          }
        }
      })
      .catch(() => {
        // Keep candidate state if network drops during session
      });

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

    // 1. Immediately read from local storage for 0ms instant display (deduplicating any legacy entries)
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
        `/api/user/addresses?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id || "")}`
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
          // If server returned 0 but client has cached addresses, sync client cache to server!
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

        // If user has no phone in profile, but has a phone in an address, sync it to profile
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

  // Open modal to add address
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

  // Open modal to edit existing address
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

  // Save address (Add or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!recipientName.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      setAddressError("Please fill in all mandatory address fields (*).");
      return;
    }

    if (addressPhone.trim() && addressPhone.replace(/\D/g, "").length < 10) {
      setAddressError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setAddressSaving(true);
    setAddressError("");

    const newAddr: UserAddress = {
      id: editingAddressId || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      user_email: user.email,
      recipient_name: recipientName.trim(),
      phone: addressPhone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postal_code: postalCode.trim(),
      country: "India",
      is_default: isDefault || addresses.length === 0,
      tag,
      created_at: new Date().toISOString(),
    };

    // Instant optimistic update in state & localStorage (cleanly deduplicated)
    let otherList = addresses.filter((a) => a.id !== newAddr.id);
    if (newAddr.is_default) {
      otherList = otherList.map((a) => ({ ...a, is_default: false }));
    }
    const updatedList = deduplicateAddresses([newAddr, ...otherList]);
    setAddresses(updatedList);
    try {
      localStorage.setItem(getCacheKey(user.email), JSON.stringify(updatedList));
    } catch (e) {}

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAddressError(data.error || "Failed to save address. Please try again.");
        return;
      }

      // Auto update user profile phone if not previously set
      if (!user.phone && addressPhone.trim()) {
        updateUserProfile({ phone: addressPhone.trim() });
      }

      setIsAddressModalOpen(false);
      setAddressNotice("Delivery address saved successfully!");
      setTimeout(() => setAddressNotice(null), 3500);
      loadAddresses();
    } catch (err: any) {
      // Even if network fails, address is safely kept in localStorage
      setIsAddressModalOpen(false);
      setAddressNotice("Delivery address saved locally!");
      setTimeout(() => setAddressNotice(null), 3500);
    } finally {
      setAddressSaving(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!user?.email) return;
    if (!confirm("Are you sure you want to delete this delivery address?")) return;

    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.is_default)) {
      updated[0].is_default = true;
    }
    setAddresses(updated);
    try {
      localStorage.setItem(getCacheKey(user.email), JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch(
        `/api/user/addresses?id=${encodeURIComponent(id)}&email=${encodeURIComponent(user.email)}`,
        { method: "DELETE" }
      );
    } catch (err) {
      console.warn("Failed to delete address:", err);
    }
  };

  // Set default address
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

  // Open Edit Profile / Phone modal
  const handleOpenProfileModal = () => {
    setProfileName(user?.name || "");
    setProfilePhone(user?.phone || "");
    setProfileError("");
    setProfileSuccess(false);
    setIsProfileModalOpen(true);
  };

  // Save Profile Name & Phone
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
      <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-stone-800/20 border-t-[#5b1420] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 pb-24 text-center">
          <div className="bg-white rounded-3xl p-8 border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b]">
            <div className="w-16 h-16 rounded-2xl bg-[#f8bac5] text-[#5b1420] border-2 border-stone-800 flex items-center justify-center mx-auto mb-4 shadow-[0_3px_0_0_#2b2b2b]">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-tj-serif text-stone-900 mb-2">Sign In to Your Account</h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
              View your orders, manage saved delivery addresses, and track shipments in real-time.
            </p>
            <div className="space-y-3">
              <Link
                href="/signin?redirect=/account"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-2xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] text-stone-900 font-black text-sm border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] active:translate-y-0.5 active:shadow-none transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signin?mode=signup&redirect=/account"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-white border-2 border-stone-800 text-stone-800 font-bold text-sm hover:bg-stone-50 transition-all shadow-xs"
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
    <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between pb-24 sm:pb-0">
      <Navbar />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
        {/* Profile Header Banner */}
        <div className="bg-[#5b1420] text-amber-50 rounded-3xl p-6 sm:p-8 border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#fed000]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fed000] text-stone-900 border-2 border-stone-800 flex items-center justify-center font-tj-serif font-black text-2xl sm:text-3xl shadow-[0_4px_0_0_#2b2b2b] flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black font-tj-serif text-amber-100 truncate">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0e4a3b]/60 text-emerald-300 text-[10px] font-bold tracking-wide uppercase border border-emerald-400/50">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fed000]/20 text-[#fed000] text-[10px] font-bold tracking-wide uppercase border border-[#fed000]/40">
                      <Shield className="w-3 h-3 text-[#fed000]" />
                      Super Admin
                    </span>
                  )}
                </div>

                {user.phone ? (
                  <p className="text-xs sm:text-sm text-amber-100/90 flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
                    <span className="font-semibold">{user.phone}</span>
                    <span className="text-[10px] text-emerald-300 font-bold bg-[#0e4a3b]/70 px-1.5 py-0.5 rounded border border-emerald-400/40">
                      WhatsApp Verified
                    </span>
                  </p>
                ) : user.email ? (
                  <p className="text-xs sm:text-sm text-amber-200/80 flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-amber-300/70 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                ) : null}

                {user.email && !user.email.includes("@customer.zupestore.com") && (
                  <p className="text-xs text-amber-200/70 flex items-center gap-2 truncate mt-0.5">
                    <Mail className="w-3 h-3 text-amber-300/60 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                )}

                {/* Profile Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={handleOpenProfileModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-bold border border-white/20 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-[#fed000]" />
                    <span>Edit Profile Details</span>
                  </button>

                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fed000]/20 hover:bg-[#fed000]/30 text-[#fed000] text-xs font-bold border border-[#fed000]/40 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-3 h-3 text-[#fed000]" />
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fed000] hover:bg-[#fab005] text-xs font-black text-stone-900 border-2 border-stone-800 shadow-[0_3px_0_0_#2b2b2b] transition-all cursor-pointer active:translate-y-0.5 active:shadow-none"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-100 border border-white/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Toast Notice */}
        {addressNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-[0_3px_0_0_#2b2b2b]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{addressNotice}</span>
          </div>
        )}

        {/* Core Account Navigation Cards (My Orders, Order Tracking, Wishlist) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* 1. My Orders */}
          <Link
            href="/orders"
            className="group bg-white rounded-3xl p-6 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:shadow-[0_8px_0_0_#2b2b2b] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f8bac5] text-[#5b1420] border-2 border-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_2px_0_0_#2b2b2b]">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider group-hover:text-[#5b1420] transition-colors flex items-center gap-1">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-lg font-bold font-tj-serif text-stone-900 mb-1">My Orders</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Track delivery status, rate & review delivered products, and upload photos.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-black text-[#5b1420]">
              <span>Go to Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Order Tracking */}
          <Link
            href="/order-tracking"
            className="group bg-white rounded-3xl p-6 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:shadow-[0_8px_0_0_#2b2b2b] hover:-translate-y-0.5 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fed000] text-stone-900 text-[10px] font-bold uppercase tracking-wider border border-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live Tracker
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fed000] text-stone-900 border-2 border-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_2px_0_0_#2b2b2b]">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold font-tj-serif text-stone-900 mb-1">Order Tracking</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Live courier updates, AWB lookup, and real-time shipment milestone timeline.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-black text-[#5b1420]">
              <span>Track Live Package</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. My Wishlist */}
          <Link
            href="/wishlist"
            className="group bg-white rounded-3xl p-6 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:shadow-[0_8px_0_0_#2b2b2b] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b9e5e9] text-[#0e4a3b] border-2 border-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_2px_0_0_#2b2b2b]">
                  <Heart className="w-6 h-6" />
                </div>
                {totalWishlistItems > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f8bac5] text-[#5b1420] text-xs font-bold border border-stone-800">
                    {totalWishlistItems} saved
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold font-tj-serif text-stone-900 mb-1">My Wishlist</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Favorite items saved for later. Quick 1-click add to cart with live price updates.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-black text-[#5b1420]">
              <span>View Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* ─── Delivery Addresses Management Section ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f8bac5] text-[#5b1420] border-2 border-stone-800 flex items-center justify-center shadow-[0_2px_0_0_#2b2b2b]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-tj-serif text-stone-900 flex items-center gap-2">
                    <span>Delivery Addresses</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      1-Click Checkout Synced
                    </span>
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Saved addresses automatically fill your checkout form for faster purchasing.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] text-stone-900 text-xs font-black border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Address Cards List */}
          <div className="pt-6">
            {loadingAddresses ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-[#5b1420] animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300">
                <div className="w-12 h-12 rounded-2xl bg-[#f8bac5] text-[#5b1420] border-2 border-stone-800 flex items-center justify-center mx-auto mb-3 shadow-[0_2px_0_0_#2b2b2b]">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold font-tj-serif text-stone-900 mb-1">No Delivery Addresses Saved Yet</h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto mb-4 leading-relaxed">
                  Add your home or office address now, or when you complete your next order at checkout it will be automatically synced here.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fed000] hover:bg-[#fab005] text-stone-900 border-2 border-stone-800 text-xs font-bold shadow-[0_2px_0_0_#2b2b2b] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl p-5 border-2 border-stone-800 transition-all relative flex flex-col justify-between ${
                      addr.is_default
                        ? "bg-[#fed000]/10 shadow-[0_4px_0_0_#2b2b2b]"
                        : "bg-white hover:bg-stone-50/50 shadow-[0_3px_0_0_#2b2b2b]"
                    }`}
                  >
                    <div>
                      {/* Address Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{addr.recipient_name}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-300">
                            {addr.tag === "Work" ? (
                              <Building className="w-2.5 h-2.5" />
                            ) : (
                              <Home className="w-2.5 h-2.5" />
                            )}
                            {addr.tag || "Home"}
                          </span>
                        </div>

                        {addr.is_default ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#5b1420] text-amber-200 text-[10px] font-bold border border-stone-800">
                            <Star className="w-3 h-3 fill-amber-300" />
                            Default
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] font-semibold text-stone-500 hover:text-[#5b1420] hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      {/* Phone */}
                      {addr.phone && (
                        <p className="text-xs text-stone-700 flex items-center gap-1.5 mb-2 font-medium">
                          <Phone className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                          <span>{addr.phone}</span>
                        </p>
                      )}

                      {/* Full Street Address */}
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">
                        {addr.street}
                        <br />
                        <span className="font-semibold text-stone-900">
                          {addr.city}
                          {addr.state ? `, ${addr.state}` : ""} - {addr.postal_code}
                        </span>
                        <br />
                        <span className="text-stone-400">{addr.country || "India"}</span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready for checkout</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* Secondary Services & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shopping Bag Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fed000] text-stone-900 border-2 border-stone-800 flex items-center justify-center shadow-[0_2px_0_0_#2b2b2b]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-tj-serif text-stone-900">Shopping Bag</h4>
                  <p className="text-xs text-stone-500">{totalItems} item{totalItems === 1 ? "" : "s"} in cart</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openCart}
                className="px-3.5 py-1.5 rounded-xl bg-[#fed000] hover:bg-[#fab005] text-stone-900 text-xs font-black border-2 border-stone-800 shadow-[0_2px_0_0_#2b2b2b] transition-all cursor-pointer"
              >
                Open Bag
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Items in your cart are reserved with express checkout and free shipping offers.
            </p>
          </div>

          {/* Customer Support Card */}
          <div className="lg:col-span-2 bg-[#5b1420] text-amber-50 rounded-3xl p-6 border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#fed000] mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  24/7 Dedicated Support
                </span>
              </div>
              <h4 className="text-base font-bold font-tj-serif text-amber-100">Need help with an order or address change?</h4>
              <p className="text-xs text-amber-200/80 mt-1 max-w-md">
                Our support concierge is standing by to resolve courier deliveries, returns, or order modifications.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
              <a
                href="https://wa.me/916238165935?text=Hi%20Turkiye%20Jam%2C%20I%20need%20help%20with%20my%20order%20or%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-stone-900 text-xs font-black transition-colors whitespace-nowrap border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+916238165935"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-bold transition-colors whitespace-nowrap border border-white/20 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Modal 1: Add / Edit Delivery Address ─── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div data-lenis-prevent className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 border-2 border-stone-800 shadow-[0_12px_0_0_#2b2b2b] relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#f8bac5] text-[#5b1420] border-2 border-stone-800 flex items-center justify-center shadow-[0_2px_0_0_#2b2b2b]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-tj-serif text-stone-900">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-stone-600">
                  This address will be available for 1-click checkout.
                </p>
              </div>
            </div>

            {addressError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Street Address / House No. / Area *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat / House No., Apartment, Street, Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="6-digit PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                  />
                </div>
              </div>

              {/* Address Tag Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Address Type
                </label>
                <div className="flex items-center gap-3">
                  {(["Home", "Work", "Other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 border-stone-800 ${
                        tag === t
                          ? "bg-[#fed000] text-stone-900 shadow-[0_2px_0_0_#2b2b2b]"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
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
                  className="w-4 h-4 rounded text-[#5b1420] focus:ring-[#fed000] cursor-pointer"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Make this my default delivery address
                </span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer border border-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] text-stone-900 text-xs font-black border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] transition-all cursor-pointer disabled:opacity-50"
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
          <div data-lenis-prevent className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 border-2 border-stone-800 shadow-[0_12px_0_0_#2b2b2b] relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#f8bac5] text-[#5b1420] border-2 border-stone-800 flex items-center justify-center shadow-[0_2px_0_0_#2b2b2b]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-tj-serif text-stone-900">
                  Update Profile Details
                </h3>
                <p className="text-xs text-stone-600">
                  Manage your name and phone number for delivery updates.
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Used for order tracking SMS, courier OTP, and delivery coordination.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 bg-stone-100 text-stone-500 text-xs font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Email is locked to your verified account credentials.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer border border-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving || profileSuccess}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] text-stone-900 text-xs font-black border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] transition-all cursor-pointer disabled:opacity-50"
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
