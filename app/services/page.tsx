import { Building2, Wrench, Zap, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | VoltNex Engineering",
  description:
    "Comprehensive electrical engineering services: contracting, BOQ, project execution, testing, commissioning, and maintenance for commercial, industrial, and residential projects in Nepal.",
  openGraph: {
    title: "Our Services | VoltNex Engineering",
    description: "Professional electrical contracting and engineering services in Nepal.",
    type: "website",
  },
};

const services = [
  { title: "Electrical Contracting", icon: Wrench, desc: "Full-scope electrical contracting for commercial, industrial, and residential projects." },
  { title: "BOQ Preparation", icon: ShieldCheck, desc: "Accurate Bill of Quantities preparation for estimation and procurement." },
  { title: "Project Execution", icon: Building2, desc: "End-to-end project management from mobilization to handover." },
  { title: "Testing & Commissioning", icon: Zap, desc: "Rigorous testing and commissioning services to ensure system reliability." },
  { title: "Solar & Renewable", icon: Zap, desc: "Solar PV system design, installation, and grid integration." },
  { title: "Generator & ATS", icon: ShieldCheck, desc: "Generator installation, automatic transfer switch, and backup power systems." },
  { title: "UPS & Power Backup", icon: Zap, desc: "Uninterruptible power supply design and installation for critical loads." },
  { title: "Fire Alarm Systems", icon: ShieldCheck, desc: "Fire detection and alarm system design, installation, and maintenance." },
  { title: "CCTV & Security", icon: Building2, desc: "Complete CCTV surveillance and security system solutions." },
  { title: "Earthing & Lightning", icon: ShieldCheck, desc: "Professional earthing and lightning protection system design." },
];

export default async function ServicesPage() {
  const company = await prisma.company.findFirst();

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">Our Capabilities</p>
          <h1 className="font-display text-4xl font-semibold text-navy">Services by {company?.name ?? "VoltNex Engineering"}</h1>
          <p className="mt-4 text-lg text-slate">End-to-end electrical engineering services for every sector.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.title} className="rounded-lg border border-line bg-white p-6 shadow-sm">
              <s.icon className="h-8 w-8 text-brass" />
              <h2 className="mt-4 font-display text-lg font-semibold text-navy">{s.title}</h2>
              <p className="mt-2 text-sm text-slate">{s.desc}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
