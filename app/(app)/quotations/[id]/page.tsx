import { notFound } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, FileText, Download, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";
import { documentTotals } from "@/lib/finance";

export default async function QuotationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const quotation = await prisma.quotation.findUnique({
    where: { 
      id: params.id,
      deletedAt: null,
    },
    include: {
      client: true,
      project: true,
      boq: true,
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!quotation) {
    notFound();
  }

  const totals = documentTotals(quotation.items, quotation.discount, quotation.vatPct);

  return (
    <>
      <div className="mb-4">
        <Link href="/quotations">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quotations
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Quotation ${quotation.number}`}
        description={`${quotation.client.name} • ${quotation.project.name} • ${new Date(quotation.date).toLocaleDateString()}`}
      />

      <div className="grid gap-5">
        {/* Quotation Summary */}
        <Card className="rounded-lg">
          <CardTitle>Quotation Details</CardTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Client</p>
              <p className="text-sm text-navy">{quotation.client.name}</p>
              {quotation.client.company && (
                <p className="text-xs text-slate">{quotation.client.company}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Project</p>
              <p className="text-sm text-navy">{quotation.project.name}</p>
              <p className="text-xs text-slate">{quotation.project.code}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Status</p>
              <div className="mt-1">
                <StatusBadge value={quotation.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Valid Until</p>
              <p className="text-sm text-navy">
                {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "No expiry"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <form action={`/api/quotations/${quotation.id}/pdf`} method="get">
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </form>
            <form action="/api/quotations/export" method="get">
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </form>
          </div>
        </Card>

        {/* Financial Summary */}
        <Card className="rounded-lg">
          <CardTitle>Financial Summary</CardTitle>
          <div className="mt-4">
            <DataTable columns={["Component", "Amount"]}>
              <tr>
                <td className="px-3 py-2 text-slate">Subtotal</td>
                <td className="px-3 py-2 text-navy">{formatNPR(totals.subtotal)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Discount</td>
                <td className="px-3 py-2 text-slate">-{formatNPR(quotation.discount)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Taxable Amount</td>
                <td className="px-3 py-2 text-navy">{formatNPR(money(totals.subtotal).minus(quotation.discount))}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">VAT ({quotation.vatPct.toString()}%)</td>
                <td className="px-3 py-2 text-slate">{formatNPR(totals.vat)}</td>
              </tr>
              <tr className="bg-brass/10">
                <td className="px-3 py-2 font-bold text-navy">Grand Total</td>
                <td className="px-3 py-2 font-bold text-navy">{formatNPR(totals.grand)}</td>
              </tr>
            </DataTable>
          </div>
        </Card>

        {/* Scope and Terms */}
        <Card className="rounded-lg">
          <CardTitle>Scope & Terms</CardTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Scope of Work</p>
              <p className="text-sm text-navy mt-1">{quotation.scopeOfWork || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Payment Terms</p>
              <p className="text-sm text-navy mt-1">{quotation.paymentTerms || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Delivery Terms</p>
              <p className="text-sm text-navy mt-1">{quotation.deliveryTerms || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Warranty</p>
              <p className="text-sm text-navy mt-1">{quotation.warranty || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Inclusions</p>
              <p className="text-sm text-navy mt-1">{quotation.inclusions || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Exclusions</p>
              <p className="text-sm text-navy mt-1">{quotation.exclusions || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Notes</p>
              <p className="text-sm text-navy mt-1">{quotation.notes || "-"}</p>
            </div>
          </div>
        </Card>

        {/* Quotation Items */}
        <Card className="rounded-lg">
          <CardTitle>Quotation Items ({quotation.items.length})</CardTitle>
          <div className="mt-4">
            <DataTable 
              columns={[
                "Description", 
                "Specification", 
                "Quantity", 
                "Unit", 
                "Rate", 
                "Amount"
              ]}
            >
              {quotation.items.map((item) => {
                const amount = money(item.quantity).times(item.rate);
                return (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-sm text-navy">{item.description}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.specification || "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.quantity.toString()}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.unit}</td>
                    <td className="px-3 py-2 text-sm text-slate">{formatNPR(item.rate)}</td>
                    <td className="px-3 py-2 text-sm font-medium text-navy">{formatNPR(amount)}</td>
                  </tr>
                );
              })}
            </DataTable>

            {quotation.items.length === 0 && (
              <div className="py-8 text-center text-slate">
                No items in this quotation.
              </div>
            )}
          </div>
        </Card>

        {/* Status Actions */}
        <Card className="rounded-lg">
          <CardTitle>Status Actions</CardTitle>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Check className="h-4 w-4" />
              Mark as Accepted
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <X className="h-4 w-4" />
              Mark as Rejected
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Mark as Sent
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}