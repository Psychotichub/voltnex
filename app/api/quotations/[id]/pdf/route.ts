import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuotationPdf } from "@/lib/pdf";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json({ error: "Company not configured" }, { status: 400 });
    }

    const pdfBuffer = await generateQuotationPdf(quotation, company);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quotation-${quotation.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}