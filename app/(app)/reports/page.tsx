import { PieChart, FileSpreadsheet, FileText, Download } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";

export default async function ReportsPage() {
  const [projects, totalExpenses, totalInvoices] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null }, take: 10, select: { id: true, name: true, code: true, status: true } }),
    prisma.expense.aggregate({ where: { deletedAt: null }, _sum: { amount: true } }),
    prisma.invoice.findMany({ where: { deletedAt: null }, take: 5 }),
  ]);

  const expenseTotal = totalExpenses._sum?.amount?.toString() ?? "0";

  const reports = [
    { name: "Project Cost Report", icon: FileText, action: "/reports/project-cost" },
    { name: "Profit Report", icon: PieChart, action: "/reports/profit" },
    { name: "BOQ Report", icon: FileSpreadsheet, action: "/reports/boq" },
    { name: "Material Report", icon: FileSpreadsheet, action: "/reports/materials" },
    { name: "Supplier Report", icon: FileSpreadsheet, action: "/reports/suppliers" },
    { name: "Labour Report", icon: FileSpreadsheet, action: "/reports/labour" },
    { name: "Expense Report", icon: FileSpreadsheet, action: "/reports/expenses" },
    { name: "Invoice Report", icon: FileSpreadsheet, action: "/reports/invoices" },
    { name: "Payment Report", icon: FileSpreadsheet, action: "/reports/payments" },
    { name: "Outstanding Report", icon: FileSpreadsheet, action: "/reports/outstanding" },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate professional reports for project analysis and decision making."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.name} className="rounded-lg p-5">
              <div className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-brass" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy">{report.name}</h3>
                  <p className="text-sm text-slate">Generate and export</p>
                </div>
              </div>
              <Link href={report.action}>
                <Button variant="outline" size="sm" className="mt-4">Generate Report</Button>
              </Link>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-lg mt-6">
        <div className="p-5">
          <CardTitle>Quick Summary</CardTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-line bg-paper p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate">Total Projects</p>
              <p className="mt-2 font-display text-3xl font-semibold text-navy">{projects.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-paper p-4">
              <p className="mt-2 font-display text-3xl font-semibold text-navy">{formatNPR(expenseTotal as any)}</p>
            </div>
            <div className="rounded-lg border border-line bg-paper p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate">Recent Invoices</p>
              <p className="mt-2 font-display text-3xl font-semibold text-navy">{totalInvoices.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
