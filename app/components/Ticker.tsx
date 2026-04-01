"use client";

const TICKER_ITEMS = [
  "🔴 TRỰC TIẾP XỔ SỐ MIỀN BẮC — Hà Nội",
  "🌴 TRỰC TIẾP XỔ SỐ MIỀN NAM — Bình Dương · Vĩnh Long · Trà Vinh",
  "🌊 TRỰC TIẾP XỔ SỐ MIỀN TRUNG — Gia Lai · Ninh Thuận",
  "🏆 ĐỔI SỐ TRÚNG TẬN NƠI — Hotline: 0989 007 772",
  "⭐ UY TÍN & BẢO MẬT — Đại Lý Phương Nghi",
  "🎰 VIETLOTT MEGA 6/45 · POWER 6/55 · MAX4D",
  "✨ KẾT QUẢ NHANH NHẤT — Cập Nhật Ngay Khi Xổ",
];

const tickerText = TICKER_ITEMS.join("   ·   ");

export default function Ticker() {
  return (
    <div className="bg-gradient-to-r from-red-900 via-red-700 to-red-900 border-b-2 border-yellow-500/60 overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 bg-yellow-400 text-red-900 px-3 py-1.5 font-black text-xs uppercase tracking-wider z-10 shadow-md">
          <span className="sparkle inline-block">⚡</span>
          <span>LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track py-1.5">
            <span className="text-white text-xs font-semibold px-8">{tickerText}</span>
            <span className="text-white text-xs font-semibold px-8">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
