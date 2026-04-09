import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAuth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.jobPosting.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.jobPosting.create({
    data: {
      title:        body.title        ?? "",
      description:  body.description  ?? "",
      requirements: body.requirements ?? "",
      salary:       body.salary       ?? "",
      location:     body.location     ?? "",
      contactName:  body.contactName  ?? "",
      contactPhone: body.contactPhone ?? "",
      sortOrder:    body.sortOrder    ?? 0,
      visible:      body.visible      ?? true,
    },
  });
  revalidatePath("/tuyen-dung");
  return NextResponse.json(item, { status: 201 });
}
