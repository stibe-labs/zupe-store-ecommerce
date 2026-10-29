import React from "react";
import { AdminThemeProvider } from "@/context/AdminThemeContext";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "Zupe Store — Live Production ERP & Admin Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem('zupe_admin_theme');
              if (t === 'dark') {
                document.documentElement.setAttribute('data-admin-theme', 'dark');
              } else {
                document.documentElement.setAttribute('data-admin-theme', 'light');
              }
            } catch(e) {}
          `,
        }}
      />
      <AdminThemeProvider>
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </AdminThemeProvider>
    </>
  );
}
