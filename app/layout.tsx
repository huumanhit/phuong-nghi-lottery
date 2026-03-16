import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHƯƠNG NGHI - Kết Quả Xổ Số Trực Tiếp",
  description: "Kết quả xổ số miền Bắc, miền Trung, miền Nam hôm nay - XSMB XSMT XSMN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
