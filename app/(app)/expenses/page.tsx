import { Wallet, Search, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createExpense } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";
import { ExpenseCategory } from "@prisma/client";

export default async function ExpensesPage() {
  const [expenses, projects, totalExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.expense.count({ where: { deletedAt: null } }),
  ]);

  const categories = Object.values(ExpenseCategory);

  return (
    <>
      <PageHeader
        title="Expense Management"
        description="Track project expenses across all categories."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brass" />
            <CardTitle>Record Expense</CardTitle>
          </div>
          <form action={createExpense} className="grid gap-4">
            <Field label="Project">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select name="category" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Description *">
              <Input name="description" required placeholder="Expense description" />
            </Field>
            <Field label="Amount (NPR) *">
              <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
            </Field>
            <Field label="Vendor">
              <Input name="vendor" placeholder="Vendor name" />
            </Field>
            <Field label="Payment method">
              <select name="paymentMethod" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </Field>
            <Field label="Notes">
              <Input name="notes" placeholder="Notes" />
            </Field>
            <Button type="submit">Record expense</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Expenses ({totalExpenses})</CardTitle>
            <Link href="/expenses">
              <Button variant="outline" size="sm">Export</Button>
            </Link>
          </div>
          <DataTable columns={["Date", "Project", "Category", "Description", "Amount", "Vendor", "Status"]}>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-3 py-3 text-sm text-slate">{expense.date.toISOString().split("T")[0]}</td>
                <td className="px-3 py-3 text-sm text-navy">{expense.project?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{expense.category.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-sm text-slate">{expense.description}</td>
                <td className="px-3 py-3 text-sm font-medium text-navy">{formatNPR(expense.amount)}</td>
                <td className="px-3 py-3 text-sm text-slate">{expense.vendor ?? "-"}</td>
                <td className="px-3 py-3">Active</td>
              </tr>
            ))}
          </DataTable>
          {expenses.length === 0 && <div className="py-8 text-center text-slate">No expenses found.</div>}
        </Card>
      </div>
    </>
  );
}
