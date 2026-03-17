import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [todayResults, totalResults, totalSchedules, recentResults] = await Promise.all([
    prisma.lotteryResult.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      orderBy: { province: "asc" },
    }),
    prisma.lotteryResult.count(),
    prisma.lotterySchedule.count(),
    prisma.lotteryResult.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const byRegion = { north: 0, central: 0, south: 0 } as Record<string, number>;
  for (const r of todayResults) {
    byRegion[r.region] = (byRegion[r.region] || 0) + 1;
  }

  return NextResponse.json({
    todayCount: todayResults.length,
    byRegion,
    totalResults,
    totalSchedules,
    recentResults,
  });
}
