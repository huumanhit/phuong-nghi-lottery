import Image from "next/image";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import DealerFilter from "./DealerFilter";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

type DealerPointRow = { id: string; city: string; pointType: string; name: string; phone: string; address: string; mapUrl: string; sortOrder: number; visible: boolean };
type NewsItemRow     = { id: string; title: string; imageUrl: string; linkUrl: string; sortOrder: number; visible: boolean };
type LandingSectionRow = { id: string; title: string; content: string; imageUrl: string; sortOrder: number; visible: boolean };

const getData = unstable_cache(
  async () => {
    try {
      const p = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      const [storeInfo, sections, dealerPoints, newsItems] = await Promise.all([
        prisma.storeInfo.findUnique({ where: { id: "main" } }),
        prisma.landingSection.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
        p.dealerPoint?.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }) ?? [],
        p.newsItem?.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }) ?? [],
      ]);
      return {
        storeInfo,
        sections: sections as LandingSectionRow[],
        dealerPoints: (dealerPoints ?? []) as DealerPointRow[],
        newsItems: (newsItems ?? []) as NewsItemRow[],
      };
    } catch {
      return { storeInfo: null, sections: [] as LandingSectionRow[], dealerPoints: [] as DealerPointRow[], newsItems: [] as NewsItemRow[] };
    }
  },
  ["dai-ly-data"],
  { revalidate: 3600, tags: ["dealer-points", "store-info"] }
);

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { storeInfo } = await getData();
  return {
    title: storeInfo?.storeName || "Đại Lý Vé Số Phương Nghi",
    description: storeInfo?.tagline || "Hệ thống phân phối sỉ vé số kiến thiết",
  };
}

export default async function DaiLyPage() {
  const { storeInfo, sections, dealerPoints, newsItems } = await getData();

  // Normalize — tất cả string, không bao giờ null
  const info = {
    storeName:  storeInfo?.storeName  || "Đại Lý Vé Số Phương Nghi",
    tagline:    storeInfo?.tagline    || "Hệ thống phân phối sỉ vé số kiến thiết Miền Nam",
    phone:      storeInfo?.phone      || "",
    email:      storeInfo?.email      || "",
    address1:   storeInfo?.address1   || "",
    address2:   storeInfo?.address2   || "",
    openHours:  storeInfo?.openHours  || "",
    mapEmbedUrl:storeInfo?.mapEmbedUrl|| "",
    logoUrl:    storeInfo?.logoUrl    || "",
    description:storeInfo?.description|| "",
  };

  const storeName = info.storeName;
  const tagline   = info.tagline;
  const phone     = info.phone;
  const phoneRaw  = phone.replace(/\s/g, "");

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @keyframes heroGlow {
          0%,100%{color:#fff;text-shadow:0 0 10px rgba(255,215,0,.3)}
          50%{color:#FFD700;text-shadow:0 0 28px rgba(255,215,0,1),0 0 56px rgba(255,120,0,.6)}
        }
        @keyframes shimmer {
          0%,100%{color:#fde047;letter-spacing:.04em}
          50%{color:#fff;letter-spacing:.09em}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(24px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulse2 {
          0%,100%{transform:scale(1)}
          50%{transform:scale(1.08)}
        }
        @keyframes floatBall {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-12px)}
        }
        .fade-up{animation:fadeUp .7s ease both}
        .fade-up-1{animation:fadeUp .7s .1s ease both}
        .fade-up-2{animation:fadeUp .7s .2s ease both}
        .fade-up-3{animation:fadeUp .7s .3s ease both}
      `}</style>

      <SiteHeader activeHref="/dai-ly" />

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-700 to-red-800 text-white overflow-hidden min-h-[480px] flex items-center">
        {/* Background pattern */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-red-600 opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-yellow-500 opacity-20 blur-3xl" />
          {/* Lottery balls */}
          {[
            { left:"8%",  top:"20%", size:60, num:"08", delay:0 },
            { left:"88%", top:"15%", size:50, num:"18", delay:.4 },
            { left:"75%", top:"70%", size:70, num:"35", delay:.8 },
            { left:"5%",  top:"72%", size:45, num:"99", delay:.2 },
            { left:"50%", top:"8%",  size:40, num:"07", delay:.6 },
          ].map((b,i) => (
            <div key={i} aria-hidden
              style={{
                position:"absolute", left:b.left, top:b.top,
                width:b.size, height:b.size, borderRadius:"50%",
                background:"radial-gradient(circle at 35% 35%, rgba(255,255,255,.5), rgba(255,200,0,.3) 60%, rgba(200,0,0,.2))",
                border:"2px solid rgba(255,255,255,.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:900, fontSize:b.size*.3, color:"rgba(255,255,255,.7)",
                animation:`floatBall ${2.5+i*.4}s ease-in-out infinite`,
                animationDelay:`${b.delay}s`,
              }}
            >{b.num}</div>
          ))}
          {/* Star dots */}
          {["12%,18%","83%,30%","45%,65%","20%,78%","68%,82%","92%,55%"].map((pos,i)=>(
            <span key={i} style={{
              position:"absolute",left:pos.split(",")[0],top:pos.split(",")[1],
              width:i%2===0?8:5,height:i%2===0?8:5,borderRadius:"50%",
              background:"rgba(253,224,71,.6)",
              animation:`pulse2 ${1.4+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.2}s`,
            }}/>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center w-full">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 fade-up"
                 style={{animation:"pulse2 2s ease-in-out infinite"}}>
              🎰 Đại Lý Vé Số Chính Thức
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 fade-up-1 uppercase"
                style={{animation:"heroGlow 2.5s ease-in-out infinite"}}>
              {storeName}
            </h1>
            <p className="text-lg font-semibold mb-8 fade-up-2"
               style={{animation:"shimmer 2.8s ease-in-out infinite"}}>
              {tagline}
            </p>
            <div className="flex flex-wrap gap-3 fade-up-3">
              {phone && (
                <a href={`tel:${phoneRaw}`}
                   className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-base px-6 py-3 rounded-xl shadow-lg transition-colors">
                  📞 Gọi ngay: {phone}
                </a>
              )}
              <a href="#gioi-thieu"
                 className="inline-flex items-center gap-2 border-2 border-white/50 hover:border-white text-white font-bold text-base px-6 py-3 rounded-xl transition-colors">
                Tìm hiểu thêm →
              </a>
            </div>
          </div>
          {/* Logo large */}
          <div className="hidden md:flex justify-center items-center">
            {info.logoUrl ? (
              <div className="relative w-64 h-64 rounded-full border-8 border-yellow-400/60 shadow-2xl overflow-hidden bg-white">
                <Image src={info.logoUrl} alt={storeName} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-64 h-64 rounded-full border-8 border-yellow-400/60 shadow-2xl bg-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-2">🎟️</div>
                  <div className="font-black text-yellow-300 text-lg uppercase">Vé Số</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUICK STATS BAR
      ══════════════════════════════════════════ */}
      <div className="bg-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon:"🎯", label:"Đại Lý Chính Thức", val:"Được Cấp Phép" },
            { icon:"📍", label:"Địa chỉ", val: info.address1 ? info.address1.split(",")[0] : "TP. HCM" },
            { icon:"📞", label:"Hotline", val: phone || "Liên hệ" },
            { icon:"🕐", label:"Giờ hoạt động", val: info.openHours ? info.openHours.split("\n")[0] : "Hàng ngày" },
          ].map((s,i)=>(
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{s.icon}</span>
              <div className="text-xs text-red-200 font-medium">{s.label}</div>
              <div className="text-xs sm:text-sm font-bold truncate w-full text-center">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          GIỚI THIỆU
      ══════════════════════════════════════════ */}
      {info.description && (
        <section id="gioi-thieu" className="bg-gray-50 py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Giới Thiệu" subtitle="Về chúng tôi" />
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 border-l-4 border-red-700">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{info.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          DYNAMIC SECTIONS từ DB
      ══════════════════════════════════════════ */}
      {sections.length > 0 && (
        <section id="dich-vu" className="py-14 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Dịch Vụ & Thông Tin" subtitle="Nội dung từ đại lý" />
            <div className="space-y-12">
              {sections.map((section, idx) => {
                const isEven = idx % 2 === 0;
                const hasImg = !!section.imageUrl;
                return (
                  <div key={section.id}
                    className={`flex flex-col ${hasImg ? (isEven ? "md:flex-row" : "md:flex-row-reverse") : ""} gap-8 items-center`}>
                    {/* Image */}
                    {hasImg && (
                      <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md">
                        <Image
                          src={section.imageUrl}
                          alt={section.title}
                          width={600}
                          height={380}
                          className="w-full h-64 md:h-80 object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    {/* Text */}
                    <div className={hasImg ? "w-full md:w-1/2" : "w-full max-w-3xl mx-auto"}>
                      {section.title && (
                        <h3 className="text-2xl font-black text-red-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-7 bg-red-700 rounded-full inline-block shrink-0" />
                          {section.title}
                        </h3>
                      )}
                      {section.content && (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{section.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          HỆ THỐNG ĐIỂM BÁN HÀNG
      ══════════════════════════════════════════ */}
      {dealerPoints.length > 0 && (
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Hệ Thống Điểm Bán Hàng" subtitle="Danh sách các điểm phân phối" />
            <DealerFilter dealerPoints={dealerPoints} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          TIN TỨC LIÊN QUAN
      ══════════════════════════════════════════ */}
      {newsItems.length > 0 && (
        <section className="py-14 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Tin Liên Quan" subtitle="Tin tức & cập nhật" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {newsItems.map(item => (
                <a key={item.id}
                  href={item.linkUrl || undefined}
                  target={item.linkUrl ? "_blank" : undefined}
                  rel={item.linkUrl ? "noopener noreferrer" : undefined}
                  className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex gap-4 items-start p-3 ${item.linkUrl ? "hover:shadow-md hover:border-red-200 transition-all cursor-pointer" : ""}`}>
                  {item.imageUrl && (
                    <div className="shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-gray-100">
                      <Image src={item.imageUrl} alt={item.title} width={96} height={64}
                        className="w-full h-full object-cover" unoptimized />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-3 flex-1">{item.title}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          LIÊN HỆ
      ══════════════════════════════════════════ */}
      <section id="lien-he" className="bg-gray-50 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Liên Hệ" subtitle="Thông tin liên lạc" />
          <div className={`grid gap-6 ${info.mapEmbedUrl ? "md:grid-cols-2" : "max-w-2xl mx-auto"}`}>
            {/* Contact cards */}
            <div className="space-y-4">
              {[
                phone     && { icon:"📞", label:"Hotline", val: phone,  href:`tel:${phoneRaw}`, highlight:true },
                info.address1 && { icon:"📍", label:"Địa chỉ 1", val:info.address1, href:null, highlight:false },
                info.address2 && { icon:"📍", label:"Địa chỉ 2", val:info.address2, href:null, highlight:false },
                info.email    && { icon:"✉️",  label:"Email",    val:info.email,    href:`mailto:${info.email}`, highlight:false },
                info.openHours && { icon:"🕐", label:"Giờ hoạt động", val:info.openHours, href:null, highlight:false },
              ].filter(Boolean).map((item, i) => {
                const c = item as { icon:string; label:string; val:string; href:string|null; highlight:boolean };
                return (
                  <div key={i} className={`flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border ${c.highlight ? "border-red-200" : "border-gray-100"}`}>
                    <span className="text-2xl shrink-0 mt-0.5">{c.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{c.label}</p>
                      {c.href
                        ? <a href={c.href} className={`font-bold text-base whitespace-pre-line hover:underline ${c.highlight ? "text-red-700 text-xl" : "text-gray-800"}`}>{c.val}</a>
                        : <p className="text-gray-800 font-medium text-sm whitespace-pre-line">{c.val}</p>
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map */}
            {info.mapEmbedUrl && (
              <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 min-h-[300px]">
                <iframe
                  src={info.mapEmbedUrl}
                  width="100%" height="100%"
                  style={{ border:0, minHeight:"340px" }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ cửa hàng"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      {phone && (
        <div className="bg-gradient-to-r from-red-900 to-red-700 py-10 px-4 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Liên hệ ngay với chúng tôi!</h2>
          <p className="text-red-200 mb-6">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn</p>
          <a href={`tel:${phoneRaw}`}
             className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-xl px-10 py-4 rounded-2xl shadow-xl transition-colors">
            📞 {phone}
          </a>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-red-600 font-semibold text-sm uppercase tracking-widest mb-1">{subtitle}</p>
      <h2 className="text-3xl font-black text-gray-900 uppercase">
        {title}
      </h2>
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="block w-10 h-0.5 bg-red-700 rounded-full" />
        <span className="text-red-700 text-lg">✦</span>
        <span className="block w-10 h-0.5 bg-red-700 rounded-full" />
      </div>
    </div>
  );
}
