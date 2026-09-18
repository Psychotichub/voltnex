import { prisma } from "@/lib/db";

export async function writeAudit(input: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldValue: input.oldValue ? JSON.stringify(input.oldValue) : null,
      newValue: input.newValue ? JSON.stringify(input.newValue) : null,
    },
  });
}

export async function notify(input: {
  userId?: string | null;
  title: string;
  body: string;
  type: string;
  href?: string;
}) {
  await prisma.notification.create({ data: input });
}
