import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const boqs = await prisma.boq.findMany({
      where: { deletedAt: null },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        _count: {
          select: {
            items: true,
            quotations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = boqs.map((boq) => ({
      "BOQ Number": boq.number,
      "Title": boq.title,
      "Project Code": boq.project.code,
      "Project Name": boq.project.name,
      "Client": boq.project.client.name,
      "Items": boq._count.items,
      "Quotations": boq._count.quotations,
      "Overhead %": boq.overheadPct.toString(),
      "Contingency %": boq.contingencyPct.toString(),
      "Profit %": boq.profitPct.toString(),
      "Discount": boq.discount.toString(),
      "VAT %": boq.vatPct.toString(),
      "Notes": boq.notes || "",
      "Created": boq.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "BOQs");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="boqs-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}