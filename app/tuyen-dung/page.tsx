import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tuyển Dụng",
  description: "Cơ hội việc làm tại hệ thống đại lý vé số",
};

async function getData() {
  try {
    const [jobs, storeInfo] = await Promise.all([
      prisma.jobPosting.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
      prisma.storeInfo.findUnique({ where: { id: "main" } }),
    ]);
    return { jobs, storeInfo };
  } catch { return { jobs: [], storeInfo: null }; }
}

export default async function TuyenDungPage() {
  const { jobs, storeInfo } = await getData();
  const phone    = storeInfo?.phone    || "";
  const phoneRaw = phone.replace(/\s/g, "");
  const email    = storeInfo?.email    || "";
  const address1 = storeInfo?.address1 || "";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="/tuyen-dung" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Tuyển dụng</span>
        </div>
      </div>

      {/* Page title banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-1">Tuyển Dụng</h1>
          <p className="text-red-200 text-sm">Gia nhập đội ngũ của chúng tôi — cơ hội việc làm hấp dẫn</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Job listings — 2/3 width */}
          <div className="md:col-span-2">
            {jobs.length === 0 ? (
              <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-4">💼</div>
                <p className="text-lg font-semibold">Hiện chưa có vị trí tuyển dụng</p>
                <p className="text-sm mt-1">Vui lòng liên hệ trực tiếp để biết thêm thông tin.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {jobs.map((job, i) => (
                  <div key={job.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-200 transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 mb-2">
                          💼 Vị trí #{i + 1}
                        </span>
                        <h2 className="text-xl font-black text-gray-800">{job.title}</h2>
                      </div>
                      {job.salary && (
                        <div className="shrink-0 text-right">
                          <div className="text-xs text-gray-400 mb-0.5">Mức lương</div>
                          <div className="text-base font-black text-red-700">{job.salary}</div>
                        </div>
                      )}
                    </div>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                          📍 {job.location}
                        </span>
                      )}
                      {job.contactName && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                          👤 Liên hệ: {job.contactName}
                        </span>
                      )}
                      {job.contactPhone && (
                        <a href={`tel:${job.contactPhone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition-colors">
                          📞 {job.contactPhone}
                        </a>
                      )}
                    </div>

                    {/* Description */}
                    {job.description && (
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Mô tả công việc</h3>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                      </div>
                    )}

                    {/* Requirements */}
                    {job.requirements && (
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Yêu cầu</h3>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-5">
            {/* How to apply */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-black text-gray-800 text-base mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-700 rounded-full inline-block shrink-0" />
                Cách thức ứng tuyển
              </h3>
              <ol className="space-y-3 text-sm text-gray-600">
                {[
                  "Chuẩn bị hồ sơ: đơn xin việc, CV, CMND/CCCD, ảnh 3×4",
                  "Nộp hồ sơ trực tiếp tại văn phòng hoặc gửi email",
                  "Phỏng vấn trực tiếp (không phỏng vấn online)",
                  "Thử việc và ký hợp đồng chính thức",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Contact info */}
            <div className="bg-red-700 rounded-2xl p-6 text-white">
              <h3 className="font-black text-base mb-4">Liên hệ tuyển dụng</h3>
              <div className="space-y-3 text-sm">
                {address1 && (
                  <div className="flex gap-2 items-start">
                    <span className="shrink-0">📍</span>
                    <span className="text-red-100">{address1}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex gap-2 items-center">
                    <span className="shrink-0">📞</span>
                    <a href={`tel:${phoneRaw}`} className="font-bold text-yellow-300 hover:underline">{phone}</a>
                  </div>
                )}
                {email && (
                  <div className="flex gap-2 items-center">
                    <span className="shrink-0">✉</span>
                    <a href={`mailto:${email}`} className="text-red-100 hover:text-white break-all">{email}</a>
                  </div>
                )}
              </div>
              {phone && (
                <a href={`tel:${phoneRaw}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-sm px-4 py-2.5 rounded-xl transition-colors">
                  📞 Gọi ngay
                </a>
              )}
            </div>

            {/* Warning notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-1.5">
                ⚠️ Lưu ý quan trọng
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Chúng tôi <strong>không</strong> phỏng vấn trực tuyến, không thu phí ứng tuyển, và không yêu cầu đặt cọc dưới bất kỳ hình thức nào. Hãy cảnh giác với các thông báo tuyển dụng giả mạo.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
