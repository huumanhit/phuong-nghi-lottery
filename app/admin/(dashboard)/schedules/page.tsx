"use client";
import { useEffect, useState, useCallback } from "react";

const REGIONS = [
  { value: "north", label: "Miền Bắc" },
  { value: "central", label: "Miền Trung" },
  { value: "south", label: "Miền Nam" },
];

const REGION_LABEL: Record<string, string> = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

const EMPTY_FORM = {
  weekday: 1,
  region: "north",
  province: "",
};

type FormData = typeof EMPTY_FORM;

interface Schedule extends FormData {
  id: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/schedules");
    const data = await res.json();
    setSchedules(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal("add");
    setError("");
  }

  function openEdit(s: Schedule) {
    setForm({ weekday: s.weekday, region: s.region, province: s.province });
    setEditId(s.id);
    setModal("edit");
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const url = modal === "edit" ? `/api/admin/schedules/${editId}` : "/api/admin/schedules";
    const method = modal === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, weekday: Number(form.weekday) }),
    });
    if (res.ok) {
      setModal(null);
      fetchSchedules();
    } else {
      const d = await res.json();
      setError(d.error || "Có lỗi xảy ra");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      fetchSchedules();
    }
  }

  // Group schedules by weekday
  const grouped = WEEKDAYS.map((day, idx) => ({
    day,
    idx,
    items: schedules.filter((s) => s.weekday === idx),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch xổ số</h1>
          <p className="text-gray-500 text-sm mt-1">Cấu hình lịch xổ số theo thứ trong tuần</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm lịch
        </button>
      </div>

      {/* Grouped by weekday */}
      <div className="space-y-4">
        {grouped.map(({ day, idx, items }) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">{day}</h3>
              <span className="text-xs text-gray-400">{items.length} tỉnh</span>
            </div>
            {items.length === 0 ? (
              <div className="px-5 py-4 text-sm text-gray-400">Chưa có lịch</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((s) => (
                  <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.region === "north" ? "bg-red-100 text-red-700"
                        : s.region === "central" ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                      }`}>
                        {REGION_LABEL[s.region] ?? s.region}
                      </span>
                      <span className="text-sm text-gray-800">{s.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === "add" ? "Thêm lịch mới" : "Chỉnh sửa lịch"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Thứ *</label>
                <select
                  value={form.weekday}
                  onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {WEEKDAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vùng *</label>
                <select
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tỉnh / TP *</label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="VD: Hồ Chí Minh"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : modal === "add" ? "Thêm mới" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 text-sm mb-6">
              Bạn có chắc muốn xóa lịch này?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
