import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            materials: true,
            purchaseOrders: true,
            payments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = suppliers.map((supplier) => ({
      "Supplier Name": supplier.name,
      "Company": supplier.company || "",
      "Contact Person": supplier.contactPerson || "",
      "Phone": supplier.phone || "",
      "Email": supplier.email || "",
      "Address": supplier.address || "",
      "PAN/VAT": supplier.panVat || "",
      "Product Categories": supplier.productCategories || "",
      "Payment Terms": supplier.paymentTerms || "",
      "Credit Limit": supplier.creditLimit.toString(),
      "Materials": supplier._count.materials,
      "Purchase Orders": supplier._count.purchaseOrders,
      "Payments": supplier._count.payments,
      "Notes": supplier.notes || "",
      "Created": supplier.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Suppliers");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="suppliers-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}