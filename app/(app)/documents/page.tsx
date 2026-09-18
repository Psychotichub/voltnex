import { Files, Search, Download } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createDocument } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function DocumentsPage() {
  const [documents, projects, totalDocuments] = await Promise.all([
    prisma.document.findMany({
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
    prisma.document.count({ where: { deletedAt: null } }),
  ]);

  return (
    <>
      <PageHeader
        title="Document Management"
        description="Project documents repository for contracts, BOQs, drawings, and more."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Files className="h-5 w-5 text-brass" />
            <CardTitle>Upload Document</CardTitle>
          </div>
          <form action={createDocument} className="grid gap-4">
            <Field label="Project">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Folder">
              <select name="folder" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="01 Contract">01 Contract</option>
                <option value="02 BOQ">02 BOQ</option>
                <option value="03 Quotations">03 Quotations</option>
                <option value="04 Drawings">04 Drawings</option>
                <option value="05 Submittals">05 Submittals</option>
                <option value="06 Method Statements">06 Method Statements</option>
                <option value="07 Risk Assessments">07 Risk Assessments</option>
                <option value="08 Inspection">08 Inspection</option>
                <option value="09 Testing">09 Testing</option>
                <option value="10 Commissioning">10 Commissioning</option>
                <option value="11 Invoices">11 Invoices</option>
                <option value="12 Payments">12 Payments</option>
                <option value="13 Completion">13 Completion</option>
                <option value="14 As-Built">14 As-Built</option>
              </select>
            </Field>
            <Field label="Title *">
              <Input name="title" required placeholder="Document title" />
            </Field>
            <Field label="File">
              <Input name="file" type="file" required />
            </Field>
            <Button type="submit">Upload</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Documents ({totalDocuments})</CardTitle>
            <Link href="/documents">
              <Button variant="outline" size="sm">Export</Button>
            </Link>
          </div>
          <DataTable columns={["Title", "Project", "Folder", "Type", "Date", "Actions"]}>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-3 py-3 text-sm text-navy">{doc.title}</td>
                <td className="px-3 py-3 text-sm text-slate">{doc.project?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{doc.folder}</td>
                <td className="px-3 py-3 text-sm text-slate">{doc.mimeType ?? "File"}</td>
                <td className="px-3 py-3 text-sm text-slate">{doc.createdAt.toISOString().split("T")[0]}</td>
                <td className="px-3 py-3 text-sm"><Link href={doc.filePath} className="text-brass underline">Download</Link></td>
              </tr>
            ))}
          </DataTable>
          {documents.length === 0 && <div className="py-8 text-center text-slate">No documents found.</div>}
        </Card>
      </div>
    </>
  );
}
