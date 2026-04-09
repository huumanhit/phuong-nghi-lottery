import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video",
  description: "Kênh video của hệ thống đại lý vé số",
};

const getVideos = unstable_cache(
  async () => {
    try {
      return await prisma.videoItem.findMany({
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
      });
    } catch { return []; }
  },
  ["videos"],
  { revalidate: 3600, tags: ["videos"] }
);

function getYoutubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export default async function VideoPage() {
  const videos = await getVideos();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader activeHref="/video" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-700">Trang chủ</Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Video</span>
        </div>
      </div>

      {/* Page title banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-1">Video</h1>
          <p className="text-red-200 text-sm">Kênh video & truyền thông của chúng tôi</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {videos.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-lg font-semibold">Chưa có video nào</p>
            <p className="text-sm mt-1">Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const ytId = getYoutubeId(video.youtubeUrl);
              const thumb = video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");

              return (
                <div key={video.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md hover:border-red-200 transition-all group">
                  {/* Video embed or thumbnail */}
                  {ytId ? (
                    <div className="relative w-full aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : thumb ? (
                    <div className="relative w-full aspect-video overflow-hidden">
                      <Image src={thumb} alt={video.title} fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{video.description}</p>
                    )}
                    {video.youtubeUrl && !ytId && (
                      <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-red-600 hover:underline">
                        ▶ Xem video
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
