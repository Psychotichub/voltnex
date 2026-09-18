import { HardHat, Search, Download, Plus, Users } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createLabourRate } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";

export default async function LabourPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab || "categories";

  const [categories, rates, employees] = await Promise.all([
    prisma.labourCategory.findMany({
      include: {
        _count: {
          select: {
            rates: true,
            employees: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.labourRate.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.employee.findMany({
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Labour Management"
        description="Manage labour categories, rates, employees, and project-specific labour costs for accurate project estimation."
      />

      <div className="grid gap-5">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-line pb-2">
          <Link 
            href="/labour?tab=categories" 
            className={`text-sm font-medium pb-2 ${tab === "categories" ? "text-brass border-b-2 border-brass" : "text-slate hover:text-navy"}`}
          >
            Categories ({categories.length})
          </Link>
          <Link 
            href="/labour?tab=rates" 
            className={`text-sm font-medium pb-2 ${tab === "rates" ? "text-brass border-b-2 border-brass" : "text-slate hover:text-navy"}`}
          >
            Rates ({rates.length})
          </Link>
          <Link 
            href="/labour?tab=employees" 
            className={`text-sm font-medium pb-2 ${tab === "employees" ? "text-brass border-b-2 border-brass" : "text-slate hover:text-navy"}`}
          >
            Employees ({employees.length})
          </Link>
        </div>

        {tab === "categories" && (
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <Card className="rounded-lg">
              <div className="mb-5 flex items-center gap-2">
                <HardHat className="h-5 w-5 text-brass" />
                <CardTitle>Add Labour Category</CardTitle>
              </div>
              <form action={createLabourRate} className="grid gap-4">
                <Field label="Category name *">
                  <Input name="name" required placeholder="e.g., Electrician" />
                </Field>
                <Field label="Project (optional)">
                  <select 
                    name="projectId" 
                    className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm"
                  >
                    <option value="">Default rates (all projects)</option>
                    {/* Would populate with active projects */}
                  </select>
                </Field>
                <Field label="Daily rate (NPR)">
                  <Input name="dailyRate" type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Hourly rate (NPR)">
                  <Input name="hourlyRate" type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Overtime rate (NPR)">
                  <Input name="overtimeRate" type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Transport allowance (NPR)">
                  <Input name="transportAllow" type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Accommodation (NPR)">
                  <Input name="accommodation" type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Notes">
                  <Input name="notes" placeholder="Additional notes" />
                </Field>
                <Button type="submit">Add category/rate</Button>
              </form>
            </Card>

            <Card className="rounded-lg">
              <div className="mb-5 flex items-center justify-between">
                <CardTitle>Labour Categories</CardTitle>
                <form action="/api/labour/export" method="get">
                  <Button type="submit" variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </form>
              </div>

              <DataTable 
                columns={[
                  "Category", 
                  "Rates", 
                  "Employees", 
                  "Latest Daily Rate", 
                  "Actions"
                ]}
              >
                {categories.map((category) => {
                  const latestRate = rates.find(r => r.categoryId === category.id);
                  return (
                    <tr key={category.id}>
                      <td className="px-3 py-3 font-medium text-navy">{category.name}</td>
                      <td className="px-3 py-3 text-center text-slate">{category._count.rates}</td>
                      <td className="px-3 py-3 text-center text-slate">{category._count.employees}</td>
                      <td className="px-3 py-3 text-slate">
                        {latestRate ? formatNPR(latestRate.dailyRate) : "-"}
                      </td>
                      <td className="px-3 py-3">
                        <Button variant="ghost" size="sm">View Rates</Button>
                      </td>
                    </tr>
                  );
                })}
              </DataTable>

              {categories.length === 0 && (
                <div className="py-8 text-center text-slate">
                  No labour categories yet. Add your first category to get started.
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "rates" && (
          <Card className="rounded-lg">
            <div className="mb-5 flex items-center justify-between">
              <CardTitle>Labour Rates History</CardTitle>
              <form action="/api/labour/export" method="get">
                <Button type="submit" variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </form>
            </div>

            <DataTable 
              columns={[
                "Category", 
                "Project", 
                "Daily Rate", 
                "Hourly Rate", 
                "Overtime Rate", 
                "Transport", 
                "Accommodation", 
                "Effective Date"
              ]}
            >
              {rates.map((rate) => (
                <tr key={rate.id}>
                  <td className="px-3 py-3 font-medium text-navy">{rate.category.name}</td>
                  <td className="px-3 py-3 text-slate">Default (all projects)</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(rate.dailyRate)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(rate.hourlyRate)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(rate.overtimeRate)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(rate.transportAllow)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(rate.accommodation)}</td>
                  <td className="px-3 py-3 text-slate">{new Date(rate.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </DataTable>

            {rates.length === 0 && (
              <div className="py-8 text-center text-slate">
                No labour rates recorded yet.
              </div>
            )}
          </Card>
        )}

        {tab === "employees" && (
          <Card className="rounded-lg">
            <div className="mb-5 flex items-center justify-between">
              <CardTitle>Employees</CardTitle>
              <div className="flex gap-2">
                <Link href="/labour/employees/new">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </Link>
                <form action="/api/labour/export" method="get">
                  <Button type="submit" variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </form>
              </div>
            </div>

            <DataTable 
              columns={[
                "Name", 
                "Category", 
                "Phone", 
                "Email", 
                "Daily Rate", 
                "Status", 
                "Actions"
              ]}
            >
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-3 py-3 font-medium text-navy">{employee.name}</td>
                  <td className="px-3 py-3 text-slate">{employee.category?.name || "-"}</td>
                  <td className="px-3 py-3 text-slate">{employee.phone || "-"}</td>
                  <td className="px-3 py-3 text-slate">{employee.email || "-"}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(employee.dailyRate)}</td>
                  <td className="px-3 py-3">
                    {employee.isActive ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </DataTable>

            {employees.length === 0 && (
              <div className="py-8 text-center text-slate">
                No employees recorded yet. Add your first employee to get started.
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}