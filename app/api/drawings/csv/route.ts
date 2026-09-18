import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const drawings = await prisma.drawing.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    const data = drawings.map((d) => ({
      Number: d.number,
      Title: d.title,
      Project: d.project?.name ?? "",
      Discipline: d.discipline,
      Status: d.status,
      PreparedBy: d.preparedBy ?? "",
      Date: d.date.toISOString().split("T")[0],
    }));
    return toCSV(data, "drawings");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
