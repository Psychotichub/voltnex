import { ClientType, ProjectStatus, ProjectWorkflow } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export default async function NewProjectPage() {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="mb-4">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
      <PageHeader title="New Project" description="Create a new electrical project." />
      <form action={createProject} className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <CardTitle>Project Details</CardTitle>
          </div>
          <div className="grid gap-4">
            <Field label="Project name *">
              <Input name="name" required placeholder="Enter project name" />
            </Field>
            <Field label="Client *">
              <select name="clientId" required className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <Input name="location" placeholder="Project location" />
            </Field>
            <Field label="Project type">
              <select name="projectType" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(ClientType).map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
              </select>
            </Field>
            <Field label="Start date">
              <Input name="startDate" type="date" />
            </Field>
            <Field label="Expected completion">
              <Input name="expectedCompletion" type="date" />
            </Field>
            <Field label="Contract value (NPR)">
              <Input name="contractValue" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Estimated cost (NPR)">
              <Input name="estimatedCost" type="number" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Project manager">
              <select name="managerId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select manager</option>
              </select>
            </Field>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate">Status</span>
              <select name="status" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(ProjectStatus).map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate">Workflow Stage</span>
              <select name="workflow" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(ProjectWorkflow).map((w) => <option key={w} value={w}>{w.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <Field label="Notes">
              <Input name="notes" placeholder="Project notes" />
            </Field>
          </div>
        </Card>
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <CardTitle>Quick Links</CardTitle>
          </div>
          <div className="space-y-3">
            <Link href="/boq" className="block rounded-md border border-line bg-paper px-4 py-3 text-sm text-navy hover:bg-white">
              <p className="font-semibold">Add BOQ</p>
              <p className="text-xs text-slate">Create a Bill of Quantities after project creation</p>
            </Link>
            <Link href="/quotations" className="block rounded-md border border-line bg-paper px-4 py-3 text-sm text-navy hover:bg-white">
              <p className="font-semibold">Add Quotation</p>
              <p className="text-xs text-slate">Generate quotation from BOQ</p>
            </Link>
            <Link href="/invoices" className="block rounded-md border border-line bg-paper px-4 py-3 text-sm text-navy hover:bg-white">
              <p className="font-semibold">Add Invoice</p>
              <p className="text-xs text-slate">Create invoice linked to project</p>
            </Link>
          </div>
        </Card>
        <div className="flex justify-end gap-3 xl:col-span-2">
          <Link href="/projects">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </>
  );
}
