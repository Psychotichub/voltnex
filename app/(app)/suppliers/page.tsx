import { Truck, Search, Download, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createSupplier } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || "";

  const suppliers = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search,  } },
          { company: { contains: search,  } },
          { contactPerson: { contains: search,  } },
          { email: { contains: search,  } },
          { phone: { contains: search,  } },
        ],
      }),
    },
    include: {
      _count: {
        select: {
          materials: true,
          purchaseOrders: true,
          payments: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalSuppliers = await prisma.supplier.count({ where: { deletedAt: null } });

  return (
    <>
      <PageHeader
        title="Supplier Management"
        description="Manage supplier relationships, product categories, payment terms, and procurement performance."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Truck className="h-5 w-5 text-brass" />
            <CardTitle>Add Supplier</CardTitle>
          </div>
          <form action={createSupplier} className="grid gap-4">
            <Field label="Supplier name *">
              <Input name="name" required placeholder="Enter supplier name" />
            </Field>
            <Field label="Company">
              <Input name="company" placeholder="Company name" />
            </Field>
            <Field label="Contact person">
              <Input name="contactPerson" placeholder="Primary contact" />
            </Field>
            <Field label="Phone">
              <Input name="phone" type="tel" placeholder="Phone number" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" placeholder="Email address" />
            </Field>
            <Field label="Address">
              <Input name="address" placeholder="Business address" />
            </Field>
            <Field label="PAN/VAT">
              <Input name="panVat" placeholder="Tax identification number" />
            </Field>
            <Field label="Product categories">
              <Input name="productCategories" placeholder="e.g., Electrical, Lighting, Cable" />
            </Field>
            <Field label="Payment terms">
              <Input name="paymentTerms" placeholder="e.g., Net 30, Net 60" />
            </Field>
            <Field label="Credit limit (NPR)">
              <Input name="creditLimit" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Notes">
              <Input name="notes" placeholder="Additional notes" />
            </Field>
            <Button type="submit">Add supplier</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Suppliers ({totalSuppliers})</CardTitle>
            <div className="flex gap-2">
              <Link href="/suppliers/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Supplier
                </Button>
              </Link>
              <form action="/api/suppliers/export" method="get">
                <Button type="submit" variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </form>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <form className="flex-1" action="">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                <Input 
                  name="search" 
                  placeholder="Search suppliers..." 
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </form>
          </div>

          <DataTable 
            columns={[
              "Supplier", 
              "Company", 
              "Contact", 
              "Products", 
              "Payment Terms", 
              "Credit Limit", 
              "Materials", 
              "POs",
              "Actions"
            ]}
          >
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-3 py-3">
                  <Link href={`/suppliers/${supplier.id}`} className="font-medium text-navy hover:underline">
                    {supplier.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate">{supplier.company || "-"}</td>
                <td className="px-3 py-3 text-slate">
                  {supplier.contactPerson && (
                    <div>
                      <p className="text-sm">{supplier.contactPerson}</p>
                      {supplier.phone && (
                        <p className="text-xs text-slate">{supplier.phone}</p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-slate">{supplier.productCategories || "-"}</td>
                <td className="px-3 py-3 text-slate">{supplier.paymentTerms || "-"}</td>
                <td className="px-3 py-3 text-slate">{formatNPR(supplier.creditLimit)}</td>
                <td className="px-3 py-3 text-center text-slate">{supplier._count.materials}</td>
                <td className="px-3 py-3 text-center text-slate">{supplier._count.purchaseOrders}</td>
                <td className="px-3 py-3">
                  <Link href={`/suppliers/${supplier.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>

          {suppliers.length === 0 && (
            <div className="py-8 text-center text-slate">
              No suppliers found. {search ? "Try adjusting your search." : "Add your first supplier to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}