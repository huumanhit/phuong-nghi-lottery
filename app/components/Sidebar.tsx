"use client";
import Link from "next/link";
import { STATION_SCHEDULE, type Region } from "../lib/lotteryData";
import PromoBanner from "./PromoBanner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayDayOfWeek(): number {
  return new Date().getDay();
}

function getTodayVN(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const DAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

const REGION_CONFIG: Array<{ value: Region; label: string; icon: string; bg: string; text: string }> = [
  { value: "mn", label: "Xổ Số Miền Nam",   icon: "🌴", bg: "hover:bg-green-50",  text: "text-green-700" },
  { value: "mt", label: "Xổ Số Miền Trung", icon: "🌊", bg: "hover:bg-blue-50",   text: "text-blue-700"  },
  { value: "mb", label: "Xổ Số Miền Bắc",   icon: "🏯", bg: "hover:bg-red-50",    text: "text-red-700"   },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SidebarProps {
  activeRegion?: Region;
}

export default function Sidebar({ activeRegion = "mb" }: SidebarProps) {
  const dow = getTodayDayOfWeek();
  const today = getTodayVN();

  return (
    <div className="space-y-4">

      {/* ---- Promo banner ---- */}
      <PromoBanner hideBrand />

      {/* ---- Xổ số trực tiếp navigation ---- */}
      <div className="vip-card rounded-xl overflow-hidden">
        <div className="section-header-gold px-4 py-2.5 flex items-center gap-2">
          <span className="sparkle inline-block text-yellow-300 text-base">★</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider">
            Xổ Số Trực Tiếp
          </h3>
        </div>
        <ul className="divide-y divide-gray-100 bg-white">
          {REGION_CONFIG.map((r) => (
            <li key={r.value}>
              <Link
                href={`/?region=${r.value}`}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${r.bg} ${
                  activeRegion === r.value ? "bg-red-50 border-l-4 border-red-600 pl-3" : ""
                }`}
              >
                <span className="text-base">{r.icon}</span>
                <span className={`text-sm font-bold ${r.text}`}>{r.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors"
            >
              <span className="text-base">🎰</span>
              <span className="text-sm font-bold text-purple-700">Vietlott</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* ---- Đài hôm nay ---- */}
      <div className="vip-card rounded-xl overflow-hidden">
        <div className="section-header-gold px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="sparkle inline-block text-yellow-300 text-base">📅</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">
              Đài Hôm Nay
            </h3>
          </div>
          <span className="text-yellow-300 text-xs font-semibold">{DAY_NAMES[dow]} — {today}</span>
        </div>

        <div className="p-3 space-y-3 bg-white">
          {/* Miền Bắc */}
          <div>
            <p className="text-xs font-black text-red-700 uppercase mb-1.5 flex items-center gap-1">
              <span>🏯</span> Miền Bắc
            </p>
            <div className="flex flex-wrap gap-1">
              {STATION_SCHEDULE.mb[dow].map((name) => (
                <span key={name} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold border border-red-200">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Miền Trung */}
          <div>
            <p className="text-xs font-black text-blue-700 uppercase mb-1.5 flex items-center gap-1">
              <span>🌊</span> Miền Trung
            </p>
            <div className="flex flex-wrap gap-1">
              {STATION_SCHEDULE.mt[dow].map((name) => (
                <span key={name} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Miền Nam */}
          <div>
            <p className="text-xs font-black text-green-700 uppercase mb-1.5 flex items-center gap-1">
              <span>🌴</span> Miền Nam
            </p>
            <div className="flex flex-wrap gap-1">
              {STATION_SCHEDULE.mn[dow].map((name) => (
                <span key={name} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Quick Ticket Checker ---- */}
      <div className="vip-card rounded-xl overflow-hidden">
        <div className="section-header-gold px-4 py-2.5 flex items-center gap-2">
          <span className="sparkle inline-block text-yellow-300 text-base">🔍</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider">
            Kiểm Tra Vé Số
          </h3>
        </div>
        <div className="p-4 bg-white">
          <p className="text-xs text-gray-500 mb-3">
            Nhập số vé để kiểm tra xem bạn có trúng thưởng không.
          </p>
          <Link
            href="/kiem-tra"
            className="btn-pulse block w-full text-center bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-800 hover:to-red-800 text-white font-black text-sm py-3 rounded-lg transition-all active:scale-95 border border-red-900/30"
          >
            🔍 Kiểm Tra Ngay
          </Link>
        </div>
      </div>

    </div>
  );
}
