import { ShoppingCart, Search, Plus, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createPurchaseOrder } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { DocumentStatus } from "@prisma/client";

export default async function ProcurementPage() {
  const [purchaseOrders, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      include: { supplier: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Procurement"
        description="Manage purchase orders from supplier quotations to material receipt."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brass" />
            <CardTitle>Create Purchase Order</CardTitle>
          </div>
          <form action={createPurchaseOrder} className="grid gap-4">
            <Field label="Supplier *">
              <select name="supplierId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" required>
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Project">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select project</option>
              </select>
            </Field>
            <Field label="VAT %">
              <Input name="vatPct" type="number" defaultValue="13" step="0.01" />
            </Field>
            <Field label="Payment terms">
              <Input name="paymentTerms" placeholder="Payment terms" />
            </Field>
            <Field label="Delivery date">
              <Input name="deliveryDate" type="date" />
            </Field>
            <Button type="submit">Create PO</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Purchase Orders ({purchaseOrders.length})</CardTitle>
            <Link href="/procurement">
              <Button variant="outline" size="sm">Export</Button>
            </Link>
          </div>
          <DataTable columns={["PO Number", "Supplier", "Status", "Total Items", "Date"]}>
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td className="px-3 py-3 text-sm text-navy">{po.number}</td>
                <td className="px-3 py-3 text-sm text-slate">{po.supplier.name}</td>
                <td className="px-3 py-3">{po.status.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-sm text-slate">{po.items.length}</td>
                <td className="px-3 py-3 text-sm text-slate">{po.createdAt.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {purchaseOrders.length === 0 && <div className="py-8 text-center text-slate">No purchase orders found.</div>}
        </Card>
      </div>
    </>
  );
}
