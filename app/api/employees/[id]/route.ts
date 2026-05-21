import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: params.id } });
    if (!employee || !employee.visible) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
