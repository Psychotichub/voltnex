import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const projectId = String(formData.get("projectId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const purpose = (formData.get("purpose") as string) || null;
    const scope = (formData.get("scope") as string) || null;
    const responsibilities = (formData.get("responsibilities") as string) || null;
    const tools = (formData.get("tools") as string) || null;
    const materials = (formData.get("materials") as string) || null;
    const safety = (formData.get("safety") as string) || null;
    const ppe = (formData.get("ppe") as string) || null;
    const procedure = (formData.get("procedure") as string) || null;
    const qualityControl = (formData.get("qualityControl") as string) || null;
    const inspection = (formData.get("inspection") as string) || null;
    const testing = (formData.get("testing") as string) || null;
    const acceptance = (formData.get("acceptance") as string) || null;
    const riskAssessment = (formData.get("riskAssessment") as string) || null;
    const references = (formData.get("references") as string) || null;

    if (!projectId || !title) return NextResponse.json({ error: "Project and title are required" }, { status: 400 });

    const { nextNumber } = await import("@/lib/numbering");
    const number = await nextNumber("ms");

    const ms = await prisma.methodStatement.create({
      data: {
        number,
        title,
        projectId,
        purpose,
        scope,
        responsibilities,
        tools,
        materials,
        safety,
        ppe,
        procedure,
        qualityControl,
        inspection,
        testing,
        acceptance,
        riskAssessment,
        references,
      },
    });

    return NextResponse.json({ success: true, msId: ms.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create method statement" }, { status: 500 });
  }
}
