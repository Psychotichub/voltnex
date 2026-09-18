import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/acad",
  "application/dxf",
  "image/vnd.dwg",
  "application/octet-stream",
]);

const MAX_BYTES = 15 * 1024 * 1024;

export async function saveUpload(file: File, folder = "general") {
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds the 15 MB limit.");
  }
  if (file.type && !ALLOWED.has(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp|gif|xlsx|xls|dwg|dxf)$/i)) {
    throw new Error("This file type is not allowed.");
  }

  const ext = path.extname(file.name) || ".bin";
  const filename = `${Date.now()}-${nanoid(8)}${ext}`;
  const dir = path.join(process.cwd(), "uploads", folder);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(full, buffer);
  return `/api/files/${folder}/${filename}`;
}
