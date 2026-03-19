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
  verification: {
    google: "JNCzQ7xQOBDo5Xg0GNusqSkRyTbLHLHhXdij8I3Hx5I",
  },
  title: {
    default: siteTitle,
    template: "%s | Phương Nghi Xổ Số",
  },
  description: siteDesc,
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "32x32",  type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "48x48",  type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "192x192", type: "image/jpeg" },
    ],
    apple: { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" },
    shortcut: "/logo.jpg",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Đại Lý Vé Số Phương Nghi",
  url: siteUrl,
  logo: `${siteUrl}/logo.jpg`,
  image: `${siteUrl}/logo.jpg`,
  description: siteDesc,
  telephone: "+84989007772",
  address: {
    "@type": "PostalAddress",
    streetAddress: "25 Phan Văn Hớn, Bà Điểm",
    addressLocality: "Hóc Môn",
    addressRegion: "TP. HCM",
    addressCountry: "VN",
  },
  sameAs: [siteUrl],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${oswald.variable} ${beVietnam.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "var(--font-be-vietnam), Arial, sans-serif" }}>
        <AuthProvider>
          <Suspense fallback={null}><PageTracker /></Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
