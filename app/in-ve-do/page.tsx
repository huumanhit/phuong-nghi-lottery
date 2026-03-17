"use client";
import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import type { DailyRegionResult } from "@/app/lib/lotteryData";
import {
  type PrintLayout,
  isoToDateLabel,
  buildTicketHTML,
  openPrintWindow,
  getDateRange,
} from "@/lib/printTicket";

// ─── helpers ────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);

const REGION_OPTIONS = [
  { value: "mn", label: "Miền Nam" },
  { value: "mt", label: "Miền Trung" },
  { value: "mb", label: "Miền Bắc" },
];

async function fetchRegion(region: string, date: string): Promise<DailyRegionResult> {
  const res = await fetch(`/api/lottery/daily?region=${region}&date=${date}`);
  if (!res.ok) throw new Error("Lỗi tải dữ liệu");
  return res.json();
}

// ─── sub-components ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-400 px-4 py-2 text-center font-bold text-gray-900 text-sm uppercase tracking-wide rounded-t-lg">
      {children}
    </div>
  );
}

function LayoutRadio({
  value,
  selected,
  onChange,
  options,
}: {
  value: PrintLayout;
  selected: PrintLayout;
  onChange: (v: PrintLayout) => void;
  options: { value: PrintLayout; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input
            type="radio"
            name={value}
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-red-700"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

// ─── Section 1: Single day ───────────────────────────────────────────────────

function Section1() {
  const [region, setRegion] = useState("mn");
  const [date, setDate]     = useState(today);
  const [layout, setLayout] = useState<PrintLayout>("4x1");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const LAYOUTS: { value: PrintLayout; label: string }[] = [
    { value: "4x1", label: "In 4 bảng/A4" },
    { value: "6x1", label: "In 6 bảng/A4" },
    { value: "1x1", label: "In 1 bảng/A4" },
  ];

  async function handlePrint() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRegion(region, date);
      if (!data.stations || data.stations.length === 0) {
        setError("Không có dữ liệu cho ngày này.");
        return;
      }
      const isMb = region === "mb";
      const dateLabel = isoToDateLabel(date);
      const ticket = buildTicketHTML(data.stations, isMb, dateLabel);
      // For single day: repeat same ticket N times per page
      const copies = layout === "4x1" ? 4 : layout === "6x1" ? 6 : 1;
      openPrintWindow(Array(copies).fill(ticket), layout);
    } catch {
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <SectionTitle>In vé dò theo Miền + Ngày</SectionTitle>
      <div className="bg-white p-5 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Miền</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[140px]"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "In"}
          </button>
        </div>

        <LayoutRadio
          value={layout}
          selected={layout}
          onChange={setLayout}
          options={LAYOUTS}
        />

        <p className="text-xs text-gray-500">
          Chọn miền, chọn ngày, chọn loại bản in (4 bảng KQXS trên 1 tờ giấy A4, 6 bảng KQXS trên 1 tờ giấy A4 hoặc 1 bảng KQXS lớn) và bấm &quot;In&quot;.
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}

// ─── Section 2: Date range ───────────────────────────────────────────────────

function Section2() {
  const [region, setRegion] = useState("mn");
  const [from, setFrom]     = useState(today);
  const [to, setTo]         = useState(today);
  const [layout, setLayout] = useState<PrintLayout>("4x1");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const LAYOUTS: { value: PrintLayout; label: string }[] = [
    { value: "4x1", label: "In 4 bảng/A4" },
    { value: "6x1", label: "In 6 bảng/A4" },
  ];

  async function handlePrint() {
    if (from > to) { setError("Ngày bắt đầu phải trước ngày kết thúc."); return; }
    setLoading(true);
    setError("");
    try {
      const dates = getDateRange(from, to);
      const isMb = region === "mb";

      const results = await Promise.all(
        dates.map((d) => fetchRegion(region, d).catch(() => null))
      );

      const tickets: string[] = [];
      for (let i = 0; i < dates.length; i++) {
        const data = results[i];
        if (!data || !data.stations || data.stations.length === 0) continue;
        tickets.push(buildTicketHTML(data.stations, isMb, isoToDateLabel(dates[i])));
      }

      if (tickets.length === 0) {
        setError("Không có dữ liệu cho khoảng thời gian này.");
        return;
      }

      openPrintWindow(tickets, layout);
    } catch {
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <SectionTitle>In vé dò Theo khoảng thời gian</SectionTitle>
      <div className="bg-white p-5 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Miền</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[140px]"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Từ Ngày</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Đến</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "In Vé Dò"}
          </button>
        </div>

        <LayoutRadio
          value={layout}
          selected={layout}
          onChange={setLayout}
          options={LAYOUTS}
        />

        <p className="text-xs text-gray-500">
          Chọn miền, chọn từ ngày đến ngày cần in vé dò, chọn loại bản in (4 bảng KQXS trên 1 tờ giấy A4 hoặc 6 bảng KQXS trên 1 tờ giấy A4) và bấm &quot;In Vé Dò&quot;.
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}

// ─── Section 3: Custom multi-combo ──────────────────────────────────────────

interface Combo { region: string; date: string }

function Section3() {
  const [combos, setCombos] = useState<Combo[]>([
    { region: "mn", date: today },
    { region: "mt", date: today },
    { region: "mb", date: today },
  ]);
  const [layout, setLayout] = useState<PrintLayout>("4x1");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const LAYOUTS: { value: PrintLayout; label: string }[] = [
    { value: "4x1", label: "In 4 bảng/A4" },
    { value: "6x1", label: "In 6 bảng/A4" },
  ];

  function updateCombo(idx: number, field: keyof Combo, val: string) {
    setCombos((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  }

  function addRow() {
    setCombos((prev) => [...prev, { region: "mn", date: today }]);
  }

  function removeRow(idx: number) {
    if (combos.length <= 1) return;
    setCombos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handlePrint() {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(
        combos.map((c) => fetchRegion(c.region, c.date).catch(() => null))
      );

      const tickets: string[] = [];
      for (let i = 0; i < combos.length; i++) {
        const data = results[i];
        if (!data || !data.stations || data.stations.length === 0) continue;
        const isMb = combos[i].region === "mb";
        tickets.push(buildTicketHTML(data.stations, isMb, isoToDateLabel(combos[i].date)));
      }

      if (tickets.length === 0) {
        setError("Không có dữ liệu.");
        return;
      }

      openPrintWindow(tickets, layout);
    } catch {
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <SectionTitle>In vé dò tùy chỉnh từng ngày / Miền</SectionTitle>
      <div className="bg-white p-5 space-y-4">
        <div className="space-y-3">
          {combos.map((c, idx) => (
            <div key={idx} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Miền {idx + 1}
                </label>
                <select
                  value={c.region}
                  onChange={(e) => updateCombo(idx, "region", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[140px]"
                >
                  {REGION_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày</label>
                <input
                  type="date"
                  value={c.date}
                  onChange={(e) => updateCombo(idx, "date", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {combos.length > 1 && (
                <button
                  onClick={() => removeRow(idx)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-2"
                  title="Xóa dòng"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Thêm miền / ngày
        </button>

        <LayoutRadio
          value={layout}
          selected={layout}
          onChange={setLayout}
          options={LAYOUTS}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "In Vé Dò"}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function InVeDoPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-red-700 uppercase tracking-wide">
            In Vé Dò KQXS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            In bảng kết quả xổ số để dò vé số trúng thưởng
          </p>
        </div>

        <Section1 />
        <Section2 />
        <Section3 />
      </main>
      <Footer />
    </>
  );
}
