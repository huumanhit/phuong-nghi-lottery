"use client";
import type { StationResult } from "../lib/lotteryData";

type PrizeKey = keyof import("../lib/lotteryData").LotteryResult;

interface NumberEntry {
  num: string;
  prizeKey: PrizeKey;
}

const PRIZE_ORDER: PrizeKey[] = [
  "special", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth",
];

function getNumColor(prizeKey: PrizeKey): string {
  switch (prizeKey) {
    case "special":
    case "first":   return "text-red-600 font-bold";
    case "second":  return "text-blue-600 font-bold";
    case "sixth":
    case "seventh": return "text-blue-500";
    default:        return "text-gray-800";
  }
}

interface Props {
  station: StationResult;
  mode: "units" | "tens";
  date?: string | null;
}

export default function LotoStationGrid({ station, mode, date }: Props) {
  // Collect all numbers with their prize
  const entries: NumberEntry[] = [];
  for (const prizeKey of PRIZE_ORDER) {
    for (const num of station.results[prizeKey] ?? []) {
      if (num.length >= 2) entries.push({ num, prizeKey });
    }
  }

  // Group by chosen digit
  const columns: NumberEntry[][] = Array.from({ length: 10 }, () => []);
  for (const entry of entries) {
    const { num } = entry;
    const digit = mode === "units"
      ? Number(num[num.length - 1])
      : Number(num[num.length - 2]);
    if (digit >= 0 && digit <= 9) columns[digit].push(entry);
  }

  const maxRows = Math.max(...columns.map((c) => c.length), 0);

  return (
    <div
      className="rounded-lg border border-amber-300 overflow-hidden mb-3"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Station header */}
      <div className="bg-amber-100 border-b border-amber-300 px-3 py-1.5 flex items-center justify-between">
        <span className="text-red-700 font-extrabold text-sm tracking-wide">
          {station.stationName.toUpperCase()}
          {date ? <span className="ml-2 font-normal text-gray-600 text-xs">- {date}</span> : null}
        </span>
      </div>

      {/* Grid */}
      <div
        className="w-full overflow-x-auto bg-white"
        style={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
      >
        {/* Column headers */}
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={`h-${i}`}
            className="text-center text-gray-500 text-xs font-bold py-1 bg-gray-50 border-b border-r border-gray-200 last:border-r-0"
          >
            {i}
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: maxRows }, (_, rowIdx) =>
          columns.map((col, colIdx) => {
            const entry = col[rowIdx];
            if (!entry) {
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className="border-r border-gray-100 last:border-r-0 h-6"
                />
              );
            }
            const { num, prizeKey } = entry;
            const colorClass = getNumColor(prizeKey);
            // Underline last 2 digits (the "lô")
            const prefix = num.slice(0, -2);
            const lo     = num.slice(-2);
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`text-center text-xs leading-6 border-r border-gray-100 last:border-r-0 ${colorClass}`}
              >
                {prefix}<u>{lo}</u>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
