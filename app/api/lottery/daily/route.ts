import { NextResponse } from "next/server";
import { fetchDailyRegionResult } from "@/services/lotteryService";
import type { Region } from "@/app/lib/lotteryData";

// Never cache this route — results change per-prize during live draw
export const dynamic = "force-dynamic";

const VALID_REGIONS: Region[] = ["mb", "mt", "mn"];

/**
 * GET /api/lottery/daily?region=mb
 * GET /api/lottery/daily?region=mn&date=2026-03-11  (YYYY-MM-DD)
 *
 * Returns DailyRegionResult with one StationResult per station.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;
  const dateIso = searchParams.get("date") ?? undefined; // "YYYY-MM-DD" or undefined

  if (!region || !VALID_REGIONS.includes(region)) {
    return NextResponse.json(
      { error: `Region không hợp lệ: ${region ?? "(trống)"}` },
      { status: 400 }
    );
  }

  const result = await fetchDailyRegionResult(region, dateIso);
  return NextResponse.json(result);
}
