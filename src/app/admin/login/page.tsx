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
          name: data.user?.name || "Zupe Administrator",
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
      <div className="bg-[#121620]/90 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        {/* Header */}
        <div className="text-center mb-7 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-orange-400 text-white shadow-lg shadow-[#FF7A00]/30 mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 font-medium">
            Sign in with administrator credentials to manage Turkiye Jam
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
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@zupestore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-800 bg-[#0d1017] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-800 bg-[#0d1017] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF7A00] to-orange-500 hover:from-[#E66E00] hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-[#FF7A00]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-5 border-t border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#FF7A00]" />
            <span>Authorized access only. All sessions are logged & audited.</span>
          </p>
        </div>
      </div>

      {/* Switch to customer store */}
      <div className="mt-5 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
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
    <div className="min-h-screen bg-[#090b10] flex flex-col justify-between selection:bg-[#FF7A00]/30 selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-gray-900 bg-[#0d1017]/80 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-24 flex items-center justify-start">
              <Image
                src="/turkiye-jam-logo.svg"
                alt="Turkiye Jam"
                width={96}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
              ERP
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
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
              <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
              <p className="text-xs text-gray-400">Loading admin portal...</p>
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-gray-600 border-t border-gray-900 bg-[#090b10]">
        Turkiye Jam Enterprise ERP System • Secure Management Console
      </footer>
    </div>
  );
}
