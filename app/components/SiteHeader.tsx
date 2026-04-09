import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const NAV_ITEMS = [
  { label: "TRANG CHỦ",         href: "/dai-ly" },
  { label: "GIỚI THIỆU",        href: "/gioi-thieu" },
  { label: "TIN TỨC",           href: "/tin-tuc" },
  { label: "HÌNH ẢNH",          href: "/hinh-anh" },
  { label: "VIDEO",              href: "/video" },
  { label: "ĐẠI LÝ",            href: "/dai-ly" },
  { label: "HOẠT ĐỘNG XÃ HỘI",  href: "/hoat-dong-xa-hoi" },
  { label: "TUYỂN DỤNG",         href: "/tuyen-dung" },
  { label: "LIÊN HỆ",            href: "/lien-he" },
];

const getStoreInfo = unstable_cache(
  async () => {
    try {
      return await prisma.storeInfo.findUnique({ where: { id: "main" } });
    } catch {
      return null;
    }
  },
  ["store-info-header"],
  { revalidate: 3600, tags: ["store-info-header"] }
);

export default async function SiteHeader({ activeHref }: { activeHref: string }) {
  const storeInfo = await getStoreInfo();

  const storeName  = storeInfo?.storeName  || "Đại Lý Vé Số";
  const phone      = storeInfo?.phone      || "";
  const phoneRaw   = phone.replace(/\s/g, "");
  const email      = storeInfo?.email      || "";
  const tagline    = storeInfo?.tagline    || "";
  const logoUrl    = storeInfo?.logoUrl    || "";

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* ── Branding row ── */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-700 shrink-0">
              <Image src={logoUrl} alt="Logo" width={64} height={64}
                className="w-full h-full object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-xl shrink-0">
              VN
            </div>
          )}
          <div className="hidden sm:block">
            <div className="font-black text-red-800 text-lg leading-tight uppercase tracking-wide">
              {storeName}
            </div>
            {tagline && (
              <div className="text-xs text-gray-500">{tagline}</div>
            )}
          </div>
        </Link>

        {/* Contact info — center */}
        <div className="hidden md:flex items-center gap-8">
          {email && (
            <a href={`mailto:${email}`}
              className="flex items-center gap-2 text-gray-600 hover:text-red-700 transition-colors group">
              <span className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 text-sm group-hover:bg-red-100 transition-colors">✉</span>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Email</div>
                <div className="text-sm font-semibold text-gray-700">{email}</div>
              </div>
            </a>
          )}
          {phone && (
            <a href={`tel:${phoneRaw}`}
              className="flex items-center gap-2 text-gray-600 hover:text-red-700 transition-colors group">
              <span className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 text-sm group-hover:bg-red-100 transition-colors">☎</span>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Hotline</div>
                <div className="text-sm font-bold text-red-700">{phone}</div>
              </div>
            </a>
          )}
        </div>

        {/* CTA button */}
        <a href="/dai-ly#lien-he"
          className="hidden sm:inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black text-sm px-5 py-2.5 rounded transition-colors uppercase tracking-wide shrink-0">
          Đăng ký mở đại lý
        </a>

        {/* Mobile phone */}
        {phone && (
          <a href={`tel:${phoneRaw}`}
            className="sm:hidden inline-flex items-center gap-1.5 bg-red-700 text-white font-bold text-xs px-3 py-2 rounded">
            ☎ {phone}
          </a>
        )}
      </div>

      {/* ── Nav bar row ── */}
      <nav className="bg-gray-900 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex">
          {NAV_ITEMS.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-r border-gray-700 last:border-r-0 ${
                  active ? "text-red-400" : "text-white hover:text-red-300"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0
                    border-l-[6px] border-r-[6px] border-b-[6px]
                    border-l-transparent border-r-transparent border-b-red-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
