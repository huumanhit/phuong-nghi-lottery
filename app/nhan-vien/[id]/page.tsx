import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { cached } from "@/lib/dbCache";

async function getEmployee(id: string) {
  return cached(`employee-profile-${id}`, async () => {
    try {
      return await prisma.employee.findUnique({ where: { id } });
    } catch {
      return null;
    }
  });
}

export const revalidate = 3600;

type Props = { params: { id: string } };

export async function generateStaticParams() {
  try {
    const employees = await prisma.employee.findMany({
      where: { visible: true },
      select: { id: true },
    });
    return employees.map((emp) => ({
      id: emp.id,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  try {
    const employee = await getEmployee(params.id);
    if (!employee || !employee.visible) return { title: "Nhân viên" };
    return {
      title: `${employee.name} — ${employee.position}`,
      description: employee.bio || `${employee.name} — ${employee.position}`,
    };
  } catch {
    return { title: "Nhân viên" };
  }
}

export default async function EmployeeProfilePage({ params }: Props) {
  let employee;
  try {
    employee = await getEmployee(params.id);
  } catch {
    notFound();
  }
  if (!employee || !employee.visible) notFound();

  const phoneRaw = employee.phone.replace(/\s/g, "");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Thông tin nhân viên</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header banner */}
          <div className="h-28 bg-gradient-to-r from-red-800 to-red-600" />

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-14 mb-5">
              <div className="shrink-0 w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-gray-100 overflow-hidden">
                {employee.avatarUrl ? (
                  <Image
                    src={employee.avatarUrl}
                    alt={employee.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-300 text-4xl font-black select-none">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1 min-w-0">
                <h1 className="text-2xl font-black text-gray-900 leading-tight">{employee.name}</h1>
                {employee.position && (
                  <p className="text-red-700 font-semibold text-sm mt-0.5">{employee.position}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {employee.department && (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {employee.department}
                </span>
              )}
              {employee.employeeCode && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Mã NV: {employee.employeeCode}
                </span>
              )}
            </div>

            {/* Bio */}
            {employee.bio && (
              <div className="mb-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Giới thiệu</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{employee.bio}</p>
              </div>
            )}

            {/* Contact */}
            {(employee.phone || employee.email) && (
              <div className="border-t border-gray-100 pt-5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Liên hệ</h2>
                <div className="space-y-3">
                  {employee.phone && (
                    <a
                      href={`tel:${phoneRaw}`}
                      className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-red-700 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-medium">Điện thoại</div>
                        <div className="text-sm font-black text-red-700 group-hover:underline">{employee.phone}</div>
                      </div>
                    </a>
                  )}
                  {employee.email && (
                    <a
                      href={`mailto:${employee.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-medium">Email</div>
                        <div className="text-sm font-bold text-gray-700 group-hover:underline break-all">{employee.email}</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verified badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Thông tin được xác thực bởi hệ thống
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
