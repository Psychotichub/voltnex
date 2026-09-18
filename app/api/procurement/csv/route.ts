import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      include: { supplier: true, project: true },
      orderBy: { createdAt: "desc" },
    });
    const data = pos.map((po) => ({
      Number: po.number,
      Supplier: po.supplier.name,
      Project: "",
      DeliveryDate: po.deliveryDate?.toISOString().split("T")[0] ?? "",
      PaymentTerms: po.paymentTerms ?? "",
      VatPct: po.vatPct.toString(),
      Status: po.status,
      Notes: po.notes ?? "",
    }));
    return toCSV(data, "procurement");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
