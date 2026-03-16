import Header from "../components/Header";
import Link from "next/link";

export const metadata = {
  title: "Đổi Vé Trúng - Đại Lý Xổ Số Phương Nghi",
  description:
    "Đại lý xổ số Phương Nghi chuyên đổi vé số trúng thưởng toàn quốc. Hoa hồng thấp nhất, uy tín, nhanh chóng.",
};

const REGION_LINKS = [
  { label: "Trực Tiếp Xổ Số Miền Nam",   href: "/?region=mn", color: "text-blue-700"  },
  { label: "Trực Tiếp Xổ Số Miền Trung", href: "/?region=mt", color: "text-green-700" },
  { label: "Trực Tiếp Xổ Số Miền Bắc",  href: "/?region=mb", color: "text-red-700"   },
];

const PRIZES = [
  { label: "Giải Đặc Biệt", value: "2.000.000.000 đ", note: "Hoa hồng 0.1%" },
  { label: "Giải Nhất",     value: "30.000.000 đ",    note: "Hoa hồng 0.5%" },
  { label: "Giải Nhì",      value: "15.000.000 đ",    note: "Hoa hồng 1%"   },
  { label: "Giải Ba",       value: "10.000.000 đ",    note: "Hoa hồng 1%"   },
  { label: "Giải Tư",       value: "3.000.000 đ",     note: "Hoa hồng 1.5%" },
  { label: "Giải Năm",      value: "1.000.000 đ",     note: "Hoa hồng 2%"   },
  { label: "Giải Sáu",      value: "400.000 đ",       note: "Hoa hồng 2%"   },
  { label: "Giải Bảy",      value: "200.000 đ",       note: "Hoa hồng 2%"   },
  { label: "Giải Tám",      value: "100.000 đ",       note: "Hoa hồng 2%"   },
];

const STEPS = [
  { step: "01", title: "Kiểm Tra Vé",  desc: "Dò vé số tại trang Kiểm Tra Vé hoặc đối chiếu bảng kết quả xổ số chính thức." },
  { step: "02", title: "Mang Vé Đến",  desc: "Mang vé số trúng còn nguyên vẹn đến Đại lý Phương Nghi trong vòng 60 ngày kể từ ngày xổ." },
  { step: "03", title: "Xác Thực Vé",  desc: "Nhân viên kiểm tra, xác thực mã vé số và giải trúng thưởng của bạn." },
  { step: "04", title: "Nhận Tiền",    desc: "Nhận tiền thưởng ngay tại đại lý (giải nhỏ) hoặc hỗ trợ làm thủ tục tại Công ty Xổ Số (giải lớn)." },
];

export default function DoiVeTrungPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Hero banner ── */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-red-700 to-red-900 text-white text-center px-6 py-10">
          <p className="text-yellow-300 text-sm font-bold tracking-widest uppercase mb-2">
            Đại Lý Xổ Số Uy Tín
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-1">
            PHƯƠNG NGHI
          </h1>
          <p className="text-red-200 text-sm mb-6">Kết Quả Xổ Số Trực Tiếp Toàn Quốc</p>

          <div className="inline-block bg-yellow-400 text-red-900 font-extrabold text-xl md:text-2xl px-8 py-3 rounded-full shadow-md mb-6">
            ĐỔI VÉ SỐ TRÚNG
          </div>

          <p className="text-red-100 text-sm font-semibold mb-4">
            Trực Tiếp Kết Quả Xổ Số Toàn Quốc
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {REGION_LINKS.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="bg-white text-red-700 font-bold text-sm px-4 py-1.5 rounded-full hover:bg-yellow-100 transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>

          <p className="text-yellow-300 font-bold text-base">
            Chuyên Đổi Số Trúng Đặc Biệt — Hoa Hồng Thấp Nhất
          </p>
        </div>

        {/* ── Intro card ── */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-600">
          <h2 className="text-xl font-extrabold text-red-700 mb-3">
            Nhận Đổi Số Trúng Thưởng Lớn!
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            Đại lý xổ số <strong>Phương Nghi</strong> chuyên nhận đổi vé số trúng thưởng từ tất cả các
            đài xổ số Miền Nam, Miền Trung và Miền Bắc. Chúng tôi cam kết thủ tục nhanh gọn,
            thanh toán minh bạch và hoa hồng thấp nhất thị trường.
          </p>
          <ul className="text-sm text-gray-600 space-y-1.5">
            {[
              "✅ Đổi vé nhanh — nhận tiền ngay trong ngày",
              "✅ Hoa hồng thấp nhất, không phát sinh phí ẩn",
              "✅ Hỗ trợ làm thủ tục giải lớn tại Công ty Xổ Số",
              "✅ Hoạt động tất cả ngày trong tuần",
            ].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        {/* ── Prize table ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-red-700 px-5 py-3">
            <h2 className="text-white font-extrabold text-base">Bảng Giải Thưởng &amp; Hoa Hồng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="bg-red-50 text-red-700 font-bold">
                  <th className="px-4 py-2.5 text-left">Giải Thưởng</th>
                  <th className="px-4 py-2.5">Trị Giá</th>
                  <th className="px-4 py-2.5">Hoa Hồng</th>
                </tr>
              </thead>
              <tbody>
                {PRIZES.map((p, i) => (
                  <tr
                    key={p.label}
                    className={`border-t border-gray-100 ${
                      i === 0
                        ? "bg-red-50 font-extrabold text-red-700"
                        : i % 2 === 0
                        ? "bg-gray-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-2.5 text-left font-semibold">{p.label}</td>
                    <td className="px-4 py-2.5 font-bold">{p.value}</td>
                    <td className="px-4 py-2.5 text-green-700 font-semibold">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 px-5 py-3">
            * Hoa hồng áp dụng cho vé số kiến thiết. Mức hoa hồng có thể thay đổi theo từng đài.
          </p>
        </div>

        {/* ── How-to steps ── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-extrabold text-red-700 mb-5">Quy Trình Đổi Vé Trúng</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="flex gap-4 bg-red-50 rounded-xl p-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-700 text-white font-extrabold text-sm flex items-center justify-center">
                  {s.step}
                </div>
                <div>
                  <p className="font-bold text-red-700 text-sm mb-1">{s.title}</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick links ── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-base font-extrabold text-red-700 mb-4">Xem Kết Quả Xổ Số</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REGION_LINKS.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-bold text-red-700 transition-colors active:scale-95"
              >
                🎰 {r.label.replace("Trực Tiếp ", "")}
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <Link
              href="/kiem-tra"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 rounded-xl text-sm font-bold text-yellow-800 transition-colors active:scale-95"
            >
              🔍 Dò Vé Số Online
            </Link>
          </div>
        </div>

        {/* ── Note ── */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <p className="text-orange-800 font-bold text-sm mb-1">⚠ Lưu ý quan trọng</p>
          <ul className="text-xs text-orange-700 space-y-1 leading-relaxed">
            <li>• Vé số trúng phải còn nguyên vẹn, không rách, không tẩy xóa.</li>
            <li>• Thời hạn đổi thưởng: <strong>60 ngày</strong> kể từ ngày xổ.</li>
            <li>• Vui lòng mang theo CMND/CCCD khi đến đổi thưởng giải lớn.</li>
            <li>• Giải đặc biệt và giải lớn có thể cần làm thủ tục tại Công ty Xổ Số tỉnh.</li>
          </ul>
        </div>

      </div>
    </main>
  );
}
