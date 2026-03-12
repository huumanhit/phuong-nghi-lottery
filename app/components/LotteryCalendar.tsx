"use client";
import { useState } from "react";

interface Props {
  onDateSelect: (dateIso: string) => void;
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const DOW_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function LotteryCalendar({ onDateSelect }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  const today = now;
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  // First day of the view month
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    // Don't navigate past current month
    const nextIsAfterToday =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
    if (nextIsAfterToday) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  // Cells: empty slots before day 1, then days 1..daysInMonth
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-4">
      {/* Header */}
      <div className="bg-red-700 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="text-white hover:text-yellow-300 font-bold text-lg leading-none px-1 transition-colors"
          aria-label="Tháng trước"
        >
          ‹
        </button>
        <span className="text-white font-bold text-sm">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={`font-bold text-lg leading-none px-1 transition-colors ${
            isCurrentMonth ? "text-red-400 cursor-not-allowed" : "text-white hover:text-yellow-300"
          }`}
          aria-label="Tháng sau"
        >
          ›
        </button>
      </div>

      <div className="p-3">
        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-1">
          {DOW_LABELS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-bold py-1 ${
                i === 0 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />;
            }

            const iso = toIso(viewYear, viewMonth, day);
            const isToday = iso === todayIso;
            const isFuture = iso > todayIso;
            const dow = (firstDay + day - 1) % 7;
            const isSun = dow === 0;

            return (
              <button
                key={day}
                disabled={isFuture}
                onClick={() => onDateSelect(iso)}
                className={`
                  text-xs font-semibold py-1.5 rounded transition-all text-center
                  ${isFuture ? "text-gray-200 cursor-not-allowed" : "hover:bg-red-100 active:scale-95 cursor-pointer"}
                  ${isToday ? "bg-red-600 text-white hover:bg-red-700 font-extrabold rounded-full" : ""}
                  ${!isToday && isSun && !isFuture ? "text-red-500" : ""}
                  ${!isToday && !isSun && !isFuture ? "text-gray-700" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
