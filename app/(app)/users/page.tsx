import { Role } from "@prisma/client";
import { UserPlus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createUser } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { roleLabel } from "@/lib/rbac";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader
        title="Users & RBAC"
        description="Create staff accounts and assign access roles for estimating, site, finance, management, and viewing workflows."
      />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg">
          <div className="mb-5 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brass" />
            <CardTitle>Add User</CardTitle>
          </div>
          <form action={createUser} className="grid gap-4">
            <Field label="Name"><Input name="name" required /></Field>
            <Field label="Email"><Input name="email" type="email" required /></Field>
            <Field label="Phone"><Input name="phone" /></Field>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate">Role</span>
              <select name="role" className="h-9 rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm">
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>{roleLabel(role)}</option>
                ))}
              </select>
            </label>
            <Field label="Temporary password"><Input name="password" type="password" minLength={8} required /></Field>
            <Button type="submit">Create user</Button>
          </form>
        </Card>

        <DataTable columns={["Name", "Email", "Role", "Phone", "Status"]}>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-3 py-3 font-medium text-navy">{user.name}</td>
              <td className="px-3 py-3 text-slate">{user.email}</td>
              <td className="px-3 py-3 text-slate">{roleLabel(user.role)}</td>
              <td className="px-3 py-3 text-slate">{user.phone ?? "-"}</td>
              <td className="px-3 py-3 text-slate">{user.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}
