import { BookOpen, Search, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { addStandard } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function StandardsPage() {
  const [standards] = await Promise.all([
    prisma.standardDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const categories = [
    "Nepal Electrical Standards",
    "Building Regulations",
    "IEC",
    "NEC",
    "IEEE",
    "Manufacturer Manuals",
    "Project Specifications",
  ];

  return (
    <>
      <PageHeader
        title="Standards / Reference Library"
        description="Electrical standards and reference documents."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brass" />
            <CardTitle>Add Standard</CardTitle>
          </div>
          <form action={addStandard} className="grid gap-4">
            <Field label="Standard name *">
              <Input name="name" required placeholder="Standard name" />
            </Field>
            <Field label="Standard number">
              <Input name="number" placeholder="Standard number" />
            </Field>
            <Field label="Edition">
              <Input name="edition" placeholder="Edition" />
            </Field>
            <Field label="Category">
              <select name="category" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <Input name="description" placeholder="Description" />
            </Field>
            <Button type="submit">Add standard</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <CardTitle>Standards ({standards.length})</CardTitle>
          <DataTable columns={["Name", "Number", "Category", "Date"]}>
            {standards.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-3 text-sm text-navy">{s.name}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.number ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.category}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.createdAt.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {standards.length === 0 && <div className="py-8 text-center text-slate">No standards found.</div>}
        </Card>
      </div>
    </>
  );
}
