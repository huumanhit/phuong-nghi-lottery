import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chào Mừng",
  description: "Chọn thông tin bạn muốn xem",
};

async function getStoreInfo() {
  try {
    return await prisma.storeInfo.findUnique({ where: { id: "main" } });
  } catch { return null; }
}

export default async function HubPage() {
  const store = await getStoreInfo();
  const storeName = store?.storeName || "Đại Lý Vé Số Phương Nghi";
  const logoUrl = store?.logoUrl || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 flex flex-col items-center justify-center px-5 py-12 font-sans">

      {/* Logo + Tên */}
      <div className="flex flex-col items-center mb-10">
        {logoUrl ? (
          <div className="w-24 h-24 rounded-full border-4 border-yellow-400/70 shadow-xl overflow-hidden bg-white mb-4">
            <Image src={logoUrl} alt={storeName} width={96} height={96} className="w-full h-full object-cover" unoptimized />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-yellow-400/70 shadow-xl bg-white/10 flex items-center justify-center mb-4 text-5xl">
            🎟️
          </div>
        )}
        <h1 className="text-white text-xl font-black text-center leading-tight">{storeName}</h1>
        <p className="text-red-200 text-sm mt-1 text-center">Chọn thông tin bạn muốn xem</p>
      </div>

      {/* Hai lựa chọn */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Đại lý */}
        <Link
          href="/dai-ly"
          className="group relative bg-white rounded-2xl shadow-xl overflow-hidden flex items-center gap-5 px-6 py-5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <div className="w-14 h-14 rounded-xl bg-red-700 flex items-center justify-center shrink-0 shadow-md group-hover:bg-red-800 transition-colors">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-gray-900 text-lg leading-tight">Trang Đại Lý</div>
            <div className="text-sm text-gray-500 mt-0.5">Thông tin, địa chỉ & liên hệ</div>
          </div>
          <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Nhân viên */}
        <Link
          href="/nhan-vien"
          className="group relative bg-white rounded-2xl shadow-xl overflow-hidden flex items-center gap-5 px-6 py-5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <div className="w-14 h-14 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0 shadow-md group-hover:bg-yellow-600 transition-colors">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-gray-900 text-lg leading-tight">Đội Ngũ Nhân Viên</div>
            <div className="text-sm text-gray-500 mt-0.5">Xem thông tin & liên hệ nhân viên</div>
          </div>
          <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Footer nhỏ */}
      <p className="text-red-300/60 text-xs mt-12 text-center">
        Được xác thực bởi hệ thống
      </p>
    </div>
  );
}
