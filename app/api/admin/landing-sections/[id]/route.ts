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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const allowed = ["title", "content", "imageUrl", "sortOrder", "visible"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  try {
    const section = await prisma.landingSection.update({
      where: { id: params.id },
      data,
    });
    revalidatePath("/dai-ly");
    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy section" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.landingSection.delete({ where: { id: params.id } });
    revalidatePath("/dai-ly");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy section" }, { status: 404 });
  }
}
