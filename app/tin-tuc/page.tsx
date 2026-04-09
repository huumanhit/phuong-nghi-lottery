import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tin Tức",
  description: "Tin tức mới nhất từ hệ thống đại lý vé số",
};

const getArticles = unstable_cache(
  async () => {
    try {
      return await prisma.article.findMany({
        where: { visible: true, category: "tin-tuc" },
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      });
    } catch { return []; }
  },
  ["articles-tin-tuc"],
  { revalidate: 3600, tags: ["articles"] }
);

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default async function TinTucPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="/tin-tuc" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Tin tức</span>
        </div>
      </div>

      {/* Page title banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-1">Tin Tức</h1>
          <p className="text-red-200 text-sm">Cập nhật thông tin mới nhất từ hệ thống</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📰</div>
            <p className="text-lg font-semibold">Chưa có tin tức nào</p>
            <p className="text-sm mt-1">Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-red-200 transition-all group">
                {article.imageUrl && (
                  <div className="w-full h-48 overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      width={600}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-xs font-semibold text-red-600 uppercase">Tin tức</span>
                  </div>
                  <h2 className="font-black text-gray-800 text-base leading-snug mb-2 line-clamp-2 group-hover:text-red-700 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
