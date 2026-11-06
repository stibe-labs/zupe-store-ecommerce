"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/siteConfig";
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
  ArrowLeft,
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
  Smartphone,
  User,
  Mail,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/AuthCard";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { deduplicateAddresses, normalizeAddressKey } from "@/lib/addressUtils";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

// Recommended Bump / Upsell Products (Official Catalog Variants & Authentic Pricing)
const BUMP_PRODUCTS = [
  {
    id: "turkiye-jam-pack-4",
    slug: "turkiye-jam-4-sachet-pack",
    name: "4 Sachet Strips (Value Pack)",
    price: 1399,
    mrp: 2399,
    poster_image: "/tj/turkiye-jam-4-strips.png",
    category: "Vitality & Wellness",
  },
  {
    id: "turkiye-jam-pack-6",
    slug: "turkiye-jam-6-sachet-pack",
    name: "6 Sachet Strips (Multi-Session Pack)",
    price: 1899,
    mrp: 3200,
    poster_image: "/tj/turkiye-jam-6-strips.png",
    category: "Vitality & Wellness",
  },
  {
    id: "turkiye-jam-bottle-240g",
    slug: "turkiye-jam-epimedium-macun",
    name: "240g Glass Jar + 2 Sachets Free",
    price: 2899,
    mrp: 4500,
    poster_image: "/tj/turkiye-jam-jar-2-strips.png",
    category: "Vitality & Wellness",
  },
  {
    id: "turkiye-jam-combo-box-14",
    slug: "turkiye-jam-sachet-box-14",
    name: "Sachet Box (12 + 2 Sachets)",
    price: 2899,
    mrp: 4800,
    poster_image: "/tj/turkiye-jam-box-14-strips.png",
    category: "Vitality & Wellness",
  },
  {
    id: "turkiye-jam-pack-3",
    slug: "turkiye-jam-3-sachet-pack",
    name: "3 Sachet Strips (Standard Pack)",
    price: 1099,
    mrp: 1899,
    poster_image: "/tj/turkiye-jam-3-strips.png",
    category: "Vitality & Wellness",
  },
  {
    id: "turkiye-jam-pack-2",
    slug: "turkiye-jam-2-sachet-pack",
    name: "2 Sachet Strips (Discovery Pack)",
    price: 899,
    mrp: 1499,
    poster_image: "/tj/turkiye-jam-2-strips.png",
    category: "Vitality & Wellness",
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
    standardShippingFee,
    outOfStockItemIds,
    hasOutOfStockItems,
    checkCartStock,
  } = useCart();
  const { user, isAuthenticated, isLoading: authLoading, openAuthModal, updateUserProfile } = useAuth();

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
  const [detectedPostOffices, setDetectedPostOffices] = useState<string[]>([]);
  const [locationAccuracyNotice, setLocationAccuracyNotice] = useState<string | null>(null);

  // Payment method state ("online" | "cod")
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  // Step progression state ("details" = contact & delivery, "payment" = choose how to pay)
  const [checkoutStep, setCheckoutStep] = useState<"details" | "payment">("details");
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Shiprocket Customer Address Auto-Lookup State
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [customerLookupBadge, setCustomerLookupBadge] = useState<string | null>(null);
  const lastLookedUpPhoneRef = useRef<string>("");

  const lookupCustomerDetails = async (rawPhoneInput: string) => {
    const clean = cleanPhoneDigits(rawPhoneInput);
    if (clean.length !== 10) return;
    if (lastLookedUpPhoneRef.current === clean) return;
    lastLookedUpPhoneRef.current = clean;

    setIsLookingUpCustomer(true);
    try {
      const res = await fetch(`/api/checkout/customer-lookup?phone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success && data.found && data.customer) {
        const c = data.customer;
        // Auto-fill Name if empty or generic
        if (!name || name.startsWith("Customer ")) {
          if (c.name) setName(c.name);
        }
        // Auto-fill Email if empty
        if (!email && c.email) {
          setEmail(c.email);
        }
        // Auto-fill Address if empty
        if (!address && c.address) {
          setAddress(c.address);
        }
        if (!city && c.city) {
          setCity(c.city);
        }
        if (!state && c.state) {
          setState(c.state);
        }
        if (!postalCode && c.pincode) {
          setPostalCode(c.pincode);
          setPincodeDetected(true);
        }

        // Add to saved addresses card list so user can see their Shiprocket address card
        if (c.address) {
          const autoAddr = {
            id: `sr-${clean}`,
            recipient_name: c.name || name || "Customer",
            phone: clean,
            street: c.address,
            city: c.city || city || "",
            state: c.state || state || "",
            postal_code: c.pincode || postalCode || "",
            is_default: true,
            source: data.source === "shiprocket_fastrr" ? "Shiprocket Fastrr" : "Shiprocket",
          };
          setSavedAddresses((prev) => {
            const exists = prev.some((a) => a.street === autoAddr.street || a.id === autoAddr.id);
            return exists ? prev : [autoAddr, ...prev];
          });
          setSelectedAddressId(autoAddr.id);
        }

        const sourceLabel = data.source === "shiprocket_fastrr" ? "Shiprocket Fastrr" : "Shiprocket";
        setCustomerLookupBadge(`Auto-filled address for ${c.name || "you"} via ${sourceLabel}`);
      }
    } catch (e) {
      console.warn("[Checkout] customer lookup error:", e);
    } finally {
      setIsLookingUpCustomer(false);
    }
  };

  // Auto-trigger Shiprocket customer lookup when phone reaches 10 digits
  useEffect(() => {
    const clean = cleanPhoneDigits(phone);
    if (clean.length === 10) {
      const timer = setTimeout(() => {
        lookupCustomerDetails(clean);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [phone]);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>("");
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [confirmedAdvancePaid, setConfirmedAdvancePaid] = useState<number>(0);
  const [confirmedBalanceDue, setConfirmedBalanceDue] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [recoveredBanner, setRecoveredBanner] = useState<string | null>(null);

  // Ensure scroll is unlocked and modals/drawers are dismissed on checkout mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }
  }, []);

  // Load Cashfree JS SDK dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("cashfree-js")) {
      const script = document.createElement("script");
      script.id = "cashfree-js";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Restore confirmed order from sessionStorage if recently placed
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedConfirm = sessionStorage.getItem("zupe_confirmed_order");
      if (storedConfirm) {
        const parsed = JSON.parse(storedConfirm);
        if (parsed && parsed.orderId && (Date.now() - (parsed.confirmedAt || 0) < 4 * 3600 * 1000)) {
          setConfirmedOrderId(parsed.orderId);
          setConfirmedTotal(parsed.total || 0);
          setConfirmedPaymentId(parsed.paymentId || "Online Payment");
          setConfirmedAdvancePaid(parsed.advancePaid || 0);
          setConfirmedBalanceDue(parsed.balanceDue || 0);
          setOrderComplete(true);
        }
      }
    } catch {}
  }, []);

  // Cashfree / Settler Order Verification Helper with Exponential Polling Retry
  const verifyCashfreeOrder = async (orderIdToVerify: string, attempt: number = 1) => {
    setVerifyingPayment(true);
    setLoading(true);
    setErrorMessage("");
    try {
      const rawOrderId = searchParams.get("order_id") || "";
      const isPaidFlag = searchParams.get("paid") === "true";

      const res = await fetch("/api/cashfree/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: orderIdToVerify,
          cashfreeOrderId: rawOrderId && rawOrderId !== orderIdToVerify ? rawOrderId : undefined,
          paid: isPaidFlag,
        }),
      });
      const data = await res.json();
      if (data.paid || data.success) {
        syncAddressAfterOrder();
        const finalOrderId = data.orderId || orderIdToVerify;
        const total = data.totalAmount || data.amount || grandTotal;
        const paymentLabel = data.isCodPartial ? "Cash on Delivery" : (data.paymentId || "Online Payment (Cashfree / Settler)");
        const advance = data.advancePaid || (data.isCodPartial ? 49 : 0);
        const due = data.balanceDue || (data.isCodPartial ? Math.max(0, total - 49) : 0);

        setConfirmedTotal(total);
        setConfirmedOrderId(finalOrderId);
        setConfirmedPaymentId(paymentLabel);
        setConfirmedAdvancePaid(advance);
        setConfirmedBalanceDue(due);
        setOrderComplete(true);
        clearCart();

        // Ensure both guest and logged-in user carts are purged
        try {
          localStorage.removeItem("zp_guest_cart");
          localStorage.setItem("zupe_last_order_id", finalOrderId);
          if (phone.trim()) localStorage.setItem("zupe_last_phone", phone.trim());
          sessionStorage.setItem("zupe_confirmed_order", JSON.stringify({
            orderId: finalOrderId,
            total,
            paymentId: paymentLabel,
            advancePaid: advance,
            balanceDue: due,
            confirmedAt: Date.now(),
          }));
        } catch {}

        if (user?.id) {
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, items: [] }),
          }).catch(() => {});
        }

        // Clean query parameters from URL so refreshes don't re-trigger verification
        try {
          if (typeof window !== "undefined") {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("cf_order_id");
            cleanUrl.searchParams.delete("order_id");
            cleanUrl.searchParams.delete("paid");
            window.history.replaceState({}, "", cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ""));
          }
        } catch {}

        setVerifyingPayment(false);
        setLoading(false);
        return;
      }

      // If pending and we have remaining retries (e.g. gateway status still syncing), retry with 1.5s delay
      if (attempt < 3) {
        setTimeout(() => {
          verifyCashfreeOrder(orderIdToVerify, attempt + 1);
        }, 1500);
        return;
      }

      setErrorMessage(data.message || "Payment is pending or was not completed. Please try again or select Cash on Delivery.");
    } catch (e: any) {
      console.error("Payment verification error:", e);
      if (attempt < 3) {
        setTimeout(() => {
          verifyCashfreeOrder(orderIdToVerify, attempt + 1);
        }, 1500);
        return;
      }
      setErrorMessage("Could not verify payment status. If money was deducted, your order will be confirmed automatically.");
    } finally {
      if (attempt >= 3) {
        setVerifyingPayment(false);
        setLoading(false);
      }
    }
  };

  // Check if returning from Cashfree / Settler redirect with ?cf_order_id= or ?order_id= or ?paid=true
  useEffect(() => {
    let targetOrder = searchParams.get("cf_order_id") || searchParams.get("order_id");
    const isPaid = searchParams.get("paid") === "true";

    // If redirected with ?paid=true but order id in query was omitted, fallback to localStorage last order
    if (!targetOrder && isPaid && typeof window !== "undefined") {
      targetOrder = localStorage.getItem("zupe_last_order_id");
    }

    if (targetOrder && !orderComplete && !verifyingPayment) {
      verifyCashfreeOrder(targetOrder);
    }
  }, [searchParams]);

  // Urgency Timer (Digital Countdown: Hours, Mins, Secs)
  const [timeLeft, setTimeLeft] = useState(6 * 3600 + 7 * 60 + 24); // 06:07:24

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
        setPromoSuccess(data.message || `🎉 Code ${data.code || code} applied! ₹${data.discount} discount added.`);
        setPromoError(null);
      } else {
        setPromoDiscount(0);
        setAppliedPromo(null);
        setPromoError(data.error || "Invalid promo code.");
        setPromoSuccess(null);
      }
    } catch {
      // Fallback
      if (code === "ZUPE10" || code === "WELCOME10" || code === "OFFER10") {
        const disc = Math.min(100, Math.round(subtotal * 0.1));
        setPromoDiscount(disc);
        setAppliedPromo(code);
        setPromoSuccess(`🎉 Code ${code} applied! ₹${disc} discount added.`);
      } else if (code === "SAVE50") {
        const disc = subtotal >= 399 ? 50 : 25;
        setPromoDiscount(disc);
        setAppliedPromo(code);
        setPromoSuccess(`🎉 Code ${code} applied! ₹${disc} discount added.`);
      } else {
        setPromoError("Unable to validate promo code. Please check your connection and try again.");
      }
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

  // COD to Prepaid Switch Mode disabled (COD Only store)
  const isCodSwitchMode = false;

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
            !siteConfig.isSyntheticEmail(chk.customer_email) &&
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
        name: "Turkiye Jam",
        description: `Order ${switchOrder.display_id || switchOrder.id} - Switch to Prepaid (Save ₹49)`,
        image: "/turkiye-jam-logo.png",
        order_id: data.razorpay_order_id,
        prefill: {
          name: switchOrder.customer_name || "",
          email: switchOrder.customer_email || "",
          contact: (switchOrder.customer_phone || "").replace(/\D/g, "").slice(-10),
          method: "upi",
        },
        theme: {
          color: "#cb0805",
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

  // Populate user data if logged in (phone and real name only - no default email)
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

  // Hydrate saved addresses for logged in user (by email, phone, or userId)
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
            setAddress(defaultAddr.street || "");
            setCity(defaultAddr.city || "");
            setState(defaultAddr.state || "");
            setPostalCode(defaultAddr.postal_code || "");
          }
        }
      }
    } catch (e) {}

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
            const offices = Array.from(new Set(data[0].PostOffice.map((p: any) => p.Name).filter(Boolean))) as string[];
            if (offices.length > 0) {
              setDetectedPostOffices(offices);
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

          if (data.city) setCity(data.city);
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
            setLocationSuccessMsg(`🎯 High-Precision GPS (~${Math.round(accuracy)}m): ${data.area || data.city || "Location detected"}`);
          } else if (accuracy > 0 && accuracy <= 500) {
            setLocationSuccessMsg(`📍 Area Location (~${Math.round(accuracy)}m): ${data.area || data.city || "Location detected"}`);
          } else if (accuracy > 500) {
            setLocationAccuracyNotice(
              `📶 Approximate Network Location (~${(accuracy / 1000).toFixed(1)} km) detected via Wi-Fi/ISP routing. Please verify your House No and Pincode.`
            );
          } else {
            setLocationSuccessMsg(`Location detected: ${data.area || data.city || "Address filled"}`);
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

    // Multi-pass Geolocation Execution:
    // Try high accuracy with 14s timeout first. If indoor satellite lock times out, seamlessly fallback to network location.
    const geoOptionsHigh = {
      enableHighAccuracy: true,
      timeout: 14000,
      maximumAge: 0,
    };

    const geoOptionsFast = {
      enableHighAccuracy: false,
      timeout: 7000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      processCoordinates,
      (err) => {
        // If high accuracy times out (e.g. indoors on mobile or laptop), fallback to standard network location
        if (err.code === err.TIMEOUT && isMobileDevice) {
          navigator.geolocation.getCurrentPosition(
            processCoordinates,
            () => {
              setLocationLoading(false);
              setLocationError("GPS signal weak indoors. Please enter your 6-digit Pincode to auto-fill your area.");
            },
            geoOptionsFast
          );
        } else {
          setLocationLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            setLocationError("Location permission denied. Please allow location access in your browser or type your 6-digit Pincode below.");
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setLocationError("Location signal unavailable. Please enter your 6-digit Pincode to auto-fill your area.");
          } else if (err.code === err.TIMEOUT) {
            setLocationError("Location request timed out. Please enter your 6-digit Pincode to auto-fill your area.");
          } else {
            setLocationError("Unable to fetch current location.");
          }
        }
      },
      geoOptionsHigh
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

  const isCod = paymentMethod === "cod";
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

  // Pricing calculations: In Indian retail / Legal Metrology, product prices are ALL-INCLUSIVE
  const effectiveSubtotal = Math.max(0, subtotal - promoDiscount);
  // 18% GST is included inside product price: Tax Component = Price - (Price / 1.18)
  const gstAmount = Math.round(effectiveSubtotal - (effectiveSubtotal / 1.18));
  const totalDiscount = savings + bundleSavings + promoDiscount;

  // Delivery Fee: Synchronized dynamically with Admin Settings (Free Shipping Min Order & Standard Fee)
  const isFreeDelivery = effectiveSubtotal >= freeShippingThreshold;
  const baseShippingFee = isFreeDelivery ? 0 : standardShippingFee;
  const codFee = isCod ? 49 : 0;
  const shippingFee = baseShippingFee + codFee;
  const codAdvance = 0;

  // Online Payment: Exact advertised price + standard shipping fee (if below threshold)
  const onlineGrandTotal = effectiveSubtotal + baseShippingFee;

  // Cash on Delivery: Advertised price + standard shipping fee + ₹49 courier fee
  const codGrandTotal = effectiveSubtotal + baseShippingFee + codFee;

  const grandTotal = isCod ? codGrandTotal : onlineGrandTotal;
  const payableNow = isCod ? 49 : onlineGrandTotal;
  const doorstepBalance = isCod ? (effectiveSubtotal + baseShippingFee) : 0;

  // Total MRP for comparison pill
  const totalMrp = cart.reduce((sum, it) => {
    const itemMrp = it.mrp || it.original_price || Math.round(it.price * 1.35);
    return sum + itemMrp * it.quantity;
  }, 0);
  const totalMrpSavings = Math.max(0, totalMrp - grandTotal);

  // Upsell bump offer candidates (excluding what is already in cart)
  const availableUpsells = useMemo(() => {
    const cartIds = new Set(
      cart.flatMap((c) => [
        c.id,
        c.slug,
        (c as any).product_id,
        c.id?.replace(/^turkiye-jam-/, ""),
        c.slug?.replace(/^turkiye-jam-/, ""),
      ]).filter(Boolean)
    );
    return BUMP_PRODUCTS.filter((b) => {
      const bShortId = b.id.replace(/^turkiye-jam-/, "");
      return !cartIds.has(b.id) && !cartIds.has(b.slug) && !cartIds.has(bShortId);
    });
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

    return () => clearTimeout(timer);
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

  const handleContinueToPayment = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    // Require authentication before progressing to purchase
    if (!user) {
      const cleanContact = cleanPhoneDigits(phone);
      openAuthModal(
        "login",
        "Sign in required: Please log in or verify with WhatsApp to complete your purchase 🛍️",
        undefined,
        (loggedInUser) => {
          if (loggedInUser?.phone && !phone) setPhone(cleanPhoneDigits(loggedInUser.phone));
          if (loggedInUser?.name && !name) setName(loggedInUser.name);
          setCheckoutStep("payment");
        },
        {
          initialPhone: cleanContact || undefined,
          autoSendOtp: cleanContact.length === 10,
        }
      );
      return;
    }

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require authentication before completing purchase
    if (!user) {
      const cleanContact = cleanPhoneDigits(phone);
      openAuthModal(
        "login",
        "Sign in required: Please log in or verify with WhatsApp to complete your purchase 🛍️",
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

    if (checkoutStep !== "payment") {
      handleContinueToPayment(e);
      return;
    }

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

    // PAYMENT FLOW (Both Online Full & COD Advance route through secure Cashfree gateway)
    try {
      const isCod = paymentMethod === "cod";
      const chargeAmount = isCod ? 49 : onlineGrandTotal;
      const totalOrderAmount = isCod ? codGrandTotal : onlineGrandTotal;
      const balanceDueAmount = isCod ? doorstepBalance : 0;

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
        shipping_cost: baseShippingFee + (isCod ? 49 : 0),
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
      };

      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await res.json();
      if (!orderData.success || (!orderData.payUrl && !orderData.paymentSessionId)) {
        setErrorMessage(orderData.error || "Failed to initialize payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const cfOrderId = orderData.orderId;

      try {
        localStorage.setItem("zupe_last_order_id", cfOrderId);
        localStorage.setItem("zupe_last_phone", phone.trim());
      } catch {}

      // If Settler Gateway URL is returned, navigate directly (zero domain whitelisting block)
      if (orderData.payUrl) {
        window.location.href = orderData.payUrl;
        return;
      }

      const sessionId = orderData.paymentSessionId;
      if (typeof window !== "undefined" && (window as any).Cashfree) {
        const cashfree = (window as any).Cashfree({ mode: "production" });
        cashfree.checkout({
          paymentSessionId: sessionId,
          redirectTarget: "_self",
        });
      } else {
        window.location.href = `https://payments.cashfree.com/order/#/${sessionId}`;
      }
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setErrorMessage("Network error while connecting to payment gateway. Please retry.");
      setLoading(false);
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
                  src="/turkiye-jam-logo.svg"
                  alt="Turkiye Jam"
                  width={140}
                  height={45}
                  className="h-10 w-auto object-contain"
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
              ✓ Switched to Prepaid &amp; Saved ₹49
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
                <span className="text-gray-500">Shipping:</span>
                <span className="font-bold text-[#cb0805]">FREE (Saved ₹49)</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-bold text-gray-900">Total Paid:</span>
                <span className="font-extrabold text-[#cb0805] text-lg">₹{switchSuccessAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/order-tracking?query=${encodeURIComponent(switchSuccessOrderId)}`}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#cb0805] text-white font-semibold text-sm hover:bg-[#a80604] transition-colors flex items-center justify-center gap-2 shadow-xs"
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
            © 2026 Turkiye Jam
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
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={140}
                height={45}
                className="h-10 w-auto object-contain"
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
          <div className="bg-gradient-to-r from-[#cb0805] via-[#cb0805] to-amber-500 rounded-3xl p-6 text-white text-center shadow-lg shadow-[#cb0805]/20 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white text-[#cb0805] uppercase tracking-wide mb-3 shadow-xs">
              ⚡ Instant ₹49 Discount Offer
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
              <Loader2 className="w-8 h-8 text-[#cb0805] animate-spin mx-auto mb-3" />
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

              {/* Price Breakdown with Rs 49 discount */}
              {(() => {
                const codTotal = Number(switchOrder.total_amount) || 0;
                const advancePaid = Number((switchOrder as any).advance_paid) || 10;
                const doorstepDue = (switchOrder as any).doorstep_balance !== undefined
                  ? Number((switchOrder as any).doorstep_balance)
                  : Math.max(0, codTotal - advancePaid);
                const finalPayable = (switchOrder as any).discounted_amount !== undefined
                  ? Number((switchOrder as any).discounted_amount)
                  : Math.max(1, doorstepDue - 49);

                return (
                  <>
                    <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>COD Total Order Value:</span>
                        <span className="font-semibold text-gray-800">₹{codTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Advance Paid Online:</span>
                        <span className="font-bold">₹{advancePaid} (Paid)</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Doorstep Balance Due (COD):</span>
                        <span className="line-through text-gray-400 font-semibold">₹{doorstepDue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Prepaid Switch Discount (Free Shipping):</span>
                        </span>
                        <span>-₹49</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-base sm:text-lg">
                        <span className="font-bold text-gray-900">Final Amount to Pay Online:</span>
                        <div className="text-right">
                          <span className="font-extrabold text-[#cb0805] text-xl">
                            ₹{finalPayable.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-bold">You Save ₹49 • ₹0 at Delivery</span>
                        </div>
                      </div>
                    </div>

                    {/* Pay Now Button */}
                    <button
                      type="button"
                      onClick={handlePayForCodOrder}
                      disabled={switchPaying}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#cb0805] via-[#cb0805] to-[#8c0503] hover:from-[#b90806] hover:to-[#8c0503] text-white font-extrabold text-base shadow-lg shadow-[#cb0805]/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-4"
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
                <ShoppingBag className="w-10 h-10 text-[#cb0805] mx-auto mb-2" />
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#cb0805]/20 focus:border-[#cb0805]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={switchLoading || !switchQuery.trim()}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-sm transition-all shadow-md shadow-[#cb0805]/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
          © 2026 Turkiye Jam
        </footer>
      </div>
    );
  }

  // Verifying Cashfree Payment View
  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <header className="py-4 border-b border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
            <Link href="/" className="inline-block">
              <Image
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={140}
                height={45}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-3 border border-emerald-200">
            🔒 Bank Grade Escrow Verification
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Confirming Your Payment...
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Please wait while we verify your transaction securely with Cashfree and banking rails. Do not refresh or close this tab.
          </p>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Turkiye Jam • 256-Bit Encrypted
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
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={140}
                height={45}
                className="h-10 w-auto object-contain"
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
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg bg-emerald-50 text-emerald-600 shadow-emerald-500/15"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold mb-2 border ${
              confirmedPaymentId === "Cash on Delivery"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {confirmedPaymentId === "Cash on Delivery"
              ? "Cash on Delivery Confirmed • ₹49 Courier Advance Paid Online"
              : "✓ Payment Confirmed • Free Express Delivery"}
          </span>

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {confirmedPaymentId === "Cash on Delivery"
              ? `Order Confirmed, ${name || "Shopper"}!`
              : `Payment Successful, ${name || "Shopper"}!`}
          </h1>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md mx-auto">
            {confirmedPaymentId === "Cash on Delivery" ? (
              <>
                Your Cash on Delivery order is confirmed! Your courier advance of ₹{(confirmedAdvancePaid || 49).toLocaleString()} has been received online. Our logistics team is packaging your order in discreet tamper-proof boxes. Please keep ₹{(confirmedBalanceDue || Math.max(0, (confirmedTotal || grandTotal) - 49)).toLocaleString()} in cash or UPI ready for the delivery agent.
              </>
            ) : (
              <>
                Your online payment was successfully processed! Your order is now prepaid and confirmed with Free Express Delivery.
              </>
            )}
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
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-semibold text-gray-900">
                {confirmedPaymentId === "Cash on Delivery"
                  ? "Cash on Delivery (₹49 Advance Paid Online)"
                  : "Online Payment (Cashfree Prepaid)"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">
                {confirmedPaymentId === "Cash on Delivery" ? "3 - 5 Business Days" : "2 - 4 Business Days (Priority)"}
              </span>
            </div>
            <div className="flex justify-between items-start py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[240px]">
                {address}, {city} - {postalCode}
              </span>
            </div>
            {confirmedPaymentId === "Cash on Delivery" ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Courier Advance Paid:</span>
                  <span className="font-semibold text-emerald-700">₹{(confirmedAdvancePaid || 49).toLocaleString()} (Paid Online)</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm">
                  <span className="font-bold text-gray-900">Payable to Courier:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-[#780016] text-lg block">
                      ₹{(confirmedBalanceDue || Math.max(0, (confirmedTotal || grandTotal) - 49)).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold block text-stone-500">
                      Pay cash or UPI to delivery agent at doorstep
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-bold text-gray-900">Total Paid:</span>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 text-lg block">
                    ₹{(confirmedTotal || grandTotal).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold block text-stone-500">
                    Paid securely online • Zero balance at doorstep
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/order-tracking?query=${encodeURIComponent(confirmedOrderId)}`}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#cb0805] text-white font-semibold text-sm hover:bg-[#a80604] transition-colors flex items-center justify-center gap-2 shadow-xs"
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
          © 2026 Turkiye Jam
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
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={140}
                height={45}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center text-[#cb0805]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Your Bag is Empty</h2>
          <p className="text-sm text-gray-500 mb-6">You don&apos;t have any products ready for checkout yet.</p>
          <Link
            href="/#shop"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#5b1420] hover:bg-[#8e1c2e] text-white font-semibold text-sm shadow-xs transition-colors"
          >
            Pick Your Pack
          </Link>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Turkiye Jam
        </footer>
      </div>
    );
  }

  // Auth Loading State (Wait for session sync so there is no layout flash)
  if (authLoading) {
    return (
      <div className="min-h-screen tj-diamonds-cream flex flex-col items-center justify-center p-4">
        <Loader2 className="w-9 h-9 animate-spin text-[#cb0805] mb-3" />
        <p className="text-sm text-stone-700 font-semibold tracking-wide">
          Securing your checkout session...
        </p>
      </div>
    );
  }

  // Mandatory Authentication Gate: Show checkout page ONLY after login
  if (!user) {
    const savedPhone = typeof window !== "undefined"
      ? (localStorage.getItem("zupe_checkout_phone") || localStorage.getItem("zupe_last_phone") || "")
      : "";

    return (
      <div className="min-h-screen tj-diamonds-cream text-stone-900 antialiased selection:bg-[#fed000] selection:text-stone-900 flex flex-col justify-between">
        {/* Top Minimal Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
          <div className="max-w-5xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors group py-2"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-gray-600" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden text-[11px]">Store</span>
            </Link>

            <Link href="/" className="inline-block transition-transform hover:opacity-95">
              <Image
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={140}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-2 text-right">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[11px] font-bold text-gray-900 leading-tight">100% Secure Checkout</p>
                <p className="text-[10px] text-gray-400 leading-tight">256-Bit SSL Encrypted</p>
              </div>
            </div>
          </div>
        </header>

        {/* Centered Auth Card with Order Preview Badge */}
        <main className="max-w-md mx-auto w-full py-8 sm:py-12 px-4 flex flex-col items-center">
          {cart.length > 0 && (
            <div className="w-full mb-5 p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#cb0805] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"} Reserved in Bag
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Payable: ₹{onlineGrandTotal.toLocaleString("en-IN")} • Free Express Delivery
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Reserved
              </span>
            </div>
          )}

          <div className="w-full">
            <AuthCard
              isModal={false}
              initialMode="login"
              initialPhone={savedPhone || undefined}
              autoSendOtp={Boolean(savedPhone && savedPhone.length === 10)}
              notice="Please sign in with WhatsApp to access checkout & saved addresses 🛍️"
              onSuccess={(loggedInUser) => {
                if (loggedInUser?.phone) {
                  setPhone(cleanPhoneDigits(loggedInUser.phone));
                }
                if (loggedInUser?.name && (!name || name.startsWith("Customer "))) {
                  setName(loggedInUser.name);
                }
              }}
            />
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          © 2026 Turkiye Jam • 100% Secure &amp; Verified
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen tj-diamonds-cream text-stone-900 antialiased selection:bg-[#fed000] selection:text-stone-900">
      {/* 1. TOP CLEAN MINIMAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Back to Store */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors group py-2"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-gray-600" />
            <span className="hidden sm:inline">Continue Shopping</span>
            <span className="sm:hidden text-[11px]">Store</span>
          </Link>

          {/* Centered Logo */}
          <Link href="/" className="inline-block transition-transform hover:opacity-95">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              width={140}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Secure Checkout Trust Badge */}
          <div className="flex items-center gap-2 text-right">
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold text-gray-900 leading-tight">100% Secure Checkout</p>
              <p className="text-[10px] text-gray-400 leading-tight">256-Bit SSL Encrypted</p>
            </div>
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
            {/* Verified WhatsApp Customer Status Banner */}
            {user && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-950 truncate">
                      Signed in as {user.name || user.phone}
                    </p>
                    <p className="text-[11px] text-emerald-700 truncate">
                      WhatsApp Verified • 1-Click Checkout Active
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal("login", "Switch or re-verify WhatsApp account")}
                  className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                >
                  Switch
                </button>
              </div>
            )}

            {/* Urgency Countdown Banner (Matches Reference Photo 3) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#FFF9F3] border border-[#FFE7D1] flex items-center justify-between gap-2 sm:gap-3 shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fee2e2] text-[#cb0805] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#cb0805]" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-[11px] sm:text-sm text-gray-900 leading-tight truncate">
                    Limited-Time Offer
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                    Your special deal ends in
                  </p>
                </div>
              </div>

              {/* 3 Dark Digital Countdown Blocks */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <div className="flex flex-col items-center">
                  <div className="bg-[#111827] text-white font-mono font-black text-xs sm:text-sm px-1.5 sm:px-2 py-1 rounded-md min-w-[26px] sm:min-w-[34px] text-center shadow-xs">
                    {Math.floor(timeLeft / 3600).toString().padStart(2, "0")}
                  </div>
                  <span className="text-[8.5px] sm:text-[9px] text-gray-400 font-semibold mt-0.5">Hours</span>
                </div>
                <span className="font-extrabold text-gray-900 pb-2.5 text-xs sm:text-sm">:</span>
                <div className="flex flex-col items-center">
                  <div className="bg-[#111827] text-white font-mono font-black text-xs sm:text-sm px-1.5 sm:px-2 py-1 rounded-md min-w-[26px] sm:min-w-[34px] text-center shadow-xs">
                    {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0")}
                  </div>
                  <span className="text-[8.5px] sm:text-[9px] text-gray-400 font-semibold mt-0.5">Mins</span>
                </div>
                <span className="font-extrabold text-gray-900 pb-2.5 text-xs sm:text-sm">:</span>
                <div className="flex flex-col items-center">
                  <div className="bg-[#111827] text-white font-mono font-black text-xs sm:text-sm px-1.5 sm:px-2 py-1 rounded-md min-w-[26px] sm:min-w-[34px] text-center shadow-xs">
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                  <span className="text-[8.5px] sm:text-[9px] text-gray-400 font-semibold mt-0.5">Secs</span>
                </div>
              </div>
            </div>

            {/* Collapsible Mobile Order Summary Bar (Matches Reference Design) */}
            <div className="block lg:hidden rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left bg-gray-50/70 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100/70 border border-rose-200/50 flex items-center justify-center text-[#cb0805] shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900">
                      <span>Order summary</span>
                      {isMobileSummaryOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your order
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {totalMrp > grandTotal && (
                    <span className="line-through text-xs text-gray-400 block">
                      ₹{totalMrp.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm font-extrabold text-gray-950">
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
                    className="border-t border-gray-100 p-4 space-y-3.5 bg-white"
                  >
                    {cart.map((item) => {
                      const itemTotal = (item.bundle_tier && item.bundle_tier > 1 && item.bundle_total)
                        ? item.bundle_total
                        : item.price * item.quantity;
                      const itemBaseUnit = item.original_price || item.price;
                      const itemRegularTotal = itemBaseUnit * item.quantity;
                      const isBundle = Boolean(item.bundle_tier && item.bundle_tier > 1);
                      const itemMrp = item.mrp || Math.round(itemBaseUnit * 1.25);
                      const itemSaving = isBundle
                        ? Math.max(0, itemRegularTotal - itemTotal)
                        : Math.max(0, (itemMrp - item.price) * item.quantity);

                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                            <Image src={item.poster_image} alt={item.name} fill className="object-cover" />
                            <div className="absolute top-0 right-0 w-4 h-4 rounded-bl-lg bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[11px] text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</span>
                              {isBundle ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[#FF5722] text-[10px] font-bold">
                                  <span>✨</span>
                                  <span>{item.offer_label || `Saved ₹${itemSaving.toLocaleString()}`}</span>
                                </span>
                              ) : itemSaving > 0 ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[#cb0805] text-[10px] font-bold">
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>You&apos;re saving ₹{itemSaving.toLocaleString()}</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {isBundle && itemRegularTotal > itemTotal && (
                              <span className="text-[10px] text-gray-400 line-through block">
                                ₹{itemRegularTotal.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs font-extrabold text-gray-900 block">
                              ₹{itemTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Promo Code Input Row (Matches Reference Photo 3) */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Promo code"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-900 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-[#cb0805] bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading}
                          className="px-4 py-2.5 rounded-xl bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-60"
                        >
                          {promoLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>Apply</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                      {promoSuccess && (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                          <span>{promoSuccess}</span>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {promoError && (
                        <p className="text-xs text-red-600 font-medium pl-1">
                          {promoError}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 1: CONTACT DETAILS (Matches Reference Photo 3) */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900">
                  Contact details
                </h2>
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1.5 pl-8.5 -mt-1.5 font-medium">
                <Lock className="w-3 h-3 text-gray-400" />
                <span>Secure checkout · Track your order anytime</span>
              </p>

              <div className="space-y-2.5 pt-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  MOBILE NUMBER *
                </label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#cb0805] focus-within:ring-1 focus-within:ring-[#cb0805] transition-all bg-white shadow-2xs">
                  {/* Flag & Country Code Selector Pill */}
                  <div className="px-3 bg-gray-50 border-r border-gray-200 text-gray-800 font-semibold text-xs flex items-center gap-1.5 select-none shrink-0">
                    <svg className="w-4 h-3 rounded-xs shrink-0 shadow-2xs border border-gray-200/50" viewBox="0 0 640 480">
                      <path fill="#FF9933" d="M0 0h640v160H0z"/>
                      <path fill="#FFFFFF" d="M0 160h640v160H0z"/>
                      <path fill="#128807" d="M0 320h640v160H0z"/>
                      <circle cx="320" cy="240" r="38" fill="none" stroke="#000088" strokeWidth="6"/>
                      <circle cx="320" cy="240" r="8" fill="#000088"/>
                    </svg>
                    <span>+91</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(cleanPhoneDigits(e.target.value))}
                    onBlur={(e) => {
                      const val = cleanPhoneDigits(e.target.value);
                      if (val.length === 10) lookupCustomerDetails(val);
                    }}
                    placeholder="97412 28540"
                    className="w-full px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none tracking-wide"
                  />
                </div>

                {/* Looking up customer indicator */}
                {isLookingUpCustomer && (
                  <div className="flex items-center gap-1.5 text-xs text-[#cb0805] font-semibold pt-0.5 animate-in fade-in duration-150">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cb0805]" />
                    <span>Checking Shiprocket for saved address...</span>
                  </div>
                )}

                {/* Found customer address banner */}
                {customerLookupBadge && !isLookingUpCustomer && (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-in fade-in duration-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{customerLookupBadge}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomerLookupBadge(null)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* WhatsApp Notification Card (Matches Reference Photo 3) */}
                <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#FFE7D1] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.179.18-.077.355.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.044.073.044.419-.1.824z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    We&apos;ll send your <span className="font-bold text-[#cb0805]">order confirmation</span> and <span className="font-bold text-[#cb0805]">delivery updates</span> to this number.
                  </p>
                </div>

                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pl-1">
                  <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>Your number is used only for your order updates.</span>
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* STEP 2: DELIVERY DETAILS (Matches Reference Photo 3) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900 leading-tight">
                      Delivery details
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Enter your delivery address
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Auto-Fetch Current Location Button (Pill Design) */}
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#cb0805] bg-rose-50/90 hover:bg-rose-100 border border-[#cb0805]/30 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                    title="Auto-fetch address using GPS current location"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cb0805]" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-3.5 h-3.5 text-[#cb0805]" />
                        <span>Use current location</span>
                      </>
                    )}
                  </button>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className="text-xs font-bold text-[#cb0805] hover:underline flex items-center gap-1 cursor-pointer"
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

              {/* Approximate Location Notice (Laptop / Wi-Fi Alert) */}
              {locationAccuracyNotice && (
                <div className="flex items-start justify-between gap-2.5 p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">Approximate Network Location</p>
                      <p className="text-amber-800 text-[11px] mt-0.5">{locationAccuracyNotice}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationAccuracyNotice(null)}
                    className="text-amber-700 hover:text-amber-900 text-xs font-bold p-0.5 cursor-pointer"
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

              {/* India Post Detected Localities Chips */}
              {detectedPostOffices.length > 0 && (
                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#cb0805]" />
                      Select your locality / post office in {postalCode || city}:
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetectedPostOffices([])}
                      className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {detectedPostOffices.slice(0, 6).map((poName) => (
                      <button
                        key={poName}
                        type="button"
                        onClick={() => {
                          if (!address.toLowerCase().includes(poName.toLowerCase())) {
                            setAddress((prev) => (prev ? `${prev}, ${poName}` : poName));
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-gray-800 hover:border-[#cb0805] hover:text-[#cb0805] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span>+ {poName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Delivery Addresses Selection Cards */}
              {savedAddresses.length > 0 && !isUsingNewAddress && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#cb0805]" />
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
                              ? "border-[#cb0805] bg-rose-50/50 ring-1 ring-[#cb0805]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-gray-900">{addr.recipient_name}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedAddress(e, addr.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
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
                  Full name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#cb0805] focus:ring-1 focus:ring-[#cb0805] transition-all bg-white shadow-2xs"
                  />
                </div>
                {name.trim().length >= 2 && (
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pl-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Looks good!</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  Email address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#cb0805] focus:ring-1 focus:ring-[#cb0805] transition-all bg-white shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-gray-400 pl-1">
                  Get order updates, offers and deals.
                </p>
              </div>

              {/* WhatsApp & Email Marketing Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 leading-snug select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#cb0805] focus:ring-[#cb0805] w-4 h-4 cursor-pointer"
                />
                <span>
                  Keep me in the loop — shipping updates on WhatsApp and the occasional deal by email. You can opt out anytime.
                </span>
              </label>

              {/* Complete Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                    Complete address *
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {address.length} / 200
                  </span>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <textarea
                    id="address-input"
                    required
                    maxLength={200}
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, street, area, landmark (e.g. Near bus stand)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#cb0805] focus:ring-1 focus:ring-[#cb0805] transition-all bg-white resize-none shadow-2xs leading-relaxed"
                  />
                </div>
              </div>

              {/* 2-Column: Pincode (Auto-detects area) & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                      Pincode *
                    </label>
                    {pincodeLoading && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cb0805]" />
                    )}
                    {pincodeDetected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Serviceable
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="pincode-input"
                      type="text"
                      required
                      maxLength={6}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="682001"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#cb0805] focus:ring-1 focus:ring-[#cb0805] transition-all bg-white shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 pl-1">
                    We&apos;ll check delivery availability for this area.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                    City *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="city-input"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Kochi"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#cb0805] focus:ring-1 focus:ring-[#cb0805] transition-all bg-white shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                  State *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="state-input"
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State (e.g. Maharashtra)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#cb0805] focus:ring-1 focus:ring-[#cb0805] transition-all bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* 3 Mini Trust Badges (Matches Reference Photo 3) */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-gray-500 font-medium">
                <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-bold text-gray-800">Easy Return</span>
                  <span className="text-[10px] text-gray-400">Hassle-free</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Truck className="w-4 h-4 text-[#cb0805]" />
                  <span className="text-[11px] font-bold text-gray-800">Fast Delivery</span>
                  <span className="text-[10px] text-gray-400">Across India</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-bold text-gray-800">24/7 Support</span>
                  <span className="text-[10px] text-gray-400">We&apos;re here</span>
                </div>
              </div>

              {/* STEP 2 BOTTOM: CONTINUE TO PAYMENT BUTTON (Visible before payment step) */}
              {checkoutStep === "details" && (
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    className="w-full py-4 px-6 rounded-2xl bg-[#097939] hover:bg-[#076630] text-white font-bold text-base shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-xs text-gray-500 font-medium">
                    Pick how you want to pay on the next step
                  </p>

                  {/* Trust Badges below Continue button (Matches Reference Photo 3) */}
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-bold text-gray-700">PCI DSS Certified</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-bold text-gray-700">Secure Payments</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                      <Truck className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-bold text-gray-700">Assured Delivery</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-bold text-gray-700">Verified Seller</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD (Revealed when Continue to Payment is clicked) */}
              {checkoutStep === "payment" && (
                <div id="payment-method-section" className="pt-3 space-y-4 animate-in fade-in duration-300">
                  {/* Confirmed Delivery Details Summary Strip with Edit Button */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Deliver to: {name} ({phone})</span>
                      </p>
                      <p className="text-gray-500 text-[11px] mt-0.5 truncate">
                        {address}, {city}, {state} - {postalCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutStep("details");
                        const el = document.getElementById("name-input");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="text-[#cb0805] hover:text-[#a80604] font-bold text-xs hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      Edit Address
                    </button>
                  </div>

                  {/* Section 3 Header */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                          Payment Option
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Choose Online Payment for Free Delivery or Cash on Delivery
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-right text-gray-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-800 leading-tight">100% Secure</p>
                        <p className="text-[10px] text-gray-400 leading-tight">256-Bit TLS Encryption</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Cards */}
                  <div className="space-y-3">
                    {/* CARD 1: Online Payment (Cashfree) */}
                    <div
                      id="payment-online-card"
                      onClick={() => setPaymentMethod("online")}
                      className={`relative p-4 sm:p-5 pt-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "online"
                          ? "border-emerald-600 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-600/30"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {/* RECOMMENDED BADGE */}
                      <span className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                        ★ RECOMMENDED • FREE DELIVERY (SAVE ₹49)
                      </span>

                      {/* Top Row: Radio + Icon + Title */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${
                              paymentMethod === "online" ? "border-emerald-600" : "border-gray-300"
                            }`}
                          >
                            {paymentMethod === "online" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            )}
                          </div>

                          <div className="w-10 h-10 rounded-xl bg-emerald-100/60 border border-emerald-200/50 flex items-center justify-center text-emerald-700 shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>

                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                              Online Payment (UPI, Cards, NetBanking)
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Google Pay, PhonePe, Paytm, BHIM, Cards &amp; Net Banking
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Details Strip */}
                      <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                          <Truck className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="tracking-wide uppercase text-[10px]">PRIORITY DISPATCH</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800">
                          FREE Express Delivery (Saved ₹49) • 2–4 Days
                        </span>
                      </div>

                      {/* Payable Online Row */}
                      <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-gray-100">
                        <div>
                          <p className="text-[11px] text-gray-500 font-medium">Amount Payable Now</p>
                          <p className="text-lg sm:text-xl font-black text-gray-950">
                            ₹{onlineGrandTotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Instant Confirmation</span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: Cash on Delivery (Partial COD - Advance ₹49) */}
                    <div
                      id="payment-cod-card"
                      onClick={() => setPaymentMethod("cod")}
                      className={`relative p-4 sm:p-5 pt-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-[#780016] bg-[#FFFBF8] shadow-sm ring-1 ring-[#780016]/20"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {/* BADGE */}
                      <span className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-stone-800 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                        PARTIAL COD • PAY ₹49 ADVANCE ONLINE
                      </span>

                      {/* Top Row: Radio + Icon + Title */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${
                              paymentMethod === "cod" ? "border-[#780016]" : "border-gray-300"
                            }`}
                          >
                            {paymentMethod === "cod" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#780016]" />
                            )}
                          </div>

                          <div className="w-10 h-10 rounded-xl bg-rose-100/60 border border-rose-200/50 flex items-center justify-center text-[#780016] shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                          </div>

                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                              Cash on Delivery (Pay ₹49 Advance Online)
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Pay ₹49 courier fee now • Pay remaining ₹{onlineGrandTotal.toLocaleString()} at doorstep
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Details Strip */}
                      <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                          <Truck className="w-3.5 h-3.5 text-[#780016]" />
                          <span className="tracking-wide uppercase text-[10px]">COURIER DISPATCH</span>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-700">
                          +₹49 Courier Advance • 3–5 Business Days
                        </span>
                      </div>

                      {/* Split Amount Breakdown Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-3.5 mt-3.5 border-t border-gray-100">
                        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/70">
                          <p className="text-[10px] text-rose-800 font-semibold uppercase tracking-wider">Pay Online Now</p>
                          <p className="text-base sm:text-lg font-black text-[#780016]">₹49</p>
                          <p className="text-[10px] text-rose-600/80">Courier Advance (UPI/Card)</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                          <p className="text-[10px] text-amber-900 font-semibold uppercase tracking-wider">Pay at Doorstep</p>
                          <p className="text-base sm:text-lg font-black text-gray-950">₹{onlineGrandTotal.toLocaleString()}</p>
                          <p className="text-[10px] text-stone-500">Cash or UPI upon delivery</p>
                        </div>
                      </div>

                      {/* Explanation Note */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2 mt-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-stone-700 leading-snug">
                          To confirm your order and prevent fake bookings, please pay the <strong>₹49 courier delivery advance online</strong> via UPI or Card. The remaining balance of <strong>₹{onlineGrandTotal.toLocaleString()}</strong> will be collected in cash or UPI by the delivery agent at your door.
                        </p>
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
                      {cart.map((item) => {
                        const itemTotal = (item.bundle_tier && item.bundle_tier > 1 && item.bundle_total)
                          ? item.bundle_total
                          : item.price * item.quantity;
                        const itemBaseUnit = item.original_price || item.price;
                        const itemRegularTotal = itemBaseUnit * item.quantity;
                        const isBundle = Boolean(item.bundle_tier && item.bundle_tier > 1);

                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                              <Image src={item.poster_image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                              </p>
                              {isBundle && (
                                <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-50 text-[#FF5722] border border-rose-200">
                                  <span>✨</span>
                                  <span>{item.offer_label || `Buy ${item.quantity} Save More`}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {isBundle && itemRegularTotal > itemTotal && (
                                <span className="text-[10px] text-gray-400 line-through block">
                                  ₹{itemRegularTotal.toLocaleString()}
                                </span>
                              )}
                              <span className="text-sm font-bold text-gray-900 block">
                                ₹{itemTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Breakdown Rows */}
                    <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Item Total</span>
                        <span className="font-semibold text-gray-900">
                          ₹{(bundleSavings > 0 ? regularSubtotal : subtotal).toLocaleString()}
                        </span>
                      </div>
                      {bundleSavings > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                          <span className="flex items-center gap-1 font-bold">
                            <span>✨</span>
                            <span>Buy More Save More Savings</span>
                          </span>
                          <span className="font-extrabold">-₹{bundleSavings.toLocaleString()}</span>
                        </div>
                      )}
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                          <span className="flex items-center gap-1 font-bold">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Promo Discount ({appliedPromo})</span>
                          </span>
                          <span className="font-extrabold">-₹{promoDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>GST (18% Included)</span>
                        <span className="font-semibold text-gray-900">₹{gstAmount.toLocaleString()} (Included)</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          Delivery Charge <Truck className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                        {isFreeDelivery ? (
                          <span className="font-bold text-emerald-700">
                            FREE {standardShippingFee > 0 ? `(Saved ₹${standardShippingFee})` : ""}
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            ₹{baseShippingFee.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {isCod && (
                        <div className="flex justify-between text-gray-600">
                          <span>Courier &amp; COD Handling Fee</span>
                          <span className="font-semibold text-gray-900">+₹49</span>
                        </div>
                      )}
                    </div>

                    {/* Total Payable Box */}
                    {paymentMethod === "online" ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Total Payable (Online)</p>
                          <p className="text-[11px] text-stone-600 font-medium">
                            {isFreeDelivery
                              ? "Free Express Delivery included"
                              : `Includes ₹${baseShippingFee} Standard Shipping`}
                          </p>
                        </div>
                        <span className="text-xl font-black text-gray-950">
                          ₹{onlineGrandTotal.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Total COD Order Value</p>
                            <p className="text-[11px] text-stone-600 font-medium">Includes ₹49 Delivery Fee</p>
                          </div>
                          <span className="text-lg font-black text-gray-950">
                            ₹{codGrandTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                          <span className="text-stone-700 font-medium">Advance to Pay Online Now:</span>
                          <span className="font-extrabold text-[#780016]">₹49</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-700 font-medium">Balance Payable on Delivery:</span>
                          <span className="font-extrabold text-stone-900">₹{onlineGrandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Payment Info Pill */}
                    <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      paymentMethod === "online"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-amber-50/90 text-amber-900 border border-amber-200"
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${
                        paymentMethod === "online" ? "bg-emerald-600" : "bg-amber-600"
                      }`}>
                        ✓
                      </div>
                      <span>
                        {paymentMethod === "online"
                          ? "Online Payment • 256-Bit Bank Grade Escrow by Cashfree"
                          : "Partial COD • Pay ₹49 Advance Online + Balance at Doorstep"}
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || hasOutOfStockItems}
                      className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        loading || hasOutOfStockItems
                          ? "bg-gray-400 cursor-not-allowed opacity-80"
                          : paymentMethod === "online"
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 active:scale-[0.99]"
                          : "bg-[#780016] hover:bg-[#5a0011] shadow-[#780016]/25 active:scale-[0.99]"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{paymentMethod === "online" ? "Opening Secure Payment..." : "Opening Payment for ₹49 Advance..."}</span>
                        </div>
                      ) : hasOutOfStockItems ? (
                        <span>⚠️ Remove Out of Stock Items to Continue</span>
                      ) : paymentMethod === "online" ? (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Pay Online Now • ₹{onlineGrandTotal.toLocaleString()}</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          <span>Pay ₹49 Advance to Confirm COD Order</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-gray-500 mt-2">
                      {paymentMethod === "online"
                        ? "100% Secure • FREE Express Delivery (Saved ₹49) • 256-bit Bank Grade Escrow by Cashfree"
                        : `Pay ₹49 courier advance now via UPI/Cards • Remaining ₹${onlineGrandTotal.toLocaleString()} payable at delivery`}
                    </p>
                  </div>

                  {/* Trust Badges below Submit Button */}
                  <div className="pt-3 grid grid-cols-3 gap-1.5 sm:gap-3 text-center">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100 shadow-2xs">
                      <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-gray-100 flex items-center justify-center text-[#780016] shrink-0 mb-1 mx-auto">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">100% COD</p>
                      <p className="text-[8.5px] sm:text-[10px] text-gray-400 leading-tight mt-0.5">Pay on Delivery</p>
                    </div>

                    <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100 shadow-2xs">
                      <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-gray-100 flex items-center justify-center text-emerald-600 shrink-0 mb-1 mx-auto">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">Discreet Box</p>
                      <p className="text-[8.5px] sm:text-[10px] text-gray-400 leading-tight mt-0.5">Plain Packaging</p>
                    </div>

                    <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100 shadow-2xs">
                      <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-gray-100 flex items-center justify-center text-blue-600 shrink-0 mb-1 mx-auto">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">Express Courier</p>
                      <p className="text-[8.5px] sm:text-[10px] text-gray-400 leading-tight mt-0.5">3–5 Days</p>
                    </div>
                  </div>
                </div>
              )}

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
                <p className="text-xs text-gray-400">© 2026 Turkiye Jam</p>
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
                  const itemTotal = (item.bundle_tier && item.bundle_tier > 1 && item.bundle_total)
                    ? item.bundle_total
                    : item.price * item.quantity;
                  const itemBaseUnit = item.original_price || item.price;
                  const itemRegularTotal = itemBaseUnit * item.quantity;
                  const isBundle = Boolean(item.bundle_tier && item.bundle_tier > 1);
                  const itemMrp = item.mrp || Math.round(itemBaseUnit * 1.25);

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
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 flex-wrap">
                          {isBundle ? (
                            <>
                              <span className="line-through text-gray-400">
                                ₹{itemBaseUnit.toLocaleString()}
                              </span>
                              <span className="font-bold text-gray-900">
                                ₹{item.price.toLocaleString()} × {item.quantity}
                              </span>
                            </>
                          ) : (
                            <>
                              {itemMrp > item.price && (
                                <span className="line-through text-gray-400">
                                  ₹{itemMrp.toLocaleString()}
                                </span>
                              )}
                              <span>₹{item.price.toLocaleString()} × {item.quantity}</span>
                            </>
                          )}
                        </div>

                        {/* Buy More Save More Badge */}
                        {isBundle && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-gradient-to-r from-orange-50 to-amber-50 text-[#FF5722] border border-rose-200 shadow-2xs">
                              <span>✨</span>
                              <span>{item.offer_label || `Buy ${item.quantity} Save More`}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          {isBundle && itemRegularTotal > itemTotal && (
                            <span className="text-[11px] text-gray-400 line-through block">
                              ₹{itemRegularTotal.toLocaleString()}
                            </span>
                          )}
                          <span className="font-bold text-sm text-gray-900 block">
                            ₹{itemTotal.toLocaleString()}
                          </span>
                        </div>
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

              {/* Promo Code Input Row (Desktop Sidebar) */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-900 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-[#cb0805] bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="px-4 py-2.5 rounded-xl bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    {promoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {promoSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                    <span>{promoSuccess}</span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {promoError && (
                  <p className="text-xs text-red-600 font-medium pl-1">
                    {promoError}
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Breakdown: Subtotal, Savings, Promo, 18% GST, Delivery Fee */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(bundleSavings > 0 ? regularSubtotal : subtotal).toLocaleString()}
                  </span>
                </div>
                {bundleSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1 font-bold">
                      <span>✨</span>
                      <span>Buy More Save More Savings</span>
                    </span>
                    <span className="font-extrabold">-₹{bundleSavings.toLocaleString()}</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      Promo Discount ({appliedPromo})
                    </span>
                    <span>-₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST (18% Included)</span>
                  <span className="font-semibold text-gray-900">₹{gstAmount.toLocaleString()} (Included)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    Delivery Charge <Truck className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  {isFreeDelivery ? (
                    <span className="font-bold text-emerald-700">
                      FREE {standardShippingFee > 0 ? `(Saved ₹${standardShippingFee})` : ""}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-900">
                      ₹{baseShippingFee.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {isCod && (
                  <div className="flex justify-between text-gray-600">
                    <span>Courier &amp; COD Handling Fee</span>
                    <span className="font-semibold text-gray-900">+₹49</span>
                  </div>
                )}
              </div>

              {/* Total Payable Box */}
              {paymentMethod === "online" ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Total Payable (Online)</p>
                    <p className="text-[11px] text-stone-600 font-medium">
                      {isFreeDelivery
                        ? "Free Express Delivery included"
                        : `Includes ₹${baseShippingFee} Standard Shipping`}
                    </p>
                  </div>
                  <span className="text-xl font-black text-gray-950">
                    ₹{onlineGrandTotal.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Total COD Order Value</p>
                      <p className="text-[11px] text-stone-600 font-medium">Includes ₹49 Delivery Fee</p>
                    </div>
                    <span className="text-lg font-black text-gray-950">
                      ₹{codGrandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                    <span className="text-stone-700 font-medium">Advance to Pay Online Now:</span>
                    <span className="font-extrabold text-[#780016]">₹49</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-700 font-medium">Balance Payable on Delivery:</span>
                    <span className="font-extrabold text-stone-900">₹{onlineGrandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Info Pill */}
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                paymentMethod === "online"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-amber-50/90 text-amber-900 border border-amber-200"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${
                  paymentMethod === "online" ? "bg-emerald-600" : "bg-amber-600"
                }`}>
                  ✓
                </div>
                <span>
                  {paymentMethod === "online"
                    ? "Online Payment • 256-Bit Bank Grade Escrow by Cashfree"
                    : "Partial COD • Pay ₹49 Advance Online + Balance at Doorstep"}
                </span>
              </div>

              {/* YOU MIGHT ALSO LIKE (Bump Offers) */}
              {availableUpsells.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#cb0805]" />
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
                          className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:bg-[#cb0805] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
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
        © 2026 Turkiye Jam
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
            <div className="w-8 h-8 border-3 border-[#cb0805] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-500">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
