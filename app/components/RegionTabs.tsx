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
    <div className="flex border-b-2 border-red-600 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2.5 px-4 text-sm font-bold transition-all duration-200 ${
            active === tab.id
              ? "bg-red-700 text-white shadow-md"
              : "bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          <div>{tab.label}</div>
          <div className={`text-xs font-normal ${active === tab.id ? "text-red-200" : "text-gray-400"}`}>
            {tab.sub}
          </div>
        </button>
      ))}
    </div>
  );
}
