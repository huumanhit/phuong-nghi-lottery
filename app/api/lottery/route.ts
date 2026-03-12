import { NextResponse } from "next/server";
import {
  fetchLotteryResult,
  fetchAllRegions,
  getLotteryByDate,
} from "@/services/lotteryService";
import type { Region } from "@/app/lib/lotteryData";

const VALID_REGIONS: Region[] = ["mb", "mt", "mn"];

/** Convert ISO date "YYYY-MM-DD" → Vietnamese "DD/MM/YYYY" */
function isoToVN(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;
  const dateIso = searchParams.get("date"); // YYYY-MM-DD from date picker

  if (region && !VALID_REGIONS.includes(region)) {
    return NextResponse.json(
      { error: `Region không hợp lệ: ${region}` },
      { status: 400 }
    );
  }

  // Specific region + specific date
  if (region && dateIso) {
    const result = await getLotteryByDate(region, isoToVN(dateIso));
    return NextResponse.json(result);
  }

  // Specific region, latest data
  if (region) {
    const result = await fetchLotteryResult(region);
    return NextResponse.json(result);
  }

  // All regions, latest data
  const results = await fetchAllRegions();
  return NextResponse.json(results);
}
