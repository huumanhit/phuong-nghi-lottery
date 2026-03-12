"use client";
import { useState, useCallback } from "react";
import type { LotteryResult } from "../lib/lotteryData";
import { PRIZE_LABELS, ALL_STATIONS } from "../lib/lotteryData";
import type { LotteryServiceResult } from "@/services/lotteryService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WinResult {
  prizeKey: keyof LotteryResult;
  prizeLabel: string;
  matchedNumber: string;
}

// ---------------------------------------------------------------------------
// Checking logic — last N digits of ticket vs prize number (N = prize digits)
// ---------------------------------------------------------------------------

const PRIZE_ORDER: Array<keyof LotteryResult> = [
  "special", "first", "second", "third", "fourth", "fifth", "sixth", "seventh",
];

function checkTicket(ticket: string, result: LotteryResult): WinResult | null {
  for (const key of PRIZE_ORDER) {
    for (const prizeNum of result[key]) {
      const n = prizeNum.length;
      if (n > ticket.length) continue;
      if (ticket.slice(-n) === prizeNum) {
        return { prizeKey: key, prizeLabel: PRIZE_LABELS[key], matchedNumber: prizeNum };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoToVN(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TicketChecker() {
  const [stationId, setStationId]             = useState<string>("ha-noi");
  const [selectedDate, setSelectedDate]       = useState<string>("");
  const [ticketNumber, setTicketNumber]       = useState<string>("");
  const [loading, setLoading]                 = useState(false);
  const [fetchError, setFetchError]           = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [winResult, setWinResult]             = useState<WinResult | null>(null);
  const [checked, setChecked]                 = useState(false);

  const selectedStation = ALL_STATIONS.find((s) => s.id === stationId);
  const region = selectedStation?.region ?? "mb";

  const handleTicketInput = useCallback((val: string) => {
    setTicketNumber(val.replace(/\D/g, "").slice(0, 6));
    setValidationError(null);
    setChecked(false);
  }, []);

  const handleCheck = useCallback(async () => {
    setFetchError(null);
    setChecked(false);
    setWinResult(null);

    if (!/^\d{6}$/.test(ticketNumber)) {
      setValidationError("Số vé phải có đúng 6 chữ số");
      return;
    }
    if (!selectedDate) {
      setValidationError("Vui lòng chọn ngày xổ");
      return;
    }
    setValidationError(null);

    setLoading(true);
    try {
      const res = await fetch(`/api/lottery?region=${region}&date=${selectedDate}`);
      if (!res.ok) throw new Error(`Lỗi máy chủ: HTTP ${res.status}`);
      const data = (await res.json()) as LotteryServiceResult;
      if (data.error) throw new Error(data.error);
      if (!data.data) throw new Error("Không có dữ liệu xổ số cho ngày này");

      setWinResult(checkTicket(ticketNumber, data.data));
      setChecked(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [region, selectedDate, ticketNumber]);

  const handleReset = () => {
    setTicketNumber("");
    setSelectedDate("");
    setChecked(false);
    setWinResult(null);
    setFetchError(null);
    setValidationError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-red-800">Kiểm Tra Vé Số</h1>
          <p className="text-gray-500 text-sm mt-1">Nhập thông tin vé để kiểm tra kết quả trúng thưởng</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-red-700 px-5 py-3">
            <span className="text-white font-bold text-lg">Thông Tin Vé Số</span>
          </div>

          <div className="p-5 space-y-5">

            {/* Station / Province select */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Đài xổ số <span className="text-red-600">*</span>
              </label>
              <select
                value={stationId}
                onChange={(e) => { setStationId(e.target.value); setChecked(false); }}
                className="w-full border-2 border-red-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
              >
                <optgroup label="Miền Bắc">
                  {ALL_STATIONS.filter((s) => s.region === "mb").map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Miền Trung">
                  {ALL_STATIONS.filter((s) => s.region === "mt").map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Miền Nam">
                  {ALL_STATIONS.filter((s) => s.region === "mn").map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
              {selectedStation && (
                <p className="mt-1 text-xs text-gray-400">
                  Khu vực:{" "}
                  <span className="font-semibold text-red-600">
                    {region === "mb" ? "Miền Bắc" : region === "mt" ? "Miền Trung" : "Miền Nam"}
                  </span>
                </p>
              )}
            </div>

            {/* Draw Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày xổ <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                max={todayIso()}
                onChange={(e) => { setSelectedDate(e.target.value); setChecked(false); }}
                className="w-full border-2 border-red-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            {/* Ticket Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Số vé <span className="text-red-600">*</span>
                <span className="ml-2 text-xs text-gray-400 font-normal">(6 chữ số)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ví dụ: 123456"
                value={ticketNumber}
                onChange={(e) => handleTicketInput(e.target.value)}
                maxLength={6}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-xl font-bold text-center tracking-widest focus:outline-none focus:ring-2 transition-all ${
                  validationError
                    ? "border-red-500 focus:ring-red-400 text-red-600"
                    : "border-red-200 focus:ring-red-400 text-gray-800"
                }`}
              />
              <div className="flex justify-between mt-1">
                {validationError ? (
                  <p className="text-red-500 text-xs">{validationError}</p>
                ) : <span />}
                <p className={`text-xs ml-auto ${ticketNumber.length === 6 ? "text-green-600" : "text-gray-400"}`}>
                  {ticketNumber.length}/6
                </p>
              </div>
            </div>

            {/* Fetch error */}
            {fetchError && (
              <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm flex gap-2">
                <span className="font-bold">⚠</span>
                <span>{fetchError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                disabled={loading || ticketNumber.length !== 6}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                  loading || ticketNumber.length !== 6
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-700 hover:bg-red-800 text-white shadow-md hover:shadow-lg active:scale-95"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang kiểm tra...
                  </span>
                ) : "🔍 Kiểm Tra Vé"}
              </button>
              {checked && (
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-lg font-bold text-sm border-2 border-red-700 text-red-700 hover:bg-red-50 active:scale-95 transition-all"
                >
                  Nhập lại
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {checked && !fetchError && (
          <div className="mt-5 rounded-xl shadow-md overflow-hidden">
            {winResult ? (
              <div className="bg-green-600">
                <div className="px-5 py-4 text-center">
                  <div className="text-5xl mb-2">🎉</div>
                  <div className="text-white font-extrabold text-2xl">TRÚNG THƯỞNG!</div>
                  <div className="text-green-100 text-sm mt-1">
                    Vé số <span className="font-bold text-white">{ticketNumber}</span>
                    {" "}— {selectedStation?.name} — ngày {isoToVN(selectedDate)}
                  </div>
                </div>
                <div className="bg-white mx-4 mb-4 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-xs mb-1">Giải thưởng</p>
                  <p className="text-red-700 font-extrabold text-3xl">{winResult.prizeLabel}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    Khớp với số <span className="font-bold text-gray-700">{winResult.matchedNumber}</span>
                  </p>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-green-100 text-xs text-center">
                    Vui lòng đến đại lý xổ số để nhận thưởng trong vòng 60 ngày kể từ ngày xổ
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200">
                <div className="px-5 py-6 text-center">
                  <div className="text-5xl mb-3">😔</div>
                  <div className="text-gray-700 font-extrabold text-xl">Không Trúng Thưởng</div>
                  <div className="text-gray-400 text-sm mt-2">
                    Vé số <span className="font-semibold text-gray-600">{ticketNumber}</span> không trúng giải nào
                    <br />ngày {isoToVN(selectedDate)} — {selectedStation?.name}
                  </div>
                  <p className="text-gray-400 text-xs mt-4">Chúc bạn may mắn lần sau! 🍀</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        {!checked && (
          <div className="mt-5 bg-white rounded-xl border border-red-100 shadow-sm p-4">
            <h3 className="font-bold text-red-700 text-sm mb-2">Cách kiểm tra</h3>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li className="flex gap-2"><span className="text-red-400 font-bold">1.</span> Chọn đài xổ số (tỉnh/thành)</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">2.</span> Chọn ngày xổ trên vé của bạn</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">3.</span> Nhập đủ 6 chữ số trên vé</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">4.</span> Nhấn &quot;Kiểm Tra Vé&quot; để xem kết quả</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
