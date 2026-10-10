"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authModalNotice,
    login,
    register,
    sendOtp,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(authModalMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);

  React.useEffect(() => {
    setMode(authModalMode);
    setEmail("");
    setPassword("");
    setName("");
    setOtp("");
    setOtpSent(false);
    setError(null);
    setSuccess(null);
    setEmailReadOnly(true);
    setPasswordReadOnly(true);

    if (emailInputRef.current) emailInputRef.current.value = "";
    if (passwordInputRef.current) passwordInputRef.current.value = "";

    const timer = setTimeout(() => {
      if (emailInputRef.current) emailInputRef.current.value = "";
      if (passwordInputRef.current) passwordInputRef.current.value = "";
    }, 60);

    return () => clearTimeout(timer);
  }, [authModalMode, isAuthModalOpen]);

  // Lock background scrolling when Auth modal is open
  React.useEffect(() => {
    if (isAuthModalOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

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
      if (res.otp) {
        setOtp(res.otp);
        setOtpMessage(`Code: ${res.otp} (Auto-filled)`);
        setSuccess(`Verification code ${res.otp} generated & auto-filled!`);
      } else {
        setOtpMessage(res.message || "OTP code sent to email!");
        setSuccess("Verification code sent! Check your inbox.");
      }
    } else {
      setError(res.error || "Failed to send code");
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
      }
    } else {
      if (!otpSent) {
        setLoading(false);
        setError("Please click 'Send Code' to receive your verification code");
        return;
      }
      if (!otp) {
        setLoading(false);
        setError("Please enter the 6-digit verification code");
        return;
      }

      const res = await register(name, email, password, otp);
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Failed to create account");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        data-lenis-prevent
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 flex items-center justify-center p-1 mb-3">
            <Image
              src="/zupe-logo.png"
              alt="Zupe Store"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h3 className="text-2xl font-bold font-display text-gray-900">
            {mode === "login" ? "Welcome Back" : "Join Zupe Store"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login"
              ? "Sign in to manage orders, wishlist & checkout faster"
              : "Create an account for curated design and modern living"}
          </p>
        </div>

        {authModalNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-start gap-2.5 text-xs font-semibold shadow-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#FF7A00] mt-0.5" />
            <span className="leading-relaxed">{authModalNotice}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
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
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              mode === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Decoy inputs to trap browser password manager autofill */}
          <div
            style={{
              position: "absolute",
              top: "-9999px",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
              overflow: "hidden",
            }}
            aria-hidden="true"
          >
            <input type="text" name="fake_username_remember" tabIndex={-1} autoComplete="username" />
            <input type="password" name="fake_password_remember" tabIndex={-1} autoComplete="current-password" />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  name="customer_signup_name"
                  id="customer-signup-name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/25 focus:border-[#FF7A00] bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={emailInputRef}
                type="email"
                required
                name="user_email_field"
                id="user-email-field"
                readOnly={emailReadOnly}
                onFocus={() => setEmailReadOnly(false)}
                onClick={() => setEmailReadOnly(false)}
                autoComplete="off"
                data-lpignore="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/25 focus:border-[#FF7A00] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={passwordInputRef}
                type="password"
                required
                name="user_secret_code"
                id="user-secret-code"
                readOnly={passwordReadOnly}
                onFocus={() => setPasswordReadOnly(false)}
                onClick={() => setPasswordReadOnly(false)}
                autoComplete="new-password"
                data-lpignore="true"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/25 focus:border-[#FF7A00] bg-white"
              />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="text-xs font-bold text-[#FF7A00] hover:underline disabled:opacity-50"
                >
                  {otpSent ? "Resend Code" : "Send Code"}
                </button>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm tracking-widest text-center font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/25 focus:border-[#FF7A00] bg-orange-50/30"
              />
              {otpMessage ? (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{otpMessage}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Click &ldquo;Send Code&rdquo; above. Code will be auto-filled or use 123456 for instant testing.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-sm shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 active:scale-98"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Complete Registration"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {mode === "login" ? "New to Zupe Store? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="text-[#FF7A00] font-bold hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in here"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
