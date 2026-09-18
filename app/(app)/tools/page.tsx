import { Wrench, Zap, Calculator } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";

export default async function ToolsPage() {
  const [projects] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null }, take: 5, select: { id: true, name: true, code: true } }),
  ]);

  const calculators = [
    { name: "Power Calculator", desc: "Calculate single/three phase power", href: "/tools/calculator/power" },
    { name: "Current Calculator", desc: "Calculate current from power", href: "/tools/calculator/current" },
    { name: "Voltage Drop Calculator", desc: "Calculate voltage drop for cables", href: "/tools/calculator/voltage-drop" },
    { name: "Cable Selection", desc: "Select appropriate cable size", href: "/tools/calculator/cable" },
    { name: "Generator Sizing", desc: "Calculate generator KVA", href: "/tools/calculator/generator" },
    { name: "Transformer Sizing", desc: "Calculate transformer KVA", href: "/tools/calculator/transformer" },
    { name: "UPS Sizing", desc: "Calculate UPS KVA", href: "/tools/calculator/ups" },
    { name: "Capacitor Bank", desc: "Estimate capacitor KVAR", href: "/tools/calculator/capacitor" },
    { name: "Load Schedule", desc: "Calculate electrical load", href: "/tools/calculator/load" },
    { name: "Energy Consumption", desc: "Calculate energy usage", href: "/tools/calculator/energy" },
  ];

  return (
    <>
      <PageHeader
        title="Engineering Tools"
        description="Electrical calculators for power, current, voltage drop, cable selection, and more."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <Card key={calc.name} className="rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-brass" />
              <div>
                <h3 className="font-display text-lg font-semibold text-navy">{calc.name}</h3>
                <p className="text-sm text-slate">{calc.desc}</p>
              </div>
            </div>
            <Link href={calc.href}>
              <Button variant="outline" size="sm" className="mt-4">Open Calculator</Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg mt-6">
        <div className="p-5">
          <CardTitle>Active Projects</CardTitle>
          <ul className="mt-4 space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="text-sm text-slate">{p.code} - {p.name}</li>
            ))}
          </ul>
        </div>
      </Card>
    </>
  );
}
