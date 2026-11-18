"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  X,
  ChevronLeft,
  MessageCircle,
  Truck,
  ShieldCheck,
  Banknote,
  Check,
  Loader2,
  AlertCircle,
  Edit2,
  Tag,
  MapPin,
  LocateFixed,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Phone,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { cleanCityName } from "@/lib/pincodeService";
import { trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

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

  // Steps: 1="phone", 2="otp", 3="checkout" (Delivery + Payment), 4="confirmed"
  const [step, setStep] = useState<"phone" | "otp" | "checkout" | "confirmed">("phone");

  // Step 1: Phone
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

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpFocused, setIsOtpFocused] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Step 3: Delivery Address
  const [name, setName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("zupe_checkout_name") || "";
      } catch {}
    }
    return "";
  });
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

  // Step 3: Payment Method ("online" | "cod")
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(() =>
    initialMethod === "cod" ? "cod" : "online"
  );
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Form field error highlights
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    postalCode?: boolean;
    address?: boolean;
  }>({});

  // Step 4: Order Confirmed Details
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [confirmedDoorstepDue, setConfirmedDoorstepDue] = useState<number>(0);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<string>("online");

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addressScrollRef = useRef<HTMLDivElement>(null);

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

  // Initialize and check prefilled phone on drawer open
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setError(null);
      setOrderError(null);
      setIsVerified(false);
      setOtpCode("");
      setTimer(30);
      setCanResend(false);
      setFieldErrors({});

      if (typeof window !== "undefined") {
        try {
          const stored =
            localStorage.getItem("zupe_checkout_phone") ||
            sessionStorage.getItem("checkout_prefill_phone") ||
            "";
          const clean = stored.replace(/\D/g, "");
          if (clean.length === 10) {
            setPhone(clean);
          }
          const storedName = localStorage.getItem("zupe_checkout_name") || "";
          if (storedName && !name) {
            setName(storedName);
          }
        } catch {}
      }

      // If user is already authenticated with phone, prefill and skip directly to Step 3
      if (user?.phone) {
        const cleanUserPhone = user.phone.replace(/\D/g, "").slice(-10);
        if (cleanUserPhone.length === 10) {
          setPhone(cleanUserPhone);
          if (user.name && !user.name.startsWith("Customer ")) {
            setName(user.name);
          }
          setIsVerified(true);
          setStep("checkout");
          return;
        }
      }

      // Auto focus phone input
      setTimeout(() => {
        if (phoneInputRef.current) phoneInputRef.current.focus();
      }, 250);
    }
  }, [isOpen, user]);

  // Resend Countdown Timer
  useEffect(() => {
    if (step !== "otp") return;
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
  }, [step]);

  // WebOTP API: Auto-read incoming carrier SMS OTP on mobile browsers
  useEffect(() => {
    if (step !== "otp") return;

    let ac: AbortController | null = null;
    if (typeof window !== "undefined" && "OTPCredential" in window) {
      try {
        ac = new AbortController();
        (navigator.credentials as any)
          .get({
            otp: { transport: ["sms"] },
            signal: ac.signal,
          })
          .then((content: any) => {
            if (content && content.code) {
              const digits = content.code.replace(/\D/g, "").slice(0, 6);
              if (digits.length === 6) {
                setOtpCode(digits);
                triggerVerify(digits);
              }
            }
          })
          .catch(() => {});
      } catch {}
    }

    return () => {
      if (ac) ac.abort();
    };
  }, [step]);

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

  // Clean and format phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("91") && val.length > 10) val = val.slice(2);
    if (val.startsWith("0")) val = val.replace(/^0+/, "");
    if (val.length > 10) val = val.slice(0, 10);
    setPhone(val);
    if (error) setError(null);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const raw = phone.replace(/\D/g, "");
    if (raw.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(raw)) {
      setError("Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    try {
      localStorage.setItem("zupe_checkout_phone", raw);
      sessionStorage.setItem("checkout_prefill_phone", raw);
    } catch {}

    setLoading(true);
    const res = await sendPhoneOtp(raw);
    setLoading(false);

    if (res.success) {
      setStep("otp");
      setOtpCode("");
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 250);
    } else {
      setError(res.error || "Failed to send verification code. Please try again.");
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend || loading) return;
    setError(null);
    setLoading(true);
    const res = await sendPhoneOtp(phone);
    setLoading(false);
    if (res.success) {
      setTimer(30);
      setCanResend(false);
      setOtpCode("");
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } else {
      setError(res.error || "Could not resend verification code. Please try again.");
    }
  };

  // Handle OTP master input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(clean);
    if (error) setError(null);

    if (clean.length === 6) {
      triggerVerify(clean);
    }
  };

  // Step 2: Trigger Verify OTP -> Move to Step 3 (Delivery & Payment inside Drawer!)
  const triggerVerify = async (code: string) => {
    if (code.length !== 6) return;
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithPhoneOtp(phone, code);
      if (!res.success) {
        setLoading(false);
        setError(res.error || "Invalid verification code. Please check and retry.");
        return;
      }

      setIsVerified(true);
      setLoading(false);

      // Brief pause to display green "✓ Verified" pill, then transition directly to Step 3: Complete Your Order!
      setTimeout(() => {
        setStep("checkout");
        setTimeout(() => {
          if (nameInputRef.current && !name) {
            nameInputRef.current.focus();
          }
        }, 250);
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Verification failed. Please try again.");
    }
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
            setPincodeMessage(`✓ ${detectedCity}${data.state ? `, ${data.state}` : ""} · Delivery by ${deliveryDateRange}`);
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
            setLocationSuccessMsg(`📍 Location detected: ${data.area || detectedCity || "Address filled"}`);
            setFieldErrors((prev) => ({ ...prev, address: false, postalCode: false }));
            setTimeout(() => setLocationSuccessMsg(null), 6000);
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
  const couponDiscount = 50; // WELCOME50
  const cartTotal = Math.max(1, effectiveTotal - couponDiscount);
  const codFee = cartTotal < 500 ? 19 : 49;

  const isCod = paymentMethod === "cod";
  const grandTotal = isCod ? cartTotal + codFee : cartTotal;
  const payableNow = isCod ? codFee : cartTotal;
  const doorstepBalance = isCod ? cartTotal : 0;
  const totalSavings = mrpSavings + couponDiscount + (!isCod ? codFee : 0);
  const displayImage = product.selectedImage || product.poster_image;

  // Step 3 Order Placement via Razorpay
  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOrderError(null);

    // Validation
    const errors: { name?: boolean; postalCode?: boolean; address?: boolean } = {};
    if (!name.trim() || name.trim().length < 2) {
      errors.name = true;
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
      setOrderError("Please complete all required delivery details marked in red.");
      if (addressScrollRef.current) {
        addressScrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    setFieldErrors({});
    setIsPlacingOrder(true);

    try {
      // 1. Persist entered details
      try {
        localStorage.setItem("zupe_checkout_name", name.trim());
      } catch {}

      // 2. Track InitiateCheckout
      trackInitiateCheckout({
        value: grandTotal,
        currency: "INR",
        num_items: quantity,
        content_ids: [product.id],
      });

      // 3. Load Razorpay gateway script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setIsPlacingOrder(false);
        setOrderError("Could not initialize secure payment gateway. Please check your internet connection.");
        return;
      }

      // 4. Create Razorpay order
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
            customer_phone: phone.trim(),
            shipping_address: `${address.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}, ${city.trim()} - ${postalCode.trim()}`,
            payment_type: isCod ? "cod_partial" : "prepaid",
          },
        }),
      });

      const orderData = await createRes.json();
      if (!orderData.success || !orderData.orderId) {
        setIsPlacingOrder(false);
        setOrderError(orderData.error || "Failed to initialize payment gateway. Please try again.");
        return;
      }

      const methodLabel = isCod ? "Cash on Delivery" : "Prepaid (Online)";

      // 5. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zupe Store",
        description: isCod
          ? `COD Handling Fee (₹${codFee}) - Zupe Store`
          : `Payment for Order (Qty ${quantity})`,
        image: "/zupe-logo.webp",
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
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
            setIsPlacingOrder(false);
            setOrderError(
              isCod
                ? `Payment cancelled. Pay ₹${codFee} COD fee to place your Cash on Delivery order.`
                : "Payment cancelled. You can retry whenever you are ready."
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
                  customer_phone: phone.trim().startsWith("+91") ? phone.trim() : `+91 ${phone.trim()}`,
                  shipping_address: `${address.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}`,
                  city: state ? `${city.trim()}, ${state.trim()}` : city.trim(),
                  postal_code: postalCode.trim(),
                  total_amount: grandTotal,
                  discount_amount: totalSavings,
                  promo_code: "WELCOME50",
                  promo_discount: 50,
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
              const finalOrderId = String(
                verifyData.orderId ||
                  (verifyData.order && verifyData.order.id) ||
                  `ZS${Math.floor(1000 + Math.random() * 9000)}`
              );

              // 1. Track Meta Pixel Purchase event
              trackPurchase({
                orderId: finalOrderId,
                value: grandTotal,
                currency: "INR",
                num_items: quantity,
                content_ids: [product.id],
              });

              // 2. Sync saved address
              try {
                fetch("/api/user/addresses", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient_name: name.trim(),
                    phone: phone.trim(),
                    street: address.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    postal_code: postalCode.trim(),
                    country: "India",
                  }),
                }).catch(() => {});
              } catch {}

              // 3. Move to Step 4 (Order Confirmed screen inside drawer!)
              setConfirmedOrderId(finalOrderId);
              setConfirmedAmount(grandTotal);
              setConfirmedDoorstepDue(doorstepBalance);
              setConfirmedPaymentMethod(isCod ? "cod" : "online");
              setStep("confirmed");

              if (onSuccess) {
                onSuccess(phone, finalOrderId);
              }
            } else {
              setOrderError(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err: any) {
            setIsPlacingOrder(false);
            setOrderError("Network error while confirming payment. Please contact support.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failResp: any) {
        setIsPlacingOrder(false);
        setOrderError(failResp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      setIsPlacingOrder(false);
      setOrderError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "phone":
        return "Secure checkout";
      case "otp":
        return "Verify your number";
      case "checkout":
        return "Complete your order";
      case "confirmed":
        return "Order confirmed";
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
            className={`relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${
              step === "checkout" || step === "confirmed" ? "h-[94vh] max-h-[94vh]" : "max-h-[92vh]"
            }`}
          >
            {/* Mobile Top Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* TOP BAR: Navigation + Title + Close Button */}
            <div className="px-5 pt-2 pb-2 flex items-center justify-between shrink-0">
              {step === "otp" ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition cursor-pointer"
                  title="Change phone number"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              ) : step === "checkout" ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep("otp");
                    setError(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition cursor-pointer"
                  title="Back to verification"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              ) : (
                <div className="w-8" />
              )}

              <div className="flex items-center gap-1.5 text-gray-900 font-bold text-sm sm:text-base">
                {step === "phone" && <Lock className="w-4 h-4 text-[#FF7A00]" />}
                {step === "confirmed" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>{getStepTitle()}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-SEGMENT PROGRESS BAR */}
            {step !== "confirmed" && (
              <div className="px-5 pb-3 shrink-0">
                <div className="grid grid-cols-3 gap-2">
                  {/* Segment 1: Phone */}
                  <div className="h-1 rounded-full bg-[#FF7A00] transition-colors duration-300" />
                  {/* Segment 2: OTP */}
                  <div
                    className={`h-1 rounded-full transition-colors duration-300 ${
                      step === "otp" || step === "checkout" ? "bg-[#FF7A00]" : "bg-gray-200"
                    }`}
                  />
                  {/* Segment 3: Delivery & Payment */}
                  <div
                    className={`h-1 rounded-full transition-colors duration-300 ${
                      step === "checkout" ? "bg-[#FF7A00]" : "bg-gray-200"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* SCROLLABLE BODY */}
            <div className="px-5 pb-6 overflow-y-auto space-y-4 flex-1">
              {/* ================= STEP 1: PHONE & ORDER SUMMARY ================= */}
              {step === "phone" && (
                <form
                  onSubmit={handleSendOtp}
                  name="quick-buy-auth-form"
                  autoComplete="on"
                  className="space-y-4 pt-1"
                >
                  {/* ORDER SUMMARY CARD */}
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-2.5">
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
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          {bundle.label || `Buy ${bundle.tier || 1}`} · Qty {quantity} · Free delivery
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm sm:text-base font-black text-gray-950">
                          ₹{effectiveTotal.toLocaleString()}
                        </p>
                        {regularTotal > effectiveTotal && (
                          <p className="text-[11px] text-gray-400 line-through">
                            ₹{regularTotal.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Auto-applied discount pill */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/90 border border-emerald-100/90 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11.5px]">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WELCOME50 auto-applied</span>
                      </span>
                      {mrpSavings > 0 && (
                        <span className="font-extrabold text-emerald-700 text-xs">
                          You save ₹{(mrpSavings + couponDiscount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Heading */}
                  <div className="pt-1">
                    <h3 className="text-base sm:text-lg font-bold font-display text-gray-900">
                      Enter your mobile number
                    </h3>
                  </div>

                  {/* Mobile input container */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone-number" className="sr-only">
                      Mobile Number
                    </label>
                    <div className="flex rounded-2xl border-2 border-gray-200 focus-within:border-[#FF7A00] focus-within:ring-2 focus-within:ring-[#FF7A00]/20 transition-all bg-white overflow-hidden shadow-2xs">
                      {/* IN +91 Pill */}
                      <div className="px-3.5 py-3.5 bg-gray-50 border-r border-gray-200 text-gray-900 font-bold text-sm flex items-center gap-1.5 select-none shrink-0">
                        <svg className="w-4 h-3 rounded-xs shrink-0 border border-gray-200/50" viewBox="0 0 640 480">
                          <path fill="#FF9933" d="M0 0h640v160H0z" />
                          <path fill="#FFFFFF" d="M0 160h640v160H0z" />
                          <path fill="#128807" d="M0 320h640v160H0z" />
                          <circle cx="320" cy="240" r="38" fill="none" stroke="#000088" strokeWidth="6" />
                          <circle cx="320" cy="240" r="8" fill="#000088" />
                        </svg>
                        <span>IN +91</span>
                      </div>

                      {/* Phone input */}
                      <input
                        ref={phoneInputRef}
                        id="phone-number"
                        name="phone"
                        type="tel"
                        autoComplete="tel tel-national"
                        inputMode="tel"
                        maxLength={16}
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-3.5 text-base sm:text-lg font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none tracking-wide"
                        aria-label="10-digit mobile number"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    )}
                  </div>

                  {/* Subline: WhatsApp note */}
                  <div className="flex items-start gap-2 text-[11.5px] text-gray-500 leading-snug pl-0.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                    <p>
                      6-digit verification code will be sent to your WhatsApp number.
                    </p>
                  </div>

                  {/* Continue Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || phone.length < 10}
                      className="w-full py-4 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-base shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <span>Continue</span>
                      )}
                    </button>
                  </div>

                  {/* Bottom Trust Badges */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-around text-[11px] font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>100% Secure</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Free Delivery</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5 text-blue-600" />
                      <span>COD Available</span>
                    </span>
                  </div>
                </form>
              )}

              {/* ================= STEP 2: 6-DIGIT WHATSAPP OTP VERIFICATION ================= */}
              {step === "otp" && (
                <div className="space-y-4 pt-1 text-center">
                  {/* WhatsApp green icon */}
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-[#25D366] flex items-center justify-center mx-auto shadow-inner">
                    <MessageCircle className="w-7 h-7 text-[#25D366]" />
                  </div>

                  {/* Heading & Subtitle */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                      Enter the 6-digit code
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ve sent a code on WhatsApp to
                    </p>

                    {/* Phone Pill with Change button */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-900 mx-auto mt-2 shadow-2xs">
                      <span>+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("phone");
                          setError(null);
                        }}
                        className="inline-flex items-center gap-0.5 text-[#FF7A00] hover:underline font-bold cursor-pointer ml-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Digit OTP Container */}
                  <div className="py-2">
                    <div className="relative max-w-[340px] mx-auto">
                      <input
                        ref={otpInputRef}
                        id="otp-code-input"
                        name="one-time-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otpCode}
                        onChange={handleOtpChange}
                        onFocus={() => setIsOtpFocused(true)}
                        onBlur={() => setIsOtpFocused(false)}
                        autoFocus
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer caret-transparent text-center select-none"
                        aria-label="6-digit verification code"
                      />

                      {/* 6 Visual Digit Boxes */}
                      <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 pointer-events-none">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const digit = otpCode[idx] || "";
                          const isCurrent = otpCode.length === idx;
                          return (
                            <div
                              key={idx}
                              className={`h-14 sm:h-16 rounded-xl sm:rounded-2xl border-2 text-xl sm:text-2xl font-black flex items-center justify-center transition-all ${
                                isVerified
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                  : error
                                  ? "border-rose-400 bg-rose-50/20 text-gray-900"
                                  : isCurrent && isOtpFocused
                                  ? "border-[#25D366] bg-emerald-50/30 ring-4 ring-emerald-500/15 text-gray-900"
                                  : digit
                                  ? "border-[#25D366] bg-emerald-50/15 text-gray-900"
                                  : "border-gray-200 bg-white text-gray-900"
                              }`}
                            >
                              {digit ? (
                                <span>{digit}</span>
                              ) : isCurrent && isOtpFocused ? (
                                <span className="w-0.5 h-6 bg-[#25D366] animate-pulse rounded-full" />
                              ) : (
                                <span className="opacity-0">0</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Verified Pill Animation */}
                    {isVerified && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mx-auto mt-3 animate-in zoom-in-95 duration-200">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Verified</span>
                      </div>
                    )}

                    {loading && !isVerified && (
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin text-[#25D366]" />
                        <span>Verifying code...</span>
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-rose-600 font-medium flex items-center justify-center gap-1 mt-3">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    )}
                  </div>

                  {/* Resend Code Timer */}
                  <div className="pt-1 text-xs text-gray-500">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="font-bold text-[#25D366] hover:underline cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Resend WhatsApp code</span>
                      </button>
                    ) : (
                      <span>Resend code in 0:{timer.toString().padStart(2, "0")}</span>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 3: DELIVERY DETAILS & PAYMENT ================= */}
              {step === "checkout" && (
                <div ref={addressScrollRef} className="space-y-4 pt-1">
                  {/* Auto-applied Coupon Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs shadow-2xs">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-900 text-[12px]">
                      <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>WELCOME50 applied · ₹50 saved ✓</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Auto-applied
                    </span>
                  </div>

                  {/* 1. DELIVERY ADDRESS SECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#FF7A00]" />
                        <span>Delivery Address</span>
                      </span>
                    </div>

                    {/* Verified phone pill with change button */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 text-xs">
                      <span className="flex items-center gap-2 font-bold text-gray-900">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-extrabold flex items-center gap-0.5 text-[11px]">
                          <Check className="w-3 h-3 stroke-[3]" /> Verified
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep("phone")}
                          className="text-[11.5px] text-[#FF7A00] font-bold hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Use my current location GPS button */}
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

                    {/* GPS Status feedback */}
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
                        className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold transition focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-500/15"
                      />
                    </div>
                  </div>

                  {/* 2. PAYMENT METHOD SECTION */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#FF7A00]" />
                        <span>Payment Method</span>
                      </span>
                    </div>

                    {/* Option 1: Pay Online (UPI / Card) */}
                    <div
                      onClick={() => setPaymentMethod("online")}
                      className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "online"
                          ? "border-[#FF7A00] bg-orange-50/25 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {/* Savings tag */}
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wide shadow-xs">
                        SAVE ₹{codFee}
                      </span>

                      <div className="flex items-start gap-3">
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
                              Pay Online (UPI / Card)
                            </h4>
                            <span className="text-sm font-black text-gray-950">
                              ₹{cartTotal.toLocaleString()}
                            </span>
                          </div>

                          {/* UPI Icons */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

                          <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                            ⚡ Instant confirmation · 🔒 Secured by Razorpay
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Cash on Delivery (COD) */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-[#FF7A00] bg-orange-50/25 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                            paymentMethod === "cod"
                              ? "border-[#FF7A00] bg-[#FF7A00]"
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
                          <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                            Includes ₹{codFee} COD handling fee
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* COD Advance notice box */}
                    {isCod && (
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs space-y-1.5 animate-in fade-in-50 duration-200">
                        <p className="text-amber-950 font-medium leading-relaxed">
                          💵 Pay <strong className="font-extrabold">₹{codFee} now</strong> to confirm (adjusted in total). Pay <strong className="font-extrabold">₹{doorstepBalance.toLocaleString()}</strong> in cash or UPI at delivery.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("online")}
                          className="text-[11.5px] font-extrabold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>💡 Pay online instead &amp; save ₹{codFee}</span>
                          <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3. PRICE DETAILS COLLAPSIBLE ACCORDION */}
                  <div className="pt-1">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsPriceDetailsOpen((prev) => !prev)}
                        className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-gray-900 cursor-pointer select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>Price Details</span>
                          <span className="text-[11px] text-gray-500 font-normal">
                            ({quantity} item{quantity > 1 ? "s" : ""})
                          </span>
                        </span>
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
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Coupon (WELCOME50)</span>
                            <span>−₹{couponDiscount}</span>
                          </div>
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
                            <span>Total Payable</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                          </div>
                          {totalSavings > 0 && (
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-center text-[11.5px] mt-2">
                              🎉 You save ₹{totalSavings.toLocaleString()} on this order!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission Error Banner */}
                  {orderError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* Support note */}
                  <p className="text-center text-[11px] text-gray-400 pt-1">
                    Zupe Store · Support +91 97441 22853
                  </p>
                </div>
              )}

              {/* ================= STEP 4: ORDER CONFIRMED! ================= */}
              {step === "confirmed" && (
                <div className="space-y-4 pt-3 text-center">
                  {/* Big Green Success Checkmark */}
                  <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-in zoom-in-75 duration-300">
                    <Check className="w-10 h-10 stroke-[3.5]" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black font-display text-gray-950">
                      Order placed! 🎉
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Your order <strong className="text-gray-900">#{confirmedOrderId}</strong> is confirmed.
                    </p>
                  </div>

                  {/* Order summary row card */}
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
                        💵 Keep <strong>₹{confirmedDoorstepDue.toLocaleString()}</strong> ready at delivery. We&apos;ll confirm on WhatsApp shortly.
                      </div>
                    )}
                  </div>

                  {/* Visual Shipping Progress Tracker */}
                  <div className="pt-2 px-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          ✓
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

            {/* STICKY BOTTOM FOOTER (For Step 3: Complete your order) */}
            {step === "checkout" && (
              <div className="p-4 bg-white border-t border-gray-100 shrink-0 space-y-2">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-4 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black text-base shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to gateway...</span>
                    </>
                  ) : isCod ? (
                    <span>Pay ₹{codFee} &amp; Place COD Order</span>
                  ) : (
                    <span>Place Order • ₹{grandTotal.toLocaleString()}</span>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 font-medium">
                  💬 Questions?{" "}
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
        </div>
      )}
    </AnimatePresence>
  );
}
