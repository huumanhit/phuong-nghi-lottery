"use client";
import { useEffect, useState } from "react";

function getSecondsUntil1815(): number {
  const now = new Date();
  const target = new Date();
  target.setHours(18, 15, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return Math.floor((target.getTime() - now.getTime()) / 1000);
}

export default function CountdownTimer({ isLive }: { isLive: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(getSecondsUntil1815());
    const id = setInterval(() => setSeconds(getSecondsUntil1815()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (isLive) {
    return (
      <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
        <span className="w-2 h-2 bg-white rounded-full inline-block"></span>
        ĐANG QUAY TRỰC TIẾP
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-red-100 border border-red-300 rounded-xl px-4 py-2">
      <div className="text-red-700 text-sm font-semibold">Quay lúc 18:15</div>
      <div className="flex gap-1 items-center">
        {[
          { val: pad(h), label: "giờ" },
          { val: pad(m), label: "phút" },
          { val: pad(s), label: "giây" },
        ].map(({ val, label }, i) => (
          <div key={i} className="flex items-end gap-1">
            {i > 0 && <span className="text-red-600 font-bold text-lg mb-1">:</span>}
            <div className="flex flex-col items-center">
              <div className="bg-red-700 text-white font-mono font-bold text-lg px-2 py-0.5 rounded min-w-[2rem] text-center">
                {val}
              </div>
              <span className="text-xs text-red-600">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
