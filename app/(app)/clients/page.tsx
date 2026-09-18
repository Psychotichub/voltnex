import { ClientType } from "@prisma/client";
import { UserPlus, Search, Eye, Edit2, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/status-badge";
import { createClient, deleteClient } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string };
}) {
  const search = searchParams.search || "";
  const typeFilter = searchParams.type || "";

  const clients = await prisma.client.findMany({
    where: {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { company: { contains: search } },
          { contactPerson: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
      ...(typeFilter && { type: typeFilter as ClientType }),
    },
    include: {
      _count: {
        select: {
          projects: true,
          quotations: true,
          invoices: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalClients = await prisma.client.count({ where: { deletedAt: null } });

  return (
    <>
      <PageHeader
        title="Client Management"
        description="Manage client relationships, track projects, quotations, and invoices for residential, commercial, industrial, and institutional clients."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brass" />
            <CardTitle>Add Client</CardTitle>
          </div>
          <form action={createClient} className="grid gap-4">
            <Field label="Client name *">
              <Input name="name" required placeholder="Enter client name" />
            </Field>
            <Field label="Company">
              <Input name="company" placeholder="Company name (optional)" />
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
              <Input name="address" placeholder="Street address" />
            </Field>
            <Field label="PAN/VAT">
              <Input name="panVat" placeholder="Tax identification number" />
            </Field>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate">Client type</span>
              <select 
                name="type" 
                className="h-9 rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                {Object.values(ClientType).map((type) => (
                  <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
                ))}
              </select>
            </label>
            <Field label="Notes">
              <Input name="notes" placeholder="Additional notes" />
            </Field>
            <Button type="submit">Create client</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Client Directory ({totalClients})</CardTitle>
            <form action="/api/clients/export" method="get">
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </form>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex gap-2">
            <form className="flex-1" action="">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                <Input 
                  name="search" 
                  placeholder="Search clients..." 
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </form>
            <form className="w-48" action="">
              <select 
                name="type" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
                defaultValue={typeFilter}
              >
                <option value="">All Types</option>
                {Object.values(ClientType).map((type) => (
                  <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
                ))}
              </select>
            </form>
          </div>

          <DataTable 
            columns={[
              "Client", 
              "Company", 
              "Contact", 
              "Type", 
              "Projects", 
              "Quotations", 
              "Invoices",
              "Actions"
            ]}
          >
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-3 py-3">
                  <Link href={`/clients/${client.id}`} className="font-medium text-navy hover:underline">
                    {client.name}
                  </Link>
                  {client.email && (
                    <p className="text-xs text-slate">{client.email}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-slate">{client.company || "-"}</td>
                <td className="px-3 py-3 text-slate">
                  {client.contactPerson && (
                    <div>
                      <p className="text-sm">{client.contactPerson}</p>
                      {client.phone && (
                        <p className="text-xs text-slate">{client.phone}</p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={client.type} />
                </td>
                <td className="px-3 py-3 text-center text-slate">
                  {client._count.projects}
                </td>
                <td className="px-3 py-3 text-center text-slate">
                  {client._count.quotations}
                </td>
                <td className="px-3 py-3 text-center text-slate">
                  {client._count.invoices}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="sm" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/clients/${client.id}/edit`}>
                      <Button variant="ghost" size="sm" title="Edit client">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <form action={deleteClient}>
                      <input type="hidden" name="id" value={client.id} />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Delete client"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>

          {clients.length === 0 && (
            <div className="py-8 text-center text-slate">
              No clients found. {search || typeFilter ? "Try adjusting your search or filters." : "Add your first client to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}