import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { date: "desc" },
    });
    const data = expenses.map((e) => ({
      Number: e.number,
      Date: e.date.toISOString().split("T")[0],
      Project: e.project?.name ?? "",
      Category: e.category,
      Description: e.description,
      "Amount (NPR)": e.amount.toString(),
      Vendor: e.vendor ?? "",
      "Payment Method": e.paymentMethod,
      Receipt: e.receiptPath ?? "",
      Notes: e.notes ?? "",
      Created: e.createdAt.toISOString().split("T")[0],
    }));
    return toCSV(data, "expenses");
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
