"use client";
import { useEffect, useState, useCallback } from "react";

type Summary = { total: number; today: number; yesterday: number; week: number; month: number };
type DailyEntry = { date: string; count: number };
type TopPage = { path: string; count: number };
type Data = { summary: Summary; daily: DailyEntry[]; topPages: TopPage[] };

const PAGE_LABELS: Record<string, string> = {
  "/": "Trang chủ",
  "/?region=mn": "XSMN",
  "/?region=mt": "XSMT",
  "/?region=mb": "XSMB",
  "/kiem-tra": "Dò Vé",
  "/in-ve-do": "In Vé",
  "/doi-ve-trung": "Đổi Vé Trúng",
  "/gioi-thieu": "Giới Thiệu",
  "/dien-toan/mega-645": "Mega 6/45",
  "/dien-toan/power-655": "Power 6/55",
  "/dien-toan/max-4d": "Max4D",
};

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value.toLocaleString("vi-VN")}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/analytics?days=${days}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxDaily = data ? Math.max(...data.daily.map((d) => d.count), 1) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê truy cập</h1>
          <p className="text-gray-500 text-sm mt-1">Lượt xem trang của khách truy cập</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                days === d ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {d} ngày
            </button>
          ))}
          <button
            onClick={fetchData}
            className="ml-1 p-2 bg-white rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Làm mới"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Hôm nay" value={data.summary.today} />
            <StatCard label="Hôm qua" value={data.summary.yesterday} />
            <StatCard label="7 ngày qua" value={data.summary.week} />
            <StatCard label="30 ngày qua" value={data.summary.month} />
            <StatCard label="Tổng cộng" value={data.summary.total} sub="Tất cả thời gian" />
          </div>

          {/* Daily bar chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-5 uppercase tracking-wide">
              Lượt xem theo ngày ({days} ngày gần nhất)
            </h2>
            {data.daily.every((d) => d.count === 0) ? (
              <p className="text-center text-gray-400 py-8 text-sm">Chưa có dữ liệu trong khoảng thời gian này</p>
            ) : (
              <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                {data.daily.map((d) => {
                  const pct = Math.round((d.count / maxDaily) * 100);
                  const dateLabel = new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[18px] group">
                      <div className="relative w-full flex flex-col items-center">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                          {dateLabel}: {d.count.toLocaleString("vi-VN")}
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${Math.max(pct * 1.4, d.count > 0 ? 4 : 0)}px`,
                            background: d.count > 0 ? "#b91c1c" : "#e5e7eb",
                          }}
                        />
                      </div>
                      {/* Label — show every N-th */}
                      {(days <= 14 || (days <= 30 && data.daily.indexOf(d) % 3 === 0) || data.daily.indexOf(d) % 7 === 0) && (
                        <span className="text-[9px] text-gray-400 leading-none">{dateLabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
              Trang được xem nhiều nhất (30 ngày)
            </h2>
            {data.topPages.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {data.topPages.map((p, i) => {
                  const maxCount = data.topPages[0].count;
                  const pct = Math.round((p.count / maxCount) * 100);
                  return (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {PAGE_LABELS[p.path] ?? p.path}
                          </span>
                          <span className="text-sm font-bold text-red-700 shrink-0 ml-2">
                            {p.count.toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">{p.path}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
