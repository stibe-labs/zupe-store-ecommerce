"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

  // Step 1: Send OTP
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
      if (res.otp) {
        setOtp(res.otp);
      }
      setSuccess("Verification code sent successfully!");
    } else {
      setError(res.error || "Failed to send verification code. Please try again.");
    }
  };

  // Step 2: Verify OTP & Sign In / Register
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
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
            <AlertCircle className="w-4 h-4" />
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
        {/* Subtle decorative glow matching brand colors */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

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

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 tracking-tight">
            {step === "phone" ? "Welcome to Zupe Store" : "Enter Verification Code"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            {step === "phone"
              ? "Enter your mobile number to sign in or create an account"
              : `Enter the 6-digit code sent to ${phone}`}
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
                Mobile Number
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
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm shadow-lg shadow-[#FF7A00]/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
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
                <Phone className="w-4 h-4 text-[#FF7A00]" />
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
                Change
              </button>
            </div>

            {/* OTP Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading || countdown > 0}
                  className="text-xs font-bold text-[#FF7A00] hover:underline disabled:text-gray-400 cursor-pointer flex items-center gap-1"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-xl font-mono tracking-[0.4em] font-bold text-gray-900 bg-white placeholder:text-gray-300 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
              />
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
                  <span>Verify & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick helper if user has not yet interacted with WhatsApp number */}
            <div className="pt-2 text-center">
              <a
                href="https://wa.me/919778137954?text=Hi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Didn&apos;t get code? Tap to send &ldquo;Hi&rdquo; on WhatsApp</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
