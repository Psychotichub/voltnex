import { FileText, Search, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createMethodStatement } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { DocumentStatus } from "@prisma/client";

export default async function MethodStatementsPage() {
  const [statements, projects] = await Promise.all([
    prisma.methodStatement.findMany({
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
        title="Method Statements"
        description="Reusable method statement templates for electrical work procedures."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brass" />
            <CardTitle>Create Method Statement</CardTitle>
          </div>
          <form action={createMethodStatement} className="grid gap-4">
            <Field label="Project *">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Title *">
              <Input name="title" required placeholder="Method statement title" />
            </Field>
            <Field label="Status">
              <select name="status" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="DRAFT">Draft</option>
                <option value="FOR_REVIEW">For Review</option>
                <option value="APPROVED">Approved</option>
              </select>
            </Field>
            <Field label="Purpose">
              <Input name="purpose" placeholder="Purpose" />
            </Field>
            <Button type="submit">Create</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <CardTitle>Method Statements ({statements.length})</CardTitle>
          <DataTable columns={["Number", "Title", "Project", "Status", "Date"]}>
            {statements.map((ms) => (
              <tr key={ms.id}>
                <td className="px-3 py-3 text-sm text-navy">{ms.number}</td>
                <td className="px-3 py-3 text-sm text-slate">{ms.title}</td>
                <td className="px-3 py-3 text-sm text-slate">{ms.project?.name ?? "-"}</td>
                <td className="px-3 py-3">{ms.status.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-sm text-slate">{ms.createdAt.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {statements.length === 0 && <div className="py-8 text-center text-slate">No method statements found.</div>}
        </Card>
      </div>
    </>
  );
}
