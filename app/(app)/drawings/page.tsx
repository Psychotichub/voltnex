import { PenTool, Search, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createDrawing } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function DrawingsPage() {
  const [drawings, projects] = await Promise.all([
    prisma.drawing.findMany({
      where: { deletedAt: null },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Drawing Management"
        description="Manage electrical drawings including SLD, layouts, and schematics."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <PenTool className="h-5 w-5 text-brass" />
            <CardTitle>Create Drawing</CardTitle>
          </div>
          <form action={createDrawing} className="grid gap-4">
            <Field label="Project *">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Title *">
              <Input name="title" required placeholder="Drawing title" />
            </Field>
            <Field label="Discipline">
              <select name="discipline" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select</option>
                <option value="Power">Power</option>
                <option value="Lighting">Lighting</option>
                <option value="Communication">Communication</option>
                <option value="Fire Alarm">Fire Alarm</option>
                <option value="CCTV">CCTV</option>
                <option value="BMS">BMS</option>
                <option value="Solar">Solar</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Status">
              <select name="status" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="DRAFT">Draft</option>
                <option value="FOR_REVIEW">For Review</option>
                <option value="APPROVED">Approved</option>
                <option value="AS_BUILT">As Built</option>
                <option value="SUPERSEDED">Superseded</option>
              </select>
            </Field>
            <Field label="Prepared by">
              <Input name="preparedBy" placeholder="Prepared by" />
            </Field>
            <Button type="submit">Create drawing</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Drawings ({drawings.length})</CardTitle>
            <Link href="/drawings">
              <Button variant="outline" size="sm">Export</Button>
            </Link>
          </div>
          <DataTable columns={["Number", "Title", "Project", "Discipline", "Status", "Date"]}>
            {drawings.map((drawing) => (
              <tr key={drawing.id}>
                <td className="px-3 py-3 text-sm text-navy">{drawing.number}</td>
                <td className="px-3 py-3 text-sm text-slate">{drawing.title}</td>
                <td className="px-3 py-3 text-sm text-slate">{drawing.project?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{drawing.discipline ?? "-"}</td>
                <td className="px-3 py-3">{drawing.status.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-sm text-slate">{drawing.date.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {drawings.length === 0 && <div className="py-8 text-center text-slate">No drawings found.</div>}
        </Card>
      </div>
    </>
  );
}
