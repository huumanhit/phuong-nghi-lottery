"use client";
import { Fragment } from "react";
import type { LotteryResult, StationResult, Region } from "../lib/lotteryData";

type PrizeKey = keyof LotteryResult;

// ── Display order ─────────────────────────────────────────────────────────────
const MB_ORDER: PrizeKey[] = [
  "special", "first", "second", "third", "fourth", "fifth", "sixth", "seventh",
];
const MNMT_ORDER: PrizeKey[] = [
  "eighth", "seventh", "sixth", "fifth", "fourth", "third", "second", "first", "special",
];

// ── Labels ────────────────────────────────────────────────────────────────────
const MB_LABELS: Record<PrizeKey, string> = {
  special: "ĐB",     first: "G.Nhất", second: "G.Nhì",  third: "G.Ba",
  fourth:  "G.Tư",   fifth: "G.Năm",  sixth:  "G.Sáu",  seventh: "G.Bảy", eighth: "",
};
const MNMT_LABELS: Record<PrizeKey, string> = {
  eighth: "8", seventh: "7", sixth: "6",   fifth: "5",
  fourth: "4", third:   "3", second: "2",  first: "1", special: "ĐB",
};
const MNMT_MONEY: Record<PrizeKey, string> = {
  eighth: "100N", seventh: "200N", sixth: "400N", fifth: "1TR",
  fourth: "3TR",  third:  "10TR",  second: "15TR", first: "30TR", special: "2Tỷ",
};

// ── MB: how many numbers to show per row ─────────────────────────────────────
const MB_COLS: Partial<Record<PrizeKey, number>> = {
  special: 1, first: 1, second: 2,
  third: 3, fourth: 4, fifth: 3, sixth: 3, seventh: 4,
};

// ── MB number-cell text class ─────────────────────────────────────────────────
function getMbNumClass(prizeKey: PrizeKey): string {
  switch (prizeKey) {
    case "special": return "text-red-700 text-3xl font-extrabold tracking-widest";
    case "first":   return "text-red-600 text-2xl font-extrabold";
    case "second":  return "text-blue-600 text-lg font-bold";
    case "third":   return "text-green-700 font-semibold text-base";
    case "sixth":   return "text-blue-600 font-semibold";
    case "seventh": return "text-red-600 text-xl font-extrabold";
    default:        return "text-gray-800 font-medium";
  }
}

// ── MN/MT number-cell text class ──────────────────────────────────────────────
function getMnMtNumClass(prizeKey: PrizeKey, stationIdx: number): string {
  switch (prizeKey) {
    case "special":
      return stationIdx % 2 === 0
        ? "text-red-600 text-2xl font-extrabold tracking-widest"
        : "text-blue-600 text-2xl font-extrabold tracking-widest";
    case "eighth":  return "text-red-600 text-xl font-extrabold";
    case "seventh": return "text-blue-600 font-bold";
    default:        return "text-gray-800 font-medium";
  }
}

// ── Label cell background ─────────────────────────────────────────────────────
function getLabelBg(prizeKey: PrizeKey): string {
  return prizeKey === "special" ? "bg-red-600 text-white" : "bg-red-50 text-red-700";
}

// ── Row background ────────────────────────────────────────────────────────────
function getRowBg(prizeKey: PrizeKey, prizeIdx: number): string {
  if (prizeKey === "special") return "bg-amber-50";
  return prizeIdx % 2 === 0 ? "bg-white" : "bg-gray-50";
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  stations: StationResult[];
  region?: Region;
  revealed?: Set<string>;
  isComplete?: boolean;
}

export default function MultiStationTable({
  stations,
  region = "mb",
  revealed = new Set(),
  isComplete = true,
}: Props) {
  if (stations.length === 0) return null;

  const isMb      = region === "mb";
  const drawOrder = isMb ? MB_ORDER : MNMT_ORDER;
  const labels    = isMb ? MB_LABELS : MNMT_LABELS;

  return (
    <div className="overflow-x-auto rounded-lg border border-red-200 shadow-md">
      <table
        className="w-full text-center border-collapse bg-white min-w-[320px]"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* ── Header ── */}
        <thead>
          <tr className="bg-red-700 text-white">
            <th className="py-2 px-2 text-xs font-bold border-r border-red-500 whitespace-nowrap text-red-200 w-14">
              CN
            </th>
            {stations.map((s) => (
              <th
                key={s.stationId}
                className="py-1.5 px-3 text-sm font-bold border-r border-red-500 last:border-r-0 text-center"
              >
                <div>{s.stationName}</div>
                {!isMb && (
                  <div className="text-[10px] font-normal text-red-200 mt-0.5">
                    {s.stationId.toUpperCase().slice(0, 6)}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {isMb
            ? /* ──── MIỀN BẮC: one row per prize, all numbers inline ──── */
              drawOrder.map((prizeKey, prizeIdx) => {
                const numbers: string[] = stations[0]?.results[prizeKey] ?? [];
                const cols = MB_COLS[prizeKey] ?? numbers.length;
                const numClass = getMbNumClass(prizeKey);
                const rowBg = getRowBg(prizeKey, prizeIdx);

                // Chunk numbers into rows of `cols`
                const rows: string[][] = [];
                for (let i = 0; i < Math.max(numbers.length, 1); i += cols) {
                  rows.push(numbers.slice(i, i + cols));
                }

                return (
                  <tr key={prizeKey} className={`border-b border-gray-200 ${rowBg}`}>
                    {/* Label */}
                    <td className={`py-2 px-2 text-xs font-extrabold border-r border-red-200 align-middle whitespace-nowrap w-14 ${getLabelBg(prizeKey)}`}>
                      {labels[prizeKey]}
                    </td>

                    {/* All numbers in one cell */}
                    <td className="py-1.5 px-3">
                      {numbers.length === 0 ? (
                        <span className="text-gray-300 text-xs">—</span>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          {rows.map((rowNums, rIdx) => (
                            <div key={rIdx} className="flex justify-center gap-x-4">
                              {rowNums.map((num, nIdx) => {
                                const globalIdx = rIdx * cols + nIdx;
                                const isNew = revealed.has(`${prizeKey}-${globalIdx}`) && !isComplete;
                                return (
                                  <span
                                    key={nIdx}
                                    className={`inline-block transition-all duration-500 ${numClass} ${
                                      isNew ? "scale-125 animate-bounce" : ""
                                    } ${
                                      prizeKey === "special"
                                        ? "bg-amber-100 border border-amber-400 rounded px-3 py-0.5"
                                        : ""
                                    }`}
                                  >
                                    {num}
                                  </span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })

            : /* ──── MIỀN NAM / TRUNG: sub-rows per number across stations ──── */
              drawOrder
                .filter((prizeKey) =>
                  prizeKey !== "eighth" ||
                  stations.some((s) => (s.results.eighth ?? []).length > 0)
                )
                .flatMap((prizeKey, prizeIdx) => {
                  const maxCount = Math.max(
                    1,
                    ...stations.map((s) => (s.results[prizeKey] ?? []).length)
                  );

                  return Array.from({ length: maxCount }, (_, rowIdx) => {
                    const isFirstSubRow = rowIdx === 0;
                    const rowBg = getRowBg(prizeKey, prizeIdx);

                    return (
                      <Fragment key={`${prizeKey}-${rowIdx}`}>
                        <tr className={`border-b border-gray-200 ${rowBg}`}>
                          {/* Label — rowSpan */}
                          {isFirstSubRow && (
                            <td
                              rowSpan={maxCount}
                              className={`py-1.5 px-2 text-xs font-extrabold border-r border-red-200 align-middle whitespace-nowrap ${getLabelBg(prizeKey)}`}
                            >
                              <div>{labels[prizeKey]}</div>
                              <div className="text-[9px] font-normal mt-0.5 opacity-80">
                                {MNMT_MONEY[prizeKey]}
                              </div>
                            </td>
                          )}

                          {/* Number per station */}
                          {stations.map((s, sIdx) => {
                            const num = (s.results[prizeKey] ?? [])[rowIdx];
                            const revealKey = `${prizeKey}-${rowIdx}`;
                            const isNew = revealed.has(revealKey) && !isComplete;
                            const numClass = getMnMtNumClass(prizeKey, sIdx);

                            return (
                              <td
                                key={s.stationId}
                                className="py-1.5 px-2 border-r border-gray-100 last:border-r-0"
                              >
                                {num != null ? (
                                  <span
                                    className={`inline-block transition-all duration-500 ${numClass} ${
                                      isNew ? "scale-125 animate-bounce" : ""
                                    }`}
                                  >
                                    {num}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </Fragment>
                    );
                  });
                })}
        </tbody>
      </table>
    </div>
  );
}
