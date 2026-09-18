import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const surveys = await prisma.siteSurvey.findMany({
      where: { deletedAt: null },
      include: { project: true, engineer: true },
      orderBy: { createdAt: "desc" },
    });
    const data = surveys.map((s) => ({
      Project: s.project?.name ?? "",
      Location: s.location ?? "",
      SurveyDate: s.surveyDate.toISOString().split("T")[0],
      Engineer: s.engineerId ?? "",
      IncomingSupply: s.incomingSupply ?? "",
      Voltage: s.voltage ?? "",
      Phase: s.phase ?? "",
      Measurements: s.measurements ?? "",
    }));
    return toCSV(data, "surveys");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
