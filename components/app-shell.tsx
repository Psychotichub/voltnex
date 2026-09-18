"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import type { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { CommandSearch } from "@/components/command-search";
import { APP_NAV } from "@/lib/nav";
import { canAccessModule } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  role,
  name,
}: {
  children: React.ReactNode;
  role: Role;
  name: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = APP_NAV.filter((item) => canAccessModule(role, item.module));

  return (
    <div className="min-h-screen bg-paper">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-navy text-paper transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
          <Zap className="h-5 w-5 text-brass" />
          <div>
            <p className="font-display text-sm font-semibold leading-none">VoltNex</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-brass">Engineering ERP</p>
          </div>
        </div>
        <nav className="h-[calc(100vh-3.5rem)] overflow-y-auto px-2 py-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px]",
                  active ? "bg-white/10 text-white" : "text-paper/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-brass" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {open ? (
        <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      ) : null}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <CommandSearch />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <p className="font-medium text-navy">{name}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate">{role.replaceAll("_", " ")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
