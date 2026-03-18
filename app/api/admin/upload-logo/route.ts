import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/adminAuth";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && (await verifyAdminToken(token));
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("logo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Chỉ chấp nhận ảnh PNG, JPG, WEBP, GIF" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File quá lớn (tối đa 2MB)" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png"
    : file.type === "image/gif" ? "gif"
    : file.type === "image/webp" ? "webp"
    : "jpg";

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Always save as logo.png (overwrite existing)
  const filePath = path.join(process.cwd(), "public", `logo.${ext}`);

  // If extension changed, also write logo.png for backward compat
  await writeFile(filePath, buffer);
  if (ext !== "png") {
    await writeFile(path.join(process.cwd(), "public", "logo.png"), buffer);
  }

  return NextResponse.json({ url: `/logo.${ext}?t=${Date.now()}` });
}
