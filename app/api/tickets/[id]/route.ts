import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteTicket } from "@/services/ticketService";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const deleted = await deleteTicket(
    params.id,
    (session.user as { id: string }).id
  );
  if (!deleted) {
    return NextResponse.json({ error: "Không tìm thấy vé" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
