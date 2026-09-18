import { ClipboardList, Search, Download, Plus, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { PercentInput } from "@/components/inputs/percent-input";
import { createBoq, importBoqFromExcel } from "@/lib/actions";
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

export default async function BoqPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || "";

  const [boqs, projects] = await Promise.all([
    prisma.boq.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { number: { contains: search } },
            { title: { contains: search } },
          ],
        }),
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        items: true,
        _count: {
          select: {
            items: true,
            quotations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { deletedAt: null, status: { in: ["PLANNING", "QUOTATION", "AWARDED", "IN_PROGRESS"] } },
      include: {
        client: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalBoqs = await prisma.boq.count({ where: { deletedAt: null } });

  return (
    <>
      <PageHeader
        title="BOQ Management"
        description="Create and manage Bills of Quantities with detailed item breakdowns, material/labor/equipment rates, and professional cost calculations."
      />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brass" />
            <CardTitle>Create BOQ</CardTitle>
          </div>
          <form action={async (formData: FormData) => {
            await createBoq(formData);
          }} className="grid gap-4">
            <Field label="Project *">
              <select 
                name="projectId" 
                required
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name} ({project.client.name})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="BOQ title *">
              <Input name="title" required placeholder="e.g., Electrical Works BOQ" defaultValue="Electrical BOQ" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Overhead %">
                <PercentInput name="overheadPct" defaultValue={10} />
              </Field>
              <Field label="Contingency %">
                <PercentInput name="contingencyPct" defaultValue={5} />
              </Field>
              <Field label="Profit %">
                <PercentInput name="profitPct" defaultValue={12} />
              </Field>
              <Field label="Discount">
                <PercentInput name="discount" defaultValue={0} />
              </Field>
            </div>
            <Field label="VAT %">
              <PercentInput name="vatPct" defaultValue={13} />
            </Field>
            <Field label="Notes">
              <Input name="notes" placeholder="Additional notes" />
            </Field>
            <Button type="submit">Create BOQ</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>BOQ Directory ({totalBoqs})</CardTitle>
            <div className="flex gap-2">
              <Link href="/boq/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New BOQ
                </Button>
              </Link>
              <form action="/api/boq/import" method="post" encType="multipart/form-data">
                <Button type="submit" variant="outline" size="sm" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import Excel
                </Button>
              </form>
              <form action="/api/boq/export" method="get">
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
                  placeholder="Search BOQs..." 
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </form>
          </div>

          <DataTable 
            columns={[
              "BOQ Number", 
              "Title", 
              "Project", 
              "Client", 
              "Items", 
              "Quotations", 
              "Overhead", 
              "Profit", 
              "Actions"
            ]}
          >
            {boqs.map((boq) => {
              const summary = summarizeBoq({
                items: boq.items,
                overheadPct: boq.overheadPct,
                contingencyPct: boq.contingencyPct,
                profitPct: boq.profitPct,
                discount: boq.discount,
                vatPct: boq.vatPct,
              });
              return (
                <tr key={boq.id}>
                  <td className="px-3 py-3 font-medium text-navy">{boq.number}</td>
                  <td className="px-3 py-3">
                    <Link href={`/boq/${boq.id}`} className="font-medium text-navy hover:underline">
                      {boq.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate">
                    <div>
                      <p className="text-sm">{boq.project.code}</p>
                      <p className="text-xs text-slate">{boq.project.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate">{boq.project.client.name}</td>
                  <td className="px-3 py-3 text-center text-slate">{boq._count.items}</td>
                  <td className="px-3 py-3 text-center text-slate">{boq._count.quotations}</td>
                  <td className="px-3 py-3 text-slate">{boq.overheadPct.toString()}%</td>
                  <td className="px-3 py-3 text-slate">{boq.profitPct.toString()}%</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/boq/${boq.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <Link href={`/boq/${boq.id}/quotations`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <FileSpreadsheet className="h-3 w-3" />
                          Quote
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>

          {boqs.length === 0 && (
            <div className="py-8 text-center text-slate">
              No BOQs found. {search ? "Try adjusting your search." : "Create your first BOQ to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}