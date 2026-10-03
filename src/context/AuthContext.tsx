"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  authModalNotice: string | null;
  openAuthModal: (mode?: "login" | "signup", notice?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; message?: string; emailSent?: boolean; otp?: string; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);

  const syncUserSession = () => {
    try {
      const stored = localStorage.getItem("zp_user_session");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn("Could not load user session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncUserSession();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth") === "admin") {
        setAuthModalMode("login");
        setAuthModalNotice("SuperAdmin sign in required to access Admin Dashboard");
        setIsAuthModalOpen(true);
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "zp_user_session") syncUserSession();
    };
    const handlePageShow = () => syncUserSession();
    const handleFocus = () => syncUserSession();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const openAuthModal = (mode: "login" | "signup" = "login", notice?: string) => {
    setAuthModalMode(mode);
    setAuthModalNotice(notice || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalNotice(null);
    if (typeof window !== "undefined" && window.location.search.includes("auth=admin")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const sendOtp = async (email: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to send OTP" };
      }
      return { success: true, message: data.message, emailSent: data.emailSent, otp: data.otp };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      localStorage.setItem("zp_user_session", JSON.stringify(data.user));
      closeAuthModal();

      // If superadmin, redirect directly to /admin dashboard
      if (data.redirect || data.user?.role === "admin") {
        window.location.href = data.redirect || "/admin";
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string, otp: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }
      setUser(data.user);
      localStorage.setItem("zp_user_session", JSON.stringify(data.user));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zp_user_session");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authModalNotice,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        sendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
