import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Trash2, FileSpreadsheet, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/status-badge";
import { addBoqItem } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";
import { summarizeBoq } from "@/lib/finance";

const BOQ_CATEGORIES = [
  "Lighting", "Power", "Distribution Board", "MDB", "SMDB", "MCC", "Cable", 
  "Cable Tray", "Cable Ladder", "Conduit", "Earthing", "Lightning Protection", 
  "Generator", "ATS", "AMF", "UPS", "Transformer", "Capacitor Bank", "Motor", 
  "Fire Alarm", "CCTV", "Data", "Access Control", "BMS", "KNX", "DALI", 
  "Solar", "Miscellaneous"
];

export default async function BoqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boq = await prisma.boq.findUnique({
    where: { 
      id,
      deletedAt: null,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
      items: {
        orderBy: { sortOrder: "asc" },
      },
      quotations: {
        orderBy: { date: "desc" },
        take: 3,
        include: {
          items: true,
          client: true,
        },
      },
    },
  });

  if (!boq) {
    notFound();
  }

  const summary = summarizeBoq({
    items: boq.items,
    overheadPct: boq.overheadPct,
    contingencyPct: boq.contingencyPct,
    profitPct: boq.profitPct,
    discount: boq.discount,
    vatPct: boq.vatPct,
  });

  return (
    <>
      <div className="mb-4">
        <Link href="/boq">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to BOQs
          </Button>
        </Link>
      </div>

      <PageHeader
        title={boq.title}
        description={`${boq.number} • ${boq.project.code} - ${boq.project.name} • ${boq.project.client.name}`}
      />

      <div className="grid gap-5">
        {/* BOQ Summary Card */}
        <Card className="rounded-lg">
          <CardTitle>BOQ Summary</CardTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Project</p>
              <p className="text-sm text-navy">{boq.project.name}</p>
              <p className="text-xs text-slate">{boq.project.client.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Items</p>
              <p className="text-sm text-navy">{boq.items.length}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Subtotal</p>
              <p className="text-sm text-navy">{formatNPR(summary.subtotal)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Grand Total</p>
              <p className="text-sm font-semibold text-navy">{formatNPR(summary.grand)}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href={`/boq/${boq.id}/quotations/new`}>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Create Quotation
              </Button>
            </Link>
            <form action={`/api/boq/${boq.id}/pdf`} method="get">
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </form>
            <form action="/api/boq/export" method="get">
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </form>
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card className="rounded-lg">
          <CardTitle>Cost Breakdown</CardTitle>
          <div className="mt-4">
            <DataTable columns={["Component", "Amount", "% of Subtotal"]}>
              <tr>
                <td className="px-3 py-2 text-slate">Material</td>
                <td className="px-3 py-2 text-navy">{formatNPR(summary.material)}</td>
                <td className="px-3 py-2 text-slate">{summary.subtotal.isZero() ? "0%" : `${summary.material.dividedBy(summary.subtotal).times(100).toFixed(1)}%`}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Labour</td>
                <td className="px-3 py-2 text-navy">{formatNPR(summary.labour)}</td>
                <td className="px-3 py-2 text-slate">{summary.subtotal.isZero() ? "0%" : `${summary.labour.dividedBy(summary.subtotal).times(100).toFixed(1)}%`}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Equipment</td>
                <td className="px-3 py-2 text-navy">{formatNPR(summary.equipment)}</td>
                <td className="px-3 py-2 text-slate">{summary.subtotal.isZero() ? "0%" : `${summary.equipment.dividedBy(summary.subtotal).times(100).toFixed(1)}%`}</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="px-3 py-2 font-medium text-navy">Subtotal</td>
                <td className="px-3 py-2 font-medium text-navy">{formatNPR(summary.subtotal)}</td>
                <td className="px-3 py-2 text-slate">100%</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Overhead ({boq.overheadPct.toString()}%)</td>
                <td className="px-3 py-2 text-slate">{formatNPR(summary.overhead)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Contingency ({boq.contingencyPct.toString()}%)</td>
                <td className="px-3 py-2 text-slate">{formatNPR(summary.contingency)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Profit ({boq.profitPct.toString()}%)</td>
                <td className="px-3 py-2 text-slate">{formatNPR(summary.profit)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate">Discount</td>
                <td className="px-3 py-2 text-slate">{formatNPR(boq.discount)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
              <tr className="bg-brass/10">
                <td className="px-3 py-2 font-semibold text-navy">Net Amount</td>
                <td className="px-3 py-2 font-semibold text-navy">{formatNPR(summary.net)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
              <tr className="bg-brass/10">
                <td className="px-3 py-2 font-semibold text-navy">VAT ({boq.vatPct.toString()}%)</td>
                <td className="px-3 py-2 font-semibold text-navy">{formatNPR(summary.vat)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
              <tr className="bg-brass/20">
                <td className="px-3 py-2 font-bold text-navy">Grand Total</td>
                <td className="px-3 py-2 font-bold text-navy">{formatNPR(summary.grand)}</td>
                <td className="px-3 py-2 text-slate">-</td>
              </tr>
            </DataTable>
          </div>
        </Card>

        {/* Add Item Form */}
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-brass" />
            <CardTitle>Add BOQ Item</CardTitle>
          </div>
          <form action={addBoqItem} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="boqId" value={boq.id} />
            <Field label="Item No.">
              <Input name="itemNo" required placeholder="e.g., 1.1" />
            </Field>
            <Field label="Description *">
              <Input name="description" required placeholder="e.g., 16A MCB" />
            </Field>
            <Field label="Specification">
              <Input name="specification" placeholder="e.g., 1P+N, 6kA" />
            </Field>
            <Field label="Category">
              <select 
                name="category" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                {BOQ_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </Field>
            <Field label="Unit">
              <Input name="unit" placeholder="e.g., Nos, Mtr" defaultValue="Nos" />
            </Field>
            <Field label="Quantity *">
              <Input name="quantity" type="number" step="0.001" required placeholder="0.00" />
            </Field>
            <Field label="Material Rate (NPR)">
              <Input name="materialRate" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Labour Rate (NPR)">
              <Input name="labourRate" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Equipment Rate (NPR)">
              <Input name="equipmentRate" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Remarks">
              <Input name="remarks" placeholder="Additional notes" />
            </Field>
            <div className="md:col-span-2 lg:col-span-4">
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </form>
        </Card>

        {/* BOQ Items Table */}
        <Card className="rounded-lg">
          <CardTitle>BOQ Items ({boq.items.length})</CardTitle>
          <div className="mt-4">
            <DataTable 
              columns={[
                "Item No.", 
                "Description", 
                "Specification", 
                "Category", 
                "Unit", 
                "Quantity", 
                "Mat. Rate", 
                "Mat. Total", 
                "Lab. Rate", 
                "Lab. Total", 
                "Eq. Rate", 
                "Eq. Total", 
                "Total", 
                "Actions"
              ]}
            >
              {boq.items.map((item) => {
                const materialTotal = money(item.quantity).times(item.materialRate);
                const labourTotal = money(item.quantity).times(item.labourRate);
                const equipmentTotal = money(item.quantity).times(item.equipmentRate);
                const itemTotal = materialTotal.plus(labourTotal).plus(equipmentTotal);
                
                return (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-sm text-navy">{item.itemNo}</td>
                    <td className="px-3 py-2 text-sm text-navy">{item.description}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.specification || "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.category}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.unit}</td>
                    <td className="px-3 py-2 text-sm text-slate">{item.quantity.toString()}</td>
                    <td className="px-3 py-2 text-sm text-slate">{formatNPR(item.materialRate)}</td>
                    <td className="px-3 py-2 text-sm text-navy">{formatNPR(materialTotal)}</td>
                    <td className="px-3 py-2 text-sm text-slate">{formatNPR(item.labourRate)}</td>
                    <td className="px-3 py-2 text-sm text-navy">{formatNPR(labourTotal)}</td>
                    <td className="px-3 py-2 text-sm text-slate">{formatNPR(item.equipmentRate)}</td>
                    <td className="px-3 py-2 text-sm text-navy">{formatNPR(equipmentTotal)}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-navy">{formatNPR(itemTotal)}</td>
                    <td className="px-3 py-2">
                      <form action="">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            {boq.items.length === 0 && (
              <div className="py-8 text-center text-slate">
                No items added yet. Add your first item to build the BOQ.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Quotations */}
        {boq.quotations.length > 0 && (
          <Card className="rounded-lg">
            <CardTitle>Quotations from this BOQ ({boq.quotations.length})</CardTitle>
            <div className="mt-4">
              <DataTable columns={["Number", "Date", "Client", "Status", "Total"]}>
                {boq.quotations.map((quotation) => {
                  const total = quotation.items.reduce((sum, item) => sum.plus(item.quantity.times(item.rate)), money(0));
                  return (
                    <tr key={quotation.id}>
                      <td className="px-3 py-2 text-sm text-navy">{quotation.number}</td>
                      <td className="px-3 py-2 text-sm text-slate">{new Date(quotation.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-sm text-slate">{quotation.client.name}</td>
                      <td className="px-3 py-2">
                        <StatusBadge value={quotation.status} />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-navy">{formatNPR(total)}</td>
                    </tr>
                  );
                })}
              </DataTable>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}