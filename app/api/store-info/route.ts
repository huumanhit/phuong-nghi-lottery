import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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
  return NextResponse.json(info);
}
