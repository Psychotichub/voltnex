import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.testingItem.deleteMany();
  await prisma.testingChecklist.deleteMany();
  await prisma.drawingRevision.deleteMany();
  await prisma.drawing.deleteMany();
  await prisma.methodStatement.deleteMany();
  await prisma.methodStatementTemplate.deleteMany();
  await prisma.inventoryMove.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.boqItem.deleteMany();
  await prisma.boq.deleteMany();
  await prisma.document.deleteMany();
  await prisma.siteSurvey.deleteMany();
  await prisma.projectCosting.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.materialPrice.deleteMany();
  await prisma.supplierMaterial.deleteMany();
  await prisma.material.deleteMany();
  await prisma.materialCategory.deleteMany();
  await prisma.labourRate.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.labourCategory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.client.deleteMany();
  await prisma.standardDocument.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.numberSequence.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const passwordHash = await bcrypt.hash("VoltNex@2026", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@voltnex.com", name: "Aarav Sharma", role: "ADMIN", passwordHash, phone: "9801111111" },
  });
  const pm = await prisma.user.create({
    data: { email: "pm@voltnex.com", name: "Nisha Karki", role: "PROJECT_MANAGER", passwordHash, phone: "9802222222" },
  });
  await prisma.user.create({
    data: { email: "estimator@voltnex.com", name: "Bikash Thapa", role: "ESTIMATOR", passwordHash },
  });
  await prisma.user.create({
    data: { email: "accounts@voltnex.com", name: "Sita Gurung", role: "ACCOUNTANT", passwordHash },
  });
  await prisma.user.create({
    data: { email: "site@voltnex.com", name: "Ramesh Adhikari", role: "SITE_SUPERVISOR", passwordHash },
  });
  await prisma.user.create({
    data: { email: "electrician@voltnex.com", name: "Hari Magar", role: "ELECTRICIAN", passwordHash },
  });

  await prisma.company.create({
    data: {
      id: "default",
      name: "VoltNex Engineering Pvt. Ltd.",
      registrationNo: "123456/078/079",
      pan: "601234567",
      vatNumber: "601234567",
      address: "New Baneshwor, Kathmandu, Nepal",
      district: "Kathmandu",
      province: "Bagmati",
      phone: "+977-1-4512345",
      email: "info@voltnex.com",
      website: "https://voltnex.com",
      bankName: "Nabil Bank",
      bankAccountNo: "012345678901234",
      bankBranch: "New Baneshwor",
      authorizedPerson: "Aarav Sharma, Managing Director",
      whatsappNumber: "9779801111111",
      mapEmbedUrl: "https://maps.google.com/?q=New+Baneshwor+Kathmandu",
      quotationTerms: "Validity 30 days. Prices in NPR exclusive of VAT unless stated. Final cable and protection selection must be verified against applicable Nepal standards, manufacturer data and project requirements.",
      invoiceTerms: "Payment due within 15 days. Late payments may attract 1.5% interest per month.",
      paymentTerms: "30% advance, 60% against progress, 10% after handover.",
    },
  });

  const year = 2026;
  await prisma.numberSequence.createMany({
    data: [
      { id: `project-${year}`, prefix: "PRJ", year, lastValue: 4 },
      { id: `boq-${year}`, prefix: "BOQ", year, lastValue: 2 },
      { id: `quotation-${year}`, prefix: "QT", year, lastValue: 2 },
      { id: `invoice-${year}`, prefix: "INV", year, lastValue: 2 },
      { id: `purchaseOrder-${year}`, prefix: "PO", year, lastValue: 1 },
      { id: `testing-${year}`, prefix: "TCR", year, lastValue: 1 },
      { id: `methodStatement-${year}`, prefix: "MS", year, lastValue: 1 },
      { id: `expense-${year}`, prefix: "EXP", year, lastValue: 3 },
    ],
  });

  const clients = await prisma.$transaction([
    prisma.client.create({
      data: { name: "Himalayan Residences", company: "Himalayan Developers", contactPerson: "Prakash Joshi", phone: "9841000001", email: "prakash@himalayan.dev", address: "Budhanilkantha, Kathmandu", type: "RESIDENTIAL", panVat: "601111111" },
    }),
    prisma.client.create({
      data: { name: "Everest Grand Hotel", company: "Everest Hospitality", contactPerson: "Maya Shrestha", phone: "9841000002", email: "maya@everestgrand.com", address: "Lakeside, Pokhara", type: "HOTEL", panVat: "602222222" },
    }),
    prisma.client.create({
      data: { name: "Sagarmatha Foods Ltd.", company: "Sagarmatha Foods", contactPerson: "Dipen Lama", phone: "9841000003", email: "dipen@sagarmathafoods.com", address: "Bhairahawa Industrial Area", type: "INDUSTRIAL", panVat: "603333333" },
    }),
    prisma.client.create({
      data: { name: "Bagmati Community Hospital", company: "Bagmati Health Trust", contactPerson: "Dr. Anil Basnet", phone: "9841000004", email: "anil@bch.org.np", address: "Gwarko, Lalitpur", type: "HOSPITAL", panVat: "604444444" },
    }),
  ]);

  const catNames = ["Cable", "Protection", "Distribution", "Lighting", "Earthing", "Containment"];
  const cats = await prisma.$transaction(catNames.map((name) => prisma.materialCategory.create({ data: { name } })));
  const cat = Object.fromEntries(cats.map((c) => [c.name, c.id]));

  const suppliers = await prisma.$transaction([
    prisma.supplier.create({ data: { name: "Nepal Electrical Traders", company: "NET Pvt. Ltd.", contactPerson: "Rajan KC", phone: "9851110001", email: "sales@net.com.np", address: "Kichhapokhari, Kathmandu", productCategories: "Cable, MCB, MCCB", paymentTerms: "Net 30", creditLimit: "2000000" } }),
    prisma.supplier.create({ data: { name: "Himal Switchgear", company: "Himal Switchgear", contactPerson: "Sunita Rai", phone: "9851110002", email: "sunita@himalsw.com", address: "Patan Industrial Estate", productCategories: "DB, MCCB, Contactor", paymentTerms: "Advance 20%", creditLimit: "1500000" } }),
    prisma.supplier.create({ data: { name: "Valley Lighting House", contactPerson: "Kiran Tamang", phone: "9851110003", email: "kiran@vlh.com.np", address: "Putalisadak", productCategories: "LED, Emergency lighting" } }),
  ]);

  const materials = await prisma.$transaction([
    prisma.material.create({ data: { code: "CBL-1.5", name: "1.5 mm² Cu cable", categoryId: cat.Cable, brand: "RR Kabel", specification: "Cu/PVC/PVC 450/750V", unit: "m", purchasePrice: "42", sellingPrice: "55", supplierId: suppliers[0].id, minStock: "200", currentStock: "850" } }),
    prisma.material.create({ data: { code: "CBL-2.5", name: "2.5 mm² Cu cable", categoryId: cat.Cable, brand: "RR Kabel", specification: "Cu/PVC/PVC 450/750V", unit: "m", purchasePrice: "68", sellingPrice: "85", supplierId: suppliers[0].id, minStock: "200", currentStock: "640" } }),
    prisma.material.create({ data: { code: "CBL-4", name: "4 mm² Cu cable", categoryId: cat.Cable, brand: "Polycab", specification: "Cu/PVC/PVC", unit: "m", purchasePrice: "105", sellingPrice: "130", supplierId: suppliers[0].id, minStock: "100", currentStock: "320" } }),
    prisma.material.create({ data: { code: "CBL-6", name: "6 mm² Cu cable", categoryId: cat.Cable, brand: "Polycab", specification: "Cu/PVC/PVC", unit: "m", purchasePrice: "155", sellingPrice: "190", supplierId: suppliers[0].id, minStock: "80", currentStock: "210" } }),
    prisma.material.create({ data: { code: "CBL-10", name: "10 mm² Cu cable", categoryId: cat.Cable, brand: "Havells", specification: "Cu/PVC/PVC", unit: "m", purchasePrice: "255", sellingPrice: "310", supplierId: suppliers[0].id, minStock: "50", currentStock: "95" } }),
    prisma.material.create({ data: { code: "CBL-16", name: "16 mm² Cu cable", categoryId: cat.Cable, brand: "Havells", specification: "Cu/XLPE/PVC", unit: "m", purchasePrice: "410", sellingPrice: "495", supplierId: suppliers[0].id, minStock: "40", currentStock: "18" } }),
    prisma.material.create({ data: { code: "MCB-6A", name: "MCB 6A SP C-curve", categoryId: cat.Protection, brand: "Schneider", model: "iC60N", unit: "Nos", purchasePrice: "420", sellingPrice: "560", supplierId: suppliers[1].id, minStock: "20", currentStock: "74" } }),
    prisma.material.create({ data: { code: "MCCB-100", name: "MCCB 100A 3P 36kA", categoryId: cat.Protection, brand: "Schneider", model: "NSX100", unit: "Nos", purchasePrice: "18500", sellingPrice: "22800", supplierId: suppliers[1].id, minStock: "2", currentStock: "6" } }),
    prisma.material.create({ data: { code: "DB-12W", name: "12-way SPN DB", categoryId: cat.Distribution, brand: "Legrand", unit: "Nos", purchasePrice: "3200", sellingPrice: "4100", supplierId: suppliers[1].id, minStock: "4", currentStock: "11" } }),
    prisma.material.create({ data: { code: "TRAY-100", name: "Cable tray 100mm GI", categoryId: cat.Containment, brand: "Local", specification: "1.6mm GI perforated", unit: "m", purchasePrice: "780", sellingPrice: "980", supplierId: suppliers[1].id, minStock: "30", currentStock: "120" } }),
    prisma.material.create({ data: { code: "LED-18", name: "LED panel 18W 6500K", categoryId: cat.Lighting, brand: "Philips", unit: "Nos", purchasePrice: "890", sellingPrice: "1150", supplierId: suppliers[2].id, minStock: "40", currentStock: "160" } }),
    prisma.material.create({ data: { code: "CTR-18", name: "Contactor 18A 220V", categoryId: cat.Protection, brand: "L&T", unit: "Nos", purchasePrice: "2100", sellingPrice: "2650", supplierId: suppliers[1].id, minStock: "6", currentStock: "22" } }),
    prisma.material.create({ data: { code: "OLR-9", name: "Overload relay 5.5-9A", categoryId: cat.Protection, brand: "L&T", unit: "Nos", purchasePrice: "1450", sellingPrice: "1850", supplierId: suppliers[1].id, minStock: "6", currentStock: "19" } }),
    prisma.material.create({ data: { code: "EARTH-ROD", name: "Earthing rod 16mm GI 3m", categoryId: cat.Earthing, brand: "Local", unit: "Nos", purchasePrice: "1650", sellingPrice: "2100", supplierId: suppliers[0].id, minStock: "10", currentStock: "28" } }),
  ]);

  for (const material of materials) {
    await prisma.materialPrice.create({ data: { materialId: material.id, price: material.purchasePrice, note: "List price 2026" } });
    if (material.supplierId) {
      await prisma.supplierMaterial.create({
        data: { supplierId: material.supplierId, materialId: material.id, price: material.purchasePrice, leadDays: 7 },
      });
    }
  }
  await prisma.supplierMaterial.create({
    data: { supplierId: suppliers[0].id, materialId: materials[6].id, price: "450", leadDays: 4 },
  });

  const labourCats = await prisma.$transaction(
    [
      "Electrical Engineer",
      "Project Engineer",
      "Site Engineer",
      "Electrical Supervisor",
      "Foreman",
      "Senior Electrician",
      "Electrician",
      "Junior Electrician",
      "Helper",
      "Technician",
      "Welder",
      "Cable Joiner",
      "Testing Technician",
    ].map((name) => prisma.labourCategory.create({ data: { name } })),
  );

  await prisma.labourRate.createMany({
    data: labourCats.map((c, i) => ({
      categoryId: c.id,
      dailyRate: String(4500 - i * 180),
      hourlyRate: String(((4500 - i * 180) / 8).toFixed(2)),
      overtimeRate: String((((4500 - i * 180) / 8) * 1.5).toFixed(2)),
      transportAllow: "250",
      accommodation: i < 4 ? "800" : "0",
    })),
  });

  await prisma.employee.createMany({
    data: [
      { name: "Bikash Thapa", categoryId: labourCats[0].id, dailyRate: "6500", email: "estimator@voltnex.com" },
      { name: "Hari Magar", categoryId: labourCats[6].id, dailyRate: "2800" },
      { name: "Suman BK", categoryId: labourCats[8].id, dailyRate: "1800" },
    ],
  });

  const projects = await prisma.$transaction([
    prisma.project.create({
      data: {
        code: "PRJ-2026-001",
        name: "Himalayan Residences Electrical Package",
        clientId: clients[0].id,
        location: "Budhanilkantha",
        projectType: "RESIDENTIAL",
        startDate: new Date("2026-02-01"),
        expectedCompletion: new Date("2026-10-15"),
        contractValue: "4850000",
        estimatedCost: "3920000",
        actualCost: "2180000",
        estimatedProfit: "930000",
        actualProfit: "2670000",
        managerId: pm.id,
        status: "IN_PROGRESS",
        workflow: "INSTALLATION",
      },
    }),
    prisma.project.create({
      data: {
        code: "PRJ-2026-002",
        name: "Everest Grand Hotel ELV & Power",
        clientId: clients[1].id,
        location: "Pokhara",
        projectType: "HOTEL",
        startDate: new Date("2026-03-10"),
        expectedCompletion: new Date("2027-01-20"),
        contractValue: "12600000",
        estimatedCost: "10150000",
        actualCost: "2400000",
        estimatedProfit: "2450000",
        actualProfit: "10200000",
        managerId: pm.id,
        status: "AWARDED",
        workflow: "PROCUREMENT",
      },
    }),
    prisma.project.create({
      data: {
        code: "PRJ-2026-003",
        name: "Sagarmatha Foods Factory Power",
        clientId: clients[2].id,
        location: "Bhairahawa",
        projectType: "INDUSTRIAL",
        startDate: new Date("2026-01-12"),
        expectedCompletion: new Date("2026-08-30"),
        contractValue: "18750000",
        estimatedCost: "15100000",
        actualCost: "14980000",
        estimatedProfit: "3650000",
        actualProfit: "3770000",
        managerId: admin.id,
        status: "COMPLETED",
        workflow: "WARRANTY",
        actualCompletion: new Date("2026-08-22"),
      },
    }),
    prisma.project.create({
      data: {
        code: "PRJ-2026-004",
        name: "Bagmati Hospital Critical Power",
        clientId: clients[3].id,
        location: "Lalitpur",
        projectType: "HOSPITAL",
        expectedCompletion: new Date("2026-12-01"),
        contractValue: "9800000",
        estimatedCost: "8100000",
        estimatedProfit: "1700000",
        managerId: pm.id,
        status: "QUOTATION",
        workflow: "QUOTATION",
      },
    }),
  ]);

  for (const project of projects) {
    await prisma.projectCosting.create({
      data: {
        projectId: project.id,
        estMaterial: String(Number(project.estimatedCost) * 0.55),
        estLabour: String(Number(project.estimatedCost) * 0.22),
        estEquipment: String(Number(project.estimatedCost) * 0.08),
        estTransport: String(Number(project.estimatedCost) * 0.04),
        estSubcontractor: String(Number(project.estimatedCost) * 0.05),
        estOther: String(Number(project.estimatedCost) * 0.02),
        estOverhead: String(Number(project.estimatedCost) * 0.03),
        estContingency: String(Number(project.estimatedCost) * 0.01),
        actMaterial: String(Number(project.actualCost) * 0.58),
        actLabour: String(Number(project.actualCost) * 0.24),
        actEquipment: String(Number(project.actualCost) * 0.06),
        actTransport: String(Number(project.actualCost) * 0.04),
        actSubcontractor: String(Number(project.actualCost) * 0.05),
        actOther: String(Number(project.actualCost) * 0.03),
      },
    });
  }

  const boq = await prisma.boq.create({
    data: {
      number: "BOQ-2026-001",
      projectId: projects[0].id,
      title: "Residential electrical BOQ",
      items: {
        create: [
          { itemNo: "1.1", description: "Point wiring for lighting", specification: "2.5 mm² Cu in PVC conduit", category: "Lighting", unit: "point", quantity: "180", materialRate: "850", labourRate: "450", equipmentRate: "40" },
          { itemNo: "1.2", description: "18W LED panel supply & install", category: "Lighting", unit: "Nos", quantity: "160", materialRate: "1150", labourRate: "180", equipmentRate: "20" },
          { itemNo: "2.1", description: "Power socket point", specification: "2.5 mm² + 1.5 mm² CPC", category: "Power", unit: "point", quantity: "96", materialRate: "980", labourRate: "420", equipmentRate: "30" },
          { itemNo: "3.1", description: "12-way SPN DB with MCB", category: "Distribution Board", unit: "set", quantity: "8", materialRate: "18500", labourRate: "3500", equipmentRate: "400" },
          { itemNo: "4.1", description: "Earthing pit with 16mm rod", category: "Earthing", unit: "Nos", quantity: "4", materialRate: "12500", labourRate: "4500", equipmentRate: "800" },
        ],
      },
    },
  });

  const boq2 = await prisma.boq.create({
    data: {
      number: "BOQ-2026-002",
      projectId: projects[3].id,
      title: "Hospital critical power BOQ",
      items: {
        create: [
          { itemNo: "1.1", description: "UPS 80 kVA supply & install", category: "UPS", unit: "set", quantity: "2", materialRate: "1850000", labourRate: "85000", equipmentRate: "25000" },
          { itemNo: "1.2", description: "ATS 400A", category: "ATS", unit: "set", quantity: "1", materialRate: "420000", labourRate: "45000", equipmentRate: "12000" },
          { itemNo: "2.1", description: "Hospital lighting package", category: "Lighting", unit: "lot", quantity: "1", materialRate: "980000", labourRate: "220000", equipmentRate: "15000" },
        ],
      },
    },
  });

  const quote = await prisma.quotation.create({
    data: {
      number: "QT-2026-001",
      clientId: clients[0].id,
      projectId: projects[0].id,
      boqId: boq.id,
      status: "ACCEPTED",
      validUntil: new Date("2026-04-01"),
      scopeOfWork: "Complete electrical installation for residential towers including lighting, power, DBs and earthing.",
      paymentTerms: "30/60/10",
      warranty: "12 months",
      items: {
        create: [
          { description: "Lighting installation package", quantity: "1", unit: "lot", rate: "612000" },
          { description: "Power and DB package", quantity: "1", unit: "lot", rate: "2480000" },
          { description: "Earthing system", quantity: "1", unit: "lot", rate: "92000" },
        ],
      },
    },
  });

  await prisma.quotation.create({
    data: {
      number: "QT-2026-002",
      clientId: clients[3].id,
      projectId: projects[3].id,
      boqId: boq2.id,
      status: "SENT",
      validUntil: new Date("2026-10-05"),
      scopeOfWork: "Critical power, UPS, ATS and hospital lighting.",
      items: {
        create: [
          { description: "UPS and ATS package", quantity: "1", unit: "lot", rate: "4280000" },
          { description: "Lighting package", quantity: "1", unit: "lot", rate: "1215000" },
        ],
      },
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      number: "INV-2026-001",
      clientId: clients[0].id,
      projectId: projects[0].id,
      status: "PARTIALLY_PAID",
      dueDate: new Date("2026-09-30"),
      paidAmount: "800000",
      items: {
        create: [
          { description: "Progress claim 01 - lighting & containment", quantity: "1", unit: "lot", rate: "1450000" },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-2026-002",
      clientId: clients[2].id,
      projectId: projects[2].id,
      status: "OVERDUE",
      dueDate: new Date("2026-08-01"),
      paidAmount: "0",
      items: {
        create: [{ description: "Retention invoice", quantity: "1", unit: "lot", rate: "1875000" }],
      },
    },
  });

  await prisma.payment.create({
    data: {
      amount: "800000",
      projectId: projects[0].id,
      invoiceId: invoice.id,
      clientId: clients[0].id,
      kind: "CLIENT",
      method: "Bank",
      reference: "NABIL-77821",
    },
  });

  await prisma.expense.createMany({
    data: [
      { number: "EXP-2026-001", projectId: projects[0].id, category: "MATERIAL", description: "Cable purchase NET", amount: "245000", vendor: "Nepal Electrical Traders", paymentMethod: "Bank" },
      { number: "EXP-2026-002", projectId: projects[0].id, category: "TRANSPORT", description: "Site delivery Pokhara samples", amount: "18500", vendor: "Local truck", paymentMethod: "Cash" },
      { number: "EXP-2026-003", projectId: projects[2].id, category: "LABOUR", description: "Overtime testing week", amount: "64000", vendor: "Internal", paymentMethod: "Bank" },
    ],
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      number: "PO-2026-001",
      supplierId: suppliers[0].id,
      projectId: projects[0].id,
      status: "ISSUED",
      paymentTerms: "Net 30",
      items: {
        create: [
          { materialId: materials[1].id, description: "2.5 mm² Cu cable", quantity: "500", rate: "68" },
          { materialId: materials[6].id, description: "MCB 6A", quantity: "40", rate: "420" },
        ],
      },
    },
  });

  await prisma.inventoryMove.createMany({
    data: [
      { materialId: materials[1].id, type: "OPENING", quantity: "640", note: "Opening stock" },
      { materialId: materials[5].id, type: "ISSUE", quantity: "30", projectId: projects[2].id, note: "Factory feeder" },
    ],
  });

  await prisma.methodStatementTemplate.create({
    data: {
      name: "Cable tray installation",
      purpose: "To install GI cable tray safely and to the approved layout.",
      scope: "Supply, fabrication support, installation and inspection of cable tray.",
      responsibilities: "Site engineer supervises. Foreman executes. Safety officer inspects.",
      tools: "Drill, level, torque wrench, PPE",
      materials: "GI tray, brackets, couplers, earth bonds",
      safety: "Work at height controls, isolation of live services.",
      ppe: "Helmet, gloves, safety shoes, harness",
      procedure: "Set out, fix brackets, install tray, bond, inspect.",
      qualityControl: "Alignment, support spacing, earth continuity.",
      inspection: "IRN before cable pulling.",
      testing: "Continuity of tray bonding.",
      acceptance: "Approved layout and earth continuity < 1 ohm additional.",
      riskAssessment: "Falls, cuts, live services.",
      references: "IEC 61537, project specification. Applicability must be confirmed per project.",
    },
  });

  await prisma.methodStatement.create({
    data: {
      number: "MS-2026-001",
      title: "Cable installation",
      projectId: projects[0].id,
      purpose: "Install LV cables per approved cable schedule.",
      scope: "Pulling, dressing, glanding and termination.",
      safety: "Permit to work, isolation.",
      ppe: "Helmet, gloves, shoes",
      procedure: "Check route, pull, dress, terminate, label, test.",
      testing: "Continuity and insulation resistance.",
      status: "APPROVED",
    },
  });

  const drawing = await prisma.drawing.create({
    data: {
      number: "DWG-PRJ001-001",
      title: "Main single line diagram",
      projectId: projects[0].id,
      discipline: "SLD",
      status: "FOR_REVIEW",
      preparedBy: "Bikash Thapa",
      checkedBy: "Nisha Karki",
    },
  });
  await prisma.drawingRevision.create({
    data: { drawingId: drawing.id, revision: "A", filePath: "/api/files/drawings/placeholder.pdf", notes: "Issued for review" },
  });

  const test = await prisma.testingChecklist.create({
    data: {
      number: "TCR-2026-001",
      projectId: projects[0].id,
      category: "Earthing",
      equipment: "Block A earth pit 01",
      instrument: "Kyoritsu 4105A",
      overallResult: "Pending",
      items: {
        create: [
          { name: "Earth resistance", result: "2.4 ohm", passFail: "Pass" },
          { name: "Earth continuity", passFail: "Pending" },
          { name: "Bonding", passFail: "Pending" },
          { name: "Visual inspection", passFail: "Pass" },
        ],
      },
    },
  });

  await prisma.siteSurvey.create({
    data: {
      projectId: projects[3].id,
      clientId: clients[3].id,
      location: "Gwarko",
      incomingSupply: "NEA 11 kV / 400 V",
      voltage: "400/230 V",
      phase: "3-phase",
      mainBreaker: "800 A ACB",
      generator: "2 x 250 kVA",
      earthing: "Existing grid, values unknown",
      loadNote: "Estimated 420 kW diversified",
      otherObs: "Plant room space constrained on west wall.",
    },
  });

  await prisma.document.createMany({
    data: [
      { projectId: projects[0].id, folder: "01 Contract", title: "LOA Himalayan Residences", filePath: "/api/files/documents/loa.pdf" },
      { projectId: projects[0].id, folder: "02 BOQ", title: "BOQ Rev A", filePath: "/api/files/documents/boq.pdf" },
    ],
  });

  await prisma.standardDocument.createMany({
    data: [
      { name: "Nepal Electricity Rules (reference copy)", category: "Nepal Electrical standards", number: "NEA-REF", description: "Stored for reference. Confirm current applicability before use.", notes: "Do not treat this library entry as a legal determination." },
      { name: "IEC 60364 overview notes", category: "IEC", number: "IEC 60364", edition: "Notes", description: "Internal briefing notes only." },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: "Invoice overdue", body: "INV-2026-002 is overdue.", type: "invoice", href: "/invoices" },
      { userId: admin.id, title: "Low stock", body: "16 mm² Cu cable is below minimum stock.", type: "stock", href: "/inventory" },
      { userId: pm.id, title: "Quotation expiring", body: "QT-2026-002 validity is approaching.", type: "quotation", href: "/quotations" },
      { userId: pm.id, title: "Testing pending", body: `${test.number} still has pending items.`, type: "testing", href: "/testing-commissioning" },
    ],
  });

  void quote;
  void po;
  void drawing;

  console.log("Seed complete. Login admin@voltnex.com / VoltNex@2026");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
