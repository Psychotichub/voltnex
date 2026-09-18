import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: "asc" },
    });

    const data = materials.map((material) => ({
      "Material Code": material.code,
      "Material Name": material.name,
      "Category": material.category?.name || "",
      "Subcategory": material.subcategory || "",
      "Brand": material.brand || "",
      "Model": material.model || "",
      "Specification": material.specification || "",
      "Unit": material.unit,
      "Purchase Price": material.purchasePrice.toString(),
      "Selling Price": material.sellingPrice.toString(),
      "Supplier": material.supplier?.name || "",
      "VAT Rate %": material.vatRate.toString(),
      "Minimum Stock": material.minStock.toString(),
      "Current Stock": material.currentStock.toString(),
      "Warranty": material.warranty || "",
      "Notes": material.notes || "",
      "Created": material.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Materials");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="materials-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}