import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const standards = await prisma.standardDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const data = standards.map((s) => ({
      "Name": s.name,
      "Number": s.number ?? "",
      "Edition": s.edition ?? "",
      "Category": s.category,
      "Description": s.description ?? "",
      "Applicability": s.applicability ?? "",
      "Date": s.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Standards");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="standards-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
