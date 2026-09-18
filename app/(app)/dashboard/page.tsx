import type { Decimal } from "@prisma/client/runtime/library";
import {
  AlertTriangle,
  Banknote,
  Boxes,
  ClipboardList,
  FileSpreadsheet,
  FolderKanban,
  Receipt,
  TrendingUp,
  Wallet,
  Calendar,
  TrendingDown,
  DollarSign,
  Hammer,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { documentTotals } from "@/lib/finance";
import { formatNPR, money } from "@/lib/money";

function Metric({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-navy">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-brass" />
      </div>
    </Card>
  );
}

function moneySum<T>(rows: T[], read: (row: T) => Decimal) {
  return rows.reduce((sum, row) => sum.plus(read(row)), money(0));
}

export default async function DashboardPage() {
  const [
    activeProjects,
    completedProjects,
    pendingQuotations,
    acceptedQuotations,
    projects,
    invoices,
    expenses,
    materials,
    payments,
    notifications,
  ] = await Promise.all([
    prisma.project.count({ where: { status: { in: ["PLANNING", "QUOTATION", "AWARDED", "IN_PROGRESS", "ON_HOLD"] } } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.quotation.count({ where: { status: "ACCEPTED" } }),
    prisma.project.findMany({ include: { client: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.invoice.findMany({ include: { items: true, client: true, project: true }, orderBy: { dueDate: "asc" } }),
    prisma.expense.findMany({ select: { amount: true, category: true } }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.payment.findMany({ select: { amount: true, kind: true } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const lowStock = materials.filter((item) => money(item.currentStock).lessThanOrEqualTo(item.minStock)).slice(0, 5);
  const contractValue = moneySum(projects, (project) => project.contractValue);
  const estimatedCost = moneySum(projects, (project) => project.estimatedCost);
  const actualCost = moneySum(projects, (project) => project.actualCost);
  const estimatedProfit = moneySum(projects, (project) => project.estimatedProfit);
  const actualProfit = moneySum(projects, (project) => project.actualProfit);
  
  const expenseTotal = expenses.reduce((sum, expense) => sum.plus(expense.amount), money(0));
  const materialExpenses = expenses.filter(e => e.category === "MATERIAL").reduce((sum, e) => sum.plus(e.amount), money(0));
  const labourExpenses = expenses.filter(e => e.category === "LABOUR").reduce((sum, e) => sum.plus(e.amount), money(0));
  
  const receivables = invoices.reduce((sum, invoice) => {
    const total = money(documentTotals(invoice.items, invoice.discount, invoice.vatPct).grand);
    return sum.plus(total.minus(invoice.paidAmount));
  }, money(0));
  
  const outstandingInvoices = invoices.filter((invoice) =>
    money(documentTotals(invoice.items, invoice.discount, invoice.vatPct).grand).greaterThan(invoice.paidAmount),
  ).length;
  
  const clientPayments = payments.filter(p => p.kind === "CLIENT").reduce((sum, p) => sum.plus(p.amount), money(0));
  const supplierPayments = payments.filter(p => p.kind === "SUPPLIER").reduce((sum, p) => sum.plus(p.amount), money(0));
  const labourPayments = payments.filter(p => p.kind === "LABOUR").reduce((sum, p) => sum.plus(p.amount), money(0));
  
  const cashFlow = clientPayments.minus(supplierPayments).minus(labourPayments).minus(expenseTotal);
  
  const costPct = contractValue.isZero() ? 0 : Math.min(100, actualCost.dividedBy(contractValue).times(100).toNumber());
  const profitMargin = contractValue.isZero() ? 0 : actualProfit.dividedBy(contractValue).times(100).toNumber();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Professional electrical contracting control center for projects, quotations, invoices, receivables, cost, cash flow, and operational metrics."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active projects" value={String(activeProjects)} icon={FolderKanban} />
        <Metric label="Completed projects" value={String(completedProjects)} icon={ClipboardList} />
        <Metric label="Pending quotations" value={String(pendingQuotations)} icon={FileSpreadsheet} />
        <Metric label="Accepted quotations" value={String(acceptedQuotations)} icon={TrendingUp} />
        <Metric label="Outstanding invoices" value={String(outstandingInvoices)} icon={Receipt} />
        <Metric label="Total receivables" value={formatNPR(receivables)} icon={Banknote} />
        <Metric label="Total project cost" value={formatNPR(actualCost)} icon={Boxes} />
        <Metric label="Estimated profit" value={formatNPR(estimatedProfit)} icon={TrendingUp} />
        <Metric label="Actual profit" value={formatNPR(actualProfit)} icon={DollarSign} />
        <Metric label="Monthly revenue" value={formatNPR(clientPayments)} icon={TrendingUp} />
        <Metric label="Monthly expenses" value={formatNPR(expenseTotal)} icon={Wallet} />
        <Metric label="Cash flow" value={formatNPR(cashFlow)} icon={Banknote} />
        <Metric label="Material purchases" value={formatNPR(materialExpenses)} icon={Boxes} />
        <Metric label="Labour cost" value={formatNPR(labourExpenses)} icon={Hammer} />
        <Metric label="Profit margin" value={`${profitMargin.toFixed(1)}%`} icon={TrendingUp} />
        <Metric label="Cost vs contract" value={`${costPct.toFixed(1)}%`} icon={TrendingDown} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-lg">
          <CardTitle>Project Cost Snapshot</CardTitle>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ["Contract value", contractValue],
              ["Estimated cost", estimatedCost],
              ["Actual cost", actualCost],
              ["Actual profit", actualProfit],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-md bg-paper p-4">
                <p className="text-xs text-slate">{label as string}</p>
                <p className="mt-1 font-display text-lg font-semibold text-navy">{formatNPR(value)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-paper">
            <div className="h-full bg-brass" style={{ width: `${costPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate">Actual cost consumed against visible contract value. Expenses recorded: {formatNPR(expenseTotal)}.</p>
        </Card>

        <Card className="rounded-lg">
          <CardTitle>Alerts</CardTitle>
          <div className="mt-4 grid gap-3">
            {lowStock.length ? (
              lowStock.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-md bg-amber-50 p-3 text-sm text-amber-950">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{item.name} is below minimum stock.</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate">No low-stock materials.</p>
            )}
            {notifications.map((note) => (
              <div key={note.id} className="rounded-md border border-line p-3 text-sm">
                <p className="font-medium text-navy">{note.title}</p>
                <p className="text-slate">{note.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <DataTable columns={["Project", "Client", "Status", "Workflow", "Contract", "Actual Cost", "Profit"]}>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="px-3 py-3">
                <p className="font-medium text-navy">{project.name}</p>
                <p className="text-xs text-slate">{project.code}</p>
              </td>
              <td className="px-3 py-3 text-slate">{project.client.name}</td>
              <td className="px-3 py-3">
                <StatusBadge value={project.status} />
              </td>
              <td className="px-3 py-3 text-slate">{project.workflow.replaceAll("_", " ")}</td>
              <td className="px-3 py-3 font-medium text-navy">{formatNPR(project.contractValue)}</td>
              <td className="px-3 py-3 font-medium text-navy">{formatNPR(project.actualCost)}</td>
              <td className="px-3 py-3 font-medium text-navy">{formatNPR(project.actualProfit)}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}
