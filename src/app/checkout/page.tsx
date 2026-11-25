"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/AuthCard";
import { deduplicateAddresses, normalizeAddressKey, cleanStreetAddress } from "@/lib/addressUtils";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { PaymentPopupModal, type PaymentPopupOrder } from "@/components/checkout/PaymentPopupModal";
import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";

const EASE_OUT = [0.32, 0.72, 0, 1] as const;

function cleanPhoneDigits(raw: string): string {
  if (!raw) return "";
  let trimmed = raw.trim();
  if (trimmed.startsWith("+91")) {
    trimmed = trimmed.slice(3);
  } else if (trimmed.startsWith("+")) {
    trimmed = trimmed.replace(/^\+\d{1,3}/, "");
  }
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const {
    cart,
    isInitialized,
    addToCart,
    subtotal,
    savings,
    clearCart,
    removeFromCart,
    updateQuantity,
    freeShippingThreshold,
    standardShippingFee,
    codFee: configCodFee,
    outOfStockItemIds,
    hasOutOfStockItems,
    checkCartStock,
  } = useCart();

  // Keep UI COD advance aligned with backend minimum floor (₹2 on PyDart Pay)
  const rawConfiguredCodFee = typeof configCodFee === "number" ? configCodFee : 49;
  const effectiveCodAdvance = Math.max(2, rawConfiguredCodFee);

  const { user, isLoading: authLoading, openAuthModal, updateUserProfile } = useAuth();

  // Contact & Delivery state
  const [phone, setPhone] = useState(() => cleanPhoneDigits(user?.phone || ""));
  const [name, setName] = useState(() =>
    user?.name && !user.name.startsWith("Customer ") ? user.name : ""
  );
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Location & Pincode helpers
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDetected, setPincodeDetected] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationNotice, setLocationNotice] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [detectedPostOffices, setDetectedPostOffices] = useState<string[]>([]);

  // Shiprocket customer auto-lookup
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [customerLookupBadge, setCustomerLookupBadge] = useState<string | null>(null);
  const lastLookedUpPhoneRef = useRef<string>("");

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);

  // Payment method ("online" | "cod") & mobile summary drawer
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Submission, popup, verification & confirmation state
  const [loading, setLoading] = useState(false);
  const [showPaySpinner, setShowPaySpinner] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [activePaymentPopup, setActivePaymentPopup] = useState<PaymentPopupOrder | null>(null);
  const [showPaymentCancelledModal, setShowPaymentCancelledModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recoveredBanner, setRecoveredBanner] = useState<string | null>(null);

  // Confirmed order receipt state
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [confirmedPaymentId, setConfirmedPaymentId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [confirmedAdvancePaid, setConfirmedAdvancePaid] = useState(0);
  const [confirmedBalanceDue, setConfirmedBalanceDue] = useState(0);
  const [confirmedItems, setConfirmedItems] = useState<any[]>([]);

  const orderConfirmedInSessionRef = useRef(false);
  const verifyingOrderIdRef = useRef<string | null>(null);

  // 300ms delayed spinner so instant responses never flicker
  useEffect(() => {
    if (!loading) {
      setShowPaySpinner(false);
      return;
    }
    const timer = window.setTimeout(() => setShowPaySpinner(true), 300);
    return () => window.clearTimeout(timer);
  }, [loading]);

  // Unlock scroll on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }
  }, []);

  // Pricing & Financial Calculations
  const isCod = paymentMethod === "cod";
  const totalItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  const regularSubtotal = cart.reduce((sum, it) => {
    const basePrice = it.original_price || it.price;
    return sum + basePrice * it.quantity;
  }, 0);

  const bundleSavings = cart.reduce((sum, it) => {
    if (it.bundle_tier && it.bundle_tier > 1) {
      if (it.bundle_savings) return sum + it.bundle_savings;
      const baseTotal = (it.original_price || it.price) * it.quantity;
      const actualTotal = it.bundle_total || it.price * it.quantity;
      return sum + Math.max(0, baseTotal - actualTotal);
    }
    return sum;
  }, 0);

  const effectiveSubtotal = Math.max(0, subtotal - promoDiscount);
  const gstAmount = Math.round(effectiveSubtotal - effectiveSubtotal / 1.18);
  const totalDiscount = savings + bundleSavings + promoDiscount;

  const isFreeDelivery = effectiveSubtotal >= freeShippingThreshold;
  const baseShippingFee = isFreeDelivery ? 0 : standardShippingFee;
  const onlineGrandTotal = effectiveSubtotal + baseShippingFee;
  const codGrandTotal = effectiveSubtotal + baseShippingFee + effectiveCodAdvance;
  const grandTotal = isCod ? codGrandTotal : onlineGrandTotal;
  const codDoorstepBalance = Math.max(0, effectiveSubtotal + baseShippingFee);
  const payableNow = isCod ? effectiveCodAdvance : onlineGrandTotal;

  // Restore confirmed order from sessionStorage (only when not starting a fresh cart)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (orderConfirmedInSessionRef.current) return;

    try {
      const hasPaymentCallback =
        searchParams.get("paid") === "true" ||
        Boolean(searchParams.get("order_id")) ||
        Boolean(searchParams.get("cf_order_id")) ||
        Boolean(searchParams.get("pydart_order_id"));

      const storedConfirm = sessionStorage.getItem("zupe_confirmed_order");
      if (storedConfirm) {
        const parsed = JSON.parse(storedConfirm);
        const ageMs = Date.now() - (parsed?.confirmedAt || 0);
        if (parsed && parsed.orderId && ageMs < 4 * 3600 * 1000) {
          if (cart.length > 0 && !hasPaymentCallback && ageMs > 30_000) {
            sessionStorage.removeItem("zupe_confirmed_order");
            setOrderComplete(false);
            return;
          }
          setConfirmedOrderId(parsed.orderId);
          setConfirmedTotal(parsed.total || 0);
          setConfirmedPaymentId(parsed.paymentId || "Online Payment (PyDart Pay)");
          setConfirmedAdvancePaid(parsed.advancePaid || 0);
          setConfirmedBalanceDue(parsed.balanceDue || 0);
          if (Array.isArray(parsed.items)) setConfirmedItems(parsed.items);
          setOrderComplete(true);
          return;
        }
      }

      if (cart.length > 0 && !hasPaymentCallback) {
        sessionStorage.removeItem("zupe_confirmed_order");
        setOrderComplete(false);
      }
    } catch {}
  }, [cart.length, searchParams]);

  const syncAddressAfterOrder = useCallback(async () => {
    try {
      const targetEmail = (email.trim() || user?.email || "").toLowerCase().trim();
      if (targetEmail && address.trim()) {
        const cacheKey = `zp_user_addresses_${targetEmail}`;
        const targetNormKey = normalizeAddressKey(address, postalCode);
        const existingMatch = savedAddresses.find(
          (a: any) =>
            a.id === selectedAddressId ||
            normalizeAddressKey(a.street, a.postal_code || a.postalCode) === targetNormKey
        );

        if (!existingMatch || isUsingNewAddress) {
          const sanitizedStreet = cleanStreetAddress(address, city, state, postalCode);
          const newAddr = {
            id: existingMatch
              ? existingMatch.id
              : `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            user_email: targetEmail,
            user_id: user?.id,
            recipient_name: name.trim(),
            phone: phone.trim(),
            street: sanitizedStreet,
            city: city.trim(),
            state: state.trim(),
            postal_code: postalCode.trim(),
            country: "India",
            is_default: savedAddresses.length === 0,
            tag: "Home",
            created_at: new Date().toISOString(),
          };

          const otherAddresses = savedAddresses.filter((a: any) => a.id !== newAddr.id);
          const updated = deduplicateAddresses([newAddr, ...otherAddresses]);
          setSavedAddresses(updated);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(updated));
          } catch {}

          await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAddr),
          });
        }
      }
      if (user && phone.trim() && (!user.phone || user.phone !== phone.trim())) {
        await updateUserProfile({ phone: phone.trim() });
      }
    } catch (e) {
      console.warn("Failed to sync address:", e);
    }
  }, [
    email,
    user,
    address,
    postalCode,
    savedAddresses,
    selectedAddressId,
    isUsingNewAddress,
    city,
    state,
    name,
    phone,
    updateUserProfile,
  ]);

  // Authoritative server-side payment verification with retry
  const verifyPaymentOrder = useCallback(
    async (orderIdToVerify: string, attempt: number = 1) => {
      setActivePaymentPopup(null);
      setVerifyingPayment(true);
      setLoading(true);
      setErrorMessage("");

      try {
        const rawOrderId = searchParams.get("order_id") || "";
        const pydartOrderIdParam = searchParams.get("pydart_order_id") || "";

        const res = await fetch("/api/cashfree/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderIdToVerify,
            pydartOrderId: pydartOrderIdParam || undefined,
            cashfreeOrderId:
              rawOrderId && rawOrderId !== orderIdToVerify ? rawOrderId : undefined,
          }),
        });
        const data = await res.json();

        if (data.paid || data.success) {
          syncAddressAfterOrder();
          const finalOrderId = data.orderId || orderIdToVerify;
          const total = data.totalAmount || data.amount || grandTotal;
          const paymentLabel = data.isCodPartial
            ? "Cash on Delivery"
            : data.paymentId || "Online Payment (PyDart Pay)";
          const advance = data.advancePaid || (data.isCodPartial ? effectiveCodAdvance : 0);
          const due = data.isCodPartial
            ? data.balanceDue !== undefined && data.balanceDue < total
              ? data.balanceDue
              : Math.max(0, total - advance)
            : 0;
          const itemsToSave =
            Array.isArray(data.order?.items) && data.order.items.length > 0
              ? data.order.items
              : cart.length > 0
              ? cart
              : [];

          orderConfirmedInSessionRef.current = true;
          verifyingOrderIdRef.current = null;
          setConfirmedTotal(total);
          setConfirmedOrderId(finalOrderId);
          setConfirmedPaymentId(paymentLabel);
          setConfirmedAdvancePaid(advance);
          setConfirmedBalanceDue(due);
          setConfirmedItems(itemsToSave);
          setOrderComplete(true);
          clearCart();

          try {
            localStorage.removeItem("zp_guest_cart");
            localStorage.removeItem("zupe_last_order_id");
            if (phone.trim()) localStorage.setItem("zupe_last_phone", phone.trim());
            sessionStorage.setItem(
              "zupe_confirmed_order",
              JSON.stringify({
                orderId: finalOrderId,
                total,
                paymentId: paymentLabel,
                advancePaid: advance,
                balanceDue: due,
                items: itemsToSave,
                confirmedAt: Date.now(),
              })
            );
          } catch {}

          if (user?.id) {
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.id, items: [] }),
            }).catch(() => {});
          }

          try {
            if (typeof window !== "undefined") {
              const cleanUrl = new URL(window.location.href);
              ["cf_order_id", "pydart_order_id", "order_id", "paid", "status", "cancelled"].forEach(
                (k) => cleanUrl.searchParams.delete(k)
              );
              window.history.replaceState(
                {},
                "",
                cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : "")
              );
            }
          } catch {}

          setVerifyingPayment(false);
          setLoading(false);
          return;
        }

        if (attempt < 3) {
          window.setTimeout(() => verifyPaymentOrder(orderIdToVerify, attempt + 1), 1500);
          return;
        }

        setShowPaymentCancelledModal(true);
        setErrorMessage(
          data.message || "Payment was not completed. Retry online or choose Cash on Delivery."
        );

        fetch("/api/cashfree/cancel-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderIdToVerify,
            reason: "Payment incomplete or abandoned at gateway",
          }),
        }).catch(() => {});

        try {
          if (typeof window !== "undefined") {
            const cleanUrl = new URL(window.location.href);
            ["cf_order_id", "pydart_order_id", "order_id", "paid", "status", "cancelled"].forEach(
              (k) => cleanUrl.searchParams.delete(k)
            );
            window.history.replaceState(
              {},
              "",
              cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : "")
            );
          }
        } catch {}
      } catch {
        if (attempt < 3) {
          window.setTimeout(() => verifyPaymentOrder(orderIdToVerify, attempt + 1), 1500);
          return;
        }
        setShowPaymentCancelledModal(true);
        setErrorMessage(
          "Could not verify payment status right now. If money was debited, your order confirms automatically."
        );
      } finally {
        if (attempt >= 3) {
          verifyingOrderIdRef.current = null;
          setVerifyingPayment(false);
          setLoading(false);
        }
      }
    },
    [searchParams, syncAddressAfterOrder, grandTotal, effectiveCodAdvance, cart, clearCart, phone, user?.id]
  );

  // Detect browser back-button return (bfcache) from full-screen payment fallback
  useEffect(() => {
    const handlePageShow = () => {
      const lastOrder =
        typeof window !== "undefined" ? localStorage.getItem("zupe_last_order_id") : null;
      if (
        lastOrder &&
        !orderComplete &&
        !verifyingPayment &&
        !activePaymentPopup &&
        !orderConfirmedInSessionRef.current
      ) {
        verifyPaymentOrder(lastOrder);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", handlePageShow);
      return () => window.removeEventListener("pageshow", handlePageShow);
    }
  }, [orderComplete, verifyingPayment, activePaymentPopup, verifyPaymentOrder]);

  // Handle full-page gateway redirect callback (?cf_order_id=... / ?pydart_order_id=...)
  useEffect(() => {
    let targetOrder =
      searchParams.get("cf_order_id") ||
      searchParams.get("order_id") ||
      searchParams.get("invoice_id") ||
      searchParams.get("invoiceId");
    const isPaid = searchParams.get("paid") === "true";
    const statusParam = searchParams.get("status")?.toLowerCase();
    const isCancelled =
      statusParam === "cancelled" ||
      statusParam === "failed" ||
      searchParams.get("cancelled") === "true";

    if (isCancelled) {
      setShowPaymentCancelledModal(true);
      if (targetOrder) {
        fetch("/api/cashfree/cancel-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: targetOrder, reason: "Gateway returned cancelled status" }),
        }).catch(() => {});
      }
      try {
        const cleanUrl = new URL(window.location.href);
        ["cf_order_id", "pydart_order_id", "order_id", "paid", "status", "cancelled"].forEach((k) =>
          cleanUrl.searchParams.delete(k)
        );
        window.history.replaceState(
          {},
          "",
          cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : "")
        );
      } catch {}
      return;
    }

    if (!targetOrder && isPaid && typeof window !== "undefined") {
      targetOrder = localStorage.getItem("zupe_last_order_id");
    }

    if (
      targetOrder &&
      !orderComplete &&
      !verifyingPayment &&
      !orderConfirmedInSessionRef.current &&
      verifyingOrderIdRef.current !== targetOrder
    ) {
      verifyingOrderIdRef.current = targetOrder;
      verifyPaymentOrder(targetOrder);
    }
  }, [searchParams, orderComplete, verifyingPayment, verifyPaymentOrder]);

  // 1-Click Cart Restoration via Abandoned Recovery Link (?recover=... or ?token=...)
  useEffect(() => {
    const recoverToken =
      searchParams.get("recover") ||
      searchParams.get("recovery") ||
      searchParams.get("rec_token") ||
      searchParams.get("token");
    if (!recoverToken) return;

    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/abandoned?token=${encodeURIComponent(recoverToken)}`
        );
        const data = await res.json();
        if (mounted && data.success && data.checkout) {
          const chk = data.checkout;
          if (chk.customer_name) setName(chk.customer_name);
          if (chk.customer_phone) setPhone(cleanPhoneDigits(chk.customer_phone));
          if (
            chk.customer_email &&
            !chk.customer_email.includes("example.com") &&
            !siteConfig.isSyntheticEmail(chk.customer_email) &&
            !chk.customer_email.toLowerCase().startsWith("test@")
          ) {
            setEmail(chk.customer_email);
          }
          if (chk.shipping_address) setAddress(chk.shipping_address);
          if (chk.city) setCity(chk.city);
          if (chk.postal_code) setPostalCode(chk.postal_code);

          if (Array.isArray(chk.items) && chk.items.length > 0) {
            chk.items.forEach((it: any) => {
              addToCart(
                {
                  id: it.id || it.product_id,
                  name: it.name || it.product_name,
                  price: Number(it.price || it.unit_price || 0),
                  original_price: Number(it.original_price || it.mrp || 0),
                  poster_image: it.poster_image || it.image || "/tj/turkiye-jam-3-strips.png",
                  category: it.category || "Vitality & Wellness",
                },
                Number(it.quantity || 1),
                { overrideQuantity: true }
              );
            });
          }

          setRecoveredBanner(
            `Welcome back${chk.customer_name ? `, ${chk.customer_name.split(" ")[0]}` : ""}. Your bag and delivery details have been restored.`
          );
        }
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, [searchParams, addToCart]);

  // Direct URL product pre-load (?productId= / ?slug=)
  useEffect(() => {
    const paramId = searchParams.get("productId") || searchParams.get("id");
    const paramSlug = searchParams.get("funnel") || searchParams.get("slug");
    if (cart.length === 0 && (paramId || paramSlug)) {
      const match = DEFAULT_PRODUCTS.find(
        (p) => p.id === paramId || p.slug === paramSlug || p.id === paramSlug
      );
      if (match) {
        addToCart(match, 1, { overrideQuantity: true, replaceCart: true });
      }
    }
    try {
      if (typeof window !== "undefined" && (paramId || paramSlug)) {
        const cleanUrl = new URL(window.location.href);
        ["productId", "id", "funnel", "slug"].forEach((k) => cleanUrl.searchParams.delete(k));
        window.history.replaceState(
          {},
          "",
          cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : "")
        );
      }
    } catch {}
  }, [searchParams, cart.length, addToCart]);

  // Hydrate user profile fields
  useEffect(() => {
    if (user) {
      if (user.name && (!name || name.startsWith("Customer "))) {
        setName(user.name);
      }
      if (user.phone) {
        setPhone(cleanPhoneDigits(user.phone));
      }
    }
  }, [user]);

  // Hydrate saved addresses for logged-in user
  useEffect(() => {
    if (!user) return;
    const identifier = (user.email || user.phone || user.id || "").toLowerCase().trim();
    if (!identifier) return;

    const cacheKey = `zp_user_addresses_${identifier}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deduplicated = deduplicateAddresses(parsed);
          setSavedAddresses(deduplicated);
          const defaultAddr = deduplicated.find((a: any) => a.is_default) || deduplicated[0];
          if (defaultAddr && !address) {
            setSelectedAddressId(defaultAddr.id);
            if (defaultAddr.recipient_name && !defaultAddr.recipient_name.startsWith("Customer ")) {
              setName(defaultAddr.recipient_name);
            }
            if (defaultAddr.phone) setPhone(cleanPhoneDigits(defaultAddr.phone));
            setAddress(
              cleanStreetAddress(
                defaultAddr.street,
                defaultAddr.city,
                defaultAddr.state,
                defaultAddr.postal_code
              )
            );
            setCity(defaultAddr.city || "");
            setState(defaultAddr.state || "");
            setPostalCode(defaultAddr.postal_code || "");
          }
        }
      }
    } catch {}

    const queryParams = new URLSearchParams();
    if (user.email) queryParams.set("email", user.email);
    if (user.id) queryParams.set("userId", user.id);
    if (user.phone) queryParams.set("phone", cleanPhoneDigits(user.phone));

    fetch(`/api/user/addresses?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.addresses)) {
          const deduplicated = deduplicateAddresses(data.addresses);
          setSavedAddresses(deduplicated);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(deduplicated));
          } catch {}

          const defaultAddr = deduplicated.find((a: any) => a.is_default) || deduplicated[0];
          if (defaultAddr && (!address || !selectedAddressId)) {
            setSelectedAddressId(defaultAddr.id);
            if (defaultAddr.recipient_name && !defaultAddr.recipient_name.startsWith("Customer ")) {
              setName(defaultAddr.recipient_name);
            }
            if (defaultAddr.phone) setPhone(cleanPhoneDigits(defaultAddr.phone));
            setAddress(
              cleanStreetAddress(
                defaultAddr.street,
                defaultAddr.city,
                defaultAddr.state,
                defaultAddr.postal_code
              )
            );
            setCity(defaultAddr.city || "");
            setState(defaultAddr.state || "");
            setPostalCode(defaultAddr.postal_code || "");
          }
        }
      })
      .catch(() => {});
  }, [user?.email, user?.id]);

  // Shiprocket customer address lookup when phone reaches 10 digits
  const lookupCustomerDetails = useCallback(
    async (rawPhoneInput: string) => {
      const clean = cleanPhoneDigits(rawPhoneInput);
      if (clean.length !== 10 || lastLookedUpPhoneRef.current === clean) return;
      lastLookedUpPhoneRef.current = clean;

      setIsLookingUpCustomer(true);
      try {
        const res = await fetch(`/api/checkout/customer-lookup?phone=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.success && data.found && data.customer) {
          const c = data.customer;
          if ((!name || name.startsWith("Customer ")) && c.name) setName(c.name);
          if (!email && c.email) setEmail(c.email);
          const cleanStreet = cleanStreetAddress(c.address, c.city, c.state, c.pincode);
          if (!address && cleanStreet) setAddress(cleanStreet);
          if (!city && c.city) setCity(c.city);
          if (!state && c.state) setState(c.state);
          if (!postalCode && c.pincode) {
            setPostalCode(c.pincode);
            setPincodeDetected(true);
          }

          if (cleanStreet) {
            const autoAddr = {
              id: `sr-${clean}`,
              recipient_name: c.name || name || "Customer",
              phone: clean,
              street: cleanStreet,
              city: c.city || city || "",
              state: c.state || state || "",
              postal_code: c.pincode || postalCode || "",
              is_default: true,
            };
            setSavedAddresses((prev) => {
              const exists = prev.some((a) => a.street === autoAddr.street || a.id === autoAddr.id);
              return exists ? prev : [autoAddr, ...prev];
            });
            setSelectedAddressId(autoAddr.id);
          }

          setCustomerLookupBadge(`Saved address loaded for ${c.name || "your number"}`);
        }
      } catch {} finally {
        setIsLookingUpCustomer(false);
      }
    },
    [name, email, address, city, state, postalCode]
  );

  useEffect(() => {
    const clean = cleanPhoneDigits(phone);
    if (clean.length === 10) {
      const timer = window.setTimeout(() => lookupCustomerDetails(clean), 350);
      return () => window.clearTimeout(timer);
    }
  }, [phone, lookupCustomerDetails]);

  // 6-digit Indian Pincode auto-fill
  useEffect(() => {
    const cleanPin = postalCode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setPincodeDetected(false);
      return;
    }
    setPincodeLoading(true);
    fetch(`https://api.postalpincode.in/pincode/${cleanPin}`)
      .then((res) => res.json())
      .then((data) => {
        setPincodeLoading(false);
        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          if (po.District) setCity(po.District);
          if (po.State) setState(po.State);
          setPincodeDetected(true);
          const offices = Array.from(
            new Set(data[0].PostOffice.map((p: any) => p.Name).filter(Boolean))
          ) as string[];
          setDetectedPostOffices(offices);
        } else {
          setPincodeDetected(false);
        }
      })
      .catch(() => {
        setPincodeLoading(false);
        setPincodeDetected(false);
      });
  }, [postalCode]);

  // Auto-clean repeated address suffixes
  useEffect(() => {
    if (address && address.length > 40) {
      const sanitized = cleanStreetAddress(address, city, state, postalCode);
      if (sanitized !== address) setAddress(sanitized);
    }
  }, [address, city, state, postalCode]);

  // Abandoned checkout auto-sync (debounced 1.5s)
  useEffect(() => {
    if (orderComplete) return;
    const clean = cleanPhoneDigits(phone);
    if (clean.length !== 10) return;

    try {
      localStorage.setItem("zupe_checkout_phone", clean);
      if (name.trim()) localStorage.setItem("zupe_checkout_name", name.trim());
    } catch {}

    if (cart.length === 0) {
      fetch("/api/checkout/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_phone: clean, action: "clear_empty" }),
      }).catch(() => {});
      return;
    }

    const timer = window.setTimeout(() => {
      let metaAttr: any = null;
      try {
        const rawAttr = localStorage.getItem("tj_meta_attribution");
        if (rawAttr) metaAttr = JSON.parse(rawAttr);
      } catch {}

      fetch("/api/checkout/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim() || undefined,
          customer_phone: clean,
          customer_email: email.trim() || undefined,
          shipping_address: address.trim() || undefined,
          city: state ? `${city.trim()}, ${state.trim()}` : city.trim() || undefined,
          postal_code: postalCode.trim() || undefined,
          total_amount: grandTotal,
          source: metaAttr ? "meta_ads" : "checkout",
          meta_attribution: metaAttr,
          items: cart.map((c) => ({
            id: c.id,
            name: c.name,
            price: c.price,
            quantity: c.quantity,
            poster_image: c.poster_image,
          })),
        }),
      }).catch(() => {});
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [phone, name, email, address, city, state, postalCode, cart, grandTotal, orderComplete]);

  // Address selection & GPS handlers
  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setIsUsingNewAddress(false);
    if (addr.recipient_name && !addr.recipient_name.startsWith("Customer ")) {
      setName(addr.recipient_name);
    }
    if (addr.phone) setPhone(cleanPhoneDigits(addr.phone));
    setAddress(cleanStreetAddress(addr.street, addr.city, addr.state, addr.postal_code));
    setCity(addr.city || "");
    setState(addr.state || "");
    setPostalCode(addr.postal_code || "");
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setIsUsingNewAddress(true);
    setAddress("");
    setCity("");
    setState("");
    setPostalCode("");
  };

  const handleDeleteSavedAddress = async (e: React.MouseEvent, addrId: string) => {
    e.stopPropagation();
    if (!user?.email) return;
    if (!confirm("Delete this saved delivery address?")) return;

    const cleaned = deduplicateAddresses(savedAddresses.filter((a) => a.id !== addrId));
    setSavedAddresses(cleaned);
    try {
      localStorage.setItem(
        `zp_user_addresses_${user.email.toLowerCase().trim()}`,
        JSON.stringify(cleaned)
      );
    } catch {}

    if (selectedAddressId === addrId) {
      if (cleaned.length > 0) handleSelectSavedAddress(cleaned[0]);
      else handleUseNewAddress();
    }

    fetch(
      `/api/user/addresses?id=${encodeURIComponent(addrId)}&email=${encodeURIComponent(user.email)}`,
      { method: "DELETE" }
    ).catch(() => {});
  };

  const handleFetchCurrentLocation = () => {
    setLocationNotice(null);
    setDetectedPostOffices([]);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationNotice({
        type: "error",
        text: "Location is unavailable on this browser. Enter your 6-digit pincode to auto-fill city and state.",
      });
      return;
    }

    setLocationLoading(true);
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const processCoordinates = async (pos: GeolocationPosition) => {
      try {
        const { latitude, longitude, accuracy = 0 } = pos.coords;
        const res = await fetch(
          `/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}&accuracy=${accuracy}`
        );
        const data = await res.json();

        if (res.ok && data.success) {
          setIsUsingNewAddress(true);
          setSelectedAddressId(null);
          const cleanStreet = (data.street || data.area || "").trim();
          setAddress(cleanStreet || data.area || data.city || "");
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
          if (data.pincode && data.pincode.length === 6) {
            setPostalCode(data.pincode);
            setPincodeDetected(true);
          }
          if (Array.isArray(data.post_offices)) {
            setDetectedPostOffices(data.post_offices);
          }

          if (accuracy > 500) {
            setLocationNotice({
              type: "warning",
              text: "Approximate network location detected. Verify your house number and pincode.",
            });
          } else {
            setLocationNotice({
              type: "success",
              text: `Location filled for ${data.area || data.city || "your area"}.`,
            });
          }
        } else {
          setLocationNotice({
            type: "error",
            text: data.error || "Could not look up that location. Enter your address manually.",
          });
        }
      } catch {
        setLocationNotice({
          type: "error",
          text: "Network error looking up location. Enter your 6-digit pincode instead.",
        });
      } finally {
        setLocationLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      processCoordinates,
      (err) => {
        if (err.code === err.TIMEOUT && isMobileDevice) {
          navigator.geolocation.getCurrentPosition(
            processCoordinates,
            () => {
              setLocationLoading(false);
              setLocationNotice({
                type: "error",
                text: "Weak GPS signal indoors. Enter your 6-digit pincode to auto-fill city and state.",
              });
            },
            { enableHighAccuracy: false, timeout: 7000, maximumAge: 0 }
          );
        } else {
          setLocationLoading(false);
          setLocationNotice({
            type: "error",
            text:
              err.code === err.PERMISSION_DENIED
                ? "Location permission denied. Enter your 6-digit pincode below."
                : "Could not detect location. Enter your 6-digit pincode below.",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  };

  // Promo code apply / remove
  const handleApplyPromo = async () => {
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code to apply.");
      return;
    }

    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotal,
          items: cart.map((c) => ({
            id: c.id,
            name: c.name,
            price:
              c.bundle_tier && c.bundle_tier > 1 && c.bundle_total
                ? Math.round(c.bundle_total / c.quantity)
                : c.price,
            quantity: c.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.valid && data.discount > 0) {
        setPromoDiscount(data.discount);
        setAppliedPromo(data.code || code);
        setPromoSuccess(`Saved ₹${data.discount.toLocaleString("en-IN")}`);
      } else {
        setPromoDiscount(0);
        setAppliedPromo(null);
        setPromoError(data.error || "That promo code is not valid for this cart.");
      }
    } catch {
      setPromoError("Could not verify promo code. Check your connection and try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
    setPromoSuccess(null);
  };

  // Focus helper for validation errors
  const focusFieldWithError = (fieldId: string, msg: string) => {
    setErrorMessage(msg);
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Submit checkout -> create order -> open in-page PyDart Pay Popup Modal
  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) {
      const cleanContact = cleanPhoneDigits(phone);
      openAuthModal(
        "login",
        "Sign in with WhatsApp to complete your order",
        undefined,
        (loggedInUser) => {
          if (loggedInUser?.phone && !phone) setPhone(cleanPhoneDigits(loggedInUser.phone));
          if (loggedInUser?.name && !name) setName(loggedInUser.name);
        },
        {
          initialPhone: cleanContact || undefined,
          autoSendOtp: cleanContact.length === 10,
        }
      );
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      return focusFieldWithError("phone-input", "Enter a valid 10-digit mobile number.");
    }
    if (!name.trim()) {
      return focusFieldWithError("name-input", "Enter your full name for delivery.");
    }
    if (email.trim() && !email.includes("@")) {
      return focusFieldWithError("email-input", "Enter a valid email address or leave it blank.");
    }
    if (!address.trim()) {
      return focusFieldWithError("address-input", "Enter your complete house/street address.");
    }
    if (postalCode.replace(/\D/g, "").length < 6) {
      return focusFieldWithError("pincode-input", "Enter a valid 6-digit pincode.");
    }
    if (!city.trim()) {
      return focusFieldWithError("city-input", "Enter your city.");
    }
    if (!state.trim()) {
      return focusFieldWithError("state-input", "Enter your state.");
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const freshOos = await checkCartStock();
      if (freshOos.length > 0 || hasOutOfStockItems) {
        setLoading(false);
        setErrorMessage("Remove out-of-stock items from your bag before paying.");
        return;
      }

      const chargeAmount = isCod ? effectiveCodAdvance : onlineGrandTotal;
      const totalOrderAmount = isCod ? codGrandTotal : onlineGrandTotal;
      const balanceDueAmount = isCod ? codDoorstepBalance : 0;

      const orderPayload = {
        amount: chargeAmount,
        total_amount: totalOrderAmount,
        balance_due: balanceDueAmount,
        is_cod_advance: isCod,
        payment_method: isCod ? "Cash on Delivery" : "Online Payment",
        customer_name: name.trim(),
        customer_email: email.trim() || undefined,
        customer_phone: phone.trim().startsWith("+91") ? phone.trim() : `+91 ${phone.trim()}`,
        shipping_address: address.trim(),
        city: state ? `${city.trim()}, ${state.trim()}` : city.trim(),
        postal_code: postalCode.trim(),
        discount_amount: totalDiscount,
        promo_code: appliedPromo || undefined,
        promo_discount: promoDiscount || undefined,
        gst_amount: gstAmount,
        shipping_cost: baseShippingFee + (isCod ? effectiveCodAdvance : 0),
        user_id: user.id,
        items: cart.map((c) => ({
          product_id: c.id,
          name: c.name,
          price:
            c.bundle_tier && c.bundle_tier > 1 && c.bundle_total
              ? Math.round(c.bundle_total / c.quantity)
              : c.price,
          unit_price:
            c.bundle_tier && c.bundle_tier > 1 && c.bundle_total
              ? Math.round(c.bundle_total / c.quantity)
              : c.price,
          quantity: c.quantity,
          image: c.poster_image,
          original_price: c.original_price || c.price,
          bundle_tier: c.bundle_tier,
          bundle_savings: c.bundle_savings,
          bundle_total: c.bundle_total,
          offer_label: c.offer_label,
        })),
      };

      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const orderData = await res.json();

      if (res.status === 401 || orderData?.code === "AUTH_REQUIRED") {
        setLoading(false);
        try {
          localStorage.removeItem("zp_user_session");
        } catch {}
        const cleanContact = cleanPhoneDigits(phone);
        openAuthModal(
          "login",
          "Sign in with WhatsApp to place your order",
          undefined,
          (loggedInUser) => {
            if (loggedInUser?.phone && !phone) setPhone(cleanPhoneDigits(loggedInUser.phone));
            if (loggedInUser?.name && !name) setName(loggedInUser.name);
          },
          {
            initialPhone: cleanContact || undefined,
            autoSendOtp: cleanContact.length === 10,
          }
        );
        return;
      }

      const targetPayUrl = orderData.payUrl || orderData.settlerPayUrl;
      if (!orderData.success || !targetPayUrl) {
        setErrorMessage(orderData.error || "Could not start payment. Try again.");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem("zupe_last_order_id", orderData.orderId);
        localStorage.setItem("zupe_last_phone", phone.trim());
      } catch {}

      // Open the PyDart Pay Payment Popup directly over Turkiye Jam checkout
      setLoading(false);
      setActivePaymentPopup({
        orderId: orderData.orderId,
        pydartOrderId: orderData.pydartOrderId,
        payUrl: targetPayUrl,
        amount: Number(orderData.amount || chargeAmount),
        isCod,
        balanceDue: balanceDueAmount,
      });
    } catch {
      setErrorMessage("Network error while opening payment. Try again.");
      setLoading(false);
    }
  };

  // Popup callbacks
  const handlePopupDismissUnpaid = useCallback((orderId: string, reason?: string) => {
    setActivePaymentPopup(null);
    setShowPaymentCancelledModal(true);
    try {
      localStorage.removeItem("zupe_last_order_id");
    } catch {}
    if (orderId) {
      fetch("/api/cashfree/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: reason || "Customer closed payment popup" }),
      }).catch(() => {});
    }
  }, []);

  const handleSwitchToCodFromPopup = useCallback((orderId: string) => {
    setActivePaymentPopup(null);
    setShowPaymentCancelledModal(false);
    setPaymentMethod("cod");
    try {
      localStorage.removeItem("zupe_last_order_id");
    } catch {}
    if (orderId) {
      fetch("/api/cashfree/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: "Customer switched to COD" }),
      }).catch(() => {});
    }
    window.setTimeout(() => {
      document
        .getElementById("payment-cod-card")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }, []);

  // ========================================================
  // STATE VIEWS: Verifying / Confirmed / Loading / Empty / Login Gate
  // ========================================================

  if (verifyingPayment) {
    return (
      <div className="min-h-dvh bg-[#FBF8F3] text-[#1B1714] flex flex-col justify-between">
        <header className="border-b border-stone-200/70 bg-[#FBF8F3]">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={132}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>
        <main className="max-w-sm mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Loader2 className="w-6 h-6 text-[#6E1625] animate-spin" />
          </div>
          <h1 className="font-tj-serif text-2xl font-bold text-[#1B1714]">
            Confirming your payment
          </h1>
          <p className="text-sm text-[#655B53] mt-2 leading-relaxed">
            Verifying your transaction with PyDart Pay. Keep this tab open for a moment.
          </p>
        </main>
        <footer className="py-6 text-center text-xs text-[#8C8177] border-t border-stone-200/60">
          © 2026 Turkiye Jam
        </footer>
      </div>
    );
  }

  if (orderComplete) {
    const confirmedIsCod =
      confirmedPaymentId === "Cash on Delivery" ||
      confirmedPaymentId?.includes("Cash on Delivery");
    const displayTotal = confirmedTotal || grandTotal;
    const advancePaid = confirmedAdvancePaid || (confirmedIsCod ? effectiveCodAdvance : displayTotal);
    const balanceDue = confirmedIsCod
      ? confirmedBalanceDue && confirmedBalanceDue < displayTotal
        ? confirmedBalanceDue
        : Math.max(0, displayTotal - advancePaid)
      : 0;

    return (
      <OrderConfirmationView
        orderId={confirmedOrderId}
        customerName={name}
        customerEmail={email}
        address={address}
        city={city}
        postalCode={postalCode}
        isCod={confirmedIsCod}
        displayTotal={displayTotal}
        advancePaid={advancePaid}
        balanceDue={balanceDue}
        items={confirmedItems}
        onContinueShopping={() => {
          try {
            sessionStorage.removeItem("zupe_confirmed_order");
          } catch {}
          orderConfirmedInSessionRef.current = false;
          setOrderComplete(false);
          router.push("/");
        }}
      />
    );
  }

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-dvh bg-[#FBF8F3] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-7 h-7 text-[#6E1625] animate-spin mb-3" />
        <p className="text-sm text-[#655B53]">Loading checkout…</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-dvh bg-[#FBF8F3] text-[#1B1714] flex flex-col justify-between">
        <header className="border-b border-stone-200/70 bg-[#FBF8F3]">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={132}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>
        <main className="max-w-sm mx-auto py-24 px-4 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-[#6E1625]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="font-tj-serif text-2xl font-bold text-[#1B1714]">Your bag is empty</h1>
          <p className="text-sm text-[#655B53] mt-2 mb-6">
            Add a Turkiye Jam pack to proceed to checkout.
          </p>
          <Link
            href="/#shop"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[#6E1625] hover:bg-[#54101C] text-white text-sm font-medium transition-colors"
          >
            Choose your pack
          </Link>
        </main>
        <footer className="py-6 text-center text-xs text-[#8C8177] border-t border-stone-200/60">
          © 2026 Turkiye Jam
        </footer>
      </div>
    );
  }

  // Mandatory Authentication Gate
  if (!user) {
    const savedPhone =
      typeof window !== "undefined"
        ? localStorage.getItem("zupe_checkout_phone") || localStorage.getItem("zupe_last_phone") || ""
        : "";

    return (
      <div className="min-h-dvh bg-[#FBF8F3] text-[#1B1714] antialiased flex flex-col justify-between">
        <header className="sticky top-0 z-30 bg-[#FBF8F3]/95 backdrop-blur-sm border-b border-stone-200/70">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-[#655B53] hover:text-[#1B1714] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Store</span>
            </Link>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={132}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#655B53]">
              <Lock className="w-3.5 h-3.5 text-[#116A4B]" />
              <span className="hidden sm:inline">Encrypted checkout</span>
            </span>
          </div>
        </header>

        <main className="max-w-md mx-auto w-full py-10 px-4 space-y-4">
          <div className="px-4 py-3 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FBF8F3] border border-stone-200/80 flex items-center justify-center text-[#6E1625] shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1B1714] truncate">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your bag
                </p>
                <p className="text-xs text-[#655B53] tabular-nums">
                  ₹{onlineGrandTotal.toLocaleString("en-IN")} · {isFreeDelivery ? "Free express delivery" : `₹${baseShippingFee} delivery`}
                </p>
              </div>
            </div>
          </div>

          <AuthCard
            isModal={false}
            initialMode="login"
            initialPhone={savedPhone || undefined}
            autoSendOtp={Boolean(savedPhone && savedPhone.length === 10)}
            notice="Sign in with WhatsApp to continue to delivery & payment"
            onSuccess={(loggedInUser) => {
              if (loggedInUser?.phone) setPhone(cleanPhoneDigits(loggedInUser.phone));
              if (loggedInUser?.name && (!name || name.startsWith("Customer "))) {
                setName(loggedInUser.name);
              }
            }}
          />
        </main>

        <footer className="py-6 text-center text-xs text-[#8C8177] border-t border-stone-200/60">
          © 2026 Turkiye Jam
        </footer>
      </div>
    );
  }

  // Primary Pay Button (reused cleanly on desktop sticky summary & mobile sticky dock)
  const payButtonLabel = hasOutOfStockItems
    ? "Remove out-of-stock items"
    : isCod
    ? `Pay ₹${effectiveCodAdvance.toLocaleString("en-IN")} advance`
    : `Pay ₹${onlineGrandTotal.toLocaleString("en-IN")}`;

  const renderPrimaryPayButton = (buttonId?: string, compactMobile = false) => (
    <button
      id={buttonId}
      type={buttonId ? "submit" : "button"}
      onClick={buttonId ? undefined : () => handlePlaceOrder()}
      disabled={loading || hasOutOfStockItems}
      className={`${
        compactMobile ? "px-6 min-h-[48px]" : "w-full min-h-[52px] px-6"
      } rounded-xl bg-[#6E1625] hover:bg-[#54101C] text-white text-sm sm:text-base font-medium shadow-sm transition-transform duration-150 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed tabular-nums`}
    >
      {showPaySpinner ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Opening payment…</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 opacity-90 shrink-0" />
          <span>{payButtonLabel}</span>
          {!hasOutOfStockItems && <ArrowRight className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );

  // ========================================================
  // MAIN SINGLE-PAGE CHECKOUT
  // ========================================================
  return (
    <div className="min-h-dvh bg-[#FBF8F3] text-[#1B1714] antialiased flex flex-col justify-between">
      {/* 1. Minimal Quiet Header */}
      <header className="sticky top-0 z-30 bg-[#FBF8F3]/95 backdrop-blur-sm border-b border-stone-200/70">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-[#655B53] hover:text-[#1B1714] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to store</span>
            <span className="sm:hidden">Store</span>
          </Link>

          <Link href="/" className="inline-flex items-center">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              width={132}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <span className="inline-flex items-center gap-1.5 text-xs text-[#655B53]">
            <Lock className="w-3.5 h-3.5 text-[#116A4B]" />
            <span className="hidden sm:inline">Encrypted checkout</span>
          </span>
        </div>
      </header>

      {/* 2. Main Two-Column Checkout */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 pb-32 lg:pb-14">
        {/* Heading + Signed-In Account Line */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-tj-serif text-2xl sm:text-3xl font-bold text-[#1B1714] tracking-tight">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#655B53] mt-1">
              Signed in as <span className="font-medium text-[#1B1714]">{user.name || user.phone}</span>
              {" · "}
              <button
                type="button"
                onClick={() => openAuthModal("login", "Switch WhatsApp account")}
                className="underline underline-offset-2 hover:text-[#1B1714] cursor-pointer"
              >
                Switch account
              </button>
            </p>
          </div>
        </div>

        {/* Restored Cart Banner */}
        {recoveredBanner && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[#ECF7F2] border border-[#CBE8DA] text-[#116A4B] text-sm flex items-center justify-between gap-3">
            <span>{recoveredBanner}</span>
            <button
              type="button"
              onClick={() => setRecoveredBanner(null)}
              aria-label="Dismiss notice"
              className="p-1.5 rounded-lg hover:bg-[#116A4B]/10 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Inline Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Mobile Collapsible Order Summary Accordion */}
          <div className="lg:hidden rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-[0_1px_2px_rgba(27,23,20,0.04)]">
            <button
              type="button"
              onClick={() => setIsMobileSummaryOpen((v) => !v)}
              aria-expanded={isMobileSummaryOpen}
              className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#6E1625] shrink-0" />
                <span className="text-sm font-medium text-[#1B1714]">
                  Order summary ({totalItemCount})
                </span>
                {isMobileSummaryOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#8C8177]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8C8177]" />
                )}
              </div>
              <span className="text-base font-semibold text-[#1B1714] tabular-nums">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isMobileSummaryOpen && (
                <motion.div
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="overflow-hidden border-t border-stone-100"
                >
                  <div className="p-4">
                    <OrderSummaryCard
                      cart={cart}
                      outOfStockItemIds={outOfStockItemIds}
                      totalItemCount={totalItemCount}
                      subtotal={subtotal}
                      regularSubtotal={regularSubtotal}
                      bundleSavings={bundleSavings}
                      promoCode={promoCode}
                      onPromoCodeChange={setPromoCode}
                      onApplyPromo={handleApplyPromo}
                      onRemovePromo={handleRemovePromo}
                      appliedPromo={appliedPromo}
                      promoDiscount={promoDiscount}
                      promoLoading={promoLoading}
                      promoError={promoError}
                      promoSuccess={promoSuccess}
                      isFreeDelivery={isFreeDelivery}
                      baseShippingFee={baseShippingFee}
                      standardShippingFee={standardShippingFee}
                      paymentMethod={paymentMethod}
                      codAdvanceAmount={effectiveCodAdvance}
                      onlineGrandTotal={onlineGrandTotal}
                      codGrandTotal={codGrandTotal}
                      codDoorstepBalance={codDoorstepBalance}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeFromCart}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LEFT COLUMN (7 cols): Delivery Details + Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Contact & Delivery */}
            <section className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(27,23,20,0.04)] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[#1B1714]">
                  Delivery details
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    disabled={locationLoading}
                    className="min-h-[38px] px-3 rounded-lg bg-[#FBF8F3] hover:bg-[#F3EDE5] border border-stone-200/80 text-xs font-medium text-[#6E1625] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-55"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                    <span>{locationLoading ? "Locating…" : "Use GPS"}</span>
                  </button>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className="min-h-[38px] px-2.5 text-xs font-medium text-[#655B53] hover:text-[#1B1714] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New address</span>
                    </button>
                  )}
                </div>
              </div>

              {/* GPS Feedback */}
              {locationNotice && (
                <div
                  className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                    locationNotice.type === "success"
                      ? "bg-[#ECF7F2] border-[#CBE8DA] text-[#116A4B]"
                      : locationNotice.type === "warning"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <span>{locationNotice.text}</span>
                  <button
                    type="button"
                    onClick={() => setLocationNotice(null)}
                    aria-label="Dismiss location notice"
                    className="p-1 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && !isUsingNewAddress && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#655B53]">Saved addresses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectSavedAddress(addr);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                            isSelected
                              ? "border-[#6E1625] bg-[#FDF6F7]"
                              : "border-stone-200 bg-[#FBF8F3]/60 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#1B1714] truncate">
                              {addr.recipient_name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedAddress(e, addr.id)}
                              aria-label={`Delete address for ${addr.recipient_name}`}
                              className="p-1 -m-1 text-[#8C8177] hover:text-rose-700 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-[#655B53] line-clamp-2 leading-relaxed">
                            {addr.street}, {addr.city} — {addr.postal_code}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Row: Mobile + Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="phone-input" className="block text-xs font-medium text-[#655B53]">
                    Mobile number (WhatsApp updates)
                  </label>
                  <div className="flex rounded-xl border border-stone-200 bg-white overflow-hidden focus-within:border-[#1B1714] transition-colors">
                    <span className="px-3 bg-[#FBF8F3] border-r border-stone-200 text-sm font-medium text-[#655B53] flex items-center select-none shrink-0">
                      +91
                    </span>
                    <input
                      id="phone-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(cleanPhoneDigits(e.target.value))}
                      onBlur={(e) => {
                        const val = cleanPhoneDigits(e.target.value);
                        if (val.length === 10) lookupCustomerDetails(val);
                      }}
                      placeholder="10-digit mobile"
                      className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none tabular-nums"
                    />
                  </div>
                  {isLookingUpCustomer && (
                    <p className="text-[11px] text-[#655B53] flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Checking saved delivery details…</span>
                    </p>
                  )}
                  {customerLookupBadge && !isLookingUpCustomer && (
                    <p className="text-[11px] text-[#116A4B] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{customerLookupBadge}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="name-input" className="block text-xs font-medium text-[#655B53]">
                    Full name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Recipient full name"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <label htmlFor="address-input" className="block text-xs font-medium text-[#655B53]">
                  House, street &amp; landmark
                </label>
                <textarea
                  id="address-input"
                  autoComplete="street-address"
                  required
                  maxLength={200}
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / flat no., road, area, nearby landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors resize-none leading-relaxed"
                />
                {detectedPostOffices.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#8C8177]">Area:</span>
                    {detectedPostOffices.slice(0, 5).map((po) => (
                      <button
                        key={po}
                        type="button"
                        onClick={() => {
                          if (!address.toLowerCase().includes(po.toLowerCase())) {
                            setAddress((prev) => (prev ? `${prev}, ${po}` : po));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FBF8F3] hover:bg-[#F3EDE5] border border-stone-200 text-xs text-[#1B1714] transition-colors cursor-pointer"
                      >
                        + {po}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pincode + City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <label htmlFor="pincode-input" className="text-xs font-medium text-[#655B53]">
                      Pincode
                    </label>
                    {pincodeLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E1625]" />
                    ) : pincodeDetected ? (
                      <span className="text-[11px] font-medium text-[#116A4B] inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Serviceable
                      </span>
                    ) : null}
                  </div>
                  <input
                    id="pincode-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="682001"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city-input" className="block text-xs font-medium text-[#655B53]">
                    City
                  </label>
                  <input
                    id="city-input"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kochi"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="state-input" className="block text-xs font-medium text-[#655B53]">
                    State
                  </label>
                  <input
                    id="state-input"
                    type="text"
                    autoComplete="address-level1"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Kerala"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors"
                  />
                </div>
              </div>

              {/* Optional Email */}
              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-medium text-[#655B53]">
                  Email for receipt <span className="text-[#8C8177] font-normal">(optional)</span>
                </label>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors"
                />
              </div>
            </section>

            {/* Section 2: Payment Method */}
            <section
              id="payment-method-section"
              className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(27,23,20,0.04)] p-5 sm:p-6 space-y-4"
            >
              <div>
                <h2 className="text-base font-semibold text-[#1B1714]">Payment method</h2>
                <p className="text-xs text-[#655B53] mt-0.5">
                  Opens the PyDart Pay UPI checkout popup right here — fast &amp; direct.
                </p>
              </div>

              <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                {/* Option 1: Pay Online */}
                <button
                  id="payment-online-card"
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "online"}
                  onClick={() => setPaymentMethod("online")}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    paymentMethod === "online"
                      ? "border-[#6E1625] bg-[#FDF6F7]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${
                          paymentMethod === "online" ? "border-[#6E1625]" : "border-stone-300"
                        }`}
                      >
                        {paymentMethod === "online" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6E1625]" />
                        )}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#1B1714]">
                            Pay online via UPI
                          </span>
                          <span className="text-[11px] font-medium text-[#116A4B] bg-[#ECF7F2] px-2 py-0.5 rounded-md">
                            {isFreeDelivery ? "Free express delivery" : "Fastest dispatch"}
                          </span>
                        </div>
                        <p className="text-xs text-[#655B53] mt-1">
                          Google Pay, PhonePe, Paytm, BHIM &amp; all UPI apps. 2–4 business days.
                        </p>
                      </div>
                    </div>

                    <span className="text-base font-semibold text-[#1B1714] tabular-nums shrink-0">
                      ₹{onlineGrandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </button>

                {/* Option 2: Cash on Delivery (Partial COD Advance) */}
                <button
                  id="payment-cod-card"
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "cod"}
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-[#6E1625] bg-[#FDF6F7]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${
                          paymentMethod === "cod" ? "border-[#6E1625]" : "border-stone-300"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6E1625]" />
                        )}
                      </span>
                      <div>
                        <span className="text-sm font-semibold text-[#1B1714] block">
                          Cash on Delivery
                        </span>
                        <p className="text-xs text-[#655B53] mt-1">
                          Pay ₹{effectiveCodAdvance.toLocaleString("en-IN")} courier advance online now to confirm, then ₹{codDoorstepBalance.toLocaleString("en-IN")} at your doorstep.
                        </p>
                      </div>
                    </div>

                    <div className="text-right tabular-nums shrink-0">
                      <span className="text-base font-semibold text-[#6E1625] block">
                        ₹{effectiveCodAdvance.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-[#8C8177] block">now</span>
                    </div>
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="mt-3.5 pt-3 border-t border-stone-200/70 grid grid-cols-2 gap-2.5 text-xs tabular-nums">
                      <div className="p-2.5 rounded-lg bg-white border border-stone-200/70">
                        <span className="text-[#8C8177] block">Online advance</span>
                        <span className="font-semibold text-[#6E1625] text-sm">
                          ₹{effectiveCodAdvance.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-stone-200/70">
                        <span className="text-[#8C8177] block">Cash / UPI on delivery</span>
                        <span className="font-semibold text-[#1B1714] text-sm">
                          ₹{codDoorstepBalance.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (5 cols): Sticky Desktop Order Summary + Primary Pay Button */}
          <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(27,23,20,0.04)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#1B1714]">Order summary</h2>
                <span className="text-xs text-[#8C8177]">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <OrderSummaryCard
                cart={cart}
                outOfStockItemIds={outOfStockItemIds}
                totalItemCount={totalItemCount}
                subtotal={subtotal}
                regularSubtotal={regularSubtotal}
                bundleSavings={bundleSavings}
                promoCode={promoCode}
                onPromoCodeChange={setPromoCode}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
                appliedPromo={appliedPromo}
                promoDiscount={promoDiscount}
                promoLoading={promoLoading}
                promoError={promoError}
                promoSuccess={promoSuccess}
                isFreeDelivery={isFreeDelivery}
                baseShippingFee={baseShippingFee}
                standardShippingFee={standardShippingFee}
                paymentMethod={paymentMethod}
                codAdvanceAmount={effectiveCodAdvance}
                onlineGrandTotal={onlineGrandTotal}
                codGrandTotal={codGrandTotal}
                codDoorstepBalance={codDoorstepBalance}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                desktopActionSlot={renderPrimaryPayButton("checkout-submit-btn")}
              />
            </div>
          </aside>
        </form>
      </main>

      {/* Mobile Sticky Bottom Payment Bar (always thumb-accessible) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(27,23,20,0.14)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="tabular-nums">
            <span className="text-[11px] text-[#655B53] block">
              {isCod ? "Pay online now" : "Total payable"}
            </span>
            <span className="text-lg font-semibold text-[#1B1714]">
              ₹{payableNow.toLocaleString("en-IN")}
            </span>
          </div>
          {renderPrimaryPayButton(undefined, true)}
        </div>
      </div>

      {/* IN-PAGE PYDART PAY PAYMENT POPUP MODAL */}
      <PaymentPopupModal
        paymentOrder={activePaymentPopup}
        onPaymentConfirmed={(confirmedId) => verifyPaymentOrder(confirmedId)}
        onDismissUnpaid={handlePopupDismissUnpaid}
        onSwitchToCod={handleSwitchToCodFromPopup}
      />

      {/* Calm Payment Incomplete Recovery Dialog */}
      <AnimatePresence>
        {showPaymentCancelledModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Payment not completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: EASE_OUT }}
            onClick={() => setShowPaymentCancelledModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120E0C]/55 backdrop-blur-[3px]"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1B1714]">
                      Payment not completed
                    </h3>
                    <p className="text-xs text-[#655B53] mt-0.5">
                      No amount was charged to your account.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentCancelledModal(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#8C8177] hover:text-[#1B1714] hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentCancelledModal(false);
                    handlePlaceOrder();
                  }}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-[#6E1625] hover:bg-[#54101C] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Try payment again</span>
                </button>

                {paymentMethod !== "cod" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentCancelledModal(false);
                      setPaymentMethod("cod");
                      window.setTimeout(() => {
                        document
                          .getElementById("payment-cod-card")
                          ?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 100);
                    }}
                    className="w-full min-h-[46px] px-4 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EDE5] border border-stone-200 text-[#1B1714] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-[#6E1625]" />
                    <span>Switch to Cash on Delivery (₹{effectiveCodAdvance} advance)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowPaymentCancelledModal(false)}
                  className="w-full min-h-[42px] px-4 rounded-xl text-xs font-medium text-[#655B53] hover:text-[#1B1714] cursor-pointer"
                >
                  Edit delivery details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiet Footer */}
      <footer className="hidden lg:block py-6 text-center text-xs text-[#8C8177] border-t border-stone-200/60">
        © 2026 Turkiye Jam
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-dvh bg-[#FBF8F3] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-7 h-7 text-[#6E1625] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#655B53]">Loading checkout…</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
