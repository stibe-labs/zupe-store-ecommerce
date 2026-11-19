"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Sparkles,
  MapPin,
  LocateFixed,
  Phone,
  Plus,
  Trash2,
  Star,
  Tag,
  Check,
  ShoppingBag,
  Package,
  Search,
  Smartphone,
  User,
  Mail,
  Clock,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { deduplicateAddresses, normalizeAddressKey } from "@/lib/addressUtils";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { cleanCityName } from "@/lib/pincodeService";
import { trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

// Recommended Bump / Upsell Products
const BUMP_PRODUCTS = [
  {
    id: "water-ripple-lamp",
    slug: "dynamic-water-ripple-night-light",
    name: "Dynamic Water Ripple Night Light",
    price: 650,
    mrp: 1099,
    poster_image: "/products/ripple/ripple-amber.jpg",
    category: "Home & Living",
  },
  {
    id: "mini-portable-steam-iron",
    slug: "mini-portable-steam-iron",
    name: "Mini Portable Steam Iron",
    price: 599,
    mrp: 929,
    poster_image: "/products/iron/iron-teal-1.jpg",
    category: "Home & Living",
  },
  {
    id: "helicopter-car-perfume",
    slug: "helicopter-car-perfume",
    name: "Helicopter Solar Rotating Perfume",
    price: 699,
    mrp: 999,
    poster_image: "/products/helicopter/heli-black-1.jpg",
    category: "Car Accessories",
  },
];

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
  const {
    cart,
    addToCart,
    subtotal,
    savings,
    clearCart,
    removeFromCart,
    freeShippingThreshold,
    outOfStockItemIds,
    hasOutOfStockItems,
    checkCartStock,
    openQuickBuy,
  } = useCart();
  const { user, isLoading: authLoading, updateUserProfile, sendPhoneOtp, loginWithPhoneOtp } = useAuth();

  // Redirect old checkout page to root with GlobalQuickBuyDrawer
  useEffect(() => {
    if (cart.length > 0) {
      openQuickBuy({ items: cart });
      router.replace("/");
    } else {
      router.replace("/products");
    }
  }, [cart, openQuickBuy, router]);

  // Contact & Delivery state
  const [phone, setPhone] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const pParam = urlParams.get("phone");
        if (pParam) return cleanPhoneDigits(pParam);
        const stored = sessionStorage.getItem("checkout_prefill_phone");
        if (stored) return cleanPhoneDigits(stored);
      } catch {}
    }
    return cleanPhoneDigits(user?.phone || "");
  });
  const [name, setName] = useState(() => (user?.name && !user.name.startsWith("Customer ") ? user.name : ""));
  // Customer must type their real email address manually
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDetected, setPincodeDetected] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedPostOffices, setDetectedPostOffices] = useState<string[]>([]);
  const [locationAccuracyNotice, setLocationAccuracyNotice] = useState<string | null>(null);

  // Payment method state ("prepaid" or "cod")
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("prepaid");

  // Step progression state ("details" = contact & delivery, "payment" = choose how to pay)
  const [checkoutStep, setCheckoutStep] = useState<"details" | "payment">("details");
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(false);


  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);
  const [isAddressesExpanded, setIsAddressesExpanded] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>("");
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [confirmedItems, setConfirmedItems] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [recoveredBanner, setRecoveredBanner] = useState<string | null>(null);
  const [isRestoringCart, setIsRestoringCart] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return Boolean(p.get("recover") || p.get("recovery") || p.get("rec_token") || p.get("token"));
    }
    return false;
  });

  // Urgency Timer (Digital Countdown: Hours, Mins, Secs)
  const [timeLeft, setTimeLeft] = useState(6 * 3600 + 7 * 60 + 24); // 06:07:24

  // WhatsApp OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpVerifiedSuccess, setIsOtpVerifiedSuccess] = useState<boolean>(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // OTP Timer countdown
  useEffect(() => {
    if (!showOtpModal) return;
    setCanResendOtp(false);
    setOtpTimer(30);

    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpModal]);

  // Restore order confirmation view if customer refreshes the thank-you screen
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem("zupe_order_confirmed_snapshot");
      if (saved) {
        const snap = JSON.parse(saved);
        if (snap && snap.orderId && Date.now() - (snap.timestamp || 0) < 30 * 60 * 1000) {
          setConfirmedOrderId(snap.orderId);
          setConfirmedTotal(snap.totalAmount || 0);
          setConfirmedPaymentId(snap.paymentId || "");
          setConfirmedItems(snap.items || []);
          if (snap.customerName) setName(snap.customerName);
          if (snap.customerPhone) setPhone(snap.customerPhone);
          if (snap.customerEmail) setEmail(snap.customerEmail);
          if (snap.address) setAddress(snap.address);
          if (snap.city) setCity(snap.city);
          if (snap.postalCode) setPostalCode(snap.postalCode);
          if (snap.paymentMethod) setPaymentMethod(snap.paymentMethod);
          setOrderComplete(true);
        }
      }
    } catch {}
  }, []);

  // Auto-scroll to Section 2 (Delivery details) if arriving from Quick Buy Drawer with verified phone
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const p = new URLSearchParams(window.location.search);
      const urlPhone = p.get("phone");
      const storedPhone = sessionStorage.getItem("checkout_prefill_phone");
      const targetPhone = urlPhone || storedPhone;
      if (targetPhone) {
        const cleaned = cleanPhoneDigits(targetPhone);
        if (cleaned && cleaned.length === 10) {
          setPhone(cleaned);
        }
      }
      if (p.get("step") === "delivery" || searchParams.get("step") === "delivery") {
        setTimeout(() => {
          const el = document.getElementById("delivery-details-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            const nameInput = document.getElementById("name-input");
            if (nameInput) nameInput.focus();
          }
        }, 400);
      }
    } catch {}
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 6 * 3600 + 7 * 60 + 24));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a valid promo code");
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
            price: (c.bundle_tier && c.bundle_tier > 1 && c.bundle_total)
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
        setPromoSuccess(data.message || `Code ${data.code || code} applied: ₹${data.discount} discount added.`);
        setPromoError(null);
      } else {
        setPromoDiscount(0);
        setAppliedPromo(null);
        setPromoError(data.error || "Invalid promo code.");
        setPromoSuccess(null);
      }
    } catch {
      setPromoDiscount(0);
      setAppliedPromo(null);
      setPromoError("Unable to validate promo code. Please check your connection and try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setAppliedPromo(null);
    setPromoCode("");
    setPromoSuccess(null);
    setPromoError(null);
  };

  // COD to Prepaid Switch Mode state
  const isCodSwitchMode =
    searchParams.get("switch") === "cod" ||
    Boolean(searchParams.get("switch_order"));

  const [switchQuery, setSwitchQuery] = useState(() => {
    return (
      searchParams.get("orderId") ||
      searchParams.get("order_id") ||
      searchParams.get("query") ||
      searchParams.get("switch_order") ||
      ""
    );
  });
  const [switchOrder, setSwitchOrder] = useState<any | null>(null);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchPaying, setSwitchPaying] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [switchSuccessOrderId, setSwitchSuccessOrderId] = useState("");
  const [switchSuccessAmount, setSwitchSuccessAmount] = useState(0);

  const lookupCodOrder = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setSwitchError("Please enter your Order ID or phone number.");
      return;
    }
    setSwitchLoading(true);
    setSwitchError("");
    try {
      const res = await fetch(`/api/orders/switch-to-prepaid?query=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSwitchOrder(data.order);
      } else {
        setSwitchError(data.error || "No pending Cash on Delivery order found. Please check your Order ID.");
      }
    } catch (err: any) {
      setSwitchError("Network error. Unable to fetch order details.");
    } finally {
      setSwitchLoading(false);
    }
  };

  useEffect(() => {
    if (!isCodSwitchMode) return;
    let initialTerm = switchQuery;
    if (!initialTerm && typeof window !== "undefined") {
      initialTerm =
        localStorage.getItem("zupe_last_cod_order_id") ||
        localStorage.getItem("zupe_last_cod_phone") ||
        "";
      if (initialTerm) {
        setSwitchQuery(initialTerm);
      }
    }
    if (initialTerm) {
      lookupCodOrder(initialTerm);
    }
  }, [isCodSwitchMode]);

  // 1-Click Cart Restoration via WhatsApp Recovery Link (?recover=token or ?token=token)
  useEffect(() => {
    const recoverToken =
      searchParams.get("recover") ||
      searchParams.get("recovery") ||
      searchParams.get("rec_token") ||
      searchParams.get("token");

    if (!recoverToken) return;

    let isMounted = true;
    async function restoreCheckoutSession() {
      try {
        const res = await fetch(`/api/checkout/abandoned?token=${encodeURIComponent(recoverToken as string)}`);
        const data = await res.json();
        if (isMounted && data.success && data.checkout) {
          const chk = data.checkout;
          if (chk.customer_name) setName(chk.customer_name);
          if (chk.customer_phone) setPhone(cleanPhoneDigits(chk.customer_phone));
          if (
            chk.customer_email &&
            !chk.customer_email.includes("example.com") &&
            !chk.customer_email.endsWith("@customer.zupestore.com") &&
            !chk.customer_email.toLowerCase().startsWith("test@")
          ) {
            setEmail(chk.customer_email);
          }
          if (chk.shipping_address) setAddress(chk.shipping_address);
          if (chk.city) setCity(cleanCityName(chk.city, chk.state || state));
          if (chk.postal_code) setPostalCode(chk.postal_code);

          // Restore items into cart
          if (Array.isArray(chk.items) && chk.items.length > 0) {
            chk.items.forEach((it: any) => {
              addToCart(
                {
                  id: it.id || it.product_id,
                  name: it.name || it.product_name,
                  price: Number(it.price || it.unit_price || 0),
                  original_price: Number(it.original_price || it.mrp || 0),
                  poster_image: it.poster_image || it.image || "/products/ripple-lamp.jpg",
                  category: it.category || "General",
                },
                Number(it.quantity || 1),
                { overrideQuantity: true }
              );
            });
          }

          setRecoveredBanner(
            `Welcome back${chk.customer_name ? `, ${chk.customer_name.split(" ")[0]}` : ""}! Your cart and shipping details have been restored.`
          );
        }
      } catch (err) {
        console.warn("Failed to restore abandoned checkout:", err);
      } finally {
        if (isMounted) {
          setIsRestoringCart(false);
        }
      }
    }

    restoreCheckoutSession();
    return () => {
      isMounted = false;
    };
  }, [searchParams, addToCart]);

  const handlePayForCodOrder = async () => {
    if (!switchOrder) return;
    setSwitchPaying(true);
    setSwitchError("");

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setSwitchPaying(false);
        setSwitchError("Could not load secure payment gateway. Please check your internet connection.");
        return;
      }

      const res = await fetch("/api/orders/switch-to-prepaid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: switchOrder.id }),
      });
      const data = await res.json();

      if (!data.success || !data.razorpay_order_id) {
        setSwitchPaying(false);
        setSwitchError(data.error || "Failed to initialize payment. Please try again.");
        return;
      }

      const payableAmount = data.amount;

      const options = {
        key: data.key_id || RAZORPAY_KEY_ID,
        amount: Math.round(payableAmount * 100),
        currency: "INR",
        name: "Zupe Store",
        description: `Order ${switchOrder.display_id || switchOrder.id} - Switch to Prepaid (Save ₹49)`, 
        image: "/zupe-logo.webp",
        order_id: data.razorpay_order_id,
        prefill: {
          name: switchOrder.customer_name || "",
          email: switchOrder.customer_email || "",
          contact: (switchOrder.customer_phone || "").replace(/\D/g, "").slice(-10),
          method: "upi",
        },
        theme: {
          color: "#FF7A00",
          backdrop_color: "rgba(17, 17, 17, 0.7)",
        },
        modal: {
          ondismiss: function () {
            setSwitchPaying(false);
          },
        },
        handler: async function (response: any) {
          try {
            setSwitchPaying(true);
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_payload: {
                  is_cod_switch: true,
                  existing_order_id: switchOrder.id,
                  discounted_amount: payableAmount,
                  customer_name: switchOrder.customer_name,
                  customer_phone: switchOrder.customer_phone,
                  items: switchOrder.items,
                },
              }),
            });
            const verifyData = await verifyRes.json();
            setSwitchPaying(false);
            if (verifyData.success) {
              setSwitchSuccess(true);
              setSwitchSuccessOrderId(switchOrder.id);
              setSwitchSuccessAmount(payableAmount);
            } else {
              setSwitchError(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (vErr: any) {
            setSwitchPaying(false);
            setSwitchError("Network error while verifying payment.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failResp: any) {
        setSwitchPaying(false);
        setSwitchError(failResp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      setSwitchPaying(false);
      setSwitchError(err.message || "An unexpected error occurred.");
    }
  };

  // Pre-load product from URL if cart is empty (e.g. ?productId=... or ?slug=...)
  useEffect(() => {
    const paramId = searchParams.get("productId") || searchParams.get("id");
    const paramSlug = searchParams.get("funnel") || searchParams.get("slug");
    if (cart.length === 0 && (paramId || paramSlug)) {
      const match = DEFAULT_PRODUCTS.find(
        (p) => p.id === paramId || p.slug === paramSlug || p.id === paramSlug
      );
      if (match) {
        addToCart(match, 1);
      }
    }
  }, [searchParams, cart.length, addToCart]);

  // Handle URL pre-selected payment method
  useEffect(() => {
    const methodParam = searchParams.get("method")?.toLowerCase();
    if (methodParam === "cod") {
      setPaymentMethod("cod");
    } else {
      setPaymentMethod("prepaid");
    }
  }, [searchParams]);

  // Populate user data if logged in (phone and real name only - no default email)
  useEffect(() => {
    if (user) {
      if (!name && user.name && !user.name.startsWith("Customer ")) {
        setName(user.name);
      }
      if (!phone && user.phone) {
        setPhone(cleanPhoneDigits(user.phone));
      }
    }
  }, [user, name, phone]);

  // Hydrate saved addresses
  useEffect(() => {
    if (!user?.email) return;

    const normEmail = user.email.toLowerCase().trim();
    const cacheKey = `zp_user_addresses_${normEmail}`;
    const lastUsedKey = `zp_last_used_address_id_${normEmail}`;

    const sortWithLatestUsedFirst = (list: any[]) => {
      if (!list || list.length <= 1) return list;
      let cachedLastId: string | null = null;
      try {
        cachedLastId = localStorage.getItem(lastUsedKey);
      } catch (e) {}

      return [...list].sort((a, b) => {
        // 1. Explicitly recorded latest used ID in client session
        if (cachedLastId) {
          if (a.id === cachedLastId) return -1;
          if (b.id === cachedLastId) return 1;
        }
        // 2. Most recent last_used_at timestamp
        if (a.last_used_at && b.last_used_at) {
          const diff = new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
          if (diff !== 0) return diff;
        }
        if (a.last_used_at && !b.last_used_at) return -1;
        if (!a.last_used_at && b.last_used_at) return 1;
        // 3. Explicit default address
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        // 4. Most recently created
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
    };

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deduplicated = deduplicateAddresses(parsed);
          const sorted = sortWithLatestUsedFirst(deduplicated);
          setSavedAddresses(sorted);
          const defaultAddr = sorted[0];
          if (defaultAddr && !address) {
            setSelectedAddressId(defaultAddr.id);
            if (defaultAddr.recipient_name && !defaultAddr.recipient_name.startsWith("Customer ")) {
              setName(defaultAddr.recipient_name);
            }
            if (defaultAddr.phone) setPhone(cleanPhoneDigits(defaultAddr.phone));
            setAddress(defaultAddr.street || "");
            setCity(defaultAddr.city || "");
            setState(defaultAddr.state || "");
            setPostalCode(defaultAddr.postal_code || "");
          }
        }
      }
    } catch (e) {}

    fetch(`/api/user/addresses?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id || "")}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.addresses)) {
          const deduplicated = deduplicateAddresses(data.addresses);
          const sorted = sortWithLatestUsedFirst(deduplicated);
          setSavedAddresses(sorted);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(sorted));
          } catch (e) {}

          const defaultAddr = sorted[0];
          if (defaultAddr && (!address || !selectedAddressId)) {
            setSelectedAddressId(defaultAddr.id);
            if (defaultAddr.recipient_name && !defaultAddr.recipient_name.startsWith("Customer ")) {
              setName(defaultAddr.recipient_name);
            }
            if (defaultAddr.phone) setPhone(cleanPhoneDigits(defaultAddr.phone));
            setAddress(defaultAddr.street || "");
            setCity(defaultAddr.city || "");
            setState(defaultAddr.state || "");
            setPostalCode(defaultAddr.postal_code || "");
          }
        }
      })
      .catch((err) => console.warn("Failed to load saved addresses in checkout:", err));
  }, [user?.email, user?.id]);

  // Auto-detect city & state when pincode is 6 digits via internal instant API
  useEffect(() => {
    const cleanPin = postalCode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      fetch(`/api/location/pincode?pincode=${cleanPin}`)
        .then((res) => res.json())
        .then((data) => {
          setPincodeLoading(false);
          if (data.success && data.valid) {
            setCity(cleanCityName(data.city || data.district, data.state));
            if (data.state) setState(data.state);
            setPincodeDetected(true);
            if (Array.isArray(data.post_offices) && data.post_offices.length > 0) {
              setDetectedPostOffices(data.post_offices);
            }
          } else {
            setPincodeDetected(false);
          }
        })
        .catch(() => {
          setPincodeLoading(false);
          setPincodeDetected(false);
        });
    } else {
      setPincodeDetected(false);
      setPincodeLoading(false);
    }
  }, [postalCode]);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setIsUsingNewAddress(false);
    if (addr.recipient_name && !addr.recipient_name.startsWith("Customer ")) {
      setName(addr.recipient_name);
    }
    if (addr.phone) setPhone(cleanPhoneDigits(addr.phone));
    setAddress(addr.street || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setPostalCode(addr.postal_code || "");

    if (user?.email) {
      try {
        localStorage.setItem(`zp_last_used_address_id_${user.email.toLowerCase().trim()}`, addr.id);
        fetch("/api/user/addresses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: addr.id, email: user.email, action: "touch_last_used" }),
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setIsUsingNewAddress(true);
    setAddress("");
    setCity("");
    setState("");
    setPostalCode("");
  };

  const handleFetchCurrentLocation = () => {
    setLocationError(null);
    setLocationSuccessMsg(null);
    setLocationAccuracyNotice(null);
    setDetectedPostOffices([]);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please enter your 6-digit Pincode to auto-fill your area.");
      return;
    }

    setLocationLoading(true);

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Process coordinates returned by browser
    const processCoordinates = async (pos: GeolocationPosition) => {
      try {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 0;

        const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}&accuracy=${accuracy}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setIsUsingNewAddress(true);
          setSelectedAddressId(null);

          // Cleanly overwrite address with GPS-detected street/area (never concatenate with previous location)
          const cleanStreet = (data.street || data.area || "").trim();
          setAddress(cleanStreet || data.area || data.city || "");

          const cleanCity = cleanCityName(data.city || data.district, data.state);
          if (cleanCity) setCity(cleanCity);
          if (data.state) setState(data.state);

          if (data.pincode && data.pincode.length === 6) {
            setPostalCode(data.pincode);
            setPincodeDetected(true);
          }

          if (Array.isArray(data.post_offices) && data.post_offices.length > 0) {
            setDetectedPostOffices(data.post_offices);
          }

          // Accuracy Feedback
          if (accuracy > 0 && accuracy <= 150) {
            setLocationSuccessMsg(`High-Precision GPS (~${Math.round(accuracy)}m): ${data.area || cleanCity || "Location detected"}`);
          } else if (accuracy > 0 && accuracy <= 500) {
            setLocationSuccessMsg(`Area Location (~${Math.round(accuracy)}m): ${data.area || cleanCity || "Location detected"}`);
          } else if (accuracy > 500) {
            setLocationAccuracyNotice(
              `Approximate Network Location (~${(accuracy / 1000).toFixed(1)} km) detected via Wi-Fi/ISP routing. Please verify your House No and Pincode.`
            );
          } else {
            setLocationSuccessMsg(`Location detected: ${data.area || cleanCity || "Address filled"}`);
          }

          setTimeout(() => setLocationSuccessMsg(null), 8000);
        } else {
          setLocationError(data.error || "Unable to determine address from GPS coordinates. Please enter manually.");
        }
      } catch (err: any) {
        setLocationError("Network error while looking up location details.");
      } finally {
        setLocationLoading(false);
      }
    };

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      processCoordinates,
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow location access in your browser or type your 6-digit Pincode below.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location signal unavailable. Please enter your 6-digit Pincode below.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out. Please enter your 6-digit Pincode below.");
        } else {
          setLocationError("Unable to fetch current location. Please enter your 6-digit Pincode below.");
        }
      },
      geoOptions
    );
  };

  const handleDeleteSavedAddress = async (e: React.MouseEvent, addrId: string) => {
    e.stopPropagation();
    if (!user?.email) return;
    if (!confirm("Are you sure you want to delete this saved delivery address?")) return;

    const remaining = savedAddresses.filter((a) => a.id !== addrId);
    const cleaned = deduplicateAddresses(remaining);
    setSavedAddresses(cleaned);

    const cacheKey = `zp_user_addresses_${user.email.toLowerCase().trim()}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cleaned));
    } catch (err) {}

    if (selectedAddressId === addrId) {
      if (cleaned.length > 0) {
        handleSelectSavedAddress(cleaned[0]);
      } else {
        handleUseNewAddress();
      }
    }

    try {
      await fetch(
        `/api/user/addresses?id=${encodeURIComponent(addrId)}&email=${encodeURIComponent(user.email)}`,
        { method: "DELETE" }
      );
    } catch (err) {
      console.warn("Failed to delete saved address:", err);
    }
  };

  // Shipping & COD Calculations
  // Prepaid has Free Shipping (₹0) and ₹0 COD fee.
  // COD handling fee: ₹19 for order total < ₹500, ₹49 for order total >= ₹500.
  // (Order total = cart total after coupon, before the COD fee).
  // COD fee is paid online upfront via Razorpay; product price is paid in cash/UPI at delivery.
  const isCod = paymentMethod === "cod";
  const cartTotal = Math.max(0, subtotal - promoDiscount);
  const codFee = cartTotal < 500 ? 19 : 49;
  const codShippingFee = codFee;
  const shippingFee = isCod ? codFee : 0;
  const codAdvance = isCod ? codFee : 0;
  const totalItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  // Buy More Save More calculations
  const regularSubtotal = cart.reduce((sum, it) => {
    const basePrice = it.original_price || it.price;
    return sum + basePrice * it.quantity;
  }, 0);

  const bundleSavings = cart.reduce((sum, it) => {
    if (it.bundle_tier && it.bundle_tier > 1) {
      if (it.bundle_savings) return sum + it.bundle_savings;
      const baseTotal = (it.original_price || it.price) * it.quantity;
      const actualTotal = it.bundle_total || (it.price * it.quantity);
      return sum + Math.max(0, baseTotal - actualTotal);
    }
    return sum;
  }, 0);

  // Total calculations
  const totalDiscount = savings + bundleSavings + promoDiscount;
  const grandTotal = isCod ? cartTotal + codFee : cartTotal;
  const payablePrepaid = cartTotal;
  const payableNow = isCod ? codFee : payablePrepaid;
  const doorstepBalance = isCod ? cartTotal : 0;

  // Dedicated COD preview calculations (always accurate regardless of currently active tab)
  const codTotalCost = cartTotal + codFee;
  const codDoorstepBalance = cartTotal;

  // Total MRP for comparison pill
  const totalMrp = cart.reduce((sum, it) => {
    const itemMrp = it.mrp || it.original_price || Math.round(it.price * 1.35);
    return sum + itemMrp * it.quantity;
  }, 0);
  const totalMrpSavings = Math.max(0, totalMrp - grandTotal);
  const totalSavings = totalMrpSavings;
  const pincodeValid = pincodeDetected;
  const pincodeMessage = postalCode.length === 6 ? (pincodeDetected ? `${city}, ${state}` : null) : null;

  // Upsell bump offer candidates (excluding what is already in cart)
  const availableUpsells = useMemo(() => {
    const cartIds = new Set(cart.map((c) => c.id));
    return BUMP_PRODUCTS.filter((b) => !cartIds.has(b.id));
  }, [cart]);

  // Meta Pixel InitiateCheckout Event (fires every time checkout is opened with cart items)
  const initiateCheckoutTracked = useRef(false);
  useEffect(() => {
    if (orderComplete || isCodSwitchMode) return;
    if (cart.length > 0 && grandTotal > 0 && !initiateCheckoutTracked.current) {
      initiateCheckoutTracked.current = true;
      const productIds = cart.map((it) => it.id).filter(Boolean);
      trackInitiateCheckout({
        value: grandTotal,
        currency: "INR",
        num_items: cart.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1,
        content_ids: productIds.length > 0 ? productIds : ["zupe_product"],
      });
    }
  }, [cart, grandTotal, orderComplete, isCodSwitchMode]);

  // Meta Pixel Purchase Event (Fallback on Order Confirmed View, deduped per orderId via sessionStorage)
  useEffect(() => {
    if (orderComplete && confirmedOrderId && (confirmedTotal > 0 || grandTotal > 0)) {
      const orderValue = confirmedTotal > 0 ? confirmedTotal : grandTotal;
      const itemsList = confirmedItems.length > 0 ? confirmedItems : cart;
      const productIds = itemsList.map((it) => it.id || it.product_id).filter(Boolean);
      trackPurchase({
        orderId: confirmedOrderId,
        value: orderValue,
        currency: "INR",
        num_items: itemsList.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1,
        content_ids: productIds.length > 0 ? productIds : ["zupe_product"],
      });
    }
  }, [orderComplete, confirmedOrderId, confirmedTotal, grandTotal, confirmedItems]);

  // Auto-track Abandoned Checkout when Phone is 10 digits
  useEffect(() => {
    if (orderComplete || isCodSwitchMode) return;
    const clean = cleanPhoneDigits(phone);
    if (clean.length !== 10) return;

    try {
      localStorage.setItem("zupe_checkout_phone", clean);
      if (name.trim()) localStorage.setItem("zupe_checkout_name", name.trim());
    } catch (e) {}

    if (cart.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      fetch("/api/checkout/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim() || undefined,
          customer_phone: clean,
          customer_email: email.trim() || undefined,
          shipping_address: address.trim() || undefined,
          city: cleanCityName(city, state) || undefined,
          postal_code: postalCode.trim() || undefined,
          total_amount: grandTotal,
          source: "checkout",
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

    return () => clearTimeout(timer);
  }, [phone, name, email, address, city, state, postalCode, cart, grandTotal, orderComplete, isCodSwitchMode]);

  // Checkout Page Back-Out Capture (Detects tab-switch, back-button, navigation, or page close)
  useEffect(() => {
    if (orderComplete || isCodSwitchMode) return;

    const captureBackOut = () => {
      const clean = cleanPhoneDigits(phone);
      if (clean.length !== 10 || cart.length === 0 || orderComplete || loading) return;

      const payload = JSON.stringify({
        customer_name: name.trim() || undefined,
        customer_phone: clean,
        customer_email: email.trim() || undefined,
        shipping_address: address.trim() || undefined,
        city: cleanCityName(city, state) || undefined,
        postal_code: postalCode.trim() || undefined,
        total_amount: grandTotal,
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          poster_image: c.poster_image,
        })),
        is_backout: true,
        source: "checkout",
      });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/checkout/abandoned", blob);
      } else {
        fetch("/api/checkout/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        captureBackOut();
      }
    };

    window.addEventListener("beforeunload", captureBackOut);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", captureBackOut);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (!orderComplete) {
        captureBackOut();
      }
    };
  }, [phone, name, email, address, city, state, postalCode, cart, grandTotal, orderComplete, isCodSwitchMode]);

  const syncAddressAfterOrder = async () => {
    try {
      const targetEmail = (email.trim() || user?.email || "").toLowerCase().trim();
      if (targetEmail && address.trim()) {
        const userEmailNorm = targetEmail;
        const cacheKey = `zp_user_addresses_${userEmailNorm}`;
        const lastUsedKey = `zp_last_used_address_id_${userEmailNorm}`;

        const targetNormKey = normalizeAddressKey(address, postalCode);
        const existingMatch = savedAddresses.find(
          (a: any) =>
            a.id === selectedAddressId ||
            normalizeAddressKey(a.street, a.postal_code || a.postalCode) === targetNormKey
        );

        const now = new Date().toISOString();
        let targetAddr: any;

        if (existingMatch && !isUsingNewAddress) {
          targetAddr = {
            ...existingMatch,
            recipient_name: name.trim() || existingMatch.recipient_name,
            phone: phone.trim() || existingMatch.phone,
            last_used_at: now,
          };
        } else {
          targetAddr = {
            id: existingMatch ? existingMatch.id : `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            user_email: userEmailNorm,
            user_id: user?.id,
            recipient_name: name.trim(),
            phone: phone.trim(),
            street: address.trim(),
            city: city.trim(),
            state: state.trim(),
            postal_code: postalCode.trim(),
            country: "India",
            is_default: savedAddresses.length === 0,
            tag: "Home",
            created_at: now,
            last_used_at: now,
          };
        }

        const otherAddresses = savedAddresses.filter((a: any) => a.id !== targetAddr.id);
        const updated = deduplicateAddresses([targetAddr, ...otherAddresses]);
        setSavedAddresses(updated);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(updated));
          localStorage.setItem(lastUsedKey, targetAddr.id);
        } catch (e) {}

        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetAddr),
        });
      }
      if (user && phone.trim() && (!user?.phone || user.phone !== phone.trim())) {
        await updateUserProfile({ phone: phone.trim() });
      }
    } catch (e) {
      console.warn("Failed to sync address on frontend:", e);
    }
  };

  const handleContinueToPayment = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      const el = document.getElementById("phone-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      const el = document.getElementById("name-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (email.trim() && !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      const el = document.getElementById("email-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Please enter your complete delivery address.");
      const el = document.getElementById("address-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    const cleanPin = postalCode.replace(/\D/g, "");
    if (!cleanPin || cleanPin.length < 6) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      const el = document.getElementById("pincode-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!city.trim()) {
      setErrorMessage("Please enter your city.");
      const el = document.getElementById("city-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!state.trim()) {
      setErrorMessage("Please enter your state.");
      const el = document.getElementById("state-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrorMessage("");
    setCheckoutStep("payment");

    setTimeout(() => {
      const el = document.getElementById("payment-method-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const executePaymentFlow = async () => {
    setErrorMessage("");
    setLoading(true);

    // Pre-flight live stock check
    const freshOos = await checkCartStock();
    if (freshOos.length > 0 || hasOutOfStockItems) {
      setLoading(false);
      setErrorMessage("One or more items in your cart are currently out of stock. Please remove them to proceed.");
      return;
    }

    // Online Payment via Razorpay (Prepaid Full Amount or COD Handling Fee)
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setLoading(false);
        setErrorMessage("Could not initialize secure payment gateway. Please check your connection and retry.");
        return;
      }

      const isCod = paymentMethod === "cod";
      const amountToCharge = payableNow;

      const createOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountToCharge,
          items: cart.map((c) => ({
            product_id: c.id,
            name: c.name,
            price: (c.bundle_tier && c.bundle_tier > 1 && c.bundle_total)
              ? Math.round(c.bundle_total / c.quantity)
              : c.price,
            unit_price: (c.bundle_tier && c.bundle_tier > 1 && c.bundle_total)
              ? Math.round(c.bundle_total / c.quantity)
              : c.price,
            quantity: c.quantity,
            original_price: c.original_price || c.price,
            bundle_tier: c.bundle_tier,
            bundle_savings: c.bundle_savings,
            bundle_total: c.bundle_total,
            offer_label: c.offer_label,
          })),
          notes: {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            shipping_address: `${address}, ${city}, ${postalCode}`,
            payment_type: isCod ? "cod_partial" : "prepaid",
          },
        }),
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success || !orderData.orderId) {
        setLoading(false);
        setErrorMessage(orderData.error || "Failed to initialize payment. Please try again.");
        return;
      }

      const methodLabel = isCod ? "Cash on Delivery" : "Prepaid (Online)";

      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zupe Store",
        description: isCod
          ? `COD Handling Fee (₹${codFee}) - Zupe Store`
          : `Payment for Order (${cart.length} item${cart.length === 1 ? "" : "s"})`,
        image: "/zupe-logo.webp",
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
          method: "upi",
        },
        notes: {
          shipping_address: `${address.trim()}, ${city.trim()} - ${postalCode.trim()}`,
        },
        theme: {
          color: "#FF7A00",
          backdrop_color: "rgba(17, 17, 17, 0.7)",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setErrorMessage(
              isCod
                ? `Payment was cancelled. Pay ₹${codFee} COD fee to place your Cash on Delivery order.`
                : "Payment was cancelled. You can retry whenever you are ready."
            );
          },
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_payload: {
                  customer_name: name.trim(),
                  customer_email: email.trim(),
                  customer_phone: phone.trim().startsWith("+91") ? phone.trim() : `+91 ${phone.trim()}`,
                  shipping_address: address.trim(),
                  city: state ? `${city.trim()}, ${state.trim()}` : city.trim(),
                  postal_code: postalCode.trim(),
                  total_amount: grandTotal,
                  discount_amount: totalDiscount,
                  promo_code: appliedPromo || undefined,
                  promo_discount: promoDiscount || undefined,
                  payment_method: methodLabel,
                  is_cod_partial: isCod,
                  advance_amount: isCod ? codFee : grandTotal,
                  balance_amount: isCod ? doorstepBalance : 0,
                  shipping_fee: shippingFee,
                  user_id: user?.id,
                  items: cart.map((c) => ({
                    product_id: c.id,
                    name: c.name,
                    price: (c.bundle_tier && c.bundle_tier > 1 && c.bundle_total)
                      ? Math.round(c.bundle_total / c.quantity)
                      : c.price,
                    unit_price: (c.bundle_tier && c.bundle_tier > 1 && c.bundle_total)
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
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.order) {
              const placedOrder = verifyData.order;
              const finalOrderId = String(placedOrder.id || `ord_${Date.now()}`);
              const finalAmount = Number(placedOrder.total_amount) || grandTotal;
              const currentCartItems = [...cart];
              const productIds = currentCartItems.map((c) => String(c.id)).filter(Boolean);
              const totalItemsCount = currentCartItems.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;

              // 1. Immediately track Meta Pixel Purchase event with final order amount (both COD & Prepaid)
              trackPurchase({
                orderId: finalOrderId,
                value: finalAmount,
                currency: "INR",
                num_items: totalItemsCount,
                content_ids: productIds.length > 0 ? productIds : ["zupe_product"],
              });

              // 2. Persist order confirmation snapshot in sessionStorage for refresh resilience
              try {
                sessionStorage.setItem(
                  "zupe_order_confirmed_snapshot",
                  JSON.stringify({
                    orderId: finalOrderId,
                    totalAmount: finalAmount,
                    items: currentCartItems,
                    paymentMethod: isCod ? "cod" : "prepaid",
                    paymentId: response.razorpay_payment_id,
                    shippingFee: shippingFee,
                    customerName: name.trim(),
                    customerPhone: phone.trim(),
                    customerEmail: email.trim(),
                    address: address.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    postalCode: postalCode.trim(),
                    doorstepBalance: isCod ? doorstepBalance : 0,
                    timestamp: Date.now(),
                  })
                );
              } catch {}

              syncAddressAfterOrder();
              setConfirmedTotal(finalAmount);
              setConfirmedOrderId(finalOrderId);
              setConfirmedPaymentId(response.razorpay_payment_id);
              setConfirmedItems(currentCartItems);
              setOrderComplete(true);
              clearCart();
              if (isCod) {
                try {
                  localStorage.setItem("zupe_last_cod_order_id", finalOrderId);
                  localStorage.setItem("zupe_last_cod_phone", phone.trim());
                } catch {}
              }
            } else {
              setErrorMessage(
                verifyData.error || "Payment received, but verification encountered an error. Please contact support."
              );
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            setErrorMessage("Network error while verifying payment. Contact support if amount was deducted.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        setErrorMessage(
          response?.error?.description || "Payment failed. Please check your account or try a different payment method."
        );
      });
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "An unexpected error occurred while launching payment.");
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(clean);
    if (otpError) setOtpError(null);
    if (clean.length === 6) {
      handleVerifyOtpAndProceed(clean);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp || otpLoading) return;
    setOtpError(null);
    setOtpLoading(true);
    const cleanP = cleanPhoneDigits(phone);
    const res = await sendPhoneOtp(cleanP);
    setOtpLoading(false);
    if (res.success) {
      setOtpTimer(30);
      setCanResendOtp(false);
      setOtpCode("");
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } else {
      setOtpError(res.error || "Could not resend code. Please try again.");
    }
  };

  const handleVerifyOtpAndProceed = async (code: string) => {
    if (code.length !== 6) return;
    setOtpError(null);
    setOtpLoading(true);
    const cleanP = cleanPhoneDigits(phone);
    try {
      const res = await loginWithPhoneOtp(cleanP, code, name.trim());
      if (!res.success) {
        setOtpLoading(false);
        setOtpError(res.error || "Invalid verification code. Please check and retry.");
        return;
      }
      setIsPhoneVerified(true);
      setOtpLoading(false);
      setIsOtpVerifiedSuccess(true);
      setTimeout(() => {
        setShowOtpModal(false);
        setIsOtpVerifiedSuccess(false);
        executePaymentFlow();
      }, 450);
    } catch (err: any) {
      setOtpLoading(false);
      setOtpError(err.message || "Verification failed. Please retry.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanP = cleanPhoneDigits(phone);
    if (!cleanP || cleanP.length !== 10 || !/^[6-9]\d{9}$/.test(cleanP)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (email.trim() && !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Please enter your complete delivery address.");
      return;
    }
    if (!postalCode.trim() || postalCode.replace(/\D/g, "").length < 6) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }
    if (!state.trim()) {
      setErrorMessage("Please enter your state.");
      return;
    }

    setErrorMessage("");

    // If phone is already verified in this session or user account, proceed directly to payment flow
    if (isPhoneVerified || (user?.phone && cleanPhoneDigits(user.phone) === cleanP)) {
      executePaymentFlow();
      return;
    }

    // Otherwise, dispatch WhatsApp OTP and trigger OTP Popup Modal
    setLoading(true);
    setOtpLoading(true);
    setOtpError(null);
    setOtpCode("");
    setIsOtpVerifiedSuccess(false);

    const otpRes = await sendPhoneOtp(cleanP);
    setLoading(false);
    setOtpLoading(false);

    if (otpRes.success) {
      setShowOtpModal(true);
      setTimeout(() => otpInputRef.current?.focus(), 250);
    } else {
      setErrorMessage(otpRes.error || "Failed to dispatch verification code. Please check your phone number.");
    }
  };

  // ========================================================
  // COD TO PREPAID SWITCH VIEW (TRIGGERED FROM WHATSAPP / TRACKING)
  // ========================================================
  if (isCodSwitchMode) {
    if (switchSuccess) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
          <header className="py-4 border-b border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
              <Link href="/" className="inline-block">
                <Image
                  src="/zupe-logo.webp"
                  alt="Zupe Store"
                  width={120}
                  height={38}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
          </header>

          <main className="max-w-lg mx-auto py-12 px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/15"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-2 border border-emerald-200">
              Switched to Prepaid &amp; Saved ₹49
            </span>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your order is now <strong>Prepaid &amp; Confirmed</strong>. You saved ₹49 and your package has been moved to <strong>Priority Express Dispatch</strong>.
            </p>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs mb-8 text-left space-y-3 text-xs text-gray-600">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{switchSuccessOrderId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Prepaid (Paid Online)
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Prepaid Discount:</span>
                <span className="font-bold text-emerald-600">-₹49 Applied</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">COD Handling Charge:</span>
                <span className="font-bold text-[#FF7A00]">Free (Saved ₹49)</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-bold text-gray-900">Total Paid:</span>
                <span className="font-extrabold text-[#FF7A00] text-lg">₹{switchSuccessAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/order-tracking?query=${encodeURIComponent(switchSuccessOrderId)}`}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#FF7A00] text-white font-semibold text-sm hover:bg-[#E66E00] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/orders"
                className="flex-1 py-3.5 px-6 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                View My Orders
              </Link>
            </div>
          </main>

          <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
            © 2026 Zupe Store
          </footer>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <header className="py-4 border-b border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="inline-block">
              <Image
                src="/zupe-logo.webp"
                alt="Zupe Store"
                width={120}
                height={38}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Secure Checkout</span>
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto py-8 px-4 w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-[#FF7A00] to-amber-500 rounded-3xl p-6 text-white text-center shadow-lg shadow-[#FF7A00]/20 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white text-[#FF7A00] uppercase tracking-wide mb-3 shadow-xs">
              Instant ₹49 Discount Offer
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Switch to Prepaid &amp; Save ₹49!
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-2 max-w-md mx-auto leading-relaxed">
              Pay online now via UPI, Google Pay, PhonePe, Cards, or Net Banking. Waive cash charges and get priority express dispatch.
            </p>
          </div>

          {switchError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{switchError}</p>
                <p className="text-xs text-rose-600 mt-0.5">Please check your Order ID or phone number below.</p>
              </div>
            </div>
          )}

          {switchLoading && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
              <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Looking up your order details...</p>
            </div>
          )}

          {!switchLoading && switchOrder ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6">
              {/* Order Info */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Order Reference</span>
                  <span className="font-mono font-bold text-base text-gray-900">
                    {switchOrder.display_id || switchOrder.id}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Current: Cash on Delivery
                </span>
              </div>

              {/* Customer summary */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span className="font-semibold text-gray-900">{switchOrder.customer_name}</span>
                </div>
                {switchOrder.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-mono text-gray-900">{switchOrder.customer_phone}</span>
                  </div>
                )}
                {switchOrder.shipping_address && (
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-gray-400">Delivery To:</span>
                    <span className="text-right max-w-[240px] text-gray-800">{switchOrder.shipping_address}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown with COD Handling Fee Discount */}
              {(() => {
                const codTotal = Number(switchOrder.total_amount) || 0;
                const advancePaid = Number((switchOrder as any).advance_paid) || (codTotal < 500 ? 19 : 49);
                const doorstepDue = (switchOrder as any).doorstep_balance !== undefined
                  ? Number((switchOrder as any).doorstep_balance)
                  : ((switchOrder as any).balance_due !== undefined ? Number((switchOrder as any).balance_due) : Math.max(0, codTotal - advancePaid));
                const switchDiscount = advancePaid;
                const finalPayable = (switchOrder as any).discounted_amount !== undefined
                  ? Number((switchOrder as any).discounted_amount)
                  : Math.max(1, doorstepDue - switchDiscount);

                return (
                  <>
                    <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>COD Total Order Value:</span>
                        <span className="font-semibold text-gray-800">₹{codTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>COD Fee Paid Online:</span>
                        <span className="font-bold">₹{advancePaid} (Paid)</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Doorstep Balance Due (COD):</span>
                        <span className="line-through text-gray-400 font-semibold">₹{doorstepDue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Prepaid Switch Discount (Save ₹{switchDiscount}):</span>
                        </span>
                        <span>-₹{switchDiscount}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-base sm:text-lg">
                        <span className="font-bold text-gray-900">Final Amount to Pay Online:</span>
                        <div className="text-right">
                          <span className="font-extrabold text-[#FF7A00] text-xl">
                            ₹{finalPayable.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-bold">You Save ₹{switchDiscount} • ₹0 at Delivery (Free Shipping)</span>
                        </div>
                      </div>
                    </div>

                    {/* Pay Now Button */}
                    <button
                      type="button"
                      onClick={handlePayForCodOrder}
                      disabled={switchPaying}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-[#FF7A00] to-orange-600 hover:from-[#e06900] hover:to-[#d06000] text-white font-extrabold text-base shadow-lg shadow-[#FF7A00]/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-4"
                    >
                      {switchPaying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Launching Secure Payment...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Pay ₹{finalPayable.toLocaleString()} Online Now →</span>
                        </>
                      )}
                    </button>
                  </>
                );
              })()}

              {/* Security info */}
              <div className="pt-2 text-center text-[11px] text-gray-400 space-y-1">
                <p>256-bit Bank Grade SSL Encrypted • Powered by Razorpay</p>
                <p>Supports UPI (GPay, PhonePe, Paytm), All Major Debit &amp; Credit Cards, Net Banking</p>
              </div>

              {/* Option to look up another order */}
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSwitchOrder(null);
                    setSwitchQuery("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Switch a different order
                </button>
              </div>
            </div>
          ) : !switchLoading ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-5">
              <div className="text-center">
                <ShoppingBag className="w-10 h-10 text-[#FF7A00] mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 text-base">Find Your Cash on Delivery Order</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Order ID (e.g. ord_...) or 10-digit mobile number to claim your ₹49 instant discount.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  lookupCodOrder(switchQuery);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Order ID or Mobile Number
                  </label>
                  <input
                    type="text"
                    value={switchQuery}
                    onChange={(e) => setSwitchQuery(e.target.value)}
                    placeholder="e.g. ord_177374... or 9876543210"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={switchLoading || !switchQuery.trim()}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm transition-all shadow-md shadow-[#FF7A00]/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Order &amp; Claim ₹49 Discount</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <Link href="/" className="text-xs text-gray-500 hover:text-gray-800">
                  ← Back to Store
                </Link>
              </div>
            </div>
          ) : null}
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Zupe Store
        </footer>
      </div>
    );
  }

  // Order Confirmed View
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        {/* Simple Brand Header */}
        <header className="py-4 border-b border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
            <Link href="/" className="inline-block">
              <Image
                src="/zupe-logo.webp"
                alt="Zupe Store"
                width={120}
                height={38}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto py-12 px-4 text-center">
          {/* Visual Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${
              paymentMethod === "cod"
                ? "bg-orange-50 text-[#FF7A00] shadow-[#FF7A00]/15"
                : "bg-emerald-50 text-emerald-600 shadow-emerald-500/15"
            }`}
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>

          {/* Status Badge */}
          {paymentMethod === "cod" ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 mb-2 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Cash on Delivery • ₹{shippingFee || codFee} COD Fee Paid • Awaiting WhatsApp Confirmation
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 mb-2 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Payment Received • Awaiting WhatsApp Confirmation
            </span>
          )}

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {paymentMethod === "cod"
              ? `Order Registered, ${name || "Shopper"}!`
              : `Payment Successful, ${name || "Shopper"}!`}
          </h1>

          <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-md mx-auto">
            {paymentMethod === "cod"
              ? `We have received your ₹${shippingFee || codFee} COD handling fee. Please check your WhatsApp and tap "Confirm Order" to finalize packing and dispatch.`
              : `Your online payment has been verified! We've sent an interactive confirmation message to your WhatsApp (+91 ${(phone || "").replace(/^\+91\s*/, "")}). Please tap "Confirm Order" on WhatsApp to finalize packing & priority dispatch.`}
            {email.trim() && (
              <span className="block mt-2 font-medium text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200/70 text-xs">
                <Mail className="w-3.5 h-3.5 text-emerald-600 inline mr-1" /> Order receipt &amp; live tracking link sent to <strong>{email.trim()}</strong>
              </span>
            )}
          </p>

          {/* Action Prompt Box for WhatsApp */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-left flex items-start gap-3 shadow-xs max-w-md mx-auto">
            <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-900 text-sm">Action Required: Confirm on WhatsApp</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Check WhatsApp on <strong>+91 {(phone || "").replace(/^\+91\s*/, "")}</strong> and click <strong>&quot;Confirm Order&quot;</strong>. Once confirmed, you will instantly receive your official order confirmation and live shipment tracking link.
              </p>
            </div>
          </div>

          {/* Order Summary Details Card */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs mb-8 text-left space-y-3 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{confirmedOrderId}</span>
            </div>
            {email.trim() && (
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Order Updates Email:</span>
                <span className="font-semibold text-emerald-700">{email.trim()}</span>
              </div>
            )}
            {confirmedPaymentId && (
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-emerald-600 text-xs">{confirmedPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-semibold text-gray-900">
                {paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Online via UPI/Cards)"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">5 - 7 Business Days</span>
            </div>
            <div className="flex justify-between items-start py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[240px]">
                {address}, {city} - {postalCode}
              </span>
            </div>
            {paymentMethod === "cod" ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">COD Handling Fee:</span>
                  <span className="font-semibold text-[#FF7A00]">
                    ₹{shippingFee || codFee} (Paid Online)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Total Order Amount:</span>
                  <span className="font-semibold text-gray-900">₹{(confirmedTotal || grandTotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm">
                  <span className="font-bold text-gray-900">Pay at Delivery:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-[#FF7A00] text-lg block">
                      ₹{doorstepBalance.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold block text-amber-600">
                      ₹{shippingFee || codFee} paid · Pay ₹{doorstepBalance.toLocaleString()} at delivery
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-bold text-gray-900">Total Paid Online:</span>
                <div className="text-right">
                  <span className="font-extrabold text-[#FF7A00] text-lg block">
                    ₹{(confirmedTotal || grandTotal).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold block text-emerald-600">
                    Paid Online
                  </span>
                </div>
              </div>
            )}
          </div>

          {paymentMethod === "cod" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-left mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF7A00] tracking-wider block">
                  Special Prepaid Switch Offer
                </span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  Switch to Prepaid &amp; Save ₹{shippingFee || codFee}!
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pay only ₹{Math.max(1, doorstepBalance - (shippingFee || codFee)).toLocaleString()} online now instead of ₹{doorstepBalance.toLocaleString()} at delivery.
                </p>
              </div>
              <Link
                href={`/checkout?method=prepaid&switch=cod&orderId=${encodeURIComponent(confirmedOrderId)}`}
                className="px-4 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs shrink-0 text-center transition-colors shadow-xs"
              >
                Pay ₹{Math.max(1, doorstepBalance - (shippingFee || codFee)).toLocaleString()} Now (Save ₹{shippingFee || codFee}) →
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/order-tracking?query=${encodeURIComponent(confirmedOrderId)}`}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#FF7A00] text-white font-semibold text-sm hover:bg-[#E66E00] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/"
              className="flex-1 py-3.5 px-6 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Zupe Store
        </footer>
      </div>
    );
  }

  // Cart Restoring from WhatsApp Link State
  if (isRestoringCart && cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <header className="py-4 border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
            <Link href="/" className="inline-block">
              <Image
                src="/zupe-logo.webp"
                alt="Zupe Store"
                width={120}
                height={38}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center text-[#FF7A00] animate-pulse">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-gray-900 mb-2">Restoring Your Cart...</h2>
          <p className="text-sm text-gray-500 mb-6">Retrieving your saved order from WhatsApp in 1 click.</p>
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-orange-100/60 text-[#FF7A00] text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading your items...</span>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Zupe Store
        </footer>
      </div>
    );
  }

  // Cart Empty State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <header className="py-4 border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
            <Link href="/" className="inline-block">
              <Image
                src="/zupe-logo.webp"
                alt="Zupe Store"
                width={120}
                height={38}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center text-[#FF7A00]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Your Bag is Empty</h2>
          <p className="text-sm text-gray-500 mb-6">You don&apos;t have any products ready for checkout yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-semibold text-sm shadow-xs transition-colors"
          >
            Browse Trending Products
          </Link>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Zupe Store
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-900 antialiased pb-28">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/zupe-logo.webp"
              alt="Zupe Store"
              width={100}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Secure checkout</span>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Store</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN CONTENT (SINGLE CLEAN COLUMN - MATCHING IMAGE 2 / QUICKBUY) */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {recoveredBanner && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-emerald-950 truncate">{recoveredBanner}</p>
                <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                  Your cart items and saved delivery info are restored.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRecoveredBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          {/* CARD 1: ORDER SUMMARY CARD + PROMO CODE */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
            {/* Items list */}
            <div className="divide-y divide-gray-100">
              {cart.map((item) => {
                const itemTotal = (item.bundle_tier && item.bundle_tier > 1 && item.bundle_total)
                  ? item.bundle_total
                  : item.price * item.quantity;
                const itemBaseUnit = item.original_price || item.price;
                const itemRegularTotal = itemBaseUnit * item.quantity;
                const isBundle = Boolean(item.bundle_tier && item.bundle_tier > 1);
                const displayImage = item.poster_image || (item as any).image || (item as any).images?.[0] || "/placeholder.png";

                return (
                  <div key={item.id} className="p-3.5 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                      <Image
                        src={displayImage}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {item.offer_label || (isBundle ? `Pack of ${item.quantity}` : `Qty ${item.quantity}`)} · Free delivery
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-sm font-black text-gray-950">
                        ₹{itemTotal.toLocaleString()}
                      </span>
                      {itemRegularTotal > itemTotal && (
                        <span className="block text-xs text-gray-400 line-through">
                          ₹{itemRegularTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Savings highlight bar */}
            {totalSavings > 0 && (
              <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold border-t border-emerald-100">
                <span>You save</span>
                <span>₹{totalSavings.toLocaleString()}</span>
              </div>
            )}

            {/* Interactive Promo Code Input */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyPromo();
                    }
                  }}
                  placeholder="PROMO CODE"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#FF7A00]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                </button>
              </div>

              {promoError && (
                <p className="text-[11px] text-rose-600 font-semibold">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-[11px] text-emerald-700 font-semibold">{promoSuccess}</p>
              )}

              {appliedPromo && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                  <Tag className="w-3 h-3 text-emerald-700" />
                  <span>{appliedPromo} applied: −₹{promoDiscount}</span>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="w-4 h-4 rounded-full bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center ml-1 cursor-pointer"
                    aria-label="Remove coupon"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: DELIVERY DETAILS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF7A00]" />
                <span>Delivery details</span>
              </span>
            </div>

            {/* GPS Location button */}
            <button
              type="button"
              onClick={handleFetchCurrentLocation}
              disabled={locationLoading}
              className="w-full py-2.5 px-3 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/60 text-[#FF7A00] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Detecting GPS location...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Use my current location</span>
                </>
              )}
            </button>

            {locationSuccessMsg && (
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                {locationSuccessMsg}
              </p>
            )}
            {locationError && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{locationError}</span>
              </p>
            )}

            {/* Saved Addresses Selector (if logged in and has addresses) */}
            {savedAddresses.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-gray-600 tracking-wide uppercase">
                  Saved Addresses
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id && !isUsingNewAddress;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setIsUsingNewAddress(false);
                          setName(addr.name || name);
                          setPhone(cleanPhoneDigits(addr.phone || phone));
                          setAddress(addr.street || "");
                          setPostalCode(addr.postal_code || addr.postalCode || "");
                          setCity(addr.city || "");
                          setState(addr.state || "");
                          setLandmark(addr.landmark || "");
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs shrink-0 max-w-[200px] transition cursor-pointer ${
                          isSelected
                            ? "border-[#FF7A00] bg-orange-50/40 text-gray-900 font-bold"
                            : "border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-bold truncate">{addr.name || "Address"}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{addr.street}</p>
                        <p className="text-[10px] text-gray-400">{addr.city} {addr.postal_code || addr.postalCode}</p>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUsingNewAddress(true);
                      setSelectedAddressId(null);
                      setAddress("");
                      setPostalCode("");
                      setCity("");
                      setState("");
                      setLandmark("");
                    }}
                    className={`p-2.5 rounded-xl border text-xs shrink-0 font-bold transition flex items-center justify-center cursor-pointer ${
                      isUsingNewAddress
                        ? "border-[#FF7A00] bg-orange-50/40 text-[#FF7A00]"
                        : "border-dashed border-gray-300 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    + New Address
                  </button>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name-input"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold transition focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                Mobile number <span className="text-rose-500">*</span>
              </label>
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-[#FF7A00] focus-within:ring-2 focus-within:ring-orange-500/15">
                <span className="px-3.5 py-3 bg-gray-50 border-r border-gray-200 text-sm font-bold text-gray-700 select-none">
                  +91
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) => setPhone(cleanPhoneDigits(e.target.value))}
                  placeholder="10-digit mobile number"
                  className="flex-1 px-3.5 py-3 text-sm font-semibold tracking-wider focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-500 pt-0.5">
                We will send a code on WhatsApp to confirm your order.
              </p>
            </div>

            {/* House No, Street, Area */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                House No, Street, Area <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Apartment, Street, Area"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold transition focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15 resize-none"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                {pincodeLoading && (
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#FF7A00]" /> Checking...
                  </span>
                )}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                value={postalCode}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPostalCode(clean);
                }}
                placeholder="e.g. 682001"
                className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold tracking-wider transition focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15"
              />
              {pincodeMessage && (
                <p
                  className={`text-xs font-semibold pt-0.5 ${
                    pincodeValid ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {pincodeMessage}
                </p>
              )}
            </div>

            {/* Auto-filled City & State */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-gray-500 tracking-wide uppercase">
                  City
                </label>
                <input
                  type="text"
                  readOnly
                  value={city}
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 cursor-not-allowed select-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-gray-500 tracking-wide uppercase">
                  State
                </label>
                <input
                  type="text"
                  readOnly
                  value={state}
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Landmark (Optional) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                Landmark <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near bus stand, Opposite bank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold transition focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                Email address <span className="text-gray-400 font-normal lowercase">(optional, for invoice)</span>
              </label>
              <input
                id="email-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold transition focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          {/* CARD 3: CHOOSE HOW TO PAY */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-700">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#FF7A00]" />
                <span>Choose how to pay</span>
              </span>
            </div>

            {/* Option 1: Pay Online */}
            <div
              onClick={() => setPaymentMethod("prepaid")}
              className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === "prepaid"
                  ? "border-[#FF7A00] bg-orange-50/25 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-[9.5px] tracking-wide shadow-xs">
                RECOMMENDED
              </span>

              <span
                className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wide shadow-xs animate-tiny-glow"
                style={{ animation: "tinyGlowBadge 2.4s infinite ease-in-out" }}
              >
                SAVE ₹{codFee}
              </span>

              <div className="flex items-start gap-3 mt-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                    paymentMethod === "prepaid"
                      ? "border-[#FF7A00] bg-[#FF7A00]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {paymentMethod === "prepaid" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      Pay Online
                    </h4>
                    <span className="text-sm font-black text-gray-950">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    UPI · Cards · Net banking
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-extrabold text-gray-700">
                      UPI
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-extrabold text-[#5f259f]">
                      PhonePe
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-extrabold text-[#4285F4]">
                      GPay
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-extrabold text-[#1A1F71]">
                      Cards
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-2 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% secure · Powered by Razorpay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === "cod"
                  ? "border-gray-800 bg-gray-50/50 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                    paymentMethod === "cod"
                      ? "border-gray-800 bg-gray-800"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      Cash on Delivery
                    </h4>
                    <span className="text-sm font-black text-gray-950">
                      ₹{(grandTotal + codFee).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Product price + ₹{codFee} COD handling fee
                  </p>

                  {/* COD Breakdown row */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center text-xs">
                    <div className="p-2 rounded-lg bg-gray-100/80 border border-gray-200">
                      <span className="block text-[10px] text-gray-500 font-semibold">Pay at delivery</span>
                      <strong className="block text-xs font-black text-gray-900">₹{doorstepBalance.toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                      <span className="block text-[10px] text-amber-800 font-semibold">Pay now online</span>
                      <strong className="block text-xs font-black text-amber-950">₹{codFee}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-900 text-white border border-gray-900">
                      <span className="block text-[10px] text-gray-300 font-semibold">Total</span>
                      <strong className="block text-xs font-black">₹{(doorstepBalance + codFee).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nudge card when COD is active */}
            {paymentMethod === "cod" && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white space-y-2 animate-in fade-in duration-200 shadow-md shadow-emerald-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    SMART CHOICE
                  </span>
                  <span
                    className="text-[11px] font-black bg-amber-300 text-emerald-950 px-2.5 py-0.5 rounded-full animate-tiny-glow-yellow"
                    style={{ animation: "tinyGlowYellowBadge 2.4s infinite ease-in-out" }}
                  >
                    SAVE ₹{codFee}
                  </span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Pay <strong>₹{grandTotal.toLocaleString()}</strong> online instead of <span className="line-through text-white/60">₹{(grandTotal + codFee).toLocaleString()}</span>. Faster dispatch, no cash needed at delivery.
                </p>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("prepaid")}
                  className="w-full py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-gray-100 transition cursor-pointer"
                >
                  Switch to Pay Online · Save ₹{codFee}
                </button>
              </div>
            )}
          </div>

          {/* CARD 4: PRICE DETAILS SUMMARY */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPriceDetailsOpen((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-gray-900 cursor-pointer select-none"
            >
              <span>Price Details ({totalItemCount} item{totalItemCount > 1 ? "s" : ""})</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-950">₹{payableNow.toLocaleString()}</span>
                {isPriceDetailsOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </button>

            {isPriceDetailsOpen && (
              <div className="px-4 pb-3.5 pt-1 space-y-2 text-xs border-t border-gray-200/60 text-gray-600">
                <div className="flex justify-between">
                  <span>Item MRP</span>
                  <span className="line-through text-gray-400">₹{totalMrp.toLocaleString()}</span>
                </div>
                {bundleSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Bundle Savings</span>
                    <span>−₹{bundleSavings.toLocaleString()}</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon ({appliedPromo})</span>
                    <span>−₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between">
                    <span>COD Handling Fee</span>
                    <span className="font-bold text-gray-900">₹{codFee}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-gray-950">
                  <span>Total Amount</span>
                  <span>₹{payableNow.toLocaleString()}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-center text-[11.5px] mt-2">
                    You save ₹{totalSavings.toLocaleString()} on this order
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Store support notice */}
          <p className="text-center text-[11px] text-gray-400 pt-1">
            Zupe Store · Support +91 97441 22853 · 7-day replacement
          </p>
        </form>

        {/* STICKY BOTTOM FOOTER (Place Order CTA) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-xl">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600 pb-0.5">
              <div>
                <span className="text-base font-black text-gray-950">
                  ₹{payableNow.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 ml-1.5 font-medium">
                  {paymentMethod === "cod" ? `now · ₹${doorstepBalance.toLocaleString()} at delivery` : "total"}
                </span>
              </div>
              {totalSavings > 0 && (
                <span className="text-emerald-700 font-bold text-xs">
                  Save ₹{totalSavings.toLocaleString()}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading || otpLoading}
              className="w-full py-4 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black text-base shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to gateway...</span>
                </>
              ) : otpLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending WhatsApp code...</span>
                </>
              ) : paymentMethod === "cod" ? (
                <span className="flex items-center gap-1.5">
                  <span>Pay ₹{codFee} &amp; Place COD Order</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Pay ₹{payableNow.toLocaleString()} &amp; Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>Questions?</span>
              </span>{" "}
              <a
                href="https://wa.me/919744122853"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline"
              >
                WhatsApp us
              </a>
            </p>
          </div>
        </div>

{/* WhatsApp OTP Verification Modal Popup */}
        <AnimatePresence>
          {showOtpModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOtpModal(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
              />

              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100"
              >
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
                  aria-label="Close verification modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {!isOtpVerifiedSuccess ? (
                  <div className="space-y-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                      <Phone className="w-7 h-7 text-emerald-600" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Verify your mobile number</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        We sent a 6-digit verification code on WhatsApp to <br />
                        <strong className="text-gray-900">
                          +91 {cleanPhoneDigits(phone).slice(0, 5)} {cleanPhoneDigits(phone).slice(5)}
                        </strong>
                      </p>
                    </div>

                    <div className="relative flex justify-center gap-2 py-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const digit = otpCode[idx] || "";
                        const isActive = idx === otpCode.length && otpCode.length < 6;
                        const isFilled = Boolean(digit);
                        return (
                          <div
                            key={idx}
                            onClick={() => otpInputRef.current?.focus()}
                            className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all cursor-text ${
                              isActive
                                ? "border-[#FF7A00] ring-3 ring-orange-500/20 bg-white"
                                : isFilled
                                ? "border-gray-400 text-gray-900 bg-white"
                                : "border-gray-200 text-gray-300 bg-gray-50/50"
                            }`}
                          >
                            {digit}
                          </div>
                        );
                      })}
                      <input
                        ref={otpInputRef}
                        type="tel"
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={handleOtpChange}
                        className="absolute inset-0 opacity-0 cursor-default"
                      />
                    </div>

                    {otpError && (
                      <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2 rounded-xl">
                        {otpError}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtpModal(false);
                          setTimeout(() => {
                            const el = document.getElementById("phone-input");
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "center" });
                              el.focus();
                            }
                          }, 200);
                        }}
                        className="text-[#FF7A00] font-bold hover:underline cursor-pointer"
                      >
                        Change number
                      </button>

                      <div>
                        {canResendOtp ? (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={otpLoading}
                            className="font-bold text-emerald-600 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            Resend code
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium">
                            Resend in {otpTimer}s
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setOtpLoading(true);
                        const cleanP = cleanPhoneDigits(phone);
                        await sendPhoneOtp(cleanP);
                        setOtpLoading(false);
                        setOtpTimer(30);
                        setCanResendOtp(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition cursor-pointer"
                    >
                      Get code by SMS
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 py-4 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Number verified</h3>
                    <p className="text-xs text-gray-500">
                      Opening Razorpay to pay ₹{payableNow.toLocaleString()}...
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100 bg-white mt-12">
        © 2026 Zupe Store
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-500">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
