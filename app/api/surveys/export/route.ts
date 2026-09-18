import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const surveys = await prisma.siteSurvey.findMany({
      where: { deletedAt: null },
      include: { project: true, client: true },
      orderBy: { createdAt: "desc" },
    });

    const data = surveys.map((s) => ({
      "Project": s.project?.name ?? "",
      "Client": s.client?.name ?? "",
      "Location": s.location ?? "",
      "Voltage": s.voltage ?? "",
      "Incoming Supply": s.incomingSupply ?? "",
      "Survey Date": s.surveyDate.toISOString().split('T')[0],
      "Engineer": "",
    }));

    const buffer = await exportToExcel(data, "Site Surveys");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="surveys-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
