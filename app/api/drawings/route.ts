import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const projectId = String(formData.get("projectId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const discipline = (formData.get("discipline") as string) || null;
    const status = (formData.get("status") as string) || "DRAFT";
    const preparedBy = (formData.get("preparedBy") as string) || null;
    const checkedBy = (formData.get("checkedBy") as string) || null;
    const approvedBy = (formData.get("approvedBy") as string) || null;

    if (!projectId || !title) return NextResponse.json({ error: "Project and title are required" }, { status: 400 });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const projectCode = project?.code ?? "TMP";
    const { drawingNumber } = await import("@/lib/numbering");
    const number = drawingNumber(projectCode, 1);

    const drawing = await prisma.drawing.create({
      data: {
        number,
        title,
        projectId,
        discipline: (discipline || undefined) as string,
        status: status as any,
        preparedBy: preparedBy ?? undefined,
        checkedBy: checkedBy ?? undefined,
        approvedBy: approvedBy ?? undefined,
      },
    });

    return NextResponse.json({ success: true, drawingId: drawing.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create drawing" }, { status: 500 });
  }
}
