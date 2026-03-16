import { NextResponse } from "next/server";
import { getPendingTickets, updateTicketStatus } from "@/services/ticketService";

/** Maps a Vietnamese province name to the lottery region (mb/mt/mn) */
function getRegionByProvince(province: string): "mb" | "mt" | "mn" {
  const p = province.toLowerCase();
  const MB_PROVINCES = ["hà nội", "ha noi", "bắc ninh", "bac ninh", "hải phòng", "hai phong"];
  const MT_PROVINCES = [
    "đà nẵng", "da nang", "thừa thiên huế", "thua thien hue", "quảng nam", "quang nam",
    "quảng ngãi", "quang ngai", "bình định", "binh dinh", "phú yên", "phu yen",
    "khánh hòa", "khanh hoa", "ninh thuận", "ninh thuan", "bình thuận", "binh thuan",
    "gia lai", "kon tum", "đắk lắk", "dak lak", "đắk nông", "dak nong",
  ];
  if (MB_PROVINCES.some((v) => p.includes(v))) return "mb";
  if (MT_PROVINCES.some((v) => p.includes(v))) return "mt";
  return "mn"; // default: Miền Nam
}

/** Check if ticketNumber's last 6 digits match any prize number */
function checkWin(ticketNumber: string, stations: Array<{ results: Record<string, string[]> }>): boolean {
  const last6 = ticketNumber.slice(-6);
  for (const station of stations) {
    for (const nums of Object.values(station.results)) {
      for (const num of nums) {
        if (num && num.slice(-6) === last6) return true;
      }
    }
  }
  return false;
}

export async function GET(req: Request) {
  // Protect with a shared secret so only your cron scheduler can call this
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await getPendingTickets();
  if (pending.length === 0) {
    return NextResponse.json({ message: "Không có vé cần kiểm tra", checked: 0 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  let checked = 0, wins = 0, losses = 0, skipped = 0;

  for (const ticket of pending) {
    const dateStr = ticket.drawDate.toISOString().split("T")[0];
    const region  = getRegionByProvince(ticket.province);

    try {
      const res  = await fetch(`${baseUrl}/api/lottery/daily?region=${region}&date=${dateStr}`);
      if (!res.ok) { skipped++; continue; }
      const data = await res.json();

      if (!data.stations || data.stations.length === 0) { skipped++; continue; }

      const isWin = checkWin(ticket.ticketNumber, data.stations);
      await updateTicketStatus(ticket.id, isWin ? "win" : "lose");
      checked++;
      if (isWin) wins++; else losses++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ checked, wins, losses, skipped });
}
