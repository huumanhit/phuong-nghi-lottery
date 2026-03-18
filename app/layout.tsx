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

const siteUrl = "https://xosophuongnghi.com.vn";
const siteTitle = "PHƯƠNG NGHI - Kết Quả Xổ Số Trực Tiếp";
const siteDesc = "Kết quả xổ số miền Bắc, miền Trung, miền Nam hôm nay nhanh nhất - XSMB XSMT XSMN. Đại lý vé số Phương Nghi.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Phương Nghi Xổ Số",
  },
  description: siteDesc,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/logo.jpg",    sizes: "32x32", type: "image/jpeg" },
    ],
    apple: { url: "/logo.jpg", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDesc,
    siteName: "Phương Nghi Xổ Số",
    images: [{ url: "/logo.jpg", width: 617, height: 664, alt: siteTitle }],
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDesc,
    images: ["/logo.jpg"],
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
