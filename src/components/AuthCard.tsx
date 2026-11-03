"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RotateCcw,
  MessageCircle,
  Clock,
  ShieldCheck,
  Zap,
  Truck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/config/siteConfig";

export interface AuthCardProps {
  isModal?: boolean;
  onClose?: () => void;
  initialMode?: "login" | "signup";
  notice?: string | null;
  redirectUrl?: string;
  onSuccess?: (user: any) => void;
  showBadges?: boolean;
}

export function AuthCard({
  isModal = false,
  onClose,
  notice,
  redirectUrl = "/",
  onSuccess,
}: AuthCardProps) {
  const router = useRouter();
  const { sendWhatsAppOtp, loginWithWhatsApp } = useAuth();

  // Step 1: "phone", Step 2: "otp"
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState(180); // 3 minutes = 180s

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Timer: 3-minute code expiry countdown
  useEffect(() => {
    if (step !== "otp") return;

    const interval = setInterval(() => {
      setExpiryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Format seconds to mm:ss (e.g. 180s -> 03:00)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean and format phone number input: strictly 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");

    if (val.startsWith("91") && val.length > 10) {
      val = val.slice(2);
    }
    if (val.startsWith("0")) {
      val = val.replace(/^0+/, "");
    }
    if (val.length > 10) {
      val = val.slice(0, 10);
    }

    setPhone(val);
    if (error) setError(null);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

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
    const res = await sendWhatsAppOtp(raw);
    setLoading(false);

    if (res.success) {
      setStep("otp");
      setExpiryCountdown(180);
      if (res.otp) {
        setOtp(res.otp);
      }
      if (res.isExistingUser) {
        setIsExistingUser(true);
        if (res.name) {
          setName(res.name);
        }
      } else {
        setIsExistingUser(false);
      }
      setSuccess("Verification code sent successfully to WhatsApp!");
    } else {
      setError(res.error || "Failed to send verification code. Please try again.");
    }
  };

  // Step 2: Verify OTP & Sign In / Register
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (expiryCountdown <= 0) {
      setError("Verification code has expired (3 minutes passed). Please tap Resend code.");
      return;
    }

    if (!otp.trim() || otp.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    const res = await loginWithWhatsApp(phone, otp.trim(), name);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Invalid verification code. Please try again.");
      return;
    }

    setSuccess(res.isNew ? "Account created successfully!" : "Signed in successfully!");

    if (onSuccess) {
      onSuccess(res);
    }

    if (isModal) {
      if (onClose) onClose();
      if (redirectUrl && redirectUrl !== "/") {
        setTimeout(() => {
          router.push(redirectUrl);
        }, 150);
      }
    } else {
      setTimeout(() => {
        window.location.href = redirectUrl || "/";
      }, 400);
    }
  };

  return (
    <div className="w-full relative font-sans">
      {/* Notice Banner */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-blue-50 text-blue-950 border border-blue-200 shadow-sm flex items-start gap-3 relative overflow-hidden"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFBE00] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            !
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Sign In Required
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
              {notice}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Form Card - Sleek Tech Electronics aesthetic matching Home Page */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Brand Top Header Banner */}
        <div className="bg-gradient-to-r from-[#0A2540] via-[#0F172A] to-[#0A2540] px-6 py-4 border-b border-slate-800 relative flex items-center justify-center">
          <div className="flex items-center justify-center py-1">
            <Image
              src={siteConfig.logoUrl}
              alt={siteConfig.name}
              width={140}
              height={42}
              className="h-8 w-auto object-contain drop-shadow-md brightness-105"
              priority
            />
          </div>

          {/* Close Button for Modal */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7 relative">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#0047AB] font-bold text-[11px] uppercase tracking-wider mb-2">
              {step === "phone" ? "Dubai Sourced Electronics" : "Quick Verification"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {step === "phone" ? (
                <>Welcome to {siteConfig.name}</>
              ) : (
                "Enter Verification Code"
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed max-w-sm mx-auto">
              {step === "phone"
                ? "Enter your 10-digit mobile number to sign in or create an account"
                : `Enter the 6-digit code sent to +91 ${phone.length === 10 ? phone.slice(0, 5) + " " + phone.slice(5) : phone}`}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Alert */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* STEP 1: Phone Entry */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    10-digit number
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold select-none shrink-0 shadow-sm">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      autoFocus
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full mt-3 py-3 px-5 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-sm tracking-wide shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Trust badges footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 100% Genuine
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> All-India Delivery
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Year Warranty
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Phone Info & Change button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    +91 {phone.length === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-bold text-xs text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Code
                  </label>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {expiryCountdown > 0 ? (
                        <>Expires in <span className="font-mono text-blue-600 font-bold">{formatTime(expiryCountdown)}</span></>
                      ) : (
                        <span className="text-red-600 font-bold">Code Expired</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(digits);
                      if (error) setError(null);
                    }}
                    className="w-full text-center tracking-[0.5em] text-xl font-mono font-black py-3 rounded-xl border border-slate-200 text-slate-900 bg-white placeholder:text-slate-300 placeholder:tracking-widest focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
                  />
                </div>

                {/* Resend button */}
                <div className="flex items-center justify-end mt-1.5">
                  <button
                    type="button"
                    disabled={loading || expiryCountdown > 120}
                    onClick={() => handleSendOtp()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {expiryCountdown > 120
                        ? `Resend in ${expiryCountdown - 120}s`
                        : "Resend Code"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Optional Name field for new user */}
              {!isExistingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Full Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || otp.length < 6 || expiryCountdown <= 0}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-sm tracking-wide shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* WhatsApp helper */}
              <div className="pt-2 text-center">
                <a
                  href="https://wa.me/916238165935?text=Hi"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setExpiryCountdown(0);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Didn&apos;t get code? Tap to send &ldquo;Hi&rdquo; on WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
