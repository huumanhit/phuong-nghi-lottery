import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
  const sections = await prisma.landingSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const section = await prisma.landingSection.create({
    data: {
      title: body.title ?? "",
      content: body.content ?? "",
      imageUrl: body.imageUrl ?? "",
      sortOrder: body.sortOrder ?? 0,
      visible: body.visible ?? true,
    },
  });
  revalidatePath("/dai-ly");
  return NextResponse.json(section, { status: 201 });
}
