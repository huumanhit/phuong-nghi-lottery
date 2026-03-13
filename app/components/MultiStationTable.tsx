"use client";
import { Fragment } from "react";
import type { LotteryResult, StationResult } from "../lib/lotteryData";

type PrizeKey = keyof LotteryResult;

// Draw order: lowest prize first (matches Vietnamese live draw convention)
const DRAW_ORDER: PrizeKey[] = [
  "eighth", "seventh", "sixth", "fifth", "fourth", "third", "second", "first", "special",
];

const MONEY_LABELS: Record<PrizeKey, string> = {
  special: "ĐB",
  first:   "Nhất",
  second:  "Nhì",
  third:   "Ba",
  fourth:  "Tư",
  fifth:   "Năm",
  sixth:   "Sáu",
  seventh: "Bảy",
  eighth:  "Tám",
};

interface Props {
  stations: StationResult[];
  revealed?: Set<string>;
  isComplete?: boolean;
}

export default function MultiStationTable({
  stations,
  revealed = new Set(),
  isComplete = true,
}: Props) {
  if (stations.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-red-200 shadow-md">
      <table className="w-full text-center border-collapse bg-white text-sm min-w-[320px]">
        <thead>
          <tr className="bg-red-700 text-white">
            <th className="py-2 px-3 text-xs font-bold w-16 border-r border-red-600 whitespace-nowrap">
              Giải
            </th>
            {stations.map((s) => (
              <th
                key={s.stationId}
                className="py-2 px-3 text-sm font-bold border-r border-red-600 last:border-r-0"
              >
                {s.stationName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DRAW_ORDER.filter((prizeKey) =>
            // Only show eighth row when at least one station has eighth data
            prizeKey !== "eighth" || stations.some((s) => (s.results.eighth ?? []).length > 0)
          ).flatMap((prizeKey, prizeIdx) => {
            const maxCount = Math.max(
              1,
              ...stations.map((s) => (s.results[prizeKey] ?? []).length)
            );
            const isSpecial = prizeKey === "special";
            const isFirst   = prizeKey === "first";
            const isSecond  = prizeKey === "second";
            const isThird   = prizeKey === "third";

            return Array.from({ length: maxCount }, (_, rowIdx) => {
              const isFirstSubRow = rowIdx === 0;
              const rowBg = isSpecial
                ? "bg-red-50"
                : isFirst
                ? "bg-yellow-50"
                : prizeIdx % 2 === 0
                ? "bg-gray-50"
                : "bg-white";

              return (
                <Fragment key={`${prizeKey}-${rowIdx}`}>
                  <tr className={`border-b border-red-100 ${rowBg}`}>
                    {/* Prize label — spans all sub-rows via rowSpan */}
                    {isFirstSubRow && (
                      <td
                        rowSpan={maxCount}
                        className={`py-1.5 px-2 text-xs font-bold border-r border-red-200 align-middle whitespace-nowrap ${
                          isSpecial
                            ? "bg-red-600 text-white text-sm"
                            : isFirst
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {MONEY_LABELS[prizeKey]}
                      </td>
                    )}

                    {/* Number cells */}
                    {stations.map((s) => {
                      const num = (s.results[prizeKey] ?? [])[rowIdx];
                      const revealKey = `${prizeKey}-${rowIdx}`;
                      const isNew = revealed.has(revealKey) && !isComplete;

                      return (
                        <td
                          key={s.stationId}
                          className={`py-1.5 px-2 border-r border-red-100 last:border-r-0 ${
                            isSpecial
                              ? "text-red-700 text-2xl font-extrabold"
                              : isFirst
                              ? "text-red-700 text-xl font-bold"
                              : isSecond
                              ? "text-blue-700 text-lg font-bold"
                              : isThird
                              ? "text-green-700 font-semibold"
                              : "text-gray-800 font-medium"
                          }`}
                        >
                          {num != null ? (
                            <span
                              className={`inline-block transition-all duration-500 ${
                                isNew
                                  ? "scale-125 text-red-500 font-extrabold animate-bounce"
                                  : ""
                              } ${
                                isSpecial
                                  ? "bg-red-100 border-2 border-red-500 rounded-lg px-3 py-1"
                                  : ""
                              }`}
                            >
                              {num}
                            </span>
                          ) : (
                            <span className="text-gray-200 text-xs">—</span>
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
