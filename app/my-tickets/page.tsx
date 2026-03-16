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
  pending: { label: "Chờ dò",  bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  win:     { label: "Trúng!",  bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300"  },
  lose:    { label: "Không",   bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-300"   },
};

const VN_PROVINCES = [
  "An Giang","Bà Rịa - Vũng Tàu","Bạc Liêu","Bến Tre","Bình Dương","Bình Phước",
  "Cà Mau","Cần Thơ","Đà Lạt","Đồng Nai","Đồng Tháp","Hậu Giang","Kiên Giang",
  "Long An","Sóc Trăng","Tây Ninh","Tiền Giang","Trà Vinh","Vĩnh Long",
  // Miền Trung
  "Bình Định","Bình Thuận","Đà Nẵng","Đắk Lắk","Đắk Nông","Gia Lai","Khánh Hòa",
  "Kon Tum","Ninh Thuận","Phú Yên","Quảng Nam","Quảng Ngãi","Thừa Thiên Huế",
  // Miền Bắc
  "Hà Nội",
];

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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tỉnh / Đài</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="">Chọn tỉnh...</option>
                    {VN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày xổ</label>
                  <input
                    type="date"
                    value={drawDate}
                    onChange={(e) => setDrawDate(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số vé (6 chữ số)</label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="123456"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
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
                  const cfg = STATUS_CONFIG[ticket.status];
                  const date = new Date(ticket.drawDate).toLocaleDateString("vi-VN");
                  return (
                    <li key={ticket.id} className="px-5 py-3.5 flex items-center gap-3">
                      {/* Status badge */}
                      <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>

                      {/* Ticket info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 font-mono text-base leading-tight">
                          {ticket.ticketNumber}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {ticket.province} · {date}
                        </div>
                      </div>

                      {/* Delete button */}
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
                { label: "Tổng vé", value: tickets.length,                          color: "text-gray-700" },
                { label: "Trúng",   value: tickets.filter((t) => t.status === "win").length,  color: "text-green-600" },
                { label: "Chờ dò",  value: tickets.filter((t) => t.status === "pending").length, color: "text-yellow-600" },
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
