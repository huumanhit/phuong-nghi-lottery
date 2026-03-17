"use client";
import { useState, useCallback } from "react";

interface LotoStatEntry {
  number: string;
  count: number;
}

interface Props {
  stationId: string;
  stationName: string;
  region: string;
}

export default function LotoStatsPanel({ stationId, stationName, region }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LotoStatEntry[]>([]);
  const [drawCount, setDrawCount] = useState(0);
  const [fetched, setFetched] = useState(false);

  const loadStats = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lottery/stats?region=${region}&station=${stationId}`);
      const data = await res.json();
      setStats(data.stats ?? []);
      setDrawCount(data.drawCount ?? 0);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, [region, stationId, fetched]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !fetched) loadStats();
  };

  // Show top 20 most frequent numbers
  const topStats = stats.slice(0, 20);

  return (
    <div className="mt-3 border border-red-200 rounded-lg overflow-hidden shadow-sm">
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-colors"
      >
        <span>📊 Thống kê nhanh — {stationName}</span>
        <span className="text-red-200 text-xs font-normal">
          {open ? "▲ Thu gọn" : "▼ Xem thống kê"}
        </span>
      </button>

      {open && (
        <div className="bg-white p-3">
          {loading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
              <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Đang tải thống kê...</span>
            </div>
          ) : stats.length === 0 ? (
            <p className="text-center py-4 text-gray-400 text-sm">
              Không có dữ liệu thống kê cho đài này
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3 font-semibold">
                Thống kê loto về nhiều nhất trong{" "}
                <span className="text-red-700 font-bold">{drawCount} lần quay</span>{" "}
                gần nhất
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {topStats.map(({ number, count }, idx) => (
                  <div
                    key={number}
                    className={`flex flex-col items-center rounded-lg py-1.5 px-1 border ${
                      idx < 3
                        ? "bg-red-50 border-red-300"
                        : idx < 6
                        ? "bg-orange-50 border-orange-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span
                      className={`font-extrabold text-base leading-tight ${
                        idx < 3
                          ? "text-red-700"
                          : idx < 6
                          ? "text-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      {number}
                    </span>
                    <span className="text-gray-500 text-[10px] leading-tight mt-0.5">
                      {count} lần
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
