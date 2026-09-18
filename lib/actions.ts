"use server";

import { revalidatePath } from "next/cache";
import {
  ClientType,
  DocumentStatus,
  ExpenseCategory,
  PaymentKind,
  Prisma,
  ProjectStatus,
  ProjectWorkflow,
  Role,
} from "@prisma/client";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { documentTotals } from "@/lib/finance";
import { saveUpload } from "@/lib/files";
import { assertNonNegative, assertPercent, money } from "@/lib/money";
import { nextNumber } from "@/lib/numbering";
import { can } from "@/lib/rbac";

function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function opt(form: FormData, key: string) {
  const value = str(form, key);
  return value.length ? value : null;
}

function dec(form: FormData, key: string) {
  const raw = str(form, key) || "0";
  const value = money(raw);
  if (!value.isFinite()) throw new Error(`Invalid number for ${key}`);
  return new Prisma.Decimal(value.toFixed(2));
}

function qty(form: FormData, key: string) {
  const value = money(str(form, key) || "0");
  if (!value.isFinite()) throw new Error(`Invalid quantity for ${key}`);
  assertNonNegative(value, key);
  return new Prisma.Decimal(value.toFixed(3));
}

async function guard(permission: Parameters<typeof can>[1] = "create") {
  const session = await requireSession();
  if (!can(session.user.role, permission)) {
    throw new Error("You do not have permission for this action.");
  }
  return session;
}

export async function createClient(form: FormData) {
  const session = await guard();
  const data = {
    name: str(form, "name"),
    company: opt(form, "company"),
    contactPerson: opt(form, "contactPerson"),
    phone: opt(form, "phone"),
    email: opt(form, "email"),
    address: opt(form, "address"),
    panVat: opt(form, "panVat"),
    type: (str(form, "type") || "COMMERCIAL") as ClientType,
    notes: opt(form, "notes"),
  };
  if (!data.name) throw new Error("Client name is required.");
  const created = await prisma.client.create({ data });
  await writeAudit({ userId: session.user.id, action: "create", entity: "Client", entityId: created.id, newValue: data });
  revalidatePath("/clients");
}

export async function updateClient(form: FormData) {
  const session = await guard("edit");
  const id = str(form, "id");
  const old = await prisma.client.findUnique({ where: { id } });
  if (!old) throw new Error("Client not found");

  const data = {
    name: str(form, "name"),
    company: opt(form, "company"),
    contactPerson: opt(form, "contactPerson"),
    phone: opt(form, "phone"),
    email: opt(form, "email"),
    address: opt(form, "address"),
    panVat: opt(form, "panVat"),
    type: (str(form, "type") || "COMMERCIAL") as ClientType,
    notes: opt(form, "notes"),
  };

  await prisma.client.update({
    where: { id },
    data,
  });

  await writeAudit({
    userId: session.user.id,
    action: "update",
    entity: "Client",
    entityId: id,
    oldValue: old,
    newValue: data,
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(form: FormData) {
  const session = await guard("delete");
  const id = str(form, "id");
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new Error("Client not found");

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAudit({
    userId: session.user.id,
    action: "delete",
    entity: "Client",
    entityId: id,
    oldValue: client,
  });
  revalidatePath("/clients");
}

export async function createProject(form: FormData) {
  const session = await guard();
  const name = str(form, "name");
  const clientId = str(form, "clientId");
  if (!name || !clientId) throw new Error("Project name and client are required.");
  const code = await nextNumber("project");
  const contractValue = dec(form, "contractValue");
  const estimatedCost = dec(form, "estimatedCost");
  const created = await prisma.project.create({
    data: {
      code,
      name,
      clientId,
      location: opt(form, "location"),
      projectType: (str(form, "projectType") || "COMMERCIAL") as ClientType,
      startDate: opt(form, "startDate") ? new Date(str(form, "startDate")) : null,
      expectedCompletion: opt(form, "expectedCompletion") ? new Date(str(form, "expectedCompletion")) : null,
      contractValue,
      estimatedCost,
      estimatedProfit: new Prisma.Decimal(money(contractValue).minus(money(estimatedCost)).toFixed(2)),
      managerId: opt(form, "managerId"),
      status: (str(form, "status") || "PLANNING") as ProjectStatus,
      workflow: (str(form, "workflow") || "LEAD") as ProjectWorkflow,
      notes: opt(form, "notes"),
    },
  });
  await prisma.projectCosting.create({
    data: { projectId: created.id, estOther: estimatedCost },
  });
  await writeAudit({ userId: session.user.id, action: "create", entity: "Project", entityId: created.id });
  revalidatePath("/projects");
}

export async function updateProjectStatus(form: FormData) {
  const session = await guard("edit");
  const id = str(form, "id");
  const old = await prisma.project.findUnique({ where: { id } });
  await prisma.project.update({
    where: { id },
    data: {
      status: str(form, "status") as ProjectStatus,
      workflow: str(form, "workflow") as ProjectWorkflow,
    },
  });
  await writeAudit({
    userId: session.user.id,
    action: "update",
    entity: "Project",
    entityId: id,
    oldValue: old,
  });
  revalidatePath(`/projects/${id}`);
}

export async function createMaterial(form: FormData) {
  await guard();
  const code = str(form, "code");
  const name = str(form, "name");
  if (!code || !name) throw new Error("Material code and name are required.");
  const purchasePrice = dec(form, "purchasePrice");
  const created = await prisma.material.create({
    data: {
      code,
      name,
      subcategory: opt(form, "subcategory"),
      brand: opt(form, "brand"),
      model: opt(form, "model"),
      specification: opt(form, "specification"),
      unit: str(form, "unit") || "Nos",
      purchasePrice,
      sellingPrice: dec(form, "sellingPrice"),
      supplierId: opt(form, "supplierId"),
      vatRate: dec(form, "vatRate"),
      minStock: qty(form, "minStock"),
      currentStock: qty(form, "currentStock"),
      warranty: opt(form, "warranty"),
      notes: opt(form, "notes"),
    },
  });
  await prisma.materialPrice.create({
    data: { materialId: created.id, price: purchasePrice, note: "Opening price" },
  });
  revalidatePath("/materials");
}

export async function createSupplier(form: FormData) {
  await guard();
  const name = str(form, "name");
  if (!name) throw new Error("Supplier name is required.");
  await prisma.supplier.create({
    data: {
      name,
      company: opt(form, "company"),
      contactPerson: opt(form, "contactPerson"),
      phone: opt(form, "phone"),
      email: opt(form, "email"),
      address: opt(form, "address"),
      panVat: opt(form, "panVat"),
      productCategories: opt(form, "productCategories"),
      paymentTerms: opt(form, "paymentTerms"),
      creditLimit: dec(form, "creditLimit"),
      notes: opt(form, "notes"),
    },
  });
  revalidatePath("/suppliers");
}

export async function createLabourRate(form: FormData) {
  await guard();
  const name = str(form, "name");
  if (!name) throw new Error("Labour category is required.");
  const category = await prisma.labourCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  await prisma.labourRate.create({
    data: {
      categoryId: category.id,
      projectId: opt(form, "projectId"),
      dailyRate: dec(form, "dailyRate"),
      hourlyRate: dec(form, "hourlyRate"),
      overtimeRate: dec(form, "overtimeRate"),
      transportAllow: dec(form, "transportAllow"),
      accommodation: dec(form, "accommodation"),
      notes: opt(form, "notes"),
    },
  });
  revalidatePath("/labour");
}

export async function createBoq(form: FormData) {
  const session = await guard("estimate");
  const projectId = str(form, "projectId");
  const title = str(form, "title") || "Electrical BOQ";
  const overheadPct = dec(form, "overheadPct");
  const contingencyPct = dec(form, "contingencyPct");
  const profitPct = dec(form, "profitPct");
  const discount = dec(form, "discount");
  const vatPct = dec(form, "vatPct");
  [overheadPct, contingencyPct, profitPct, vatPct].forEach((p, i) =>
    assertPercent(String(p), ["overhead", "contingency", "profit", "VAT"][i]),
  );
  const created = await prisma.boq.create({
    data: {
      number: await nextNumber("boq"),
      projectId,
      title,
      overheadPct,
      contingencyPct,
      profitPct,
      discount,
      vatPct,
    },
  });
  await writeAudit({ userId: session.user.id, action: "create", entity: "Boq", entityId: created.id });
  revalidatePath("/boq");
  return created.id;
}

export async function importBoqFromExcel(form: FormData) {
  const session = await guard("estimate");
  const file = form.get("file");
  const projectId = str(form, "projectId");

  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  if (!projectId) {
    throw new Error("Project ID required");
  }

  const ExcelJS = (await import("exceljs")).default;
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  const data: Record<string, unknown>[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        headers.push(cell.value as string);
      });
    } else {
      const rowData: Record<string, unknown> = {};
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value;
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    }
  });

  // Create BOQ
  const boqNumber = await nextNumber("boq");
  const boq = await prisma.boq.create({
    data: {
      number: boqNumber,
      projectId,
      title: `Imported BOQ - ${new Date().toLocaleDateString()}`,
      overheadPct: 10,
      contingencyPct: 5,
      profitPct: 12,
      discount: 0,
      vatPct: 13,
    },
  });

  // Create BOQ items from imported data
  let sortOrder = 0;
  for (const row of data) {
    if (row["Item No"] && row["Description"]) {
      await prisma.boqItem.create({
        data: {
          boqId: boq.id,
          itemNo: String(row["Item No"]),
          description: String(row["Description"]),
          specification: row["Specification"] ? String(row["Specification"]) : null,
          category: row["Category"] ? String(row["Category"]) : "Miscellaneous",
          unit: row["Unit"] ? String(row["Unit"]) : "Nos",
          quantity: Number(row["Quantity"]) || 0,
          materialRate: Number(row["Material Rate"]) || 0,
          labourRate: Number(row["Labour Rate"]) || 0,
          equipmentRate: Number(row["Equipment Rate"]) || 0,
          remarks: row["Remarks"] ? String(row["Remarks"]) : null,
          sortOrder,
        },
      });
      sortOrder++;
    }
  }

  await writeAudit({ userId: session.user.id, action: "create", entity: "Boq", entityId: boq.id });
  revalidatePath("/boq");
  return boq.id;
}

export async function addBoqItem(form: FormData) {
  const session = await guard("estimate");
  const boqId = str(form, "boqId");
  const quantity = qty(form, "quantity");
  const materialRate = dec(form, "materialRate");
  const labourRate = dec(form, "labourRate");
  const equipmentRate = dec(form, "equipmentRate");
  assertNonNegative(materialRate, "Material rate");
  assertNonNegative(labourRate, "Labour rate");
  assertNonNegative(equipmentRate, "Equipment rate");
  const item = await prisma.boqItem.create({
    data: {
      boqId,
      itemNo: str(form, "itemNo"),
      description: str(form, "description"),
      specification: opt(form, "specification"),
      category: str(form, "category") || "Miscellaneous",
      unit: str(form, "unit") || "Nos",
      quantity,
      materialRate,
      labourRate,
      equipmentRate,
      remarks: opt(form, "remarks"),
    },
  });
  await writeAudit({ userId: session.user.id, action: "create", entity: "BoqItem", entityId: item.id });
  revalidatePath(`/boq/${boqId}`);
}

export async function createQuotationFromBoq(form: FormData) {
  const session = await guard("estimate");
  const boqId = str(form, "boqId");
  const boq = await prisma.boq.findUniqueOrThrow({
    where: { id: boqId },
    include: { items: true, project: true },
  });
  const quote = await prisma.quotation.create({
    data: {
      number: await nextNumber("quotation"),
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      clientId: boq.project.clientId,
      projectId: boq.projectId,
      boqId: boq.id,
      scopeOfWork: opt(form, "scopeOfWork") ?? "Electrical installation as per BOQ.",
      paymentTerms: opt(form, "paymentTerms") ?? "30% advance, 60% progress, 10% retention.",
      deliveryTerms: opt(form, "deliveryTerms") ?? "As per agreed programme.",
      warranty: opt(form, "warranty") ?? "12 months from handover.",
      exclusions: opt(form, "exclusions"),
      inclusions: opt(form, "inclusions"),
      discount: boq.discount,
      vatPct: boq.vatPct,
      items: {
        create: boq.items.map((item, index) => ({
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit,
          rate: new Prisma.Decimal(
            money(item.materialRate).plus(item.labourRate).plus(item.equipmentRate).toFixed(2),
          ),
          sortOrder: index,
        })),
      },
    },
  });
  await writeAudit({ userId: session.user.id, action: "create", entity: "Quotation", entityId: quote.id });
  revalidatePath("/quotations");
}

export async function updateQuotationStatus(form: FormData) {
  await guard("approve");
  await prisma.quotation.update({
    where: { id: str(form, "id") },
    data: { status: str(form, "status") as DocumentStatus },
  });
  revalidatePath("/quotations");
}

export async function createInvoice(form: FormData) {
  const session = await guard("finance");
  const clientId = str(form, "clientId");
  const projectId = str(form, "projectId");
  const created = await prisma.invoice.create({
    data: {
      number: await nextNumber("invoice"),
      dueDate: opt(form, "dueDate") ? new Date(str(form, "dueDate")) : null,
      clientId,
      projectId,
      paymentTerms: opt(form, "paymentTerms") ?? "Net 15 days",
      discount: dec(form, "discount"),
      vatPct: dec(form, "vatPct"),
      notes: opt(form, "notes"),
    },
  });
  await writeAudit({ userId: session.user.id, action: "create", entity: "Invoice", entityId: created.id });
  revalidatePath("/invoices");
  return created.id;
}

export async function addInvoiceItem(form: FormData) {
  await guard("finance");
  const invoiceId = str(form, "invoiceId");
  const quantity = qty(form, "quantity");
  const rate = dec(form, "rate");
  assertNonNegative(rate, "Rate");
  await prisma.invoiceItem.create({
    data: {
      invoiceId,
      description: str(form, "description"),
      quantity,
      unit: str(form, "unit") || "Nos",
      rate,
    },
  });
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function recordPayment(form: FormData) {
  const session = await guard("finance");
  const amount = dec(form, "amount");
  assertNonNegative(amount, "Amount");
  const invoiceId = opt(form, "invoiceId");
  if (invoiceId) {
    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { items: true },
    });
    const totals = documentTotals(invoice.items, invoice.discount, invoice.vatPct);
    const nextPaid = money(invoice.paidAmount).plus(amount);
    if (nextPaid.greaterThan(money(totals.grand).plus(0.009))) {
      throw new Error("Payment cannot exceed invoice grand total.");
    }
    const status: DocumentStatus = nextPaid.greaterThanOrEqualTo(money(totals.grand))
      ? "PAID"
      : nextPaid.isZero()
        ? invoice.status
        : "PARTIALLY_PAID";
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          amount,
          invoiceId,
          projectId: opt(form, "projectId") ?? invoice.projectId,
          clientId: invoice.clientId,
          kind: "CLIENT",
          method: str(form, "method") || "Bank",
          reference: opt(form, "reference"),
          notes: opt(form, "notes"),
        },
      }),
      prisma.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: new Prisma.Decimal(nextPaid.toFixed(2)), status },
      }),
    ]);
  } else {
    await prisma.payment.create({
      data: {
        amount,
        projectId: opt(form, "projectId"),
        clientId: opt(form, "clientId"),
        supplierId: opt(form, "supplierId"),
        kind: (str(form, "kind") || "OTHER") as PaymentKind,
        method: str(form, "method") || "Bank",
        reference: opt(form, "reference"),
        notes: opt(form, "notes"),
      },
    });
  }
  await writeAudit({ userId: session.user.id, action: "create", entity: "Payment", entityId: "payment" });
  revalidatePath("/payments");
  revalidatePath("/invoices");
}

export async function createExpense(form: FormData) {
  await guard("finance");
  const receipt = form.get("receipt");
  let receiptPath: string | null = null;
  if (receipt instanceof File && receipt.size > 0) {
    receiptPath = await saveUpload(receipt, "receipts");
  }
  await prisma.expense.create({
    data: {
      number: await nextNumber("expense"),
      date: opt(form, "date") ? new Date(str(form, "date")) : new Date(),
      projectId: opt(form, "projectId"),
      category: (str(form, "category") || "OTHER") as ExpenseCategory,
      description: str(form, "description"),
      amount: dec(form, "amount"),
      vendor: opt(form, "vendor"),
      paymentMethod: str(form, "paymentMethod") || "Cash",
      receiptPath,
      notes: opt(form, "notes"),
    },
  });
  revalidatePath("/expenses");
}

export async function createPurchaseOrder(form: FormData) {
  await guard();
  const supplierId = str(form, "supplierId");
  const po = await prisma.purchaseOrder.create({
    data: {
      number: await nextNumber("purchaseOrder"),
      supplierId,
      projectId: opt(form, "projectId"),
      deliveryDate: opt(form, "deliveryDate") ? new Date(str(form, "deliveryDate")) : null,
      paymentTerms: opt(form, "paymentTerms"),
      notes: opt(form, "notes"),
    },
  });
  revalidatePath("/procurement");
  return po.id;
}

export async function addPoItem(form: FormData) {
  await guard();
  const poId = str(form, "poId");
  await prisma.purchaseOrderItem.create({
    data: {
      poId,
      materialId: opt(form, "materialId"),
      description: str(form, "description"),
      quantity: qty(form, "quantity"),
      rate: dec(form, "rate"),
    },
  });
  revalidatePath("/procurement");
}

export async function receivePurchaseOrder(form: FormData) {
  const session = await guard("edit");
  const id = str(form, "id");
  const po = await prisma.purchaseOrder.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });
  await prisma.$transaction(async (tx) => {
    await tx.purchaseOrder.update({ where: { id }, data: { status: "RECEIVED" } });
    for (const item of po.items) {
      if (!item.materialId) continue;
      await tx.material.update({
        where: { id: item.materialId },
        data: { currentStock: { increment: item.quantity } },
      });
      await tx.inventoryMove.create({
        data: {
          materialId: item.materialId,
          projectId: po.projectId,
          type: "PURCHASE",
          quantity: item.quantity,
          note: `Received ${po.number}`,
        },
      });
    }
  });
  await writeAudit({ userId: session.user.id, action: "receive", entity: "PurchaseOrder", entityId: id });
  revalidatePath("/procurement");
  revalidatePath("/inventory");
}

export async function issueStock(form: FormData) {
  await guard("edit");
  const materialId = str(form, "materialId");
  const quantity = qty(form, "quantity");
  const material = await prisma.material.findUniqueOrThrow({ where: { id: materialId } });
  const next = money(material.currentStock).minus(quantity);
  if (next.isNegative()) throw new Error("Insufficient stock.");
  await prisma.$transaction([
    prisma.material.update({
      where: { id: materialId },
      data: { currentStock: new Prisma.Decimal(next.toFixed(3)) },
    }),
    prisma.inventoryMove.create({
      data: {
        materialId,
        projectId: opt(form, "projectId"),
        type: "ISSUE",
        quantity,
        note: opt(form, "note"),
      },
    }),
  ]);
  revalidatePath("/inventory");
}

export async function createDrawing(form: FormData) {
  await guard("upload");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Drawing file is required.");
  const path = await saveUpload(file, "drawings");
  const projectId = str(form, "projectId");
  const count = await prisma.drawing.count({ where: { projectId } });
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const drawing = await prisma.drawing.create({
    data: {
      number: `DWG-${project.code.replaceAll("-", "").slice(-6)}-${String(count + 1).padStart(3, "0")}`,
      title: str(form, "title"),
      projectId,
      discipline: str(form, "discipline") || "Electrical",
      preparedBy: opt(form, "preparedBy"),
      checkedBy: opt(form, "checkedBy"),
      approvedBy: opt(form, "approvedBy"),
      revisions: { create: { revision: str(form, "revision") || "A", filePath: path } },
    },
  });
  revalidatePath("/drawings");
  return drawing.id;
}

export async function createMethodStatement(form: FormData) {
  await guard();
  await prisma.methodStatement.create({
    data: {
      number: await nextNumber("methodStatement"),
      title: str(form, "title"),
      projectId: str(form, "projectId"),
      purpose: opt(form, "purpose"),
      scope: opt(form, "scope"),
      responsibilities: opt(form, "responsibilities"),
      tools: opt(form, "tools"),
      materials: opt(form, "materials"),
      safety: opt(form, "safety"),
      ppe: opt(form, "ppe"),
      procedure: opt(form, "procedure"),
      qualityControl: opt(form, "qualityControl"),
      inspection: opt(form, "inspection"),
      testing: opt(form, "testing"),
      acceptance: opt(form, "acceptance"),
      riskAssessment: opt(form, "riskAssessment"),
      references: opt(form, "references"),
    },
  });
  revalidatePath("/method-statements");
}

export async function createTestingChecklist(form: FormData) {
  await guard("site");
  const category = str(form, "category");
  const { TEST_TEMPLATES } = await import("@/lib/catalog");
  const items = TEST_TEMPLATES[category] ?? ["Visual inspection"];
  await prisma.testingChecklist.create({
    data: {
      number: await nextNumber("testing"),
      projectId: str(form, "projectId"),
      category,
      equipment: opt(form, "equipment"),
      witnessedBy: opt(form, "witnessedBy"),
      instrument: opt(form, "instrument"),
      testedById: opt(form, "testedById"),
      items: { create: items.map((name) => ({ name })) },
    },
  });
  revalidatePath("/testing-commissioning");
}

export async function updateTestItem(form: FormData) {
  await guard("site");
  await prisma.testingItem.update({
    where: { id: str(form, "id") },
    data: {
      result: opt(form, "result"),
      passFail: opt(form, "passFail"),
      remarks: opt(form, "remarks"),
    },
  });
  revalidatePath("/testing-commissioning");
}

export async function createSurvey(form: FormData) {
  await guard("site");
  const photos = form.get("photos");
  let photosJson: string | null = null;
  if (photos instanceof File && photos.size > 0) {
    photosJson = JSON.stringify([await saveUpload(photos, "surveys")]);
  }
  await prisma.siteSurvey.create({
    data: {
      projectId: str(form, "projectId"),
      clientId: str(form, "clientId"),
      location: opt(form, "location"),
      incomingSupply: opt(form, "incomingSupply"),
      voltage: opt(form, "voltage"),
      phase: opt(form, "phase"),
      mainBreaker: opt(form, "mainBreaker"),
      transformer: opt(form, "transformer"),
      generator: opt(form, "generator"),
      existingDb: opt(form, "existingDb"),
      existingCable: opt(form, "existingCable"),
      earthing: opt(form, "earthing"),
      loadNote: opt(form, "loadNote"),
      availableSpace: opt(form, "availableSpace"),
      cableRoute: opt(form, "cableRoute"),
      cableTray: opt(form, "cableTray"),
      panelLocation: opt(form, "panelLocation"),
      lighting: opt(form, "lighting"),
      emergencyLight: opt(form, "emergencyLight"),
      fireAlarm: opt(form, "fireAlarm"),
      ups: opt(form, "ups"),
      otherObs: opt(form, "otherObs"),
      measurements: opt(form, "measurements"),
      photosJson,
    },
  });
  revalidatePath("/surveys");
}

export async function uploadDocument(form: FormData) {
  await guard("upload");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("File is required.");
  const filePath = await saveUpload(file, "documents");
  await prisma.document.create({
    data: {
      projectId: opt(form, "projectId"),
      folder: str(form, "folder") || "01 Contract",
      title: str(form, "title") || file.name,
      filePath,
      mimeType: file.type,
    },
  });
  revalidatePath("/documents");
}

export async function saveCompany(form: FormData) {
  const session = await guard("manage_users");
  const logo = form.get("logo");
  const signature = form.get("signature");
  const data: Prisma.CompanyUpdateInput = {
    name: str(form, "name"),
    registrationNo: opt(form, "registrationNo"),
    pan: opt(form, "pan"),
    vatNumber: opt(form, "vatNumber"),
    address: opt(form, "address"),
    district: opt(form, "district"),
    province: opt(form, "province"),
    phone: opt(form, "phone"),
    email: opt(form, "email"),
    website: opt(form, "website"),
    bankName: opt(form, "bankName"),
    bankAccountNo: opt(form, "bankAccountNo"),
    bankBranch: opt(form, "bankBranch"),
    authorizedPerson: opt(form, "authorizedPerson"),
    vatRate: dec(form, "vatRate"),
    seoKeywords: str(form, "seoKeywords"),
    quotationTerms: opt(form, "quotationTerms"),
    invoiceTerms: opt(form, "invoiceTerms"),
    paymentTerms: opt(form, "paymentTerms"),
    whatsappNumber: opt(form, "whatsappNumber"),
    mapEmbedUrl: opt(form, "mapEmbedUrl"),
  };
  if (logo instanceof File && logo.size > 0) data.logoPath = await saveUpload(logo, "company");
  if (signature instanceof File && signature.size > 0) data.signaturePath = await saveUpload(signature, "company");
  await prisma.company.update({ where: { id: "default" }, data });
  await writeAudit({ userId: session.user.id, action: "update", entity: "Company", entityId: "default" });
  revalidatePath("/settings");
}

export async function createUser(form: FormData) {
  await guard("manage_users");
  const bcrypt = await import("bcryptjs");
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  await prisma.user.create({
    data: {
      email,
      name: str(form, "name"),
      phone: opt(form, "phone"),
      role: (str(form, "role") || "VIEWER") as Role,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  revalidatePath("/users");
}

export async function toggleUserStatus(form: FormData) {
  const session = await guard("manage_users");
  const id = str(form, "id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  
  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  
  await writeAudit({
    userId: session.user.id,
    action: "update",
    entity: "User",
    entityId: id,
    oldValue: { isActive: user.isActive },
    newValue: { isActive: !user.isActive },
  });
  revalidatePath("/users");
}

export async function deleteUser(form: FormData) {
  const session = await guard("manage_users");
  const id = str(form, "id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  
  await writeAudit({
    userId: session.user.id,
    action: "delete",
    entity: "User",
    entityId: id,
    oldValue: user,
  });
  revalidatePath("/users");
}

export async function createContactMessage(form: FormData) {
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string().min(10),
    })
    .parse({
      name: str(form, "name"),
      email: str(form, "email"),
      phone: opt(form, "phone") ?? undefined,
      message: str(form, "message"),
    });
  await prisma.contactMessage.create({ data: parsed });
}

export async function saveCosting(form: FormData) {
  await guard("finance");
  const projectId = str(form, "projectId");
  const fields = [
    "estMaterial",
    "estLabour",
    "estEquipment",
    "estTransport",
    "estSubcontractor",
    "estOther",
    "estOverhead",
    "estContingency",
    "actMaterial",
    "actLabour",
    "actEquipment",
    "actTransport",
    "actSubcontractor",
    "actOther",
  ] as const;
  const data = Object.fromEntries(fields.map((field) => [field, dec(form, field)]));
  const estimated = fields
    .filter((f) => f.startsWith("est"))
    .reduce((sum, f) => money(sum).plus(data[f]), money(0));
  const actual = fields
    .filter((f) => f.startsWith("act"))
    .reduce((sum, f) => money(sum).plus(data[f]), money(0));
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  await prisma.$transaction([
    prisma.projectCosting.upsert({
      where: { projectId },
      update: data,
      create: { projectId, ...data },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: {
        estimatedCost: new Prisma.Decimal(estimated.toFixed(2)),
        actualCost: new Prisma.Decimal(actual.toFixed(2)),
        estimatedProfit: new Prisma.Decimal(money(project.contractValue).minus(estimated).toFixed(2)),
        actualProfit: new Prisma.Decimal(money(project.contractValue).minus(actual).toFixed(2)),
      },
    }),
  ]);
  revalidatePath("/costing");
}

export async function addStandard(form: FormData) {
  await guard("upload");
  const file = form.get("file");
  let filePath: string | null = null;
  if (file instanceof File && file.size > 0) filePath = await saveUpload(file, "standards");
  await prisma.standardDocument.create({
    data: {
      name: str(form, "name"),
      number: opt(form, "number"),
      edition: opt(form, "edition"),
      category: str(form, "category"),
      description: opt(form, "description"),
      applicability: opt(form, "applicability"),
      notes: opt(form, "notes"),
      filePath,
    },
  });
  revalidatePath("/standards");
}
