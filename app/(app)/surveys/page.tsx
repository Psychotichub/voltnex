import { MapPinned, Search, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createSurvey } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function SurveysPage() {
  const [surveys, projects] = await Promise.all([
    prisma.siteSurvey.findMany({
      where: { deletedAt: null },
      include: { project: true, client: true },
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
        title="Site Surveys"
        description="Manage site surveys for incoming supply, voltage, and system assessment."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-brass" />
            <CardTitle>Create Survey</CardTitle>
          </div>
          <form action={createSurvey} className="grid gap-4">
            <Field label="Project *">
              <select name="projectId" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <Input name="location" placeholder="Survey location" />
            </Field>
            <Field label="Incoming supply">
              <select name="incomingSupply" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select</option>
                <option value="Overhead">Overhead</option>
                <option value="Underground">Underground</option>
              </select>
            </Field>
            <Field label="Voltage">
              <select name="voltage" className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                <option value="">Select</option>
                <option value="11kV">11kV</option>
                <option value="33kV">33kV</option>
                <option value="415V">415V</option>
                <option value="230V">230V</option>
              </select>
            </Field>
            <Field label="Measurements">
              <Input name="measurements" placeholder="Measurements" />
            </Field>
            <Button type="submit">Create survey</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <CardTitle>Site Surveys ({surveys.length})</CardTitle>
          <DataTable columns={["Project", "Client", "Voltage", "Location", "Date"]}>
            {surveys.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-3 text-sm text-navy">{s.project?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.client?.name ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.voltage ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.location ?? "-"}</td>
                <td className="px-3 py-3 text-sm text-slate">{s.surveyDate.toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </DataTable>
          {surveys.length === 0 && <div className="py-8 text-center text-slate">No surveys found.</div>}
        </Card>
      </div>
    </>
  );
}
