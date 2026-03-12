"use client";
import Link from "next/link";
import { useState } from "react";

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
      { label: "Trực Tiếp Xổ Số Điện Toán Mega 6/45",    href: "/" },
      { label: "Trực Tiếp Xổ Số Điện Toán Power 6/55",   href: "/" },
      { label: "Trực Tiếp Xổ Số Điện Toán Max4D",        href: "/" },
    ],
  },
  {
    title: "KQXS Kiến Thiết",
    items: [
      { label: "Kết Quả Xổ Số Miền Nam",    href: "/?region=mn" },
      { label: "Kết Quả Xổ Số Miền Trung",  href: "/?region=mt" },
      { label: "Kết Quả Xổ Số Miền Bắc",    href: "/?region=mb" },
      { label: "KQXS Ba Miền",               href: "/" },
    ],
  },
  {
    title: "KQXS Điện Toán",
    items: [
      { label: "Kết Quả Vietlott Mega 6/45", href: "/" },
      { label: "Kết Quả Vietlott Power 6/55", href: "/" },
      { label: "Kết Quả Vietlott Max4D",      href: "/" },
    ],
  },
];

const NAV_TABS = [
  { label: "XSMN", href: "/?region=mn" },
  { label: "XSMT", href: "/?region=mt" },
  { label: "XSMB", href: "/?region=mb" },
  { label: "Dò Vé", href: "/kiem-tra" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-red-700 shadow-lg sticky top-0 z-40">
        {/* ---- Branding row ---- */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-yellow-400 text-red-700 font-extrabold text-xl px-3 py-1 rounded-lg shadow">
              PN
            </div>
            <div>
              <div className="text-white font-extrabold text-2xl tracking-wide leading-tight">
                PHƯƠNG NGHI
              </div>
              <div className="text-yellow-300 text-xs tracking-widest uppercase">
                Kết Quả Xổ Số Trực Tiếp
              </div>
            </div>
          </Link>

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
