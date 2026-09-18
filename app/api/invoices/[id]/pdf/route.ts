import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json({ error: "Company not configured" }, { status: 400 });
    }

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

    // Invoice Title
    page.drawText("INVOICE", {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    page.drawText(`Invoice #: ${invoice.number}`, {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    page.drawText(`Date: ${new Date(invoice.date).toLocaleDateString()}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;

    if (invoice.dueDate) {
      page.drawText(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
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

    page.drawText(invoice.client.name, {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    if (invoice.client.company) {
      page.drawText(invoice.client.company, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 15;
    }

    if (invoice.client.address) {
      page.drawText(invoice.client.address, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 15;
    }

    if (invoice.client.panVat) {
      page.drawText(`PAN/VAT: ${invoice.client.panVat}`, {
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

    page.drawText(`${invoice.project.code} - ${invoice.project.name}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 30;

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
    for (const item of invoice.items) {
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

    if (Number(invoice.discount) > 0) {
      page.drawText("Discount:", { x: 400, y, size: 10, font, color: rgb(0, 0, 0) });
      page.drawText(`-Rs. ${Number(invoice.discount).toFixed(2)}`, { x: 480, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= 15;
    }

    const taxableAmount = subtotal - Number(invoice.discount);
    const vat = taxableAmount * (Number(invoice.vatPct) / 100);
    const grandTotal = taxableAmount + vat;

    page.drawText(`VAT (${invoice.vatPct}%):`, { x: 400, y, size: 10, font, color: rgb(0, 0, 0) });
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

    // Payment Information
    const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = grandTotal - paid;

    page.drawText(`Paid: Rs. ${paid.toFixed(2)}`, { x: 400, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 15;
    page.drawText(`Balance: Rs. ${balance.toFixed(2)}`, { x: 400, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
    y -= 30;

    // Bank Details
    if (company.bankName) {
      page.drawText("Bank Details:", {
        x: 50,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 15;

      page.drawText(`Bank: ${company.bankName}`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;

      page.drawText(`Account: ${company.bankAccountNo || ""}`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;

      if (company.bankBranch) {
        page.drawText(`Branch: ${company.bankBranch}`, {
          x: 50,
          y,
          size: 10,
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
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}