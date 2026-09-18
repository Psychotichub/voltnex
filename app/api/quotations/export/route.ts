import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { deletedAt: null },
      include: {
        client: true,
        project: true,
        boq: true,
        items: true,
      },
      orderBy: { date: "desc" },
    });

    const data = quotations.map((quotation) => {
      const total = quotation.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
      return {
        "Quotation Number": quotation.number,
        "Date": quotation.date.toISOString().split('T')[0],
        "Client": quotation.client.name,
        "Company": quotation.client.company || "",
        "Project": quotation.project.name,
        "Project Code": quotation.project.code,
        "BOQ": quotation.boq?.number || "",
        "Scope of Work": quotation.scopeOfWork || "",
        "Payment Terms": quotation.paymentTerms || "",
        "Delivery Terms": quotation.deliveryTerms || "",
        "Warranty": quotation.warranty || "",
        "Status": quotation.status,
        "Valid Until": quotation.validUntil?.toISOString().split('T')[0] || "",
        "Discount": quotation.discount.toString(),
        "VAT %": quotation.vatPct.toString(),
        "Total": total.toString(),
        "Notes": quotation.notes || "",
      };
    });

    const buffer = await exportToExcel(data, "Quotations");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="quotations-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}