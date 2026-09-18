import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/lib/auth";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell role={session.user.role} name={session.user.name ?? "VoltNex User"}>
      {children}
    </AppShell>
  );
}
