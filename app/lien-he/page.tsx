import HeaderWrapper from "@/app/components/HeaderWrapper";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Liên Hệ - Đại Lý Xổ Số Phương Nghi",
  description: "Thông tin liên hệ đại lý vé số Phương Nghi. Hotline: 0989 007 772.",
};

export default function LienHePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeaderWrapper />

      <div className="bg-white border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 py-2 text-xs text-gray-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
          <span>›</span>
          <span className="text-red-700 font-semibold">Liên hệ</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-red-700 uppercase tracking-wide mb-6">
          Liên Hệ
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Contact info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-red-700 px-5 py-3">
                <h2 className="text-white font-extrabold text-base">Thông Tin Liên Hệ</h2>
              </div>
              <ul className="p-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">📞</span>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Hotline</p>
                    <a href="tel:0989007772" className="text-red-700 font-extrabold text-lg hover:text-red-800 transition-colors">
                      0989 007 772
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">✉</span>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Email</p>
                    <a href="mailto:xosophuongnghi@gmail.com" className="text-gray-700 hover:text-red-600 transition-colors">
                      xosophuongnghi@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">🕐</span>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Thời Gian Làm Việc</p>
                    <p className="text-gray-700">7:00 – 22:00 (Tất cả các ngày)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">📍</span>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Địa Chỉ</p>
                    <p className="text-gray-700">25 Phan Văn Hớn, Bà Điểm, Hóc Môn, TP. HCM</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href="tel:0989007772" className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors active:scale-95 text-sm">
                📞 Gọi Ngay
              </a>
              <a href="https://zalo.me/0963111801" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors active:scale-95 text-sm">
                💬 Zalo
              </a>
              <a href="https://www.facebook.com/share/1CTrFL5rxk/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95 text-sm">
                📘 Facebook
              </a>
              <a href="https://maps.app.goo.gl/tthT2NwjpySsUDDt9" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95 text-sm">
                🗺 Bản Đồ
              </a>
            </div>
          </div>

          {/* Right: Contact form (client component) */}
          <ContactForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}
