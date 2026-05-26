"use client";
import { useCallback } from "react";

interface Props {
  hitNumbers: Set<string>;
  hitNumbers3?: Set<string>;
  digitMode?: "full" | "2so" | "3so";
  muted?: boolean;
}

export default function LotoGrid({
  hitNumbers,
  hitNumbers3 = new Set(),
  digitMode = "full",
  muted = true,
}: Props) {
  const speak = useCallback((text: string) => {
    if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "vi-VN";
    utt.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }, [muted]);

  const rows = Array.from({ length: 10 }, (_, i) => i);
  const cols = Array.from({ length: 10 }, (_, j) => j);
  const sorted3 = Array.from(hitNumbers3).sort();

  return (
    <div className="bg-white rounded-xl border border-red-200 shadow-md p-4">
      <h3 className="text-red-700 font-bold text-center mb-3 text-base uppercase tracking-wide">
        Bảng Lô Tô
      </h3>

      {/* ── 2-digit grid (full / 2so mode) ── */}
      {digitMode !== "3so" && (
        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-8 h-8 bg-red-700 text-white text-xs rounded-tl" />
                {cols.map((c) => (
                  <th key={c} className="w-9 h-8 bg-red-700 text-white text-xs font-bold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r}>
                  <td className="bg-red-700 text-white text-xs font-bold text-center w-8 h-8">{r}</td>
                  {cols.map((c) => {
                    const num = String(r * 10 + c).padStart(2, "0");
                    const isHit = hitNumbers.has(num);
                    return (
                      <td
                        key={c}
                        onClick={() => isHit && speak(num)}
                        className={`w-9 h-9 text-center font-mono font-semibold text-sm border border-red-100 transition-all duration-300 ${
                          isHit
                            ? "bg-red-600 text-white rounded shadow-inner scale-95 cursor-pointer"
                            : "text-gray-600 hover:bg-red-50"
                        }`}
                      >
                        {num}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3-digit view ── */}
      {digitMode === "3so" && (
        <div>
          {sorted3.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Chưa có dữ liệu 3 số</p>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {sorted3.map((num) => (
                <button
                  key={num}
                  onClick={() => speak(num)}
                  className="px-3 py-2 bg-red-600 text-white font-mono font-bold text-sm rounded-lg shadow-sm hover:bg-red-700 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-3">
            {sorted3.length} số 3 chữ số đã về
          </p>
        </div>
      )}

      {/* ── Legend ── */}
      {digitMode !== "3so" && (
        <div className="flex items-center gap-4 mt-3 justify-center text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-600 rounded inline-block" />
            <span>Đã về</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-white border border-gray-300 rounded inline-block" />
            <span>Chưa về</span>
          </div>
          <div className="font-semibold text-red-700">{hitNumbers.size} / 100 số</div>
        </div>
      )}
    </div>
  );
}
