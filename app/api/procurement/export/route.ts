import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      include: { supplier: true, project: true },
      orderBy: { createdAt: "desc" },
    });

    const data = pos.map((po) => ({
      "PO Number": po.number,
      "Supplier": po.supplier.name,
      "Project": po.project?.name ?? "",
      "Status": po.status,
      "VAT %": po.vatPct.toString(),
      "Items": "",
      "Delivery Date": po.deliveryDate?.toISOString().split('T')[0] ?? "",
      "Date": po.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Purchase Orders");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="procurement-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
