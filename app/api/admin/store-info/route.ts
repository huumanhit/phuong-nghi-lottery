import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

async function checkAuth(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
        email: "phuongnghixoso@gmail.com",
        openHours: "",
        mapEmbedUrl: "",
      },
    });
  }
  return NextResponse.json(info);
}

export async function PUT(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const allowed = ["storeName", "tagline", "description", "address1", "address2", "phone", "email", "openHours", "mapEmbedUrl"];
  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (typeof body[key] === "string") data[key] = body[key];
  }
  const info = await prisma.storeInfo.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
  return NextResponse.json(info);
}
