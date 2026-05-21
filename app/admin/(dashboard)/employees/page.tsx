"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

// ─── Types ────────────────────────────────────────────────────────────────────

type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  avatarUrl: string;
  bio: string;
  employeeCode: string;
  sortOrder: number;
  visible: boolean;
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

const EMPTY: Omit<Employee, "id"> = {
  name: "", position: "", department: "", phone: "", email: "",
  avatarUrl: "", bio: "", employeeCode: "", sortOrder: 0, visible: true,
};

// ─── Upload helper ─────────────────────────────────────────────────────────────

async function uploadImage(file: File, setError: (e: string) => void): Promise<string | null> {
  const fd = new FormData(); fd.append("image", file);
  const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) { setError(data.error || "Upload thất bại"); return null; }
  return data.url as string;
}

// ─── QR Code chính (trỏ đến trang danh sách) ─────────────────────────────────

function StaffListQR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const hubUrl = `${window.location.origin}/hub`;
    setUrl(hubUrl);
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, hubUrl, {
      width: 200, margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});
  }, []);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qr-cua-hang.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row items-center gap-6">
      <div className="shrink-0 flex flex-col items-center gap-2">
        <canvas ref={canvasRef} className="rounded-xl border-2 border-red-100" />
        <button
          onClick={handleDownload}
          className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Tải xuống QR
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Mã QR Hoạt Động</span>
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-1">QR Trang Chào Mừng</h2>
        <p className="text-sm text-gray-500 mb-3">
          Khi quét mã QR, người dùng sẽ thấy màn hình <strong>chọn</strong>: vào Trang Đại Lý hoặc xem Đội Ngũ Nhân Viên.
        </p>
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono break-all mb-3">
          {url || "Đang tải..."}
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/hub" target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-red-700 font-semibold hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Xem trang /hub
          </a>
          <a href="/nhan-vien" target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-semibold hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Xem danh sách nhân viên
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Employee Form ─────────────────────────────────────────────────────────────

function EmployeeForm({
  form, setForm, imgRef, onImageChange,
}: {
  form: Omit<Employee, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Employee, "id">>>;
  imgRef: React.RefObject<HTMLInputElement>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Họ và tên *</label>
        <input className={inputCls} value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="Nguyễn Văn A" />
      </div>
      <div>
        <label className={labelCls}>Chức vụ</label>
        <input className={inputCls} value={form.position} onChange={e => setForm(s => ({ ...s, position: e.target.value }))} placeholder="Nhân viên bán hàng" />
      </div>
      <div>
        <label className={labelCls}>Phòng ban</label>
        <input className={inputCls} value={form.department} onChange={e => setForm(s => ({ ...s, department: e.target.value }))} placeholder="Kinh doanh" />
      </div>
      <div>
        <label className={labelCls}>Mã nhân viên</label>
        <input className={inputCls} value={form.employeeCode} onChange={e => setForm(s => ({ ...s, employeeCode: e.target.value }))} placeholder="NV001" />
      </div>
      <div>
        <label className={labelCls}>Số điện thoại</label>
        <input className={inputCls} type="tel" value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} placeholder="0901 234 567" />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input className={inputCls} type="email" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="nhanvien@example.com" />
      </div>
      <div>
        <label className={labelCls}>Thứ tự hiển thị</label>
        <input className={inputCls} type="number" value={form.sortOrder} onChange={e => setForm(s => ({ ...s, sortOrder: Number(e.target.value) }))} />
      </div>
      <div className="flex items-center gap-2 pt-5">
        <input type="checkbox" id="emp-visible" checked={form.visible} onChange={e => setForm(s => ({ ...s, visible: e.target.checked }))} className="w-4 h-4 accent-red-700" />
        <label htmlFor="emp-visible" className="text-sm text-gray-700 font-medium">Hiển thị trong danh sách</label>
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Ảnh đại diện</label>
        <div className="flex items-center gap-3">
          {form.avatarUrl && (
            <Image src={form.avatarUrl} alt="avatar" width={56} height={56} className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
          )}
          <button type="button" onClick={() => imgRef.current?.click()}
            className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors">
            {form.avatarUrl ? "Đổi ảnh" : "Chọn ảnh"}
          </button>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
        </div>
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Giới thiệu ngắn</label>
        <textarea className={inputCls} rows={3} value={form.bio} onChange={e => setForm(s => ({ ...s, bio: e.target.value }))} placeholder="Mô tả ngắn về nhân viên..." />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployeesAdmin() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Employee, "id">>({ ...EMPTY });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Employee, "id">>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const editImgRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/employees")
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/employees", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    const data = await res.json();
    if (res.ok) {
      setItems(s => [...s, data].sort((a, b) => a.sortOrder - b.sortOrder));
      setAddForm({ ...EMPTY }); setShowAdd(false);
    } else setError(data.error || "Lỗi thêm nhân viên");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/employees/${editingId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) {
      setItems(s => s.map(x => x.id === editingId ? data : x).sort((a, b) => a.sortOrder - b.sortOrder));
      setEditingId(null);
    } else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: Employee) {
    const res = await fetch(`/api/admin/employees/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !item.visible }),
    });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa nhân viên này?")) return;
    const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
    else setError("Lỗi xóa nhân viên");
  }

  if (loading) return <div className="text-gray-400 py-20 text-center">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân Viên</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quét mã QR bên dưới để xem danh sách nhân viên. Thêm/sửa/xóa nhân viên sẽ cập nhật tức thì.
          </p>
        </div>
      </div>

      {/* QR Code chính */}
      <StaffListQR />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Danh sách nhân viên */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">
            Danh sách nhân viên ({items.filter(x => x.visible).length} hiển thị / {items.length} tổng)
          </h2>
          <button
            onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY, sortOrder: items.length * 10 }); }}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg"
          >
            + Thêm nhân viên
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 && !showAdd && (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm border border-dashed border-gray-200">
              Chưa có nhân viên nào. Nhấn &quot;+ Thêm nhân viên&quot; để bắt đầu.
            </div>
          )}

          {/* Add form */}
          {showAdd && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-5 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm">Thêm nhân viên mới</h3>
              <EmployeeForm form={addForm} setForm={setAddForm} imgRef={addImgRef}
                onImageChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setAddForm(x => ({ ...x, avatarUrl: URL.createObjectURL(f) }));
                  const url = await uploadImage(f, setError); if (url) setAddForm(x => ({ ...x, avatarUrl: url }));
                }} />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving || !addForm.name.trim()}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">
                  {saving ? "Đang lưu..." : "Thêm"}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
              </div>
            </div>
          )}

          {/* Employee cards */}
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {editingId === item.id ? (
                <div className="p-5 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm">Chỉnh sửa: {item.name}</h3>
                  <EmployeeForm form={editForm} setForm={setEditForm} imgRef={editImgRef}
                    onImageChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setEditForm(x => ({ ...x, avatarUrl: URL.createObjectURL(f) }));
                      const url = await uploadImage(f, setError); if (url) setEditForm(x => ({ ...x, avatarUrl: url }));
                    }} />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">
                      {saving ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex items-start gap-4">
                  {/* Avatar */}
                  <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {item.avatarUrl ? (
                      <Image src={item.avatarUrl} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-300 text-xl font-black">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{item.name}</span>
                      {item.employeeCode && (
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{item.employeeCode}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.visible ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                        {item.visible ? "Hiển thị" : "Ẩn"}
                      </span>
                    </div>
                    <div className="text-sm text-red-700 font-semibold mt-0.5">{item.position}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-3">
                      {item.department && <span>🏢 {item.department}</span>}
                      {item.phone && <span>📞 {item.phone}</span>}
                      {item.email && <span>✉ {item.email}</span>}
                    </div>
                    {item.bio && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.bio}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <button
                      onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, position: item.position, department: item.department, phone: item.phone, email: item.email, avatarUrl: item.avatarUrl, bio: item.bio, employeeCode: item.employeeCode, sortOrder: item.sortOrder, visible: item.visible }); }}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg"
                    >Sửa</button>
                    <button
                      onClick={() => handleToggle(item)}
                      className={`px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors ${item.visible ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                    >{item.visible ? "Ẩn" : "Hiện"}</button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg"
                    >Xóa</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
