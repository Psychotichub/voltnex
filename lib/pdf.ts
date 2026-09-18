import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/db";
import { formatNPR } from "@/lib/money";

export async function buildDocumentPdf(input: {
  title: string;
  number: string;
  clientName?: string;
  projectName?: string;
  notes?: string;
  rows: Array<Array<string>>;
  columns: string[];
  totals?: Array<[string, string]>;
}) {
  const company = await prisma.company.findFirst();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.043, 0.122, 0.2);
  const brass = rgb(0.79, 0.635, 0.153);
  let y = 800;

  page.drawRectangle({ x: 0, y: 810, width: 595, height: 32, color: navy });
  page.drawText(company?.name ?? "VoltNex Engineering", {
    x: 40,
    y: 820,
    size: 12,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(input.title, { x: 40, y, size: 16, font: bold, color: navy });
  y -= 18;
  page.drawText(`Document: ${input.number}`, { x: 40, y, size: 10, font, color: navy });
  y -= 14;
  if (input.clientName) {
    page.drawText(`Client: ${input.clientName}`, { x: 40, y, size: 10, font, color: navy });
    y -= 14;
  }
  if (input.projectName) {
    page.drawText(`Project: ${input.projectName}`, { x: 40, y, size: 10, font, color: navy });
    y -= 14;
  }
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: brass });
  y -= 22;

  const colW = (515) / input.columns.length;
  input.columns.forEach((col, i) => {
    page.drawText(col, { x: 40 + i * colW, y, size: 8, font: bold, color: navy });
  });
  y -= 14;
  for (const row of input.rows) {
    if (y < 90) break;
    row.forEach((cell, i) => {
      page.drawText(String(cell).slice(0, 28), { x: 40 + i * colW, y, size: 8, font, color: navy });
    });
    y -= 12;
  }

  y -= 10;
  for (const [label, value] of input.totals ?? []) {
    page.drawText(`${label}: ${value}`, { x: 360, y, size: 10, font: bold, color: navy });
    y -= 14;
  }

  if (input.notes) {
    y -= 8;
    page.drawText("Notes / Terms", { x: 40, y, size: 9, font: bold, color: navy });
    y -= 12;
    page.drawText(input.notes.slice(0, 240), { x: 40, y, size: 8, font, color: navy });
  }

  page.drawText("Authorized signature", { x: 40, y: 60, size: 9, font, color: navy });
  page.drawLine({ start: { x: 40, y: 50 }, end: { x: 200, y: 50 }, thickness: 0.5, color: navy });
  page.drawText(company?.authorizedPerson ?? "", { x: 40, y: 38, size: 8, font, color: navy });
  page.drawText(
    `${company?.address ?? ""} | PAN ${company?.pan ?? ""} | VAT ${company?.vatNumber ?? ""}`,
    { x: 40, y: 24, size: 7, font, color: navy },
  );
  page.drawText("Page 1", { x: 520, y: 24, size: 8, font, color: navy });

  return Buffer.from(await pdf.save());
}

export function npr(value: unknown) {
  return formatNPR(String(value ?? 0));
}
