import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: { deletedAt: null },
      include: { project: true, invoice: true },
      orderBy: { date: "desc" },
    });

    const data = payments.map((payment) => ({
      "ID": payment.id,
      "Date": payment.date.toISOString().split('T')[0],
      "Project": payment.project?.name ?? "",
      "Type": payment.kind,
      "Invoice": payment.invoice?.number ?? "",
      "Amount (NPR)": payment.amount.toString(),
      "Method": payment.method,
      "Reference": payment.reference ?? "",
      "Notes": payment.notes ?? "",
    }));

    const buffer = await exportToExcel(data, "Payments");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
