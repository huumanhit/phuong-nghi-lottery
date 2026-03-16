"use client";
import { Region } from "../lib/lotteryData";

const TABS: { id: Region; label: string; sub: string }[] = [
  { id: "mb", label: "Miền Bắc", sub: "XSMB" },
  { id: "mt", label: "Miền Trung", sub: "XSMT" },
  { id: "mn", label: "Miền Nam", sub: "XSMN" },
];

interface Props {
  active: Region;
  onChange: (r: Region) => void;
}

export default function RegionTabs({ active, onChange }: Props) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-red-200 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2 px-2 text-center transition-all duration-200 border-r border-red-200 last:border-r-0 ${
            active === tab.id
              ? "bg-red-700 text-white"
              : "bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          <div className="text-xs font-extrabold leading-tight">{tab.label}</div>
          <div className={`text-[11px] font-semibold mt-0.5 ${active === tab.id ? "text-red-200" : "text-gray-400"}`}>
            {tab.sub}
          </div>
        </button>
      ))}
    </div>
  );
}
