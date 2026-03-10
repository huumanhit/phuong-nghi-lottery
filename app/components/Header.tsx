"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-red-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-yellow-400 text-red-700 font-extrabold text-xl px-3 py-1 rounded-lg shadow">
            PN
          </div>
          <div>
            <div className="text-white font-extrabold text-2xl tracking-wide leading-tight">
              PHƯƠNG NGHI
            </div>
            <div className="text-yellow-300 text-xs tracking-widest uppercase">
              Kết Quả Xổ Số Trực Tiếp
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300 transition-colors">Trang Chủ</Link>
          <Link href="/" className="hover:text-yellow-300 transition-colors">Thống Kê</Link>
          <Link href="/" className="hover:text-yellow-300 transition-colors">Lịch Sử</Link>
        </nav>
      </div>
    </header>
  );
}
