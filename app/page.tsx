import { Suspense } from "react";
import HeaderWrapper from "@/app/components/HeaderWrapper";
import LotteryPageWrapper from "./components/LotteryPageWrapper";
import Sidebar from "./components/Sidebar";
import LotteryCalendar from "./components/LotteryCalendar";
import Footer from "./components/Footer";
import PromoBanner from "./components/PromoBanner";
import Ticker from "./components/Ticker";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <HeaderWrapper />
      <Ticker />

      {/* ── Promo banner ── */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <PromoBanner />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
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
          <div className="lg:col-span-1">
            <Sidebar />
            <LotteryCalendar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
