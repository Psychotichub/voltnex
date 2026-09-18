import { Calculator, Search, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { prisma } from "@/lib/db";
import { formatNPR, money } from "@/lib/money";
import { costingSummary } from "@/lib/finance";

export default async function CostingPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || "";

  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search,  } },
          { code: { contains: search,  } },
        ],
      }),
    },
    include: {
      client: true,
      costing: true,
      expenses: {
        select: { amount: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Project Costing"
        description="Track estimated vs actual project costs, profit margins, and cost variance analysis for accurate project profitability assessment."
      />

      <div className="grid gap-5">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Project Costing Overview</CardTitle>
            <form action="/api/costing/export" method="get">
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </form>
          </div>

          {/* Search */}
          <div className="mb-4">
            <form className="flex-1" action="">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                <Input 
                  name="search" 
                  placeholder="Search projects..." 
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </form>
          </div>

          <DataTable 
            columns={[
              "Project", 
              "Code", 
              "Client", 
              "Contract Value", 
              "Estimated Cost", 
              "Actual Cost", 
              "Est. Profit", 
              "Act. Profit", 
              "Est. Margin", 
              "Act. Margin", 
              "Variance",
              "Actions"
            ]}
          >
            {projects.map((project) => {
              const summary = costingSummary({
                contractValue: project.contractValue,
                estimated: project.estimatedCost,
                actual: project.actualCost,
              });

              const actualCost = project.expenses.reduce((sum, exp) => sum.plus(exp.amount), money(project.actualCost));
              const actualProfit = money(project.contractValue).minus(actualCost);
              const actualMargin = project.contractValue.isZero() 
                ? money(0) 
                : actualProfit.dividedBy(project.contractValue).times(100);

              return (
                <tr key={project.id}>
                  <td className="px-3 py-3">
                    <Link href={`/projects/${project.id}/costing`} className="font-medium text-navy hover:underline">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate">{project.code}</td>
                  <td className="px-3 py-3 text-slate">{project.client.name}</td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(project.contractValue)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(project.estimatedCost)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(actualCost)}</td>
                  <td className="px-3 py-3 text-slate">{formatNPR(summary.estimatedProfit)}</td>
                  <td className="px-3 py-3 font-medium text-navy">{formatNPR(actualProfit)}</td>
                  <td className="px-3 py-3 text-slate">{summary.estimatedMargin}%</td>
                  <td className="px-3 py-3 text-slate">{actualMargin.toFixed(1)}%</td>
                  <td className="px-3 py-3">
                    <span className={money(summary.variance).greaterThan(0) ? "text-red-600" : "text-emerald-600"}>
                      {formatNPR(summary.variance)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/projects/${project.id}/costing`}>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </DataTable>

          {projects.length === 0 && (
            <div className="py-8 text-center text-slate">
              No projects found. {search ? "Try adjusting your search." : "Projects will appear here once created."}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}