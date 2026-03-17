import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

async function checkAuth(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (region) where.region = region;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    where.date = { gte: d, lt: next };
  }

  const results = await prisma.lotteryResult.findMany({
    where,
    orderBy: [{ date: "desc" }, { province: "asc" }],
    take: 200,
  });

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = await prisma.lotteryResult.create({
    data: { ...body, date: new Date(body.date) },
  });
  return NextResponse.json(result, { status: 201 });
}
