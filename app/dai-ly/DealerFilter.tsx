"use client";
import { useState, useMemo } from "react";

type DealerPoint = {
  id: string;
  city: string;
  pointType: string;
  name: string;
  phone: string;
  address: string;
  mapUrl: string;
  sortOrder: number;
  visible: boolean;
};

const POINT_TYPES = ["Tất cả", "Điểm đầu tư", "Điểm hợp tác"];

export default function DealerFilter({ dealerPoints }: { dealerPoints: DealerPoint[] }) {
  const cities = useMemo(() => {
    const set = new Set(dealerPoints.map((d) => d.city));
    return ["Tất cả", ...Array.from(set).sort()];
  }, [dealerPoints]);

  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const [selectedType, setSelectedType] = useState("Tất cả");

  const filtered = useMemo(() => {
    return dealerPoints.filter((d) => {
      const cityOk = selectedCity === "Tất cả" || d.city === selectedCity;
      const typeOk = selectedType === "Tất cả" || d.pointType === selectedType;
      return cityOk && typeOk;
    });
  }, [dealerPoints, selectedCity, selectedType]);

  // Group filtered results by city
  const grouped = useMemo(() => {
    const map = new Map<string, DealerPoint[]>();
    for (const d of filtered) {
      if (!map.has(d.city)) map.set(d.city, []);
      map.get(d.city)!.push(d);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* City select */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Tỉnh / Thành phố
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Type tabs */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Loại điểm
            </label>
            <div className="flex gap-2">
              {POINT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    selectedType === t
                      ? "bg-red-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Count badge */}
          <div className="sm:self-end pb-0.5">
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap">
              {filtered.length} điểm bán
            </span>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Không tìm thấy điểm bán nào phù hợp.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([city, points]) => (
            <div key={city}>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-700 rounded-full inline-block shrink-0" />
                {city}
                <span className="text-gray-400 font-medium normal-case text-xs">({points.length} điểm)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-red-700 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold w-10">STT</th>
                      <th className="px-4 py-3 text-left font-bold">Điểm Bán Hàng</th>
                      <th className="px-4 py-3 text-left font-bold hidden xs:table-cell">Loại</th>
                      <th className="px-4 py-3 text-left font-bold hidden sm:table-cell">Số Điện Thoại</th>
                      <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Địa Chỉ</th>
                      <th className="px-4 py-3 text-center font-bold w-16">MAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-gray-500 font-medium">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {d.name}
                          {d.phone && (
                            <div className="text-xs text-gray-500 font-normal sm:hidden">{d.phone}</div>
                          )}
                          {d.address && (
                            <div className="text-xs text-gray-400 font-normal md:hidden">{d.address}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden xs:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            d.pointType === "Điểm đầu tư"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {d.pointType || "Điểm hợp tác"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">{d.phone}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{d.address}</td>
                        <td className="px-4 py-3 text-center">
                          {d.mapUrl ? (
                            <a href={d.mapUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline text-xs">
                              📍 Map
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
