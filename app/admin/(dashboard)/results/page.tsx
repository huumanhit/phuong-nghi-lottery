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

const EMPTY_FORM = {
  date: "",
  region: "north",
  province: "",
  specialPrize: "",
  prize1: "",
  prize2: "",
  prize3: "",
  prize4: "",
  prize5: "",
  prize6: "",
  prize7: "",
  prize8: "",
};

type FormData = typeof EMPTY_FORM;

interface LotteryResult extends FormData {
  id: string;
  createdAt: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterRegion) params.set("region", filterRegion);
    if (filterDate) params.set("date", filterDate);
    const res = await fetch(`/api/admin/results?${params}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }, [filterRegion, filterDate]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setEditId(null);
    setModal("add");
    setError("");
  }

  function openEdit(r: LotteryResult) {
    setForm({
      date: new Date(r.date).toISOString().slice(0, 10),
      region: r.region,
      province: r.province,
      specialPrize: r.specialPrize ?? "",
      prize1: r.prize1 ?? "",
      prize2: r.prize2 ?? "",
      prize3: r.prize3 ?? "",
      prize4: r.prize4 ?? "",
      prize5: r.prize5 ?? "",
      prize6: r.prize6 ?? "",
      prize7: r.prize7 ?? "",
      prize8: r.prize8 ?? "",
    });
    setEditId(r.id);
    setModal("edit");
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const url = modal === "edit" ? `/api/admin/results/${editId}` : "/api/admin/results";
    const method = modal === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setModal(null);
      fetchResults();
    } else {
      const d = await res.json();
      setError(d.error || "Có lỗi xảy ra");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/results/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      fetchResults();
    }
  }

  const prizeFields = [
    { key: "specialPrize", label: "Giải Đặc Biệt" },
    { key: "prize1", label: "Giải Nhất" },
    { key: "prize2", label: "Giải Nhì" },
    { key: "prize3", label: "Giải Ba" },
    { key: "prize4", label: "Giải Tư" },
    { key: "prize5", label: "Giải Năm" },
    { key: "prize6", label: "Giải Sáu" },
    { key: "prize7", label: "Giải Bảy" },
    { key: "prize8", label: "Giải Tám" },
  ] as { key: keyof FormData; label: string }[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kết quả xổ số</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý kết quả xổ số theo ngày và tỉnh</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm kết quả
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Vùng</label>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        {(filterRegion || filterDate) && (
          <div className="flex items-end">
            <button
              onClick={() => { setFilterRegion(""); setFilterDate(""); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vùng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tỉnh / TP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Giải ĐB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Giải Nhất</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Đang tải...</td>
                </tr>
              )}
              {!loading && results.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Không có dữ liệu</td>
                </tr>
              )}
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.region === "north" ? "bg-red-100 text-red-700"
                      : r.region === "central" ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                    }`}>
                      {REGION_LABEL[r.region] ?? r.region}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.province}</td>
                  <td className="px-4 py-3 font-mono font-bold text-red-700">{r.specialPrize ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{r.prize1 ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {results.length} kết quả
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === "add" ? "Thêm kết quả mới" : "Chỉnh sửa kết quả"}
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
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
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  Các giải (nhiều số cách nhau bằng dấu phẩy)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {prizeFields.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                      <input
                        type="text"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder="VD: 12345"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  ))}
                </div>
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
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
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
              Bạn có chắc muốn xóa kết quả này? Hành động này không thể hoàn tác.
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
