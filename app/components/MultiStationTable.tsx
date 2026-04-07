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
    case "second":  return "text-blue-700 font-extrabold";
    case "third":   return "text-gray-800 font-extrabold";
    case "fourth":  return "text-gray-800 font-extrabold";
    case "fifth":   return "text-gray-800 font-extrabold";
    case "sixth":   return "text-blue-600 font-extrabold";
    case "seventh": return "text-red-600 font-extrabold";
    default:        return "text-gray-800 font-extrabold";
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
    case "seventh": return "text-blue-700 font-extrabold";
    default:        return "text-gray-800 font-extrabold";
  }
}

// ── Font size MB — đồng nhất tất cả giải giống MN ────────────────────────────
// Bottleneck: G4 (4 số/hàng × 5 chữ số) → (290px - 3×9px_gap) / (4×5×0.6) ≈ 22px @ 375px
// ĐB dùng size lớn hơn vì chỉ có 1 số/hàng
const MB_FONT_SIZE_BASE    = "clamp(17px, 5.8vw, 26px)"; // ~22px @ 375px — tất cả giải
const MB_FONT_SIZE_SPECIAL = "clamp(26px, 8.5vw, 38px)"; // ~32px @ 375px — ĐB (1 số/hàng)

// Tất cả giải dùng cùng 1 size base (5 chữ số là nhiều nhất → giới hạn)
// Col available @ 375px, 3 đài = (375-52)/3 - 8 ≈ 99px
// Safe: 99 / (5 digits × 0.72em) ≈ 27.5px → 7.3vw @ 375px
// Col = (375 - 52px label) / 3 đài - 2px padding ≈ 105px
// 5 chữ số × font × 0.72em_ratio ≤ 105 → font ≤ 29px → 7.7vw @ 375px (safe: 6.5vw)
const BASE_VW   = 6.5;
const BASE_MIN  = 14;
const BASE_MAX  = 28;
const EIGHTH_VW  = 9.0;  // G8 (2 chữ số) lớn hơn 1 chút
const EIGHTH_MIN = 18;
const EIGHTH_MAX = 38;

function getMnMtFontSize(key: PrizeKey, stationCount: number): string {
  const isEighth = key === "eighth";
  const vw  = isEighth ? EIGHTH_VW  : BASE_VW;
  const min = isEighth ? EIGHTH_MIN : BASE_MIN;
  const max = isEighth ? EIGHTH_MAX : BASE_MAX;
  // Không scale khi stationCount < 3 để giữ font đồng nhất với MN
  const stationScale = stationCount >= 3 ? 3 / stationCount : 1;
  // Giải đặc biệt có 6 chữ số (các giải khác 5 chữ số) → scale nhỏ lại để vừa cell
  const digitScale = key === "special" ? 5 / 6 : 1;
  const scaledVw  = (vw  * stationScale * digitScale).toFixed(1);
  const scaledMax = Math.round(max * stationScale * digitScale);
  return `clamp(${min}px, ${scaledVw}vw, ${scaledMax}px)`;
}

function getMnMtCellPadding(key: PrizeKey): string {
  if (key === "eighth" || key === "special") return "py-2";
  if (key === "seventh" || key === "first") return "py-1.5";
  return "py-1";
}

// ── Gap between numbers in a row ──────────────────────────────────────────────
const MB_GAP: Partial<Record<PrizeKey, string>> = {
  special: "clamp(16px, 4vw, 28px)",
  first:   "clamp(16px, 4vw, 28px)",
  second:  "clamp(20px, 5vw, 32px)",
  third:   "clamp(12px, 3vw, 20px)",
  fourth:  "clamp(10px, 2.5vw, 16px)",
  fifth:   "clamp(12px, 3vw, 20px)",
  sixth:   "clamp(14px, 3.5vw, 22px)",
  seventh: "clamp(14px, 3.5vw, 22px)",
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
    <div className="rounded-lg border border-red-200 shadow-md overflow-hidden">
      <table
        className="w-full text-center border-collapse bg-white"
        style={{ fontFamily: "Arial, Helvetica, sans-serif", tableLayout: "fixed" }}
      >
        {/* ── Header ── */}
        <thead>
          <tr className="bg-red-700 text-white">
            <th className="py-1.5 px-1 text-xs font-bold border-r border-red-500 whitespace-nowrap text-red-200" style={{ width: "52px" }}>
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

                const fontSize = prizeKey === "special" ? MB_FONT_SIZE_SPECIAL : MB_FONT_SIZE_BASE;
                const gap     = MB_GAP[prizeKey] ?? "8px";

                return (
                  <tr key={prizeKey} className={`border-b border-gray-200 ${rowBg}`}>
                    {/* Label */}
                    <td className={`py-1.5 px-1 text-xs font-extrabold border-r border-red-200 align-middle text-center leading-tight ${getLabelBg(prizeKey)}`}>
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
                            const cellPad   = getMnMtCellPadding(prizeKey);

                            return (
                              <td
                                key={s.stationId}
                                className={`${cellPad} px-0.5 border-r border-gray-200 last:border-r-0 text-center`}
                                style={{ overflow: "hidden", wordBreak: "keep-all" }}
                              >
                                {num != null ? (
                                  <span
                                    className={`inline-block transition-all duration-500 ${numClass} ${
                                      isNew ? "scale-125 animate-bounce" : ""
                                    }`}
                                    style={{ fontSize, lineHeight: "1.4", letterSpacing: "-0.02em" }}
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
