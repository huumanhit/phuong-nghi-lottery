export const metadata = {
  title: "Liên hệ - Đại lý Phương Nghi",
  description: "Thông tin liên hệ đại lý vé số Phương Nghi",
};

export default function LienHePage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #ff6b6b 100%)" }}>
      <div className="w-full max-w-sm mx-4">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-500 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎟️</span>
            </div>
            <h1 className="text-white text-2xl font-bold">Dlvs Phương Nghi</h1>
            <p className="text-red-100 text-sm mt-1">Đại lý vé số chính thức</p>
          </div>

          {/* Links */}
          <div className="px-6 py-6 space-y-3">
            {/* Zalo */}
            <a
              href="https://zalo.me/0963111801"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl px-4 py-3.5 transition-all active:scale-95"
            >
              <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">💬</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Nhắn tin Zalo</p>
                <p className="text-gray-500 text-xs">0963 111 801</p>
              </div>
              <span className="ml-auto text-gray-400">›</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1CTrFL5rxk/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl px-4 py-3.5 transition-all active:scale-95"
            >
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">📘</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Facebook</p>
                <p className="text-gray-500 text-xs">Dlvs Phương Nghi</p>
              </div>
              <span className="ml-auto text-gray-400">›</span>
            </a>

            {/* Google Maps */}
            <a
              href="https://maps.app.goo.gl/tthT2NwjpySsUDDt9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-2xl px-4 py-3.5 transition-all active:scale-95"
            >
              <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">📍</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Xem địa chỉ</p>
                <p className="text-gray-500 text-xs">Google Maps</p>
              </div>
              <span className="ml-auto text-gray-400">›</span>
            </a>

            {/* Gọi điện */}
            <a
              href="tel:0963111801"
              className="flex items-center gap-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl px-4 py-3.5 transition-all active:scale-95"
            >
              <div className="w-11 h-11 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">📞</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Gọi điện</p>
                <p className="text-gray-500 text-xs">0963 111 801</p>
              </div>
              <span className="ml-auto text-gray-400">›</span>
            </a>
          </div>

          {/* Footer */}
          <div className="text-center pb-5 text-xs text-gray-400">
            xosophuongnghi.com.vn
          </div>
        </div>
      </div>
    </main>
  );
}
