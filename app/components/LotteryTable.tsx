"use client";
import { LotteryResult, PRIZE_LABELS, PRIZE_ORDER } from "../lib/lotteryData";

interface Props {
  result: Partial<LotteryResult>;
  revealed: Set<string>;
  isComplete: boolean;
}

const PRIZE_COLORS: Record<string, string> = {
  special: "bg-red-600 text-white text-3xl font-extrabold",
  first: "text-red-700 text-2xl font-bold",
  second: "text-blue-700 text-xl font-bold",
  third: "text-green-700 text-lg font-semibold",
  fourth: "text-gray-800 text-base font-semibold",
  fifth: "text-gray-800 text-base font-semibold",
  sixth: "text-gray-800 text-base font-semibold",
  seventh: "text-gray-800 text-base font-semibold",
};

function NumberCell({ number, isNew }: { number: string; isNew?: boolean }) {
  return (
    <span
      className={`inline-block px-1 transition-all duration-500 ${
        isNew ? "scale-110 text-red-600 font-extrabold animate-bounce" : ""
      }`}
    >
      {number}
    </span>
  );
}

export default function LotteryTable({ result, revealed, isComplete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-red-200 shadow-md bg-white">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-red-700 text-white">
            <th className="py-2 px-4 text-sm font-bold w-28">Giải</th>
            <th className="py-2 px-4 text-sm font-bold">Kết Quả</th>
          </tr>
        </thead>
        <tbody>
          {PRIZE_ORDER.map((prizeKey, idx) => {
            const numbers: string[] = (result as LotteryResult)?.[prizeKey as keyof LotteryResult] ?? [];
            const isSpecial = prizeKey === "special";
            return (
              <tr
                key={prizeKey}
                className={`border-b border-red-100 ${idx % 2 === 0 ? "bg-red-50" : "bg-white"}`}
              >
                <td className="py-2 px-4 text-sm font-bold text-red-800 whitespace-nowrap border-r border-red-200">
                  {PRIZE_LABELS[prizeKey]}
                </td>
                <td className={`py-2 px-4 ${PRIZE_COLORS[prizeKey]}`}>
                  {numbers.length === 0 ? (
                    <span className="text-gray-300 text-lg">—</span>
                  ) : (
                    <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1`}>
                      {numbers.map((num, i) => (
                        <div
                          key={i}
                          className={`${
                            isSpecial
                              ? "bg-red-100 border-2 border-red-600 rounded-lg px-3 py-1 text-4xl text-red-700 font-extrabold shadow-md"
                              : ""
                          }`}
                        >
                          <NumberCell
                            number={num}
                            isNew={revealed.has(`${prizeKey}-${i}`) && !isComplete}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
