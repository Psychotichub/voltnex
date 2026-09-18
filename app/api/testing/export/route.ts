import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const checklists = await prisma.testingChecklist.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });

    const data = checklists.map((cl) => ({
      "Number": cl.number,
      "Category": cl.category,
      "Equipment": cl.equipment ?? "",
      "Project": cl.project?.name ?? "",
      "Test Date": cl.testDate.toISOString().split('T')[0],
      "Result": cl.overallResult ?? "",
      "Remarks": cl.remarks ?? "",
      "Date": cl.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Testing Checklists");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="testing-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
