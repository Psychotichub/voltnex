import { prisma } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  project: "PRJ",
  boq: "BOQ",
  quotation: "QT",
  invoice: "INV",
  purchaseOrder: "PO",
  testing: "TCR",
  methodStatement: "MS",
  expense: "EXP",
};

export async function nextNumber(kind: keyof typeof DEFAULTS) {
  const year = new Date().getFullYear();
  const prefix = DEFAULTS[kind];
  const id = `${kind}-${year}`;

  const seq = await prisma.numberSequence.upsert({
    where: { id },
    create: { id, prefix, year, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });

  return `${seq.prefix}-${year}-${String(seq.lastValue).padStart(3, "0")}`;
}

export function drawingNumber(projectCode: string, sequence: number) {
  const short = projectCode.replace(/[^A-Z0-9]/gi, "").slice(-6) || "PRJ";
  return `DWG-${short}-${String(sequence).padStart(3, "0")}`;
}
