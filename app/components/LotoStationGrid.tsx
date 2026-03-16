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
    case "first":   return "text-red-600 font-extrabold";
    case "second":  return "text-blue-700 font-extrabold";
    case "sixth":
    case "seventh": return "text-blue-600 font-bold";
    default:        return "text-gray-800 font-bold";
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

  // Group by chosen digit (0-9)
  const columns: NumberEntry[][] = Array.from({ length: 10 }, () => []);
  for (const entry of entries) {
    const { num } = entry;
    const digit = mode === "units"
      ? Number(num[num.length - 1])
      : Number(num[num.length - 2]);
    if (digit >= 0 && digit <= 9) columns[digit].push(entry);
  }

  const maxRows = Math.max(...columns.map((c) => c.length), 1);

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

      {/* Table — fixed layout so columns never overflow into each other */}
      <div className="overflow-x-auto bg-white">
        <table
          className="border-collapse bg-white"
          style={{
            tableLayout: "fixed",
            width: "100%",
            minWidth: "420px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {/* Fixed column widths */}
          <colgroup>
            {Array.from({ length: 10 }, (_, i) => (
              <col key={i} style={{ width: "10%" }} />
            ))}
          </colgroup>

          {/* Column headers */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {Array.from({ length: 10 }, (_, i) => (
                <th
                  key={i}
                  className="text-center text-gray-500 font-bold py-1 border-r border-gray-200 last:border-r-0"
                  style={{ fontSize: "11px" }}
                >
                  {i}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {Array.from({ length: maxRows }, (_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => {
                  const entry = col[rowIdx];
                  if (!entry) {
                    return (
                      <td
                        key={colIdx}
                        className="border-r border-gray-100 last:border-r-0"
                        style={{ height: "22px" }}
                      />
                    );
                  }
                  const { num, prizeKey } = entry;
                  const colorClass = getNumColor(prizeKey);
                  // Underline the last 2 digits (the "lô")
                  const prefix = num.slice(0, -2);
                  const lo     = num.slice(-2);
                  return (
                    <td
                      key={colIdx}
                      className={`text-center border-r border-gray-100 last:border-r-0 ${colorClass}`}
                      style={{
                        height: "24px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        padding: "0 2px",
                        lineHeight: "24px",
                      }}
                    >
                      {prefix}<u className="font-extrabold">{lo}</u>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
