import { Building2, Landmark, MapPin, Upload, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { saveCompany } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const company = await prisma.company.findFirstOrThrow({ where: { id: "default" } });

  return (
    <>
      <PageHeader
        title="Company Settings"
        description="Company profile, tax, bank, document terms, SEO keywords, and contact details used across quotations, invoices, reports, and the public website."
      />

      <form action={saveCompany} className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brass" />
            <CardTitle>Company Profile</CardTitle>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company name"><Input name="name" defaultValue={company.name} required /></Field>
            <Field label="Registration no."><Input name="registrationNo" defaultValue={company.registrationNo ?? ""} /></Field>
            <Field label="PAN"><Input name="pan" defaultValue={company.pan ?? ""} /></Field>
            <Field label="VAT number"><Input name="vatNumber" defaultValue={company.vatNumber ?? ""} /></Field>
            <Field label="Phone"><Input name="phone" defaultValue={company.phone ?? ""} /></Field>
            <Field label="Email"><Input name="email" type="email" defaultValue={company.email ?? ""} /></Field>
            <Field label="Website"><Input name="website" defaultValue={company.website ?? ""} /></Field>
            <Field label="WhatsApp"><Input name="whatsappNumber" defaultValue={company.whatsappNumber ?? ""} /></Field>
            <Field label="District"><Input name="district" defaultValue={company.district ?? ""} /></Field>
            <Field label="Province"><Input name="province" defaultValue={company.province ?? ""} /></Field>
            <Field label="Address"><Textarea name="address" defaultValue={company.address ?? ""} className="md:col-span-2" /></Field>
            <Field label="Google Maps URL"><Input name="mapEmbedUrl" defaultValue={company.mapEmbedUrl ?? ""} /></Field>
          </div>
        </Card>

        <div className="grid gap-5">
          <Card className="rounded-lg">
            <div className="mb-5 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-brass" />
              <CardTitle>Finance Defaults</CardTitle>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="VAT rate %"><Input name="vatRate" type="number" step="0.01" defaultValue={String(company.vatRate)} /></Field>
              <Field label="Currency code"><Input name="currencyCode" defaultValue={company.currencyCode} readOnly /></Field>
              <Field label="Currency symbol"><Input name="currencySymbol" defaultValue={company.currencySymbol} readOnly /></Field>
              <Field label="Bank name"><Input name="bankName" defaultValue={company.bankName ?? ""} /></Field>
              <Field label="Bank account"><Input name="bankAccountNo" defaultValue={company.bankAccountNo ?? ""} /></Field>
              <Field label="Branch"><Input name="bankBranch" defaultValue={company.bankBranch ?? ""} /></Field>
              <Field label="Authorized person"><Input name="authorizedPerson" defaultValue={company.authorizedPerson ?? ""} /></Field>
            </div>
          </Card>

          <Card className="rounded-lg">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brass" />
              <CardTitle>Documents & Website</CardTitle>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate">Company Logo</label>
                {company.logoPath && (
                  <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-md border border-line bg-paper">
                    <img src={company.logoPath} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input name="logo" type="file" accept="image/*" className="flex-1" />
                  <Upload className="h-4 w-4 text-slate" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate">Authorized Signature</label>
                {company.signaturePath && (
                  <div className="relative mb-2 flex h-16 w-32 items-center justify-center rounded-md border border-line bg-paper">
                    <img src={company.signaturePath} alt="Signature" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input name="signature" type="file" accept="image/*" className="flex-1" />
                  <Upload className="h-4 w-4 text-slate" />
                </div>
              </div>

              <Field label="Quotation terms"><Textarea name="quotationTerms" defaultValue={company.quotationTerms ?? ""} /></Field>
              <Field label="Invoice terms"><Textarea name="invoiceTerms" defaultValue={company.invoiceTerms ?? ""} /></Field>
              <Field label="Payment terms"><Textarea name="paymentTerms" defaultValue={company.paymentTerms ?? ""} /></Field>
              <Field label="SEO keywords"><Textarea name="seoKeywords" defaultValue={company.seoKeywords} /></Field>
              <Button type="submit" className="justify-self-start">Save company settings</Button>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
