import { Suspense } from "react";
import Link from "next/link";
import HeaderWrapper from "@/app/components/HeaderWrapper";
import LotteryPageWrapper from "./components/LotteryPageWrapper";
import Sidebar from "./components/Sidebar";
import LotteryCalendar from "./components/LotteryCalendar";
import Footer from "./components/Footer";
import Ticker from "./components/Ticker";

// ── Live countdown row ────────────────────────────────────────────────────────
const DRAW_ITEMS = [
  { label: "MIỀN NAM",   time: "16:10", href: "/?region=mn", color: "bg-green-600" },
  { label: "MIỀN TRUNG", time: "17:15", href: "/?region=mt", color: "bg-blue-600"  },
  { label: "MIỀN BẮC",  time: "18:15", href: "/?region=mb", color: "bg-red-600"   },
  { label: "POWER 6/55", time: "18:00", href: "/dien-toan/power-655", color: "bg-purple-600" },
  { label: "MAX 3D",    time: "18:30", href: "/dien-toan/max-4d",    color: "bg-orange-600" },
];

function LiveCountdownRow() {
  return (
    <div className="bg-white border-b border-red-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-stretch gap-2 overflow-x-auto scrollbar-none">
          {DRAW_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex-shrink-0 flex flex-col items-center bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-2 transition-colors min-w-[90px] group"
            >
              <span className={`text-[10px] font-black text-white ${item.color} px-2 py-0.5 rounded-full mb-1 uppercase tracking-wide whitespace-nowrap`}>
                {item.label}
              </span>
              <span className="text-red-700 font-black text-lg leading-tight">
                {item.time}
              </span>
              <span className="text-red-400 text-[10px] font-semibold group-hover:text-red-600 transition-colors">
                Xem ngay →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Features section ──────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🏆", title: "Uy Tín Hàng Đầu",    desc: "Nhiều năm kinh nghiệm trong ngành xổ số kiến thiết Miền Nam" },
  { icon: "⚡", title: "Kết Quả Nhanh",       desc: "Cập nhật ngay khi xổ số bắt đầu, chính xác tuyệt đối" },
  { icon: "🔒", title: "Bảo Mật Tuyệt Đối",  desc: "Thông tin vé số được bảo mật, thanh toán an toàn" },
  { icon: "🎁", title: "Đổi Thưởng Tận Nơi", desc: "Hỗ trợ đổi số trúng tất cả giải, tận nhà khi cần" },
  { icon: "📞", title: "Hỗ Trợ 24/7",        desc: "Đội ngũ hỗ trợ luôn sẵn sàng, hotline 0989 007 772" },
];

function FeaturesSection() {
  return (
    <div className="bg-white border-t border-red-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="text-3xl mb-2">{f.icon}</span>
              <p className="font-extrabold text-red-700 text-xs uppercase tracking-wide mb-1">
                {f.title}
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <HeaderWrapper />
      <Ticker />
      <LiveCountdownRow />

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

      <FeaturesSection />
      <Footer />
    </main>
  );
}
