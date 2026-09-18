import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: { deletedAt: null },
      include: { project: true, client: true, supplier: true },
      orderBy: { date: "desc" },
    });
    const data = payments.map((p) => ({
      Date: p.date.toISOString().split("T")[0],
      Amount: p.amount.toString(),
      Project: p.project?.name ?? "",
      Client: p.client?.company ?? p.client?.name ?? "",
      Supplier: p.supplier?.name ?? "",
      Kind: p.kind,
      Method: p.method,
      Reference: p.reference ?? "",
      Notes: p.notes ?? "",
    }));
    return toCSV(data, "payments");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
