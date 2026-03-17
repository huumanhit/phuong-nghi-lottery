"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const REGION_LABEL: Record<string, string> = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

interface DashboardData {
  todayCount: number;
  byRegion: Record<string, number>;
  totalResults: number;
  totalSchedules: number;
  recentResults: {
    id: string;
    date: string;
    region: string;
    province: string;
    specialPrize: string | null;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  const stats = [
    {
      label: "Kết quả hôm nay",
      value: data?.todayCount ?? 0,
      color: "bg-blue-500",
      href: "/admin/results",
    },
    {
      label: "Miền Bắc hôm nay",
      value: data?.byRegion?.north ?? 0,
      color: "bg-red-600",
      href: "/admin/results",
    },
    {
      label: "Miền Trung hôm nay",
      value: data?.byRegion?.central ?? 0,
      color: "bg-orange-500",
      href: "/admin/results",
    },
    {
      label: "Miền Nam hôm nay",
      value: data?.byRegion?.south ?? 0,
      color: "bg-green-600",
      href: "/admin/results",
    },
    {
      label: "Tổng kết quả",
      value: data?.totalResults ?? 0,
      color: "bg-purple-600",
      href: "/admin/results",
    },
    {
      label: "Lịch xổ số",
      value: data?.totalSchedules ?? 0,
      color: "bg-teal-600",
      href: "/admin/schedules",
    },
  ];

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xl font-bold">{s.value}</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent results */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Kết quả gần đây</h2>
          <Link href="/admin/results" className="text-sm text-red-600 hover:text-red-700 font-medium">
            Xem tất cả →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vùng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tỉnh</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Giải ĐB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recentResults?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Chưa có dữ liệu</td>
                </tr>
              )}
              {data?.recentResults?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(r.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.region === "north" ? "bg-red-100 text-red-700"
                      : r.region === "central" ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                    }`}>
                      {REGION_LABEL[r.region] ?? r.region}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.province}</td>
                  <td className="px-4 py-3 font-mono font-bold text-red-700">{r.specialPrize ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
