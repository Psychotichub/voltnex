import { Banknote, Search, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createPayment } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";
import { PaymentKind } from "@prisma/client";

export default async function PaymentsPage() {
  const [payments, projects, invoices, totalPayments] = await Promise.all([
    prisma.payment.findMany({
      where: { deletedAt: null },
      include: { project: true, invoice: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.invoice.findMany({
      where: { deletedAt: null },
      orderBy: { date: "desc" },
      select: { id: true, number: true },
    }),
    prisma.payment.count({ where: { deletedAt: null } }),
  ]);

  return (
    <>
      <PageHeader
        title="Payment Management"
        description="Track client, supplier, and labour payments."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-brass" />
            <CardTitle>Record Payment</CardTitle>
          </div>
          <form action={createPayment} className="grid gap-4">
            <Field label="Project">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Invoice">
              <select name="invoiceId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.number}</option>
                ))}
              </select>
            </Field>
            <Field label="Amount (NPR) *">
              <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
            </Field>
            <Field label="Payment type">
              <select name="kind" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="CLIENT">Client</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="LABOUR">Labour</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Method">
              <select name="method" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </Field>
            <Field label="Reference">
              <Input name="reference" placeholder="Reference number" />
            </Field>
            <Button type="submit">Record payment</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Payments ({totalPayments})</CardTitle>
            <Link href="/payments">
              <Button variant="outline" size="sm">Export</Button>
            </Link>
          </div>
          <DataTable columns={["Date", "Project", "Type", "Invoice", "Amount", "Method", "Reference"]}>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-3 py-3 text-sm text-slate">{payment.date.toISOString().split("T")[0]}</td>
                <td className="px-3 py-3 text-sm text-navy">{payment.project?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{payment.kind.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-sm text-slate">{payment.invoice?.number ?? "-"}</td>
                <td className="px-3 py-3 text-sm font-medium text-navy">{formatNPR(payment.amount)}</td>
                <td className="px-3 py-3 text-sm text-slate">{payment.method}</td>
                <td className="px-3 py-3 text-sm text-slate">{payment.reference ?? "-"}</td>
              </tr>
            ))}
          </DataTable>
          {payments.length === 0 && <div className="py-8 text-center text-slate">No payments found.</div>}
        </Card>
      </div>
    </>
  );
}
