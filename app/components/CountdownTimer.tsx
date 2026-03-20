"use client";
import { useEffect, useState } from "react";

function getSecondsUntil(drawTime: string): number {
  const [hStr, mStr] = drawTime.split(":");
  const now = new Date();
  const target = new Date();
  target.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return Math.floor((target.getTime() - now.getTime()) / 1000);
}

export default function CountdownTimer({ isLive, drawTime = "18:15" }: { isLive: boolean; drawTime?: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(getSecondsUntil(drawTime));
    const id = setInterval(() => setSeconds(getSecondsUntil(drawTime)), 1000);
    return () => clearInterval(id);
  }, [drawTime]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (isLive) {
    return (
      <div className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold animate-pulse w-full">
        <span className="w-2.5 h-2.5 bg-white rounded-full inline-block"></span>
        ĐANG QUAY TRỰC TIẾP — KẾT QUẢ SẼ CẬP NHẬT TỰ ĐỘNG
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl px-4 py-2.5 w-full">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <span className="text-base">⏰</span>
        <span className="text-red-700 text-sm font-bold">Quay lúc {drawTime}</span>
      </div>

      {/* Digits */}
      <div className="flex items-center gap-1">
        {[
          { val: pad(h), label: "giờ" },
          { val: pad(m), label: "phút" },
          { val: pad(s), label: "giây" },
        ].map(({ val, label }, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-red-500 font-black text-base leading-none mb-2">:</span>
            )}
            <div className="flex flex-col items-center">
              <div className="bg-red-700 text-white font-mono font-black text-base px-2.5 py-1 rounded-lg min-w-[2.2rem] text-center shadow-sm">
                {val}
              </div>
              <span className="text-xs text-red-500 font-medium mt-0.5">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
