import { Factory, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function IndustriesPage() {
  const company = await prisma.company.findFirst();

  const industries = [
    { name: "Commercial", icon: Factory },
    { name: "Industrial", icon: Factory },
    { name: "Hospital", icon: GraduationCap },
    { name: "Hotel", icon: Factory },
    { name: "School", icon: GraduationCap },
    { name: "Government", icon: Factory },
    { name: "Residential", icon: Factory },
    { name: "Developer", icon: Factory },
    { name: "Contractor", icon: Factory },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold text-navy">Industries</h1>
        <p className="mt-4 text-lg text-slate">{company?.name ?? "VoltNex Engineering"} serves diverse industries across Nepal.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div key={industry.name} className="rounded-lg border border-line bg-white p-5">
                <Icon className="h-8 w-8 text-brass" />
                <h3 className="mt-3 font-display text-xl font-semibold text-navy">{industry.name}</h3>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
