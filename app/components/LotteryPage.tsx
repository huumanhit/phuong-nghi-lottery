"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Region,
  LotteryResult,
  generateMBResult,
  generateMTResult,
  generateMNResult,
  extractLoNumbers,
  PRIZE_ORDER,
} from "../lib/lotteryData";
import CountdownTimer from "./CountdownTimer";
import LotteryTable from "./LotteryTable";
import LotoGrid from "./LotoGrid";
import RegionTabs from "./RegionTabs";

function getCurrentDateVN(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getRevealSequence(result: LotteryResult): { prize: string; idx: number }[] {
  const seq: { prize: string; idx: number }[] = [];
  // Reveal from seventh to special (like real lottery)
  const reversed = [...PRIZE_ORDER].reverse();
  for (const prize of reversed) {
    const nums = result[prize as keyof LotteryResult];
    for (let i = 0; i < nums.length; i++) {
      seq.push({ prize, idx: i });
    }
  }
  return seq;
}

export default function LotteryPage() {
  const [region, setRegion] = useState<Region>("mb");
  const [results, setResults] = useState<Record<Region, LotteryResult>>({
    mb: generateMBResult(),
    mt: generateMTResult(),
    mn: generateMNResult(),
  });
  const [revealed, setRevealed] = useState<Record<Region, Set<string>>>({
    mb: new Set(),
    mt: new Set(),
    mn: new Set(),
  });
  const [isLive, setIsLive] = useState(false);
  const [isComplete, setIsComplete] = useState<Record<Region, boolean>>({
    mb: false,
    mt: false,
    mn: false,
  });
  const [partialResult, setPartialResult] = useState<Record<Region, Partial<LotteryResult>>>({
    mb: {},
    mt: {},
    mn: {},
  });
  const [seqIdx, setSeqIdx] = useState<Record<Region, number>>({ mb: 0, mt: 0, mn: 0 });
  const sequenceRef = useRef<Record<Region, { prize: string; idx: number }[]>>({
    mb: [],
    mt: [],
    mn: [],
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build reveal sequence on mount / region change
  useEffect(() => {
    const regionKeys: Region[] = ["mb", "mt", "mn"];
    regionKeys.forEach((r) => {
      sequenceRef.current[r] = getRevealSequence(results[r]);
    });
  }, [results]);

  const startLive = useCallback((r: Region) => {
    setIsLive(true);
    setIsComplete((prev) => ({ ...prev, [r]: false }));
    setPartialResult((prev) => ({ ...prev, [r]: {} }));
    setRevealed((prev) => ({ ...prev, [r]: new Set() }));
    setSeqIdx((prev) => ({ ...prev, [r]: 0 }));

    if (intervalRef.current) clearInterval(intervalRef.current);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      const seq = sequenceRef.current[r];
      if (idx >= seq.length) {
        clearInterval(intervalRef.current!);
        setIsLive(false);
        setIsComplete((prev) => ({ ...prev, [r]: true }));
        // Show full result
        setPartialResult((prev) => ({ ...prev, [r]: results[r] }));
        return;
      }

      const { prize, idx: numIdx } = seq[idx];
      const fullNums = results[r][prize as keyof LotteryResult];
      const revealKey = `${prize}-${numIdx}`;

      setPartialResult((prev) => {
        const current = { ...prev[r] };
        const existing: string[] = (current[prize as keyof LotteryResult] as string[]) ?? [];
        const updated = [...existing];
        updated[numIdx] = fullNums[numIdx];
        return {
          ...prev,
          [r]: { ...current, [prize]: updated },
        };
      });

      setRevealed((prev) => {
        const s = new Set(prev[r]);
        s.add(revealKey);
        return { ...prev, [r]: s };
      });

      idx++;
      setSeqIdx((prev) => ({ ...prev, [r]: idx }));
    }, 350);
  }, [results]);

  const resetRegion = useCallback((r: Region) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLive(false);
    const newResult = r === "mb" ? generateMBResult() : r === "mt" ? generateMTResult() : generateMNResult();
    setResults((prev) => ({ ...prev, [r]: newResult }));
    setPartialResult((prev) => ({ ...prev, [r]: {} }));
    setRevealed((prev) => ({ ...prev, [r]: new Set() }));
    setIsComplete((prev) => ({ ...prev, [r]: false }));
    setSeqIdx((prev) => ({ ...prev, [r]: 0 }));
    sequenceRef.current[r] = getRevealSequence(newResult);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const currentPartial = partialResult[region];
  const currentRevealed = revealed[region];
  const currentComplete = isComplete[region];
  const loNumbers = extractLoNumbers(
    isComplete[region] ? results[region] : (currentPartial as LotteryResult)
  );

  const totalNums = sequenceRef.current[region]?.length ?? 0;
  const progress = totalNums > 0 ? Math.round((seqIdx[region] / totalNums) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Date + Timer Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-red-800">Kết Quả Xổ Số Hôm Nay</h1>
            <p className="text-gray-500 text-sm">Ngày {getCurrentDateVN()}</p>
          </div>
          <CountdownTimer isLive={isLive} />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-red-700 px-4 py-3 flex items-center justify-between">
                <span className="text-white font-bold text-lg">Kết Quả Xổ Số</span>
                {isLive && (
                  <span className="bg-green-400 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
                {currentComplete && (
                  <span className="bg-yellow-400 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                    HOÀN TẤT
                  </span>
                )}
              </div>

              <div className="p-4">
                <RegionTabs active={region} onChange={setRegion} />

                {/* Progress bar */}
                {isLive && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Đang quay...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <LotteryTable
                  result={currentPartial}
                  revealed={currentRevealed}
                  isComplete={currentComplete}
                />

                {/* Controls */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => startLive(region)}
                    disabled={isLive}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      isLive
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-700 hover:bg-red-800 text-white shadow-md hover:shadow-lg active:scale-95"
                    }`}
                  >
                    {isLive ? "Đang quay..." : currentComplete ? "▶ Quay lại" : "▶ Bắt đầu quay"}
                  </button>
                  <button
                    onClick={() => resetRegion(region)}
                    disabled={isLive}
                    className={`px-5 py-2.5 rounded-lg font-bold text-sm border-2 transition-all ${
                      isLive
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-red-700 text-red-700 hover:bg-red-50 active:scale-95"
                    }`}
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Loto Grid */}
          <div className="lg:col-span-1">
            <LotoGrid hitNumbers={loNumbers} />

            {/* Info box */}
            <div className="mt-4 bg-white rounded-xl border border-red-200 shadow-md p-4 text-sm text-gray-600">
              <h4 className="font-bold text-red-700 mb-2">Thông Tin</h4>
              <ul className="space-y-1 text-xs">
                <li className="flex justify-between">
                  <span>Khu vực:</span>
                  <span className="font-semibold text-red-700">
                    {region === "mb" ? "Miền Bắc" : region === "mt" ? "Miền Trung" : "Miền Nam"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Giờ quay:</span>
                  <span className="font-semibold">18:15</span>
                </li>
                <li className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className={`font-semibold ${isLive ? "text-green-600" : currentComplete ? "text-blue-600" : "text-gray-500"}`}>
                    {isLive ? "Đang quay" : currentComplete ? "Hoàn tất" : "Chờ quay"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Số lô về:</span>
                  <span className="font-semibold text-red-700">{loNumbers.size}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
