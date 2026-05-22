"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChoiceSheet() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Hiện sau 300ms để trang load xong
    const t = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <div className="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 max-w-lg mx-auto">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-1">
            Bạn muốn xem
          </p>
          <h2 className="text-xl font-black text-gray-900 text-center mb-5">
            Chọn trang
          </h2>

          <div className="flex flex-col gap-3">
            {/* Đại lý */}
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 bg-red-50 border-2 border-red-200 hover:bg-red-100 active:scale-[0.98] transition-all rounded-2xl px-5 py-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-red-700 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-900 text-base">Trang Đại Lý</div>
                <div className="text-sm text-gray-500">Thông tin, địa chỉ & liên hệ</div>
              </div>
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Nhân viên */}
            <button
              onClick={() => router.push("/nhan-vien")}
              className="flex items-center gap-4 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 active:scale-[0.98] transition-all rounded-2xl px-5 py-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-900 text-base">Đội Ngũ Nhân Viên</div>
                <div className="text-sm text-gray-500">Xem thông tin & liên hệ nhân viên</div>
              </div>
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both;
        }
      `}</style>
    </>
  );
}
