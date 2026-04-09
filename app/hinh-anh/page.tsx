import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hình Ảnh",
  description: "Thư viện hình ảnh hoạt động của hệ thống đại lý",
};

const getImages = unstable_cache(
  async () => {
    try {
      return await prisma.galleryImage.findMany({
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
      });
    } catch { return []; }
  },
  ["gallery-images"],
  { revalidate: 3600, tags: ["gallery"] }
);

export default async function HinhAnhPage() {
  const images = await getImages();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="/hinh-anh" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Hình ảnh</span>
        </div>
      </div>

      {/* Page title banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-1">Hình Ảnh</h1>
          <p className="text-red-200 text-sm">Thư viện ảnh hoạt động của chúng tôi</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {images.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-lg font-semibold">Chưa có hình ảnh nào</p>
            <p className="text-sm mt-1">Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((img) => (
              <div key={img.id}
                className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md hover:border-red-200 transition-all group">
                <div className="overflow-hidden">
                  <Image
                    src={img.imageUrl}
                    alt={img.title || "Hình ảnh"}
                    width={600}
                    height={400}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                {(img.title || img.description) && (
                  <div className="p-4">
                    {img.title && (
                      <h3 className="font-bold text-gray-800 text-sm leading-snug">{img.title}</h3>
                    )}
                    {img.description && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{img.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
