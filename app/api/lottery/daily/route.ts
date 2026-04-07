import { NextResponse } from "next/server";
import { fetchDailyRegionResult, startCacheWarmer } from "@/services/lotteryService";
import type { Region } from "@/app/lib/lotteryData";

export const dynamic = "force-dynamic";

const VALID_REGIONS: Region[] = ["mb", "mt", "mn"];

export async function GET(request: Request) {
  // Khởi động warmer lần đầu khi có request thực (không chạy lúc build)
  startCacheWarmer();

  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;
  const dateIso = searchParams.get("date") ?? undefined;

  if (!region || !VALID_REGIONS.includes(region)) {
    return NextResponse.json(
      { error: `Region không hợp lệ: ${region ?? "(trống)"}` },
      { status: 400 }
    );
  }

  const result = await fetchDailyRegionResult(region, dateIso);

  const maxAge = dateIso ? 3600 : 20;
  const swr = dateIso ? 86400 : 40;

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
    },
  });
}
