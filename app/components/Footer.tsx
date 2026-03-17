import Link from "next/link";

const NAV_COLS = [
  {
    title: "TRỰC TIẾP KQXS",
    links: [
      { label: "Trực Tiếp Xổ Số Miền Nam",    href: "/?region=mn" },
      { label: "Trực Tiếp Xổ Số Miền Bắc",    href: "/?region=mb" },
      { label: "Trực Tiếp Xổ Số Miền Trung",  href: "/?region=mt" },
      { label: "Trực Tiếp Xổ Số Mega 6/45",   href: "/dien-toan/mega-645" },
      { label: "Trực Tiếp Xổ Số Power 6/55",  href: "/dien-toan/power-655" },
    ],
  },
  {
    title: "KẾT QUẢ XỔ SỐ",
    links: [
      { label: "Kết Quả Xổ Số Miền Nam",    href: "/?region=mn" },
      { label: "Kết Quả Xổ Số Miền Trung",  href: "/?region=mt" },
      { label: "Kết Quả Xổ Số Miền Bắc",    href: "/?region=mb" },
      { label: "Kết Quả Vietlott Mega 6/45", href: "/dien-toan/mega-645" },
      { label: "Kết Quả Điện Toán",          href: "/dien-toan/max-4d" },
    ],
  },
  {
    title: "TIỆN ÍCH",
    links: [
      { label: "Dò Vé Số Online",   href: "/kiem-tra" },
      { label: "Đổi Vé Trúng",      href: "/doi-ve-trung" },
      { label: "Vé Số Của Tôi",     href: "/my-tickets" },
    ],
  },
  {
    title: "IN VÉ DÒ",
    links: [
      { label: "In Vé Dò Miền Nam",   href: "/?region=mn" },
      { label: "In Vé Dò Miền Trung", href: "/?region=mt" },
      { label: "In Vé Dò Miền Bắc",   href: "/?region=mb" },
      { label: "In Vé Dò Mega 6/45",  href: "/dien-toan/mega-645" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="bg-red-800 text-white mt-8"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* ── Top section ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-red-700">

        {/* Left: address block */}
        <div>
          <h3 className="text-yellow-300 font-extrabold text-sm uppercase tracking-wide mb-3">
            Đại Lý Vé Số Phương Nghi
          </h3>
          <p className="text-red-200 text-xs mb-2 font-semibold uppercase tracking-wide">
            Hệ thống phân phối sỉ vé số kiến thiết Miền Nam
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-300 mt-0.5 flex-shrink-0">📍</span>
              <span>25 Phan Văn Hớn, Bà Điểm, Hóc Môn, TP. HCM</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300 mt-0.5 flex-shrink-0">📍</span>
              <span>30 Phan Văn Đối, Bà Điểm, Hóc Môn, TP. HCM</span>
            </li>
          </ul>
        </div>

        {/* Right: contact / hotline */}
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-red-200 text-sm font-bold uppercase tracking-widest mb-1">
            🎰 Đổi Vé Trúng
          </p>
          <a
            href="tel:0989007772"
            className="text-yellow-300 font-extrabold leading-tight hover:text-yellow-200 transition-colors"
            style={{ fontSize: "32px", letterSpacing: "0.08em" }}
          >
            0989 007 772
          </a>
          <p className="text-white font-semibold text-sm mt-1 tracking-wide">
            Gặp Mr.Quân
          </p>
        </div>
      </div>

      {/* ── Nav columns ── */}
      <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-5 border-b border-red-700">
        {NAV_COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-yellow-300 font-extrabold text-xs uppercase tracking-wide mb-2.5 border-b border-red-700 pb-1.5">
              {col.title}
            </h4>
            <ul className="space-y-1.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-red-100 hover:text-yellow-300 text-xs transition-colors leading-snug block"
                  >
                    › {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-red-300 text-xs text-center sm:text-left">
          © {new Date().getFullYear()} Phương Nghi — Kết Quả Xổ Số Trực Tiếp
        </p>
        <div className="flex items-center gap-3">
          <a
            href="mailto:phuongnghixoso@gmail.com"
            className="text-red-300 hover:text-yellow-300 text-xs transition-colors flex items-center gap-1"
          >
            ✉ Liên hệ: phuongnghixoso@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
