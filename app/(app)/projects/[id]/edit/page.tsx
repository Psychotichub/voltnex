import { ClientType, ProjectStatus, ProjectWorkflow } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProject, deleteProject } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id, deletedAt: null },
    include: { client: true },
  });

  if (!project) {
    notFound();
  }

  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="mb-4">
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>
      <PageHeader title={`Edit: ${project.name}`} description="Update project details." />
      <form action={updateProject} className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <input type="hidden" name="id" value={project.id} />
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <CardTitle>Edit Project</CardTitle>
          </div>
          <div className="grid gap-4">
            <Field label="Project name *">
              <Input name="name" required defaultValue={project.name} />
            </Field>
            <Field label="Client *">
              <select name="clientId" required className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {clients.map((c) => (
                  <option key={c.id} value={c.id} selected={c.id === project.clientId}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <Input name="location" defaultValue={project.location ?? ""} />
            </Field>
            <Field label="Project type">
              <select name="projectType" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(ClientType).map((t) => (
                  <option key={t} value={t} selected={t === project.projectType}>{t.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Start date">
              <Input name="startDate" type="date" defaultValue={project.startDate ? project.startDate.toISOString().split("T")[0] : ""} />
            </Field>
            <Field label="Expected completion">
              <Input name="expectedCompletion" type="date" defaultValue={project.expectedCompletion ? project.expectedCompletion.toISOString().split("T")[0] : ""} />
            </Field>
            <Field label="Contract value (NPR)">
              <Input name="contractValue" type="number" step="0.01" defaultValue={project.contractValue.toString()} />
            </Field>
            <Field label="Estimated cost (NPR)">
              <Input name="estimatedCost" type="number" step="0.01" defaultValue={project.estimatedCost.toString()} />
            </Field>
            <Field label="Status">
              <select name="status" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(ProjectStatus).map((s) => (
                  <option key={s} value={s} selected={s === project.status}>{s.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Workflow Stage">
              <select name="workflow" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(ProjectWorkflow).map((w) => (
                  <option key={w} value={w} selected={w === project.workflow}>{w.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Notes">
              <Input name="notes" defaultValue={project.notes ?? ""} />
            </Field>
          </div>
        </Card>
        <Card className="rounded-lg border-red-600">
          <div className="mb-5 flex items-center gap-2">
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <p className="mb-4 text-sm text-slate">Delete this project permanently.</p>
          <form action={deleteProject} method="post">
            <input type="hidden" name="id" value={project.id} />
            <Button type="submit" variant="danger">Delete Project</Button>
          </form>
        </Card>
        <div className="flex justify-end gap-3 xl:col-span-2">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </>
  );
}
