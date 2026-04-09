import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hoạt Động Xã Hội",
  description: "Các hoạt động xã hội và từ thiện của hệ thống đại lý vé số",
};

const getArticles = unstable_cache(
  async () => {
    try {
      return await prisma.article.findMany({
        where: { visible: true, category: "hoat-dong-xa-hoi" },
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      });
    } catch { return []; }
  },
  ["articles-hoat-dong-xa-hoi"],
  { revalidate: 3600, tags: ["articles"] }
);

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default async function HoatDongXaHoiPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="/hoat-dong-xa-hoi" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Hoạt động xã hội</span>
        </div>
      </div>

      {/* Page title banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-1">Hoạt Động Xã Hội</h1>
          <p className="text-red-200 text-sm">Chúng tôi luôn hướng đến cộng đồng và xã hội</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🤝</div>
            <p className="text-lg font-semibold">Chưa có bài viết nào</p>
            <p className="text-sm mt-1">Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <article key={article.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  <div className={`flex flex-col ${article.imageUrl ? (isEven ? "md:flex-row" : "md:flex-row-reverse") : ""} gap-0`}>
                    {article.imageUrl && (
                      <div className="md:w-2/5 h-56 md:h-auto overflow-hidden shrink-0">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          width={500}
                          height={320}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                          🤝 Hoạt động xã hội
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(article.publishedAt)}</span>
                      </div>
                      <h2 className="text-xl font-black text-gray-800 mb-3 leading-snug">{article.title}</h2>
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{article.excerpt}</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
