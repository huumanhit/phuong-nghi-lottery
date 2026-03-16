import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserTickets, createTicket } from "@/services/ticketService";
import { getTicketDigits } from "@/lib/regionUtils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const tickets = await getUserTickets((session.user as { id: string }).id);
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { province, drawDate, ticketNumber } = await req.json();

    if (!province || !drawDate || !ticketNumber) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin vé" },
        { status: 400 }
      );
    }
    const digits = getTicketDigits(province);
    if (!new RegExp(`^\\d{${digits}}$`).test(ticketNumber.trim())) {
      return NextResponse.json(
        { error: `Số vé phải gồm đúng ${digits} chữ số` },
        { status: 400 }
      );
    }

    const ticket = await createTicket(
      (session.user as { id: string }).id,
      { province, drawDate, ticketNumber }
    );
    return NextResponse.json({ ticket }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
