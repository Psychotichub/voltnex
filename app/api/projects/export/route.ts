import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        client: true,
        manager: true,
        _count: {
          select: {
            invoices: true,
            quotations: true,
            drawings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = projects.map((project) => ({
      "Project Code": project.code,
      "Project Name": project.name,
      "Client": project.client.name,
      "Location": project.location || "",
      "Project Type": project.projectType,
      "Status": project.status,
      "Workflow": project.workflow,
      "Start Date": project.startDate?.toISOString().split('T')[0] || "",
      "Expected Completion": project.expectedCompletion?.toISOString().split('T')[0] || "",
      "Actual Completion": project.actualCompletion?.toISOString().split('T')[0] || "",
      "Contract Value": project.contractValue.toString(),
      "Estimated Cost": project.estimatedCost.toString(),
      "Actual Cost": project.actualCost.toString(),
      "Estimated Profit": project.estimatedProfit.toString(),
      "Actual Profit": project.actualProfit.toString(),
      "Manager": project.manager?.name || "",
      "Invoices": project._count.invoices,
      "Quotations": project._count.quotations,
      "Drawings": project._count.drawings,
      "Notes": project.notes || "",
      "Created": project.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Projects");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="projects-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}