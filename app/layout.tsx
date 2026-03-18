import type { Metadata } from "next";
import { Oswald, Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { Suspense } from "react";
import PageTracker from "./components/PageTracker";

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PHƯƠNG NGHI - Kết Quả Xổ Số Trực Tiếp",
  description: "Kết quả xổ số miền Bắc, miền Trung, miền Nam hôm nay - XSMB XSMT XSMN",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${oswald.variable} ${beVietnam.variable} ${playfair.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-be-vietnam), Arial, sans-serif" }}>
        <AuthProvider>
          <Suspense fallback={null}><PageTracker /></Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
