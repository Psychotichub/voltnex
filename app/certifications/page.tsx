import { Award } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function CertificationsPage() {
  const company = await prisma.company.findFirst();

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold text-navy">Certifications</h1>
        <p className="mt-4 text-lg text-slate">{company?.name ?? "VoltNex Engineering"} holds professional certifications and accreditations.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Nepal Electrical Worker License", desc: "Registered electrical contractor" },
            { name: "NEA Authorization", desc: "Nepal Electricity Authority approved" },
            { name: "ISO 9001", desc: "Quality management system" },
            { name: "Professional Engineering Certification", desc: "Licensed professional engineers" },
          ].map((cert) => (
            <div key={cert.name} className="rounded-lg border border-line bg-white p-6 text-center">
              <Award className="mx-auto h-12 w-12 text-brass" />
              <h3 className="mt-4 font-display text-xl font-semibold text-navy">{cert.name}</h3>
              <p className="mt-2 text-sm text-slate">{cert.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
