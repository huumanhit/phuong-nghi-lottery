"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Header from "@/app/components/Header";

interface Ticket {
  id:           string;
  province:     string;
  drawDate:     string;
  ticketNumber: string;
  status:       "pending" | "win" | "lose";
  createdAt:    string;
}

const STATUS_CONFIG = {
  pending: { label: "Chờ dò", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  win:     { label: "Trúng!", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300"  },
  lose:    { label: "Không",  bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-300"   },
};

// ─── Lịch xổ số theo thứ trong tuần (0 = Chủ Nhật … 6 = Thứ Bảy) ───────────
// Mỗi mảng gồm: [Miền Bắc, ...Miền Nam, ...Miền Trung] theo ngày

type ProvinceEntry = { name: string; region: "MB" | "MN" | "MT" };

const SCHEDULE: Record<number, ProvinceEntry[]> = {
  0: [ // Chủ Nhật
    { name: "Hà Nội",          region: "MB" },
    { name: "Tiền Giang",      region: "MN" },
    { name: "Kiên Giang",      region: "MN" },
    { name: "Đà Lạt",          region: "MN" },
    { name: "Kon Tum",         region: "MT" },
    { name: "Khánh Hòa",       region: "MT" },
    { name: "Thừa Thiên Huế",  region: "MT" },
  ],
  1: [ // Thứ Hai
    { name: "Hà Nội",          region: "MB" },
    { name: "TP. Hồ Chí Minh", region: "MN" },
    { name: "Đồng Tháp",       region: "MN" },
    { name: "Cà Mau",          region: "MN" },
    { name: "Thừa Thiên Huế",  region: "MT" },
    { name: "Phú Yên",         region: "MT" },
  ],
  2: [ // Thứ Ba
    { name: "Hà Nội",          region: "MB" },
    { name: "Bến Tre",         region: "MN" },
    { name: "Bà Rịa - Vũng Tàu", region: "MN" },
    { name: "Bạc Liêu",        region: "MN" },
    { name: "Quảng Nam",       region: "MT" },
    { name: "Đắk Lắk",        region: "MT" },
  ],
  3: [ // Thứ Tư
    { name: "Hà Nội",          region: "MB" },
    { name: "Đồng Nai",        region: "MN" },
    { name: "Cần Thơ",         region: "MN" },
    { name: "Sóc Trăng",       region: "MN" },
    { name: "Đà Nẵng",         region: "MT" },
    { name: "Khánh Hòa",       region: "MT" },
  ],
  4: [ // Thứ Năm
    { name: "Hà Nội",          region: "MB" },
    { name: "Tây Ninh",        region: "MN" },
    { name: "An Giang",        region: "MN" },
    { name: "Bình Thuận",      region: "MN" },
    { name: "Bình Định",       region: "MT" },
    { name: "Quảng Trị",       region: "MT" },
    { name: "Quảng Bình",      region: "MT" },
  ],
  5: [ // Thứ Sáu
    { name: "Hà Nội",          region: "MB" },
    { name: "Vĩnh Long",       region: "MN" },
    { name: "Bình Dương",      region: "MN" },
    { name: "Trà Vinh",        region: "MN" },
    { name: "Gia Lai",         region: "MT" },
    { name: "Ninh Thuận",      region: "MT" },
  ],
  6: [ // Thứ Bảy
    { name: "Hà Nội",          region: "MB" },
    { name: "TP. Hồ Chí Minh", region: "MN" },
    { name: "Long An",         region: "MN" },
    { name: "Bình Phước",      region: "MN" },
    { name: "Hậu Giang",       region: "MN" },
    { name: "Đà Nẵng",         region: "MT" },
    { name: "Quảng Ngãi",      region: "MT" },
    { name: "Đắk Nông",        region: "MT" },
  ],
};

const DOW_LABEL = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const REGION_BADGE: Record<string, string> = {
  MB: "bg-blue-100 text-blue-700",
  MN: "bg-green-100 text-green-700",
  MT: "bg-orange-100 text-orange-700",
};

function getProvincesByDate(dateIso: string): ProvinceEntry[] {
  if (!dateIso) return [];
  // Parse without timezone shift
  const [y, m, d] = dateIso.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return SCHEDULE[dow] ?? [];
}

const MB_PROVINCE = "Hà Nội";
function getDigits(prov: string) { return prov === MB_PROVINCE ? 5 : 6; }

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState<string | null>(null);

  // Form state
  const [province,     setProvince]     = useState("");
  const [drawDate,     setDrawDate]     = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [formError,    setFormError]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  // Provinces filtered by the selected date
  const availableProvinces = getProvincesByDate(drawDate);

  // When date changes, reset province if it's no longer available
  const handleDateChange = (iso: string) => {
    setDrawDate(iso);
    const list = getProvincesByDate(iso);
    if (province && !list.find((p) => p.name === province)) {
      setProvince("");
    }
    setTicketNumber("");
  };

  // Load tickets
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/tickets")
        .then((r) => r.json())
        .then((d) => setTickets(d.tickets ?? []))
        .finally(() => setLoading(false));
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const res  = await fetch("/api/tickets", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ province, drawDate, ticketNumber }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(data.error ?? "Lỗi thêm vé");
    } else {
      setTickets((prev) => [data.ticket, ...prev]);
      setTicketNumber("");
      setFormError("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa vé này?")) return;
    setDeleting(id);
    await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  };

  // Not logged in
  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
            <p className="text-gray-500 text-sm mb-5">Bạn cần đăng nhập để xem và quản lý vé số</p>
            <button
              onClick={() => signIn()}
              className="bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-800 transition-colors"
            >
              Đăng Nhập
            </button>
          </div>
        </main>
      </>
    );
  }

  // Day-of-week label for display
  const dowLabel = drawDate
    ? DOW_LABEL[new Date(...(drawDate.split("-").map(Number) as [number, number, number])).getDay()]
    : null;

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen py-6 px-4">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Page title */}
          <div>
            <h1 className="text-xl font-extrabold text-red-800 uppercase">Vé Số Của Tôi</h1>
            <p className="text-gray-500 text-sm">
              Xin chào <span className="font-semibold text-gray-700">{session?.user?.name}</span>
            </p>
          </div>

          {/* ── Add ticket form ── */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-red-100">
            <h2 className="font-extrabold text-red-700 text-base mb-4">➕ Thêm Vé Dò</h2>

            {formError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3">

              {/* Step 1: Date first */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ngày xổ
                  {dowLabel && (
                    <span className="ml-2 text-red-600 font-bold">— {dowLabel}</span>
                  )}
                </label>
                <input
                  type="date"
                  value={drawDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Step 2: Province filtered by date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Đài xổ số
                  {drawDate && availableProvinces.length > 0 && (
                    <span className="ml-1 text-gray-400 font-normal">
                      ({availableProvinces.length} đài)
                    </span>
                  )}
                </label>
                {!drawDate ? (
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">
                    Chọn ngày xổ trước
                  </div>
                ) : (
                  <select
                    value={province}
                    onChange={(e) => { setProvince(e.target.value); setTicketNumber(""); }}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="">Chọn đài...</option>
                    {/* Group by region */}
                    {(["MB", "MN", "MT"] as const).map((region) => {
                      const group = availableProvinces.filter((p) => p.region === region);
                      if (group.length === 0) return null;
                      const regionLabel = region === "MB" ? "Miền Bắc" : region === "MN" ? "Miền Nam" : "Miền Trung";
                      return (
                        <optgroup key={region} label={`── ${regionLabel} ──`}>
                          {group.map((p) => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                )}

                {/* Region badge */}
                {province && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {(() => {
                      const entry = availableProvinces.find((p) => p.name === province);
                      if (!entry) return null;
                      const label = entry.region === "MB" ? "Miền Bắc" : entry.region === "MN" ? "Miền Nam" : "Miền Trung";
                      return (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${REGION_BADGE[entry.region]}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Step 3: Ticket number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Số vé{" "}
                  <span className="text-gray-400 font-normal">
                    ({getDigits(province)} chữ số{province === MB_PROVINCE ? " — Miền Bắc" : ""})
                  </span>
                </label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, "").slice(0, getDigits(province)))}
                  required
                  disabled={!province}
                  maxLength={getDigits(province)}
                  pattern={`\\d{${getDigits(province)}}`}
                  placeholder={!province ? "Chọn đài trước" : province === MB_PROVINCE ? "12345" : "123456"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !drawDate || !province}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? "Đang lưu..." : "Lưu Vé"}
              </button>
            </form>
          </div>

          {/* ── Ticket list ── */}
          <div className="bg-white rounded-xl shadow-md border border-red-100 overflow-hidden">
            <div className="bg-red-700 px-5 py-3">
              <h2 className="text-white font-extrabold text-base">📋 Danh Sách Vé</h2>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center text-gray-400">
                <svg className="animate-spin h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang tải...
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <div className="text-4xl mb-2">🎫</div>
                <p className="text-sm">Chưa có vé nào. Thêm vé đầu tiên của bạn!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const cfg  = STATUS_CONFIG[ticket.status];
                  const date = new Date(ticket.drawDate).toLocaleDateString("vi-VN");
                  return (
                    <li key={ticket.id} className="px-5 py-3.5 flex items-center gap-3">
                      <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 font-mono text-base leading-tight">
                          {ticket.ticketNumber}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {ticket.province} · {date}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deleting === ticket.id}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1 rounded disabled:opacity-40"
                        title="Xóa vé"
                      >
                        {deleting === ticket.id ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Stats */}
          {tickets.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tổng vé", value: tickets.length,                                       color: "text-gray-700"   },
                { label: "Trúng",   value: tickets.filter((t) => t.status === "win").length,      color: "text-green-600"  },
                { label: "Chờ dò",  value: tickets.filter((t) => t.status === "pending").length,  color: "text-yellow-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                  <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 pb-2">
            Kết quả dò tự động hàng ngày ·{" "}
            <Link href="/" className="text-red-500 hover:underline">Về trang chủ</Link>
          </p>
        </div>
      </main>
    </>
  );
}
