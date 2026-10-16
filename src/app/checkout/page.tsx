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
  Phone,
  Plus,
  Trash2,
  Star,
  Tag,
  Check,
  ShoppingBag,
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
  const [phone, setPhone] = useState(user?.phone || "");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDetected, setPincodeDetected] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  // Mobile Order Summary Accordion
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

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
    if (methodParam === "upi") setPaymentMethod("upi");
    else if (methodParam === "card") setPaymentMethod("card");
    else if (methodParam === "netbanking" || methodParam === "bank") setPaymentMethod("netbanking");
    else if (methodParam === "cod") setPaymentMethod("cod");
  }, [searchParams]);

  // Populate user data if logged in
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user, name, email, phone]);

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
            if (defaultAddr.recipient_name) setName(defaultAddr.recipient_name);
            if (defaultAddr.phone) setPhone(defaultAddr.phone);
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
            if (defaultAddr.recipient_name) setName(defaultAddr.recipient_name);
            if (defaultAddr.phone) setPhone(defaultAddr.phone);
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
    if (addr.recipient_name) setName(addr.recipient_name);
    if (addr.phone) setPhone(addr.phone);
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

  // Promo Code Application
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const clean = promoCode.trim().toUpperCase();
    if (!clean) {
      setPromoError("Please enter a promo code.");
      return;
    }
    if (clean === "ZUPE10" || clean === "WELCOME10" || clean === "SWIVO10") {
      const discount = Math.round(subtotal * 0.1);
      setPromoDiscount(discount);
      setPromoApplied(true);
    } else if (clean === "SAVE50" || clean === "SPECIAL50") {
      const discount = Math.min(50, subtotal);
      setPromoDiscount(discount);
      setPromoApplied(true);
    } else {
      setPromoError("Invalid promo code. Try ZUPE10 for 10% off!");
    }
  };

  // Shipping calculation (Free over threshold or included)
  const shippingFee = 0; // Reference store offers Free Shipping: "Free - Arrives in 3-6 days"
  const totalItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  // Total calculations
  const totalDiscount = savings + promoDiscount;
  const grandTotal = Math.max(0, subtotal - promoDiscount + shippingFee);

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

  const syncAddressAfterOrder = async () => {
    try {
      if (email.trim() && address.trim()) {
        const userEmailNorm = email.toLowerCase().trim();
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
    if (!email.trim() || !email.includes("@")) {
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

    // Process Cash on Delivery
    if (paymentMethod === "cod") {
      try {
        const orderPayload = {
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          shipping_address: address.trim(),
          city: state ? `${city.trim()}, ${state.trim()}` : city.trim(),
          postal_code: postalCode.trim(),
          total_amount: grandTotal,
          discount_amount: totalDiscount,
          payment_method: "Cash on Delivery",
          user_id: user?.id,
          items: cart.map((c) => ({
            product_id: c.id,
            name: c.name,
            price: c.price,
            quantity: c.quantity,
            image: c.poster_image,
          })),
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success && data.order) {
          syncAddressAfterOrder();
          setConfirmedTotal(grandTotal);
          setConfirmedOrderId(data.order.id);
          setConfirmedPaymentId("");
          setOrderComplete(true);
          clearCart();
        } else {
          setErrorMessage(data.error || "Failed to process order. Please try again.");
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMessage("Network error occurred while submitting your order.");
      }
      return;
    }

    // Online Payment via Razorpay (UPI, Cards, Net Banking)
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setLoading(false);
        setErrorMessage("Could not initialize secure payment gateway. Please check your connection and retry.");
        return;
      }

      const createOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
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
            payment_type: paymentMethod,
          },
        }),
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success || !orderData.orderId) {
        setLoading(false);
        setErrorMessage(orderData.error || "Failed to initialize payment. Please try again.");
        return;
      }

      const methodLabel =
        paymentMethod === "upi"
          ? "UPI"
          : paymentMethod === "netbanking"
          ? "Net Banking"
          : "Credit / Debit Card";

      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zupe Store",
        description: `Payment for Order (${cart.length} item${cart.length === 1 ? "" : "s"})`,
        image: "/zupe-logo.webp",
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
          method: paymentMethod === "netbanking" ? "netbanking" : paymentMethod === "card" ? "card" : "upi",
        },
        notes: {
          shipping_address: `${address.trim()}, ${city.trim()} - ${postalCode.trim()}`,
        },
        theme: {
          color: "#00875A", // Matching the clean green theme
          backdrop_color: "rgba(17, 17, 17, 0.7)",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setErrorMessage("Payment was cancelled. You can retry whenever you are ready.");
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
                  customer_phone: phone.trim(),
                  shipping_address: address.trim(),
                  city: state ? `${city.trim()}, ${state.trim()}` : city.trim(),
                  postal_code: postalCode.trim(),
                  total_amount: grandTotal,
                  discount_amount: totalDiscount,
                  payment_method: methodLabel,
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#EAF8F2] flex items-center justify-center text-[#00875A] shadow-lg shadow-[#00875A]/15"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF8F2] text-[#00875A] mb-2 border border-[#BFE8D6]">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Thank you, {name || "Shopper"}!
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Your order has been confirmed and we are preparing it for shipment. We&apos;ll send live tracking updates to <strong>+91 {phone}</strong>.
          </p>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs mb-8 text-left space-y-3 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{confirmedOrderId}</span>
            </div>
            {confirmedPaymentId && (
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-emerald-600 text-xs">{confirmedPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-semibold text-gray-900">
                {paymentMethod === "upi"
                  ? "UPI Instant"
                  : paymentMethod === "netbanking"
                  ? "Net Banking"
                  : paymentMethod === "card"
                  ? "Credit / Debit Card"
                  : "Cash on Delivery"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">3 - 6 Business Days</span>
            </div>
            <div className="flex justify-between items-start py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[240px]">
                {address}, {city} - {postalCode}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 text-sm">
              <span className="font-bold text-gray-900">Total Paid:</span>
              <span className="font-extrabold text-[#00875A] text-lg">₹{(confirmedTotal || grandTotal).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/order-tracking?query=${encodeURIComponent(confirmedOrderId)}`}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#00875A] text-white font-semibold text-sm hover:bg-[#00704A] transition-colors flex items-center justify-center gap-2 shadow-xs"
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center text-[#00875A]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Your Bag is Empty</h2>
          <p className="text-sm text-gray-500 mb-6">You don&apos;t have any products ready for checkout yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-semibold text-sm shadow-xs transition-colors"
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
      {/* 1. TOP TRUST HEADER (Matches Reference Exactly) */}
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

          {/* Social Proof & Trust Badges */}
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex items-center gap-2">
              {/* Overlapping customer avatars */}
              <div className="flex -space-x-1.5 items-center">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-2xs relative">
                  <Image src="/avatars/arjun.jpg" alt="Customer" fill className="object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-2xs relative">
                  <Image src="/avatars/sneha.jpg" alt="Customer" fill className="object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center justify-center border border-white shadow-2xs">
                  5L+
                </div>
              </div>

              {/* 5 Stars */}
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <span className="font-extrabold text-xs sm:text-sm text-gray-900 tracking-tight">
                Loved by Over 5 Lakh Happy Customers
              </span>
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-gray-500 font-medium mt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-600" /> Premium Quality
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-gray-600" /> Fast Shipping
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-gray-600" /> Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MOBILE COLLAPSIBLE ORDER SUMMARY ACCORDION (Matches Reference Mobile View) */}
      <div className="lg:hidden border-b border-gray-200 bg-[#F4F4F5]">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full py-3.5 px-4 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <span>Order summary</span>
            {isMobileSummaryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalMrp > grandTotal && (
              <span className="text-xs text-gray-400 line-through">
                ₹{totalMrp.toLocaleString()}
              </span>
            )}
            <span className="font-bold text-base text-gray-900">
              ₹{grandTotal.toLocaleString()}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {isMobileSummaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-200 px-4 py-4 space-y-4 bg-white"
            >
              {/* Product List */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const itemMrp = item.mrp || item.original_price || Math.round(item.price * 1.35);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 shrink-0">
                        <Image
                          src={item.poster_image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-gray-900 truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                          {itemMrp > item.price && (
                            <span className="line-through text-gray-400">
                              ₹{itemMrp.toLocaleString()}
                            </span>
                          )}
                          <span>₹{item.price.toLocaleString()} × {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Promo code input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </form>
              {promoApplied && (
                <p className="text-[11px] text-[#00875A] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Promo code applied! Saved ₹{promoDiscount.toLocaleString()}
                </p>
              )}
              {promoError && <p className="text-[11px] text-red-500">{promoError}</p>}

              <hr className="border-gray-100" />

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal · {totalItemCount} {totalItemCount === 1 ? "item" : "items"}</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (GST)</span>
                  <span className="text-gray-500">Included</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div>
                    <span>Shipping</span>
                    <p className="text-[10px] text-gray-400">Arrives in 3-6 days</p>
                  </div>
                  <span className="font-bold text-[#00875A]">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                  <span className="font-bold text-sm text-gray-900">Total</span>
                  <div className="flex items-baseline gap-2">
                    {totalMrp > grandTotal && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{totalMrp.toLocaleString()}
                      </span>
                    )}
                    <span className="font-extrabold text-lg text-gray-900">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* You're paying less pill */}
              {totalMrpSavings > 0 && (
                <div className="py-2 px-3 rounded-lg bg-[#EAF8F2] border border-[#BFE8D6] text-[#00875A] font-bold text-[11px] flex items-center justify-center gap-1.5 uppercase tracking-wide">
                  <Tag className="w-3.5 h-3.5" />
                  <span>YOU&apos;RE PAYING ₹{totalMrpSavings.toLocaleString()} LESS THAN MRP</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. MAIN CHECKOUT GRID */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: URGENCY BANNER + STEP 1 + STEP 2 */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Urgency Countdown Banner (Matches Reference) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EAF8F2] border border-[#BFE8D6] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D1F2E2] text-[#00875A] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-gray-800 leading-snug">
                <span className="font-bold text-gray-900">Special limited-time discount applied!</span>{" "}
                Don&apos;t miss out:{" "}
                <span className="font-mono font-extrabold text-[#00875A] text-sm sm:text-base">
                  {formatTimer(timeLeft)}
                </span>
              </p>
            </div>

            {/* STEP 1: CONTACT DETAILS */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
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
                <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all bg-white">
                  <div className="px-3.5 bg-gray-50 border-r border-gray-200 text-gray-700 font-semibold text-xs flex items-center select-none">
                    IN +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>

                {/* Helper info card */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500 leading-relaxed">
                  Please enter your mobile number to continue. We&apos;ll send order confirmation and delivery updates over WhatsApp / SMS.
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* STEP 2: DELIVERY DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900">
                    Delivery Details
                  </h2>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-xs font-bold text-[#00875A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isUsingNewAddress ? "Entering New Address" : "Use New Address"}</span>
                  </button>
                )}
              </div>

              {/* Saved Delivery Addresses Selection Cards if user has previous addresses */}
              {savedAddresses.length > 0 && !isUsingNewAddress && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00875A]" />
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
                              ? "border-[#00875A] bg-emerald-50/40 ring-1 ring-[#00875A]"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
                />
              </div>

              {/* WhatsApp & Email Marketing Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 leading-snug select-none">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#00875A] focus:ring-[#00875A] w-4 h-4 cursor-pointer"
                />
                <span>
                  Keep me in the loop — shipping updates on WhatsApp and the occasional deal by email. You can opt out anytime.
                </span>
              </label>

              {/* Complete Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Complete Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Street, Landmark"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white resize-none"
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00875A]" />
                    )}
                    {pincodeDetected && (
                      <span className="text-[10px] text-[#00875A] font-bold flex items-center gap-0.5">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="pt-2 space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Select Payment Method *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* UPI */}
                  <div
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "upi"
                        ? "border-[#00875A] bg-[#EAF8F2]/60 ring-1 ring-[#00875A]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00875A] flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">UPI Instant</p>
                        <p className="text-[10px] text-gray-500">GPay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Fastest
                    </span>
                  </div>

                  {/* Cards */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "card"
                        ? "border-[#00875A] bg-[#EAF8F2]/60 ring-1 ring-[#00875A]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Credit / Debit Card</p>
                        <p className="text-[10px] text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "netbanking"
                        ? "border-[#00875A] bg-[#EAF8F2]/60 ring-1 ring-[#00875A]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Net Banking</p>
                        <p className="text-[10px] text-gray-500">All Major Indian Banks</p>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "cod"
                        ? "border-[#00875A] bg-[#EAF8F2]/60 ring-1 ring-[#00875A]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Cash on Delivery</p>
                        <p className="text-[10px] text-gray-500">Pay cash/UPI at doorstep</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON (Matches Reference Big Green Button) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || hasOutOfStockItems}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loading || hasOutOfStockItems
                      ? "bg-gray-400 cursor-not-allowed opacity-80"
                      : "bg-[#00875A] hover:bg-[#00704A] active:scale-[0.99]"
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
                      <span>Place Order with Cash on Delivery (₹{grandTotal.toLocaleString()})</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Subtext */}
              <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                <span>256-Bit Bank Grade SSL Encrypted · 100% Purchase Protection</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DESKTOP ORDER SUMMARY (Matches Reference Layout) */}
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
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
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

                      <span className="font-bold text-sm text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-100" />

              {/* Subtotal, Taxes, Shipping */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (GST)</span>
                  <span className="text-gray-500">Included</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div>
                    <span>Shipping</span>
                    <p className="text-[10px] text-gray-400">Arrives in 3-6 days</p>
                  </div>
                  <span className="font-bold text-[#00875A]">Free</span>
                </div>
              </div>

              {/* Promo Code Input Box */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {promoApplied && (
                <p className="text-[11px] text-[#00875A] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Promo code applied! Saved ₹{promoDiscount.toLocaleString()}
                </p>
              )}
              {promoError && <p className="text-[11px] text-red-500">{promoError}</p>}

              {/* Savings Highlight Pill (Matches Reference) */}
              {totalMrpSavings > 0 && (
                <div className="py-2.5 px-3 rounded-xl bg-[#EAF8F2] border border-[#BFE8D6] text-[#00875A] font-bold text-xs flex items-center justify-center gap-1.5 uppercase tracking-wide">
                  <Tag className="w-3.5 h-3.5" />
                  <span>YOU&apos;RE PAYING ₹{totalMrpSavings.toLocaleString()} LESS THAN MRP</span>
                </div>
              )}

              {/* Grand Total Row */}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                <span className="font-bold text-base text-gray-900">Total to pay</span>
                <span className="font-display font-extrabold text-2xl text-gray-900">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              {/* YOU MIGHT ALSO LIKE (Bump Offers) */}
              {availableUpsells.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#00875A]" />
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
                          className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
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
            <div className="w-8 h-8 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-500">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
