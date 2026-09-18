import { FlaskConical, Search, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createTestingChecklist } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function TestingPage() {
  const [checklists, projects] = await Promise.all([
    prisma.testingChecklist.findMany({
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

  const categories = ["Cable", "DB / Panel", "Earthing", "Lighting", "Generator", "Motor", "UPS"];

  return (
    <>
      <PageHeader
        title="Testing & Commissioning"
        description="Electrical testing checklists and commissioning reports."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-brass" />
            <CardTitle>Create Checklist</CardTitle>
          </div>
          <form action={createTestingChecklist} className="grid gap-4">
            <Field label="Project *">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select name="category" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Equipment">
              <Input name="equipment" placeholder="Equipment name" />
            </Field>
            <Field label="Test date">
              <Input name="testDate" type="date" />
            </Field>
            <Field label="Overall result">
              <select name="overallResult" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="PENDING">Pending</option>
              </select>
            </Field>
            <Button type="submit">Create checklist</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <CardTitle>Testing Checklists ({checklists.length})</CardTitle>
          <DataTable columns={["Number", "Category", "Project", "Result", "Date"]}>
            {checklists.map((cl) => (
              <tr key={cl.id}>
                <td className="px-3 py-3 text-sm text-navy">{cl.number}</td>
                <td className="px-3 py-3 text-sm text-slate">{cl.category}</td>
                <td className="px-3 py-3 text-sm text-slate">{cl.project?.name ?? "-"}</td>
                <td className="px-3 py-3">{cl.overallResult === "PASS" ? "Accepted" : cl.overallResult === "FAIL" ? "Rejected" : "Pending"}</td>
                <td className="px-3 py-3 text-sm text-slate">{cl.testDate.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {checklists.length === 0 && <div className="py-8 text-center text-slate">No checklists found.</div>}
        </Card>
      </div>
    </>
  );
}
