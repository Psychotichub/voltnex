import ExcelJS from "exceljs";

export async function workbookToBuffer(
  sheetName: string,
  columns: string[],
  rows: Array<Array<string | number>>,
) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet(sheetName);
  sheet.addRow(columns);
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) sheet.addRow(row);
  sheet.columns.forEach((col) => {
    col.width = 22;
  });
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function exportToExcel(
  data: Array<Record<string, string | number>>,
  sheetName: string,
) {
  if (data.length === 0) {
    return workbookToBuffer(sheetName, [], []);
  }

  const columns = Object.keys(data[0]);
  const rows = data.map((row) => columns.map((col) => row[col] ?? ""));
  
  return workbookToBuffer(sheetName, columns, rows);
}

export const BOQ_TEMPLATE_COLUMNS = [
  "Item No",
  "Description",
  "Specification",
  "Category",
  "Unit",
  "Quantity",
  "Material Rate",
  "Labour Rate",
  "Equipment Rate",
  "Remarks",
];

export const MATERIAL_TEMPLATE_COLUMNS = [
  "Material Code",
  "Material Name",
  "Category",
  "Brand",
  "Model",
  "Specification",
  "Unit",
  "Purchase Price",
  "Selling Price",
  "Supplier",
];
