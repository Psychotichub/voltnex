import { readFile } from "node:fs/promises";
import pathModule from "node:path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: filePathParts } = await context.params;
  const filePath = filePathParts.join("/");
  const fullPath = pathModule.join(process.cwd(), "uploads", filePath);

  try {
    const file = await readFile(fullPath);
    const ext = pathModule.extname(filePath).toLowerCase();
    
    const contentTypeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".xls": "application/vnd.ms-excel",
      ".dwg": "application/acad",
      ".dxf": "application/dxf",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}