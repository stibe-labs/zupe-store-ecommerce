"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, login, register, sendOtp } = useAuth();

  const redirectUrl = searchParams.get("redirect") || searchParams.get("returnUrl") || "/";
  const urlNotice = searchParams.get("notice") || searchParams.get("msg");

  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
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

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, authLoading, user, redirectUrl, router]);

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
        setSuccess("Verification code sent! Check your inbox.");
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
        setSuccess("Signed in successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = redirectUrl || "/";
        }, 400);
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
        setError(res.error || "Account creation failed. Please check your OTP.");
      } else {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = redirectUrl || "/";
        }, 400);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA521C]" />
          <p className="text-sm font-semibold text-gray-500">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between selection:bg-[#FA521C]/20 selection:text-[#FA521C]">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <Image
              src="/zupe-logo.png"
              alt="Zupe Store"
              width={36}
              height={36}
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="font-display font-black text-xl text-gray-900 tracking-tight">
            Zupe<span className="text-[#FA521C]">store</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#FA521C] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[460px]">
          {/* Notice banner if user was redirected from cart/wishlist/checkout */}
          {urlNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 rounded-2xl bg-white border border-[#FA521C]/30 shadow-sm flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FA521C]/10 flex items-center justify-center flex-shrink-0 text-[#FA521C] mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Sign In Required
                </h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  {urlNotice}
                </p>
              </div>
            </motion.div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                {mode === "login" ? "Welcome Back" : "Join Zupe Store"}
              </h1>
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
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
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
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
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

            {/* Form */}
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:ring-1 focus:ring-[#FA521C] transition-all"
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:ring-1 focus:ring-[#FA521C] transition-all"
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
                      className="text-xs font-bold text-[#FA521C] hover:underline disabled:text-gray-400"
                    >
                      {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : otpSent ? "Resend code" : "Send code"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="6-digit verification code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:ring-1 focus:ring-[#FA521C] tracking-widest transition-all"
                    />
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center min-w-[100px]"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
                      </button>
                    )}
                  </div>
                  {otpMessage && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      {otpMessage}
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
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:ring-1 focus:ring-[#FA521C] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#FA521C] hover:bg-[#E0400B] text-white font-bold text-sm shadow-lg shadow-[#FA521C]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
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
                  className="font-bold text-[#FA521C] hover:underline ml-1"
                >
                  {mode === "login" ? "Create one now" : "Sign in here"}
                </button>
              </p>
            </div>
          </div>

          {/* Value Badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-gray-100 shadow-2xs">
              <ShoppingBag className="w-4 h-4 mx-auto text-[#FA521C] mb-1.5" />
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
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        © {new Date().getFullYear()} Zupe Store. Modern Decor & Everyday Essentials.
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FA521C]" />
            <p className="text-sm font-semibold text-gray-500">Loading sign in...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
