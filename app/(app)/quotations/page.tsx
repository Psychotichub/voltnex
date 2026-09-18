import { DocumentStatus } from "@prisma/client";
import { FileSpreadsheet, Search, Download, Plus, FileText } from "lucide-react";
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

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";

  const quotations = await prisma.quotation.findMany({
    where: {
      deletedAt: null,
      ...(search && {
        OR: [
          { number: { contains: search,  } },
          { scopeOfWork: { contains: search,  } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as DocumentStatus }),
    },
    include: {
      client: true,
      project: true,
      boq: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });

  const totalQuotations = await prisma.quotation.count({ where: { deletedAt: null } });

  return (
    <>
      <PageHeader
        title="Quotation Management"
        description="Create and manage quotations from BOQ with professional pricing, terms, and client communication workflows."
      />

      <div className="grid gap-5">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Quotations ({totalQuotations})</CardTitle>
            <div className="flex gap-2">
              <Link href="/quotations/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Quotation
                </Button>
              </Link>
              <form action="/api/quotations/export" method="get">
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
                  placeholder="Search quotations..." 
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
                {Object.values(DocumentStatus).filter(s => ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"].includes(s)).map((status) => (
                  <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                ))}
              </select>
            </form>
          </div>

          <DataTable 
            columns={[
              "Number", 
              "Date", 
              "Client", 
              "Project", 
              "BOQ", 
              "Status", 
              "Valid Until", 
              "Total", 
              "Actions"
            ]}
          >
            {quotations.map((quotation) => {
              const total = money(documentTotals(quotation.items, quotation.discount, quotation.vatPct).grand);
              return (
                <tr key={quotation.id}>
                  <td className="px-3 py-3 font-medium text-navy">{quotation.number}</td>
                  <td className="px-3 py-3 text-slate">{new Date(quotation.date).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-slate">{quotation.client.name}</td>
                  <td className="px-3 py-3 text-slate">
                    <div>
                      <p className="text-sm">{quotation.project.name}</p>
                      <p className="text-xs text-slate">{quotation.project.code}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate">{quotation.boq?.number || "-"}</td>
                  <td className="px-3 py-3">
                    <StatusBadge value={quotation.status} />
                  </td>
                  <td className="px-3 py-3 text-slate">
                    {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(total)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/quotations/${quotation.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <form action={`/api/quotations/${quotation.id}/pdf`} method="get">
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

          {quotations.length === 0 && (
            <div className="py-8 text-center text-slate">
              No quotations found. {search || statusFilter ? "Try adjusting your search or filters." : "Create your first quotation to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}