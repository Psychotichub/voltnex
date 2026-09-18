import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { deletedAt: null },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true,
      },
      orderBy: { date: "desc" },
    });

    const data = invoices.map((invoice) => {
      const total = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
      const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const balance = total - paid;
      
      return {
        "Invoice Number": invoice.number,
        "Date": invoice.date.toISOString().split('T')[0],
        "Due Date": invoice.dueDate?.toISOString().split('T')[0] || "",
        "Client": invoice.client.name,
        "Company": invoice.client.company || "",
        "Project": invoice.project.name,
        "Project Code": invoice.project.code,
        "Status": invoice.status,
        "Total": total.toString(),
        "Paid": paid.toString(),
        "Balance": balance.toString(),
        "Discount": invoice.discount.toString(),
        "VAT %": invoice.vatPct.toString(),
        "Notes": invoice.notes || "",
      };
    });

    const buffer = await exportToExcel(data, "Invoices");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="invoices-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}