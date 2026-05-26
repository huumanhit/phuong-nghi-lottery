"use client";
import { useState } from "react";
import type { StationResult, LotteryResult } from "../lib/lotteryData";

const PRIZE_ORDER: Array<keyof LotteryResult> = [
  "special", "first", "second", "third", "fourth",
  "fifth", "sixth", "seventh", "eighth",
];

type DisplayMode = "full" | "2so" | "3so";

function buildMap(result: LotteryResult, mode: DisplayMode): Record<number, string[]> {
  const map: Record<number, string[]> = {};
  for (let i = 0; i <= 9; i++) map[i] = [];

  for (const key of PRIZE_ORDER) {
    for (const num of result[key] ?? []) {
      if (mode === "3so") {
        if (num.length >= 3) {
          const slice = num.slice(-3);
          const dau = parseInt(slice[0], 10);
          if (!isNaN(dau)) map[dau].push(slice.slice(1));
        }
      } else {
        if (num.length >= 2) {
          const lo2 = num.slice(-2);
          const dau = parseInt(lo2[0], 10);
          if (!isNaN(dau)) {
            map[dau].push(mode === "full" ? lo2[1] : lo2);
          }
        }
      }
    }
  }
  return map;
}

interface Props {
  stations: StationResult[];
}

export default function LoDauDuoiTable({ stations }: Props) {
  const [mode, setMode] = useState<DisplayMode>("full");

  if (stations.length === 0) return null;

  const maps = stations.map((s) => buildMap(s.results, mode));

  return (
    <div className="mt-3 rounded-lg border border-red-200 overflow-hidden shadow-sm">
      {/* Header with radio buttons */}
      <div className="bg-red-700 px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        <span className="text-white text-xs font-extrabold uppercase tracking-wide">
          Bảng Lô Đầu Đuôi
        </span>
        <div className="flex items-center gap-3">
          {(["full", "2so", "3so"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="radio"
                name="loDisplayMode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="accent-yellow-400 w-3.5 h-3.5"
              />
              <span className="text-white text-xs font-semibold">
                {m === "full" ? "Đầy đủ" : m === "2so" ? "2 số" : "3 số"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full text-center border-collapse bg-white"
          style={{ fontFamily: "Arial, Helvetica, sans-serif", minWidth: "280px" }}
        >
          <thead>
            <tr className="bg-red-600 text-white">
              <th className="py-1.5 px-2 text-xs font-bold border-r border-red-400 w-10">
                Đầu
              </th>
              {stations.map((s) => (
                <th
                  key={s.stationId}
                  className="py-1.5 px-2 text-xs font-bold border-r border-red-400 last:border-r-0"
                >
                  {s.stationName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, dau) => (
              <tr
                key={dau}
                className={`border-b border-gray-100 ${dau % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="py-1 px-2 border-r border-red-200 text-red-700 font-extrabold text-sm">
                  {dau}
                </td>
                {maps.map((map, sIdx) => (
                  <td
                    key={sIdx}
                    className="py-1 px-2 border-r border-gray-100 last:border-r-0 text-gray-800 font-bold text-sm"
                  >
                    {map[dau].length > 0
                      ? map[dau].join(",")
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
