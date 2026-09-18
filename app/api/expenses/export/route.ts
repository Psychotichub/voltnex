import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportToExcel } from "@/lib/excel";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { date: "desc" },
    });

    const data = expenses.map((expense) => ({
      "Number": expense.number,
      "Date": expense.date.toISOString().split('T')[0],
      "Project": expense.project?.name ?? "",
      "Category": expense.category,
      "Description": expense.description,
      "Amount (NPR)": expense.amount.toString(),
      "Vendor": expense.vendor ?? "",
      "Payment Method": expense.paymentMethod,
      "Receipt Path": expense.receiptPath ?? "",
      "Notes": expense.notes ?? "",
      "Created": expense.createdAt.toISOString().split('T')[0],
    }));

    const buffer = await exportToExcel(data, "Expenses");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="expenses-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
