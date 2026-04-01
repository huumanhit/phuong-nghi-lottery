"use client";
import { useEffect, useState } from "react";

const FONT_OPTIONS = [
  { value: "playfair", label: "Playfair Display (Serif đẹp)" },
  { value: "oswald",   label: "Oswald (Condensed bold)" },
  { value: "vietnam",  label: "Be Vietnam Pro (Sans-serif)" },
];

const DEFAULT_SETTINGS = {
  titleText:     "XỔ SỐ PHƯƠNG NGHI",
  subtitleText:  "Nhanh Nhất & Chính Xác Nhất",
  fontFamily:    "playfair",
  titleColor:    "#FFD700",
  subtitleColor: "#ffffff",
  titleSize:     "clamp(26px, 5.5vw, 42px)",
};

type HeaderSettings = typeof DEFAULT_SETTINGS;

function parseSettings(raw: string): HeaderSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export default function AppearancePage() {
  const [settings, setSettings] = useState<HeaderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch("/api/admin/store-info")
      .then((r) => r.json())
      .then((d) => {
        setSettings(parseSettings(d.headerSettings ?? ""));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function set<K extends keyof HeaderSettings>(key: K, val: HeaderSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/store-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headerSettings: JSON.stringify(settings) }),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  }

  // Live preview font class
  const previewFontClass =
    settings.fontFamily === "playfair" ? "font-playfair" :
    settings.fontFamily === "oswald"   ? "font-oswald"   : "font-vietnam";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Giao diện Header</h1>
        <p className="text-sm text-gray-500 mt-1">Chỉnh sửa font chữ và màu sắc tiêu đề trang</p>
      </div>

      {/* Live Preview */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-red-700 px-6 py-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          >
            PN
          </div>
          <div>
            <div
              className={`${previewFontClass} font-black leading-tight`}
              style={{ fontSize: settings.titleSize, color: settings.titleColor, letterSpacing: "0.03em" }}
            >
              {settings.titleText || "XỔ SỐ PHƯƠNG NGHI"}
            </div>
            <div
              className={`${previewFontClass} italic`}
              style={{ fontSize: "15px", fontWeight: 600, color: settings.subtitleColor }}
            >
              {settings.subtitleText || "Nhanh Nhất & Chính Xác Nhất"}
            </div>
          </div>
        </div>
        <div className="bg-red-800 px-4 py-1 text-center text-xs text-red-300">
          Xem trước — Header thực tế
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6 space-y-5">

        {/* Title text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tiêu đề chính
          </label>
          <input
            type="text"
            value={settings.titleText}
            onChange={(e) => set("titleText", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Subtitle text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Phụ đề
          </label>
          <input
            type="text"
            value={settings.subtitleText}
            onChange={(e) => set("subtitleText", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Font family */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Font chữ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => set("fontFamily", opt.value)}
                className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
                  settings.fontFamily === opt.value
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div
                  className={
                    opt.value === "playfair" ? "font-playfair font-black" :
                    opt.value === "oswald"   ? "font-oswald font-bold"    : "font-vietnam font-bold"
                  }
                  style={{ fontSize: "16px" }}
                >
                  Aa
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Màu tiêu đề
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.titleColor}
                onChange={(e) => set("titleColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={settings.titleColor}
                onChange={(e) => set("titleColor", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Màu phụ đề
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.subtitleColor}
                onChange={(e) => set("subtitleColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={settings.subtitleColor}
                onChange={(e) => set("subtitleColor", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Font size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cỡ chữ tiêu đề
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Nhỏ",   value: "clamp(20px, 4vw, 30px)" },
              { label: "Vừa",   value: "clamp(26px, 5.5vw, 42px)" },
              { label: "Lớn",   value: "clamp(30px, 6.5vw, 52px)" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => set("titleSize", opt.value)}
                className={`py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  settings.titleSize === opt.value
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            Khôi phục mặc định
          </button>
          {success && (
            <span className="text-green-600 text-sm font-medium">Đã lưu thành công!</span>
          )}
          {error && (
            <span className="text-red-600 text-sm font-medium">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
