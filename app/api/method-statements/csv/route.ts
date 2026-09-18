import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const methods = await prisma.methodStatement.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    const data = methods.map((m) => ({
      Number: m.number,
      Title: m.title,
      Project: m.project?.name ?? "",
      Purpose: m.purpose ?? "",
      Scope: m.scope ?? "",
      Status: m.status,
      "Created At": m.createdAt.toISOString().split("T")[0],
    }));
    return toCSV(data, "method-statements");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
