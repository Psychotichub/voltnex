import { Bell, Check, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { notifyAction } from "@/lib/actions";

export default async function NotificationsPage() {
  const [notifications, totalUnread] = await Promise.all([
    prisma.notification.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { deletedAt: null, read: false } }),
  ]);

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${totalUnread} unread notifications.`}
      />

      <Card className="rounded-lg">
        <div className="mb-5 flex items-center justify-between">
          <CardTitle>Notifications ({notifications.length})</CardTitle>
          <form action={notifyAction} method="post">
            <Button variant="outline" size="sm" type="submit">Mark all read</Button>
          </form>
        </div>
        <DataTable columns={["Title", "Type", "Date", "Read"]}>
          {notifications.map((n) => (
            <tr key={n.id}>
              <td className="px-3 py-3 text-sm text-navy">{n.title}</td>
              <td className="px-3 py-3 text-sm text-slate">{n.type}</td>
              <td className="px-3 py-3 text-sm text-slate">{n.createdAt.toISOString().split("T")[0]}</td>
              <td className="px-3 py-3">{n.read ? "Yes" : "No"}</td>
            </tr>
          ))}
        </DataTable>
        {notifications.length === 0 && <div className="py-8 text-center text-slate">No notifications found.</div>}
      </Card>
    </>
  );
}
