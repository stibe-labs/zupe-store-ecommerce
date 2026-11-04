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
              document.documentElement.setAttribute('data-is-admin', 'true');
              if (document.body) document.body.classList.add('is-admin');
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
      <div id="admin-root" data-is-admin="true" className="is-admin w-full min-h-screen">
        <AdminThemeProvider>
          <AdminAuthGuard>{children}</AdminAuthGuard>
        </AdminThemeProvider>
      </div>
    </>
  );
}
