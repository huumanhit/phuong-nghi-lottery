import type { Metadata } from "next";
import { Oswald, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

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

export const metadata: Metadata = {
  title: "PHƯƠNG NGHI - Kết Quả Xổ Số Trực Tiếp",
  description: "Kết quả xổ số miền Bắc, miền Trung, miền Nam hôm nay - XSMB XSMT XSMN",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${oswald.variable} ${beVietnam.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-be-vietnam), Arial, sans-serif" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
