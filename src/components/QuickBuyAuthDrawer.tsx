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
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Refs for 4 OTP inputs
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setError(null);
      setIsVerified(false);
      setOtpDigits(["", "", "", ""]);
      setTimer(30);
      setCanResend(false);
      // Auto focus phone input
      setTimeout(() => {
        if (phoneInputRef.current) phoneInputRef.current.focus();
      }, 300);
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

  // WebOTP API: Auto-read incoming SMS OTP on mobile browsers (Android Chrome, etc.)
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
              const digits = content.code.replace(/\D/g, "").slice(0, 4).split("");
              if (digits.length === 4) {
                setOtpDigits(digits);
                triggerVerify(digits.join(""));
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

    setLoading(true);
    const res = await sendPhoneOtp(raw);
    setLoading(false);

    if (res.success) {
      setStep("otp");
      setOtpDigits(["", "", "", ""]);
      // If dev mode returns OTP for convenience
      if (res.otp && res.otp.length === 4) {
        // Optional prefill for dev fallback
      }
      setTimeout(() => {
        otpRefs[0]?.current?.focus();
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
      setOtpDigits(["", "", "", ""]);
      setTimeout(() => otpRefs[0]?.current?.focus(), 100);
    } else {
      setError(res.error || "Could not resend verification code. Please try again.");
    }
  };

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // Single digit input
    const char = clean.slice(-1);
    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    if (error) setError(null);

    // Auto advance to next input
    if (index < 3) {
      otpRefs[index + 1]?.current?.focus();
    }

    // Auto submit if 4th digit entered
    if (index === 3 || next.every((d) => d.length === 1)) {
      const fullCode = next.join("");
      if (fullCode.length === 4) {
        triggerVerify(fullCode);
      }
    }
  };

  // Handle Key Down (Backspace navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpRefs[index - 1]?.current?.focus();
      }
    }
  };

  // Handle Paste of OTP (e.g. 4 digits copied from SMS)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const chars = pasted.split("");
    const next = ["", "", "", ""];
    chars.forEach((c, i) => {
      if (i < 4) next[i] = c;
    });
    setOtpDigits(next);

    const focusIdx = Math.min(chars.length, 3);
    otpRefs[focusIdx]?.current?.focus();

    if (chars.length === 4) {
      triggerVerify(pasted);
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

      // Brief delay to show green "✓ Verified" pill, then complete
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
                <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
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

                      {/* Phone input with autofill */}
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-3.5 text-base sm:text-lg font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none tracking-wide"
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
                  </div>

                  {/* 4 Digit OTP Input Boxes */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-3 max-w-[280px] mx-auto" onPaste={handlePaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          autoComplete={idx === 0 ? "one-time-code" : "off"}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl border-2 text-2xl sm:text-3xl font-black text-center text-gray-900 focus:outline-none transition-all ${
                            isVerified
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : digit
                              ? "border-[#FF7A00] bg-orange-50/20"
                              : "border-gray-200 bg-white focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-500/15"
                          }`}
                        />
                      ))}
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
