"use client";
import { useState, useCallback } from "react";
import type { Region } from "../lib/lotteryData";

interface LotoFrequencyEntry {
  number: string;
  totalAppearances: number;
  sessionCount: number;
  lastSeenSessionIdx: number;
}

interface LotoFrequencyResult {
  region: Region;
  totalSessions: number;
  mostFrequent: LotoFrequencyEntry[];
  longestAbsent: LotoFrequencyEntry[];
}

// ---------------------------------------------------------------------------
// Ball color per tens digit (matching image color scheme)
// ---------------------------------------------------------------------------
function getBallGradient(num: string): string {
  const tens = parseInt(num[0], 10);
  const map: Record<number, string> = {
    0: "linear-gradient(135deg,#FFF176,#FFD700,#B8860B)",
    1: "linear-gradient(135deg,#f5f5f5,#d0d0d0,#aaa)",
    2: "linear-gradient(135deg,#67E8F9,#22D3EE,#0E7490)",
    3: "linear-gradient(135deg,#F9A8D4,#EC4899,#9D174D)",
    4: "linear-gradient(135deg,#5EEAD4,#14B8A6,#0F766E)",
    5: "linear-gradient(135deg,#86EFAC,#22C55E,#15803D)",
    6: "linear-gradient(135deg,#4ADE80,#16A34A,#14532D)",
    7: "linear-gradient(135deg,#BAE6FD,#7DD3FC,#4B83A4)",
    8: "linear-gradient(135deg,#6B7280,#374151,#111827)",
    9: "linear-gradient(135deg,#FDE68A,#FB923C,#EA580C)",
  };
  return map[tens] ?? "linear-gradient(135deg,#9CA3AF,#6B7280)";
}

function getBallTextColor(num: string): string {
  const tens = parseInt(num[0], 10);
  if (tens === 1) return "#444";   // silver — dark text
  if (tens === 0) return "#7B3A00"; // gold — brown text
  return "#fff";
}

// ---------------------------------------------------------------------------
// Single ball
// ---------------------------------------------------------------------------
function LotoBall({
  num,
  label,
  highlight,
}: {
  num: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="rounded-full flex items-center justify-center font-extrabold shadow-md select-none"
        style={{
          width: "40px",
          height: "40px",
          background: getBallGradient(num),
          color: getBallTextColor(num),
          fontSize: "15px",
          boxShadow: highlight
            ? "0 0 0 2.5px #EF4444, 0 2px 6px rgba(0,0,0,0.3)"
            : "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
          textShadow: getBallTextColor(num) === "#fff"
            ? "0 1px 2px rgba(0,0,0,0.4)"
            : "none",
        }}
      >
        {num}
      </div>
      <span className="text-[9px] text-gray-500 text-center leading-tight whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------
export default function LotoFrequencyPanel({ region }: { region: Region }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [data, setData]       = useState<LotoFrequencyResult | null>(null);

  const loadData = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/lottery/loto-frequency?region=${region}`);
      const json = (await res.json()) as LotoFrequencyResult;
      setData(json);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, [region, fetched]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !fetched) loadData();
  };

  const absOf = (e: LotoFrequencyEntry) =>
    e.lastSeenSessionIdx === -1
      ? (data?.totalSessions ?? 0)
      : e.lastSeenSessionIdx;

  return (
    <div className="mt-3 border border-red-200 rounded-lg overflow-hidden shadow-sm">
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-colors"
      >
        <span>🎱 Thống Kê Tần Suất Lô</span>
        <span className="text-red-200 text-xs font-normal">
          {open ? "▲ Thu gọn" : "▼ Xem thống kê"}
        </span>
      </button>

      {open && (
        <div className="bg-white p-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Đang tải thống kê...</span>
            </div>
          ) : !data || data.totalSessions === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">Không có dữ liệu</p>
          ) : (
            <div className="space-y-5">

              {/* ── Section 1: Most frequent ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-extrabold text-red-700 uppercase tracking-wide">
                    🔥 Những cặp số xuất hiện nhiều nhất
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    ({data.totalSessions} kỳ xổ gần nhất)
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {data.mostFrequent.map((e) => (
                    <LotoBall
                      key={e.number}
                      num={e.number}
                      label={`${e.totalAppearances} Lần/ ${e.sessionCount} Kỳ`}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 2: Longest absent ── */}
              <div>
                <div className="mb-3">
                  <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wide">
                    ❄️ Những cặp số không xuất hiện lâu nhất
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {data.longestAbsent.map((e, idx) => (
                    <LotoBall
                      key={e.number}
                      num={e.number}
                      label={`${absOf(e)} Kỳ`}
                      highlight={idx < 3}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
