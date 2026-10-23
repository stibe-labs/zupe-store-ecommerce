"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { deduplicateAddresses, normalizeAddressKey } from "@/lib/addressUtils";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

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
  } = useCart();
  const { user, isLoading: authLoading, updateUserProfile } = useAuth();

  // Contact & Delivery state
  const [phone, setPhone] = useState(() => cleanPhoneDigits(user?.phone || ""));
  const [name, setName] = useState(() => (user?.name && !user.name.startsWith("Customer ") ? user.name : ""));
  // Customer must type their real email address manually
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDetected, setPincodeDetected] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Payment method state ("prepaid" or "cod")
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("prepaid");


  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>("");
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [recoveredBanner, setRecoveredBanner] = useState<string | null>(null);

  // Urgency Timer (13:59 countdown)
  const [timeLeft, setTimeLeft] = useState(14 * 60 - 1); // 13:59

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
          if (chk.city) setCity(chk.city);
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
            `🎉 Welcome back${chk.customer_name ? `, ${chk.customer_name.split(" ")[0]}` : ""}! Your cart and shipping details have been restored.`
          );
        }
      } catch (err) {
        console.warn("Failed to restore abandoned checkout:", err);
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
        description: `Order ${switchOrder.display_id || switchOrder.id} - Switch to Prepaid (Save ₹30)`,
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

    const cacheKey = `zp_user_addresses_${user.email.toLowerCase().trim()}`;
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
          setSavedAddresses(deduplicated);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(deduplicated));
          } catch (e) {}

          const defaultAddr = deduplicated.find((a: any) => a.is_default) || deduplicated[0];
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

  // Auto-detect city & state when pincode is 6 digits
  useEffect(() => {
    const cleanPin = postalCode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
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

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please enter your address manually.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          if (res.ok && data.success) {
            setIsUsingNewAddress(true);
            setSelectedAddressId(null);

            if (data.street) {
              setAddress(data.street);
            } else if (data.formatted_address) {
              setAddress(data.formatted_address);
            }

            if (data.city) setCity(data.city);
            if (data.state) setState(data.state);

            if (data.pincode && data.pincode.length === 6) {
              setPostalCode(data.pincode);
              setPincodeDetected(true);
            }

            const locationLabel = [data.street || data.city, data.city, data.pincode]
              .filter(Boolean)
              .slice(0, 2)
              .join(", ");

            setLocationSuccessMsg(`Location detected: ${locationLabel || "Address filled"}`);
            setTimeout(() => setLocationSuccessMsg(null), 6000);
          } else {
            setLocationError(data.error || "Unable to determine address from current GPS coordinates.");
          }
        } catch (err: any) {
          setLocationError("Network error while looking up location details.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow location access in your browser or enter your address manually.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("GPS location signal unavailable. Please enter your address manually.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to fetch current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
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
  // Cash on Delivery has ₹49 Shipping Charge and ₹19 Advance Payment collected online (remaining balance at doorstep).
  const isCod = paymentMethod === "cod";
  const shippingFee = isCod ? 49 : 0;
  const codAdvance = isCod ? 19 : 0;
  const totalItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  // Total calculations
  const totalDiscount = savings;
  const grandTotal = subtotal + shippingFee;
  const payableNow = isCod ? 19 : subtotal;
  const doorstepBalance = isCod ? Math.max(0, grandTotal - 19) : 0;

  // Total MRP for comparison pill
  const totalMrp = cart.reduce((sum, it) => {
    const itemMrp = it.mrp || it.original_price || Math.round(it.price * 1.35);
    return sum + itemMrp * it.quantity;
  }, 0);
  const totalMrpSavings = Math.max(0, totalMrp - grandTotal);

  // Upsell bump offer candidates (excluding what is already in cart)
  const availableUpsells = useMemo(() => {
    const cartIds = new Set(cart.map((c) => c.id));
    return BUMP_PRODUCTS.filter((b) => !cartIds.has(b.id));
  }, [cart]);

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
      // If customer removed all items from cart, clear their abandoned session
      fetch("/api/checkout/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_phone: clean,
          action: "clear_empty",
        }),
      }).catch(() => {});
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
          city: state ? `${city.trim()}, ${state.trim()}` : city.trim() || undefined,
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
      if (clean.length !== 10 || cart.length === 0 || orderComplete) return;

      const payload = JSON.stringify({
        customer_name: name.trim() || undefined,
        customer_phone: clean,
        customer_email: email.trim() || undefined,
        shipping_address: address.trim() || undefined,
        city: state ? `${city.trim()}, ${state.trim()}` : city.trim() || undefined,
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

        const targetNormKey = normalizeAddressKey(address, postalCode);
        const existingMatch = savedAddresses.find(
          (a: any) =>
            a.id === selectedAddressId ||
            normalizeAddressKey(a.street, a.postal_code || a.postalCode) === targetNormKey
        );

        if (existingMatch && !isUsingNewAddress) {
          return;
        }

        const newAddr = {
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
          created_at: new Date().toISOString(),
        };

        const otherAddresses = savedAddresses.filter((a: any) => a.id !== newAddr.id);
        const updated = deduplicateAddresses([newAddr, ...otherAddresses]);
        setSavedAddresses(updated);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        } catch (e) {}

        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddr),
        });
      }
      if (user && phone.trim() && (!user?.phone || user.phone !== phone.trim())) {
        await updateUserProfile({ phone: phone.trim() });
      }
    } catch (e) {
      console.warn("Failed to sync address on frontend:", e);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
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
    setLoading(true);

    // Pre-flight live stock check
    const freshOos = await checkCartStock();
    if (freshOos.length > 0 || hasOutOfStockItems) {
      setLoading(false);
      setErrorMessage("One or more items in your cart are currently out of stock. Please remove them to proceed.");
      return;
    }

    // Online Payment via Razorpay (Prepaid Full Amount or COD ₹19 Partial Advance)
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setLoading(false);
        setErrorMessage("Could not initialize secure payment gateway. Please check your connection and retry.");
        return;
      }

      const isCod = paymentMethod === "cod";
      const amountToCharge = isCod ? 19 : grandTotal;

      const createOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountToCharge,
          items: cart.map((c) => ({
            product_id: c.id,
            name: c.name,
            price: c.price,
            quantity: c.quantity,
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

      const methodLabel = isCod ? "Cash on Delivery (Partial Payment)" : "Prepaid (Online)";

      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zupe Store",
        description: isCod
          ? `COD Order Confirmation Advance (₹19) - Zupe Store`
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
                ? "Payment was cancelled. Pay ₹19 advance to confirm your Cash on Delivery order."
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
                  payment_method: methodLabel,
                  is_cod_partial: isCod,
                  advance_amount: isCod ? 19 : grandTotal,
                  balance_amount: isCod ? doorstepBalance : 0,
                  shipping_fee: shippingFee,
                  user_id: user?.id,
                  items: cart.map((c) => ({
                    product_id: c.id,
                    name: c.name,
                    price: c.price,
                    quantity: c.quantity,
                    image: c.poster_image,
                  })),
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.order) {
              syncAddressAfterOrder();
              setConfirmedTotal(grandTotal);
              setConfirmedOrderId(verifyData.order.id);
              setConfirmedPaymentId(response.razorpay_payment_id);
              setOrderComplete(true);
              clearCart();
              if (isCod) {
                try {
                  localStorage.setItem("zupe_last_cod_order_id", verifyData.order.id);
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
              ✓ Switched to Prepaid &amp; Saved ₹30
            </span>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your order is now <strong>Prepaid &amp; Confirmed</strong>. You saved ₹30 and your package has been moved to <strong>Priority Express Dispatch</strong>.
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
                <span className="font-bold text-emerald-600">-₹30 Applied</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Shipping:</span>
                <span className="font-bold text-[#FF7A00]">FREE (Saved ₹49)</span>
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
              ⚡ Instant ₹30 Discount Offer
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Switch to Prepaid &amp; Save ₹30!
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

              {/* Price Breakdown with Rs 30 discount */}
              {(() => {
                const codTotal = Number(switchOrder.total_amount) || 0;
                const doorstepDue = (switchOrder as any).doorstep_balance !== undefined
                  ? Number((switchOrder as any).doorstep_balance)
                  : Math.max(0, codTotal - 19);
                const finalPayable = (switchOrder as any).discounted_amount !== undefined
                  ? Number((switchOrder as any).discounted_amount)
                  : Math.max(1, doorstepDue - 30);

                return (
                  <>
                    <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>COD Total Order Value:</span>
                        <span className="font-semibold text-gray-800">₹{codTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Advance Paid Online:</span>
                        <span className="font-bold">₹19 (Paid)</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Doorstep Balance Due (COD):</span>
                        <span className="line-through text-gray-400 font-semibold">₹{doorstepDue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Prepaid Switch Discount:</span>
                        </span>
                        <span>-₹30</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-base sm:text-lg">
                        <span className="font-bold text-gray-900">Final Amount to Pay Online:</span>
                        <div className="text-right">
                          <span className="font-extrabold text-[#FF7A00] text-xl">
                            ₹{finalPayable.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-bold">You Save ₹30 • ₹0 at Delivery</span>
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
                <p>🔒 256-bit Bank Grade SSL Encrypted • Powered by Razorpay</p>
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
                  Enter your Order ID (e.g. ord_...) or 10-digit mobile number to claim your ₹30 instant discount.
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
                  <span>Find Order &amp; Claim ₹30 Discount</span>
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
              Cash on Delivery • ₹19 Advance Received
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-2 border border-emerald-200">
              ✓ Payment Received &amp; Order Confirmed
            </span>
          )}

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {paymentMethod === "cod"
              ? `Order Confirmed, ${name || "Shopper"}!`
              : `Payment Successful, ${name || "Shopper"}!`}
          </h1>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md mx-auto">
            {paymentMethod === "cod"
              ? `Your Cash on Delivery order has been confirmed! We have received your ₹19 confirmation advance. Please pay the remaining balance of ₹${Math.max(0, (confirmedTotal || grandTotal) - 19).toLocaleString()} in cash or UPI when your parcel is delivered.`
              : `Your online payment has been verified and your order is in Priority Express Dispatch. Live updates sent to +91 ${(phone || "").replace(/^\+91\s*/, "")}.`}
            {email.trim() && (
              <span className="block mt-2 font-medium text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200/70 text-xs">
                📧 Order receipt &amp; live tracking link sent to <strong>{email.trim()}</strong>
              </span>
            )}
          </p>

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
                {paymentMethod === "cod" ? "Cash on Delivery (Partial Payment)" : "Prepaid (Online via UPI/Cards)"}
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
                  <span className="text-gray-500">Shipping Charge:</span>
                  <span className="font-semibold text-gray-900">₹49</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Total Order Amount:</span>
                  <span className="font-semibold text-gray-900">₹{(confirmedTotal || grandTotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Advance Paid Online:</span>
                  <span className="font-bold text-emerald-600">₹19 (Paid)</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm">
                  <span className="font-bold text-gray-900">Balance on Delivery:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-[#FF7A00] text-lg block">
                      ₹{Math.max(0, (confirmedTotal || grandTotal) - 19).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold block text-amber-600">
                      Pay in cash or UPI to courier
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
                    ✓ Paid Online
                  </span>
                </div>
              </div>
            )}
          </div>

          {paymentMethod === "cod" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-left mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF7A00] tracking-wider block">
                  ⚡ Special Prepaid Switch Offer
                </span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  Switch to Prepaid &amp; Save ₹30!
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pay only ₹{Math.max(1, (confirmedTotal || grandTotal) - 49).toLocaleString()} online now instead of ₹{Math.max(0, (confirmedTotal || grandTotal) - 19).toLocaleString()} at delivery.
                </p>
              </div>
              <Link
                href={`/checkout?method=prepaid&switch=cod&orderId=${encodeURIComponent(confirmedOrderId)}`}
                className="px-4 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs shrink-0 text-center transition-colors shadow-xs"
              >
                Pay ₹{Math.max(1, (confirmedTotal || grandTotal) - 49).toLocaleString()} Now (Save ₹30) →
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
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* 1. TOP TRUST HEADER (Clean Zupe Store Branding) */}
      <header className="border-b border-gray-100 bg-white py-3 sm:py-3.5">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/zupe-logo.webp"
              alt="Zupe Store"
              width={120}
              height={38}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Genuine Trust Badges */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs text-gray-600 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF7A00]" /> Premium Quality
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#FF7A00]" /> Fast Shipping
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#FF7A00]" /> 100% Secure Checkout
            </span>
          </div>
        </div>
      </header>



      {/* 3. MAIN CHECKOUT GRID */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {recoveredBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">{recoveredBanner}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Your cart items and saved delivery information are ready. Complete your order below.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRecoveredBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: URGENCY BANNER + STEP 1 + STEP 2 */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Urgency Countdown Banner (Zupe Orange Theme) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFEDD5] text-[#FF7A00] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-gray-800 leading-snug">
                <span className="font-bold text-gray-900">Special limited-time discount applied!</span>{" "}
                Don&apos;t miss out:{" "}
                <span className="font-mono font-extrabold text-[#FF7A00] text-sm sm:text-base">
                  {formatTimer(timeLeft)}
                </span>
              </p>
            </div>

            {/* STEP 1: CONTACT DETAILS */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900">
                  Contact Details
                </h2>
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1.5 pl-8.5 -mt-1">
                <Lock className="w-3 h-3 text-gray-400" />
                <span>Secure checkout · Track orders anytime</span>
              </p>

              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Mobile Number *
                </label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] transition-all bg-white">
                  <div className="px-3.5 bg-gray-50 border-r border-gray-200 text-gray-700 font-semibold text-xs flex items-center select-none">
                    IN +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(cleanPhoneDigits(e.target.value))}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>

                {/* Helper info card */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500 leading-relaxed">
                  Please enter your mobile number to continue. We&apos;ll send order confirmation and delivery updates over WhatsApp and Email.
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* STEP 2: DELIVERY DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900">
                    Delivery Details
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Auto-Fetch Current Location Button */}
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#FF7A00] bg-orange-50 hover:bg-orange-100 border border-[#FF7A00]/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    title="Auto-fetch address using GPS current location"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF7A00]" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-3.5 h-3.5 text-[#FF7A00]" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isUsingNewAddress ? "Entering New Address" : "Use New Address"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Location Status Feedback Banner */}
              {locationSuccessMsg && (
                <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{locationSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationSuccessMsg(null)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {locationError && (
                <div className="flex items-center justify-between gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationError(null)}
                    className="text-xs text-rose-700 hover:text-rose-900 font-bold p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Saved Delivery Addresses Selection Cards if user has previous addresses */}
              {savedAddresses.length > 0 && !isUsingNewAddress && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
                    Saved Addresses ({savedAddresses.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-gray-900">{addr.recipient_name}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedAddress(e, addr.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2">
                            {addr.street}, {addr.city} - {addr.postal_code}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all bg-white"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all bg-white"
                />
              </div>

              {/* WhatsApp & Email Marketing Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 leading-snug select-none">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] w-4 h-4 cursor-pointer"
                />
                <span>
                  Keep me in the loop — shipping updates on WhatsApp and the occasional deal by email. You can opt out anytime.
                </span>
              </label>

              {/* Complete Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                    Complete Address *
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF7A00] hover:text-[#E66E00] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3 h-3" />
                    )}
                    <span>{locationLoading ? "Detecting GPS..." : "Auto-fill with GPS"}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Street, Landmark"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all bg-white resize-none"
                />
              </div>

              {/* 2-Column: Pincode (Auto-detects area) & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                      Pincode (Auto-detects area) *
                    </label>
                    {pincodeLoading && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF7A00]" />
                    )}
                    {pincodeDetected && (
                      <span className="text-[10px] text-[#FF7A00] font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Area found
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="400001"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all bg-white"
                  />
                </div>
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all bg-white"
                />
              </div>

              {/* Payment Method Selection (Matches Reference Design) */}
              <div className="pt-2 space-y-3.5">
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                      Select Payment Method
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Choose how you want to pay for your order
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-right text-gray-500">
                    <Lock className="w-4 h-4 text-gray-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 leading-tight">100% Secure Payments</p>
                      <p className="text-[10px] text-gray-400 leading-tight">Powered by Razorpay</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* CARD 1: Pay Online (Prepaid) */}
                  <div
                    onClick={() => setPaymentMethod("prepaid")}
                    className={`relative p-4 sm:p-5 pt-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "prepaid"
                        ? "border-[#FF7A00] bg-[#FFFBF8] shadow-sm ring-1 ring-[#FF7A00]/20"
                        : "border-gray-200 bg-white hover:border-[#FF7A00]/40"
                    }`}
                  >
                    {/* RECOMMENDED BADGE */}
                    <span className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      ★ RECOMMENDED
                    </span>

                    {/* Top Row: Radio + Icon + Title + Free Shipping Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Radio circle */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white transition-colors ${
                            paymentMethod === "prepaid" ? "border-[#FF7A00]" : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "prepaid" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
                          )}
                        </div>

                        {/* QR / Online Icon */}
                        <div className="w-10 h-10 rounded-xl bg-orange-100/60 border border-orange-200/50 flex items-center justify-center text-[#FF7A00] shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                            Pay Online (Prepaid)
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">UPI, Cards &amp; Net Banking</p>
                        </div>
                      </div>

                      {/* Free Shipping Badge */}
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 text-emerald-700 font-extrabold text-[11px] tracking-wide">
                          <Truck className="w-3.5 h-3.5" />
                          <span>FREE SHIPPING</span>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          Save ₹49 on this order
                        </p>
                      </div>
                    </div>

                    {/* Payment Logos Row */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3.5 mt-3.5 border-t border-gray-100">
                      {/* UPI */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-gray-200 shadow-2xs">
                        <span className="font-black italic text-xs tracking-tighter text-[#2E3192]">UPI</span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <path d="M14 4L7 12H13L10 20L17 12H11L14 4Z" fill="#097939" />
                        </svg>
                      </div>

                      {/* VISA */}
                      <span className="font-black italic text-xs tracking-wider text-[#1A1F71] font-sans px-2 py-0.5 rounded bg-white border border-gray-200 shadow-2xs">
                        VISA
                      </span>

                      {/* Mastercard */}
                      <div className="flex items-center px-2 py-1 rounded bg-white border border-gray-200 shadow-2xs">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] -ml-1.5 mix-blend-multiply opacity-90" />
                      </div>

                      {/* RuPay */}
                      <div className="flex items-center px-2 py-0.5 rounded bg-white border border-gray-200 shadow-2xs">
                        <span className="font-black text-xs tracking-tight text-[#002D62]">Ru</span>
                        <span className="font-black text-xs tracking-tight text-[#00A4E4]">Pay</span>
                        <span className="w-1 h-3 bg-gradient-to-b from-[#00A4E4] to-[#F15A24] -skew-x-12 ml-0.5" />
                      </div>

                      {/* Net Banking */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 px-2 py-0.5 rounded bg-white border border-gray-200 shadow-2xs">
                        <Building2 className="w-3.5 h-3.5 text-gray-600" />
                        <span>Net Banking</span>
                      </div>
                    </div>

                    {/* 3 Checkmark Points Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 mt-3 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">No COD fee</p>
                          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Save ₹49</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">Instant confirmation</p>
                          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Order is processed faster</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">100% secure</p>
                          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Razorpay secure payments</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Cash on Delivery (Partial Payment) */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`relative p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#FF7A00] bg-[#FFFBF8] shadow-sm ring-1 ring-[#FF7A00]/20"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Top Row: Radio + Icon + Title + ₹19 Handling Fee Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Radio circle */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white transition-colors ${
                            paymentMethod === "cod" ? "border-[#FF7A00]" : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "cod" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
                          )}
                        </div>

                        {/* Package / Delivery Icon */}
                        <div className="w-10 h-10 rounded-xl bg-orange-100/60 border border-orange-200/50 flex items-center justify-center text-[#FF7A00] shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                            Cash on Delivery (Partial Payment)
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Pay only ₹19 now, rest ₹{doorstepBalance.toLocaleString()} at delivery
                          </p>
                        </div>
                      </div>

                      {/* ₹19 Advance Badge */}
                      <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-center shrink-0 min-w-[70px]">
                        <p className="text-base sm:text-lg font-black text-amber-600 leading-none">₹19</p>
                        <p className="text-[10px] font-bold text-amber-700 leading-tight mt-0.5">Advance</p>
                      </div>
                    </div>

                    {/* Red / Rose Alert Box */}
                    <div className="rounded-xl bg-rose-50/70 border border-rose-100/90 p-3 flex items-start gap-2.5 mt-3">
                      <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          Pay only ₹19 to confirm your order
                        </p>
                        <p className="text-[11px] text-rose-700 leading-snug mt-0.5">
                          This small amount helps us confirm genuine orders and reduces fake orders. Shipping charge is ₹49. The remaining ₹{doorstepBalance.toLocaleString()} can be paid in cash or UPI when your order arrives at your doorstep.
                        </p>
                      </div>
                    </div>

                    {/* 4 Points Row with Orange Circle Icons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">Confirms your order</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">Open &amp; check product first</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                          ₹
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">Pay ₹{doorstepBalance.toLocaleString()} at delivery</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">Safe &amp; secure for you</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MOBILE ORDER SUMMARY (Placed right before Pay Button) */}
              <div className="block lg:hidden rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-xs mt-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Order Summary</h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your cart
                  </span>
                </div>

                {/* Cart Products List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                        <Image src={item.poster_image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Breakdown Rows */}
                <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Item Total</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      Shipping Charge <Truck className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                    {paymentMethod === "cod" ? (
                      <span className="font-semibold text-gray-900">+₹49</span>
                    ) : (
                      <span className="font-bold text-emerald-600">FREE</span>
                    )}
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>COD Advance (Pay Online)</span>
                    {paymentMethod === "cod" ? (
                      <span className="font-bold text-[#FF7A00]">₹19</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>

                {/* Total Payable Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {paymentMethod === "cod" ? "Total Payable (Advance)" : "Total Payable (Prepaid)"}
                    </p>
                    {paymentMethod === "cod" && (
                      <p className="text-[11px] text-amber-700 font-medium">
                        ₹{doorstepBalance.toLocaleString()} to pay in cash/UPI on delivery
                      </p>
                    )}
                  </div>
                  <span className="text-xl font-black text-gray-950">
                    ₹{payableNow.toLocaleString()}
                  </span>
                </div>

                {/* Savings Pill */}
                {paymentMethod === "prepaid" ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50/90 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      ₹
                    </div>
                    <span>You save ₹49 (Free Shipping) by paying online!</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50/90 text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      ₹
                    </div>
                    <span>Pay ₹19 advance now &amp; remaining ₹{doorstepBalance.toLocaleString()} at delivery!</span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTON (Matches Reference) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || hasOutOfStockItems}
                  className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loading || hasOutOfStockItems
                      ? "bg-gray-400 cursor-not-allowed opacity-80"
                      : "bg-[#FF7A00] hover:bg-[#E66E00] shadow-[#FF7A00]/25 active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Order...</span>
                    </div>
                  ) : hasOutOfStockItems ? (
                    <span>⚠️ Remove Out of Stock Items to Continue</span>
                  ) : paymentMethod === "cod" ? (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay ₹19 &amp; Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay Securely &amp; Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges below Pay Button (Matches Reference) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">256-Bit SSL Encrypted</p>
                    <p className="text-[10px] text-gray-400">Bank-grade Security</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Secure Payments by Razorpay</p>
                    <p className="text-[10px] text-gray-400">Trusted by 10,00,000+ businesses</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">100% Purchase Protection</p>
                    <p className="text-[10px] text-gray-400">Get help if anything goes wrong</p>
                  </div>
                </div>
              </div>

              {/* Policy Redirection Links & Copyright (Matches Reference) */}
              <div className="pt-4 border-t border-gray-100 mt-2 space-y-2 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-gray-500 font-medium">
                  <Link
                    href="/return"
                    target="_blank"
                    className="hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
                  >
                    Return &amp; Refund Policy
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/shipping-and-delivery"
                    target="_blank"
                    className="hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
                  >
                    Shipping &amp; Delivery
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/terms-and-conditions"
                    target="_blank"
                    className="hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
                  >
                    Terms &amp; Conditions
                  </Link>
                </div>
                <p className="text-xs text-gray-400">© 2026 Zupe Store</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DESKTOP ORDER SUMMARY */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-6 p-6 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-5">
              <h3 className="font-bold font-display text-lg text-gray-900">
                Order Summary
              </h3>

              {/* Cart Items List */}
              <div className="space-y-3.5">
                {cart.map((item) => {
                  const itemMrp = item.mrp || item.original_price || Math.round(item.price * 1.35);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 shrink-0">
                        <Image
                          src={item.poster_image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                        {/* Black circle quantity badge on top-right */}
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          {itemMrp > item.price && (
                            <span className="line-through text-gray-400">
                              ₹{itemMrp.toLocaleString()}
                            </span>
                          )}
                          <span>₹{item.price.toLocaleString()} × {item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-bold text-sm text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-100" />

              {/* Breakdown: Subtotal, Shipping, COD Fee */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    Shipping Charge <Truck className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  {paymentMethod === "cod" ? (
                    <span className="font-semibold text-gray-900">+₹49</span>
                  ) : (
                    <span className="font-bold text-emerald-600">FREE</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>COD Advance (Pay Online)</span>
                  {paymentMethod === "cod" ? (
                    <span className="font-bold text-[#FF7A00]">₹19</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>

              {/* Total Payable Box */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {paymentMethod === "cod" ? "Total Payable (Advance)" : "Total Payable (Prepaid)"}
                  </p>
                  {paymentMethod === "cod" && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      ₹{doorstepBalance.toLocaleString()} to pay in cash/UPI on delivery
                    </p>
                  )}
                </div>
                <span className="text-xl font-black text-gray-950">
                  ₹{payableNow.toLocaleString()}
                </span>
              </div>

              {/* Savings Pill */}
              {paymentMethod === "prepaid" ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/90 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    ₹
                  </div>
                  <span>You save ₹49 (Free Shipping) by paying online!</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50/90 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    ₹
                  </div>
                  <span>Pay ₹19 advance now &amp; remaining ₹{doorstepBalance.toLocaleString()} at delivery!</span>
                </div>
              )}

              {/* YOU MIGHT ALSO LIKE (Bump Offers) */}
              {availableUpsells.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>You Might Also Like</span>
                  </div>

                  <div className="space-y-2.5">
                    {availableUpsells.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between gap-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-12 h-12 rounded-lg bg-white border border-gray-200 shrink-0 overflow-hidden">
                            <Image
                              src={item.poster_image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] mt-0.5">
                              <span className="font-bold text-gray-900">₹{item.price}</span>
                              <span className="line-through text-gray-400 text-[10px]">
                                ₹{item.mrp}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(item, 1)}
                          className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:bg-[#FF7A00] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
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
