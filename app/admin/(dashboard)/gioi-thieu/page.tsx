"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const EMPTY_FORM = {
  storeName: "",
  tagline: "",
  description: "",
  address1: "",
  address2: "",
  phone: "",
  email: "",
  openHours: "",
  mapEmbedUrl: "",
};

type FormData = typeof EMPTY_FORM;

export default function GioiThieuAdminPage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string>(`/logo.png?t=${Date.now()}`);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [logoSuccess, setLogoSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/store-info")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          storeName: data.storeName ?? "",
          tagline: data.tagline ?? "",
          description: data.description ?? "",
          address1: data.address1 ?? "",
          address2: data.address2 ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          openHours: data.openHours ?? "",
          mapEmbedUrl: data.mapEmbedUrl ?? "",
        });
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");
    setLogoSuccess(false);
    // Local preview
    setLogoPreview(URL.createObjectURL(file));
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setLogoPreview(data.url);
        setLogoSuccess(true);
      } else {
        setLogoError(data.error || "Upload thất bại");
      }
    } catch {
      setLogoError("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setLogoUploading(false);
    }
  }

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/admin/store-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const d = await res.json();
      setError(d.error || "Có lỗi xảy ra");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Giới thiệu cửa hàng</h1>
        <p className="text-gray-500 text-sm mt-1">Chỉnh sửa thông tin giới thiệu hiển thị trên trang web</p>
      </div>

      {/* Logo upload card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Logo website</h2>
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div className="shrink-0 w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            <Image
              src={logoPreview}
              alt="Logo hiện tại"
              width={96}
              height={96}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-3">
              Định dạng: PNG, JPG, WEBP, GIF. Tối đa 2MB.<br />
              Khuyến nghị: ảnh vuông, tối thiểu 200×200px.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors"
            >
              {logoUploading ? "Đang tải lên..." : "Chọn ảnh mới"}
            </button>
            {logoSuccess && (
              <p className="text-green-600 text-xs font-medium mt-2">Logo đã cập nhật thành công!</p>
            )}
            {logoError && (
              <p className="text-red-600 text-xs font-medium mt-2">{logoError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 max-w-2xl">

        <Field label="Tên cửa hàng">
          <input
            type="text"
            value={form.storeName}
            onChange={(e) => set("storeName", e.target.value)}
            placeholder="VD: Đại Lý Vé Số Phương Nghi"
            className={inputCls}
          />
        </Field>

        <Field label="Slogan / Tagline">
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="VD: Hệ thống phân phối sỉ vé số kiến thiết Miền Nam"
            className={inputCls}
          />
        </Field>

        <Field label="Giới thiệu chung" hint="Nội dung sẽ hiển thị trong khung giới thiệu. Có thể xuống dòng.">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={6}
            placeholder="Nhập nội dung giới thiệu về cửa hàng..."
            className={inputCls}
          />
        </Field>

        <Field label="Địa chỉ 1">
          <input
            type="text"
            value={form.address1}
            onChange={(e) => set("address1", e.target.value)}
            placeholder="VD: 25 Phan Văn Hớn, Bà Điểm, Hóc Môn, TP. HCM"
            className={inputCls}
          />
        </Field>

        <Field label="Địa chỉ 2 (tuỳ chọn)">
          <input
            type="text"
            value={form.address2}
            onChange={(e) => set("address2", e.target.value)}
            placeholder="VD: 30 Phan Văn Đối, Bà Điểm, Hóc Môn, TP. HCM"
            className={inputCls}
          />
        </Field>

        <Field label="Số điện thoại">
          <input
            type="text"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="VD: 0989 007 772"
            className={inputCls}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="VD: xosophuongnghi@gmail.com"
            className={inputCls}
          />
        </Field>

        <Field label="Giờ hoạt động" hint="Có thể xuống dòng để ghi nhiều ca.">
          <textarea
            value={form.openHours}
            onChange={(e) => set("openHours", e.target.value)}
            rows={3}
            placeholder="VD: Thứ 2 - Thứ 7: 7:00 - 18:00&#10;Chủ nhật: 7:00 - 12:00"
            className={inputCls}
          />
        </Field>

        <Field label="Nhúng bản đồ (Google Maps embed URL)" hint="Dán link embed từ Google Maps (iframe src=...). Để trống nếu không dùng.">
          <input
            type="text"
            value={form.mapEmbedUrl}
            onChange={(e) => set("mapEmbedUrl", e.target.value)}
            placeholder="https://www.google.com/maps/embed?..."
            className={inputCls}
          />
        </Field>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            Lưu thành công!
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg disabled:opacity-60 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <a
            href="/gioi-thieu"
            target="_blank"
            className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-sm rounded-lg transition-colors"
          >
            Xem trang giới thiệu
          </a>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
