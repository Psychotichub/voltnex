import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const [drawings, projects] = await Promise.all([
      prisma.drawing.findMany({ where: { deletedAt: null }, include: { project: true }, orderBy: { createdAt: "desc" } }),
      prisma.project.findMany({ where: { deletedAt: null }, select: { id: true, name: true, code: true } }),
    ]);

    const data = drawings.map((d) => ({
      "Number": d.number,
      "Title": d.title,
      "Project": d.project?.name ?? "",
      "Discipline": d.discipline ?? "",
      "Status": d.status,
      "Date": d.date.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Drawings");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="drawings-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
