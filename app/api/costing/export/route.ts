import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        client: true,
        costing: true,
        expenses: {
          select: { amount: true, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = projects.map((project) => {
      const actualCost = project.expenses.reduce((sum, exp) => sum + Number(exp.amount), Number(project.actualCost));
      const actualProfit = Number(project.contractValue) - actualCost;
      const contractValue = Number(project.contractValue);
      const actualMargin = contractValue > 0 ? (actualProfit / contractValue) * 100 : 0;
      
      return {
        "Project Code": project.code,
        "Project Name": project.name,
        "Client": project.client.name,
        "Location": project.location || "",
        "Project Type": project.projectType,
        "Status": project.status,
        "Workflow": project.workflow,
        "Contract Value": project.contractValue.toString(),
        "Estimated Cost": project.estimatedCost.toString(),
        "Actual Cost": actualCost.toString(),
        "Estimated Profit": project.estimatedProfit.toString(),
        "Actual Profit": actualProfit.toString(),
        "Estimated Margin %": ((Number(project.estimatedProfit) / contractValue) * 100).toFixed(2),
        "Actual Margin %": actualMargin.toFixed(2),
        "Cost Variance": (actualCost - Number(project.estimatedCost)).toString(),
        "Start Date": project.startDate?.toISOString().split('T')[0] || "",
        "Expected Completion": project.expectedCompletion?.toISOString().split('T')[0] || "",
        "Actual Completion": project.actualCompletion?.toISOString().split('T')[0] || "",
      };
    });

    const buffer = await exportToExcel(data, "Project Costing");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="costing-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}