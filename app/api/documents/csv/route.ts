import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    const data = documents.map((d) => ({
      Title: d.title,
      Folder: d.folder,
      Project: d.project?.name ?? "",
      MIMEType: d.mimeType ?? "",
      "Created At": d.createdAt.toISOString().split("T")[0],
    }));
    return toCSV(data, "documents");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
