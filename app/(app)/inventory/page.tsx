import { Warehouse, Search, Plus, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createInventoryMove } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { InventoryMoveType } from "@prisma/client";

export default async function InventoryPage() {
  const [moves, materials] = await Promise.all([
    prisma.inventoryMove.findMany({
      where: { deletedAt: null },
      include: { material: true, project: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.material.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, currentStock: true, minStock: true },
    }),
  ]);

  const lowStock = materials.filter((m) => m.currentStock.lte(m.minStock));

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track material movement, stock levels, and alerts."
      />

      {lowStock.length > 0 && (
        <div className="mb-4 rounded-lg border border-yellow-500 bg-yellow-50 p-4">
          <h3 className="font-semibold text-navy">Low Stock Alerts ({lowStock.length})</h3>
          <ul className="mt-2 space-y-1">
            {lowStock.map((m) => (
              <li key={m.id} className="text-sm text-slate">{m.code} - {m.name}: {m.currentStock.toString()} remaining (min: {m.minStock.toString()})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-brass" />
            <CardTitle>Record Movement</CardTitle>
          </div>
          <form action={createInventoryMove} className="grid gap-4">
            <Field label="Material *">
              <select name="materialId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" required>
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select name="type" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="OPENING">Opening</option>
                <option value="PURCHASE">Purchase</option>
                <option value="ISSUE">Issue</option>
                <option value="RETURN">Return</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </Field>
            <Field label="Quantity *">
              <Input name="quantity" type="number" required placeholder="Quantity" />
            </Field>
            <Field label="Note">
              <Input name="note" placeholder="Note" />
            </Field>
            <Button type="submit">Record movement</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Inventory Movements ({moves.length})</CardTitle>
            <Link href="/inventory">
              <Button variant="outline" size="sm">Export</Button>
            </Link>
          </div>
          <DataTable columns={["Material", "Type", "Quantity", "Project", "Date"]}>
            {moves.map((move) => (
              <tr key={move.id}>
                <td className="px-3 py-3 text-sm text-navy">{move.material.code} - {move.material.name}</td>
                <td className="px-3 py-3 text-sm text-slate">{move.type.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-sm text-slate">{move.quantity.toString()}</td>
                <td className="px-3 py-3 text-sm text-slate">{move.project?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{move.createdAt.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {moves.length === 0 && <div className="py-8 text-center text-slate">No inventory movements found.</div>}
        </Card>
      </div>
    </>
  );
}
