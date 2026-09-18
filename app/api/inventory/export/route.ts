import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const moves = await prisma.inventoryMove.findMany({
      where: { deletedAt: null },
      include: { material: true, project: true },
      orderBy: { createdAt: "desc" },
    });

    const data = moves.map((m) => ({
      "Material": m.material.code,
      "Material Name": m.material.name,
      "Type": m.type,
      "Quantity": m.quantity.toString(),
      "Project": m.project?.name ?? "",
      "Date": m.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Inventory");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="inventory-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
