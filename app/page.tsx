import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, Factory, ShieldCheck, Zap } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

const services = [
  "Electrical Contracting",
  "Industrial Electrical",
  "Panel Installation",
  "Generator & ATS",
  "UPS",
  "Solar",
  "Earthing",
  "Fire Alarm",
  "CCTV",
  "Testing & Commissioning",
];

export default async function Home() {
  const company = await prisma.company.findFirst();
  const projects = await prisma.project.findMany({
    orderBy: { contractValue: "desc" },
    select: { code: true, name: true, location: true, projectType: true, status: true },
    take: 3,
  });

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <PublicHeader />
      <main>
        <section className="bg-navy text-paper">
          <div className="mx-auto grid min-h-[620px] max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brass">
                Nepal electrical engineering contractor
              </p>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-6xl">
                {company?.name ?? "VoltNex Engineering Pvt. Ltd."}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-paper/72">
                Design-aware electrical contracting, BOQ preparation, project execution, testing, commissioning, and maintenance for commercial, industrial, hospital, hotel, and residential projects.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="brass" size="lg">
                  <Link href="/contact">
                    Request quotation <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 bg-transparent text-paper hover:bg-white/10">
                  <Link href="/login">Staff ERP login</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Active ERP modules", "24", ClipboardCheck],
                ["Default currency", "NPR", Building2],
                ["Target sectors", "9", Factory],
                ["Controlled access", "RBAC", ShieldCheck],
              ].map(([label, value, Icon]) => (
                <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                  <Icon className="h-5 w-5 text-brass" />
                  <p className="mt-6 font-display text-3xl font-semibold">{value as string}</p>
                  <p className="mt-1 text-sm text-paper/64">{label as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">Services</p>
              <h2 className="font-display text-2xl font-semibold text-navy">Electrical contracting capability</h2>
            </div>
            <Zap className="hidden h-8 w-8 text-brass sm:block" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((service) => (
              <div key={service} className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-navy shadow-sm">
                {service}
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">Project references</p>
              <h2 className="font-display text-2xl font-semibold text-navy">Demo portfolio from the ERP</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {projects.map((project) => (
                <article key={project.code} className="rounded-lg border border-line bg-paper p-5">
                  <p className="text-xs font-semibold text-brass">{project.code}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-navy">{project.name}</h3>
                  <p className="mt-2 text-sm text-slate">
                    {project.location} / {project.projectType.replaceAll("_", " ")}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-navy">
                    {project.status.replaceAll("_", " ")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
