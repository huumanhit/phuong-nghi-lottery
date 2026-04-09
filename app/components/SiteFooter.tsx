import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStoreInfo() {
  try {
    return await prisma.storeInfo.findUnique({ where: { id: "main" } });
  } catch {
    return null;
  }
}

export default async function SiteFooter() {
  const storeInfo = await getStoreInfo();

  const storeName = storeInfo?.storeName || "Đại Lý Vé Số";
  const phone     = storeInfo?.phone     || "";
  const phoneRaw  = phone.replace(/\s/g, "");
  const email     = storeInfo?.email     || "";
  const address1  = storeInfo?.address1  || "";
  const address2  = storeInfo?.address2  || "";
  const tagline   = storeInfo?.tagline   || "";
  const logoUrl   = storeInfo?.logoUrl   || "";

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-4">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Col 1 - brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            {logoUrl && (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600 shrink-0">
                <Image src={logoUrl} alt="Logo" width={40} height={40} className="w-full h-full object-cover" unoptimized />
              </div>
            )}
            <div className="font-black text-white uppercase text-sm leading-tight">{storeName}</div>
          </div>
          {tagline && <p className="text-sm text-gray-400 italic">{tagline}</p>}
        </div>

        {/* Col 2 - contact */}
        <div>
          <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Thông tin liên hệ</h4>
          <ul className="space-y-2 text-sm">
            {address1 && <li className="flex gap-2"><span>📍</span>{address1}</li>}
            {address2 && <li className="flex gap-2"><span>📍</span>{address2}</li>}
            {phone    && <li className="flex gap-2"><span>📞</span><a href={`tel:${phoneRaw}`} className="text-yellow-400 font-bold hover:underline">{phone}</a></li>}
            {email    && <li className="flex gap-2"><span>✉</span><a href={`mailto:${email}`} className="hover:text-white">{email}</a></li>}
          </ul>
        </div>

        {/* Col 3 - links */}
        <div>
          <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Truy cập nhanh</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/"                  className="hover:text-white transition-colors">🏠 Kết Quả Xổ Số</Link></li>
            <li><Link href="/gioi-thieu"         className="hover:text-white transition-colors">📋 Giới thiệu</Link></li>
            <li><Link href="/tin-tuc"            className="hover:text-white transition-colors">📰 Tin tức</Link></li>
            <li><Link href="/dai-ly"             className="hover:text-white transition-colors">🏪 Hệ thống đại lý</Link></li>
            <li><Link href="/tuyen-dung"         className="hover:text-white transition-colors">💼 Tuyển dụng</Link></li>
            <li><Link href="/lien-he"            className="hover:text-white transition-colors">📞 Liên hệ</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
