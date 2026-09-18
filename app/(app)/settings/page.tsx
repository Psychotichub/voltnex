import { Settings, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { saveCompany } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function SettingsCompanyPage() {
  const company = await prisma.company.findFirst();

  return (
    <>
      <PageHeader
        title="Company Profile"
        description="Manage company information that appears in all generated documents."
      />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brass" />
            <CardTitle>Company Details</CardTitle>
          </div>
          <form action={saveCompany} className="grid gap-4">
            <Field label="Company name *">
              <Input name="name" required defaultValue={company?.name ?? ""} placeholder="Company name" />
            </Field>
            <Field label="Registration number">
              <Input name="registrationNo" defaultValue={company?.registrationNo ?? ""} placeholder="Registration number" />
            </Field>
            <Field label="PAN">
              <Input name="pan" defaultValue={company?.pan ?? ""} placeholder="PAN" />
            </Field>
            <Field label="VAT number">
              <Input name="vatNumber" defaultValue={company?.vatNumber ?? ""} placeholder="VAT number" />
            </Field>
            <Field label="Address">
              <Input name="address" defaultValue={company?.address ?? ""} placeholder="Address" />
            </Field>
            <Field label="District">
              <Input name="district" defaultValue={company?.district ?? ""} placeholder="District" />
            </Field>
            <Field label="Province">
              <Input name="province" defaultValue={company?.province ?? ""} placeholder="Province" />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={company?.phone ?? ""} placeholder="Phone" />
            </Field>
            <Field label="Email">
              <Input name="email" defaultValue={company?.email ?? ""} placeholder="Email" />
            </Field>
            <Field label="Website">
              <Input name="website" defaultValue={company?.website ?? ""} placeholder="Website" />
            </Field>
            <Field label="Bank name">
              <Input name="bankName" defaultValue={company?.bankName ?? ""} placeholder="Bank name" />
            </Field>
            <Field label="Bank account number">
              <Input name="bankAccountNo" defaultValue={company?.bankAccountNo ?? ""} placeholder="Account number" />
            </Field>
            <Field label="Authorized person">
              <Input name="authorizedPerson" defaultValue={company?.authorizedPerson ?? ""} placeholder="Authorized person" />
            </Field>
            <Button type="submit">Save company</Button>
          </form>
        </Card>

        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <Settings className="h-5 w-5 text-brass" />
            <CardTitle>Company Preview</CardTitle>
          </div>
          {company && (
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-paper p-5">
                <h2 className="font-display text-xl font-semibold text-navy">{company.name}</h2>
                <p className="mt-1 text-sm text-slate">{company.address}</p>
                <p className="mt-1 text-sm text-slate">{company.phone}</p>
                <p className="mt-1 text-sm text-slate">{company.email}</p>
                <p className="mt-1 text-sm text-slate">{company.website}</p>
                <p className="mt-2 text-xs text-slate">Registration: {company.registrationNo}</p>
                <p className="mt-1 text-xs text-slate">PAN: {company.pan}</p>
                <p className="mt-1 text-xs text-slate">VAT: {company.vatNumber}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
