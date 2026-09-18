import { FileText, Search } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export default async function AuditLogPage() {
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { deletedAt: null },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.auditLog.count({ where: { deletedAt: null } }),
  ]);

  return (
    <>
      <PageHeader
        title="Audit Log"
        description={`${total} tracked changes across the system.`}
      />

      <Card className="rounded-lg">
        <CardTitle>Activity Log ({total})</CardTitle>
        <DataTable columns={["User", "Action", "Entity", "Entity ID", "Date"]}>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-3 py-3 text-sm text-navy">{log.user?.name ?? "-"}</td>
              <td className="px-3 py-3 text-sm text-slate">{log.action}</td>
              <td className="px-3 py-3 text-sm text-slate">{log.entity}</td>
              <td className="px-3 py-3 text-sm text-slate">{log.entityId}</td>
              <td className="px-3 py-3 text-sm text-slate">{log.createdAt.toISOString().split("T")[0]}</td>
            </tr>
          ))}
        </DataTable>
        {logs.length === 0 && <div className="py-8 text-center text-slate">No audit entries found.</div>}
      </Card>
    </>
  );
}
