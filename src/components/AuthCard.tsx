"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Sparkles,
  X,
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
  initialMode = "login",
  notice,
  redirectUrl = "/",
  onSuccess,
  showBadges = false,
}: AuthCardProps) {
  const { login, register, sendOtp } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync mode if initialMode prop changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
    }
  }, [initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await sendOtp(email, name);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpCountdown(45);
      if (res.otp) {
        setOtp(res.otp);
        setOtpMessage(`Code: ${res.otp} (Auto-filled)`);
        setSuccess(`Verification code ${res.otp} generated & auto-filled!`);
      } else {
        setOtpMessage(res.message || "OTP code sent to email!");
        setSuccess("Verification code sent! Please check your inbox & spam folder.");
      }
    } else {
      setError(res.error || "Failed to send verification code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Invalid email or password");
      } else {
        setSuccess("Signed in successfully!");
        if (onSuccess) {
          onSuccess(res);
        }
        if (isModal) {
          if (onClose) onClose();
        } else {
          setTimeout(() => {
            window.location.href = redirectUrl || "/";
          }, 350);
        }
      }
    } else {
      if (!otp) {
        setError("Please enter the verification code sent to your email");
        setLoading(false);
        return;
      }
      const res = await register(name, email, password, otp);
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Account creation failed. Please check your verification code.");
      } else {
        setSuccess("Account created successfully!");
        if (onSuccess) {
          onSuccess(res);
        }
        if (isModal) {
          if (onClose) onClose();
        } else {
          setTimeout(() => {
            window.location.href = redirectUrl || "/";
          }, 350);
        }
      }
    }
  };

  return (
    <div className="w-full relative">
      {/* Notice Banner */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-[#FF7A00]/30 shadow-xs flex items-start gap-3"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center flex-shrink-0 text-[#FF7A00] mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wide">
              Sign In Required
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {notice}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8 relative">
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
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
            {mode === "login" ? "Welcome Back" : "Join Zupe Store"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            {mode === "login"
              ? "Sign in to complete purchases, access cart & save favorites"
              : "Create your account for faster checkouts and synced wishlist"}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Create Account
          </button>
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
            className="mb-5 p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
              />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email Verification (OTP)
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || otpCountdown > 0}
                  className="text-xs font-bold text-[#FF7A00] hover:underline disabled:text-gray-400 cursor-pointer"
                >
                  {otpCountdown > 0
                    ? `Resend code in ${otpCountdown}s`
                    : otpSent
                    ? "Resend code"
                    : "Send code"}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="6-digit OTP (or use 123456)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] tracking-widest transition-all"
                />
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center min-w-[100px] cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
                  </button>
                ) : (
                  <div className="px-3 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1 min-w-[100px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sent</span>
                  </div>
                )}
              </div>
              {otpMessage ? (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {otpMessage}
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Click &ldquo;Send code&rdquo; above. Code will be auto-filled or use <strong>123456</strong> for instant testing.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={mode === "login" ? "Enter your password" : "Create a password (min 6 chars)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm shadow-lg shadow-[#FF7A00]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Sign In & Continue" : "Create Account & Continue"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {mode === "login" ? "Don't have an account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setSuccess(null);
              }}
              className="font-bold text-[#FF7A00] hover:underline ml-1 cursor-pointer"
            >
              {mode === "login" ? "Create one now" : "Sign in here"}
            </button>
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
