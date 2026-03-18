import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Skip tracking these paths
const SKIP_PATHS = ["/admin", "/api", "/_next", "/favicon", "/logo"];

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false });
    }
    // Skip admin/API paths
    if (SKIP_PATHS.some((s) => path.startsWith(s))) {
      return NextResponse.json({ ok: false });
    }

    const referrer = req.headers.get("referer") ?? "";
    const userAgent = req.headers.get("user-agent") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "";

    await prisma.pageView.create({
      data: { path, referrer, userAgent, ip },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
