import { Boxes, Search, Filter, Download, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createMaterial } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; lowStock?: string };
}) {
  const search = searchParams.search || "";
  const categoryFilter = searchParams.category || "";
  const lowStockOnly = searchParams.lowStock === "true";

  const [materials, categories, suppliers] = await Promise.all([
    prisma.material.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search,  } },
            { code: { contains: search,  } },
            { brand: { contains: search,  } },
            { model: { contains: search,  } },
            { specification: { contains: search,  } },
          ],
        }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(lowStockOnly && {
          currentStock: { lte: prisma.material.fields.minStock },
        }),
      },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.materialCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalMaterials = await prisma.material.count({ where: { deletedAt: null } });
  const lowStockCount = await prisma.material.count({
    where: {
      deletedAt: null,
      currentStock: { lte: prisma.material.fields.minStock },
    },
  });

  return (
    <>
      <PageHeader
        title="Material Database"
        description="Manage electrical materials, suppliers, pricing, stock levels, and specifications for project estimation and procurement."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Boxes className="h-5 w-5 text-brass" />
            <CardTitle>Add Material</CardTitle>
          </div>
          <form action={createMaterial} className="grid gap-4">
            <Field label="Material code *">
              <Input name="code" required placeholder="e.g., MCB-001" />
            </Field>
            <Field label="Material name *">
              <Input name="name" required placeholder="e.g., 16A MCB" />
            </Field>
            <Field label="Category">
              <select 
                name="categoryId" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory">
              <Input name="subcategory" placeholder="e.g., Circuit Breakers" />
            </Field>
            <Field label="Brand">
              <Input name="brand" placeholder="e.g., Schneider, ABB" />
            </Field>
            <Field label="Model">
              <Input name="model" placeholder="e.g., Acti9 iC60" />
            </Field>
            <Field label="Specification">
              <Input name="specification" placeholder="Technical specifications" />
            </Field>
            <Field label="Unit">
              <Input name="unit" placeholder="e.g., Nos, Mtr, Kg" defaultValue="Nos" />
            </Field>
            <Field label="Purchase price (NPR)">
              <Input name="purchasePrice" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Selling price (NPR)">
              <Input name="sellingPrice" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Supplier">
              <select 
                name="supplierId" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </Field>
            <Field label="VAT rate %">
              <Input name="vatRate" type="number" step="0.01" defaultValue="13" />
            </Field>
            <Field label="Minimum stock">
              <Input name="minStock" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Current stock">
              <Input name="currentStock" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Warranty">
              <Input name="warranty" placeholder="e.g., 2 years" />
            </Field>
            <Field label="Notes">
              <Input name="notes" placeholder="Additional notes" />
            </Field>
            <Button type="submit">Add material</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Materials ({totalMaterials})</CardTitle>
            <div className="flex gap-2">
              {lowStockCount > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1 text-sm text-amber-950">
                  <AlertTriangle className="h-4 w-4" />
                  {lowStockCount} low stock
                </div>
              )}
              <Link href="/materials/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Material
                </Button>
              </Link>
              <form action="/api/materials/export" method="get">
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
                  placeholder="Search materials..." 
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </form>
            <form className="w-40" action="">
              <select 
                name="category" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
                defaultValue={categoryFilter}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </form>
            <form className="w-32" action="">
              <select 
                name="lowStock" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
                defaultValue={lowStockOnly ? "true" : ""}
              >
                <option value="">All Stock</option>
                <option value="true">Low Stock</option>
              </select>
            </form>
          </div>

          <DataTable 
            columns={[
              "Code", 
              "Name", 
              "Category", 
              "Brand", 
              "Unit", 
              "Purchase Price", 
              "Selling Price", 
              "Stock", 
              "Status",
              "Actions"
            ]}
          >
            {materials.map((material) => {
              const isLowStock = money(material.currentStock).lessThanOrEqualTo(material.minStock);
              return (
                <tr key={material.id}>
                  <td className="px-3 py-3 font-medium text-navy">{material.code}</td>
                  <td className="px-3 py-3">
                    <Link href={`/materials/${material.id}`} className="font-medium text-navy hover:underline">
                      {material.name}
                    </Link>
                    {material.model && (
                      <p className="text-xs text-slate">{material.model}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate">{material.category?.name || "-"}</td>
                  <td className="px-3 py-3 text-slate">{material.brand || "-"}</td>
                  <td className="px-3 py-3 text-slate">{material.unit}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(material.purchasePrice)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(material.sellingPrice)}</td>
                  <td className="px-3 py-3">
                    <span className={isLowStock ? "text-red-600 font-medium" : "text-slate"}>
                      {material.currentStock.toString()}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {isLowStock ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/materials/${material.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </DataTable>

          {materials.length === 0 && (
            <div className="py-8 text-center text-slate">
              No materials found. {search || categoryFilter || lowStockOnly ? "Try adjusting your search or filters." : "Add your first material to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}