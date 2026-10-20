"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark";

interface AdminThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zupe_admin_theme") as ThemeMode | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
        document.documentElement.setAttribute("data-admin-theme", stored);
      } else {
        document.documentElement.setAttribute("data-admin-theme", "light");
      }
    } catch {
      document.documentElement.setAttribute("data-admin-theme", "light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("zupe_admin_theme", theme);
    } catch {}

    document.documentElement.setAttribute("data-admin-theme", theme);

    return () => {
      // Clean up when leaving admin routes so live storefront is completely untouched
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div
        id="admin-root"
        data-admin-theme={theme}
        className={`min-h-screen transition-colors duration-200 ${
          theme === "dark" ? "admin-dark" : "admin-light"
        }`}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
