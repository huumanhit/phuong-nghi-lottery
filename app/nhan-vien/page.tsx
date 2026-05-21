import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Đội Ngũ Nhân Viên",
  description: "Danh sách nhân viên của chúng tôi",
};

async function getEmployees() {
  try {
    return await prisma.employee.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch { return []; }
}

export default async function NhanVienPage() {
  const employees = await getEmployees();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Đội ngũ nhân viên</span>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-1">Đội Ngũ Nhân Viên</h1>
          <p className="text-red-200 text-sm">Những người luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {employees.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-lg font-semibold">Chưa có thông tin nhân viên</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href={`/nhan-vien/${emp.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-red-200 transition-all overflow-hidden group"
              >
                {/* Top color bar */}
                <div className="h-2 bg-gradient-to-r from-red-800 to-red-500" />

                <div className="p-5 flex items-start gap-4">
                  {/* Avatar */}
                  <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {emp.avatarUrl ? (
                      <Image
                        src={emp.avatarUrl}
                        alt={emp.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-300 text-2xl font-black select-none">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-gray-900 text-base leading-tight group-hover:text-red-700 transition-colors">
                      {emp.name}
                    </h2>
                    {emp.position && (
                      <p className="text-red-700 text-xs font-semibold mt-0.5">{emp.position}</p>
                    )}
                    {emp.department && (
                      <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {emp.department}
                      </p>
                    )}
                    {emp.phone && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {emp.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <span className="text-xs text-red-700 font-semibold group-hover:underline">
                    Xem chi tiết →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
