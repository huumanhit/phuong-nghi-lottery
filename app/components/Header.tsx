"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

// ---------------------------------------------------------------------------
// Menu data
// ---------------------------------------------------------------------------

const MENU_SECTIONS = [
  {
    title: "Xổ Số Trực Tiếp",
    items: [
      { label: "Trực Tiếp Xổ Số Miền Nam",              href: "/?region=mn" },
      { label: "Trực Tiếp Xổ Số Miền Trung",             href: "/?region=mt" },
      { label: "Trực Tiếp Xổ Số Miền Bắc",               href: "/?region=mb" },
      { label: "Trực Tiếp Xổ Số Điện Toán Mega 6/45",    href: "/dien-toan/mega-645"  },
      { label: "Trực Tiếp Xổ Số Điện Toán Power 6/55",   href: "/dien-toan/power-655" },
      { label: "Trực Tiếp Xổ Số Điện Toán Max4D",        href: "/dien-toan/max-4d"    },
    ],
  },
  {
    title: "KQXS Kiến Thiết",
    items: [
      { label: "Kết Quả Xổ Số Miền Nam",    href: "/?region=mn"   },
      { label: "Kết Quả Xổ Số Miền Trung",  href: "/?region=mt"   },
      { label: "Kết Quả Xổ Số Miền Bắc",    href: "/?region=mb"   },
      { label: "Dò Vé Số Online",            href: "/kiem-tra"     },
      { label: "Đổi Vé Trúng Thưởng",        href: "/doi-ve-trung" },
    ],
  },
  {
    title: "KQXS Điện Toán",
    items: [
      { label: "Kết Quả Vietlott Mega 6/45",  href: "/dien-toan/mega-645"  },
      { label: "Kết Quả Vietlott Power 6/55", href: "/dien-toan/power-655" },
      { label: "Kết Quả Vietlott Max4D",      href: "/dien-toan/max-4d"    },
    ],
  },
];

const NAV_TABS = [
  { label: "XSMN",  href: "/?region=mn" },
  { label: "XSMT",  href: "/?region=mt" },
  { label: "XSMB",  href: "/?region=mb" },
  { label: "Dò Vé", href: "/kiem-tra"  },
  { label: "In Vé", href: "/in-ve-do" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <header className="bg-red-700 shadow-lg sticky top-0 z-40">
        {/* ---- Branding row ---- */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Phương Nghi Logo" width={60} height={60} className="rounded-full" priority />
            <div>
              <div className="font-oswald text-white font-bold leading-tight"
                   style={{ fontSize: "26px", letterSpacing: "0.04em" }}>
                PHƯƠNG NGHI
              </div>
              <div className="font-vietnam text-yellow-300 font-semibold uppercase"
                   style={{ fontSize: "11px", letterSpacing: "0.18em" }}>
                Kết Quả Xổ Số Trực Tiếp
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Auth button */}
            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/my-tickets"
                  className="hidden sm:flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-red-900 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                >
                  🎫 Vé Của Tôi
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden sm:block bg-red-800 hover:bg-red-900 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block bg-yellow-400 hover:bg-yellow-300 text-red-900 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
              >
                Đăng Nhập
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors active:scale-95"
              aria-label="Mở menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>

        {/* ---- Main tab row ---- */}
        <div className="bg-red-800 border-t border-red-900">
          <div className="max-w-7xl mx-auto px-4 flex">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className="px-5 py-2.5 text-white text-sm font-bold hover:bg-red-700 border-r border-red-900 last:border-r-0 transition-colors whitespace-nowrap"
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ---- Slide-in menu overlay ---- */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex justify-end"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xs h-full overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu header */}
            <div className="bg-red-700 px-4 py-4 flex items-center justify-between sticky top-0">
              <span className="text-white font-bold text-base uppercase tracking-wide">
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white hover:text-yellow-300 p-1 rounded transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Auth section (mobile) */}
            <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between sm:hidden">
              {session ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Đăng nhập:</p>
                    <p className="text-sm font-bold text-red-700 truncate max-w-[160px]">{session.user?.name}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <Link
                      href="/my-tickets"
                      onClick={() => setMenuOpen(false)}
                      className="text-xs font-bold text-red-700 hover:underline"
                    >
                      🎫 Vé Của Tôi
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="text-xs font-bold text-gray-500 hover:text-red-700"
                    >
                      Đăng Xuất
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-3 w-full">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-red-700 text-white text-sm font-bold rounded-lg"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-red-700 text-red-700 text-sm font-bold rounded-lg"
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>

            {/* Menu sections */}
            <div className="flex-1">
              {MENU_SECTIONS.map((section) => (
                <div key={section.title}>
                  {/* Section title */}
                  <div className="bg-red-700 px-4 py-3 text-white font-bold text-sm text-center tracking-wide">
                    {section.title}
                  </div>
                  {/* Section items */}
                  <ul className="bg-orange-50 divide-y divide-orange-100">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-gray-800 font-medium text-sm hover:bg-orange-100 hover:text-red-700 transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
