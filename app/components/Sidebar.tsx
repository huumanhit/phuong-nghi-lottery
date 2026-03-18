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

const REGION_CONFIG: Array<{ value: Region; label: string; icon: string; color: string }> = [
  { value: "mn", label: "Xổ Số Miền Nam",   icon: "🌴", color: "text-green-700" },
  { value: "mt", label: "Xổ Số Miền Trung", icon: "🌊", color: "text-blue-700"  },
  { value: "mb", label: "Xổ Số Miền Bắc",   icon: "🏯", color: "text-red-700"   },
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-red-700 px-4 py-2.5">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">
            Xổ Số Trực Tiếp
          </h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {REGION_CONFIG.map((r) => (
            <li key={r.value}>
              <Link
                href={`/?region=${r.value}`}
                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors ${
                  activeRegion === r.value ? "bg-red-50 border-l-4 border-red-600" : ""
                }`}
              >
                <span className="text-base">{r.icon}</span>
                <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors"
            >
              <span className="text-base">🎰</span>
              <span className="text-sm font-semibold text-purple-700">Vietlott</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* ---- Đài hôm nay ---- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-red-700 px-4 py-2.5 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">
            Đài Hôm Nay
          </h3>
          <span className="text-yellow-300 text-xs">{DAY_NAMES[dow]} — {today}</span>
        </div>

        <div className="p-3 space-y-3">
          {/* Miền Bắc */}
          <div>
            <p className="text-xs font-bold text-red-700 uppercase mb-1">Miền Bắc</p>
            <div className="flex flex-wrap gap-1">
              {STATION_SCHEDULE.mb[dow].map((name) => (
                <span key={name} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Miền Trung */}
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Miền Trung</p>
            <div className="flex flex-wrap gap-1">
              {STATION_SCHEDULE.mt[dow].map((name) => (
                <span key={name} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Miền Nam */}
          <div>
            <p className="text-xs font-bold text-green-700 uppercase mb-1">Miền Nam</p>
            <div className="flex flex-wrap gap-1">
              {STATION_SCHEDULE.mn[dow].map((name) => (
                <span key={name} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Quick Ticket Checker ---- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-red-700 px-4 py-2.5">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">
            Kiểm Tra Vé Số
          </h3>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">
            Nhập số vé để kiểm tra xem bạn có trúng thưởng không.
          </p>
          <Link
            href="/kiem-tra"
            className="block w-full text-center bg-red-700 hover:bg-red-800 text-white font-bold text-sm py-2.5 rounded-lg transition-colors active:scale-95"
          >
            🔍 Kiểm Tra Ngay
          </Link>
        </div>
      </div>

    </div>
  );
}
