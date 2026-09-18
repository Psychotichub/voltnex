import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateQuotationPdf(
  quotation: {
    number: string;
    date: Date;
    validUntil: Date | null;
    client: { name: string; company: string | null; address: string | null; panVat: string | null };
    project: { code: string; name: string };
    items: Array<{ description: string; quantity: { toString: () => string }; rate: { toString: () => string } }>;
    scopeOfWork: string | null;
    paymentTerms: string | null;
    deliveryTerms: string | null;
    warranty: string | null;
    discount: { toString: () => string };
    vatPct: { toString: () => string };
  },
  company: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  }
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Company Header
  page.drawText(company.name, {
    x: 50,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 25;

  page.drawText(company.address || "", {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  page.drawText(`Phone: ${company.phone || ""} | Email: ${company.email || ""}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 30;

  // Quotation Title
  page.drawText("QUOTATION", {
    x: 50,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0.6, 0.3, 0),
  });
  y -= 20;

  page.drawText(`Quotation #: ${quotation.number}`, {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText(`Date: ${new Date(quotation.date).toLocaleDateString()}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  if (quotation.validUntil) {
    page.drawText(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 30;
  }

  // Client Information
  page.drawText("Bill To:", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText(quotation.client.name, {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  if (quotation.client.company) {
    page.drawText(quotation.client.company, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;
  }

  if (quotation.client.address) {
    page.drawText(quotation.client.address, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;
  }

  if (quotation.client.panVat) {
    page.drawText(`PAN/VAT: ${quotation.client.panVat}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 30;
  }

  // Project Information
  page.drawText("Project:", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText(`${quotation.project.code} - ${quotation.project.name}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 30;

  // Scope of Work
  if (quotation.scopeOfWork) {
    page.drawText("Scope of Work:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    const scopeText = quotation.scopeOfWork;
    const maxCharsPerLine = 80;
    for (let i = 0; i < scopeText.length; i += maxCharsPerLine) {
      page.drawText(scopeText.substring(i, i + maxCharsPerLine), {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;
    }
    y -= 10;
  }

  // Items Table Header
  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText("Description", { x: 50, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText("Qty", { x: 350, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText("Rate", { x: 400, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText("Amount", { x: 480, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  y -= 15;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  // Items
  let subtotal = 0;
  for (const item of quotation.items) {
    const amount = Number(item.quantity) * Number(item.rate);
    subtotal += amount;

    const description = item.description;
    const maxCharsPerLine = 45;
    for (let i = 0; i < description.length; i += maxCharsPerLine) {
      page.drawText(description.substring(i, i + maxCharsPerLine), {
        x: 50,
        y,
        size: 9,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 12;
    }

    page.drawText(item.quantity.toString(), { x: 350, y, size: 9, font, color: rgb(0, 0, 0) });
    page.drawText(`Rs. ${Number(item.rate).toFixed(2)}`, { x: 400, y, size: 9, font, color: rgb(0, 0, 0) });
    page.drawText(`Rs. ${amount.toFixed(2)}`, { x: 480, y, size: 9, font, color: rgb(0, 0, 0) });
    y -= 15;
  }

  // Totals
  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText("Subtotal:", { x: 400, y, size: 10, font, color: rgb(0, 0, 0) });
  page.drawText(`Rs. ${subtotal.toFixed(2)}`, { x: 480, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  y -= 15;

  if (Number(quotation.discount) > 0) {
    page.drawText("Discount:", { x: 400, y, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText(`-Rs. ${Number(quotation.discount).toFixed(2)}`, { x: 480, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 15;
  }

  const taxableAmount = subtotal - Number(quotation.discount);
  const vat = taxableAmount * (Number(quotation.vatPct) / 100);
  const grandTotal = taxableAmount + vat;

  page.drawText(`VAT (${quotation.vatPct}%):`, { x: 400, y, size: 10, font, color: rgb(0, 0, 0) });
  page.drawText(`Rs. ${vat.toFixed(2)}`, { x: 480, y, size: 10, font, color: rgb(0, 0, 0) });
  y -= 20;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  page.drawText("Grand Total:", { x: 400, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(`Rs. ${grandTotal.toFixed(2)}`, { x: 480, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  y -= 30;

  // Terms and Conditions
  if (quotation.paymentTerms || quotation.deliveryTerms || quotation.warranty) {
    page.drawText("Terms & Conditions:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    if (quotation.paymentTerms) {
      page.drawText(`Payment: ${quotation.paymentTerms}`, {
        x: 50,
        y,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;
    }

    if (quotation.deliveryTerms) {
      page.drawText(`Delivery: ${quotation.deliveryTerms}`, {
        x: 50,
        y,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;
    }

    if (quotation.warranty) {
      page.drawText(`Warranty: ${quotation.warranty}`, {
        x: 50,
        y,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;
    }
  }

  // Signature
  y -= 40;
  page.drawText("Authorized Signature", {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 20;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 200, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}