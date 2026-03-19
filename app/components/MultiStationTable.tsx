"use client";
import { Fragment } from "react";
import type { LotteryResult, StationResult, Region } from "../lib/lotteryData";

type PrizeKey = keyof LotteryResult;

// ── Spinner icon for unrevealed numbers ───────────────────────────────────────
function Spinner() {
  const dots = 8;
  const r = 8;
  return (
    <svg
      className="animate-spin inline-block"
      style={{ width: "1em", height: "1em", verticalAlign: "middle" }}
      viewBox="0 0 24 24"
    >
      {Array.from({ length: dots }, (_, i) => {
        const angle = (i / dots) * 2 * Math.PI - Math.PI / 2;
        const cx = 12 + r * Math.cos(angle);
        const cy = 12 + r * Math.sin(angle);
        const opacity = (i + 1) / dots;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={1.6}
            fill="#f97316"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

// ── Expected number count per prize for MB ────────────────────────────────────
const MB_EXPECTED: Partial<Record<PrizeKey, number>> = {
  special: 1, first: 1, second: 2, third: 6,
  fourth: 4, fifth: 6, sixth: 3, seventh: 4,
};

// ── Expected count per prize for MN/MT (per station) ─────────────────────────
const MNMT_EXPECTED: Partial<Record<PrizeKey, number>> = {
  eighth: 1, seventh: 1, sixth: 3, fifth: 1,
  fourth: 7, third: 2, second: 1, first: 1, special: 1,
};

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
    case "special": return "text-red-700 font-extrabold";
    case "first":   return "text-red-600 font-extrabold";
    case "second":  return "text-blue-700 font-bold";
    case "third":   return "text-gray-800 font-bold";
    case "fourth":  return "text-gray-800 font-bold";
    case "fifth":   return "text-gray-800 font-bold";
    case "sixth":   return "text-blue-600 font-bold";
    case "seventh": return "text-red-600 font-extrabold";
    default:        return "text-gray-800 font-bold";
  }
}

// ── MN/MT number-cell text class ──────────────────────────────────────────────
function getMnMtNumClass(prizeKey: PrizeKey, stationIdx: number): string {
  switch (prizeKey) {
    case "special":
      return stationIdx % 2 === 0
        ? "text-red-600 font-extrabold"
        : "text-blue-600 font-extrabold";
    case "eighth":  return "text-red-600 font-extrabold";
    case "seventh": return "text-blue-700 font-bold";
    default:        return "text-gray-800 font-bold";
  }
}

// ── Font size per prize — clamp() scales from mobile to desktop ───────────────
const MB_FONT_SIZE: Partial<Record<PrizeKey, string>> = {
  special: "clamp(28px, 7vw, 48px)",
  first:   "clamp(22px, 5.5vw, 36px)",
  second:  "clamp(18px, 4.5vw, 30px)",
  third:   "clamp(15px, 3.5vw, 24px)",
  fourth:  "clamp(14px, 3vw, 22px)",
  fifth:   "clamp(14px, 3vw, 22px)",
  sixth:   "clamp(14px, 3vw, 22px)",
  seventh: "clamp(18px, 4vw, 28px)",
};

// Base font sizes for 3-station layout (px) — scales with station count
const MNMT_BASE_PX: Partial<Record<PrizeKey, number>> = {
  special: 26,
  first:   21,
  second:  21,
  third:   15,
  fourth:  14,
  fifth:   16,
  sixth:   16,
  seventh: 26,
  eighth:  40,
};

function getMnMtFontSize(key: PrizeKey, stationCount: number): string {
  const base = MNMT_BASE_PX[key] ?? 14;
  const scale = stationCount <= 2 ? 1.25 : stationCount <= 3 ? 1 : stationCount <= 4 ? 0.8 : 0.68;
  return `${Math.round(base * scale)}px`;
}

// ── Gap between numbers in a row ──────────────────────────────────────────────
const MB_GAP: Partial<Record<PrizeKey, string>> = {
  special: "clamp(8px, 2vw, 16px)",
  first:   "clamp(6px, 1.5vw, 12px)",
  second:  "clamp(10px, 2.5vw, 20px)",
  third:   "clamp(6px, 1.5vw, 12px)",
  fourth:  "clamp(6px, 1.5vw, 12px)",
  fifth:   "clamp(6px, 1.5vw, 12px)",
  sixth:   "clamp(8px, 2vw, 16px)",
  seventh: "clamp(8px, 2vw, 16px)",
};

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
  isLivePolling?: boolean;
}

export default function MultiStationTable({
  stations,
  region = "mb",
  revealed = new Set(),
  isComplete = true,
  isLivePolling = false,
}: Props) {
  if (stations.length === 0) return null;

  const isMb      = region === "mb";
  const drawOrder = isMb ? MB_ORDER : MNMT_ORDER;
  const labels    = isMb ? MB_LABELS : MNMT_LABELS;

  return (
    <div className="overflow-x-auto rounded-lg border border-red-200 shadow-md">
      <table
        className="w-full text-center border-collapse bg-white"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* ── Header ── */}
        <thead>
          <tr className="bg-red-700 text-white">
            <th className="py-1.5 px-1 text-xs font-bold border-r border-red-500 whitespace-nowrap text-red-200 w-10">
              CN
            </th>
            {stations.map((s) => (
              <th
                key={s.stationId}
                className="py-1.5 px-1 text-xs font-bold border-r border-red-500 last:border-r-0 text-center leading-tight"
              >
                {s.stationName}
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
                // When live polling, pad to expected count so spinners show
                const expectedCount = isLivePolling ? (MB_EXPECTED[prizeKey] ?? numbers.length) : numbers.length;
                const effectiveCount = Math.max(numbers.length, isLivePolling ? expectedCount : 1);
                const rows: (string | null)[][] = [];
                for (let i = 0; i < effectiveCount; i += cols) {
                  rows.push(Array.from({ length: cols }, (_, j) => numbers[i + j] ?? null));
                }

                const fontSize = MB_FONT_SIZE[prizeKey] ?? "14px";
                const gap     = MB_GAP[prizeKey] ?? "12px";

                return (
                  <tr key={prizeKey} className={`border-b border-gray-200 ${rowBg}`}>
                    {/* Label */}
                    <td className={`py-1.5 px-1 text-xs font-extrabold border-r border-red-200 align-middle whitespace-nowrap w-10 ${getLabelBg(prizeKey)}`}>
                      {labels[prizeKey]}
                    </td>

                    {/* All numbers in one cell */}
                    <td className="py-1.5 px-2">
                      <div className="flex flex-col items-center" style={{ gap: "2px" }}>
                        {rows.map((rowNums, rIdx) => (
                          <div key={rIdx} className="flex justify-center" style={{ gap }}>
                            {rowNums.map((num, nIdx) => {
                              const globalIdx = rIdx * cols + nIdx;
                              const isNew = revealed.has(`${prizeKey}-${globalIdx}`) && !isComplete;
                              if (num == null) {
                                return (
                                  <span
                                    key={nIdx}
                                    className="inline-flex items-center justify-center"
                                    style={{ fontSize, lineHeight: "1.3", minWidth: "2ch" }}
                                  >
                                    <Spinner />
                                  </span>
                                );
                              }
                              return (
                                <span
                                  key={nIdx}
                                  className={`inline-block transition-all duration-500 ${numClass} ${
                                    isNew ? "scale-125 animate-bounce" : ""
                                  }`}
                                  style={{ fontSize, lineHeight: "1.3" }}
                                >
                                  {num}
                                </span>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })

            : /* ──── MIỀN NAM / TRUNG: sub-rows per number across stations ──── */
              drawOrder
                .filter((prizeKey) =>
                  prizeKey !== "eighth" ||
                  isLivePolling ||
                  stations.some((s) => (s.results.eighth ?? []).length > 0)
                )
                .flatMap((prizeKey, prizeIdx) => {
                  const rawCount = Math.max(
                    0,
                    ...stations.map((s) => (s.results[prizeKey] ?? []).length)
                  );
                  const expectedPerStation = isLivePolling ? (MNMT_EXPECTED[prizeKey] ?? rawCount) : rawCount;
                  const maxCount = Math.max(1, rawCount, isLivePolling ? expectedPerStation : 0);

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
                              className={`py-1 px-1 text-xs font-extrabold border-r border-red-200 align-middle whitespace-nowrap w-10 ${getLabelBg(prizeKey)}`}
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
                            const numClass  = getMnMtNumClass(prizeKey, sIdx);
                            const fontSize  = getMnMtFontSize(prizeKey, stations.length);

                            return (
                              <td
                                key={s.stationId}
                                className="py-0.5 px-1 border-r border-gray-100 last:border-r-0 text-center"
                              >
                                {num != null ? (
                                  <span
                                    className={`inline-block transition-all duration-500 ${numClass} ${
                                      isNew ? "scale-125 animate-bounce" : ""
                                    }`}
                                    style={{ fontSize, lineHeight: "1.4" }}
                                  >
                                    {num}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center" style={{ fontSize, lineHeight: "1.4", minWidth: "2ch" }}>
                                    <Spinner />
                                  </span>
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
