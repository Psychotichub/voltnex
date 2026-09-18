import { Building2 } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AboutPage() {
  const company = await prisma.company.findFirst();

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold text-navy">About {company?.name ?? "VoltNex Engineering"}</h1>
        <p className="mt-4 text-lg text-slate">{company?.name ?? "VoltNex Engineering"} is a professional electrical engineering and contracting company based in Nepal.</p>
        <div className="mt-8 space-y-4">
          <p className="text-slate">We specialize in electrical contracting, BOQ preparation, project execution, testing, commissioning, and maintenance for commercial, industrial, hospital, hotel, and residential projects.</p>
          {company && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-semibold text-navy">Registration</p>
                <p className="text-slate">{company.registrationNo ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-semibold text-navy">VAT Number</p>
                <p className="text-slate">{company.vatNumber ?? "-"}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
