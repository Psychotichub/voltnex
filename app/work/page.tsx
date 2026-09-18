import { Briefcase } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function WorkPage() {
  const [projects] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, code: true, name: true, location: true, projectType: true, status: true },
    }),
  ]);

  const industries = ["Residential", "Commercial", "Industrial", "Hospital", "Hotel", "School", "Government"];

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold text-navy">Our Projects</h1>
        <p className="mt-4 text-lg text-slate">Recent projects across various industries.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="rounded-lg border border-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brass">{project.code}</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-navy">{project.name}</h3>
              <p className="mt-2 text-sm text-slate">{project.location} / {project.projectType.replaceAll("_", " ")}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-navy">{project.status.replaceAll("_", " ")}</p>
            </article>
          ))}
        </div>
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-navy">Industries We Serve</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {industries.map((industry) => (
              <span key={industry} className="rounded-full bg-navy px-3 py-1 text-xs text-paper">{industry}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
