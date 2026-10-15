"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Sparkles,
  X,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Clean WhatsApp SVG icon
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 17.85c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a7.87 7.87 0 0 1-1.2-4.18c0-4.36 3.55-7.91 7.91-7.91 2.11 0 4.1.82 5.6 2.31a7.86 7.86 0 0 1 2.31 5.6c0 4.36-3.55 7.91-7.91 7.91zm4.33-5.93c-.24-.12-1.4-.69-1.62-.77-.22-.08-.37-.12-.53.12-.16.24-.61.77-.75.93-.14.16-.28.18-.51.06-.24-.12-1-.37-1.91-1.18-.7-.63-1.18-1.4-1.32-1.64-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.27-.72-1.74-.19-.46-.39-.4-.53-.41h-.45c-.16 0-.41.06-.63.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.25 1.02.4 1.37.52.58.18 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.13.2-.55.2-1.02.14-1.13-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

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
  showBadges = false,
}: AuthCardProps) {
  const { sendWhatsAppOtp, loginWithWhatsApp } = useAuth();

  // Step 1: "phone", Step 2: "otp"
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clean and format phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d\s+-]/g, "");
    setPhone(val);
  };

  // Step 1: Send OTP via WhatsApp
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    const raw = phone.replace(/[^\d]/g, "");
    if (raw.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const res = await sendWhatsAppOtp(phone);
    setLoading(false);

    if (res.success) {
      setStep("otp");
      setCountdown(45);
      setStatusMessage(res.message || "OTP code sent to your WhatsApp!");
      if (res.otp) {
        setOtp(res.otp);
        setSuccess(`Verification code ${res.otp} auto-filled for instant testing!`);
      } else {
        setSuccess("Verification code sent to WhatsApp! Please check your messages.");
      }
    } else {
      setError(res.error || "Failed to send WhatsApp verification code");
    }
  };

  // Step 2: Verify OTP & Sign In / Register
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp.trim()) {
      setError("Please enter the 6-digit code received on WhatsApp.");
      return;
    }

    setLoading(true);
    const res = await loginWithWhatsApp(phone, otp.trim(), name);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Invalid verification code. Please try again.");
      return;
    }

    setSuccess(res.isNew ? "Welcome to Zupe Store! Account created." : "Signed in successfully!");

    if (onSuccess) {
      onSuccess(res);
    }

    if (isModal) {
      if (onClose) onClose();
    } else {
      setTimeout(() => {
        window.location.href = redirectUrl || "/";
      }, 400);
    }
  };

  return (
    <div className="w-full relative">
      {/* Notice Banner */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-2xl bg-amber-50/95 border border-[#FF7A00]/30 shadow-xs flex items-start gap-3"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center flex-shrink-0 text-[#FF7A00] mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wide">
              Sign In Required
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notice}</p>
          </div>
        </motion.div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button for Modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-20 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* WhatsApp Verified Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] text-[11px] font-bold tracking-wide">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span>Instant Login with WhatsApp</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 tracking-tight">
            {step === "phone" ? "Welcome to Zupe Store" : "Enter Verification Code"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            {step === "phone"
              ? "No password needed. We'll send a 6-digit OTP to your WhatsApp."
              : `Code sent via WhatsApp to ${phone}. Enter below to continue.`}
          </p>
        </div>

        {/* Error & Success Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* STEP 1: Phone Entry */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                WhatsApp Phone Number
              </label>
              <div className="flex gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm font-semibold select-none flex-shrink-0">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="e.g. 98765 43210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#25D366]" />
                <span>One-click passwordless login. Works for new & existing accounts.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0F7569] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <WhatsAppIcon className="w-5 h-5 fill-white" />
                  <span>Get WhatsApp OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Phone Info & Change button */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
                <span className="font-semibold text-gray-800">{phone}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[#FF7A00] font-bold hover:underline cursor-pointer"
              >
                Change Number
              </button>
            </div>

            {/* OTP Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading || countdown > 0}
                  className="text-xs font-bold text-[#25D366] hover:underline disabled:text-gray-400 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </span>
                </button>
              </div>

              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-xl font-mono tracking-[0.4em] font-bold text-gray-900 bg-white placeholder:text-gray-300 focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tip: Use verification code <strong>123456</strong> for instant testing.
              </p>
            </div>

            {/* Optional Full Name (for new customer personalization) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Your Full Name <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm shadow-lg shadow-[#FF7A00]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verify & Access Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Admin Login Portal Link */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Store staff or administrator?{" "}
            <Link
              href="/admin/login"
              className="font-bold text-gray-900 hover:text-[#FF7A00] inline-flex items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-3 h-3 text-[#FF7A00]" />
              <span>Admin Login Portal</span>
            </Link>
          </p>
        </div>
      </div>

      {/* Value Badges (Shown when showBadges is true, e.g. on full page) */}
      {showBadges && (
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-gray-100 shadow-2xs">
            <ShoppingBag className="w-4 h-4 mx-auto text-[#FF7A00] mb-1.5" />
            <p className="text-[11px] font-bold text-gray-800">Saved Cart</p>
            <p className="text-[10px] text-gray-400">Syncs on any device</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-gray-100 shadow-2xs">
            <Heart className="w-4 h-4 mx-auto text-pink-500 mb-1.5" />
            <p className="text-[11px] font-bold text-gray-800">Wishlist Sync</p>
            <p className="text-[10px] text-gray-400">Save for later</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-gray-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600 mb-1.5" />
            <p className="text-[11px] font-bold text-gray-800">Fast Checkout</p>
            <p className="text-[10px] text-gray-400">Secure order tracking</p>
          </div>
        </div>
      )}
    </div>
  );
}
