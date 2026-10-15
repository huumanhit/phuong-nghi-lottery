"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { VietlottGame, VietlottResult } from "@/services/vietlottService";

const GAME_INFO: Record<VietlottGame, { name: string; short: string; color: string; ballColor: string; drawDays: string; drawTime: string; rule: string }> = {
  "mega-645":  { name: "Vietlott Mega 6/45",  short: "MEGA 6/45",  color: "bg-blue-700",   ballColor: "bg-blue-600",   drawDays: "Thứ 4, Thứ 6, CN",   drawTime: "18:00", rule: "Chọn 6 số từ 01–45" },
  "power-655": { name: "Vietlott Power 6/55", short: "POWER 6/55", color: "bg-red-700",    ballColor: "bg-red-600",    drawDays: "Thứ 3, Thứ 5, Thứ 7", drawTime: "18:00", rule: "Chọn 6 số từ 01–55 + 1 số Power" },
  "max-3d":    { name: "Vietlott Max 3D",     short: "MAX 3D",     color: "bg-orange-600", ballColor: "bg-orange-500", drawDays: "Thứ 2, Thứ 4, Thứ 7", drawTime: "18:00", rule: "Chọn 1 bộ 3 chữ số từ 000–999 (hoặc 2 bộ cho Max 3D+)" },
  "max-4d":    { name: "Vietlott Max 4D",     short: "MAX 4D",     color: "bg-orange-600", ballColor: "bg-orange-500", drawDays: "Thứ 2, Thứ 4, Thứ 7", drawTime: "18:00", rule: "Chọn 1 bộ 4 chữ số từ 0000–9999" },
};

function Ball({ number, color, label }: { number: string; color: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs text-gray-500 font-bold">{label}</span>}
      <div
        className={`min-w-[48px] h-12 px-3 rounded-full ${color} text-white font-black text-lg flex items-center justify-center shadow-md`}
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {number}
      </div>
    </div>
  );
}

interface Props {
  game: VietlottGame;
  initialResult?: VietlottResult;
}

export default function VietlottPage({ game, initialResult }: Props) {
  const info = GAME_INFO[game];
  const [result, setResult] = useState<VietlottResult | null>(initialResult || null);
  const [loading, setLoading] = useState(!initialResult);

  const loadData = useCallback(() => {
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      setLoading(false);
    }, 4500);

    fetch(`/api/vietlott?game=${game}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timer);
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timer);
        // Only set error if we don't already have results
        setResult((prev) => prev && prev.draws.length > 0 ? prev : {
          game,
          draws: [],
          error: err instanceof Error ? err.message : "Lỗi kết nối",
        });
        setLoading(false);
      });
  }, [game]);

  useEffect(() => {
    if (!initialResult || initialResult.draws.length === 0) {
      loadData();
    }
  }, [initialResult, loadData]);

  const draw = result?.draws[0];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Notice for Max 4D */}
      {game === "max-4d" && (
        <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
          <span className="text-base leading-none">ℹ️</span>
          <div>
            <strong>Lưu ý:</strong> Vietlott đã dừng phát hành Max 4D và chuyển sang dòng sản phẩm <strong>Max 3D / Max 3D Pro</strong>.{" "}
            <Link href="/dien-toan/max-3d" className="text-red-700 font-bold underline hover:text-red-900">
              Xem kết quả Max 3D mới nhất tại đây →
            </Link>
          </div>
        </div>
      )}

      {/* Header banner */}
      <div className={`${info.color} rounded-xl text-white px-5 py-4 mb-5 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-wide">{info.name}</h1>
            <p className="text-sm opacity-80 mt-0.5">Kết quả trực tiếp mới nhất</p>
          </div>
          <div className="text-right text-sm opacity-90">
            <div className="font-bold">{info.drawDays}</div>
            <div>{info.drawTime}</div>
          </div>
        </div>
      </div>

      {/* Result card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        {/* Card header */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-700 text-sm">
            {draw ? `Kỳ quay #${draw.drawNumber}` : "Kết Quả Mới Nhất"}
          </span>
          {draw?.date && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
              📅 {draw.date}
            </span>
          )}
        </div>

        <div className="px-5 py-6">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
              <svg className="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span className="text-sm font-medium">Đang tải kết quả...</span>
            </div>
          ) : result?.error && !draw ? (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm font-semibold mb-2">
                {result.error.startsWith("HTTP") ? "Không thể tải kết quả từ nguồn dữ liệu." : result.error}
              </p>
              <button
                onClick={loadData}
                className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Thử tải lại
              </button>
            </div>
          ) : draw ? (
            <>
              {/* Winning balls */}
              <div className="flex flex-wrap justify-center items-center gap-2.5 mb-5">
                {draw.numbers.map((n, i) => (
                  <Ball key={i} number={n} color={info.ballColor} label={game === "max-3d" ? `Số ${i + 1}` : undefined} />
                ))}
                {draw.powerNumber && (
                  <>
                    <div className="flex items-center self-center px-1">
                      <span className="text-gray-400 text-2xl font-black">+</span>
                    </div>
                    <Ball number={draw.powerNumber} color="bg-yellow-500" label="Power" />
                  </>
                )}
              </div>

              {/* Jackpot info */}
              {draw.jackpot && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  <div className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-0.5">
                    Jackpot 1 Hiện Tại
                  </div>
                  <div className="text-2xl font-black text-amber-800">
                    {draw.jackpot} đ
                  </div>
                  <div className={`mt-1 text-xs font-bold ${draw.hasWinner ? "text-green-600" : "text-gray-500"}`}>
                    {draw.hasWinner ? "🎉 Có người trúng giải!" : "Chưa có người trúng giải"}
                  </div>
                </div>
              )}

              {/* Prize breakdown table if available */}
              {draw.prizes && draw.prizes.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2.5">
                    Thống kê trúng thưởng
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-200">
                          <th className="py-2 px-3 font-semibold">Giải thưởng</th>
                          {draw.prizes.some((p) => p.numbers && p.numbers.length > 0) && (
                            <th className="py-2 px-3 font-semibold">Bộ số trúng</th>
                          )}
                          <th className="py-2 px-3 font-semibold text-center">Số người trúng</th>
                          <th className="py-2 px-3 font-semibold text-right">Trị giá giải (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {draw.prizes.map((p, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-2 px-3 font-semibold text-gray-800">
                              {p.prizeName}
                            </td>
                            {draw.prizes?.some((pr) => pr.numbers && pr.numbers.length > 0) && (
                              <td className="py-2 px-3">
                                {p.numbers && p.numbers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {p.numbers.map((num, ni) => (
                                      <span
                                        key={ni}
                                        className="inline-block bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded text-[11px]"
                                      >
                                        {num}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            )}
                            <td className="py-2 px-3 text-center font-bold text-gray-800">
                              {p.count || "0"}
                            </td>
                            <td className="py-2 px-3 text-right font-extrabold text-red-600">
                              {p.reward || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 py-10 text-sm">Chưa có kết quả</p>
          )}
        </div>
      </div>

      {/* Info table */}
      <div className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-sm">
        <h3 className={`font-extrabold mb-3 ${info.color.replace("bg-","text-")}`}>
          Thông Tin {info.short}
        </h3>
        <table className="w-full text-xs text-gray-700">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-semibold text-gray-500 w-36">Tên trò chơi</td>
              <td className="py-2 font-bold">{info.name}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-semibold text-gray-500">Ngày quay thưởng</td>
              <td className="py-2">{info.drawDays}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-semibold text-gray-500">Giờ quay thưởng</td>
              <td className="py-2">{info.drawTime}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold text-gray-500">Cách chọn số</td>
              <td className="py-2 font-medium">{info.rule}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

