"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type Article = {
  id: string; category: string; title: string; excerpt: string;
  content: string; imageUrl: string; publishedAt: string;
  sortOrder: number; visible: boolean;
};
type GalleryImage = {
  id: string; title: string; description: string;
  imageUrl: string; sortOrder: number; visible: boolean;
};
type VideoItem = {
  id: string; title: string; description: string;
  youtubeUrl: string; thumbnailUrl: string; sortOrder: number; visible: boolean;
};
type JobPosting = {
  id: string; title: string; description: string; requirements: string;
  salary: string; location: string; contactName: string; contactPhone: string;
  sortOrder: number; visible: boolean;
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContentAdmin() {
  const [tab, setTab] = useState<"tin-tuc" | "hoat-dong" | "hinh-anh" | "video" | "tuyen-dung">("tin-tuc");
  const [error, setError] = useState("");

  const tabs = [
    { id: "tin-tuc",     label: "📰 Tin Tức" },
    { id: "hoat-dong",   label: "🤝 Hoạt Động XH" },
    { id: "hinh-anh",    label: "🖼️ Hình Ảnh" },
    { id: "video",       label: "🎬 Video" },
    { id: "tuyen-dung",  label: "💼 Tuyển Dụng" },
  ] as const;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin tức & Nội dung</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý bài viết, hình ảnh, video và tuyển dụng</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/tin-tuc"           target="_blank" className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg">↗ Tin tức</a>
          <a href="/hinh-anh"          target="_blank" className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg">↗ Hình ảnh</a>
          <a href="/video"             target="_blank" className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg">↗ Video</a>
          <a href="/tuyen-dung"        target="_blank" className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg">↗ Tuyển dụng</a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(""); }}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 whitespace-nowrap ${
              tab === t.id
                ? "border-red-700 text-red-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tin-tuc"    && <ArticlesTab category="tin-tuc"          setError={setError} />}
      {tab === "hoat-dong"  && <ArticlesTab category="hoat-dong-xa-hoi" setError={setError} />}
      {tab === "hinh-anh"   && <GalleryTab  setError={setError} />}
      {tab === "video"      && <VideoTab    setError={setError} />}
      {tab === "tuyen-dung" && <JobsTab     setError={setError} />}
    </div>
  );
}

// ─── Upload helper ─────────────────────────────────────────────────────────────

async function uploadImage(file: File, setError: (e: string) => void): Promise<string | null> {
  const fd = new FormData(); fd.append("image", file);
  const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) { setError(data.error || "Upload thất bại"); return null; }
  return data.url as string;
}

// ─── Articles Tab (dùng cho cả tin-tuc và hoat-dong-xa-hoi) ──────────────────

const EMPTY_ARTICLE: Omit<Article, "id"> = {
  category: "tin-tuc", title: "", excerpt: "", content: "",
  imageUrl: "", publishedAt: new Date().toISOString().slice(0, 10),
  sortOrder: 0, visible: true,
};

function ArticlesTab({ category, setError }: { category: string; setError: (e: string) => void }) {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Article, "id">>({ ...EMPTY_ARTICLE, category });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Article, "id">>({ ...EMPTY_ARTICLE, category });
  const [saving, setSaving] = useState(false);
  const editImgRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/articles")
      .then(r => r.json())
      .then(d => {
        const all = Array.isArray(d) ? d : [];
        setItems(all.filter((a: Article) => a.category === category));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/articles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addForm, category }),
    });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data].sort((a, b) => a.sortOrder - b.sortOrder)); setAddForm({ ...EMPTY_ARTICLE, category }); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/articles/${editingId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x).sort((a, b) => a.sortOrder - b.sortOrder)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: Article) {
    const res = await fetch(`/api/admin/articles/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !item.visible }),
    });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa bài viết này?")) return;
    const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  const catLabel = category === "tin-tuc" ? "bài tin tức" : "hoạt động xã hội";
  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Danh sách {catLabel} ({items.length})</h2>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_ARTICLE, category, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg">
          + Thêm {catLabel}
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">Chưa có {catLabel} nào.</div>
        )}

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5 space-y-4">
                <ArticleForm form={editForm} setForm={setEditForm} imgRef={editImgRef}
                  onImageChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setEditForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                    const url = await uploadImage(f, setError); if (url) setEditForm(x => ({ ...x, imageUrl: url }));
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
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{item.title || "(Không tiêu đề)"}</span>
                    <span className="text-xs text-gray-400">#{item.sortOrder}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.excerpt}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button onClick={() => handleToggle(item)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs" title={item.visible ? "Ẩn" : "Hiện"}>
                    {item.visible ? "👁" : "🙈"}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setEditForm({ category: item.category, title: item.title, excerpt: item.excerpt, content: item.content, imageUrl: item.imageUrl, publishedAt: item.publishedAt.slice(0, 10), sortOrder: item.sortOrder, visible: item.visible }); setError(""); }}
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
            <h3 className="text-sm font-bold text-gray-700">Thêm {catLabel} mới</h3>
            <ArticleForm form={addForm} setForm={setAddForm} imgRef={addImgRef}
              onImageChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setAddForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                const url = await uploadImage(f, setError); if (url) setAddForm(x => ({ ...x, imageUrl: url }));
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

function ArticleForm({ form, setForm, imgRef, onImageChange }: {
  form: Omit<Article, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Article, "id">>>;
  imgRef: React.RefObject<HTMLInputElement>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className={labelCls}>Tiêu đề *</label>
        <input value={form.title} onChange={e => setForm(x => ({ ...x, title: e.target.value }))} className={inputCls} placeholder="Tiêu đề bài viết" />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Tóm tắt (excerpt)</label>
        <textarea value={form.excerpt} onChange={e => setForm(x => ({ ...x, excerpt: e.target.value }))} className={inputCls} rows={2} placeholder="Mô tả ngắn hiển thị trong danh sách..." />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Nội dung đầy đủ</label>
        <textarea value={form.content} onChange={e => setForm(x => ({ ...x, content: e.target.value }))} className={inputCls} rows={5} placeholder="Nội dung chi tiết bài viết..." />
      </div>
      <div>
        <label className={labelCls}>Ngày đăng</label>
        <input type="date" value={form.publishedAt?.slice(0, 10)} onChange={e => setForm(x => ({ ...x, publishedAt: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Thứ tự</label>
        <input type="number" value={form.sortOrder} onChange={e => setForm(x => ({ ...x, sortOrder: +e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Hình ảnh</label>
        <input ref={imgRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => imgRef.current?.click()}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Chọn ảnh</button>
          {form.imageUrl && <Image src={form.imageUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover border border-gray-200" unoptimized />}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-5">
        <input type="checkbox" id="art-visible" checked={form.visible} onChange={e => setForm(x => ({ ...x, visible: e.target.checked }))} className="w-4 h-4 accent-red-700" />
        <label htmlFor="art-visible" className="text-sm text-gray-700">Hiển thị</label>
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

const EMPTY_IMG: Omit<GalleryImage, "id"> = { title: "", description: "", imageUrl: "", sortOrder: 0, visible: true };

function GalleryTab({ setError }: { setError: (e: string) => void }) {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<GalleryImage, "id">>(EMPTY_IMG);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<GalleryImage, "id">>(EMPTY_IMG);
  const [saving, setSaving] = useState(false);
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const editImgRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/gallery").then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data].sort((a, b) => a.sortOrder - b.sortOrder)); setAddForm(EMPTY_IMG); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/gallery/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: GalleryImage) {
    const res = await fetch(`/api/admin/gallery/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa hình ảnh này?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Thư viện ảnh ({items.length})</h2>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_IMG, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg">
          + Thêm ảnh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${editingId === item.id ? "border-red-400 col-span-2 sm:col-span-3 lg:col-span-4" : "border-gray-200"}`}>
            {editingId === item.id ? (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Tiêu đề</label>
                    <input value={editForm.title} onChange={e => setEditForm(x => ({ ...x, title: e.target.value }))} className={inputCls} placeholder="Tiêu đề ảnh" />
                  </div>
                  <div>
                    <label className={labelCls}>Mô tả</label>
                    <input value={editForm.description} onChange={e => setEditForm(x => ({ ...x, description: e.target.value }))} className={inputCls} placeholder="Mô tả" />
                  </div>
                  <div>
                    <label className={labelCls}>Thứ tự</label>
                    <input type="number" value={editForm.sortOrder} onChange={e => setEditForm(x => ({ ...x, sortOrder: +e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Hình ảnh</label>
                    <input ref={editImgRef} type="file" accept="image/*" onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setUploadingEdit(true);
                      setEditForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                      const url = await uploadImage(f, setError);
                      if (url) setEditForm(x => ({ ...x, imageUrl: url }));
                      setUploadingEdit(false);
                    }} className="hidden" />
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => editImgRef.current?.click()} disabled={uploadingEdit} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">{uploadingEdit ? "Đang tải..." : "Chọn ảnh"}</button>
                      {editForm.imageUrl && !editForm.imageUrl.startsWith("blob:") && <Image src={editForm.imageUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover border border-gray-200" unoptimized />}
                      {uploadingEdit && <span className="text-xs text-gray-400">Đang upload ảnh...</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" checked={editForm.visible} onChange={e => setEditForm(x => ({ ...x, visible: e.target.checked }))} className="w-4 h-4 accent-red-700" />
                    <span className="text-sm text-gray-700">Hiển thị</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving || uploadingEdit} className="px-4 py-2 bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">{saving ? "Đang lưu..." : uploadingEdit ? "Chờ upload ảnh..." : "Lưu"}</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
                </div>
              </div>
            ) : (
              <div>
                {item.imageUrl ? (
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <Image src={item.imageUrl} alt={item.title} width={200} height={200} className="w-full h-full object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-3xl">🖼️</div>
                )}
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-700 truncate">{item.title || "(Không tiêu đề)"}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiện" : "Ẩn"}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleToggle(item)} className="text-xs text-gray-400 hover:text-gray-700">{item.visible ? "👁" : "🙈"}</button>
                      <button onClick={() => { setEditingId(item.id); setEditForm({ title: item.title, description: item.description, imageUrl: item.imageUrl, sortOrder: item.sortOrder, visible: item.visible }); }} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Sửa</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Xóa</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-red-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Thêm ảnh mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tiêu đề</label>
              <input value={addForm.title} onChange={e => setAddForm(x => ({ ...x, title: e.target.value }))} className={inputCls} placeholder="Tiêu đề ảnh" />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <input value={addForm.description} onChange={e => setAddForm(x => ({ ...x, description: e.target.value }))} className={inputCls} placeholder="Mô tả" />
            </div>
            <div>
              <label className={labelCls}>Thứ tự</label>
              <input type="number" value={addForm.sortOrder} onChange={e => setAddForm(x => ({ ...x, sortOrder: +e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hình ảnh *</label>
              <input ref={addImgRef} type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setUploadingAdd(true);
                setAddForm(x => ({ ...x, imageUrl: URL.createObjectURL(f) }));
                const url = await uploadImage(f, setError);
                if (url) setAddForm(x => ({ ...x, imageUrl: url }));
                setUploadingAdd(false);
              }} className="hidden" />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => addImgRef.current?.click()} disabled={uploadingAdd} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">{uploadingAdd ? "Đang tải..." : "Chọn ảnh"}</button>
                {addForm.imageUrl && !addForm.imageUrl.startsWith("blob:") && <Image src={addForm.imageUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover border border-gray-200" unoptimized />}
                {uploadingAdd && <span className="text-xs text-gray-400">Đang upload ảnh...</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" checked={addForm.visible} onChange={e => setAddForm(x => ({ ...x, visible: e.target.checked }))} className="w-4 h-4 accent-red-700" />
              <span className="text-sm text-gray-700">Hiển thị</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || uploadingAdd} className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">{saving ? "Đang thêm..." : uploadingAdd ? "Chờ upload ảnh..." : "Thêm"}</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showAdd && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">Chưa có ảnh nào.</div>
      )}
    </div>
  );
}

// ─── Video Tab ────────────────────────────────────────────────────────────────

const EMPTY_VIDEO: Omit<VideoItem, "id"> = { title: "", description: "", youtubeUrl: "", thumbnailUrl: "", sortOrder: 0, visible: true };

function VideoTab({ setError }: { setError: (e: string) => void }) {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<VideoItem, "id">>(EMPTY_VIDEO);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<VideoItem, "id">>(EMPTY_VIDEO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/videos").then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data]); setAddForm(EMPTY_VIDEO); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/videos/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: VideoItem) {
    const res = await fetch(`/api/admin/videos/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa video này?")) return;
    const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  function getYtThumb(url: string) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&\s]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
  }

  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Danh sách video ({items.length})</h2>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_VIDEO, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg">
          + Thêm video
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">Chưa có video nào.</div>
        )}

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5 space-y-3">
                <VideoForm form={editForm} setForm={setEditForm} />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu"}</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4">
                <div className="shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {(item.thumbnailUrl || getYtThumb(item.youtubeUrl)) ? (
                    <Image src={item.thumbnailUrl || getYtThumb(item.youtubeUrl)!} alt={item.title} width={96} height={64} className="w-full h-full object-cover" unoptimized />
                  ) : <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{item.title || "(Không tiêu đề)"}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  <p className="text-xs text-blue-500 truncate">{item.youtubeUrl}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button onClick={() => handleToggle(item)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs">{item.visible ? "👁" : "🙈"}</button>
                  <button onClick={() => { setEditingId(item.id); setEditForm({ title: item.title, description: item.description, youtubeUrl: item.youtubeUrl, thumbnailUrl: item.thumbnailUrl, sortOrder: item.sortOrder, visible: item.visible }); }} className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 text-xs font-medium">Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {showAdd && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-red-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Thêm video mới</h3>
            <VideoForm form={addForm} setForm={setAddForm} />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving} className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">{saving ? "Đang thêm..." : "Thêm"}</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoForm({ form, setForm }: { form: Omit<VideoItem, "id">; setForm: React.Dispatch<React.SetStateAction<Omit<VideoItem, "id">>> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className={labelCls}>Tiêu đề *</label>
        <input value={form.title} onChange={e => setForm(x => ({ ...x, title: e.target.value }))} className={inputCls} placeholder="Tên video" />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Link YouTube *</label>
        <input value={form.youtubeUrl} onChange={e => setForm(x => ({ ...x, youtubeUrl: e.target.value }))} className={inputCls} placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..." />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Mô tả</label>
        <textarea value={form.description} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} className={inputCls} rows={2} placeholder="Mô tả ngắn về video..." />
      </div>
      <div>
        <label className={labelCls}>Thứ tự</label>
        <input type="number" value={form.sortOrder} onChange={e => setForm(x => ({ ...x, sortOrder: +e.target.value }))} className={inputCls} />
      </div>
      <div className="flex items-center gap-2 pt-5">
        <input type="checkbox" checked={form.visible} onChange={e => setForm(x => ({ ...x, visible: e.target.checked }))} className="w-4 h-4 accent-red-700" />
        <span className="text-sm text-gray-700">Hiển thị</span>
      </div>
    </div>
  );
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────────

const EMPTY_JOB: Omit<JobPosting, "id"> = {
  title: "", description: "", requirements: "", salary: "",
  location: "", contactName: "", contactPhone: "", sortOrder: 0, visible: true,
};

function JobsTab({ setError }: { setError: (e: string) => void }) {
  const [items, setItems] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<JobPosting, "id">>(EMPTY_JOB);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<JobPosting, "id">>(EMPTY_JOB);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/jobs").then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => [...s, data]); setAddForm(EMPTY_JOB); setShowAdd(false); }
    else setError(data.error || "Lỗi thêm");
    setSaving(false);
  }

  async function handleSave() {
    if (!editingId) return; setSaving(true); setError("");
    const res = await fetch(`/api/admin/jobs/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setItems(s => s.map(x => x.id === editingId ? data : x)); setEditingId(null); }
    else setError(data.error || "Lỗi lưu");
    setSaving(false);
  }

  async function handleToggle(item: JobPosting) {
    const res = await fetch(`/api/admin/jobs/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) { const d = await res.json(); setItems(s => s.map(x => x.id === item.id ? d : x)); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa vị trí tuyển dụng này?")) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (res.ok) setItems(s => s.filter(x => x.id !== id));
  }

  if (loading) return <div className="text-gray-400 py-10 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Vị trí tuyển dụng ({items.length})</h2>
        <button onClick={() => { setShowAdd(true); setAddForm({ ...EMPTY_JOB, sortOrder: items.length * 10 }); }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg">
          + Thêm vị trí
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">Chưa có vị trí tuyển dụng nào.</div>
        )}

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5 space-y-3">
                <JobForm form={editForm} setForm={setEditForm} />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu"}</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl shrink-0">💼</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm">{item.title || "(Không tiêu đề)"}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                    {item.salary   && <span>💰 {item.salary}</span>}
                    {item.location && <span>📍 {item.location}</span>}
                    {item.contactPhone && <span>📞 {item.contactPhone}</span>}
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button onClick={() => handleToggle(item)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs">{item.visible ? "👁" : "🙈"}</button>
                  <button onClick={() => { setEditingId(item.id); setEditForm({ title: item.title, description: item.description, requirements: item.requirements, salary: item.salary, location: item.location, contactName: item.contactName, contactPhone: item.contactPhone, sortOrder: item.sortOrder, visible: item.visible }); }} className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 text-xs font-medium">Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {showAdd && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-red-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Thêm vị trí tuyển dụng mới</h3>
            <JobForm form={addForm} setForm={setAddForm} />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving} className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60">{saving ? "Đang thêm..." : "Thêm"}</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobForm({ form, setForm }: { form: Omit<JobPosting, "id">; setForm: React.Dispatch<React.SetStateAction<Omit<JobPosting, "id">>> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className={labelCls}>Tên vị trí *</label>
        <input value={form.title} onChange={e => setForm(x => ({ ...x, title: e.target.value }))} className={inputCls} placeholder="VD: Nhân viên bán vé số" />
      </div>
      <div>
        <label className={labelCls}>Mức lương</label>
        <input value={form.salary} onChange={e => setForm(x => ({ ...x, salary: e.target.value }))} className={inputCls} placeholder="VD: 5-6 triệu/tháng" />
      </div>
      <div>
        <label className={labelCls}>Địa điểm</label>
        <input value={form.location} onChange={e => setForm(x => ({ ...x, location: e.target.value }))} className={inputCls} placeholder="VD: TP. Hồ Chí Minh" />
      </div>
      <div>
        <label className={labelCls}>Người liên hệ</label>
        <input value={form.contactName} onChange={e => setForm(x => ({ ...x, contactName: e.target.value }))} className={inputCls} placeholder="VD: Anh Hùng" />
      </div>
      <div>
        <label className={labelCls}>Số điện thoại liên hệ</label>
        <input value={form.contactPhone} onChange={e => setForm(x => ({ ...x, contactPhone: e.target.value }))} className={inputCls} placeholder="0909 123 456" />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Mô tả công việc</label>
        <textarea value={form.description} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} className={inputCls} rows={3} placeholder="Mô tả chi tiết công việc..." />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Yêu cầu</label>
        <textarea value={form.requirements} onChange={e => setForm(x => ({ ...x, requirements: e.target.value }))} className={inputCls} rows={3} placeholder="Yêu cầu ứng viên: tuổi, kinh nghiệm, bằng cấp..." />
      </div>
      <div>
        <label className={labelCls}>Thứ tự</label>
        <input type="number" value={form.sortOrder} onChange={e => setForm(x => ({ ...x, sortOrder: +e.target.value }))} className={inputCls} />
      </div>
      <div className="flex items-center gap-2 pt-5">
        <input type="checkbox" checked={form.visible} onChange={e => setForm(x => ({ ...x, visible: e.target.checked }))} className="w-4 h-4 accent-red-700" />
        <span className="text-sm text-gray-700">Hiển thị</span>
      </div>
    </div>
  );
}
