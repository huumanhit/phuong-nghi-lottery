import { NextResponse } from "next/server";
import { getPendingTickets, updateTicketStatus } from "@/services/ticketService";
import { getRegionByProvince, getTicketDigits } from "@/lib/regionUtils";

/** Check if ticketNumber matches any prize number.
 *  MB tickets are 5 digits → compare last 5 digits.
 *  MN/MT tickets are 6 digits → compare last 6 digits.
 */
function checkWin(
  ticketNumber: string,
  province: string,
  stations: Array<{ results: Record<string, string[]> }>
): boolean {
  const digits  = getTicketDigits(province);
  const tail    = ticketNumber.slice(-digits);
  for (const station of stations) {
    for (const nums of Object.values(station.results)) {
      for (const num of nums) {
        if (num && num.slice(-digits) === tail) return true;
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

      const isWin = checkWin(ticket.ticketNumber, ticket.province, data.stations);
      await updateTicketStatus(ticket.id, isWin ? "win" : "lose");
      checked++;
      if (isWin) wins++; else losses++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ checked, wins, losses, skipped });
}
