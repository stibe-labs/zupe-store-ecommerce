"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname === "/login";

  const [verified, setVerified] = useState(isLoginPage);
  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setVerified(true);
      setChecking(false);
      return;
    }

    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/verify", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();

        if (!data.isSuperAdmin) {
          throw new Error("Forbidden");
        }

        if (isMounted) {
          setVerified(true);
          setChecking(false);
        }
      } catch (err) {
        if (isMounted) {
          try {
            localStorage.removeItem("zp_user_session");
          } catch (e) {}
          const currentUrl =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/admin";
          window.location.href = `/admin/login?redirect=${encodeURIComponent(
            currentUrl
          )}&notice=${encodeURIComponent("Please sign in to access the Admin Panel.")}`;
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking || !verified) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-orange-400 flex items-center justify-center shadow-xl shadow-orange-500/20 mb-5 animate-pulse">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2.5 text-slate-300 font-semibold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-[#FF7A00]" />
          <span>Verifying Admin Authorization...</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono">
          Zupe Store ERP Security Gate
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
