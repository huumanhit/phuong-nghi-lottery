import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { invalidate } from "@/lib/dbCache";

export const dynamic = "force-dynamic";

async function checkAuth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.employee.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.employee.create({
    data: {
      name:         body.name         ?? "",
      position:     body.position     ?? "",
      department:   body.department   ?? "",
      phone:        body.phone        ?? "",
      email:        body.email        ?? "",
      avatarUrl:    body.avatarUrl    ?? "",
      bio:          body.bio          ?? "",
      employeeCode: body.employeeCode ?? "",
      sortOrder:    body.sortOrder    ?? 0,
      visible:      body.visible      ?? true,
    },
  });
  revalidatePath("/nhan-vien");
  invalidate("employee");
  return NextResponse.json(item, { status: 201 });
}
