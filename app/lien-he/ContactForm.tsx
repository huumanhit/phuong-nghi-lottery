"use client";
import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-red-700 px-5 py-3">
        <h2 className="text-white font-extrabold text-base">Gửi Liên Hệ</h2>
      </div>
      {sent ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-green-700 font-bold text-lg">Gửi thành công!</p>
          <p className="text-gray-500 text-sm mt-1">Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-sm text-red-600 underline"
          >
            Gửi lại
          </button>
        </div>
      ) : (
        <form
          className="p-5 space-y-4"
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        >
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ và Tên</label>
            <input
              type="text"
              required
              placeholder="Nhập họ và tên"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số Điện Thoại</label>
            <input
              type="tel"
              required
              placeholder="Nhập số điện thoại"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nội Dung</label>
            <textarea
              rows={4}
              required
              placeholder="Nhập nội dung cần liên hệ..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg text-sm transition-colors active:scale-95"
          >
            Gửi Liên Hệ
          </button>
        </form>
      )}
    </div>
  );
}
