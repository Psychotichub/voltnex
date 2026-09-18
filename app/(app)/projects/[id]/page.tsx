import { notFound } from "next/navigation";
import { ArrowLeft, FolderKanban, FileText, Receipt, Wallet, PenTool, FlaskConical, Building2, Users, Calendar, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { updateProjectStatus, quickBoq, quickQuotationFromBoq, quickInvoice, createDrawing, createMethodStatement, createTestingChecklist } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { 
      id: params.id,
      deletedAt: null,
    },
    include: {
      client: true,
      manager: true,
      members: {
        include: {
          user: true,
        },
      },
      boqs: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { items: true },
      },
      quotations: {
        orderBy: { date: "desc" },
        take: 3,
        include: {
          items: true,
        },
      },
      invoices: {
        orderBy: { date: "desc" },
        take: 3,
        include: {
          items: true,
          payments: true,
        },
      },
      drawings: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      methodStatements: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      checklists: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      expenses: {
        orderBy: { date: "desc" },
        take: 5,
      },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      costing: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Calculate project metrics
  const profitMargin = project.contractValue.isZero() 
    ? 0 
    : money(project.actualProfit).dividedBy(project.contractValue).times(100).toNumber();
  
  const costEfficiency = project.estimatedCost.isZero()
    ? 0
    : money(project.actualCost).dividedBy(project.estimatedCost).times(100).toNumber();

  const outstandingInvoices = project.invoices.reduce((sum, invoice) => {
    const total = money(invoice.items.reduce((itemSum, item) => itemSum.plus(item.quantity.times(item.rate)), money(0)));
    const paid = invoice.payments.reduce((paymentSum, payment) => paymentSum.plus(payment.amount), money(0));
    return sum.plus(total.minus(paid));
  }, money(0));

  const totalExpenses = project.expenses.reduce((sum, expense) => sum.plus(expense.amount), money(0));

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

      <PageHeader
        title={project.name}
        description={`${project.code} • ${project.client.name} • ${project.location || "No location specified"}`}
      />

      <div className="grid gap-5">
        {/* Project Information Card */}
        <Card className="rounded-lg">
          <CardTitle>Project Overview</CardTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Project Code</p>
              <p className="text-sm text-navy">{project.code}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Client</p>
              <p className="text-sm text-navy">{project.client.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Location</p>
              <p className="text-sm text-navy">{project.location || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Project Type</p>
              <StatusBadge value={project.projectType} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Start Date</p>
              <p className="text-sm text-navy">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Expected Completion</p>
              <p className="text-sm text-navy">{project.expectedCompletion ? new Date(project.expectedCompletion).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Actual Completion</p>
              <p className="text-sm text-navy">{project.actualCompletion ? new Date(project.actualCompletion).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Project Manager</p>
              <p className="text-sm text-navy">{project.manager?.name || "-"}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <form action={updateProjectStatus}>
              <input type="hidden" name="id" value={project.id} />
              <div className="flex gap-2">
                <select name="status" className="h-9 rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                  {["PLANNING", "QUOTATION", "AWARDED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"].map((status) => (
                    <option key={status} value={status} selected={project.status === status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <select name="workflow" className="h-9 rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                  {["LEAD", "SITE_SURVEY", "ESTIMATION", "BOQ", "QUOTATION", "CLIENT_APPROVAL", "CONTRACT", "PROJECT_PLANNING", "PROCUREMENT", "INSTALLATION", "INSPECTION", "TESTING", "COMMISSIONING", "HANDOVER", "INVOICE", "PAYMENT", "WARRANTY"].map((workflow) => (
                    <option key={workflow} value={workflow} selected={project.workflow === workflow}>
                      {workflow.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm">Update Status</Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Contract Value</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{formatNPR(project.contractValue)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-brass" />
            </div>
          </Card>
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Actual Cost</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{formatNPR(project.actualCost)}</p>
              </div>
              <Wallet className="h-5 w-5 text-brass" />
            </div>
          </Card>
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Actual Profit</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{formatNPR(project.actualProfit)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-brass" />
            </div>
          </Card>
          <Card className="rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Profit Margin</p>
                <p className="mt-2 font-display text-2xl font-semibold text-navy">{profitMargin.toFixed(1)}%</p>
              </div>
              <DollarSign className="h-5 w-5 text-brass" />
            </div>
          </Card>
        </div>

        {/* Project Tabs */}
        <Card className="rounded-lg">
          <CardTitle>Project Details</CardTitle>
          <div className="mt-4">
            <div className="flex gap-4 border-b border-line pb-2 mb-4">
              <Link href={`/projects/${project.id}`} className="text-sm font-medium text-brass border-b-2 border-brass pb-2">
                Overview
              </Link>
              <div className="flex items-center gap-1">
                <Link href={`/projects/${project.id}/boq`} className="text-sm text-slate hover:text-navy pb-2">BOQ ({project.boqs.length})</Link>
                <form action={quickBoq} method="post" className="inline">
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/projects/${project.id}/quotations`} className="text-sm text-slate hover:text-navy pb-2">Quotations ({project.quotations.length})</Link>
                <form action={quickQuotationFromBoq} method="post" className="inline">
                  <input type="hidden" name="boqId" value={project.boqs[0]?.id ?? ""} />
                  <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/projects/${project.id}/invoices`} className="text-sm text-slate hover:text-navy pb-2">Invoices ({project.invoices.length})</Link>
                <form action={quickInvoice} method="post" className="inline">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="clientId" value={project.clientId} />
                  <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/projects/${project.id}/drawings`} className="text-sm text-slate hover:text-navy pb-2">Drawings ({project.drawings.length})</Link>
                <form action={createDrawing} method="post" className="inline">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="title" value="New drawing" />
                  <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/projects/${project.id}/method-statements`} className="text-sm text-slate hover:text-navy pb-2">Method Statements ({project.methodStatements.length})</Link>
                <form action={createMethodStatement} method="post" className="inline">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="title" value="New method statement" />
                  <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/projects/${project.id}/testing`} className="text-sm text-slate hover:text-navy pb-2">Testing ({project.checklists.length})</Link>
                <form action={createTestingChecklist} method="post" className="inline">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="category" value="PRE-INSTALLATION" />
                  <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </div>
              <Link href={`/projects/${project.id}/documents`} className="text-sm text-slate hover:text-navy pb-2">
                Documents ({project.documents.length})
              </Link>
            </div>

            {/* Overview Content */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent BOQs */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy">Recent BOQs</h3>
                {project.boqs.length > 0 ? (
                  <DataTable columns={["Number", "Title", "Items"]}>
                    {project.boqs.map((boq) => (
                      <tr key={boq.id}>
                        <td className="px-3 py-2 text-sm text-navy">{boq.number}</td>
                        <td className="px-3 py-2 text-sm text-slate">{boq.title}</td>
                        <td className="px-3 py-2 text-sm text-slate text-center">{boq.items.length}</td>
                      </tr>
                    ))}
                  </DataTable>
                ) : (
                  <p className="text-sm text-slate">No BOQs yet</p>
                )}
              </div>

              {/* Recent Quotations */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy">Recent Quotations</h3>
                {project.quotations.length > 0 ? (
                  <DataTable columns={["Number", "Date", "Status", "Total"]}>
                    {project.quotations.map((quotation) => {
                      const total = quotation.items.reduce((sum, item) => sum.plus(item.quantity.times(item.rate)), money(0));
                      return (
                        <tr key={quotation.id}>
                          <td className="px-3 py-2 text-sm text-navy">{quotation.number}</td>
                          <td className="px-3 py-2 text-sm text-slate">{new Date(quotation.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2">
                            <StatusBadge value={quotation.status} />
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-navy">{formatNPR(total)}</td>
                        </tr>
                      );
                    })}
                  </DataTable>
                ) : (
                  <p className="text-sm text-slate">No quotations yet</p>
                )}
              </div>

              {/* Recent Invoices */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy">Recent Invoices</h3>
                {project.invoices.length > 0 ? (
                  <DataTable columns={["Number", "Date", "Status", "Total"]}>
                    {project.invoices.map((invoice) => {
                      const total = invoice.items.reduce((sum, item) => sum.plus(item.quantity.times(item.rate)), money(0));
                      return (
                        <tr key={invoice.id}>
                          <td className="px-3 py-2 text-sm text-navy">{invoice.number}</td>
                          <td className="px-3 py-2 text-sm text-slate">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2">
                            <StatusBadge value={invoice.status} />
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-navy">{formatNPR(total)}</td>
                        </tr>
                      );
                    })}
                  </DataTable>
                ) : (
                  <p className="text-sm text-slate">No invoices yet</p>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy">Project Team</h3>
                {project.members.length > 0 ? (
                  <DataTable columns={["Name", "Role"]}>
                    {project.members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-3 py-2 text-sm text-navy">{member.user.name}</td>
                        <td className="px-3 py-2 text-sm text-slate">{member.role || "Team Member"}</td>
                      </tr>
                    ))}
                  </DataTable>
                ) : (
                  <p className="text-sm text-slate">No team members assigned</p>
                )}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-semibold text-navy">Recent Expenses</h3>
              {project.expenses.length > 0 ? (
                <DataTable columns={["Date", "Category", "Description", "Amount"]}>
                  {project.expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-3 py-2 text-sm text-slate">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-sm text-slate">{expense.category}</td>
                      <td className="px-3 py-2 text-sm text-slate">{expense.description}</td>
                      <td className="px-3 py-2 text-sm font-medium text-navy">{formatNPR(expense.amount)}</td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <p className="text-sm text-slate">No expenses recorded yet</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}