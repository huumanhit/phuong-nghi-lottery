"use client";
import { useSearchParams } from "next/navigation";
import LotteryPage from "./LotteryPage";
import type { Region } from "../lib/lotteryData";

const VALID_REGIONS: Region[] = ["mb", "mt", "mn"];

export default function LotteryPageWrapper() {
  const params = useSearchParams();
  const raw = params.get("region") ?? "mb";
  const initialRegion: Region = (VALID_REGIONS.includes(raw as Region) ? raw : "mb") as Region;
  return <LotteryPage initialRegion={initialRegion} />;
}
