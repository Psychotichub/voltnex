import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            projects: true,
            quotations: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = clients.map((client) => ({
      "Client Name": client.name,
      "Company": client.company || "",
      "Contact Person": client.contactPerson || "",
      "Phone": client.phone || "",
      "Email": client.email || "",
      "Address": client.address || "",
      "PAN/VAT": client.panVat || "",
      "Type": client.type,
      "Projects": client._count.projects,
      "Quotations": client._count.quotations,
      "Invoices": client._count.invoices,
      "Notes": client.notes || "",
      "Created": client.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Clients");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="clients-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}