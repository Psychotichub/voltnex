import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()) as any);

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

    // Import data into BOQ
    const prisma = (await import("@/lib/db")).prisma;
    const { nextNumber } = await import("@/lib/numbering");

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

    return NextResponse.json({ 
      success: true, 
      boqId: boq.id, 
      boqNumber: boq.number,
      itemsImported: sortOrder 
    });
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}