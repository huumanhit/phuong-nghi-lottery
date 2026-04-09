"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Types ──────────────────────────────────────────────────────────────────

type Section = {
  id: string; title: string; content: string;
  imageUrl: string; sortOrder: number; visible: boolean;
};

type DealerPoint = {
  id: string; city: string; name: string;
  phone: string; address: string; mapUrl: string;
  sortOrder: number; visible: boolean;
};

type NewsItem = {
  id: string; title: string; imageUrl: string;
  linkUrl: string; sortOrder: number; visible: boolean;
};

const EMPTY_SECTION: Omit<Section, "id"> = { title: "", content: "", imageUrl: "", sortOrder: 0, visible: true };
const EMPTY_DEALER: Omit<DealerPoint, "id"> = { city: "TP. Hồ Chí Minh", name: "", phone: "", address: "", mapUrl: "", sortOrder: 0, visible: true };
const EMPTY_NEWS: Omit<NewsItem, "id"> = { title: "", imageUrl: "", linkUrl: "", sortOrder: 0, visible: true };

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LandingPageAdmin() {
  const [tab, setTab] = useState<"qr" | "sections" | "dealers" | "news">("qr");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/dai-ly`;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, { width: 320, margin: 2, color: { dark: "#7f1d1d", light: "#ffffff" } }).then(setQrDataUrl);
    });
  }, []);

  const tabs = [
    { id: "qr",       label: "Mã QR" },
    { id: "sections", label: "Nội dung" },
    { id: "dealers",  label: "Điểm Bán Hàng" },
    { id: "news",     label: "Tin Tức" },
  ] as const;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trang Đại Lý & Mã QR</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý nội dung trang đại lý</p>
        </div>
        <a href="/dai-ly" target="_blank"
          className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-sm rounded-lg transition-colors">
          Xem trang /dai-ly ↗
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
              tab === t.id
                ? "border-red-700 text-red-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "qr"       && <QRTab qrDataUrl={qrDataUrl} />}
      {tab === "sections" && <SectionsTab setError={setError} />}
      {tab === "dealers"  && <DealersTab setError={setError} />}
      {tab === "news"     && <NewsTab setError={setError} />}
    </div>
  );
}

// ─── QR Tab ──────────────────────────────────────────────────────────────────

function QRTab({ qrDataUrl }: { qrDataUrl: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center max-w-xl">
      <div className="shrink-0">
        {qrDataUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={qrDataUrl} alt="QR /dai-ly" className="w-40 h-40 rounded-lg border border-gray-200" />
          : <div className="w-40 h-40 bg-gray-100 rounded-lg animate-pulse" />}
      </div>
      <div className="flex-1">
        <h2 className="text-base font-bold text-gray-800 mb-1">Mã QR — Trang Đại Lý</h2>
        <p className="text-sm text-gray-500 mb-3">Khách quét mã QR này sẽ đến trang giới thiệu đại lý.</p>
        <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block mb-3">
          {typeof window !== "undefined" ? `${window.location.origin}/dai-ly` : "/dai-ly"}
        </p>
        <div>
          {qrDataUrl && (
            <a href={qrDataUrl} download="qr-dai-ly-phuong-nghi.png"
              className="inline-block px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg transition-colors">
              Tải về PNG
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sections Tab ─────────────────────────────────────────────────────────────

function SectionsTab({ setError }: { setError: (e: string) => void }) {
  const [items, setItems] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Section, "id">>(EMPTY_SECTION);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Section, "id">>(EMPTY_SECTION);
  const [saving, setSaving] = useState(false);
  const editImgRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/landing-sections").then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Upload thất bại"); return null; }
    return data.url as string;
  }

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/landing-sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data].sort((a,b)=>a.sortOrder-b.sortOrder)); setAddForm(EMPTY_SECTION); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/landing-sections/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x).sort((a,b)=>a.sortOrder-b.sortOrder)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: Section) {
    const res = await fetch(`/api/admin/landing-sections/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa?")) return;
    const res = await fetch(`/api/admin/landing-sections/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Danh sách nội dung (sections)</h2>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_SECTION, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg transition-colors">
          + Thêm section
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">Chưa có section nào.</div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5 space-y-4">
                <SectionForm form={editForm} setForm={setEditForm} imgRef={editImgRef}
                  onImageChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setEditForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                    const url = await uploadImage(f); if (url) setEditForm(x => ({ ...x, imageUrl: url }));
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
              <div className="flex items-start gap-4 p-4">
                {item.imageUrl && (
                  <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                    <Image src={item.imageUrl} alt={item.title} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 text-sm truncate">{item.title || "(Không tiêu đề)"}</span>
                    <span className="text-xs text-gray-400">#{item.sortOrder}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button onClick={() => handleToggle(item)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs">
                    {item.visible ? "👁" : "🙈"}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setEditForm({ title:item.title, content:item.content, imageUrl:item.imageUrl, sortOrder:item.sortOrder, visible:item.visible }); setError(""); }}
                    className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 text-xs font-medium">Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {showAdd && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-red-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Thêm section mới</h3>
            <SectionForm form={addForm} setForm={setAddForm} imgRef={addImgRef}
              onImageChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setAddForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                const url = await uploadImage(f); if (url) setAddForm(x => ({ ...x, imageUrl: url }));
              }} />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">
                {saving ? "Đang thêm..." : "Thêm"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionForm({ form, setForm, imgRef, onImageChange }: {
  form: Omit<Section, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Section, "id">>>;
  imgRef: React.RefObject<HTMLInputElement>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề</label>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="VD: Dịch vụ của chúng tôi" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung</label>
        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={4} placeholder="Nhập nội dung..." className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Hình ảnh (tuỳ chọn)</label>
        <div className="flex items-center gap-3">
          {form.imageUrl && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <Image src={form.imageUrl} alt="preview" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            </div>
          )}
          <div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
            <button type="button" onClick={() => imgRef.current?.click()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg">
              {form.imageUrl ? "Đổi ảnh" : "Chọn ảnh"}
            </button>
            {form.imageUrl && (
              <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                className="ml-2 px-3 py-1.5 text-red-500 text-xs font-medium">Xóa ảnh</button>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Thứ tự</label>
          <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className={inputCls} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="accent-red-700 w-4 h-4" />
            Hiển thị
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Dealers Tab ──────────────────────────────────────────────────────────────

function DealersTab({ setError }: { setError: (e: string) => void }) {
  const [items, setItems] = useState<DealerPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<DealerPoint, "id">>(EMPTY_DEALER);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<DealerPoint, "id">>(EMPTY_DEALER);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dealer-points").then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/dealer-points", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data].sort((a,b)=>a.sortOrder-b.sortOrder)); setAddForm(EMPTY_DEALER); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/dealer-points/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x).sort((a,b)=>a.sortOrder-b.sortOrder)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: DealerPoint) {
    const res = await fetch(`/api/admin/dealer-points/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa?")) return;
    const res = await fetch(`/api/admin/dealer-points/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Hệ thống điểm bán hàng</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hiển thị dạng bảng trên trang /dai-ly</p>
        </div>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_DEALER, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg transition-colors">
          + Thêm điểm bán
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">Chưa có điểm bán nào.</div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5 space-y-3">
                <DealerForm form={editForm} setForm={setEditForm} />
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
              <div className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{item.name || "(Chưa đặt tên)"}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{item.city}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.phone && `📞 ${item.phone}`}{item.address && ` — 📍 ${item.address}`}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button onClick={() => handleToggle(item)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs">
                    {item.visible ? "👁" : "🙈"}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setEditForm({ city:item.city, name:item.name, phone:item.phone, address:item.address, mapUrl:item.mapUrl, sortOrder:item.sortOrder, visible:item.visible }); setError(""); }}
                    className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 text-xs font-medium">Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {showAdd && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-red-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Thêm điểm bán mới</h3>
            <DealerForm form={addForm} setForm={setAddForm} />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">
                {saving ? "Đang thêm..." : "Thêm"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DealerForm({ form, setForm }: {
  form: Omit<DealerPoint, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<DealerPoint, "id">>>;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tên điểm bán *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="VD: 229 Nguyễn Văn Nghi" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Thành phố</label>
          <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="TP. Hồ Chí Minh" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
          <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="090 1234567" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Thứ tự</label>
          <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Địa chỉ</label>
        <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="229 Nguyễn Văn Nghi, Phường Hạnh Thông" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Link Google Maps (tuỳ chọn)</label>
        <input type="url" value={form.mapUrl} onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
          placeholder="https://maps.google.com/..." className={inputCls} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
        <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="accent-red-700 w-4 h-4" />
        Hiển thị
      </label>
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────────────────

function NewsTab({ setError }: { setError: (e: string) => void }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<NewsItem, "id">>(EMPTY_NEWS);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<NewsItem, "id">>(EMPTY_NEWS);
  const [saving, setSaving] = useState(false);
  const editImgRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/news-items").then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Upload thất bại"); return null; }
    return data.url as string;
  }

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/news-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data].sort((a,b)=>a.sortOrder-b.sortOrder)); setAddForm(EMPTY_NEWS); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/news-items/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x).sort((a,b)=>a.sortOrder-b.sortOrder)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: NewsItem) {
    const res = await fetch(`/api/admin/news-items/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa?")) return;
    const res = await fetch(`/api/admin/news-items/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Tin tức liên quan</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hiển thị dạng lưới ảnh + tiêu đề trên trang /dai-ly</p>
        </div>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_NEWS, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg transition-colors">
          + Thêm tin tức
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">Chưa có tin tức nào.</div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5 space-y-3">
                <NewsForm form={editForm} setForm={setEditForm} imgRef={editImgRef}
                  onImageChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setEditForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                    const url = await uploadImage(f); if (url) setEditForm(x => ({ ...x, imageUrl: url }));
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
              <div className="flex items-start gap-4 p-4">
                {item.imageUrl && (
                  <div className="shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-gray-100">
                    <Image src={item.imageUrl} alt={item.title} width={64} height={48} className="w-full h-full object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 text-sm truncate">{item.title || "(Không tiêu đề)"}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  {item.linkUrl && <p className="text-xs text-blue-400 truncate">{item.linkUrl}</p>}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button onClick={() => handleToggle(item)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs">
                    {item.visible ? "👁" : "🙈"}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setEditForm({ title:item.title, imageUrl:item.imageUrl, linkUrl:item.linkUrl, sortOrder:item.sortOrder, visible:item.visible }); setError(""); }}
                    className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 text-xs font-medium">Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {showAdd && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-red-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Thêm tin tức mới</h3>
            <NewsForm form={addForm} setForm={setAddForm} imgRef={addImgRef}
              onImageChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setAddForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                const url = await uploadImage(f); if (url) setAddForm(x => ({ ...x, imageUrl: url }));
              }} />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">
                {saving ? "Đang thêm..." : "Thêm"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsForm({ form, setForm, imgRef, onImageChange }: {
  form: Omit<NewsItem, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<NewsItem, "id">>>;
  imgRef: React.RefObject<HTMLInputElement>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề *</label>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="VD: Kết quả xổ số tuần này" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Link bài viết (tuỳ chọn)</label>
        <input type="url" value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
          placeholder="https://..." className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Ảnh thumbnail</label>
        <div className="flex items-center gap-3">
          {form.imageUrl && (
            <div className="w-20 h-14 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <Image src={form.imageUrl} alt="preview" width={80} height={56} className="w-full h-full object-cover" unoptimized />
            </div>
          )}
          <div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
            <button type="button" onClick={() => imgRef.current?.click()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg">
              {form.imageUrl ? "Đổi ảnh" : "Chọn ảnh"}
            </button>
            {form.imageUrl && (
              <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                className="ml-2 px-3 py-1.5 text-red-500 text-xs font-medium">Xóa ảnh</button>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Thứ tự</label>
          <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className={inputCls} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="accent-red-700 w-4 h-4" />
            Hiển thị
          </label>
        </div>
      </div>
    </div>
  );
}
