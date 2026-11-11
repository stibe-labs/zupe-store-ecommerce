import React from "react";
import { AdminThemeProvider } from "@/context/AdminThemeContext";

export const metadata = {
  title: "Vittal Lifestyle — Live Production ERP & Admin Portal",
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
              var t = localStorage.getItem('zupe_admin_theme') || 'dark';
              if (t === 'light') {
                document.documentElement.setAttribute('data-admin-theme', 'light');
              } else {
                document.documentElement.setAttribute('data-admin-theme', 'dark');
              }
            } catch(e) {
              document.documentElement.setAttribute('data-admin-theme', 'dark');
            }
          `,
        }}
      />
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </>
  );
}
