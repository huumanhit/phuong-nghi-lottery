import { NextRequest, NextResponse } from "next/server";
import { fetchVietlottResult, type VietlottGame } from "@/services/vietlottService";

const VALID_GAMES: VietlottGame[] = ["mega-645", "power-655", "max-4d"];

export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get("game") as VietlottGame | null;

  if (!game || !VALID_GAMES.includes(game)) {
    return NextResponse.json(
      { error: `game phải là: ${VALID_GAMES.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await fetchVietlottResult(game);
  return NextResponse.json(result);
}
