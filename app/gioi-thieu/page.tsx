import { prisma } from "@/lib/prisma";
import HeaderWrapper from "@/app/components/HeaderWrapper";
import Footer from "@/app/components/Footer";

async function getStoreInfo() {
  try {
    let info = await prisma.storeInfo.findUnique({ where: { id: "main" } });
    if (!info) {
      info = await prisma.storeInfo.create({
        data: {
          id: "main",
          storeName: "Đại Lý Vé Số Phương Nghi",
          tagline: "Hệ thống phân phối sỉ vé số kiến thiết Miền Nam",
          description: "",
          address1: "25 Phan Văn Hớn, Bà Điểm, Hóc Môn, TP. HCM",
          address2: "30 Phan Văn Đối, Bà Điểm, Hóc Môn, TP. HCM",
          phone: "0989 007 772",
          email: "xosophuongnghi@gmail.com",
          openHours: "",
          mapEmbedUrl: "",
        },
      });
    }
    return info;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Giới Thiệu - Phương Nghi Xổ Số",
  description: "Thông tin giới thiệu về Đại Lý Vé Số Phương Nghi",
};

export default async function GioiThieuPage() {
  const info = await getStoreInfo();

  return (
    <>
      <HeaderWrapper />
      <main className="min-h-screen bg-gray-50">
        {/* Hero banner */}
        <div className="relative bg-red-700 text-white py-14 px-4 overflow-hidden">
          {/* Animated background dots */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            {["10%,15%","80%,25%","50%,60%","25%,75%","70%,80%","90%,50%","15%,50%","55%,10%"].map((pos, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: pos.split(",")[0],
                  top: pos.split(",")[1],
                  width: i % 2 === 0 ? 8 : 5,
                  height: i % 2 === 0 ? 8 : 5,
                  borderRadius: "50%",
                  background: "rgba(253,224,71,0.55)",
                  animation: `starPulse ${1.4 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Floating ticket icons */}
          <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
            {["5%","92%","48%"].map((left, i) => (
              <span key={i} style={{
                position: "absolute",
                left,
                top: i === 1 ? "10%" : i === 2 ? "65%" : "20%",
                fontSize: 28,
                opacity: 0.18,
                animation: `floatUp ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}>🎟️</span>
            ))}
          </div>

          <style>{`
            @keyframes starPulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50%       { opacity: 1;   transform: scale(1.6); }
            }
            @keyframes floatUp {
              0%, 100% { transform: translateY(0px) rotate(-8deg); }
              50%       { transform: translateY(-14px) rotate(8deg); }
            }
            @keyframes heroGlow {
              0%, 100% { color: #ffffff; text-shadow: 0 0 10px rgba(255,215,0,0.3); }
              50%       { color: #FFD700; text-shadow: 0 0 24px rgba(255,215,0,1), 0 0 48px rgba(255,120,0,0.5); }
            }
            @keyframes taglineShimmer {
              0%, 100% { color: #fde047; letter-spacing: 0.04em; }
              50%       { color: #ffffff;  letter-spacing: 0.08em; }
            }
            @keyframes bannerFadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes badgeBounce {
              0%, 100% { transform: translateY(0) scale(1); }
              40%       { transform: translateY(-6px) scale(1.15); }
              60%       { transform: translateY(-3px) scale(1.08); }
            }
          `}</style>

          <div className="relative max-w-4xl mx-auto text-center"
               style={{ animation: "bannerFadeIn 0.7s ease both" }}>
            {/* Badge */}
            <div style={{ animation: "badgeBounce 2.2s ease-in-out infinite" }}
                 className="inline-block mb-4">
              <span className="bg-yellow-400 text-red-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                🎰 Xổ Số Kiến Thiết
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-wide mb-3"
                style={{ animation: "heroGlow 2s ease-in-out infinite", fontFamily: "var(--font-playfair)" }}>
              {info?.storeName || "Đại Lý Vé Số Phương Nghi"}
            </h1>

            {info?.tagline && (
              <p className="text-lg font-semibold italic"
                 style={{ animation: "taglineShimmer 2.4s ease-in-out infinite" }}>
                {info.tagline}
              </p>
            )}

            {/* Decorative divider */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="block w-12 h-0.5 bg-yellow-300 opacity-60 rounded-full" />
              <span className="text-yellow-300 text-xl" style={{ animation: "badgeBounce 1.8s ease-in-out infinite" }}>✦</span>
              <span className="block w-12 h-0.5 bg-yellow-300 opacity-60 rounded-full" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

          {/* Giới thiệu chung */}
          {info?.description && (
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Giới Thiệu
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {info.description}
              </div>
            </section>
          )}

          {/* Thông tin liên hệ */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-red-700 mb-5 flex items-center gap-2">
              <span className="text-2xl">📞</span> Thông Tin Liên Hệ
            </h2>
            <div className="space-y-4">
              {info?.address1 && (
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-0.5 text-lg shrink-0">📍</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Địa chỉ</p>
                    <p className="text-gray-800 font-medium">{info.address1}</p>
                    {info.address2 && (
                      <p className="text-gray-800 font-medium mt-1">{info.address2}</p>
                    )}
                  </div>
                </div>
              )}

              {info?.phone && (
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-0.5 text-lg shrink-0">📱</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Hotline</p>
                    <a href={`tel:${info.phone.replace(/\s/g, "")}`}
                       className="text-red-700 font-bold text-lg hover:underline">
                      {info.phone}
                    </a>
                  </div>
                </div>
              )}

              {info?.email && (
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-0.5 text-lg shrink-0">✉️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                    <a href={`mailto:${info.email}`}
                       className="text-red-700 font-medium hover:underline">
                      {info.email}
                    </a>
                  </div>
                </div>
              )}

              {info?.openHours && (
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-0.5 text-lg shrink-0">🕐</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Giờ hoạt động</p>
                    <p className="text-gray-800 font-medium whitespace-pre-line">{info.openHours}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Bản đồ */}
          {info?.mapEmbedUrl && (
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">🗺️</span> Bản Đồ
              </h2>
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src={info.mapEmbedUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ cửa hàng"
                />
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
