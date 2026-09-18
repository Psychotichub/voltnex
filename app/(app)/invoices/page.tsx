import { DocumentStatus } from "@prisma/client";
import { Receipt, Search, Download, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";
import { documentTotals } from "@/lib/finance";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";

  const invoices = await prisma.invoice.findMany({
    where: {
      deletedAt: null,
      ...(search && {
        OR: [
          { number: { contains: search,  } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as DocumentStatus }),
    },
    include: {
      client: true,
      project: true,
      items: true,
      payments: true,
    },
    orderBy: { date: "desc" },
  });

  const totalInvoices = await prisma.invoice.count({ where: { deletedAt: null } });

  return (
    <>
      <PageHeader
        title="Invoice Management"
        description="Create and manage invoices with payment tracking, status workflows, and professional PDF generation for client billing."
      />

      <div className="grid gap-5">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Invoices ({totalInvoices})</CardTitle>
            <div className="flex gap-2">
              <Link href="/invoices/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
              <form action="/api/invoices/export" method="get">
                <Button type="submit" variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </form>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex gap-2">
            <form className="flex-1" action="">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                <Input 
                  name="search" 
                  placeholder="Search invoices..." 
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </form>
            <form className="w-40" action="">
              <select 
                name="status" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
                defaultValue={statusFilter}
              >
                <option value="">All Status</option>
                {Object.values(DocumentStatus).filter(s => ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"].includes(s)).map((status) => (
                  <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                ))}
              </select>
            </form>
          </div>

          <DataTable 
            columns={[
              "Number", 
              "Date", 
              "Due Date", 
              "Client", 
              "Project", 
              "Status", 
              "Total", 
              "Paid", 
              "Balance", 
              "Actions"
            ]}
          >
            {invoices.map((invoice) => {
              const total = money(documentTotals(invoice.items, invoice.discount, invoice.vatPct).grand);
              const paid = invoice.payments.reduce((sum, payment) => sum.plus(payment.amount), money(0));
              const balance = total.minus(paid);
              const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && balance.greaterThan(0);
              
              return (
                <tr key={invoice.id}>
                  <td className="px-3 py-3 font-medium text-navy">{invoice.number}</td>
                  <td className="px-3 py-3 text-slate">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-slate">
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-3 text-slate">{invoice.client.name}</td>
                  <td className="px-3 py-3 text-slate">
                    <div>
                      <p className="text-sm">{invoice.project.name}</p>
                      <p className="text-xs text-slate">{invoice.project.code}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge value={isOverdue ? "OVERDUE" : invoice.status} />
                  </td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(total)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(paid)}</td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(balance)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <form action={`/api/invoices/${invoice.id}/pdf`} method="get">
                        <Button type="submit" variant="ghost" size="sm" className="gap-1">
                          <FileText className="h-3 w-3" />
                          PDF
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>

          {invoices.length === 0 && (
            <div className="py-8 text-center text-slate">
              No invoices found. {search || statusFilter ? "Try adjusting your search or filters." : "Create your first invoice to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}