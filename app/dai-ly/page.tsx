import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/dbCache";
import DealerFilter from "./DealerFilter";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { parseAddresses } from "@/lib/addressUtils";

export const revalidate = 3600;

type DealerPointRow = { id: string; city: string; pointType: string; name: string; phone: string; address: string; mapUrl: string; sortOrder: number; visible: boolean };
type LandingSectionRow = { id: string; title: string; content: string; imageUrl: string; sortOrder: number; visible: boolean };

function getData() {
  return cached("dai-ly-data", async () => {
    try {
      const p = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      const [storeInfo, sections, dealerPoints] = await Promise.all([
        prisma.storeInfo.findUnique({ where: { id: "main" } }),
        prisma.landingSection.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
        p.dealerPoint?.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }) ?? [],
      ]);
      return {
        storeInfo,
        sections: sections as LandingSectionRow[],
        dealerPoints: (dealerPoints ?? []) as DealerPointRow[],
      };
    } catch {
      return { storeInfo: null, sections: [] as LandingSectionRow[], dealerPoints: [] as DealerPointRow[] };
    }
  });
}

export async function generateMetadata() {
  const { storeInfo } = await getData();
  return {
    title: "Hệ Thống Đại Lý – " + (storeInfo?.storeName || "Phương Nghi"),
    description: storeInfo?.tagline || "Hệ thống phân phối vé số kiến thiết",
  };
}

export default async function DaiLyPage() {
  const { storeInfo, sections, dealerPoints } = await getData();

  const storeName  = storeInfo?.storeName  || "Đại Lý Vé Số Phương Nghi";
  const tagline    = storeInfo?.tagline    || "Hệ thống phân phối sỉ vé số kiến thiết Miền Nam";
  const phone      = storeInfo?.phone      || "";
  const phoneRaw   = phone.replace(/\s/g, "");
  const email      = storeInfo?.email      || "";
  const address1   = storeInfo?.address1   || "";
  const address2   = storeInfo?.address2   || "";
  const openHours  = storeInfo?.openHours  || "";
  const mapUrl     = storeInfo?.mapEmbedUrl || "";
  const desc       = storeInfo?.description || "";
  const logoUrl    = storeInfo?.logoUrl    || "";
  const addresses  = parseAddresses(address1, address2);

  return (
    <div className="min-h-screen bg-white font-sans">
      <SiteHeader activeHref="/dai-ly" />

      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-br from-red-900 via-red-700 to-red-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-8">
          {/* Logo */}
          <div className="shrink-0">
            {logoUrl ? (
              <div className="w-28 h-28 rounded-full border-4 border-yellow-400/60 overflow-hidden bg-white shadow-xl">
                <Image src={logoUrl} alt={storeName} width={112} height={112} className="w-full h-full object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-yellow-400/60 bg-white/10 flex items-center justify-center shadow-xl">
                <span className="text-5xl">🎟️</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
              🎯 Đại Lý Chính Thức
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight mb-2">{storeName}</h1>
            <p className="text-red-200 text-base mb-5">{tagline}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {phone && (
                <a href={`tel:${phoneRaw}`}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-sm px-5 py-2.5 rounded-xl shadow transition-colors">
                  📞 {phone}
                </a>
              )}
              <a href="#diem-ban"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                Xem điểm bán →
              </a>
            </div>
          </div>

          {/* Quick info */}
          {(addresses.length > 0 || openHours) && (
            <div className="hidden lg:flex flex-col gap-3 bg-white/10 rounded-2xl p-5 text-sm min-w-[220px] shrink-0">
              {addresses.map((addr, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="shrink-0">📍</span>
                  <span className="text-red-100 leading-snug">{addr}</span>
                </div>
              ))}
              {openHours && (
                <div className="flex gap-2 items-start">
                  <span className="shrink-0">🕐</span>
                  <span className="text-red-100 whitespace-pre-line leading-snug">{openHours.split("\n")[0]}</span>
                </div>
              )}
              {email && (
                <div className="flex gap-2 items-center">
                  <span className="shrink-0">✉</span>
                  <a href={`mailto:${email}`} className="text-red-200 hover:text-white text-xs break-all">{email}</a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Description */}
        {desc && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h2 className="font-black text-red-800 text-base mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-700 rounded-full inline-block shrink-0" />
              Giới thiệu
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{desc}</p>
          </div>
        )}

        {/* Dynamic sections */}
        {sections.length > 0 && (
          <div className="space-y-6 mb-8">
            {sections.map((section) => (
              <div key={section.id} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                {section.imageUrl && (
                  <div className="w-full h-52 relative">
                    <Image src={section.imageUrl} alt={section.title} fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-6">
                  {section.title && (
                    <h2 className="font-black text-red-800 text-base mb-2 flex items-center gap-2">
                      <span className="w-1 h-5 bg-red-700 rounded-full inline-block shrink-0" />
                      {section.title}
                    </h2>
                  )}
                  {section.content && (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dealer Points */}
        <div id="diem-ban" className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-700 rounded-full inline-block shrink-0" />
              Hệ Thống Điểm Bán Hàng
            </h2>
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              {dealerPoints.length} điểm
            </span>
          </div>

          {dealerPoints.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="text-4xl mb-3">📍</div>
              <p className="text-sm font-semibold">Chưa có thông tin điểm bán hàng</p>
            </div>
          ) : (
            <DealerFilter dealerPoints={dealerPoints} />
          )}
        </div>

        {/* Contact + Map */}
        <div className={`grid gap-6 ${mapUrl ? "md:grid-cols-2" : "max-w-xl"}`}>
          {/* Contact */}
          <div className="bg-red-700 rounded-2xl p-6 text-white">
            <h3 className="font-black text-base mb-4">📞 Liên hệ đại lý</h3>
            <div className="space-y-3 text-sm">
              {addresses.map((addr, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="shrink-0 mt-0.5">📍</span>
                  <span className="text-red-100">{addr}</span>
                </div>
              ))}
              {phone && (
                <div className="flex gap-2 items-center">
                  <span className="shrink-0">📞</span>
                  <a href={`tel:${phoneRaw}`} className="font-bold text-yellow-300 hover:underline text-base">{phone}</a>
                </div>
              )}
              {email && (
                <div className="flex gap-2 items-center">
                  <span className="shrink-0">✉</span>
                  <a href={`mailto:${email}`} className="text-red-100 hover:text-white break-all">{email}</a>
                </div>
              )}
              {openHours && (
                <div className="flex gap-2 items-start">
                  <span className="shrink-0 mt-0.5">🕐</span>
                  <span className="text-red-100 whitespace-pre-line">{openHours}</span>
                </div>
              )}
            </div>
            {phone && (
              <a href={`tel:${phoneRaw}`}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-sm px-4 py-3 rounded-xl transition-colors">
                Gọi ngay
              </a>
            )}
          </div>

          {/* Map */}
          {mapUrl && (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "300px", display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ"
              />
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
