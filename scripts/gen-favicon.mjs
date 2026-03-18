/**
 * Tạo favicon.ico từ public/logo.png (PNG-in-ICO format).
 * Chạy: node scripts/gen-favicon.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const pngPath = path.join(root, "public", "logo.jpg");
const icoPath = path.join(root, "public", "favicon.ico");

if (!fs.existsSync(pngPath)) {
  console.error("❌ Không tìm thấy public/logo.png");
  process.exit(1);
}

const pngData = fs.readFileSync(pngPath);

// ICO header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(1, 4); // number of images: 1

// Directory entry (16 bytes)
const dir = Buffer.alloc(16);
dir.writeUInt8(0, 0);            // width: 0 = 256px (tự scale)
dir.writeUInt8(0, 1);            // height: 0 = 256px
dir.writeUInt8(0, 2);            // color count: 0 = no palette
dir.writeUInt8(0, 3);            // reserved
dir.writeUInt16LE(1, 4);         // planes
dir.writeUInt16LE(32, 6);        // bit count
dir.writeUInt32LE(pngData.length, 8);  // size of png data
dir.writeUInt32LE(6 + 16, 12);         // offset: after header + dir

const ico = Buffer.concat([header, dir, pngData]);
fs.writeFileSync(icoPath, ico);

console.log(`✅ favicon.ico đã tạo tại public/favicon.ico (${ico.length} bytes)`);
