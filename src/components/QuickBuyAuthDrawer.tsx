"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  onSuccess: (verifiedPhone: string) => void;
}

export function QuickBuyAuthDrawer({
  isOpen,
  onClose,
  product,
  bundle,
  quantity,
  onSuccess,
}: QuickBuyAuthDrawerProps) {
  const { sendPhoneOtp, loginWithPhoneOtp } = useAuth();

  // Step 1: "phone", Step 2: "otp"
  const [step, setStep] = useState<"phone" | "otp">("phone");
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

  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpFocused, setIsOtpFocused] = useState<boolean>(false);
  const [testOtp, setTestOtp] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Initialize and check prefilled phone on drawer open
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setError(null);
      setIsVerified(false);
      setOtpCode("");
      setTimer(30);
      setCanResend(false);

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
        } catch {}
      }

      // Auto focus phone input
      setTimeout(() => {
        if (phoneInputRef.current) phoneInputRef.current.focus();
      }, 250);
    }
  }, [isOpen]);

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

  // WebOTP API: Auto-read incoming carrier SMS OTP on mobile browsers (Android Chrome, etc.)
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
              const digits = content.code.replace(/\D/g, "").slice(0, 4);
              if (digits.length === 4) {
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

  // Clean and format phone number input with support for Chrome Autofill (+91 / spaces / 0)
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

    // Persist phone for convenience
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
      setCodeSent(res.codeSent ?? true);
      setTestOtp(!res.codeSent && res.otp ? res.otp : null);
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
      setCodeSent(res.codeSent ?? true);
      setTestOtp(!res.codeSent && res.otp ? res.otp : null);
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } else {
      setError(res.error || "Could not resend verification code. Please try again.");
    }
  };

  // Handle OTP master input change (supports typing, paste, Gboard chip, and iOS QuickType)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 4);
    setOtpCode(clean);
    if (error) setError(null);

    // Auto submit immediately upon 4th digit entered
    if (clean.length === 4) {
      triggerVerify(clean);
    }
  };

  // Step 2: Trigger Verify OTP
  const triggerVerify = async (code: string) => {
    if (code.length !== 4) return;
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithPhoneOtp(phone, code);
      if (!res.success) {
        setLoading(false);
        setError(res.error || "Invalid verification code. Please check and retry.");
        return;
      }

      // Success!
      setIsVerified(true);
      setLoading(false);

      // Brief delay to display green "✓ Verified" pill, then complete
      setTimeout(() => {
        onSuccess(phone);
      }, 450);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Verification failed. Please try again.");
    }
  };

  // Pricing calculations for order summary card
  const regularUnitPrice = product.original_price || product.mrp || product.price;
  const effectiveTotal = bundle.totalPrice || bundle.unitPrice * quantity || product.price * quantity;
  const regularTotal = regularUnitPrice * quantity;
  const savings = bundle.savings > 0 ? bundle.savings : Math.max(0, regularTotal - effectiveTotal);
  const displayImage = product.selectedImage || product.poster_image;

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
            className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Mobile Top Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* TOP BAR: Navigation + Title + Close Button */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
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
              ) : (
                <div className="w-8" />
              )}

              <div className="flex items-center gap-1.5 text-gray-900 font-bold text-sm sm:text-base">
                {step === "phone" ? (
                  <>
                    <Lock className="w-4 h-4 text-[#FF7A00]" />
                    <span>Secure checkout</span>
                  </>
                ) : (
                  <span>Verify your number</span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-SEGMENT PROGRESS BAR (Matches Mockup) */}
            <div className="px-5 pb-3">
              <div className="grid grid-cols-3 gap-2">
                {/* Segment 1: Phone */}
                <div
                  className={`h-1 rounded-full transition-colors duration-300 ${
                    step === "phone" || step === "otp" ? "bg-[#FF7A00]" : "bg-gray-200"
                  }`}
                />
                {/* Segment 2: OTP */}
                <div
                  className={`h-1 rounded-full transition-colors duration-300 ${
                    step === "otp" ? "bg-[#FF7A00]" : "bg-gray-200"
                  }`}
                />
                {/* Segment 3: Delivery (Reached next at checkout) */}
                <div className="h-1 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="px-5 pb-6 overflow-y-auto space-y-4">
              {step === "phone" ? (
                /* ================= STEP 1: PHONE & ORDER SUMMARY ================= */
                <form
                  onSubmit={handleSendOtp}
                  name="quick-buy-auth-form"
                  autoComplete="on"
                  className="space-y-4 pt-1"
                >
                  {/* ORDER SUMMARY CARD (Matches Mockup Reference 2) */}
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
                      {savings > 0 && (
                        <span className="font-extrabold text-emerald-700 text-xs">
                          You save ₹{savings.toLocaleString()}
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

                      {/* Phone input with full autofill support (tel & tel-national) */}
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
                      Order confirmation &amp; delivery updates on WhatsApp. No spam. Only order updates.
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
              ) : (
                /* ================= STEP 2: 4-DIGIT OTP VERIFICATION ================= */
                <div className="space-y-4 pt-1 text-center">
                  {/* WhatsApp speech bubble icon */}
                  <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 text-[#FF7A00] flex items-center justify-center mx-auto shadow-inner">
                    <MessageCircle className="w-7 h-7 text-[#FF7A00]" />
                  </div>

                  {/* Heading & Subtitle */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                      Enter the 4-digit code
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ve sent a code to
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

                    {/* Gateway Notice / Fallback if Fast2SMS has low funds */}
                    {!codeSent && testOtp && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium text-center mt-2.5 max-w-[280px] mx-auto animate-in fade-in">
                        <span className="text-amber-800">SMS wallet balance low. Use code: </span>
                        <strong className="font-mono font-black text-amber-950 text-sm tracking-wider underline">{testOtp}</strong>
                      </div>
                    )}
                  </div>

                  {/* 4 Digit OTP Container: Real Master Input for Autofill + 4 Visual Boxes */}
                  <div className="py-2">
                    <div className="relative max-w-[280px] mx-auto">
                      {/* Master input receiving Android Gboard, iOS QuickType, and WebOTP auto-fill */}
                      <input
                        ref={otpInputRef}
                        id="otp-code-input"
                        name="one-time-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={otpCode}
                        onChange={handleOtpChange}
                        onFocus={() => setIsOtpFocused(true)}
                        onBlur={() => setIsOtpFocused(false)}
                        autoFocus
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer caret-transparent text-center select-none"
                        aria-label="4-digit verification code"
                      />

                      {/* 4 Visual Digit Boxes (Matches Mockup 1:1) */}
                      <div className="grid grid-cols-4 gap-3 pointer-events-none">
                        {[0, 1, 2, 3].map((idx) => {
                          const digit = otpCode[idx] || "";
                          const isCurrent = otpCode.length === idx;
                          return (
                            <div
                              key={idx}
                              className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl border-2 text-2xl sm:text-3xl font-black flex items-center justify-center transition-all ${
                                isVerified
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                  : error
                                  ? "border-rose-400 bg-rose-50/20 text-gray-900"
                                  : isCurrent && isOtpFocused
                                  ? "border-[#FF7A00] bg-orange-50/25 ring-4 ring-orange-500/15 text-gray-900"
                                  : digit
                                  ? "border-[#FF7A00] bg-orange-50/10 text-gray-900"
                                  : "border-gray-200 bg-white text-gray-900"
                              }`}
                            >
                              {digit ? (
                                <span>{digit}</span>
                              ) : isCurrent && isOtpFocused ? (
                                <span className="w-0.5 h-7 bg-[#FF7A00] animate-pulse rounded-full" />
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
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF7A00]" />
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
                        className="font-bold text-[#FF7A00] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    ) : (
                      <span>Resend code in 0:{timer.toString().padStart(2, "0")}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
