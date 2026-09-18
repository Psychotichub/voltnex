import { notFound } from "next/navigation";
import { Building2, FileText, Receipt, Wallet, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { deleteClient, updateClient } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";
import { documentTotals } from "@/lib/finance";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { 
      id,
      deletedAt: null,
    },
    include: {
      projects: {
        include: {
          _count: {
            select: {
              invoices: true,
              quotations: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      quotations: {
        orderBy: { date: "desc" },
        take: 5,
        include: {
          items: true,
          project: true,
        },
      },
      invoices: {
        orderBy: { date: "desc" },
        take: 5,
        include: {
          items: true,
          payments: true,
          project: true,
        },
      },
      payments: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Calculate outstanding balance
  const outstandingBalance = client.invoices.reduce((sum, invoice) => {
    const total = money(documentTotals(invoice.items, invoice.discount, invoice.vatPct).grand);
    const paid = invoice.payments.reduce((paymentSum, payment) => paymentSum.plus(payment.amount), money(0));
    return sum.plus(total.minus(paid));
  }, money(0));

  const totalProjectValue = client.projects.reduce((sum, project) => sum.plus(project.contractValue), money(0));
  const totalQuotations = client.quotations.reduce((sum, quote) => {
    const total = money(documentTotals(quote.items, quote.discount, quote.vatPct).grand);
    return sum.plus(total);
  }, money(0));

  return (
    <>
      <div className="mb-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <PageHeader
        title={client.name}
        description={client.company ? `${client.company} • ${client.type.replaceAll("_", " ")}` : client.type.replaceAll("_", " ")}
      />

      <div className="grid gap-5">
        {/* Client Information Card */}
        <Card className="rounded-lg">
          <CardTitle>Client Information</CardTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Contact Person</p>
              <p className="text-sm text-navy">{client.contactPerson || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Phone</p>
              <p className="text-sm text-navy">{client.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Email</p>
              <p className="text-sm text-navy">{client.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Address</p>
              <p className="text-sm text-navy">{client.address || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">PAN/VAT</p>
              <p className="text-sm text-navy">{client.panVat || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Client Type</p>
              <StatusBadge value={client.type} />
            </div>
            {client.notes && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate">Notes</p>
                <p className="text-sm text-navy">{client.notes}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">Edit Client</Button>
            <form action={deleteClient}>
              <input type="hidden" name="id" value={client.id} />
              <Button variant="danger" size="sm">Delete Client</Button>
            </form>
          </div>
        </Card>

        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Total Projects</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{client.projects.length}</p>
              </div>
              <Building2 className="h-5 w-5 text-brass" />
            </div>
          </Card>
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Project Value</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{formatNPR(totalProjectValue)}</p>
              </div>
              <Building2 className="h-5 w-5 text-brass" />
            </div>
          </Card>
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Quotations</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{formatNPR(totalQuotations)}</p>
              </div>
              <FileText className="h-5 w-5 text-brass" />
            </div>
          </Card>
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Outstanding</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{formatNPR(outstandingBalance)}</p>
              </div>
              <Wallet className="h-5 w-5 text-brass" />
            </div>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="rounded-lg">
          <CardTitle>Recent Projects</CardTitle>
          <DataTable columns={["Project", "Code", "Status", "Contract Value", "Invoices", "Quotations"]}>
            {client.projects.map((project) => (
              <tr key={project.id}>
                <td className="px-3 py-3">
                  <Link href={`/projects/${project.id}`} className="font-medium text-navy hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate">{project.code}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={project.status} />
                </td>
                <td className="px-3 py-3 font-medium text-navy">{formatNPR(project.contractValue)}</td>
                <td className="px-3 py-3 text-center text-slate">{project._count.invoices}</td>
                <td className="px-3 py-3 text-center text-slate">{project._count.quotations}</td>
              </tr>
            ))}
          </DataTable>
          {client.projects.length === 0 && (
            <div className="py-4 text-center text-slate">No projects yet</div>
          )}
        </Card>

        {/* Recent Quotations */}
        <Card className="rounded-lg">
          <CardTitle>Recent Quotations</CardTitle>
          <DataTable columns={["Number", "Date", "Project", "Status", "Total"]}>
            {client.quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td className="px-3 py-3 font-medium text-navy">{quotation.number}</td>
                <td className="px-3 py-3 text-slate">{new Date(quotation.date).toLocaleDateString()}</td>
                <td className="px-3 py-3 text-slate">{quotation.project.name}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={quotation.status} />
                </td>
                <td className="px-3 py-3 font-medium text-navy">
                  {formatNPR(documentTotals(quotation.items, quotation.discount, quotation.vatPct).grand)}
                </td>
              </tr>
            ))}
          </DataTable>
          {client.quotations.length === 0 && (
            <div className="py-4 text-center text-slate">No quotations yet</div>
          )}
        </Card>

        {/* Recent Invoices */}
        <Card className="rounded-lg">
          <CardTitle>Recent Invoices</CardTitle>
          <DataTable columns={["Number", "Date", "Project", "Status", "Total", "Paid", "Balance"]}>
            {client.invoices.map((invoice) => {
              const total = money(documentTotals(invoice.items, invoice.discount, invoice.vatPct).grand);
              const paid = invoice.payments.reduce((sum, payment) => sum.plus(payment.amount), money(0));
              const balance = total.minus(paid);
              
              return (
                <tr key={invoice.id}>
                  <td className="px-3 py-3 font-medium text-navy">{invoice.number}</td>
                  <td className="px-3 py-3 text-slate">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-slate">{invoice.project.name}</td>
                  <td className="px-3 py-3">
                    <StatusBadge value={invoice.status} />
                  </td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(total)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(paid)}</td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(balance)}</td>
                </tr>
              );
            })}
          </DataTable>
          {client.invoices.length === 0 && (
            <div className="py-4 text-center text-slate">No invoices yet</div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card className="rounded-lg">
          <CardTitle>Recent Payments</CardTitle>
          <DataTable columns={["Date", "Amount", "Type", "Reference", "Notes"]}>
            {client.payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-3 py-3 text-slate">{new Date(payment.date).toLocaleDateString()}</td>
                <td className="px-3 py-3 font-medium text-navy">{formatNPR(payment.amount)}</td>
                <td className="px-3 py-3 text-slate">{payment.kind}</td>
                <td className="px-3 py-3 text-slate">{payment.method || "-"}</td>
                <td className="px-3 py-3 text-slate">{payment.notes || "-"}</td>
              </tr>
            ))}
          </DataTable>
          {client.payments.length === 0 && (
            <div className="py-4 text-center text-slate">No payments yet</div>
          )}
        </Card>
      </div>
    </>
  );
}