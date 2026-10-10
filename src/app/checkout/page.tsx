"use client";

import React, { useState, useEffect } from "react";
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
  ChevronRight,
  Loader2,
  PackageCheck,
  AlertCircle,
  Sparkles,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, subtotal, clearCart, freeShippingThreshold } = useCart();
  const { user, isLoading: authLoading, openAuthModal, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");

  // Saved Delivery Addresses from Profile
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>("");
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  // Handle URL pre-selected payment method (e.g. /checkout?method=upi from Buy Now with UPI)
  useEffect(() => {
    const methodParam = searchParams.get("method")?.toLowerCase();
    if (methodParam === "upi") setPaymentMethod("upi");
    else if (methodParam === "card") setPaymentMethod("card");
    else if (methodParam === "netbanking" || methodParam === "bank") setPaymentMethod("netbanking");
    else if (methodParam === "cod") setPaymentMethod("cod");
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal("login", "Sign in required: Please log in or create an account to proceed with checkout 🔒");
    }
  }, [authLoading, user]);


  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user, name, email, phone]);

  // Load Saved Addresses for the logged-in customer and pre-fill default
  useEffect(() => {
    if (!user?.email) return;

    const cacheKey = `zp_user_addresses_${user.email.toLowerCase().trim()}`;

    // 1. Instantly hydrate from localStorage for instantaneous 0ms display & fill
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed);
          const defaultAddr = parsed.find((a: any) => a.is_default) || parsed[0];
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

    // 2. Fetch from server to sync latest
    fetch(`/api/user/addresses?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id || "")}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data.addresses));
          } catch (e) {}
          // If address fields are empty, auto-select default address
          const defaultAddr = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
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
      })
      .catch((err) => console.warn("Failed to load saved addresses in checkout:", err));
  }, [user?.email, user?.id]);

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

  const syncAddressAfterOrder = async () => {
    try {
      if (email.trim() && address.trim()) {
        const newAddr = {
          id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_email: email.trim(),
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

        const cacheKey = `zp_user_addresses_${email.toLowerCase().trim()}`;
        const existing = savedAddresses.filter(
          (a: any) => a.street?.toLowerCase().trim() !== address.toLowerCase().trim()
        );
        const updated = [newAddr, ...existing];
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
    if (!name.trim() || !email.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage("Please complete all shipping address fields.");
      return;
    }
    if (phone.trim() && phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    // If Cash on Delivery is selected, process order directly
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

    // Online Payment via Razorpay (UPI, Credit/Debit Cards, Net Banking)
    try {
      // 1. Ensure payment gateway script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setLoading(false);
        setErrorMessage("Could not initialize secure payment gateway. Please check your connection and retry.");
        return;
      }

      // 2. Create payment order on server
      const createOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
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

      // 3. Configure Razorpay modal options
      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zupe Store",
        description: `Payment for Order (${cart.length} item${cart.length === 1 ? "" : "s"})`,
        image: "/zupe-logo.png",
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
          color: "#FF7A00",
          backdrop_color: "rgba(17, 17, 17, 0.7)",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setErrorMessage("Payment was not completed. You can try again whenever you are ready.");
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

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-lg mx-auto py-24 sm:py-32 px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-2">
            Payment Verified & Placed
          </span>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Thank you for shopping with Zupe Store! Your order has been placed successfully and is being prepared for shipment.
          </p>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm mb-8 text-left space-y-3 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{confirmedOrderId}</span>
            </div>
            {confirmedPaymentId && (
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-emerald-600 text-xs">{confirmedPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
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
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between items-start py-1 border-b border-gray-100">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[220px]">
                {address}, {city} - {postalCode}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 text-sm">
              <span className="font-bold text-gray-900">Total Paid:</span>
              <span className="font-extrabold text-[#FF7A00] text-base">₹{(confirmedTotal || grandTotal).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/order-tracking?query=${encodeURIComponent(confirmedOrderId)}`}
              className="flex-1 py-3 px-6 rounded-xl bg-[#FF7A00] text-white font-semibold text-sm hover:bg-[#E66E00] transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#FF7A00]/25"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/orders"
              className="flex-1 py-3 px-6 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-colors flex items-center justify-center"
            >
              View Order History
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00] mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display text-gray-900 mb-2">
            Loading checkout...
          </h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-orange-100 flex items-center justify-center text-[#FF7A00] shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
            Sign In Required
          </span>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Sign In to Complete Your Order
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Please sign in to your Zupe Store account to securely enter your delivery address and complete checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openAuthModal("login", "Sign in required: Please log in or register to complete your order 🔒")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm shadow-md shadow-[#FF7A00]/25 transition-all cursor-pointer"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              <span>View Cart</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7A00]">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">No Items in Cart</h2>
          <p className="text-sm text-gray-500 mb-6">Your shopping cart is empty. Add products to continue to checkout.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FF7A00] text-white font-semibold text-sm shadow-md"
          >
            Browse Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#2D3436]">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="pt-24 sm:pt-28 pb-6 border-b border-gray-100 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-[#636E72] mb-2">
            <Link href="/" className="hover:text-[#FF7A00] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-[#FF7A00] transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#FF7A00] font-semibold">Secure Checkout</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#111111]">
              Secure Checkout
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Shipping Details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="font-display font-bold text-lg text-gray-900">
                    Shipping Details
                  </h2>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-xs font-bold text-[#FF7A00] hover:text-[#E66E00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isUsingNewAddress ? "Entering New Address" : "Use New Address"}</span>
                  </button>
                )}
              </div>

              {/* Saved Delivery Addresses Selection Cards */}
              {savedAddresses.length > 0 && (
                <div className="bg-gray-50/90 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
                      Saved Delivery Addresses ({savedAddresses.length})
                    </p>
                    <span className="text-[11px] text-gray-500 hidden sm:inline">
                      Click to auto-fill address
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id && !isUsingNewAddress;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all relative select-none ${
                            isSelected
                              ? "border-[#FF7A00] bg-orange-50/30 shadow-sm ring-2 ring-[#FF7A00]/25"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-gray-900">{addr.recipient_name}</span>
                              {addr.tag && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                                  {addr.tag}
                                </span>
                              )}
                              {addr.is_default && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF7A00]/10 text-[#FF7A00]">
                                  Default
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected ? "border-[#FF7A00] bg-[#FF7A00] text-white" : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>

                          {addr.phone && (
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{addr.phone}</span>
                            </p>
                          )}

                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {addr.street}, {addr.city} {addr.postal_code}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {selectedAddressId && !isUsingNewAddress && (
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Address selected & auto-filled below. You can customize fields before ordering if needed.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Postal Code / PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="6-digit PIN code"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address / House No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat / House No., Street, Landmark, Area"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-gray-900">
                      Payment Options
                    </h2>
                    <p className="text-xs text-gray-500">
                      Choose your preferred payment method (Online or Cash on Delivery)
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-[#FF7A00] bg-[#FF7A00]/5 ring-2 ring-[#FF7A00]/15 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <QrCode className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Fastest • Instant
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      UPI Instant
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      GPay, PhonePe, Paytm, BHIM, CRED & QR
                    </span>
                  </div>
                </button>

                {/* 2. Cards */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#FF7A00] bg-[#FF7A00]/5 ring-2 ring-[#FF7A00]/15 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      All Cards
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Credit & Debit Cards
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Visa, Mastercard, RuPay, Maestro & Amex
                    </span>
                  </div>
                </button>

                {/* 3. Net Banking */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "border-[#FF7A00] bg-[#FF7A00]/5 ring-2 ring-[#FF7A00]/15 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      50+ Banks
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Net Banking & Bank Transfer
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      SBI, HDFC, ICICI, Axis, Kotak & all major banks
                    </span>
                  </div>
                </button>

                {/* 4. Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-[#FF7A00] bg-[#FF7A00]/5 ring-2 ring-[#FF7A00]/15 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Truck className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Doorstep
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Cash on Delivery
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Pay with cash or UPI on delivery
                    </span>
                  </div>
                </button>
              </div>

              {/* Online Payment Explainer Banner */}
              {paymentMethod !== "cod" && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 border border-orange-200/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-gray-900 mb-0.5">
                      {paymentMethod === "upi"
                        ? "Instant UPI Payment"
                        : paymentMethod === "netbanking"
                        ? "Direct Net Banking"
                        : "Encrypted Card Payment"}
                    </p>
                    <p className="text-gray-500 leading-relaxed">
                      All online payments are end-to-end encrypted with 256-bit bank-grade SSL security. Instant confirmation with zero convenience fees.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6 sticky top-28">
              <h3 className="font-display font-bold text-base text-gray-900">
                Order Summary
              </h3>

              {/* Cart Items Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image
                        src={item.poster_image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              {/* Price Calculations */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Standard Delivery</span>
                  <span className="font-semibold text-emerald-600">
                    {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Payment Gateway Fee</span>
                  <span className="font-semibold text-emerald-600">FREE (₹0)</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-900">Total Payable</span>
                  <span className="font-display font-extrabold text-2xl text-[#FF7A00]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-semibold text-sm shadow-xl shadow-[#FF7A00]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transform active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === "upi"
                        ? `Pay ₹${grandTotal.toLocaleString()} with UPI`
                        : paymentMethod === "netbanking"
                        ? `Pay ₹${grandTotal.toLocaleString()} with Net Banking`
                        : paymentMethod === "card"
                        ? `Pay ₹${grandTotal.toLocaleString()} with Card`
                        : `Place COD Order (₹${grandTotal.toLocaleString()})`}
                    </span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit Bank Grade SSL Security</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                  <span>UPI • Google Pay • PhonePe • Net Banking • Cards</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
