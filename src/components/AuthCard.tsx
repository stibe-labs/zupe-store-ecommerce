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
  Sparkles,
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
    <div className="w-full relative font-mograph">
      {/* Notice Banner */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-[#F4FBE8] text-[#2E4D12] border border-[#95CF42]/40 shadow-xs flex items-start gap-3 relative overflow-hidden font-mograph"
        >
          <div className="w-7 h-7 rounded-full bg-[#95CF42] text-black font-bold text-sm flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-mograph">
            !
          </div>
          <div className="flex-1 min-w-0 font-mograph">
            <h4 className="text-xs font-bold text-neutral-900 font-mograph">
              Sign In Required
            </h4>
            <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed font-normal">
              {notice}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Form Card - Vittal Lifestyle luxury aesthetic */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xl relative overflow-hidden transition-all duration-300 font-mograph">
        {/* Brand Top Header Banner */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1a1c17] to-[#111111] px-6 py-4 border-b border-neutral-800 relative flex items-center justify-center">
          <div className="flex items-center justify-center py-1">
            <Image
              src={siteConfig.logoUrl}
              alt={siteConfig.name}
              width={140}
              height={42}
              className="h-8 w-auto object-contain brightness-105"
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
        <div className="p-6 sm:p-7 relative font-mograph">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F4FBE8] border border-[#95CF42]/40 text-[#3D6318] font-semibold text-[11px] mb-2 font-mograph">
              {step === "phone" ? "100% Authentic Vittal Lifestyle" : "Quick Verification"}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-mograph">
              {step === "phone" ? (
                <>Welcome to {siteConfig.name}</>
              ) : (
                "Enter Verification Code"
              )}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal leading-relaxed max-w-sm mx-auto">
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
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2.5 shadow-xs"
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
              className="mb-4 p-3 rounded-xl bg-[#F4FBE8] border border-[#95CF42]/40 text-[#3D6318] text-xs font-bold flex items-center gap-2.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#6B9E3A]" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* STEP 1: Phone Entry */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mograph">
                  <label className="block text-xs font-bold text-neutral-700 font-mograph">
                    Mobile Number
                  </label>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    10-digit number
                  </span>
                </div>
                <div className="flex gap-2 font-mograph">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-neutral-200 bg-[#FAFCF6] text-neutral-900 text-sm font-bold select-none shrink-0 shadow-xs">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold text-neutral-900 bg-white placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-[#95CF42] focus:ring-4 focus:ring-[#95CF42]/20 shadow-xs transition-all font-mograph"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full mt-3 py-3 px-5 rounded-full bg-[#95CF42] hover:bg-[#85BE33] active:bg-[#78AC2C] text-black font-bold text-sm font-mograph shadow-md hover:shadow-lg hover:shadow-[#95CF42]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#F4FBE8] border border-[#95CF42]/30 text-[#3D6318] font-bold text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6B9E3A]" /> 100% Lab Tested
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F4FBE8] border border-[#95CF42]/30 text-[#3D6318] font-bold text-[11px] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#6B9E3A]" /> Pan-India Air Logistics
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F4FBE8] border border-[#95CF42]/30 text-[#3D6318] font-bold text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6B9E3A]" /> Direct Farm Fresh
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Phone Info & Change button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFCF6] border border-neutral-200 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#6B9E3A]" />
                  <span className="font-bold text-neutral-900 text-sm">
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
                  className="font-bold text-xs text-[#3D6318] hover:text-[#6B9E3A] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* OTP Input */}
              <div className="font-mograph">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700 font-mograph">
                    6-Digit Code
                  </label>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 font-mograph">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {expiryCountdown > 0 ? (
                        <>Expires in <span className="font-mono text-[#3D6318] font-bold">{formatTime(expiryCountdown)}</span></>
                      ) : (
                        <span className="text-red-600 font-bold">Code Expired</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="relative font-mograph">
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
                    className="w-full text-center tracking-[0.5em] text-xl font-mono font-black py-3 rounded-xl border border-neutral-300 text-neutral-900 bg-white placeholder:text-neutral-300 placeholder:tracking-widest focus:outline-none focus:border-[#95CF42] focus:ring-4 focus:ring-[#95CF42]/20 shadow-xs transition-all font-mograph"
                  />
                </div>

                {/* Resend button */}
                <div className="flex items-center justify-end mt-1.5 font-mograph">
                  <button
                    type="button"
                    disabled={loading || expiryCountdown > 120}
                    onClick={() => handleSendOtp()}
                    className="text-xs font-bold text-[#3D6318] hover:text-[#6B9E3A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer font-mograph"
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
                <div className="font-mograph">
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                    Your Full Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative font-mograph">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-[#95CF42] focus:ring-4 focus:ring-[#95CF42]/20 shadow-xs transition-all font-mograph"
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || otp.length < 6 || expiryCountdown <= 0}
                className="w-full mt-2 py-3 px-4 rounded-full bg-[#95CF42] hover:bg-[#85BE33] active:bg-[#78AC2C] text-black font-bold text-sm font-mograph shadow-md hover:shadow-lg hover:shadow-[#95CF42]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* WhatsApp helper */}
              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setExpiryCountdown(0);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#3D6318] font-bold bg-[#F4FBE8] hover:bg-[#E2F5B4] border border-[#95CF42]/40 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
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