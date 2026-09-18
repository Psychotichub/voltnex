import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const moves = await prisma.inventoryMove.findMany({
      where: { deletedAt: null },
      include: { material: true, project: true },
      orderBy: { createdAt: "desc" },
    });
    const data = moves.map((m) => ({
      Material: m.material.name,
      MaterialCode: m.material.code,
      Project: m.project?.name ?? "",
      Type: m.type,
      Quantity: m.quantity.toString(),
      Note: m.note ?? "",
      "Created At": m.createdAt.toISOString().split("T")[0],
    }));
    return toCSV(data, "inventory");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
