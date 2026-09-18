import { ClientType, ProjectStatus, ProjectWorkflow } from "@prisma/client";
import { FolderKanban, Search, Filter, Download, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { createProject, deleteProject } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/status-badge";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; workflow?: string };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";
  const workflowFilter = searchParams.workflow || "";

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search,  } },
            { code: { contains: search,  } },
            { location: { contains: search,  } },
          ],
        }),
        ...(statusFilter && { status: statusFilter as ProjectStatus }),
        ...(workflowFilter && { workflow: workflowFilter as ProjectWorkflow }),
      },
      include: {
        client: true,
        manager: true,
        _count: {
          select: {
            invoices: true,
            quotations: true,
            drawings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalProjects = await prisma.project.count({ where: { deletedAt: null } });

  return (
    <>
      <PageHeader
        title="Project Management"
        description="Manage electrical projects from lead to handover with workflow tracking, costing, and documentation."
      />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brass" />
            <CardTitle>Create Project</CardTitle>
          </div>
          <form action={createProject} className="grid gap-4">
            <Field label="Project name *">
              <Input name="name" required placeholder="Enter project name" />
            </Field>
            <Field label="Client *">
              <select 
                name="clientId" 
                required
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <Input name="location" placeholder="Project location" />
            </Field>
            <Field label="Project type">
              <select 
                name="projectType" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                {Object.values(ClientType).map((type) => (
                  <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
                ))}
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
              <select 
                name="managerId" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                <option value="">Select manager</option>
                {/* Would populate with users who have appropriate roles */}
              </select>
            </Field>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate">Status</span>
              <select 
                name="status" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate">Workflow Stage</span>
              <select 
                name="workflow" 
                className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
              >
                {Object.values(ProjectWorkflow).map((workflow) => (
                  <option key={workflow} value={workflow}>{workflow.replaceAll("_", " ")}</option>
                ))}
              </select>
            </label>
            <Field label="Notes">
              <Input name="notes" placeholder="Project notes" />
            </Field>
            <Button type="submit">Create project</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Projects ({totalProjects})</CardTitle>
            <div className="flex gap-2">
              <Link href="/projects/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
              <form action="/api/projects/export" method="get">
                <Button type="submit" variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </form>
            </div>
          </div>

{/* Search and Filter */}
            <form className="mb-4 flex gap-2" action="/projects" method="get">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                <Input name="search" placeholder="Search projects..." defaultValue={search} className="pl-9" />
              </div>
              <select name="status" className="h-9 w-40 rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" defaultValue={statusFilter}>
                <option value="">All Status</option>
                {Object.values(ProjectStatus).map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
              </select>
              <select name="workflow" className="h-9 w-40 rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" defaultValue={workflowFilter}>
                <option value="">All Stages</option>
                {Object.values(ProjectWorkflow).map((workflow) => <option key={workflow} value={workflow}>{workflow.replaceAll("_", " ")}</option>)}
              </select>
              <Button type="submit" variant="outline" size="sm">Filter</Button>
            </form>

          <DataTable 
            columns={[
              "Project", 
              "Code", 
              "Client", 
              "Location", 
              "Status", 
              "Workflow", 
              "Contract", 
              "Progress",
              "Actions"
            ]}
          >
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-3 py-3">
                  <Link href={`/projects/${project.id}`} className="font-medium text-navy hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate">{project.code}</td>
                <td className="px-3 py-3 text-slate">{project.client.name}</td>
                <td className="px-3 py-3 text-slate">{project.location || "-"}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={project.status} />
                </td>
                <td className="px-3 py-3 text-slate">{project.workflow.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 font-medium text-navy">{formatNPR(project.contractValue)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-paper">
                      <div 
                        className="h-full bg-brass" 
                        style={{ 
                          width: `${project.status === "COMPLETED" ? 100 : 
                                project.status === "IN_PROGRESS" ? 60 : 
                                project.status === "AWARDED" ? 30 : 10}%` 
                        }} 
                      />
                    </div>
                    <span className="text-xs text-slate">
                      {project.status === "COMPLETED" ? "100%" : 
                       project.status === "IN_PROGRESS" ? "60%" : 
                       project.status === "AWARDED" ? "30%" : "10%"}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                    <Link href={`/projects/${project.id}/edit`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                    </Link>
                    <form action={deleteProject} method="post" className="inline">
                      <input type="hidden" name="id" value={project.id} />
                      <Button variant="ghost" size="sm" type="submit" className="gap-1 text-red-600 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>

          {projects.length === 0 && (
            <div className="py-8 text-center text-slate">
              No projects found. {search || statusFilter || workflowFilter ? "Try adjusting your search or filters." : "Create your first project to get started."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}