import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.dealerPoint.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const item = await prisma.dealerPoint.create({
    data: {
      city:      body.city      ?? "TP. Hồ Chí Minh",
      pointType: body.pointType ?? "Điểm hợp tác",
      name:      body.name      ?? "",
      phone:     body.phone     ?? "",
      address:   body.address   ?? "",
      mapUrl:    body.mapUrl    ?? "",
      sortOrder: body.sortOrder ?? 0,
      visible:   body.visible   ?? true,
    },
  });
  revalidatePath("/dai-ly");
  revalidateTag("dealer-points");
  return NextResponse.json(item, { status: 201 });
}
