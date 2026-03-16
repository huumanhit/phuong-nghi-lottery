"use client";
import { useEffect, useState } from "react";
import type { VietlottGame, VietlottResult } from "@/services/vietlottService";

const GAME_INFO: Record<VietlottGame, { name: string; short: string; color: string; ballColor: string; drawDays: string; drawTime: string }> = {
  "mega-645":  { name: "Vietlott Mega 6/45",  short: "MEGA 6/45",  color: "bg-blue-700",   ballColor: "bg-blue-600",  drawDays: "Thứ 4, Thứ 6, CN",   drawTime: "18:00" },
  "power-655": { name: "Vietlott Power 6/55", short: "POWER 6/55", color: "bg-red-700",    ballColor: "bg-red-500",   drawDays: "Thứ 3, Thứ 5, Thứ 7", drawTime: "18:00" },
  "max-4d":    { name: "Vietlott Max 4D",     short: "MAX 4D",     color: "bg-orange-600", ballColor: "bg-orange-500",drawDays: "Thứ 2, Thứ 4, Thứ 7", drawTime: "18:00" },
};

function Ball({ number, color, label }: { number: string; color: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs text-gray-500">{label}</span>}
      <div
        className={`w-12 h-12 rounded-full ${color} text-white font-extrabold text-lg flex items-center justify-center shadow-md`}
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {number}
      </div>
    </div>
  );
}

interface Props {
  game: VietlottGame;
}

export default function VietlottPage({ game }: Props) {
  const info = GAME_INFO[game];
  const [result, setResult] = useState<VietlottResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vietlott?game=${game}`)
      .then((r) => r.json())
      .then((data) => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [game]);

  const draw = result?.draws[0];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header banner */}
      <div className={`${info.color} rounded-xl text-white px-5 py-4 mb-5 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-wide">{info.name}</h1>
            <p className="text-sm opacity-80 mt-0.5">Kết quả trực tiếp mới nhất</p>
          </div>
          <div className="text-right text-sm opacity-80">
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
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
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
              <span className="text-sm">Đang tải kết quả...</span>
            </div>
          ) : result?.error && !draw ? (
            <div className="text-center py-10 text-red-500 text-sm">{result.error}</div>
          ) : draw ? (
            <>
              {/* Winning balls */}
              <div className="flex flex-wrap justify-center gap-3 mb-5">
                {draw.numbers.map((n, i) => (
                  <Ball key={i} number={n} color={info.ballColor} />
                ))}
                {draw.powerNumber && (
                  <>
                    <div className="flex items-center self-center">
                      <span className="text-gray-400 text-xl font-bold mx-1">+</span>
                    </div>
                    <Ball number={draw.powerNumber} color="bg-yellow-500" label="Power" />
                  </>
                )}
              </div>

              {/* Jackpot info */}
              {draw.jackpot && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                  <div className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-0.5">
                    Jackpot
                  </div>
                  <div className="text-2xl font-extrabold text-amber-800">
                    {draw.jackpot} đ
                  </div>
                  <div className={`mt-1 text-xs font-bold ${draw.hasWinner ? "text-green-600" : "text-gray-500"}`}>
                    {draw.hasWinner ? "✅ Có người trúng!" : "Chưa có người trúng"}
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
              <td className="py-1.5 font-semibold text-gray-500 w-36">Tên trò chơi</td>
              <td className="py-1.5 font-bold">{info.name}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-500">Ngày quay</td>
              <td className="py-1.5">{info.drawDays}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-500">Giờ quay</td>
              <td className="py-1.5">{info.drawTime}</td>
            </tr>
            {game !== "max-4d" && (
              <tr>
                <td className="py-1.5 font-semibold text-gray-500">Số chọn</td>
                <td className="py-1.5">
                  {game === "mega-645" ? "Chọn 6 số từ 01–45" : "Chọn 6 số từ 01–55 + 1 số Power"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
