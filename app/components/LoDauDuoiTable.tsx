"use client";
import type { StationResult, LotteryResult } from "../lib/lotteryData";

const PRIZE_ORDER: Array<keyof LotteryResult> = [
  "special", "first", "second", "third", "fourth",
  "fifth", "sixth", "seventh", "eighth",
];

/** Returns map: đầu (0–9) → list of đuôi digits */
function buildDauDuoiMap(result: LotteryResult): Record<number, number[]> {
  const map: Record<number, number[]> = {};
  for (let i = 0; i <= 9; i++) map[i] = [];

  for (const key of PRIZE_ORDER) {
    for (const num of result[key] ?? []) {
      if (num.length >= 2) {
        const lo   = num.slice(-2);
        const dau  = parseInt(lo[0], 10);
        const duoi = parseInt(lo[1], 10);
        if (!isNaN(dau) && !isNaN(duoi)) map[dau].push(duoi);
      }
    }
  }
  return map;
}

interface Props {
  stations: StationResult[];
}

export default function LoDauDuoiTable({ stations }: Props) {
  if (stations.length === 0) return null;

  const maps = stations.map((s) => buildDauDuoiMap(s.results));

  return (
    <div className="mt-3 rounded-lg border border-red-200 overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="bg-red-700 px-3 py-2">
        <span className="text-white text-xs font-extrabold uppercase tracking-wide">
          Bảng Lô Đầu Đuôi
        </span>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full text-center border-collapse bg-white"
          style={{ fontFamily: "Arial, Helvetica, sans-serif", minWidth: "280px" }}
        >
          {/* Header */}
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

          {/* Body — rows 0–9 */}
          <tbody>
            {Array.from({ length: 10 }, (_, dau) => {
                return (
                <tr
                  key={dau}
                  className={`border-b border-gray-100 ${dau % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  {/* Đầu label */}
                  <td className="py-1 px-2 border-r border-red-200 text-red-700 font-extrabold text-sm">
                    {dau}
                  </td>

                  {/* Đuôi digits per station */}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
