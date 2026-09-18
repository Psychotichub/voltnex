import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const contains = { contains: q };
  const [projects, clients, materials, quotations, invoices, documents] = await Promise.all([
    prisma.project.findMany({
      where: { OR: [{ name: contains }, { code: contains }, { location: contains }] },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.client.findMany({
      where: { OR: [{ name: contains }, { company: contains }, { phone: contains }] },
      select: { id: true, name: true, company: true },
      take: 5,
    }),
    prisma.material.findMany({
      where: { OR: [{ name: contains }, { code: contains }, { brand: contains }] },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.quotation.findMany({
      where: { number: contains },
      select: { id: true, number: true },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { number: contains },
      select: { id: true, number: true },
      take: 5,
    }),
    prisma.document.findMany({
      where: { OR: [{ title: contains }, { folder: contains }] },
      select: { id: true, title: true, folder: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    results: [
      ...projects.map((p) => ({ type: "Projects", id: p.id, title: `${p.code} - ${p.name}`, href: "/projects" })),
      ...clients.map((c) => ({ type: "Clients", id: c.id, title: c.company ? `${c.name} (${c.company})` : c.name, href: "/clients" })),
      ...materials.map((m) => ({ type: "Materials", id: m.id, title: `${m.code} - ${m.name}`, href: "/materials" })),
      ...quotations.map((qtn) => ({ type: "Quotations", id: qtn.id, title: qtn.number, href: "/quotations" })),
      ...invoices.map((inv) => ({ type: "Invoices", id: inv.id, title: inv.number, href: "/invoices" })),
      ...documents.map((doc) => ({ type: "Documents", id: doc.id, title: `${doc.folder} - ${doc.title}`, href: "/documents" })),
    ],
  });
}
