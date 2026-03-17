import { NextResponse } from "next/server";
import { fetchLotoStats } from "@/services/lotteryService";
import { ALL_STATIONS, type Region } from "@/app/lib/lotteryData";

const VALID_REGIONS: Region[] = ["mb", "mt", "mn"];

/**
 * GET /api/lottery/stats?region=mn&station=tp-hcm
 * Returns loto frequency stats for a specific station.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;
  const stationId = searchParams.get("station") ?? "";

  if (!region || !VALID_REGIONS.includes(region)) {
    return NextResponse.json(
      { error: `Region không hợp lệ: ${region ?? "(trống)"}` },
      { status: 400 }
    );
  }

  const station = ALL_STATIONS.find((s) => s.id === stationId && s.region === region);
  const stationName = station?.name ?? (region === "mb" ? "Hà Nội" : stationId);

  const result = await fetchLotoStats(region, stationName);
  return NextResponse.json(result);
}
