import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "30"), 90);

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 29);

  const [total, today, yesterday, week, month, allViews, topPages] = await Promise.all([
    // All time total
    prisma.pageView.count(),
    // Today
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    // Yesterday
    prisma.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    // Last 7 days
    prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
    // Last 30 days
    prisma.pageView.count({ where: { createdAt: { gte: monthStart } } }),
    // Raw data for daily chart (last N days)
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, path: true },
      orderBy: { createdAt: "asc" },
    }),
    // Top pages (last 30 days)
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: monthStart } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
  ]);

  // Build daily counts
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of allViews) {
    const key = v.createdAt.toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    summary: { total, today, yesterday, week, month },
    daily,
    topPages: topPages.map((p) => ({ path: p.path, count: p._count.path })),
  });
}
