import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const projectId = (formData.get("projectId") as string) || null;
    const folder = String(formData.get("folder") ?? "00 General");
    const file = formData.get("file") as File | null;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    let filePath: string | null = null;
    if (file && file.size > 0) {
      const { saveUpload } = await import("@/lib/files");
      filePath = await saveUpload(file, `documents/${title}`);
    }

const doc = await prisma.document.create({
      data: {
        folder,
        title: title,
        filePath: filePath ?? "",
        mimeType: file?.type ?? null,
      },
    });

    return NextResponse.json({ success: true, docId: doc.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
