import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Chỉ chấp nhận ảnh PNG, JPG, WEBP, GIF" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File quá lớn (tối đa 5MB)" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png"
    : file.type === "image/gif" ? "gif"
    : file.type === "image/webp" ? "webp"
    : "jpg";

  try {
    const blob = await put(`landing-${Date.now()}.${ext}`, file, {
      access: "public",
      allowOverwrite: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Upload thất bại: ${msg}` }, { status: 500 });
  }
}
