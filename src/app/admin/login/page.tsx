"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/admin";
  const urlNotice = searchParams.get("notice");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid administrator credentials");
        setLoading(false);
        return;
      }

      // Sync local user session for client-side state
      if (typeof window !== "undefined") {
        const adminSession = {
          id: "superadmin",
          name: data.user?.name || "Vittal Lifestyle Administrator",
          email: data.user?.email || email,
          role: "admin",
        };
        localStorage.setItem("zp_user_session", JSON.stringify(adminSession));
      }

      // Redirect directly to target admin page
      window.location.href = redirectUrl.startsWith("/admin") ? redirectUrl : "/admin";
    } catch (err: any) {
      setError(err.message || "Failed to connect to authentication service");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Notice Banner */}
      {urlNotice && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>{urlNotice}</span>
        </div>
      )}

      {/* Card */}
      <div className="bg-[#141416]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        {/* Header */}
        <div className="text-center mb-7 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#18181C] text-[#D4AF37] border border-[#D4AF37]/30 shadow-lg shadow-black/50 mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 font-medium">
            Sign in with administrator credentials to manage Vittal Lifestyle
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@vittallifestyle.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#111113] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-[#111113] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#D4A373] hover:bg-[#c29263] text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-[#D4A373]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#D4AF37]" />
            <span>Authorized access only. All sessions are logged & audited.</span>
          </p>
        </div>
      </div>

      {/* Switch to customer store */}
      <div className="mt-5 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Return to Customer Store</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#070708] flex flex-col justify-between selection:bg-[#D4AF37] text-white selection:text-black">
      {/* Header */}
      <header className="w-full border-b border-white/10 bg-[#0B0B0C]/90 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-32 flex items-center justify-start">
              <Image
                src="/vl-logo-nobg.png"
                alt="Vittal Lifestyle"
                width={128}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-[#18181C] text-[#D4AF37] border border-white/10">
              ERP
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Customer View</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              <p className="text-xs text-neutral-400">Loading admin portal...</p>
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-neutral-500 border-t border-white/10 bg-[#070708]">
        Vittal Lifestyle Enterprise ERP System • Secure Management Console
      </footer>
    </div>
  );
}
