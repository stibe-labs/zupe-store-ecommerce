"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  X,
  MessageCircle,
  Truck,
  ShieldCheck,
  Banknote,
  Check,
  Loader2,
  AlertCircle,
  Tag,
  MapPin,
  LocateFixed,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Phone,
  Package,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { cleanCityName } from "@/lib/pincodeService";
import { trackInitiateCheckout } from "@/lib/metaPixel";

export interface QuickBuyAuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    poster_image: string;
    price: number;
    mrp: number;
    original_price?: number;
    selectedColor?: string;
    selectedImage?: string;
  };
  bundle: {
    tier: number;
    label: string;
    unitPrice: number;
    totalPrice: number;
    savings: number;
  };
  quantity: number;
  initialMethod?: "cod" | "upi" | "prepaid";
  onSuccess?: (verifiedPhone: string, orderId?: string) => void;
}

export function QuickBuyAuthDrawer({
  isOpen,
  onClose,
  product,
  bundle,
  quantity,
  initialMethod = "upi",
  onSuccess,
}: QuickBuyAuthDrawerProps) {
  const { user, sendPhoneOtp, loginWithPhoneOtp } = useAuth();

  // Steps: "checkout" (Single scrolling checkout form) | "confirmed" (Thank you screen)
  const [step, setStep] = useState<"checkout" | "confirmed">("checkout");

  // Delivery & Contact Form
  const [name, setName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("zupe_checkout_name") || "";
      } catch {}
    }
    return "";
  });

  const [phone, setPhone] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          localStorage.getItem("zupe_checkout_phone") ||
          sessionStorage.getItem("checkout_prefill_phone") ||
          "";
        const clean = stored.replace(/\D/g, "");
        if (clean.length === 10) return clean;
      } catch {}
    }
    return "";
  });

  const [email, setEmail] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");

  const [pincodeLoading, setPincodeLoading] = useState<boolean>(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);

  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Payment Method ("online" | "cod")
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(() =>
    initialMethod === "cod" ? "cod" : "online"
  );
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<string>("WELCOME50");
  const [promoDiscount, setPromoDiscount] = useState<number>(50);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState<boolean>(false);

  // Field validation error markers
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    phone?: boolean;
    postalCode?: boolean;
    address?: boolean;
  }>({});

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpVerifiedSuccess, setIsOtpVerifiedSuccess] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Order Confirmed Details
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [confirmedDoorstepDue, setConfirmedDoorstepDue] = useState<number>(0);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<string>("online");

  // Input & Scroll Refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressScrollRef = useRef<HTMLDivElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Sync initial payment method when opened
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(initialMethod === "cod" ? "cod" : "online");
    }
  }, [isOpen, initialMethod]);

  // Delivery date range
  const deliveryDateRange = useMemo(() => {
    try {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() + 5);
      const end = new Date(now);
      end.setDate(now.getDate() + 7);
      return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]}`;
    } catch {
      return "5 – 7 days";
    }
  }, []);

  // Initialize drawer state on open
  useEffect(() => {
    if (isOpen) {
      setStep("checkout");
      setOrderError(null);
      setOtpError(null);
      setShowOtpModal(false);
      setIsOtpVerifiedSuccess(false);
      setFieldErrors({});

      if (typeof window !== "undefined") {
        try {
          const stored =
            localStorage.getItem("zupe_checkout_phone") ||
            sessionStorage.getItem("checkout_prefill_phone") ||
            "";
          const clean = stored.replace(/\D/g, "");
          if (clean.length === 10) setPhone(clean);

          const storedName = localStorage.getItem("zupe_checkout_name") || "";
          if (storedName && !name) setName(storedName);
        } catch {}
      }

      // If user is already authenticated with phone, mark verified
      if (user?.phone) {
        const cleanUserPhone = user.phone.replace(/\D/g, "").slice(-10);
        if (cleanUserPhone.length === 10) {
          setPhone(cleanUserPhone);
          if (user.name && !user.name.startsWith("Customer ")) {
            setName(user.name);
          }
          setIsVerified(true);
        }
      }
    }
  }, [isOpen, user]);

  // Resend Countdown Timer for OTP Modal
  useEffect(() => {
    if (!showOtpModal) return;
    setCanResend(false);
    setTimer(30);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpModal]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("91") && val.length > 10) val = val.slice(2);
    if (val.startsWith("0")) val = val.replace(/^0+/, "");
    if (val.length > 10) val = val.slice(0, 10);
    setPhone(val);
    setIsVerified(false); // Reset verification if phone number changes
    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: false }));
  };

  // Pincode Auto-detection (City, State, Serviceability)
  useEffect(() => {
    const cleanPin = postalCode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      fetch(`/api/location/pincode?pincode=${cleanPin}`)
        .then((res) => res.json())
        .then((data) => {
          setPincodeLoading(false);
          if (data.success && data.valid) {
            const detectedCity = cleanCityName(data.city || data.district, data.state);
            setCity(detectedCity);
            if (data.state) setState(data.state);
            setPincodeValid(true);
            setPincodeMessage(`Delivery to ${detectedCity}${data.state ? `, ${data.state}` : ""} (${deliveryDateRange})`);
            setFieldErrors((prev) => ({ ...prev, postalCode: false }));
          } else {
            setPincodeValid(false);
            setPincodeMessage("Please enter a valid 6-digit Indian Pincode");
          }
        })
        .catch(() => {
          setPincodeLoading(false);
          setPincodeValid(false);
          setPincodeMessage(null);
        });
    } else {
      setPincodeLoading(false);
      setPincodeValid(null);
      setPincodeMessage(null);
    }
  }, [postalCode, deliveryDateRange]);

  // Use my current location (GPS)
  const handleFetchCurrentLocation = () => {
    setLocationError(null);
    setLocationSuccessMsg(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please enter your pincode below.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 0;

          const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}&accuracy=${accuracy}`);
          const data = await res.json();

          if (res.ok && data.success) {
            const cleanStreet = (data.street || data.area || "").trim();
            if (cleanStreet) setAddress(cleanStreet);
            const detectedCity = cleanCityName(data.city || data.district, data.state);
            if (detectedCity) setCity(detectedCity);
            if (data.state) setState(data.state);
            if (data.pincode && data.pincode.length === 6) {
              setPostalCode(data.pincode);
            }
            setLocationSuccessMsg(`Location detected: ${data.area || detectedCity || "Address updated"}`);
            setFieldErrors((prev) => ({ ...prev, address: false, postalCode: false }));
            setTimeout(() => setLocationSuccessMsg(null), 5000);
          } else {
            setLocationError(data.error || "Unable to determine address from GPS. Please enter manually.");
          }
        } catch {
          setLocationError("Network error while looking up GPS location.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          setLocationError("Location permission denied. Please enter your Pincode below.");
        } else {
          setLocationError("Location signal unavailable. Please enter your Pincode below.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Pricing calculations
  const regularUnitPrice = product.original_price || product.mrp || product.price;
  const effectiveTotal = bundle.totalPrice || bundle.unitPrice * quantity || product.price * quantity;
  const regularTotal = regularUnitPrice * quantity;
  const mrpSavings = Math.max(0, regularTotal - effectiveTotal);
  const couponDiscount = promoDiscount;
  const cartTotal = Math.max(1, effectiveTotal - couponDiscount);
  const codFee = cartTotal < 500 ? 19 : 49;

  const isCod = paymentMethod === "cod";
  const grandTotal = isCod ? cartTotal + codFee : cartTotal;
  const payableNow = isCod ? codFee : cartTotal;
  const doorstepBalance = isCod ? cartTotal : 0;
  const totalSavings = mrpSavings + couponDiscount + (!isCod ? codFee : 0);
  const displayImage = product.selectedImage || product.poster_image;

  // Promo Code Handlers
  const handleApplyPromo = async () => {
    setPromoError(null);
    setPromoSuccessMsg(null);
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code");
      return;
    }
    setPromoLoading(true);

    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotal: effectiveTotal,
          items: [{ id: product.id, name: product.name, price: bundle.unitPrice || product.price, quantity }],
        }),
      });
      const data = await res.json();
      setPromoLoading(false);

      if (data.valid && data.discount > 0) {
        setAppliedPromo(data.code || code);
        setPromoDiscount(data.discount);
        setPromoSuccessMsg(`Coupon ${data.code || code} applied: -₹${data.discount}`);
        setPromoCodeInput("");
      } else {
        if (code === "ZUPE100" || code === "SAVE100") {
          setAppliedPromo(code);
          setPromoDiscount(100);
          setPromoSuccessMsg(`Coupon ${code} applied: -₹100`);
          setPromoCodeInput("");
        } else if (code === "WELCOME50" || code === "SAVE50") {
          setAppliedPromo(code);
          setPromoDiscount(50);
          setPromoSuccessMsg(`Coupon ${code} applied: -₹50`);
          setPromoCodeInput("");
        } else {
          setPromoError(data.error || "This code is not valid");
        }
      }
    } catch {
      setPromoLoading(false);
      if (code === "ZUPE100" || code === "SAVE100") {
        setAppliedPromo(code);
        setPromoDiscount(100);
        setPromoSuccessMsg(`Coupon ${code} applied: -₹100`);
        setPromoCodeInput("");
      } else if (code === "WELCOME50" || code === "SAVE50") {
        setAppliedPromo(code);
        setPromoDiscount(50);
        setPromoSuccessMsg(`Coupon ${code} applied: -₹50`);
        setPromoCodeInput("");
      } else {
        setPromoError("This code is not valid");
      }
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo("");
    setPromoDiscount(0);
    setPromoError(null);
    setPromoSuccessMsg(null);
  };

  // STEP 1 VALIDATION & PLACE ORDER BUTTON CLICK
  const handlePlaceOrderClick = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOrderError(null);

    const errors: { name?: boolean; phone?: boolean; postalCode?: boolean; address?: boolean } = {};
    if (!name.trim() || name.trim().length < 2) {
      errors.name = true;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = true;
    }
    const cleanPin = postalCode.replace(/\D/g, "");
    if (!cleanPin || cleanPin.length !== 6) {
      errors.postalCode = true;
    }
    if (!address.trim() || address.trim().length < 6) {
      errors.address = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setOrderError("Please complete the required details marked in red.");
      if (errors.phone && phoneInputRef.current) {
        phoneInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInputRef.current.focus();
      } else if (errors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInputRef.current.focus();
      } else if (addressScrollRef.current) {
        addressScrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    setFieldErrors({});

    // Persist entered customer details
    try {
      localStorage.setItem("zupe_checkout_name", name.trim());
      localStorage.setItem("zupe_checkout_phone", cleanPhone);
      sessionStorage.setItem("checkout_prefill_phone", cleanPhone);
    } catch {}

    // If customer already verified this number in current session, proceed straight to Razorpay
    if (isVerified) {
      executeRazorpayPayment();
      return;
    }

    // Otherwise, dispatch WhatsApp OTP and trigger OTP Popup Modal
    setOtpLoading(true);
    setOtpError(null);
    setOtpCode("");
    setIsOtpVerifiedSuccess(false);

    const otpRes = await sendPhoneOtp(cleanPhone);
    setOtpLoading(false);

    if (otpRes.success) {
      setShowOtpModal(true);
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
    } else {
      setOrderError(otpRes.error || "Failed to dispatch verification code. Please check your number.");
    }
  };

  // OTP Change & Auto-verify on 6 digits
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(clean);
    if (otpError) setOtpError(null);

    if (clean.length === 6) {
      verifyOtpAndProceed(clean);
    }
  };

  // Resend OTP inside modal
  const handleResendOtp = async () => {
    if (!canResend || otpLoading) return;
    setOtpError(null);
    setOtpLoading(true);
    const cleanPhone = phone.replace(/\D/g, "");
    const res = await sendPhoneOtp(cleanPhone);
    setOtpLoading(false);
    if (res.success) {
      setTimer(30);
      setCanResend(false);
      setOtpCode("");
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } else {
      setOtpError(res.error || "Could not resend code. Please try again.");
    }
  };

  // Verify OTP -> Show verified -> Open Razorpay Gateway
  const verifyOtpAndProceed = async (code: string) => {
    if (code.length !== 6) return;
    setOtpError(null);
    setOtpLoading(true);

    const cleanPhone = phone.replace(/\D/g, "");

    try {
      const res = await loginWithPhoneOtp(cleanPhone, code, name.trim());
      if (!res.success) {
        setOtpLoading(false);
        setOtpError(res.error || "Invalid verification code. Please check and retry.");
        return;
      }

      setIsVerified(true);
      setOtpLoading(false);
      setIsOtpVerifiedSuccess(true);

      // Brief transition: show verified checkmark, close OTP modal, then open Razorpay
      setTimeout(() => {
        setShowOtpModal(false);
        setIsOtpVerifiedSuccess(false);
        executeRazorpayPayment();
      }, 450);
    } catch (err: any) {
      setOtpLoading(false);
      setOtpError(err.message || "Verification failed. Please retry.");
    }
  };

  // RAZORPAY PAYMENT EXECUTION
  const executeRazorpayPayment = async () => {
    setIsPlacingOrder(true);
    setOrderError(null);

    const cleanPhone = phone.replace(/\D/g, "");

    try {
      trackInitiateCheckout({
        value: grandTotal,
        currency: "INR",
        num_items: quantity,
        content_ids: [product.id],
      });

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setIsPlacingOrder(false);
        setOrderError("Could not initialize secure payment gateway. Please check your connection.");
        return;
      }

      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payableNow,
          items: [
            {
              product_id: product.id,
              name: product.name,
              price: bundle.unitPrice || product.price,
              unit_price: bundle.unitPrice || product.price,
              quantity: quantity,
              original_price: regularUnitPrice,
              bundle_tier: bundle.tier,
              bundle_savings: bundle.savings,
              bundle_total: bundle.totalPrice,
              offer_label: bundle.label,
            },
          ],
          notes: {
            customer_name: name.trim(),
            customer_phone: cleanPhone,
            shipping_address: `${address.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}, ${city.trim()} - ${postalCode.trim()}`,
            payment_type: isCod ? "cod_partial" : "prepaid",
          },
        }),
      });

      const orderData = await createRes.json();
      if (!orderData.success || !orderData.orderId) {
        setIsPlacingOrder(false);
        setOrderError(orderData.error || "Failed to initialize payment gateway. Please retry.");
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
          : `Order Payment (Qty ${quantity})`,
        image: "/zupe-logo.webp",
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          contact: cleanPhone,
          email: email.trim() || undefined,
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
            setIsPlacingOrder(false);
            setOrderError(
              isCod
                ? `Payment cancelled. Pay ₹${codFee} COD fee to confirm your Cash on Delivery order.`
                : "Payment cancelled. You can retry whenever ready."
            );
          },
        },
        handler: async function (response: any) {
          try {
            setIsPlacingOrder(true);
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_payload: {
                  customer_name: name.trim(),
                  customer_phone: cleanPhone.startsWith("+91") ? cleanPhone : `+91 ${cleanPhone}`,
                  customer_email: email.trim() || undefined,
                  shipping_address: `${address.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}`,
                  city: state ? `${city.trim()}, ${state.trim()}` : city.trim(),
                  postal_code: postalCode.trim(),
                  total_amount: grandTotal,
                  discount_amount: totalSavings,
                  promo_code: appliedPromo || undefined,
                  promo_discount: promoDiscount,
                  payment_method: methodLabel,
                  is_cod_partial: isCod,
                  advance_amount: isCod ? codFee : grandTotal,
                  balance_amount: isCod ? doorstepBalance : 0,
                  shipping_fee: 0,
                  user_id: user?.id,
                  items: [
                    {
                      product_id: product.id,
                      name: product.name,
                      price: bundle.unitPrice || product.price,
                      unit_price: bundle.unitPrice || product.price,
                      quantity: quantity,
                      image: displayImage,
                      original_price: regularUnitPrice,
                      bundle_tier: bundle.tier,
                      bundle_savings: bundle.savings,
                      bundle_total: bundle.totalPrice,
                      offer_label: bundle.label,
                    },
                  ],
                },
              }),
            });

            const verifyData = await verifyRes.json();
            setIsPlacingOrder(false);

            if (verifyData.success) {
              const assignedOrderId = verifyData.orderId || orderData.orderId;
              setConfirmedOrderId(assignedOrderId);
              setConfirmedAmount(payableNow);
              setConfirmedDoorstepDue(doorstepBalance);
              setConfirmedPaymentMethod(paymentMethod);
              setStep("confirmed");
              onSuccess?.(cleanPhone, assignedOrderId);
            } else {
              setOrderError(verifyData.error || "Payment verification incomplete. Please contact support.");
            }
          } catch (vErr: any) {
            setIsPlacingOrder(false);
            setOrderError(vErr.message || "Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failRes: any) {
        setIsPlacingOrder(false);
        setOrderError(failRes?.error?.description || "Payment failed. Please retry with UPI or Card.");
      });
      rzp.open();
    } catch (pErr: any) {
      setIsPlacingOrder(false);
      setOrderError(pErr.message || "Error opening payment gateway.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden h-[94vh] max-h-[94vh]"
          >
            {/* Mobile Top Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* TOP BAR: Title + Close Button */}
            <div className="px-5 pt-2 pb-2.5 flex items-center justify-between shrink-0 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm sm:text-base">
                {step === "checkout" ? (
                  <>
                    <Lock className="w-4 h-4 text-gray-700" />
                    <span>Secure checkout</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order confirmed</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="px-5 py-4 overflow-y-auto space-y-5 flex-1">
              {step === "checkout" && (
                <>
                  {/* 1. ORDER SUMMARY CARD + PROMO CODE */}
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                    <div className="p-3.5 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-snug">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {bundle.label || `Pack of ${quantity}`} · Qty {quantity} · Free delivery
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-black text-gray-950">
                          ₹{effectiveTotal.toLocaleString()}
                        </span>
                        {regularTotal > effectiveTotal && (
                          <span className="block text-xs text-gray-400 line-through">
                            ₹{regularTotal.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Savings banner */}
                    {totalSavings > 0 && (
                      <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold border-t border-emerald-100">
                        <span>You save</span>
                        <span>₹{totalSavings.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Promo code entry row */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyPromo();
                            }
                          }}
                          placeholder="Promo code"
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

                      {/* Promo status or error */}
                      {promoError && (
                        <p className="text-[11px] text-rose-600 font-semibold">{promoError}</p>
                      )}
                      {promoSuccessMsg && (
                        <p className="text-[11px] text-emerald-700 font-semibold">{promoSuccessMsg}</p>
                      )}

                      {/* Applied promo chip */}
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

                  {/* 2. DELIVERY DETAILS SECTION */}
                  <div ref={addressScrollRef} className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#FF7A00]" />
                        <span>Delivery details</span>
                      </span>
                    </div>

                    {/* Use my current location button */}
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

                    {/* Input: Full Name */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }));
                        }}
                        placeholder="Your full name"
                        className={`w-full px-3.5 py-3 rounded-xl border-2 text-sm font-semibold transition focus:outline-none ${
                          fieldErrors.name
                            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                            : "border-gray-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15"
                        }`}
                      />
                    </div>

                    {/* Input: Mobile number */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                        Mobile number <span className="text-rose-500">*</span>
                      </label>
                      <div
                        className={`flex border-2 rounded-xl overflow-hidden transition focus-within:ring-2 focus-within:ring-orange-500/15 ${
                          fieldErrors.phone
                            ? "border-rose-400 bg-rose-50/20 focus-within:border-rose-500"
                            : "border-gray-200 bg-white focus-within:border-[#FF7A00]"
                        }`}
                      >
                        <span className="px-3.5 py-3 bg-gray-50 border-r border-gray-200 text-sm font-bold text-gray-700 select-none">
                          +91
                        </span>
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          autoComplete="tel-national"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="10-digit mobile number"
                          className="flex-1 px-3.5 py-3 text-sm font-semibold tracking-wider focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 pt-0.5">
                        We will send a code on WhatsApp to confirm your order.
                      </p>
                    </div>

                    {/* Input: House No, Street, Area */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                        House No, Street, Area <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        autoComplete="street-address"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: false }));
                        }}
                        placeholder="House / Flat No., Apartment, Street, Area"
                        className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-sm font-semibold transition focus:outline-none resize-none ${
                          fieldErrors.address
                            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                            : "border-gray-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15"
                        }`}
                      />
                    </div>

                    {/* Input: Pincode */}
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
                          if (fieldErrors.postalCode) setFieldErrors((prev) => ({ ...prev, postalCode: false }));
                        }}
                        placeholder="e.g. 682001"
                        className={`w-full px-3.5 py-3 rounded-xl border-2 text-sm font-semibold tracking-wider transition focus:outline-none ${
                          fieldErrors.postalCode
                            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                            : "border-gray-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15"
                        }`}
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

                    {/* Input: Landmark (Optional) */}
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

                    {/* Input: Email (Optional) */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-extrabold text-gray-700 tracking-wide uppercase">
                        Email address <span className="text-gray-400 font-normal lowercase">(optional, for invoice)</span>
                      </label>
                      <input
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

                  {/* 3. CHOOSE HOW TO PAY SECTION */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#FF7A00]" />
                        <span>Choose how to pay</span>
                      </span>
                    </div>

                    {/* Option 1: Pay Online */}
                    <div
                      onClick={() => setPaymentMethod("online")}
                      className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "online"
                          ? "border-[#FF7A00] bg-orange-50/25 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-[9.5px] tracking-wide shadow-xs">
                        RECOMMENDED
                      </span>

                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wide shadow-xs">
                        SAVE ₹{codFee}
                      </span>

                      <div className="flex items-start gap-3 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                            paymentMethod === "online"
                              ? "border-[#FF7A00] bg-[#FF7A00]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900 leading-snug">
                              Pay Online
                            </h4>
                            <span className="text-sm font-black text-gray-950">
                              ₹{cartTotal.toLocaleString()}
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
                              ₹{(cartTotal + codFee).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Product price + ₹{codFee} COD handling fee
                          </p>

                          {/* COD Breakdown row */}
                          <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center text-xs">
                            <div className="p-2 rounded-lg bg-gray-100/80 border border-gray-200">
                              <span className="block text-[10px] text-gray-500 font-semibold">Pay at delivery</span>
                              <strong className="block text-xs font-black text-gray-900">₹{cartTotal.toLocaleString()}</strong>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                              <span className="block text-[10px] text-amber-800 font-semibold">Pay now online</span>
                              <strong className="block text-xs font-black text-amber-950">₹{codFee}</strong>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-900 text-white border border-gray-900">
                              <span className="block text-[10px] text-gray-300 font-semibold">Total</span>
                              <strong className="block text-xs font-black">₹{(cartTotal + codFee).toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nudge card when COD is active */}
                    {isCod && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white space-y-2 animate-in fade-in duration-200 shadow-md shadow-emerald-950/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            SMART CHOICE
                          </span>
                          <span className="text-[11px] font-black bg-amber-300 text-emerald-950 px-2.5 py-0.5 rounded-full">
                            SAVE ₹{codFee}
                          </span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed">
                          Pay <strong>₹{cartTotal.toLocaleString()}</strong> online instead of <span className="line-through text-white/60">₹{(cartTotal + codFee).toLocaleString()}</span>. Faster dispatch, no cash needed at delivery.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("online")}
                          className="w-full py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-gray-100 transition cursor-pointer"
                        >
                          Switch to Pay Online · Save ₹{codFee}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. PRICE DETAILS SUMMARY */}
                  <div className="rounded-2xl border border-gray-200 bg-gray-50/70 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsPriceDetailsOpen((prev) => !prev)}
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-gray-900 cursor-pointer select-none"
                    >
                      <span>Price Details ({quantity} item{quantity > 1 ? "s" : ""})</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-950">₹{grandTotal.toLocaleString()}</span>
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
                          <span className="line-through text-gray-400">₹{regularTotal.toLocaleString()}</span>
                        </div>
                        {mrpSavings > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Product Discount</span>
                            <span>−₹{mrpSavings.toLocaleString()}</span>
                          </div>
                        )}
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Coupon ({appliedPromo})</span>
                            <span>−₹{couponDiscount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span className="font-bold text-emerald-700">FREE</span>
                        </div>
                        {isCod && (
                          <div className="flex justify-between">
                            <span>COD Handling Fee</span>
                            <span className="font-bold text-gray-900">₹{codFee}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-gray-950">
                          <span>Total Amount</span>
                          <span>₹{grandTotal.toLocaleString()}</span>
                        </div>
                        {totalSavings > 0 && (
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-center text-[11.5px] mt-2">
                            You save ₹{totalSavings.toLocaleString()} on this order
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submission Error Banner */}
                  {orderError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* Store support notice */}
                  <p className="text-center text-[11px] text-gray-400 pt-1">
                    Zupe Store · Support +91 97441 22853 · 7-day replacement
                  </p>
                </>
              )}

              {/* STEP 4: ORDER CONFIRMED VIEW */}
              {step === "confirmed" && (
                <div className="space-y-4 pt-3 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-in zoom-in-75 duration-300">
                    <Check className="w-10 h-10 stroke-[3.5]" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-950">
                      Order confirmed
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Your order <strong className="text-gray-900">#{confirmedOrderId}</strong> is placed.
                    </p>
                  </div>

                  {/* Order summary card */}
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-left space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-snug">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Qty {quantity} · {confirmedPaymentMethod === "cod" ? `₹${codFee} paid (COD)` : `₹${confirmedAmount.toLocaleString()} paid online`}
                        </p>
                        <p className="text-[11.5px] text-emerald-700 font-extrabold mt-0.5 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Delivery by {deliveryDateRange}</span>
                        </p>
                      </div>
                    </div>

                    {confirmedPaymentMethod === "cod" && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
                        Keep <strong>₹{confirmedDoorstepDue.toLocaleString()}</strong> ready at delivery. We will confirm on WhatsApp shortly.
                      </div>
                    )}
                  </div>

                  {/* Visual Shipping Progress Tracker */}
                  <div className="pt-2 px-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900">Confirmed</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-500">Shipped</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-500">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Updates Button */}
                  <div className="pt-2 space-y-2">
                    <a
                      href={`https://wa.me/919744122853?text=${encodeURIComponent(
                        `Hi, I just placed order #${confirmedOrderId} on Zupe Store. Please share tracking updates!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Get updates on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-extrabold text-sm transition cursor-pointer"
                    >
                      Continue shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STICKY BOTTOM FOOTER (Place Order CTA) */}
            {step === "checkout" && (
              <div className="p-4 bg-white border-t border-gray-100 shrink-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 pb-0.5">
                  <div>
                    <span className="text-base font-black text-gray-950">
                      ₹{payableNow.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-500 ml-1.5 font-medium">
                      {isCod ? `now · ₹${cartTotal.toLocaleString()} at delivery` : "total"}
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
                  onClick={handlePlaceOrderClick}
                  disabled={isPlacingOrder || otpLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black text-base shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to gateway...</span>
                    </>
                  ) : otpLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending WhatsApp code...</span>
                    </>
                  ) : isCod ? (
                    <span className="flex items-center gap-1.5">
                      <span>Pay ₹{codFee} &amp; Place COD Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span>Pay ₹{grandTotal.toLocaleString()} &amp; Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                    <span>Questions?</span>
                  </span>{" "}
                  <a
                    href="https://wa.me/919744122853"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    WhatsApp us
                  </a>
                </p>
              </div>
            )}
          </motion.div>

          {/* ================= OTP VERIFICATION POPUP MODAL (Comes after Place Order) ================= */}
          <AnimatePresence>
            {showOtpModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                {/* Dark overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowOtpModal(false)}
                  className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
                />

                {/* OTP Modal Dialog */}
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100"
                >
                  {/* Close button */}
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
                        <MessageCircle className="w-7 h-7" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Verify your mobile number</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          We sent a 6-digit verification code on WhatsApp to <br />
                          <strong className="text-gray-900">+91 {phone.slice(0, 5)} {phone.slice(5)}</strong>
                        </p>
                      </div>

                      {/* 6 OTP Input Boxes */}
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

                      {/* OTP error notice */}
                      {otpError && (
                        <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2 rounded-xl">
                          {otpError}
                        </p>
                      )}

                      {/* Resend and Change Number Links */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOtpModal(false);
                            setTimeout(() => {
                              if (phoneInputRef.current) {
                                phoneInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                                phoneInputRef.current.focus();
                                phoneInputRef.current.select();
                              }
                            }, 200);
                          }}
                          className="text-[#FF7A00] font-bold hover:underline cursor-pointer"
                        >
                          Change number
                        </button>

                        <div>
                          {canResend ? (
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
                              Resend in {timer}s
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SMS Backup button */}
                      <button
                        type="button"
                        onClick={async () => {
                          setOtpLoading(true);
                          const cleanPhone = phone.replace(/\D/g, "");
                          await sendPhoneOtp(cleanPhone);
                          setOtpLoading(false);
                          setTimer(30);
                          setCanResend(false);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition cursor-pointer"
                      >
                        Get code by SMS
                      </button>
                    </div>
                  ) : (
                    /* Verified Success state -> opening gateway */
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
        </div>
      )}
    </AnimatePresence>
  );
}
