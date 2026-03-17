import { NextResponse } from "next/server";
import { fetchLotoFrequency } from "@/services/lotteryService";
import type { Region } from "@/app/lib/lotteryData";

const VALID_REGIONS: Region[] = ["mb", "mt", "mn"];

/**
 * GET /api/lottery/loto-frequency?region=mn
 * Returns region-wide loto frequency stats (most frequent + longest absent).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;

  if (!region || !VALID_REGIONS.includes(region)) {
    return NextResponse.json(
      { error: `Region không hợp lệ: ${region ?? "(trống)"}` },
      { status: 400 }
    );
  }

  const result = await fetchLotoFrequency(region);
  return NextResponse.json(result);
}
