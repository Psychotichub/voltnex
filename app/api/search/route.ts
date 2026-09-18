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

  const contains = { contains: q, mode: "insensitive" as const };
  const [projects, clients, materials, quotations, invoices, documents, drawings, methodStatements, surveys, purchaseOrders] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null, OR: [{ name: contains }, { code: contains }, { location: contains }] },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.client.findMany({
      where: { deletedAt: null, OR: [{ name: contains }, { company: contains }, { phone: contains }] },
      select: { id: true, name: true, company: true },
      take: 5,
    }),
    prisma.material.findMany({
      where: { deletedAt: null, OR: [{ name: contains }, { code: contains }, { brand: contains }] },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.quotation.findMany({
      where: { deletedAt: null, number: contains },
      select: { id: true, number: true },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { deletedAt: null, number: contains },
      select: { id: true, number: true },
      take: 5,
    }),
    prisma.document.findMany({
      where: { deletedAt: null, OR: [{ title: contains }, { folder: contains }] },
      select: { id: true, title: true, folder: true },
      take: 5,
    }),
    prisma.drawing.findMany({
      where: { deletedAt: null, OR: [{ title: contains }, { number: contains }] },
      select: { id: true, title: true, number: true },
      take: 5,
    }),
    prisma.methodStatement.findMany({
      where: { deletedAt: null, OR: [{ title: contains }, { number: contains }] },
      select: { id: true, title: true, number: true },
      take: 5,
    }),
    prisma.siteSurvey.findMany({
      where: { deletedAt: null, OR: [{ location: contains }] },
      select: { id: true, location: true },
      take: 5,
    }),
    prisma.purchaseOrder.findMany({
      where: { deletedAt: null, OR: [{ number: contains }] },
      select: { id: true, number: true },
      take: 5,
    }),
  ]);

  const results = [
    ...projects.map((p) => ({ type: "Projects", id: p.id, title: `${p.code} - ${p.name}`, href: `/projects/${p.id}` })),
    ...clients.map((c) => ({ type: "Clients", id: c.id, title: c.company ? `${c.name} (${c.company})` : c.name, href: `/clients/${c.id}` })),
    ...materials.map((m) => ({ type: "Materials", id: m.id, title: `${m.code} - ${m.name}`, href: `/materials` })),
    ...quotations.map((qtn) => ({ type: "Quotations", id: qtn.id, title: qtn.number, href: `/quotations` })),
    ...invoices.map((inv) => ({ type: "Invoices", id: inv.id, title: inv.number, href: `/invoices` })),
    ...documents.map((doc) => ({ type: "Documents", id: doc.id, title: `${doc.folder} - ${doc.title}`, href: `/documents` })),
    ...drawings.map((d) => ({ type: "Drawings", id: d.id, title: `${d.number} - ${d.title}`, href: `/drawings` })),
    ...methodStatements.map((ms) => ({ type: "Method Statements", id: ms.id, title: `${ms.number} - ${ms.title}`, href: `/method-statements` })),
    ...surveys.map((s) => ({ type: "Surveys", id: s.id, title: s.location ?? "Survey", href: `/surveys` })),
    ...purchaseOrders.map((po) => ({ type: "Procurement", id: po.id, title: po.number, href: `/procurement` })),
  ];

  return NextResponse.json({ results });
}
