"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Sparkles,
  ShieldCheck,
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
  const [expiryCountdown, setExpiryCountdown] = useState(180); // 3 minutes = 180s real validity

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
    let val = e.target.value.replace(/\D/g, ""); // only digits

    // If pasted with country code 91 (e.g. 919746301360)
    if (val.startsWith("91") && val.length > 10) {
      val = val.slice(2);
    }
    // If user enters leading 0 (e.g. 09746301360)
    if (val.startsWith("0")) {
      val = val.replace(/^0+/, "");
    }
    // Limit strictly to 10 digits
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
      setExpiryCountdown(180); // 3 minutes = 180s live countdown
      if (res.otp) {
        setOtp(res.otp);
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
    } else {
      setTimeout(() => {
        window.location.href = redirectUrl || "/";
      }, 400);
    }
  };

  return (
    <div className="w-full relative">
      {/* Notice Banner - matching Section 4 warning banner aesthetic */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-2xl bg-[#5b1420] text-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] flex items-start gap-3.5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-[#fed000] text-black font-black text-base flex items-center justify-center shrink-0 border border-stone-900 shadow-sm mt-0.5">
            !
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-tj-serif text-xs font-black text-[#fed000] uppercase tracking-wider">
                Sign In Required
              </h4>
              <span className="text-xs">🔒</span>
            </div>
            <p className="text-xs text-stone-200 mt-0.5 leading-relaxed font-medium">
              {notice}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Form Card - Neo-brutalist Turkiye Jam retro card */}
      <div className="bg-[#fffdfa] rounded-3xl border-2 border-stone-800 shadow-[0_10px_0_0_#2b2b2b] relative overflow-hidden transition-all duration-300">
        {/* Brand Wine Top Header Banner */}
        <div className="bg-[#5b1420] px-6 py-4 border-b-2 border-stone-800 relative flex items-center justify-center">
          <div className="flex items-center justify-center py-0.5">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              width={140}
              height={42}
              className="h-8 w-auto object-contain drop-shadow-md"
              priority
            />
          </div>

          {/* Close Button for Modal */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#fed000] hover:bg-[#e6bc00] text-black border-2 border-stone-800 shadow-[0_2px_0_0_#2b2b2b] active:translate-y-0.5 active:shadow-none flex items-center justify-center transition-all cursor-pointer font-bold"
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
            <p className="font-tj-serif italic text-xs sm:text-sm text-[#8e1c2e] font-semibold">
              {step === "phone" ? "authentic royal macun" : "quick verification"}
            </p>
            <h2 className="font-tj-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
              {step === "phone" ? (
                <>
                  Welcome to <span className="text-[#8e1c2e] italic">Turkiye Jam</span>
                </>
              ) : (
                "Enter Verification Code"
              )}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 font-medium leading-relaxed max-w-sm mx-auto">
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
              className="mb-5 p-3.5 rounded-2xl bg-red-50 border-2 border-red-800 text-red-900 text-xs font-bold flex items-center gap-2.5 shadow-[0_2px_0_0_#991b1b]"
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
              className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-800 text-emerald-950 text-xs font-bold flex items-center gap-2.5 shadow-[0_2px_0_0_#065f46]"
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
                  <label className="block font-tj-serif text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <span className="text-[11px] font-semibold text-stone-400">
                    10-digit mobile number
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl border-2 border-stone-800 bg-[#fed000] text-black text-sm font-black select-none shrink-0 shadow-[0_2px_0_0_#2b2b2b]">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
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
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-800 text-sm font-bold tracking-wide text-stone-900 bg-white placeholder:text-stone-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#731a26] shadow-[0_2px_0_0_#2b2b2b] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="btn-shimmer w-full mt-3 py-3.5 px-5 rounded-2xl bg-[#fed000] hover:bg-[#e6bc00] text-black font-extrabold font-tj-serif text-base border-2 border-stone-800 shadow-[0_5px_0_0_#2b2b2b] hover:shadow-[0_6px_0_0_#2b2b2b] active:translate-y-1 active:shadow-[0_1px_0_0_#2b2b2b] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Trust badges footer */}
              <div className="mt-6 pt-4 border-t-2 border-stone-200/80 flex items-center justify-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-[#f8bac5] border border-stone-800 text-stone-900 font-bold text-[10px] sm:text-[11px] shadow-xs">
                  🌿 100% Herbal
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#b9e5e9] border border-stone-800 text-stone-900 font-bold text-[10px] sm:text-[11px] shadow-xs">
                  📦 All-India Delivery
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#fed000] border border-stone-800 text-black font-bold text-[10px] sm:text-[11px] shadow-xs">
                  🔒 Official Store
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Phone Info & Change button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fdf2f4] border-2 border-stone-800 text-xs shadow-[0_2px_0_0_#2b2b2b]">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#731a26]" />
                  <span className="font-tj-serif font-black text-stone-900 text-sm">
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
                  className="font-bold text-xs text-[#731a26] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block font-tj-serif text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-800 text-center text-2xl font-mono tracking-[0.4em] font-black text-stone-900 bg-white placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#731a26] shadow-[0_2px_0_0_#2b2b2b] transition-all"
                />

                {/* 3-Minute Code Expiration Countdown */}
                <div className="flex items-center justify-between text-xs px-1 pt-2.5 min-h-[28px]">
                  {expiryCountdown > 0 ? (
                    <div className="flex items-center gap-1.5 font-medium text-stone-700">
                      <Clock className={`w-3.5 h-3.5 ${expiryCountdown > 30 ? "text-emerald-700" : "text-amber-600"}`} />
                      <span>
                        Code valid for:{" "}
                        <strong className="text-stone-900 font-mono font-bold">
                          {formatTime(expiryCountdown)}
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-red-600 font-bold">Code expired</span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="text-xs font-extrabold text-[#731a26] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend code</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Full Name */}
              <div>
                <label className="block font-tj-serif text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Your Full Name <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-800 text-sm font-semibold text-stone-900 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#731a26] shadow-[0_2px_0_0_#2b2b2b] transition-all"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || otp.length < 6 || expiryCountdown <= 0}
                className="btn-shimmer w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#fed000] hover:bg-[#e6bc00] text-black font-extrabold font-tj-serif text-base border-2 border-stone-800 shadow-[0_5px_0_0_#2b2b2b] hover:shadow-[0_6px_0_0_#2b2b2b] active:translate-y-1 active:shadow-[0_1px_0_0_#2b2b2b] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
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
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-800 px-3.5 py-1.5 rounded-full shadow-[0_2px_0_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
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
