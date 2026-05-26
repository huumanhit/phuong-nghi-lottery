"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const SERVICES_LINKS = [
  { label: "Kết Quả Xổ Số Miền Nam",    href: "/?region=mn"   },
  { label: "Kết Quả Xổ Số Miền Trung",  href: "/?region=mt"   },
  { label: "Kết Quả Xổ Số Miền Bắc",    href: "/?region=mb"   },
  { label: "Dò Vé Số Online",            href: "/kiem-tra"     },
  { label: "In Vé Dò",                   href: "/in-ve-do"     },
  { label: "Đổi Thưởng",                 href: "/doi-ve-trung" },
];

const INFO_LINKS = [
  { label: "Giới Thiệu",         href: "/gioi-thieu"        },
  { label: "Tin Tức",            href: "/tin-tuc"           },
  { label: "Hình Ảnh",           href: "/hinh-anh"          },
  { label: "Video",              href: "/video"             },
  { label: "Đại Lý",            href: "/dai-ly"            },
  { label: "Tuyển Dụng",         href: "/tuyen-dung"        },
];

const DEFAULTS = {
  storeName: "Đại Lý Vé Số Phương Nghi",
  tagline: "Hệ thống phân phối sỉ vé số kiến thiết Miền Nam",
  address1: "25 Phan Văn Hớn, Bà Điểm, Hóc Môn, TP. HCM",
  phone: "0989 007 772",
  email: "xosophuongnghi@gmail.com",
};

const FOOTER_CACHE_KEY = "site_store_info";
type StoreInfo = typeof DEFAULTS;

function getCached(): StoreInfo {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(FOOTER_CACHE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function Footer() {
  const [info, setInfo] = useState<StoreInfo>(getCached);

  useEffect(() => {
    fetch("/api/store-info")
      .then((r) => r.json())
      .then((d) => {
        const updated: StoreInfo = {
          storeName: d.storeName || DEFAULTS.storeName,
          tagline:   d.tagline   || DEFAULTS.tagline,
          address1:  d.address1  || DEFAULTS.address1,
          phone:     d.phone     || DEFAULTS.phone,
          email:     d.email     || DEFAULTS.email,
        };
        setInfo(updated);
        localStorage.setItem(FOOTER_CACHE_KEY, JSON.stringify(updated));
      })
      .catch(() => {});
  }, []);

  const telClean = info.phone.replace(/\s/g, "");

  return (
    <footer className="bg-red-800 text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* ── Main 4-column grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-red-700">

        {/* Col 1: Brand + social */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-black text-red-800 text-sm flex-shrink-0">
              PN
            </div>
            <div>
              <div className="text-yellow-300 font-extrabold text-sm leading-tight uppercase tracking-wide">
                {info.storeName}
              </div>
            </div>
          </div>
          <p className="text-red-200 text-xs leading-relaxed mb-4">
            {info.tagline}. Nhanh chóng — Chính xác — Uy tín hàng đầu.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2 mb-4">
            <a
              href="https://www.facebook.com/share/1CTrFL5rxk/"
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors text-white text-sm font-bold"
            >
              f
            </a>
            <a
              href="https://zalo.me/0963111801"
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-400 hover:bg-blue-300 flex items-center justify-center transition-colors text-white text-xs font-bold"
            >
              Z
            </a>
            <a
              href="/"
              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors text-white text-sm"
            >
              ▶
            </a>
          </div>

          {/* BCT badge */}
          <div className="inline-flex items-center gap-1.5 bg-red-700 border border-red-600 rounded-lg px-3 py-1.5">
            <span className="text-yellow-300 text-xs">✓</span>
            <span className="text-white text-[10px] font-bold uppercase tracking-wide leading-tight">
              Đã Đăng Ký<br />Bộ Công Thương
            </span>
          </div>
        </div>

        {/* Col 2: Dịch vụ */}
        <div>
          <h4 className="text-yellow-300 font-extrabold text-xs uppercase tracking-widest mb-4 pb-1.5 border-b border-red-700">
            Dịch Vụ
          </h4>
          <ul className="space-y-2">
            {SERVICES_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-red-100 hover:text-yellow-300 text-xs transition-colors leading-snug flex items-center gap-1.5"
                >
                  <span className="text-red-400">›</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Thông tin */}
        <div>
          <h4 className="text-yellow-300 font-extrabold text-xs uppercase tracking-widest mb-4 pb-1.5 border-b border-red-700">
            Thông Tin
          </h4>
          <ul className="space-y-2">
            {INFO_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-red-100 hover:text-yellow-300 text-xs transition-colors leading-snug flex items-center gap-1.5"
                >
                  <span className="text-red-400">›</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Hỗ trợ */}
        <div>
          <h4 className="text-yellow-300 font-extrabold text-xs uppercase tracking-widest mb-4 pb-1.5 border-b border-red-700">
            Hỗ Trợ
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-yellow-300 flex-shrink-0 mt-0.5">📞</span>
              <div>
                <p className="text-red-200 font-semibold uppercase tracking-wide text-[10px]">Hotline</p>
                <a href={`tel:${telClean}`} className="text-white font-extrabold text-base hover:text-yellow-300 transition-colors">
                  {info.phone}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300 flex-shrink-0 mt-0.5">✉</span>
              <div>
                <p className="text-red-200 font-semibold uppercase tracking-wide text-[10px]">Email</p>
                <a href={`mailto:${info.email}`} className="text-white text-xs hover:text-yellow-300 transition-colors">
                  {info.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300 flex-shrink-0 mt-0.5">🕐</span>
              <div>
                <p className="text-red-200 font-semibold uppercase tracking-wide text-[10px]">Thời Gian</p>
                <p className="text-white">7:00 – 22:00 (Tất cả các ngày)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300 flex-shrink-0 mt-0.5">📍</span>
              <div>
                <p className="text-red-200 font-semibold uppercase tracking-wide text-[10px]">Địa Chỉ</p>
                <p className="text-white leading-relaxed">{info.address1}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-red-300 text-xs text-center sm:text-left">
          © {new Date().getFullYear()} {info.storeName}. All rights reserved.
        </p>
        <p className="text-red-400 text-xs">
          Kết Quả Xổ Số Trực Tiếp — Nhanh Nhất &amp; Chính Xác Nhất
        </p>
      </div>
    </footer>
  );
}
