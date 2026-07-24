"use client";
import { useState, useCallback } from "react";
import type { LotteryResult, DailyRegionResult } from "../lib/lotteryData";
import {
  PRIZE_LABELS,
  ALL_STATIONS,
  normalizeStationName,
  stationSlug,
  getStationsForDate,
  getDowLabel,
} from "../lib/lotteryData";

// ---------------------------------------------------------------------------
// Win-check logic
// ---------------------------------------------------------------------------

// Prize money by region
const MNMT_PRIZE_MONEY: Record<string, number> = {
  special:     2_000_000_000,
  special_sub:    50_000_000,
  first:          30_000_000,
  second:         15_000_000,
  third:          10_000_000,
  consolation:     6_000_000,
  fourth:          3_000_000,
  fifth:           1_000_000,
  sixth:             400_000,
  seventh:           200_000,
  eighth:            100_000,
};

const MB_PRIZE_MONEY: Record<string, number> = {
  special:     2_000_000_000,
  special_sub:    20_000_000,
  first:          10_000_000,
  second:          5_000_000,
  third:           1_000_000,
  fourth:            400_000,
  fifth:             200_000,
  sixth:             100_000,
  seventh:            40_000,
  consolation:        40_000,
};

function formatMoney(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

interface WinResult {
  prizeKey:      string;
  prizeLabel:    string;
  matchedNumber: string;
}

function checkTicket(ticket: string, result: LotteryResult, region: string): WinResult | null {
  const cleanTicket = ticket.trim().replace(/\D/g, "");
  if (!cleanTicket) return null;

  // Clean all numbers in result
  const cleanedResult: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(result)) {
    cleanedResult[k] = ((v as string[]) || []).map((num: string) => num.trim().replace(/\D/g, "")).filter(Boolean);
  }

  const specialNums = cleanedResult["special"] || [];

  if (region !== "mb") {
    // -----------------------------------------------------------------------
    // MIỀN NAM & MIỀN TRUNG (Vé 6 chữ số)
    // -----------------------------------------------------------------------
    if (cleanTicket.length === 6 && specialNums.length > 0) {
      const specialNum = specialNums[0];

      if (specialNum.length === 6) {
        // 1. GIẢI ĐẶC BIỆT (2 TỶ): Trùng khớp cả 6 chữ số
        if (cleanTicket === specialNum) {
          return { prizeKey: "special", prizeLabel: "Giải Đặc Biệt", matchedNumber: specialNum };
        }

        // 2. GIẢI PHỤ ĐẶC BIỆT (50 TRIỆU): Trúng 5 số cuối của Giải Đặc Biệt (chỉ sai số đầu tiên)
        if (cleanTicket[0] !== specialNum[0] && cleanTicket.slice(1) === specialNum.slice(1)) {
          return { prizeKey: "special_sub", prizeLabel: "Giải Phụ Đặc Biệt", matchedNumber: specialNum.slice(1) };
        }

        // 3. Giải Nhất (30M), Giải Nhì (15M), Giải Ba (10M) - So 5 số cuối
        for (const key of ["first", "second", "third"] as const) {
          for (const prizeNum of cleanedResult[key] || []) {
            if (prizeNum.length === 5 && cleanTicket.slice(-5) === prizeNum) {
              return { prizeKey: key, prizeLabel: PRIZE_LABELS[key] || key, matchedNumber: prizeNum };
            }
          }
        }

        // 4. GIẢI KHUYẾN KHÍCH (6 TRIỆU): Trúng số đầu tiên, sai 1 số duy nhất trong 5 số còn lại của GĐB
        if (cleanTicket[0] === specialNum[0]) {
          let diffCount = 0;
          for (let i = 1; i < 6; i++) {
            if (cleanTicket[i] !== specialNum[i]) diffCount++;
          }
          if (diffCount === 1) {
            return { prizeKey: "consolation", prizeLabel: "Giải Khuyến Khích", matchedNumber: specialNum };
          }
        }

        // 5. Các giải còn lại: Giải Tư (3M), Giải Năm (1M), Giải Sáu (400k), Giải Bảy (200k), Giải Tám (100k)
        for (const key of ["fourth", "fifth", "sixth", "seventh", "eighth"] as const) {
          for (const prizeNum of cleanedResult[key] || []) {
            const n = prizeNum.length;
            if (n > 0 && n <= cleanTicket.length && cleanTicket.slice(-n) === prizeNum) {
              return { prizeKey: key, prizeLabel: PRIZE_LABELS[key] || key, matchedNumber: prizeNum };
            }
          }
        }

        return null;
      }
    }
  } else {
    // -----------------------------------------------------------------------
    // MIỀN BẮC (Vé 5 chữ số)
    // -----------------------------------------------------------------------
    if (cleanTicket.length === 5 && specialNums.length > 0) {
      const specialNum = specialNums[0];
      if (specialNum.length === 5 && cleanTicket === specialNum) {
        return { prizeKey: "special", prizeLabel: "Giải Đặc Biệt", matchedNumber: specialNum };
      }
    }
  }

  // Fallback: Standard suffix checking order
  const standardOrder = [
    "special", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"
  ];

  for (const key of standardOrder) {
    for (const prizeNum of cleanedResult[key] || []) {
      const n = prizeNum.length;
      if (n > 0 && n <= cleanTicket.length && cleanTicket.slice(-n) === prizeNum) {
        return { prizeKey: key, prizeLabel: PRIZE_LABELS[key] || key, matchedNumber: prizeNum };
      }
    }
  }

  // Miền Bắc: 2 số cuối trùng 2 số cuối Giải Đặc Biệt (Giải Khuyến Khích MB)
  if (region === "mb" && cleanTicket.length === 5 && specialNums.length > 0) {
    const specialNum = specialNums[0];
    if (specialNum.length === 5 && cleanTicket.slice(-2) === specialNum.slice(-2)) {
      return { prizeKey: "consolation", prizeLabel: "Giải Khuyến Khích (ĐB)", matchedNumber: specialNum.slice(-2) };
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

/** Kiểm tra xem hiện tại đã qua giờ quay số chưa (giờ VN = UTC+7) */
function isAfterDrawTime(region: string): boolean {
  const now = new Date();
  const vnMinutes = ((now.getUTCHours() + 7) % 24) * 60 + now.getUTCMinutes();
  // MB: kết quả lúc ~18:30 | MN/MT: kết quả lúc ~16:30
  return region === "mb" ? vnMinutes >= 18 * 60 + 35 : vnMinutes >= 16 * 60 + 35;
}

function getDrawTimeLabel(region: string): string {
  return region === "mb" ? "18:30" : "16:30";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TicketChecker() {
  const [selectedDate, setSelectedDate]       = useState<string>(todayIso);
  const [stationId, setStationId]             = useState<string>("");
  const [ticketNumber, setTicketNumber]       = useState<string>("");
  const [loading, setLoading]                 = useState(false);
  const [fetchError, setFetchError]           = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [winResult, setWinResult]             = useState<WinResult | null>(null);
  const [checked, setChecked]                 = useState(false);

  const availableStations = getStationsForDate(selectedDate);
  const stationsToDisplay = availableStations.length > 0 ? availableStations : ALL_STATIONS;
  const selectedStation   = ALL_STATIONS.find((s) => s.id === stationId) ?? null;
  const region            = selectedStation?.region ?? "mn";

  // MB = 5 digits, MN/MT = 6 digits
  const requiredDigits = region === "mb" ? 5 : 6;

  // Day-of-week label
  const dowLabel = getDowLabel(selectedDate);

  const handleDateChange = (iso: string) => {
    setSelectedDate(iso);
    setStationId("");
    setTicketNumber("");
    setChecked(false);
    setWinResult(null);
    setFetchError(null);
    setValidationError(null);
  };

  const handleStationChange = (id: string) => {
    setStationId(id);
    setTicketNumber("");
    setChecked(false);
    setValidationError(null);
  };

  const handleTicketInput = useCallback((val: string) => {
    setTicketNumber(val.replace(/\D/g, "").slice(0, requiredDigits));
    setValidationError(null);
    setChecked(false);
  }, [requiredDigits]);

  const handleCheck = useCallback(async () => {
    setFetchError(null);
    setChecked(false);
    setWinResult(null);

    const re = new RegExp(`^\\d{${requiredDigits}}$`);
    if (!re.test(ticketNumber)) {
      setValidationError(`Số vé phải có đúng ${requiredDigits} chữ số`);
      return;
    }
    if (!selectedDate) { setValidationError("Vui lòng chọn ngày xổ"); return; }
    if (!stationId)    { setValidationError("Vui lòng chọn đài xổ số"); return; }
    setValidationError(null);

    setLoading(true);
    try {
      const res = await fetch(`/api/lottery/daily?region=${region}&date=${selectedDate}`);
      if (!res.ok) throw new Error(`Lỗi máy chủ: HTTP ${res.status}`);
      const data = (await res.json()) as DailyRegionResult;
      if (data.error && data.stations.length === 0) throw new Error(data.error);
      if (data.stations.length === 0) throw new Error("Không có dữ liệu xổ số cho ngày này");

      // Match station accurately using slug and normalized name
      const targetSlug = stationId || (selectedStation ? stationSlug(selectedStation.name) : "");
      const targetNameNorm = selectedStation ? normalizeStationName(selectedStation.name) : "";

      const station =
        data.stations.find((s) => s.stationId === targetSlug) ??
        data.stations.find((s) => stationSlug(s.stationName) === targetSlug) ??
        data.stations.find((s) => normalizeStationName(s.stationName) === targetNameNorm) ??
        data.stations[0];

      setWinResult(checkTicket(ticketNumber, station.results, region));
      setChecked(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [region, selectedDate, stationId, selectedStation, ticketNumber, requiredDigits]);

  const handleReset = () => {
    setTicketNumber("");
    setSelectedDate(todayIso());
    setStationId("");
    setChecked(false);
    setWinResult(null);
    setFetchError(null);
    setValidationError(null);
  };

  const regionLabel = region === "mb" ? "Miền Bắc" : region === "mt" ? "Miền Trung" : "Miền Nam";
  const regionColor = region === "mb" ? "text-blue-600" : region === "mt" ? "text-orange-600" : "text-green-600";

  // Kiểm tra nếu đang chọn hôm nay mà chưa qua giờ quay số
  const isToday       = selectedDate === todayIso();
  const resultPending = isToday && stationId && !isAfterDrawTime(region);
  const drawTime      = getDrawTimeLabel(region);

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

            {/* ── Bước 1: Ngày xổ ── */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full inline-flex items-center justify-center">1</span>
                  Ngày xổ <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="date"
                value={selectedDate}
                max={todayIso()}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border-2 border-red-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              {dowLabel && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {dowLabel} · {availableStations.length > 0 ? `${availableStations.length} đài xổ ngày này` : "Tất cả các đài"}
                </p>
              )}
            </div>

            {/* ── Bước 2: Đài xổ số (filtered by date) ── */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full inline-flex items-center justify-center">2</span>
                  Đài xổ số <span className="text-red-600">*</span>
                </span>
              </label>

              <select
                value={stationId}
                onChange={(e) => handleStationChange(e.target.value)}
                className="w-full border-2 border-red-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
              >
                <option value="">Chọn đài ({stationsToDisplay.length} đài)...</option>
                {(["mb", "mt", "mn"] as const).map((r) => {
                  const group = stationsToDisplay.filter((s) => s.region === r);
                  if (group.length === 0) return null;
                  const label = r === "mb" ? "Miền Bắc" : r === "mt" ? "Miền Trung" : "Miền Nam";
                  return (
                    <optgroup key={r} label={`── ${label} ──`}>
                      {group.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>

              {selectedStation && (
                <p className="mt-1 text-xs text-gray-400">
                  Khu vực:{" "}
                  <span className={`font-semibold ${regionColor}`}>{regionLabel}</span>
                  {" "}· Số vé:{" "}
                  <span className="font-semibold text-gray-600">{requiredDigits} chữ số</span>
                </p>
              )}
            </div>

            {/* ── Bước 3: Số vé ── */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full inline-flex items-center justify-center">3</span>
                  Số vé <span className="text-red-600">*</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    ({requiredDigits} chữ số{stationId && region === "mb" ? " — Miền Bắc" : ""})
                  </span>
                </span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={!stationId ? "Chọn đài trước" : region === "mb" ? "Ví dụ: 12345" : "Ví dụ: 123456"}
                value={ticketNumber}
                onChange={(e) => handleTicketInput(e.target.value)}
                disabled={!stationId}
                maxLength={requiredDigits}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-xl font-bold text-center tracking-widest focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:text-gray-400 ${
                  validationError
                    ? "border-red-500 focus:ring-red-400 text-red-600"
                    : "border-red-200 focus:ring-red-400 text-gray-800"
                }`}
              />
              <div className="flex justify-between mt-1">
                {validationError ? (
                  <p className="text-red-500 text-xs">{validationError}</p>
                ) : <span />}
                <p className={`text-xs ml-auto ${ticketNumber.length === requiredDigits ? "text-green-600 font-bold" : "text-gray-400"}`}>
                  {ticketNumber.length}/{requiredDigits}
                </p>
              </div>
            </div>

            {/* Chưa đến giờ quay số hôm nay */}
            {resultPending && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm flex gap-2 items-start">
                <span className="text-lg leading-none">🕐</span>
                <div>
                  <p className="font-bold">Kết quả chưa có</p>
                  <p className="text-xs mt-0.5 text-amber-700">
                    Xổ số {regionLabel} quay số lúc <strong>{drawTime}</strong>. Vui lòng quay lại sau.
                  </p>
                </div>
              </div>
            )}

            {/* Fetch error — chỉ hiện khi không phải lỗi "chưa có dữ liệu" */}
            {fetchError && !resultPending && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm flex gap-2 items-start">
                <span className="text-lg leading-none">📋</span>
                <div>
                  <p className="font-bold">Chưa có kết quả cho ngày này</p>
                  <p className="text-xs mt-0.5 text-amber-700">
                    Vui lòng kiểm tra lại ngày xổ hoặc thử ngày khác.
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                disabled={!!resultPending || loading || ticketNumber.length !== requiredDigits || !stationId || !selectedDate}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                  resultPending || loading || ticketNumber.length !== requiredDigits || !stationId || !selectedDate
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-700 hover:bg-red-800 text-white shadow-md hover:shadow-lg active:scale-95"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
            {winResult ? (() => {
              const prizeMap = region === "mb" ? MB_PRIZE_MONEY : MNMT_PRIZE_MONEY;
              const prizeAmount = prizeMap[winResult.prizeKey];
              // Highlight matched digits in ticket number
              const prefixLen = ticketNumber.length - winResult.matchedNumber.length;
              const prefix = ticketNumber.slice(0, prefixLen);
              const matched = ticketNumber.slice(prefixLen);
              return (
                <div>
                  {/* Header — gold gradient */}
                  <div className="bg-gradient-to-b from-yellow-400 to-amber-500 px-5 py-5 text-center">
                    <div className="text-4xl mb-1">🎉</div>
                    <div className="text-red-800 font-extrabold text-2xl leading-tight">Chúc mừng bạn!</div>
                    <div className="text-red-700 text-sm mt-1 font-semibold">
                      Vé số của bạn đã trúng <span className="font-extrabold">{winResult.prizeLabel}</span>
                    </div>
                  </div>

                  {/* Ticket number with highlight */}
                  <div className="bg-amber-50 px-5 py-3 text-center border-b border-amber-200">
                    <p className="text-xs text-gray-500 mb-1">Dãy số vé</p>
                    <div className="text-3xl font-extrabold tracking-widest">
                      {winResult.prizeKey === "special_sub" ? (
                        <>
                          <span className="text-amber-500 font-bold">{ticketNumber[0]}</span>
                          <span className="text-red-600">{ticketNumber.slice(1)}</span>
                        </>
                      ) : winResult.prizeKey === "consolation" ? (
                        <span className="text-red-600">{ticketNumber}</span>
                      ) : (
                        <>
                          <span className="text-gray-400">{prefix}</span>
                          <span className="text-red-600">{matched}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {winResult.prizeKey === "special_sub" ? (
                        <>Trúng 5 số cuối <span className="font-bold text-red-600">{winResult.matchedNumber}</span> của Giải Đặc Biệt (Giải Phụ Đặc Biệt / Vé An Ủi)</>
                      ) : winResult.prizeKey === "consolation" ? (
                        <>Trúng số đầu và chỉ sai 1 số so với Giải Đặc Biệt (<span className="font-bold text-red-600">{winResult.matchedNumber}</span>)</>
                      ) : (
                        <>Khớp <span className="font-bold text-red-600">{winResult.matchedNumber}</span> của {winResult.prizeLabel}</>
                      )}
                      {" — "}{selectedStation?.name}{" — "}{isoToVN(selectedDate)}
                    </p>
                  </div>

                  {/* Prize info table */}
                  <div className="bg-white px-5 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Giải trúng</p>
                        <p className="text-red-700 font-extrabold text-lg leading-tight">{winResult.prizeLabel}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Tiền thưởng</p>
                        <p className="text-green-700 font-extrabold text-lg leading-tight">
                          {prizeAmount ? formatMoney(prizeAmount) : "—"}
                        </p>
                      </div>
                    </div>

                    {prizeAmount && prizeAmount >= 10_000_000 && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 text-center">
                        ⚠️ Giải từ 10 triệu trở lên cần đến <strong>Công ty Xổ Số</strong> để nhận thưởng
                      </div>
                    )}

                    <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400 text-center">
                      Vui lòng đến đại lý xổ số để nhận thưởng trong vòng <strong>30 ngày</strong> kể từ ngày xổ
                    </div>
                  </div>
                </div>
              );
            })() : (
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
              <li className="flex gap-2"><span className="text-red-400 font-bold">1.</span> Chọn <strong>ngày xổ</strong> trên vé của bạn</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">2.</span> Chọn <strong>đài xổ số</strong> — chỉ hiện đài xổ trong ngày đó</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">3.</span> Nhập số vé (5 số cho Miền Bắc, 6 số cho Miền Nam/Trung)</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">4.</span> Nhấn &quot;Kiểm Tra Vé&quot; để xem kết quả</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
