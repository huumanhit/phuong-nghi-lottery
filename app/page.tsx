"use client";
import { Suspense, useCallback } from "react";
import Header from "@/app/components/Header";
import LotteryPageWrapper from "./components/LotteryPageWrapper";
import Sidebar from "./components/Sidebar";
import LotteryCalendar from "./components/LotteryCalendar";
import Footer from "./components/Footer";
import PromoBanner from "./components/PromoBanner";

const TICKER_ITEMS = [
  "🔴 TRỰC TIẾP XỔ SỐ MIỀN BẮC — Hà Nội",
  "🌴 TRỰC TIẾP XỔ SỐ MIỀN NAM — Bình Dương · Vĩnh Long · Trà Vinh",
  "🌊 TRỰC TIẾP XỔ SỐ MIỀN TRUNG — Gia Lai · Ninh Thuận",
  "🏆 ĐỔI SỐ TRÚNG TẬN NƠI — Hotline: 0989 007 772",
  "⭐ UY TÍN & BẢO MẬT — Đại Lý Phương Nghi",
  "🎰 VIETLOTT MEGA 6/45 · POWER 6/55 · MAX4D",
  "✨ KẾT QUẢ NHANH NHẤT — Cập Nhật Ngay Khi Xổ",
];

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCalSelect = useCallback((_iso: string) => {}, []);

  const tickerText = TICKER_ITEMS.join("   ·   ");

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <Header />

      {/* ── Live ticker strip ── */}
      <div className="bg-gradient-to-r from-red-900 via-red-700 to-red-900 border-b-2 border-yellow-500/60 overflow-hidden">
        <div className="flex items-center">
          {/* Badge */}
          <div className="shrink-0 flex items-center gap-1.5 bg-yellow-400 text-red-900 px-3 py-1.5 font-black text-xs uppercase tracking-wider z-10 shadow-md">
            <span className="sparkle inline-block">⚡</span>
            <span>LIVE</span>
          </div>
          {/* Scrolling text */}
          <div className="overflow-hidden flex-1">
            <div className="ticker-track py-1.5">
              <span className="text-white text-xs font-semibold px-8">{tickerText}</span>
              {/* duplicate for seamless loop */}
              <span className="text-white text-xs font-semibold px-8">{tickerText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Promo banner ── */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <PromoBanner />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Main content — 3/4 width */}
          <div className="lg:col-span-3">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20 text-gray-400">
                <svg className="animate-spin h-8 w-8 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Đang tải...</span>
              </div>
            }>
              <LotteryPageWrapper />
            </Suspense>
          </div>

          {/* Sidebar — 1/4 width */}
          <div className="lg:col-span-1">
            <Sidebar />
            <LotteryCalendar onDateSelect={handleCalSelect} />
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
