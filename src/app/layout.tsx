import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Quản Lý Nợ Khách Hàng",
  description: "Web app mini dành cho chủ quán",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0, background: '#E8EEF8' }}>
        <div className="mobile-container">
          <main>
            {children}
          </main>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
