import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const [categories, rates, employees] = await Promise.all([
      prisma.labourCategory.findMany({
        include: {
          _count: {
            select: {
              rates: true,
              employees: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.labourRate.findMany({
        include: {
          category: true,
          project: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.findMany({
        include: {
          category: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    // Export rates as the main data
    const data = rates.map((rate) => ({
      "Category": rate.category.name,
      "Project": rate.project ? `${rate.project.code} - ${rate.project.name}` : "Default (all projects)",
      "Daily Rate (NPR)": rate.dailyRate.toString(),
      "Hourly Rate (NPR)": rate.hourlyRate.toString(),
      "Overtime Rate (NPR)": rate.overtimeRate.toString(),
      "Transport Allowance (NPR)": rate.transportAllow.toString(),
      "Accommodation (NPR)": rate.accommodation.toString(),
      "Notes": rate.notes || "",
      "Effective Date": rate.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Labour Rates");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="labour-rates-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}